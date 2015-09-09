'use strict';

angular.module('vivaverboApp')
  .factory('dateTime', function ($window, $log) {
    const serverDate = new Date($window.dtDate);
    const dateDiff = serverDate.getTime() - Date.now();
    if (isNaN(dateDiff)) {
      $log.error('No se ha obtenido una fecha válida del servidor.');
      return null;
    }

    return {
      // Devuelve la fecha actual (día y hora)
      now() {
        return new Date(Date.now() + dateDiff);
      },
      // Devuelve la fecha actual (sólo el día, a las 00:00:00)
      today() {
        var now = this.now();
        return new Date(now.getFullYear(), now.getMonth(), now.getDate());
      },
      // Devuelve el timestamp actual (milisegundos desde el 01/01/1970 00:00)
      timestamp() {
        var now = this.now();
        return now.getTime();
      }
    };
  });
