const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'public', 'admin', 'index.html');
let html = fs.readFileSync(filePath, 'utf8');

console.log('Original length:', html.length);

// ─────────────────────────────────────────────────────────────
// 1. REMOVE "MDP: ••••••••" block from user table rows
//    Keep it only in the edit modal (which already has its own password field)
// ─────────────────────────────────────────────────────────────
const oldPwBlock = `        const pwBlock = !isAdm ? \`
          <div class="user-pw-display" style="margin-top:5px;" title="Mot de passe collaborateur">
            <span style="font-size:10px;color:var(--text-muted);font-weight:700;margin-right:2px;">MDP:</span>
            <span class="user-pw-text" id="user-pw-\${u.id}">••••••••</span>
            <button type="button" class="btn-user-pw-eye" onclick="toggleUserPasswordRow('\${u.id}', this)" title="Afficher le mot de passe">
              \${SVG_EYE_OPEN}
            </button>
          </div>
        \` : '';`;

const newPwBlock = `        const pwBlock = ''; // MDP display removed from table — only shown in edit modal`;

if (!html.includes(oldPwBlock)) throw new Error('oldPwBlock not found');
html = html.replace(oldPwBlock, newPwBlock);
console.log('1. MDP block removed from user table rows');

// ─────────────────────────────────────────────────────────────
// 2. REPLACE 👤 with ◈ (pro symbol matching site style)
//    In JS where badge innerHTML is set
// ─────────────────────────────────────────────────────────────
const oldUserBadge = `userBadge.innerHTML = \`👤 <strong>\${escHtml(currentUser.name || currentUser.username)}</strong>\`;`;
const newUserBadge = `userBadge.innerHTML = \`◈ <strong>\${escHtml(currentUser.name || currentUser.username)}</strong>\`;`;

if (!html.includes(oldUserBadge)) throw new Error('oldUserBadge not found');
html = html.replace(oldUserBadge, newUserBadge);
console.log('2. 👤 replaced with ◈ in user badge');

// ─────────────────────────────────────────────────────────────
// 3. REMOVE "📖 Voir la recette" button from modal footer HTML
// ─────────────────────────────────────────────────────────────
const oldRecipeBtn = `        <button type="button" class="btn btn-primary" id="shd-open-recipe-btn" style="display:none;" onclick="openRecipeFromHistory()">📖 Voir la recette</button>`;
const newRecipeBtn = ``;

if (!html.includes(oldRecipeBtn)) throw new Error('oldRecipeBtn not found');
html = html.replace(oldRecipeBtn, newRecipeBtn);
console.log('3. "📖 Voir la recette" button removed from modal footer');

// ─────────────────────────────────────────────────────────────
// 4a. In openRecipeSessionDetailModal:
//     - Set title = recipe name (not "Détails de la Préparation")
//     - Remove the "RECETTE PRÉPARÉE / name" header block from content
//     - Keep only the ingredients table
// ─────────────────────────────────────────────────────────────

// 4a-i: Change title to recipe name
const oldTitleSet = `      if (iconEl) iconEl.style.display = 'none';
      if (titleEl) titleEl.textContent = 'Détails de la Préparation';`;

const newTitleSet = `      if (iconEl) iconEl.style.display = 'none';
      if (titleEl) titleEl.textContent = session.recipeName;`;

if (!html.includes(oldTitleSet)) throw new Error('oldTitleSet not found');
html = html.replace(oldTitleSet, newTitleSet);
console.log('4a-i. Modal title set to recipe name');

// 4a-ii: Remove the "RECETTE PRÉPARÉE" header block from html content
const oldRecetteHeader = `      let html = '';

      // En-tête recette épuré (Nom + Facteur) — SANS AUCUN PAVÉ DE TEXTE D'ÉTAPES
      html += \`
        <div style="background:#FAF7F4;border:1.5px solid var(--border);border-radius:14px;padding:16px;">
          <div style="font-size:10px;font-weight:800;color:var(--terracotta);letter-spacing:0.08em;text-transform:uppercase;margin-bottom:4px;">
            RECETTE PRÉPARÉE
          </div>
          <div style="font-size:20px;font-weight:800;color:var(--navy);">
            \${escHtml(session.recipeName)}
          </div>
          \${session.factorText ? \`<div style="font-size:12.5px;color:var(--text-muted);margin-top:4px;font-weight:600;">Proportions : \${escHtml(session.factorText)}</div>\` : ''}
        </div>
      \`;

      // Tableau des Ingrédients Déduits (9adech kenou w 9adech walew)
      html += \``;

const newRecetteHeader = `      // Show factor below title if present
      if (titleEl && session.factorText) {
        titleEl.textContent = session.recipeName;
      }

      let html = '';

      // Tableau des Ingrédients Déduits — direct, sans en-tête redondant
      html += \``;

if (!html.includes(oldRecetteHeader)) throw new Error('oldRecetteHeader not found');
html = html.replace(oldRecetteHeader, newRecetteHeader);
console.log('4a-ii. "RECETTE PRÉPARÉE" header block removed from modal content');

// 4b. Also update the date sub-line to include factor if present
const oldDateLine = `      if (dateEl) dateEl.textContent = 'Préparation enregistrée le ' + dateFormatted;`;
const newDateLine = `      if (dateEl) dateEl.textContent = (session.factorText ? 'Proportions : ' + session.factorText + '  ·  ' : '') + 'Préparé le ' + dateFormatted;`;

if (!html.includes(oldDateLine)) throw new Error('oldDateLine not found');
html = html.replace(oldDateLine, newDateLine);
console.log('4b. Date line updated to include factor proportion info');

// ─────────────────────────────────────────────────────────────
// Save
// ─────────────────────────────────────────────────────────────
fs.writeFileSync(filePath, html, 'utf8');
console.log('✅ All 4 patches applied! New length:', html.length);
