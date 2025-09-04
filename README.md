# ShelfLife+ — Biologically Aware Logistics (MVP)

ShelfLife+ reduces fresh produce loss by making the logistics pipeline biologically aware. It integrates basic agri‑biology (e.g., ethylene sensitivity/production, temperature needs, ventilation) into planning so shipments arrive fresher with less waste.

This repository contains the MVP prototype for an interactive demo that validates the core value proposition.


## Why This Matters
- Problem: A significant percentage of fresh produce is lost due to poor handling, incompatible pairings (ethylene‑sensitive vs. ethylene producers), and lack of cooling/ventilation.
- Solution: A rules‑based planner that flags incompatibilities, recommends transport conditions, suggests high‑level truck layout, and simulates impact (waste reduction) — all inside a simple, interactive UI.


## MVP Scope
The MVP is intentionally simple, fast to iterate, and demo‑friendly.
- Single‑file component: Core UI + logic live together in a single component for clarity and portability.
  - Target format: `App.jsx` (all UI, styling, and logic inside this file for hackathon/demo use).
  - In this codebase today, the working page is `src/pages/Index.tsx`; you may keep implementation here during development and later refactor into `App.jsx` if needed for a single‑file deliverable.
- UI: Clean, mobile‑first, responsive UI using TailwindCSS for inputting produce types and quantities.
- Core logic: Simple, explicit rules for commodity compatibility (e.g., "Bananas + Apples: Incompatible" due to ethylene). Rules should be easy to read/edit.
- Interactive demo output:
  - Compatibility check per pairing/group.
  - Recommended transport type (e.g., Refrigerated + Ventilated).
  - Simple truck layout visualizer (zones/stacking hints).
  - Impact simulation (e.g., "Without us: 40% loss vs. With us: 15% loss").
- Code quality: Clean code, clear structure, and heavy comments explaining design and trade‑offs.


## Tech Stack
- React (Vite) — fast dev server and build pipeline.
- TypeScript (current scaffold) or JavaScript (for the single‑file `App.jsx` variant).
- TailwindCSS — utility‑first styling for rapid iteration and responsive design.
- Tooling: ESLint/Prettier (if configured in this repo).


## Project Structure (current)
- `src/main.tsx`: App bootstrap and mounting.
- `src/pages/Index.tsx`: Current main page/component for the MVP UI.
- `src/index.css`: Global styles; Tailwind directives typically live here.

Note: For hackathon/demo packaging, you can collapse logic/UI into a single `App.jsx` file and import it from `main.tsx`.


## Getting Started
- Prerequisites: Node.js 18+ and npm or pnpm.

- Install dependencies:
  - `npm install`

- Run development server:
  - `npm run dev`
  - Open the printed local URL in your browser (typically `http://localhost:5173`).

- Build for production:
  - `npm run build`

- Preview the production build:
  - `npm run preview`

If TailwindCSS isn’t active yet, ensure `src/index.css` contains the Tailwind directives and that Vite/Tailwind configs are set. Otherwise, follow Tailwind’s Vite + React setup.


## The "Single‑File" MVP Pattern
For a portable demo, you can keep everything in one file.
- File: `src/App.jsx`
- Contents: Component UI, Tailwind classes, rules data, helper functions, and comments — all colocated.
- Entry: Update `src/main.tsx` to import `./App.jsx` (or keep using `src/pages/Index.tsx` during development).

Example (in `src/main.tsx`):
```ts
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx' // or './pages/Index'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```


## Compatibility Rules (example shape)
Keep the rules explicit and editable. A simple approach:
```js
const produce = {
  apple: { emitsEthylene: true, sensitiveToEthylene: false, temp: 'cool', vent: 'medium' },
  banana: { emitsEthylene: true, sensitiveToEthylene: true, temp: 'warm', vent: 'high' },
  lettuce: { emitsEthylene: false, sensitiveToEthylene: true, temp: 'cool', vent: 'medium' },
}

function isCompatible(a, b) {
  const A = produce[a]
  const B = produce[b]
  if (!A || !B) return true
  // Incompatibility if one is sensitive and the other emits ethylene
  const ethyleneClash = (A.sensitiveToEthylene && B.emitsEthylene) || (B.sensitiveToEthylene && A.emitsEthylene)
  return !ethyleneClash
}
```

You can extend this with recommended transport (e.g., refrigerated/ventilated) by folding across selected items to choose the strictest requirements.


## Truck Layout Visualizer (simple heuristic)
- Split the truck into zones: front/coldest, middle, rear.
- Place ethylene producers downwind and away from sensitive items.
- Keep higher ventilation zones around high emitters.
- Keep temperature‑sensitive items closest to cold airflow.

The MVP can render a simple grid with labeled zones and suggested placement.


## Impact Simulation (illustrative)
Provide a simple, transparent calculation to illustrate impact:
- Baseline loss: e.g., 30–40% depending on detected incompatibilities.
- With ShelfLife+: reduce expected loss proportionally when incompatibilities are avoided and correct transport is recommended (e.g., down to 10–20%).
- Show both numbers and a simple bar chart/summary.

Clearly mark these figures as illustrative in the UI.


## Contributing
This is an early MVP and collaboration is welcome!
- Ways to help: rules dataset accuracy, UI polish, layout heuristics, testing, and docs.
- Workflow: fork → feature branch → pull request. Please keep PRs focused.
- Code style: prefer small, well‑named helpers; comment non‑obvious logic; keep the single‑file demo readable.
- Issues: use descriptive titles and include reproduction steps or screenshots.

If you’re interested in shaping the product direction, open a discussion or start an RFC in an issue.


## Roadmap (initial)
- Expand commodity rules dataset and references.
- Temperature/ventilation requirement reconciliation across mixed loads.
- Better layout heuristics (zones, stacking, airflow modeling).
- Save/load demo scenarios; shareable links.
- Offline‑friendly PWA wrapper.
- Internationalization.


## Status
Active MVP. Expect sharp edges. Breaking changes may occur as we iterate quickly.


## License
TBD. Until specified, please do not redistribute outside collaboration contexts. We’ll add a formal license as we move beyond MVP.


## Contact
Have ideas, data sources, or want to collaborate? Please open an issue or PR. Further project details will be added — contributions and feedback are highly appreciated.

