const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../public/admin/index.html');
let content = fs.readFileSync(filePath, 'utf8');

// ── 1. STOCK HISTORY PAGINATION ──
// Add state variables
content = content.replace(
  "let stockHistoryData = [];\n    let activeStockView = 'items';",
  "let stockHistoryData = [];\n    let stockHistoryPage = 1;\n    let stockHistoryPageSize = 25;\n    let activeStockView = 'items';"
);

// Increase fetch limit in loadStockHistory
content = content.replace(
  "fetch('/api/admin/stock-history?limit=150')",
  "fetch('/api/admin/stock-history?limit=500')"
);

// Reset page in history filters & search
content = content.replace(
  "function filterStockHistoryByType(type) {\n      activeHistoryFilter = type;",
  "function filterStockHistoryByType(type) {\n      activeHistoryFilter = type;\n      stockHistoryPage = 1;"
);

content = content.replace(
  "stockHistorySearchQuery = (inp ? inp.value : '').trim().toLowerCase();\n      if (clearBtn) clearBtn.style.display = stockHistorySearchQuery ? 'flex' : 'none';\n      renderStockHistoryView();",
  "stockHistorySearchQuery = (inp ? inp.value : '').trim().toLowerCase();\n      stockHistoryPage = 1;\n      if (clearBtn) clearBtn.style.display = stockHistorySearchQuery ? 'flex' : 'none';\n      renderStockHistoryView();"
);

content = content.replace(
  "stockHistorySearchQuery = '';\n      renderStockHistoryView();",
  "stockHistorySearchQuery = '';\n      stockHistoryPage = 1;\n      renderStockHistoryView();"
);

// Update renderStockHistoryView to slice and renderPagination
const oldHistEmpty = `      if (filtered.length === 0) {
        const emptyMsg = stockHistorySearchQuery || activeHistoryFilter !== 'all'
          ? '🔍 Aucun mouvement ne correspond à vos filtres.'
          : 'Aucun mouvement de stock enregistré pour le moment.';
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:48px 20px;color:var(--text-muted);font-size:13.5px;">' + emptyMsg + '</td></tr>';
        cardsList.innerHTML = '<div style="text-align:center;padding:40px 20px;background:white;border:1.5px dashed var(--border);border-radius:14px;color:var(--text-muted);font-size:13px;">' + emptyMsg + '</div>';
        return;
      }`;

const newHistEmpty = `      const pagEl = document.getElementById('stock-history-pagination');
      if (filtered.length === 0) {
        const emptyMsg = stockHistorySearchQuery || activeHistoryFilter !== 'all'
          ? '🔍 Aucun mouvement ne correspond à vos filtres.'
          : 'Aucun mouvement de stock enregistré pour le moment.';
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:48px 20px;color:var(--text-muted);font-size:13.5px;">' + emptyMsg + '</td></tr>';
        cardsList.innerHTML = '<div style="text-align:center;padding:40px 20px;background:white;border:1.5px dashed var(--border);border-radius:14px;color:var(--text-muted);font-size:13px;">' + emptyMsg + '</div>';
        if (pagEl) { pagEl.innerHTML = ''; pagEl.style.display = 'none'; }
        return;
      }

      const totalPages = stockHistoryPageSize === 'all' ? 1 : (Math.ceil(filtered.length / stockHistoryPageSize) || 1);
      if (stockHistoryPage > totalPages) stockHistoryPage = totalPages;
      if (stockHistoryPage < 1) stockHistoryPage = 1;
      const paged = stockHistoryPageSize === 'all'
        ? filtered
        : filtered.slice((stockHistoryPage - 1) * stockHistoryPageSize, stockHistoryPage * stockHistoryPageSize);`;

content = content.replace(oldHistEmpty, newHistEmpty);

// Replace tbody.innerHTML = filtered.map and cardsList.innerHTML = filtered.map with paged.map
content = content.replace(
  '// Desktop table\n      tbody.innerHTML = filtered.map(',
  '// Desktop table\n      tbody.innerHTML = paged.map('
);

content = content.replace(
  '// Mobile cards\n      cardsList.innerHTML = filtered.map(',
  '// Mobile cards\n      cardsList.innerHTML = paged.map('
);

// Add renderPagination call and handlers at end of renderStockHistoryView
const histCardsEnd = `          (item.note ? '<div class="stock-history-card-note">' + escHtml(item.note) + '</div>' : '') +
        '</div>';
      }).join('');
    }`;

const histCardsEndNew = `          (item.note ? '<div class="stock-history-card-note">' + escHtml(item.note) + '</div>' : '') +
        '</div>';
      }).join('');

      renderPagination({
        containerId: 'stock-history-pagination',
        totalItems: filtered.length,
        currentPage: stockHistoryPage,
        pageSize: stockHistoryPageSize,
        onPageChange: 'setStockHistoryPage',
        onPageSizeChange: 'setStockHistoryPageSize',
        sizeOptions: [25, 50, 100],
        itemLabel: 'mouvements'
      });
    }

    function setStockHistoryPage(page) {
      stockHistoryPage = page;
      renderStockHistoryView();
      const el = document.getElementById('stock-history-view');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function setStockHistoryPageSize(sz) {
      stockHistoryPageSize = sz === 'all' ? 'all' : parseInt(sz, 10);
      stockHistoryPage = 1;
      renderStockHistoryView();
    }`;

content = content.replace(histCardsEnd, histCardsEndNew);
console.log('Stock History logic updated.');

// ── 2. RECIPES PAGINATION ──
// Add state variables
content = content.replace(
  "let recipeSearchQuery = '';",
  "let recipeSearchQuery = '';\n    let recipesPage = 1;\n    let recipesPageSize = 18;"
);

// Reset page in recipe search & filter
content = content.replace(
  "function onRecipeSearchInput() {\n      const input = document.getElementById('recipe-search');\n      const clearBtn = document.getElementById('recipe-search-clear');\n      recipeSearchQuery = (input ? input.value : '').trim().toLowerCase();",
  "function onRecipeSearchInput() {\n      const input = document.getElementById('recipe-search');\n      const clearBtn = document.getElementById('recipe-search-clear');\n      recipeSearchQuery = (input ? input.value : '').trim().toLowerCase();\n      recipesPage = 1;"
);

content = content.replace(
  "recipeSearchQuery = '';\n      renderRecipes();",
  "recipeSearchQuery = '';\n      recipesPage = 1;\n      renderRecipes();"
);

content = content.replace(
  "function filterRecipes(catId) {\n      activeRecipeFilter = catId;",
  "function filterRecipes(catId) {\n      activeRecipeFilter = catId;\n      recipesPage = 1;"
);

// In renderRecipes, update empty state and slice
const oldRecipeEmpty = `      if (filtered.length === 0) {
        grid.innerHTML = \`
          <div style="grid-column: 1/-1; text-align: center; padding: 48px 20px; background: white; border-radius: 20px; border: 1.5px dashed var(--border);">
            <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="var(--terracotta)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="margin: 0 auto 12px; display:block;"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"></path><path d="M6 2v20"></path><line x1="10" y1="7" x2="16" y2="7"></line><line x1="10" y1="11" x2="16" y2="11"></line></svg>
            <h4 style="font-family:'Playfair Display',serif; font-size: 18px; font-weight: 700; color: var(--navy); margin-bottom: 6px;">Aucune recette trouvée</h4>
            <p style="font-size: 13px; color: var(--text-muted); max-width: 380px; margin: 0 auto 16px;">
              \${recipeSearchQuery ? 'Aucun résultat ne correspond à votre recherche.' : (currentUser?.role === 'admin' ? 'Ajoutez vos premières recettes techniques et commencez à calculer vos proportions intelligemment.' : 'Aucune recette n\\'est assignée à votre profil pour le moment.')}
            </p>
            \${currentUser?.role === 'admin' && !recipeSearchQuery ? '<button class="btn btn-primary btn-sm" onclick="openRecipeModal(null)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:6px;"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>Créer une recette</button>' : ''}
          </div>
        \`;
        return;
      }`;

const newRecipeEmpty = `      const recipePagEl = document.getElementById('recipe-pagination');
      if (filtered.length === 0) {
        grid.innerHTML = \`
          <div style="grid-column: 1/-1; text-align: center; padding: 48px 20px; background: white; border-radius: 20px; border: 1.5px dashed var(--border);">
            <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="var(--terracotta)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="margin: 0 auto 12px; display:block;"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"></path><path d="M6 2v20"></path><line x1="10" y1="7" x2="16" y2="7"></line><line x1="10" y1="11" x2="16" y2="11"></line></svg>
            <h4 style="font-family:'Playfair Display',serif; font-size: 18px; font-weight: 700; color: var(--navy); margin-bottom: 6px;">Aucune recette trouvée</h4>
            <p style="font-size: 13px; color: var(--text-muted); max-width: 380px; margin: 0 auto 16px;">
              \${recipeSearchQuery ? 'Aucun résultat ne correspond à votre recherche.' : (currentUser?.role === 'admin' ? 'Ajoutez vos premières recettes techniques et commencez à calculer vos proportions intelligemment.' : 'Aucune recette n\\'est assignée à votre profil pour le moment.')}
            </p>
            \${currentUser?.role === 'admin' && !recipeSearchQuery ? '<button class="btn btn-primary btn-sm" onclick="openRecipeModal(null)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:6px;"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>Créer une recette</button>' : ''}
          </div>
        \`;
        if (recipePagEl) { recipePagEl.innerHTML = ''; recipePagEl.style.display = 'none'; }
        return;
      }

      const totalRecipePages = recipesPageSize === 'all' ? 1 : (Math.ceil(filtered.length / recipesPageSize) || 1);
      if (recipesPage > totalRecipePages) recipesPage = totalRecipePages;
      if (recipesPage < 1) recipesPage = 1;
      const pagedRecipes = recipesPageSize === 'all'
        ? filtered
        : filtered.slice((recipesPage - 1) * recipesPageSize, recipesPage * recipesPageSize);`;

content = content.replace(oldRecipeEmpty, newRecipeEmpty);
content = content.replace('grid.innerHTML = filtered.map(r => {', 'grid.innerHTML = pagedRecipes.map(r => {');

// Add renderPagination for recipes
const recipeGridEnd = `            <div style="display:flex;gap:8px;margin-top:14px;">
              <button class="recipe-view-btn" onclick="openCookMode('\${r.id}')" title="Suivre la recette sur téléphone ou tablette">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12h20"></path><path d="M20 12v8H4v-8"></path><path d="M6 8a4 4 0 0 1 8 0v4H6V8z"></path><line x1="10" y1="4" x2="10" y2="2"></line></svg>
                <span>Voir la recette</span>
              </button>
              <button class="recipe-calc-btn" onclick="openScalingModal('\${r.id}')" title="Calculer proportions et moules">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"></rect><line x1="8" y1="6" x2="16" y2="6"></line><line x1="16" y1="14" x2="16" y2="18"></line><path d="M16 10h.01"></path><path d="M12 10h.01"></path><path d="M8 10h.01"></path></svg>
                <span>Calculer</span>
              </button>
            </div>
          </div>
        \`;
      }).join('');
    }`;

const recipeGridEndNew = `            <div style="display:flex;gap:8px;margin-top:14px;">
              <button class="recipe-view-btn" onclick="openCookMode('\${r.id}')" title="Suivre la recette sur téléphone ou tablette">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12h20"></path><path d="M20 12v8H4v-8"></path><path d="M6 8a4 4 0 0 1 8 0v4H6V8z"></path><line x1="10" y1="4" x2="10" y2="2"></line></svg>
                <span>Voir la recette</span>
              </button>
              <button class="recipe-calc-btn" onclick="openScalingModal('\${r.id}')" title="Calculer proportions et moules">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"></rect><line x1="8" y1="6" x2="16" y2="6"></line><line x1="16" y1="14" x2="16" y2="18"></line><path d="M16 10h.01"></path><path d="M12 10h.01"></path><path d="M8 10h.01"></path></svg>
                <span>Calculer</span>
              </button>
            </div>
          </div>
        \`;
      }).join('');

      renderPagination({
        containerId: 'recipe-pagination',
        totalItems: filtered.length,
        currentPage: recipesPage,
        pageSize: recipesPageSize,
        onPageChange: 'setRecipesPage',
        onPageSizeChange: 'setRecipesPageSize',
        sizeOptions: [12, 18, 36, 72],
        itemLabel: 'recettes'
      });
    }

    function setRecipesPage(page) {
      recipesPage = page;
      renderRecipes();
      const el = document.getElementById('recipe-grid');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function setRecipesPageSize(sz) {
      recipesPageSize = sz === 'all' ? 'all' : parseInt(sz, 10);
      recipesPage = 1;
      renderRecipes();
    }`;

content = content.replace(recipeGridEnd, recipeGridEndNew);
console.log('Recipes logic updated.');

// ── 3. MENU DISHES PAGINATION ──
// Add state variables
content = content.replace(
  "let menuSearchQuery = '';",
  "let menuSearchQuery = '';\n    let menuPage = 1;\n    let menuPageSize = 20;"
);

// Reset page in menu search & filter
content = content.replace(
  "menuSearchQuery = (input ? input.value : '').trim().toLowerCase();\n      if (clearBtn) clearBtn.style.display = menuSearchQuery ? 'flex' : 'none';\n      render();",
  "menuSearchQuery = (input ? input.value : '').trim().toLowerCase();\n      menuPage = 1;\n      if (clearBtn) clearBtn.style.display = menuSearchQuery ? 'flex' : 'none';\n      render();"
);

content = content.replace(
  "menuSearchQuery = '';\n      render();",
  "menuSearchQuery = '';\n      menuPage = 1;\n      render();"
);

content = content.replace(
  "function setFilter(cat) {\n      activeFilter = cat;\n      render();",
  "function setFilter(cat) {\n      activeFilter = cat;\n      menuPage = 1;\n      render();"
);

// In render(), update empty state and slice
const oldMenuEmpty = `      // Empty state
      if (filtered.length === 0) {
        const emptyEl = document.createElement('div');
        emptyEl.className = 'empty-state';
        emptyEl.innerHTML = \`
          <div class="empty-state-icon">🍽️</div>
          <div class="empty-state-title">Aucun plat trouvé</div>
          <div class="empty-state-desc">\${menuSearchQuery ? 'Aucun résultat ne correspond à votre recherche.' : 'Cette catégorie est vide. Ajoutez votre premier plat.'}</div>
          \${!menuSearchQuery ? '<button class="btn btn-primary btn-sm" onclick="openModal(null)">+ Ajouter un plat</button>' : ''}
        \`;
        list.appendChild(emptyEl);
        return;
      }

      filtered.forEach((item, idx) => {`;

const newMenuEmpty = `      // Empty state
      const menuPagEl = document.getElementById('menu-pagination');
      if (filtered.length === 0) {
        const emptyEl = document.createElement('div');
        emptyEl.className = 'empty-state';
        emptyEl.innerHTML = \`
          <div class="empty-state-icon">🍽️</div>
          <div class="empty-state-title">Aucun plat trouvé</div>
          <div class="empty-state-desc">\${menuSearchQuery ? 'Aucun résultat ne correspond à votre recherche.' : 'Cette catégorie est vide. Ajoutez votre premier plat.'}</div>
          \${!menuSearchQuery ? '<button class="btn btn-primary btn-sm" onclick="openModal(null)">+ Ajouter un plat</button>' : ''}
        \`;
        list.appendChild(emptyEl);
        if (menuPagEl) { menuPagEl.innerHTML = ''; menuPagEl.style.display = 'none'; }
        return;
      }

      const totalMenuPages = menuPageSize === 'all' ? 1 : (Math.ceil(filtered.length / menuPageSize) || 1);
      if (menuPage > totalMenuPages) menuPage = totalMenuPages;
      if (menuPage < 1) menuPage = 1;
      const pagedMenu = menuPageSize === 'all'
        ? filtered
        : filtered.slice((menuPage - 1) * menuPageSize, menuPage * menuPageSize);

      pagedMenu.forEach((item, idx) => {`;

content = content.replace(oldMenuEmpty, newMenuEmpty);

// Add renderPagination for menu
const oldMenuRenderEnd = `        card.innerHTML = \`
          \${dragHtml}
          <div class="dish-photo-col">\${imgHtml}</div>
          <div class="dish-plat-col">
            <div class="dish-title">\${item.title}</div>
            \${item.description ? \`<div class="dish-desc">\${item.description}</div>\` : ''}
          </div>
          <div class="dish-cat-col">
            <span class="category-badge">\${item.category}</span>
          </div>
          <div class="dish-price-col">
            <span class="dish-price">\${typeof item.price === 'number' ? item.price.toFixed(1) : item.price} DT</span>
          </div>
          <div class="dish-actions-col">
            <div class="dish-actions">
              <button class="btn btn-secondary btn-sm btn-edit" onclick="openModal(\${realIndex})" title="Modifier">\${penIcon}</button>
              <button class="btn btn-secondary btn-sm btn-vis" onclick="toggleHide(\${realIndex})" title="\${item.is_hidden ? 'Afficher' : 'Masquer'}">\${item.is_hidden ? eyeOff : eyeOpen}</button>
              <button class="btn btn-danger btn-sm btn-del" onclick="deleteItem(\${realIndex})" title="Supprimer">\${trashIcon}</button>
            </div>
          </div>
        \`;
        list.appendChild(card);
      });
    }`;

const newMenuRenderEnd = `        card.innerHTML = \`
          \${dragHtml}
          <div class="dish-photo-col">\${imgHtml}</div>
          <div class="dish-plat-col">
            <div class="dish-title">\${item.title}</div>
            \${item.description ? \`<div class="dish-desc">\${item.description}</div>\` : ''}
          </div>
          <div class="dish-cat-col">
            <span class="category-badge">\${item.category}</span>
          </div>
          <div class="dish-price-col">
            <span class="dish-price">\${typeof item.price === 'number' ? item.price.toFixed(1) : item.price} DT</span>
          </div>
          <div class="dish-actions-col">
            <div class="dish-actions">
              <button class="btn btn-secondary btn-sm btn-edit" onclick="openModal(\${realIndex})" title="Modifier">\${penIcon}</button>
              <button class="btn btn-secondary btn-sm btn-vis" onclick="toggleHide(\${realIndex})" title="\${item.is_hidden ? 'Afficher' : 'Masquer'}">\${item.is_hidden ? eyeOff : eyeOpen}</button>
              <button class="btn btn-danger btn-sm btn-del" onclick="deleteItem(\${realIndex})" title="Supprimer">\${trashIcon}</button>
            </div>
          </div>
        \`;
        list.appendChild(card);
      });

      renderPagination({
        containerId: 'menu-pagination',
        totalItems: filtered.length,
        currentPage: menuPage,
        pageSize: menuPageSize,
        onPageChange: 'setMenuPage',
        onPageSizeChange: 'setMenuPageSize',
        sizeOptions: [12, 20, 40, 80],
        itemLabel: 'plats'
      });
    }

    function setMenuPage(page) {
      menuPage = page;
      render();
      const el = document.getElementById('menu-tbody');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function setMenuPageSize(sz) {
      menuPageSize = sz === 'all' ? 'all' : parseInt(sz, 10);
      menuPage = 1;
      render();
    }`;

content = content.replace(oldMenuRenderEnd, newMenuRenderEnd);
console.log('Menu dishes logic updated.');

// ── 4. STOCK INGREDIENTS PAGINATION ──
// Add state variables
content = content.replace(
  "let stockData = [];\n    let stockCategories = [];\n    let activeStockFilter = 'all';\n    let stockSearchQuery = '';",
  "let stockData = [];\n    let stockCategories = [];\n    let activeStockFilter = 'all';\n    let stockSearchQuery = '';\n    let stockPage = 1;\n    let stockPageSize = 25;"
);

// Reset page in stock search & filter
content = content.replace(
  "function filterStockByCategory(catName) {\n      activeStockFilter = catName;\n      renderStockTabs();\n      renderStockView();\n    }",
  "function filterStockByCategory(catName) {\n      activeStockFilter = catName;\n      stockPage = 1;\n      renderStockTabs();\n      renderStockView();\n    }"
);

content = content.replace(
  "stockSearchQuery = (input ? input.value : '').trim().toLowerCase();\n      if (clearBtn) clearBtn.style.display = stockSearchQuery ? 'flex' : 'none';\n      renderStockView();",
  "stockSearchQuery = (input ? input.value : '').trim().toLowerCase();\n      stockPage = 1;\n      if (clearBtn) clearBtn.style.display = stockSearchQuery ? 'flex' : 'none';\n      renderStockView();"
);

content = content.replace(
  "stockSearchQuery = '';\n      renderStockView();",
  "stockSearchQuery = '';\n      stockPage = 1;\n      renderStockView();"
);

// In renderStockView, slice and renderPagination
const oldStockRender = `      renderStockDesktopTable(filtered);
      renderStockMobileCards(filtered);
    }`;

const newStockRender = `      const stockPagEl = document.getElementById('stock-pagination');
      if (filtered.length === 0) {
        renderStockDesktopTable([]);
        renderStockMobileCards([]);
        if (stockPagEl) { stockPagEl.innerHTML = ''; stockPagEl.style.display = 'none'; }
        return;
      }

      const totalStockPages = stockPageSize === 'all' ? 1 : (Math.ceil(filtered.length / stockPageSize) || 1);
      if (stockPage > totalStockPages) stockPage = totalStockPages;
      if (stockPage < 1) stockPage = 1;
      const pagedStock = stockPageSize === 'all'
        ? filtered
        : filtered.slice((stockPage - 1) * stockPageSize, stockPage * stockPageSize);

      renderStockDesktopTable(pagedStock);
      renderStockMobileCards(pagedStock);

      renderPagination({
        containerId: 'stock-pagination',
        totalItems: filtered.length,
        currentPage: stockPage,
        pageSize: stockPageSize,
        onPageChange: 'setStockPage',
        onPageSizeChange: 'setStockPageSize',
        sizeOptions: [25, 50, 100],
        itemLabel: 'ingrédients'
      });
    }

    function setStockPage(page) {
      stockPage = page;
      renderStockView();
      const el = document.getElementById('stock-main-view');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function setStockPageSize(sz) {
      stockPageSize = sz === 'all' ? 'all' : parseInt(sz, 10);
      stockPage = 1;
      renderStockView();
    }`;

content = content.replace(oldStockRender, newStockRender);
console.log('Stock Ingrédients logic updated.');

fs.writeFileSync(filePath, content, 'utf8');
console.log('All 4 pagination systems applied successfully!');
