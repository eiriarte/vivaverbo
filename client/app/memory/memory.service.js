'use strict';

angular.module('vivaverboApp')
  .factory('memory', function ($resource, $window, $log, $mdToast, $timeout, $q,
        lodash, gettextCatalog, dateTime, localDB, MemoryClass) {
// loadDB()
//   loadMemory(lastSync)
//     aux: updateMemoryFromServer(mems);
//         aux: mergeMemories
//             MemoryClass (sacar)
//     privateSyncMemory({ changes, done });
//         aux: getMemoryChanges
//         getLastMemorySyncDate (sacar)
    //const memory = new Collection('memory', { query: { fromDate: '1970-01-01T00:00:00.000Z' }, collection: { disableChangesApi: false } });
    const memory = {};

    const memoryAPI = $resource('/api/memory', null, {
      sync: { method: 'POST', isArray: true }
    });
    let memoryCollection;
    /* jshint ignore:start */
    let isSynchronizingMemory = false;
    /* jshint ignore:end */

    angular.extend(memory, {
      /**
       * TODO: borrar este método (dejar el de Collection.service.js)
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
      },
      /* **********************************************************************
       * Se asegura de tener los datos sincronizados con el servidor
       * **********************************************************************/
      syncMemory() {
        /* jshint ignore:start */
        privateSyncMemory();
        /* jshint ignore:end */
      },
      /* **********************************************************************
       * Devuelve el documento de memoryCollection para la tarjeta "id"
       * **********************************************************************/
      getMemory(id) {
        return getMemoryFromCollection(id);
      },
      /* **********************************************************************
       * Actualiza/inserta el objeto en la BD (para reindexar, Changes API, etc.)
       * mem: Objeto de la clase MemoryClass
       * **********************************************************************/
      updateMemory(mem) {
        mem.synced = false;
        if (mem.hasOwnProperty('$loki')) {
          memoryCollection.update(mem);
        } else {
          memoryCollection.insert(mem);
        }
      },
      /* *********************************************************************
       * Marca el grado de recuerdo actual de la tarjeta actual del repaso
       * Devuelve la probabilidad recuerdo actualizada de la tarjeta.
       * review: objeto review del usuario (user.review)
       * recuerdo: grado de recuerdo (0, 1, 0.5)
       * remove: true para no volver a mostrar la tarjeta en el futuro
       * *********************************************************************/
      addRecall(id, recuerdo, remove = false) {
        const mem = this.getMemory(id);

        $log.debug(`Actualizando recuerdo ${id}`);
        mem.addRecalls([{ recall: recuerdo }]);

        if (remove) {
          mem.remove();
        }
        this.updateMemory(mem);
        localDB.save();
        this.syncMemory();
        return mem.recallProbability;
      }
    });

    // TODO: borrar esta propiedad (dejar la de Collection.service.js)
    Object.defineProperty(memory, 'lokiCollection', {
      get: function() {
        return memoryCollection;
      }
    });

    loadDB();
    return memory;


    // Devuelve el objeto de memoryCollection para la tarjeta "id"
    // create: Crea un objeto nuevo si no existe en la colección
    function getMemoryFromCollection(id, create = true) {
      let mem = memoryCollection.findOne({ card: id });
      if (create && !mem) {
        mem = memoryCollection.insert(new MemoryClass(id));
      }
      return mem;
    }

    function loadDB() {
      localDB.whenReady.then(() => {
        memoryCollection = localDB.getCollection('memory');
        if (!memoryCollection) {
          memoryCollection =
            localDB.addCollection('memory', { disableChangesApi: false });
        }
        loadMemory(getLastMemorySyncDate());
      });
    }

    // Devuelve la fecha de la última sincronización de memory con el servidor
    // Si no hay última sincronización, se devuelve 1970-01-01
    function getLastMemorySyncDate() {
      const timestamp = $window.localStorage.getItem('memSyncDate') || '0';
      return new Date(parseInt(timestamp));
    }

    // Carga/sincronización inicial de los datos de recuerdo de las tarjetas
    // Se ejecuta al instanciar el servicio
    function loadMemory(lastSync) {
      const deferred = $q.defer();
      memory.dataReady = deferred.promise;
      // Obtenemos los datos nuevos del servidor (si los hay)
      memoryAPI.query({ fromDate: lastSync }).$promise.then((mems) => {
        // Datos de recuerdo locales que no se sincronizaron la sesión anterior
        const changes = memoryCollection.find({ 'synced': { $ne: true } });

        // Los cambios de la sincronización no son cambios a sincronizar!!!
        memoryCollection.setChangesApi(false);

        // Actualizamos los datos locales con los obtenidos del servidor
        updateMemoryFromServer(mems);

        if (0 === changes.length) {
          $log.debug('No hay cambios de datos de recuerdo que sincronizar');
          // No hay datos locales sin sincronizar: hemos acabado
          memoryCollection.setChangesApi(true);
          deferred.resolve();
        } else {
          $log.debug(`Detectados ${changes.length} cambios sin sincronizar`);
          // Actualizamos los datos del servidor con los datos nuevos locales
          /* jshint ignore:start */
          privateSyncMemory({
            changes: changes,
            done: () => {
              memoryCollection.setChangesApi(true);
              deferred.resolve();
            }
          });
          /* jshint ignore:end */
        }
      }).catch((e) => {
        $log.error('Error al cargar datos de sincronización de memoria:', e);
        const msg1 = gettextCatalog.getString('Could\'t synchronize with server.');
        const msg2 = gettextCatalog.getString('We\'ll try next time.');
        $mdToast.showSimple(msg1).then(() => $mdToast.showSimple(msg2));
        deferred.reject(e);
      });
    }

    // Auxiliar de loadMemory
    // Actualiza la BD local con los datos obtenidos del servidor
    function updateMemoryFromServer(mems) {
      angular.forEach(mems, (serverRecalls) => {
        const localRecalls = getMemoryFromCollection(serverRecalls.card, false);
        if (!localRecalls) {
          // No existe datos locales para esa tarjeta: lo insertamos
          $log.debug(`Repasos del servidor incorporados a tarjeta nueva ${serverRecalls.card}`);
          memoryCollection.insert(new MemoryClass(serverRecalls));
        } else {
          // Sí hay datos: los modificamos con los nuevos datos del servidor
          mergeMemories(localRecalls, serverRecalls);
        }
      });
      if (mems.length) {
        $log.debug(`${mems.length} repasos del servidor incorporados.`);
        localDB.save();
        $window.localStorage.setItem('memSyncDate', dateTime.timestamp());
      }
    }

    // Auxiliar de updateMemoryFromServer
    // Actualiza los datos de recuerdo de la tarjeta local con los del servidor
    // local: Objeto de la clase MemoryClass – objeto de la BD local
    // server: Objeto obtenido del servidor
    function mergeMemories(local, server) {
      if (server.removed) {
        local.remove();
      }

      // Número de recalls que ya tenemos sincronizados
      const numLocals = lodash.filter(local.recalls, 'date').length;

      // Ignoramos los 'numLocals' primeros del servidor (al estar ordenados
      // cronológicamente, deben estar ya en el cliente)
      local.addRecalls(server.recalls.slice(numLocals));

      $log.debug(`Repasos del servidor mezclados en tarjeta ${local.card}`);
      // Nota: en este punto, local puede tener aún recalls no sincronizados
      // en sesiones anteriores (por tanto, sin propiedad date). De esto ya se
      // encargará loadMemory()
    }

    /* jshint ignore:start */

    // Sincroniza con el servidor los últimos cambios en memoryCollection
    // skip: nº de cambios que hay que saltarse (porque ya están sincronizados)
    // rerun: true si estamos reintentando o tratando nuevos cambios "solapados"
    // changes: array de cambios (objetos cambiados) a sincronizar
    // done: callback a llamar cuando se finalice la sincronización
    function privateSyncMemory({
      skip = 0,
      rerun = false,
      changes = null,
      done = angular.noop
    } = {}) {
      $log.debug(`Invocada privateSyncMemory(${skip},${rerun},${changes},${done})`);
      // No volver a ejecutar mientras se espera respuesta del servidor
      if (!rerun && isSynchronizingMemory) { return false; }
      isSynchronizingMemory = true;

      changes = changes || getMemoryChanges(skip);
      const changesBefore = memoryCollection.getChanges().length;
      const syncData = {
        fromDate: getLastMemorySyncDate(),
        changes: changes
      }

      $log.debug('Sincronizando cambios con memoryAPI:', changes);
      memoryAPI.sync(syncData).$promise.then((data) => {
        // Datos sincronizados correctamente
        $log.debug('Datos sincronizados con el servidor:', data);
        // Registramos la fecha de la última sincronización
        let date = lodash.last(lodash.last(data).recalls).date;
        if (!angular.isDate(date)) {
          date = new Date(date);
        }
        $window.localStorage.setItem('memSyncDate', date.getTime());

        // Incorporamos los _id y fecha generados en el servidor
        // y potencialmente repasos hechos en otros dispositivos

        // Las posibles inserciones no deben contar como cambios a sincronizar
        memoryCollection.setChangesApi(false);

        angular.forEach(data, (item) => {
          getMemoryFromCollection(item.card).sync(item);
        });

        memoryCollection.setChangesApi(true);

        // Comprobamos si ha habido nuevos cambios en nuestra "ausencia"
        const allChanges = memoryCollection.getChanges().length;

        // Si ha habido cambios nuevos mientras sincronizábamos
        if (changesBefore < allChanges) {
          $log.debug(`¡Hay ${allChanges - skip} nuevo(s) cambio(s) sin sincronizar!`);
          privateSyncMemory({ skip: changesBefore, rerun: true });
        } else {
          $log.debug('No hay más cambios. Descartando historial…');
          memoryCollection.flushChanges();
          localDB.save();
          isSynchronizingMemory = false;
          $log.debug('Sincronización finalizada correctamente.');
          done();
        }
      }).catch((response) => {
        // Error de sincronización. Comprobar el error:
        if (response.status !== 400 && response.status !== 500) {
          $log.error('Error en la sincronización. Reintentando en 15 s…');
          // Quizá estamos offline, volveremos a intentarlo pasados 15 segundos
          $timeout(() => privateSyncMemory({ skip: skip, rerun: true }), 15000);
        } else {
          isSynchronizingMemory = false;
          $log.debug('Sincronización finalizada con errores.');
          const msg = gettextCatalog.getString('Could\'t synchronize with server.');
          $mdToast.showSimple(msg);
        }
        done();
      });
    }

    // Auxiliar de privateSyncMemory
    // Devuelve un array con los objetos de memoryCollection insertados y/o
    // modificados, no sincronizados aún, exceptuando los "skip" primeros.
    function getMemoryChanges(skip) {
      const changes = memoryCollection.getChanges();
      // "Arrays asociativos", para quedarnos con la última versión de cada obj
      const inserts = {}, updates = {};

      for (let i = skip, len = changes.length; i < len; i++) {
        const props = ['_id', 'card', 'date', 'recallProbability', 'recalls'];
        const mem = _.pick(changes[i].obj, props);
        mem.recalls = _.reject(mem.recalls, '_id');
        if (mem._id !== undefined) {
          updates[mem._id] = mem;
        } else {
          inserts[mem.$loki] = mem;
        }
      }

      return lodash.values(inserts).concat(lodash.values(updates));
    }
    /* jshint ignore:end */
  });
