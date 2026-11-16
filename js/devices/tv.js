import { I } from '../icons.js';
import { el, $, $$, setText, cls, avatar } from '../ui.js';
import { PEOPLE, joined, hereList, total, perPerson, paidCount, money, fmtClock, timeLeft } from '../store.js';

const APPS = [
  ['TV', I.tvApp, 'linear-gradient(160deg,#2c2c2e,#000)'],
  ['Music', I.music, 'linear-gradient(160deg,#ff5f6d,#fc3c44)'],
  ['Photos', I.photos, 'linear-gradient(160deg,#fff,#e9e9ee)'],
  ['Fitness', I.run, 'linear-gradient(160deg,#2b2b2b,#0a0a0a)'],
  ['Arcade', I.game, 'linear-gradient(160deg,#ff453a,#c81d4a)'],
  ['Settings', I.gear, 'linear-gradient(160deg,#8e8e93,#5a5a5f)'],
];

export function createTV() {
  const root = el(`
  <div class="tv">
    <div class="tv-bezel">
      <div class="tv-screen">
        <div class="tv-home">
          <div class="tvh-shelf">
            <div class="tvh-art"><div class="tvh-art-glow"></div></div>
            <div class="tvh-shelf-copy">
              <span class="tvh-kicker">Up Next</span>
              <b class="tvh-shelf-title">Movie Night Picks</b>
              <span class="tvh-shelf-sub">Continue watching</span>
            </div>
            <div class="tvh-spaces">
              <span class="tvh-sp-ic">${I.spaces}</span>
              <div><b class="tvh-sp-name">Friday Hangout</b><span class="tvh-sp-sub">Tonight · 8 PM · here</span></div>
            </div>
          </div>
          <div class="tvh-clock">4:12</div>
          <div class="tvh-row">
            ${APPS.map(([n, ic, bg], i) => `<div class="tvh-app ${i === 0 ? 'focus' : ''}"><span class="tvh-icon" style="background:${bg}">${ic}</span><span class="tvh-name">${n}</span></div>`).join('')}
          </div>
        </div>

        <div class="tv-board">
          <div class="tvb-bg"></div>
          <div class="tvb-top">
            <span class="tvb-badge">${I.spaces} Space · Live</span>
            <span class="tvb-clock">8:00</span>
          </div>
          <div class="tvb-title">Friday Hangout</div>
          <div class="tvb-meta"><span>${I.clock}<b class="tvb-time">8:00 PM</b></span><span>${I.pin}<b class="tvb-place">Maya's apartment</b></span><span class="tvb-left">Ends 11:00 PM</span></div>
          <div class="tvb-grid">
            <div class="tvb-tile tvb-people">
              <div class="tvb-tile-h"><span>Who's here</span><b class="tvb-herecount">1 of 5</b></div>
              <div class="tvb-avs">
                ${PEOPLE.map((p) => `<div class="tvb-p" data-p="${p}">${avatar(p, 64)}<b>${p}</b><span class="tvb-p-s">On the way</span></div>`).join('')}
              </div>
            </div>
            <div class="tvb-tile tvb-cost">
              <div class="tvb-tile-h"><span>Cost split</span><span class="tvb-cost-ic">${I.cash}</span></div>
              <div class="tvb-cost-big">—</div>
              <div class="tvb-cost-sub">Nothing to split yet</div>
              <div class="tvb-cost-bar"><i></i></div>
              <div class="tvb-cost-paid">&nbsp;</div>
            </div>
          </div>
          <div class="tvb-note">${I.locOff}<span class="tvb-note-t">Location off for Jordan</span></div>
        </div>
      </div>
    </div>
    <div class="tv-stand"><div class="tv-neck"></div><div class="tv-foot"></div></div>
    <div class="atv-box"></div>
  </div>`);

  const q = (s) => $(root, s);

  function update(s) {
    const sp = s.space;
    cls(root, 'on-board', s.tv.screen === 'board');
    setText(q('.tvh-clock'), fmtClock(s.clock));
    setText(q('.tvb-clock'), fmtClock(s.clock));
    cls(root, 'shelf-space', !!(sp && sp.lockedTime && s.phase === 'chat'));
    if (!sp) return;
    setText(q('.tvh-sp-name'), sp.name);
    setText(q('.tvh-sp-sub'), `Tonight · ${sp.lockedTime || ''} · ${sp.place}`);
    setText(q('.tvb-title'), sp.name);
    setText(q('.tvb-time'), (sp.lockedTime || '8 PM').replace(' PM', ':00 PM'));
    setText(q('.tvb-place'), sp.place);
    setText(q('.tvb-left'), `Ends 11:00 PM · ${timeLeft(s)}`);
    const jn = joined(sp).length;
    setText(q('.tvb-herecount'), `${hereList(sp).length} of ${jn}`);
    $$(root, '.tvb-p').forEach((n) => {
      const m = sp.members[n.dataset.p];
      cls(n, 'here', m.here);
      cls(n, 'gone', !m.joined);
      setText($(n, '.tvb-p-s'), m.here ? 'Here' : m.joined ? 'On the way' : 'Invited');
    });
    const tot = total(sp);
    const pc = paidCount(sp);
    cls(q('.tvb-cost'), 'has', tot > 0);
    setText(q('.tvb-cost-big'), tot ? `${money(perPerson(sp))} each` : '—');
    setText(q('.tvb-cost-sub'), tot ? `${sp.expenses[0].label} ${money(tot)} · paid by Maya` : 'Nothing to split yet');
    setText(q('.tvb-cost-paid'), tot ? `${pc} of ${jn} paid` : ' ');
    q('.tvb-cost-bar i').style.transform = `scaleX(${tot ? pc / jn : 0})`;
    cls(q('.tvb-note'), 'show', sp.members.Jordan.location === 'declined');
  }

  return { root, update };
}
