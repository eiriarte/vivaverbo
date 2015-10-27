'use strict';

describe('Directive: vvSidenav', function () {

  beforeAll(windowBeforeTestSuite);
  // load the directive's module and view
  beforeEach(module('vivaverboApp'));
  beforeEach(module('components/vvToolbar/vvToolbar.html'));
  beforeEach(module('components/vvSidenav/vvSidenav.html'));

  let $httpBackend;

  beforeEach(inject(function (_$httpBackend_) {
    $httpBackend = _$httpBackend_;
  }));

  afterAll(windowAfterTestSuite);

  var element, scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('debe transcluir su contenido y añadir una lista', inject(function ($compile) {
    $httpBackend.whenGET('/api/cards').respond(getCards());
    element = angular.element('<div><vv-sidenav><vv-toolbar></vv-toolbar></vv-sidenav></div>');
    element = $compile(element)(scope);
    scope.$apply();
    expect(element.find('vv-sidenav md-list').length).toEqual(1);
    expect(element.find('vv-toolbar .logout-btn').length).toEqual(1);
  }));
});
