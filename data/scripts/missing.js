/*
  Vuelca a stdout las palabras de la lista de frecuencias fq.js que no están
  en la lista de tarjetas cards.js.

  Uso: node missing.js
*/
var cards = require('./data/cards');
var freqs = require('./data/fq');

var hash = getHash(cards);

freqs.forEach(function(group, i) {
  group.forEach(function(word) {
    if (typeof hash[word] === 'undefined') {
      console.log(i, word);
    }
  });
});

function getHash(cards) {
  var hash = {};

  cards.forEach(function(card) {
    if (typeof hash[card.respuesta] !== 'undefined') {
      console.error('"%s" está duplicada: %s', card.respuesta);
      process.exit(1);
    }
    hash[card.respuesta] = card;
  });

  return hash;
}
