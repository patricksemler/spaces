// Guided demo beats. Each beat's script runs from the end state of the
// previous beat. Steps: { d: ms delay before, a: action, tap: [device, selector],
// type: [device, selector, field, text] (typing macro), focus }
import { H } from './store.js';

const M = 'maya';
const J = 'jordan';
const T = 'tv';

export const BEATS = [
  {
    key: 'today',
    title: 'Today: plans die in the group chat',
    line: 'Seven messages in, there’s still no time, no place, and no idea who’s paying.',
    script: [
      { d: 700, a: { type: 'MSG', from: 'Priya', text: 'I can do 8 if it’s close' } },
      { d: 1100, a: { type: 'MSG', from: 'Alex', text: 'can someone just decide lol' } },
      { d: 1200, a: { type: 'MSG', from: 'Maya', text: 'ok on it. making a Space' }, focus: M },
    ],
  },
  {
    key: 'create',
    title: 'Maya starts a Space from the + menu',
    line: 'Name, place, and 2–3 times. It lives in the chat everyone already uses.',
    script: [
      { d: 600, tap: [M, '.ib-plus'], a: { type: 'OPEN_PLUS', open: true } },
      { d: 900, tap: [M, '.pm-spaces'], a: { type: 'OPEN_CREATE', open: true } },
      { d: 700, type: [M, '.in-name', 'name', 'Friday Hangout'] },
      { d: 300, type: [M, '.in-place', 'place', 'Maya’s apartment'] },
      { d: 350, tap: [M, '.chip[data-arg="7 PM"]'], a: { type: 'TOGGLE_DRAFT_TIME', time: '7 PM' } },
      { d: 300, tap: [M, '.chip[data-arg="8 PM"]'], a: { type: 'TOGGLE_DRAFT_TIME', time: '8 PM' } },
      { d: 300, tap: [M, '.chip[data-arg="9 PM"]'], a: { type: 'TOGGLE_DRAFT_TIME', time: '9 PM' } },
      { d: 450, tap: [M, '.field-toggle .switch'], a: { type: 'EDIT_DRAFT', field: 'costSplit', value: true } },
      { d: 650, tap: [M, '.sh-send'], a: { type: 'SEND_SPACE' } },
      { d: 900, a: { type: 'NOOP' }, focus: J },
    ],
  },
  {
    key: 'invite',
    title: 'One tap to join. Votes update live for everyone',
    line: 'No app to download, no account. The card is the plan, and it changes as people answer.',
    script: [
      { d: 500, tap: [M, '.sc-pill[data-time="8 PM"]'], a: { type: 'VOTE', person: 'Maya', time: '8 PM', on: true } },
      { d: 300, tap: [M, '.sc-pill[data-time="9 PM"]'], a: { type: 'VOTE', person: 'Maya', time: '9 PM', on: true } },
      { d: 700, a: { type: 'VOTE', person: 'Sam', time: '7 PM', on: true } },
      { d: 150, a: { type: 'VOTE', person: 'Sam', time: '8 PM', on: true } },
      { d: 600, a: { type: 'VOTE', person: 'Priya', time: '8 PM', on: true } },
      { d: 600, a: { type: 'VOTE', person: 'Alex', time: '9 PM', on: true } },
      { d: 800, tap: [J, '.sc-join'], a: { type: 'JOIN', person: 'Jordan' } },
      { d: 600, tap: [J, '.sc-pill[data-time="8 PM"]'], a: { type: 'VOTE', person: 'Jordan', time: '8 PM', on: true } },
      { d: 1300, tap: [M, '.sc-lock'], a: { type: 'LOCK_TIME', time: '8 PM' } },
      { d: 600, a: { type: 'NOOP' }, focus: T },
    ],
  },
  {
    key: 'live',
    title: 'At 8 PM the Space goes live on every device',
    line: 'Dynamic Island, Lock Screen, and the apartment Apple TV. Location stays off unless you say yes.',
    script: [
      { d: 400, a: { type: 'SET_CLOCK', clock: H(19, 59) } },
      { d: 900, a: { type: 'GO_LIVE' }, focus: T },
      { d: 1800, a: { type: 'ARRIVE', person: 'Sam', location: true } },
      { d: 1000, a: { type: 'ARRIVE', person: 'Priya', location: true }, focus: M },
      { d: 1500, tap: [J, '.lock-la'], a: { type: 'JORDAN_SCREEN', screen: 'messages' } },
      { d: 1400, tap: [J, '.alert-b-strong'], a: { type: 'LOC_DECLINE', person: 'Jordan' } },
      { d: 900, tap: [J, '.sc-here'], a: { type: 'ARRIVE', person: 'Jordan' } },
      { d: 1000, a: { type: 'ARRIVE', person: 'Alex' }, focus: T },
    ],
  },
  {
    key: 'split',
    title: 'Pizza: $40. Everyone sees $8 each',
    line: 'Maya adds it once. The split shows up on every phone and the TV, and Jordan pays back in two taps.',
    script: [
      { d: 300, a: { type: 'SET_CLOCK', clock: H(20, 47) } },
      { d: 500, tap: [M, '.sc-addexp'], a: { type: 'OPEN_EXPENSE', open: true } },
      { d: 700, type: [M, '.in-exp-label', 'label', 'Pizza', 'EDIT_EXPENSE'] },
      { d: 250, type: [M, '.in-exp-amt', 'amount', '40', 'EDIT_EXPENSE'] },
      { d: 700, tap: [M, '.sheet-expense .sh-send'], a: { type: 'ADD_EXPENSE' } },
      { d: 1600, a: { type: 'PAY', person: 'Sam' }, focus: T },
      { d: 1100, tap: [J, '.sc-pay'], a: { type: 'OPEN_PAY', open: true } },
      { d: 1300, tap: [J, '.pay-confirm'], a: { type: 'PAY', person: 'Jordan' } },
      { d: 1500, a: { type: 'OPEN_PAY', open: false }, focus: T },
    ],
  },
  {
    key: 'end',
    title: 'Maya ends it. Everything turns itself off',
    line: 'Sharing stops for everyone, the TV goes back to Home, and Maya picks what to keep.',
    script: [
      { d: 400, a: { type: 'PAY', person: 'Priya' } },
      { d: 700, a: { type: 'PAY', person: 'Alex' } },
      { d: 600, a: { type: 'SET_CLOCK', clock: H(22, 41) } },
      { d: 900, tap: [M, '.sc-end'], a: { type: 'END_SPACE' }, focus: T },
      { d: 2400, tap: [M, '.sheet-summary .btn-primary'], a: { type: 'KEEP_PLAN', keep: true }, focus: M },
    ],
  },
];
