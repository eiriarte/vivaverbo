'use strict';

angular.module('vivaverboApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('review', {
        url: '/',
        templateUrl: 'app/review/review.html',
        controller: 'ReviewController'
      });
  });
