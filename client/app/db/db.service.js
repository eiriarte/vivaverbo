'use strict';

angular.module('vivaverboApp')
  .factory('db', function ($resource, $q, $log, Loki) {
    // Service logic
    // TODO: ensureUniqueIndex, etc
    // TODO: configurar LocalForage
    let lokiDB, cardsCollection;
    let cardsAPI = $resource('/api/cards');
    // Promesa que se resuelve cuando se han obtenido las tarjetas
    // (del servidor o de local)
    let deferred = $q.defer();
    let cardsReady = deferred.promise;

    lokiDB = new Loki('vivaverbo.db');
      /* jshint unused: false */
    lokiDB.loadDatabase({}, (err) => {
      let cols = lokiDB.listCollections();
      if (0 === cols.length) {
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
        let deferred = $q.defer();
        cardsReady.then(() => {
          let cards = cardsCollection.find();
          let reviewCards = [];
          for (let i = 0, len = list.length; i < len; i++) {
            reviewCards.push(cards[list[i]]);
          }
          deferred.resolve(reviewCards);
        });
        return deferred.promise;
      }
    };
  });
