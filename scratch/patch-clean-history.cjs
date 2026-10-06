const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'public', 'admin', 'index.html');
let html = fs.readFileSync(filePath, 'utf8');

console.log('Original length:', html.length);

// ─────────────────────────────────────────────────────────────
// 1. UPDATE DEFAULT activeHistoryFilter TO 'recipe'
// ─────────────────────────────────────────────────────────────
const oldActiveFilterTarget = `let activeHistoryFilter = 'all'; // 'all' | 'adjust' | 'recipe'`;
const newActiveFilterTarget = `let activeHistoryFilter = 'recipe'; // 'recipe' | 'adjust'`;
if (!html.includes(oldActiveFilterTarget)) throw new Error('oldActiveFilterTarget not found');
html = html.replace(oldActiveFilterTarget, newActiveFilterTarget);
console.log('1. Default activeHistoryFilter set to recipe');

// ─────────────────────────────────────────────────────────────
// 2. UPDATE filterStockHistoryByType
// ─────────────────────────────────────────────────────────────
const oldFilterByTypeFunc = `    function filterStockHistoryByType(type) {
      activeHistoryFilter = type;
      stockHistoryPage = 1;
      ['all', 'adjust', 'recipe'].forEach(t => {
        const btn = document.getElementById('btn-hist-filter-' + t);
        if (btn) btn.classList.toggle('active', t === type);
      });
      renderStockHistoryView();
    }`;

const newFilterByTypeFunc = `    function filterStockHistoryByType(type) {
      activeHistoryFilter = type;
      stockHistoryPage = 1;
      ['recipe', 'adjust'].forEach(t => {
        const btn = document.getElementById('btn-hist-filter-' + t);
        if (btn) btn.classList.toggle('active', t === type);
      });
      renderStockHistoryView();
    }`;

if (!html.includes(oldFilterByTypeFunc)) throw new Error('oldFilterByTypeFunc not found');
html = html.replace(oldFilterByTypeFunc, newFilterByTypeFunc);
console.log('2. filterStockHistoryByType updated');

// ─────────────────────────────────────────────────────────────
// 3. UPDATE HTML SUB-TABS & THEAD
// ─────────────────────────────────────────────────────────────
const oldTabsAndThead = `          <!-- History Filter Pills -->
          <div style="display:flex;gap:6px;margin-bottom:14px;flex-wrap:wrap;">
            <button type="button" class="filter-tab active" id="btn-hist-filter-all" onclick="filterStockHistoryByType('all')">Tous les mouvements</button>
            <button type="button" class="filter-tab" id="btn-hist-filter-adjust" onclick="filterStockHistoryByType('adjust')">Ajustements manuels</button>
            <button type="button" class="filter-tab" id="btn-hist-filter-recipe" onclick="filterStockHistoryByType('recipe')">Déductions recettes</button>
          </div>

          <!-- Desktop Table History -->
          <div class="stock-history-table-wrap">
            <table class="stock-history-table">
              <thead>
                <tr>
                  <th>DATE &amp; HEURE</th>
                  <th>INGRÉDIENT</th>
                  <th>OPÉRATION</th>
                  <th>VARIATION</th>
                  <th>STOCK AVANT ➔ APRÈS</th>
                  <th>MOTIF / RECETTE</th>
                  <th style="text-align:right;">ACTION</th>
                </tr>
              </thead>
              <tbody id="stock-history-tbody">
                <!-- Populated by JS -->
              </tbody>
            </table>
          </div>`;

const newTabsAndThead = `          <!-- History Sub-Tabs (2 Vues nettement séparées) -->
          <div style="display:flex;gap:8px;margin-bottom:14px;border-bottom:1.5px solid var(--border);padding-bottom:10px;">
            <button type="button" class="filter-tab active" id="btn-hist-filter-recipe" onclick="filterStockHistoryByType('recipe')" style="font-weight:700;font-size:13px;padding:8px 18px;">
              Déductions Recettes
            </button>
            <button type="button" class="filter-tab" id="btn-hist-filter-adjust" onclick="filterStockHistoryByType('adjust')" style="font-weight:700;font-size:13px;padding:8px 18px;">
              Ajustements Manuels
            </button>
          </div>

          <!-- Desktop Table History -->
          <div class="stock-history-table-wrap">
            <table class="stock-history-table">
              <thead id="stock-history-thead">
                <!-- Populated dynamically by JS -->
              </thead>
              <tbody id="stock-history-tbody">
                <!-- Populated by JS -->
              </tbody>
            </table>
          </div>`;

if (!html.includes(oldTabsAndThead)) throw new Error('oldTabsAndThead not found');
html = html.replace(oldTabsAndThead, newTabsAndThead);
console.log('3. Sub-tabs and dynamic thead updated in HTML');

// ─────────────────────────────────────────────────────────────
// 4. REWRITE renderStockHistoryView & MODAL (No text blocks, pure clean session details)
// ─────────────────────────────────────────────────────────────
const oldRenderHistStart = `    let activeHistDetailItem = null;

    function renderStockHistoryView() {`;

const oldRenderHistEnd = `    function closeStockHistoryDetailModal() {
      const overlay = document.getElementById('stock-history-detail-modal-overlay');
      if (overlay) overlay.classList.remove('open');
    }`;

const oldHistBlock = html.substring(
  html.indexOf(oldRenderHistStart),
  html.indexOf(oldRenderHistEnd) + oldRenderHistEnd.length
);

if (!oldHistBlock || oldHistBlock.length < 100) throw new Error('oldHistBlock not found');

const newRenderHistBlock = `    let activeHistDetailSession = null;
    let activeHistDetailItem = null;

    function groupRecipeSessions(historyItems) {
      const recipeItems = historyItems.filter(h => h.action_type === 'recipe' || (/recette/i.test(h.note || '')));
      const sessionMap = new Map();

      recipeItems.forEach(item => {
        let recName = '';
        let factor = '';
        if (item.note) {
          const m = item.note.match(/Recette\\s*:\\s*([^(\\n]+)(?:\\s*\\(([^)]+)\\))?/i);
          if (m) {
            recName = m[1].trim();
            if (m[2]) factor = m[2].trim();
          } else {
            recName = item.note.replace(/^Recette\\s*:\\s*/i, '').trim();
          }
        }
        if (!recName) recName = 'Recette';

        const timeKey = (item.created_at || '').substring(0, 16);
        const key = (item.note || recName) + '___' + timeKey;

        if (!sessionMap.has(key)) {
          sessionMap.set(key, {
            id: 'sess_' + item.id,
            recipeName: recName,
            factorText: factor,
            created_at: item.created_at,
            rawNote: item.note,
            items: []
          });
        }
        sessionMap.get(key).items.push(item);
      });

      return Array.from(sessionMap.values());
    }

    function renderStockHistoryView() {
      const thead = document.getElementById('stock-history-thead');
      const tbody = document.getElementById('stock-history-tbody');
      const cardsList = document.getElementById('stock-history-cards-list');
      const pagEl = document.getElementById('stock-history-pagination');
      if (!tbody || !cardsList) return;

      function formatHistDate(dtStr) {
        if (!dtStr) return '—';
        try {
          const d = new Date(dtStr.replace(' ', 'T') + 'Z');
          if (isNaN(d.getTime())) return dtStr;
          return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) + ' à ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        } catch(e) {
          return dtStr;
        }
      }

      // ════════════════════════════════════════════════════════
      // VIEW A : DÉDUCTIONS RECETTES (Groupé par préparation)
      // ════════════════════════════════════════════════════════
      if (activeHistoryFilter === 'recipe') {
        if (thead) {
          thead.innerHTML = \`
            <tr>
              <th style="width:220px;">DATE &amp; HEURE</th>
              <th>NOM DE LA RECETTE</th>
              <th style="width:230px;">INGRÉDIENTS DÉDUITS</th>
              <th style="text-align:right;width:120px;">ACTION</th>
            </tr>
          \`;
        }

        let sessions = groupRecipeSessions(stockHistoryData);
        if (stockHistorySearchQuery) {
          sessions = sessions.filter(s =>
            (s.recipeName || '').toLowerCase().includes(stockHistorySearchQuery) ||
            (s.created_at || '').toLowerCase().includes(stockHistorySearchQuery) ||
            s.items.some(i => (i.ingredient_name || '').toLowerCase().includes(stockHistorySearchQuery))
          );
        }

        if (sessions.length === 0) {
          const emptyMsg = stockHistorySearchQuery
            ? '🔍 Aucune préparation ne correspond à votre recherche.'
            : 'Aucune déduction de recette enregistrée pour le moment.';
          tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:48px 20px;color:var(--text-muted);font-size:13.5px;">' + emptyMsg + '</td></tr>';
          cardsList.innerHTML = '<div style="text-align:center;padding:40px 20px;background:white;border:1.5px dashed var(--border);border-radius:14px;color:var(--text-muted);font-size:13px;">' + emptyMsg + '</div>';
          if (pagEl) { pagEl.innerHTML = ''; pagEl.style.display = 'none'; }
          return;
        }

        const totalPages = stockHistoryPageSize === 'all' ? 1 : (Math.ceil(sessions.length / stockHistoryPageSize) || 1);
        if (stockHistoryPage > totalPages) stockHistoryPage = totalPages;
        if (stockHistoryPage < 1) stockHistoryPage = 1;
        const paged = stockHistoryPageSize === 'all'
          ? sessions
          : sessions.slice((stockHistoryPage - 1) * stockHistoryPageSize, stockHistoryPage * stockHistoryPageSize);

        // Desktop Table Rows
        tbody.innerHTML = paged.map(s => {
          const dateStr = formatHistDate(s.created_at);
          const factorHtml = s.factorText ? ' <span style="font-size:11.5px;color:var(--text-muted);font-weight:500;">(' + escHtml(s.factorText) + ')</span>' : '';
          const countBadge = '<span class="cat-chip" style="background:#FAF0E8;color:var(--terracotta);font-weight:700;font-size:11.5px;padding:3px 10px;">' +
            s.items.length + ' ingrédient' + (s.items.length > 1 ? 's' : '') + ' déduit' + (s.items.length > 1 ? 's' : '') + '</span>';
          const actionBtn = '<button type="button" class="btn-clean-details" onclick="openRecipeSessionDetailModal(\\'' + escHtml(s.id) + '\\')">Détails →</button>';

          return '<tr>' +
            '<td style="white-space:nowrap;font-size:12.5px;color:var(--text-muted);">' + dateStr + '</td>' +
            '<td><strong style="color:var(--navy);font-size:14px;">' + escHtml(s.recipeName) + '</strong>' + factorHtml + '</td>' +
            '<td>' + countBadge + '</td>' +
            '<td style="text-align:right;">' + actionBtn + '</td>' +
          '</tr>';
        }).join('');

        // Mobile Cards
        cardsList.innerHTML = paged.map(s => {
          const dateStr = formatHistDate(s.created_at);
          const factorHtml = s.factorText ? ' <span style="font-size:11.5px;color:var(--text-muted);font-weight:500;">(' + escHtml(s.factorText) + ')</span>' : '';

          return '<div class="stock-history-card">' +
            '<div class="stock-history-card-top">' +
              '<div style="font-size:15px;font-weight:800;color:var(--navy);">' + escHtml(s.recipeName) + factorHtml + '</div>' +
              '<span class="cat-chip" style="background:#FAF0E8;color:var(--terracotta);font-weight:700;font-size:11px;padding:2px 8px;">' + s.items.length + ' ingr.</span>' +
            '</div>' +
            '<div class="stock-history-card-meta">' +
              '<span>' + dateStr + '</span>' +
              '<button type="button" class="btn-clean-details" onclick="openRecipeSessionDetailModal(\\'' + escHtml(s.id) + '\\')">Détails →</button>' +
            '</div>' +
          '</div>';
        }).join('');

        renderPagination({
          containerId: 'stock-history-pagination',
          totalItems: sessions.length,
          currentPage: stockHistoryPage,
          pageSize: stockHistoryPageSize,
          onPageChange: 'setStockHistoryPage',
          onPageSizeChange: 'setStockHistoryPageSize',
          sizeOptions: [25, 50, 100],
          itemLabel: 'préparations'
        });
        return;
      }

      // ════════════════════════════════════════════════════════
      // VIEW B : AJUSTEMENTS MANUELS
      // ════════════════════════════════════════════════════════
      if (thead) {
        thead.innerHTML = \`
          <tr>
            <th style="width:180px;">DATE &amp; HEURE</th>
            <th>INGRÉDIENT</th>
            <th style="width:140px;">VARIATION</th>
            <th style="width:220px;">STOCK AVANT ➔ APRÈS</th>
            <th>MOTIF / NOTE</th>
            <th style="text-align:right;width:100px;">ACTION</th>
          </tr>
        \`;
      }

      let adjusts = stockHistoryData.filter(h => h.action_type === 'adjust' || (!h.action_type && !/recette/i.test(h.note || '')));
      if (stockHistorySearchQuery) {
        adjusts = adjusts.filter(h =>
          (h.ingredient_name || '').toLowerCase().includes(stockHistorySearchQuery) ||
          (h.note || '').toLowerCase().includes(stockHistorySearchQuery) ||
          (h.created_at || '').toLowerCase().includes(stockHistorySearchQuery)
        );
      }

      if (adjusts.length === 0) {
        const emptyMsg = stockHistorySearchQuery
          ? '🔍 Aucun ajustement ne correspond à votre recherche.'
          : 'Aucun ajustement manuel enregistré pour le moment.';
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:48px 20px;color:var(--text-muted);font-size:13.5px;">' + emptyMsg + '</td></tr>';
        cardsList.innerHTML = '<div style="text-align:center;padding:40px 20px;background:white;border:1.5px dashed var(--border);border-radius:14px;color:var(--text-muted);font-size:13px;">' + emptyMsg + '</div>';
        if (pagEl) { pagEl.innerHTML = ''; pagEl.style.display = 'none'; }
        return;
      }

      const totalPages = stockHistoryPageSize === 'all' ? 1 : (Math.ceil(adjusts.length / stockHistoryPageSize) || 1);
      if (stockHistoryPage > totalPages) stockHistoryPage = totalPages;
      if (stockHistoryPage < 1) stockHistoryPage = 1;
      const paged = stockHistoryPageSize === 'all'
        ? adjusts
        : adjusts.slice((stockHistoryPage - 1) * stockHistoryPageSize, stockHistoryPage * stockHistoryPageSize);

      // Desktop Table Rows
      tbody.innerHTML = paged.map(item => {
        const delta = parseFloat(item.qty_change) || 0;
        const isPos = delta >= 0;
        const deltaSign = isPos ? '+' : '';
        const deltaBadge = '<span class="stock-delta-badge ' + (isPos ? 'positive' : 'negative') + '">' +
          deltaSign + delta.toLocaleString('fr-TN') + ' ' + escHtml(item.unit || '') + '</span>';

        const beforeQty = parseFloat(item.qty_before) || 0;
        const afterQty = parseFloat(item.qty_after) || 0;
        const before = beforeQty >= 99999990 ? '∞' : beforeQty.toLocaleString('fr-TN');
        const after = afterQty >= 99999990 ? '∞' : afterQty.toLocaleString('fr-TN');
        const evol = '<span style="color:var(--text-muted);font-size:12.5px;">' + before + ' ➔ </span><strong style="color:var(--navy);font-size:13px;">' + after + ' ' + escHtml(item.unit || '') + '</strong>';

        const actionBtn = '<button type="button" class="btn-clean-details" onclick="openManualAdjustDetailModal(\\'' + escHtml(item.id) + '\\')">Détails →</button>';

        return '<tr>' +
          '<td style="white-space:nowrap;font-size:12.5px;color:var(--text-muted);">' + formatHistDate(item.created_at) + '</td>' +
          '<td><strong style="color:var(--navy);font-size:13.5px;">' + escHtml(item.ingredient_name) + '</strong></td>' +
          '<td>' + deltaBadge + '</td>' +
          '<td>' + evol + '</td>' +
          '<td style="color:var(--text-muted);font-size:12.5px;">' + (item.note ? escHtml(item.note) : '—') + '</td>' +
          '<td style="text-align:right;">' + actionBtn + '</td>' +
        '</tr>';
      }).join('');

      // Mobile Cards
      cardsList.innerHTML = paged.map(item => {
        const delta = parseFloat(item.qty_change) || 0;
        const isPos = delta >= 0;
        const deltaSign = isPos ? '+' : '';
        const deltaBadge = '<span class="stock-delta-badge ' + (isPos ? 'positive' : 'negative') + '">' +
          deltaSign + delta.toLocaleString('fr-TN') + ' ' + escHtml(item.unit || '') + '</span>';

        const beforeQty = parseFloat(item.qty_before) || 0;
        const afterQty = parseFloat(item.qty_after) || 0;
        const before = beforeQty >= 99999990 ? '∞' : beforeQty.toLocaleString('fr-TN');
        const after = afterQty >= 99999990 ? '∞' : afterQty.toLocaleString('fr-TN');

        return '<div class="stock-history-card">' +
          '<div class="stock-history-card-top">' +
            '<div class="stock-history-card-name">' + escHtml(item.ingredient_name) + '</div>' +
            deltaBadge +
          '</div>' +
          '<div class="stock-history-card-meta">' +
            '<span>' + formatHistDate(item.created_at) + '</span>' +
            '<button type="button" class="btn-clean-details" onclick="openManualAdjustDetailModal(\\'' + escHtml(item.id) + '\\')">Détails →</button>' +
          '</div>' +
          '<div style="font-size:12px;color:var(--text-muted);margin-top:4px;">' +
            'Stock : ' + before + ' ➔ <strong style="color:var(--navy);">' + after + ' ' + escHtml(item.unit || '') + '</strong>' +
          '</div>' +
          (item.note ? '<div class="stock-history-card-note">' + escHtml(item.note) + '</div>' : '') +
        '</div>';
      }).join('');

      renderPagination({
        containerId: 'stock-history-pagination',
        totalItems: adjusts.length,
        currentPage: stockHistoryPage,
        pageSize: stockHistoryPageSize,
        onPageChange: 'setStockHistoryPage',
        onPageSizeChange: 'setStockHistoryPageSize',
        sizeOptions: [25, 50, 100],
        itemLabel: 'ajustements'
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
    }

    // ── MODALE ÉPURÉE : DÉTAILS D'UNE PRÉPARATION DE RECETTE (Point 1 & 2) ──
    function openRecipeSessionDetailModal(sessionId) {
      const sessions = groupRecipeSessions(stockHistoryData);
      const session = sessions.find(s => s.id === sessionId);
      if (!session) return;
      activeHistDetailSession = session;

      const overlay = document.getElementById('stock-history-detail-modal-overlay');
      const titleEl = document.getElementById('shd-title');
      const dateEl = document.getElementById('shd-date');
      const iconEl = document.getElementById('shd-type-icon');
      const contentEl = document.getElementById('shd-content');
      const openRecipeBtn = document.getElementById('shd-open-recipe-btn');

      if (iconEl) iconEl.style.display = 'none';
      if (titleEl) titleEl.textContent = 'Détails de la Préparation';

      let dateFormatted = session.created_at || '—';
      try {
        const d = new Date((session.created_at || '').replace(' ', 'T') + 'Z');
        if (!isNaN(d.getTime())) {
          dateFormatted = d.toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }) +
            ' à ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        }
      } catch(e) {}
      if (dateEl) dateEl.textContent = 'Préparation enregistrée le ' + dateFormatted;

      let html = '';

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
      html += \`
        <div style="margin-top:4px;">
          <div style="font-size:11px;font-weight:800;letter-spacing:0.06em;color:var(--navy);text-transform:uppercase;margin-bottom:8px;">
            INGRÉDIENTS DÉDUITS DANS CETTE MÊME PRÉPARATION (\${session.items.length})
          </div>
          <div style="background:#FFFFFF;border:1.5px solid var(--border);border-radius:14px;overflow:hidden;">
            <table style="width:100%;border-collapse:collapse;font-size:13px;">
              <thead>
                <tr style="background:#FAF7F4;border-bottom:1.5px solid var(--border);color:var(--text-muted);font-size:11px;font-weight:700;text-transform:uppercase;">
                  <th style="padding:10px 14px;text-align:left;">INGRÉDIENT</th>
                  <th style="padding:10px 14px;text-align:center;">DÉDUIT</th>
                  <th style="padding:10px 14px;text-align:right;">STOCK AVANT ➔ APRÈS</th>
                </tr>
              </thead>
              <tbody>
                \${session.items.map(it => {
                  const d = parseFloat(it.qty_change) || 0;
                  const b = parseFloat(it.qty_before) || 0;
                  const a = parseFloat(it.qty_after) || 0;
                  const beforeStr = b >= 99999990 ? '∞' : b.toLocaleString('fr-TN') + ' ' + escHtml(it.unit);
                  const afterStr = a >= 99999990 ? '∞' : a.toLocaleString('fr-TN') + ' ' + escHtml(it.unit);

                  return \`
                    <tr style="border-bottom:1px solid rgba(42,33,24,0.06);">
                      <td style="padding:11px 14px;"><strong style="color:var(--navy);font-size:13.5px;">\${escHtml(it.ingredient_name)}</strong></td>
                      <td style="padding:11px 14px;text-align:center;">
                        <span style="color:#C5221F;font-weight:800;background:#FDF1F0;padding:3px 9px;border-radius:6px;font-size:12.5px;">
                          \${d.toLocaleString('fr-TN')} \${escHtml(it.unit)}
                        </span>
                      </td>
                      <td style="padding:11px 14px;text-align:right;">
                        <span style="color:var(--text-muted);font-size:12px;">\${beforeStr} ➔ </span>
                        <strong style="color:var(--navy);font-size:13px;">\${afterStr}</strong>
                      </td>
                    </tr>
                  \`;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      \`;

      contentEl.innerHTML = html;

      // Chercher si la recette existe pour le bouton de consultation
      if (openRecipeBtn) {
        let matched = null;
        if (session.recipeName && Array.isArray(recipesList)) {
          matched = recipesList.find(r => r.name.toLowerCase() === session.recipeName.toLowerCase()) ||
            recipesList.find(r => r.name.toLowerCase().includes(session.recipeName.toLowerCase()) || session.recipeName.toLowerCase().includes(r.name.toLowerCase()));
        }

        if (matched) {
          openRecipeBtn.style.display = 'inline-flex';
          openRecipeBtn.onclick = function() {
            closeStockHistoryDetailModal();
            openRecipeModal(matched);
          };
        } else {
          openRecipeBtn.style.display = 'none';
        }
      }

      overlay.classList.add('open');
    }

    // ── MODALE DÉTAILS AJUSTEMENT MANUEL ──
    function openManualAdjustDetailModal(itemId) {
      const item = stockHistoryData.find(x => x.id === itemId);
      if (!item) return;

      const overlay = document.getElementById('stock-history-detail-modal-overlay');
      const titleEl = document.getElementById('shd-title');
      const dateEl = document.getElementById('shd-date');
      const iconEl = document.getElementById('shd-type-icon');
      const contentEl = document.getElementById('shd-content');
      const openRecipeBtn = document.getElementById('shd-open-recipe-btn');

      if (iconEl) iconEl.style.display = 'none';
      if (titleEl) titleEl.textContent = 'Détails de l\\'Ajustement Manuel';
      if (openRecipeBtn) openRecipeBtn.style.display = 'none';

      let dateFormatted = item.created_at || '—';
      try {
        const d = new Date((item.created_at || '').replace(' ', 'T') + 'Z');
        if (!isNaN(d.getTime())) {
          dateFormatted = d.toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }) +
            ' à ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        }
      } catch(e) {}
      if (dateEl) dateEl.textContent = 'Ajustement enregistré le ' + dateFormatted;

      const delta = parseFloat(item.qty_change) || 0;
      const isPos = delta >= 0;
      const b = parseFloat(item.qty_before) || 0;
      const a = parseFloat(item.qty_after) || 0;
      const beforeStr = b >= 99999990 ? '∞' : b.toLocaleString('fr-TN') + ' ' + escHtml(item.unit);
      const afterStr = a >= 99999990 ? '∞' : a.toLocaleString('fr-TN') + ' ' + escHtml(item.unit);

      contentEl.innerHTML = \`
        <div style="background:#FAF7F4;border:1.5px solid var(--border);border-radius:14px;padding:16px;">
          <div style="font-size:10px;font-weight:800;color:var(--text-muted);letter-spacing:0.08em;text-transform:uppercase;margin-bottom:4px;">
            INGRÉDIENT AJUSTÉ
          </div>
          <div style="display:flex;align-items:center;justify-content:space-between;">
            <div style="font-size:18px;font-weight:800;color:var(--navy);">\${escHtml(item.ingredient_name)}</div>
            <span class="stock-delta-badge \${isPos ? 'positive' : 'negative'}" style="font-size:13px;padding:5px 12px;">
              \${isPos ? '+' : ''}\${delta.toLocaleString('fr-TN')} \${escHtml(item.unit || '')}
            </span>
          </div>
          <div style="margin-top:12px;padding-top:10px;border-top:1px dashed var(--border);font-size:13px;">
            <span style="color:var(--text-muted);">Évolution :</span>
            <strong style="color:var(--navy);margin-left:4px;">\${beforeStr} ➔ \${afterStr}</strong>
          </div>
        </div>

        <div style="background:#FFFFFF;border:1.5px solid var(--border);border-radius:14px;padding:14px;margin-top:4px;">
          <div style="font-size:10px;font-weight:800;color:var(--text-muted);letter-spacing:0.08em;text-transform:uppercase;margin-bottom:4px;">
            MOTIF / NOTE
          </div>
          <div style="font-size:13.5px;color:var(--navy);font-weight:600;">
            \${item.note ? escHtml(item.note) : 'Aucune note spécifiée'}
          </div>
        </div>
      \`;

      overlay.classList.add('open');
    }

    // Alias for backward compatibility
    const openStockHistoryDetailModal = openRecipeSessionDetailModal;

    function closeStockHistoryDetailModal() {
      const overlay = document.getElementById('stock-history-detail-modal-overlay');
      if (overlay) overlay.classList.remove('open');
    }`;

html = html.replace(oldHistBlock, newRenderHistBlock);
console.log('4. renderStockHistoryView and clean detail modal replaced successfully');

fs.writeFileSync(filePath, html, 'utf8');
console.log('Patch step complete!');
