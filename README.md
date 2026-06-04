# India Income Pyramids

A single-page 3D visualization: India rendered as a landmass with every city standing on it
as an **Egyptian-style pyramid**. Pyramid **height encodes city tier** (Tier-1 giant →
Tier-4 small) and the **horizontal banding encodes income disparity** — a wide low-income
base tapering to a tiny ultra-rich apex. Type a city name and the camera flies in to frame
its pyramid.

Self-contained: no backend, no auth, no routing, runs fully offline.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # tsc -b && vite build (passes clean)
```

## Stack

Vite + React + TypeScript · `three` / `@react-three/fiber` / `@react-three/drei` ·
`d3-geo` (projection) · `zustand` (UI state).

## How it works

- **Data** (`src/data/`) — `cities.ts` (the `R` string + parser), `income.ts`
  (`STATES`, `TIER_PCT`, `TIER_COLORS`, `BAND_COLORS`, `fmt`) are ported verbatim from the
  original prototype. The income model is illustrative (national avg 2/4/12/20%); the UI
  keeps the disclaimer. MC pop per 2011 Census.
- **Geocoding** (`src/data/coords.ts`) — Tier-1/2 cities use hardcoded exact coordinates;
  Tier-3/4 use `stateCentroid + deterministicJitter(name)` clamped to India bounds, so their
  positions are approximate (state-level). Khurja (UP) is the exact home marker.
- **Landmass** (`src/data/india.geojson`) — India states, dissolved from districts and
  simplified with mapshaper, bundled for offline use (~26 KB).
- **Projection** (`src/three/useProjection.ts`) — one `d3.geoMercator` shared by the land
  mesh and every city's `[lat,lng] → [x,z]`, fitted planarly (winding-independent) and
  centered on the origin.
- **Pyramids** (`src/three/Pyramids.tsx`) — band proportions depend only on tier, so there
  are 4 distinct banded geometries. Rendered with one `InstancedMesh` per (tier × band) —
  ~20 instanced meshes, one instance per city (per-instance position + uniform height
  scale). Each band's vertical fraction equals its real population share, so the wide grey
  base tapering to a tiny ultra-rich apex *is* the income disparity, made physical.
  4 invisible hit-proxy instanced meshes handle raycast hover/click. A custom shader
  (`onBeforeCompile`) drives per-instance hover glow, selection focus, and dim/desaturate.

## Controls

- **Search** (top center) — fuzzy match + autocomplete; Enter or click flies in and opens
  the detail panel. **Reset view** returns to the overview.
- **Click** a pyramid to select; **hover** for a tooltip. Selecting dims the rest.
- **Filters** (top left) — tier toggles + state dropdown.
- **★ Khurja** — jump to the home marker. **Theme toggle** (top right) — dark / light.
