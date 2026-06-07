// Visual + timeline + extra info layered on top of the base denominations list.
// Kept separate to avoid touching the canonical data file.

export type TimelineEvent = { year: string; event: string };

export type DenominacaoExtra = {
  image: string;
  imageCaption?: string;
  timeline?: TimelineEvent[];
  extras?: {
    title: string;
    subtitle?: string;
    body: string;
    bullets?: string[];
  }[];
};

// Stable Unsplash CDN photos (churches, cathedrals, temples) used as
// representative headquarters imagery when a faithful licensed photo of the
// real building is not bundled with the app.
const IMG = {
  templo_salomao:
    "https://images.unsplash.com/photo-1548625361-1adcab316530?auto=format&fit=crop&w=1600&q=70",
  catedral_brasilia:
    "https://images.unsplash.com/photo-1543340713-8c1a4147f6a8?auto=format&fit=crop&w=1600&q=70",
  bras_sp:
    "https://images.unsplash.com/photo-1473177104440-ffee2f376098?auto=format&fit=crop&w=1600&q=70",
  igreja_classica:
    "https://images.unsplash.com/photo-1438032005730-c779502df39b?auto=format&fit=crop&w=1600&q=70",
  catedral_gotica:
    "https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?auto=format&fit=crop&w=1600&q=70",
  catedral_moderna:
    "https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&w=1600&q=70",
  capela:
    "https://images.unsplash.com/photo-1490127252417-7c393f993ee4?auto=format&fit=crop&w=1600&q=70",
  templo_madeira:
    "https://images.unsplash.com/photo-1519491050282-7f8e1c2f1f3a?auto=format&fit=crop&w=1600&q=70",
  igreja_branca:
    "https://images.unsplash.com/photo-1519010470956-9c61b16ec9c4?auto=format&fit=crop&w=1600&q=70",
  cruz_ceu:
    "https://images.unsplash.com/photo-1507692812060-98338d07aca3?auto=format&fit=crop&w=1600&q=70",
  catedral_londres:
    "https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?auto=format&fit=crop&w=1600&q=70",
  catedral_alema:
    "https://images.unsplash.com/photo-1551880094-7c2e5bb37e1f?auto=format&fit=crop&w=1600&q=70",
  templo_brasilia:
    "https://images.unsplash.com/photo-1505761671935-60b3a7427bad?auto=format&fit=crop&w=1600&q=70",
  templo_glassic:
    "https://images.unsplash.com/photo-1520637836862-4d197d17c55a?auto=format&fit=crop&w=1600&q=70",
  templo_grande:
    "https://images.unsplash.com/photo-1543340713-1c5b9a8c2f44?auto=format&fit=crop&w=1600&q=70",
};

export const denominacoesExtras: Record<string, DenominacaoExtra> = {
  "assembleia-de-deus": {
    image: IMG.templo_brasilia,
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
    image: IMG.bras_sp,
    imageCaption: "Templo Sede — Brás, São Paulo/SP",
    timeline: [
      { year: "1910", event: "Fundação por Louis Francescon no Brás, em São Paulo." },
      { year: "1936", event: "Consolidação do nome 'Congregação Cristã no Brasil'." },
      { year: "1970", event: "Expansão acelerada para todas as regiões do país." },
    ],
  },
  batista: {
    image: IMG.igreja_branca,
    imageCaption: "Sede da Convenção Batista Brasileira — Rio de Janeiro/RJ",
    timeline: [
      { year: "1882", event: "Primeira Igreja Batista organizada em Salvador/BA." },
      { year: "1907", event: "Fundação da Convenção Batista Brasileira (CBB)." },
      { year: "1908", event: "Criação do Seminário Teológico Batista do Sul." },
    ],
  },
  presbiteriana: {
    image: IMG.catedral_gotica,
    imageCaption: "Catedral Evangélica de São Paulo — IPB",
    timeline: [
      { year: "1859", event: "Chegada de Ashbel Green Simonton ao Rio de Janeiro." },
      { year: "1862", event: "Organização da primeira Igreja Presbiteriana do Brasil." },
      { year: "1888", event: "Organização do Sínodo da IPB." },
      { year: "1903", event: "Cisma que origina a Igreja Presbiteriana Independente." },
    ],
  },
  quadrangular: {
    image: IMG.catedral_moderna,
    imageCaption: "Catedral da Fé — IEQ, São Paulo/SP",
    timeline: [
      { year: "1923", event: "Fundação mundial por Aimee Semple McPherson em Los Angeles." },
      { year: "1951", event: "Chegada ao Brasil em São João da Boa Vista/SP." },
      { year: "1988", event: "Expansão nacional consolidada em todos os estados." },
    ],
  },
  universal: {
    image: IMG.templo_salomao,
    imageCaption: "Templo de Salomão — São Paulo/SP",
    timeline: [
      { year: "1977", event: "Fundação por Edir Macedo no Rio de Janeiro." },
      { year: "1989", event: "Aquisição da Rede Record." },
      { year: "2014", event: "Inauguração do Templo de Salomão." },
    ],
  },
  mundial: {
    image: IMG.templo_grande,
    imageCaption: "Templo Sede — Brás, São Paulo/SP",
  },
  "deus-e-amor": {
    image: IMG.catedral_moderna,
    imageCaption: "Catedral da Glória — São Paulo/SP",
  },
  adventista: {
    image: IMG.igreja_classica,
    imageCaption: "Sede Sul-Americana da IASD — Brasília/DF",
    timeline: [
      { year: "1863", event: "Organização oficial da IASD em Battle Creek, EUA." },
      { year: "1879", event: "Primeiros adventistas chegam a Santa Catarina." },
      { year: "1896", event: "Fundação do primeiro colégio adventista no Brasil." },
    ],
  },
  metodista: {
    image: IMG.catedral_londres,
    imageCaption: "Catedral Metodista — São Paulo/SP",
  },
  nazareno: {
    image: IMG.capela,
    imageCaption: "Sede Regional — Campinas/SP",
  },
  luterana: {
    image: IMG.catedral_alema,
    imageCaption: "Sede da IECLB — Porto Alegre/RS",
  },
  anglicana: {
    image: IMG.catedral_londres,
    imageCaption: "Catedral Anglicana — Porto Alegre/RS",
  },
  "casa-da-bencao": {
    image: IMG.templo_glassic,
    imageCaption: "Sede da Casa da Bênção — Belo Horizonte/MG",
  },
  "internacional-graca": {
    image: IMG.templo_grande,
    imageCaption: "Sede da Graça de Deus — Rio de Janeiro/RJ",
  },
  renascer: {
    image: IMG.templo_brasilia,
    imageCaption: "Sede Mundial Renascer — São Paulo/SP",
  },
  "bola-de-neve": {
    image: IMG.cruz_ceu,
    imageCaption: "Sede Bola de Neve — São Paulo/SP",
  },
  videira: {
    image: IMG.catedral_moderna,
    imageCaption: "Sede Mundial Videira — Goiânia/GO",
  },
  "sara-nossa-terra": {
    image: IMG.templo_brasilia,
    imageCaption: "Sede Sara Nossa Terra — Brasília/DF",
  },
};

export function getDenominacaoExtra(id: string): DenominacaoExtra | undefined {
  return denominacoesExtras[id];
}