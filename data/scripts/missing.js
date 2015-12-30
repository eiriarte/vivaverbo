/*
  Vuelca a stdout las palabras de la lista de frecuencias fq.js que no están
  en la lista de tarjetas cards.js.

  Uso: node missing.js
*/
var _ = require('lodash');
var cards = require('./data/cards');
var freqs = require('./data/fq');

console.warn('Buscando palabras no registradas…');

var deriv = /(as|is|os|us|u|j|n)$/;
var partic = /[aio]n?t[oea]$/;
var ho = /(hh|sh|gh|ch|jh)/;
var ekster = /[^a-zĥŝĝĉĵŭ,.\s\-]/;
var hash = _.groupBy(cards, function(card) {
  return card.respuesta.toLowerCase();
});
var total = 0;

_.forOwn(freqs, function(freq, word) {
  if (!_.isNumber(freq)) {
    console.error('%s no tiene una frecuencia. Abortando…', word);
    return false;
  }
  if (isValid(word) && typeof hash[word] === 'undefined' && !adj(word)) {
    console.log('%d %s', freq, word);
    total++;
  }
});

console.warn('Total: %d palabras.', total);

function isValid(word) {
  if (deriv.test(word)) return false;
  if (partic.test(word)) return false;
  if (ho.test(word)) return false;
  if (ekster.test(word)) return false;
  return true;
}

function adj(word) {
  if (word.slice(-1) === 'a') {
    return (typeof hash[word.slice(0, -1) + 'o'] !== 'undefined');
  }
  return false;
}
