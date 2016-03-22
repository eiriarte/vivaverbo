'use strict';

angular.module('vivaverboApp')
  .factory('reviewService', function ($q, $log, $mdToast, gettextCatalog, Auth,
        db, cards, memory, dateTime, lodash) {
    const user = Auth.getCurrentUser();
    const tarjetasRepaso = [];
    let currentCategory;
    let estadoCarga;

    // Public API
    return {
      get repaso() {
        return getReview(currentCategory);
      },
      get estadoCarga() {
        return estadoCarga;
      },
      // Devuelve un array con las tarjetas correspondientes al repaso actual,
      // en el mismo orden
      get tarjetasRepaso() {
        return tarjetasRepaso;
      },
      // Marca el grado actual de recuerdo de la tarjeta
      // Si borrar es true, la tarjeta no se volverá a mostrar en el futuro
      marcar(recuerdo, borrar = false) {
        const review = getReview(currentCategory);
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
      /**
       * Obtiene un nuevo repaso para hoy en la categoría indicada
       * @param {string} category - Categoría de tarjetas a repasar
       * @param {boolean} force - (Opcional) No retomar el repaso existente
       */
      newReview(category, force = false) {
        const review = getReview(category);
        const hoy = dateTime.today();
        currentCategory = category;
        estadoCarga = 'cargando';

        if (force || review.fecha === undefined || review.fecha < hoy) {
          $log.debug('Generando un nuevo repaso en la categoría %s', category);
          const promise = generateReview(category);
          promise.then((rev) => {
            angular.copy(rev, review);
            cards.getFromReview(review.tarjetas, tarjetasRepaso).then(() => {
              estadoCarga = 0 === review.tarjetas.length ? 'agotado' : 'cargado';
            });
            db.updateUser(user);
          }).catch((e) => {
            const msg = gettextCatalog.getString('Could not generate a review. Try reloading the app.');
            $log.error('Error en newReview', e);
            $mdToast.showSimple(msg);
          });
        } else {
          $log.debug('Manteniendo repaso existente en la categoría %s', category);
          cards.getFromReview(review.tarjetas, tarjetasRepaso).then(() => {
            estadoCarga = 0 === review.tarjetas.length ? 'agotado' : 'cargado';
          });
        }
      }
    };

    // Funciones privadas:

    /**
     * Devuelve el repaso actual del usuario para la categoría indicada,
     * o lo crea vacío, si no existe
     * @param {string} category - Slug de la categoría
     * @returns {object} Repaso encontrado o creado
     */
    function getReview(category) {
      let review = lodash.find(user.reviews, { category: category });
      if (!review) {
        review = { category: category };
        user.reviews.push(review);
      }
      return review;
    }

    // Devuelve el índice de la siguiente tarjeta aún no "aprendida",
    // o undefined, si no hay más posteriores sin aprender
    function siguienteTarjeta() {
      const review = getReview(currentCategory);
      let siguiente = review.tarjetaActual + 1;
      while (siguiente < review.totalTarjetas) {
        if (!review.tarjetas[siguiente].learned) {
          return siguiente;
        }
        siguiente++;
      }
      return undefined;
    }

    /*
     * Auxiliar de newReview()
     * Devuelve (promete) un nuevo repaso a asignar al usuario
     * @param {string} category - Categoría de tarjetas a repasar
     * @returns {Promise} Promesa a resolver con el nuevo repaso
     */
    function generateReview(category) {
      const deferred = $q.defer();
      const promise = newReviewCards(category, user.prefs.tarjetasPorRepaso,
                                        user.prefs.nuevasPorRepaso);
      promise.then((reviewCards) => {
        const review = {
          category: category,
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

    /**
     * Devuelve (promete) una array con las próximas tarjetas a repasar
     * @param {string} category - Categoría de tarjetas a repasar
     * @param {number} tarjetasPorRepaso -  nº total de tarjetas a repasar
     * @param {number} nuevasPorRepaso -  nº de tarjetas nuevas a incluir
     * @returns {Promise} Promesa a resolver con el array de tarjetas
     */
    function newReviewCards(category, tarjetasPorRepaso, nuevasPorRepaso) {
      return cards.onDataReady(() => {
        return memory.onDataReady(() => {
          const memoryCollection = memory.lokiCollection;
          const cardsCollection = cards.lokiCollection;
          let numNuevas, numRepaso;
          let repaso, nuevas;

          // siguientes repasos
          repaso = memoryCollection.chain().
            where((memory) => {
              const card = cards.findById(memory.card);
              if (card) {
                return card.categorias.indexOf(category) !== -1;
              }
            }).
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
            find({ 'categorias': { $contains: category } }).
            where((card) => !memoryCollection.findOne({ card: card._id })).
            simplesort('freq').
            limit(numNuevas).
            data();

          // Concatenamos las de repaso y las nuevas,
          // hasta un total de tarjetasPorRepaso
          numRepaso = tarjetasPorRepaso - nuevas.length;
          repaso = reviewFromCards(repaso.slice(0, numRepaso));
          nuevas = reviewFromCards(nuevas);

          // 'repaso' y 'nuevas' son arrays vacíos!!!!??????
          // ¿por qué? ¿de dónde salen??? ¿de localStorage????
          return repaso.concat(nuevas);
        });
      });
    }

    /**
     * Devuelve un array con elementos nuevos de user.review.tarjetas a partir
     * de las tarjetas/memorias en cards
     * @param {array} cards - Array de tarjetas/memorias a transformar en repaso
     * @returns {array} Elementos de repaso correspondiente a 'cards'
     */
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
