const fs = require('fs');
let c = fs.readFileSync('public/admin/index.html', 'utf8');

// The patch: after the grid.innerHTML = pagedRecipes.map(...).join(''); 
// we need to add the renderPagination call and the two helper functions
// Unique anchor: "      }).join('');\n    }\n\n    function openRecipeModal(recipeId) {"
const oldChunk = "      }).join('');\n    }\n\n    function openRecipeModal(recipeId) {";
const newChunk = `      }).join('');

      // Recipe pagination bar
      if (recipePagEl) {
        renderPagination(recipePagEl, recipesPage, totalRecipePages, recipesPageSize, filtered.length, 'setRecipesPage', 'setRecipesPageSize');
      }
    }

    function setRecipesPage(p) { recipesPage = p; renderRecipes(); }
    function setRecipesPageSize(s) { recipesPageSize = (s === 'all' ? 'all' : parseInt(s, 10)); recipesPage = 1; renderRecipes(); }

    function openRecipeModal(recipeId) {`;

const count = (c.split(oldChunk)).length - 1;
console.log('Occurrences found:', count);

if (count === 1) {
  c = c.replace(oldChunk, newChunk);
  fs.writeFileSync('public/admin/index.html', c, 'utf8');
  console.log('Patched successfully!');
} else {
  console.log('ERROR: Pattern not unique or not found!');
}
