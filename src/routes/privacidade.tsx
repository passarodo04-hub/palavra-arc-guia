import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/privacidade")({
  head: () => ({
    meta: [
      { title: "Política de Privacidade — Bíblia Sagrada" },
      { name: "description", content: "Como tratamos os seus dados no aplicativo Bíblia Sagrada, Harpa Cristã, Devocional e Estudos." },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-4">
          <Link to="/" className="inline-flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" />
          </Link>
          <h1 className="font-serif text-xl text-foreground">Política de Privacidade</h1>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-8 space-y-6 text-sm leading-relaxed text-foreground">
        <p className="text-muted-foreground">Última atualização: junho de 2026.</p>

        <section className="space-y-2">
          <h2 className="font-serif text-lg">1. Quem somos</h2>
          <p>Este aplicativo é uma plataforma cristã que oferece Bíblia (ARC e NVI), Harpa Cristã, devocionais, anotações, favoritos, enciclopédia de denominações e um assistente de estudos com inteligência artificial.</p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-lg">2. Dados que coletamos</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Conta</strong>: e-mail, nome de exibição e provedor de login (e-mail/senha ou Google).</li>
            <li><strong>Preferências</strong>: tema (claro/escuro), tradução bíblica selecionada.</li>
            <li><strong>Conteúdo do usuário</strong>: anotações, favoritos, histórico de leitura e sermões gerados.</li>
            <li><strong>Dados técnicos</strong>: dados anônimos de navegação para garantir estabilidade.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-lg">3. Como usamos seus dados</h2>
          <p>Usamos seus dados apenas para oferecer as funcionalidades do app, sincronizar entre dispositivos e melhorar a experiência. Não vendemos seus dados a terceiros.</p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-lg">4. Inteligência artificial</h2>
          <p>O Assistente de Estudos envia o texto que você fornece a um provedor de IA para gerar o esboço de sermão. Não envie informações sensíveis ou de terceiros sem autorização.</p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-lg">5. Publicidade</h2>
          <p>Podemos exibir anúncios do Google AdSense em áreas não-devocionais (listagens). Esses anúncios podem usar cookies para personalização — você pode gerenciar isso em <a className="text-primary underline" href="https://adssettings.google.com" target="_blank" rel="noreferrer">adssettings.google.com</a>.</p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-lg">6. Seus direitos</h2>
          <p>Você pode atualizar seus dados em <Link to="/conta" className="text-primary underline">Minha conta</Link> ou excluir sua conta permanentemente a qualquer momento. A exclusão remove todos os dados associados (anotações, favoritos, sermões).</p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-lg">7. Permissões do dispositivo</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Armazenamento local</strong>: usado para guardar suas preferências offline.</li>
            <li><strong>Notificações</strong> (futuro): apenas com seu consentimento para devocional diário.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-lg">8. Contato</h2>
          <p>Dúvidas? Acesse <Link to="/conta" className="text-primary underline">Minha conta</Link> e entre em contato pelo e-mail cadastrado.</p>
        </section>
      </main>
    </div>
  );
}