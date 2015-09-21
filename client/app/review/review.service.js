'use strict';

angular.module('vivaverboApp')
  .factory('reviewService', function ($q, $rootScope, $log, $mdToast,
        gettextCatalog, Auth, db, memoryService, dateTime) {
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

        // Persistimos los cambios en el repaso
        db.updateUser(user);
      },
      // Fuerza un nuevo repaso ("repasar de nuevo!")
      // done: callback a llamar cuando esté listo el repaso (opcional)
      newReview(done) {
        initReview(true, done);
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
    // force: crea el nuevo repaso incondicionalmente
    // done: callback a llamar cuando esté listo el repaso
    function initReview(force = false, done = angular.noop) {
      const hoy = dateTime.today();

      if (force || user.review.fecha === undefined || user.review.fecha < hoy) {
        $log.debug('Generando un nuevo repaso');
        const promise = memoryService.newReview();
        promise.then((review) => {
          angular.merge(user.review, review);
          db.updateUser(user);
          done();
        }).catch(() => {
          const msg = gettextCatalog.getString('Could not generate a review. Try reloading the app.');
          $log.error('Error en initReview: no se pudo generar el repaso');
          $mdToast.showSimple(msg);
        });
      } else {
        $log.debug('Manteniendo el repaso existente');
      }
    }
  });
