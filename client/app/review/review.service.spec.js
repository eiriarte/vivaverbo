'use strict';

describe('Service: reviewService', function () {
  const tarjetasPorRepaso = 10;

  // load the service's module
  beforeEach(module('vivaverboApp'));

  beforeEach(function() {
    // Simula el "bootstrapping" de los datos de usuarios al cargar index.html
    // getUser() definida en dev-app.js
    window.user = getUser();
  });

  // instantiate service
  let reviewService, repaso;
  let $httpBackend, $rootScope;

  beforeEach(inject(function (_$httpBackend_) {
    $httpBackend = _$httpBackend_;
  }));

  beforeEach(inject(function (_reviewService_, _$rootScope_) {
    $rootScope = _$rootScope_;
    reviewService = _reviewService_;
    repaso = reviewService.repaso;
  }));

  afterAll(function() {
    localStorage.clear();
  });

  it('debe cargar y contabilizar el número deseado de tarjetas', function () {
    $httpBackend.expectGET('/api/cards').respond(getCards());
    $httpBackend.expectGET(/\/api\/memory/).respond([]);
    $rootScope.$digest();
    $httpBackend.flush();
    const lengthTarjetas = repaso.tarjetas.length;
    const total = repaso.totalTarjetas;

    expect(lengthTarjetas).toBe(total);
    expect(lengthTarjetas).toBeGreaterThan(0);
    expect(total).toBe(tarjetasPorRepaso);
  });

  it('debe tener la propiedad "repaso"  de sólo lectura', function () {
    var f = function() {
      reviewService.repaso = repaso;
    }
    expect(f).toThrowError(TypeError,
      'setting a property that has only a getter');
  });

  it('debe marcar correctamente el grado de recuerdo', function() {
    $httpBackend.expectGET(/\/api\/memory/).respond([]);
    $rootScope.$digest();
    $httpBackend.flush();
    const total = repaso.totalTarjetas;

    expect(repaso.finalizado).toBe(false, 'porque acabamos de empezar');
    expect(repaso.tarjetaActual).toBe(0);
    expect(repaso.totalAprendidas).toBe(0);

    // Recordada, pero no perfectamente:
    reviewService.marcar(0.5);
    expect(repaso.totalAprendidas).toBe(0);
    expect(repaso.tarjetaActual).toBe(1);
    // Cuatro aciertos (o borrados) a la primera => cuatro tarjetas aprendidas:
    reviewService.marcar(1);
    reviewService.marcar(1, true);
    reviewService.marcar(1);
    reviewService.marcar(1, true);
    expect(repaso.totalAprendidas).toBe(4);
    expect(repaso.tarjetaActual).toBe(5);
    // Cuatro fallos seguidos forzarán iniciar una nueva ronda de repaso:
    reviewService.marcar(0);
    reviewService.marcar(0);
    reviewService.marcar(0);
    reviewService.marcar(0);
    expect(repaso.totalAprendidas).toBe(4);
    expect(repaso.tarjetaActual).toBe(0);
    expect(repaso.finalizado).toBe(false);

    // Primer recuerdo en siguientes intentos => aún no aprendidas:
    reviewService.marcar(1);
    expect(repaso.tarjetaActual).toBe(5);
    reviewService.marcar(1);
    reviewService.marcar(1);
    reviewService.marcar(1);
    reviewService.marcar(1);
    expect(repaso.totalAprendidas).toBe(4);
    expect(repaso.tarjetaActual).toBe(9);
    // Acierto a la primera (tarjeta no vista en la anterior ronda):
    reviewService.marcar(1);
    expect(repaso.totalAprendidas).toBe(5);
    // Al ser la última, pasamos a la siguiente ronda
    expect(repaso.tarjetaActual).toBe(0);
    expect(repaso.finalizado).toBe(false);

    // Recuerdo definitivo del resto [0, 5-8]
    reviewService.marcar(1);
    reviewService.marcar(1);
    reviewService.marcar(1);
    reviewService.marcar(1);
    reviewService.marcar(1);
    expect(repaso.totalAprendidas).toBe(10);
    expect(repaso.finalizado).toBe(true);
    expect(repaso.tarjetaActual).
      not.toBeDefined('porque ha pasado de la última tarjeta');
  });
});
