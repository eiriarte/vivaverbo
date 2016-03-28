'use strict';

angular.module('vivaverboApp')
  .directive('vvToolbar', function () {
    return {
      templateUrl: 'components/vvToolbar/vvToolbar.html',
      restrict: 'E',
      scope: {},
      bindToController: {
        'title': '@vvTitle',
        'info': '@vvInfo'
      },
      controller: function ($mdSidenav, $mdDialog, Auth) {
        this.logout = () => Auth.logout();
        this.showMenu = () => {
          $mdSidenav('left').open();
        };
        this.showInfo = (ev) => {
          $mdDialog.show(
            $mdDialog.alert()
            .clickOutsideToClose(true)
            .title(this.title)
            .htmlContent(this.info)
            .ok('Cerrar')
            .targetEvent(ev));
        };
      },
      controllerAs: 'toolbar'
    };
  });
