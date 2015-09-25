/* global beforeAll, windowBeforeTestSuite, afterAll, windowAfterTestSuite */

'use strict';

describe('Service: MemoryClass', function () {

  beforeAll(windowBeforeTestSuite);

  // load the service's module
  beforeEach(module('vivaverboApp'));
  // instantiate service
  const cardID = '2b0352b1572a9f36fbe1dbcb';
  let MemoryClass;

  beforeEach(inject(function (_MemoryClass_) {
    MemoryClass = _MemoryClass_;
  }));

  afterAll(windowAfterTestSuite);

  it('debe crear un objeto MemoryClass', function () {
    var f = () => {
      const memory = new MemoryClass(cardID);
      memory.synced = 0;
    };
    expect(f).toThrowError(TypeError,
      '[MemoryClass].synced sólo acepta valores booleanos');
  });

  it('debe crear un objeto MemoryClass', function () {
    const memory = new MemoryClass(cardID);
    expect(typeof memory).toBe('object');
    expect(memory.card).toBe(cardID);
    expect(memory.recalls).toEqual([]);
    expect(memory.recallProbability).toBe(0);
  });

  it('debe marcarse correctamente como sincronizado', function () {
    const memory = new MemoryClass(cardID);
    expect(typeof memory).toBe('object');
    expect(memory.synced).toBe(true);
    memory.synced = false;
    expect(memory.synced).toBe(false);
  });

  it('debe sincronizarse correctamente con objetos del servidor', function () {
    const memory = new MemoryClass(cardID);
    memory.sync({
      _id: '3D4F5A2B',
      recalls: [1, 2, 3],
      recallProbability: 0.5,
      removed: true
    });
    expect(memory.card).toBe(cardID);
    expect(memory._id).toBe('3D4F5A2B');
    expect(memory.recalls).toEqual([1, 2, 3]);
    expect(memory.recallProbability).toBe(0.5);
    expect(memory.synced).toBe(true);
  });

  it('debe añadir recalls y recalcular la prob. de recuerdo', function () {
    const memory = new MemoryClass(cardID);
    memory.addRecalls([ { recall: 1 } ]);
    expect(memory.recalls).toEqual([ { recall: 1 } ]);
    expect(memory.recallProbability).toBe(0.5);
    memory.addRecalls([ { recall: 1 } ]);
    expect(memory.recalls).toEqual([ { recall: 1 }, { recall: 1 } ]);
    expect(memory.recallProbability).toBe(0.75);
  });

  it('debe calcular correctamente la probabilidad de recuerdo', function () {
    expect(p([0])).toBe(0);
    expect(p([0, 1])).toEqual(0.5);
    expect(p([0, 1, 0])).toEqual(0.25);
    expect(p([0, 1, 0, 1])).toEqual(0.625);
    expect(p([0, 1, 0, 1, 1])).toEqual(0.8125);
    expect(p([1, 0, 0.5, 0.5, 1])).toEqual(0.71875);

    function p(recalls) {
      angular.forEach(recalls, (recall, i) => {
        recalls[i] = { recall: recall };
      });
      return (new MemoryClass({ recalls: recalls }))._getRecallProbability();
    }
  });

});
