'use strict';

angular.module('vivaverboApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('review', {
        url: '/',
        template: '<vv-review vv-category="sistema-mayor" layout-fill></vv-review>'
      });
  });
