'use strict';

angular.module('vivaverboApp')
  .factory('db', function ($resource, $q, $log, Loki) {
    // Service logic
    // TODO: ensureUniqueIndex, etc
    // TODO: configurar LocalForage
    const cardsAPI = $resource('/api/cards');
    const lokiDB = new Loki('vivaverbo.db');

    // Promesa que se resuelve cuando se han obtenido las tarjetas
    // (del servidor o de local)
    const deferred = $q.defer();
    const cardsReady = deferred.promise;

    let cardsCollection;

      /* jshint unused: false */
    lokiDB.loadDatabase({}, (err) => {
      const numCollections = lokiDB.listCollections().length;
      if (0 === numCollections) {
        cardsCollection = lokiDB.addCollection('Cards');
        $log.debug('Obteniendo tarjetas del servidor…');
        cardsAPI.query().$promise.then((cards) => {
          $log.debug('Insertando tarjetas en DB Loki…');
          cardsCollection.insert(cards);
          deferred.resolve();
          lokiDB.saveDatabase();
        });
      } else {
        $log.debug('Obteniendo tarjetas de almacén local…');
        cardsCollection = lokiDB.getCollection('Cards');
        deferred.resolve();
      }
    });

    // Public API
    return {
      lokiDB,
      getCards(list) {
        const deferred = $q.defer();
        cardsReady.then(() => {
          const cards = cardsCollection.find();
          const reviewCards = [];
          for (let i = 0, len = list.length; i < len; i++) {
            reviewCards.push(cards[list[i]]);
          }
          deferred.resolve(reviewCards);
        });
        return deferred.promise;
      }
    };
  });
