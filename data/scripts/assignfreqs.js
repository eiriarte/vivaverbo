/*
  Asigna las frecuencias de fq.js a las tarjetas de cards.js y vuelca el
  resultado a stdout.

  Uso: node assignfreqs.js
*/
var cards = require('./data/cards');
var freqs = require('./data/fq');
var total = cards.length;
var maxFreq = 300000;

cards.forEach(function(card, index) {
  var freq = freqs[card.respuesta.toLowerCase()];
  if (typeof freq !== 'undefined') {
    card.freq = freq;
  } else {
    card.freq = ++maxFreq;
  }
  process.stderr.write('Entrada ' + index + '/' + total + '…\r');
});

console.log('module.exports = ' + JSON.stringify(cards, null, '\t'));
