'use strict';

describe('Service: dateTime', function () {
  // Hora local
  const now = Date.now();

  beforeAll(windowBeforeTestSuite);

  beforeAll(function() {
    // La hora local es un segundo más que la del servidor
    window.dtDate = now - 1000;
  });

  // load the service's module
  beforeEach(module('vivaverboApp'));

  // instantiate service
  var dateTime;
  beforeEach(inject(function (_dateTime_) {
    dateTime = _dateTime_;
  }));

  afterAll(windowAfterTestSuite);

  it('debe devolver una fecha', function() {
    expect(angular.isDate(dateTime.now())).toBe(true);
  });

  it('debe calcular el timestamp', function () {
    const ts = dateTime.timestamp();
    expect(typeof ts).toBe('number');
    expect(ts).toBeLessThan(now);
  });

  it('debe calcular la fecha de hoy (a las 00:00:00.000)', function () {
    const todayServer = dateTime.today();
    const nowClient = new Date(now);
    expect(todayServer.getDate()).toBe(nowClient.getDate());
    expect(todayServer.getMonth()).toBe(nowClient.getMonth());
    expect(todayServer.getFullYear()).toBe(nowClient.getFullYear());
    expect(todayServer.getHours()).toBe(0);
    expect(todayServer.getMinutes()).toBe(0);
    expect(todayServer.getSeconds()).toBe(0);
    expect(todayServer.getMilliseconds()).toBe(0);
  });
});
