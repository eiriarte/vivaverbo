'use strict';

// Convierte lodash/underscore en un servicio inyectable
angular.module('vivaverboApp')
  .factory('lodash', function ($window) {
    const lodash = $window._;

    return lodash;
  });
