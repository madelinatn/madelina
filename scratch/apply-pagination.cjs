const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../public/admin/index.html');
let content = fs.readFileSync(filePath, 'utf8');

// Backup
fs.writeFileSync(filePath + '.bak', content, 'utf8');
console.log('Backup created at ' + filePath + '.bak');

// 1. Add CSS before </style>
const paginationCss = `
    /* ══════════════════════════════════════════ */
    /* PRO PAGINATION COMPONENT                  */
    /* ══════════════════════════════════════════ */
    .pagination-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;
      margin-top: 24px;
      padding: 14px 20px;
      background: var(--white);
      border: 1.5px solid var(--border);
      border-radius: 16px;
      box-shadow: 0 2px 10px rgba(42, 33, 24, 0.03);
    }

    .pagination-info {
      font-size: 13px;
      color: var(--text-muted);
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .pagination-info strong {
      color: var(--navy);
      font-weight: 700;
    }

    .pagination-controls {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-wrap: wrap;
    }

    .pagination-btn {
      min-width: 38px;
      height: 38px;
      padding: 0 10px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 10px;
      border: 1.5px solid var(--border);
      background: var(--white);
      color: var(--navy);
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.18s ease;
      user-select: none;
    }

    .pagination-btn:hover:not(:disabled):not(.active) {
      background: var(--cream);
      border-color: var(--terracotta);
      color: var(--terracotta);
      transform: translateY(-1px);
    }

    .pagination-btn.active {
      background: var(--terracotta);
      border-color: var(--terracotta);
      color: #ffffff;
      font-weight: 700;
      box-shadow: 0 2px 8px rgba(166, 75, 42, 0.28);
    }

    .pagination-btn:disabled {
      opacity: 0.35;
      cursor: not-allowed;
      border-color: var(--border);
      transform: none !important;
    }

    .pagination-ellipsis {
      padding: 0 6px;
      color: var(--text-muted);
      font-weight: 700;
      user-select: none;
      font-size: 14px;
    }

    .pagination-size-wrap {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .pagination-size-label {
      font-size: 12px;
      color: var(--text-muted);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .pagination-size-select {
      height: 36px;
      padding: 0 12px;
      border: 1.5px solid var(--border);
      border-radius: 10px;
      background: var(--white);
      color: var(--navy);
      font-size: 12.5px;
      font-weight: 600;
      outline: none;
      cursor: pointer;
      transition: border-color 0.18s;
    }

    .pagination-size-select:focus {
      border-color: var(--terracotta);
    }

    @media (max-width: 768px) {
      .pagination-bar {
        flex-direction: column;
        align-items: center;
        text-align: center;
        padding: 12px 14px;
        gap: 12px;
      }
      .pagination-controls {
        justify-content: center;
        width: 100%;
      }
      .pagination-btn {
        min-width: 34px;
        height: 34px;
        padding: 0 8px;
        font-size: 12.5px;
      }
      .pagination-info {
        font-size: 12px;
      }
    }
  </style>`;

if (!content.includes('.pagination-bar {')) {
  content = content.replace('  </style>', paginationCss);
  console.log('Added pagination CSS.');
}

// 2. Add renderPagination helper in top script
const topScriptTarget = `    // ══════════════════════════════════════════
    // STOCK ADJUSTMENT & HISTORY LOGIC
    // ══════════════════════════════════════════`;

const topScriptReplacement = `    // ══════════════════════════════════════════
    // GLOBAL PAGINATION ENGINE
    // ══════════════════════════════════════════
    function renderPagination({
      containerId,
      totalItems,
      currentPage,
      pageSize,
      onPageChange,
      onPageSizeChange,
      sizeOptions = [25, 50, 100],
      itemLabel = 'éléments'
    }) {
      const container = document.getElementById(containerId);
      if (!container) return;

      if (!totalItems || totalItems === 0) {
        container.innerHTML = '';
        container.style.display = 'none';
        return;
      }
      container.style.display = 'flex';

      const isAll = (pageSize === 'all');
      const numericSize = isAll ? totalItems : parseInt(pageSize, 10);
      const totalPages = isAll ? 1 : (Math.ceil(totalItems / numericSize) || 1);

      const safePage = Math.min(Math.max(currentPage, 1), totalPages);
      const startItem = isAll ? 1 : ((safePage - 1) * numericSize + 1);
      const endItem = isAll ? totalItems : Math.min(safePage * numericSize, totalItems);

      let pages = [];
      if (totalPages <= 7) {
        for (let i = 1; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        let start = Math.max(2, safePage - 1);
        let end = Math.min(totalPages - 1, safePage + 1);

        if (safePage <= 3) {
          start = 2;
          end = Math.min(4, totalPages - 1);
        } else if (safePage >= totalPages - 2) {
          start = Math.max(2, totalPages - 3);
          end = totalPages - 1;
        }

        if (start > 2) pages.push('...');
        for (let i = start; i <= end; i++) pages.push(i);
        if (end < totalPages - 1) pages.push('...');
        pages.push(totalPages);
      }

      let html = '<div class="pagination-info">' +
        '<span>Affichage</span> ' +
        '<strong>' + startItem + '–' + endItem + '</strong> ' +
        '<span>sur</span> ' +
        '<strong>' + totalItems + '</strong> ' +
        '<span>' + escHtml(itemLabel) + '</span>' +
      '</div>';

      if (totalPages > 1) {
        html += '<div class="pagination-controls">';
        html += '<button type="button" class="pagination-btn" ' + (safePage === 1 ? 'disabled' : '') + ' onclick="' + onPageChange + '(' + (safePage - 1) + ')" aria-label="Page précédente" title="Page précédente">«</button>';

        pages.forEach(p => {
          if (p === '...') {
            html += '<span class="pagination-ellipsis">…</span>';
          } else {
            html += '<button type="button" class="pagination-btn ' + (p === safePage ? 'active' : '') + '" onclick="' + onPageChange + '(' + p + ')">' + p + '</button>';
          }
        });

        html += '<button type="button" class="pagination-btn" ' + (safePage === totalPages ? 'disabled' : '') + ' onclick="' + onPageChange + '(' + (safePage + 1) + ')" aria-label="Page suivante" title="Page suivante">»</button>';
        html += '</div>';
      }

      if (sizeOptions && sizeOptions.length > 0 && totalItems > Math.min(...sizeOptions)) {
        html += '<div class="pagination-size-wrap">' +
          '<span class="pagination-size-label">Par page :</span>' +
          '<select class="pagination-size-select" onchange="' + onPageSizeChange + '(this.value)">' +
            sizeOptions.map(sz => '<option value="' + sz + '" ' + (pageSize == sz ? 'selected' : '') + '>' + sz + '</option>').join('') +
            '<option value="all" ' + (pageSize === 'all' ? 'selected' : '') + '>Tous</option>' +
          '</select>' +
        '</div>';
      }

      container.innerHTML = html;
    }

    // ══════════════════════════════════════════
    // STOCK ADJUSTMENT & HISTORY LOGIC
    // ══════════════════════════════════════════`;

if (!content.includes('GLOBAL PAGINATION ENGINE')) {
  content = content.replace(topScriptTarget, topScriptReplacement);
  console.log('Added renderPagination to top script.');
}

// 3. Add pagination HTML containers
// Container for Menu
if (!content.includes('id="menu-pagination"')) {
  content = content.replace(
    '<div class="dish-list" id="menu-tbody"></div>',
    '<div class="dish-list" id="menu-tbody"></div>\n          <div id="menu-pagination" class="pagination-bar"></div>'
  );
  console.log('Added menu-pagination container.');
}

// Container for Recipes
if (!content.includes('id="recipe-pagination"')) {
  content = content.replace(
    '<div class="recipe-grid" id="recipe-grid">\n          <!-- Dynamically populated -->\n        </div>',
    '<div class="recipe-grid" id="recipe-grid">\n          <!-- Dynamically populated -->\n        </div>\n        <div id="recipe-pagination" class="pagination-bar"></div>'
  );
  console.log('Added recipe-pagination container.');
}

// Container for Stock items
if (!content.includes('id="stock-pagination"')) {
  content = content.replace(
    '<div class="stock-cards-list" id="stock-cards-list">\n            <!-- Populated by JS on mobile -->\n          </div>',
    '<div class="stock-cards-list" id="stock-cards-list">\n            <!-- Populated by JS on mobile -->\n          </div>\n          <div id="stock-pagination" class="pagination-bar"></div>'
  );
  console.log('Added stock-pagination container.');
}

// Container for Stock history
if (!content.includes('id="stock-history-pagination"')) {
  content = content.replace(
    '<div class="stock-history-cards-list" id="stock-history-cards-list">\n            <!-- Populated by JS on mobile -->\n          </div>',
    '<div class="stock-history-cards-list" id="stock-history-cards-list">\n            <!-- Populated by JS on mobile -->\n          </div>\n          <div id="stock-history-pagination" class="pagination-bar"></div>'
  );
  console.log('Added stock-history-pagination container.');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Stage 1 done.');
