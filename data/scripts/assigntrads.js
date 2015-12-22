cards = require('./data/fcards');
trads = require('./data/trads');

cards.forEach(function(card) {
  var trad = trads[card.respuesta];
  if (typeof trad === 'string') {
    card.pregunta = trad;
  }
});

console.log(JSON.stringify(cards, null, '\t'));
