'use strict';

describe('Service: Collection', function () {

  beforeAll(windowBeforeTestSuite);

  // load the service's module
  beforeEach(module('vivaverboApp'));

  // instantiate service
  var Collection;
  beforeEach(inject(function (_Collection_) {
    Collection = _Collection_;
  }));

  afterAll(windowAfterTestSuite);

  it('should do something', function () {
    expect(!!Collection).toBe(true);
  });

});
