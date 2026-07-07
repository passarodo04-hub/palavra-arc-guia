import { createFileRoute } from "@tanstack/react-router";
import { Baby } from "lucide-react";
import { SimpleCampaignPage } from "@/components/campaigns/SimpleCampaignPage";

export const Route = createFileRoute("/campanhas/criancas")({
  head: () => ({
    meta: [
      { title: "Crianças — Campanhas — Palavra+" },
      { name: "description", content: "Histórias bíblicas e versículos simples para memorizar com as crianças." },
    ],
  }),
  component: () => (
    <SimpleCampaignPage
      campaignId="criancas"
      icon={Baby}
      title="Crianças"
      description="Ensina a criança no caminho em que deve andar (Pv 22:6). Uma prática divertida por dia."
      objective="Compartilhar uma história ou versículo com a criança todos os dias."
      goalDays={30}
      ctaLabel="Compartilhei com a criança hoje"
      verseSeed={11}
      sections={[
        { title: "Ideias fáceis", body: "• Conte uma história bíblica curta\n• Ensine um versículo (uma frase)\n• Faça um desenho da história\n• Ore com a criança antes de dormir" },
        { title: "Versículos para memorizar", body: "João 3:16 · Salmo 23:1 · Efésios 6:1 · Filipenses 4:13 · 1 João 4:19" },
      ]}
    />
  ),
});