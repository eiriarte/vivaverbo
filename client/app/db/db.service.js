'use strict';

angular.module('vivaverboApp')
  .factory('db',
      function ($resource, $q, $timeout, $log, $window, $mdToast,
        gettextCatalog, Loki, lodash, User, MemoryClass, dateTime) {
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
      /* **********************************************************************
       * Guarda "persiste" la base de datos
       * **********************************************************************/
      save() {
        lokiDB.saveDatabase();
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
       * Devuelve la tarjeta con identificador "id"
       * **********************************************************************/
      getCard(id) {
        return cardsCollection.findOne({ _id: id });
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
        const changes = memoryCollection.getChanges();
        $log.debug('Cambios: ', changes);
      },
      /* *********************************************************************
       * Devuelve (promete) una array con las próximas tarjetas a repasar
       * tarjetasPorRepaso: nº total de tarjetas a repasar
       * nuevasPorRepaso: nº de tarjetas a incluir, no repasadas previamente
       * *********************************************************************/
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
        }).catch(() => {
          deferred.reject();
        });
        return deferred.promise;
      },
      /* *******************************************************************
       * Sincroniza el objeto User local con el del servidor.
       * Devuelve el objeto más actualizado.
       * serverUser: objeto User del servidor
       * *******************************************************************/
      syncUser(serverUser) {
        const localUser = angular.fromJson($window.localStorage.getItem('usr'));
        if (null === localUser) {
          // Aún no hay copia local: la creamos
          $log.debug('Creando copia de User en localStorage');
          $window.localStorage.setItem('usr', angular.toJson(serverUser));
          return serverUser;
        } else {
          serverUser.updated = new Date(serverUser.updated);
          localUser.updated = new Date(localUser.updated);
          if (serverUser.review.fecha) {
            serverUser.review.fecha = new Date(serverUser.review.fecha);
          }
          if (localUser.review.fecha) {
            localUser.review.fecha = new Date(localUser.review.fecha);
          }
          if (localUser.updated < serverUser.updated) {
            // El objeto en el cliente está desactualizado
            $log.debug('Actualizando copia de User en localStorage');
            $window.localStorage.setItem('usr', angular.toJson(serverUser));
            return serverUser;
          } else if (localUser.updated > serverUser.updated) {
            // El objeto en el servidor está desactualizado
            $log.debug('Actualizando objeto User en el servidor');
            User.update(localUser).$promise.then(() => {
              $log.debug('Objeto User actualizado en el servidor');
            }).catch(() =>{
              $log.error('Actualización de objeto User en el servidor falló');
            });
            return localUser;
          } else {
            // Los objetos en cliente y servidor coinciden
            $log.debug('Objetos User en servidor y cliente coinciden.');
            return localUser;
          }
        }
      },
      /* *********************************************************************
       * Persiste el objeto User en almacenamiento local y en el servidor
       * user: objeto User modificado a persistir
       * *********************************************************************/
      updateUser(user) {
        user.updated = dateTime.now();
        $window.localStorage.setItem('usr', angular.toJson(user));
        User.update(user).$promise.then(() => {
          $log.debug('Cambios en User persistidos en el servidor.');
        }).catch(() => {
          $log.error('Actualización de cambios en User en el servidor falló.');
        });
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
        cardsCollection = lokiDB.getCollection('cards');
        memoryCollection = lokiDB.getCollection('memory');
        if (!cardsCollection || 0 === cardsCollection.count()) {
          // No tenemos BD local: la creamos
          cardsCollection = cardsCollection || lokiDB.addCollection('cards');
          memoryCollection = memoryCollection || lokiDB.addCollection('memory', {
            disableChangesApi: false
          });

          $log.debug('Obteniendo tarjetas del servidor…');
          // Cargamos las tarjetas del servidor
          cardsAPI.query().$promise.then((cards) => {
            $log.debug('Insertando tarjetas en DB Loki…');
            cardsCollection.insert(cards);
            deferred.resolve();
            lokiDB.saveDatabase();
          }).catch(() => {
            $log.error('Error cargando las tarjetas del servidor.');
            deferred.reject();
          });

        } else {
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

        // Los cambios de la sincronización no son cambios a sincronizar!!!
        memoryCollection.setChangesApi(false);

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
          privateSyncMemory({
            changes: changes,
            done: () => {
              memoryCollection.setChangesApi(true);
            }
          });
          /* jshint ignore:end */
        }
      }).catch(() => {
        $log.error('Error al cargar datos de sincronización de memoria');
        const msg1 = gettextCatalog.getString('Could\'t synchronize with server.');
        const msg2 = gettextCatalog.getString('We\'ll try next time.');
        $mdToast.showSimple(msg1).then(() => $mdToast.showSimple(msg2));
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
          lokiDB.saveDatabase();
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
