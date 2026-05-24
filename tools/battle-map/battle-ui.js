// battle-ui.js — Main controller for the mobile-first Battle Map page.
// Imports all logic from ../dungeon-map/ modules; only UI wiring is new here.

import { state, addToken, setTile, moveToken, updateToken, removeToken, removeAoeShape,
         setBgImage, setSettings, resizeMap, setCellSize, setViewport,
         clearAoeShapes, clearAnnotations, exportToFile, importFromFile,
         loadFromStorage, saveToStorage, onChange, switchChamber,
         createChamber, renameChamber, deleteChamber } from '../dungeon-map/state.js';

import { TILE_PALETTE_ORDER, TILES, toggleDoor } from '../dungeon-map/tiles.js';

import { init as initRenderer, render as _coreRender, screenToCell, screenToWorld,
         cellCenter, overlay, setViewMode, worldToScreen } from '../dungeon-map/renderer.js';

import { initTokenDialog, openAddTokenDialog, openEditTokenDialog,
         preloadTokenImages, tokenAtWorld, renderTokenList } from '../dungeon-map/tokens.js';

import { aoePointerDown, aoePointerMove, aoePointerUp,
         aoeAtWorld, initAoePanel, aoeMoveStart, aoeMoveUpdate, aoeMoveEnd } from '../dungeon-map/aoe.js';

import { penDown, penMove, penUp, initAnnotationsPanel } from '../dungeon-map/annotations.js';

import { initSync, broadcast, broadcastRuler } from '../dungeon-map/sync.js';

import { removeCombatant, updateCombatant, damageCombatant, healCombatant,
         setTempHP, toggleCondition, nextTurn, prevTurn, sortInitiative,
         resetCombat, addCombatantFromJSON, quickAddCombatant, autoLinkToken } from '../dungeon-map/combat.js';

import { drawOverview, ovPointerDown, ovPointerMove, ovPointerUp,
         ovDblClick, ovRightClick, ovWheel, ovPan, resetConnectState } from '../dungeon-map/overview.js';

import { showPrompt, showForm } from '../dungeon-map/dialog.js';

// ─── View mode ────────────────────────────────────────────────────────────────

const VIEW_MODE = document.querySelector('meta[name="bm-view"]')?.content === 'player' ? 'player' : 'dm';

// ─── Tool / view state ────────────────────────────────────────────────────────

let currentTool       = 'move';
let activeView        = 'map';    // 'map' | 'overview'
let isPainting        = false;
let paintTileKey      = 'floor';
let customPaintColor  = '#888888';
let isPanning         = false;
let panStartX = 0, panStartY = 0, panStartPX = 0, panStartPY = 0;
let dragToken         = null;
let dragOffCol = 0, dragOffRow = 0;
let isMovingAoe       = false;
let rulerStart        = null;

// Long press
let _lpTimer = null, _lpEvent = null;
const LP_MS = 500, LP_PX = 8;

// Pinch zoom (multi-touch)
const _ptrs = new Map();   // pointerId → { x, y }
let _pinchDist = null;

// Token action popup target
let _tapTokId = null;

// Currently open bottom sheet id
let _sheetId = null;

// Tap-to-overlay tracking (distinguishes tap from drag)
let _tapMoved = false, _tapDownX = 0, _tapDownY = 0;
const TAP_THRESHOLD = 8;

// Currently open character overlay combatant id
let _overlayId = null;

// Battle-add dialog state
let _addCol = 0, _addRow = 0, _addSourceData = null;

// ─── Constants ────────────────────────────────────────────────────────────────

const CONDITIONS = ['Blinded','Charmed','Deafened','Exhaustion','Frightened',
                    'Grappled','Incapacitated','Invisible','Paralyzed','Petrified',
                    'Poisoned','Prone','Restrained','Stunned','Unconscious'];

// ─── Render wrapper (core render + HP bar update) ─────────────────────────────

function render() {
  _coreRender();
  requestAnimationFrame(_updateHPBars);
}

// ─── Init ─────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('map-canvas');
  initRenderer(canvas, VIEW_MODE);
  setViewMode(VIEW_MODE);

  loadFromStorage();
  preloadTokenImages();
  initSync(VIEW_MODE);

  onChange(() => {
    broadcast();
    if (activeView === 'overview') _renderOverview();
    else render();
    if (VIEW_MODE === 'dm') {
      renderCombatPanel();
      _syncSettingsPanel();
      if (_overlayId) {
        const c = state.combat.combatants.find(x => x.id === _overlayId);
        if (c) { _refreshOverlayHP(c); _refreshOverlayConds(c); }
      }
    }
  });

  if (VIEW_MODE === 'dm') {
    _buildTilePalette();
    initAoePanel();
    initAnnotationsPanel(toast);
    initTokenDialog(() => { render(); broadcast(); });
    _setupToolBar();
    _setupHamburger();
    _setupTokenActionPopup();
    _setupMapSettings();
    _setupCharOverlay();
    _setupInitOverlay();
    _setupBattleAddModal();
    renderCombatPanel();
    _syncSettingsPanel();
    _setupKeyboard();
  }

  _setupCanvas(canvas);
  render();
});

// ─── View switching ───────────────────────────────────────────────────────────

function _setView(v) {
  activeView = v;
  _closeSheet(null);
  overlay.hoverTokenId = null;
  overlay.hoverCell    = null;
  document.getElementById('tok-hover')?.classList.remove('visible');
  resetConnectState();
  const fab = document.getElementById('fab-container');
  if (fab) fab.classList.toggle('ov-hidden', v === 'overview');
  if (v === 'overview') _renderOverview();
  else render();
}

function _renderOverview() {
  const canvas = document.getElementById('map-canvas');
  if (!canvas) return;
  drawOverview(canvas.getContext('2d'), canvas);
}

// ─── Tile palette ─────────────────────────────────────────────────────────────

function _buildTilePalette() {
  const grid = document.getElementById('tile-palette-grid');
  if (!grid) return;
  grid.innerHTML = '';

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
      grid.querySelectorAll('.tile-opt').forEach(o => o.classList.remove('sel'));
      opt.classList.add('sel');
    });
    grid.appendChild(opt);
  }

  // Custom color
  const customOpt    = document.createElement('div');
  customOpt.className    = 'tile-opt';
  customOpt.dataset.tile = '__custom__';

  const customSwatch = document.createElement('input');
  customSwatch.type  = 'color';
  customSwatch.value = customPaintColor;
  customSwatch.style.cssText = 'width:28px;height:28px;padding:0;border:none;cursor:pointer;border-radius:4px;flex-shrink:0';
  customSwatch.addEventListener('input', e => { customPaintColor = e.target.value; });
  customSwatch.addEventListener('click', e => e.stopPropagation());

  customOpt.append(customSwatch, 'Custom');
  customOpt.addEventListener('click', () => {
    paintTileKey = '__custom__';
    grid.querySelectorAll('.tile-opt').forEach(o => o.classList.remove('sel'));
    customOpt.classList.add('sel');
  });
  grid.appendChild(customOpt);
}

function _activePaintKey() {
  return paintTileKey === '__custom__' ? customPaintColor : paintTileKey;
}

// ─── Bottom sheets ────────────────────────────────────────────────────────────

function _openSheet(id) {
  if (_sheetId === id) return;
  _closeSheet(null);
  _sheetId = id;
  const el = document.getElementById(id);
  if (!el) return;
  el.removeAttribute('hidden');
  requestAnimationFrame(() => el.classList.add('open'));
  el.addEventListener('transitionend', function done(e) {
    if (e.propertyName !== 'transform') return;
    el.removeEventListener('transitionend', done);
  }, { once: true });
}

function _closeSheet(id) {
  const targetId = id ?? _sheetId;
  if (!targetId) return;
  _sheetId = null;
  const el = document.getElementById(targetId);
  if (!el) return;
  el.classList.remove('open');
  el.addEventListener('transitionend', function done(e) {
    if (e.propertyName !== 'transform') return;
    el.setAttribute('hidden', '');
    el.removeEventListener('transitionend', done);
  }, { once: true });
}

// ─── setTool ──────────────────────────────────────────────────────────────────

function setTool(tool) {
  currentTool = tool;
  overlay.aoePreview = null;
  rulerStart = null; overlay.ruler = null;
  broadcastRuler(null);

  document.querySelectorAll('.bm-tool-btn').forEach(el =>
    el.classList.toggle('active', el.dataset.tool === tool)
  );
  document.getElementById('canvas-wrap').dataset.tool = tool;

  if (tool === 'paint' || tool === 'erase') _openSheet('tile-palette');
  else if (tool === 'aoe')   _openSheet('aoe-panel');
  else if (tool === 'draw')  _openSheet('draw-panel');
  else _closeSheet(null);

  render();
}

// ─── Header tool bar ──────────────────────────────────────────────────────────

function _setupToolBar() {
  document.querySelectorAll('.bm-tool-btn').forEach(btn => {
    btn.addEventListener('pointerdown', e => {
      e.stopPropagation();
      setTool(btn.dataset.tool);
    });
  });
}

// ─── Hamburger menu ───────────────────────────────────────────────────────────

function _setupHamburger() {
  const btn  = document.getElementById('btn-hamburger');
  const menu = document.getElementById('hamburger-menu');
  if (!btn || !menu) return;

  btn.addEventListener('pointerdown', e => {
    e.stopPropagation();
    if (menu.hasAttribute('hidden')) {
      menu.removeAttribute('hidden');
    } else {
      _closeHamburger();
    }
  });

  document.addEventListener('pointerdown', e => {
    if (!menu.hasAttribute('hidden') && !menu.contains(e.target) && e.target !== btn) {
      _closeHamburger();
    }
  }, { capture: true });

  document.getElementById('hmenu-save')?.addEventListener('click', () => {
    exportToFile();
    toast('Map saved');
    _closeHamburger();
  });

  document.getElementById('inp-load')?.addEventListener('change', async e => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      await importFromFile(file);
      preloadTokenImages();
      render();
      toast('Map loaded');
    } catch { toast('Failed to load map', true); }
    e.target.value = '';
    _closeHamburger();
  });

  document.getElementById('hmenu-export-png')?.addEventListener('click', () => {
    const canvas = document.getElementById('map-canvas');
    const a = Object.assign(document.createElement('a'), {
      href:     canvas.toDataURL('image/png'),
      download: `battle-map-${new Date().toISOString().slice(0,10)}.png`,
    });
    a.click();
    toast('PNG exported');
    _closeHamburger();
  });

  document.getElementById('hmenu-overview')?.addEventListener('click', () => {
    _setView(activeView === 'overview' ? 'map' : 'overview');
    _closeHamburger();
  });

  document.getElementById('hmenu-open-player')?.addEventListener('click', () => {
    window.open('./player-map.html', 'battle-map-player');
    toast('Player window opened');
    _closeHamburger();
  });

  document.getElementById('hmenu-settings')?.addEventListener('click', () => {
    const panel = document.getElementById('map-settings-panel');
    if (panel) {
      if (panel.hasAttribute('hidden')) panel.removeAttribute('hidden');
      else panel.setAttribute('hidden', '');
    }
  });
}

function _closeHamburger() {
  const menu  = document.getElementById('hamburger-menu');
  const panel = document.getElementById('map-settings-panel');
  menu?.setAttribute('hidden', '');
  panel?.setAttribute('hidden', '');
}

// ─── Map settings ─────────────────────────────────────────────────────────────

function _setupMapSettings() {
  document.getElementById('map-cols')?.addEventListener('change', e => {
    const v = parseInt(e.target.value);
    if (v >= 5 && v <= 200) resizeMap(v, state.map.rows);
  });
  document.getElementById('map-rows')?.addEventListener('change', e => {
    const v = parseInt(e.target.value);
    if (v >= 5 && v <= 200) resizeMap(state.map.cols, v);
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
    reader.onload = ev => { setBgImage(ev.target.result); toast('Background set'); };
    reader.readAsDataURL(file);
    e.target.value = '';
  });
  document.getElementById('btn-clear-bg')?.addEventListener('click', () => {
    setBgImage(null); toast('Background cleared');
  });
}

function _syncSettingsPanel() {
  const el = id => document.getElementById(id);
  if (el('map-cols'))      el('map-cols').value       = state.map.cols;
  if (el('map-rows'))      el('map-rows').value       = state.map.rows;
  if (el('map-cell-size')) el('map-cell-size').value  = state.map.cellSize;
  if (el('map-show-grid')) el('map-show-grid').checked = state.settings.showGrid;
}

// ─── Token action popup ───────────────────────────────────────────────────────

function _setupTokenActionPopup() {
  const popup = document.getElementById('token-action-popup');

  const _act = action => {
    if (!_tapTokId) return;
    const t = state.tokens.find(t => t.id === _tapTokId);
    if (!t) { _closeTap(); return; }
    if (action === 'hide')      { updateToken(_tapTokId, { hidden:    !t.hidden    }); }
    if (action === 'invisible') { updateToken(_tapTokId, { invisible: !t.invisible }); }
    if (action === 'edit')      { openEditTokenDialog(t, () => { render(); broadcast(); }); }
    if (action === 'delete') {
      if (overlay.selectedId === _tapTokId) overlay.selectedId = null;
      const combatantId = t.combatantId;
      if (combatantId) {
        if (_overlayId === combatantId) _closeCharOverlay();
        removeCombatant(combatantId);
      }
      removeToken(_tapTokId);
      _cbSave(); renderCombatPanel(); render(); broadcast();
    }
    _closeTap();
  };

  document.getElementById('tap-hide')?.addEventListener('click',      () => _act('hide'));
  document.getElementById('tap-invisible')?.addEventListener('click', () => _act('invisible'));
  document.getElementById('tap-edit')?.addEventListener('click',      () => _act('edit'));
  document.getElementById('tap-delete')?.addEventListener('click',    () => _act('delete'));

  // Close on tap outside popup (capture so it fires before canvas handlers)
  document.addEventListener('pointerdown', e => {
    if (!popup?.hasAttribute('hidden') && !popup?.contains(e.target)) _closeTap();
  }, { capture: true });
}

function _openTap(clientX, clientY, tokenId) {
  _tapTokId = tokenId;
  const popup = document.getElementById('token-action-popup');
  if (!popup) return;
  popup.removeAttribute('hidden');
  const pw = 180, ph = 170;
  const left = Math.min(Math.max(8, clientX), window.innerWidth  - pw - 8);
  const top  = Math.min(Math.max(8, clientY), window.innerHeight - ph - 8);
  popup.style.left = `${left}px`;
  popup.style.top  = `${top}px`;
}

function _closeTap() {
  _tapTokId = null;
  document.getElementById('token-action-popup')?.setAttribute('hidden', '');
}

// ─── Keyboard shortcuts ───────────────────────────────────────────────────────

function _setupKeyboard() {
  document.addEventListener('keydown', e => {
    if (['INPUT','SELECT','TEXTAREA'].includes(e.target.tagName)) return;
    const map = { v:'move', t:'paint', e:'erase', p:'token', a:'aoe', d:'draw', r:'ruler' };
    if (map[e.key.toLowerCase()]) { setTool(map[e.key.toLowerCase()]); return; }
    if (e.key === 'Escape') {
      overlay.selectedId = null; overlay.ruler = null; rulerStart = null;
      broadcastRuler(null); _closeTap(); _closeSheet(null); _closeCharOverlay();
      render();
    }
    if ((e.key === 'Delete' || e.key === 'Backspace') && overlay.selectedId) {
      const id = overlay.selectedId;
      overlay.selectedId = null;
      const tok = state.tokens.find(t => t.id === id);
      if (tok?.combatantId) {
        if (_overlayId === tok.combatantId) _closeCharOverlay();
        removeCombatant(tok.combatantId);
      }
      removeToken(id);
      removeAoeShape(id);
      _cbSave(); renderCombatPanel(); render(); broadcast();
    }
  });
  // Space = pan
  document.addEventListener('keydown', e => {
    if (e.code === 'Space' && !['INPUT','SELECT','TEXTAREA'].includes(document.activeElement.tagName)) {
      e.preventDefault(); isPanning = true;
    }
  });
  document.addEventListener('keyup', e => { if (e.code === 'Space') isPanning = false; });
}

// ─── Canvas events ────────────────────────────────────────────────────────────

function _setupCanvas(canvas) {
  canvas.addEventListener('pointerdown', e => {
    canvas.setPointerCapture(e.pointerId);
    _ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
    _handleDown(e);
  });
  canvas.addEventListener('pointermove', e => {
    _ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
    _handleMove(e);
  });
  canvas.addEventListener('pointerup', e => {
    _handleUp(e);
    _ptrs.delete(e.pointerId);
    if (_ptrs.size < 2) _pinchDist = null;
  });
  canvas.addEventListener('pointercancel', e => {
    _cancelLP();
    _ptrs.delete(e.pointerId);
    if (_ptrs.size < 2) _pinchDist = null;
    dragToken = null; overlay.dragToken = null;
    isPainting = false; isPanning = false;
    render();
  });
  canvas.addEventListener('wheel', _handleWheel, { passive: false });
  canvas.addEventListener('dblclick', e => {
    if (activeView !== 'overview') return;
    const { sx, sy } = _xy(e);
    ovDblClick(sx, sy, id => { switchChamber(id); _setView('map'); });
  });
  canvas.addEventListener('pointerleave', () => {
    overlay.hoverTokenId = null;
    overlay.hoverCell    = null;
    document.getElementById('tok-hover')?.classList.remove('visible');
    render();
  });
  // contextmenu = trackpad right-click → same as long-press
  canvas.addEventListener('contextmenu', e => {
    e.preventDefault();
    if (VIEW_MODE !== 'dm') return;
    const { sx, sy } = _xy(e);
    const w     = screenToWorld(sx, sy);
    const token = tokenAtWorld(w.x, w.y);
    if (token) {
      overlay.selectedId = token.id;
      render();
      _openTap(e.clientX, e.clientY, token.id);
    }
  });
}

function _xy(e) {
  const r = e.currentTarget.getBoundingClientRect();
  return { sx: e.clientX - r.left, sy: e.clientY - r.top };
}

// ─── Pinch zoom ───────────────────────────────────────────────────────────────

function _pinchCalcDist() {
  const pts = [..._ptrs.values()];
  return Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
}

function _doPinch() {
  if (_pinchDist === null) return;
  const newDist = _pinchCalcDist();
  const factor  = newDist / _pinchDist;
  _pinchDist    = newDist;

  const pts = [..._ptrs.values()];
  const rect = document.getElementById('map-canvas').getBoundingClientRect();
  const sx = (pts[0].x + pts[1].x) / 2 - rect.left;
  const sy = (pts[0].y + pts[1].y) / 2 - rect.top;

  const { panX, panY, zoom } = state.viewport;
  const newZoom = Math.max(0.15, Math.min(4.0, zoom * factor));
  setViewport({
    zoom: newZoom,
    panX: sx - (sx - panX) * (newZoom / zoom),
    panY: sy - (sy - panY) * (newZoom / zoom),
  });
  render();
}

// ─── Long press ───────────────────────────────────────────────────────────────

function _cancelLP() {
  if (_lpTimer) { clearTimeout(_lpTimer); _lpTimer = null; }
  _lpEvent = null;
}

function _fireLongPress(e) {
  if (VIEW_MODE !== 'dm') return;
  const canvas = document.getElementById('map-canvas');
  const rect   = canvas.getBoundingClientRect();
  const w      = screenToWorld(e.clientX - rect.left, e.clientY - rect.top);
  const token  = tokenAtWorld(w.x, w.y);
  if (token) {
    overlay.selectedId = token.id;
    render();
    _openTap(e.clientX, e.clientY, token.id);
  }
}

// ─── Pan ──────────────────────────────────────────────────────────────────────

function _startPan(e) {
  isPanning = true;
  const { sx, sy } = _xy(e);
  panStartX = sx; panStartY = sy;
  panStartPX = state.viewport.panX; panStartPY = state.viewport.panY;
  document.getElementById('canvas-wrap')?.classList.add('panning');
}

function _doPan(sx, sy) {
  if (activeView === 'overview') {
    ovPan(sx - panStartX, sy - panStartY);
    panStartX = sx; panStartY = sy;
    _renderOverview();
    return;
  }
  setViewport({ panX: panStartPX + (sx - panStartX), panY: panStartPY + (sy - panStartY) });
  render();
}

function _endPan() {
  isPanning = false;
  document.getElementById('canvas-wrap')?.classList.remove('panning');
}

// ─── Wheel zoom ───────────────────────────────────────────────────────────────

function _handleWheel(e) {
  e.preventDefault();
  const { sx, sy } = _xy(e);
  if (activeView === 'overview') { ovWheel(sx, sy, e.deltaY); _renderOverview(); return; }
  const factor = e.deltaY < 0 ? 1.1 : 0.91;
  const { panX, panY, zoom } = state.viewport;
  const newZoom = Math.max(0.15, Math.min(4.0, zoom * factor));
  setViewport({
    zoom: newZoom,
    panX: sx - (sx - panX) * (newZoom / zoom),
    panY: sy - (sy - panY) * (newZoom / zoom),
  });
  render();
}

// ─── Pointer down ─────────────────────────────────────────────────────────────

function _handleDown(e) {
  // Two-finger: enter pinch mode
  if (_ptrs.size >= 2) {
    _cancelLP();
    dragToken = null; overlay.dragToken = null;
    isPainting = false;
    _pinchDist = _pinchCalcDist();
    return;
  }

  // Overview mode
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

  // Middle mouse / alt = pan
  if (e.button === 1 || (e.button === 0 && e.altKey)) { _startPan(e); return; }
  if (e.button !== 0) return;

  _closeTap();
  _tapMoved = false;
  _tapDownX = e.clientX;
  _tapDownY = e.clientY;
  const { sx, sy } = _xy(e);
  const w    = screenToWorld(sx, sy);
  const cell = screenToCell(sx, sy);

  // Start long-press timer (move tool, single pointer, DM mode)
  if (currentTool === 'move' && VIEW_MODE === 'dm' && _ptrs.size === 1) {
    _lpEvent = e;
    _lpTimer = setTimeout(() => {
      if (_lpEvent) _fireLongPress(_lpEvent);
      _lpTimer = null;
      _lpEvent = null;
    }, LP_MS);
  }

  if (VIEW_MODE !== 'dm') return;

  switch (currentTool) {
    case 'move': {
      const token = tokenAtWorld(w.x, w.y);
      if (token) {
        dragToken = token;
        dragOffCol = cell.col - token.col;
        dragOffRow = cell.row - token.row;
        overlay.selectedId = token.id;
        render(); break;
      }
      const aoe = aoeAtWorld(w.x, w.y);
      if (aoe) { overlay.selectedId = aoe.id; isMovingAoe = true; aoeMoveStart(aoe, sx, sy); break; }
      const tileKey = state.map.tiles[cell.row]?.[cell.col];
      if (tileKey === 'door-closed' || tileKey === 'door-open') {
        setTile(cell.col, cell.row, toggleDoor(tileKey));
      } else {
        overlay.selectedId = null; render();
      }
      break;
    }
    case 'paint':
      isPainting = true; setTile(cell.col, cell.row, _activePaintKey()); break;
    case 'erase':
      isPainting = true; setTile(cell.col, cell.row, 'floor'); break;
    case 'token':
      _openBattleAddDialog(cell.col, cell.row);
      break;
    case 'aoe':
      aoePointerDown(sx, sy); break;
    case 'draw':
      penDown(sx, sy); break;
    case 'ruler':
      if (!rulerStart) {
        const wc = cellCenter(cell.col, cell.row);
        rulerStart = wc;
        overlay.ruler = { x1: wc.x, y1: wc.y, x2: wc.x, y2: wc.y };
        broadcastRuler(overlay.ruler);
      } else {
        rulerStart = null; overlay.ruler = null; broadcastRuler(null);
      }
      render(); break;
  }
}

// ─── Pointer move ─────────────────────────────────────────────────────────────

function _handleMove(e) {
  // Cancel long press if pointer moved too far
  if (_lpTimer && _lpEvent) {
    const d = Math.hypot(e.clientX - _lpEvent.clientX, e.clientY - _lpEvent.clientY);
    if (d > LP_PX) _cancelLP();
  }

  // Tap movement detection
  if (!_tapMoved && _ptrs.size === 1) {
    if (Math.hypot(e.clientX - _tapDownX, e.clientY - _tapDownY) > TAP_THRESHOLD) _tapMoved = true;
  }

  // Two-finger pinch
  if (_ptrs.size >= 2) { _doPinch(); return; }

  const { sx, sy } = _xy(e);

  // Overview mode
  if (activeView === 'overview') {
    if (isPanning) { _doPan(sx, sy); return; }
    if (ovPointerMove(sx, sy)) _renderOverview();
    return;
  }

  const w    = screenToWorld(sx, sy);
  const cell = screenToCell(sx, sy);

  overlay.hoverCell = (cell.col >= 0 && cell.col < state.map.cols &&
                       cell.row >= 0 && cell.row < state.map.rows) ? cell : null;

  const hToken = tokenAtWorld(w.x, w.y);
  overlay.hoverTokenId = hToken?.id ?? null;
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
    case 'aoe':   aoePointerMove(sx, sy); break;
    case 'draw':  penMove(sx, sy); break;
    case 'ruler':
      if (rulerStart && overlay.ruler) {
        const wc = cellCenter(cell.col, cell.row);
        overlay.ruler.x2 = wc.x; overlay.ruler.y2 = wc.y;
        broadcastRuler(overlay.ruler); render();
      } else { render(); }
      break;
    default: render();
  }
}

// ─── Pointer up ───────────────────────────────────────────────────────────────

function _handleUp(e) {
  _cancelLP();

  if (e.button === 1)                    { _endPan(); return; }
  if (isPanning && e.button === 0)       { _endPan(); return; }
  if (e.button !== 0)                    return;

  const { sx, sy } = _xy(e);

  if (activeView === 'overview') {
    ovPointerUp(sx, sy, id => { switchChamber(id); _setView('map'); });
    _renderOverview(); return;
  }

  const cell = screenToCell(sx, sy);

  switch (currentTool) {
    case 'move': {
      const hadDrag = !!dragToken || isMovingAoe;
      if (dragToken) {
        const nc = Math.max(0, Math.min(state.map.cols - dragToken.size, cell.col - dragOffCol));
        const nr = Math.max(0, Math.min(state.map.rows - dragToken.size, cell.row - dragOffRow));
        moveToken(dragToken.id, nc, nr);
        overlay.dragToken = null; dragToken = null; render();
      }
      if (isMovingAoe) { aoeMoveEnd(); isMovingAoe = false; }
      if (!hadDrag && !_tapMoved && VIEW_MODE === 'dm') {
        const w = screenToWorld(sx, sy);
        const tok = tokenAtWorld(w.x, w.y);
        if (tok?.combatantId) _openCharOverlay(tok.combatantId);
      }
      break;
    }
    case 'paint': case 'erase':
      isPainting = false; break;
    case 'aoe':
      aoePointerUp(sx, sy); break;
    case 'draw':
      penUp(); break;
  }
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
    if (token.hidden)    html += `<div class="th-row"><span>🙈 Hidden</span></div>`;
    if (token.invisible) html += `<div class="th-row"><span>👁 Invisible</span></div>`;
  }
  if (token.conditions?.length) {
    html += `<div class="th-conditions">${token.conditions.map(c => `<span class="th-cond">${c}</span>`).join('')}</div>`;
  }

  if (token.combatantId) {
    const cb = state.combat.combatants.find(c => c.id === token.combatantId);
    if (cb) {
      const pct     = cb.maxHp > 0 ? Math.max(0, cb.hp / cb.maxHp) : 0;
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

  const wrap = document.getElementById('canvas-wrap');
  const elW  = el.offsetWidth  || 140;
  const elH  = el.offsetHeight || 80;
  let px = sx + 14, py = sy - 10;
  if (px + elW > wrap.offsetWidth)  px = sx - elW - 6;
  if (py + elH > wrap.offsetHeight) py = wrap.offsetHeight - elH - 6;
  if (py < 0) py = 6;
  el.style.left = `${px}px`;
  el.style.top  = `${py}px`;
}

// ─── Combat panel ─────────────────────────────────────────────────────────────

function _cbSave() { saveToStorage(); broadcast(); }

// ─── Initiative overlay ────────────────────────────────────────────────────────

function _setupInitOverlay() {
  document.getElementById('io-next')?.addEventListener('click', () => {
    nextTurn(); _cbSave(); renderCombatPanel(); render();
  });
  document.getElementById('io-sort')?.addEventListener('click', () => {
    sortInitiative(); _cbSave(); renderCombatPanel();
  });
  document.getElementById('io-reset')?.addEventListener('click', () => {
    if (confirm('Reset all combat?')) {
      resetCombat(); _cbSave(); renderCombatPanel(); render(); toast('Combat reset');
    }
  });
  document.getElementById('io-add')?.addEventListener('click', () => {
    const wrap = document.getElementById('canvas-wrap');
    const cell = screenToCell(wrap.offsetWidth / 2, wrap.offsetHeight / 2);
    _openBattleAddDialog(cell.col, cell.row);
  });
}

export function renderCombatPanel() {
  const list = document.getElementById('io-list');
  if (!list) return;

  const rd = document.getElementById('io-round');
  if (rd) rd.textContent = `R.${state.combat.round}`;

  const { combatants, tIdx } = state.combat;
  list.innerHTML = '';

  for (let i = 0; i < combatants.length; i++) {
    const c = combatants[i];
    const isActive = i === tIdx;

    const row = document.createElement('div');
    row.className = `io-row${isActive ? ' active' : ''}${c.hp <= 0 ? ' dead' : ''}`;

    const arrow = document.createElement('span');
    arrow.style.cssText = 'font-size:0.55rem;color:var(--active-glow);width:8px;flex-shrink:0';
    arrow.textContent = isActive ? '▶' : '';

    const dot = document.createElement('div');
    dot.className = `io-dot ${c.type}`;

    const nm = document.createElement('span');
    nm.className = 'io-name';
    nm.textContent = c.name;

    row.append(arrow, dot, nm);
    row.addEventListener('click', () => _openCharOverlay(c.id));
    list.appendChild(row);
  }
}

// ─── Character overlay ────────────────────────────────────────────────────────

function _setupCharOverlay() {
  document.getElementById('co-close')?.addEventListener('click', _closeCharOverlay);

  // Close on backdrop click
  document.getElementById('char-overlay')?.addEventListener('pointerdown', e => {
    if (e.target === document.getElementById('char-overlay')) _closeCharOverlay();
  });

  document.getElementById('co-heal')?.addEventListener('click', () => {
    if (!_overlayId) return;
    const amt = parseInt(document.getElementById('co-amt')?.value) || 0;
    healCombatant(_overlayId, amt);
    const c = state.combat.combatants.find(x => x.id === _overlayId);
    if (c) _refreshOverlayHP(c);
    _cbSave(); renderCombatPanel(); render();
  });

  document.getElementById('co-dmg')?.addEventListener('click', () => {
    if (!_overlayId) return;
    const amt = parseInt(document.getElementById('co-amt')?.value) || 0;
    damageCombatant(_overlayId, amt);
    const c = state.combat.combatants.find(x => x.id === _overlayId);
    if (c) _refreshOverlayHP(c);
    _cbSave(); renderCombatPanel(); render();
  });

  document.getElementById('co-set-tmp')?.addEventListener('click', () => {
    if (!_overlayId) return;
    const amt = parseInt(document.getElementById('co-tmp')?.value) || 0;
    setTempHP(_overlayId, amt);
    const c = state.combat.combatants.find(x => x.id === _overlayId);
    if (c) _refreshOverlayHP(c);
    _cbSave(); renderCombatPanel(); render();
  });
}

function _openCharOverlay(combatantId) {
  const c = state.combat.combatants.find(x => x.id === combatantId);
  if (!c) return;
  _overlayId = combatantId;

  document.getElementById('co-name').textContent = c.name;
  const badge = document.getElementById('co-type-badge');
  badge.textContent = c.type;
  badge.className = `co-badge ${c.type}`;

  _refreshOverlayHP(c);
  _refreshOverlayConds(c);

  const tmpInp = document.getElementById('co-tmp');
  if (tmpInp) tmpInp.value = c.tempHp || 0;

  const body = document.getElementById('co-body');
  body.innerHTML = c.sourceData ? _renderSheetHTML(c.sourceData, c.type) : _renderMinimalSheet(c);

  document.getElementById('char-overlay').classList.add('open');
  body.scrollTop = 0;
}

function _refreshOverlayConds(c) {
  const el = document.getElementById('co-conds');
  if (!el) return;
  el.innerHTML = '';
  for (const cond of CONDITIONS) {
    const btn = document.createElement('button');
    btn.className = 'co-cond-btn' + (c.conditions.has(cond) ? ' active' : '');
    btn.textContent = cond.slice(0, 4);
    btn.title = cond;
    btn.addEventListener('click', () => {
      if (!_overlayId) return;
      toggleCondition(_overlayId, cond);
      _cbSave(); renderCombatPanel(); render();
      const updated = state.combat.combatants.find(x => x.id === _overlayId);
      btn.classList.toggle('active', updated?.conditions.has(cond) ?? false);
    });
    el.appendChild(btn);
  }
}

function _closeCharOverlay() {
  _overlayId = null;
  document.getElementById('char-overlay')?.classList.remove('open');
}

function _refreshOverlayHP(c) {
  const pct = c.maxHp > 0 ? Math.max(0, c.hp / c.maxHp) : 0;
  const bar = document.getElementById('co-hp-bar');
  if (bar) {
    bar.style.width      = `${pct * 100}%`;
    bar.style.background = pct > 0.5 ? '#4caf50' : pct > 0.25 ? '#ff9800' : '#f44336';
  }
  const lbl = document.getElementById('co-hp-label');
  if (lbl) lbl.textContent = c.tempHp > 0 ? `${c.hp}+${c.tempHp}/${c.maxHp}` : `${c.hp}/${c.maxHp}`;
}

// ─── Sheet renderers ──────────────────────────────────────────────────────────

function _sheetEsc(s) {
  if (s === null || s === undefined) return '';
  const d = document.createElement('div');
  d.textContent = String(s);
  return d.innerHTML;
}

function _mod(score) {
  const m = Math.floor((score - 10) / 2);
  return m >= 0 ? `+${m}` : `${m}`;
}

function _renderSheetHTML(data, type) {
  if (type === 'monster') return _renderMonsterSheet(data);
  if (type === 'player')  return _renderPlayerSheet(data);
  return _renderMinimalSheet({ name: data.name || '?', hp: 0, maxHp: 0, ac: 0 });
}

function _renderMonsterSheet(data) {
  const abs = data.abilities || {};
  const scores = [
    { name:'STR', score: abs.str?.score ?? abs.str ?? 10 },
    { name:'DEX', score: abs.dex?.score ?? abs.dex ?? 10 },
    { name:'CON', score: abs.con?.score ?? abs.con ?? 10 },
    { name:'INT', score: abs.int?.score ?? abs.int ?? 10 },
    { name:'WIS', score: abs.wis?.score ?? abs.wis ?? 10 },
    { name:'CHA', score: abs.cha?.score ?? abs.cha ?? 10 },
  ];

  let html = '';
  const sizeLine = [data.size, data.type, data.alignment].filter(Boolean).join(' ');
  if (sizeLine) html += `<div class="sheet-meta">${_sheetEsc(sizeLine)}</div>`;

  html += `<div class="sheet-stats-row">`;
  if (data.ac)    html += `<div class="sheet-stat"><div class="sheet-stat-val">${_sheetEsc(data.ac)}</div><div class="sheet-stat-lbl">AC</div></div>`;
  if (data.speed) html += `<div class="sheet-stat"><div class="sheet-stat-val">${_sheetEsc(data.speed)}</div><div class="sheet-stat-lbl">Speed</div></div>`;
  if (data.cr)    html += `<div class="sheet-stat"><div class="sheet-stat-val">${_sheetEsc(data.cr)}</div><div class="sheet-stat-lbl">CR</div></div>`;
  html += `</div>`;

  html += `<div class="ability-grid">`;
  for (const { name, score } of scores) {
    html += `<div class="ability-cell"><div class="ability-mod">${_mod(score)}</div><div class="ability-score">${score}</div><div class="ability-name">${name}</div></div>`;
  }
  html += `</div>`;

  const details = [];
  if (data.skills)      details.push(`<div class="sheet-detail-row"><span class="sheet-detail-lbl">Skills</span><span>${_sheetEsc(data.skills)}</span></div>`);
  if (data.senses)      details.push(`<div class="sheet-detail-row"><span class="sheet-detail-lbl">Senses</span><span>${_sheetEsc(data.senses)}</span></div>`);
  if (data.languages)   details.push(`<div class="sheet-detail-row"><span class="sheet-detail-lbl">Languages</span><span>${_sheetEsc(data.languages)}</span></div>`);
  if (data.immunities)  details.push(`<div class="sheet-detail-row"><span class="sheet-detail-lbl">Immunities</span><span>${_sheetEsc(data.immunities)}</span></div>`);
  if (details.length) html += `<div class="sheet-section">${details.join('')}</div>`;

  const _actionBlock = a => `<div class="action-block"><div class="action-name">${_sheetEsc(a.name)}</div><div class="action-desc">${_sheetEsc(a.description || a.desc || '')}</div></div>`;
  const _actionSection = (title, arr) => arr?.length ? `<div class="sheet-section"><div class="sheet-title">${title}</div>${arr.map(_actionBlock).join('')}</div>` : '';

  html += _actionSection('Traits', data.traits);
  html += _actionSection('Actions', data.actions);
  html += _actionSection('Bonus Actions', data.bonusActions);
  html += _actionSection('Reactions', data.reactions);
  html += _actionSection('Legendary Actions', data.legendaryActions);

  return html;
}

function _renderPlayerSheet(data) {
  const basic  = data.basic  || {};
  const combat = data.combat || {};
  const abs    = data.abilities || {};

  const _sc = v => (typeof v === 'object' ? (v?.score ?? 10) : (v ?? 10));
  const scores = [
    { name:'STR', score: _sc(abs.str) },
    { name:'DEX', score: _sc(abs.dex) },
    { name:'CON', score: _sc(abs.con) },
    { name:'INT', score: _sc(abs.int) },
    { name:'WIS', score: _sc(abs.wis) },
    { name:'CHA', score: _sc(abs.cha) },
  ];

  let html = '';
  const metaLine = [basic.class, basic.level ? `Lv${basic.level}` : '', basic.race, basic.background].filter(Boolean).join(' · ');
  if (metaLine) html += `<div class="sheet-meta">${_sheetEsc(metaLine)}</div>`;

  html += `<div class="sheet-stats-row">`;
  if (combat.armorClass)    html += `<div class="sheet-stat"><div class="sheet-stat-val">${_sheetEsc(combat.armorClass)}</div><div class="sheet-stat-lbl">AC</div></div>`;
  if (combat.speed)         html += `<div class="sheet-stat"><div class="sheet-stat-val">${_sheetEsc(combat.speed)}</div><div class="sheet-stat-lbl">Speed</div></div>`;
  if (basic.proficiencyBonus) html += `<div class="sheet-stat"><div class="sheet-stat-val">+${_sheetEsc(basic.proficiencyBonus)}</div><div class="sheet-stat-lbl">Prof</div></div>`;
  const dexMod = _mod(scores.find(s => s.name === 'DEX')?.score ?? 10);
  html += `<div class="sheet-stat"><div class="sheet-stat-val">${dexMod}</div><div class="sheet-stat-lbl">Init</div></div>`;
  html += `</div>`;

  html += `<div class="ability-grid">`;
  for (const { name, score } of scores) {
    html += `<div class="ability-cell"><div class="ability-mod">${_mod(score)}</div><div class="ability-score">${score}</div><div class="ability-name">${name}</div></div>`;
  }
  html += `</div>`;

  const SKILL_ABILITY = { Athletics:'STR', Acrobatics:'DEX', 'Sleight of Hand':'DEX', Stealth:'DEX', Arcana:'INT', History:'INT', Investigation:'INT', Nature:'INT', Religion:'INT', 'Animal Handling':'WIS', Insight:'WIS', Medicine:'WIS', Perception:'WIS', Survival:'WIS', Deception:'CHA', Intimidation:'CHA', Performance:'CHA', Persuasion:'CHA' };
  const skillsData = data.skills || {};
  const profSkills = Object.entries(skillsData).filter(([, v]) => v && (v.proficient || v.expert));
  if (profSkills.length) {
    html += `<div class="sheet-section"><div class="sheet-title">Skills</div>`;
    for (const [k, v] of profSkills) {
      const abilScore = scores.find(s => s.name === (SKILL_ABILITY[k] || 'STR'))?.score ?? 10;
      const prof = basic.proficiencyBonus || 2;
      const bonus = Math.floor((abilScore - 10) / 2) + (v.expert ? prof * 2 : prof);
      html += `<div class="attack-row"><span class="attack-name">${_sheetEsc(k)}</span><span class="attack-bonus">${bonus >= 0 ? '+' : ''}${bonus}</span></div>`;
    }
    html += `</div>`;
  }

  const attacks = data.attacks || combat.attacks || [];
  if (attacks.length) {
    html += `<div class="sheet-section"><div class="sheet-title">Attacks</div>`;
    for (const a of attacks) {
      const b = a.bonus !== undefined ? (a.bonus >= 0 ? `+${a.bonus}` : `${a.bonus}`) : '';
      html += `<div class="attack-row"><span class="attack-name">${_sheetEsc(a.name)}</span><span class="attack-bonus">${_sheetEsc(b)}</span><span class="attack-dmg">${_sheetEsc(a.damage || '')}</span></div>`;
    }
    html += `</div>`;
  }

  const spells = data.spellcasting || data.spells || {};
  if (spells.ability || spells.slots) {
    html += `<div class="sheet-section"><div class="sheet-title">Spellcasting</div>`;
    if (spells.ability)     html += `<div class="sheet-detail-row"><span class="sheet-detail-lbl">Ability</span><span>${_sheetEsc(spells.ability)}</span></div>`;
    if (spells.saveDC)      html += `<div class="sheet-detail-row"><span class="sheet-detail-lbl">Save DC</span><span>${_sheetEsc(spells.saveDC)}</span></div>`;
    if (spells.attackBonus) html += `<div class="sheet-detail-row"><span class="sheet-detail-lbl">Atk Bonus</span><span>${_sheetEsc(spells.attackBonus)}</span></div>`;
    if (spells.slots) {
      const slotsStr = Object.entries(spells.slots)
        .filter(([, s]) => s && (s.total ?? s.max ?? 0) > 0)
        .map(([lvl, s]) => {
          const total = s.total ?? s.max ?? 0;
          return `L${lvl}: ${total - (s.used ?? 0)}/${total}`;
        }).join('  ');
      if (slotsStr) html += `<div class="sheet-detail-row"><span class="sheet-detail-lbl">Slots</span><span>${_sheetEsc(slotsStr)}</span></div>`;
    }
    html += `</div>`;
  }

  const resources = data.resources || [];
  if (resources.length) {
    html += `<div class="sheet-section"><div class="sheet-title">Resources</div>`;
    for (const r of resources) {
      html += `<div class="attack-row"><span class="attack-name">${_sheetEsc(r.name)}</span><span class="attack-bonus">${_sheetEsc(r.current ?? r.value ?? '')}/${_sheetEsc(r.max || '')}</span></div>`;
    }
    html += `</div>`;
  }

  const features = data.features || [];
  if (features.length) {
    html += `<div class="sheet-section"><div class="sheet-title">Features</div>`;
    for (const f of features) {
      html += `<div class="action-block"><div class="action-name">${_sheetEsc(f.name)}</div>`;
      if (f.description || f.desc) html += `<div class="action-desc">${_sheetEsc(f.description || f.desc)}</div>`;
      html += `</div>`;
    }
    html += `</div>`;
  }

  const equipment = data.equipment || data.items || [];
  const equipped  = equipment.filter(e => e.equipped !== false);
  if (equipped.length) {
    html += `<div class="sheet-section"><div class="sheet-title">Equipment</div>`;
    for (const item of equipped) {
      html += `<div class="attack-row"><span class="attack-name">${_sheetEsc(item.name || item)}</span></div>`;
    }
    html += `</div>`;
  }

  return html;
}

function _renderMinimalSheet(c) {
  return `<div class="sheet-meta">No character data available.</div>
<div class="sheet-stats-row">
  <div class="sheet-stat"><div class="sheet-stat-val">${_sheetEsc(c.ac || '—')}</div><div class="sheet-stat-lbl">AC</div></div>
</div>`;
}

// ─── HP bars over tokens ──────────────────────────────────────────────────────

function _updateHPBars() {
  const layer = document.getElementById('hp-bars-layer');
  if (!layer) return;
  if (activeView === 'overview') { layer.innerHTML = ''; return; }
  const cs = state.map.cellSize;
  const seen = new Set();

  for (const token of state.tokens) {
    if (token.hidden && VIEW_MODE !== 'dm') continue;
    const c = state.combat.combatants.find(x => x.id === token.combatantId);
    if (!c || c.maxHp <= 0) continue;
    seen.add(token.id);

    const wx = token.col * cs;
    const wy = token.row * cs;
    const ww = token.size * cs;
    const s1 = worldToScreen(wx, wy);
    const s2 = worldToScreen(wx + ww, wy);
    const barW = s2.x - s1.x;
    if (barW < 4) continue;

    let el = layer.querySelector(`[data-tok="${token.id}"]`);
    if (!el) {
      el = document.createElement('div');
      el.className = 'tok-hp-wrap';
      el.dataset.tok = token.id;
      const fill = document.createElement('div');
      fill.className = 'tok-hp-fill';
      el.appendChild(fill);
      layer.appendChild(el);
    }

    const pct = Math.max(0, c.hp / c.maxHp);
    const hpColor = pct > 0.5 ? '#4caf50' : pct > 0.25 ? '#ff9800' : '#f44336';
    el.style.left   = `${s1.x}px`;
    el.style.top    = `${s1.y - 8}px`;
    el.style.width  = `${barW}px`;
    el.querySelector('.tok-hp-fill').style.width      = `${pct * 100}%`;
    el.querySelector('.tok-hp-fill').style.background = hpColor;
  }

  for (const el of layer.querySelectorAll('.tok-hp-wrap')) {
    if (!seen.has(el.dataset.tok)) el.remove();
  }
}

// ─── Battle-add dialog ────────────────────────────────────────────────────────

function _openBattleAddDialog(col, row) {
  _addCol = col;
  _addRow = row;
  _addSourceData = null;

  const v = id => document.getElementById(id);
  if (v('bam-name'))  v('bam-name').value  = '';
  if (v('bam-hp'))    v('bam-hp').value    = '10';
  if (v('bam-ac'))    v('bam-ac').value    = '10';
  if (v('bam-init'))  v('bam-init').value  = '0';
  if (v('bam-size'))  v('bam-size').value  = '1';
  if (v('bam-color')) v('bam-color').value = '#8b1a1a';
  if (v('bam-type'))  v('bam-type').value  = 'monster';
  if (v('bam-file-info')) v('bam-file-info').textContent = '';
  if (v('bam-search')) v('bam-search').value = '';

  // Switch to library tab
  document.querySelectorAll('.bam-tab').forEach(t => t.classList.remove('active'));
  document.querySelector('.bam-tab[data-mode="library"]')?.classList.add('active');
  v('bam-library')?.removeAttribute('hidden');
  v('bam-file')?.setAttribute('hidden', '');
  v('bam-manual')?.setAttribute('hidden', '');

  _bamLoadLibrary();

  v('battle-add-modal')?.removeAttribute('hidden');
  v('bam-name')?.focus();
}

async function _bamLoadLibrary() {
  const listEl = document.getElementById('bam-list');
  if (!listEl) return;
  listEl.innerHTML = '<div style="padding:6px 10px;font-size:0.65rem;color:var(--ink-faded)">Loading…</div>';

  try {
    const resp = await fetch('../../data/index.json');
    if (!resp.ok) throw new Error('no index');
    const idx = await resp.json();

    const entries = [];

    const monsterFiles = idx.monsters || [];
    for (const file of monsterFiles) {
      try {
        const r = await fetch(`../../data/monsters/${file}`);
        const d = await r.json();
        entries.push({ name: d.name || file, type: 'monster', data: d });
      } catch { /* skip */ }
    }

    const playerFiles = idx.players || [];
    for (const file of playerFiles) {
      try {
        const r = await fetch(`../../data/players/${file}`);
        const d = await r.json();
        const name = d.basic?.name || d.name || file;
        entries.push({ name, type: 'player', data: d });
      } catch { /* skip */ }
    }

    listEl.innerHTML = '';
    if (!entries.length) {
      listEl.innerHTML = '<div style="padding:6px 10px;font-size:0.65rem;color:var(--ink-faded)">No library entries found</div>';
      return;
    }

    for (const entry of entries) {
      const row = document.createElement('div');
      row.className = `bam-lib-item ${entry.type}`;
      row.textContent = entry.name;
      row.dataset.name = entry.name.toLowerCase();
      row.addEventListener('click', () => {
        document.querySelectorAll('.bam-lib-item').forEach(r => r.classList.remove('sel'));
        row.classList.add('sel');
        _bamPrefill(entry.data, entry.type);
      });
      listEl.appendChild(row);
    }
  } catch {
    listEl.innerHTML = '<div style="padding:6px 10px;font-size:0.65rem;color:var(--ink-faded)">Library unavailable</div>';
  }
}

function _bamPrefill(data, type) {
  _addSourceData = data;
  const v = id => document.getElementById(id);
  const name = data.basic?.name || data.name || '';
  const hp   = data.combat?.hp  || data.maxHp || data.hp || 10;
  const ac   = data.combat?.armorClass || data.ac || 10;
  const color = type === 'player' ? '#1b4d6e' : '#8b1a1a';

  if (v('bam-name')) v('bam-name').value = name;
  if (v('bam-hp'))    v('bam-hp').value    = hp;
  if (v('bam-ac'))    v('bam-ac').value    = ac;
  if (v('bam-type'))  v('bam-type').value  = type;
  if (v('bam-color')) v('bam-color').value = color;
}

function _setupBattleAddModal() {
  // Tab switching
  document.querySelectorAll('.bam-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const mode = tab.dataset.mode;
      document.querySelectorAll('.bam-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById('bam-library')?.setAttribute('hidden', '');
      document.getElementById('bam-file')?.setAttribute('hidden', '');
      document.getElementById('bam-manual')?.setAttribute('hidden', '');
      document.getElementById(`bam-${mode}`)?.removeAttribute('hidden');
      if (mode === 'manual') _addSourceData = null;
    });
  });

  // File upload
  document.getElementById('bam-file-inp')?.addEventListener('change', async e => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      const type = data.basic ? 'player' : 'monster';
      _bamPrefill(data, type);
      const info = document.getElementById('bam-file-info');
      if (info) info.textContent = file.name;
    } catch { toast('Could not parse JSON', true); }
    e.target.value = '';
  });

  // Search filter
  document.getElementById('bam-search')?.addEventListener('input', e => {
    const q = e.target.value.toLowerCase();
    document.querySelectorAll('.bam-lib-item').forEach(row => {
      row.style.display = row.dataset.name?.includes(q) ? '' : 'none';
    });
  });

  // Cancel
  document.getElementById('bam-cancel')?.addEventListener('click', () => {
    document.getElementById('battle-add-modal')?.setAttribute('hidden', '');
  });

  // Confirm — create token + combatant together
  document.getElementById('bam-confirm')?.addEventListener('click', () => {
    const v = id => document.getElementById(id);
    const name = v('bam-name')?.value.trim();
    if (!name) { toast('Enter a name', true); return; }

    const type = v('bam-type')?.value || 'monster';
    const hp   = parseInt(v('bam-hp')?.value)   || 10;
    const ac   = parseInt(v('bam-ac')?.value)   || 10;
    const init = parseInt(v('bam-init')?.value) || 0;
    const size = parseInt(v('bam-size')?.value) || 1;
    const color = v('bam-color')?.value || '#8b1a1a';

    const t = addToken({ name, tokenType: type, col: _addCol, row: _addRow, size, color,
                         hidden: false, invisible: false, conditions: [], height: 0 });
    const c = quickAddCombatant(name, init, hp, ac, type);
    if (_addSourceData) updateCombatant(c.id, { sourceData: _addSourceData });
    updateCombatant(c.id, { tokenId: t.id });
    updateToken(t.id, { combatantId: c.id });

    document.getElementById('battle-add-modal')?.setAttribute('hidden', '');
    overlay.selectedId = t.id;
    _cbSave(); renderCombatPanel(); render();
    toast(`Added: ${name}`);
  });

  // Close on backdrop click
  document.getElementById('battle-add-modal')?.addEventListener('pointerdown', e => {
    if (e.target === document.getElementById('battle-add-modal')) {
      document.getElementById('battle-add-modal').setAttribute('hidden', '');
    }
  });
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
