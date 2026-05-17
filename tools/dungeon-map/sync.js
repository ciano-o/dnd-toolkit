// sync.js — BroadcastChannel-based sync between DM window and Player window.

import { serialize, applyState } from './state.js';
import { preloadTokenImages } from './tokens.js';
import { render, overlay } from './renderer.js';

const CHANNEL_NAME = 'dnd-dungeon-map-sync';
let channel = null;

export function initSync(viewMode) {
  try { channel = new BroadcastChannel(CHANNEL_NAME); }
  catch { console.warn('BroadcastChannel not supported — sync disabled'); return; }

  if (viewMode === 'player') {
    channel.onmessage = e => {
      if (e.data?.type === 'STATE_UPDATE') {
        applyState(e.data.payload, { silent: true });
        preloadTokenImages();
        render();
      }
      // Ruler is ephemeral — synced separately so player sees DM measurements
      if (e.data?.type === 'RULER_UPDATE') {
        overlay.ruler = e.data.ruler;
        render();
      }
    };
  }
}

/** Broadcast full state to open player windows. Call after every mutation. */
export function broadcast() {
  if (!channel) return;
  try { channel.postMessage({ type: 'STATE_UPDATE', payload: serialize() }); }
  catch (e) { console.warn('Broadcast failed:', e); }
}

/** Broadcast ruler overlay only (lightweight, called on every mousemove during ruler tool). */
export function broadcastRuler(ruler) {
  if (!channel) return;
  try { channel.postMessage({ type: 'RULER_UPDATE', ruler }); }
  catch (e) { /* silent */ }
}
