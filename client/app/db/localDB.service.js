'use strict';

angular.module('vivaverboApp')
  .factory('localDB', function ($q, Loki) {
    const lfAdapter = new LokiLocalForageAdapter('vivaverbo');
    const lokiDB = new Loki('vivaverbo.db', { adapter: lfAdapter });
    let whenReady;

    /**
     * @property {promise} whenReady - Finalizada la carga de la BD desde localStorage, etc.
     */
    return {
      get whenReady() { return whenReady; },
      /**
       * Método getCollection() de LokiDB
       * @param {string} name - Nombre de la colección
       */
      getCollection(name) { return lokiDB.getCollection(name); },
      /**
       * Método addCollection() de LokiDB
       * @param {string} name - Nombre de la colección
       */
      addCollection(name, options) { return lokiDB.addCollection(name, options); },
      /**
       * Método addCollection() de LokiDB
       * @param {string} name - Nombre de la colección
       */
      removeCollection(name) { return lokiDB.removeCollection(name); },
      /**
       * Inicializa la base de datos local
       * @param {object} proto - Opciones de "inflado" de objetos con prototipos.
       */
      init(proto) {
        const deferred = $q.defer();
        lokiDB.loadDatabase(proto, () => deferred.resolve());
        whenReady = deferred.promise;
        return whenReady;
      },
      /**
       * Persiste la base de datos en localStorage, etc.
       */
      save() {
        // TODO: { success: true/false?? } (ver docs./src de indexedDB)
        lokiDB.saveDatabase();
      }
    };
  });
