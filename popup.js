const MIN = 25;
const MAX = 500;
const DEFAULT_STEP = 5;
const MAX_STEP = MAX - MIN;
const MAX_PRESETS = 5;
const PRESET_EPSILON = 0.005;

const field = document.getElementById('zoom');
const stepField = document.getElementById('step');
const decrease = document.getElementById('decrease');
const increase = document.getElementById('increase');
const reset = document.getElementById('reset');
const savePreset = document.getElementById('savePreset');
const presetList = document.getElementById('presetList');
const status = document.getElementById('status');
const controls = [field, stepField, decrease, increase, reset, savePreset];

let tabId;
let zoomPercent;
let defaultPercent = 100;
let zoomStep = DEFAULT_STEP;
let savedPresets = [];
let visiblePresets = [];
let pending = Promise.resolve();

function showStatus(message) {
  status.textContent = message;
  status.hidden = !message;
}

function format(percent) {
  return String(Number(percent.toFixed(2)));
}

function samePercent(a, b) {
  return Math.abs(a - b) < PRESET_EPSILON;
}

function hasPreset(list, percent) {
  return list.some(value => samePercent(value, percent));
}

function normalizePresets(value) {
  if (!Array.isArray(value)) return [];

  const normalized = [];
  for (const item of value) {
    const number = Number(item);
    if (!Number.isFinite(number) || number < MIN || number > MAX) continue;

    const percent = Number(format(number));
    if (!hasPreset(normalized, percent)) normalized.push(percent);
    if (normalized.length === MAX_PRESETS) break;
  }
  return normalized.sort((a, b) => a - b);
}

function setStarState(button, saved, percent) {
  button.textContent = saved ? '★' : '☆';
  button.classList.toggle('is-saved', saved);
  button.setAttribute('aria-pressed', String(saved));

  if (percent === undefined) {
    const label = saved ? 'Current zoom is already saved' : 'Save current zoom as preset';
    button.setAttribute('aria-label', label);
    button.title = label;
    return;
  }

  const value = format(percent) + '%';
  const label = saved ? 'Remove ' + value + ' preset' : 'Save ' + value + ' preset';
  button.setAttribute('aria-label', label);
  button.title = label;
}

function updateCurrentPresetStar() {
  if (!Number.isFinite(zoomPercent)) return;
  setStarState(savePreset, hasPreset(savedPresets, zoomPercent));
}

function display(percent) {
  // Avoid displaying floating-point noise from Chrome's zoom API.
  field.value = format(percent) + '%';
  decrease.disabled = percent <= MIN + 0.0001;
  increase.disabled = percent >= MAX - 0.0001;
  reset.disabled = Math.abs(percent - defaultPercent) < 0.0001;
  updateCurrentPresetStar();
}

function parseNumber(value, min, max, label) {
  const raw = value.trim().replace(/%$/, '').trim();
  if (!/^\d+$/.test(raw)) {
    throw new Error('Enter a whole-number ' + label + ' from ' + min + '% to ' + max + '%.');
  }
  const number = Number(raw);
  if (number < min || number > max) {
    throw new Error('Enter a ' + label + ' from ' + min + '% to ' + max + '%.');
  }
  return number;
}

function enqueue(action) {
  pending = pending.then(action).catch(error => {
    console.error(error);
    showStatus('Could not change zoom on this page.');
  });
}

async function setPercent(percent) {
  showStatus('');
  await chrome.tabs.setZoom(tabId, percent / 100);
  zoomPercent = (await chrome.tabs.getZoom(tabId)) * 100;
  display(zoomPercent);
}

async function addPreset(percent) {
  const normalized = Number(format(percent));
  if (hasPreset(savedPresets, normalized)) {
    showStatus('');
    updateCurrentPresetStar();
    return;
  }

  if (savedPresets.length >= MAX_PRESETS) {
    showStatus('You can save up to 5 presets.');
    return;
  }

  const next = [...savedPresets, normalized].sort((a, b) => a - b);
  await chrome.storage.local.set({ zoomPresets: next });
  savedPresets = next;

  if (hasPreset(visiblePresets, normalized)) {
    showStatus('');
  } else if (visiblePresets.length < MAX_PRESETS) {
    visiblePresets.push(normalized);
    visiblePresets.sort((a, b) => a - b);
    showStatus('');
  } else {
    showStatus('Preset saved. Reopen the popup to refresh the list.');
  }

  renderPresets();
  updateCurrentPresetStar();
}

async function removePreset(percent) {
  const next = savedPresets.filter(value => !samePercent(value, percent));
  await chrome.storage.local.set({ zoomPresets: next });
  savedPresets = next;
  showStatus('');
  renderPresets();
  updateCurrentPresetStar();
}

async function togglePreset(percent) {
  if (hasPreset(savedPresets, percent)) await removePreset(percent);
  else await addPreset(percent);
}

function renderPresets() {
  presetList.replaceChildren();

  for (const percent of visiblePresets) {
    const row = document.createElement('div');
    row.className = 'preset-row';

    const valueButton = document.createElement('button');
    valueButton.type = 'button';
    valueButton.className = 'preset-value';
    valueButton.textContent = format(percent) + '%';
    valueButton.title = 'Apply ' + format(percent) + '% zoom';
    valueButton.setAttribute('aria-label', 'Apply ' + format(percent) + '% zoom');
    valueButton.addEventListener('click', () => enqueue(() => setPercent(percent)));

    const starButton = document.createElement('button');
    starButton.type = 'button';
    starButton.className = 'star-button preset-star';
    setStarState(starButton, hasPreset(savedPresets, percent), percent);
    starButton.addEventListener('click', () => enqueue(() => togglePreset(percent)));

    row.append(valueButton, starButton);
    presetList.append(row);
  }
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
    field.value = format(zoomPercent) + '%';
    field.blur();
  }
});

stepField.addEventListener('focus', () => stepField.select());
stepField.addEventListener('change', () => enqueue(async () => {
  const step = parseNumber(stepField.value, 1, MAX_STEP, 'step');
  await chrome.storage.local.set({ zoomStep: step });
  zoomStep = step;
  stepField.value = format(step) + '%';
  showStatus('');
}));
stepField.addEventListener('keydown', event => {
  if (event.key === 'Enter') stepField.blur();
  if (event.key === 'Escape') {
    stepField.value = format(zoomStep) + '%';
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
savePreset.addEventListener('click', () => enqueue(() => addPreset(zoomPercent)));

async function initialize() {
  controls.forEach(control => { control.disabled = true; });
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id === undefined) throw new Error('No active tab.');
    tabId = tab.id;

    const [factor, settings, stored] = await Promise.all([
      chrome.tabs.getZoom(tabId),
      chrome.tabs.getZoomSettings(tabId),
      chrome.storage.local.get(['zoomStep', 'zoomPresets'])
    ]);

    zoomPercent = factor * 100;
    defaultPercent = (settings.defaultZoomFactor ?? 1) * 100;

    const savedStep = stored.zoomStep;
    if (Number.isInteger(savedStep) && savedStep >= 1 && savedStep <= MAX_STEP) zoomStep = savedStep;

    savedPresets = normalizePresets(stored.zoomPresets);
    visiblePresets = [...savedPresets];

    stepField.value = format(zoomStep) + '%';
    field.disabled = false;
    stepField.disabled = false;
    savePreset.disabled = false;
    display(zoomPercent);
    renderPresets();
  } catch (error) {
    showStatus('Zoom is unavailable on this page.');
  }
}

initialize();
