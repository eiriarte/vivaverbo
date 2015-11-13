'use strict';

describe('Service: memory', function () {

  beforeAll(windowBeforeTestSuite);

  // load the service's module
  beforeEach(module('vivaverboApp'));

  // instantiate service
  var memory;
  beforeEach(inject(function (_memory2_) {
    memory = _memory2_;
  }));

  afterAll(windowAfterTestSuite);

  it('should do something', function () {
    expect(!!memory).toBe(true);
  });

});
