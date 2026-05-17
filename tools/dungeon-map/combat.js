// combat.js — Combat tracker logic for the Dungeon Map tool.
// Pure state + helpers — no DOM. All rendering done in ui.js.

import { state } from './state.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function _id() { return `cb-${++state.combat.idN}`; }

function _find(id) { return state.combat.combatants.find(c => c.id === id); }

// ─── CRUD ─────────────────────────────────────────────────────────────────────

export function addCombatant(partial) {
  const c = {
    name:        'Unknown',
    initiative:  0,
    ac:          10,
    hp:          10,
    maxHp:       10,
    tempHp:      0,
    type:        'monster',   // 'player' | 'monster' | 'npc'
    conditions:  new Set(),
    saves:       new Set(),   // 'death-s1','death-s2','death-s3','death-f1','death-f2','death-f3'
    exhaustion:  0,
    tokenId:     null,        // linked map token id
    ...partial,
    id: _id(),
  };
  if (!(c.conditions instanceof Set)) c.conditions = new Set(Array.isArray(c.conditions) ? c.conditions : []);
  if (!(c.saves      instanceof Set)) c.saves      = new Set(Array.isArray(c.saves)      ? c.saves      : []);
  state.combat.combatants.push(c);
  return c;
}

export function removeCombatant(id) {
  const i = state.combat.combatants.findIndex(c => c.id === id);
  if (i === -1) return;
  if (state.combat.tIdx >= i && state.combat.tIdx > 0) state.combat.tIdx--;
  state.combat.combatants.splice(i, 1);
  if (state.combat.selId === id) state.combat.selId = null;
}

export function updateCombatant(id, changes) {
  const c = _find(id);
  if (!c) return;
  Object.assign(c, changes);
}

// ─── HP management ────────────────────────────────────────────────────────────

export function damageCombatant(id, amount) {
  const c = _find(id);
  if (!c) return;
  amount = Math.max(0, amount);
  if (c.tempHp > 0) {
    const absorbed = Math.min(c.tempHp, amount);
    c.tempHp -= absorbed;
    amount   -= absorbed;
  }
  c.hp = Math.max(0, c.hp - amount);
}

export function healCombatant(id, amount) {
  const c = _find(id);
  if (!c) return;
  c.hp = Math.min(c.maxHp, c.hp + Math.max(0, amount));
  // Healing clears death saves
  if (c.hp > 0) {
    c.saves = new Set([...c.saves].filter(s => !s.startsWith('death-')));
  }
}

export function setTempHP(id, amount) {
  const c = _find(id);
  if (c) c.tempHp = Math.max(0, amount);
}

// ─── Conditions ───────────────────────────────────────────────────────────────

export function toggleCondition(id, condition) {
  const c = _find(id);
  if (!c) return;
  if (c.conditions.has(condition)) c.conditions.delete(condition);
  else c.conditions.add(condition);
}

export function setExhaustion(id, level) {
  const c = _find(id);
  if (c) c.exhaustion = Math.max(0, Math.min(6, level));
}

// ─── Death saves ──────────────────────────────────────────────────────────────

export function toggleDeathSave(id, type, index) {
  // type: 'success' | 'failure', index: 1|2|3
  const c = _find(id);
  if (!c) return;
  const key = `death-${type[0]}${index}`;
  if (c.saves.has(key)) c.saves.delete(key);
  else c.saves.add(key);
}

// ─── Turn order ───────────────────────────────────────────────────────────────

export function sortInitiative() {
  state.combat.combatants.sort((a, b) => b.initiative - a.initiative || a.name.localeCompare(b.name));
  state.combat.tIdx = 0;
}

export function nextTurn() {
  if (state.combat.combatants.length === 0) return;
  state.combat.tIdx = (state.combat.tIdx + 1) % state.combat.combatants.length;
  if (state.combat.tIdx === 0) state.combat.round++;
}

export function prevTurn() {
  if (state.combat.combatants.length === 0) return;
  if (state.combat.tIdx === 0) {
    if (state.combat.round > 1) { state.combat.round--; state.combat.tIdx = state.combat.combatants.length - 1; }
  } else {
    state.combat.tIdx--;
  }
}

export function resetCombat() {
  state.combat.combatants = [];
  state.combat.tIdx  = -1;
  state.combat.round = 1;
  state.combat.selId = null;
}

// ─── Import from JSON (monster/player stat block) ─────────────────────────────

export function addCombatantFromJSON(data, type = 'monster') {
  const hp = _parseHp(data.hit_points ?? data.hp ?? data.HP ?? 10);
  return addCombatant({
    name:       data.name ?? data.Name ?? 'Unknown',
    initiative: 0,
    ac:         _parseAc(data.armor_class ?? data.ac ?? data.AC ?? 10),
    hp,
    maxHp:      hp,
    type,
  });
}

function _parseHp(val) {
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    // e.g. "26 (4d8 + 8)"
    const m = val.match(/^(\d+)/);
    return m ? parseInt(m[1]) : 10;
  }
  if (Array.isArray(val)) return val[0] ?? 10;
  return 10;
}

function _parseAc(val) {
  if (typeof val === 'number') return val;
  if (Array.isArray(val)) return val[0]?.value ?? val[0] ?? 10;
  if (typeof val === 'string') { const m = val.match(/\d+/); return m ? parseInt(m[0]) : 10; }
  return 10;
}

// ─── Token ↔ Combatant linking ────────────────────────────────────────────────

/** Return the combatant linked to the given token, or null. */
export function getLinkedCombatant(token) {
  if (!token?.combatantId) return null;
  return _find(token.combatantId) ?? null;
}

/** Auto-link a newly added combatant to a map token with the same name (case-insensitive). */
export function autoLinkToken(combatant) {
  if (combatant.tokenId) return;
  const match = state.tokens.find(t =>
    t.name.trim().toLowerCase() === combatant.name.trim().toLowerCase()
  );
  if (match && !match.combatantId) {
    combatant.tokenId   = match.id;
    match.combatantId   = combatant.id;
  }
}

/** Return the combatant whose turn it currently is, or null. */
export function getActiveCombatant() {
  const { combatants, tIdx } = state.combat;
  if (tIdx < 0 || tIdx >= combatants.length) return null;
  return combatants[tIdx];
}

// ─── Quick-add (name + initiative prompt) ─────────────────────────────────────

export function quickAddCombatant(name, initiative, hp, ac, type = 'monster') {
  const c = addCombatant({ name, initiative, hp, maxHp: hp, ac, type });
  autoLinkToken(c);
  return c;
}
