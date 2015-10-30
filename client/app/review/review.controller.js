'use strict';

angular.module('vivaverboApp')
  .controller('ReviewController', function ($scope, reviewService) {
    $scope.repaso = reviewService.repaso;
    $scope.tarjetas = reviewService.tarjetasRepaso;
    $scope.estado = { girada: false };

    // "Gira" la tarjeta para ver la respuesta
    $scope.girar = () => $scope.estado.girada = true;

    // Marca el grado de recuerdo de la respuesta: 0, 0.5, 1
    $scope.marcar = (recuerdo) => {
      reviewService.marcar(recuerdo);
      $scope.estado.girada = false;
    };

    // Elimina la tarjeta (demasiado fácil) de posteriores repasos
    $scope.borrar = () => {
      reviewService.marcar(1, true);
      $scope.estado.girada = false;
    };

    // Genera un nuevo repaso
    $scope.newReview = () => {
      reviewService.newReview();
    };
  });
