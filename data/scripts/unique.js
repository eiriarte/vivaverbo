/*
  Vuelca a stdout la lista de frecuencias indicada, eliminando las palabras
  repetidas.

  Uso: node unique.js <listafreq>
*/
var fs = require('fs');
var readline = require('readline');

var deriv = /(as|is|os|us|u|j|n)'$/;

// Obtiene el argumento <listafreq>
var inputFile = process.argv[2];
if (typeof inputFile === 'undefined' || process.argv.length > 3) {
  console.error('Uso: node unique.js <listafreq>');
  process.exit(1);
}

var rl = readline.createInterface({
  input: fs.createReadStream(inputFile),
  output: process.stdout,
  terminal: false
});

var dict = {};
var words = [];
var repes = 0;

rl.on('line', function(line) {
  var data = line.split(' ', 2);
  var freq = data[0];
  var word = data[1];
  if (!deriv.test(word) && typeof dict[word] === 'undefined') {
    dict[word] = freq;
    words.push(word);
    console.log('%d %s', freq, word);
  } else {
    repes++;
  }
}).on('close', function() {
  console.warn('Eliminadas %d entradas repetidas', repes);
  process.exit(0);
});
