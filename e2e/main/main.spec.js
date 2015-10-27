'use strict';

var config = browser.params;

describe('Main View', function() {
  var NUM_TARJETAS = 6;
  var page;

  beforeEach(function() {
    browser.ignoreSynchronization = false;
    browser.get(config.baseUrl + '/');
    browser.waitForAngular('Esperando a AngularJS');
    page = require('./main.po');
  });

  function tarjetaGirada(index, girada, tarjeta, actual) {
    var palabra = tarjeta.element(by.css('.palabra:first-of-type'));
    var frase = tarjeta.element(by.css('.frase:first-of-type'));
    var revPalabra = tarjeta.element(by.css('.palabra.reverso'));
    var revFrase = tarjeta.element(by.css('.frase.reverso'));
    if (index === actual) {
      expect(tarjeta.isDisplayed()).toBe(true, 'tarjeta actual visible');
      expect(palabra.isDisplayed()).toBe(true, 'palabra visible');
      expect(frase.isDisplayed()).toBe(true, 'frase visible');
      palabra.getText().then(function(texto) {
        expect(texto.length).toBeGreaterThan(0, 'palabra de 1+ caracteres');
      });
      frase.getText().then(function(texto) {
        expect(texto.length).toBeGreaterThan(0, 'frase de 1+ caracteres');
      });
      expect(revPalabra.isPresent()).toBe(girada, 'reverso de palabra');
      expect(revFrase.isPresent()).toBe(girada, 'reverso de frase');
    } else {
      expect(tarjeta.isDisplayed()).toBe(false, 'tarjeta (' + index + ') no actual (' + actual + ') no visible');
    }
    expect(page.botonera.isDisplayed()).toBe(girada, 'visibilidad de botonera');
  }

  it('debe mostrar la toolbar, el contador y una tarjeta', function() {
    expect(page.titulo.getText()).toBe('Sistema mayor');
    //expect(page.btnLogout.getText()).toBe('LOGOUT');
    expect(page.contador.getText()).toBe('0/' + NUM_TARJETAS);
    expect(page.tarjetas.count()).toBe(NUM_TARJETAS);
    page.tarjetas.each(function(tarjeta, index) {
      tarjetaGirada(0, false, tarjeta, index);
    });
  });

  it('debe desplegarse el menú', function() {
    // Sidenav cerrada
    expect(page.sidenav.isDisplayed()).toBe(false, 'Sidebar pre-click');

    // Abrir sidenav
    page.btnMenu.click();
    browser.sleep(3000);
    browser.ignoreSynchronization = true;
    expect(page.sidenav.isDisplayed()).toBe(true, 'Sidebar abierta');

    // Cerrar sidenav
    var backdrop = browser.driver.findElement(by.css('.md-sidenav-backdrop'));
    backdrop.click();
    browser.sleep(3000);
    expect(page.sidenav.isDisplayed()).toBe(false, 'Sidebar cerrada');
  });

  it('debe girar la tarjeta', function() {
    page.tarjetas.get(0).click();
    page.tarjetas.each(function(tarjeta, index) {
      tarjetaGirada(0, true, tarjeta, index);
    });
  });

  it('debe pasar a las siguientes tarjetas', function() {
    var n = 0, idx;
    for (var i = 0; i < NUM_TARJETAS; i++) {
      page.tarjetas.get(i).click();
      page.btnRecuerdo.click();
      console.log('.each() invocado. i=' + i);
      page.tarjetas.each(function(tarjeta, index) {
        // Hacemos que idx = i (el valor de i al encolarse cada each())
        idx = Math.floor(n / NUM_TARJETAS);
        console.log('.each() callback. idx=' + idx + ', index=' + index);
        if (idx < NUM_TARJETAS - 1) {
          tarjetaGirada(idx + 1, false, tarjeta, index);
          expect(page.finRepaso.isDisplayed()).toBe(false, 'repaso no finalizado: idx=' + idx + ', index=' + index);
        }
        n++;
      });
    }
    expect(page.tarjetas.get(NUM_TARJETAS - 1).isDisplayed()).toBe(false, 'tarjeta final no visible');
    expect(page.botonera.isDisplayed()).toBe(false, 'botonera no visible');
    expect(page.finRepaso.isDisplayed()).toBe(true, 'repaso finalizado');
  }, 180000);

  it('debe hacer logout', function() {
    var divLogin;
    page.btnLogout.click();
    browser.sleep(3000);
    divLogin = browser.driver.findElement(by.id('login'));
    expect(divLogin.isDisplayed()).toBe(true, 'sale a landing page');
  });
});
