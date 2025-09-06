# ShelfLife+

ShelfLife+ is an interactive simulator that helps plan fresh‑produce transport to cut waste. It uses science‑based compatibility checks and smart loading to recommend when and how to move mixed vegetable loads.

## Overview
- Product: ShelfLife+ — biologically aware logistics simulator for fresh produce
- Status: MVP complete — interactive planning, analysis, layout, and impact reporting
- Audience: Farmers, aggregators, logistics planners, and ops teams (PH focus)

## Problem
- Ethylene conflicts: mixed loads accelerate ripening and spoilage
- Temperature mismatch: chilling injuries or heat stress reduce shelf life
- Capacity/utilization: over/under‑loading increases cost and waste
- Operational handoff: plans are hard to share and standardize across teams

## Current Features
- Vegetable input: add items with biological properties and quantities; confirm before removal; toasts for feedback
- Compatibility analysis: flags ethylene + temperature conflicts; auto “Best Time to Travel” (cooler windows when risky/long routes)
- Truck planning: type/size, Auto Truck Quantity toggle with manual override and recommendation helper
- Truck layout: zones grouped by temperature and ethylene, labeled by actual truck size/type
- Impact metrics (PHP): waste, shelf‑life, and cost savings; configurable unit price (₱100 default)
- Export suite: CSV download, JSON copy, branded PDF Scenario Summary
- Persistence + sharing: auto‑save to localStorage and shareable URL state parameter
- Responsive UI: clear sections for Features, Simulator, Benefits

## Tech Stack
- Framework: React 18 + TypeScript, Vite
- UI: Tailwind utilities + shadcn/Radix primitives (button, card, dropdown, dialog, toast)
- Icons: lucide‑react
- State/persistence: React state, localStorage, URL param parsing
- Backend: none (self‑contained MVP)

## Key Files
- `src/pages/Index.tsx`: app shell, state, planning UI, exports
- `src/components/VegetableInput.tsx`: selection, quantity controls, confirm dialog + toasts
- `src/components/CompatibilityAnalysis.tsx`: pairwise checks, travel‑time heuristic
- `src/components/TruckVisualizer.tsx`: temperature/ethylene zones, truck header
- `src/components/ImpactMetrics.tsx`: PHP currency, unitPrice, savings cards

## Data & Calculations
- Vegetable model: `name`, `quantity`, `ethyleneProduction`, `ethyleneSensitivity`, `idealTemp`, `shelfLife`
- Capacity: `small=100`, `medium=200`, `large=400` units; Auto Truck Quantity = `ceil(totalLoad/capacity)`
- Compatibility: flags ethylene conflicts and non‑overlapping temperature ranges
- Best time: prefers Night/Early Morning for cool‑sensitive loads, ethylene risks, long routes (≥6h), or large ambient deltas (≥5°C)
- Impact: baseline waste with conflict penalties vs optimized base 10% waste; savings scale with unit price (₱)

## How To Run
- Install dependencies
  - `npm install`
- Start dev server
  - `npm run dev`
- Lint (optional)
  - `npm run lint`
- Build for production
  - `npm run build`
- Preview production build
  - `npm run preview`

## Using the Simulator
- Plan: Add vegetables → set planning parameters → review compatibility → visualize truck layout → check impact
- Export: Use Export menu for CSV/JSON/PDF
- Reset: Clears current scenario and local save

## Limitations (MVP)
- Mock biology: properties/coefficients are illustrative
- Static capacity: does not model packaging or stack factors
- Layout: fixed block sizes, not proportional to quantity
- No backend: no multi‑user persistence or collaboration

## Roadmap
- Data depth: per‑vegetable costs, packaging types, stack factors
- Environmental inputs: real weather/forecast for route/ambient
- Layout: proportional zones and drag‑and‑drop reassignment with live conflict checks
- Multi‑compartments: dual/tri‑zone reefer support
- Ops handoff: driver/warehouse sheets, QR links, layout‑only PDF
- Team features: sign‑in, saved scenarios, share/comments
- Integrations: WMS/TMS export formats, Excel export, later API endpoints

## License
- Internal MVP — add a license when ready to distribute

