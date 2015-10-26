'use strict';

angular.module('vivaverboApp')
  .directive('vvSidenav', function () {
    return {
      templateUrl: 'components/vvSidenav/vvSidenav.html',
      restrict: 'E',
      scope: {},
      transclude: true,
      link: function (scope, element, attrs) {
      },
      controller: function($mdSidenav) {
        this.select = () => {
          $mdSidenav('left').close();
        };
        this.hide = () => {
          $mdSidenav('left').close();
        };
      },
      controllerAs: 'menu'
    };
  });
