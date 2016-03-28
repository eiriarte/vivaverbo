'use strict';

angular.module('vivaverboApp', [
  'ngCookies',
  'ngResource',
  'ngMessages',
  'ngSanitize',
  'ngMaterial',
  'ui.router',
  'ngStorage',
  'gettext',
  'lokijs'
])
  .config(function ($stateProvider, $urlRouterProvider, $locationProvider,
        $httpProvider, $logProvider, $animateProvider, $localStorageProvider,
        $mdThemingProvider) {
    $urlRouterProvider.otherwise('/');
    $locationProvider.html5Mode(true);
    $httpProvider.interceptors.push('authInterceptor');
    $logProvider.debugEnabled(window.vivaverboConfig.debug);
    $animateProvider.classNameFilter(/(vv-anim|md-sidenav-backdrop)/);
    $localStorageProvider.setKeyPrefix('vv_');
    if (!$localStorageProvider.get('syncDates')) {
      $localStorageProvider.set('syncDates', { 'memory': 0 });
    };
    $mdThemingProvider.theme('default')
      .primaryPalette('green')
      .accentPalette('red');
  })

  .factory('authInterceptor', function ($rootScope, $q, $cookies, $window) {
    return {
      // Add authorization token to headers
      request: function (config) {
        config.headers = config.headers || {};
        if ($cookies.get('token')) {
          config.headers.Authorization = 'Bearer ' + $cookies.get('token');
        }
        return config;
      },

      // Intercept 401s and redirect you to login
      responseError: function(response) {
        if(response.status === 401) {
          // remove any stale tokens
          $cookies.remove('token');
          $window.location.pathname = '/';
          return $q.reject(response);
        }
        else {
          return $q.reject(response);
        }
      }
    };
  })

  .run(function(MemoryClass, localDB) {
    // Inicializamos la base de datos local
    localDB.init({ memory: { proto: MemoryClass } });
  })

  .run(function ($rootScope, $cookies, $window, gettextCatalog, Auth) {
    // Idioma
    const lang = $cookies.get('lang');
    gettextCatalog.debug = window.vivaverboConfig.debug;
    if ('eo' === lang) {
      gettextCatalog.setCurrentLanguage(lang);
    }

    // Redirect to login if route requires auth and you're not logged in
    $rootScope.$on('$stateChangeStart', function (event, next) {
      Auth.isLoggedInAsync(function(loggedIn) {
        if (next.authenticate && !loggedIn) {
          event.preventDefault();
          $window.location.pathname = '/';
        }
      });
    });

  });
