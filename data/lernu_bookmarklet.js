var storage = window.localStorage;
var dict = JSON.parse(storage.getItem('lernudict')) || {};
var titulo = jQuery('#enhavo > h2').text().slice(24, -1);
var items = jQuery('.elektivortojnkolumno > div label').map(function() {
    var text = jQuery(this).text().replace(' - ', ': ');
    return text;
}).get();
dict[titulo] = items.join('\n');
storage.setItem('lernudict', JSON.stringify(dict));
document.title = '^___^U';
