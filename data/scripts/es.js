var fs = require('fs');
var readline = require('readline');
var rl = readline.createInterface({
  input: fs.createReadStream('../trads.txt'),
  output: process.stdout,
  terminal: false
});

var out = {};

rl.on('line', function(line) {
  processLine(line);
}).on('close', function() {
  console.log(JSON.stringify(out, null, '\t'));
  process.exit(0);
});

function processLine(line) {
  var data = line.split(': ');
  var eo = data[0];
  var es = data[1];

  eo = eo.toLowerCase();
  out[eo] = out[eo] ? out[eo] + '|' + es : es;
}
