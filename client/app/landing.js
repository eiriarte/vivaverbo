jQuery(document).ready(() => {

  $('#login form').on('submit', function (e) {
    let $form = $(this);
    e.preventDefault();
    $form.find('.unauthorized, .unexpected').hide();
    $.post($form.attr('action'), $form.serialize()).done((data) => {
      Cookies.set('token', `"${data.token}"`);
      window.location.pathname = '/';
    }).fail((jqXHR) => {
      Cookies.remove('token');
      if (401 === jqXHR.status) {
        $form.find('.unauthorized').show()
      } else {
        $form.find('.unexpected').show()
      }
    });
  });

  $('#email').focus();
});
