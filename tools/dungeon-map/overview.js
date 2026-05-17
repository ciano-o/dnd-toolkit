// overview.js — Dungeon Overview: node-graph view of all chambers.

import { state, createChamber, switchChamber, addConnection, removeConnection,
         updateChamberOverviewPos } from './state.js';
import { showForm } from './dialog.js';

// ─── Overview viewport (independent from map viewport) ────────────────────────

export const ovViewport = { panX: 0, panY: 0, zoom: 1.0 };

// ─── Node layout constants ────────────────────────────────────────────────────

const NODE_W = 160;
const NODE_H = 80;

// ─── State for interaction ────────────────────────────────────────────────────

let _dragNode    = null;  // { id, offX, offY }
let _connectFrom = null;  // chamberId we started dragging from
let _connectEndX = 0;
let _connectEndY = 0;
let _hoverNode   = null;  // chamberId currently hovered

// ─── Coordinate helpers ───────────────────────────────────────────────────────

function ovToScreen(wx, wy) {
  return { x: wx * ovViewport.zoom + ovViewport.panX, y: wy * ovViewport.zoom + ovViewport.panY };
}
function screenToOv(sx, sy) {
  return { x: (sx - ovViewport.panX) / ovViewport.zoom, y: (sy - ovViewport.panY) / ovViewport.zoom };
}

// ─── Auto-layout (used when a chamber has no overview position yet) ───────────

function _ensurePositions() {
  const cols = Math.ceil(Math.sqrt(state.chambers.length));
  state.chambers.forEach((c, i) => {
    if (!c.overview) {
      c.overview = {
        x: 40 + (i % cols) * (NODE_W + 60),
        y: 40 + Math.floor(i / cols) * (NODE_H + 60),
      };
    }
  });
}

// ─── Hit testing ──────────────────────────────────────────────────────────────

function _nodeAt(wx, wy) {
  for (const c of state.chambers) {
    const nx = c.overview?.x ?? 0;
    const ny = c.overview?.y ?? 0;
    if (wx >= nx && wx <= nx + NODE_W && wy >= ny && wy <= ny + NODE_H) return c;
  }
  return null;
}

function _connectionAt(wx, wy) {
  for (const conn of state.connections) {
    const from = state.chambers.find(c => c.id === conn.from);
    const to   = state.chambers.find(c => c.id === conn.to);
    if (!from?.overview || !to?.overview) continue;
    const fx = from.overview.x + NODE_W / 2;
    const fy = from.overview.y + NODE_H / 2;
    const tx = to.overview.x   + NODE_W / 2;
    const ty = to.overview.y   + NODE_H / 2;
    // Distance from point to line segment
    const dx = tx - fx, dy = ty - fy;
    const len2 = dx * dx + dy * dy;
    if (len2 === 0) continue;
    const t = Math.max(0, Math.min(1, ((wx - fx) * dx + (wy - fy) * dy) / len2));
    const nearX = fx + t * dx, nearY = fy + t * dy;
    const dist = Math.sqrt((wx - nearX) ** 2 + (wy - nearY) ** 2);
    if (dist < 10) return conn;
  }
  return null;
}

// ─── Draw ─────────────────────────────────────────────────────────────────────

const CONN_COLORS = { door: '#d4a940', stairs: '#6699ff', passage: '#aaaaaa', secret: '#cc66ff' };

export function drawOverview(ctx, canvas) {
  _ensurePositions();
  const { zoom, panX, panY } = ovViewport;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Dark background with subtle grid
  ctx.fillStyle = '#0d0d0d';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  _drawGrid(ctx, canvas, zoom, panX, panY);

  ctx.save();
  ctx.setTransform(zoom, 0, 0, zoom, panX, panY);

  // Draw connections
  for (const conn of state.connections) _drawConnection(ctx, conn, zoom);

  // Connection preview while dragging
  if (_connectFrom) {
    const fc = state.chambers.find(c => c.id === _connectFrom);
    if (fc?.overview) {
      const fx = fc.overview.x + NODE_W / 2;
      const fy = fc.overview.y + NODE_H / 2;
      ctx.save();
      ctx.strokeStyle = 'rgba(212,169,64,0.55)';
      ctx.lineWidth = 2 / zoom;
      ctx.setLineDash([6 / zoom, 4 / zoom]);
      ctx.beginPath();
      ctx.moveTo(fx, fy);
      ctx.lineTo(_connectEndX, _connectEndY);
      ctx.stroke();
      ctx.restore();
    }
  }

  // Draw nodes
  for (const chamber of state.chambers) _drawNode(ctx, chamber, zoom);

  ctx.restore();

  // Hint text
  ctx.save();
  ctx.resetTransform();
  ctx.font = '700 11px Cinzel, serif';
  ctx.fillStyle = 'rgba(180,140,60,0.45)';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'bottom';
  ctx.fillText('Drag nodes to reposition  •  Shift-drag node → another node to connect  •  Right-click connection to delete  •  Double-click to enter chamber', 10, canvas.height - 8);
  ctx.restore();
}

function _drawGrid(ctx, canvas, zoom, panX, panY) {
  const step = 60 * zoom;
  const offX = ((panX % step) + step) % step;
  const offY = ((panY % step) + step) % step;
  ctx.strokeStyle = 'rgba(255,255,255,0.04)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = offX; x < canvas.width;  x += step) { ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); }
  for (let y = offY; y < canvas.height; y += step) { ctx.moveTo(0, y); ctx.lineTo(canvas.width,  y); }
  ctx.stroke();
}

function _drawConnection(ctx, conn, zoom) {
  const from = state.chambers.find(c => c.id === conn.from);
  const to   = state.chambers.find(c => c.id === conn.to);
  if (!from?.overview || !to?.overview) return;

  const fx = from.overview.x + NODE_W / 2, fy = from.overview.y + NODE_H / 2;
  const tx = to.overview.x   + NODE_W / 2, ty = to.overview.y   + NODE_H / 2;
  const color = CONN_COLORS[conn.type] ?? CONN_COLORS.door;

  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2 / zoom;
  ctx.globalAlpha = 0.75;

  // Cubic bezier
  const cpX = (fx + tx) / 2, cpY = (fy + ty) / 2 - 30;
  ctx.beginPath();
  ctx.moveTo(fx, fy);
  ctx.quadraticCurveTo(cpX, cpY, tx, ty);
  ctx.stroke();

  // Arrowhead
  const angle = Math.atan2(ty - cpY, tx - cpX);
  const as = 10 / zoom;
  ctx.globalAlpha = 0.9;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(tx, ty);
  ctx.lineTo(tx - as * Math.cos(angle - 0.4), ty - as * Math.sin(angle - 0.4));
  ctx.lineTo(tx - as * Math.cos(angle + 0.4), ty - as * Math.sin(angle + 0.4));
  ctx.closePath();
  ctx.fill();

  // Label
  if (conn.label) {
    ctx.globalAlpha = 0.85;
    ctx.fillStyle = color;
    ctx.font = `${Math.max(9, 11 / zoom)}px Cinzel, serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(conn.label, cpX, cpY - 2 / zoom);
  }

  // Type badge
  const midX = (fx * 0.25 + tx * 0.75), midY = (fy * 0.25 + ty * 0.75);
  ctx.globalAlpha = 0.5;
  ctx.font = `${Math.max(7, 9 / zoom)}px Cinzel, serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = color;
  ctx.fillText(conn.type, midX, midY);

  ctx.restore();
}

function _drawNode(ctx, chamber, zoom) {
  const x = chamber.overview?.x ?? 0;
  const y = chamber.overview?.y ?? 0;
  const isActive  = chamber.id === state.activeChamber;
  const isHovered = chamber.id === _hoverNode;

  ctx.save();

  // Shadow
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowBlur  = 14 / zoom;

  // Background
  ctx.fillStyle = isActive ? '#1e1a14' : '#18140f';
  ctx.beginPath();
  ctx.roundRect(x, y, NODE_W, NODE_H, 8 / zoom);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Border
  ctx.strokeStyle = isActive ? '#d4a940' : (isHovered ? 'rgba(212,169,64,0.5)' : '#3a3228');
  ctx.lineWidth   = (isActive ? 2.5 : 1.5) / zoom;
  ctx.stroke();

  // Active indicator dot
  if (isActive) {
    ctx.fillStyle = '#d4a940';
    ctx.beginPath();
    ctx.arc(x + NODE_W - 12 / zoom, y + 12 / zoom, 4 / zoom, 0, Math.PI * 2);
    ctx.fill();
  }

  // Name
  ctx.fillStyle = isActive ? '#d4a940' : '#f5f0e1';
  ctx.font      = `${isActive ? '700' : '600'} ${Math.max(10, 14 / zoom)}px Cinzel, serif`;
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(chamber.name, x + NODE_W / 2, y + NODE_H / 2, NODE_W - 16 / zoom);

  ctx.restore();
}

// ─── Interaction handlers (called from ui.js) ─────────────────────────────────

export function ovPointerDown(sx, sy, shiftKey, onSwitchChamber, onAddChamber) {
  const w = screenToOv(sx, sy);
  const node = _nodeAt(w.x, w.y);

  if (node && shiftKey) {
    // Start connection drag
    _connectFrom = node.id;
    _connectEndX = w.x;
    _connectEndY = w.y;
    return;
  }

  if (node) {
    _dragNode = { id: node.id, offX: w.x - node.overview.x, offY: w.y - node.overview.y };
    return;
  }
}

export function ovPointerMove(sx, sy) {
  const w = screenToOv(sx, sy);
  const node = _nodeAt(w.x, w.y);
  _hoverNode = node?.id ?? null;

  if (_connectFrom) {
    _connectEndX = w.x;
    _connectEndY = w.y;
    return true; // needs redraw
  }

  if (_dragNode) {
    const c = state.chambers.find(c => c.id === _dragNode.id);
    if (c) updateChamberOverviewPos(c.id, w.x - _dragNode.offX, w.y - _dragNode.offY);
    return true;
  }

  return !!node; // redraw if hovering a node (border highlight)
}

export async function ovPointerUp(sx, sy, onSwitchChamber) {
  const w = screenToOv(sx, sy);

  if (_connectFrom) {
    const target = _nodeAt(w.x, w.y);
    if (target && target.id !== _connectFrom) {
      const types = ['door', 'stairs', 'passage', 'secret'];
      const result = await showForm('Add Connection', [
        { name: 'label', label: 'Label (optional)', type: 'text', value: '' },
        { name: 'type',  label: 'Type', type: 'select', value: 'door',
          options: types.map(t => ({ value: t, label: t.charAt(0).toUpperCase() + t.slice(1) })) },
      ]);
      if (result) {
        const type = types.includes(result.type) ? result.type : 'door';
        addConnection(_connectFrom, target.id, result.label.trim(), type);
      }
    }
    _connectFrom = null;
    return;
  }

  _dragNode = null;
}

export function ovDblClick(sx, sy, onSwitchChamber) {
  const w = screenToOv(sx, sy);
  const node = _nodeAt(w.x, w.y);
  if (node) onSwitchChamber(node.id);
}

export function ovRightClick(sx, sy) {
  const w = screenToOv(sx, sy);
  const conn = _connectionAt(w.x, w.y);
  if (conn && confirm(`Delete connection "${conn.label || conn.type}"?`)) {
    removeConnection(conn.id);
    return true;
  }
  return false;
}

export function ovWheel(sx, sy, deltaY) {
  const factor = deltaY < 0 ? 1.1 : 0.91;
  const newZoom = Math.max(0.2, Math.min(3.0, ovViewport.zoom * factor));
  ovViewport.panX = sx - (sx - ovViewport.panX) * (newZoom / ovViewport.zoom);
  ovViewport.panY = sy - (sy - ovViewport.panY) * (newZoom / ovViewport.zoom);
  ovViewport.zoom = newZoom;
}

export function ovPan(dx, dy) {
  ovViewport.panX += dx;
  ovViewport.panY += dy;
}

export function resetConnectState() {
  _connectFrom = null;
  _dragNode    = null;
}
