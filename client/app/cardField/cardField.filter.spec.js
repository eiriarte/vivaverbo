'use strict';

describe('Filter: cardField', function () {

  // load the filter's module
  beforeEach(module('vivaverboApp'));

  // initialize a new instance of the filter before each test
  var cardField, reviewCard, $httpBackend;

  beforeEach(inject(function ($filter, _$httpBackend_) {
    $httpBackend = _$httpBackend_;
    cardField = $filter('cardField');
    reviewCard = { cardId: '7f4165957e457a5742a856fc' };
  }));

  afterAll(function() {
    localStorage.clear();
  });

  it('debe devolver el valor del campo solicitado', function () {
    $httpBackend.expectGET('/api/cards').respond(getCards());
    $httpBackend.expectGET(/\/api\/memory/).respond([]);
    $httpBackend.flush();
    expect(cardField(reviewCard, 'pregunta')).toBe('22');
    expect(cardField(reviewCard, 'respuesta')).toBe('enano');
    expect(cardField(reviewCard, 'frasePregunta')).toBe('veintidos');
    expect(cardField(reviewCard, 'fraseRespuesta')).
      toBe(`Thorin en \'El Hobbit\': sobre una montaña de oro, apilando oro, mirada de paranoico`);
  });

  it('debe devolver "–" si no encuentra la tarjeta o el campo', function () {
    $httpBackend.expectGET(/\/api\/memory/).respond([]);
    $httpBackend.flush();
    expect(cardField(reviewCard, 'NO_EXISTO')).toBe('–');
    expect(cardField({ cardId: 'NO_EXISTO' }, 'pregunta')).toBe('–');
  });
});
