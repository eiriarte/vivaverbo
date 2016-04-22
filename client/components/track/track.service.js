'use strict';

angular.module('vivaverboApp')
  .factory('track', function () {
    return {
      registerEvent: function (category, action, label, value) {
        return ga('send', 'event', category, action, label, value);
      }
    };
  });
