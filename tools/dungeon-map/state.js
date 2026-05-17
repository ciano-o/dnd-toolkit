// state.js — Central state for the Dungeon Map tool.
// All mutations go through exported helpers; registered listeners are notified after each change.

const _listeners = [];
export function onChange(fn) { _listeners.push(fn); }
function _notify() { _listeners.forEach(fn => fn()); }

// ─── Defaults ─────────────────────────────────────────────────────────────────

function makeDefaultTiles(cols, rows) {
  return Array.from({ length: rows }, () => Array(cols).fill('floor'));
}

export const state = {
  map: {
    cols: 30,
    rows: 20,
    cellSize: 60,
    bgImageData: null,  // base64 (serialized)
    bgImage: null,      // HTMLImageElement (transient)
    tiles: [],          // [row][col] = tileType string or '#rrggbb'
  },
  tokens: [],
  aoeShapes: [],
  annotations: [],
  viewport: { panX: 0, panY: 0, zoom: 1.0 },
  settings: {
    showGrid: true,
    gridColor: 'rgba(0,0,0,0.22)',
    scale: 5,
  },
  // Chambers (named map scenes)
  chambers: [],        // [{ id, name, snapshot, overview: {x,y} }]
  activeChamber: null, // id of active chamber, or null (single-map mode)
  // Connections between chambers (shown in overview mode)
  connections: [],     // [{ id, from, to, label, type }]
  // Combat tracker state (embedded)
  combat: {
    combatants: [],    // same structure as C in combat-tracker
    tIdx: -1,
    round: 1,
    idN: 0,
    selId: null,
  },
};

state.map.tiles = makeDefaultTiles(state.map.cols, state.map.rows);

// ─── Map ──────────────────────────────────────────────────────────────────────

export function setTile(col, row, type) {
  if (row < 0 || row >= state.map.rows || col < 0 || col >= state.map.cols) return;
  state.map.tiles[row][col] = type;
  saveToStorage();
  _notify();
}

export function resizeMap(cols, rows) {
  const prev = state.map.tiles;
  state.map.tiles = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) =>
      (r < state.map.rows && c < state.map.cols) ? prev[r][c] : 'floor'
    )
  );
  state.map.cols = cols;
  state.map.rows = rows;
  saveToStorage();
  _notify();
}

export function setCellSize(size) {
  state.map.cellSize = Math.max(20, Math.min(120, size));
  saveToStorage();
  _notify();
}

export function setBgImage(imageData) {
  state.map.bgImageData = imageData;
  if (imageData) {
    const img = new Image();
    img.onload = () => {
      state.map.bgImage = img;
      saveToStorage();
      _notify();
    };
    img.src = imageData;
  } else {
    state.map.bgImage = null;
    saveToStorage();
    _notify();
  }
}

export function setSettings(changes) {
  Object.assign(state.settings, changes);
  saveToStorage();
  _notify();
}

// ─── Tokens ───────────────────────────────────────────────────────────────────

export function addToken(partial) {
  const t = {
    tokenType: 'monster', col: 0, row: 0,
    size: 1, color: '#8b1a1a', imageData: null,
    hidden: false, invisible: false, conditions: [],
    height: 0,          // height in feet (0 = ground level)
    combatantId: null,  // linked combat combatant UUID
    ...partial, id: crypto.randomUUID(),
  };
  state.tokens.push(t);
  saveToStorage(); _notify();
  return t;
}

export function updateToken(id, changes) {
  const t = state.tokens.find(t => t.id === id);
  if (!t) return;
  Object.assign(t, changes);
  saveToStorage(); _notify();
}

export function moveToken(id, col, row) {
  const t = state.tokens.find(t => t.id === id);
  if (!t) return;
  t.col = col; t.row = row;
  saveToStorage(); _notify();
}

export function removeToken(id) {
  const i = state.tokens.findIndex(t => t.id === id);
  if (i !== -1) { state.tokens.splice(i, 1); saveToStorage(); _notify(); }
}

// ─── AoE Shapes ───────────────────────────────────────────────────────────────

export function addAoeShape(partial) {
  const s = {
    shapeType: 'circle', col: 0, row: 0,
    size: 3, angle: 0, color: '#ff6600', label: '',
    ...partial, id: crypto.randomUUID(),
  };
  state.aoeShapes.push(s);
  saveToStorage(); _notify();
  return s;
}

export function updateAoeShape(id, changes) {
  const s = state.aoeShapes.find(s => s.id === id);
  if (!s) return;
  Object.assign(s, changes);
  saveToStorage(); _notify();
}

export function removeAoeShape(id) {
  const i = state.aoeShapes.findIndex(s => s.id === id);
  if (i !== -1) { state.aoeShapes.splice(i, 1); saveToStorage(); _notify(); }
}

export function clearAoeShapes() {
  state.aoeShapes = [];
  saveToStorage(); _notify();
}

// ─── Annotations ──────────────────────────────────────────────────────────────

export function beginAnnotation(color, width, dmOnly) {
  const a = { id: crypto.randomUUID(), color, width, dmOnly, points: [] };
  state.annotations.push(a);
  return a.id;
}

export function pushAnnotationPoint(id, x, y) {
  const a = state.annotations.find(a => a.id === id);
  if (a) { a.points.push({ x, y }); _notify(); }
}

export function finalizeAnnotation(id) {
  const a = state.annotations.find(a => a.id === id);
  if (a && a.points.length < 2) {
    state.annotations.splice(state.annotations.indexOf(a), 1);
  }
  saveToStorage(); _notify();
}

export function clearAnnotations() {
  state.annotations = [];
  saveToStorage(); _notify();
}

// ─── Viewport ─────────────────────────────────────────────────────────────────

export function setViewport(changes) {
  Object.assign(state.viewport, changes);
  _notify();
}

// ─── Chambers ─────────────────────────────────────────────────────────────────

function _captureSnapshot() {
  return {
    map: {
      cols:        state.map.cols,
      rows:        state.map.rows,
      cellSize:    state.map.cellSize,
      bgImageData: state.map.bgImageData,
      tiles:       state.map.tiles.map(row => [...row]),
    },
    tokens:      state.tokens.map(({ _img, ...t }) => t),
    aoeShapes:   state.aoeShapes.map(s => ({ ...s })),
    annotations: state.annotations.map(a => ({ ...a })),
  };
}

function _restoreSnapshot(snapshot) {
  if (!snapshot) {
    state.map.tiles      = makeDefaultTiles(state.map.cols, state.map.rows);
    state.map.bgImageData = null;
    state.map.bgImage    = null;
    state.tokens         = [];
    state.aoeShapes      = [];
    state.annotations    = [];
    return;
  }
  if (snapshot.map) {
    state.map.cols     = snapshot.map.cols     ?? state.map.cols;
    state.map.rows     = snapshot.map.rows     ?? state.map.rows;
    state.map.cellSize = snapshot.map.cellSize ?? state.map.cellSize;
    state.map.tiles    = snapshot.map.tiles    ?? makeDefaultTiles(state.map.cols, state.map.rows);
    if (snapshot.map.bgImageData) setBgImage(snapshot.map.bgImageData);
    else { state.map.bgImageData = null; state.map.bgImage = null; }
  }
  state.tokens      = snapshot.tokens      ?? [];
  state.aoeShapes   = snapshot.aoeShapes   ?? [];
  state.annotations = snapshot.annotations ?? [];
}

function _saveActiveChamber() {
  if (!state.activeChamber) return;
  const c = state.chambers.find(c => c.id === state.activeChamber);
  if (c) c.snapshot = _captureSnapshot();
}

export function createChamber(name) {
  // Promote current state to Chamber 1 if we have no chambers yet
  if (state.chambers.length === 0) {
    const id0 = crypto.randomUUID();
    state.chambers.push({ id: id0, name: 'Chamber 1', snapshot: _captureSnapshot() });
    state.activeChamber = id0;
  } else {
    _saveActiveChamber();
  }
  const id = crypto.randomUUID();
  const label = name || `Chamber ${state.chambers.length + 1}`;
  state.chambers.push({ id, name: label, snapshot: null });
  state.activeChamber = id;
  _restoreSnapshot(null);
  saveToStorage(); _notify();
  return state.chambers.find(c => c.id === id);
}

export function switchChamber(id) {
  if (id === state.activeChamber) return;
  _saveActiveChamber();
  const chamber = state.chambers.find(c => c.id === id);
  if (!chamber) return;
  state.activeChamber = id;
  _restoreSnapshot(chamber.snapshot);
  saveToStorage(); _notify();
}

export function renameChamber(id, name) {
  const c = state.chambers.find(c => c.id === id);
  if (c && name.trim()) { c.name = name.trim(); saveToStorage(); _notify(); }
}

export function deleteChamber(id) {
  if (state.chambers.length <= 1) return;
  const idx = state.chambers.findIndex(c => c.id === id);
  if (idx === -1) return;
  const wasActive = state.activeChamber === id;
  state.chambers.splice(idx, 1);
  if (wasActive) {
    const next = state.chambers[Math.min(idx, state.chambers.length - 1)];
    state.activeChamber = next.id;
    _restoreSnapshot(next.snapshot);
  }
  saveToStorage(); _notify();
}

// ─── Connections (overview graph edges) ──────────────────────────────────────

export function addConnection(from, to, label = '', type = 'door') {
  const c = { id: crypto.randomUUID(), from, to, label, type };
  state.connections.push(c);
  saveToStorage(); _notify();
  return c;
}

export function updateConnection(id, changes) {
  const c = state.connections.find(c => c.id === id);
  if (!c) return;
  Object.assign(c, changes);
  saveToStorage(); _notify();
}

export function removeConnection(id) {
  const i = state.connections.findIndex(c => c.id === id);
  if (i !== -1) { state.connections.splice(i, 1); saveToStorage(); _notify(); }
}

export function updateChamberOverviewPos(id, x, y) {
  const c = state.chambers.find(c => c.id === id);
  if (!c) return;
  if (!c.overview) c.overview = {};
  c.overview.x = x; c.overview.y = y;
  saveToStorage(); // no _notify() — dragging, avoid re-render storm (caller handles)
}

// ─── Persistence ──────────────────────────────────────────────────────────────

const STORAGE_KEY = 'dnd-dungeon-map-v1';

export function serialize() {
  return {
    map: {
      cols: state.map.cols, rows: state.map.rows, cellSize: state.map.cellSize,
      bgImageData: state.map.bgImageData, tiles: state.map.tiles,
    },
    tokens:      state.tokens.map(({ _img, ...t }) => t),
    aoeShapes:   state.aoeShapes.map(s => ({ ...s })),
    annotations: state.annotations.map(a => ({ ...a })),
    settings:    { ...state.settings },
    chambers:      state.chambers.map(c => ({ ...c })),
    activeChamber: state.activeChamber,
    connections:   state.connections.map(c => ({ ...c })),
    combat: {
      combatants: state.combat.combatants.map(c => ({
        ...c,
        conditions: [...(c.conditions instanceof Set ? c.conditions : new Set(c.conditions))],
        saves:      [...(c.saves      instanceof Set ? c.saves      : new Set(c.saves))],
      })),
      tIdx:  state.combat.tIdx,
      round: state.combat.round,
      idN:   state.combat.idN,
      selId: state.combat.selId,
    },
  };
}

export function applyState(data, { silent = false } = {}) {
  if (!data) return;
  if (data.map) {
    state.map.cols     = data.map.cols     ?? state.map.cols;
    state.map.rows     = data.map.rows     ?? state.map.rows;
    state.map.cellSize = data.map.cellSize ?? state.map.cellSize;
    state.map.tiles    = data.map.tiles    ?? makeDefaultTiles(state.map.cols, state.map.rows);
    if (data.map.bgImageData) setBgImage(data.map.bgImageData);
    else { state.map.bgImageData = null; state.map.bgImage = null; }
  }
  if (data.tokens)        state.tokens        = data.tokens;
  if (data.aoeShapes)     state.aoeShapes     = data.aoeShapes;
  if (data.annotations)   state.annotations   = data.annotations;
  if (data.settings)      Object.assign(state.settings, data.settings);
  if (data.connections)   state.connections   = data.connections;
  if (data.combat) {
    state.combat.tIdx  = data.combat.tIdx  ?? -1;
    state.combat.round = data.combat.round ?? 1;
    state.combat.idN   = data.combat.idN   ?? 0;
    state.combat.selId = data.combat.selId ?? null;
    state.combat.combatants = (data.combat.combatants ?? []).map(c => ({
      ...c,
      conditions: new Set(Array.isArray(c.conditions) ? c.conditions : []),
      saves:      new Set(Array.isArray(c.saves)      ? c.saves      : []),
    }));
  }
  if (data.chambers)      state.chambers      = data.chambers;
  if (data.activeChamber !== undefined) state.activeChamber = data.activeChamber;
  if (!silent) _notify();
}

export function saveToStorage() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(serialize())); }
  catch (e) { console.warn('localStorage save failed:', e); }
}

export function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) { applyState(JSON.parse(raw), { silent: true }); return true; }
  } catch (e) { console.warn('localStorage load failed:', e); }
  return false;
}

export function exportToFile() {
  const blob = new Blob([JSON.stringify(serialize(), null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = Object.assign(document.createElement('a'), {
    href: url,
    download: `dungeon-map-${new Date().toISOString().slice(0, 10)}.json`,
  });
  a.click();
  URL.revokeObjectURL(url);
}

export function importFromFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      try { applyState(JSON.parse(e.target.result)); saveToStorage(); resolve(); }
      catch (err) { reject(err); }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}
