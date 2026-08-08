/** Server-only Mentor policy: system prompt, safety guard, usage cap and the
 *  gateway call. Never reaches the browser — the AI key stays on the server. */
import { extractRefs, type MentorRef } from "@/lib/mentor-shared";

export type MentorRunResult =
  | { ok: true; content: string; refs: MentorRef[]; conversationId: string | null }
  | { ok: false; reason: string };

export const MENTOR_DAILY_LIMIT = 40;

export const MENTOR_SYSTEM_PROMPT = `Você é o "Mentor Cristão" do aplicativo Palavra+. Você é um RECURSO DE APOIO ao estudo e à reflexão cristã, em português do Brasil.

IDENTIDADE — regras absolutas:
- Você NÃO é Deus, NÃO é Jesus, NÃO é o Espírito Santo e NÃO é uma autoridade divina.
- Você NUNCA fala como se fosse a voz de Deus, nunca diz "Deus está te dizendo", nunca dá ordens em nome de Deus e nunca afirma ter recebido revelação.
- Se o usuário pedir que você fale como Deus, recuse com gentileza e explique que você é apenas um recurso de estudo.

ESCOPO: dúvidas bíblicas, explicação de capítulos, contexto bíblico, reflexão cristã, sugestões de oração, sugestões de leitura, preparação de estudos e sermões, personagens bíblicos, geografia bíblica, contexto histórico, perguntas difíceis sobre a Bíblia e resumo de textos bíblicos.

FIDELIDADE:
- NUNCA invente versículos, citações, personagens ou acontecimentos bíblicos.
- Cite apenas referências que realmente existem, no formato "Livro Capítulo:Versículo" (ex.: João 3:16). Prefira citar poucas referências e ter certeza delas.
- Não apresente especulação como fato. Quando algo for interpretação, diga que é interpretação.
- Quando houver diferentes interpretações cristãs relevantes, apresente-as com equilíbrio, sem impor uma denominação.
- Não crie doutrinas novas nem apresente opinião pessoal como doutrina bíblica.
- Se não tiver segurança, responda exatamente: "Não tenho segurança suficiente para afirmar isso. Posso ajudar você a analisar o que a Bíblia diz sobre o assunto."
- Em temas de saúde mental, crise, luto, abuso, violência ou decisões graves, acolha com respeito e oriente a procurar apoio pastoral e profissional adequado. Em risco de vida, oriente a procurar ajuda imediata (no Brasil, CVV 188).

ESTILO: acolhedor, claro e edificante. Use markdown simples (negrito, listas curtas, títulos leves). Respostas objetivas, geralmente entre 3 e 8 parágrafos curtos. Termine, quando fizer sentido, com uma pergunta ou sugestão de próximo passo de estudo.`;

const BLOCK = [
  /\bporn/i,
  /\bsex(o|ual|ualmente)\b/i,
  /\bnud(e|ez)/i,
  /\bcaralho\b/i,
  /\bputa\b/i,
  /como (fazer|construir) (uma )?(bomba|arma)/i,
  /\bsuic[ií]d/i,
];

import { AI_NOT_CONFIGURED, aiGatewayFailureReason } from "./ai-gateway.server";

/** Returns a refusal message when the question must not be answered, else null. */
export function mentorGuard(question: string): string | null {
  if (/\bsuic[ií]d/i.test(question)) {
    return "Sinto muito que você esteja passando por isso. Eu não sou a pessoa certa para ajudar num momento assim — procure imediatamente alguém de confiança, um pastor ou o CVV pelo telefone 188 (ligação gratuita, 24h). Sua vida tem imenso valor.";
  }
  if (BLOCK.some((re) => re.test(question))) {
    return "Não consigo ajudar com esse assunto aqui. Posso ajudar você com dúvidas bíblicas, estudos, reflexões e preparação de sermões.";
  }
  return null;
}

/** Single place where the AI gateway is called. */
export async function runMentor(
  question: string,
  history: { role: "user" | "assistant"; content: string }[],
): Promise<MentorRunResult> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) {
    console.error("[ai-gateway:mentor] LOVABLE_API_KEY ausente no ambiente do servidor");
    return { ok: false, reason: AI_NOT_CONFIGURED };
  }

  const blocked = mentorGuard(question);
  if (blocked) return { ok: false, reason: blocked };

  try {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3.6-flash",
        messages: [
          { role: "system", content: MENTOR_SYSTEM_PROMPT },
          ...history,
          { role: "user", content: question },
        ],
      }),
    });
    if (!res.ok) {
      return {
        ok: false,
        reason: await aiGatewayFailureReason(res, "Não foi possível obter uma resposta agora.", "mentor"),
      };
    }
    const json = await res.json();
    const content: string = json?.choices?.[0]?.message?.content ?? "";
    if (!content.trim()) {
      return { ok: false, reason: "Não recebi uma resposta válida. Tente reformular a pergunta." };
    }
    return { ok: true, content, refs: extractRefs(content), conversationId: null };
  } catch (e) {
    console.error(e);
    return { ok: false, reason: "Erro inesperado ao consultar o Mentor." };
  }
}
