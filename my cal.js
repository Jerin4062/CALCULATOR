// Simple calculator logic with keyboard support and basic sanitization

const display = document.getElementById('display');
const preview = document.getElementById('preview');
const keys = document.querySelector('.keys');

let expr = ''; // visible expression using × ÷ −
let safeExpr = ''; // sanitized expression for evaluation (* / - +)

function updateUI() {
  display.value = expr || '0';
  preview.textContent = expr;
}

// Map visual operators to JS operators
function toSafe(s) {
  return s.replace(/×/g,'*').replace(/÷/g,'/').replace(/−/g,'-');
}

// Allowed characters in safe expression
const allowedRe = /^[0-9+\-*/().\s]*$/;

function safeEvaluate(s) {
  const candidate = toSafe(s);
  if (!allowedRe.test(candidate)) throw new Error('Invalid characters');
  // prevent accidental leading operator misuse, simple checks:
  if (/^[*/]/.test(candidate)) throw new Error('Bad expression');
  // Evaluate
  // Using Function instead of eval for slight isolation
  // round result to avoid long floating point display
  const result = Function('"use strict"; return (' + candidate + ')')();
  if (typeof result === 'number' && isFinite(result)) {
    // trim trailing zeros
    return Math.round((result + Number.EPSILON) * 1e12) / 1e12;
  }
  throw new Error('Computation error');
}

keys.addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;
  const val = btn.dataset.value;
  const action = btn.dataset.action;

  if (action === 'clear') {
    expr = '';
    updateUI();
    return;
  }
  if (action === 'back') {
    expr = expr.slice(0, -1);
    updateUI();
    return;
  }
  if (action === 'equals') {
    try {
      const res = safeEvaluate(expr);
      expr = String(res);
    } catch (err) {
      expr = 'Error';
      setTimeout(()=> expr = '', 800);
    }
    updateUI();
    return;
  }
  // Normal value button
  // Prevent multiple dots in a number chunk
  if (val === '.') {
    // find last number part
    const parts = expr.split(/[^0-9.]/);
    const last = parts[parts.length - 1] || '';
    if (last.includes('.')) return;
  }
  expr += val;
  updateUI();
});

// Keyboard support
window.addEventListener('keydown', (ev) => {
  if (ev.key >= '0' && ev.key <= '9') { expr += ev.key; updateUI(); return; }
  if (ev.key === '.') { expr += '.'; updateUI(); return; }
  if (ev.key === 'Backspace') { expr = expr.slice(0,-1); updateUI(); return; }
  if (ev.key === 'Enter' || ev.key === '=') {
    ev.preventDefault();
    try {
      const res = safeEvaluate(expr);
      expr = String(res);
    } catch {
      expr = 'Error';
      setTimeout(()=> expr = '', 800);
    }
    updateUI();
    return;
  }
  // map keyboard operators to visual ones
  const map = { '/': '÷', '*': '×', '-': '−', '+': '+' , '(': '(', ')':')' };
  if (map[ev.key]) { expr += map[ev.key]; updateUI(); return; }
});
