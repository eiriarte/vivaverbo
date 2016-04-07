var _ = require('lodash');
var sendgrid  = require('sendgrid')(process.env.SENDGRID_API_KEY);
var from = {
  from: 'eduardo@vivaverbo.com',
  fromname: 'Vivaverbo'
}

exports.sendRecoverEmail = function(email, url, res, callback) {
  var subject = 'Cómo restablecer tu contraseña de Vivaverbo';
  var template = 'mail/forgot';

  res.render(template, { url: url }, function(err, html) {
    var payload = _.defaults({ to: email, subject: subject, html: html }, from);
    sendgrid.send(payload, callback);
  });
}
