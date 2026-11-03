const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');

const dir = 'src/Components/Stores';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));

let errors = 0;
files.forEach(f => {
  const fp = path.join(dir, f);
  const code = fs.readFileSync(fp, 'utf8');
  try {
    parser.parse(code, {
      sourceType: 'module',
      plugins: ['jsx']
    });
    console.log(`✓ ${f}: OK`);
  } catch (err) {
    console.error(`✗ ${f}: Error -> ${err.message}`);
    errors++;
  }
});

if (errors > 0) {
  process.exit(1);
} else {
  console.log(`\nAll ${files.length} Stores components validated successfully!`);
}

