import fs from 'fs';
let html = fs.readFileSync('scratch/output-index.html', 'utf8');

const oldInit = `    async function initApp() {
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
    }`;

const newInit = `    async function initApp() {
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

if (html.includes(oldInit)) {
  html = html.replace(oldInit, () => newInit);
  fs.writeFileSync('scratch/output-index.html', html);
  console.log('initApp updated successfully');
} else {
  console.log('oldInit already replaced or not found');
}
