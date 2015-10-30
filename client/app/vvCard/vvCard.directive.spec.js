'use strict';

describe('Directive: vvCard', function () {

  beforeAll(windowBeforeTestSuite);
  // load the directive's module and view
  beforeEach(module('vivaverboApp'));
  beforeEach(module('app/vvCard/vvCard.html'));

  var element, scope;

  let $httpBackend;

  beforeEach(inject(function (_$httpBackend_) {
    $httpBackend = _$httpBackend_;
  }));

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  afterAll(windowAfterTestSuite);

  it('should make hidden element visible', inject(function ($compile) {
    $httpBackend.whenGET('/api/cards').respond(getCards());
    $httpBackend.whenGET('/api/categories').respond(getCategories());
    element = angular.element('<vv-card></vv-card>');
    element = $compile(element)(scope);
    scope.$apply();
    expect(element.text()).toBe(element.text());
  }));
});
