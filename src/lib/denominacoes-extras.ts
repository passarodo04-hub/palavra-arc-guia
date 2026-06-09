// Visual + timeline + extra info layered on top of the base denominations list.
// Kept separate to avoid touching the canonical data file.

export type TimelineEvent = { year: string; event: string };

export type Personality = {
  name: string;
  biography: string;
  contribution: string;
  historicalRelevance: string;
  ministry: string;
};

export type DenominacaoExtra = {
  image?: string;
  imageCaption?: string;
  timeline?: TimelineEvent[];
  personalities?: Personality[];
  extras?: {
    title: string;
    subtitle?: string;
    body: string;
    bullets?: string[];
  }[];
};

export const denominacoesExtras: Record<string, DenominacaoExtra> = {
  "assembleia-de-deus": {
    imageCaption: "Sede da CGADB — Brasília/DF",
    timeline: [
      { year: "1911", event: "Fundação em Belém do Pará por Daniel Berg e Gunnar Vingren." },
      { year: "1918", event: "Adoção oficial do nome Assembleia de Deus." },
      { year: "1930", event: "Primeira Convenção Geral das Assembleias de Deus no Brasil." },
      { year: "1946", event: "Fundação da CGADB (Convenção Geral)." },
      { year: "1989", event: "Criação da CONAMAD (Convenção Nacional dos Ministros das ADs Madureira)." },
      { year: "2011", event: "Centenário da Assembleia de Deus no Brasil." },
    ],
    extras: [
      {
        title: "ADBRAS — Assembleia de Deus Bras",
        subtitle: "Convenção das Assembleias de Deus Ministério do Brás",
        body:
          "A ADBRAS tem sua origem na histórica Assembleia de Deus do Bairro do Brás, em São Paulo, fundada nas primeiras décadas do século XX como um dos polos pioneiros do pentecostalismo paulista. Com o crescimento, o Ministério do Brás se consolidou como uma das principais convenções derivadas do tronco original da AD, organizando centenas de igrejas espalhadas pelo Brasil e exterior.",
        bullets: [
          "Fundação do ministério: décadas iniciais do século XX, a partir do trabalho pentecostal no bairro do Brás (SP).",
          "Sede histórica: Templo Central da AD Brás, em São Paulo/SP.",
          "Expansão: dezenas de estados brasileiros e missões em vários países.",
          "Importância histórica: berço de grandes obreiros, escolas bíblicas e do tradicional 'culto do Brás'.",
          "Identidade: doutrina pentecostal clássica, ênfase em santidade, missões e ensino bíblico.",
        ],
      },
    ],
  },
  "congregacao-crista": {
    imageCaption: "Templo Sede — Brás, São Paulo/SP",
    timeline: [
      { year: "1910", event: "Fundação por Louis Francescon no Brás, em São Paulo." },
      { year: "1936", event: "Consolidação do nome 'Congregação Cristã no Brasil'." },
      { year: "1970", event: "Expansão acelerada para todas as regiões do país." },
    ],
  },
  batista: {
    imageCaption: "Sede da Convenção Batista Brasileira — Rio de Janeiro/RJ",
    timeline: [
      { year: "1882", event: "Primeira Igreja Batista organizada em Salvador/BA." },
      { year: "1907", event: "Fundação da Convenção Batista Brasileira (CBB)." },
      { year: "1908", event: "Criação do Seminário Teológico Batista do Sul." },
    ],
  },
  presbiteriana: {
    imageCaption: "Catedral Evangélica de São Paulo — IPB",
    timeline: [
      { year: "1859", event: "Chegada de Ashbel Green Simonton ao Rio de Janeiro." },
      { year: "1862", event: "Organização da primeira Igreja Presbiteriana do Brasil." },
      { year: "1888", event: "Organização do Sínodo da IPB." },
      { year: "1903", event: "Cisma que origina a Igreja Presbiteriana Independente." },
    ],
  },
  quadrangular: {
    imageCaption: "Catedral da Fé — IEQ, São Paulo/SP",
    timeline: [
      { year: "1923", event: "Fundação mundial por Aimee Semple McPherson em Los Angeles." },
      { year: "1951", event: "Chegada ao Brasil em São João da Boa Vista/SP." },
      { year: "1988", event: "Expansão nacional consolidada em todos os estados." },
    ],
  },
  universal: {
    imageCaption: "Templo de Salomão — São Paulo/SP",
    timeline: [
      { year: "1977", event: "Fundação por Edir Macedo no Rio de Janeiro." },
      { year: "1989", event: "Aquisição da Rede Record." },
      { year: "2014", event: "Inauguração do Templo de Salomão." },
    ],
  },
  mundial: {
    imageCaption: "Templo Sede — Brás, São Paulo/SP",
  },
  "deus-e-amor": {
    imageCaption: "Catedral da Glória — São Paulo/SP",
  },
  adventista: {
    imageCaption: "Sede Sul-Americana da IASD — Brasília/DF",
    timeline: [
      { year: "1863", event: "Organização oficial da IASD em Battle Creek, EUA." },
      { year: "1879", event: "Primeiros adventistas chegam a Santa Catarina." },
      { year: "1896", event: "Fundação do primeiro colégio adventista no Brasil." },
    ],
  },
  metodista: {
    imageCaption: "Catedral Metodista — São Paulo/SP",
  },
  nazareno: {
    imageCaption: "Sede Regional — Campinas/SP",
  },
  luterana: {
    imageCaption: "Sede da IECLB — Porto Alegre/RS",
  },
  anglicana: {
    imageCaption: "Catedral Anglicana — Porto Alegre/RS",
  },
  "casa-da-bencao": {
    imageCaption: "Sede da Casa da Bênção — Belo Horizonte/MG",
  },
  "internacional-graca": {
    imageCaption: "Sede da Graça de Deus — Rio de Janeiro/RJ",
  },
  renascer: {
    imageCaption: "Sede Mundial Renascer — São Paulo/SP",
  },
  "bola-de-neve": {
    imageCaption: "Sede Bola de Neve — São Paulo/SP",
  },
  videira: {
    imageCaption: "Sede Mundial Videira — Goiânia/GO",
  },
  "sara-nossa-terra": {
    imageCaption: "Sede Sara Nossa Terra — Brasília/DF",
  },
};

export function getDenominacaoExtra(id: string): DenominacaoExtra | undefined {
  return denominacoesExtras[id];
}