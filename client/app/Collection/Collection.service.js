'use strict';

// Collection:
//         x constructor(name: String, protos: Object)
//         - load(conditions: Object, merge: boolean) : promise ???
//         - get(conditions: Object, persist: boolean) : promise ???
//         x find(conditions: Object, ref: Array) : promise(Array)
//         x findOne(conditions: Object, ref: Object) : promise(Object)
//         - loki: promise(loki.Collection)
//         - sync() ???
//     private
//         x lokiCollection: loki.Collection
//         x api: $resource
//         - unsynced: Array ???

angular.module('vivaverboApp')
  .factory('Collection', function ($resource, $q, $log, localDB) {
    let _name, lokiCollection, api;
    let dataReady;

    class Collection {
      /**
       * @constructor
       * @param {string} name - El nombre de la colleción, p.ej: 'users'
       * @param {object} query - (Opcional) Parámetros a enviar al endpoint de la API
       */
      constructor(name, query) {
        const deferred = $q.defer();
        dataReady = deferred.promise;
        localDB.whenReady.then(() => {
          _name = name;
          api = $resource('/api/' + _name);
          lokiCollection = localDB.getCollection(_name);
          if (null !== lokiCollection) {
            deferred.resolve();
          } else {
            lokiCollection = localDB.addCollection(_name);
            api.query(query).$promise.then((docs) => {
              try {
                lokiCollection.insert(docs);
                localDB.save();
                $log.debug('Cargados datos del servidor en %s.', _name);
                deferred.resolve();
              } catch (e) {
                $log.error('Error cargando %s del servidor.', _name);
                deferred.reject(e);
              }
            }).catch((reason) => {
              $log.error('Error cargando %s del servidor.', _name);
              deferred.reject(_name + ': ' + reason);
            });
          }
        });
      }
      /**
       * @returns {string} Nombre de la colección, p.ej: 'users'
       */
      get name() {
        return _name;
      }
      /**
       * @returns {object} Objeto Collection nativo de LokiDB
       */
      get lokiCollection() {
        return lokiCollection;
      }
      /**
       * Devuelve una promesa a resolver cuando esté cargada la colección
       * @param {*} value - Valor o función para resolver la promesa
       */
      onDataReady(value) {
        const deferred = $q.defer();

        dataReady.then(() => {
          try {
            const result = angular.isFunction(value) ? value() : value;
            deferred.resolve(result);
          } catch (e) {
            deferred.reject(e);
          }
        }).catch((reason) => {
          deferred.reject(reason);
        });
        return deferred.promise;
      }
      /**
       * Devuelve los documentos de la colección que encajen con las condiciones.
       * @param {object} query - (Opcional) Condiciones de búsqueda
       * @param {array} ref - (Opcional) Referencia al array donde volcar el array de documentos
       * @param {boolean} one - (Opcional) True para devolver sólo un objeto, en lugar de un array
       * @return {promise} Promesa del array de documentos encontrados
       */
      find(query, ref, one = false) {
        return this.onDataReady(() => {
          const result = one ? lokiCollection.findOne(query) : lokiCollection.find(query);
          if (undefined !== ref && result !== ref) {
            angular.copy(result, ref);
          }
          return result;
        });
      }
      /**
       * Devuelve el primer documento de la colección que encaje con las condiciones.
       * @param {object} query - (Opcional) Condiciones de búsqueda
       * @param {object} ref - (Opcional) Referencia al objeto donde copiar el resultado
       * @return {promise} Promesa del array de documentos encontrados
       */
      findOne(query, ref) {
        return this.find(query, ref, true);
      }
    } // end: class Collection

    return Collection;
  });
