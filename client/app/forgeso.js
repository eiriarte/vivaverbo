/* global Cookies, Zepto */

'use strict';

Zepto(function($){
  const $form = $('main form');
  const $btnSubmit = $form.find('.btn-cta');

  $form.on('submit', function (event) {
    event.preventDefault();
    event.stopImmediatePropagation();
    $btnSubmit.text('Procesando…').attr('disabled', 'disabled');
    $form.find('.unauthorized, .unexpected, .success').hide();
    $.ajax({
      type: 'POST',
      url: $form.attr('action'),
      data: $form.serialize(),
      success: function() {
        $form[0].reset();
        $form.find('.success').show();
        $btnSubmit.text('Enviar').attr('disabled', null);
      },
      error: function(xhr) {
        $btnSubmit.text('Enviar').attr('disabled', null);
        if (404 === xhr.status) {
          $form.find('.unauthorized').show();
        } else {
          $form.find('.unexpected').show();
        }
      }
    });
    return false;
  });

});
