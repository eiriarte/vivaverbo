var fs = require('fs');
var cheerio = require('cheerio');

var hash = {};
var total = 0;
var entities = /&#x(.*?);/g;

// Obtiene el argumento <revodir>
var revoDir = process.argv[2];
if (typeof revoDir === 'undefined' || process.argv.length > 3) {
  console.error('Uso: node revo.js <revodir>');
  process.exit(1);
}

fs.readdir(revoDir, function(err, files) {
  if (err) { throw err; }
  files.forEach(function(filename) {
    var derivs;
    if (filename[0] !== '.' && filename.slice(-4) === '.xml') {
      derivs = getDerivs(filename);
      derivs.forEach(function(deriv) {
        if (hash.hasOwnProperty(deriv)) {
          console.warn('Entrada %s duplicada (%s, %s).', deriv, hash[deriv], filename);
        }
        hash[deriv] = filename;

        if (/[^\-\sA-Za-z0-9\.,ĤŜĜĈĴŬĥŝĝĉĵŭ!'\*σ]/.test(deriv)) {
          console.warn('Carácter extraño en la entrada %s (%s).', deriv, filename);
        }

        console.log(deriv);
        total++;
      });
    }
  });
  console.warn('Total: %d entradas.', total);
});


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
        // (la primera letra podría ocupar más de un carácter)
        $tld.prepend(lit + radiko.slice((radiko.indexOf(';') + 1) || 1));
      } else {
        $tld.prepend(radiko);
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
