'use strict';

angular.module('vivaverboApp')
  .factory('cardService', function ($q, db) {
    // Public API
    return {
      // Obtiene el próximo repaso (nuevo) para el usuario actual
      // La lista de tarjetas sólo contiene los IDs
      getReview(numTarjetas) {
        let deferred = $q.defer();
        let review = {
          fecha: new Date(),
          finalizado: false,
          totalTarjetas: numTarjetas,
          tarjetaActual: 0,
          tarjetas: []
        };
        for (let i = 0; i < numTarjetas; i++) {
          review.tarjetas.push(Math.floor(Math.random() * 99));
        }
        deferred.resolve(review);
        return deferred.promise;
      },
      // Obtiene las tarjetas para repasar, correspondientes a los IDs de idList
      // idList viene del repaso actual (nuevo o no) del usuario
      getCards(idList) {
        let deferred = $q.defer();
        let promise = db.getCards(idList);
        promise.then((cards) => {
          deferred.resolve(cards);
        });
        return deferred.promise;
      }
    };
  });
