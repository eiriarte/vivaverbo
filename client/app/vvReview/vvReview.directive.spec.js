'use strict';

describe('Directive: vvReview', function () {

  beforeAll(windowBeforeTestSuite);
  // load the directive's module and view
  beforeEach(module('vivaverboApp'));
  beforeEach(module('components/vvToolbar/vvToolbar.html'));
  beforeEach(module('components/vvSidenav/vvSidenav.html'));
  beforeEach(module('app/vvCard/vvCard.html'));
  beforeEach(module('app/vvReview/vvReview.html'));

  var element, scope;

  let $httpBackend, $rootScope;

  beforeEach(inject(function (_$httpBackend_) {
    $httpBackend = _$httpBackend_;
  }));

  beforeEach(inject(function (_$rootScope_) {
    $rootScope = _$rootScope_;
    scope = $rootScope.$new();
  }));

  afterAll(windowAfterTestSuite);

  it('should make hidden element visible', inject(function ($compile) {
    $httpBackend.whenGET('/api/cards').respond(getCards());
    $httpBackend.whenGET('/api/categories').respond(getCategories());
    $httpBackend.whenGET(/\/api\/memory/).respond([]);
    $httpBackend.whenPOST('/api/users/me').respond(200);
    element = angular.element('<vv-review vv-category="sistema-mayor"></vv-review>');
    element = $compile(element)(scope);
    scope.$apply();
    $httpBackend.flush();
    $rootScope.$digest();
    expect(angular.element(element[0].querySelectorAll('.md-toolbar-tools > h1')[0]).text()).toBe('vivaverbo');
    expect(angular.element(element[0].querySelectorAll('.md-toolbar-tools > h1')[1]).text()).toBe('Sistema mayor');
    expect(element.find('vv-card').length).toBe(10);
  }));
});
