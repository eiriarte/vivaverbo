'use strict';

angular.module('vivaverboApp')
  .factory('db', function ($log, $localStorage, User, localDB, dateTime) {

    // Public API
    return {
      /* *******************************************************************
       * Sincroniza el objeto User local con el del servidor.
       * Devuelve el objeto más actualizado.
       * serverUser: objeto User del servidor
       * *******************************************************************/
      syncUser(serverUser) {
        const localUser = $localStorage.user;
        if (!localUser) {
          // Aún no hay copia local: la creamos
          $log.debug('Creando copia de User en localStorage');
          $localStorage.user = serverUser;
          return serverUser;
        } else {
          if (localUser.email === serverUser.email) {
            serverUser.updated = new Date(serverUser.updated);
            localUser.updated = new Date(localUser.updated);
            setDates(serverUser.reviews);
            setDates(localUser.reviews);
            if (localUser.updated < serverUser.updated) {
              // El objeto en el cliente está desactualizado
              $log.debug('Actualizando copia de User en localStorage');
              $localStorage.usr = serverUser;
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
          } else {
            $log.debug('Entrando con distinto usuario. RESET!');
            return resetUser(serverUser);
          }
        }
      },
      /* *********************************************************************
       * Persiste el objeto User en almacenamiento local y en el servidor
       * user: objeto User modificado a persistir
       * *********************************************************************/
      updateUser(user) {
        user.updated = dateTime.now();
        $localStorage.user = user;
        User.update(user).$promise.then(() => {
          $log.debug('Cambios en User persistidos en el servidor.');
        }).catch(() => {
          $log.error('Actualización de cambios en User en el servidor falló.');
        });
      }
    };

    /**
     * Se asegura de que las propiedades .fecha del array de repasos son
     * objetos Date
     * @param {array} reviews - Array de objetos (repasos)
     */
    function setDates(reviews) {
      reviews.forEach((review) => {
        if (review.fecha) {
          review.fecha = new Date(review.fecha);
        }
      });
    }

    /**
     * Resetea los datos del usuario (anterior)
     * @param {object} serverUser - Usuario actual
     */
    function resetUser(serverUser) {
      localDB.whenReady.then(() => {
        localDB.removeCollection('memory');
        localDB.save();
        if ($localStorage.syncDates) {
          delete $localStorage.syncDates.memory;
        }
        $localStorage.usr = serverUser;
      });
      return serverUser;
    }
  });
