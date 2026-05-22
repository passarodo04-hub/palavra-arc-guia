export type Denominacao = {
  id: string;
  name: string;
  shortName?: string;
  founded: string;
  founders: string[];
  notablePeople?: string[];
  origin: string;
  headquarters: string;
  history: string;
  expansion: string;
  brazil: string;
  curiosities: string[];
  tags: string[];
};

export const denominacoes: Denominacao[] = [
  {
    id: "assembleia-de-deus",
    name: "Assembleia de Deus",
    shortName: "AD",
    founded: "1911 (Brasil)",
    founders: ["Daniel Berg", "Gunnar Vingren"],
    notablePeople: ["Paulo Leivas Macalão", "José Wellington Bezerra da Costa", "Silas Malafaia"],
    origin: "Suécia / Estados Unidos",
    headquarters: "Convenções espalhadas pelo Brasil (CGADB com sede em Brasília/DF)",
    history:
      "Fundada em Belém do Pará em 18 de junho de 1911 pelos missionários suecos Daniel Berg e Gunnar Vingren, vindos dos EUA influenciados pelo avivamento da Rua Azusa. Inicialmente chamada 'Missão de Fé Apostólica', passou a se chamar Assembleia de Deus em 1918.",
    expansion:
      "Tornou-se a maior denominação evangélica do Brasil, com presença em todos os estados, milhares de templos e diversas convenções (CGADB, CONAMAD, ministérios autônomos).",
    brazil:
      "Maior denominação pentecostal do país, com mais de 12 milhões de membros segundo dados recentes. Atua em obras sociais, missões, mídia e educação teológica.",
    curiosities: [
      "Berg e Vingren receberam o chamado para o Brasil através de uma profecia em Chicago.",
      "O primeiro culto aconteceu em uma casa na cidade de Belém do Pará.",
      "Possui ministérios autônomos como Belém, Madureira, Missão e outros.",
    ],
    tags: ["pentecostal", "ad", "brasil"],
  },
  {
    id: "ministerio-belem",
    name: "Assembleia de Deus Ministério Belém",
    shortName: "AD Belém",
    founded: "1911 / Ministério organizado a partir de 1980",
    founders: ["Daniel Berg", "Gunnar Vingren"],
    notablePeople: ["José Wellington Bezerra da Costa", "José Wellington Costa Júnior"],
    origin: "Belém do Pará — núcleo em São Paulo",
    headquarters: "Rua Dr. Fomm, 140 — Belenzinho, São Paulo/SP",
    history:
      "O Ministério Belém nasceu como expansão da obra iniciada por Daniel Berg e Gunnar Vingren. Em São Paulo, consolidou-se como um dos maiores e mais influentes ministérios da Assembleia de Deus, com forte vocação missionária.",
    expansion:
      "Possui congregações em todo o Brasil e em mais de 40 países, com milhares de templos vinculados.",
    brazil:
      "É considerado o maior ministério da Assembleia de Deus no mundo em número de membros e templos.",
    curiosities: [
      "A sede no Belenzinho/SP é uma das maiores igrejas evangélicas da América Latina.",
      "O pastor José Wellington presidiu a CGADB por décadas.",
    ],
    tags: ["pentecostal", "ad", "belem"],
  },
  {
    id: "congregacao-crista",
    name: "Congregação Cristã no Brasil",
    shortName: "CCB",
    founded: "1910",
    founders: ["Louis Francescon"],
    origin: "Itália / Estados Unidos",
    headquarters: "Brás, São Paulo/SP",
    history:
      "Fundada por Louis Francescon, missionário ítalo-americano, em 20 de junho de 1910 no bairro do Brás, em São Paulo. É a primeira igreja pentecostal do Brasil.",
    expansion:
      "Cresceu de forma silenciosa e organizada, com presença em quase todos os municípios brasileiros.",
    brazil:
      "Possui milhões de membros e cerca de 20 mil templos no país. Caracteriza-se por cultos sóbrios, ausência de oferta pública e uso de hinário próprio.",
    curiosities: [
      "As mulheres usam véu durante o culto, conforme 1 Coríntios 11.",
      "Não há dízimo obrigatório nem coleta exposta ao público.",
      "Possui hinário próprio com 480 hinos.",
    ],
    tags: ["pentecostal", "ccb"],
  },
  {
    id: "batista",
    name: "Convenção Batista Brasileira",
    shortName: "Batista",
    founded: "1882 (Brasil)",
    founders: ["William Buck Bagby", "Zachary Clay Taylor", "Anne Luther Bagby"],
    origin: "Inglaterra / Estados Unidos",
    headquarters: "Rio de Janeiro/RJ",
    history:
      "A primeira igreja batista brasileira foi organizada em Salvador/BA em 15 de outubro de 1882 por missionários americanos. As raízes batistas remontam ao século XVII na Inglaterra, com John Smyth.",
    expansion:
      "Hoje conta com milhares de igrejas no Brasil filiadas à CBB e a outras convenções (Nacional, Regular, Independente).",
    brazil:
      "Atuação forte em educação (seminários, universidades), missões, hospitais e comunicação.",
    curiosities: [
      "Praticam o batismo por imersão somente em crentes.",
      "Cada igreja local é autônoma — não há hierarquia centralizada.",
    ],
    tags: ["evangelica", "tradicional", "batista"],
  },
  {
    id: "presbiteriana",
    name: "Igreja Presbiteriana do Brasil",
    shortName: "IPB",
    founded: "1859 (Brasil)",
    founders: ["Ashbel Green Simonton"],
    origin: "Escócia (John Knox) / Estados Unidos",
    headquarters: "São Paulo/SP (Supremo Concílio)",
    history:
      "O missionário americano Ashbel Green Simonton chegou ao Rio de Janeiro em 1859, fundando a primeira igreja presbiteriana brasileira em 1862. Origina-se da Reforma Protestante calvinista.",
    expansion:
      "Presente em todos os estados, com seminários renomados como o JMC e o Andrew Jumper.",
    brazil:
      "Influente em educação (Mackenzie) e teologia reformada no país.",
    curiosities: [
      "Governo eclesiástico por presbíteros (anciãos), de onde vem o nome.",
      "Adota a Confissão de Fé de Westminster.",
    ],
    tags: ["reformada", "tradicional", "calvinista"],
  },
  {
    id: "quadrangular",
    name: "Igreja do Evangelho Quadrangular",
    shortName: "IEQ",
    founded: "1951 (Brasil)",
    founders: ["Harold Williams", "Aimee Semple McPherson (fundadora mundial, 1923)"],
    origin: "Estados Unidos",
    headquarters: "São Paulo/SP",
    history:
      "A Quadrangular foi fundada mundialmente por Aimee Semple McPherson em 1923, em Los Angeles. No Brasil, chegou em 1951 através da Cruzada Nacional de Evangelização em São João da Boa Vista/SP.",
    expansion:
      "Expandiu-se rapidamente pelo país, especialmente nos anos 80 e 90.",
    brazil:
      "Uma das maiores denominações pentecostais brasileiras, conhecida por ênfase em evangelismo e cura divina.",
    curiosities: [
      "O nome 'Quadrangular' representa quatro aspectos de Jesus: Salvador, Batizador no Espírito Santo, Curador e Rei que voltará.",
      "Foi pioneira na ordenação de mulheres ao ministério pastoral.",
    ],
    tags: ["pentecostal", "quadrangular"],
  },
  {
    id: "universal",
    name: "Igreja Universal do Reino de Deus",
    shortName: "IURD",
    founded: "1977",
    founders: ["Edir Macedo", "Romildo Ribeiro Soares"],
    origin: "Brasil",
    headquarters: "Templo de Salomão — São Paulo/SP",
    history:
      "Fundada em 9 de julho de 1977 por Edir Macedo no Rio de Janeiro, em uma antiga funerária no bairro da Abolição.",
    expansion:
      "Presente em mais de 100 países, com forte atuação midiática (Record TV, rádios, jornais).",
    brazil:
      "Grande presença urbana, com templos em quase todos os municípios.",
    curiosities: [
      "O Templo de Salomão, inaugurado em 2014, é uma das maiores obras religiosas modernas do Brasil.",
    ],
    tags: ["neopentecostal"],
  },
  {
    id: "mundial",
    name: "Igreja Mundial do Poder de Deus",
    shortName: "IMPD",
    founded: "1998",
    founders: ["Valdemiro Santiago"],
    origin: "Brasil",
    headquarters: "Brás, São Paulo/SP",
    history:
      "Fundada por Valdemiro Santiago em São Paulo, após sua saída da IURD.",
    expansion: "Cresceu rapidamente nos anos 2000, com forte presença midiática.",
    brazil: "Mais de 5 mil templos no Brasil.",
    curiosities: ["Possui programação diária em rede de TV própria."],
    tags: ["neopentecostal"],
  },
  {
    id: "deus-e-amor",
    name: "Igreja Pentecostal Deus é Amor",
    shortName: "IPDA",
    founded: "1962",
    founders: ["David Martins Miranda"],
    origin: "Brasil",
    headquarters: "Catedral da Glória — São Paulo/SP",
    history:
      "Fundada por Davi Miranda em São Paulo, em 3 de junho de 1962.",
    expansion: "Presente em mais de 130 países.",
    brazil: "Conhecida pelos cultos diários e pelo rádio 'A Voz da Libertação'.",
    curiosities: ["A Catedral da Glória abriga cultos 24 horas por dia."],
    tags: ["pentecostal"],
  },
  {
    id: "adventista",
    name: "Igreja Adventista do Sétimo Dia",
    shortName: "IASD",
    founded: "1863 (mundial) / 1879 (Brasil)",
    founders: ["Ellen G. White", "Tiago White", "Joseph Bates"],
    origin: "Estados Unidos",
    headquarters: "Brasília/DF (sede sul-americana)",
    history:
      "Surgiu do movimento milerita nos EUA. Os primeiros adventistas no Brasil foram imigrantes alemães em Santa Catarina, em 1879.",
    expansion: "Presente em mais de 200 países.",
    brazil: "Forte atuação em educação (rede de colégios e Unasp) e saúde (Hospital Adventista).",
    curiosities: [
      "Guardam o sábado como dia de descanso e adoração.",
      "Possuem orientação vegetariana baseada em saúde integral.",
    ],
    tags: ["adventista", "tradicional"],
  },
  {
    id: "metodista",
    name: "Igreja Metodista",
    founded: "1738 (mundial) / 1867 (Brasil)",
    founders: ["John Wesley", "Charles Wesley"],
    origin: "Inglaterra",
    headquarters: "São Paulo/SP",
    history:
      "Surgiu na Inglaterra no séc. XVIII a partir do avivamento liderado por John Wesley. Chegou ao Brasil em 1867 pelo missionário Junius Eastham Newman.",
    expansion: "Mundialmente difundida com forte ênfase em ação social.",
    brazil: "Mantém a Universidade Metodista de São Paulo e diversos colégios.",
    curiosities: [
      "O nome 'metodista' veio de zombaria pela disciplina (método) de estudo e oração dos Wesley em Oxford.",
    ],
    tags: ["tradicional", "wesleyana"],
  },
  {
    id: "nazareno",
    name: "Igreja do Nazareno",
    founded: "1908 (mundial) / 1958 (Brasil)",
    founders: ["Phineas F. Bresee"],
    origin: "Estados Unidos",
    headquarters: "Campinas/SP (sede regional Brasil)",
    history:
      "Origina-se do movimento de santidade wesleyano americano, fundada em 1908 em Pilot Point, Texas.",
    expansion: "Presente em mais de 160 países.",
    brazil: "Chegou ao país em 1958, com crescimento contínuo no Sudeste e Nordeste.",
    curiosities: ["Ênfase doutrinária na santificação integral."],
    tags: ["wesleyana", "santidade"],
  },
  {
    id: "luterana",
    name: "Igreja Evangélica Luterana",
    founded: "1517 (Reforma) / 1824 (Brasil)",
    founders: ["Martinho Lutero"],
    origin: "Alemanha",
    headquarters: "Porto Alegre/RS (IECLB)",
    history:
      "A Reforma Protestante iniciou-se em 31 de outubro de 1517 com as 95 teses de Lutero. No Brasil, chegou com imigrantes alemães em 1824.",
    expansion: "Mundialmente difundida, especialmente na Europa do Norte.",
    brazil: "Forte presença no Sul do Brasil. Mantém colégios, hospitais e universidades.",
    curiosities: ["Lutero traduziu a Bíblia para o alemão, popularizando a leitura bíblica."],
    tags: ["tradicional", "reformada"],
  },
  {
    id: "anglicana",
    name: "Igreja Episcopal Anglicana do Brasil",
    shortName: "IEAB",
    founded: "1534 (mundial) / 1810 (Brasil)",
    founders: ["Henrique VIII (mundial)"],
    origin: "Inglaterra",
    headquarters: "Porto Alegre/RS",
    history:
      "Surgiu da separação da Igreja da Inglaterra com Roma em 1534. No Brasil, os primeiros cultos anglicanos ocorreram em 1810 com a vinda da família real portuguesa.",
    expansion: "Comunhão Anglicana mundial com cerca de 85 milhões de membros.",
    brazil: "Atuação ecumênica e social.",
    curiosities: ["Mantém liturgia próxima à católica, mas com teologia reformada."],
    tags: ["tradicional", "anglicana"],
  },
  {
    id: "casa-da-bencao",
    name: "Igreja Casa da Bênção",
    founded: "1964",
    founders: ["Doriel de Oliveira"],
    origin: "Brasil",
    headquarters: "Belo Horizonte/MG",
    history:
      "Fundada em 1964 em Belo Horizonte por Doriel de Oliveira, com ênfase pentecostal e na cura divina.",
    expansion: "Mais de 5 mil templos no Brasil e presença em diversos países.",
    brazil: "Forte presença em Minas Gerais, Goiás e Sudeste.",
    curiosities: ["Conhecida pelos cultos com forte apelo à cura e libertação."],
    tags: ["pentecostal"],
  },
  {
    id: "internacional-graca",
    name: "Igreja Internacional da Graça de Deus",
    founded: "1980",
    founders: ["Romildo Ribeiro Soares (R. R. Soares)"],
    origin: "Brasil",
    headquarters: "Rio de Janeiro/RJ",
    history:
      "Fundada por R. R. Soares no Rio de Janeiro, após sua saída da IURD. Tornou-se conhecida pelo programa 'Show da Fé'.",
    expansion: "Presença em vários países com forte uso de mídia televisiva.",
    brazil: "Atuação nacional via rede própria de TV (RIT).",
    curiosities: ["R. R. Soares é cunhado de Edir Macedo."],
    tags: ["neopentecostal"],
  },
  {
    id: "renascer",
    name: "Igreja Apostólica Renascer em Cristo",
    founded: "1986",
    founders: ["Estevam Hernandes", "Sonia Hernandes"],
    origin: "Brasil",
    headquarters: "São Paulo/SP",
    history:
      "Fundada em 1986 em São Paulo, com forte foco em jovens, gospel e cultura.",
    expansion: "Pioneira no movimento gospel brasileiro.",
    brazil: "Organizou a primeira Marcha para Jesus no Brasil em 1993.",
    curiosities: ["Idealizou o Dia Nacional da Marcha para Jesus, hoje feriado nacional."],
    tags: ["neopentecostal", "gospel"],
  },
  {
    id: "bola-de-neve",
    name: "Igreja Bola de Neve",
    founded: "1999",
    founders: ["Rinaldo Luiz de Seixas Pereira (Apóstolo Rina)"],
    origin: "Brasil",
    headquarters: "São Paulo/SP",
    history:
      "Fundada em 1999 por Rina, com público inicialmente ligado ao surfe e esportes radicais.",
    expansion: "Mais de 500 templos no Brasil e no exterior.",
    brazil: "Linguagem jovem e contemporânea, com púlpito em formato de prancha de surfe.",
    curiosities: ["O púlpito é uma prancha de surfe, símbolo da igreja."],
    tags: ["neopentecostal", "jovem"],
  },
  {
    id: "videira",
    name: "Comunidade Cristã Videira",
    founded: "1998",
    founders: ["Aluízio A. Silva"],
    origin: "Brasil",
    headquarters: "Goiânia/GO",
    history:
      "Fundada em Goiânia com forte estrutura de células e discipulado (Modelo dos 12).",
    expansion: "Presente em mais de 30 países.",
    brazil: "Cresceu por meio do modelo G12 / discipulado pessoal.",
    curiosities: ["Modelo de governo eclesiástico inspirado em Cesar Castellanos."],
    tags: ["neopentecostal", "celulas"],
  },
  {
    id: "sara-nossa-terra",
    name: "Igreja Sara Nossa Terra",
    founded: "1992",
    founders: ["Robson Rodovalho", "Maria Lúcia Rodovalho"],
    origin: "Brasil",
    headquarters: "Brasília/DF",
    history: "Fundada em Goiânia em 1992 e posteriormente transferida para Brasília.",
    expansion: "Presença em mais de 30 países.",
    brazil: "Atua fortemente em ação social e educação.",
    curiosities: ["Robson Rodovalho é também doutor em física e ex-senador."],
    tags: ["neopentecostal"],
  },
];

export function getDenominacao(id: string) {
  return denominacoes.find((d) => d.id === id);
}