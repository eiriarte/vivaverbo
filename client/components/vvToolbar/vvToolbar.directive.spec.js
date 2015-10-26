'use strict';

describe('Directive: vvToolbar', function () {

  beforeAll(windowBeforeTestSuite);
  // load the directive's module and view
  beforeEach(module('vivaverboApp'));
  beforeEach(module('components/vvToolbar/vvToolbar.html'));

  let $httpBackend;

  beforeEach(inject(function (_$httpBackend_) {
    $httpBackend = _$httpBackend_;
  }));

  afterAll(windowAfterTestSuite);

  var element, scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    $httpBackend.whenGET('/api/cards').respond(getCards());
    element = angular.element('<vv-toolbar></vv-toolbar>');
    element = $compile(element)(scope);
    scope.$apply();
    expect(element.text().length).toBeGreaterThan(0);
  }));
});
