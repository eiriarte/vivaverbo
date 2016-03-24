/*
  Lee el fichero pivkap.txt del directorio padre y vuelca a stdout la lista de
  palabras y derivaĵoj, una por línea.
*/
var fs = require('fs');
var readline = require('readline');
var rl = readline.createInterface({
  input: fs.createReadStream('../pivkap.txt'),
  output: process.stdout,
  terminal: false
});

var root, parts, words, dict = {};

rl.on('line', function(line) {
  // Ignoramos los comentarios (y suponemos que no existen líneas en blanco)
  if ('#' === line[0]) { return; }

  // Si no empieza por TAB es una raíz, de lo contrario es un derivado
  if ('\t' !== line[0]) {
    parts = line.split('/');
    root = cleanRoot(parts[0]);
    words = parts.join('');
    words = variants(words.split('; '));
  } else {
    words = line.slice(1).replace(/~/g, root);
    words = words.replace(/\\(.)/g, toggleCase);
    words = variants(words.split('; '));
  }

  words.forEach(function(word) {
    if (typeof dict[word] === 'undefined') {
      dict[word] = true;
      console.log(word);
    } else {
      console.error('DUPE: %s', word);
    }
  });
}).on('close', function() {
  process.exit(0);
});


/**
 * Devuelve la raíz quitando los caracteres sobrantes:
 * '-' al inicio (en los sufijos)
 * '!' al final en las interjecciones
 */
function cleanRoot(root) {
  if ('-' === root[0]) {
    root = root.slice(1);
  }
  if ('!' === root.slice(-1)) {
    root = root.slice(0, -1);
  }
  return root;
}

/**
 * Devuelve la letra 'letter' en mayúscula si era minúscula, y viceversa
 */
function toggleCase(match, letter) {
  var upper = letter.toUpperCase();
  if (upper === letter) {
    return letter.toLowerCase();
  } else {
    return upper;
  }
}


/**
 * Devuelve la lista de palabras, separando las variantes. P. ej.:
 * ['memmasturb(ad)o', 'sinmasturb(ad)o'] =>
 * ['memmasturbo', 'memmasturbado', 'sinmasturbo', 'sinmasturbado']
 * Elimina las entradas que son sólo una elipsis ('...')
 */
function variants(words) {
  var result = [];
  var parentheses = /[\(\)]/g;
  var morphem = /\(.+\)/g;

  words.forEach(function(word) {
    var variant = word.replace(parentheses, '');
    if (word === variant) {
      if (word !== '...') {
        result.push(word);
      }
    } else {
      result.push(word.replace(morphem, ''));
      result.push(variant);
    }
  });

  return result;
}
