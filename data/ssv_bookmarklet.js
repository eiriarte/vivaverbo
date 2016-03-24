var result = localStorage.getItem('ssv') || '';
$('dl').each(function() {
  var text = $(this).text();
  var type = text.indexOf('~') !== -1 ? '~' : '→';
  var line = text.split(/[→~:]/);
  var word = line[0].replace(/·/g, '').trim();
  var alt = type + ' ' + (line[1] && line[1].trim());
  result += '{ "' + word + '": "' + alt + '" },\n';
});
localStorage.setItem('ssv', result);
document.title = ':-)';
