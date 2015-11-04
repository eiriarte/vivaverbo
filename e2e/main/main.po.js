/**
 * This file uses the Page Object pattern to define the main page for tests
 * https://docs.google.com/presentation/d/1B6manhG0zEXkC-H-tPo2vwU06JhL8w9-XCF9oehXzAQ
 */

'use strict';

var MainPage = function() {
  this.toolbar = element(by.css('.main-toolbar .md-toolbar-tools'));
  this.sidenav = element(by.css('.sidenav .md-toolbar-tools h1'));
  this.backdrop = element(by.css('.md-sidenav-backdrop'));
  this.titulo = this.toolbar.element(by.css('h1'));
  this.btnLogout = this.toolbar.element(by.css('button.logout-btn'));
  this.btnMenu = this.toolbar.element(by.css('button.md-icon-button'));
  this.contador = element(by.css('.num-tarjeta'));
  this.tarjetas = element.all(by.repeater('tarjeta in repaso.tarjetas'));
  this.botonera = element(by.css('.repaso > div:last-of-type'));
  this.btnOlvido = element(by.css('.repaso button:nth-child(1)'));
  this.btnDuda = element(by.css('.repaso button:nth-child(2)'));
  this.btnRecuerdo = element(by.css('.repaso button:nth-child(3)'));
  this.finRepaso = element(by.css('.repaso > div:nth-child(3)'));
  this.nuevoRepaso = this.finRepaso.element(by.tagName('button'));
};

module.exports = new MainPage();

