'use strict';

describe('Service: categories', function () {

  beforeAll(windowBeforeTestSuite);

  // load the service's module
  beforeEach(module('vivaverboApp'));

  // instantiate service
  var categories;
  beforeEach(inject(function (_categories_) {
    categories = _categories_;
  }));

  afterAll(windowAfterTestSuite);

  it('should do something', function () {
    expect(!!categories).toBe(true);
  });

});
