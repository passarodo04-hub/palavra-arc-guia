import { createServerFn } from "@tanstack/react-start";
import { AI_NOT_CONFIGURED, aiGatewayFailureReason } from "./ai-gateway-errors";
import { z } from "zod";

const InputSchema = z.object({
  url: z.string().url().max(500).optional().or(z.literal("")),
  transcript: z.string().max(60000).optional().or(z.literal("")),
  title: z.string().max(200).optional().or(z.literal("")),
});

export type StudyResult = {
  ok: boolean;
  blocked?: boolean;
  reason?: string;
  title?: string;
  summary?: string;
  themes?: string[];
  teachings?: string[];
  verses?: { ref: string; note?: string }[];
  timeline?: { time: string; topic: string }[];
  highlights?: string[];
};

function extractYouTubeId(url: string): string | null {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/))([A-Za-z0-9_-]{6,})/);
  return m ? m[1] : null;
}

async function tryFetchYouTubeTranscript(videoId: string): Promise<string | null> {
  try {
    const res = await fetch(`https://www.youtube.com/watch?v=${videoId}&hl=pt`, {
      headers: { "User-Agent": "Mozilla/5.0", "Accept-Language": "pt-BR,pt;q=0.9" },
    });
    if (!res.ok) return null;
    const html = await res.text();
    const m = html.match(/"captionTracks":(\[.*?\])/);
    if (!m) return null;
    const tracks = JSON.parse(m[1]) as Array<{ baseUrl: string; languageCode: string }>;
    const pt = tracks.find((t) => t.languageCode?.startsWith("pt")) ?? tracks[0];
    if (!pt?.baseUrl) return null;
    const cap = await fetch(pt.baseUrl);
    if (!cap.ok) return null;
    const xml = await cap.text();
    const parts = Array.from(xml.matchAll(/<text[^>]*>([\s\S]*?)<\/text>/g)).map((mm) =>
      mm[1]
        .replace(/&amp;/g, "&")
        .replace(/&#39;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/\s+/g, " ")
        .trim(),
    );
    const text = parts.join(" ").trim();
    return text.length > 50 ? text : null;
  } catch {
    return null;
  }
}

const BLOCK_PATTERNS = [
  /\bporn/i, /\bsex(o|ual|y)\b/i, /\bnud(e|ez|a)/i, /\bputa\b/i, /\bcaralho\b/i,
  /\bfoda(-se)?\b/i, /\bfdp\b/i, /\bmerda\b/i, /\bcu\b/i, /\bbuceta\b/i, /\bvadia\b/i,
];

function containsInappropriate(text: string): boolean {
  return BLOCK_PATTERNS.some((re) => re.test(text));
}

export const analyzeSermon = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }): Promise<StudyResult> => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) return { ok: false, reason: AI_NOT_CONFIGURED };

    let transcript = (data.transcript ?? "").trim();
    const url = (data.url ?? "").trim();

    if (!transcript && url) {
      const ytId = extractYouTubeId(url);
      if (ytId) {
        const t = await tryFetchYouTubeTranscript(ytId);
        if (t) transcript = t;
      }
    }

    if (!transcript) {
      return {
        ok: false,
        reason:
          "Não foi possível extrair a transcrição automaticamente deste link (Instagram, Facebook e alguns vídeos do YouTube exigem o texto). Cole o conteúdo do sermão no campo abaixo para gerar o estudo.",
      };
    }

    if (containsInappropriate(transcript)) {
      return {
        ok: false,
        blocked: true,
        reason:
          "Conteúdo bloqueado: o material contém linguagem inadequada ao propósito cristão. O processamento foi recusado.",
      };
    }

    const trimmed = transcript.slice(0, 30000);

    // === Step 1: polish raw transcript (punctuation, pauses, sentence detection) ===
    let polished = trimmed;
    try {
      const polishRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3.6-flash",
          messages: [
            {
              role: "system",
              content:
                "Você refina transcrições automáticas de sermões em português brasileiro. Preserve EXATAMENTE as palavras faladas (palavra por palavra), sem reescrever, resumir, parafrasear ou adicionar conteúdo. Apenas: (1) adicione pontuação correta (vírgulas, pontos, interrogação, exclamação), (2) capitalize início de frase e nomes próprios, (3) separe em parágrafos curtos onde houver pausa natural ou mudança de assunto, (4) corrija erros óbvios de reconhecimento de voz quando o contexto cristão deixar claro (ex: 'jesus' -> 'Jesus', referências bíblicas mal grafadas). NÃO invente frases, NÃO traduza, NÃO remova trechos. Retorne apenas o texto refinado.",
            },
            { role: "user", content: trimmed },
          ],
        }),
      });
      if (polishRes.ok) {
        const pj = await polishRes.json();
        const pc: string = pj?.choices?.[0]?.message?.content?.trim() ?? "";
        if (pc && pc.length > trimmed.length * 0.6) polished = pc;
      }
    } catch (e) {
      console.warn("polish step failed", e);
    }

    if (containsInappropriate(polished)) {
      return {
        ok: false,
        blocked: true,
        reason: "Conteúdo bloqueado: linguagem inadequada detectada após refinamento.",
      };
    }

    const system = `Você é um assistente cristão especializado em organizar estudos a partir de sermões e pregações em português.
REGRAS DE SEGURANÇA (obrigatórias):
- Recuse e responda com {"blocked":true,"reason":"..."} se o conteúdo for promíscuo, vulgar, obsceno, anti-cristão ou contiver palavrões explícitos.
- Mantenha linguagem respeitosa, edificante e fiel à fé cristã.
- Cite versículos no formato "Livro Capítulo:Versículo" (ex: João 3:16).
Retorne SOMENTE JSON válido, sem markdown.`;

    const user = `Analise o sermão abaixo e gere um estudo organizado.

TÍTULO (se houver): ${data.title || "(não informado)"}
LINK (se houver): ${url || "(não informado)"}

TRANSCRIÇÃO REFINADA (palavra por palavra do pregador):
"""
${polished}
"""

Gere um JSON com os campos:
{
  "blocked": boolean,
  "reason": string (apenas se blocked),
  "title": string,
  "summary": string (2-4 parágrafos),
  "themes": string[] (3-6 temas principais),
  "teachings": string[] (4-8 ensinamentos-chave),
  "verses": [{"ref": "Livro 0:0", "note": "contexto"}],
  "timeline": [{"time": "00:00", "topic": "..."}] (estimativa de tópicos),
  "highlights": string[] (3-6 destaques marcantes)
}`;

    try {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3.6-flash",
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
          response_format: { type: "json_object" },
        }),
      });

      if (!res.ok) {
        return { ok: false, reason: await aiGatewayFailureReason(res, "Falha ao gerar o estudo.", "estudos") };
      }

      const json = await res.json();
      const content: string = json?.choices?.[0]?.message?.content ?? "{}";
      let parsed: any;
      try {
        parsed = JSON.parse(content);
      } catch {
        const m = content.match(/\{[\s\S]*\}/);
        parsed = m ? JSON.parse(m[0]) : {};
      }

      if (parsed?.blocked) {
        return { ok: false, blocked: true, reason: parsed.reason || "Conteúdo recusado pela IA." };
      }

      return {
        ok: true,
        title: parsed.title || data.title || "Estudo do sermão",
        summary: parsed.summary || "",
        themes: parsed.themes || [],
        teachings: parsed.teachings || [],
        verses: parsed.verses || [],
        timeline: parsed.timeline || [],
        highlights: parsed.highlights || [],
      };
    } catch (err) {
      console.error(err);
      return { ok: false, reason: "Erro inesperado ao processar o sermão." };
    }
  });