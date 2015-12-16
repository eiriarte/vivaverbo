cards = require('./cards');
freqs = require('./fq');

cards.forEach(function(card) {
  for (var i = 0; i <= 20; i++) {
    if (freqs[i].indexOf(card.respuesta) !== -1) {
      card.freq = i;
      break;
    }
  }
});

console.log(JSON.stringify(cards, null, '\t'));
