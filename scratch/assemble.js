import fs from 'fs';

const orig = fs.readFileSync('public/admin/index.html', 'utf8');

// 1. EXTRACT HEAD (up to </style>)
const styleEndIdx = orig.indexOf('</style>');
if (styleEndIdx === -1) throw new Error('</style> not found');
const headAndStyles = orig.substring(0, styleEndIdx);

const additionalCSS = fs.readFileSync('scratch/additional-css.css', 'utf8');

// 2. EXTRACT OLD DISH MODALS (modal-overlay, category-overlay, rename-cat-overlay)
const modalOverlayStart = orig.indexOf('<!-- DISH MODAL -->');
const toastStart = orig.indexOf('<!-- TOAST NOTIFICATION -->');

if (modalOverlayStart === -1 || toastStart === -1) {
  throw new Error('DISH MODAL or TOAST markers not found');
}

const existingDishModals = orig.substring(modalOverlayStart, toastStart);

// 3. EXTRACT EXISTING MENU JAVASCRIPT FUNCTIONS
const menuStateStart = orig.indexOf('let menuItems = [];');
const oldBackdropStart = orig.indexOf("['modal-overlay', 'category-overlay'");

if (menuStateStart === -1 || oldBackdropStart === -1) {
  throw new Error('menuItems or oldBackdrop markers not found');
}

let existingMenuJs = orig.substring(menuStateStart, oldBackdropStart);

// Update initApp inside existingMenuJs
const oldInitPattern = /async function initApp\(\)[\s\S]*?\n    \}/;
const newInitCode = `async function initApp() {
      if (currentUser && currentUser.role === 'admin') {
        try {
          const res = await fetch('/api/admin/menu');
          if (res.ok) {
            const data = await res.json();
            menuItems = data.items || [];
            if (data.categories && data.categories.length > 0) {
              runtimeCategories = data.categories;
            }
          }
        } catch(e) {
          console.error('Failed to load menu data:', e);
        }
        repopulateCategorySelect();
        render();
      }
      loadRecipes();
    }`;

existingMenuJs = existingMenuJs.replace(oldInitPattern, newInitCode);

// 4. LOAD NEW SCRATCH PARTS
const newSections = fs.readFileSync('scratch/new-html-sections.html', 'utf8');
const newModals = fs.readFileSync('scratch/new-modals.html', 'utf8');
const newScript = fs.readFileSync('scratch/new-script.js', 'utf8');

// 5. ASSEMBLE COMPLETE FILE
const finalContent = `${headAndStyles}
${additionalCSS}
  </style>
</head>

<body>
  <!-- TOP THIN SAVE PROGRESS BAR -->
  <div id="save-progress-bar"></div>

${newSections}

${existingDishModals}

${newModals}

  <!-- TOAST NOTIFICATION -->
  <div id="toast"></div>

  <!-- JAVASCRIPT LOGIC & ENGINES -->
  <script>
${newScript}

    // ══════════════════════════════════════════
    // ██  MENU & DISH ENGINE (ORIGINAL)       ██
    // ══════════════════════════════════════════
${existingMenuJs}
  </script>
</body>

</html>
`;

fs.writeFileSync('public/admin/index.html', finalContent);
console.log('Successfully wrote to public/admin/index.html, length:', finalContent.length);
