'use strict';

describe('Service: memory', function () {

  beforeAll(windowBeforeTestSuite);

  // load the service's module
  beforeEach(module('vivaverboApp'));

  // instantiate service
  var memory;
  beforeEach(inject(function (_memory_) {
    memory = _memory_;
  }));

  afterAll(windowAfterTestSuite);

  it('should do something', function () {
    expect(!!memory).toBe(true);
  });

});
