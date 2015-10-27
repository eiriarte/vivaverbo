'use strict';

angular.module('vivaverboApp')
  .filter('cardField', function (db) {
    return function (reviewCard, field) {
      const card = db.getCard(reviewCard.cardId);
      return (card && card[field]) || '…';
    };
  });
