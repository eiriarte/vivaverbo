/* global beforeAll, windowBeforeTestSuite, afterAll, windowAfterTestSuite, getCards */

'use strict';

describe('Controller: ReviewController', function () {
  // load the controller's module
  beforeEach(module('vivaverboApp'));

  let ReviewController, scope, $rootScope;
  let $httpBackend;

  beforeAll(windowBeforeTestSuite);

  beforeEach(inject(function (_$httpBackend_) {
    $httpBackend = _$httpBackend_;
  }));

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, _$rootScope_, reviewService) {
    $rootScope = _$rootScope_;
    scope = $rootScope.$new();
    ReviewController = $controller('ReviewController', {
      $scope: scope,
      reviewService: reviewService
    });
  }));

  afterAll(windowAfterTestSuite);

  it('debe cargar y contabilizar tarjetas', function() {
    // GET /api/cards
    $httpBackend.whenGET('/api/cards').respond(getCards());
    $httpBackend.whenGET('/api/categories').respond(getCategories());
    $httpBackend.whenGET(/\/api\/memory/).respond([]);
    $httpBackend.whenPOST('/api/users/me').respond(200);
    $rootScope.$digest();
    $httpBackend.flush();
    let lengthTarjetas = scope.repaso.tarjetas.length;
    let total = scope.repaso.totalTarjetas;

    expect(lengthTarjetas).toBe(total);
    expect(lengthTarjetas).toBeGreaterThan(0);
  });

  it('debe girar tarjetas', function() {
    scope.girar();
    expect(scope.estado.girada).toBe(true);
  });

  it('debe llegar al final', function() {
    $httpBackend.expectPOST('/api/users/me').respond(200);
    $httpBackend.expectGET(/\/api\/memory/).respond([]);
    $rootScope.$digest();
    $httpBackend.flush();
    let total = scope.repaso.totalTarjetas;

    expect(scope.repaso.finalizado).toBe(false, 'porque acabamos de empezar');
    expect(scope.estado.girada).toBe(false,
      'porque aún no hemos girado la primera tarjeta');
    expect(scope.repaso.tarjetaActual).toBe(0);

    for (let i = 0; i < total; i++) {
      scope.girar();
      expect(scope.estado.girada).toBe(true);
      // Marcamos las pares, borramos las impares
      if (0 === i % 2) {
        scope.marcar(1);
      } else {
        scope.borrar({ stopPropagation: () => true });
      }
      if (i < total - 1) {
        expect(scope.repaso.finalizado).toBe(false, 'porque no hemos llegado a la última tarjeta');
        expect(scope.repaso.tarjetaActual).toBe(i + 1);
        expect(scope.estado.girada).toBe(false, 'porque no hemos girado aún la siguiente tarjeta');
      }
    }

    expect(scope.repaso.finalizado).toBe(true);
    expect(scope.repaso.totalAprendidas).toBe(total, 'porque están todas aprendidas');
    expect(scope.repaso.tarjetaActual).not.toBeDefined('porque ha pasado de la última tarjeta');
  });

});
