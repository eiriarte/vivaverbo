var fs = require('fs');
var cheerio = require('cheerio');

var file = process.argv[2];
if (typeof file === 'undefined') {
  console.error('Uso: node cheer.js <file>');
  process.exit(1);
}

var revoDir = '../../_misc/revo/xml/';
var entities = /&#x(.*?);/g;

console.log(JSON.stringify(getDerivs(file + '.xml'), null, '\t'));


/**
 * Devuelve un array con los kapvortoj de el fichero filename
 */
function getDerivs(filename) {
  var xml = fs.readFileSync(revoDir + filename, 'utf8');
  var $ = cheerio.load(xml);
  var radiko = $('rad').html();
  var derivs = [];

  if ($('rad').length !== 1) {
    console.error('Entrada %s tiene %d radikoj', filename, $('rad').length);
  }

  $('kap').each(function(index, kap) {
    var $tld, $kap = $(kap);
    var lit;

    // Ignoramos el kapvorto "raíz" y los kapvortoj variantes anidados en otros kap
    if (0 === $kap.find('rad').length && $kap.parent().is('drv')) {
      $tld = $kap.find('tld');
      lit = $tld.attr('lit');

      // El atributo 'lit' cambia la letra inicial (minúscula por mayúscula, etc.)
      if (lit) {
        var resto;

        // (la primera letra podría ocupar más de un carácter)
        if ('&' === radiko[0]) {
          resto = radiko.slice((radiko.indexOf(';') + 1));
        } else {
          resto = radiko.slice(1);
        }
        $tld.prepend(lit + resto);
      } else {
        $tld.prepend(radiko);
      }

      if (lit && radiko[0] !== '&' && radiko.indexOf(';') !== -1) {
        console.warn('Entrada %s corregida, kap: %s', filename, radiko);
      }
      derivs.push(separateVariants(cleanKap($kap)).trim());
    }
  });

  return derivs;
}


/**
 * Quita etiquetas y espacios sobrantes
 */
function cleanKap($kap) {
  var remove = ['ofc', 'fnt', 'bib', 'lok', 'vrk', 'uzo', 'klr'];
  var result;

  // Elimina las etiquetas ofc, etc. y sus contenidos
  remove.forEach(function(selector) {
    $kap.find(selector).remove();
  });

  // Elimina las etiquetas <var>, <tld>, etc., dejando su contenido
  result = $kap.text();

  // Quita espacios sobrantes
  result = result.split(/\s+/).join(' ');

  // Reemplaza &#x135; por ĵ, etc.
  result = result.replace(entities, getEntityChar);
  result = result.replace(/&apos;/g, '\'');
  result = result.replace(/\s,\s/g, ', ');

  return result;
}


/**
 * Devuelve el caracter correspondiente al código numérico 'code'
 */
function getEntityChar(match, code) {
  return String.fromCharCode(parseInt(code, 16));
}


/**
 * Devuelve la palabra, separando las variantes. P. ej.:
 * 'memmasturb(ad)o' => 'memmasturbo, memmasturbado'
 */
function separateVariants(word) {
  var parentheses = /[\(\)]/g;
  var morphem = /\(.+\)/g;
  var variant = word.replace(parentheses, '');

  if (word === variant) {
    return word;
  } else {
    return word.replace(morphem, '') + ', ' + variant;
  }
}
