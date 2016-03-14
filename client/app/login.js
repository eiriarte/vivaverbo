/* global Cookies, Zepto */

'use strict';

Zepto(function($){
  const $form = $('main form');
  const $btnSubmit = $form.find('.btn-cta');
  $form.on('submit', function (event) {
    event.preventDefault();
    $btnSubmit.text('Procesando…').attr('disabled', 'disabled');
    $form.find('.unauthorized, .unexpected').hide();
    $.ajax({
      type: 'POST',
      url: $form.attr('action'),
      data: $form.serialize(),
      success: (data) => {
        $btnSubmit.attr('disabled', null);
        Cookies.set('token', data.token, { expires: 30 });
        window.location.pathname = '/';
      },
      error: (xhr) => {
        $btnSubmit.text('Iniciar sesión').attr('disabled', null);
        Cookies.remove('token');
        if (401 === xhr.status) {
          $form.find('.unauthorized').show();
        } else {
          $form.find('.unexpected').show();
        }
      }
    });
  });
});
