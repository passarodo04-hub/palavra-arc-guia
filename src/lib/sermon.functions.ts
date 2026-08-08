import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const InputSchema = z.object({
  title: z.string().min(1).max(200),
  theme: z.string().min(1).max(200),
  subject: z.string().min(1).max(500),
  objective: z.string().min(1).max(500),
  duration: z.number().int().min(5).max(180),
  audience: z.string().max(200).optional().default(""),
});

export type SermonContent = {
  introduction: { hook: string; context: string };
  development: {
    points: { title: string; explanation: string; application: string; verses: string[] }[];
  };
  verses: { ref: string; text?: string; why: string }[];
  conclusion: { reflection: string; callToAction: string };
  worship: { harpa: { number?: number; title: string }[]; songs: string[] };
  timeline: { from: string; to: string; topic: string }[];
  prayers: { opening: string; closing: string; altarCall: string };
};

export type SermonResult =
  | { ok: true; content: SermonContent }
  | { ok: false; reason: string };

const BLOCK = [/\bporn/i, /\bsex(o|ual)\b/i, /\bnud(e|ez)/i, /\bputa\b/i, /\bcaralho\b/i];

export const generateSermon = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }): Promise<SermonResult> => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) {
      console.error("[ai-gateway:sermao] LOVABLE_API_KEY ausente no ambiente do servidor");
      return { ok: false, reason: AI_NOT_CONFIGURED };
    }

    const combo = `${data.title} ${data.theme} ${data.subject} ${data.objective} ${data.audience}`;
    if (BLOCK.some((re) => re.test(combo))) {
      return { ok: false, reason: "Conteúdo bloqueado: linguagem inadequada detectada." };
    }

    const system = `Você é um assistente cristão evangélico que monta esboços de pregação fiéis à Bíblia (use ARC/NVI em português brasileiro). Linguagem edificante, doutrinariamente sólida, sem polêmicas denominacionais. Sempre cite versículos no formato "Livro Capítulo:Versículo" e inclua o texto resumido quando útil. Retorne SOMENTE JSON válido.`;

    const userPrompt = `Monte um esboço completo de pregação cristã com base nas informações abaixo.

Título: ${data.title}
Tema: ${data.theme}
Assunto principal: ${data.subject}
Objetivo: ${data.objective}
Duração estimada: ${data.duration} minutos
Público-alvo: ${data.audience || "Igreja em geral"}

Distribua o tempo proporcionalmente nos blocos da linha do tempo (introdução, desenvolvimento, aplicação, conclusão). Sugira hinos da Harpa Cristã com o número e título quando apropriado, além de cânticos contemporâneos.

Responda com JSON:
{
  "introduction": { "hook": "abertura forte", "context": "contexto bíblico/espiritual" },
  "development": {
    "points": [
      { "title": "...", "explanation": "...", "application": "aplicação espiritual prática", "verses": ["João 3:16"] }
    ]
  },
  "verses": [{ "ref": "João 3:16", "text": "texto resumido", "why": "por que é relevante" }],
  "conclusion": { "reflection": "reflexão final", "callToAction": "chamado à ação / desafio" },
  "worship": {
    "harpa": [{ "number": 12, "title": "Saudosa Lembrança" }],
    "songs": ["Tua Graça Me Basta", "..."]
  },
  "timeline": [{ "from": "0", "to": "5", "topic": "Introdução" }],
  "prayers": { "opening": "oração inicial", "closing": "oração final", "altarCall": "ideia de chamada ao altar" }
}

Gere de 3 a 5 pontos no desenvolvimento e de 4 a 8 versículos relevantes.`;

    try {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-3.6-flash",
          messages: [
            { role: "system", content: system },
            { role: "user", content: userPrompt },
          ],
          response_format: { type: "json_object" },
        }),
      });
      if (!res.ok) {
        return { ok: false, reason: await aiGatewayFailureReason(res, "Falha ao gerar o sermão.", "sermao") };
      }
      const json = await res.json();
      const content: string = json?.choices?.[0]?.message?.content ?? "{}";
      let parsed: any;
      try { parsed = JSON.parse(content); } catch {
        const m = content.match(/\{[\s\S]*\}/);
        parsed = m ? JSON.parse(m[0]) : {};
      }
      const sermon: SermonContent = {
        introduction: parsed.introduction ?? { hook: "", context: "" },
        development: { points: parsed.development?.points ?? [] },
        verses: parsed.verses ?? [],
        conclusion: parsed.conclusion ?? { reflection: "", callToAction: "" },
        worship: { harpa: parsed.worship?.harpa ?? [], songs: parsed.worship?.songs ?? [] },
        timeline: parsed.timeline ?? [],
        prayers: parsed.prayers ?? { opening: "", closing: "", altarCall: "" },
      };
      return { ok: true, content: sermon };
    } catch (e) {
      console.error(e);
      return { ok: false, reason: "Erro inesperado ao processar." };
    }
  });