'use strict';

angular.module('vivaverboApp')
  .directive('vvCard', function () {
    return {
      templateUrl: 'app/vvCard/vvCard.html',
      restrict: 'E',
      scope: {},
      bindToController: {
        'girada': '=vvGirada',
        'card': '=vvTarjeta',
        'onClose': '&vvOnclose'
      },
      controller: function (reviewService) {
        this.eliminar = ($event) => {
          $event.stopPropagation();
          this.onClose();
        };
        this.girar = () => {
          this.girada = true;
          reviewService.tarjetaGirada();
        };
      },
      controllerAs: 'tarjeta'
    };
  });
