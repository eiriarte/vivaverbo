'use strict';

describe('Directive: vvCard', function () {

  beforeAll(windowBeforeTestSuite);
  // load the directive's module and view
  beforeEach(module('vivaverboApp'));
  beforeEach(module('app/vvCard/vvCard.html'));

  var element, scope;

  let $httpBackend;

  beforeEach(inject(function (_$httpBackend_) {
    $httpBackend = _$httpBackend_;
  }));

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  afterAll(windowAfterTestSuite);

  it('debe mostrar una tarjeta normal', inject(function ($compile) {
    $httpBackend.whenGET('/api/cards').respond(getCards());
    $httpBackend.whenGET('/api/categories').respond(getCategories());
    element = angular.element('<vv-card vv-girada="estado.girada" vv-tarjeta="tarjeta"></vv-card>');
    scope.estado = { girada: false };
    scope.tarjeta = {
      _id: "55f2f2a044cdb68ec24389ec",
      frasePregunta: "dieciocho",
      fraseRespuesta: "Johnny Depp como 'Eduardo Manostijeras'",
      freq: 82,
      pregunta: "18",
      respuesta: "Depp"
    };
    element = $compile(element)(scope);
    scope.$apply();
    expect(angular.element(element.find('h1')[0]).text()).toBe('18');
    expect(angular.element(element.find('h1')[1]).text()).toBe('Depp');
    expect(angular.element(element.find('h1')[0]).hasClass('reverso')).toBe(false);
    expect(angular.element(element.find('h1')[1]).hasClass('ng-hide')).toBe(true);
    expect(angular.element(element.find('p')[0]).text()).toBe('dieciocho');
    expect(angular.element(element.find('p')[1]).text()).toBe('Johnny Depp como \'Eduardo Manostijeras\'');
    expect(angular.element(element.find('p')[0]).hasClass('reverso')).toBe(false);
    expect(angular.element(element.find('p')[1]).hasClass('ng-hide')).toBe(true);
  }));

  it('debe mostrar una tarjeta girada', inject(function ($compile) {
    $httpBackend.whenGET('/api/cards').respond(getCards());
    $httpBackend.whenGET('/api/categories').respond(getCategories());
    element = angular.element('<vv-card vv-girada="estado.girada" vv-tarjeta="tarjeta"></vv-card>');
    scope.estado = { girada: true };
    scope.tarjeta = {
      _id: "55f2f2a044cdb68ec24389ec",
      frasePregunta: "dieciocho",
      fraseRespuesta: "Johnny Depp como 'Eduardo Manostijeras'",
      freq: 82,
      pregunta: "18",
      respuesta: "Depp"
    };
    element = $compile(element)(scope);
    scope.$apply();
    expect(angular.element(element.find('h1')[0]).text()).toBe('18');
    expect(angular.element(element.find('h1')[1]).text()).toBe('Depp');
    expect(angular.element(element.find('h1')[0]).hasClass('reverso')).toBe(true);
    expect(angular.element(element.find('h1')[1]).hasClass('ng-hide')).toBe(false);
    expect(angular.element(element.find('p')[0]).text()).toBe('dieciocho');
    expect(angular.element(element.find('p')[1]).text()).toBe('Johnny Depp como \'Eduardo Manostijeras\'');
    expect(angular.element(element.find('p')[0]).hasClass('reverso')).toBe(true);
    expect(angular.element(element.find('p')[1]).hasClass('ng-hide')).toBe(false);
  }));
});
