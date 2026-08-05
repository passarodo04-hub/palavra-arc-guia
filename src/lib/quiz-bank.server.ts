import type { QuizAudience, QuizDifficulty } from "@/lib/quiz-shared";

/* ------------------------------------------------------------------ *
 *  Banco de questões — SERVER ONLY.                                   *
 *  Fica fora do bundle do cliente para que a resposta correta e a     *
 *  explicação nunca cheguem ao navegador antes da correção.           *
 *  Para expandir: basta acrescentar entradas abaixo (ou, no futuro,   *
 *  carregar de uma tabela) — nada mais precisa mudar.                 *
 * ------------------------------------------------------------------ */

export type BankQuestion = {
  id: string;
  audience: QuizAudience;
  category: string;
  difficulty: QuizDifficulty;
  question: string;
  options: string[];
  answer: number;
  explanation: string;
  reference?: string;
  book?: string;
  chapter?: number;
  active: boolean;
};

type Raw = [
  id: string,
  category: string,
  difficulty: QuizDifficulty,
  question: string,
  options: [string, string, string, string],
  answer: number,
  explanation: string,
  reference?: string,
  book?: string,
  chapter?: number,
];

function build(audience: QuizAudience, rows: Raw[]): BankQuestion[] {
  return rows.map((r) => ({
    id: r[0],
    audience,
    category: r[1],
    difficulty: r[2],
    question: r[3],
    options: r[4],
    answer: r[5],
    explanation: r[6],
    reference: r[7],
    book: r[8],
    chapter: r[9],
    active: true,
  }));
}

const ADULTOS: Raw[] = [
  // -------- Bíblia Geral --------
  ["a-bg-1", "biblia-geral", "facil", "Quantos livros tem a Bíblia completa?", ["27", "39", "66", "73"], 2, "A Bíblia protestante reúne 39 livros no Antigo Testamento e 27 no Novo, totalizando 66."],
  ["a-bg-2", "biblia-geral", "facil", "Quantos livros tem o Antigo Testamento?", ["27", "39", "46", "66"], 1, "O Antigo Testamento é formado por 39 livros, de Gênesis a Malaquias."],
  ["a-bg-3", "biblia-geral", "facil", "Qual é o primeiro livro da Bíblia?", ["Êxodo", "Gênesis", "Salmos", "Josué"], 1, "Gênesis abre as Escrituras narrando a criação e os patriarcas.", "Gênesis 1", "gn", 1],
  ["a-bg-4", "biblia-geral", "facil", "Qual é o último livro da Bíblia?", ["Judas", "Apocalipse", "Malaquias", "Hebreus"], 1, "Apocalipse encerra o cânon com a revelação dada a João.", "Apocalipse 1", "ap", 1],
  ["a-bg-5", "biblia-geral", "medio", "Quantos livros tem o Novo Testamento?", ["21", "24", "27", "31"], 2, "São 27 livros, dos Evangelhos ao Apocalipse."],
  ["a-bg-6", "biblia-geral", "medio", "Qual livro tem o maior número de capítulos?", ["Isaías", "Salmos", "Gênesis", "Jeremias"], 1, "Salmos tem 150 capítulos, o maior número da Bíblia.", "Salmos 1", "sl", 1],
  ["a-bg-7", "biblia-geral", "dificil", "Em qual idioma a maior parte do Antigo Testamento foi escrita?", ["Grego", "Aramaico", "Hebraico", "Latim"], 2, "O Antigo Testamento foi escrito majoritariamente em hebraico, com trechos em aramaico."],
  ["a-bg-8", "biblia-geral", "dificil", "Qual é o capítulo mais longo da Bíblia?", ["Salmo 119", "Isaías 53", "Gênesis 1", "Mateus 5"], 0, "O Salmo 119 tem 176 versículos e exalta a Palavra de Deus.", "Salmos 119", "sl", 119],

  // -------- Antigo Testamento --------
  ["a-at-1", "antigo-testamento", "facil", "Quem construiu a arca?", ["Moisés", "Noé", "Davi", "Pedro"], 1, "Noé recebeu de Deus a instrução para construir a arca antes do dilúvio.", "Gênesis 6", "gn", 6],
  ["a-at-2", "antigo-testamento", "facil", "Quem liderou a saída do povo de Israel do Egito?", ["Josué", "Arão", "Moisés", "Samuel"], 2, "Moisés foi chamado por Deus para tirar Israel da escravidão no Egito.", "Êxodo 12", "ex", 12],
  ["a-at-3", "antigo-testamento", "facil", "Quantos mandamentos Deus entregou no Sinai?", ["7", "10", "12", "40"], 1, "Os Dez Mandamentos foram entregues a Moisés no monte Sinai.", "Êxodo 20", "ex", 20],
  ["a-at-4", "antigo-testamento", "medio", "Quem foi vendido pelos irmãos e se tornou governador no Egito?", ["Benjamim", "José", "Judá", "Rúben"], 1, "José foi vendido pelos irmãos e, no tempo de Deus, tornou-se governador do Egito.", "Gênesis 37", "gn", 37],
  ["a-at-5", "antigo-testamento", "medio", "Quantos anos Israel peregrinou no deserto?", ["7", "12", "40", "70"], 2, "Por causa da incredulidade, aquela geração andou 40 anos no deserto.", "Números 14", "nm", 14],
  ["a-at-6", "antigo-testamento", "medio", "Quem sucedeu Moisés na liderança de Israel?", ["Arão", "Calebe", "Josué", "Samuel"], 2, "Josué conduziu o povo à Terra Prometida depois da morte de Moisés.", "Josué 1", "js", 1],
  ["a-at-7", "antigo-testamento", "dificil", "Quem foi lançado na cova dos leões por orar a Deus?", ["Daniel", "Jeremias", "Elias", "Neemias"], 0, "Daniel continuou orando e foi lançado na cova, mas Deus o livrou.", "Daniel 6", "dn", 6],
  ["a-at-8", "antigo-testamento", "dificil", "Qual mar se abriu para a passagem de Israel?", ["Mar Morto", "Mar Vermelho", "Mar da Galileia", "Mar Mediterrâneo"], 1, "Deus abriu o Mar Vermelho para que Israel passasse em seco.", "Êxodo 14", "ex", 14],

  // -------- Novo Testamento --------
  ["a-nt-1", "novo-testamento", "facil", "Quantos Evangelhos existem no Novo Testamento?", ["3", "4", "5", "7"], 1, "Mateus, Marcos, Lucas e João narram a vida de Jesus."],
  ["a-nt-2", "novo-testamento", "facil", "Quem batizou Jesus no rio Jordão?", ["Pedro", "João Batista", "André", "Paulo"], 1, "João Batista batizou Jesus no Jordão, e o Espírito desceu sobre Ele.", "Mateus 3", "mt", 3],
  ["a-nt-3", "novo-testamento", "facil", "Qual livro narra o início da igreja primitiva?", ["Romanos", "Atos", "Hebreus", "Tiago"], 1, "Atos dos Apóstolos registra o nascimento e a expansão da igreja.", "Atos 2", "atos", 2],
  ["a-nt-4", "novo-testamento", "medio", "Quem escreveu a maior parte das cartas do Novo Testamento?", ["Pedro", "João", "Paulo", "Tiago"], 2, "Paulo é tradicionalmente reconhecido como autor de 13 epístolas."],
  ["a-nt-5", "novo-testamento", "medio", "Em qual festa o Espírito Santo foi derramado sobre os discípulos?", ["Páscoa", "Pentecostes", "Tabernáculos", "Purim"], 1, "No dia de Pentecostes o Espírito Santo encheu os discípulos em Jerusalém.", "Atos 2", "atos", 2],
  ["a-nt-6", "novo-testamento", "medio", "Quem traiu Jesus por trinta moedas de prata?", ["Pedro", "Tomé", "Judas Iscariotes", "Tadeu"], 2, "Judas Iscariotes entregou Jesus em troca de trinta moedas de prata.", "Mateus 26", "mt", 26],
  ["a-nt-7", "novo-testamento", "dificil", "Qual é o primeiro livro do Novo Testamento?", ["Marcos", "Mateus", "Lucas", "João"], 1, "Mateus abre o Novo Testamento apresentando Jesus como o Messias prometido.", "Mateus 1", "mt", 1],
  ["a-nt-8", "novo-testamento", "dificil", "A quem Paulo escreveu duas cartas orientando um jovem pastor?", ["Tito", "Timóteo", "Filemom", "Silas"], 1, "1 e 2 Timóteo são cartas pastorais dirigidas a Timóteo.", "1 Timóteo 1", "1tm", 1],

  // -------- Personagens --------
  ["a-pe-1", "personagens", "facil", "Quem enfrentou o gigante Golias?", ["Saul", "Davi", "Sansão", "Jônatas"], 1, "Davi, ainda jovem, derrotou Golias confiando no Senhor.", "1 Samuel 17", "1sm", 17],
  ["a-pe-2", "personagens", "facil", "Quem negou Jesus três vezes?", ["João", "Pedro", "Tiago", "Filipe"], 1, "Pedro negou Jesus três vezes antes do cantar do galo, e depois se arrependeu.", "Lucas 22", "lc", 22],
  ["a-pe-3", "personagens", "facil", "Quem é chamado de pai da fé?", ["Isaque", "Abraão", "Jacó", "Noé"], 1, "Abraão creu em Deus e isso lhe foi imputado como justiça.", "Romanos 4", "rm", 4],
  ["a-pe-4", "personagens", "medio", "Quem interpretou os sonhos de Faraó?", ["Daniel", "José", "Moisés", "Jacó"], 1, "José interpretou os sonhos de Faraó sobre os anos de fartura e de fome.", "Gênesis 41", "gn", 41],
  ["a-pe-5", "personagens", "medio", "Qual rainha arriscou a vida para salvar seu povo?", ["Mical", "Ester", "Jezabel", "Atalia"], 1, "Ester intercedeu diante do rei e livrou os judeus da destruição.", "Ester 4", "et", 4],
  ["a-pe-6", "personagens", "medio", "Quem era a sogra de Rute?", ["Ana", "Noemi", "Débora", "Raquel"], 1, "Rute permaneceu ao lado de Noemi, sua sogra, após ficarem viúvas.", "Rute 1", "rt", 1],
  ["a-pe-7", "personagens", "dificil", "Quem andou com Deus e não viu a morte?", ["Elias", "Enoque", "Melquisedeque", "Matusalém"], 1, "Enoque andou com Deus e foi tomado por Ele.", "Gênesis 5", "gn", 5],
  ["a-pe-8", "personagens", "dificil", "Quem foi o sogro de Moisés?", ["Jetro", "Labão", "Hebe", "Nadabe"], 0, "Jetro, sacerdote de Midiã, era sogro de Moisés e o aconselhou na liderança.", "Êxodo 18", "ex", 18],

  // -------- Reis --------
  ["a-re-1", "reis", "facil", "Quem foi o primeiro rei de Israel?", ["Davi", "Saul", "Salomão", "Samuel"], 1, "Saul foi ungido por Samuel como o primeiro rei de Israel.", "1 Samuel 10", "1sm", 10],
  ["a-re-2", "reis", "facil", "Qual rei ficou conhecido por sua sabedoria?", ["Ezequias", "Salomão", "Josias", "Acabe"], 1, "Salomão pediu a Deus um coração sábio para julgar o povo.", "1 Reis 3", "1rs", 3],
  ["a-re-3", "reis", "facil", "Quem construiu o templo em Jerusalém?", ["Davi", "Salomão", "Zorobabel", "Neemias"], 1, "Davi preparou os materiais, mas foi Salomão quem edificou o templo.", "1 Reis 6", "1rs", 6],
  ["a-re-4", "reis", "medio", "Quem reinou depois de Saul?", ["Isbosete", "Davi", "Salomão", "Jônatas"], 1, "Davi foi ungido rei sobre todo o Israel após a morte de Saul.", "2 Samuel 5", "2sm", 5],
  ["a-re-5", "reis", "medio", "Qual rei recebeu mais quinze anos de vida?", ["Josias", "Ezequias", "Manassés", "Uzias"], 1, "Deus atendeu a oração de Ezequias e acrescentou quinze anos à sua vida.", "2 Reis 20", "2rs", 20],
  ["a-re-6", "reis", "medio", "Qual rei do reino do norte foi casado com Jezabel?", ["Jeroboão", "Acabe", "Onri", "Jeú"], 1, "Acabe casou-se com Jezabel e levou Israel à idolatria.", "1 Reis 16", "1rs", 16],
  ["a-re-7", "reis", "dificil", "Com qual rei o reino se dividiu em Israel e Judá?", ["Roboão", "Jeroboão", "Asa", "Abias"], 0, "No reinado de Roboão, filho de Salomão, o reino se dividiu.", "1 Reis 12", "1rs", 12],
  ["a-re-8", "reis", "dificil", "Qual rei começou a reinar aos oito anos e restaurou a Lei?", ["Josias", "Joás", "Amom", "Jotão"], 0, "Josias assumiu o trono com oito anos e promoveu grande reforma espiritual.", "2 Reis 22", "2rs", 22],

  // -------- Juízes --------
  ["a-ju-1", "juizes", "facil", "Quem foi a juíza e profetisa de Israel?", ["Ana", "Débora", "Hulda", "Miriã"], 1, "Débora julgava Israel e conduziu o povo à vitória.", "Juízes 4", "jz", 4],
  ["a-ju-2", "juizes", "facil", "Qual juiz venceu os midianitas com apenas 300 homens?", ["Sansão", "Gideão", "Jefté", "Otniel"], 1, "Deus reduziu o exército de Gideão a 300 homens para mostrar Seu poder.", "Juízes 7", "jz", 7],
  ["a-ju-3", "juizes", "facil", "Qual juiz tinha força extraordinária?", ["Sansão", "Baraque", "Eúde", "Sangar"], 0, "Sansão foi nazireu e sua força vinha do Senhor.", "Juízes 13", "jz", 13],
  ["a-ju-4", "juizes", "medio", "Quem acompanhou Débora na batalha contra Sísera?", ["Baraque", "Gideão", "Jefté", "Abimeleque"], 0, "Baraque só foi à batalha acompanhado de Débora.", "Juízes 4", "jz", 4],
  ["a-ju-5", "juizes", "medio", "Qual juiz fez um voto precipitado ao Senhor?", ["Jefté", "Otniel", "Tola", "Elom"], 0, "Jefté fez um voto apressado antes da batalha contra os amonitas.", "Juízes 11", "jz", 11],
  ["a-ju-6", "juizes", "medio", "Quem é considerado o último juiz de Israel?", ["Eli", "Samuel", "Sansão", "Jefté"], 1, "Samuel julgou Israel antes da instituição da monarquia.", "1 Samuel 7", "1sm", 7],
  ["a-ju-7", "juizes", "dificil", "Quem foi o primeiro juiz mencionado no livro de Juízes?", ["Eúde", "Otniel", "Sangar", "Débora"], 1, "Otniel foi levantado por Deus como primeiro libertador de Israel.", "Juízes 3", "jz", 3],
  ["a-ju-8", "juizes", "dificil", "Qual povo Gideão derrotou?", ["Filisteus", "Midianitas", "Amonitas", "Moabitas"], 1, "Gideão derrotou os midianitas que oprimiam Israel.", "Juízes 7", "jz", 7],

  // -------- Profetas --------
  ["a-pr-1", "profetas", "facil", "Qual profeta foi levado ao céu num carro de fogo?", ["Eliseu", "Elias", "Ezequiel", "Enoque"], 1, "Elias foi arrebatado num redemoinho, com carros de fogo.", "2 Reis 2", "2rs", 2],
  ["a-pr-2", "profetas", "facil", "Qual profeta foi engolido por um grande peixe?", ["Amós", "Jonas", "Naum", "Oséias"], 1, "Jonas fugiu do chamado de Deus e foi engolido por um grande peixe.", "Jonas 1", "jn", 1],
  ["a-pr-3", "profetas", "facil", "Quem sucedeu Elias no ministério profético?", ["Eliseu", "Isaías", "Miquéias", "Obadias"], 0, "Eliseu recebeu porção dobrada do espírito que estava sobre Elias.", "2 Reis 2", "2rs", 2],
  ["a-pr-4", "profetas", "medio", "Qual profeta é conhecido como o profeta chorão?", ["Ezequiel", "Jeremias", "Joel", "Habacuque"], 1, "Jeremias chorou pelo pecado e pelo juízo que viria sobre Judá.", "Jeremias 9", "jr", 9],
  ["a-pr-5", "profetas", "medio", "Qual profeta teve a visão do vale de ossos secos?", ["Daniel", "Ezequiel", "Zacarias", "Isaías"], 1, "Ezequiel profetizou sobre ossos secos que voltaram a viver.", "Ezequiel 37", "ez", 37],
  ["a-pr-6", "profetas", "medio", "Qual profeta anunciou que a virgem conceberia um filho?", ["Isaías", "Miquéias", "Sofonias", "Ageu"], 0, "Isaías profetizou o sinal do Emanuel.", "Isaías 7", "is", 7],
  ["a-pr-7", "profetas", "dificil", "Qual profeta casou-se com Gômer por ordem do Senhor?", ["Amós", "Oséias", "Joel", "Miquéias"], 1, "O casamento de Oséias ilustrou o amor fiel de Deus por Israel infiel.", "Oséias 1", "os", 1],
  ["a-pr-8", "profetas", "dificil", "Qual é o último livro profético do Antigo Testamento?", ["Zacarias", "Malaquias", "Ageu", "Joel"], 1, "Malaquias encerra o Antigo Testamento anunciando o mensageiro que viria.", "Malaquias 4", "ml", 4],

  // -------- Jesus --------
  ["a-je-1", "jesus", "facil", "Onde Jesus nasceu?", ["Nazaré", "Belém", "Jerusalém", "Cafarnaum"], 1, "Jesus nasceu em Belém da Judeia, conforme a profecia.", "Lucas 2", "lc", 2],
  ["a-je-2", "jesus", "facil", "Em qual cidade Jesus cresceu?", ["Nazaré", "Betânia", "Jericó", "Caná"], 0, "Jesus foi criado em Nazaré, na Galileia.", "Mateus 2", "mt", 2],
  ["a-je-3", "jesus", "facil", "Quantos discípulos Jesus escolheu?", ["7", "10", "12", "70"], 2, "Jesus escolheu doze discípulos para estarem com Ele.", "Marcos 3", "mc", 3],
  ["a-je-4", "jesus", "medio", "Qual foi o primeiro milagre de Jesus registrado em João?", ["Curar o cego", "Transformar água em vinho", "Multiplicar pães", "Andar sobre as águas"], 1, "Em Caná da Galileia, Jesus transformou água em vinho.", "João 2", "jo", 2],
  ["a-je-5", "jesus", "medio", "Quantos dias Jesus jejuou no deserto?", ["3", "7", "40", "50"], 2, "Jesus jejuou quarenta dias e quarenta noites antes de ser tentado.", "Mateus 4", "mt", 4],
  ["a-je-6", "jesus", "medio", "Quem Jesus ressuscitou depois de quatro dias na sepultura?", ["Lázaro", "Jairo", "Eutico", "Tabita"], 0, "Jesus chamou Lázaro para fora do sepulcro em Betânia.", "João 11", "jo", 11],
  ["a-je-7", "jesus", "dificil", "Em que sermão estão as bem-aventuranças?", ["Sermão do Monte", "Discurso de Pentecostes", "Sermão profético", "Discurso do cenáculo"], 0, "As bem-aventuranças abrem o Sermão do Monte.", "Mateus 5", "mt", 5],
  ["a-je-8", "jesus", "dificil", "Qual era o nome do lugar onde Jesus foi crucificado?", ["Getsêmani", "Gólgota", "Siloé", "Betânia"], 1, "Jesus foi crucificado no Gólgota, chamado Lugar da Caveira.", "João 19", "jo", 19],

  // -------- Apóstolos --------
  ["a-ap-1", "apostolos", "facil", "Qual apóstolo duvidou da ressurreição até ver Jesus?", ["Tomé", "Filipe", "André", "Tiago"], 0, "Tomé creu ao ver o Senhor ressurreto.", "João 20", "jo", 20],
  ["a-ap-2", "apostolos", "facil", "Quem é chamado apóstolo dos gentios?", ["Pedro", "Paulo", "Barnabé", "Silas"], 1, "Paulo declarou-se apóstolo dos gentios.", "Romanos 11", "rm", 11],
  ["a-ap-3", "apostolos", "facil", "Qual apóstolo era irmão de Pedro?", ["Tiago", "André", "João", "Filipe"], 1, "André, irmão de Simão Pedro, foi quem o levou a Jesus.", "João 1", "jo", 1],
  ["a-ap-4", "apostolos", "medio", "Qual apóstolo era coletor de impostos?", ["Mateus", "Tomé", "Bartolomeu", "Simão"], 0, "Mateus deixou a coletoria para seguir Jesus.", "Mateus 9", "mt", 9],
  ["a-ap-5", "apostolos", "medio", "Quem foi escolhido para substituir Judas Iscariotes?", ["Matias", "Estêvão", "Barnabé", "Silas"], 0, "Matias foi escolhido entre os que acompanharam Jesus desde o princípio.", "Atos 1", "atos", 1],
  ["a-ap-6", "apostolos", "medio", "Onde Saulo se converteu?", ["Em Jerusalém", "No caminho de Damasco", "Em Antioquia", "Em Corinto"], 1, "Saulo encontrou o Senhor a caminho de Damasco.", "Atos 9", "atos", 9],
  ["a-ap-7", "apostolos", "dificil", "Quem acompanhou Paulo na primeira viagem missionária?", ["Silas", "Barnabé", "Timóteo", "Lucas"], 1, "Barnabé partiu com Paulo na primeira viagem, enviados pela igreja de Antioquia.", "Atos 13", "atos", 13],
  ["a-ap-8", "apostolos", "dificil", "Quem foi o primeiro mártir cristão?", ["Estêvão", "Tiago", "Pedro", "Filipe"], 0, "Estêvão foi apedrejado por pregar com ousadia a Palavra.", "Atos 7", "atos", 7],

  // -------- Geografia --------
  ["a-ge-1", "geografia", "facil", "Em qual rio Jesus foi batizado?", ["Nilo", "Jordão", "Eufrates", "Tigre"], 1, "João batizava no rio Jordão, onde Jesus também foi batizado.", "Mateus 3", "mt", 3],
  ["a-ge-2", "geografia", "facil", "Qual cidade teve suas muralhas derrubadas por Israel?", ["Ai", "Jericó", "Gibeão", "Hebrom"], 1, "As muralhas de Jericó caíram depois que o povo rodeou a cidade.", "Josué 6", "js", 6],
  ["a-ge-3", "geografia", "facil", "Em qual monte Deus entregou a Lei a Moisés?", ["Carmelo", "Sinai", "Nebo", "Sião"], 1, "A Lei foi entregue no monte Sinai.", "Êxodo 19", "ex", 19],
  ["a-ge-4", "geografia", "medio", "Qual cidade foi destruída junto com Gomorra?", ["Sodoma", "Nínive", "Babilônia", "Tiro"], 0, "Sodoma e Gomorra foram destruídas por causa da grande maldade.", "Gênesis 19", "gn", 19],
  ["a-ge-5", "geografia", "medio", "Em qual monte Elias enfrentou os profetas de Baal?", ["Sinai", "Carmelo", "Horebe", "Tabor"], 1, "No monte Carmelo, o fogo do Senhor caiu e consumiu o holocausto.", "1 Reis 18", "1rs", 18],
  ["a-ge-6", "geografia", "medio", "Em qual mar Jesus acalmou a tempestade?", ["Mar Morto", "Mar da Galileia", "Mar Vermelho", "Mar Egeu"], 1, "Jesus repreendeu o vento e o mar da Galileia se aquietou.", "Marcos 4", "mc", 4],
  ["a-ge-7", "geografia", "dificil", "Em qual ilha João recebeu a revelação do Apocalipse?", ["Creta", "Patmos", "Chipre", "Malta"], 1, "João estava na ilha de Patmos por causa da Palavra de Deus.", "Apocalipse 1", "ap", 1],
  ["a-ge-8", "geografia", "dificil", "Em qual cidade os discípulos foram chamados cristãos pela primeira vez?", ["Jerusalém", "Antioquia", "Éfeso", "Roma"], 1, "Foi em Antioquia que os discípulos receberam o nome de cristãos.", "Atos 11", "atos", 11],

  // -------- Livros --------
  ["a-li-1", "livros", "facil", "Qual livro registra a criação do mundo?", ["Êxodo", "Gênesis", "Jó", "Salmos"], 1, "Gênesis narra a criação de todas as coisas por Deus.", "Gênesis 1", "gn", 1],
  ["a-li-2", "livros", "facil", "Qual livro está entre os Evangelhos e as cartas?", ["Romanos", "Atos", "Hebreus", "Tiago"], 1, "Atos liga a vida de Jesus à história da igreja.", "Atos 1", "atos", 1],
  ["a-li-3", "livros", "facil", "Qual livro reúne provérbios de sabedoria?", ["Eclesiastes", "Provérbios", "Jó", "Cantares"], 1, "Provérbios reúne ditos sábios, em grande parte de Salomão.", "Provérbios 1", "pv", 1],
  ["a-li-4", "livros", "medio", "Qual livro do Antigo Testamento não menciona o nome de Deus?", ["Rute", "Ester", "Cantares", "Eclesiastes"], 1, "Ester não cita o nome de Deus, embora Sua providência esteja em toda a narrativa.", "Ester 1", "et", 1],
  ["a-li-5", "livros", "medio", "Quantas cartas são tradicionalmente atribuídas a Paulo?", ["9", "11", "13", "15"], 2, "Treze cartas do Novo Testamento trazem o nome de Paulo como autor."],
  ["a-li-6", "livros", "medio", "Qual livro vem imediatamente depois de Gênesis?", ["Levítico", "Êxodo", "Números", "Josué"], 1, "Êxodo é o segundo livro do Pentateuco.", "Êxodo 1", "ex", 1],
  ["a-li-7", "livros", "dificil", "Quantos livros formam o Pentateuco?", ["4", "5", "6", "7"], 1, "Gênesis, Êxodo, Levítico, Números e Deuteronômio formam o Pentateuco."],
  ["a-li-8", "livros", "dificil", "Qual destes é um dos livros mais curtos do Novo Testamento?", ["Tiago", "3 João", "Colossenses", "Tito"], 1, "3 João é uma das cartas mais breves das Escrituras.", "3 João 1", "3jo", 1],

  // -------- Avançado --------
  ["a-av-1", "avancado", "medio", "Quem escreveu o livro de Atos?", ["Marcos", "Lucas", "Paulo", "Barnabé"], 1, "Lucas, o médico amado, escreveu o Evangelho de Lucas e Atos.", "Lucas 1", "lc", 1],
  ["a-av-2", "avancado", "medio", "Quantas pessoas se salvaram dentro da arca?", ["4", "6", "8", "12"], 2, "Oito pessoas foram salvas por meio das águas: Noé, sua esposa, os três filhos e as noras.", "1 Pedro 3", "1pe", 3],
  ["a-av-3", "avancado", "dificil", "Qual era o nome dado a Daniel na Babilônia?", ["Beltessazar", "Sadraque", "Mesaque", "Abednego"], 0, "Daniel recebeu o nome babilônico de Beltessazar.", "Daniel 1", "dn", 1],
  ["a-av-4", "avancado", "dificil", "Qual rei viu a escrita na parede durante um banquete?", ["Nabucodonosor", "Belsazar", "Dario", "Ciro"], 1, "Belsazar viu a mão que escrevia na parede e Daniel interpretou.", "Daniel 5", "dn", 5],
  ["a-av-5", "avancado", "dificil", "Quem foi o servo de Eliseu castigado com lepra?", ["Geazi", "Naamã", "Baruque", "Onésimo"], 0, "Geazi cobiçou os presentes de Naamã e foi ferido de lepra.", "2 Reis 5", "2rs", 5],
  ["a-av-6", "avancado", "dificil", "Quantos anos viveu Matusalém?", ["777", "895", "930", "969"], 3, "Matusalém viveu 969 anos, o maior tempo registrado na Bíblia.", "Gênesis 5", "gn", 5],
  ["a-av-7", "avancado", "medio", "Quem reconstruiu os muros de Jerusalém depois do exílio?", ["Esdras", "Neemias", "Zorobabel", "Ageu"], 1, "Neemias liderou a reconstrução dos muros de Jerusalém.", "Neemias 2", "ne", 2],
  ["a-av-8", "avancado", "dificil", "Qual profeta menor tem apenas um capítulo?", ["Obadias", "Joel", "Naum", "Ageu"], 0, "Obadias é o livro mais curto do Antigo Testamento, com um único capítulo.", "Obadias 1", "ob", 1],
];

const KIDS: Raw[] = [
  // -------- Histórias --------
  ["k-hi-1", "historias", "facil", "Quem obedeceu a Deus e construiu a arca?", ["Moisés", "Noé", "Davi", "Josué"], 1, "Noé obedeceu a Deus e construiu a arca para salvar sua família e os animais.", "Gênesis 6", "gn", 6],
  ["k-hi-2", "historias", "facil", "Em quantos dias Deus criou o mundo?", ["3", "5", "6", "10"], 2, "Deus criou tudo em seis dias e descansou no sétimo.", "Gênesis 1", "gn", 1],
  ["k-hi-3", "historias", "facil", "O que Deus fez para o povo atravessar o mar?", ["Fez uma ponte", "Abriu o mar", "Enviou barcos", "Secou a chuva"], 1, "Deus abriu o Mar Vermelho e o povo passou em terra seca.", "Êxodo 14", "ex", 14],
  ["k-hi-4", "historias", "facil", "O que Deus fez quando Daniel foi colocado com os leões?", ["Fechou a boca dos leões", "Mandou chuva", "Tirou os leões", "Fez Daniel dormir"], 0, "Deus enviou um anjo que fechou a boca dos leões.", "Daniel 6", "dn", 6],
  ["k-hi-5", "historias", "medio", "Com o que Davi venceu o gigante Golias?", ["Uma espada", "Uma funda e uma pedra", "Um arco", "Um escudo"], 1, "Davi confiou em Deus e venceu com uma funda e uma pedra.", "1 Samuel 17", "1sm", 17],
  ["k-hi-6", "historias", "medio", "O que aconteceu com Jonas quando fugiu de Deus?", ["Ficou perdido", "Foi engolido por um grande peixe", "Voltou para casa", "Foi para o Egito"], 1, "Um grande peixe engoliu Jonas, e lá dentro ele orou a Deus.", "Jonas 1", "jn", 1],

  // -------- Personagens --------
  ["k-pe-1", "personagens-kids", "facil", "Quem era o menino que enfrentou o gigante?", ["Davi", "Samuel", "Josué", "Isaque"], 0, "Davi era jovem, mas confiou em Deus e venceu Golias.", "1 Samuel 17", "1sm", 17],
  ["k-pe-2", "personagens-kids", "facil", "Quem era a mãe de Jesus?", ["Marta", "Maria", "Ana", "Isabel"], 1, "Maria foi escolhida por Deus para ser a mãe de Jesus.", "Lucas 1", "lc", 1],
  ["k-pe-3", "personagens-kids", "facil", "Quem era muito forte e serviu a Deus como juiz?", ["Sansão", "Gideão", "Baraque", "Eúde"], 0, "A força de Sansão vinha de Deus.", "Juízes 13", "jz", 13],
  ["k-pe-4", "personagens-kids", "facil", "Qual bebê foi encontrado numa cestinha no rio?", ["Moisés", "Samuel", "Isaque", "João"], 0, "Moisés foi colocado numa cesta e encontrado pela filha de Faraó.", "Êxodo 2", "ex", 2],
  ["k-pe-5", "personagens-kids", "medio", "Quem era o grande amigo de Davi?", ["Jônatas", "Saul", "Absalão", "Joabe"], 0, "Jônatas amava Davi como a si mesmo.", "1 Samuel 18", "1sm", 18],
  ["k-pe-6", "personagens-kids", "medio", "Quem escutou a voz de Deus quando era criança?", ["Samuel", "Josias", "Elias", "Timóteo"], 0, "Deus chamou Samuel ainda menino, e ele respondeu: fala, Senhor.", "1 Samuel 3", "1sm", 3],

  // -------- Animais --------
  ["k-an-1", "animais", "facil", "Qual animal engoliu Jonas?", ["Um grande peixe", "Um crocodilo", "Uma baleia branca", "Um tubarão"], 0, "A Bíblia diz que Deus preparou um grande peixe para engolir Jonas.", "Jonas 1", "jn", 1],
  ["k-an-2", "animais", "facil", "Quais animais estavam na cova com Daniel?", ["Ursos", "Leões", "Lobos", "Cobras"], 1, "Daniel foi lançado na cova dos leões e Deus o protegeu.", "Daniel 6", "dn", 6],
  ["k-an-3", "animais", "facil", "Qual ave voltou para a arca com uma folha de oliveira?", ["Corvo", "Pomba", "Águia", "Andorinha"], 1, "A pomba voltou com uma folha de oliveira, sinal de que as águas baixavam.", "Gênesis 8", "gn", 8],
  ["k-an-4", "animais", "medio", "Em qual animal Jesus entrou em Jerusalém?", ["Cavalo", "Camelo", "Jumentinho", "Boi"], 2, "Jesus entrou em Jerusalém montado num jumentinho.", "Mateus 21", "mt", 21],
  ["k-an-5", "animais", "medio", "Quais aves levaram comida para Elias?", ["Corvos", "Pombas", "Gaivotas", "Águias"], 0, "Deus mandou corvos levarem pão e carne para Elias.", "1 Reis 17", "1rs", 17],
  ["k-an-6", "animais", "medio", "Qual animal falou com Balaão?", ["Um cordeiro", "Uma jumenta", "Um camelo", "Um cão"], 1, "Deus fez a jumenta falar para avisar Balaão.", "Números 22", "nm", 22],

  // -------- Aventuras --------
  ["k-av-1", "aventuras", "facil", "O que aconteceu com as muralhas de Jericó?", ["Foram pintadas", "Caíram", "Ficaram mais altas", "Sumiram no mar"], 1, "Depois que o povo obedeceu a Deus, as muralhas de Jericó caíram.", "Josué 6", "js", 6],
  ["k-av-2", "aventuras", "facil", "O que Jesus fez quando veio a tempestade no mar?", ["Acalmou a tempestade", "Nadou até a praia", "Chamou outro barco", "Dormiu a viagem toda"], 0, "Jesus repreendeu o vento e tudo ficou calmo.", "Marcos 4", "mc", 4],
  ["k-av-3", "aventuras", "facil", "Sobre o que Pedro andou ao ver Jesus?", ["Sobre a areia", "Sobre a água", "Sobre pedras", "Sobre um barco"], 1, "Pedro andou sobre as águas olhando para Jesus.", "Mateus 14", "mt", 14],
  ["k-av-4", "aventuras", "facil", "Que alimento Deus mandou do céu no deserto?", ["Maná", "Pão de mel", "Peixe", "Uvas"], 0, "Deus alimentou o povo com o maná todos os dias.", "Êxodo 16", "ex", 16],
  ["k-av-5", "aventuras", "medio", "Como Deus falou com Moisés no deserto?", ["Numa nuvem de chuva", "Numa sarça que ardia", "Num sonho", "Numa carta"], 1, "Deus falou com Moisés numa sarça que ardia sem se consumir.", "Êxodo 3", "ex", 3],
  ["k-av-6", "aventuras", "medio", "Como Elias foi levado ao céu?", ["Num carro de fogo", "Numa nuvem", "Num barco", "Numa montanha"], 0, "Elias subiu ao céu num redemoinho, com um carro de fogo.", "2 Reis 2", "2rs", 2],

  // -------- Reis e heróis --------
  ["k-rh-1", "reis-herois", "facil", "Quem foi o primeiro rei de Israel?", ["Davi", "Saul", "Salomão", "Josué"], 1, "Saul foi o primeiro rei de Israel.", "1 Samuel 10", "1sm", 10],
  ["k-rh-2", "reis-herois", "facil", "Qual rei pediu sabedoria a Deus?", ["Davi", "Salomão", "Ezequias", "Josias"], 1, "Salomão pediu sabedoria para governar bem o povo.", "1 Reis 3", "1rs", 3],
  ["k-rh-3", "reis-herois", "facil", "Qual rei tocava harpa e escreveu salmos?", ["Davi", "Saul", "Acabe", "Joás"], 0, "Davi tocava harpa e escreveu muitos salmos.", "1 Samuel 16", "1sm", 16],
  ["k-rh-4", "reis-herois", "medio", "Quem venceu uma batalha com apenas 300 homens?", ["Gideão", "Sansão", "Baraque", "Jefté"], 0, "Gideão venceu com 300 homens porque Deus estava com ele.", "Juízes 7", "jz", 7],
  ["k-rh-5", "reis-herois", "medio", "Qual rainha foi corajosa para salvar seu povo?", ["Ester", "Jezabel", "Mical", "Atalia"], 0, "Ester teve coragem de falar com o rei para salvar seu povo.", "Ester 4", "et", 4],
  ["k-rh-6", "reis-herois", "medio", "Quem liderou o povo para entrar na Terra Prometida?", ["Josué", "Arão", "Calebe", "Samuel"], 0, "Josué conduziu Israel para dentro da Terra Prometida.", "Josué 1", "js", 1],

  // -------- Jesus --------
  ["k-je-1", "jesus-kids", "facil", "Onde Jesus nasceu?", ["Belém", "Nazaré", "Jericó", "Roma"], 0, "Jesus nasceu em Belém, numa manjedoura.", "Lucas 2", "lc", 2],
  ["k-je-2", "jesus-kids", "facil", "Quantos discípulos Jesus escolheu?", ["5", "7", "12", "20"], 2, "Jesus escolheu doze discípulos para andarem com Ele.", "Marcos 3", "mc", 3],
  ["k-je-3", "jesus-kids", "facil", "Com o que Jesus alimentou uma multidão?", ["5 pães e 2 peixes", "10 pães", "Maná", "Frutas"], 0, "Jesus abençoou cinco pães e dois peixes e alimentou milhares.", "João 6", "jo", 6],
  ["k-je-4", "jesus-kids", "facil", "O que Jesus fez com as crianças que vieram até Ele?", ["Mandou embora", "Abençoou", "Pediu silêncio", "Não viu"], 1, "Jesus recebeu as crianças e as abençoou.", "Marcos 10", "mc", 10],
  ["k-je-5", "jesus-kids", "medio", "Qual foi o primeiro milagre de Jesus?", ["Curou um cego", "Transformou água em vinho", "Andou sobre as águas", "Acalmou o mar"], 1, "Em Caná, Jesus transformou água em vinho.", "João 2", "jo", 2],
  ["k-je-6", "jesus-kids", "medio", "Em qual dia Jesus ressuscitou?", ["No mesmo dia", "No segundo dia", "No terceiro dia", "Depois de um mês"], 2, "Jesus ressuscitou ao terceiro dia, como havia dito.", "Lucas 24", "lc", 24],

  // -------- Oração --------
  ["k-or-1", "oracao", "facil", "O que significa orar?", ["Conversar com Deus", "Cantar alto", "Escrever cartas", "Dormir cedo"], 0, "Orar é conversar com Deus, contando a Ele o que sentimos."],
  ["k-or-2", "oracao", "facil", "Quem ensinou a oração do Pai Nosso?", ["Jesus", "Pedro", "Moisés", "Davi"], 0, "Jesus ensinou os discípulos a orar dizendo: Pai nosso que estás nos céus.", "Mateus 6", "mt", 6],
  ["k-or-3", "oracao", "facil", "Onde Jesus orou na noite antes de ser preso?", ["No Getsêmani", "No templo", "No deserto", "Em Belém"], 0, "Jesus orou no jardim do Getsêmani.", "Mateus 26", "mt", 26],
  ["k-or-4", "oracao", "medio", "Quantas vezes por dia Daniel orava?", ["Uma", "Duas", "Três", "Sete"], 2, "Daniel orava três vezes por dia, mesmo com a lei do rei.", "Daniel 6", "dn", 6],
  ["k-or-5", "oracao", "medio", "O que Salomão pediu a Deus em oração?", ["Riqueza", "Sabedoria", "Vida longa", "Muitos exércitos"], 1, "Salomão pediu sabedoria e Deus se agradou do pedido.", "1 Reis 3", "1rs", 3],
  ["k-or-6", "oracao", "medio", "Quem orou de dentro do grande peixe?", ["Jonas", "Noé", "Elias", "Paulo"], 0, "Jonas orou a Deus de dentro do peixe e foi ouvido.", "Jonas 2", "jn", 2],

  // -------- Amor e bondade --------
  ["k-am-1", "amor", "facil", "Quem ajudou o homem ferido na estrada?", ["Um sacerdote", "Um levita", "Um bom samaritano", "Um soldado"], 2, "Jesus contou que o samaritano teve compaixão e cuidou do ferido.", "Lucas 10", "lc", 10],
  ["k-am-2", "amor", "facil", "Segundo Jesus, quem devemos amar além de Deus?", ["O próximo", "Só a família", "Só os amigos", "Somente os mestres"], 0, "Jesus ensinou a amar a Deus e ao próximo como a si mesmo.", "Marcos 12", "mc", 12],
  ["k-am-3", "amor", "facil", "Como o pai recebeu o filho que voltou para casa?", ["Com uma festa", "Com castigo", "Sem falar", "Mandando embora"], 0, "O pai correu, abraçou o filho e preparou uma festa.", "Lucas 15", "lc", 15],
  ["k-am-4", "amor", "medio", "Em qual versículo lemos que Deus amou o mundo e deu Seu Filho?", ["João 3:16", "Salmo 23:1", "Gênesis 1:1", "Mateus 5:9"], 0, "João 3:16 fala do amor de Deus ao dar Seu Filho.", "João 3", "jo", 3],
  ["k-am-5", "amor", "medio", "O que Jesus ensinou sobre perdoar?", ["Perdoar sempre", "Perdoar uma vez", "Nunca perdoar", "Perdoar só amigos"], 0, "Jesus ensinou a perdoar de coração, muitas e muitas vezes.", "Mateus 18", "mt", 18],
  ["k-am-6", "amor", "medio", "Qual fruto do Espírito vem primeiro na lista de Gálatas?", ["Amor", "Paz", "Bondade", "Fé"], 0, "O fruto do Espírito começa com o amor.", "Gálatas 5", "gl", 5],

  // -------- Conhecendo a Bíblia --------
  ["k-co-1", "conhecendo", "facil", "Quantos livros tem a Bíblia?", ["50", "66", "72", "100"], 1, "A Bíblia tem 66 livros ao todo."],
  ["k-co-2", "conhecendo", "facil", "Qual é o primeiro livro da Bíblia?", ["Gênesis", "Êxodo", "Salmos", "Mateus"], 0, "Gênesis é o primeiro livro e fala da criação.", "Gênesis 1", "gn", 1],
  ["k-co-3", "conhecendo", "facil", "Qual é o último livro da Bíblia?", ["Atos", "Apocalipse", "Judas", "João"], 1, "Apocalipse é o último livro da Bíblia.", "Apocalipse 1", "ap", 1],
  ["k-co-4", "conhecendo", "facil", "Em quantas partes a Bíblia é dividida?", ["Duas", "Três", "Quatro", "Cinco"], 0, "A Bíblia tem duas partes: Antigo e Novo Testamento."],
  ["k-co-5", "conhecendo", "medio", "Quantos Evangelhos falam da vida de Jesus?", ["2", "3", "4", "6"], 2, "Mateus, Marcos, Lucas e João contam a vida de Jesus."],
  ["k-co-6", "conhecendo", "medio", "Quem inspirou os autores da Bíblia?", ["Deus", "Os reis", "Os profetas sozinhos", "Os escribas"], 0, "Toda a Escritura é inspirada por Deus.", "2 Timóteo 3", "2tm", 3],
];

export const QUESTION_BANK: BankQuestion[] = [...build("adultos", ADULTOS), ...build("kids", KIDS)];

export function activeQuestions(): BankQuestion[] {
  return QUESTION_BANK.filter((q) => q.active);
}

export function questionsFor(audience: QuizAudience, category: string, difficulty?: QuizDifficulty) {
  return activeQuestions().filter(
    (q) => q.audience === audience && q.category === category && (!difficulty || q.difficulty === difficulty),
  );
}

export function questionById(id: string): BankQuestion | undefined {
  return QUESTION_BANK.find((q) => q.id === id);
}