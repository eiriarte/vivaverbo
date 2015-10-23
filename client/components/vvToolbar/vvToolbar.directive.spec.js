'use strict';

describe('Directive: vvToolbar', function () {

  // load the directive's module and view
  beforeEach(module('vivaverboApp'));
  beforeEach(module('components/vvToolbar/vvToolbar.html'));

  var element, scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<vv-toolbar></vv-toolbar>');
    element = $compile(element)(scope);
    scope.$apply();
    expect(element.text()).toBe('this is the vvToolbar directive');
  }));
});