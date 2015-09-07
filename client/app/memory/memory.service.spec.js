'use strict';

describe('Service: memoryService', function () {
  const tarjetasPorRepaso = 15;

  // load the service's module
  beforeEach(module('vivaverboApp'));

  beforeEach(function() {
    // Simula el "bootstrapping" de los datos de usuarios al cargar index.html
    // getUser() definida en dev-app.js
    window.user = getUser({ tarjetas: tarjetasPorRepaso });
  });

  // instantiate service
  var db, memoryService, $httpBackend, $rootScope;
  beforeEach(inject(
        function (_$httpBackend_, _$rootScope_, _memoryService_, _db_) {
          db = _db_;
          $httpBackend = _$httpBackend_;
          memoryService = _memoryService_;
          $rootScope = _$rootScope_;
        }));

  afterAll(function() {
    localStorage.clear();
  });

  it('debe generar un nuevo repaso', function () {
    const promise = memoryService.newReview();
    promise.then(function(review) {
      expect(typeof review).toBe('object');
      expect(typeof review.tarjetas).toBe('object');
      expect(review.tarjetas.length).toBe(tarjetasPorRepaso);
      expect(review.totalTarjetas).toBe(tarjetasPorRepaso);
    });
    $httpBackend.expectGET('/api/cards').respond(getCards());
    $httpBackend.expectGET(/\/api\/memory/).respond([]);
    $httpBackend.flush();
    $rootScope.$digest();
  });

  it('debe marcar el grado de recuerdo', function () {
    $httpBackend.expectGET(/\/api\/memory/).respond([]);
    $httpBackend.flush();
    $rootScope.$digest();
    $httpBackend.expectPOST('/api/memory').respond(getMemories);
    const promise = memoryService.newReview();
    promise.then(function(review) {
      const id = review.tarjetas[review.tarjetaActual].cardId;
      let prob = memoryService.addRecall(review, 1, true);
      expect(prob).toBe(0.5);
      expect(db.getMemory(id).recalls).toEqual([{ recall: 1 }]);
      expect(db.getMemory(id).removed).toBe(true);
    });
    $rootScope.$digest();
  });

});
