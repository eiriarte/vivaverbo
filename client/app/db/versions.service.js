'use strict';

angular.module('vivaverboApp')
  .factory('versions', function ($localStorage) {

    const server = window.vivaverboConfig.versions;

    const syncedCollections = [ 'cards', 'categories' ];

    const client = $localStorage.versions || {};

    return {
      isOutdated(name) {
        if (syncedCollections.indexOf(name) === -1) {
          return false;
        }
        return !client[name] || client[name] < server[name];
      },
      setUpToDate(name) {
        client[name] = server[name];
        $localStorage.versions = client;
      }
    };
  });
