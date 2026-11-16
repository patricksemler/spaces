import { I } from '../icons.js';
import { el, $, $$, setText, cls, avatar, noAnim } from '../ui.js';
import {
  PEOPLE, TIMES, COLORS, voteCount, bestTime, joined, hereList, total, perPerson,
  paidCount, money, money2, fmtClock, timeLeft,
} from '../store.js';

const FRIENDS = ['Sam', 'Priya', 'Alex', 'Jordan', 'Maya'];

function statusBar() {
  return `<div class="sb"><span class="sb-time">4:12</span><span class="sb-right">${I.signal}${I.wifi}${I.battery}</span></div>`;
}

function islandHTML() {
  return `
  <div class="island">
    <div class="isl-compact">
      <span class="isl-lead"><span class="isl-glyph">${I.spaces}</span></span>
      <span class="isl-trail"><span class="isl-here">0/5</span></span>
    </div>
    <div class="isl-expanded">
      <div class="isx-top">
        <span class="isx-glyph">${I.spaces}</span>
        <div class="isx-title"><b class="isx-name">Friday Hangout</b><span class="isx-place">Maya's apartment</span></div>
        <span class="isx-left">2h 55m left</span>
      </div>
      <div class="isx-row">
        <span class="isx-avs">${PEOPLE.map((p) => avatar(p, 26, 'isx-av')).join('')}</span>
        <span class="isx-stat"><b class="isx-herecount">3 of 5</b> here</span>
      </div>
      <div class="isx-cost"><span class="isx-costtext"></span><span class="isx-costpaid"></span></div>
    </div>
  </div>`;
}

function cardHTML(me) {
  return `
  <div class="space-card" data-state="voting">
    <div class="sc-head">
      <span class="sc-badge">${I.spaces}<span>Space</span></span>
      <span class="sc-status">Voting</span>
    </div>
    <div class="sc-title">Friday Hangout</div>
    <div class="sc-place">${I.pin}<span class="sc-place-t">Maya's apartment</span></div>
    <div class="sc-times">
      ${TIMES.map((t) => `<button class="sc-pill" data-time="${t}" data-act="vote" data-arg="${t}"><span class="pill-t">${t}</span><span class="pill-n">0</span><span class="pill-check">${I.check}</span></button>`).join('')}
    </div>
    <div class="sc-free"><span class="sc-free-t">1 of 5 free at 8 PM</span></div>
    <div class="sc-avs">${PEOPLE.map((p) => avatar(p, 24, 'sc-av')).join('')}<span class="sc-joined">1 joined</span></div>
    <div class="sc-live">
      <div class="sc-section-h">Who's here</div>
      <div class="sc-roster">
        ${PEOPLE.map((p) => `<div class="ros" data-p="${p}">${avatar(p, 30)}<span class="ros-name">${p === me ? 'You' : p}</span><span class="ros-loc">${I.location}</span><span class="ros-stat"><span class="ros-t">On the way</span><i class="dot"></i></span></div>`).join('')}
      </div>
      <div class="sc-cost">
        <div class="sc-cost-l"><span class="sc-cost-t"></span><span class="sc-cost-e"></span></div>
        <div class="sc-cost-bar"><i></i></div>
        <span class="sc-cost-p"></span>
      </div>
    </div>
    <div class="sc-actions">
      <button class="btn btn-primary sc-join" data-act="join">Join</button>
      <button class="btn btn-tinted sc-lock" data-act="lock">Lock 8 PM</button>
      <button class="btn btn-tinted sc-here" data-act="here">I'm here</button>
      <button class="btn btn-tinted sc-addexp" data-act="openExpense">Add expense</button>
      <button class="btn btn-primary sc-pay" data-act="openPay">Pay Maya $8</button>
      <span class="sc-paid">${I.check}Paid</span>
      <button class="btn btn-destructive sc-end" data-act="end">End Space</button>
    </div>
    <div class="sc-foot">${I.clock}<span class="sc-foot-t">Ends at 11 PM</span></div>
  </div>`;
}

export function createIPhone(who, act) {
  const other = who === 'Maya' ? 'Jordan' : 'Maya';
  const root = el(`
  <div class="iphone" data-who="${who}">
    <div class="ip-btn ip-btn-l1"></div><div class="ip-btn ip-btn-l2"></div><div class="ip-btn ip-btn-l3"></div><div class="ip-btn ip-btn-r"></div>
    <div class="ip-frame">
      <div class="screen">
        <div class="app-messages">
          <div class="nav glass-bar">
            ${statusBar()}
            <div class="nav-row">
              <span class="nav-back">${I.chevronLeft}<span class="nav-badge">3</span></span>
              <div class="nav-center">
                <div class="nav-avs">${FRIENDS.filter((p) => p !== who).map((p) => avatar(p, 30)).join('')}</div>
                <div class="nav-name">Friday Squad 🍕 <span class="nav-chev">${I.chevronRight}</span></div>
              </div>
              <span class="nav-video">${I.video}</span>
            </div>
          </div>
          <div class="thread"><div class="thread-inner"><div class="thread-date"><b>Today</b> 3:58 PM</div></div></div>
          <div class="inputbar">
            <button class="ib-plus" data-act="plus">${I.plus}</button>
            <div class="ib-field"><span>iMessage</span>${I.mic}</div>
          </div>
        </div>

        <div class="scrim scrim-plus" data-act="closePlus"></div>
        <div class="plus-menu glass">
          ${[
            ['Camera', I.camera, '#8E8E93'],
            ['Photos', I.photos, 'transparent'],
            ['Stickers', I.sticker, '#FF9F0A'],
            ['Apple Cash', I.cash, '#1C1C1E'],
            ['Audio', I.audio, '#FF375F'],
            ['Location', I.location, '#0A84FF'],
          ].map(([n, ic, c]) => `<div class="pm-row"><span class="pm-ic" style="--bg:${c}">${ic}</span>${n}</div>`).join('')}
          <div class="pm-row pm-spaces" data-act="openCreate"><span class="pm-ic pm-ic-spaces">${I.spaces}</span>Spaces</div>
        </div>

        <div class="scrim scrim-sheet" data-act="closeCreate"></div>
        <div class="sheet sheet-create">
          <div class="grabber"></div>
          <div class="sh-head"><button class="sh-cancel" data-act="closeCreate">Cancel</button><b>New Space</b><button class="sh-send" data-act="send">Send</button></div>
          <div class="field-group">
            <label class="field"><span class="field-l">Name</span><input class="in-name" placeholder="Friday Hangout" data-field="name" autocomplete="off"></label>
            <label class="field"><span class="field-l">Place</span><input class="in-place" placeholder="Add a place" data-field="place" autocomplete="off"></label>
          </div>
          <div class="field-cap">Times</div>
          <div class="chips">${TIMES.map((t) => `<button class="chip" data-act="draftTime" data-arg="${t}"><span>${t}</span></button>`).join('')}</div>
          <div class="field-group">
            <div class="field field-toggle" data-act="toggleSplit"><span class="field-l">${I.cash}Split Costs</span><span class="switch"><i></i></span></div>
            <div class="field field-static"><span class="field-l">${I.location}Location Sharing</span><span class="field-v">Ask Each Person</span></div>
            <div class="field field-static"><span class="field-l">${I.clock}Ends</span><span class="field-v">11:00 PM</span></div>
          </div>
        </div>

        <div class="sheet sheet-expense">
          <div class="grabber"></div>
          <div class="sh-head"><button class="sh-cancel" data-act="closeExpense">Cancel</button><b>Add Expense</b><button class="sh-send" data-act="addExpense">Add</button></div>
          <div class="field-group">
            <label class="field"><span class="field-l">What</span><input class="in-exp-label" placeholder="Pizza" data-efield="label" autocomplete="off"></label>
            <label class="field"><span class="field-l">Amount</span><input class="in-exp-amt" placeholder="$0" inputmode="decimal" data-efield="amount" autocomplete="off"></label>
          </div>
          <div class="exp-preview"><span class="exp-prev-t">Split evenly with everyone who joined</span></div>
        </div>

        <div class="scrim scrim-summary"></div>
        <div class="sheet sheet-summary">
          <div class="grabber"></div>
          <div class="sum-ic">${I.check}</div>
          <div class="sum-title">Friday Hangout ended</div>
          <ul class="sum-list">
            <li><span class="sum-li-ic g">${I.cash}</span><span class="sum-settled">Everyone paid</span></li>
            <li><span class="sum-li-ic b">${I.locOff}</span>Location sharing is off</li>
            <li><span class="sum-li-ic p">${I.tvApp}</span>Apple TV returned to Home</li>
          </ul>
          <div class="sum-q">Keep this plan in the chat?</div>
          <button class="btn btn-primary btn-wide" data-act="keep">Keep</button>
          <button class="btn btn-plain btn-wide" data-act="discard">Remove</button>
        </div>

        <div class="scrim scrim-pay" data-act="closePay"></div>
        <div class="sheet sheet-pay">
          <div class="pay-head"><span class="pay-brand">${I.cash} Pay</span><button class="pay-x" data-act="closePay" aria-label="Close">${I.xmark}</button></div>
          <div class="pay-card"><span class="pay-card-brand">Cash</span><span class="pay-card-bal">Balance $62.15</span></div>
          <div class="pay-rows">
            <div class="pay-row"><span>To</span><b>Maya</b></div>
            <div class="pay-row"><span>For</span><b class="pay-for">Pizza · Friday Hangout</b></div>
          </div>
          <div class="pay-amt">Pay Maya <b class="pay-amt-v">$8.00</b></div>
          <div class="pay-confirm" data-act="pay">
            <span class="pay-side">${I.side}</span>
            <span class="pay-side-t">Double-Click to Pay</span>
          </div>
          <div class="pay-done"><span class="pay-done-ring">${I.check}</span><b>Done</b></div>
        </div>

        <div class="lock">
          <div class="lock-wall"></div>
          ${statusBar()}
          <div class="lock-ic">${I.lock}</div>
          <div class="lock-date">Friday, November 20</div>
          <div class="lock-time">8:00</div>
          <div class="lock-la glass-dark" data-act="unlock">
            <div class="la-top"><span class="la-glyph">${I.spaces}</span><b class="la-name">Friday Hangout</b><span class="la-left">2h 55m left</span></div>
            <div class="la-place">${I.pin}<span class="la-place-t">Maya's apartment · 8 PM</span></div>
            <div class="la-row"><span class="la-avs">${PEOPLE.map((p) => avatar(p, 30, 'la-av')).join('')}</span><span class="la-here"><b class="la-herecount">1 of 5</b> here</span></div>
            <div class="la-cost"><span class="la-cost-t"></span><span class="la-cost-p"></span></div>
          </div>
          <div class="lock-bottom"><span class="lock-q">${I.flashlight}</span><span class="lock-q">${I.camera}</span></div>
        </div>

        <div class="alert-scrim"></div>
        <div class="alert glass">
          <div class="alert-ic">${I.location}</div>
          <div class="alert-t">Share your location with Friday Hangout?</div>
          <div class="alert-m">People in this Space can see where you are until it ends at 11 PM.</div>
          <button class="alert-b" data-act="locAllow">Share Until Space Ends</button>
          <button class="alert-b alert-b-strong" data-act="locDecline">Don't Share</button>
        </div>

        ${islandHTML()}
        <div class="home-ind"></div>
      </div>
    </div>
  </div>`);

  const q = (s) => $(root, s);
  const thread = q('.thread');
  const inner = q('.thread-inner');
  let rendered = []; // signatures of the messages in the thread, in order
  const sigOf = (m) => `${m.id}|${m.from}|${m.kind || m.text}`;
  const card = el(cardHTML(who));
  let lastSig = '';
  let islandTimer = null;
  let prevPhase = null;
  let lastCardH = 0;

  // ---- inputs (free play) ----
  $$(root, 'input[data-field]').forEach((inp) => inp.addEventListener('input', () => act({ type: 'EDIT_DRAFT', field: inp.dataset.field, value: inp.value }, true)));
  const expLabel = q('.in-exp-label');
  expLabel.addEventListener('input', () => act({ type: 'EDIT_EXPENSE', field: 'label', value: expLabel.value }, true));

  // Amount works like Apple Cash: the "$" is always there, only digits and
  // one "." get in, and cents stop at two places.
  const expAmt = q('.in-exp-amt');
  const cleanAmount = (raw) => {
    let [whole, ...rest] = raw.replace(/[^0-9.]/g, '').split('.');
    whole = whole.replace(/^0+(?=\d)/, '').slice(0, 5);
    if (!rest.length) return whole;
    return `${whole || '0'}.${rest.join('').slice(0, 2)}`;
  };
  const caretToEnd = () => { const n = expAmt.value.length; expAmt.setSelectionRange(n, n); };
  expAmt.addEventListener('beforeinput', (e) => {
    if (e.data && /[^0-9.]/.test(e.data)) e.preventDefault();
    if (e.data === '.' && expAmt.value.includes('.')) e.preventDefault();
  });
  expAmt.addEventListener('focus', () => {
    if (!expAmt.value) expAmt.value = '$';
    requestAnimationFrame(caretToEnd);
  });
  expAmt.addEventListener('blur', () => { if (expAmt.value === '$') expAmt.value = ''; });
  expAmt.addEventListener('input', () => {
    const v = cleanAmount(expAmt.value);
    expAmt.value = '$' + v;
    caretToEnd();
    act({ type: 'EDIT_EXPENSE', field: 'amount', value: v }, true);
  });
  expAmt.addEventListener('keydown', (e) => {
    // keep the caret after the "$" so it can't be deleted or typed before
    if (['ArrowLeft', 'Home', 'ArrowUp'].includes(e.key) && expAmt.selectionStart <= 1) e.preventDefault();
  });
  expAmt.addEventListener('click', () => { if (expAmt.selectionStart < 1) caretToEnd(); });

  root.addEventListener('click', (e) => {
    const t = e.target.closest('[data-act]');
    if (!t || !root.contains(t)) return;
    const a = t.dataset.act;
    const arg = t.dataset.arg;
    const map = {
      plus: { type: 'OPEN_PLUS', open: true },
      closePlus: { type: 'OPEN_PLUS', open: false },
      openCreate: { type: 'OPEN_CREATE', open: true },
      closeCreate: { type: 'OPEN_CREATE', open: false },
      draftTime: { type: 'TOGGLE_DRAFT_TIME', time: arg },
      toggleSplit: { type: 'EDIT_DRAFT', field: 'costSplit', value: !act.state().maya.draft.costSplit },
      send: { type: 'SEND_SPACE' },
      vote: { type: 'VOTE', person: who, time: arg },
      join: { type: 'JOIN', person: who },
      lock: { type: 'LOCK_TIME', time: act.state().space ? bestTime(act.state().space) : '8 PM' },
      here: { type: 'ARRIVE', person: who },
      openExpense: { type: 'OPEN_EXPENSE', open: true },
      closeExpense: { type: 'OPEN_EXPENSE', open: false },
      addExpense: { type: 'ADD_EXPENSE' },
      openPay: { type: 'OPEN_PAY', open: true },
      closePay: { type: 'OPEN_PAY', open: false },
      pay: { type: 'PAY', person: who },
      end: { type: 'END_SPACE' },
      keep: { type: 'KEEP_PLAN', keep: true },
      discard: { type: 'KEEP_PLAN', keep: false },
      unlock: { type: 'JORDAN_SCREEN', screen: 'messages' },
      locAllow: { type: 'LOC_ALLOW', person: who },
      locDecline: { type: 'LOC_DECLINE', person: who },
    };
    if (map[a]) act(map[a]);
  });

  function addMessage(m, animate) {
    const mine = m.from === who;
    let node;
    if (m.from === 'system') {
      node = el(`<div class="msg-sys">${m.text}</div>`);
    } else if (m.kind === 'space') {
      node = el(`<div class="msg ${mine ? 'out' : 'in'} msg-card"></div>`);
      if (!mine) node.prepend(el(`<div class="msg-from">${m.from}</div>`));
      const row = el(`<div class="msg-row">${mine ? '' : avatar(m.from, 28, 'msg-av')}</div>`);
      row.append(card);
      node.append(row);
    } else {
      node = el(`<div class="msg ${mine ? 'out' : 'in'}"><div class="msg-from">${m.from}</div><div class="msg-row">${mine ? '' : avatar(m.from, 28, 'msg-av')}<div class="bubble">${m.text}</div></div></div>`);
    }
    // grouping: hide name if same sender as previous, tail only on last of run
    const prev = inner.lastElementChild;
    if (prev && prev.dataset.from === m.from) {
      node.classList.add('cont');
      prev.classList.add('not-last');
    }
    node.dataset.from = m.from;
    if (animate) node.classList.add('enter');
    inner.append(node);
  }

  function scrollDown(smooth) {
    requestAnimationFrame(() => {
      thread.scrollTo({ top: thread.scrollHeight, behavior: smooth && !noAnim() ? 'smooth' : 'auto' });
    });
  }

  function expandIsland(ms = 3200) {
    if (noAnim() || root.matches('.locked, .pay-open, .alert-open, .expense-open, .create-open, .summary-open')) return;
    root.classList.add('isl-open');
    clearTimeout(islandTimer);
    islandTimer = setTimeout(() => root.classList.remove('isl-open'), ms);
  }

  // Toggle a state class on the phone. The matching fx- class gates that
  // state's entry animation, so it plays for live changes only and never
  // restarts after an instant cut between beats.
  function flag(name, on) {
    on = !!on;
    if (root.classList.contains(name) === on) return;
    root.classList.toggle(name, on);
    root.classList.toggle(`fx-${name}`, on && !noAnim());
  }

  function update(s) {
    const sp = s.space;
    const live = s.phase === 'live';
    // status bar clocks
    $$(root, '.sb-time').forEach((n) => setText(n, fmtClock(s.clock)));
    setText(q('.lock-time'), fmtClock(s.clock));

    // messages
    // Append when the thread on screen is a prefix of the new one (so bubbles
    // that are mid-animation are left alone); otherwise rebuild it silently.
    const sigs = s.chat.messages.map(sigOf);
    const grows = rendered.length <= sigs.length && rendered.every((x, i) => x === sigs[i]);
    if (!grows) {
      inner.querySelectorAll('.msg, .msg-sys').forEach((n) => n.remove());
      rendered = [];
      card.classList.remove('fx-state');
      $(card, '.sc-paid').classList.remove('fx');
    }
    const added = sigs.length > rendered.length;
    s.chat.messages.slice(rendered.length).forEach((m) => addMessage(m, grows && !noAnim()));
    rendered = sigs;

    // overlays (Maya)
    const isMaya = who === 'Maya';
    flag('plus-open', isMaya && s.maya.plusMenu);
    flag('create-open', isMaya && s.maya.sheet);
    flag('expense-open', isMaya && s.maya.expenseSheet);
    flag('summary-open', isMaya && s.maya.summary);
    const d = s.maya.draft;
    syncInput(q('.in-name'), d.name);
    syncInput(q('.in-place'), d.place);
    $$(root, '.chip').forEach((c) => cls(c, 'on', d.times.includes(c.dataset.arg)));
    cls(q('.field-toggle'), 'on', d.costSplit);
    cls(q('.sh-send'), 'ready', d.times.length > 0);
    syncInput(q('.in-exp-label'), s.maya.expenseDraft.label);
    syncInput(q('.in-exp-amt'), s.maya.expenseDraft.amount ? '$' + s.maya.expenseDraft.amount : '');

    // Jordan overlays
    const isJ = who === 'Jordan';
    flag('locked', isJ && s.jordan.screen === 'lock');
    flag('alert-open', isJ && s.jordan.locPrompt);
    flag('pay-open', isJ && s.jordan.paySheet);
    flag('pay-success', isJ && s.jordan.payStage === 'done');

    // island
    cls(root, 'isl-live', live);
    if (sp) {
      const here = hereList(sp).length;
      const n = joined(sp).length;
      const tot = total(sp);
      const pp = perPerson(sp);
      const eachLine = tot ? `${money(pp)} each` : '';
      const paidLine = tot ? `${paidCount(sp)} of ${n} paid` : '';
      cls(root, 'has-tot', tot > 0);
      setText(q('.isl-here'), tot ? money(pp) : `${here}/${n}`);
      setText(q('.isx-name'), sp.name);
      setText(q('.isx-place'), `${sp.place} · ${sp.lockedTime || ''}`);
      setText(q('.isx-left'), timeLeft(s));
      setText(q('.isx-herecount'), `${here} of ${n}`);
      setText(q('.isx-costtext'), eachLine);
      setText(q('.isx-costpaid'), paidLine);
      $$(root, '.isx-av').forEach((a) => { cls(a, 'dim', !sp.members[a.dataset.p].here); cls(a, 'gone', !sp.members[a.dataset.p].joined); });
      // lock screen live activity
      setText(q('.la-name'), sp.name);
      setText(q('.la-left'), timeLeft(s));
      setText(q('.la-place-t'), `${sp.place} · ${sp.lockedTime || ''}`);
      setText(q('.la-herecount'), `${here} of ${n}`);
      setText(q('.la-cost-t'), eachLine);
      setText(q('.la-cost-p'), paidLine);
      $$(root, '.la-av').forEach((a) => { cls(a, 'dim', !sp.members[a.dataset.p].here); cls(a, 'gone', !sp.members[a.dataset.p].joined); });

      const sig = `${here}|${paidCount(sp)}|${tot}`;
      if (live && prevPhase === 'chat') expandIsland(3600);
      else if (live && lastSig && sig !== lastSig) expandIsland();
      lastSig = sig;
      updateCard(s, sp);
    } else {
      lastSig = '';
      root.classList.remove('has-tot');
    }
    if (!live) { root.classList.remove('isl-open'); clearTimeout(islandTimer); }
    prevPhase = s.phase;

    if (added) scrollDown(grows);
  }

  function updateCard(s, sp) {
    const me = sp.members[who];
    const state = sp.ended ? 'ended' : s.phase === 'live' ? 'live' : sp.lockedTime ? 'locked' : 'voting';
    if (card.dataset.state !== state) {
      card.dataset.state = state;
      cls(card, 'fx-state', !noAnim());
      scrollDown(true);
    }
    setText($(card, '.sc-status'), { voting: 'Voting', locked: 'Confirmed', live: 'Live', ended: 'Ended' }[state]);
    setText($(card, '.sc-title'), sp.name);
    setText($(card, '.sc-place-t'), sp.place);
    const best = bestTime(sp);
    $$(card, '.sc-pill').forEach((p) => {
      const t = p.dataset.time;
      const shown = sp.times.includes(t);
      p.hidden = !shown;
      cls(card, 'novotes', !voteCount(sp, best));
      setText($(p, '.pill-n'), voteCount(sp, t));
      cls(p, 'mine', sp.votes[who].includes(t));
      cls(p, 'locked', sp.lockedTime === t);
      cls(p, 'dim', !!sp.lockedTime && sp.lockedTime !== t);
    });
    const jn = joined(sp).length;
    if (sp.lockedTime) setText($(card, '.sc-free-t'), `Tonight at ${sp.lockedTime}`);
    else setText($(card, '.sc-free-t'), voteCount(sp, best) ? `${voteCount(sp, best)} of 5 free at ${best}` : 'Waiting for the group to vote');
    $$(card, '.sc-av').forEach((a) => cls(a, 'gone', !sp.members[a.dataset.p].joined));
    setText($(card, '.sc-joined'), `${jn} joined`);

    // roster
    $$(card, '.ros').forEach((r) => {
      const p = r.dataset.p;
      const m = sp.members[p];
      let t = 'On the way';
      let k = 'way';
      if (!m.joined) { t = 'Not joined'; k = 'none'; }
      else if (m.here) { t = 'Here'; k = 'here'; }
      if (sp.ended) { t = ''; k = 'ended'; }
      setText($(r, '.ros-t'), t);
      r.dataset.k = k;
      r.dataset.loc = m.location === 'on' && !sp.ended ? 'on' : '';
    });
    const tot = total(sp);
    const pp = perPerson(sp);
    const pc = paidCount(sp);
    setText($(card, '.sc-cost-t'), tot ? `${sp.expenses[0].label} · ${money(tot)}` : '');
    setText($(card, '.sc-cost-e'), tot ? `${money(pp)} each` : '');
    setText($(card, '.sc-cost-p'), tot ? `${pc} of ${jn} paid` : '');
    $(card, '.sc-cost-bar i').style.transform = `scaleX(${tot ? pc / jn : 0})`;
    cls(card, 'has-cost', tot > 0);

    const live = s.phase === 'live';
    const isMaya = who === 'Maya';
    $(card, '.sc-join').hidden = me.joined || sp.ended;
    $(card, '.sc-lock').hidden = !(isMaya && !sp.lockedTime && s.phase === 'chat');
    setText($(card, '.sc-lock'), `Lock ${best}`);
    $(card, '.sc-here').hidden = !(live && me.joined && !me.here);
    $(card, '.sc-addexp').hidden = !(live && isMaya && sp.costSplitOn);
    const owes = !isMaya && tot > 0 && me.joined && !me.paid;
    $(card, '.sc-pay').hidden = !(live && owes);
    setText($(card, '.sc-pay'), `Pay Maya ${money(pp)}`);
    const paidEl = $(card, '.sc-paid');
    const showPaid = tot > 0 && !isMaya && me.paid;
    if (paidEl.hidden === showPaid) {
      paidEl.hidden = !showPaid;
      cls(paidEl, 'fx', showPaid && !noAnim());
    }
    $(card, '.sc-end').hidden = !(live && isMaya);
    const foot = !sp.ended ? 'Ends at 11 PM' : sp.kept ? 'Kept in chat' : sp.kept === false ? 'Removed from chat' : 'Ended';
    setText($(card, '.sc-foot-t'), foot);
    setText(q('.pay-amt-v'), money2(pp || 8));
    setText(q('.pay-for'), `${sp.expenses[0]?.label || 'Pizza'} · ${sp.name}`);
    setText(q('.exp-prev-t'), s.maya.expenseDraft.amount
      ? `${money(Number(s.maya.expenseDraft.amount) / jn)} each, split with ${jn} people`
      : `Split evenly with the ${jn} people who joined`);
    setText(q('.sum-settled'), pc === jn ? 'Everyone paid' : `${pc} of ${jn} paid`);
    // keep the card in view when it grows (cost row, action buttons)
    const h = card.offsetHeight;
    if (h !== lastCardH) { lastCardH = h; scrollDown(true); }
  }

  function syncInput(inp, v) {
    if (inp && document.activeElement !== inp && inp.value !== v) inp.value = v;
  }

  return { root, update, card, other };
}
