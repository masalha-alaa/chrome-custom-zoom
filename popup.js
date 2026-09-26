// Chrome's built-in zoom steps. Exact percentages can also be entered directly.
const PRESETS = [25, 100 / 3, 50, 200 / 3, 75, 80, 90, 100, 110,
  125, 150, 175, 200, 250, 300, 400, 500];
const MIN = 25;
const MAX = 500;

const field = document.getElementById('zoom');
const decrease = document.getElementById('decrease');
const increase = document.getElementById('increase');
const reset = document.getElementById('reset');
const status = document.getElementById('status');
const controls = [field, decrease, increase, reset];

let tabId;
let zoomPercent;
let defaultPercent = 100;
let pending = Promise.resolve();

function showStatus(message) {
  status.textContent = message;
  status.hidden = !message;
}

function display(percent) {
  // Avoid displaying floating-point noise from Chrome's zoom API.
  if (Math.abs(percent - 100 / 3) < 0.0001) field.value = '33';
  else if (Math.abs(percent - 200 / 3) < 0.0001) field.value = '67';
  else field.value = String(Number(percent.toFixed(2)));
  decrease.disabled = percent <= MIN + 0.0001;
  increase.disabled = percent >= MAX - 0.0001;
  reset.disabled = Math.abs(percent - defaultPercent) < 0.0001;
}

function parsePercent() {
  const raw = field.value.trim().replace(/%$/, '').trim();
  if (!/^\d+(?:\.\d{1,2})?$/.test(raw)) {
    throw new Error('Enter a number from 25% to 500% (up to 2 decimals).');
  }
  const percent = Number(raw);
  if (percent < MIN || percent > MAX) {
    throw new Error('Enter a number from 25% to 500%.');
  }
  return percent;
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

function nextPreset(direction) {
  const epsilon = 0.0001;
  const next = direction > 0
    ? PRESETS.find(value => value > zoomPercent + epsilon)
    : PRESETS.findLast(value => value < zoomPercent - epsilon);
  return next ?? zoomPercent;
}

field.addEventListener('focus', () => field.select());
field.addEventListener('change', () => enqueue(async () => {
  const percent = parsePercent();
  if (Math.abs(percent - zoomPercent) >= 0.0001) await setPercent(percent);
  else display(zoomPercent);
}));
field.addEventListener('keydown', event => {
  if (event.key === 'Enter') field.blur();
  if (event.key === 'Escape') {
    field.value = String(Number(zoomPercent.toFixed(2)));
    field.blur();
  }
});

decrease.addEventListener('click', () => enqueue(() => setPercent(nextPreset(-1))));
increase.addEventListener('click', () => enqueue(() => setPercent(nextPreset(1))));
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
    const [factor, settings] = await Promise.all([
      chrome.tabs.getZoom(tabId), chrome.tabs.getZoomSettings(tabId)
    ]);
    zoomPercent = factor * 100;
    defaultPercent = (settings.defaultZoomFactor ?? 1) * 100;
    field.disabled = false;
    display(zoomPercent);
  } catch (error) {
    showStatus('Zoom is unavailable on this page.');
  }
}

initialize();
