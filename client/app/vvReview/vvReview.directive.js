'use strict';

angular.module('vivaverboApp')
  .directive('vvReview', function () {
    return {
      templateUrl: 'app/vvReview/vvReview.html',
      restrict: 'E',
      scope: {},
      bindToController: {
        'categoria': '@vvCategory'
      },
      controller: 'ReviewController',
      controllerAs: 'repaso'
    };
  })
  .controller('ReviewController', function(reviewService, categories) {
    categories.findOne({ _id: this.categoria }).then((categoria) => {
      this.tituloCategoria = categoria && categoria.titulo;
      this.descCategoria = categoria && categoria.descripcion;
    });
    this.tarjetas = reviewService.tarjetasRepaso;
    this.estado = { girada: false };
    reviewService.newReview(this.categoria);

    Object.defineProperties(this, {
      'tarjetaActual':   { get: () => reviewService.repaso.tarjetaActual },
      'totalAprendidas': { get: () => reviewService.repaso.totalAprendidas },
      'totalTarjetas':   { get: () => reviewService.repaso.totalTarjetas },
      'finalizado':      { get: () => reviewService.repaso.finalizado },
      'carga':           { get: () => reviewService.estadoCarga }
    });

    // "Gira" la tarjeta para ver la respuesta
    this.girar = () => this.estado.girada = true;

    // Marca el grado de recuerdo de la respuesta: 0, 0.5, 1
    this.marcar = (recuerdo) => {
      reviewService.marcar(recuerdo);
      this.estado.girada = false;
    };

    // Elimina la tarjeta (demasiado fácil) de posteriores repasos
    this.borrar = () => {
      reviewService.marcar(1, true);
      this.estado.girada = false;
    };

    // Genera un nuevo repaso
    this.newReview = () => {
      reviewService.newReview(this.categoria, true);
    };
  });
