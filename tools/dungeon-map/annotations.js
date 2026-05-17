// annotations.js — Freehand annotation (pen) tool logic.

import { beginAnnotation, pushAnnotationPoint, finalizeAnnotation, clearAnnotations } from './state.js';
import { screenToWorld, render } from './renderer.js';

let _activeId = null;

/** Start a new stroke on mousedown. */
export function penDown(sx, sy) {
  const w  = screenToWorld(sx, sy);
  const color   = document.getElementById('draw-color')?.value  ?? '#ff3333';
  const width   = parseInt(document.getElementById('draw-width')?.value ?? '3', 10);
  const dmOnly  = document.getElementById('draw-dm-only')?.checked ?? false;

  _activeId = beginAnnotation(color, width, dmOnly);
  pushAnnotationPoint(_activeId, w.x, w.y);
  render();
}

/** Add point to current stroke on mousemove (while button held). */
export function penMove(sx, sy) {
  if (!_activeId) return;
  const w = screenToWorld(sx, sy);
  pushAnnotationPoint(_activeId, w.x, w.y);
  render();
}

/** Finish the current stroke on mouseup. */
export function penUp() {
  if (!_activeId) return;
  finalizeAnnotation(_activeId);
  _activeId = null;
}

/** Wire up the Clear annotations button (called during init). */
export function initAnnotationsPanel(toastFn) {
  const btn = document.getElementById('btn-clear-ann');
  if (!btn) return;
  btn.addEventListener('click', () => {
    clearAnnotations();
    toastFn('Annotations cleared');
    render();
  });
}
