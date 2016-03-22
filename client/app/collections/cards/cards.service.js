'use strict';

angular.module('vivaverboApp')
  .factory('cards', function (Collection) {
    const brackets = /\(.*\)/;
    const cards = new Collection('cards');

    /**
     * @method getFromReview
     * Devuelve (promete) un array con las tarjetas correspondientes al repaso
     * @param {array} review - array 'tarjetas' de un objeto 'review'
     * @param {array} ref - (Opcional) Referencia al array donde volcar el resultado
     * @returns {Promise} Promesa a resolver con el array de tarjetas
     */
    cards.getFromReview = function (review, ref) {
      return this.onDataReady(() => {
        const lokiCollection = this.lokiCollection;
        const reviewCards = review.map((rCard) => {
          const card = lokiCollection.findOne({ _id: rCard.cardId });
          [ card.pregunta, card.bracketP ] = spotBrackets(card.pregunta);
          [ card.respuesta, card.bracketR ] = spotBrackets(card.respuesta);
          return card;
        });
        if (undefined !== ref && ref !== reviewCards) {
          angular.copy(reviewCards, ref);
        }
        return reviewCards;
      });
    };

    return cards;

    // Devuelve separadamente el texto y el paréntesis
    // P.ej: 'Hola (mundo)' => [ 'Hola' , '(mundo)' ]
    function spotBrackets(text) {
      let bracket = '';
      const texto = text.replace(brackets, (match) => {
        bracket = match;
        return '';
      });
      return [ texto.trim(), bracket ];
    }
  });
