'use strict';

angular.module('vivaverboApp')
  .factory('Auth', function Auth($window, $cookies, User, db) {
    const currentUser = db.syncUser(window.vivaverboConfig.user);

    return {

      /**
       * Borra el token de acceso y recarga la página para volver a la landing
       * page
       *
       */
      logout() {
        $cookies.remove('token');
        $window.location.pathname = '/';
      },

      /**
       * Change password
       *
       * @param  {String}   oldPassword
       * @param  {String}   newPassword
       * @param  {Function} callback    - optional
       * @return {Promise}
       */
      changePassword(oldPassword, newPassword, callback) {
        let cb = callback || angular.noop;

        return User.changePassword({ id: currentUser._id }, {
          oldPassword: oldPassword,
          newPassword: newPassword
        }, function(user) {
          return cb(user);
        }, function(err) {
          return cb(err);
        }).$promise;
      },

      /**
       * Gets all available info on authenticated user
       *
       * @return {Object} user
       */
      getCurrentUser() {
        return currentUser;
      },

      /**
       * Check if a user is logged in
       *
       * @return {Boolean}
       */
      isLoggedIn() {
        return currentUser.hasOwnProperty('role');
      },

      /**
       * Waits for currentUser to resolve before checking if user is logged in
       */
      isLoggedInAsync(cb) {
        if(currentUser.hasOwnProperty('$promise')) {
          currentUser.$promise.then(function() {
            cb(true);
          }).catch(function() {
            cb(false);
          });
        } else if(currentUser.hasOwnProperty('role')) {
          cb(true);
        } else {
          cb(false);
        }
      },

      /**
       * Check if a user is an admin
       *
       * @return {Boolean}
       */
      isAdmin() {
        return currentUser.role === 'admin';
      },

      /**
       * Get auth token
       */
      getToken() {
        return $cookies.get('token');
      }
    };
  });
