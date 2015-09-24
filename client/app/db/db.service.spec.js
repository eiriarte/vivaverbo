'use strict';

describe('Service: db', function () {

  beforeAll(windowBeforeTestSuite);

  // load the service's module
  beforeEach(module('vivaverboApp'));

  // instantiate service
  var db, $rootScope, $httpBackend;

  beforeEach(inject(function (_$httpBackend_) {
    $httpBackend = _$httpBackend_;
  }));

  beforeEach(inject(function (_$rootScope_, _db_) {
    $rootScope = _$rootScope_;
    db = _db_;
  }));

  afterAll(windowAfterTestSuite);

  it('debe devolver la tarjeta con el id indicado', function () {
    $httpBackend.expectGET('/api/cards').respond(getCards());
    // getMemory() definida en dev-app.js
    $httpBackend.expectGET(/\/api\/memory/).respond(getMemory());
    $httpBackend.whenPOST('/api/users/me').respond(200);
    $rootScope.$digest();
    $httpBackend.flush();
    const card = db.getCard('7ba38c1bee91f1a74a515c87');
    expect(card.pregunta).toBe('14');
    expect(card.respuesta).toBe('Thor');
    expect(card.fraseRespuesta).toBe('Thor de Marvel: girando el martillo, golpeando el suelo…');
    expect(card.freq).toBe(86);
    expect(card._id).toBe('7ba38c1bee91f1a74a515c87');
  });

  it('debe devolver las tarjetas de repaso solicitadas', function () {
    $httpBackend.expectGET(/\/api\/memory/).respond([]);
    $httpBackend.whenPOST('/api/users/me').respond(200);
    $rootScope.$digest();
    $httpBackend.flush();
    const promise = db.newReviewCards(12, 5);
    promise.then(function(cards) {
      expect(typeof cards).toBe('object');
      expect(cards.length).toBe(12);
      expect(db.getMemory(cards[0].cardId).recallProbability).toBe(0.5, 'tarjeta 0');
      expect(db.getMemory(cards[1].cardId).recallProbability).toBe(0.5, 'tarjeta 1');
      expect(db.getMemory(cards[2].cardId).recallProbability).toBe(0.5, 'tarjeta 2');
      expect(db.getMemory(cards[3].cardId).recallProbability).toBe(0.5, 'tarjeta 3');
      expect(db.getMemory(cards[4].cardId).recallProbability).toBe(0.5, 'tarjeta 4');
      expect(db.getMemory(cards[5].cardId).recallProbability).toBe(0.5, 'tarjeta 5');
      expect(db.getMemory(cards[6].cardId).recallProbability).toBe(0.75, 'tarjeta 6');
      expect(db.getMemory(cards[7].cardId).recallProbability).toBe(0, 'tarjeta 7');
      expect(db.getCard(cards[7].cardId).freq).toBe(90);
      expect(db.getMemory(cards[8].cardId).recallProbability).toBe(0, 'tarjeta 8');
      expect(db.getCard(cards[8].cardId).freq).toBe(89);
      expect(db.getMemory(cards[9].cardId).recallProbability).toBe(0, 'tarjeta 9');
      expect(db.getCard(cards[9].cardId).freq).toBe(88);
      expect(db.getMemory(cards[10].cardId).recallProbability).toBe(0, 'tarjeta 10');
      expect(db.getCard(cards[10].cardId).freq).toBe(87);
      expect(db.getMemory(cards[11].cardId).recallProbability).toBe(0, 'tarjeta 11');
      expect(db.getCard(cards[11].cardId).freq).toBe(86);
      angular.forEach(cards, (card) => {
        expect(card.learned).toBe(false);
        expect(card.firstTry).toBe(true);
        expect(db.getMemory(card.cardId).synced).toBe(true);
      });
    });
    $rootScope.$digest();
  });

  it('debe devolver los repasos de la tarjeta indicada', function () {
    let mem = db.getMemory('289b728b0f394be52baa318a');
    delete mem.meta;
    delete mem.$loki;
    mem = _.toPlainObject(mem);
    expect(mem).toEqual({
      'card': '289b728b0f394be52baa318a',
      'recalls': [
        { 'recall': 0, '_id': 'e2080a719229312b41cd6087', 'date': '2015-09-04T09:27:26.795Z' },
        { 'recall': 1, '_id': 'f4892742a380a6c48446bc89', 'date': '2015-09-04T09:28:05.510Z' },
        { 'recall': 1, '_id': '2a45a2c1345e6147400531ee', 'date': '2015-09-04T09:28:11.319Z' }
      ],
      'recallProbability': 0.75,
      '_id': 'b5d9a0797dcb3e5fc1415f7d',
      'isSynced': true
    });
  });

  it('debe guardar el repasos y marcarlo como no sincronizado', function () {
    let mem = db.getMemory('289b728b0f394be52baa318a');
    mem.addRecalls([{ recall: 1 }]);
    db.updateMemory(mem);
    db.save();
    expect(mem.recalls.length).toBe(4);
    expect(mem.recalls[3].recall).toBe(1);
    expect(mem.recalls[3]._id).toBeUndefined();
    expect(mem.recalls[3].date).toBeUndefined();
    expect(mem.recallProbability).toBe(0.875);
    expect(mem.synced).toBe(false);
  });

  it('debe sincronizar los cambios de la prueba anterior', function () {
    $httpBackend.expectGET(/\/api\/memory/).respond([]);
    $httpBackend.expectPOST('/api/memory').respond(getMemories);
    $httpBackend.whenPOST('/api/users/me').respond(200);
    $rootScope.$digest();
    $httpBackend.flush();
    const mem = db.getMemory('289b728b0f394be52baa318a');
    expect(mem.recalls.length).toBe(4);
    expect(mem.recalls[3].recall).toBe(1);
    expect(mem.recalls[3]._id).not.toBeUndefined();
    expect(mem.recalls[3].date).not.toBeUndefined();
    expect(mem.recallProbability).toBe(0.875);
    expect(mem.synced).toBe(true);
  });

  it('debe incorporar cambios de otros dispositivos en la sincro', function() {
    $httpBackend.expectGET(/\/api\/memory/).respond([]);
    $httpBackend.whenPOST('/api/users/me').respond(200);
    $rootScope.$digest();
    $httpBackend.flush();
    const localMem = db.getMemory('289b728b0f394be52baa318a');
    //let serverMem = db.getMemory('2779848a34c8469468cc7d78');
    //expect(serverMem.recalls.length).toBe(0);
    localMem.addRecalls([{ recall: 0 }]);
    db.updateMemory(localMem);
    db.save();
    window.vvUnsyncedServer = true;
    $httpBackend.expectPOST('/api/memory').respond(getMemories);
    db.syncMemory();
    $rootScope.$digest();
    $httpBackend.flush();
    db.save();
    const serverMem = db.getMemory('2779848a34c8469468cc7d78');
    expect(serverMem.recalls.length).toBe(2);
    expect(serverMem.recallProbability).toBe(0.5);
  });

  it('debe sincronizar el objeto User con el servidor', function() {
    const localDate = angular.fromJson(
      window.localStorage.getItem('usr')).updated;
    const haceUnaHora = new Date(Date.now() - 3600 * 1000);
    const dentroDeUnaHora = new Date(Date.now() + 3600 * 1000);

    let syncedUser = db.syncUser(getUser({ updated: haceUnaHora.toISOString() }));
    expect(syncedUser.updated).toEqual(new Date(localDate), 'updated = localDate');
    $httpBackend.expectPOST('/api/users/me').respond(200);
    $httpBackend.expectGET(/\/api\/memory/).respond([]);
    $httpBackend.whenPOST('/api/users/me').respond(200);
    $httpBackend.flush();

    syncedUser = db.syncUser(getUser({ updated: dentroDeUnaHora.toISOString() }));
    expect(syncedUser.updated).toEqual(dentroDeUnaHora, 'updated = dentroDeUnaHora');
    const newLocal = new Date(
      angular.fromJson(window.localStorage.getItem('usr')).updated);
    expect(newLocal).toEqual(dentroDeUnaHora, 'newLocal = dentroDeUnaHora');

    window.localStorage.removeItem('usr');
    syncedUser = db.syncUser(getUser({ updated: haceUnaHora.toISOString() }));
    expect(syncedUser.updated).toEqual(haceUnaHora.toISOString(), 'update = haceUnaHora');
    window.localStorage.setItem('usr',
        angular.toJson(getUser({ updated: localDate })));
  });

  it('debe actualizar el objeto User', function() {
    const dalaiLama = getUser();
    dalaiLama.buenaPersona = true;
    dalaiLama.name = 'Dalai Lama';
    db.updateUser(dalaiLama);
    const persistedUser = window.localStorage.getItem('usr');
    expect(persistedUser).toEqual(angular.toJson(dalaiLama));
    $httpBackend.expectPOST('/api/users/me').respond(200);
    $httpBackend.expectGET(/\/api\/memory/).respond([]);
    $httpBackend.whenPOST('/api/users/me').respond(200);
    $httpBackend.flush();
  });
});
