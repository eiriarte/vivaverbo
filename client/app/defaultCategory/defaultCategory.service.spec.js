'use strict';

describe('Service: defaultCategory', function () {

  beforeAll(windowBeforeTestSuite);

  // load the service's module
  beforeEach(module('vivaverboApp'));

  // instantiate service
  var defaultCategory;
  beforeEach(inject(function (_defaultCategory_) {
    defaultCategory = _defaultCategory_;
  }));

  afterAll(windowAfterTestSuite);

  it('should do something', function () {
    expect(!!defaultCategory).toBe(true);
  });

});
