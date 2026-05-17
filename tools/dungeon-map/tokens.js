// tokens.js — Token dialog management, sidebar list rendering, image preload.

import { state, addToken, updateToken, removeToken } from './state.js';
import { overlay, render } from './renderer.js';

// ─── Image cache ──────────────────────────────────────────────────────────────

/** Load HTMLImageElements for any token that has imageData but no _img yet. */
export function preloadTokenImages() {
  for (const token of state.tokens) {
    if (token.imageData && !token._img) _loadImg(token);
  }
}

function _loadImg(token) {
  const img = new Image();
  img.onload = () => { token._img = img; render(); };
  img.src = token.imageData;
}

// ─── Hit testing ──────────────────────────────────────────────────────────────

/**
 * Return the topmost token whose grid area contains the given world pixel (wx, wy).
 */
export function tokenAtWorld(wx, wy) {
  const cs = state.map.cellSize;
  // Iterate in reverse so top-rendered token wins
  for (let i = state.tokens.length - 1; i >= 0; i--) {
    const t = state.tokens[i];
    const x = t.col * cs, y = t.row * cs;
    const sz = t.size * cs;
    if (wx >= x && wx < x + sz && wy >= y && wy < y + sz) return t;
  }
  return null;
}

// ─── Token dialog ─────────────────────────────────────────────────────────────

let _editingId    = null;
let _pendingCol   = 0;
let _pendingRow   = 0;
let _pendingImgB64 = null;
let _onSaved      = null;  // callback(token)

const modal      = () => document.getElementById('token-modal');
const inp        = id  => document.getElementById(id);

export function openAddTokenDialog(col, row, onSaved) {
  _editingId    = null;
  _pendingCol   = col;
  _pendingRow   = row;
  _pendingImgB64 = null;
  _onSaved      = onSaved;

  inp('tok-name').value   = '';
  inp('tok-type').value   = 'monster';
  inp('tok-size').value   = '1';
  inp('tok-color').value  = '#8b1a1a';
  inp('tok-height').value = '0';
  inp('tok-image').value  = '';
  inp('tok-del').style.display = 'none';
  document.getElementById('token-modal-title').textContent = 'Add Token';

  _pendingImgB64 = null;
  modal().classList.add('open');
}

export function openEditTokenDialog(token, onSaved) {
  _editingId    = token.id;
  _pendingCol   = token.col;
  _pendingRow   = token.row;
  _pendingImgB64 = token.imageData ?? null;
  _onSaved      = onSaved;

  inp('tok-name').value   = token.name;
  inp('tok-type').value   = token.tokenType;
  inp('tok-size').value   = String(token.size);
  inp('tok-color').value  = token.color;
  inp('tok-height').value = String(token.height ?? 0);
  inp('tok-image').value  = '';
  inp('tok-del').style.display = 'inline-flex';
  document.getElementById('token-modal-title').textContent = 'Edit Token';

  modal().classList.add('open');
}

export function closeTokenDialog() {
  modal().classList.remove('open');
  _editingId = null;
  _pendingImgB64 = null;
}

export function initTokenDialog(refreshFn) {
  // Image preview — read file when selected
  inp('tok-image').addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) { _pendingImgB64 = null; return; }
    const reader = new FileReader();
    reader.onload = ev => { _pendingImgB64 = ev.target.result; };
    reader.readAsDataURL(file);
  });

  // Cancel
  inp('tok-cancel').addEventListener('click', closeTokenDialog);

  // Backdrop click
  modal().addEventListener('click', e => { if (e.target === modal()) closeTokenDialog(); });

  // Delete
  inp('tok-del').addEventListener('click', () => {
    if (!_editingId) return;
    if (overlay.selectedId === _editingId) overlay.selectedId = null;
    removeToken(_editingId);
    closeTokenDialog();
    refreshFn();
  });

  // Save
  inp('tok-save').addEventListener('click', () => {
    const name = inp('tok-name').value.trim() || 'Token';
    const data = {
      name,
      tokenType:  inp('tok-type').value,
      size:       parseInt(inp('tok-size').value, 10),
      color:      inp('tok-color').value,
      height:     parseInt(inp('tok-height').value, 10) || 0,
      imageData:  _pendingImgB64,
      col:        _pendingCol,
      row:        _pendingRow,
    };

    let token;
    if (_editingId) {
      updateToken(_editingId, data);
      token = state.tokens.find(t => t.id === _editingId);
    } else {
      token = addToken(data);
    }

    // Reload image if changed
    if (token.imageData) _loadImg(token);
    else token._img = null;

    closeTokenDialog();
    refreshFn();
    if (_onSaved) _onSaved(token);
  });
}

// ─── Sidebar token list ───────────────────────────────────────────────────────

export function renderTokenList(onSelect) {
  const list = document.getElementById('token-list');
  if (!list) return;

  list.innerHTML = '';
  for (const token of state.tokens) {
    const row = document.createElement('div');
    row.className = 'tok-row' + (overlay.selectedId === token.id ? ' sel' : '');
    row.dataset.id = token.id;

    // Dot (color swatch / mini portrait)
    const dot = document.createElement('div');
    dot.className  = 'tok-dot';
    dot.style.background = token.color;
    if (token._img) {
      const img = document.createElement('img');
      img.src   = token.imageData;
      img.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:50%';
      dot.appendChild(img);
    } else {
      dot.textContent = (token.name || '?')[0].toUpperCase();
    }

    // Info
    const info = document.createElement('div');
    info.className = 'tok-info';
    const nm = document.createElement('div');
    nm.className = 'tok-name'; nm.textContent = token.name;
    const tp = document.createElement('div');
    tp.className = 'tok-type'; tp.textContent = token.tokenType;
    info.append(nm, tp);

    // Flags
    const flags = document.createElement('div');
    flags.className = 'tok-flags';

    const btnH = document.createElement('button');
    btnH.className = 'flag-btn' + (token.hidden ? ' on' : '');
    btnH.title = 'Hidden (not shown to players)';
    btnH.textContent = '🙈';
    btnH.addEventListener('click', e => {
      e.stopPropagation();
      updateToken(token.id, { hidden: !token.hidden });
      renderTokenList(onSelect);
    });

    const btnI = document.createElement('button');
    btnI.className = 'flag-btn' + (token.invisible ? ' on' : '');
    btnI.title = 'Invisible (ghost in DM view)';
    btnI.textContent = '👁';
    btnI.addEventListener('click', e => {
      e.stopPropagation();
      updateToken(token.id, { invisible: !token.invisible });
      renderTokenList(onSelect);
    });

    // Delete button
    const btnDel = document.createElement('button');
    btnDel.className = 'flag-btn';
    btnDel.title = 'Remove token';
    btnDel.textContent = '🗑';
    btnDel.style.opacity = '0.35';
    btnDel.addEventListener('click', e => {
      e.stopPropagation();
      if (overlay.selectedId === token.id) overlay.selectedId = null;
      removeToken(token.id);
      renderTokenList(onSelect);
      render();
    });

    flags.append(btnH, btnI, btnDel);
    row.append(dot, info, flags);

    row.addEventListener('click', () => {
      overlay.selectedId = token.id;
      renderTokenList(onSelect);
      render();
      if (onSelect) onSelect(token);
    });

    list.appendChild(row);
  }
}
