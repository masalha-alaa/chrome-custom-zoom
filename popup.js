const MIN = 25;
const MAX = 500;
const DEFAULT_STEP = 5;
const MAX_STEP = MAX - MIN;

const field = document.getElementById('zoom');
const stepField = document.getElementById('step');
const decrease = document.getElementById('decrease');
const increase = document.getElementById('increase');
const reset = document.getElementById('reset');
const status = document.getElementById('status');
const controls = [field, stepField, decrease, increase, reset];

let tabId;
let zoomPercent;
let defaultPercent = 100;
let zoomStep = DEFAULT_STEP;
let pending = Promise.resolve();

function showStatus(message) {
  status.textContent = message;
  status.hidden = !message;
}

function format(percent) {
  return String(Number(percent.toFixed(2)));
}

function display(percent) {
  // Avoid displaying floating-point noise from Chrome's zoom API.
  field.value = format(percent);
  decrease.disabled = percent <= MIN + 0.0001;
  increase.disabled = percent >= MAX - 0.0001;
  reset.disabled = Math.abs(percent - defaultPercent) < 0.0001;
}

function parseNumber(value, min, max, label) {
  const raw = value.trim().replace(/%$/, '').trim();
  if (!/^\d+(?:\.\d{1,2})?$/.test(raw)) {
    throw new Error(`Enter a ${label} from ${min}% to ${max}% (up to 2 decimals).`);
  }
  const number = Number(raw);
  if (number < min || number > max) {
    throw new Error(`Enter a ${label} from ${min}% to ${max}%.`);
  }
  return number;
}

function enqueue(action) {
  pending = pending.then(action).catch(error => {
    showStatus(error.message || 'Could not change zoom on this page.');
  });
}

async function setPercent(percent) {
  showStatus('');
  await chrome.tabs.setZoom(tabId, percent / 100);
  zoomPercent = (await chrome.tabs.getZoom(tabId)) * 100;
  display(zoomPercent);
}

field.addEventListener('focus', () => field.select());
field.addEventListener('change', () => enqueue(async () => {
  const percent = parseNumber(field.value, MIN, MAX, 'zoom');
  if (Math.abs(percent - zoomPercent) >= 0.0001) await setPercent(percent);
  else display(zoomPercent);
}));
field.addEventListener('keydown', event => {
  if (event.key === 'Enter') field.blur();
  if (event.key === 'Escape') {
    field.value = format(zoomPercent);
    field.blur();
  }
});

stepField.addEventListener('focus', () => stepField.select());
stepField.addEventListener('change', () => enqueue(async () => {
  const step = parseNumber(stepField.value, 0.01, MAX_STEP, 'step');
  await chrome.storage.local.set({ zoomStep: step });
  zoomStep = step;
  stepField.value = `${format(step)}%`;
  showStatus('');
}));
stepField.addEventListener('keydown', event => {
  if (event.key === 'Enter') stepField.blur();
  if (event.key === 'Escape') {
    stepField.value = `${format(zoomStep)}%`;
    stepField.blur();
  }
});

function stepZoom(direction) {
  const next = Math.round((zoomPercent + direction * zoomStep) * 100) / 100;
  return setPercent(Math.max(MIN, Math.min(MAX, next)));
}

decrease.addEventListener('click', () => enqueue(() => stepZoom(-1)));
increase.addEventListener('click', () => enqueue(() => stepZoom(1)));
reset.addEventListener('click', () => enqueue(async () => {
  showStatus('');
  await chrome.tabs.setZoom(tabId, 0);
  zoomPercent = (await chrome.tabs.getZoom(tabId)) * 100;
  display(zoomPercent);
}));

async function initialize() {
  controls.forEach(control => { control.disabled = true; });
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id === undefined) throw new Error('No active tab.');
    tabId = tab.id;
    const [factor, settings, stored] = await Promise.all([
      chrome.tabs.getZoom(tabId),
      chrome.tabs.getZoomSettings(tabId),
      chrome.storage.local.get('zoomStep')
    ]);
    zoomPercent = factor * 100;
    defaultPercent = (settings.defaultZoomFactor ?? 1) * 100;
    const saved = stored.zoomStep;
    if (Number.isFinite(saved) && saved >= 0.01 && saved <= MAX_STEP) zoomStep = saved;
    stepField.value = `${format(zoomStep)}%`;
    field.disabled = false;
    stepField.disabled = false;
    display(zoomPercent);
  } catch (error) {
    showStatus('Zoom is unavailable on this page.');
  }
}

initialize();
