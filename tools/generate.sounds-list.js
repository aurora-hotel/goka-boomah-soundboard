// Node script: run vanaf repo root: `node tools/generate-sounds-list.js`
// Dit genereert/overschrijft sounds/list.json met alle bestanden in ./sounds
const fs = require('fs');
const path = require('path');

const soundsDir = path.join(__dirname, '..', 'sounds');
const outFile = path.join(soundsDir, 'list.json');

if (!fs.existsSync(soundsDir)) {
  console.error('Folder sounds/ bestaat niet. Maak deze aan en voeg je files toe.');
  process.exit(1);
}

const files = fs.readdirSync(soundsDir).filter(f => !f.startsWith('.') && fs.statSync(path.join(soundsDir, f)).isFile());
fs.writeFileSync(outFile, JSON.stringify(files, null, 2), 'utf8');
console.log(`Gegenereerd ${outFile} met ${files.length} bestanden.`);
