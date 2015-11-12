'use strict';

describe('Service: localDB', function () {

  beforeAll(windowBeforeTestSuite);

  // load the service's module
  beforeEach(module('vivaverboApp'));

  // instantiate service
  var localDB;
  beforeEach(inject(function (_localDB_) {
    localDB = _localDB_;
  }));

  afterAll(windowAfterTestSuite);

  it('should do something', function () {
    expect(!!localDB).toBe(true);
  });

});
