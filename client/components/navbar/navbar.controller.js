'use strict';

angular.module('vivaverboApp')
  .controller('NavbarController', function ($scope, $location, $window, Auth) {
    $scope.getCurrentUser = Auth.getCurrentUser;

    $scope.logout = function() {
      Auth.logout();
      $window.location.pathname = '/';
    };
  });
