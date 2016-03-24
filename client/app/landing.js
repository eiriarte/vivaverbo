/* global Cookies, Zepto */

'use strict';

Zepto(function($){
  const $form = $('.register form');
  const $btnSubmit = $form.find('.btn-cta');
  const $btnFacebook = $('.btn-facebook');
  $btnFacebook.click(function() {
    window.location.pathname = '/auth/facebook';
  });
  $form.on('submit', function (event) {
    event.preventDefault();
    $btnSubmit.text('Procesando…').attr('disabled', 'disabled');
    $.ajax({
      type: 'POST',
      url: $form.attr('action'),
      data: $form.serialize(),
      success: function(data) {
        $btnSubmit.attr('disabled', null);
        Cookies.set('token', data.token, { expires: 30 });
        window.location.pathname = '/';
      },
      error: function(xhr) {
        var errors, message = [];
        $btnSubmit.text('Regístrate gratis').attr('disabled', null);
        try {
          errors = JSON.parse(xhr.response).errors || {};
        } catch (err) {
          errors = {};
        }
        if (422 === xhr.status) {
          ['name', 'email', 'hashedPassword'].forEach(function(field) {
            if (errors[field]) {
              $form.find('.field-' + field).addClass('field-error');
              message.push(errors[field].message);
            } else {
              $form.find('.field-' + field).removeClass('field-error');
            }
          });
          message = message.join('<br />');
          $form.find('.error-message').html(message).show();
          $form.find('.unexpected').hide();
        } else {
          $form.find('.error-message').hide();
          $form.find('.unexpected').show();
        }
      }
    });
  });
});
