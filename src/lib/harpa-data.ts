export interface Hymn {
  id: number;
  title: string;
  lyrics: string[]; // stanzas
  chorus?: string;
}

export const hymns: Hymn[] = [
  {
    id: 1,
    title: "Chuvas de Graça",
    lyrics: [
      "Deus prometeu com mão cheia,\nDerramar lá dos céus o poder;\nVejo as nuvens da chuva benditas,\nQue principiam agora a descer.",
      "Cristo virá outra vez à terra,\nEm grande glória qual Rei e Senhor;\nMas, antes disso, virá poderosa,\nA prometida chuva de amor.",
      "Vejo, ó Deus, as Tuas promessas;\nGrande avivamento aos crentes darás.\nDá-nos, Senhor, a chuva benigna,\nQue tantos crentes esperando estão.",
    ],
    chorus: "Chuvas de graça,\nChuvas pedimos, Senhor;\nManda-nos chuvas de graça,\nChuvas do Consolador.",
  },
  {
    id: 2,
    title: "Saudosa Lembrança",
    lyrics: [
      "Eu sei que atrás dos montes longe além,\nMora Jesus, meu Salvador e bem;\nLá um lugar Ele já preparou,\nPara onde em breve eu hei de ir morar.",
      "Já não pertenço a este mundo vão,\nVivo a esperar a Cristo no clamor;\nPois meu lugar não é aqui na terra,\nMas lá no céu com Cristo, meu Senhor.",
    ],
    chorus: "Saudosa lembrança que tenho de ti,\nÓ Pátria Bendita, querida, sem fim;\nQuão grande alegria terei lá no céu,\nQuando ouvir Cristo dizer-me: «vem».",
  },
  {
    id: 21,
    title: "Bondoso Salvador",
    lyrics: [
      "Bondoso Salvador, em fé eu venho a Ti,\nTu és o Redentor, oh! tem piedade de mim;\nDe joelhos vou orar, em Tua presença, ó Senhor,\nPor Tua compaixão e o Teu eterno amor.",
    ],
    chorus: "Eu Te amo, ó Salvador,\nEu Te amo, meu Senhor;\nFico em Teus braços, cheio de paz,\nNos Teus braços bem juntinho a Ti.",
  },
  {
    id: 51,
    title: "Castelo Forte",
    lyrics: [
      "Castelo forte é nosso Deus,\nEspada e bom escudo;\nCom seu poder defende os seus,\nEm todo o transe agudo.",
      "Nossas próprias forças nada são,\nLogo seremos vencidos;\nMas pelo Eterno Campeão,\nSeremos protegidos.",
    ],
  },
  {
    id: 100,
    title: "Vencendo Vem Jesus",
    lyrics: [
      "Eis dos céus rompendo as nuvens,\nDescortina-se a manhã,\nE os tropéis da escuridão\nAo clarão da luz se vão.",
      "Eis Jesus vem caminhando,\nDe vitória em vitória então;\nSua glória resplandece,\nE seus santos brilharão.",
    ],
    chorus: "Vencendo vem Jesus,\nO Filho de Davi;\nReceba o nome, o louvor,\nQue lhe é devido aqui.",
  },
  {
    id: 219,
    title: "Ao Pé da Cruz",
    lyrics: [
      "Ao pé da cruz, pecador, vem,\nE encontrarás divinal bem;\nÓ vem agora, sem demora,\nJesus aceita-te também.",
      "Olhando a cruz, com fé tu vês,\nNa morte de Jesus a chave,\nQue a porta abre dos remidos,\nNa eterna pátria dos salvos.",
    ],
    chorus: "Ao pé da cruz, ao pé da cruz,\nOnde primeiro vi a luz;\nE as manchas de minh'alma vi lavar,\nFoi ali, pela fé, que pude descansar.",
  },
  {
    id: 350,
    title: "Jesus, Em Tua Presença",
    lyrics: [
      "Jesus, em Tua presença,\nReunimo-nos aqui;\nFala ao nosso coração,\nQueremos ouvir-Te a Ti.",
      "Tua palavra preciosa,\nÉ nossa orientação;\nDá-nos hoje, Pai bondoso,\nDireção e proteção.",
    ],
  },
  {
    id: 415,
    title: "Saudoso Lar",
    lyrics: [
      "Em um lar de paz, na celeste mansão,\nNum eterno e feliz viver;\nLouvarei a Jesus, o bom Salvador,\nQue a vida me veio trazer.",
      "Lá no lar santo do meu Senhor,\nVerei a face do meu Jesus;\nPara sempre com Ele estarei,\nNas mansões celestiais.",
    ],
    chorus: "Saudoso lar! Saudoso lar!\nSerá um dia o meu viver;\nSaudoso lar! Saudoso lar!\nJesus prometeu vir me buscar.",
  },
  {
    id: 480,
    title: "Quão Grande és Tu",
    lyrics: [
      "Senhor meu Deus, quando eu, maravilhado,\nFico a pensar nas obras de Tuas mãos;\nO céu azul de estrelas pontilhado,\nO Teu poder mostrando a criação!",
      "Quando through woods and forest glades I wander,\nE ouço as aves a cantar nos ramos;\nQuando contemplo a terra e o oceano,\nFico admirado e a Ti, ó Deus, louvamos.",
    ],
    chorus: "Então minh'alma canta a Ti, Senhor:\nQuão grande és Tu! Quão grande és Tu!\nEntão minh'alma canta a Ti, Senhor:\nQuão grande és Tu! Quão grande és Tu!",
  },
  {
    id: 524,
    title: "Mais Perto Quero Estar",
    lyrics: [
      "Mais perto quero estar,\nMeu Deus, de Ti;\nInda que seja a dor\nQue me uniu a Ti;\nSempre hei de suplicar,\nMais perto quero estar,\nMais perto, meu Senhor,\nMais perto a Ti.",
      "Embora, qual Jacó,\nO sol se pôr,\nE eu tenha a pedra fria\nPor travesseiro,\nEm sonhos hei de estar,\nContigo, meu Senhor,\nMais perto, meu Senhor,\nMais perto a Ti.",
    ],
  },
];

export function searchHymns(query: string) {
  const q = query.toLowerCase();
  return hymns.filter(
    (h) =>
      h.title.toLowerCase().includes(q) ||
      String(h.id).includes(q) ||
      h.lyrics.some((s) => s.toLowerCase().includes(q)),
  );
}

export function getHymn(id: number) {
  return hymns.find((h) => h.id === id);
}