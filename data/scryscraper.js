/*!
 * Scryscraper — shared fetch/parse/modal module
 * Exposes window.Scryscraper.openModal({ type, loadBtnText, onLoad })
 * type: 'spells' | 'items' | 'monsters'
 */
(function () {
  'use strict';

  // ─── Fetch ────────────────────────────────────────────────────────────────

  const BASES = {
    spells:   'https://www.aidedd.org/spell/',
    items:    'https://www.aidedd.org/magic-item/',
    monsters: 'https://www.aidedd.org/monster/',
  };

  const PROXIES = [
    url => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
    url => `https://corsproxy.io/?${encodeURIComponent(url)}`,
    url => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
  ];

  const RETRY_WAIT = 2500;

  function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

  async function fetchHTML(slug, type) {
    const url = BASES[type] + slug.trim();
    let lastErr = null;
    for (const mkProxy of PROXIES) {
      try {
        const res = await fetch(mkProxy(url));
        if (res.status === 429) { lastErr = new Error('Rate limited (429)'); await sleep(RETRY_WAIT); continue; }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const text = await res.text();
        if (!text || text.length < 200) throw new Error('Empty response — check slug');
        return text;
      } catch (e) { lastErr = e; }
    }
    throw lastErr ?? new Error('All proxies failed');
  }

  // ─── Spell parser ─────────────────────────────────────────────────────────

  function parseSpellHTML(html) {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const h1 = doc.querySelector('h1');
    if (!h1) throw new Error('Spell name not found');
    const name = h1.textContent.trim();
    const ecoleEl = doc.querySelector('.ecole');
    if (!ecoleEl) throw new Error('.ecole block not found');
    const ecole = ecoleEl.textContent.trim();
    const em = ecole.match(/Level\s+(\d+)\s+([\w\s]+?)\s*\((.+)\)/);
    if (!em) throw new Error(`Unexpected school format: "${ecole}"`);
    const level = parseInt(em[1], 10), school = em[2].trim(), classes = em[3].trim();
    function field(sel, lbl) {
      const el = doc.querySelector(sel);
      if (!el) throw new Error(`Missing field: ${lbl}`);
      return el.textContent.replace(lbl, '').replace(':', '').trim();
    }
    const castingTime = field('.t','Casting Time'), range = field('.r','Range'),
          components  = field('.c','Components'),   duration = field('.d','Duration'),
          source = doc.querySelector('.source')?.textContent.trim() ?? '';
    const descEl = doc.querySelector('.description');
    if (!descEl) throw new Error('Description block not found');
    descEl.querySelectorAll('br').forEach(br => br.replaceWith('\n'));
    let description = '', extra = null, extraKey = null;
    const divider = [...descEl.querySelectorAll('strong em')].find(el =>
      el.textContent.includes('Cantrip Upgrade') || el.textContent.includes('Using a Higher-Level Spell Slot')
    );
    if (divider) {
      extraKey = divider.textContent.includes('Cantrip Upgrade') ? 'cantripUpgrade' : 'atHigherLevels';
      const sp = divider.closest('strong');
      let before = '', after = '', passed = false;
      descEl.childNodes.forEach(n => {
        if (n === sp || (n.contains && n.contains(sp))) { passed = true; return; }
        if (!passed) before += n.textContent; else after += n.textContent;
      });
      description = before.replace(/\n+/g, ' ').replace(/\s{2,}/g, ' ').trim();
      extra = after.replace(/^\s*\.\s*/, '').replace(/\n+/g, ' ').replace(/\s{2,}/g, ' ').trim();
    } else {
      description = descEl.textContent.replace(/\n+/g, ' ').replace(/\s{2,}/g, ' ').trim();
    }
    const spell = { name, level, school, castingTime, range, components, duration, classes, source, description };
    if (extra) spell[extraKey] = extra;
    return spell;
  }

  // ─── Magic Item parser ────────────────────────────────────────────────────

  const RARITIES = ['Very Rare', 'Legendary', 'Artifact', 'Uncommon', 'Common', 'Rare', 'Varies'];

  function parseItemHTML(html) {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const h1 = doc.querySelector('h1');
    if (!h1) throw new Error('Item name not found');
    const name = h1.textContent.trim();
    const prereqEl = doc.querySelector('.prerequis');
    if (!prereqEl) throw new Error('.prerequis block not found');
    const prereqText = prereqEl.textContent.trim();
    let rarity = '', category = prereqText;
    const requiresAttunement = /requires attunement/i.test(prereqText);
    for (const r of RARITIES) {
      const idx = prereqText.toLowerCase().indexOf(r.toLowerCase());
      if (idx >= 0) { rarity = r; category = prereqText.slice(0, idx).replace(/,\s*$/, '').trim(); break; }
    }
    const descEl = doc.querySelector('.description');
    if (!descEl) throw new Error('Description block not found');
    const clone = descEl.cloneNode(true);
    clone.querySelectorAll('table').forEach(table => {
      const lines = [...table.querySelectorAll('tr')].map(row =>
        [...row.querySelectorAll('th,td')].map(c => c.textContent.trim()).join(' | ')
      );
      table.replaceWith(document.createTextNode('\n' + lines.join('\n') + '\n'));
    });
    clone.querySelectorAll('br').forEach(br => br.replaceWith('\n'));
    const description = clone.textContent.replace(/\n{3,}/g, '\n\n').trim();
    const source = doc.querySelector('.source')?.textContent.trim() ?? '';
    return { name, category, rarity, requiresAttunement, source, description };
  }

  // ─── Monster parser ───────────────────────────────────────────────────────

  function parseMonsterHTML(html) {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const m = {
      name:'', size:'', type:'', alignment:'', source:'',
      ac:0, hp:0, hitDice:'', initiative:'', speed:'', cr:'', gear:'',
      abilities:{
        str:{score:10,save:null}, dex:{score:10,save:null}, con:{score:10,save:null},
        int:{score:10,save:null}, wis:{score:10,save:null}, cha:{score:10,save:null},
      },
      skills:'', resistances:'', immunities:'', vulnerabilities:'',
      conditionImmunities:'', senses:'', languages:'',
      traits:[], actions:[], bonusActions:[], reactions:[],
      legendaryPreamble:'', legendaryActions:[],
      mythicPreamble:'',    mythicActions:[],
      lairActions:[],
      description:'', habitat:'', treasure:'',
    };
    const h1 = doc.querySelector('h1');
    if (!h1) throw new Error('Monster name not found');
    m.name = h1.textContent.trim();
    const typeEl = doc.querySelector('.type');
    if (typeEl) {
      const t = typeEl.textContent.trim(), lc = t.lastIndexOf(', ');
      if (lc > 0) {
        m.alignment = t.slice(lc + 2).trim();
        const st = t.slice(0, lc).trim(), sp = st.indexOf(' ');
        m.size = sp > 0 ? st.slice(0, sp) : st;
        m.type = sp > 0 ? st.slice(sp + 1) : '';
      } else { m.type = t; }
    }
    const initEl = doc.querySelector('.init');
    if (initEl) { const im = initEl.textContent.match(/Initiative\s+([+\-\d]+)/); if (im) m.initiative = im[1].trim(); }
    const redEl = doc.querySelector('.red');
    if (!redEl) throw new Error('Stat block (.red) not found');
    function afterLabel(container, label) {
      const strong = [...container.querySelectorAll('strong')].find(s => s.textContent.trim() === label);
      if (!strong) return '';
      let text = '', node = strong.nextSibling;
      while (node) {
        if (node.nodeName === 'STRONG' || node.nodeName === 'BR') break;
        text += node.textContent; node = node.nextSibling;
      }
      return text.trim();
    }
    m.ac = parseInt(afterLabel(redEl, 'AC')) || 0;
    const hpTxt = afterLabel(redEl, 'HP'), hpm = hpTxt.match(/(\d+)\s*\(([^)]+)\)/);
    m.hp = hpm ? parseInt(hpm[1]) : parseInt(hpTxt) || 0;
    m.hitDice = hpm ? hpm[2].trim() : '';
    m.speed  = afterLabel(redEl, 'Speed');
    m.skills = afterLabel(redEl, 'Skills');
    m.immunities          = afterLabel(redEl, 'Immunities');
    m.resistances         = afterLabel(redEl, 'Resistances');
    m.vulnerabilities     = afterLabel(redEl, 'Vulnerabilities');
    m.conditionImmunities = afterLabel(redEl, 'Condition Immunities');
    m.senses    = afterLabel(redEl, 'Senses');
    m.languages = afterLabel(redEl, 'Languages');
    m.cr   = afterLabel(redEl, 'CR');
    m.gear = afterLabel(redEl, 'Gear');
    const c2 = [...redEl.querySelectorAll('.car2')].map(e => parseInt(e.textContent) || 0);
    const c3 = [...redEl.querySelectorAll('.car3')].map(e => parseInt(e.textContent) || 0);
    const c5 = [...redEl.querySelectorAll('.car5')].map(e => parseInt(e.textContent) || 0);
    const c6 = [...redEl.querySelectorAll('.car6')].map(e => parseInt(e.textContent) || 0);
    const scores = [...c2.slice(0,3), ...c5.slice(0,3)];
    const mods   = [...c3.slice(0,6), ...c6.slice(0,6)];
    ['str','dex','con','int','wis','cha'].forEach((k, i) => {
      const score = scores[i] || 10, mod = mods[i*2], sv = mods[i*2+1];
      m.abilities[k] = { score, save: (sv !== undefined && sv !== mod) ? sv : null };
    });
    const SMAP = {
      'traits':'traits', 'actions':'actions', 'bonus actions':'bonusActions',
      'reactions':'reactions', 'legendary actions':'legendaryActions',
      'mythic actions':'mythicActions', 'lair actions':'lairActions',
    };
    const PMAP = { legendaryActions:'legendaryPreamble', mythicActions:'mythicPreamble' };
    const sansEl = doc.querySelector('.sansSerif');
    if (sansEl) {
      let sec = null, entry = null;
      const flush = () => {
        if (entry && sec && Array.isArray(m[sec])) {
          entry.description = entry.description.replace(/\s{2,}/g, ' ').trim();
          m[sec].push(entry); entry = null;
        }
      };
      for (const node of sansEl.childNodes) {
        if (node.classList?.contains('red')) continue;
        const tag = node.nodeName.toUpperCase();
        if (tag === 'H2' && node.classList?.contains('rub')) {
          flush(); sec = SMAP[node.textContent.trim().toLowerCase()] ?? null; continue;
        }
        if (tag === 'DIV' && node.classList?.contains('legend')) {
          flush(); const pk = sec ? PMAP[sec] : null; if (pk) m[pk] = node.textContent.replace(/\s{2,}/g, ' ').trim(); continue;
        }
        if (tag === 'P' && sec) {
          flush();
          const ne = node.querySelector('strong em'), en = ne ? ne.textContent.trim() : '';
          let desc = node.textContent; if (en) desc = desc.replace(en, '').replace(/^\s*\.\s*/, '');
          entry = { name: en, description: desc.trim() }; continue;
        }
        if (entry && sec && node.nodeType !== 8) {
          const t = node.textContent; if (t && t.trim()) entry.description += ' ' + t.trim();
        }
      }
      flush();
    }
    const descEl = doc.querySelector('.description');
    if (descEl) {
      descEl.querySelectorAll('br').forEach(br => br.replaceWith('\n'));
      m.description = descEl.textContent.replace(/\n+/g, ' ').replace(/\s{2,}/g, ' ').trim();
    }
    const habs = doc.querySelectorAll('.habitat');
    if (habs[0]) m.habitat  = habs[0].textContent.replace(/^Habitat\s*:?\s*/i,  '').trim();
    if (habs[1]) m.treasure = habs[1].textContent.replace(/^Treasure\s*:?\s*/i, '').trim();
    m.source = doc.querySelector('.source')?.textContent.trim() ?? '';
    return m;
  }

  // ─── Modal ────────────────────────────────────────────────────────────────

  const PARSERS = { spells: parseSpellHTML, items: parseItemHTML, monsters: parseMonsterHTML };

  function injectStyles() {
    if (document.getElementById('scry-styles')) return;
    const s = document.createElement('style');
    s.id = 'scry-styles';
    s.textContent = `
#scry-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.65);z-index:9999;display:none;align-items:center;justify-content:center;padding:16px}
#scry-modal{background:var(--parchment,#f5f0e1);border:2px solid var(--parchment-shadow,#d4c5a9);border-radius:12px;width:100%;max-width:500px;max-height:90vh;display:flex;flex-direction:column;box-shadow:0 24px 64px rgba(0,0,0,0.55);position:relative}
#scry-modal::before{content:'';position:absolute;inset:4px;border:1px solid rgba(0,0,0,0.07);border-radius:9px;pointer-events:none;z-index:0}
.scry-head{background:var(--stat-bg,#2c2418);padding:13px 16px;display:flex;align-items:center;justify-content:space-between;border-radius:10px 10px 0 0;flex-shrink:0;position:relative;z-index:1}
.scry-head-title{font-family:'Cinzel',serif;font-size:14px;font-weight:700;color:var(--accent-gold-light,#d4a940);letter-spacing:1px}
.scry-close{background:none;border:none;color:rgba(255,255,255,0.45);font-size:22px;cursor:pointer;line-height:1;padding:0 2px;transition:color 0.15s}
.scry-close:hover{color:#fff}
.scry-body{padding:16px;overflow-y:auto;flex:1;position:relative;z-index:1}
.scry-input-row{display:flex;gap:8px;align-items:center;margin-bottom:10px}
#scry-slug{flex:1;padding:8px 11px;border:1px solid var(--parchment-shadow,#d4c5a9);border-radius:6px;font-family:'Alegreya',serif;font-size:15px;color:var(--ink,#1a1410);background:rgba(0,0,0,0.04)}
#scry-slug:focus{outline:none;border-color:var(--accent-gold,#b8860b)}
.scry-fetch-btn{font-family:'Cinzel',serif;font-size:12px;font-weight:700;letter-spacing:1px;padding:8px 15px;border:none;border-radius:6px;cursor:pointer;text-transform:uppercase;background:var(--sb-red,#922610);color:#fff;white-space:nowrap;flex-shrink:0;transition:all 0.15s}
.scry-fetch-btn:hover:not(:disabled){background:#a82020}.scry-fetch-btn:disabled{opacity:0.5;cursor:not-allowed}
#scry-status{font-size:12px;color:var(--ink-faded,#6b5d4d);font-style:italic;min-height:16px;margin-bottom:8px}
#scry-preview{display:none;background:rgba(0,0,0,0.05);border-radius:7px;overflow:hidden}
.scry-prev-inner{padding:13px}
.scry-prev-name{font-family:'Cinzel',serif;font-size:16px;font-weight:700;color:var(--sb-red,#922610);margin-bottom:3px}
.scry-prev-meta{font-family:'Alegreya SC',serif;font-size:11px;color:var(--ink-faded,#6b5d4d);margin-bottom:9px;line-height:1.5}
.scry-prev-desc{font-size:13px;color:var(--ink,#1a1410);line-height:1.6;max-height:130px;overflow-y:auto}
.scry-prev-extra{font-size:12px;color:var(--ink-faded,#6b5d4d);font-style:italic;margin-top:7px;border-top:1px solid var(--parchment-shadow,#d4c5a9);padding-top:7px}
.scry-foot{padding:12px 16px;display:flex;justify-content:space-between;align-items:center;border-top:1px solid var(--parchment-shadow,#d4c5a9);flex-shrink:0;position:relative;z-index:1}
.scry-cancel{font-family:'Cinzel',serif;font-size:12px;font-weight:700;letter-spacing:1px;padding:8px 16px;border:1px solid var(--parchment-shadow,#d4c5a9);border-radius:6px;cursor:pointer;text-transform:uppercase;background:transparent;color:var(--ink-faded,#6b5d4d);transition:all 0.15s}
.scry-cancel:hover{border-color:var(--ink,#1a1410);color:var(--ink,#1a1410)}
.scry-load{font-family:'Cinzel',serif;font-size:12px;font-weight:700;letter-spacing:1px;padding:8px 20px;border:none;border-radius:6px;cursor:pointer;text-transform:uppercase;background:var(--accent-gold,#b8860b);color:#1a1410;transition:all 0.15s}
.scry-load:hover:not(:disabled){background:var(--accent-gold-light,#d4a940);transform:translateY(-1px)}
.scry-load:disabled{opacity:0.4;cursor:not-allowed}`;
    document.head.appendChild(s);
  }

  function buildModal() {
    if (document.getElementById('scry-overlay')) return;
    injectStyles();
    const ov = document.createElement('div');
    ov.id = 'scry-overlay';
    ov.innerHTML = `
<div id="scry-modal">
  <div class="scry-head">
    <span class="scry-head-title">🔮 Scryscraper — <span id="scry-type-label">Spell</span></span>
    <button class="scry-close" onclick="Scryscraper._close()">×</button>
  </div>
  <div class="scry-body">
    <div class="scry-input-row">
      <input id="scry-slug" type="text" placeholder="slug, e.g. fireball" autocomplete="off"
             onkeydown="if(event.key==='Enter')Scryscraper._fetch()">
      <button class="scry-fetch-btn" id="scry-fetch-btn" onclick="Scryscraper._fetch()">Fetch</button>
    </div>
    <div id="scry-status"></div>
    <div id="scry-preview"></div>
  </div>
  <div class="scry-foot">
    <button class="scry-cancel" onclick="Scryscraper._close()">Cancel</button>
    <button class="scry-load" id="scry-load-btn" disabled onclick="Scryscraper._load()">Load</button>
  </div>
</div>`;
    ov.addEventListener('click', e => { if (e.target === ov) Scryscraper._close(); });
    document.body.appendChild(ov);
  }

  let _onLoad = null, _type = null, _data = null;

  function openModal({ type, loadBtnText = 'Load', onLoad }) {
    buildModal();
    _onLoad = onLoad; _type = type; _data = null;
    const LABELS = { spells: 'Spell', items: 'Magic Item', monsters: 'Monster' };
    document.getElementById('scry-type-label').textContent = LABELS[type] ?? type;
    document.getElementById('scry-load-btn').textContent   = loadBtnText;
    document.getElementById('scry-load-btn').disabled      = true;
    document.getElementById('scry-slug').value             = '';
    document.getElementById('scry-status').textContent     = '';
    document.getElementById('scry-preview').style.display  = 'none';
    document.getElementById('scry-preview').innerHTML      = '';
    document.getElementById('scry-overlay').style.display  = 'flex';
    document.getElementById('scry-slug').focus();
  }

  async function _fetch() {
    const slug     = document.getElementById('scry-slug').value.trim();
    if (!slug) return;
    const fetchBtn = document.getElementById('scry-fetch-btn');
    const status   = document.getElementById('scry-status');
    const preview  = document.getElementById('scry-preview');
    fetchBtn.disabled = true;
    status.textContent = 'Fetching…';
    preview.style.display = 'none';
    _data = null;
    document.getElementById('scry-load-btn').disabled = true;
    try {
      const html = await fetchHTML(slug, _type);
      _data = PARSERS[_type](html);
      status.textContent = '';
      preview.innerHTML  = `<div class="scry-prev-inner">${_buildPreview(_data, _type)}</div>`;
      preview.style.display = 'block';
      document.getElementById('scry-load-btn').disabled = false;
    } catch (err) {
      status.textContent = `⚠ ${err.message}`;
    }
    fetchBtn.disabled = false;
  }

  function _esc(s) {
    if (!s) return '';
    const d = document.createElement('div');
    d.textContent = s; return d.innerHTML;
  }
  const _trunc = (s, n = 220) => s && s.length > n ? s.slice(0, n) + '…' : (s || '');

  function _buildPreview(data, type) {
    if (type === 'spells') {
      const lvlLabel = data.level === 0 ? 'Cantrip' : `Level ${data.level}`;
      const extra = data.cantripUpgrade
        ? `<div class="scry-prev-extra"><em>Cantrip Upgrade:</em> ${_esc(_trunc(data.cantripUpgrade, 130))}</div>`
        : data.atHigherLevels
        ? `<div class="scry-prev-extra"><em>At Higher Levels:</em> ${_esc(_trunc(data.atHigherLevels, 130))}</div>`
        : '';
      return `<div class="scry-prev-name">${_esc(data.name)}</div>
<div class="scry-prev-meta">${_esc(lvlLabel + ' ' + data.school)} · ${_esc(data.classes)}<br>${_esc(data.castingTime)} · ${_esc(data.range)} · ${_esc(data.duration)}</div>
<div class="scry-prev-desc">${_esc(_trunc(data.description))}</div>${extra}`;
    }
    if (type === 'items') {
      const attn = data.requiresAttunement ? ' · <em>requires attunement</em>' : '';
      return `<div class="scry-prev-name">${_esc(data.name)}</div>
<div class="scry-prev-meta">${_esc(data.rarity)} ${_esc(data.category)}${attn}</div>
<div class="scry-prev-desc">${_esc(_trunc(data.description))}</div>`;
    }
    if (type === 'monsters') {
      const preview = data.description || data.traits[0]?.description || '';
      return `<div class="scry-prev-name">${_esc(data.name)}</div>
<div class="scry-prev-meta">${_esc(data.size)} ${_esc(data.type)}, ${_esc(data.alignment)} · CR ${_esc(data.cr)} · AC ${data.ac} · HP ${data.hp}</div>
<div class="scry-prev-desc">${_esc(_trunc(preview))}</div>`;
    }
    return '';
  }

  function _load() {
    if (!_data || !_onLoad) return;
    _onLoad(_data);
    _close();
  }

  function _close() {
    const ov = document.getElementById('scry-overlay');
    if (ov) ov.style.display = 'none';
    _data = null; _onLoad = null;
  }

  window.Scryscraper = { openModal, _fetch, _load, _close };
})();
