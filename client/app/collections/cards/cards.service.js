'use strict';

angular.module('vivaverboApp')
  .factory('cards', function (Collection) {
    const cards = new Collection('cards');

    /**
     * @method getFromReview
     * Devuelve (promete) un array con las tarjetas correspondientes al repaso
     * @param {array} review - array 'tarjetas' de un objeto 'review'
     * @param {array} ref - (Opcional) Referencia al array donde volcar el resultado
     */
    cards.getFromReview = function (review, ref) {
      this.onDataReady(() => {
        const lokiCollection = this.lokiCollection;
        const reviewCards = review.map((rCard) =>
          lokiCollection.findOne({ _id: rCard.cardId }));
        if (undefined !== ref && ref !== reviewCards) {
          angular.copy(reviewCards, ref);
        }
        return reviewCards;
      });
    };

    return cards;
  });
