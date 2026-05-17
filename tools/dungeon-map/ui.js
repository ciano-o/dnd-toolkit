// ui.js — Main entry point. Wires everything together.

import { state, setTile, moveToken, setBgImage, setSettings, resizeMap, setCellSize,
         clearAoeShapes, exportToFile, importFromFile,
         loadFromStorage, onChange, switchChamber,
         createChamber, renameChamber, deleteChamber } from './state.js';
import { TILE_PALETTE_ORDER, TILES, toggleDoor } from './tiles.js';
import { init as initRenderer, render, screenToCell, screenToWorld,
         cellCenter, overlay, setViewMode } from './renderer.js';
import { initTokenDialog, openAddTokenDialog, openEditTokenDialog,
         preloadTokenImages, tokenAtWorld, renderTokenList } from './tokens.js';
import { aoePointerDown, aoePointerMove, aoePointerUp,
         aoeAtWorld, initAoePanel, aoeMoveStart, aoeMoveUpdate, aoeMoveEnd } from './aoe.js';
import { penDown, penMove, penUp, initAnnotationsPanel } from './annotations.js';
import { initSync, broadcast, broadcastRuler } from './sync.js';
import { removeCombatant, updateCombatant, damageCombatant, healCombatant,
         setTempHP, toggleCondition, nextTurn, prevTurn, sortInitiative, resetCombat,
         addCombatantFromJSON, quickAddCombatant, autoLinkToken } from './combat.js';
import { drawOverview, ovPointerDown, ovPointerMove, ovPointerUp, ovDblClick,
         ovRightClick, ovWheel, ovPan, resetConnectState } from './overview.js';
import { showPrompt, showForm } from './dialog.js';

// ─── View mode ────────────────────────────────────────────────────────────────

const VIEW_MODE = new URLSearchParams(location.search).get('mode') === 'player' ? 'player' : 'dm';

// ─── View state ───────────────────────────────────────────────────────────────

let activeView = 'map'; // 'map' | 'overview'

function _setView(v) {
  activeView = v;
  const btn = document.getElementById('btn-overview');
  if (btn) btn.classList.toggle('active', v === 'overview');
  document.getElementById('toolbar')?.classList.toggle('ov-hidden', v === 'overview');
  document.getElementById('tile-palette')?.classList.remove('visible');
  document.getElementById('aoe-panel')?.classList.remove('visible');
  document.getElementById('draw-panel')?.classList.remove('visible');
  document.getElementById('tok-hover')?.classList.remove('visible');
  resetConnectState();
  if (v === 'overview') {
    _renderOverview();
  } else {
    render();
  }
}

function _renderOverview() {
  const canvas = document.getElementById('map-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  drawOverview(ctx, canvas);
}

// ─── Tool state ───────────────────────────────────────────────────────────────

let currentTool   = 'move';
let isPainting    = false;
let paintTileKey  = 'floor';
let customPaintColor = '#888888';
let isPanning     = false;
let panStartX = 0, panStartY = 0, panStartPX = 0, panStartPY = 0;
let dragToken     = null;
let dragOffCol = 0, dragOffRow = 0;
let rulerStart    = null;
let isMovingAoe   = false;

// ─── Init ─────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  if (VIEW_MODE === 'player') {
    document.body.classList.add('player-mode');
    document.getElementById('player-badge').style.display = 'block';
  }

  const canvas = document.getElementById('map-canvas');
  initRenderer(canvas, VIEW_MODE);
  setViewMode(VIEW_MODE);

  loadFromStorage();
  preloadTokenImages();
  initSync(VIEW_MODE);

  // Single onChange handler: re-render + refresh UI
  onChange(() => {
    broadcast();
    if (activeView === 'overview') _renderOverview(); else render();
    renderTokenList(_onTokenSelect);
    _syncSettingsPanel();
    if (VIEW_MODE === 'dm') { _renderChamberList(); renderCombatPanel(); }
  });

  if (VIEW_MODE === 'dm') {
    _buildTilePalette();
    initAoePanel();
    initAnnotationsPanel(toast);
    initTokenDialog(() => { renderTokenList(_onTokenSelect); render(); });
    _setupToolbar();
    _setupSidebar();
    _setupHeader();
    _setupContextMenu();
    _setupKeyboard();
    _renderChamberList();
    initCombat();
    renderCombatPanel();
  }

  _setupCanvas(canvas);
  render();
  renderTokenList(_onTokenSelect);
  _syncSettingsPanel();
  if (VIEW_MODE === 'dm') _renderChamberList();
});

// ─── Tile palette ─────────────────────────────────────────────────────────────

function _buildTilePalette() {
  const palette = document.getElementById('tile-palette');
  palette.innerHTML = '';

  for (const key of TILE_PALETTE_ORDER) {
    const tile = TILES[key];
    const opt  = document.createElement('div');
    opt.className    = 'tile-opt' + (key === paintTileKey ? ' sel' : '');
    opt.dataset.tile = key;

    const swatch = document.createElement('div');
    swatch.className = 'tile-swatch';
    swatch.style.background = tile.fill ?? 'transparent';
    if (!tile.fill) swatch.style.border = '1px dashed #555';

    opt.append(swatch, tile.label);
    opt.addEventListener('click', () => {
      paintTileKey = key;
      palette.querySelectorAll('.tile-opt').forEach(o => o.classList.remove('sel'));
      opt.classList.add('sel');
    });
    palette.appendChild(opt);
  }

  // Custom color entry
  const customOpt = document.createElement('div');
  customOpt.className    = 'tile-opt';
  customOpt.dataset.tile = '__custom__';

  const customSwatch = document.createElement('input');
  customSwatch.type  = 'color';
  customSwatch.value = customPaintColor;
  customSwatch.style.cssText = 'width:18px;height:18px;padding:0;border:none;cursor:pointer;border-radius:3px;flex-shrink:0';
  customSwatch.addEventListener('input', e => {
    customPaintColor = e.target.value;
    if (paintTileKey === '__custom__') { /* already selected */ }
  });
  customSwatch.addEventListener('click', e => e.stopPropagation());

  customOpt.append(customSwatch, 'Custom Color');
  customOpt.addEventListener('click', () => {
    paintTileKey = '__custom__';
    palette.querySelectorAll('.tile-opt').forEach(o => o.classList.remove('sel'));
    customOpt.classList.add('sel');
  });
  palette.appendChild(customOpt);
}

function _activePaintKey() {
  return paintTileKey === '__custom__' ? customPaintColor : paintTileKey;
}

// ─── Toolbar ──────────────────────────────────────────────────────────────────

function _setupToolbar() {
  document.querySelectorAll('.tool-btn[data-tool]').forEach(btn => {
    btn.addEventListener('click', () => setTool(btn.dataset.tool));
  });
  document.getElementById('btn-clear-aoe')?.addEventListener('click', () => {
    clearAoeShapes(); toast('AoE shapes cleared');
  });
}

export function setTool(tool) {
  currentTool = tool;
  overlay.aoePreview = null;
  rulerStart = null; overlay.ruler = null;
  broadcastRuler(null);

  document.querySelectorAll('.tool-btn[data-tool]').forEach(b =>
    b.classList.toggle('active', b.dataset.tool === tool)
  );
  document.getElementById('tile-palette').classList.toggle('visible', tool === 'paint' || tool === 'erase');
  document.getElementById('aoe-panel').classList.toggle('visible', tool === 'aoe');
  document.getElementById('draw-panel').classList.toggle('visible', tool === 'draw');
  document.getElementById('canvas-wrap').dataset.tool = tool;
  render();
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function _setupSidebar() {
  // Tab switching
  document.querySelectorAll('.sb-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.sb-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.sb-panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(`tab-${tab.dataset.tab}`)?.classList.add('active');
    });
  });

  // Add token button
  document.getElementById('btn-add-token')?.addEventListener('click', () => {
    openAddTokenDialog(0, 0, t => {
      overlay.selectedId = t.id;
      renderTokenList(_onTokenSelect);
      render();
    });
  });

  // Map settings
  document.getElementById('map-cols')?.addEventListener('change', e => {
    resizeMap(parseInt(e.target.value) || 30, state.map.rows);
  });
  document.getElementById('map-rows')?.addEventListener('change', e => {
    resizeMap(state.map.cols, parseInt(e.target.value) || 20);
  });
  document.getElementById('map-cell-size')?.addEventListener('input', e => {
    setCellSize(parseInt(e.target.value));
  });
  document.getElementById('map-show-grid')?.addEventListener('change', e => {
    setSettings({ showGrid: e.target.checked });
  });
  document.getElementById('inp-bg')?.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => { setBgImage(ev.target.result); toast('Background image set'); };
    reader.readAsDataURL(file);
    e.target.value = '';
  });
  document.getElementById('btn-clear-bg')?.addEventListener('click', () => {
    setBgImage(null); toast('Background cleared');
  });

  // Chambers
  document.getElementById('btn-new-chamber')?.addEventListener('click', async () => {
    const name = await showPrompt('Chamber name:', `Chamber ${state.chambers.length + 1}`);
    if (name !== null) { createChamber(name); toast(`Created: ${name || 'New Chamber'}`); }
  });
}

function _syncSettingsPanel() {
  const el = id => document.getElementById(id);
  if (el('map-cols'))      el('map-cols').value      = state.map.cols;
  if (el('map-rows'))      el('map-rows').value      = state.map.rows;
  if (el('map-cell-size')) el('map-cell-size').value = state.map.cellSize;
  if (el('map-show-grid')) el('map-show-grid').checked = state.settings.showGrid;
}

function _onTokenSelect(token) {
  if (!token) return;
  const cs  = state.map.cellSize;
  const { panX, panY, zoom } = state.viewport;
  const sx  = (token.col + token.size / 2) * cs * zoom + panX;
  const sy  = (token.row + token.size / 2) * cs * zoom + panY;
  const cw  = document.getElementById('map-canvas')?.offsetWidth  ?? 800;
  const ch  = document.getElementById('map-canvas')?.offsetHeight ?? 600;
  if (sx > 60 && sx < cw - 60 && sy > 20 && sy < ch - 20) return;
  import('./state.js').then(m => {
    m.setViewport({
      panX: cw / 2 - (token.col + token.size / 2) * cs * zoom,
      panY: ch / 2 - (token.row + token.size / 2) * cs * zoom,
    });
    render();
  });
}

// ─── Chambers list ────────────────────────────────────────────────────────────

function _renderChamberList() {
  const list = document.getElementById('chamber-list');
  if (!list) return;
  list.innerHTML = '';

  for (const chamber of state.chambers) {
    const row = document.createElement('div');
    row.className = 'chamber-row' + (chamber.id === state.activeChamber ? ' active' : '');

    const name = document.createElement('span');
    name.className   = 'chamber-name';
    name.textContent = chamber.name;

    const actions = document.createElement('div');
    actions.className = 'chamber-actions';

    // Rename
    const btnRename = document.createElement('button');
    btnRename.className = 'flag-btn';
    btnRename.title = 'Rename';
    btnRename.textContent = '✏';
    btnRename.style.opacity = '0.5';
    btnRename.addEventListener('click', async e => {
      e.stopPropagation();
      const newName = await showPrompt('Rename chamber:', chamber.name);
      if (newName !== null) renameChamber(chamber.id, newName);
    });

    // Delete (only shown if more than one chamber)
    const btnDel = document.createElement('button');
    btnDel.className = 'flag-btn';
    btnDel.title = 'Delete chamber';
    btnDel.textContent = '🗑';
    btnDel.style.opacity = '0.35';
    btnDel.addEventListener('click', e => {
      e.stopPropagation();
      if (state.chambers.length <= 1) { toast('Cannot delete the last chamber', true); return; }
      if (confirm(`Delete "${chamber.name}"? This cannot be undone.`)) {
        deleteChamber(chamber.id);
      }
    });

    actions.append(btnRename, btnDel);
    row.append(name, actions);

    row.addEventListener('click', () => switchChamber(chamber.id));
    list.appendChild(row);
  }

  // Show placeholder if no chambers yet
  if (state.chambers.length === 0) {
    const ph = document.createElement('div');
    ph.style.cssText = 'font-size:0.6rem;color:var(--ink-faded);padding:8px 0;font-style:italic';
    ph.textContent = 'No chambers yet. Create one to start organizing rooms.';
    list.appendChild(ph);
  }
}

// ─── Header ───────────────────────────────────────────────────────────────────

function _setupHeader() {
  document.getElementById('btn-overview')?.addEventListener('click', () => {
    _setView(activeView === 'overview' ? 'map' : 'overview');
  });
  document.getElementById('btn-open-player')?.addEventListener('click', () => {
    window.open('?mode=player', 'dungeon-map-player');
    toast('Player window opened');
  });
  document.getElementById('btn-save')?.addEventListener('click', () => {
    exportToFile(); toast('Map saved to file');
  });
  document.getElementById('inp-load')?.addEventListener('change', async e => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      await importFromFile(file);
      preloadTokenImages();
      render();
      renderTokenList(_onTokenSelect);
      _renderChamberList();
      toast('Map loaded');
    } catch { toast('Failed to load map file', true); }
    e.target.value = '';
  });
  document.getElementById('btn-export-png')?.addEventListener('click', () => {
    const canvas = document.getElementById('map-canvas');
    const a = Object.assign(document.createElement('a'), {
      href: canvas.toDataURL('image/png'),
      download: `dungeon-map-${new Date().toISOString().slice(0,10)}.png`,
    });
    a.click();
    toast('PNG exported');
  });
}

// ─── Context menu ─────────────────────────────────────────────────────────────

let _ctxTokenId = null;

function _setupContextMenu() {
  const menu = document.getElementById('ctx-menu');

  const _handle = (action) => {
    if (!_ctxTokenId) return;
    const t = state.tokens.find(t => t.id === _ctxTokenId);
    if (!t) return;
    if (action === 'hide')      { import('./state.js').then(m => m.updateToken(_ctxTokenId, { hidden:    !t.hidden    })); }
    if (action === 'invisible') { import('./state.js').then(m => m.updateToken(_ctxTokenId, { invisible: !t.invisible })); }
    if (action === 'edit')      { openEditTokenDialog(t, () => { renderTokenList(_onTokenSelect); render(); }); }
    if (action === 'delete') {
      if (overlay.selectedId === _ctxTokenId) overlay.selectedId = null;
      import('./state.js').then(m => { m.removeToken(_ctxTokenId); renderTokenList(_onTokenSelect); render(); });
    }
    _closeCtx();
  };

  document.getElementById('ctx-hide')?.addEventListener('click',      () => _handle('hide'));
  document.getElementById('ctx-invisible')?.addEventListener('click', () => _handle('invisible'));
  document.getElementById('ctx-edit')?.addEventListener('click',      () => _handle('edit'));
  document.getElementById('ctx-delete')?.addEventListener('click',    () => _handle('delete'));
  document.addEventListener('click', e => { if (!menu?.contains(e.target)) _closeCtx(); });
}

function _openCtx(x, y, tokenId) {
  _ctxTokenId = tokenId;
  const menu = document.getElementById('ctx-menu');
  menu.style.left = `${x}px`; menu.style.top = `${y}px`;
  menu.classList.add('open');
}
function _closeCtx() {
  _ctxTokenId = null;
  document.getElementById('ctx-menu')?.classList.remove('open');
}

// ─── Keyboard ─────────────────────────────────────────────────────────────────

function _setupKeyboard() {
  document.addEventListener('keydown', e => {
    if (['INPUT','SELECT','TEXTAREA'].includes(e.target.tagName)) return;
    const map = { v:'move', t:'paint', e:'erase', p:'token', a:'aoe', d:'draw', r:'ruler' };
    if (map[e.key.toLowerCase()]) { setTool(map[e.key.toLowerCase()]); return; }
    if (e.key === 'Escape') {
      overlay.selectedId = null; overlay.ruler = null; rulerStart = null;
      broadcastRuler(null); render();
    }
    if ((e.key === 'Delete' || e.key === 'Backspace') && overlay.selectedId) {
      const id = overlay.selectedId;
      overlay.selectedId = null;
      import('./state.js').then(m => {
        m.removeToken(id); m.removeAoeShape(id);
        renderTokenList(_onTokenSelect); render();
      });
    }
  });
}

// ─── Token hover popup ────────────────────────────────────────────────────────

function _updateHoverPopup(token, sx, sy) {
  const el = document.getElementById('tok-hover');
  if (!el) return;
  if (!token) { el.classList.remove('visible'); return; }

  const isDm = VIEW_MODE === 'dm';
  let html = `<div class="th-name">${token.name || '?'}</div>`;
  html += `<span class="th-badge ${token.tokenType}">${token.tokenType}</span>`;

  if (token.height !== 0) {
    const arrow = token.height > 0 ? '▲' : '▼';
    html += `<div class="th-row"><span>Height</span><span>${arrow} ${Math.abs(token.height)} ft</span></div>`;
  }
  if (isDm) {
    if (token.hidden)    html += `<div class="th-row"><span>🙈 Hidden from players</span></div>`;
    if (token.invisible) html += `<div class="th-row"><span>👁 Invisible</span></div>`;
  }
  if (token.conditions?.length) {
    html += `<div class="th-conditions">${token.conditions.map(c => `<span class="th-cond">${c}</span>`).join('')}</div>`;
  }

  // Linked combatant — show HP bar
  if (token.combatantId) {
    const cb = state.combat.combatants.find(c => c.id === token.combatantId);
    if (cb) {
      const pct = cb.maxHp > 0 ? Math.max(0, cb.hp / cb.maxHp) : 0;
      const hpColor = pct > 0.5 ? '#4caf50' : pct > 0.25 ? '#ff9800' : '#f44336';
      const hpLabel = cb.tempHp > 0 ? `${cb.hp}+${cb.tempHp}/${cb.maxHp}` : `${cb.hp}/${cb.maxHp}`;
      html += `<div class="th-row" style="flex-direction:column;gap:3px;border-top:1px solid rgba(255,255,255,0.06);padding-top:4px;margin-top:2px">`;
      html += `<div style="display:flex;justify-content:space-between"><span>HP</span><span>${hpLabel}</span></div>`;
      html += `<div style="height:4px;background:rgba(255,255,255,0.08);border-radius:2px;overflow:hidden">`;
      html += `<div style="width:${pct*100}%;height:100%;background:${hpColor};border-radius:2px"></div></div>`;
      if (cb.conditions.size) {
        html += `<div style="display:flex;flex-wrap:wrap;gap:2px;margin-top:2px">`;
        for (const cond of cb.conditions) html += `<span class="th-cond">${cond}</span>`;
        html += `</div>`;
      }
      html += `</div>`;
    }
  }

  el.innerHTML = html;
  el.classList.add('visible');

  // Position relative to canvas-wrap, clamped to stay in bounds
  const wrap = document.getElementById('canvas-wrap');
  const elW  = el.offsetWidth  || 140;
  const elH  = el.offsetHeight || 80;
  let px = sx + 14;
  let py = sy - 10;
  if (px + elW > wrap.offsetWidth)  px = sx - elW - 6;
  if (py + elH > wrap.offsetHeight) py = wrap.offsetHeight - elH - 6;
  if (py < 0) py = 6;
  el.style.left = `${px}px`;
  el.style.top  = `${py}px`;
}

// ─── Canvas events ────────────────────────────────────────────────────────────

function _setupCanvas(canvas) {
  canvas.addEventListener('contextmenu', e => { e.preventDefault(); _handleRightClick(e); });
  canvas.addEventListener('pointerdown', e => { canvas.setPointerCapture(e.pointerId); _handleDown(e); });
  canvas.addEventListener('pointermove', _handleMove);
  canvas.addEventListener('pointerup',   _handleUp);
  canvas.addEventListener('wheel',       _handleWheel, { passive: false });
  canvas.addEventListener('dblclick', e => {
    if (activeView === 'overview') {
      const { sx, sy } = _xy(e);
      ovDblClick(sx, sy, id => { switchChamber(id); _setView('map'); });
    }
  });
  canvas.addEventListener('pointerleave', () => {
    if (activeView === 'map') {
      overlay.hoverTokenId = null;
      overlay.hoverCell = null;
      document.getElementById('tok-hover')?.classList.remove('visible');
      render();
    }
  });
}

function _xy(e) {
  const r = e.currentTarget.getBoundingClientRect();
  return { sx: e.clientX - r.left, sy: e.clientY - r.top };
}

function _handleRightClick(e) {
  if (VIEW_MODE !== 'dm') return;
  const { sx, sy } = _xy(e);
  if (activeView === 'overview') {
    if (ovRightClick(sx, sy)) _renderOverview();
    return;
  }
  const w = screenToWorld(sx, sy);
  const token = tokenAtWorld(w.x, w.y);
  if (token) {
    overlay.selectedId = token.id;
    renderTokenList(_onTokenSelect); render();
    _openCtx(e.clientX, e.clientY, token.id);
  }
}

function _handleDown(e) {
  if (activeView === 'overview') {
    if (e.button === 1 || (e.button === 0 && e.altKey)) { _startPan(e); return; }
    if (e.button !== 0) return;
    const { sx, sy } = _xy(e);
    ovPointerDown(sx, sy, e.shiftKey,
      id => { switchChamber(id); _setView('map'); },
      () => {}
    );
    return;
  }
  if (e.button === 1 || (e.button === 0 && e.altKey)) { _startPan(e); return; }
  if (e.button !== 0) return;
  if (isPanning) { _startPan(e); return; }
  if (VIEW_MODE !== 'dm') return;

  _closeCtx();
  const { sx, sy } = _xy(e);
  const w    = screenToWorld(sx, sy);
  const cell = screenToCell(sx, sy);

  switch (currentTool) {
    case 'move': {
      const token = tokenAtWorld(w.x, w.y);
      if (token) {
        dragToken = token; dragOffCol = cell.col - token.col; dragOffRow = cell.row - token.row;
        overlay.selectedId = token.id; renderTokenList(_onTokenSelect); break;
      }
      const aoe = aoeAtWorld(w.x, w.y);
      if (aoe) { overlay.selectedId = aoe.id; isMovingAoe = true; aoeMoveStart(aoe, sx, sy); break; }
      // Toggle door on click
      const tileKey = state.map.tiles[cell.row]?.[cell.col];
      if (tileKey === 'door-closed' || tileKey === 'door-open') {
        setTile(cell.col, cell.row, toggleDoor(tileKey));
      } else {
        overlay.selectedId = null; renderTokenList(_onTokenSelect);
      }
      render(); break;
    }
    case 'paint':
      isPainting = true; setTile(cell.col, cell.row, _activePaintKey()); break;
    case 'erase':
      isPainting = true; setTile(cell.col, cell.row, 'floor'); break;
    case 'token':
      openAddTokenDialog(cell.col, cell.row, t => {
        overlay.selectedId = t.id; renderTokenList(_onTokenSelect); render(); broadcast();
      }); break;
    case 'aoe':
      aoePointerDown(sx, sy); break;
    case 'draw':
      penDown(sx, sy); break;
    case 'ruler':
      if (!rulerStart) {
        const wc = cellCenter(cell.col, cell.row);
        rulerStart = wc; overlay.ruler = { x1: wc.x, y1: wc.y, x2: wc.x, y2: wc.y };
        broadcastRuler(overlay.ruler);
      } else {
        rulerStart = null; overlay.ruler = null; broadcastRuler(null);
      }
      render(); break;
  }
}

function _handleMove(e) {
  const { sx, sy } = _xy(e);

  if (activeView === 'overview') {
    if (isPanning) { _doPan(sx, sy); return; }
    const needsDraw = ovPointerMove(sx, sy);
    if (needsDraw) _renderOverview();
    return;
  }

  const w    = screenToWorld(sx, sy);
  const cell = screenToCell(sx, sy);

  overlay.hoverCell = (cell.col >= 0 && cell.col < state.map.cols &&
                       cell.row >= 0 && cell.row < state.map.rows) ? cell : null;

  // Hover popup — update for whichever token is under cursor
  const hToken = tokenAtWorld(w.x, w.y);
  const newHoverId = hToken?.id ?? null;
  if (newHoverId !== overlay.hoverTokenId) {
    overlay.hoverTokenId = newHoverId;
  }
  _updateHoverPopup(hToken, sx, sy);

  if (isPanning) { _doPan(sx, sy); return; }
  if (VIEW_MODE !== 'dm') { render(); return; }

  switch (currentTool) {
    case 'move':
      if (dragToken) {
        overlay.dragToken = { token: dragToken, col: cell.col - dragOffCol, row: cell.row - dragOffRow };
        render();
      } else if (isMovingAoe) {
        aoeMoveUpdate(sx, sy);
      } else { render(); }
      break;
    case 'paint':
      if (isPainting) setTile(cell.col, cell.row, _activePaintKey());
      else render();
      break;
    case 'erase':
      if (isPainting) setTile(cell.col, cell.row, 'floor');
      else render();
      break;
    case 'aoe': aoePointerMove(sx, sy); break;
    case 'draw': penMove(sx, sy); break;
    case 'ruler':
      if (rulerStart && overlay.ruler) {
        const wc = cellCenter(cell.col, cell.row);
        overlay.ruler.x2 = wc.x; overlay.ruler.y2 = wc.y;
        broadcastRuler(overlay.ruler);
        render();
      } else { render(); }
      break;
    default: render();
  }
}

function _handleUp(e) {
  if (e.button === 1) { _endPan(); return; }
  if (isPanning && e.button === 0) { _endPan(); return; }
  if (e.button !== 0) return;

  const { sx, sy } = _xy(e);

  if (activeView === 'overview') {
    ovPointerUp(sx, sy, id => { switchChamber(id); _setView('map'); });
    _renderOverview();
    return;
  }
  const cell = screenToCell(sx, sy);

  switch (currentTool) {
    case 'move':
      if (dragToken) {
        const nc = Math.max(0, Math.min(state.map.cols - dragToken.size, cell.col - dragOffCol));
        const nr = Math.max(0, Math.min(state.map.rows - dragToken.size, cell.row - dragOffRow));
        moveToken(dragToken.id, nc, nr);
        overlay.dragToken = null; dragToken = null;
        renderTokenList(_onTokenSelect); render();
      }
      if (isMovingAoe) { aoeMoveEnd(); isMovingAoe = false; }
      break;
    case 'paint': case 'erase':
      isPainting = false; break;
    case 'aoe':
      aoePointerUp(sx, sy); break;
    case 'draw':
      penUp(); break;
  }
}

// ─── Pan ──────────────────────────────────────────────────────────────────────

function _startPan(e) {
  isPanning = true;
  const { sx, sy } = _xy(e);
  panStartX = sx; panStartY = sy;
  panStartPX = state.viewport.panX; panStartPY = state.viewport.panY;
  document.getElementById('canvas-wrap').classList.add('panning');
}
function _doPan(sx, sy) {
  if (activeView === 'overview') {
    ovPan((sx - panStartX), (sy - panStartY));
    panStartX = sx; panStartY = sy;
    _renderOverview();
    return;
  }
  import('./state.js').then(m => {
    m.setViewport({ panX: panStartPX + (sx - panStartX), panY: panStartPY + (sy - panStartY) });
    render();
  });
}
function _endPan() {
  isPanning = false;
  document.getElementById('canvas-wrap').classList.remove('panning');
}

// ─── Zoom ─────────────────────────────────────────────────────────────────────

function _handleWheel(e) {
  e.preventDefault();
  const { sx, sy } = _xy(e);
  if (activeView === 'overview') {
    ovWheel(sx, sy, e.deltaY);
    _renderOverview();
    return;
  }
  const factor = e.deltaY < 0 ? 1.1 : 0.91;
  const { panX, panY, zoom } = state.viewport;
  const newZoom = Math.max(0.15, Math.min(4.0, zoom * factor));
  import('./state.js').then(m => {
    m.setViewport({
      zoom: newZoom,
      panX: sx - (sx - panX) * (newZoom / zoom),
      panY: sy - (sy - panY) * (newZoom / zoom),
    });
    render();
  });
}

// Space = pan
document.addEventListener('keydown', e => {
  if (e.code === 'Space' && !['INPUT','SELECT','TEXTAREA'].includes(document.activeElement.tagName)) {
    e.preventDefault(); isPanning = true;
  }
});
document.addEventListener('keyup', e => { if (e.code === 'Space') isPanning = false; });

// ─── Combat panel ─────────────────────────────────────────────────────────────

const CONDITIONS = ['Blinded','Charmed','Deafened','Exhaustion','Frightened',
                    'Grappled','Incapacitated','Invisible','Paralyzed','Petrified',
                    'Poisoned','Prone','Restrained','Stunned','Unconscious'];

function _cbSave() {
  import('./state.js').then(m => { m.saveToStorage(); broadcast(); });
}

export function initCombat() {
  document.getElementById('btn-next-turn')?.addEventListener('click', () => {
    nextTurn(); _cbSave(); renderCombatPanel(); render();
  });
  document.getElementById('btn-prev-turn')?.addEventListener('click', () => {
    prevTurn(); _cbSave(); renderCombatPanel(); render();
  });
  document.getElementById('btn-sort-init')?.addEventListener('click', () => {
    sortInitiative(); _cbSave(); renderCombatPanel();
  });
  document.getElementById('btn-reset-combat')?.addEventListener('click', () => {
    if (confirm('Reset all combat? This clears all combatants.')) {
      resetCombat(); _cbSave(); renderCombatPanel(); render(); toast('Combat reset');
    }
  });
  document.getElementById('btn-quick-add')?.addEventListener('click', async () => {
    const result = await showForm('Quick Add Combatant', [
      { name: 'name',       label: 'Name',       type: 'text',   value: '' },
      { name: 'initiative', label: 'Initiative', type: 'number', value: '10' },
      { name: 'hp',         label: 'Max HP',     type: 'number', value: '10' },
      { name: 'ac',         label: 'AC',         type: 'number', value: '10' },
    ]);
    if (!result || !result.name.trim()) return;
    const name = result.name.trim();
    const init = parseInt(result.initiative) || 0;
    const hp   = parseInt(result.hp)   || 10;
    const ac   = parseInt(result.ac)   || 10;
    quickAddCombatant(name, init, hp, ac, 'monster');
    _cbSave(); renderCombatPanel(); render(); toast(`Added: ${name}`);
  });

  // Monster JSON import
  document.getElementById('inp-monsters')?.addEventListener('change', async e => {
    for (const file of e.target.files) {
      try {
        const data = JSON.parse(await file.text());
        const list = Array.isArray(data) ? data : [data];
        list.forEach(d => { const c = addCombatantFromJSON(d, 'monster'); autoLinkToken(c); });
      } catch { toast(`Failed: ${file.name}`, true); }
    }
    e.target.value = '';
    _cbSave(); renderCombatPanel(); render();
    toast('Monsters imported');
  });

  // Player JSON import
  document.getElementById('inp-players')?.addEventListener('change', async e => {
    for (const file of e.target.files) {
      try {
        const data = JSON.parse(await file.text());
        const list = Array.isArray(data) ? data : [data];
        list.forEach(d => { const c = addCombatantFromJSON(d, 'player'); autoLinkToken(c); });
      } catch { toast(`Failed: ${file.name}`, true); }
    }
    e.target.value = '';
    _cbSave(); renderCombatPanel(); render();
    toast('Players imported');
  });
}

export function renderCombatPanel() {
  const list = document.getElementById('combatant-list');
  if (!list) return;

  // Update round display
  const rd = document.getElementById('round-display');
  if (rd) rd.textContent = state.combat.round;

  const { combatants, tIdx, selId } = state.combat;
  list.innerHTML = '';

  for (let i = 0; i < combatants.length; i++) {
    const c   = combatants[i];
    const isActive = i === tIdx;
    const isSel    = c.id === selId;
    const isDead   = c.hp <= 0;

    const row = document.createElement('div');
    row.className = `cb-row${isActive ? ' active' : ''}${isSel ? ' sel' : ''}${isDead ? ' dead' : ''}`;

    // Initiative
    const init = document.createElement('div');
    init.className = 'cb-init';
    init.textContent = c.initiative;

    // Info block
    const info = document.createElement('div');
    info.className = 'cb-info';

    const nm = document.createElement('div');
    nm.className = 'cb-name';
    nm.textContent = c.name;

    const ac = document.createElement('span');
    ac.className = 'cb-ac';
    ac.textContent = `AC ${c.ac}`;

    const barWrap = document.createElement('div');
    barWrap.className = 'cb-hp-bar-wrap';
    const bar = document.createElement('div');
    bar.className = 'cb-hp-bar';
    const pct = c.maxHp > 0 ? Math.max(0, c.hp / c.maxHp) : 0;
    bar.style.width = `${pct * 100}%`;
    bar.style.background = pct > 0.5 ? '#4caf50' : pct > 0.25 ? '#ff9800' : '#f44336';
    barWrap.appendChild(bar);

    const condsRow = document.createElement('div');
    condsRow.className = 'cb-conds';
    for (const cond of c.conditions) {
      const dot = document.createElement('span');
      dot.className = 'cb-cond-dot';
      dot.textContent = cond.slice(0, 3);
      dot.title = cond;
      condsRow.appendChild(dot);
    }

    info.append(nm, ac, barWrap);
    if (c.conditions.size) info.appendChild(condsRow);

    // HP text
    const hpText = document.createElement('div');
    hpText.className = 'cb-hp-text';
    hpText.textContent = c.tempHp > 0 ? `${c.hp}+${c.tempHp}/${c.maxHp}` : `${c.hp}/${c.maxHp}`;

    // Delete button
    const del = document.createElement('button');
    del.className = 'cb-del';
    del.textContent = '✕';
    del.title = 'Remove';
    del.addEventListener('click', ev => {
      ev.stopPropagation();
      removeCombatant(c.id);
      if (state.combat.selId === c.id) state.combat.selId = null;
      _cbSave(); renderCombatPanel(); renderCombatActions(); render();
    });

    row.append(init, info, hpText, del);
    row.addEventListener('click', () => {
      state.combat.selId = c.id;
      renderCombatPanel();
      renderCombatActions();
    });

    list.appendChild(row);
  }
}

export function renderCombatActions() {
  const panel = document.getElementById('combat-actions');
  if (!panel) return;

  const { selId, combatants } = state.combat;
  const c = combatants.find(x => x.id === selId);

  if (!c) { panel.innerHTML = ''; panel.classList.remove('open'); return; }
  panel.classList.add('open');

  panel.innerHTML = `<div class="ca-name">${c.name}</div>`;

  // HP row
  const hpRow = document.createElement('div');
  hpRow.className = 'ca-row';
  const hpInput = document.createElement('input');
  hpInput.type = 'number'; hpInput.min = '0'; hpInput.value = '5';
  hpInput.className = 'ca-input'; hpInput.placeholder = 'amt';

  const btnHeal = document.createElement('button');
  btnHeal.className = 'ca-btn heal'; btnHeal.textContent = '+ Heal';
  btnHeal.addEventListener('click', () => {
    healCombatant(c.id, parseInt(hpInput.value) || 0);
    _cbSave(); renderCombatPanel(); renderCombatActions(); render();
  });

  const btnDmg = document.createElement('button');
  btnDmg.className = 'ca-btn dmg'; btnDmg.textContent = '− Dmg';
  btnDmg.addEventListener('click', () => {
    damageCombatant(c.id, parseInt(hpInput.value) || 0);
    _cbSave(); renderCombatPanel(); renderCombatActions(); render();
  });

  const lblHp = document.createElement('span');
  lblHp.className = 'ca-label'; lblHp.textContent = 'HP';

  hpRow.append(lblHp, hpInput, btnHeal, btnDmg);
  panel.appendChild(hpRow);

  // Max HP / Temp HP
  const statRow = document.createElement('div');
  statRow.className = 'ca-row';

  const maxInp = document.createElement('input');
  maxInp.type = 'number'; maxInp.value = c.maxHp; maxInp.min = '1';
  maxInp.className = 'ca-input'; maxInp.title = 'Max HP';
  maxInp.addEventListener('change', () => {
    updateCombatant(c.id, { maxHp: parseInt(maxInp.value) || c.maxHp });
    _cbSave(); renderCombatPanel(); renderCombatActions();
  });

  const tempInp = document.createElement('input');
  tempInp.type = 'number'; tempInp.value = c.tempHp; tempInp.min = '0';
  tempInp.className = 'ca-input'; tempInp.title = 'Temp HP';
  tempInp.addEventListener('change', () => {
    setTempHP(c.id, parseInt(tempInp.value) || 0);
    _cbSave(); renderCombatPanel(); renderCombatActions();
  });

  const initInp = document.createElement('input');
  initInp.type = 'number'; initInp.value = c.initiative;
  initInp.className = 'ca-input'; initInp.title = 'Initiative';
  initInp.addEventListener('change', () => {
    updateCombatant(c.id, { initiative: parseInt(initInp.value) || 0 });
    _cbSave(); renderCombatPanel();
  });

  const lMax  = Object.assign(document.createElement('span'), { className: 'ca-label', textContent: 'Max' });
  const lTemp = Object.assign(document.createElement('span'), { className: 'ca-label', textContent: 'Tmp' });
  const lInit = Object.assign(document.createElement('span'), { className: 'ca-label', textContent: 'Init' });
  statRow.append(lMax, maxInp, lTemp, tempInp, lInit, initInp);
  panel.appendChild(statRow);

  // Conditions
  const condWrap = document.createElement('div');
  condWrap.className = 'ca-conditions';
  for (const cond of CONDITIONS) {
    const btn = document.createElement('button');
    btn.className = 'ca-cond-btn' + (c.conditions.has(cond) ? ' active' : '');
    btn.textContent = cond.slice(0, 4);
    btn.title = cond;
    btn.addEventListener('click', () => {
      toggleCondition(c.id, cond);
      _cbSave(); renderCombatPanel(); renderCombatActions(); render();
    });
    condWrap.appendChild(btn);
  }
  panel.appendChild(condWrap);
}

// ─── Toast ────────────────────────────────────────────────────────────────────

export function toast(msg, isError = false) {
  const container = document.getElementById('toasts');
  if (!container) return;
  const el = document.createElement('div');
  el.className = 'toast' + (isError ? ' err' : '');
  el.textContent = msg;
  container.appendChild(el);
  setTimeout(() => el.remove(), 2700);
}
