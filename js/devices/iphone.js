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
      <div class="isx-cost"><span class="isx-costtext">No costs yet</span></div>
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
        ${PEOPLE.map((p) => `<div class="ros" data-p="${p}">${avatar(p, 30)}<span class="ros-name">${p === me ? 'You' : p}</span><span class="ros-stat"><i class="dot"></i><span class="ros-t">On the way</span></span></div>`).join('')}
      </div>
      <div class="sc-cost">
        <div class="sc-cost-l"><span class="sc-cost-label">Cost split</span><span class="sc-cost-t">No costs yet</span></div>
        <div class="sc-cost-bar"><i></i></div>
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
    <div class="sc-foot"><span class="sc-foot-t">Ends 11:00 PM</span></div>
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
          <div class="pm-row pm-spaces" data-act="openCreate"><span class="pm-ic pm-ic-spaces">${I.spaces}</span>Spaces<span class="pm-new">New</span></div>
        </div>

        <div class="scrim scrim-sheet" data-act="closeCreate"></div>
        <div class="sheet sheet-create">
          <div class="grabber"></div>
          <div class="sh-head"><button class="sh-cancel" data-act="closeCreate">Cancel</button><b>New Space</b><button class="sh-send" data-act="send">Send</button></div>
          <div class="sh-hero"><span class="sh-hero-ic">${I.spaces}</span><span>Plan it here. It turns itself off after.</span></div>
          <div class="field-group">
            <label class="field"><span class="field-l">Name</span><input class="in-name" placeholder="Friday Hangout" data-field="name" autocomplete="off"></label>
            <label class="field"><span class="field-l">Place</span><input class="in-place" placeholder="Add a place" data-field="place" autocomplete="off"></label>
          </div>
          <div class="field-cap">Times · pick 2–3, the group votes</div>
          <div class="chips">${TIMES.map((t) => `<button class="chip" data-act="draftTime" data-arg="${t}">${I.check}<span>${t}</span></button>`).join('')}</div>
          <div class="field-group">
            <div class="field field-toggle" data-act="toggleSplit"><span class="field-l">${I.cash}Add cost split</span><span class="switch"><i></i></span></div>
            <div class="field field-static"><span class="field-l">${I.location}Location sharing</span><span class="field-v">Off · each person chooses</span></div>
            <div class="field field-static"><span class="field-l">${I.clock}Ends</span><span class="field-v">11:00 PM, automatically</span></div>
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
            <li><span class="sum-li-ic g">${I.cash}</span><span class="sum-settled">Everyone's settled up</span></li>
            <li><span class="sum-li-ic b">${I.locOff}</span>Location sharing stopped for all 5</li>
            <li><span class="sum-li-ic p">${I.tvApp}</span>Living Room TV went back to Home</li>
          </ul>
          <div class="sum-q">Keep the plan in the chat?</div>
          <button class="btn btn-primary btn-wide" data-act="keep">Keep Plan</button>
          <button class="btn btn-plain btn-wide" data-act="discard">Remove</button>
        </div>

        <div class="scrim scrim-pay" data-act="closePay"></div>
        <div class="sheet sheet-pay">
          <div class="pay-head"><span class="pay-brand">${I.cash} Pay</span><button class="pay-x" data-act="closePay">✕</button></div>
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
            <div class="la-cost"><span class="la-cost-t">No costs yet</span></div>
          </div>
          <div class="lock-bottom"><span class="lock-q">${I.flashlight}</span><span class="lock-q">${I.camera}</span></div>
        </div>

        <div class="alert-scrim"></div>
        <div class="alert glass">
          <div class="alert-ic">${I.location}</div>
          <div class="alert-t">Share your location with Friday Hangout?</div>
          <div class="alert-m">Only people in this Space can see it, and it stops automatically when the Space ends at 11:00 PM.</div>
          <button class="alert-b" data-act="locAllow">Share While Space Is Active</button>
          <button class="alert-b alert-b-strong" data-act="locDecline">Don't Allow</button>
        </div>

        ${islandHTML()}
        <div class="home-ind"></div>
      </div>
    </div>
  </div>`);

  const q = (s) => $(root, s);
  const thread = q('.thread');
  const inner = q('.thread-inner');
  const msgEls = new Map();
  const card = el(cardHTML(who));
  let lastSig = '';
  let islandTimer = null;
  let prevPhase = null;

  // ---- inputs (free play) ----
  $$(root, 'input[data-field]').forEach((inp) => inp.addEventListener('input', () => act({ type: 'EDIT_DRAFT', field: inp.dataset.field, value: inp.value }, true)));
  $$(root, 'input[data-efield]').forEach((inp) => inp.addEventListener('input', () => act({ type: 'EDIT_EXPENSE', field: inp.dataset.efield, value: inp.value.replace(/[^0-9.]/g, '') }, true)));

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
    msgEls.set(m.id, node);
  }

  function scrollDown(smooth) {
    requestAnimationFrame(() => {
      thread.scrollTo({ top: thread.scrollHeight, behavior: smooth && !noAnim() ? 'smooth' : 'auto' });
    });
  }

  function expandIsland(ms = 3200) {
    if (noAnim() || root.classList.contains('locked')) return;
    root.classList.add('isl-open');
    clearTimeout(islandTimer);
    islandTimer = setTimeout(() => root.classList.remove('isl-open'), ms);
  }

  function update(s) {
    const sp = s.space;
    const live = s.phase === 'live';
    // status bar clocks
    $$(root, '.sb-time').forEach((n) => setText(n, fmtClock(s.clock)));
    setText(q('.lock-time'), fmtClock(s.clock));

    // messages
    let added = false;
    s.chat.messages.forEach((m) => { if (!msgEls.has(m.id)) { addMessage(m, !noAnim()); added = true; } });
    if (msgEls.size > s.chat.messages.length) {
      // reset happened
      inner.querySelectorAll('.msg, .msg-sys').forEach((n) => n.remove());
      msgEls.clear();
      s.chat.messages.forEach((m) => addMessage(m, false));
      added = true;
    }

    // overlays (Maya)
    const isMaya = who === 'Maya';
    cls(root, 'plus-open', isMaya && s.maya.plusMenu);
    cls(root, 'create-open', isMaya && s.maya.sheet);
    cls(root, 'expense-open', isMaya && s.maya.expenseSheet);
    cls(root, 'summary-open', isMaya && s.maya.summary);
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
    cls(root, 'locked', isJ && s.jordan.screen === 'lock');
    cls(root, 'alert-open', isJ && s.jordan.locPrompt);
    cls(root, 'pay-open', isJ && s.jordan.paySheet);
    cls(root, 'pay-done', isJ && s.jordan.payStage === 'done');

    // island
    cls(root, 'isl-live', live);
    if (sp) {
      const here = hereList(sp).length;
      const n = joined(sp).length;
      const tot = total(sp);
      const pp = perPerson(sp);
      const costLine = tot ? `${sp.expenses[0].label} ${money(tot)} · ${money(pp)} each · ${paidCount(sp)} of ${n} paid` : 'No costs yet';
      const costShort = tot ? `${money(pp)} each · ${paidCount(sp)}/${n} paid` : 'No costs yet';
      setText(q('.isl-here'), tot ? money(pp) : `${here}/${n}`);
      setText(q('.isx-name'), sp.name);
      setText(q('.isx-place'), `${sp.place} · ${sp.lockedTime || ''}`);
      setText(q('.isx-left'), timeLeft(s));
      setText(q('.isx-herecount'), `${here} of ${n}`);
      setText(q('.isx-costtext'), costLine);
      $$(root, '.isx-av').forEach((a) => { cls(a, 'dim', !sp.members[a.dataset.p].here); cls(a, 'gone', !sp.members[a.dataset.p].joined); });
      // lock screen live activity
      setText(q('.la-name'), sp.name);
      setText(q('.la-left'), timeLeft(s));
      setText(q('.la-place-t'), `${sp.place} · ${sp.lockedTime || ''}`);
      setText(q('.la-herecount'), `${here} of ${n}`);
      setText(q('.la-cost-t'), costShort === 'No costs yet' ? 'No costs yet' : `${sp.expenses[0].label} ${money(tot)} · ${costShort}`);
      $$(root, '.la-av').forEach((a) => { cls(a, 'dim', !sp.members[a.dataset.p].here); cls(a, 'gone', !sp.members[a.dataset.p].joined); });

      const sig = `${here}|${paidCount(sp)}|${tot}`;
      if (live && prevPhase === 'chat') expandIsland(3600);
      else if (live && lastSig && sig !== lastSig) expandIsland();
      lastSig = sig;
      updateCard(s, sp);
    } else {
      lastSig = '';
    }
    if (!live) { root.classList.remove('isl-open'); clearTimeout(islandTimer); }
    prevPhase = s.phase;

    if (added) scrollDown(true);
  }

  function updateCard(s, sp) {
    const me = sp.members[who];
    const state = sp.ended ? 'ended' : s.phase === 'live' ? 'live' : sp.lockedTime ? 'locked' : 'voting';
    if (card.dataset.state !== state) {
      card.dataset.state = state;
      scrollDown(true);
    }
    setText($(card, '.sc-status'), { voting: 'Voting', locked: 'Locked in', live: 'Live now', ended: 'Ended' }[state]);
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
    if (sp.lockedTime) setText($(card, '.sc-free-t'), `${voteCount(sp, sp.lockedTime)} of 5 free · locked for ${sp.lockedTime}`);
    else setText($(card, '.sc-free-t'), voteCount(sp, best) ? `${voteCount(sp, best)} of 5 free at ${best}` : 'Waiting for the group to vote');
    $$(card, '.sc-av').forEach((a) => cls(a, 'gone', !sp.members[a.dataset.p].joined));
    setText($(card, '.sc-joined'), `${jn} joined`);

    // roster
    $$(card, '.ros').forEach((r) => {
      const p = r.dataset.p;
      const m = sp.members[p];
      let t = 'On the way';
      let k = 'way';
      if (!m.joined) { t = 'Hasn’t joined'; k = 'none'; }
      else if (m.here && m.location === 'on') { t = 'Here · sharing location'; k = 'here'; }
      else if (m.here && m.location === 'declined') { t = 'Here · location off'; k = 'here-off'; }
      else if (m.here) { t = 'Here'; k = 'here'; }
      else if (m.location === 'declined') { t = 'On the way · location off'; k = 'off'; }
      if (sp.ended) { t = m.here ? 'Was here · sharing off' : 'Sharing off'; k = 'ended'; }
      setText($(r, '.ros-t'), t);
      r.dataset.k = k;
    });
    const tot = total(sp);
    const pp = perPerson(sp);
    const pc = paidCount(sp);
    setText($(card, '.sc-cost-t'), tot ? `${sp.expenses[0].label} ${money(tot)} · ${money(pp)} each · ${pc} of ${jn} paid` : 'No costs yet');
    $(card, '.sc-cost-bar i').style.transform = `scaleX(${tot ? pc / jn : 0})`;
    cls(card, 'has-cost', sp.costSplitOn || tot > 0);

    const live = s.phase === 'live';
    const isMaya = who === 'Maya';
    $(card, '.sc-join').hidden = me.joined || sp.ended;
    $(card, '.sc-lock').hidden = !(isMaya && !sp.lockedTime && s.phase === 'chat');
    setText($(card, '.sc-lock'), `Lock ${best}`);
    $(card, '.sc-here').hidden = !(live && me.joined && !me.here);
    $(card, '.sc-addexp').hidden = !(live && isMaya);
    const owes = !isMaya && tot > 0 && me.joined && !me.paid;
    $(card, '.sc-pay').hidden = !(live && owes);
    setText($(card, '.sc-pay'), `Pay Maya ${money(pp)}`);
    $(card, '.sc-paid').hidden = !(tot > 0 && !isMaya && me.paid);
    $(card, '.sc-end').hidden = !(live && isMaya);
    const foot = sp.ended
      ? sp.kept === false ? 'Ended · removed from chat' : `Ended · ${pc === jn ? 'everyone settled' : `${pc} of ${jn} paid`}${sp.kept ? ' · plan kept' : ''}`
      : live ? `Ends 11:00 PM · ${timeLeft(s)}` : 'Ends automatically at 11:00 PM';
    setText($(card, '.sc-foot-t'), foot);
    setText(q('.pay-amt-v'), money2(pp || 8));
    setText(q('.pay-for'), `${sp.expenses[0]?.label || 'Pizza'} · ${sp.name}`);
    setText(q('.exp-prev-t'), s.maya.expenseDraft.amount
      ? `${money(Number(s.maya.expenseDraft.amount) / jn)} each, split with ${jn} people`
      : `Split evenly with the ${jn} people who joined`);
    setText(q('.sum-settled'), pc === jn ? 'Everyone’s settled up' : `${pc} of ${jn} paid back`);
  }

  function syncInput(inp, v) {
    if (inp && document.activeElement !== inp && inp.value !== v) inp.value = v;
  }

  return { root, update, card, other };
}
