'use strict';

angular.module('vivaverboApp')
  .factory('db',
      function ($resource, $q, $timeout, $log, $window, Loki, lodash, MemoryClass) {
    // Service logic
    const lokiDB = new Loki('vivaverbo.db');
    const cardsAPI = $resource('/api/cards');
    const memoryAPI = $resource('/api/memory', null, {
      sync: { method: 'POST', isArray: true }
    });
    let cardsCollection, memoryCollection;
    /* jshint ignore:start */
    let isSynchronizingMemory = false;
    /* jshint ignore:end */

    const dbReady = loadDB();
    dbReady.then(() => {
      loadMemory(getLastMemorySyncDate());
    });

    // Public API
    return {
      // Guarda "persiste" la base de datos
      save() {
        lokiDB.saveDatabase();
      },
      // Se asegura de tener los datos sincronizados con el servidor
      sync() {
        /* jshint ignore:start */
        syncMemory();
        /* jshint ignore:end */
      },
      // Devuelve la tarjeta con identificador "id"
      getCard(id) {
        return cardsCollection.findOne({ _id: id });
      },
      // Devuelve el documento de memoryCollection para la tarjeta "id"
      getMemory(id) {
        return getMemoryFromCollection(id);
      },
      // Actualiza/inserta el objeto en la BD (para reindexar, Changes API, etc.)
      // mem: Objeto de la clase MemoryClass
      updateMemory(mem) {
        mem.synced = false;
        if (mem.hasOwnProperty('$loki')) {
          memoryCollection.update(mem);
        } else {
          memoryCollection.insert(mem);
        }
        const changes = memoryCollection.getChanges();
        $log.debug('Cambios: ', changes);
      },
      // Devuelve (promete) una array con las próximas tarjetas a repasar
      newReviewCards(tarjetasPorRepaso, nuevasPorRepaso) {
        const deferred = $q.defer();
        dbReady.then(() => {
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

          deferred.resolve(repaso.concat(nuevas));
        });
        return deferred.promise;
      }
    };


    /* **********************************************************************
     *
     *  Funciones privadas
     *
     * **********************************************************************/

    // Devuelve la fecha de la última sincronización de memory con el servidor
    // Si no hay última sincronización, se devuelve 1970-01-01
    function getLastMemorySyncDate() {
      const timestamp = $window.localStorage.getItem('memSyncDate') || '0';
      return new Date(parseInt(timestamp));
    }

    // Devuelve el objeto de memoryCollection para la tarjeta "id"
    // create: Crea un objeto nuevo si no existe en la colección
    function getMemoryFromCollection(id, create = true) {
      let mem = memoryCollection.findOne({ card: id });
      if (create && !mem) {
        mem = memoryCollection.insert(new MemoryClass(id));
      }
      return mem;
    }

    // Carga, o crea e inicializa, la base de datos local
    function loadDB() {
      const deferred = $q.defer();
      lokiDB.loadDatabase({
        memory: {
          proto: MemoryClass
        }
      }, () => {
        const numCollections = lokiDB.listCollections().length;
        if (0 === numCollections) {
          // No tenemos BD local: la creamos
          cardsCollection = lokiDB.addCollection('cards');
          memoryCollection = lokiDB.addCollection('memory', {
            disableChangesApi: false
          });

          $log.debug('Obteniendo tarjetas del servidor…');
          // Cargamos las tarjetas del servidor
          cardsAPI.query().$promise.then((cards) => {
            $log.debug('Insertando tarjetas en DB Loki…');
            cardsCollection.insert(cards);
            deferred.resolve();
            lokiDB.saveDatabase();
          });

        } else {
          $log.debug('Obteniendo tarjetas de almacén local…');
          cardsCollection = lokiDB.getCollection('cards');
          memoryCollection = lokiDB.getCollection('memory');
          deferred.resolve();
        }
      });
      return deferred.promise;
    }

    // Carga/sincronización inicial de los datos de recuerdo de las tarjetas
    // Se ejecuta al instanciar el servicio
    function loadMemory(lastSync) {
      // Obtenemos los datos nuevos del servidor (si los hay)
      memoryAPI.query({ fromDate: lastSync }).$promise.then((mems) => {
        // Datos de recuerdo locales que no se sincronizaron la sesión anterior
        const changes = memoryCollection.find({ 'synced': { $ne: true } });

        // Actualizamos los datos locales con los obtenidos del servidor
        updateMemoryFromServer(mems);

        if (0 === changes.length) {
          $log.debug('No hay cambios de datos de recuerdo que sincronizar');
          // No hay datos locales sin sincronizar: hemos acabado
          memoryCollection.setChangesApi(true);
        } else {
          $log.debug(`Detectados ${changes.length} cambios sin sincronizar`);
          // Actualizamos los datos del servidor con los datos nuevos locales
          /* jshint ignore:start */
          syncMemory({
            changes: changes,
            done: () => {
              memoryCollection.setChangesApi(true);
            }
          });
          /* jshint ignore:end */
        }
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
        lokiDB.saveDatabase();
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
    function syncMemory({
      skip = 0,
      rerun = false,
      changes = null,
      done = () => {}
    } = {}) {
      $log.debug(`Invocada syncMemory(${skip},${rerun},${changes},${done})`);
      // No volver a ejecutar mientras se espera respuesta del servidor
      if (!rerun && isSynchronizingMemory) { return false; }
      isSynchronizingMemory = true;

      changes = changes || getMemoryChanges(skip);
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
        skip += changes.length;

        // Si ha habido cambios nuevos mientras sincronizábamos
        if (skip < allChanges) {
          $log.debug(`¡Hay ${allChanges - skip} nuevo(s) cambio(s) sin sincronizar!`);
          syncMemory({ skip: skip, rerun: true });
        } else {
          $log.debug('No hay más cambios. Descartando historial…');
          memoryCollection.flushChanges();
          lokiDB.saveDatabase();
          isSynchronizingMemory = false;
          $log.debug('Sincronización finalizada correctamente.');
          done();
        }
      }).catch((response) => {
        // Error de sincronización. Comprobar el error:
        const esInesperado = true;
        if (esInesperado) {
          $log.error('Error en la sincronización. Reintentando en 15 s…');
          // Quizá estamos offline, volveremos a intentarlo pasados 15 segundos
          $timeout(() => syncMemory({ skip: skip, rerun: true }), 15000);
        } else {
          isSynchronizingMemory = false;
          $log.debug('Sincronización finalizada con errores.');
        }
        done();
      });
    }

    // Auxiliar de syncMemory
    // Devuelve un array con los objetos de memoryCollection insertados y/o
    // modificados, no sincronizados aún, exceptuando los "skip" primeros.
    function getMemoryChanges(skip) {
      const changes = memoryCollection.getChanges();
      // "Arrays asociativos", para quedarnos con la última versión de cada obj
      const inserts = {}, updates = {};

      for (let i = skip, len = changes.length; i < len; i++) {
        const mem = changes[i].obj;
        if (mem._id !== undefined) {
          updates[mem._id] = mem;
        } else {
          inserts[mem.$loki] = mem;
        }
      }

      return lodash.values(inserts).concat(lodash.values(updates));
    }
    /* jshint ignore:end */

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
