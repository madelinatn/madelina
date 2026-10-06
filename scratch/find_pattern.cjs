const fs = require('fs');
const c = fs.readFileSync('public/admin/index.html', 'utf8');
const lines = c.split('\n');

// Find the closing of renderRecipes function by finding '}).join' at recipe card area
// We know it's around line 7625
// Search for the unique pattern: line with "}).join('');" followed by "    }" followed by blank then "    function openRecipeModal"
for (let i = 7600; i <= 7640; i++) {
  const l = lines[i];
  if (l && l.includes("}).join('')") && lines[i+1] && lines[i+1].trim() === '}') {
    console.log('Found candidate at line', i+1);
    console.log('Lines', i-1, 'to', i+5, ':');
    for (let j = i-1; j <= i+5; j++) {
      console.log(j+1 + ': ' + JSON.stringify(lines[j]));
    }
  }
}
