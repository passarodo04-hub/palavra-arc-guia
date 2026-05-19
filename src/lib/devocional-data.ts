export const devocionais = [
  { verse: "João 3:16", text: "Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna.", reflection: "O amor de Deus por nós é incomparável. Hoje, lembre-se: você é amado com um amor eterno, que se entregou por completo na cruz. Caminhe neste amor.", reading: "João 3" },
  { verse: "Salmos 23:1", text: "O Senhor é o meu pastor, nada me faltará.", reflection: "Em meio às incertezas da vida, descanse na certeza de que há um Pastor que conhece cada uma de suas necessidades. Confie. Ele cuida de você.", reading: "Salmos 23" },
  { verse: "Filipenses 4:13", text: "Posso todas as coisas naquele que me fortalece.", reflection: "Sua força não vem das circunstâncias, mas de Cristo. Hoje, encare seus desafios sabendo que Ele está com você, dando-lhe poder para vencer.", reading: "Filipenses 4" },
  { verse: "Provérbios 3:5-6", text: "Confia no Senhor de todo o teu coração, e não te estribes no teu próprio entendimento. Reconhece-o em todos os teus caminhos, e ele endireitará as tuas veredas.", reflection: "Entregue ao Senhor o que você não compreende. Quando colocamos Deus em primeiro lugar, Ele dirige os nossos passos com sabedoria divina.", reading: "Provérbios 3" },
  { verse: "Mateus 11:28", text: "Vinde a mim, todos os que estais cansados e oprimidos, e eu vos aliviarei.", reflection: "Hoje, deixe seus fardos aos pés de Jesus. Há descanso verdadeiro Naquele que se entregou para te dar alívio.", reading: "Mateus 11" },
  { verse: "Isaías 41:10", text: "Não temas, porque eu sou contigo; não te assombres, porque eu sou teu Deus; eu te esforço, e te ajudo, e te sustento com a destra da minha justiça.", reflection: "O medo não tem a última palavra. Deus está ao seu lado, te fortalecendo e te sustentando em cada passo.", reading: "Isaías 41" },
  { verse: "Salmos 91:1-2", text: "Aquele que habita no esconderijo do Altíssimo, à sombra do Onipotente descansará.", reflection: "Há um lugar seguro para sua alma: a presença do Altíssimo. Habite ali hoje, em oração e adoração.", reading: "Salmos 91" },
];

export function getDailyDevocional() {
  const day = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  return devocionais[day % devocionais.length];
}