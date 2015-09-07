'use strict';

angular.module('vivaverboApp')
  .factory('memoryService', function ($q, $log, Auth, db) {
    // Service logic
    const user = Auth.getCurrentUser();

    // Public API here
    return {
      // Devuelve (promete) un nuevo repaso a asignar al usuario
      newReview() {
        const deferred = $q.defer();
        const promise = db.newReviewCards(user.prefs.tarjetasPorRepaso,
                                          user.prefs.nuevasPorRepaso);
        promise.then((reviewCards) => {
          const review = {
            fecha: new Date(),
            finalizado: false,
            totalTarjetas: reviewCards.length,
            totalAprendidas: 0,
            tarjetaActual: 0,
            numFallos: 0,
            tarjetas: reviewCards
          };
          deferred.resolve(review);
        });
        return deferred.promise;
      },

      // Marca el grado de recuerdo actual de la tarjeta actual del repaso
      // Devuelve la probabilidad recuerdo actualizada de la tarjeta
      addRecall(review, recuerdo, remove = false) {
        const id = review.tarjetas[review.tarjetaActual].cardId;
        const mem = db.getMemory(id);

        $log.debug(`Actualizando recuerdo ${id} (tarjeta actual: ${review.tarjetaActual})`);
        mem.addRecalls([{ recall: recuerdo }]);

        if (remove) {
          mem.remove();
        }
        db.updateMemory(mem);
        db.save();
        db.sync();
        return mem.recallProbability;
      }
    };
  });
