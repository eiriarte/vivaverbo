/* global beforeAll, windowBeforeTestSuite, afterAll, windowAfterTestSuite, getCards, getMemory, getMemories, getUser */

'use strict';

describe('Service: db', function () {

  beforeAll(windowBeforeTestSuite);

  // load the service's module
  beforeEach(module('vivaverboApp'));

  // instantiate service
  var db, $httpBackend;

  beforeEach(inject(function (_$httpBackend_, _db_) {
    $httpBackend = _$httpBackend_;
    db = _db_;
  }));

  afterAll(windowAfterTestSuite);

  it('debe sincronizar el objeto User con el servidor', function() {
    const localDate = angular.fromJson(
      window.localStorage.getItem('usr')).updated;
    const haceUnaHora = new Date(Date.now() - 3600 * 1000);
    const dentroDeUnaHora = new Date(Date.now() + 3600 * 1000);

    let syncedUser = db.syncUser(getUser({ updated: haceUnaHora.toISOString() }));
    expect(syncedUser.updated).toEqual(new Date(localDate), 'updated = localDate');
    $httpBackend.expectPOST('/api/users/me').respond(200);
    $httpBackend.whenGET(/\/api\/memory/).respond([]);
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
    $httpBackend.whenGET(/\/api\/memory/).respond([]);
    $httpBackend.whenPOST('/api/users/me').respond(200);
    $httpBackend.flush();
  });
});
