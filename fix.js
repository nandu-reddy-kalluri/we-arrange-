const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(file);
    }
  });
  return results;
}

const files1 = walk('src/features/home');
const files2 = walk('src/mock-data');
const files = [...files1, ...files2];

const badClasses = [
  '[primary]',
  '[primary-dark]',
  '[accent-gold]',
  '[neutral-cream]',
  '[neutral-charcoal]',
  '[neutral-muted]'
];

files.forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  let o = c;

  badClasses.forEach(bad => {
    const good = bad.replace('[', '').replace(']', '');
    c = c.split(bad).join(good);
  });

  // Fix framer motion animatable border color
  c = c.split('borderColor: isHovered ? "accent-gold" : "#EAE6DE"').join('borderColor: isHovered ? "#C5A880" : "#EAE6DE"');
  
  // Fix the dead unsplash image
  c = c.split('1519225421980-a95ceb485128').join('1519167758481-83f550bb49b3');

  if (c !== o) {
    fs.writeFileSync(f, c);
    console.log(`Updated ${f}`);
  }
});
