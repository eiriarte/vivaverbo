/*
 * uso: node export.js
 * */
cards = require('./data/cards');

cards.forEach(function(card) {
  console.log(JSON.stringify(card));
});
