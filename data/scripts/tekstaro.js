/**
 * Vuelca a stdout un array con las frases del Tekstaro de tekstaro.com.
 * Cada frase lleva el nombre del fichero (sin .xml), la fecha y la longitud.
 * Uso: node tekstaro.js
 */
var fs = require('fs');
var cheerio = require('cheerio');
var files = ['al-torento', 'aldono-hilelismo', 'monato', 'azia-strategio', 'chu-li', 'denaska-kongresano', 'dogmoj-hilelismo', 'don-kihhoto', 'mondo-homarana', 'el-vivo-de-chukchoj', 'elektitaj-fabeloj', 'esenco-kaj-estonteco', 'andersen-1', 'andersen-2', 'andersen-3', 'andersen-4', 'fajron-sentas', 'fund-antauparolo', 'fund-ekzercaro', 'fund-krestomatio', 'gerda-malaperis', 'ghis-krokodilido', 'hitler-mau-strindberg', 'homaranismo-1906', 'homaranismo-1913', 'homoj-sur-la-tero', 'infanoj-en-torento', 'internacia-krestomatio', 'kastelo-de-prelongo', 'kien-fluas-roj-castalie', 'kion-zamenhof-ne-povis', 'kruko-kaj-baniko', 'la-batalo-de-l-vivo', 'la-faraono', 'la-kiso', 'majstro-kaj-margarita', 'majstro-kaj-martinelli', 'la-respubliko', 'la-revizoro', 'la-skandalo-pro-jozefo', 'la-soleno', 'malnova-testamento', 'marta', 'metropoliteno', 'mia-penso', 'mortula-shipo', 'ne-nur-plumamikoj', 'letero-al-beaufront', 'nova-testamento', 'ondo-de-esperanto', 'paroladoj-de-zamenhof', 'patroj-kaj-filoj', 'efika-informado', 'pri-la-homaranismo', 'pro-ishtar', 'quo-vadis-1', 'quo-vadis-2', 'robinsono-kruso', 'satiraj-rakontoj', 'tokio-invitas-vin', 'vespera-rugho', 'vivo-de-zamenhof', 'vivo-vokas', 'vojaghimpresoj', 'vortoj-de-lanti', 'zamenhof'];

var dir = '../tools/tekstaro/tekstoj/';
var entities = /&#x(.*?);/g;
var result, out = [];

files.forEach(function(file) {
  try {
    getFrases(file);
  } catch(e) {
    console.log('Error en %s: %s', file, e.message);
    throw e;
  }
});

result = 'var sentences = ' + JSON.stringify(out, null, '\t');
result += '\n// Total de frases obtenidas: ' + out.length;
console.log(result);


/**
 * Devuelve un array con las frases del fichero filename
 */
function getFrases(filename) {
  var tags = /<.*?>/g;
  var reSentence = /[.\?!](.{7,}?[.\?!])/g;
  var reDate = /<date>(.*?)<\/date>/g;
  var twoWords = /[A-Za-zĉĈĝĜĥĤĵĴŝŜŭŬ,]\s[A-Za-zĉĈĝĜĥĤĵĴŝŜŭŬ]/g;
  var text = fs.readFileSync(dir + filename + '.xml', 'utf8');
  var date = reDate.exec(text)[1];
  var res, sentence;

  text = text.replace(tags, '.');
  while(res = reSentence.exec(text)) {
    sentence = res[1];
    sentence = sentence.replace(/^[\s\.]+|[\s]+$/g, '');
    if (twoWords.test(sentence)) {
      out.push({
        sentence: sentence,
        work: filename,
        date: date,
        length: sentence.length
      });
    }
    reSentence.lastIndex = reSentence.lastIndex - 1;
  }
}
