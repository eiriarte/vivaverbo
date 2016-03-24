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
      }
      /**
       * Elimina la tarjeta de posteriores repasos ("demasiado fácil")
       */
      remove() {
        this.removed = true;
      }
      /**
       * Añade uno o varios recalls al objeto y (re)-calcula la probabilidad
       * de recuerdo
       * @param {array} recalls - Array de objetos recall
       */
      addRecalls(recalls) {
        this.recalls = this.recalls.concat(recalls);
        this.recallProbability = this._getRecallProbability();
      }
      /**
       * @private
       * Calcula la probabilidad de la tarjeta de ser recordada la próxima vez
       * @see (2000, Mizuno): http://ci.nii.ac.jp/naid/110002982185/
       * @returns {number} Probabilidad calculada
       */
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
