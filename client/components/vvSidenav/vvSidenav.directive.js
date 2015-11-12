'use strict';

angular.module('vivaverboApp')
  .directive('vvSidenav', function () {
    return {
      templateUrl: 'components/vvSidenav/vvSidenav.html',
      restrict: 'E',
      scope: {},
      transclude: true,
      controller: function($mdSidenav, $state, categories) {
        this.categorias = [];
        categories.find({}, this.categorias);

        this.select = (categoria) => {
          $mdSidenav('left').close();
          $state.go('review', { categoria: categoria.slug });
        };

        this.hide = () => {
          $mdSidenav('left').close();
        };
      },
      controllerAs: 'menu'
    };
  });
