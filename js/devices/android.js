import { I } from '../icons.js';
import { el, $, $$, setText, cls, avatar } from '../ui.js';
import { PEOPLE, TIMES, voteCount, bestTime, joined, total, perPerson, paidCount, money, fmtClock } from '../store.js';

// A generic Android phone with a neutral browser showing the Spaces web link.
// It renders whichever store it is bound to (the live one in Free Play,
// a "rewind" store in the guided cutaway).
export function createAndroid(act) {
  const root = el(`
  <div class="android">
    <div class="an-frame">
      <div class="an-screen">
        <div class="an-sb"><span class="an-time">7:31</span><span class="an-hole"></span><span class="an-icons">${I.wifi}${I.signal}<span class="an-bat"></span></span></div>
        <div class="an-url"><span class="an-lock">${I.lock}</span><span class="an-url-t">spaces.link/s/friday-hangout</span><span class="an-dots">${I.dots}</span></div>
        <div class="an-page">
          <div class="wv-kicker">${I.spaces} Maya invited you</div>
          <div class="wv-title">Friday Hangout</div>
          <div class="wv-place">${I.pin}<span class="wv-place-t">Maya's apartment</span></div>
          <div class="wv-h">When works for you?</div>
          <div class="wv-times">${TIMES.map((t) => `<button class="wv-time" data-act="vote" data-arg="${t}"><span class="wv-t">${t}</span><span class="wv-bar"><i></i></span><span class="wv-n">0</span><span class="wv-chk">${I.check}</span></button>`).join('')}</div>
          <div class="wv-free">3 of 5 free at 8 PM</div>
          <div class="wv-h">Going</div>
          <div class="wv-avs">${PEOPLE.map((p) => avatar(p, 30, 'wv-av')).join('')}</div>
          <div class="wv-h">Cost split</div>
          <div class="wv-cost"><span class="wv-cost-t">No costs yet</span><button class="wv-pay" data-act="pay">Pay Maya $8</button><span class="wv-paid">${I.check} Paid</span></div>
          <div class="wv-foot">Get the full experience on iPhone</div>
        </div>
        <div class="an-nav"><i></i></div>
      </div>
    </div>
  </div>`);
  const q = (s) => $(root, s);

  root.addEventListener('click', (e) => {
    const t = e.target.closest('[data-act]');
    if (!t) return;
    if (t.dataset.act === 'vote') act({ type: 'VOTE', person: 'Alex', time: t.dataset.arg });
    if (t.dataset.act === 'pay') act({ type: 'PAY', person: 'Alex' });
  });

  function update(s) {
    setText(q('.an-time'), fmtClock(s.clock));
    const sp = s.space;
    cls(root, 'empty', !sp);
    if (!sp) return;
    setText(q('.wv-title'), sp.name);
    setText(q('.wv-place-t'), sp.place + (sp.lockedTime ? ` · ${sp.lockedTime}` : ''));
    const best = bestTime(sp);
    $$(root, '.wv-time').forEach((b) => {
      const t = b.dataset.arg;
      b.hidden = !sp.times.includes(t);
      const n = voteCount(sp, t);
      setText($(b, '.wv-n'), n);
      $(b, '.wv-bar i').style.transform = `scaleX(${n / 5})`;
      cls(b, 'mine', sp.votes.Alex.includes(t));
      cls(b, 'locked', sp.lockedTime === t);
    });
    setText(q('.wv-free'), sp.lockedTime ? `Locked in for ${sp.lockedTime}` : (voteCount(sp, best) ? `${voteCount(sp, best)} of 5 free at ${best}` : 'No votes yet'));
    $$(root, '.wv-av').forEach((a) => cls(a, 'gone', !sp.members[a.dataset.p].joined));
    const tot = total(sp);
    const jn = joined(sp).length;
    setText(q('.wv-cost-t'), tot ? `${sp.expenses[0].label} ${money(tot)} · ${money(perPerson(sp))} each · ${paidCount(sp)} of ${jn} paid` : 'No costs yet. Maya will add them here.');
    setText(q('.wv-pay'), `Pay Maya ${money(perPerson(sp))}`);
    q('.wv-pay').hidden = !(tot > 0 && !sp.members.Alex.paid);
    q('.wv-paid').hidden = !(tot > 0 && sp.members.Alex.paid);
  }

  return { root, update };
}
