'use strict';

angular.module('vivaverboApp')
  .factory('memory', function ($log, localDB, Collection, MemoryClass) {

    const memory = new Collection('memory', {
      query: { fromDate: 0 },
      id: ['_id', 'card'],
      sync: true,
      proto: MemoryClass
    });

    angular.extend(memory, {
      /* *********************************************************************
       * Marca el grado de recuerdo actual de la tarjeta actual del repaso
       *
       * @param {string} id - Id de la tarjeta
       * @param {number} recuerdo - Grado de recuerdo (0, 1, 0.5)
       * @param {boolean} remove - (Opcional) No mostrar en el futuro. Por defecto: false
       * @returns {number} Probabilidad de recuerdo actualizada de la tarjeta.
       * *********************************************************************/
      addRecall(id, recuerdo, remove = false) {
        const mem = this.findById(id) || new MemoryClass(id);

        $log.debug(`Actualizando recuerdo ${id}`);
        mem.addRecalls([{ recall: recuerdo }]);
        if (remove) {
          mem.remove();
        }

        this.update(mem, 'upsert');

        localDB.save();
        this.sync();

        return mem.recallProbability;
      }
    });

    return memory;
  });
