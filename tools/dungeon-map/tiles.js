// tiles.js — Tile type registry.
// Each tile: { label, fill, stroke, drawFn(ctx, x, y, cellSize) }

// ─── Draw helpers ─────────────────────────────────────────────────────────────

function drawWater(ctx, x, y, s) {
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 3; i++) {
    const wy = y + s * 0.22 + i * (s * 0.28);
    ctx.beginPath();
    for (let wx = x + 2; wx < x + s - 2; wx += 6) {
      ctx.moveTo(wx, wy);
      ctx.quadraticCurveTo(wx + 3, wy - 4, wx + 6, wy);
    }
    ctx.stroke();
  }
}

function drawLava(ctx, x, y, s) {
  ctx.strokeStyle = 'rgba(255,220,0,0.55)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x + s * 0.2, y + s * 0.3);
  ctx.lineTo(x + s * 0.45, y + s * 0.6);
  ctx.lineTo(x + s * 0.7, y + s * 0.35);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + s * 0.35, y + s * 0.7);
  ctx.lineTo(x + s * 0.6, y + s * 0.5);
  ctx.stroke();
}

function drawPit(ctx, x, y, s) {
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 1;
  for (let i = -s; i < s * 2; i += 10) {
    ctx.beginPath();
    ctx.moveTo(x + i, y);
    ctx.lineTo(x + i + s, y + s);
    ctx.stroke();
  }
}

function drawDifficult(ctx, x, y, s) {
  ctx.strokeStyle = 'rgba(100,60,10,0.45)';
  ctx.lineWidth = 1;
  const step = s / 4;
  for (let i = 0; i <= 4; i++) {
    ctx.beginPath(); ctx.moveTo(x + i * step, y); ctx.lineTo(x, y + i * step); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x + s, y + i * step); ctx.lineTo(x + i * step, y + s); ctx.stroke();
  }
}

function drawDoorClosed(ctx, x, y, s) {
  const p = s * 0.14;
  ctx.fillStyle = '#c89a40';
  ctx.fillRect(x + p, y + p, s - p * 2, s - p * 2);
  ctx.strokeStyle = '#5a3a10';
  ctx.lineWidth = 2;
  ctx.strokeRect(x + p, y + p, s - p * 2, s - p * 2);
  // Handle
  ctx.beginPath();
  ctx.arc(x + s * 0.65, y + s * 0.5, s * 0.07, 0, Math.PI * 2);
  ctx.fillStyle = '#3a2008';
  ctx.fill();
}

function drawDoorOpen(ctx, x, y, s) {
  const p = s * 0.14;
  const pw = s * 0.14;
  ctx.fillStyle = '#c89a40';
  ctx.strokeStyle = '#5a3a10';
  ctx.lineWidth = 2;
  // Door panel on left side (swung open)
  ctx.beginPath();
  ctx.rect(x + p, y + p, pw, s - p * 2);
  ctx.fill(); ctx.stroke();
  // Doorway (open arch hint)
  ctx.strokeStyle = 'rgba(0,0,0,0.3)';
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 3]);
  ctx.beginPath();
  ctx.rect(x + p + pw + 2, y + p, s - p * 2 - pw - 4, s - p * 2);
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawStairs(ctx, x, y, s, up) {
  const steps = 5;
  const totalH = s * 0.68;
  const stepH = totalH / steps;
  const oy = up ? y + s * 0.16 : y + s * 0.16;
  ctx.strokeStyle = 'rgba(0,0,0,0.45)';
  ctx.lineWidth = 1;
  for (let i = 0; i < steps; i++) {
    const frac = up ? (steps - i) / steps : (i + 1) / steps;
    const sw = s * 0.7 * frac;
    const sx = x + (s - sw) / 2;
    const sy = oy + i * stepH;
    ctx.fillStyle = `rgba(0,0,0,${0.05 + 0.04 * i})`;
    ctx.fillRect(sx, sy, sw, stepH);
    ctx.strokeRect(sx, sy, sw, stepH);
  }
  // Arrow indicator
  ctx.fillStyle = '#1a1410';
  const ax = x + s / 2, ay = up ? y + s * 0.88 : y + s * 0.12;
  const dir = up ? -1 : 1;
  ctx.beginPath();
  ctx.moveTo(ax, ay); ctx.lineTo(ax - s * 0.1, ay + dir * s * 0.13); ctx.lineTo(ax + s * 0.1, ay + dir * s * 0.13);
  ctx.closePath(); ctx.fill();
}

function drawSecretDoor(ctx, x, y, s) {
  // In DM view, faint purple 'S' marker on wall tile
  ctx.fillStyle = 'rgba(190,80,220,0.7)';
  ctx.font = `bold ${Math.max(10, s * 0.38)}px Cinzel, serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('S', x + s / 2, y + s / 2);
}

// ─── Registry ─────────────────────────────────────────────────────────────────

export const TILES = {
  floor:          { label: 'Floor',         fill: '#d8cba8', stroke: '#b8a880' },
  wall:           { label: 'Wall',          fill: '#2e2820', stroke: '#1a1410' },
  void:           { label: 'Void',          fill: null,      stroke: null      },
  stone:          { label: 'Stone',         fill: '#787070', stroke: '#555050' },
  dirt:           { label: 'Dirt',          fill: '#9b7838', stroke: '#7a5c24' },
  water:          { label: 'Water',         fill: '#3a6fa0', stroke: '#2a5070', drawFn: drawWater },
  lava:           { label: 'Lava',          fill: '#c84000', stroke: '#8b2000', drawFn: drawLava },
  pit:            { label: 'Pit',           fill: '#111',    stroke: '#000',    drawFn: drawPit },
  difficult:      { label: 'Difficult',     fill: '#d8cba8', stroke: '#b8a880', drawFn: drawDifficult },
  'door-closed':  { label: 'Door',          fill: '#d4a940', stroke: '#8b6914', drawFn: drawDoorClosed },
  'door-open':    { label: 'Door (open)',   fill: '#d4a940', stroke: '#8b6914', drawFn: drawDoorOpen },
  'stairs-up':    { label: 'Stairs ↑',     fill: '#d8cba8', stroke: '#b8a880', drawFn: (c,x,y,s) => drawStairs(c,x,y,s,true)  },
  'stairs-down':  { label: 'Stairs ↓',     fill: '#d8cba8', stroke: '#b8a880', drawFn: (c,x,y,s) => drawStairs(c,x,y,s,false) },
  'secret-door':  { label: 'Secret Door',  fill: '#2e2820', stroke: '#1a1410', drawFn: drawSecretDoor, dmOnly: true },
};

/** Ordered list for the palette UI */
export const TILE_PALETTE_ORDER = [
  'floor','wall','void','stone','dirt',
  'water','lava','pit','difficult',
  'door-closed','door-open','stairs-up','stairs-down','secret-door',
];

/**
 * Draw a single tile at pixel position (x, y).
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} tileKey
 * @param {number} x   pixel x (top-left)
 * @param {number} y   pixel y (top-left)
 * @param {number} cellSize
 * @param {boolean} isDmView  secret doors render as wall in player view
 */
/**
 * Returns true if the tile key is a custom hex color (e.g. '#ff6633').
 */
export function isCustomColor(key) {
  return typeof key === 'string' && key.startsWith('#');
}

export function drawTile(ctx, tileKey, x, y, cellSize, isDmView = true) {
  // Custom hex color tile — just fill with that color
  if (isCustomColor(tileKey)) {
    ctx.fillStyle = tileKey;
    ctx.fillRect(x, y, cellSize, cellSize);
    return;
  }

  const tile = TILES[tileKey] ?? TILES.floor;

  // Secret door: show as wall in player view
  if (tileKey === 'secret-door' && !isDmView) {
    drawTile(ctx, 'wall', x, y, cellSize, isDmView);
    return;
  }

  if (tile.fill) {
    ctx.fillStyle = tile.fill;
    ctx.fillRect(x, y, cellSize, cellSize);
  }

  if (tile.drawFn) {
    tile.drawFn(ctx, x, y, cellSize);
  }
}

/**
 * Toggle a door tile between open and closed.
 * Returns the new tile type.
 */
export function toggleDoor(currentTile) {
  if (currentTile === 'door-closed') return 'door-open';
  if (currentTile === 'door-open')   return 'door-closed';
  return currentTile;
}
