'use strict';

describe('Service: versions', function () {

  // load the service's module
  beforeEach(module('vivaverboApp'));

  // instantiate service
  var versions;
  beforeEach(inject(function (_versions_) {
    versions = _versions_;
  }));

  it('should do something', function () {
    expect(!!versions).toBe(true);
  });

});
