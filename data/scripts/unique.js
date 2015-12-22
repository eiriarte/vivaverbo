var fs = require('fs');
var readline = require('readline');
var rl = readline.createInterface({
  input: fs.createReadStream('../missing.txt'),
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
  if (typeof dict[word] === 'undefined') {
    dict[word] = freq;
    words.push(word);
    console.log('%d %s', freq, word);
  } else {
    repes++;
  }
}).on('close', function() {
  console.log('Eliminadas %d entradas repetidas', repes);
  process.exit(0);
});
