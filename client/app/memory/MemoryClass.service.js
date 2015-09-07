'use strict';

angular.module('vivaverboApp')
  .factory('MemoryClass', function () {
    class Memory {
      constructor (card) {
        if (angular.isObject(card)) {
          angular.extend(this, card);
        } else {
          this.card = card;
          this.recalls = [];
          this.recallProbability = 0;
        }
        this.isSynced = true;
      }
      // synced: true si esta memoria está sincronizada con el servidor
      get synced() {
        return this.isSynced;
      }
      set synced(val) {
        if (typeof val !== 'boolean') {
          throw new TypeError('[MemoryClass].synced sólo acepta valores booleanos');
        }
        this.isSynced = val;
      }
      // Elimina la tarjeta de posteriores repasos ("demasiado fácil")
      remove() {
        this.removed = true;
      }
      // Añade identificadores procedentes de la sincronización con el servidor
      // server: objeto de la colección 'memory' procedente del servidor
      sync(server) {
        this._id = server._id;
        this.recalls = server.recalls;
        this.recallProbability = server.recallProbability;
        if (server.removed) {
          this.removed = true;
        }
        this.isSynced = true;
      }
      // Añade uno o varios recalls al objeto y (re)-calcula la
      // probabilidad de recuerdo
      // recalls: array de objetos recall
      addRecalls(recalls) {
        this.recalls = this.recalls.concat(recalls);
        this.recallProbability = this._getRecallProbability();
      }
      // Método privado
      // Calcula la probabilidad de la tarjeta de ser recordada la próxima vez
      // Ver paper (2000, Mizuno): http://ci.nii.ac.jp/naid/110002982185/
      _getRecallProbability() {
        const n = this.recalls.length;

        // Sum((2^-(n-i)) * recall)
        return this.recalls.
          map((item, i) => item.recall / Math.pow(2, n - i)).
          reduce((previous, current) => previous + current, 0);
      }
    }

    return Memory;
  });
