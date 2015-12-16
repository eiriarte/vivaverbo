var fs = require('fs');
var readline = require('readline');
var rl = readline.createInterface({
  input: fs.createReadStream('freqs.txt'),
  output: process.stdout,
  terminal: false
});
var out = [ [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [] ];

var iksoj = /(cx|gx|hx|jx|sx|ux)/g
var chapeloj = {
  cx: 'ĉ',
  gx: 'ĝ',
  hx: 'ĥ',
  jx: 'ĵ',
  sx: 'ŝ',
  ux: 'ŭ'
}

rl.on('line', function(line) {
  processLine(line);
}).on('close', function() {
  console.log(JSON.stringify(out, null, '\t'));
  process.exit(0);
});

function processLine(line) {
  var data = line.split('\t');
  var word = data[1];
  var freq = parseInt(data[2]);

  word = word.toLowerCase();
  word = word.replace(iksoj, function(ikso) {
    return chapeloj[ikso];
  });

  out[freq].push(word);
}
