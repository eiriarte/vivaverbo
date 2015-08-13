'use strict';

angular.module('vivaverboApp')
  .factory('reviewService', function ($q, $rootScope, Auth, cardService) {
    const user = Auth.getCurrentUser();
    const tarjetasRepaso = [];
    const repaso = {};
    crearRepaso();

    // Public API
    return {
      repaso,
      tarjetasRepaso,
      /* jshint unused: false */
      marcar(recuerdo) {
        const deferred = $q.defer();
        repaso.tarjetaActual++;
        repaso.finalizado = repaso.tarjetaActual === repaso.totalTarjetas;
        deferred.resolve();
        return deferred.promise;
      },
      borrar() {
        const deferred = $q.defer();
        repaso.tarjetaActual++;
        repaso.finalizado = repaso.tarjetaActual === repaso.totalTarjetas;
        deferred.resolve();
        return deferred.promise;
      }
    };

    // Funciones privadas:

    // Crea el repaso para hoy, si no existe ya
    function crearRepaso() {
      let hoy = new Date();
      hoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
      if (!user.review || user.review.fecha < hoy) {
        const promise = cardService.getReview(user.prefs.tarjetasPorRepaso);
        promise.then((review) => {
          user.review = review;
          angular.merge(repaso, review);
          prepararTarjetas();
        });
      } else {
        angular.merge(repaso, user.review);
        prepararTarjetas();
      }
    }

    // Función auxiliar de crearRepaso():
    // Obtiene el contenido de las tarjetas del array de IDs de tarjeta
    function prepararTarjetas(nuevoRepaso) {
      const promise = cardService.getCards(user.review.tarjetas);
      promise.then((cards) => {
        angular.merge(tarjetasRepaso, cards);
      });
    }
  });
