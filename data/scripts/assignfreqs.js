/*
  Asigna las frecuencias de fq.js a las tarjetas de cards.js y vuelca el
  resultado a stdout.

  Uso: node assignfreqs.js
*/
cards = require('./data/cards');
freqs = require('./data/fq');

cards.forEach(function(card) {
  for (var i = 0; i <= 20; i++) {
    if (freqs[i].indexOf(card.respuesta) !== -1) {
      card.freq = i;
      break;
    }
  }
  if (typeof card.freq === 'undefined') {
    card.freq = 21;
  }
});

console.log(JSON.stringify(cards, null, '\t'));
