// dialog.js — Async modal dialogs replacing unsupported prompt() / confirm()

let _overlay = null;

function _getOverlay() {
  if (_overlay) return _overlay;
  _overlay = document.createElement('div');
  _overlay.className = 'modal-overlay';
  _overlay.style.zIndex = '200';
  document.body.appendChild(_overlay);
  return _overlay;
}

function _close() {
  const ov = _getOverlay();
  ov.classList.remove('open');
  ov.innerHTML = '';
}

/**
 * showPrompt(label, defaultValue?) → Promise<string|null>
 * null means the user cancelled.
 */
export function showPrompt(label, defaultValue = '') {
  return new Promise(resolve => {
    const ov = _getOverlay();

    ov.innerHTML = `
      <div class="modal" style="width:300px">
        <div class="form-row">
          <label>${label}</label>
          <input type="text" id="_dlg_input" value="${_esc(defaultValue)}" />
        </div>
        <div class="modal-foot">
          <button class="btn btn-ghost" id="_dlg_cancel">Cancel</button>
          <button class="btn btn-primary" id="_dlg_ok">OK</button>
        </div>
      </div>`;

    ov.classList.add('open');
    const input = document.getElementById('_dlg_input');
    input.focus();
    input.select();

    const ok = () => { _close(); resolve(input.value); };
    const cancel = () => { _close(); resolve(null); };

    document.getElementById('_dlg_ok').addEventListener('click', ok);
    document.getElementById('_dlg_cancel').addEventListener('click', cancel);
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') ok();
      if (e.key === 'Escape') cancel();
    });
    ov.addEventListener('click', e => { if (e.target === ov) cancel(); }, { once: true });
  });
}

/**
 * showForm(title, fields) → Promise<Object|null>
 * fields: [{ name, label, type='text', value='', options?: [{value, label}] }]
 */
export function showForm(title, fields) {
  return new Promise(resolve => {
    const ov = _getOverlay();

    const rows = fields.map(f => {
      if (f.type === 'select' && f.options) {
        const opts = f.options.map(o =>
          `<option value="${_esc(o.value)}"${o.value === f.value ? ' selected' : ''}>${_esc(o.label)}</option>`
        ).join('');
        return `<div class="form-row">
          <label>${f.label}</label>
          <select id="_dlg_${f.name}">${opts}</select>
        </div>`;
      }
      return `<div class="form-row">
        <label>${f.label}</label>
        <input type="${f.type || 'text'}" id="_dlg_${f.name}" value="${_esc(String(f.value ?? ''))}" />
      </div>`;
    }).join('');

    ov.innerHTML = `
      <div class="modal" style="width:320px">
        <h2>${title}</h2>
        ${rows}
        <div class="modal-foot">
          <button class="btn btn-ghost" id="_dlg_cancel">Cancel</button>
          <button class="btn btn-primary" id="_dlg_ok">OK</button>
        </div>
      </div>`;

    ov.classList.add('open');
    const firstInput = ov.querySelector('input, select');
    if (firstInput) { firstInput.focus(); if (firstInput.select) firstInput.select(); }

    const ok = () => {
      const result = {};
      fields.forEach(f => {
        const el = document.getElementById(`_dlg_${f.name}`);
        result[f.name] = el ? el.value : '';
      });
      _close();
      resolve(result);
    };
    const cancel = () => { _close(); resolve(null); };

    document.getElementById('_dlg_ok').addEventListener('click', ok);
    document.getElementById('_dlg_cancel').addEventListener('click', cancel);
    ov.querySelectorAll('input').forEach(inp => {
      inp.addEventListener('keydown', e => {
        if (e.key === 'Enter') ok();
        if (e.key === 'Escape') cancel();
      });
    });
    ov.addEventListener('click', e => { if (e.target === ov) cancel(); }, { once: true });
  });
}

function _esc(s) {
  return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
