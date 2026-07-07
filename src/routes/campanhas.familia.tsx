import { createFileRoute } from "@tanstack/react-router";
import { Users } from "lucide-react";
import { SimpleCampaignPage } from "@/components/campaigns/SimpleCampaignPage";

export const Route = createFileRoute("/campanhas/familia")({
  head: () => ({
    meta: [
      { title: "Família — Campanhas — Palavra+" },
      { name: "description", content: "Culto em família, leitura em conjunto e adoração semanal." },
    ],
  }),
  component: () => (
    <SimpleCampaignPage
      campaignId="familia"
      icon={Users}
      title="Família"
      description="Fortaleça os laços em casa: culto, leitura e adoração juntos."
      objective="Reunir a família em oração e Palavra ao menos uma vez por dia."
      goalDays={30}
      ctaLabel="Tivemos culto em família hoje"
      verseSeed={9}
      sections={[
        { title: "Ideias para o culto", body: "• Escolha um salmo curto para ler\n• Cante um hino conhecido\n• Cada membro compartilha um motivo de oração\n• Encerre orando pelas necessidades da casa" },
        { title: "Adoração semanal", body: "Reserve um dia da semana para um culto mais longo, com pregação simples, testemunhos e comunhão." },
      ]}
    />
  ),
});