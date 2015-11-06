'use strict';

angular.module('vivaverboApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('home', {
        url: '/',
        onEnter: ($location, $state) => {
          // TODO: determinar la categoría por defecto, basado en ¿repasos? ¿prioridades???
          $state.go('review', { categoria: 'cumpleannos' });
        }
      })
      .state('review', {
        url: '/re/:categoria',
        template: function(params) {
          return `<vv-review vv-category="${params.categoria}" layout-fill></vv-review>`;
        }
      });
  });
