export interface BibleBook {
  id: string;
  name: string;
  abbr: string;
  testament: "old" | "new";
  chapters: number;
}

export const bibleBooks: BibleBook[] = [
  // Antigo Testamento
  { id: "genesis", name: "Gênesis", abbr: "Gn", testament: "old", chapters: 50 },
  { id: "exodo", name: "Êxodo", abbr: "Êx", testament: "old", chapters: 40 },
  { id: "levitico", name: "Levítico", abbr: "Lv", testament: "old", chapters: 27 },
  { id: "numeros", name: "Números", abbr: "Nm", testament: "old", chapters: 36 },
  { id: "deuteronomio", name: "Deuteronômio", abbr: "Dt", testament: "old", chapters: 34 },
  { id: "josue", name: "Josué", abbr: "Js", testament: "old", chapters: 24 },
  { id: "juizes", name: "Juízes", abbr: "Jz", testament: "old", chapters: 21 },
  { id: "rute", name: "Rute", abbr: "Rt", testament: "old", chapters: 4 },
  { id: "1samuel", name: "1 Samuel", abbr: "1Sm", testament: "old", chapters: 31 },
  { id: "2samuel", name: "2 Samuel", abbr: "2Sm", testament: "old", chapters: 24 },
  { id: "1reis", name: "1 Reis", abbr: "1Rs", testament: "old", chapters: 22 },
  { id: "2reis", name: "2 Reis", abbr: "2Rs", testament: "old", chapters: 25 },
  { id: "1cronicas", name: "1 Crônicas", abbr: "1Cr", testament: "old", chapters: 29 },
  { id: "2cronicas", name: "2 Crônicas", abbr: "2Cr", testament: "old", chapters: 36 },
  { id: "esdras", name: "Esdras", abbr: "Ed", testament: "old", chapters: 10 },
  { id: "neemias", name: "Neemias", abbr: "Ne", testament: "old", chapters: 13 },
  { id: "ester", name: "Ester", abbr: "Et", testament: "old", chapters: 10 },
  { id: "jo", name: "Jó", abbr: "Jó", testament: "old", chapters: 42 },
  { id: "salmos", name: "Salmos", abbr: "Sl", testament: "old", chapters: 150 },
  { id: "proverbios", name: "Provérbios", abbr: "Pv", testament: "old", chapters: 31 },
  { id: "eclesiastes", name: "Eclesiastes", abbr: "Ec", testament: "old", chapters: 12 },
  { id: "cantares", name: "Cantares", abbr: "Ct", testament: "old", chapters: 8 },
  { id: "isaias", name: "Isaías", abbr: "Is", testament: "old", chapters: 66 },
  { id: "jeremias", name: "Jeremias", abbr: "Jr", testament: "old", chapters: 52 },
  { id: "lamentacoes", name: "Lamentações", abbr: "Lm", testament: "old", chapters: 5 },
  { id: "ezequiel", name: "Ezequiel", abbr: "Ez", testament: "old", chapters: 48 },
  { id: "daniel", name: "Daniel", abbr: "Dn", testament: "old", chapters: 12 },
  { id: "oseias", name: "Oséias", abbr: "Os", testament: "old", chapters: 14 },
  { id: "joel", name: "Joel", abbr: "Jl", testament: "old", chapters: 3 },
  { id: "amos", name: "Amós", abbr: "Am", testament: "old", chapters: 9 },
  { id: "obadias", name: "Obadias", abbr: "Ob", testament: "old", chapters: 1 },
  { id: "jonas", name: "Jonas", abbr: "Jn", testament: "old", chapters: 4 },
  { id: "miqueias", name: "Miquéias", abbr: "Mq", testament: "old", chapters: 7 },
  { id: "naum", name: "Naum", abbr: "Na", testament: "old", chapters: 3 },
  { id: "habacuque", name: "Habacuque", abbr: "Hc", testament: "old", chapters: 3 },
  { id: "sofonias", name: "Sofonias", abbr: "Sf", testament: "old", chapters: 3 },
  { id: "ageu", name: "Ageu", abbr: "Ag", testament: "old", chapters: 2 },
  { id: "zacarias", name: "Zacarias", abbr: "Zc", testament: "old", chapters: 14 },
  { id: "malaquias", name: "Malaquias", abbr: "Ml", testament: "old", chapters: 4 },
  // Novo Testamento
  { id: "mateus", name: "Mateus", abbr: "Mt", testament: "new", chapters: 28 },
  { id: "marcos", name: "Marcos", abbr: "Mc", testament: "new", chapters: 16 },
  { id: "lucas", name: "Lucas", abbr: "Lc", testament: "new", chapters: 24 },
  { id: "joao", name: "João", abbr: "Jo", testament: "new", chapters: 21 },
  { id: "atos", name: "Atos", abbr: "At", testament: "new", chapters: 28 },
  { id: "romanos", name: "Romanos", abbr: "Rm", testament: "new", chapters: 16 },
  { id: "1corintios", name: "1 Coríntios", abbr: "1Co", testament: "new", chapters: 16 },
  { id: "2corintios", name: "2 Coríntios", abbr: "2Co", testament: "new", chapters: 13 },
  { id: "galatas", name: "Gálatas", abbr: "Gl", testament: "new", chapters: 6 },
  { id: "efesios", name: "Efésios", abbr: "Ef", testament: "new", chapters: 6 },
  { id: "filipenses", name: "Filipenses", abbr: "Fp", testament: "new", chapters: 4 },
  { id: "colossenses", name: "Colossenses", abbr: "Cl", testament: "new", chapters: 4 },
  { id: "1tessalonicenses", name: "1 Tessalonicenses", abbr: "1Ts", testament: "new", chapters: 5 },
  { id: "2tessalonicenses", name: "2 Tessalonicenses", abbr: "2Ts", testament: "new", chapters: 3 },
  { id: "1timoteo", name: "1 Timóteo", abbr: "1Tm", testament: "new", chapters: 6 },
  { id: "2timoteo", name: "2 Timóteo", abbr: "2Tm", testament: "new", chapters: 4 },
  { id: "tito", name: "Tito", abbr: "Tt", testament: "new", chapters: 3 },
  { id: "filemom", name: "Filemom", abbr: "Fm", testament: "new", chapters: 1 },
  { id: "hebreus", name: "Hebreus", abbr: "Hb", testament: "new", chapters: 13 },
  { id: "tiago", name: "Tiago", abbr: "Tg", testament: "new", chapters: 5 },
  { id: "1pedro", name: "1 Pedro", abbr: "1Pe", testament: "new", chapters: 5 },
  { id: "2pedro", name: "2 Pedro", abbr: "2Pe", testament: "new", chapters: 3 },
  { id: "1joao", name: "1 João", abbr: "1Jo", testament: "new", chapters: 5 },
  { id: "2joao", name: "2 João", abbr: "2Jo", testament: "new", chapters: 1 },
  { id: "3joao", name: "3 João", abbr: "3Jo", testament: "new", chapters: 1 },
  { id: "judas", name: "Judas", abbr: "Jd", testament: "new", chapters: 1 },
  { id: "apocalipse", name: "Apocalipse", abbr: "Ap", testament: "new", chapters: 22 },
];

export interface Verse {
  verse: number;
  text: string;
}

export interface Chapter {
  book: string;
  chapter: number;
  verses: Verse[];
}

// Sample chapters - Almeida Revista e Corrigida (ARC)
export const sampleChapters: Record<string, Chapter[]> = {
  genesis: [
    {
      book: "genesis",
      chapter: 1,
      verses: [
        { verse: 1, text: "No princípio criou Deus os céus e a terra." },
        { verse: 2, text: "E a terra era sem forma e vazia; e havia trevas sobre a face do abismo; e o Espírito de Deus se movia sobre a face das águas." },
        { verse: 3, text: "E disse Deus: Haja luz; e houve luz." },
        { verse: 4, text: "E viu Deus que era boa a luz; e fez Deus separação entre a luz e as trevas." },
        { verse: 5, text: "E Deus chamou à luz Dia; e às trevas chamou Noite. E foi a tarde e a manhã, o dia primeiro." },
        { verse: 6, text: "E disse Deus: Haja uma expansão no meio das águas, e haja separação entre águas e águas." },
        { verse: 7, text: "E fez Deus a expansão, e fez separação entre as águas que estavam debaixo da expansão e as águas que estavam sobre a expansão; e assim foi." },
        { verse: 8, text: "E chamou Deus à expansão Céus; e foi a tarde e a manhã, o dia segundo." },
        { verse: 9, text: "E disse Deus: Ajuntem-se as águas debaixo dos céus num lugar; e apareça a porção seca; e assim foi." },
        { verse: 10, text: "E chamou Deus à porção seca Terra; e ao ajuntamento das águas chamou Mares; e viu Deus que era bom." },
        { verse: 11, text: "E disse Deus: Produza a terra erva verde, erva que dê semente, árvore frutífera que dê fruto segundo a sua espécie, cuja semente está nela sobre a terra; e assim foi." },
        { verse: 12, text: "E a terra produziu erva, erva dando semente conforme a sua espécie, e a árvore frutífera, cuja semente está nela conforme a sua espécie; e viu Deus que era bom." },
        { verse: 13, text: "E foi a tarde e a manhã, o dia terceiro." },
        { verse: 14, text: "E disse Deus: Haja luminares na expansão dos céus, para haver separação entre o dia e a noite; e sejam eles para sinais e para tempos determinados e para dias e anos." },
        { verse: 15, text: "E sejam para luminares na expansão dos céus, para iluminar a terra; e assim foi." },
        { verse: 16, text: "E fez Deus os dois grandes luminares: o luminar maior para governar o dia, e o luminar menor para governar a noite; e fez as estrelas." },
        { verse: 17, text: "E Deus os pôs na expansão dos céus para iluminar a terra," },
        { verse: 18, text: "E para governar o dia e a noite, e para fazer separação entre a luz e as trevas; e viu Deus que era bom." },
        { verse: 19, text: "E foi a tarde e a manhã, o dia quarto." },
        { verse: 20, text: "E disse Deus: Produzam as águas abundantemente répteis de alma vivente; e voem as aves sobre a face da expansão dos céus." },
        { verse: 21, text: "E Deus criou as grandes baleias, e todo o réptil de alma vivente que as águas abundantemente produziram conforme as suas espécies; e toda a ave de asas conforme a sua espécie; e viu Deus que era bom." },
        { verse: 22, text: "E Deus os abençoou, dizendo: Frutificai e multiplicai-vos, e enchei as águas nos mares; e as aves se multipliquem na terra." },
        { verse: 23, text: "E foi a tarde e a manhã, o dia quinto." },
        { verse: 24, text: "E disse Deus: Produza a terra alma vivente conforme a sua espécie; gado, e répteis e feras da terra conforme a sua espécie; e assim foi." },
        { verse: 25, text: "E fez Deus as feras da terra conforme a sua espécie, e o gado conforme a sua espécie, e todo o réptil da terra conforme a sua espécie; e viu Deus que era bom." },
        { verse: 26, text: "E disse Deus: Façamos o homem à nossa imagem, conforme a nossa semelhança; e domine sobre os peixes do mar, e sobre as aves dos céus, e sobre o gado, e sobre toda a terra, e sobre todo o réptil que se move sobre a terra." },
        { verse: 27, text: "E criou Deus o homem à sua imagem; à imagem de Deus o criou; homem e mulher os criou." },
        { verse: 28, text: "E Deus os abençoou, e Deus lhes disse: Frutificai e multiplicai-vos, e enchei a terra, e sujeitai-a; e dominai sobre os peixes do mar e sobre as aves dos céus, e sobre todo o animal que se move sobre a terra." },
        { verse: 29, text: "E disse Deus: Eis que vos tenho dado toda a erva que dá semente, que está sobre a face de toda a terra; e toda a árvore, em que há fruto que dá semente, ser-vos-á para mantimento." },
        { verse: 30, text: "E a todo o animal da terra, e a toda a ave dos céus, e a todo o réptil da terra, em que há alma vivente, toda a erva verde será para mantimento; e assim foi." },
        { verse: 31, text: "E viu Deus tudo quanto tinha feito, e eis que era muito bom; e foi a tarde e a manhã, o dia sexto." },
      ],
    },
  ],
  salmos: [
    {
      book: "salmos",
      chapter: 23,
      verses: [
        { verse: 1, text: "O Senhor é o meu pastor, nada me faltará." },
        { verse: 2, text: "Deitar-me faz em verdes pastos, guia-me mansamente a águas tranquilas." },
        { verse: 3, text: "Refrigera a minha alma; guia-me pelas veredas da justiça, por amor do seu nome." },
        { verse: 4, text: "Ainda que eu andasse pelo vale da sombra da morte, não temeria mal algum, porque tu estás comigo; a tua vara e o teu cajado me consolam." },
        { verse: 5, text: "Preparas uma mesa perante mim na presença dos meus inimigos, unges a minha cabeça com óleo, o meu cálice transborda." },
        { verse: 6, text: "Certamente que a bondade e a misericórdia me seguirão todos os dias da minha vida; e habitarei na casa do Senhor por longos dias." },
      ],
    },
    {
      book: "salmos",
      chapter: 91,
      verses: [
        { verse: 1, text: "Aquele que habita no esconderijo do Altíssimo, à sombra do Onipotente descansará." },
        { verse: 2, text: "Direi do Senhor: Ele é o meu Deus, o meu refúgio, a minha fortaleza, e nele confiarei." },
        { verse: 3, text: "Porque ele te livrará do laço do passarinheiro, e da peste perniciosa." },
        { verse: 4, text: "Ele te cobrirá com as suas penas, e debaixo das suas asas te confiarás; a sua verdade será o teu escudo e broquel." },
        { verse: 5, text: "Não terás medo do terror de noite nem da seta que voa de dia," },
        { verse: 6, text: "Nem da peste que anda na escuridão, nem da mortandade que assola ao meio-dia." },
        { verse: 7, text: "Mil cairão ao teu lado, e dez mil à tua direita, mas não chegará a ti." },
        { verse: 8, text: "Somente com os teus olhos contemplarás, e verás a recompensa dos ímpios." },
        { verse: 9, text: "Porque tu, ó Senhor, és o meu refúgio. No Altíssimo fizeste a tua habitação." },
        { verse: 10, text: "Nenhum mal te sucederá, nem praga alguma chegará à tua tenda." },
        { verse: 11, text: "Porque aos seus anjos dará ordem a teu respeito, para te guardarem em todos os teus caminhos." },
        { verse: 12, text: "Eles te sustentarão nas suas mãos, para que não tropeces com o teu pé em pedra." },
        { verse: 13, text: "Pisarás o leão e a cobra; calcarás aos pés o filho do leão e a serpente." },
        { verse: 14, text: "Porquanto tão encarecidamente me amou, também eu o livrarei; pô-lo-ei em retiro alto, porque conheceu o meu nome." },
        { verse: 15, text: "Ele me invocará, e eu lhe responderei; estarei com ele na angústia; dela o retirarei, e o glorificarei." },
        { verse: 16, text: "Fartá-lo-ei com longura de dias, e lhe mostrarei a minha salvação." },
      ],
    },
  ],
  joao: [
    {
      book: "joao",
      chapter: 3,
      verses: [
        { verse: 1, text: "E havia entre os fariseus um homem chamado Nicodemos, príncipe dos judeus." },
        { verse: 2, text: "Este foi ter de noite com Jesus, e disse-lhe: Rabi, bem sabemos que és Mestre, vindo de Deus; porque ninguém pode fazer estes sinais que tu fazes, se Deus não for com ele." },
        { verse: 3, text: "Jesus respondeu, e disse-lhe: Na verdade, na verdade te digo que aquele que não nascer de novo, não pode ver o reino de Deus." },
        { verse: 4, text: "Disse-lhe Nicodemos: Como pode um homem nascer, sendo velho? Pode, porventura, tornar a entrar no ventre de sua mãe, e nascer?" },
        { verse: 5, text: "Jesus respondeu: Na verdade, na verdade te digo que aquele que não nascer da água e do Espírito, não pode entrar no reino de Deus." },
        { verse: 6, text: "O que é nascido da carne é carne, e o que é nascido do Espírito é espírito." },
        { verse: 7, text: "Não te maravilhes de te ter dito: Necessário vos é nascer de novo." },
        { verse: 8, text: "O vento assopra onde quer, e ouves a sua voz, mas não sabes de onde vem, nem para onde vai; assim é todo aquele que é nascido do Espírito." },
        { verse: 9, text: "Nicodemos respondeu, e disse-lhe: Como pode ser isso?" },
        { verse: 10, text: "Jesus respondeu, e disse-lhe: Tu és mestre de Israel, e não sabes isto?" },
        { verse: 11, text: "Na verdade, na verdade te digo que nós dizemos o que sabemos, e testificamos o que vimos; e não aceitais o nosso testemunho." },
        { verse: 12, text: "Se vos falei de coisas terrestres, e não crestes, como crereis, se vos falar das celestiais?" },
        { verse: 13, text: "Ora, ninguém subiu ao céu, senão o que desceu do céu, o Filho do homem, que está no céu." },
        { verse: 14, text: "E, como Moisés levantou a serpente no deserto, assim importa que o Filho do homem seja levantado;" },
        { verse: 15, text: "Para que todo aquele que nele crê não pereça, mas tenha a vida eterna." },
        { verse: 16, text: "Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna." },
        { verse: 17, text: "Porque Deus enviou o seu Filho ao mundo, não para que condenasse o mundo, mas para que o mundo fosse salvo por ele." },
        { verse: 18, text: "Quem crê nele não é condenado; mas quem não crê já está condenado, porquanto não crê no nome do unigênito Filho de Deus." },
        { verse: 19, text: "E a condenação é esta: Que a luz veio ao mundo, e os homens amaram mais as trevas do que a luz, porque as suas obras eram más." },
        { verse: 20, text: "Porque todo aquele que faz o mal odeia a luz, e não vem para a luz, para que as suas obras não sejam reprovadas." },
        { verse: 21, text: "Mas quem pratica a verdade vem para a luz, a fim de que as suas obras sejam manifestas, porque são feitas em Deus." },
      ],
    },
  ],
  mateus: [
    {
      book: "mateus",
      chapter: 5,
      verses: [
        { verse: 1, text: "E Jesus, vendo a multidão, subiu a um monte, e, assentando-se, aproximaram-se dele os seus discípulos;" },
        { verse: 2, text: "E, abrindo a sua boca, os ensinava, dizendo:" },
        { verse: 3, text: "Bem-aventurados os pobres de espírito, porque deles é o reino dos céus;" },
        { verse: 4, text: "Bem-aventurados os que choram, porque eles serão consolados;" },
        { verse: 5, text: "Bem-aventurados os mansos, porque eles herdarão a terra;" },
        { verse: 6, text: "Bem-aventurados os que têm fome e sede de justiça, porque eles serão fartos;" },
        { verse: 7, text: "Bem-aventurados os misericordiosos, porque eles alcançarão misericórdia;" },
        { verse: 8, text: "Bem-aventurados os limpos de coração, porque eles verão a Deus;" },
        { verse: 9, text: "Bem-aventurados os pacificadores, porque eles serão chamados filhos de Deus;" },
        { verse: 10, text: "Bem-aventurados os que sofrem perseguição por causa da justiça, porque deles é o reino dos céus;" },
        { verse: 11, text: "Bem-aventurados sois vós, quando vos injuriarem e perseguirem e, mentindo, disserem todo o mal contra vós por minha causa." },
        { verse: 12, text: "Exultai e alegrai-vos, porque é grande o vosso galardão nos céus; porque assim perseguiram os profetas que foram antes de vós." },
        { verse: 13, text: "Vós sois o sal da terra; e se o sal for insípido, com que se há de salgar? Para nada mais presta senão para se lançar fora, e ser pisado pelos homens." },
        { verse: 14, text: "Vós sois a luz do mundo; não se pode esconder uma cidade edificada sobre um monte;" },
        { verse: 15, text: "Nem se acende a candeia e se coloca debaixo do alqueire, mas no velador, e dá luz a todos que estão na casa." },
        { verse: 16, text: "Assim resplandeça a vossa luz diante dos homens, para que vejam as vossas boas obras e glorifiquem a vosso Pai, que está nos céus." },
      ],
    },
  ],
  proverbios: [
    {
      book: "proverbios",
      chapter: 3,
      verses: [
        { verse: 1, text: "Filho meu, não te esqueças da minha lei, e o teu coração guarde os meus mandamentos." },
        { verse: 2, text: "Porque eles aumentarão os teus dias e te acrescentarão anos de vida e paz." },
        { verse: 3, text: "Não te desamparem a benignidade e a fidelidade; ata-as ao teu pescoço; escreve-as na tábua do teu coração." },
        { verse: 4, text: "E acharás graça e bom entendimento aos olhos de Deus e dos homens." },
        { verse: 5, text: "Confia no Senhor de todo o teu coração, e não te estribes no teu próprio entendimento." },
        { verse: 6, text: "Reconhece-o em todos os teus caminhos, e ele endireitará as tuas veredas." },
        { verse: 7, text: "Não sejas sábio a teus próprios olhos; teme ao Senhor e aparta-te do mal." },
        { verse: 8, text: "Isto será saúde para o teu umbigo, e medula para os teus ossos." },
        { verse: 9, text: "Honra ao Senhor com os teus bens, e com a primeira parte de todos os teus ganhos;" },
        { verse: 10, text: "E se encherão os teus celeiros, e transbordarão de vinho os teus lagares." },
      ],
    },
  ],
  filipenses: [
    {
      book: "filipenses",
      chapter: 4,
      verses: [
        { verse: 1, text: "Portanto, meus amados e mui queridos irmãos, minha alegria e coroa, estai assim firmes no Senhor, amados." },
        { verse: 4, text: "Regozijai-vos sempre no Senhor; outra vez digo, regozijai-vos." },
        { verse: 5, text: "Seja a vossa equidade notória a todos os homens. Perto está o Senhor." },
        { verse: 6, text: "Não estejais inquietos por coisa alguma; antes as vossas petições sejam em tudo conhecidas diante de Deus pela oração e súplica, com ação de graças." },
        { verse: 7, text: "E a paz de Deus, que excede todo o entendimento, guardará os vossos corações e os vossos sentimentos em Cristo Jesus." },
        { verse: 8, text: "Quanto ao mais, irmãos, tudo o que é verdadeiro, tudo o que é honesto, tudo o que é justo, tudo o que é puro, tudo o que é amável, tudo o que é de boa fama, se há alguma virtude, e se há algum louvor, nisso pensai." },
        { verse: 13, text: "Posso todas as coisas naquele que me fortalece." },
        { verse: 19, text: "O meu Deus, segundo as suas riquezas, suprirá todas as vossas necessidades em glória, por Cristo Jesus." },
      ],
    },
  ],
};

export function getChapter(bookId: string, chapter: number): Chapter | null {
  const bookChapters = sampleChapters[bookId];
  if (!bookChapters) return null;
  return bookChapters.find((c) => c.chapter === chapter) || null;
}

export function getBook(bookId: string): BibleBook | undefined {
  return bibleBooks.find((b) => b.id === bookId);
}

export function searchVerses(query: string): { book: string; chapter: number; verse: number; text: string }[] {
  const results: { book: string; chapter: number; verse: number; text: string }[] = [];
  const q = query.toLowerCase();
  Object.entries(sampleChapters).forEach(([bookId, chapters]) => {
    chapters.forEach((ch) => {
      ch.verses.forEach((v) => {
        if (v.text.toLowerCase().includes(q)) {
          results.push({ book: bookId, chapter: ch.chapter, verse: v.verse, text: v.text });
        }
      });
    });
  });
  return results;
}