'use strict';

angular.module('vivaverboApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('home', {
        url: '/',
        onEnter: ($state, defaultCategory) => {
          // TODO: determinar la categoría por defecto, basado en ¿repasos? ¿prioridades???
          $state.go('review', { categoria: defaultCategory });
        }
      })
      .state('review', {
        url: '/re/:categoria',
        template: function(params) {
          return `<vv-review vv-category="${params.categoria}" layout-fill></vv-review>`;
        }
      });
  });
