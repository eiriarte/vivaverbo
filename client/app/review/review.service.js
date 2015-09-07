'use strict';

angular.module('vivaverboApp')
  .factory('reviewService', function ($q, $rootScope, $log, Auth, memoryService) {
    const user = Auth.getCurrentUser();
    initReview();

    // Public API
    return {
      get repaso() {
        return user.review;
      },
      // Marca el grado actual de recuerdo de la tarjeta
      // Si borrar es true, la tarjeta no se volverá a mostrar en el futuro
      marcar(recuerdo, borrar = false) {
        const review = user.review;
        const firstTry = review.tarjetas[review.tarjetaActual].firstTry;
        const prob = memoryService.addRecall(review, recuerdo, borrar);
        $log.debug(`Probabilidad calculada: ${prob}`);

        // si no la recordó
        if (0 === recuerdo) {
          review.numFallos++;
        // si la recordó perfectamente a la 1ª, o 2 veces seguidas, o la borró
        } else if (1 === recuerdo && firstTry || prob >= 0.75 || borrar) {
          // Se marca como aprendida en este repaso
          review.tarjetas[review.tarjetaActual].learned = true;
          review.totalAprendidas++;
          $log.debug(`Tarjeta ${review.tarjetaActual} aprendida`);
        }
        review.tarjetas[review.tarjetaActual].firstTry = false;

        review.tarjetaActual = siguienteTarjeta();

        // Damos por finalizado el repaso, o la ronda del repaso, si procede
        if (review.totalAprendidas === review.totalTarjetas) {
          $log.debug('¡Repaso finalizado!');
          review.finalizado = true;
        } else if (review.numFallos === user.prefs.maxFallosPorRound ||
                    undefined === review.tarjetaActual) {
          $log.debug('¡Siguiente ronda!');
          review.numFallos = 0;
          review.tarjetaActual = -1;
          review.tarjetaActual = siguienteTarjeta();
        }
      }
    };

    // Funciones privadas:

    // Devuelve el índice de la siguiente tarjeta aún no "aprendida",
    // o undefined, si no hay más posteriores sin aprender
    function siguienteTarjeta() {
      let siguiente = user.review.tarjetaActual + 1;
      while (siguiente < user.review.totalTarjetas) {
        if (!user.review.tarjetas[siguiente].learned) {
          return siguiente;
        }
        siguiente++;
      }
      return undefined;
    }

    // Crea el repaso para hoy, si no existe ya
    function initReview() {
      let hoy = new Date();
      hoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());

      if (user.review.fecha === undefined || user.review.fecha < hoy) {
        const promise = memoryService.newReview();
        promise.then((review) => {
          angular.merge(user.review, review);
        });
      }
    }
  });
