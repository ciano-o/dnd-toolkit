// aoe.js — AoE shape hit-testing and draw-drag interaction helpers.
// The actual rendering lives in renderer.js; this module manages the interaction state.

import { state, addAoeShape, updateAoeShape, removeAoeShape } from './state.js';
import { overlay, screenToCell, screenToWorld, render } from './renderer.js';

// ─── Element color presets ────────────────────────────────────────────────────

export const AOE_COLORS = [
  { name: 'Fire',      hex: '#ff6600' },
  { name: 'Cold',      hex: '#44aaff' },
  { name: 'Lightning', hex: '#ffee00' },
  { name: 'Acid',      hex: '#66ee22' },
  { name: 'Necrotic',  hex: '#aa44ff' },
  { name: 'Radiant',   hex: '#ffdd55' },
  { name: 'Force',     hex: '#ffffff' },
  { name: 'Poison',    hex: '#88cc44' },
  { name: 'Thunder',   hex: '#8888ff' },
  { name: 'Fire (alt)',hex: '#cc2200' },
];

// ─── Current draw session ─────────────────────────────────────────────────────

let _drawing = false;
let _anchorCol = 0, _anchorRow = 0;
let _anchorWx = 0, _anchorWy = 0;

/** Call on mousedown (world coords) when AoE tool is active. */
export function aoePointerDown(sx, sy) {
  const cell = screenToCell(sx, sy);
  const world = screenToWorld(sx, sy);
  _drawing = true;
  _anchorCol = cell.col;
  _anchorRow = cell.row;
  _anchorWx  = world.x;
  _anchorWy  = world.y;

  overlay.aoePreview = _makePreview(cell.col, cell.row, 0, 0);
  render();
}

/** Call on mousemove when AoE tool is active and button held. */
export function aoePointerMove(sx, sy) {
  if (!_drawing) return;
  const world = screenToWorld(sx, sy);
  _updatePreview(world.x, world.y);
  render();
}

/** Call on mouseup when AoE tool is active. Commits the shape if large enough. */
export function aoePointerUp(sx, sy) {
  if (!_drawing) return;
  _drawing = false;

  const world = screenToWorld(sx, sy);
  _updatePreview(world.x, world.y);

  const prev = overlay.aoePreview;
  overlay.aoePreview = null;

  if (prev && prev.size >= 0.5) {
    const s = addAoeShape({
      shapeType: prev.shapeType,
      col:   prev.col,
      row:   prev.row,
      size:  prev.size,
      angle: prev.angle,
      color: prev.color,
      label: prev.label,
    });
    overlay.selectedId = s.id;
  }
  render();
}

function _makePreview(col, row, size, angle) {
  return {
    shapeType: _getShapeType(),
    col, row, size, angle,
    color: _getColor(),
    label: _getLabel(),
  };
}

function _updatePreview(wx, wy) {
  if (!overlay.aoePreview) return;
  const cs   = state.map.cellSize;
  const dx   = wx - _anchorWx;
  const dy   = wy - _anchorWy;
  const dist = Math.sqrt(dx * dx + dy * dy) / cs;
  const ang  = Math.atan2(dy, dx);

  overlay.aoePreview.size  = Math.max(0, dist);
  overlay.aoePreview.angle = ang;
  overlay.aoePreview.col   = _anchorCol;
  overlay.aoePreview.row   = _anchorRow;
}

// ─── Move existing AoE shape ──────────────────────────────────────────────────

let _movingId = null;
let _moveDeltaCol = 0, _moveDeltaRow = 0;

export function aoeMoveStart(shape, sx, sy) {
  const cell = screenToCell(sx, sy);
  _movingId    = shape.id;
  _moveDeltaCol = cell.col - shape.col;
  _moveDeltaRow = cell.row - shape.row;
}

export function aoeMoveUpdate(sx, sy) {
  if (!_movingId) return;
  const cell = screenToCell(sx, sy);
  updateAoeShape(_movingId, {
    col: cell.col - _moveDeltaCol,
    row: cell.row - _moveDeltaRow,
  });
}

export function aoeMoveEnd() { _movingId = null; }

// ─── Hit test ─────────────────────────────────────────────────────────────────

/** Return AoE shape whose anchor cell contains the world point, or null. */
export function aoeAtWorld(wx, wy) {
  const cs = state.map.cellSize;
  for (let i = state.aoeShapes.length - 1; i >= 0; i--) {
    const s = state.aoeShapes[i];
    const ax = s.col * cs, ay = s.row * cs;
    if (wx >= ax && wx < ax + cs && wy >= ay && wy < ay + cs) return s;
  }
  return null;
}

// ─── Colour dot UI helper ─────────────────────────────────────────────────────

let _currentColor = AOE_COLORS[0].hex;
let _currentLabel = '';

export function getCurrentAoeColor() { return _currentColor; }
export function getCurrentAoeLabel() { return _currentLabel; }

export function initAoePanel() {
  const presets = document.getElementById('aoe-color-presets');
  if (!presets) return;

  presets.innerHTML = '';
  for (const c of AOE_COLORS) {
    const dot = document.createElement('div');
    dot.className   = 'color-dot' + (c.hex === _currentColor ? ' sel' : '');
    dot.style.background = c.hex;
    dot.title       = c.name;
    dot.addEventListener('click', () => {
      _currentColor = c.hex;
      presets.querySelectorAll('.color-dot').forEach(d => d.classList.remove('sel'));
      dot.classList.add('sel');
    });
    presets.appendChild(dot);
  }

  const labelInp = document.getElementById('aoe-label');
  if (labelInp) {
    labelInp.addEventListener('input', e => { _currentLabel = e.target.value; });
  }
}

// ─── Private getters (read from panel UI) ─────────────────────────────────────

function _getShapeType() {
  return document.getElementById('aoe-shape-type')?.value ?? 'circle';
}
function _getColor() { return _currentColor; }
function _getLabel() {
  return document.getElementById('aoe-label')?.value ?? '';
}
