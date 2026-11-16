import { createStore, initialState, reducer, bestTime, voteCount, owes, outstanding, money, money2 } from './store.js';
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
const isStatic = params.get('static') === '1';
// Autoplay is on by default (off for static/frozen captures, reduced motion, or ?autoplay=0)
const auto = !isStatic && !frozen && !reduced && params.get('autoplay') !== '0';

// ---------- devices ----------
// Every control on the devices is real. In Free Play a tap just happens. In
// Guided, a tap that would actually change something hands the demo over to
// the viewer right where it stands; a tap on something inert is ignored.
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
function userAct(action) {
  const s = store.getState();
  if (s.ui.mode === 'guided') {
    if (same(reducer(s, action), s)) return;
    takeOver();
  }
  store.dispatch(action);
}
userAct.state = () => store.getState();
userAct.note = (msg) => toast(msg);

const devices = {
  maya: createIPhone('Maya', userAct),
  jordan: createIPhone('Jordan', userAct),
  tv: createTV(),
};

$('#stage .slot-maya .dev-scale').append(devices.maya.root);
$('#stage .slot-jordan .dev-scale').append(devices.jordan.root);
$('#stage .slot-tv .dev-scale').append(devices.tv.root);

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
store.subscribe((s) => {
  if (batching) return;
  renderAll(s);
  renderFree(s);
  simulate(s);
});

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
  clearSim();
  const token = runToken;
  hideIntro();
  hideOutro();
  const ui = store.getState().ui;
  // Stepping forward to the next beat glides: whatever the current beat had
  // left to do animates into place. Any other jump is an instant cut.
  const glide = booted && !instant && ui.mode === 'guided' && n === ui.beat + 1;
  if (!glide) html.classList.add('no-anim');
  batching = true;
  store.replace({ ...initialState(), ui: { ...ui, mode: 'guided', beat: n } });
  for (let i = 0; i < n; i += 1) runInstant(BEATS[i]);
  if (instant) runInstant(BEATS[n]);
  batching = false;
  renderAll(store.getState());
  if (!glide) {
    void stage.offsetWidth;
    if (!frozen) requestAnimationFrame(() => requestAnimationFrame(() => html.classList.remove('no-anim')));
  }
  hintShown = '';
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
  <div class="sb-free">
    <button class="sbtn-text sb-skip" hidden>${I.clock}<span></span></button>
    <button class="sbtn-text sb-reset" aria-label="Reset Free Play">${I.reset}<span>Reset</span></button>
  </div>
  <div class="sb-side">
    <button class="sbtn-text sb-restart" aria-label="Restart demo">${I.reset}<span>Restart</span></button>
    <div class="sb-mode" role="group" aria-label="Mode">
      <button data-mode="guided">Guided</button><button data-mode="free">Free Play</button>
    </div>
    <button class="sbtn sb-keys" aria-label="Keyboard shortcuts">${I.keyboard}</button>
  </div>`;

$('.sb-back').onclick = () => goto(store.getState().ui.beat - 1, { play: false, instant: true });
$('.sb-next').onclick = () => next();
$('.sb-auto').onclick = () => setAutoplay(!store.getState().ui.autoplay);
$$(bar, '.sb-dot').forEach((d) => (d.onclick = () => goto(+d.dataset.i)));
$('.sb-restart').onclick = () => restart();
$$(bar, '.sb-mode button').forEach((b) => (b.onclick = () => setMode(b.dataset.mode)));
$('.sb-reset').onclick = () => resetFree();
$('.sb-skip').onclick = () => skip();
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
$('.intro-free').onclick = () => setMode('free');

// ---------- outro: closing card after the last step ----------
const outro = $('#outro');
function showOutro() {
  if (store.getState().ui.mode !== 'guided') return;
  outro.inert = false;
  html.classList.add('outro');
}
function hideOutro() {
  outro.inert = true;
  html.classList.remove('outro');
}
$('.outro-replay').onclick = () => setAutoplay(true);
$('.outro-free').onclick = () => setMode('free');
$('.outro-close').onclick = () => hideOutro();

function renderBar(s) {
  const { beat, mode, autoplay } = s.ui;
  cls(html, 'mode-free', mode === 'free');
  $$(bar, '.sb-mode button').forEach((b) => { cls(b, 'on', b.dataset.mode === mode); b.setAttribute('aria-pressed', b.dataset.mode === mode); });
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

// ---------- modes ----------
// Guided plays the six steps. Free Play hands every device to the viewer and
// lets the rest of the group react to whatever they do.
function setMode(mode) {
  if (mode === store.getState().ui.mode && !html.classList.contains('intro') && !html.classList.contains('outro')) return;
  runToken += 1;
  clearTimeout(autoTimer);
  hideIntro();
  hideOutro();
  if (mode === 'free') {
    store.dispatch({ type: 'SET_UI', patch: { mode: 'free', autoplay: false } });
    resetFree();
  } else {
    store.dispatch({ type: 'SET_UI', patch: { autoplay: auto } });
    goto(0);
  }
}

// A tap on a device during the guided run: stop the script and carry on from
// exactly this state, so nothing jumps.
function takeOver() {
  runToken += 1;
  clearTimeout(autoTimer);
  hideIntro();
  hideOutro();
  store.dispatch({ type: 'SET_UI', patch: { mode: 'free', autoplay: false } });
  toast('Free Play: you’re driving now. Tap anything on any device.');
}

function resetFree() {
  runToken += 1;
  clearSim();
  html.classList.add('no-anim');
  if (document.activeElement && document.activeElement.matches('input')) document.activeElement.blur();
  store.replace({ ...initialState(), ui: { ...store.getState().ui, mode: 'free', autoplay: false, beat: 0 } });
  if (activeDev !== 'maya') { activeDev = 'maya'; layout(); }
  requestAnimationFrame(() => requestAnimationFrame(() => html.classList.remove('no-anim')));
}

// ---------- Free Play: the rest of the group ----------
// Sam, Priya and Alex are driven by the state, not by what was tapped: after
// every change, anything one of them still has to do (answer the invite, show
// up, pay back) gets one timer. That makes every route work the same way,
// including taking over halfway through the guided run.
const FRIENDS = {
  Sam: { likes: ['7 PM', '8 PM'], orElse: ['9 PM'], answer: 1600, arrive: 2200, shares: true, pay: 2500 },
  Priya: { likes: ['8 PM'], orElse: ['9 PM', '7 PM'], answer: 3200, arrive: 4200, shares: true, pay: 5000 },
  Alex: { likes: ['9 PM'], orElse: ['8 PM', '7 PM'], answer: 4800, arrive: 7000, shares: false, pay: 8000 },
};
const pending = new Map();
function clearSim() { pending.forEach(clearTimeout); pending.clear(); }
// Run `then` after `ms`, as long as `still` holds when the time comes.
function plan(key, ms, still, then) {
  if (pending.has(key)) return;
  pending.set(key, setTimeout(() => {
    pending.delete(key);
    const s = store.getState();
    if (s.ui.mode === 'free' && still(s)) then(s);
  }, ms));
}
function simulate(s) {
  if (s.ui.mode !== 'free' || !s.space) return;
  Object.entries(FRIENDS).forEach(([p, f]) => {
    const invited = (x) => x.space && x.phase === 'chat' && !x.space.members[p].joined;
    if (invited(s)) plan(`answer:${p}`, f.answer, invited, (x) => answer(p, f, x.space));
    const coming = (x) => x.space && x.phase === 'live' && !x.space.members[p].here;
    if (coming(s)) plan(`arrive:${p}`, f.arrive, coming, () => store.dispatch({ type: 'ARRIVE', person: p, location: f.shares }));
    const owing = (x) => x.space && x.phase === 'live' && owes(x.space, p) > 0;
    if (owing(s)) plan(`pay:${p}`, f.pay, owing, () => store.dispatch({ type: 'PAY', person: p }));
  });
  // Jordan said yes to location, so the Space checks Jordan in on arrival.
  const tracked = (x) => x.space && x.phase === 'live' && x.space.members.Jordan.location === 'on' && !x.space.members.Jordan.here;
  if (tracked(s)) plan('arrive:Jordan', 2600, tracked, () => store.dispatch({ type: 'ARRIVE', person: 'Jordan' }));
  // The pay sheet dismisses itself after the checkmark.
  const paid = (x) => x.jordan.paySheet && x.jordan.payStage === 'done';
  if (paid(s)) plan('closePay', 1400, paid, () => store.dispatch({ type: 'OPEN_PAY', open: false }));
}
// Vote for the times that suit them (or the nearest one on offer). If the time
// is already set, there is nothing to vote on and they simply join.
function answer(p, f, sp) {
  if (sp.lockedTime) return store.dispatch({ type: 'JOIN', person: p });
  let picks = f.likes.filter((t) => sp.times.includes(t));
  if (!picks.length) picks = [f.orElse.find((t) => sp.times.includes(t))];
  const open = (x) => x.space && x.phase === 'chat' && !x.space.lockedTime;
  picks.forEach((time, i) => {
    const vote = () => store.dispatch({ type: 'VOTE', person: p, time, on: true });
    if (i) plan(`vote:${p}:${time}`, 300 * i, open, vote); else vote();
  });
}

// ---------- Free Play: the clock ----------
// The only things a viewer can't do on a device are wait for the start time
// and wait for the Space to end itself, so the bar offers to skip to each.
let skipHold = false;
function skipTarget(s) {
  const sp = s.space;
  if (!sp || skipHold) return null;
  if (s.phase === 'chat' && sp.lockedTime) return { label: `Skip to ${sp.lockedTime}`, primary: true, action: { type: 'GO_LIVE' } };
  if (s.phase === 'live') return { label: 'Skip to 11 PM', primary: false, action: { type: 'END_SPACE', clock: sp.endsAt } };
  return null;
}
function skip() {
  const t = skipTarget(store.getState());
  if (!t) return;
  // Hold the button back for a beat, so a double-click can't start the
  // hangout and end it in the same breath.
  skipHold = true;
  setTimeout(() => { skipHold = false; renderFree(store.getState()); }, 1800);
  store.dispatch(t.action);
}

// ---------- Free Play: captions that follow what's on screen ----------
// [title, line]. The title alone has to say what to do next, because narrow
// screens only show the title.
function hint(s) {
  const sp = s.space;
  const d = s.maya.draft;
  if (!sp) {
    if (s.maya.sheet) {
      if (!d.times.length) return ['Set up the Space', 'Pick at least one time. The name, the place, and Split Costs are up to you.'];
      const split = d.costSplit ? 'Split Costs is on, so Maya can add expenses once it’s live.' : 'Split Costs is off, so this Space won’t track money.';
      if (d.times.length === 1) return ['One time means no vote', `The group just joins for ${d.times[0]}. Add a second time to let them vote. ${split}`];
      return [`The group will vote on ${d.times.length} times`, `${split} Tap Send.`];
    }
    if (s.maya.plusMenu) return ['Choose Spaces', 'It sits in the Messages + menu, next to Photos and Apple Cash.'];
    return ['Tap + on Maya’s phone', 'Start a Space from the group chat. Sam, Priya, and Alex answer on their own.'];
  }
  const J = sp.members.Jordan;
  const t = sp.lockedTime;
  const single = sp.times.length === 1;
  if (s.phase === 'chat') {
    if (!t) {
      if (!J.joined) return ['Join and vote on Jordan’s phone', 'Sam, Priya, and Alex vote on their own. Maya locks the time when she’s ready.'];
      const best = bestTime(sp);
      const top = voteCount(sp, best);
      const tied = sp.times.filter((x) => voteCount(sp, x) === top);
      if (!top) return ['Lock the time on Maya’s phone', 'No votes yet. Tap a time on either phone.'];
      if (tied.length > 1) return ['Lock the time on Maya’s phone', `${tied.join(' and ')} are tied. Maya’s own vote can break it, or she can lock ${best}.`];
      return ['Lock the time on Maya’s phone', `${best} is ahead. Votes can change until Maya locks it.`];
    }
    const why = single ? 'One time was offered, so there was nothing to vote on.' : `Maya locked ${t}.`;
    if (!J.joined) return [`Join on Jordan’s phone, or skip to ${t}`, `${why} Jordan can still stay out of it.`];
    return [`Skip to ${t} to start the hangout`, `${why} The Apple TV already knows about tonight.`];
  }
  if (s.phase === 'live') {
    const due = owes(sp, 'Jordan');
    if (s.maya.expenseSheet) return ['Add what Maya paid for', 'It splits evenly across everyone who joined, on every device.'];
    if (s.jordan.paySheet) return s.jordan.payStage === 'done' ? ['Paid', 'Maya’s phone and the Apple TV update at the same moment.'] : ['Confirm the payment', `${money2(due)} goes to Maya with Apple Cash.`];
    if (s.jordan.locPrompt) return ['Share Jordan’s location, or don’t', 'Sharing checks Jordan in on arrival. Not sharing means checking in by hand. Nothing else changes.'];
    if (!J.joined) return ['Jordan didn’t join, so that phone stays quiet', 'The Space is live for everyone else. Tap Join on Jordan’s phone to jump in late.'];
    if (s.jordan.screen === 'lock') return ['Open the Live Activity on Jordan’s phone', 'The Dynamic Island, the Lock Screen, and the Apple TV all went live together.'];
    if (!J.here) return J.location === 'on' ? ['Jordan is on the way', 'Location is on, so the Space checks Jordan in on arrival.'] : ['Tap I’m here on Jordan’s phone', 'Location is off, so Jordan checks in by hand.'];
    if (due > 0) return ['Pay Maya back on Jordan’s phone', `Jordan’s share is ${money(due)}.`];
    if (!sp.costSplitOn) return ['End the Space when the night is over', 'Cost splitting is off here. Tap End Space on Maya’s phone, or skip to 11 PM and it ends itself.'];
    if (!sp.expenses.length) return ['Add an expense on Maya’s phone', 'It splits evenly across everyone who joined. Or end the Space without one.'];
    if (outstanding(sp) > 0) return ['The group is paying Maya back', 'Add another expense, or end the Space on Maya’s phone.'];
    return ['Everyone’s settled up', 'Add another expense, tap End Space on Maya’s phone, or skip to 11 PM and it ends itself.'];
  }
  if (s.maya.summary) return ['Keep the plan, or remove it', 'Sharing stopped and the Apple TV went back to Home on their own.'];
  // Point at the routes this run didn't take.
  const other = [
    single ? 'a vote between times' : 'a single time',
    sp.costSplitOn ? 'no cost splitting' : 'cost splitting',
    !J.joined ? 'having Jordan join' : J.location === 'on' || J.shared ? 'not sharing location' : 'sharing location',
  ];
  return ['That’s the whole night', `Reset to try it another way: ${other[0]}, ${other[1]}, or ${other[2]}.`];
}

let hintShown = '';
function renderFree(s) {
  if (s.ui.mode !== 'free') { hintShown = ''; return; }
  const [title, line] = hint(s);
  if (title !== hintShown) {
    hintShown = title;
    $('.cap-k').textContent = 'Free Play';
    $('.cap-t').textContent = title;
    const cap = $('.captions');
    cap.classList.remove('in');
    void cap.offsetWidth;
    cap.classList.add('in');
  }
  if ($('.cap-s').textContent !== line) $('.cap-s').textContent = line;
  const btn = $('.sb-skip');
  const t = skipTarget(s);
  if (btn.hidden === !!t) {
    btn.hidden = !t;
    cls(btn, 'in', !!t && !noAnimNow());
  }
  if (t) {
    $(btn, 'span').textContent = t.label;
    cls(btn, 'quiet', !t.primary);
  }
}
const noAnimNow = () => html.classList.contains('no-anim');

// ---------- toast ----------
let toastT;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastT);
  toastT = setTimeout(() => t.classList.remove('show'), 2800);
}

// ---------- keys ----------
// Track the last input method so the focus ring only shows for keyboard navigation.
addEventListener('pointerdown', () => html.classList.add('using-pointer'), true);
addEventListener('keydown', (e) => { if (e.key === 'Tab') html.classList.remove('using-pointer'); }, true);
addEventListener('keydown', (e) => {
  if ((e.target.matches && e.target.matches('input, textarea')) || e.metaKey || e.ctrlKey || e.altKey) return;
  const { beat, mode } = store.getState().ui;
  const guided = mode === 'guided';
  if (html.classList.contains('intro') && (e.key === ' ' || e.key === 'Enter') && !e.target.closest('button')) { e.preventDefault(); startRun(); }
  else if (e.key === 'h' || e.key === 'H') { html.classList.toggle('clean'); layout(); }
  else if (e.key === 'r' || e.key === 'R') { if (guided) restart(); else resetFree(); }
  else if (e.key === 'f' || e.key === 'F') setMode(guided ? 'free' : 'guided');
  else if (e.key === 'Escape') { html.classList.remove('show-keys'); hideIntro(); hideOutro(); }
  // The transport keys belong to the guided run; in Free Play they would throw
  // away whatever the viewer has set up.
  else if (!guided) return;
  else if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
  else if (e.key === 'ArrowLeft') { e.preventDefault(); goto(beat - 1, { play: false, instant: true }); }
  else if (e.key === ' ') { e.preventDefault(); setAutoplay(!store.getState().ui.autoplay); }
  else if (/^[1-9]$/.test(e.key) && +e.key <= BEATS.length) goto(+e.key - 1);
});

// ---------- mobile switcher ----------
$$(document, '.switcher button').forEach((b) => (b.onclick = () => { activeDev = b.dataset.dev; layout(); }));

// ---------- boot ----------
if (params.get('clean') === '1') html.classList.add('clean');
if (reduced) html.classList.add('reduced');
layout();
const startBeat = params.has('beat') ? +params.get('beat') : 0;
if (params.get('mode') === 'free') {
  renderAll(store.getState());
  store.dispatch({ type: 'SET_UI', patch: { mode: 'free' } });
  resetFree();
} else if (!isStatic && !frozen && !params.has('beat')) {
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
