'use strict';

describe('Service: lodash', function () {

  // load the service's module
  beforeEach(module('vivaverboApp'));

  // instantiate service
  let lodash;

  beforeAll(windowBeforeTestSuite);

  beforeEach(inject(function (_lodash_) {
    lodash = _lodash_;
  }));

  afterAll(windowAfterTestSuite);

  it('debe ser un objeto lodash/underscore', function () {
    expect(typeof lodash).toBe('function');
    expect(!!(lodash.noop && lodash.findWhere)).toBe(true);
  });

});
