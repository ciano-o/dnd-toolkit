// renderer.js — Canvas rendering engine. All visual layers drawn here.
// Import-and-call init() once, then call render() after state mutations.

import { state } from './state.js';
import { drawTile } from './tiles.js';

let canvas, ctx;
export let viewMode = 'dm'; // 'dm' | 'player'

// Ephemeral overlay state (set by interaction modules, not persisted)
export const overlay = {
  dragToken: null,    // { token, col, row } — token being dragged, drawn at new pos
  aoePreview: null,   // partial AoE shape being drawn
  ruler: null,        // { x1, y1, x2, y2 } in world px coords
  hoverCell: null,    // { col, row } — cell under cursor
  hoverTokenId: null, // id of token under cursor (for hover popup)
  selectedId: null,   // id of selected token or AoE shape
};

export function init(canvasEl, mode = 'dm') {
  canvas = canvasEl;
  ctx    = canvas.getContext('2d');
  viewMode = mode;
  _resize();
  window.addEventListener('resize', _resize);
}

export function setViewMode(mode) {
  viewMode = mode;
}

function _resize() {
  canvas.width  = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
  render();
}

// ─── Coordinate helpers ───────────────────────────────────────────────────────

export function screenToWorld(sx, sy) {
  const { panX, panY, zoom } = state.viewport;
  return { x: (sx - panX) / zoom, y: (sy - panY) / zoom };
}

export function worldToScreen(wx, wy) {
  const { panX, panY, zoom } = state.viewport;
  return { x: wx * zoom + panX, y: wy * zoom + panY };
}

export function screenToCell(sx, sy) {
  const w = screenToWorld(sx, sy);
  return {
    col: Math.floor(w.x / state.map.cellSize),
    row: Math.floor(w.y / state.map.cellSize),
  };
}

export function cellCenter(col, row) {
  const cs = state.map.cellSize;
  return { x: (col + 0.5) * cs, y: (row + 0.5) * cs };
}

// ─── Render scheduling ────────────────────────────────────────────────────────

let _rafId = null;
export function render() {
  if (_rafId) return; // already queued
  _rafId = requestAnimationFrame(() => { _rafId = null; _draw(); });
}

// ─── Main draw ────────────────────────────────────────────────────────────────

function _draw() {
  if (!ctx) return;
  const { panX, panY, zoom } = state.viewport;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#0d0d0d';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.setTransform(zoom, 0, 0, zoom, panX, panY);

  _drawBgImage();
  _drawTerrain();
  if (state.settings.showGrid) _drawGrid(zoom);
  _drawAnnotations(zoom);
  _drawAoeShapes(zoom);
  if (overlay.aoePreview) _drawSingleAoe(overlay.aoePreview, zoom);
  _drawTokens(zoom);
  _drawHoverHighlight();
  _drawSelectionRing(zoom);
  _drawRuler(zoom);

  ctx.restore();
}

// ─── Layer: background image ──────────────────────────────────────────────────

function _drawBgImage() {
  if (!state.map.bgImage) return;
  const { cols, rows, cellSize } = state.map;
  ctx.drawImage(state.map.bgImage, 0, 0, cols * cellSize, rows * cellSize);
}

// ─── Layer: terrain ───────────────────────────────────────────────────────────

function _drawTerrain() {
  const { cols, rows, cellSize, tiles } = state.map;
  const isDm = viewMode === 'dm';
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      drawTile(ctx, tiles[r]?.[c] ?? 'floor', c * cellSize, r * cellSize, cellSize, isDm);
    }
  }
}

// ─── Layer: grid lines ────────────────────────────────────────────────────────

function _drawGrid(zoom) {
  const { cols, rows, cellSize } = state.map;
  ctx.strokeStyle = state.settings.gridColor;
  ctx.lineWidth = 0.5 / zoom;
  ctx.beginPath();
  for (let c = 0; c <= cols; c++) {
    ctx.moveTo(c * cellSize, 0);
    ctx.lineTo(c * cellSize, rows * cellSize);
  }
  for (let r = 0; r <= rows; r++) {
    ctx.moveTo(0, r * cellSize);
    ctx.lineTo(cols * cellSize, r * cellSize);
  }
  ctx.stroke();
}

// ─── Layer: annotations ───────────────────────────────────────────────────────

function _drawAnnotations(zoom) {
  const isDm = viewMode === 'dm';
  for (const ann of state.annotations) {
    if (ann.dmOnly && !isDm) continue;
    if (ann.points.length < 2) continue;

    ctx.save();
    ctx.strokeStyle = ann.color;
    ctx.lineWidth   = ann.width / zoom;
    ctx.lineCap     = 'round';
    ctx.lineJoin    = 'round';
    if (ann.dmOnly && isDm) ctx.setLineDash([5 / zoom, 4 / zoom]);

    ctx.beginPath();
    ctx.moveTo(ann.points[0].x, ann.points[0].y);
    for (let i = 1; i < ann.points.length; i++) ctx.lineTo(ann.points[i].x, ann.points[i].y);
    ctx.stroke();
    ctx.restore();
  }
}

// ─── Layer: AoE shapes ────────────────────────────────────────────────────────

function _drawAoeShapes(zoom) {
  for (const shape of state.aoeShapes) _drawSingleAoe(shape, zoom);
}

function _drawSingleAoe(shape, zoom) {
  const { shapeType, col, row, size, angle, color, label } = shape;
  const cs = state.map.cellSize;
  const cx = (col + 0.5) * cs;
  const cy = (row + 0.5) * cs;
  const r  = size * cs;

  ctx.save();
  ctx.globalAlpha = 0.38;
  ctx.fillStyle   = color;
  ctx.strokeStyle = color;
  ctx.lineWidth   = 2 / zoom;
  ctx.setLineDash([6 / zoom, 4 / zoom]);

  switch (shapeType) {
    case 'circle':
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 0.85;
      ctx.stroke();
      break;

    case 'cone': {
      const half = Math.PI / 6;
      ctx.translate(cx, cy);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, r, -half, half);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 0.85;
      ctx.stroke();
      break;
    }

    case 'line': {
      const w = cs; // 5ft = 1 cell wide
      ctx.translate(cx, cy);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.rect(-w / 2, 0, w, r);
      ctx.fill();
      ctx.globalAlpha = 0.85;
      ctx.stroke();
      break;
    }

    case 'square': {
      ctx.translate(cx, cy);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.rect(-r / 2, -r / 2, r, r);
      ctx.fill();
      ctx.globalAlpha = 0.85;
      ctx.stroke();
      break;
    }
  }

  ctx.restore();
  ctx.setLineDash([]);

  // Label
  if (label) {
    ctx.globalAlpha = 1;
    ctx.fillStyle   = color;
    ctx.font        = `${Math.max(8, 13 / zoom)}px Cinzel, serif`;
    ctx.textAlign   = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(label, cx, cy - r - 4 / zoom);
  }
}

// ─── Layer: tokens ────────────────────────────────────────────────────────────

function _drawTokens(zoom) {
  const isDm = viewMode === 'dm';
  // Build quick lookup: tokenId → combatant (for active-turn ring + dead overlay)
  const combatantByToken = new Map();
  for (const c of state.combat.combatants) {
    if (c.tokenId) combatantByToken.set(c.tokenId, c);
  }
  const activeCombatant = state.combat.tIdx >= 0
    ? state.combat.combatants[state.combat.tIdx] ?? null : null;

  for (const token of state.tokens) {
    if ((token.hidden || token.invisible) && !isDm) continue;
    if (overlay.dragToken?.token?.id === token.id) continue;
    _drawSingleToken(token, token.col, token.row, zoom, isDm);
    const linked = combatantByToken.get(token.id);
    if (linked) _drawCombatOverlay(token, linked, activeCombatant, zoom);
  }
  if (overlay.dragToken) {
    const { token, col, row } = overlay.dragToken;
    ctx.globalAlpha = 0.75;
    _drawSingleToken(token, col, row, zoom, isDm);
    ctx.globalAlpha = 1;
  }
}

function _drawCombatOverlay(token, combatant, activeCombatant, zoom) {
  const cs  = state.map.cellSize;
  const tsz = token.size * cs;
  const cx  = (token.col + token.size / 2) * cs;
  const cy  = (token.row + token.size / 2) * cs;
  const rad = tsz / 2 + 5;

  const isActive = activeCombatant && combatant.id === activeCombatant.id;
  const isDead   = combatant.hp <= 0;

  if (isActive) {
    // Pulsing gold ring — use time-based opacity variation baked into a static pass
    // (true animation requires RAF loop; here we draw a bright solid ring instead)
    ctx.save();
    ctx.strokeStyle = '#ffe066';
    ctx.lineWidth   = 3 / zoom;
    ctx.shadowColor = '#ffe066';
    ctx.shadowBlur  = 10 / zoom;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.arc(cx, cy, rad, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  if (isDead) {
    // Skull overlay
    ctx.save();
    ctx.globalAlpha = 0.72;
    const fs = Math.max(10, tsz * 0.55);
    ctx.font = `${fs}px serif`;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('💀', cx, cy);
    ctx.restore();
  }
}

function _drawSingleToken(token, col, row, zoom, isDm) {
  const { size, color, name, imageData, tokenType, hidden, invisible } = token;
  const cs = state.map.cellSize;
  const x  = col * cs;
  const y  = row * cs;
  const tsz = size * cs;
  const cx  = x + tsz / 2;
  const cy  = y + tsz / 2;
  const rad = tsz / 2 - 2;

  const isGhost = (hidden || invisible) && isDm;

  ctx.save();
  if (isGhost) ctx.globalAlpha = 0.42;

  // Drop shadow
  ctx.shadowColor = 'rgba(0,0,0,0.55)';
  ctx.shadowBlur  = 8 / zoom;

  // Colored ring
  ctx.beginPath();
  ctx.arc(cx, cy, rad + 3, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();

  ctx.shadowBlur = 0;

  // Clip to circle for face
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, rad, 0, Math.PI * 2);
  ctx.clip();

  if (imageData && token._img) {
    ctx.drawImage(token._img, x + 2, y + 2, tsz - 4, tsz - 4);
  } else {
    const bg = tokenType === 'player' ? '#1b4d6e'
             : tokenType === 'monster' ? '#6e1b1b'
             : '#3a5a3a';
    ctx.fillStyle = bg;
    ctx.fillRect(x, y, tsz, tsz);

    const fs = Math.max(9, rad * 0.92);
    ctx.font = `700 ${fs}px 'Segoe UI', Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.55)';
    ctx.shadowBlur  = 3 / zoom;
    ctx.fillStyle = '#ffffff';
    ctx.fillText((name || '?')[0].toUpperCase(), cx, cy);
    ctx.shadowBlur = 0;
  }
  ctx.restore(); // end clip

  // Name label
  const lblSize = Math.max(7, 10 / zoom);
  ctx.font = `${lblSize}px Cinzel, serif`;
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'top';
  const lblY = y + tsz + 2;
  ctx.strokeStyle = 'rgba(0,0,0,0.8)';
  ctx.lineWidth   = 2.5 / zoom;
  ctx.strokeText(name, cx, lblY);
  ctx.fillStyle = isGhost ? 'rgba(200,160,255,0.9)' : '#f5f0e1';
  ctx.fillText(name, cx, lblY);

  // Height badge
  if (token.height !== 0) {
    const arrow = token.height > 0 ? '▲' : '▼';
    const badge = `${arrow} ${Math.abs(token.height)}ft`;
    const bSize = Math.max(7, 9 / zoom);
    ctx.font = `700 ${bSize}px 'Segoe UI', Arial, sans-serif`;
    const bw = ctx.measureText(badge).width + 6 / zoom;
    const bh = bSize + 4 / zoom;
    const bx = cx - bw / 2;
    const by = y - bh - 4 / zoom;
    ctx.fillStyle = 'rgba(0,0,0,0.72)';
    ctx.beginPath();
    ctx.roundRect(bx, by, bw, bh, 2 / zoom);
    ctx.fill();
    ctx.fillStyle = token.height > 0 ? '#a0e8ff' : '#ffb0b0';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(badge, cx, by + bh / 2);
  }

  // DM indicator icons
  if (isDm) {
    const iconSize = Math.max(7, 11 / zoom);
    ctx.font = `${iconSize}px serif`;
    if (invisible) {
      ctx.globalAlpha = 0.9;
      ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      ctx.fillText('👁', x + 1, y + 1);
    }
    if (hidden) {
      ctx.globalAlpha = 0.9;
      ctx.textAlign = 'right'; ctx.textBaseline = 'top';
      ctx.fillText('🙈', x + tsz - 1, y + 1);
    }
  }

  ctx.restore();
}

// ─── Layer: hover highlight ───────────────────────────────────────────────────

function _drawHoverHighlight() {
  if (!overlay.hoverCell) return;
  const { col, row } = overlay.hoverCell;
  const cs = state.map.cellSize;
  ctx.fillStyle = 'rgba(255,255,255,0.07)';
  ctx.fillRect(col * cs, row * cs, cs, cs);
}

// ─── Layer: selection ring ────────────────────────────────────────────────────

function _drawSelectionRing(zoom) {
  if (!overlay.selectedId) return;

  const token = state.tokens.find(t => t.id === overlay.selectedId);
  if (token) {
    const cs  = state.map.cellSize;
    const tsz = token.size * cs;
    const cx  = (token.col + token.size / 2) * cs;
    const cy  = (token.row + token.size / 2) * cs;
    ctx.save();
    ctx.strokeStyle = '#ffe066';
    ctx.lineWidth   = 2.5 / zoom;
    ctx.setLineDash([6 / zoom, 4 / zoom]);
    ctx.beginPath();
    ctx.arc(cx, cy, tsz / 2 + 4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    return;
  }

  const aoe = state.aoeShapes.find(s => s.id === overlay.selectedId);
  if (aoe) {
    const cs = state.map.cellSize;
    const cx = (aoe.col + 0.5) * cs;
    const cy = (aoe.row + 0.5) * cs;
    ctx.save();
    ctx.strokeStyle = '#ffe066';
    ctx.lineWidth   = 2 / zoom;
    ctx.setLineDash([5 / zoom, 4 / zoom]);
    ctx.beginPath();
    ctx.arc(cx, cy, 10 / zoom, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}

// ─── Layer: ruler ─────────────────────────────────────────────────────────────

function _drawRuler(zoom) {
  if (!overlay.ruler) return;
  const { x1, y1, x2, y2 } = overlay.ruler;
  const cs = state.map.cellSize;

  ctx.save();
  ctx.strokeStyle = '#ffe066';
  ctx.lineWidth   = 2 / zoom;
  ctx.setLineDash([6 / zoom, 4 / zoom]);
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();

  // Start/end dots
  ctx.setLineDash([]);
  ctx.fillStyle = '#ffe066';
  ctx.beginPath(); ctx.arc(x1, y1, 4 / zoom, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x2, y2, 4 / zoom, 0, Math.PI * 2); ctx.fill();
  ctx.restore();

  // Distance label (drawn in screen space via reset transform)
  const dx = x2 - x1, dy = y2 - y1;
  const dist = Math.sqrt(dx * dx + dy * dy) / cs;
  const ft   = Math.round(dist * state.settings.scale);
  const { panX, panY } = state.viewport;
  const sx = x2 * zoom + panX;
  const sy = y2 * zoom + panY;

  // Draw outside transform — save/restore already done, need to reset transform
  ctx.save();
  ctx.resetTransform();
  ctx.fillStyle = 'rgba(0,0,0,0.75)';
  ctx.beginPath();
  ctx.roundRect(sx + 8, sy - 14, 70, 20, 4);
  ctx.fill();
  ctx.fillStyle = '#ffe066';
  ctx.font = '700 11px Cinzel, serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${ft} ft (${dist.toFixed(1)}sq)`, sx + 12, sy - 4);
  ctx.restore();
}
