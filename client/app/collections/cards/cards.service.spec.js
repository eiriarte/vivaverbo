'use strict';

describe('Service: cards', function () {

  beforeAll(windowBeforeTestSuite);

  // load the service's module
  beforeEach(module('vivaverboApp'));

  // instantiate service
  var cards;
  beforeEach(inject(function (_cards_) {
    cards = _cards_;
  }));

  afterAll(windowAfterTestSuite);

  it('should do something', function () {
    expect(!!cards).toBe(true);
  });

});
