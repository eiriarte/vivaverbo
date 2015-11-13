'use strict';

angular.module('vivaverboApp')
  .factory('reviewService', function ($q, $log, $mdToast, gettextCatalog, Auth,
        db, cards, memory, dateTime) {
    const user = Auth.getCurrentUser();
    const tarjetasRepaso = [];
    initReview();

    // Public API
    return {
      get repaso() {
        return user.review;
      },
      // Devuelve un array con las tarjetas correspondientes al repaso actual,
      // en el mismo orden
      get tarjetasRepaso() {
        return tarjetasRepaso;
      },
      // Marca el grado actual de recuerdo de la tarjeta
      // Si borrar es true, la tarjeta no se volverá a mostrar en el futuro
      marcar(recuerdo, borrar = false) {
        const review = user.review;
        const firstTry = review.tarjetas[review.tarjetaActual].firstTry;
        const id = review.tarjetas[review.tarjetaActual].cardId;
        const prob = memory.addRecall(id, recuerdo, borrar);
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
      newReview() {
        initReview(true);
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
    function initReview(force = false) {
      const hoy = dateTime.today();

      if (force || user.review.fecha === undefined || user.review.fecha < hoy) {
        $log.debug('Generando un nuevo repaso');
        const promise = generateReview();
        promise.then((review) => {
          angular.merge(user.review, review);
          cards.getFromReview(user.review.tarjetas, tarjetasRepaso);
          db.updateUser(user);
        }).catch((e) => {
          const msg = gettextCatalog.getString('Could not generate a review. Try reloading the app.');
          $log.error('Error en initReview', e);
          $mdToast.showSimple(msg);
        });
      } else {
        $log.debug('Manteniendo el repaso existente');
        cards.getFromReview(user.review.tarjetas, tarjetasRepaso);
      }
    }

    // Auxiliar de initReview()
    // Devuelve (promete) un nuevo repaso a asignar al usuario
    function generateReview() {
      const deferred = $q.defer();
      const promise = newReviewCards(user.prefs.tarjetasPorRepaso,
                                        user.prefs.nuevasPorRepaso);
      promise.then((reviewCards) => {
        const review = {
          fecha: dateTime.now(),
          finalizado: false,
          totalTarjetas: reviewCards.length,
          totalAprendidas: 0,
          tarjetaActual: 0,
          numFallos: 0,
          tarjetas: reviewCards
        };
        deferred.resolve(review);
      }).catch((e) => {
        deferred.reject(e);
      });
      return deferred.promise;
    }

    // Devuelve (promete) una array con las próximas tarjetas a repasar
    // tarjetasPorRepaso: nº total de tarjetas a repasar
    // nuevasPorRepaso: nº de tarjetas a incluir, no repasadas previamente
    function newReviewCards(tarjetasPorRepaso, nuevasPorRepaso) {
      return cards.onDataReady(() => {
        return memory.onDataReady(() => {
          const memoryCollection = memory.lokiCollection;
          const cardsCollection = cards.lokiCollection;
          let numNuevas, numRepaso;
          let repaso, nuevas;

          // siguientes repasos
          repaso = memoryCollection.chain().
            find({ 'removed': { $ne: true } }).
            simplesort('recallProbability').
            limit(tarjetasPorRepaso).
            data();

          numNuevas = tarjetasPorRepaso - repaso.length;
          if (numNuevas < nuevasPorRepaso) {
            numNuevas = nuevasPorRepaso;
          }

          // tarjetas nuevas (no existentes en memoryCollection) más frecuentes
          nuevas = cardsCollection.chain().
            where((card) => !memoryCollection.findOne({ card: card._id })).
            simplesort('freq', true).
            limit(numNuevas).
            data();

          // Concatenamos las de repaso y las nuevas,
          // hasta un total de tarjetasPorRepaso
          numRepaso = tarjetasPorRepaso - nuevas.length;
          repaso = reviewFromCards(repaso.slice(0, numRepaso));
          nuevas = reviewFromCards(nuevas);

          return repaso.concat(nuevas);
        });
      });
    }

    // Devuelve un array con elementos nuevos de user.review.tarjetas a partir
    // de las tarjetas/memorias en cards
    function reviewFromCards(cards) {
      const review = [];
      angular.forEach(cards, (card) => review.push({
        cardId: card.card || card._id,
        firstTry: true,
        learned: false
      }));
      return review;
    }
  });
