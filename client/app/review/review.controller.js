'use strict';

angular.module('vivaverboApp')
  .controller('ReviewController', function ($scope, reviewService) {
    $scope.repaso = reviewService.repaso;
    $scope.tarjetaGirada = false;

    // "Gira" la tarjeta para ver la respuesta
    $scope.girar = () => $scope.tarjetaGirada = true;

    // Marca el grado de recuerdo de la respuesta: 0, 0.5, 1
    $scope.marcar = (recuerdo) => {
      reviewService.marcar(recuerdo);
      $scope.tarjetaGirada = false;
    };

    // Elimina la tarjeta (demasiado fácil) de posteriores repasos
    $scope.borrar = ($event) => {
      $event.stopPropagation();
      reviewService.marcar(1, true);
      $scope.tarjetaGirada = false;
    };
  });
