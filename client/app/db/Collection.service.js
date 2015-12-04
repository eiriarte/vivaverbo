'use strict';

angular.module('vivaverboApp')
  .factory('Collection', function ($resource, $q, $timeout, $log, $localStorage,
        localDB, lodash) {

    class Collection {
      /**
       * @constructor
       * @param {string} name - El nombre de la colleción, p.ej: 'users'
       * @param {object} opt - (Opcional) opciones:
       *  - query {object} - Parámetros a enviar al endpoint de la api
       *  - collection {object} - Opciones a pasar a addCollection()
       *  - id {array}<string> - Campos identificadores únicos de la colección
       *  - sync {boolean} - Si es true, se sincroniza en el inicio
       *  - proto {function} - Clase de los documentos
       */
      constructor(name, options = {}) {
        const deferred = $q.defer();
        this._ids = options.id || ['_id'];
        this._proto = options.proto;
        this._name = name;
        this.dataReady = deferred.promise;
        this.api = $resource('/api/' + this._name);
        localDB.whenReady.then(() => {
          this._lokiCollection = localDB.getCollection(this._name);
          if (null !== this._lokiCollection) {
            deferred.resolve();
            if (options.sync) {
              this.sync();
            }
          } else {
            $log.debug('Creando colección %s.', this._name);
            this._lokiCollection =
              localDB.addCollection(this._name, options.collection);
            this.api.query(options.query).$promise.then((docs) => {
              try {
                docs.forEach((doc) => {
                  this._lokiCollection.insert(this._inflate(doc));
                });
                const lastDoc = lodash.last(lodash.sortBy(docs, 'date'));
                if (lastDoc) {
                  this.lastSyncDate = lastDoc.date;
                }
                localDB.save();
                $log.debug('Cargados datos del servidor en %s.', this._name);
                deferred.resolve();
              } catch (e) {
                $log.error('Error cargando %s del servidor:', this._name, e);
                deferred.reject(e);
              }
            }).catch((reason) => {
              $log.error('Error obteniendo %s del servidor.', this._name);
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
       * Sincroniza la colección con el servidor (envía los documentos no
       * sincronizados, y actualiza la colección con los datos que devuelve el
       * servidor)
       * @returns {promise} Promesa, resuelta cuando finalice la sincronización
       */
      sync() {
        if (this._syncing) {
          return $q.reject('Ya hay una sincronización en curso');
        }
        this._syncing = true;
        $log.debug('Sincronizando colección %s.', this._name);

        const deferred = $q.defer();

        this.dataReady.then(() => {
          const syncData = {
            date: this.lastSyncDate,
            docs: this._lokiCollection.find({ date: undefined })
          };
          if (0 === syncData.docs.length) {
            deferred.resolve();
            this._syncing = false;
          } else {
            this.api.save(syncData).$promise.then((data) => {
              // Actualizamos los datos locales
              this.lastSyncDate = data.date;
              data.docs.forEach((doc) => {
                const localDoc = this._getLocalDoc(doc);
                if (localDoc) {
                  // Hay copia local: la modificamos con los datos del servidor
                  angular.extend(localDoc, doc);
                  this._lokiCollection.update(localDoc);
                } else {
                  // No hay copia local: la creamos
                  this._lokiCollection.insert(this._inflate(doc));
                }
              });
              localDB.save();
              deferred.resolve();
              this._syncing = false;
              $log.debug('Colección %s sincronizada.', this._name);
            }).catch((e) => {
              $log.error('Error en la sincronización (%s):', this._name, e);
              $log.warn('Reintentando en 15 segundos…');
              deferred.reject(e);
              $timeout(15000).then(() => {
                this._syncing = false;
                this.sync();
              });
            });
          }
        }).catch((reason) => {
          deferred.reject(reason);
          this._syncing = false;
        });

        return deferred.promise;
      }
      /**
       * Inserta un documento en la colección
       * @param {object} doc - Documento a insertar
       * @returns {object} El documento insertado
       */
      insert(doc) {
        delete doc.date;
        return this._lokiCollection.insert(this._inflate(doc));
      }
      /**
       * Actualiza un documento en la colección
       * @param {object} doc - Documento a insertar
       * @param {boolean} mode - (Opcional) 'upsert' para insertar si no existe
       * @returns {object} El documento actualizado/insertado
       * @throws {TypeError} El documento no existe, y mode no es 'upsert'
       */
      update(doc, mode) {
        if (doc.hasOwnProperty('$loki')) {
          delete doc.date;
          return this._lokiCollection.update(doc);
        } else if ('upsert' === mode) {
          delete doc.date;
          return this._lokiCollection.insert(this._inflate(doc));
        } else {
          throw new TypeError('El documento no existe.');
        }
      }
      /**
       * @private
       * Devuelve el objeto como instancia de la clase this._proto (si existe)
       * @param {object} doc - Documento a devolver como instancia
       * @returns {object} Objeto original (instanciado como _proto, o no)
       */
      _inflate(doc) {
        if ('function' === typeof this._proto && !(doc instanceof this._proto)) {
          return angular.extend(new this._proto(), doc);
        } else {
          return doc;
        }
      }
      /**
       * @private
       * Encuentra el documento en BD local, correspondiente al proporcionado,
       * comparando los posibles campos identificadores
       * @param {object} doc - Documento a encontrar en la BD local
       * @returns {object} El documento encontrado, o undefined si no se encontró
       */
      _getLocalDoc(doc) {
        let result;
        this._ids.forEach((id) => {
          const query = {};
          query[id] = doc[id];
          const localDoc = this._lokiCollection.findOne(query);
          if (localDoc) {
            result = localDoc;
          }
        });
        return result;
      }
      /**
       * @property lastSyncDate
       * Fecha de sincronización del documento más recientemente sincronizado
       */
      get lastSyncDate() {
        return $localStorage.syncDates[this._name] || 0;
      }
      set lastSyncDate(date) {
        $localStorage.syncDates[this._name] = date;
      }
      /**
       * Devuelve una promesa a resolver cuando esté cargada la colección
       * @param {*} value - Valor o función con que resolver la promesa
       * @returns {promise} Promesa de colección cargada
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
       * @returns {promise} Promesa del array de documentos encontrados
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
       * @returns {promise} Promesa del array de documentos encontrados
       */
      findOne(query, ref) {
        return this.find(query, ref, true);
      }
      /**
       * Devuelve el documento con el ID indicado
       * @param {*} idValue - Id del documento buscado
       * @returns {object} Documento encontrado, si existe; undefined, si no
       */
      findById(idValue) {
        let result;
        this._ids.forEach((idKey) => {
          const query = {};
          query[idKey] = idValue;
          const localDoc = this._lokiCollection.findOne(query);
          if (localDoc) {
            result = localDoc;
          }
        });
        return result;
      }
    } // end: class Collection

    return Collection;
  });
