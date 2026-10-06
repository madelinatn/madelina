    // ══════════════════════════════════════════
    // ██  GLOBAL STATE & AUTH                ██
    // ══════════════════════════════════════════
    let currentUser = null;
    let currentView = 'menu';
    let recipesList = [];
    let recipeCategories = [];
    let activeRecipeFilter = 'all';
    let activeScalingRecipe = null;
    let scalingMode = 'dimensions';
    let usersList = [];

    // ══════════════════════════════════════════
    // ██  AUTH GATE LOGIC                     ██
    // ══════════════════════════════════════════
    async function unlockGate() {
      const user = document.getElementById('gate-user').value.trim();
      const pass = document.getElementById('gate-pass').value;
      const errorEl = document.getElementById('gate-error');
      const btn = document.getElementById('gate-btn');

      if (!user || !pass) {
        errorEl.textContent = 'Veuillez saisir l\'identifiant et le mot de passe';
        return;
      }

      errorEl.textContent = 'Vérification en cours...';
      if (btn) btn.disabled = true;

      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: user, password: pass })
        });
        const data = await res.json();
        if (data.success) {
          currentUser = data.user;
          document.getElementById('gate').style.display = 'none';
          document.getElementById('app').style.display = 'block';
          applyUserPermissions();
          initApp();
        } else {
          errorEl.textContent = data.error || 'Identifiant ou mot de passe incorrect';
        }
      } catch (err) {
        errorEl.textContent = 'Erreur de connexion. Vérifiez votre réseau.';
      } finally {
        if (btn) btn.disabled = false;
      }
    }

    async function checkExistingAuth() {
      try {
        const res = await fetch('/api/auth/check');
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.user) {
            currentUser = data.user;
            document.getElementById('gate').style.display = 'none';
            document.getElementById('app').style.display = 'block';
            applyUserPermissions();
            initApp();
            return;
          }
        }
      } catch (e) {
        console.warn('Auth check skipped:', e);
      }
    }

    async function doLogout() {
      try {
        await fetch('/api/auth/logout', { method: 'POST' });
      } catch(e) {}
      currentUser = null;
      document.getElementById('app').style.display = 'none';
      document.getElementById('gate').style.display = 'flex';
      const userEl = document.getElementById('gate-user');
      const passEl = document.getElementById('gate-pass');
      if (userEl) userEl.value = '';
      if (passEl) passEl.value = '';
      const errorEl = document.getElementById('gate-error');
      if (errorEl) errorEl.textContent = '';
    }

    function applyUserPermissions() {
      if (!currentUser) return;

      const userBadge = document.getElementById('current-user-badge');
      if (userBadge) {
        const isAdm = currentUser.role === 'admin';
        userBadge.innerHTML = `👤 <strong>${currentUser.name || currentUser.username}</strong> <span style="font-size:10.5px;opacity:0.85;">(${isAdm ? 'Directrice / Admin' : 'Équipe'})</span>`;
      }

      const navMenu = document.getElementById('nav-menu');
      const navUsers = document.getElementById('nav-users');
      const navRecipes = document.getElementById('nav-recipes');
      const btnHeaderCats = document.getElementById('btn-header-cats');
      const btnHeaderAddPlat = document.getElementById('btn-header-add-plat');

      const isStaff = currentUser.role !== 'admin';

      if (isStaff) {
        if (navMenu) navMenu.style.display = 'none';
        if (navUsers) navUsers.style.display = 'none';
        if (btnHeaderCats) btnHeaderCats.style.display = 'none';
        if (btnHeaderAddPlat) btnHeaderAddPlat.style.display = 'none';
        switchView('recipes');
      } else {
        if (navMenu) navMenu.style.display = '';
        if (navUsers) navUsers.style.display = '';
        if (btnHeaderCats) btnHeaderCats.style.display = '';
        if (btnHeaderAddPlat) btnHeaderAddPlat.style.display = '';
        switchView('menu');
      }
    }

    function switchView(view) {
      currentView = view;
      ['menu', 'recipes', 'users'].forEach(v => {
        const sec = document.getElementById(`section-${v}`);
        const tab = document.getElementById(`nav-${v}`);
        const dock = document.getElementById(`mobile-dock-${v}`);
        if (sec) sec.style.display = (v === view) ? 'block' : 'none';
        if (tab) tab.classList.toggle('active', v === view);
        if (dock) dock.style.display = (v === view) ? 'flex' : 'none';
      });

      if (view === 'recipes') {
        loadRecipes();
      } else if (view === 'users' && currentUser?.role === 'admin') {
        loadUsers();
      }
    }

    // ══════════════════════════════════════════
    // ██  MODULE 1: RECIPES ENGINE            ██
    // ══════════════════════════════════════════
    async function loadRecipes() {
      try {
        const res = await fetch('/api/admin/recipes');
        if (!res.ok) throw new Error('Erreur lors du chargement des recettes');
        const data = await res.json();
        recipesList = data.recipes || [];
        recipeCategories = data.categories || [];
        
        // Update stats
        const statR = document.getElementById('stat-recipes');
        const statC = document.getElementById('stat-recipe-cats');
        const statI = document.getElementById('stat-ingredients');
        const badge = document.getElementById('recipe-count-badge');
        
        let totalIngs = 0;
        recipesList.forEach(r => totalIngs += (r.ingredients?.length || 0));
        
        if (statR) statR.textContent = recipesList.length;
        if (statC) statC.textContent = recipeCategories.length;
        if (statI) statI.textContent = totalIngs;
        if (badge) badge.textContent = `${recipesList.length} recette${recipesList.length > 1 ? 's' : ''}`;

        renderRecipeTabs();
        renderRecipes();
      } catch (err) {
        console.error('loadRecipes error:', err);
      }
    }

    function renderRecipeTabs() {
      const container = document.getElementById('recipe-filter-tabs');
      if (!container) return;

      let html = `<button class="filter-tab ${activeRecipeFilter === 'all' ? 'active' : ''}" onclick="filterRecipes('all')">Tous (${recipesList.length})</button>`;
      recipeCategories.forEach(cat => {
        const count = recipesList.filter(r => r.category_id === cat.id).length;
        html += `<button class="filter-tab ${activeRecipeFilter === cat.id ? 'active' : ''}" onclick="filterRecipes('${cat.id}')">${cat.name} (${count})</button>`;
      });
      container.innerHTML = html;
    }

    function filterRecipes(catId) {
      activeRecipeFilter = catId;
      renderRecipeTabs();
      renderRecipes();
    }

    function renderRecipes() {
      const grid = document.getElementById('recipe-grid');
      if (!grid) return;

      const filtered = (activeRecipeFilter === 'all')
        ? recipesList
        : recipesList.filter(r => r.category_id === activeRecipeFilter);

      if (filtered.length === 0) {
        grid.innerHTML = `
          <div style="grid-column: 1/-1; text-align: center; padding: 48px 20px; background: white; border-radius: 20px; border: 1.5px dashed var(--border);">
            <div style="font-size: 32px; margin-bottom: 8px;">📖</div>
            <h4 style="font-size: 16px; font-weight: 700; color: var(--navy); margin-bottom: 6px;">Aucune recette trouvée</h4>
            <p style="font-size: 13px; color: var(--text-muted); max-width: 380px; margin: 0 auto 16px;">
              ${currentUser?.role === 'admin' ? 'Ajoutez vos premières recettes techniques et commencez à calculer vos proportions intelligemment.' : 'Aucune recette n\'est assignée à votre profil pour le moment.'}
            </p>
            ${currentUser?.role === 'admin' ? '<button class="btn btn-primary btn-sm" onclick="openRecipeModal(null)">+ Créer une recette</button>' : ''}
          </div>
        `;
        return;
      }

      grid.innerHTML = filtered.map(r => {
        const ings = r.ingredients || [];
        const previewIngs = ings.slice(0, 4);
        const hasMoreIngs = ings.length > 4;

        // Base description badge
        let baseBadge = r.base_description;
        if (!baseBadge) {
          if (r.base_type === 'dimension') {
            baseBadge = `${r.base_dim1 || 20} × ${r.base_dim2 || 20} cm (${r.base_portions || 6} parts)`;
          } else {
            baseBadge = `${r.base_portions || 1} portion(s)`;
          }
        }

        const isAdmin = currentUser?.role === 'admin';

        return `
          <div class="recipe-card">
            <div class="recipe-card-header">
              <span class="recipe-cat-tag">${r.category_name || 'Général'}</span>
              <div class="recipe-card-actions">
                ${isAdmin ? `
                  <button class="btn-icon" title="Modifier" onclick="openRecipeModal('${r.id}')">✏️</button>
                  <button class="btn-icon" style="color:var(--danger);" title="Supprimer" onclick="deleteRecipe('${r.id}')">🗑️</button>
                ` : ''}
              </div>
            </div>

            <div class="recipe-name">${r.name}</div>
            <div class="recipe-base-desc">📐 Base : <strong>${baseBadge}</strong></div>

            <div class="recipe-ingredients">
              <div class="recipe-ings-title">Ingrédients (${ings.length})</div>
              ${previewIngs.map(i => `
                <div class="ing-row">
                  <span class="ing-row-name">${i.name}</span>
                  <span class="ing-row-qty">${i.quantity} ${i.unit}</span>
                </div>
              `).join('')}
              ${hasMoreIngs ? `<div style="font-size:11px;color:var(--text-muted);margin-top:4px;">+ ${ings.length - 4} autre(s)...</div>` : ''}
            </div>

            <div style="margin-top:16px;display:flex;gap:8px;">
              <button class="btn btn-primary" style="flex:1;padding:9px;font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center;gap:6px;" onclick="openScalingModal('${r.id}')">
                🧮 Calculer Proportions
              </button>
            </div>
          </div>
        `;
      }).join('');
    }

    function openRecipeModal(recipeId) {
      const modal = document.getElementById('recipe-modal-overlay');
      const form = document.getElementById('recipe-form');
      const title = document.getElementById('recipe-modal-title');
      const catSelect = document.getElementById('r-category');
      
      // Populate category select
      catSelect.innerHTML = recipeCategories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');

      // Clear container
      const container = document.getElementById('recipe-ingredients-container');
      container.innerHTML = '';

      if (recipeId) {
        const recipe = recipesList.find(r => r.id === recipeId);
        if (!recipe) return;

        title.textContent = 'Modifier la Recette';
        document.getElementById('recipe-id').value = recipe.id;
        document.getElementById('r-name').value = recipe.name;
        catSelect.value = recipe.category_id;
        document.getElementById('r-description').value = recipe.description || '';
        document.getElementById('r-base-desc').value = recipe.base_description || '';

        const baseType = recipe.base_type || 'dimension';
        const typeRadios = document.getElementsByName('r-base-type');
        typeRadios.forEach(r => r.checked = (r.value === baseType));

        document.getElementById('r-base-dim1').value = recipe.base_dim1 || 20;
        document.getElementById('r-base-dim2').value = recipe.base_dim2 || 20;
        document.getElementById('r-base-portions').value = recipe.base_portions || 6;
        document.getElementById('r-base-portions-only').value = recipe.base_portions || 1;

        toggleRecipeBaseTypeInputs();

        if (recipe.ingredients && recipe.ingredients.length > 0) {
          recipe.ingredients.forEach(ing => addIngredientRow(ing.name, ing.quantity, ing.unit));
        } else {
          addIngredientRow();
        }
      } else {
        title.textContent = 'Nouvelle Recette';
        form.reset();
        document.getElementById('recipe-id').value = '';
        document.getElementById('r-base-dim1').value = 20;
        document.getElementById('r-base-dim2').value = 20;
        document.getElementById('r-base-portions').value = 6;
        document.getElementById('r-base-portions-only').value = 1;
        toggleRecipeBaseTypeInputs();
        addIngredientRow();
      }

      modal.classList.add('open');
    }

    function closeRecipeModal() {
      document.getElementById('recipe-modal-overlay').classList.remove('open');
    }

    function toggleRecipeBaseTypeInputs() {
      const type = document.querySelector('input[name="r-base-type"]:checked')?.value || 'dimension';
      const dimFields = document.getElementById('base-dim-inputs');
      const portionFields = document.getElementById('base-portion-inputs');
      if (type === 'dimension') {
        dimFields.style.display = 'grid';
        portionFields.style.display = 'none';
      } else {
        dimFields.style.display = 'none';
        portionFields.style.display = 'block';
      }
    }

    function addIngredientRow(name = '', qty = '', unit = 'g') {
      const container = document.getElementById('recipe-ingredients-container');
      const row = document.createElement('div');
      row.className = 'ing-editor-row';
      row.innerHTML = `
        <input type="text" placeholder="Ingrédient (ex: Farine T45)" value="${name.replace(/"/g, '&quot;')}" class="ing-input-name" required />
        <input type="number" placeholder="Quantité" step="any" min="0" value="${qty}" class="ing-input-qty" required />
        <select class="ing-input-unit">
          <option value="g" ${unit === 'g' ? 'selected' : ''}>g</option>
          <option value="kg" ${unit === 'kg' ? 'selected' : ''}>kg</option>
          <option value="ml" ${unit === 'ml' ? 'selected' : ''}>ml</option>
          <option value="cl" ${unit === 'cl' ? 'selected' : ''}>cl</option>
          <option value="L" ${unit === 'L' ? 'selected' : ''}>L</option>
          <option value="pcs" ${unit === 'pcs' ? 'selected' : ''}>pcs</option>
          <option value="c.à.s" ${unit === 'c.à.s' ? 'selected' : ''}>c.à.s</option>
          <option value="c.à.c" ${unit === 'c.à.c' ? 'selected' : ''}>c.à.c</option>
          <option value="pincée" ${unit === 'pincée' ? 'selected' : ''}>pincée</option>
        </select>
        <button type="button" class="ing-remove-btn" onclick="removeIngredientRow(this)" title="Supprimer">✕</button>
      `;
      container.appendChild(row);
    }

    function removeIngredientRow(btn) {
      const container = document.getElementById('recipe-ingredients-container');
      if (container.children.length > 1) {
        btn.closest('.ing-editor-row').remove();
      } else {
        toast('La recette doit comporter au moins un ingrédient', 'error');
      }
    }

    async function saveRecipe(e) {
      e.preventDefault();
      const id = document.getElementById('recipe-id').value;
      const isNew = !id;
      const saveBtn = document.getElementById('r-save-btn');
      saveBtn.disabled = true;
      saveBtn.textContent = 'Enregistrement...';

      const baseType = document.querySelector('input[name="r-base-type"]:checked')?.value || 'dimension';
      const dim1 = parseFloat(document.getElementById('r-base-dim1').value) || 20;
      const dim2 = parseFloat(document.getElementById('r-base-dim2').value) || 20;
      const portions = (baseType === 'dimension')
        ? (parseInt(document.getElementById('r-base-portions').value) || 6)
        : (parseInt(document.getElementById('r-base-portions-only').value) || 1);

      let baseDesc = document.getElementById('r-base-desc').value.trim();
      if (!baseDesc) {
        baseDesc = (baseType === 'dimension')
          ? `Gâteau ${dim1} × ${dim2} cm (${portions} portions)`
          : `${portions} portion(s)`;
      }

      // Collect ingredients
      const rows = document.querySelectorAll('#recipe-ingredients-container .ing-editor-row');
      const ingredients = [];
      rows.forEach((row, idx) => {
        const name = row.querySelector('.ing-input-name').value.trim();
        const qty = parseFloat(row.querySelector('.ing-input-qty').value) || 0;
        const unit = row.querySelector('.ing-input-unit').value;
        if (name) {
          ingredients.push({
            id: 'ing_' + Date.now() + '_' + idx,
            name,
            quantity: qty,
            unit,
            order_idx: idx + 1
          });
        }
      });

      const payload = {
        id: isNew ? ('rec_' + Date.now()) : id,
        name: document.getElementById('r-name').value.trim(),
        category_id: document.getElementById('r-category').value,
        description: document.getElementById('r-description').value.trim(),
        base_description: baseDesc,
        base_type: baseType,
        base_dim1: dim1,
        base_dim2: dim2,
        base_portions: portions,
        base_unit: 'cm',
        ingredients
      };

      try {
        const url = isNew ? '/api/admin/recipes' : `/api/admin/recipes/${id}`;
        const method = isNew ? 'POST' : 'PUT';

        const res = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || 'Erreur lors de la sauvegarde');
        }

        toast(isNew ? '✅ Recette ajoutée avec succès' : '✅ Recette mise à jour', 'success');
        closeRecipeModal();
        await loadRecipes();
      } catch (err) {
        toast('❌ ' + err.message, 'error');
      } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = 'Enregistrer la recette';
      }
    }

    async function deleteRecipe(recipeId) {
      const rec = recipesList.find(r => r.id === recipeId);
      if (!confirm(`Supprimer définitivement la recette "${rec?.name || 'cette recette'}" ?`)) return;

      try {
        const res = await fetch(`/api/admin/recipes/${recipeId}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Échec de suppression');
        toast('🗑️ Recette supprimée', 'success');
        await loadRecipes();
      } catch (err) {
        toast('❌ ' + err.message, 'error');
      }
    }

    // ── RECIPE CATEGORIES MANAGER ──
    function openRecipeCatModal() {
      renderRecipeCatList();
      document.getElementById('recipe-cat-overlay').classList.add('open');
    }

    function closeRecipeCatModal() {
      document.getElementById('recipe-cat-overlay').classList.remove('open');
    }

    function renderRecipeCatList() {
      const list = document.getElementById('recipe-cat-list');
      if (!list) return;

      list.innerHTML = recipeCategories.map((c, idx) => {
        const count = recipesList.filter(r => r.category_id === c.id).length;
        return `
          <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:white;border:1px solid var(--border);border-radius:12px;margin-bottom:8px;">
            <div>
              <span style="font-weight:700;color:var(--navy);font-size:13px;">${c.name}</span>
              <span style="font-size:11px;color:var(--text-muted);margin-left:6px;">(${count} recette${count > 1 ? 's' : ''})</span>
            </div>
            <button class="btn-icon" style="color:var(--danger);" onclick="deleteRecipeCategory('${c.id}')" title="Supprimer">🗑️</button>
          </div>
        `;
      }).join('');
    }

    async function addRecipeCategory() {
      const input = document.getElementById('new-recipe-cat-input');
      const val = input.value.trim();
      if (!val) return;

      const newCat = {
        id: 'cat_' + Date.now(),
        name: val,
        order_idx: recipeCategories.length + 1
      };

      const updated = [...recipeCategories, newCat];
      try {
        const res = await fetch('/api/admin/recipe-categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ categories: updated })
        });
        if (!res.ok) throw new Error('Échec d\'ajout');
        input.value = '';
        toast('✅ Catégorie ajoutée', 'success');
        await loadRecipes();
        renderRecipeCatList();
      } catch (err) {
        toast('❌ ' + err.message, 'error');
      }
    }

    async function deleteRecipeCategory(catId) {
      const count = recipesList.filter(r => r.category_id === catId).length;
      if (count > 0) {
        toast(`Impossible de supprimer : ${count} recette(s) utilisent cette catégorie`, 'error');
        return;
      }
      if (!confirm('Supprimer cette catégorie ?')) return;

      const updated = recipeCategories.filter(c => c.id !== catId);
      try {
        const res = await fetch('/api/admin/recipe-categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ categories: updated })
        });
        if (!res.ok) throw new Error('Échec');
        toast('Catégorie supprimée', 'success');
        await loadRecipes();
        renderRecipeCatList();
      } catch (err) {
        toast('❌ ' + err.message, 'error');
      }
    }

    // ══════════════════════════════════════════
    // ██  SCALING CALCULATOR ENGINE (PRO)     ██
    // ══════════════════════════════════════════
    let currentFactor = 1.0;

    function openScalingModal(recipeId) {
      const rec = recipesList.find(r => r.id === recipeId);
      if (!rec) return;

      activeScalingRecipe = rec;
      document.getElementById('calc-recipe-title').textContent = rec.name;

      const baseBadge = rec.base_description || `${rec.base_dim1 || 20} × ${rec.base_dim2 || 20} cm`;
      document.getElementById('calc-recipe-base-badge').textContent = `Taille standard initiale : ${baseBadge}`;

      // Populate ingredient dropdown for mode 'ingredient'
      const ingSelect = document.getElementById('calc-ing-select');
      ingSelect.innerHTML = (rec.ingredients || []).map((ing, idx) => 
        `<option value="${idx}">${ing.name} (Base : ${ing.quantity} ${ing.unit})</option>`
      ).join('');

      // Base values
      document.getElementById('calc-base-portions-val').value = rec.base_portions || 6;
      document.getElementById('calc-target-portions').value = (rec.base_portions || 6) * 2;
      document.getElementById('calc-target-w').value = (rec.base_dim1 || 20) * 1.5;
      document.getElementById('calc-target-l').value = (rec.base_dim2 || 20) * 1.5;
      document.getElementById('calc-target-diam').value = Math.round((rec.base_dim1 || 20) * 1.3);

      // Instructions preview
      const instBox = document.getElementById('calc-instructions-preview');
      const instText = document.getElementById('calc-instructions-text');
      if (rec.description && rec.description.trim()) {
        instText.textContent = rec.description;
        instBox.style.display = 'block';
      } else {
        instBox.style.display = 'none';
      }

      // Default mode
      if (rec.base_type === 'portion') {
        setScalingMode('portions');
      } else {
        setScalingMode('dimensions');
      }

      document.getElementById('scaling-modal-overlay').classList.add('open');
    }

    function closeScalingModal() {
      document.getElementById('scaling-modal-overlay').classList.remove('open');
    }

    function setScalingMode(mode) {
      scalingMode = mode;
      ['dimensions', 'portions', 'ingredient', 'direct'].forEach(m => {
        const btn = document.getElementById(`btn-scale-${m}`);
        const panel = document.getElementById(`calc-panel-${m}`);
        if (btn) btn.classList.toggle('active', m === mode);
        if (panel) panel.style.display = (m === mode) ? 'block' : 'none';
      });

      if (mode === 'ingredient') {
        onCalcIngredientSelected();
      } else {
        calculateScale();
      }
    }

    function onCalcIngredientSelected() {
      if (!activeScalingRecipe) return;
      const idx = parseInt(document.getElementById('calc-ing-select').value) || 0;
      const ing = (activeScalingRecipe.ingredients || [])[idx];
      if (ing) {
        document.getElementById('calc-ing-target-qty').value = Math.round(ing.quantity * 2);
      }
      calculateScale();
    }

    function setDirectMultiplier(m) {
      currentFactor = m;
      applyCalculatedScale(`Coefficient multiplicateur direct : × ${m.toFixed(2)}`);
    }

    function calculateScale() {
      if (!activeScalingRecipe) return;
      const rec = activeScalingRecipe;
      let factor = 1.0;
      let ratioText = '';

      if (scalingMode === 'dimensions') {
        const shape = document.querySelector('input[name="calc-shape"]:checked')?.value || 'rect';
        const rectFields = document.getElementById('calc-dim-rect-fields');
        const roundFields = document.getElementById('calc-dim-round-fields');

        if (shape === 'rect') {
          rectFields.style.display = 'grid';
          roundFields.style.display = 'none';

          const baseW = rec.base_dim1 || 20;
          const baseL = rec.base_dim2 || 20;
          const targetW = parseFloat(document.getElementById('calc-target-w').value) || baseW;
          const targetL = parseFloat(document.getElementById('calc-target-l').value) || baseL;

          const baseArea = baseW * baseL;
          const targetArea = targetW * targetL;

          factor = targetArea / (baseArea || 1);
          const percentChange = Math.round((factor - 1) * 100);
          const sign = percentChange >= 0 ? '+' : '';
          ratioText = `Surface : ${baseArea} cm² ➔ ${targetArea} cm² (${sign}${percentChange}%)`;
        } else {
          rectFields.style.display = 'none';
          roundFields.style.display = 'block';

          const baseDiam = rec.base_dim1 || 20;
          const targetDiam = parseFloat(document.getElementById('calc-target-diam').value) || baseDiam;

          const baseArea = Math.PI * Math.pow(baseDiam / 2, 2);
          const targetArea = Math.PI * Math.pow(targetDiam / 2, 2);

          factor = targetArea / (baseArea || 1);
          const percentChange = Math.round((factor - 1) * 100);
          const sign = percentChange >= 0 ? '+' : '';
          ratioText = `Diamètre : Ø${baseDiam} cm ➔ Ø${targetDiam} cm (${sign}${percentChange}%)`;
        }
      } else if (scalingMode === 'portions') {
        const baseP = rec.base_portions || 6;
        const targetP = parseFloat(document.getElementById('calc-target-portions').value) || baseP;
        factor = targetP / (baseP || 1);
        ratioText = `Portions : ${baseP} parts ➔ ${targetP} parts`;
      } else if (scalingMode === 'ingredient') {
        const idx = parseInt(document.getElementById('calc-ing-select').value) || 0;
        const ing = (rec.ingredients || [])[idx];
        if (ing && ing.quantity > 0) {
          const targetQty = parseFloat(document.getElementById('calc-ing-target-qty').value) || ing.quantity;
          factor = targetQty / ing.quantity;
          ratioText = `Basé sur ${ing.name} : ${ing.quantity}${ing.unit} ➔ ${targetQty}${ing.unit}`;
        }
      }

      currentFactor = Math.max(0.01, factor);
      applyCalculatedScale(ratioText);
    }

    function applyCalculatedScale(ratioSummary) {
      const bannerText = document.getElementById('calc-ratio-text');
      const pill = document.getElementById('calc-factor-pill');
      const tbody = document.getElementById('calc-tbody');
      const countEl = document.getElementById('calc-items-count');

      if (bannerText) bannerText.textContent = ratioSummary;
      if (pill) pill.textContent = `× ${currentFactor.toFixed(2)}`;

      const ings = activeScalingRecipe?.ingredients || [];
      if (countEl) countEl.textContent = `${ings.length} ingrédient${ings.length > 1 ? 's' : ''}`;

      if (!tbody) return;

      tbody.innerHTML = ings.map(ing => {
        const scaledQty = Math.round(ing.quantity * currentFactor * 100) / 100;
        // Format nicely
        let displayScaled = scaledQty;
        if (scaledQty >= 1000 && ing.unit === 'g') {
          displayScaled = `${(scaledQty / 1000).toFixed(2)} kg (${scaledQty} g)`;
        } else if (scaledQty >= 1000 && ing.unit === 'ml') {
          displayScaled = `${(scaledQty / 1000).toFixed(2)} L (${scaledQty} ml)`;
        } else {
          displayScaled = `${displayScaled} ${ing.unit}`;
        }

        return `
          <tr>
            <td style="font-weight:600;color:var(--navy);">${ing.name}</td>
            <td style="text-align:right;color:var(--text-muted);">${ing.quantity} ${ing.unit}</td>
            <td style="text-align:right;" class="calc-qty-scaled">${displayScaled}</td>
            <td style="color:var(--text-muted);font-weight:500;">${ing.unit}</td>
          </tr>
        `;
      }).join('');
    }

    function printRecipeSheet() {
      if (!activeScalingRecipe) return;
      const rec = activeScalingRecipe;
      const ings = rec.ingredients || [];

      let scaleTitle = `Coefficient : × ${currentFactor.toFixed(2)}`;
      if (scalingMode === 'dimensions') {
        const shape = document.querySelector('input[name="calc-shape"]:checked')?.value || 'rect';
        if (shape === 'rect') {
          const w = document.getElementById('calc-target-w').value;
          const l = document.getElementById('calc-target-l').value;
          scaleTitle = `Moule Rectangulaire : ${w} cm × ${l} cm (Facteur × ${currentFactor.toFixed(2)})`;
        } else {
          const d = document.getElementById('calc-target-diam').value;
          scaleTitle = `Moule Rond : Diamètre Ø ${d} cm (Facteur × ${currentFactor.toFixed(2)})`;
        }
      } else if (scalingMode === 'portions') {
        const p = document.getElementById('calc-target-portions').value;
        scaleTitle = `Quantité : ${p} portions (Facteur × ${currentFactor.toFixed(2)})`;
      }

      const printContainer = document.getElementById('print-recipe-container');
      printContainer.innerHTML = `
        <div style="font-family:'Inter',sans-serif;max-width:800px;margin:0 auto;color:#2A2118;padding:20px;">
          <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:2px solid #A64B2A;padding-bottom:12px;margin-bottom:20px;">
            <div>
              <h1 style="font-size:24px;margin:0;color:#A64B2A;text-transform:uppercase;letter-spacing:0.05em;">MADELINA COFFEE</h1>
              <p style="margin:2px 0 0;font-size:12px;color:#7A6E65;">Laboratoire de Production & Pâtisserie · Fiche Technique</p>
            </div>
            <div style="text-align:right;font-size:12px;color:#7A6E65;">
              Date : ${new Date().toLocaleDateString('fr-FR')}<br />
              Heure : ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>

          <div style="margin-bottom:20px;background:#FAF7F4;padding:16px;border-radius:12px;border:1px solid #EAE3DA;">
            <div style="font-size:11px;font-weight:700;color:#A64B2A;text-transform:uppercase;margin-bottom:4px;">${rec.category_name || 'Recette'}</div>
            <h2 style="font-size:22px;margin:0 0 8px;color:#2A2118;">${rec.name}</h2>
            <div style="font-size:13px;color:#4A3F35;">
              <strong>🎯 Cible calculée :</strong> ${scaleTitle}<br />
              <span style="font-size:12px;color:#7A6E65;">(Base standard : ${rec.base_description || 'Standard'})</span>
            </div>
          </div>

          <h3 style="font-size:14px;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:10px;color:#2A2118;">
            Ingrédients Pesés & Mesurés
          </h3>
          <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
            <thead>
              <tr style="background:#F4EFEB;border-bottom:2px solid #EAE3DA;">
                <th style="text-align:left;padding:10px;font-size:12px;">Ingrédient</th>
                <th style="text-align:right;padding:10px;font-size:12px;">Quantité Calculée</th>
                <th style="text-align:left;padding:10px;font-size:12px;">Unité</th>
                <th style="text-align:center;padding:10px;font-size:12px;width:70px;">Pointage [✓]</th>
              </tr>
            </thead>
            <tbody>
              ${ings.map(ing => {
                const scaled = Math.round(ing.quantity * currentFactor * 100) / 100;
                return `
                  <tr style="border-bottom:1px solid #EAE3DA;">
                    <td style="padding:10px;font-weight:600;font-size:13px;">${ing.name}</td>
                    <td style="padding:10px;text-align:right;font-size:15px;font-weight:700;color:#A64B2A;">${scaled}</td>
                    <td style="padding:10px;font-size:13px;color:#7A6E65;">${ing.unit}</td>
                    <td style="padding:10px;text-align:center;"><div style="width:18px;height:18px;border:1.5px solid #A64B2A;margin:0 auto;border-radius:4px;"></div></td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>

          ${rec.description ? `
            <div style="border-top:1px solid #EAE3DA;padding-top:16px;">
              <h3 style="font-size:13px;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px;color:#2A2118;">Méthode & Procédé</h3>
              <p style="font-size:12.5px;line-height:1.6;color:#4A3F35;white-space:pre-line;margin:0;">${rec.description}</p>
            </div>
          ` : ''}

          <div style="margin-top:40px;border-top:1px dashed #CCC;padding-top:10px;font-size:11px;color:#999;text-align:center;">
            Madelina Coffee & Pâtisserie · Usage Interne Confidentiel
          </div>
        </div>
      `;

      window.print();
    }

    // ══════════════════════════════════════════
    // ██  MODULE 2: USERS & RBAC ENGINE       ██
    // ══════════════════════════════════════════
    async function loadUsers() {
      try {
        const res = await fetch('/api/admin/users');
        if (!res.ok) throw new Error('Impossible de charger les utilisateurs');
        const data = await res.json();
        usersList = data.users || [];

        // Update stats
        const activeCount = usersList.filter(u => u.is_active === 1).length;
        const adminCount = usersList.filter(u => u.role === 'admin').length;
        const staffCount = usersList.filter(u => u.role === 'staff').length;

        document.getElementById('stat-users-active').textContent = activeCount;
        document.getElementById('stat-users-admins').textContent = adminCount;
        document.getElementById('stat-users-staff').textContent = staffCount;

        renderUsers();
      } catch (err) {
        console.error('loadUsers error:', err);
      }
    }

    function renderUsers() {
      const tbody = document.getElementById('user-tbody');
      if (!tbody) return;

      if (usersList.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:30px;color:var(--text-muted);">Aucun utilisateur</td></tr>`;
        return;
      }

      tbody.innerHTML = usersList.map(u => {
        const isAdm = u.role === 'admin';
        const isActive = u.is_active === 1;

        // Categories chips
        let catHtml = '';
        if (isAdm) {
          catHtml = '<span class="cat-chip" style="background:#FDE8E1;color:var(--terracotta);font-weight:700;">⭐ Accès Complet (Toutes)</span>';
        } else if (!u.allowed_categories || u.allowed_categories === '*') {
          catHtml = '<span class="cat-chip" style="background:#E6F4EA;color:#137333;">Toutes les catégories</span>';
        } else {
          try {
            const arr = JSON.parse(u.allowed_categories);
            if (Array.isArray(arr) && arr.length > 0) {
              catHtml = '<div class="cat-chips-list">' + arr.map(catId => {
                const c = recipeCategories.find(rc => rc.id === catId);
                return `<span class="cat-chip">${c ? c.name : catId}</span>`;
              }).join('') + '</div>';
            } else {
              catHtml = '<span style="color:var(--danger);font-size:11px;">Aucune catégorie autorisée</span>';
            }
          } catch (e) {
            catHtml = `<span class="cat-chip">${u.allowed_categories}</span>`;
          }
        }

        const isHaifa = u.username.toLowerCase() === 'haifa';

        return `
          <tr>
            <td>
              <div style="font-weight:700;color:var(--navy);font-size:14px;">${u.name}</div>
              <div style="font-size:12px;color:var(--text-muted);">@${u.username}</div>
            </td>
            <td>
              <span class="role-badge ${isAdm ? 'role-admin' : 'role-staff'}">
                ${isAdm ? '👑 Admin' : '👨‍🍳 Équipe'}
              </span>
            </td>
            <td>${catHtml}</td>
            <td>
              <span class="status-badge ${isActive ? 'status-active' : 'status-inactive'}">
                ${isActive ? '● Actif' : '○ Inactif'}
              </span>
            </td>
            <td style="text-align:right;">
              <button class="btn-icon" title="Modifier" onclick="openUserModal('${u.id}')">✏️</button>
              ${!isHaifa ? `
                <button class="btn-icon" title="${isActive ? 'Désactiver' : 'Activer'}" onclick="toggleUserStatus('${u.id}', ${isActive})">
                  ${isActive ? '⏸️' : '▶️'}
                </button>
                <button class="btn-icon" style="color:var(--danger);" title="Supprimer" onclick="deleteUser('${u.id}')">🗑️</button>
              ` : '<span style="font-size:11px;color:var(--text-muted);font-style:italic;">Principal</span>'}
            </td>
          </tr>
        `;
      }).join('');
    }

    function openUserModal(userId) {
      const modal = document.getElementById('user-modal-overlay');
      const title = document.getElementById('user-modal-title');
      const passLabel = document.getElementById('u-pass-label');
      const passInput = document.getElementById('u-password');
      const userInput = document.getElementById('u-username');

      // Populate category checkboxes
      const container = document.getElementById('u-cat-checkboxes-list');
      container.innerHTML = recipeCategories.map(c => `
        <label style="font-size:12px;display:flex;align-items:center;gap:6px;cursor:pointer;">
          <input type="checkbox" class="u-cat-checkbox" value="${c.id}" />
          ${c.name}
        </label>
      `).join('');

      if (userId) {
        const u = usersList.find(x => x.id === userId);
        if (!u) return;
        title.textContent = 'Modifier l\'Utilisateur';
        document.getElementById('u-id').value = u.id;
        document.getElementById('u-name').value = u.name;
        userInput.value = u.username;
        userInput.disabled = true; // Username shouldn't change
        passInput.value = '';
        passInput.required = false;
        passLabel.textContent = 'MOT DE PASSE (LAISSER VIDE POUR CONSERVER)';
        document.getElementById('u-role').value = u.role;
        document.getElementById('u-is-active').checked = (u.is_active === 1);

        // Checkboxes
        if (u.allowed_categories === '*') {
          document.getElementById('u-cat-all').checked = true;
          toggleAllCatCheckboxes(true);
        } else {
          document.getElementById('u-cat-all').checked = false;
          try {
            const arr = JSON.parse(u.allowed_categories);
            document.querySelectorAll('.u-cat-checkbox').forEach(cb => {
              cb.checked = arr.includes(cb.value);
            });
          } catch(e) {}
        }
      } else {
        title.textContent = 'Nouvel Utilisateur';
        document.getElementById('u-id').value = '';
        document.getElementById('u-name').value = '';
        userInput.value = '';
        userInput.disabled = false;
        passInput.value = '';
        passInput.required = true;
        passLabel.textContent = 'MOT DE PASSE *';
        document.getElementById('u-role').value = 'staff';
        document.getElementById('u-is-active').checked = true;
        document.getElementById('u-cat-all').checked = true;
        toggleAllCatCheckboxes(true);
      }

      onUserRoleChange();
      modal.classList.add('open');
    }

    function closeUserModal() {
      document.getElementById('user-modal-overlay').classList.remove('open');
    }

    function onUserRoleChange() {
      const role = document.getElementById('u-role').value;
      const catBox = document.getElementById('u-categories-box');
      if (role === 'admin') {
        catBox.style.display = 'none';
      } else {
        catBox.style.display = 'block';
      }
    }

    function toggleAllCatCheckboxes(checked) {
      document.querySelectorAll('.u-cat-checkbox').forEach(cb => {
        cb.checked = checked;
      });
    }

    async function saveUser(e) {
      e.preventDefault();
      const id = document.getElementById('u-id').value;
      const isNew = !id;
      const saveBtn = document.getElementById('u-save-btn');
      saveBtn.disabled = true;
      saveBtn.textContent = 'Enregistrement...';

      const role = document.getElementById('u-role').value;
      const isActive = document.getElementById('u-is-active').checked ? 1 : 0;
      const allChecked = document.getElementById('u-cat-all').checked;

      let allowedCategories = '*';
      if (role === 'staff' && !allChecked) {
        const checkedValues = [];
        document.querySelectorAll('.u-cat-checkbox:checked').forEach(cb => {
          checkedValues.push(cb.value);
        });
        allowedCategories = checkedValues;
      }

      const payload = {
        name: document.getElementById('u-name').value.trim(),
        role,
        allowed_categories: allowedCategories,
        is_active: isActive
      };

      const pass = document.getElementById('u-password').value;
      if (isNew) {
        payload.username = document.getElementById('u-username').value.trim().toLowerCase();
        payload.password = pass;
      } else {
        payload.id = id;
        if (pass && pass.trim()) payload.password = pass.trim();
      }

      try {
        const url = '/api/admin/users';
        const method = isNew ? 'POST' : 'PUT';

        const res = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || 'Erreur lors de la sauvegarde');
        }

        toast(isNew ? '✅ Utilisateur créé avec succès' : '✅ Utilisateur mis à jour', 'success');
        closeUserModal();
        await loadUsers();
      } catch (err) {
        toast('❌ ' + err.message, 'error');
      } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = 'Enregistrer';
      }
    }

    async function toggleUserStatus(userId, currentStatus) {
      try {
        const res = await fetch('/api/admin/users', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: userId, is_active: currentStatus ? 0 : 1 })
        });
        if (!res.ok) throw new Error('Échec de mise à jour du statut');
        toast(`Compte ${currentStatus ? 'désactivé' : 'activé'}`, 'success');
        await loadUsers();
      } catch (err) {
        toast('❌ ' + err.message, 'error');
      }
    }

    async function deleteUser(userId) {
      if (!confirm('Supprimer définitivement cet utilisateur ?')) return;
      try {
        const res = await fetch(`/api/admin/users?id=${encodeURIComponent(userId)}`, {
          method: 'DELETE'
        });
        if (!res.ok) {
          const d = await res.json().catch(() => ({}));
          throw new Error(d.error || 'Échec de suppression');
        }
        toast('🗑️ Utilisateur supprimé', 'success');
        await loadUsers();
      } catch (err) {
        toast('❌ ' + err.message, 'error');
      }
    }

    // ══════════════════════════════════════════
    // ██  MODAL BACKDROP & ESCAPE HANDLERS    ██
    // ══════════════════════════════════════════
    const allModalIds = [
      'modal-overlay', 'category-overlay', 'rename-cat-overlay',
      'recipe-modal-overlay', 'recipe-cat-overlay', 'scaling-modal-overlay', 'user-modal-overlay'
    ];

    allModalIds.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      let isBackdropDown = false;
      el.addEventListener('pointerdown', (e) => {
        isBackdropDown = (e.target === el);
      });
      el.addEventListener('click', (e) => {
        if (isBackdropDown && e.target === el) {
          if (id === 'modal-overlay') closeModal();
          else if (id === 'category-overlay') closeCategoryManager();
          else if (id === 'rename-cat-overlay') closeRenameCategory();
          else if (id === 'recipe-modal-overlay') closeRecipeModal();
          else if (id === 'recipe-cat-overlay') closeRecipeCatModal();
          else if (id === 'scaling-modal-overlay') closeScalingModal();
          else if (id === 'user-modal-overlay') closeUserModal();
        }
        isBackdropDown = false;
      });
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (document.getElementById('scaling-modal-overlay')?.classList.contains('open')) closeScalingModal();
        else if (document.getElementById('user-modal-overlay')?.classList.contains('open')) closeUserModal();
        else if (document.getElementById('recipe-modal-overlay')?.classList.contains('open')) closeRecipeModal();
        else if (document.getElementById('recipe-cat-overlay')?.classList.contains('open')) closeRecipeCatModal();
        else if (document.getElementById('rename-cat-overlay')?.classList.contains('open')) closeRenameCategory();
        else if (document.getElementById('modal-overlay')?.classList.contains('open')) closeModal();
        else if (document.getElementById('category-overlay')?.classList.contains('open')) closeCategoryManager();
      }
    });
