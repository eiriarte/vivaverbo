'use strict';

angular.module('vivaverboApp')
  .directive('vvToolbar', function () {
    return {
      templateUrl: 'components/vvToolbar/vvToolbar.html',
      restrict: 'E',
      scope: {},
      link: function (scope, element, attrs) {
      },
      bindToController: {
        'title': '@vvTitle'
      },
      controller: function ($mdSidenav, Auth) {
        this.logout = () => Auth.logout();
        this.showMenu = () => {
          $mdSidenav('left').open();
        }
      },
      controllerAs: 'toolbar'
    };
  });