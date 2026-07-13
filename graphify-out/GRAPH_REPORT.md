# Graph Report - !yucca_cloudflare  (2026-07-13)

## Corpus Check
- 40 files · ~42,329 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 151 nodes · 239 edges · 12 communities (9 shown, 3 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `37e91bab`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]

## God Nodes (most connected - your core abstractions)
1. `useLanguage()` - 27 edges
2. `compilerOptions` - 16 edges
3. `checkAuth()` - 15 edges
4. `Env` - 11 edges
5. `Reveal()` - 7 edges
6. `scripts` - 6 edges
7. `Café Yucca` - 6 edges
8. `Footer()` - 5 edges
9. `Header()` - 5 edges
10. `hashToken()` - 4 edges

## Surprising Connections (you probably didn't know these)
- `FranchisePage()` --calls--> `useLanguage()`  [EXTRACTED]
  src/pages/FranchisePage.tsx → src/context/LanguageContext.tsx
- `MenuPage()` --calls--> `useLanguage()`  [EXTRACTED]
  src/pages/MenuPage.tsx → src/context/LanguageContext.tsx
- `onRequestGet()` --calls--> `checkAuth()`  [EXTRACTED]
  functions/api/admin/franchise.ts → functions/api/auth/check.ts
- `onRequestPatch()` --calls--> `checkAuth()`  [EXTRACTED]
  functions/api/admin/franchise.ts → functions/api/auth/check.ts
- `onRequestDelete()` --calls--> `checkAuth()`  [EXTRACTED]
  functions/api/admin/franchise.ts → functions/api/auth/check.ts

## Import Cycles
- None detected.

## Communities (12 total, 3 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.17
Nodes (18): ContactForm(), FranchiseBanner(), Hero(), Menu(), MenuItem, OurStory(), Reveal(), RevealProps (+10 more)

### Community 1 - "Community 1"
Cohesion: 0.10
Nodes (20): allowScripts, esbuild@0.25.12, esbuild@0.27.3, workerd@1.20260611.1, dependencies, lucide-react, react, react-dom (+12 more)

### Community 2 - "Community 2"
Cohesion: 0.11
Nodes (16): Footer(), Header(), ScrollToTopButton(), LanguageProvider(), FranchisePage(), CartEntry, DrinkCard, FoodCard (+8 more)

### Community 3 - "Community 3"
Cohesion: 0.15
Nodes (14): onRequestDelete(), onRequestGet(), onRequestPatch(), onRequestGet(), onRequestPost(), onRequestDelete(), onRequestGet(), onRequestPatch() (+6 more)

### Community 4 - "Community 4"
Cohesion: 0.11
Nodes (17): compilerOptions, allowImportingTsExtensions, allowJs, experimentalDecorators, isolatedModules, jsx, lib, module (+9 more)

### Community 5 - "Community 5"
Cohesion: 0.29
Nodes (6): About the Project, Café Yucca, Contact, Features, Live, Tech Stack

### Community 6 - "Community 6"
Cohesion: 0.20
Nodes (10): devDependencies, @cloudflare/workers-types, sharp, tailwindcss, @tailwindcss/vite, terser, @types/node, typescript (+2 more)

## Knowledge Gaps
- **65 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+60 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useLanguage()` connect `Community 0` to `Community 2`?**
  _High betweenness centrality (0.041) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `Community 6` to `Community 1`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _65 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.09523809523809523 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.1076923076923077 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.1477832512315271 - nodes in this community are weakly interconnected._
- **Should `Community 4` be split into smaller, more focused modules?**
  _Cohesion score 0.1111111111111111 - nodes in this community are weakly interconnected._