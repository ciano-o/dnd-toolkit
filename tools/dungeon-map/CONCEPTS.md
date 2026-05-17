# Dungeon Map Tool — Concepts & Implementation Plan

## Overview

A visual dungeon crawl map for D&D 5e sessions. The DM builds and edits the map live,
places tokens, draws area-of-effect overlays, and annotates. Two browser windows run
simultaneously on the same machine, one per screen:

- **DM Window** — full editor access, all tokens visible, DM-only annotations shown
- **Player Window** — read-only canvas, hidden/invisible tokens suppressed, clean view

Both windows share state via the **BroadcastChannel API** (no server required). Designed
for Discord 2-screen sessions where the player window is screen-shared.

---

## File Structure

```
tools/dungeon-map/
├── index.html          ← main entry point, layout shell, toolbar HTML
├── dungeon-map.css     ← all styles (layout, toolbar, panels, tokens dialog)
├── state.js            ← state object, mutation helpers, localStorage save/load
├── renderer.js         ← canvas rendering (all layers, viewport transforms)
├── tiles.js            ← tile type definitions, colors, icons
├── tokens.js           ← token add/edit/delete, drag-and-drop logic
├── aoe.js              ← AoE shape definitions, draw/drag/rotate logic
├── annotations.js      ← freehand drawing layer (pen strokes)
├── sync.js             ← BroadcastChannel broadcast + receive
├── ui.js               ← toolbar, sidebar, dialogs, panels wiring
└── CONCEPTS.md         ← this file
```

---

## State Model

The single source of truth. Mutate via helpers in `state.js`, never directly.

```js
{
  map: {
    cols: 30,
    rows: 20,
    cellSize: 60,           // px per cell at zoom 1
    bgImageData: null,      // base64 string
    tiles: []               // 2D array [row][col] = tileType (string)
  },
  tokens: [
    {
      id,                   // unique string (crypto.randomUUID)
      name,                 // display name
      tokenType,            // 'player' | 'monster' | 'npc'
      col, row,             // grid position (top-left corner)
      size,                 // 1=medium, 2=large, 3=huge (occupies size×size cells)
      color,                // hex ring color
      imageData,            // base64 portrait, or null
      hidden,               // DM flag: not shown in player view
      invisible,            // DM flag: shown as ghost in DM view, hidden in player view
      conditions: []        // lightweight condition strings (visual icons only)
    }
  ],
  aoeShapes: [
    {
      id,
      shapeType,            // 'circle' | 'cone' | 'line' | 'square'
      col, row,             // anchor grid position
      size,                 // radius or length in cells
      angle,                // rotation in radians (cone / line)
      color,                // hex
      label                 // optional spell name
    }
  ],
  annotations: [
    {
      id,
      dmOnly,               // true = hidden in player view
      color,
      width,
      points: [{x, y}]      // world coords (not screen)
    }
  ],
  viewport: {
    panX: 0, panY: 0,
    zoom: 1.0
  }
}
```

`viewMode` ('dm' | 'player') is **not** part of shared state. It lives in
`sessionStorage` per window, set via `?mode=player` URL param on the player window.

---

## Tile Types

Defined in `tiles.js`. Each has a fill color, border color, and optional canvas draw
function for icons (doors, stairs).

| Key           | Label           | Notes                                |
|---------------|-----------------|--------------------------------------|
| `floor`       | Floor           | light stone color                    |
| `wall`        | Wall            | dark, thick stroke                   |
| `void`        | Void            | transparent (shows bg image through) |
| `water`       | Water           | blue tint                            |
| `lava`        | Lava            | orange-red                           |
| `pit`         | Pit             | black with depth lines               |
| `dirt`        | Dirt            | tan brown                            |
| `stone`       | Stone           | medium grey                          |
| `door-closed` | Door (closed)   | drawn as D-shape on cell             |
| `door-open`   | Door (open)     | drawn as open arch                   |
| `stairs-up`   | Stairs ↑        | staircase icon                       |
| `stairs-down` | Stairs ↓        | staircase icon (reversed)            |
| `difficult`   | Difficult Terrain | floor + hatching overlay            |
| `secret-door` | Secret Door     | shown differently in DM vs player    |

Click a door tile with the Select tool → toggles open/closed.

---

## Canvas Rendering (renderer.js)

Single `<canvas>` element. All layers drawn each render call in order:

1. **Clear** canvas (fill with background color)
2. **Apply viewport transform** (`ctx.setTransform(zoom, 0, 0, zoom, panX, panY)`)
3. **Background image** — `drawImage(bgImg, 0, 0, cols*cellSize, rows*cellSize)`
4. **Terrain tiles** — iterate `state.map.tiles`, call each tile's draw function
5. **Grid lines** — if enabled, draw thin lines over terrain
6. **Annotations** — draw strokes; skip dmOnly if viewMode === 'player'
7. **AoE shapes** — semi-transparent fill + dashed border
8. **Tokens** — circle (or image) + ring color; ghosts for hidden/invisible in DM view;
   skip hidden/invisible entirely if viewMode === 'player'
9. **Selection highlight** — dashed ring around selected token/shape
10. **Hover hint** — subtle highlight on cell under cursor
11. **Ruler line** — if ruler tool active and measuring
12. **Reset transform**

Re-render triggered by `requestAnimationFrame` on any state mutation (dirty flag pattern).

### Viewport Helpers

```js
screenToWorld(sx, sy) → { col, row }   // screen px → grid cell
worldToScreen(col, row) → { x, y }     // grid cell → screen px (top-left of cell)
```

---

## Toolbar & Tools (ui.js)

Left vertical toolbar. One active tool at a time.

| Tool     | Shortcut | Behaviour |
|----------|----------|-----------|
| Select   | V        | Click to select token/AoE, drag to move (grid-snapped) |
| Paint    | T        | Click/drag cells to apply selected tile type; tile palette appears below toolbar |
| Erase    | E        | Click/drag cells, resets to `floor` |
| Token    | P        | Click cell → opens Add Token dialog |
| AoE      | A        | Click anchor cell, drag out size; cone/line rotates with mouse angle |
| Draw     | D        | Freehand pen; color + width pickers; DM-only toggle checkbox |
| Ruler    | R        | Click two cells, shows distance overlay in feet (1 cell = 5 ft) |
| Pan      | Space    | Hold Space + drag; also always active with middle-mouse button |

---

## Token System (tokens.js)

### Rendering
- Circle clipped image (if `imageData`) or filled circle with initial letter
- Colored ring around circle (`token.color`)
- Name label below token
- Condition icons (small emoji/symbols) along top edge
- Ghost render (50% opacity + dashed ring) for hidden/invisible in DM view

### Drag & Drop
- `mousedown` on token → begin drag
- `mousemove` → move token, show preview at snapped grid position
- `mouseup` → commit position, broadcast state

### Add Token Dialog
- Name input
- Type select (Player / Monster / NPC)
- Size select (Medium / Large / Huge)
- Color picker
- Portrait image upload (FileReader → base64)
- Condition checkboxes

### Right-click Context Menu
- Toggle Hidden
- Toggle Invisible
- Edit (reopens dialog)
- Remove Token

---

## AoE Shapes (aoe.js)

### Shapes
- **Circle** — filled arc, radius in cells
- **Cone** — filled triangle/sector (60° default), anchor + angle + length
- **Line** — filled rectangle (5ft wide = 1 cell), anchor + angle + length
- **Square** — axis-aligned or rotated rectangle

### Interaction
- Draw tool: click anchor, drag to set size and direction
- Select tool: click shape to select, drag to move, rotation handle at edge
- Delete: Delete key or right-click → remove

### Rendering
- Semi-transparent fill (40% opacity)
- Dashed border (2px)
- Element color presets: fire, cold, lightning, acid, necrotic, radiant, force
- Optional label (spell name) at center

---

## Annotation Layer (annotations.js)

- Freehand pen: `mousedown` starts stroke, `mousemove` appends points, `mouseup` ends
- Points stored in world coords (unaffected by viewport pan/zoom)
- `dmOnly` flag: checkbox in toolbar while Draw tool active
- Color and width pickers in toolbar
- "Clear annotations" button with confirmation toast
- DM-only strokes drawn with subtle dashed border indicator in DM view

---

## DM vs Player View

`viewMode` is set once per window from `sessionStorage` or `?mode=player` URL param.

| Element             | DM View                     | Player View                 |
|---------------------|-----------------------------|-----------------------------|
| Hidden tokens       | Ghost (50% opacity)         | Not drawn                   |
| Invisible tokens    | Ghost (50% opacity)         | Not drawn                   |
| Secret doors        | Shown as distinct tile      | Shown as wall                |
| DM-only annotations | Drawn normally              | Not drawn                   |
| Toolbar             | Full editor toolbar         | Hidden (canvas only)        |
| AoE shapes          | Drawn                       | Drawn                       |
| Grid lines          | Per toggle                  | Per toggle (synced)         |

**Open Player Window** button in header: `window.open('?mode=player', 'player-view')`

---

## BroadcastChannel Sync (sync.js)

```js
const channel = new BroadcastChannel('dnd-dungeon-map');

// Call after any state mutation (DM window)
export function broadcast() {
  channel.postMessage({ type: 'STATE_UPDATE', payload: serializeState() });
}

// Set up once on init (Player window listens)
channel.onmessage = (e) => {
  if (e.data.type === 'STATE_UPDATE') {
    applyState(e.data.payload);
    render();
  }
};
```

Player window does not broadcast back (read-only). DM window broadcasts on every
meaningful state mutation (token move, tile paint, AoE add/move, annotation, etc.).

---

## Save / Load / Export (state.js + ui.js)

- **Auto-save**: on every state mutation, `localStorage.setItem('dnd-dungeon-map', JSON.stringify(state))`
- **Load from localStorage**: on page load, restores last session
- **Save to file**: downloads `dungeon-map-[date].json`
- **Load from file**: FileReader parses JSON, restores state, broadcasts
- **Export PNG**: `canvas.toDataURL('image/png')` → download link

---

## Background Image

- File input accepts PNG/JPG
- FileReader → base64 → stored in `state.map.bgImageData`
- HTMLImageElement created from base64 for `drawImage`
- "Fit to grid" button: image drawn stretched to `cols * cellSize` × `rows * cellSize`
- Grid and tiles render on top of image
- Image offset/scale adjustable separately from viewport if needed (v2 idea)

---

## Implementation Order (piece by piece)

1. **`state.js`** — state object, mutation helpers, serialize/deserialize, localStorage
2. **`tiles.js`** — tile type registry with colors and draw functions
3. **`renderer.js`** — canvas setup, viewport, layer rendering (start with terrain + grid)
4. **`dungeon-map.css`** — layout, toolbar, sidebar, dialogs
5. **`index.html`** — HTML shell, canvas element, toolbar skeleton, sidebar skeleton
6. **`ui.js`** — toolbar wiring, tool switching, keyboard shortcuts
7. **`tokens.js`** — token rendering, drag & drop, add dialog
8. **`aoe.js`** — AoE shape rendering, draw/drag/rotate interaction
9. **`annotations.js`** — freehand pen tool
10. **`sync.js`** — BroadcastChannel broadcast + receive
11. **Polish** — background image upload, save/load, export PNG, ruler tool
12. **`index.html` (root)** — add dungeon map card to toolkit hub

---

## D&D 5e Reference (for AoE sizing)

- 1 cell = 5 feet
- Fireball radius: 4 cells (20 ft)
- Cone of Cold: 12 cells (60 ft) length
- Lightning Bolt: 20 cells × 1 cell (100 ft line)
- Spirit Guardians: 3 cells radius (15 ft)
