import { createStore, initialState } from './store.js';
import { BEATS } from './beats.js';
import { createIPhone } from './devices/iphone.js';
import { createTV } from './devices/tv.js';
import { I } from './icons.js';
import { $, $$, cls } from './ui.js';

const html = document.documentElement;
const params = new URLSearchParams(location.search);
const store = createStore(initialState());
let runToken = 0;
let autoTimer = null;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const frozen = params.get('freeze') === '1';
if (frozen) html.classList.add('frozen');

// ---------- devices ----------
// The demo is guided only: the beats drive every device, so taps and typing
// on the devices themselves are ignored.
function userAct() {}
userAct.state = () => store.getState();

const devices = {
  maya: createIPhone('Maya', userAct),
  jordan: createIPhone('Jordan', userAct),
  tv: createTV(),
};

$('#stage .slot-maya .dev-scale').append(devices.maya.root);
$('#stage .slot-jordan .dev-scale').append(devices.jordan.root);
$('#stage .slot-tv .dev-scale').append(devices.tv.root);
$$(document, '#stage .slot input').forEach((inp) => { inp.readOnly = true; inp.tabIndex = -1; });

function renderAll(s) {
  devices.maya.update(s);
  devices.jordan.update(s);
  devices.tv.update(s);
  renderBar(s);
}
// While a beat change replays the script, devices skip the intermediate
// states and render once from the final one.
let batching = false;
let booted = false;
store.subscribe((s) => { if (!batching) renderAll(s); });

// ---------- stage scaling ----------
const stage = $('#stage');
const NARROW = 900;
let activeDev = 'maya';
const SIZES = { maya: [417, 876], jordan: [417, 876], tv: [1304, 850] };

function layout() {
  const vw = innerWidth;
  const vh = innerHeight;
  const narrow = vw < NARROW;
  cls(html, 'narrow', narrow);
  if (!narrow) {
    const barH = html.classList.contains('clean') ? 0 : 60;
    const s = Math.min(vw / 1920, (vh - barH) / 1080);
    stage.style.setProperty('--s', s);
    stage.style.left = `${(vw - 1920 * s) / 2}px`;
    stage.style.top = `${Math.max(0, (vh - barH - 1080 * s) / 2)}px`;
    return;
  }
  const top = 56;
  const bottom = html.classList.contains('clean') ? 0 : 118;
  const [w, h] = SIZES[activeDev];
  const s = Math.min((vw - 32) / w, (vh - top - bottom - 40) / h);
  html.style.setProperty('--ns', s);
  $$(stage, '.slot').forEach((n) => cls(n, 'active', n.dataset.dev === activeDev));
  $$(document, '.switcher button').forEach((b) => cls(b, 'on', b.dataset.dev === activeDev));
  const th = devices[activeDev] && devices[activeDev].root.querySelector('.thread');
  if (th) th.scrollTop = th.scrollHeight;
}
addEventListener('resize', layout);

function focusDev(dev) {
  if (!dev) return;
  if (activeDev === dev) return;
  activeDev = dev;
  layout();
}

// ---------- tap ripple ----------
function showTap(dev, sel) {
  const root = devices[dev].root;
  const t = root.querySelector(sel);
  if (!t) return;
  if (html.classList.contains('narrow')) focusDev(dev);
  const r = t.getBoundingClientRect();
  const layer = $('#taps');
  const lr = layer.getBoundingClientRect();
  const sc = lr.width / layer.offsetWidth || 1;
  const dot = document.createElement('div');
  dot.className = 'tap';
  dot.style.left = `${(r.left + r.width / 2 - lr.left) / sc}px`;
  dot.style.top = `${(r.top + r.height / 2 - lr.top) / sc}px`;
  layer.append(dot);
  setTimeout(() => dot.remove(), 900);
  t.classList.add('pressed');
  setTimeout(() => t.classList.remove('pressed'), 220);
}

// ---------- running beats ----------
function runInstant(beat) {
  for (const step of beat.script) {
    if (step.type) {
      const [, , field, text, kind] = step.type;
      store.dispatch({ type: kind || 'EDIT_DRAFT', field, value: text });
    } else store.dispatch(step.a);
  }
}

async function playScript(beat, token) {
  for (const step of beat.script) {
    await sleep(step.d || 0);
    if (token !== runToken) return false;
    if (step.focus) focusDev(step.focus);
    if (step.type) {
      const [dev, sel, field, text, kind] = step.type;
      showTap(dev, sel);
      for (let i = 1; i <= text.length; i += 1) {
        store.dispatch({ type: kind || 'EDIT_DRAFT', field, value: text.slice(0, i) });
        await sleep(reduced ? 0 : 45);
        if (token !== runToken) return false;
      }
      continue;
    }
    if (step.tap) {
      showTap(step.tap[0], step.tap[1]);
      await sleep(180);
      if (token !== runToken) return false;
    }
    store.dispatch(step.a);
  }
  return true;
}

function goto(n, { play = true, instant = false } = {}) {
  n = Math.max(0, Math.min(BEATS.length - 1, n));
  runToken += 1;
  clearTimeout(autoTimer);
  const token = runToken;
  hideIntro();
  hideOutro();
  const ui = store.getState().ui;
  // Stepping forward to the next beat glides: whatever the current beat had
  // left to do animates into place. Any other jump is an instant cut.
  const glide = booted && !instant && n === ui.beat + 1;
  if (!glide) html.classList.add('no-anim');
  batching = true;
  store.replace({ ...initialState(), ui: { ...ui, beat: n } });
  for (let i = 0; i < n; i += 1) runInstant(BEATS[i]);
  if (instant) runInstant(BEATS[n]);
  batching = false;
  renderAll(store.getState());
  if (!glide) {
    void stage.offsetWidth;
    if (!frozen) requestAnimationFrame(() => requestAnimationFrame(() => html.classList.remove('no-anim')));
  }
  setCaption(n);
  if (play && !instant) {
    started = true;
    setTimeout(async () => {
      const done = await playScript(BEATS[n], token);
      if (done && token === runToken && store.getState().ui.autoplay) {
        autoTimer = setTimeout(() => {
          if (n < BEATS.length - 1) goto(n + 1);
          else { setAutoplay(false); showOutro(); }
        }, 3000);
      }
    }, 350);
  }
}

// ---------- captions + step bar ----------
function setCaption(n) {
  const b = BEATS[n];
  $('.cap-k').textContent = `Step ${n + 1} of ${BEATS.length}`;
  $('.cap-t').textContent = b.title;
  $('.cap-s').textContent = b.line;
  const cap = $('.captions');
  cap.classList.remove('in');
  void cap.offsetWidth;
  cap.classList.add('in');
}

const bar = $('#stepbar');
const STEP_NAMES = ['Today', 'Create', 'Invite', 'Live', 'Split', 'End'];
bar.innerHTML = `
  <div class="sb-transport">
    <button class="sbtn sb-back" aria-label="Previous step">${I.chevronLeft}</button>
    <button class="sbtn sb-auto" aria-label="Autoplay"><span class="ic-play">${I.play}</span><span class="ic-pause">${I.pause}</span></button>
    <button class="sbtn sb-next" aria-label="Next step">${I.chevronRight}</button>
  </div>
  <div class="sb-dots">${BEATS.map((b, i) => `<button class="sb-dot" data-i="${i}" title="${b.title}"><i></i><span><em>${i + 1}</em>${STEP_NAMES[i]}</span></button>`).join('')}</div>
  <div class="sb-side">
    <button class="sbtn-text sb-restart" aria-label="Restart demo">${I.reset}<span>Restart</span></button>
    <button class="sbtn sb-keys" aria-label="Keyboard shortcuts">${I.keyboard}</button>
  </div>`;

$('.sb-back').onclick = () => goto(store.getState().ui.beat - 1, { play: false, instant: true });
$('.sb-next').onclick = () => next();
$('.sb-auto').onclick = () => setAutoplay(!store.getState().ui.autoplay);
$$(bar, '.sb-dot').forEach((d) => (d.onclick = () => goto(+d.dataset.i)));
$('.sb-restart').onclick = () => restart();
$('.sb-keys').onclick = () => html.classList.toggle('show-keys');
addEventListener('pointerdown', (e) => { if (!e.target.closest('.keys-help, .sb-keys')) html.classList.remove('show-keys'); });

function next() {
  if (html.classList.contains('intro')) return startRun();
  const { beat } = store.getState().ui;
  if (beat < BEATS.length - 1) goto(beat + 1);
  else if (!html.classList.contains('outro')) {
    // Past the last step: settle the final state, then roll the outro.
    goto(beat, { play: false, instant: true });
    showOutro();
  }
}

// ---------- intro: title card that holds until the run is started ----------
const intro = $('#intro');
let introAutoplay = false;
function showIntro() {
  intro.inert = false;
  html.classList.add('intro');
}
function hideIntro() {
  intro.inert = true;
  html.classList.remove('intro');
}
function startRun() {
  if (introAutoplay) setAutoplay(true);
  else goto(0);
}
$('.intro-play').onclick = () => startRun();

// ---------- outro: closing card after the last step ----------
const outro = $('#outro');
function showOutro() {
  outro.inert = false;
  html.classList.add('outro');
}
function hideOutro() {
  outro.inert = true;
  html.classList.remove('outro');
}
$('.outro-replay').onclick = () => setAutoplay(true);
$('.outro-close').onclick = () => hideOutro();

function renderBar(s) {
  const { beat, autoplay } = s.ui;
  $$(bar, '.sb-dot').forEach((d, i) => { cls(d, 'on', i === beat); cls(d, 'done', i < beat); if (i === beat) d.setAttribute('aria-current', 'step'); else d.removeAttribute('aria-current'); });
  cls(bar, 'playing', autoplay);
}

function setAutoplay(on) {
  store.dispatch({ type: 'SET_UI', patch: { autoplay: on } });
  if (on) {
    const b = store.getState().ui.beat;
    goto(b >= BEATS.length - 1 ? 0 : started ? b + 1 : b);
  } else clearTimeout(autoTimer);
}
let started = false;

// Back to the intro card, so the presenter can start the run from the top.
function restart() {
  setAutoplay(false);
  started = false;
  goto(0, { play: false });
  showIntro();
}

// ---------- keys ----------
addEventListener('keydown', (e) => {
  if (e.target.matches('input, textarea')) return;
  const { beat } = store.getState().ui;
  if (html.classList.contains('intro') && (e.key === ' ' || e.key === 'Enter') && !e.target.closest('button')) { e.preventDefault(); startRun(); }
  else if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
  else if (e.key === 'ArrowLeft') { e.preventDefault(); goto(beat - 1, { play: false, instant: true }); }
  else if (e.key === ' ') { e.preventDefault(); setAutoplay(!store.getState().ui.autoplay); }
  else if (e.key === 'h' || e.key === 'H') { html.classList.toggle('clean'); layout(); }
  else if (e.key === 'r' || e.key === 'R') restart();
  else if (/^[1-9]$/.test(e.key) && +e.key <= BEATS.length) goto(+e.key - 1);
  else if (e.key === 'Escape') { html.classList.remove('show-keys'); hideIntro(); hideOutro(); }
});

// ---------- mobile switcher ----------
$$(document, '.switcher button').forEach((b) => (b.onclick = () => { activeDev = b.dataset.dev; layout(); }));

// ---------- boot ----------
if (params.get('clean') === '1') html.classList.add('clean');
if (reduced) html.classList.add('reduced');
layout();
const startBeat = params.has('beat') ? +params.get('beat') : 0;
const isStatic = params.get('static') === '1';
// Autoplay is on by default (off for static/frozen captures, reduced motion, or ?autoplay=0)
const auto = !isStatic && !frozen && !reduced && params.get('autoplay') !== '0';
if (!isStatic && !frozen && !params.has('beat')) {
  // A fresh open holds on the intro card; the run starts from there.
  introAutoplay = auto;
  goto(0, { play: false });
  showIntro();
} else {
  if (auto) store.dispatch({ type: 'SET_UI', patch: { autoplay: true } });
  goto(startBeat, { play: !isStatic, instant: isStatic });
}
if (params.get('dev')) { activeDev = params.get('dev'); layout(); }
booted = true;
html.classList.add('ready');
