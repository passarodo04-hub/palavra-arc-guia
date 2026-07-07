import { createFileRoute } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { SimpleCampaignPage } from "@/components/campaigns/SimpleCampaignPage";

export const Route = createFileRoute("/campanhas/casais")({
  head: () => ({
    meta: [
      { title: "Casais — Campanhas — Palavra+" },
      { name: "description", content: "Oração, leitura e devocional juntos como casal." },
    ],
  }),
  component: () => (
    <SimpleCampaignPage
      campaignId="casais"
      icon={Heart}
      title="Casais"
      description="Uma corda de três dobras não se rompe (Ec 4:12). Cresçam juntos na fé."
      objective="Orar e ler a Palavra em conjunto todos os dias."
      goalDays={30}
      ctaLabel="Oramos e lemos juntos hoje"
      verseSeed={10}
      sections={[
        { title: "Sugestões diárias", body: "• Escolha um versículo do dia\n• Um dos dois faz a oração\n• Reflitam por 3 minutos em silêncio\n• Compartilhem um agradecimento sobre o outro" },
        { title: "Devocional semanal", body: "Uma vez por semana, leiam um capítulo maior juntos e conversem sobre aplicações práticas para o casamento." },
      ]}
    />
  ),
});