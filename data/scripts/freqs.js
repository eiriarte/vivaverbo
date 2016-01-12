/*
 Vuelca a stdout un hash de las palabras de la lista de frecuencias
 freqs.norm.txt como claves, y su orden de frecuencia como valores

 Uso: node freqs.js
 */

var fs = require('fs');
var readline = require('readline');
var _ = require('lodash');
var cards = require('./data/cards');

var rl = readline.createInterface({
  input: fs.createReadStream('../freqs.norm.txt'),
  output: process.stdout,
  terminal: false
});

var cardHash = _.groupBy(cards, function(card) {
  return card.respuesta.toLowerCase();
});
var rank = 0;
var out = {};

var iksoj = /(cx|gx|hx|jx|sx|ux)/g
var chapeloj = {
  cx: 'ĉ',
  gx: 'ĝ',
  hx: 'ĥ',
  jx: 'ĵ',
  sx: 'ŝ',
  ux: 'ŭ'
}

rl.on('line', function(line) {
  rank++;
  processLine(line, rank);
}).on('close', function() {
  console.log('module.exports = ' + JSON.stringify(out, null, '\t'));
  process.exit(0);
});

function processLine(line, rank) {
  var verb = /^(...*)(as|is|os|ado|anto|into|onto|itan?)$/;
  var plurAccus = /^(...*[ao])(j|n|jn)$/;
  var match, word = line.split('\t')[0];

  word = word.toLowerCase();
  word = word.replace(iksoj, function(ikso) {
    return chapeloj[ikso];
  });

  match = verb.exec(word);
  if (match && !exists(word)) {
    // Pasamos el verbo a infinitivo
    word = match[1] + 'i';
  } else {
    match = plurAccus.exec(word);
    if (match && !exists(word)) {
      // Quita la terminación -j, -n ó -jn
      word = match[1];
      // Con 4 caracteres tendríamos p.ej. "geno" = ge'no ("no" = "letra ene")
      if (word.length > 4 && word.slice(0, 2) === 'ge') {
        if (!exists(word) && exists(word.slice(2))) {
          // Quita el prefijo "ge"
          word = word.slice(2);
        }
      }
    }
  }

  if (!out.hasOwnProperty(word)) {
    out[word] = rank;
  }
}

function exists(word) {
  return cardHash.hasOwnProperty(word);
}
