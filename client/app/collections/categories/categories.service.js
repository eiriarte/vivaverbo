'use strict';

angular.module('vivaverboApp')
  .factory('categories', function (Collection) {
    const categories = new Collection('categories');
    return categories;
  });
