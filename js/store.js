// One shared state store drives every device on the stage.
// Devices subscribe and re-render from the same state, so a change
// made on one device shows up on all of them in the same frame.

export const PEOPLE = ['Maya', 'Jordan', 'Sam', 'Priya', 'Alex'];
export const COLORS = {
  Maya: '#FF9F0A', Jordan: '#0A84FF', Sam: '#5E5CE6', Priya: '#FF375F', Alex: '#30B85A',
};
export const TIMES = ['7 PM', '8 PM', '9 PM'];
export const H = (h, m = 0) => h * 60 + m;

const SEED_CHAT = [
  { id: 'm1', from: 'Sam', text: 'are we doing something friday??' },
  { id: 'm2', from: 'Priya', text: "I'm free after 7 maybe" },
  { id: 'm3', from: 'Alex', text: "can't do before 8 😭" },
  { id: 'm4', from: 'Sam', text: 'wait whose place' },
  { id: 'm5', from: 'Jordan', text: 'whatever works 👍' },
  { id: 'm6', from: 'Priya', text: 'also I covered pizza last time just saying' },
  { id: 'm7', from: 'Sam', text: 'ok so 7? 8? 9?' },
];

export function initialState() {
  return {
    clock: H(16, 12),
    phase: 'chat', // chat | live | ended
    chat: { messages: SEED_CHAT.map((m) => ({ ...m })), seq: 10 },
    maya: {
      plusMenu: false,
      sheet: false,
      summary: false,
      expenseSheet: false,
      draft: { name: '', place: '', times: [], costSplit: false },
      expenseDraft: { label: '', amount: '' },
    },
    space: null,
    jordan: { screen: 'messages', locPrompt: false, paySheet: false, payStage: 'idle' },
    tv: { screen: 'home' },
    ui: { mode: 'guided', beat: 0, captions: true, autoplay: false },
  };
}

function newSpace(draft) {
  const members = {};
  PEOPLE.forEach((p) => {
    members[p] = { joined: p === 'Maya', here: false, location: 'off', paid: false };
  });
  return {
    name: draft.name || 'Friday Hangout',
    place: draft.place || "Maya's apartment",
    times: draft.times.length ? [...draft.times].sort((a, b) => TIMES.indexOf(a) - TIMES.indexOf(b)) : ['8 PM'],
    votes: { Maya: [], Jordan: [], Sam: [], Priya: [], Alex: [] },
    lockedTime: null,
    costSplitOn: !!draft.costSplit,
    members,
    expenses: [],
    endsAt: H(23),
    ended: false,
    kept: null,
  };
}

const clone = (o) => (typeof structuredClone === 'function' ? structuredClone(o) : JSON.parse(JSON.stringify(o)));

function sys(s, text) {
  s.chat.seq += 1;
  s.chat.messages.push({ id: 's' + s.chat.seq, from: 'system', text });
}

export function reducer(prev, a) {
  const s = clone(prev);
  const sp = s.space;
  switch (a.type) {
    case 'RESET': {
      const fresh = initialState();
      fresh.ui = { ...prev.ui, beat: 0 };
      return fresh;
    }
    case 'SET_UI': s.ui = { ...s.ui, ...a.patch }; return s;
    case 'SET_CLOCK': s.clock = a.clock; return s;
    case 'NOOP': return prev;
    case 'MSG':
      s.chat.seq += 1;
      s.chat.messages.push({ id: 'x' + s.chat.seq, from: a.from, text: a.text });
      return s;
    case 'OPEN_PLUS': s.maya.plusMenu = a.open !== false; return s;
    case 'OPEN_CREATE':
      s.maya.plusMenu = false;
      s.maya.sheet = a.open !== false;
      return s;
    case 'EDIT_DRAFT': s.maya.draft[a.field] = a.value; return s;
    case 'TOGGLE_DRAFT_TIME': {
      const t = s.maya.draft.times;
      const i = t.indexOf(a.time);
      if (i >= 0) t.splice(i, 1); else t.push(a.time);
      return s;
    }
    case 'SEND_SPACE': {
      if (sp) return s;
      s.space = newSpace(s.maya.draft);
      s.maya.sheet = false;
      s.maya.plusMenu = false;
      s.chat.seq += 1;
      s.chat.messages.push({ id: 'card', from: 'Maya', kind: 'space' });
      return s;
    }
    case 'JOIN':
      if (sp && !sp.ended) sp.members[a.person].joined = true;
      return s;
    case 'VOTE': {
      if (!sp || sp.lockedTime || sp.ended) return s;
      sp.members[a.person].joined = true;
      const v = sp.votes[a.person];
      const i = v.indexOf(a.time);
      if (a.on === false || (a.on === undefined && i >= 0)) { if (i >= 0) v.splice(i, 1); }
      else if (i < 0) v.push(a.time);
      return s;
    }
    case 'LOCK_TIME':
      if (!sp || sp.ended) return s;
      sp.lockedTime = a.time;
      sys(s, `Maya set the time to ${a.time}`);
      return s;
    case 'GO_LIVE':
      if (!sp || s.phase !== 'chat') return s;
      if (!sp.lockedTime) sp.lockedTime = bestTime(sp);
      s.phase = 'live';
      s.clock = Math.max(s.clock, H(20));
      s.tv.screen = 'board';
      s.jordan.screen = 'lock';
      // Maya is the host and already at the apartment, so she is here the moment
      // the Space goes live (no "On the way" flash before her arrival).
      sp.members.Maya.location = 'on';
      sp.members.Maya.here = true;
      return s;
    case 'JORDAN_SCREEN':
      s.jordan.screen = a.screen;
      if (a.screen === 'messages' && s.phase === 'live' && sp.members.Jordan.location === 'off' && !s.jordan.asked) {
        s.jordan.locPrompt = true;
      }
      return s;
    case 'LOC_ALLOW':
    case 'LOC_DECLINE': {
      if (!sp) return s;
      sp.members[a.person].location = a.type === 'LOC_ALLOW' ? 'on' : 'declined';
      if (a.person === 'Jordan') { s.jordan.locPrompt = false; s.jordan.asked = true; }
      return s;
    }
    case 'ARRIVE':
      if (!sp || s.phase !== 'live') return s;
      sp.members[a.person].joined = true;
      sp.members[a.person].here = true;
      if (a.location && sp.members[a.person].location === 'off') sp.members[a.person].location = 'on';
      return s;
    case 'OPEN_EXPENSE': s.maya.expenseSheet = a.open !== false; return s;
    case 'EDIT_EXPENSE': s.maya.expenseDraft[a.field] = a.value; return s;
    case 'ADD_EXPENSE': {
      if (!sp || s.phase !== 'live') return s;
      const label = a.label || s.maya.expenseDraft.label || 'Pizza';
      const amount = Number(a.amount ?? s.maya.expenseDraft.amount) || 40;
      sp.costSplitOn = true;
      sp.expenses.push({ label, amount, by: 'Maya' });
      sp.members.Maya.paid = true;
      s.maya.expenseSheet = false;
      s.maya.expenseDraft = { label: '', amount: '' };
      if (a.clock) s.clock = a.clock;
      return s;
    }
    case 'OPEN_PAY':
      s.jordan.paySheet = a.open !== false;
      s.jordan.payStage = 'idle';
      return s;
    case 'PAY':
      if (!sp || !sp.expenses.length) return s;
      sp.members[a.person].paid = true;
      if (a.person === 'Jordan') s.jordan.payStage = 'done';
      return s;
    case 'END_SPACE':
      if (!sp || s.phase !== 'live') return s;
      s.phase = 'ended';
      sp.ended = true;
      Object.values(sp.members).forEach((m) => { if (m.location === 'on') m.location = 'off'; });
      s.tv.screen = 'home';
      s.maya.summary = true;
      s.maya.expenseSheet = false;
      s.jordan.paySheet = false;
      s.jordan.locPrompt = false;
      if (s.jordan.screen === 'lock') s.jordan.screen = 'messages';
      if (a.clock) s.clock = a.clock;
      sys(s, `${sp.name} ended`);
      return s;
    case 'KEEP_PLAN':
      s.maya.summary = false;
      if (sp) sp.kept = a.keep !== false;
      return s;
    default:
      return s;
  }
}

// ---------- selectors ----------
export const voteCount = (sp, t) => Object.values(sp.votes).filter((v) => v.includes(t)).length;
export function bestTime(sp) {
  return [...sp.times].sort((a, b) => voteCount(sp, b) - voteCount(sp, a))[0];
}
export const joined = (sp) => PEOPLE.filter((p) => sp.members[p].joined);
export const hereList = (sp) => PEOPLE.filter((p) => sp.members[p].here);
export const total = (sp) => sp.expenses.reduce((n, e) => n + e.amount, 0);
export const perPerson = (sp) => {
  const n = joined(sp).length || 1;
  return total(sp) / n;
};
export const paidCount = (sp) => joined(sp).filter((p) => sp.members[p].paid).length;
export const money = (n) => '$' + (Math.round(n * 100) / 100).toFixed(n % 1 ? 2 : 0);
export const money2 = (n) => '$' + n.toFixed(2);
export function fmtClock(min) {
  let h = Math.floor(min / 60) % 24;
  const m = min % 60;
  h = h % 12 || 12;
  return `${h}:${String(m).padStart(2, '0')}`;
}
export function timeLeft(s) {
  if (!s.space) return '';
  const d = s.space.endsAt - s.clock;
  if (d <= 0) return 'ending';
  const h = Math.floor(d / 60);
  const m = d % 60;
  if (!h) return `${m}m left`;
  return m ? `${h}h ${m}m left` : `${h}h left`;
}

export function createStore(initial = initialState()) {
  let state = initial;
  const subs = new Set();
  return {
    getState: () => state,
    dispatch(action) {
      state = reducer(state, action);
      subs.forEach((fn) => fn(state, action));
      return state;
    },
    replace(next) {
      state = next;
      subs.forEach((fn) => fn(state, { type: '@@replace' }));
    },
    subscribe(fn) { subs.add(fn); return () => subs.delete(fn); },
  };
}
