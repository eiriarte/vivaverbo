/*
  Asigna las traducciones de trads.js a las tarjetas de cards.js y vuelca el
  resultado a stdout.

  Uso: node assigntrads.js
*/
cards = require('./data/cards');
trads = require('./data/trads');

cards.forEach(function(card) {
  var trad = trads[card.respuesta];
  if (typeof trad === 'string') {
    card.pregunta = trad;
  }
});

console.log(JSON.stringify(cards, null, '\t'));
