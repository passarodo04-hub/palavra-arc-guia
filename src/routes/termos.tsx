import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/termos")({
  head: () => ({
    meta: [
      { title: "Termos de Uso — Bíblia Sagrada" },
      { name: "description", content: "Termos de uso do aplicativo cristão Bíblia Sagrada, Harpa Cristã, Devocional e Estudos." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-4">
          <Link to="/" className="inline-flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" />
          </Link>
          <h1 className="font-serif text-xl text-foreground">Termos de Uso</h1>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-8 space-y-6 text-sm leading-relaxed text-foreground">
        <p className="text-muted-foreground">Última atualização: junho de 2026.</p>

        <section className="space-y-2">
          <h2 className="font-serif text-lg">1. Aceitação</h2>
          <p>Ao usar este aplicativo você concorda com estes termos e com a nossa <Link to="/privacidade" className="text-primary underline">Política de Privacidade</Link>.</p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-lg">2. Uso permitido</h2>
          <p>O app é destinado ao estudo, leitura, oração e edificação cristã pessoal. Você se compromete a não usar a plataforma para difamar pessoas, divulgar discurso de ódio, conteúdo sexual, violento ou anti-cristão.</p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-lg">3. Conteúdo bíblico</h2>
          <p>Os textos da Bíblia (Almeida Revista e Corrigida e Nova Versão Internacional) são disponibilizados em domínio público / uso editorial não-comercial. A Harpa Cristã também é apresentada em formato de consulta.</p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-lg">4. Assistente de IA</h2>
          <p>Os esboços de sermão e estudos gerados por IA são <strong>apoio</strong> ao seu estudo — não substituem a leitura direta da Bíblia, oração e discernimento espiritual. Sempre confira citações e contexto antes de pregar.</p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-lg">5. Conta</h2>
          <p>Você é responsável por manter a confidencialidade do seu acesso. Podemos suspender contas que violem estes termos.</p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-lg">6. Limitação de responsabilidade</h2>
          <p>O serviço é fornecido "como está". Não nos responsabilizamos por decisões pessoais ou ministeriais tomadas com base no conteúdo gerado.</p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-lg">7. Alterações</h2>
          <p>Podemos atualizar estes termos. Mudanças significativas serão comunicadas no app.</p>
        </section>
      </main>
    </div>
  );
}