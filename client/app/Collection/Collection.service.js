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

    class Collection {
      /**
       * @constructor
       * @param {string} name - El nombre de la colleción, p.ej: 'users'
       * @param {object} query - (Opcional) Parámetros a enviar al endpoint de la API
       */
      constructor(name, query) {
        const deferred = $q.defer();
        this.dataReady = deferred.promise;
        this._name = name;
        this.api = $resource('/api/' + this._name);
        localDB.whenReady.then(() => {
          this._lokiCollection = localDB.getCollection(this._name);
          if (null !== this._lokiCollection) {
            deferred.resolve();
          } else {
            this._lokiCollection = localDB.addCollection(this._name);
            this.api.query(query).$promise.then((docs) => {
              try {
                this._lokiCollection.insert(docs);
                localDB.save();
                $log.debug('Cargados datos del servidor en %s.', this._name);
                deferred.resolve();
              } catch (e) {
                $log.error('Error cargando %s del servidor.', this._name);
                deferred.reject(e);
              }
            }).catch((reason) => {
              $log.error('Error cargando %s del servidor.', this._name);
              deferred.reject(this._name + ': ' + reason);
            });
          }
        });
      }
      /**
       * @returns {string} Nombre de la colección, p.ej: 'users'
       */
      get name() {
        return this._name;
      }
      /**
       * @returns {object} Objeto Collection nativo de LokiDB
       */
      get lokiCollection() {
        return this._lokiCollection;
      }
      /**
       * Devuelve una promesa a resolver cuando esté cargada la colección
       * @param {*} value - Valor o función para resolver la promesa
       */
      onDataReady(value) {
        const deferred = $q.defer();

        this.dataReady.then(() => {
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
          const result = one ? this._lokiCollection.findOne(query) : this._lokiCollection.find(query);
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
