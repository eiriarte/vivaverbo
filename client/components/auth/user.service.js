'use strict';

angular.module('vivaverboApp')
  .factory('User', function ($resource) {
    return $resource('/api/users/:id/:controller', {
      id: '@_id'
    },
    {
      changePassword: {
        method: 'PUT',
        params: {
          controller:'password'
        }
      },
      get: {
        method: 'GET',
        params: {
          id: 'me'
        }
      },
      update: {
        method: 'POST',
        params: {
          id: 'me'
        }
      }
	  });
  });
