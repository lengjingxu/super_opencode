const pngToIco = require('png-to-ico');
const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, '../assets/icon.png');
const outputPath = path.join(__dirname, '../assets/icon.ico');

pngToIco(inputPath)
  .then(buf => {
    fs.writeFileSync(outputPath, buf);
    console.log('ICO file created:', outputPath);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
