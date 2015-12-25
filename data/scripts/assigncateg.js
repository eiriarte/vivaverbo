var fs = require('fs');
var readline = require('readline');
var _ = require('lodash');

var numExistentes = 0, numNuevas = 0;

// Hash con las tarjetas actuales

// Obtiene los parámetros
var catFile = getParam(1);
var cardFile = getParam(2);
var categories = getCategories();

// ¿Están todos los parámetros obligatorios?
if (undefined === catFile || undefined === cardFile || 0 === categories.length) {
  console.error('Uso: node assigncateg.js <catfile> <cardfile> <catname> [<catname>…]');
  process.exit(1);
}

var cards = require(cardFile);
var hash = getHash(cards);

// Recorre el archivo de entrada
var rl = readline.createInterface({
  input: fs.createReadStream(catFile),
  output: process.stdout,
  terminal: false
});

rl.on('line', function(line) {
  if (typeof hash[line] === 'undefined') {
    hash[line] = { respuesta: line, categorias: categories };
    numNuevas++;
  } else {
    hash[line].categorias = _.union(hash[line].categorias, categories);
    numExistentes++;
  }
}).on('close', function() {
  var data = JSON.stringify(_.values(hash), null, '\t');
  fs.writeFile(cardFile, 'module.exports = ' + data, 'utf8', function(err) {
    if (err) { throw err; }
    console.log('Tarjetas existentes actualizadas: %d\nTarjetas nuevas: %d',
      numExistentes, numNuevas);
    process.exit(0);
  });
});


/**
 * Almacena las tarjetas del array 'cards' en un hash, donde la clave es la
 * respuesta, y el valor es la tarjeta
 */
function getHash(cards) {
  var hash = {};

  cards.forEach(function(card) {
    if (typeof hash[card.respuesta] !== 'undefined') {
      console.error('"%s" está duplicada: %s', card.respuesta);
      process.exit(1);
    }
    hash[card.respuesta] = card;
  });

  return hash;
}

/**
 * Devuelve el num-ésimo parámetro de la línea de comandos
 */
function getParam(num) {
  return process.argv[num + 1];
}

/**
 * Devuelve un array con las categorías indicadas (3er parámetro en adelante)
 */
function getCategories() {
  return process.argv.slice(4);
}
