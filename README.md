# Spaces: interactive prototype

**Live:** https://spaces.patricksemler.dev

Spaces is a temporary Space that starts in the group chat, so a friend group can plan and run one hangout across their Apple devices. When the hangout ends, it turns itself off.

This prototype shows three devices at once: Maya's iPhone (organizer), Jordan's iPhone (joiner), and the Living Room Apple TV in Maya's apartment. All three run on **one shared state store**, so whatever happens on one device shows up on the others in the same frame. That's the point we want judges to see: Spaces is **live and cross-device**. It isn't a static invite.

**PRD:** [PRD.md](PRD.md) in this repo, or the [Google Doc version](https://docs.google.com/document/d/1ts2kW_WFapLaut8p0cIzKxEmA2gLMGyUE3NhrULfXZI/edit?usp=sharing). The scope is iPhone plus one shared Apple TV, and one type of Space: a temporary hangout.

![Step 4: the Space goes live](screenshots/beat-3-live.png)

## How to use it
There are two modes. **Guided** plays the night in six steps. **Free Play** hands you all three devices. Switch with the toggle at the bottom right, or press **F**.

### Guided
- **Intro**: a fresh open holds on a title card. Press **Play demo** (or **Space** / **Enter** / **→**) to start, or **Try it yourself** to go straight to Free Play.
- **Autoplay** is on once the demo starts. Each step plays its taps and typing, a soft finger ripple shows where each tap lands, and the next step starts 3 seconds after the last one finishes. Press **Space** or the play/pause button to pause and step through by hand.
- **Step bar**: back, play/pause, and next on the left; six numbered step dots in the middle (click one to jump there); **Restart** and a keyboard shortcuts panel on the right.
- Going **forward** one step glides from the current state. Going **back** or jumping cuts straight to that step.
- **Outro**: after the last step, a closing card fades in with **Replay** (runs the demo again from step 1), **Try it yourself**, and **Close**.
- **Restart** (or **R**) goes back to the intro card.
- **Take over any time**: tap a working control on a device during the guided run and the script stops. You carry on in Free Play from exactly that state.

### Free Play
Every control on both phones works. Start on Maya's phone with **+**, then **Spaces**. Sam, Priya, and Alex answer on their own, and the caption under the TV always says what you can do next.

The demo follows whatever you choose:

| Choice | What changes |
|---|---|
| **One time** | There's nothing to vote on. The card shows "Tonight at 8 PM" with no poll and no Lock button, and the group just joins |
| **Two or three times** | The group votes, the card shows the leader, and Maya locks it. Sam, Priya, and Alex pick the nearest time that suits them from the ones on offer |
| **Split Costs off** | No Add expense button, no cost tile on the TV, and no money line in the end summary |
| **Split Costs on** | Maya can add as many expenses as she likes. A second one brings the Pay button back for the difference |
| **Jordan doesn't join** | Jordan's phone gets no Lock Screen activity or Dynamic Island when the Space goes live. Joining late still works |
| **Jordan shares location** | The Space checks Jordan in on arrival. Declining means tapping **I'm here** |
| **Ending early** | The summary says who has paid and how much is still owed |
| **Keep or Remove** | Remove takes the card out of the chat on both phones |
| **Your own name and place** | They show up on the card, the Dynamic Island, the Lock Screen, the alert, the summary, and the TV |

The bar at the bottom has **Skip to 8 PM** (whatever time got set) once a time is locked, **Skip to 11 PM** while the Space is live so you can watch it end itself, and **Reset** (or **R**).

### Both modes
- **On a phone** (or any window under 900 px wide): you see one device at a time. Use the Maya / Jordan / TV switcher. It also follows whichever device is being tapped.

| Key | Action |
|---|---|
| → | Next step (starts the demo from the intro card) |
| ← | Previous step, shown in its finished state |
| Space | Start from the intro card; after that, pause or resume autoplay |
| 1–6 | Jump to a step and play it |
| F | Switch between Guided and Free Play |
| H | Hide the controls and captions (for clean screen recording) |
| R | Guided: restart from the intro card. Free Play: reset |
| Esc | Close the intro, outro, or shortcuts panel |

←, →, Space, and 1–6 belong to the guided run and do nothing in Free Play, so they can't wipe out what you've set up.

**URL parameters** (`beat` counts from 0, so `?beat=3` is step 4):

| Parameter | Effect |
|---|---|
| `?beat=3` | Skip the intro, open that step, and play it |
| `&static=1` | Jump straight to the step's finished state, with no animation or autoplay |
| `&autoplay=0` | Start paused |
| `&clean=1` | Hide the controls and captions |
| `&dev=jordan` | On narrow screens, start on `maya`, `jordan`, or `tv` |
| `?mode=free` | Open in Free Play |

Autoplay is also off by default when the system asks for reduced motion.

## Steps
The requirement IDs in the last column are the functional requirements in [PRD.md](PRD.md#functional-requirements). FR-10 (photo, video, and music sharing) is P2 and isn't in the demo.

| # | Step | What happens | PRD requirements |
|---|---|---|---|
| 1 | Today | The plan stalls in the group chat. Maya says she'll make a Space | Problem |
| 2 | Create | Maya opens Spaces from the Messages `+` menu, names it "Friday Hangout" at Maya's apartment, offers 7, 8, and 9 PM, turns on cost splitting, and sends it | FR-01 |
| 3 | Invite | Votes come in live, Jordan joins with one tap and votes, the card shows "4 of 5 free at 8 PM", and Maya locks the time | FR-02, FR-03 |
| 4 | Live | At 8 PM the Dynamic Island, Lock Screen Live Activity, and TV board wake up together. Friends check in. Jordan declines location (off by default) and taps "here" instead | FR-04, FR-06, FR-08, FR-09 |
| 5 | Split | Maya adds Pizza, $40. Every phone and the TV show $8 each. Jordan pays back with an Apple Pay–style sheet | FR-05 |
| 6 | End | Everyone has paid. Maya ends the Space, sharing stops, the TV goes back to Home, and Maya keeps the plan from the "Keep plan?" summary | FR-07 |

## Tech
Plain HTML, CSS, and JS using native ES modules. There's no build step and no runtime dependencies, and the repo root is what gets deployed (GitHub Pages, with the custom domain in `CNAME`).

- `index.html`: the stage (three device slots, captions, intro and outro cards, step bar, mobile switcher)
- `js/store.js`: the pure reducer, the selectors (vote counts, per-person split, who still owes what), and the store
- `js/devices/iphone.js`, `js/devices/tv.js`: each device builds its DOM once, and `update(state)` only changes classes and text, so CSS springs animate on every device together
- `js/beats.js`: the six guided scripts (taps, typing, and store actions with timings)
- `js/director.js`: runs the steps, plus the step bar, keyboard shortcuts, autoplay, intro and outro cards, stage scaling, and the mobile switcher. Free Play lives here too: the simulated friends (driven by the state, so every route works, including taking over mid-run), the captions that follow the state, and the skip buttons
- `js/icons.js`, `js/ui.js`: hand-drawn SVG glyphs and small DOM helpers
- `css/tokens.css`, `css/stage.css`, `css/ios.css`, `css/tvos.css`: design tokens, the stage and controls, and the iPhone and Apple TV screens
- Motion uses CSS `linear()` spring curves on transform and opacity. `prefers-reduced-motion` is respected.
- `screenshots/`: one still per step (`beat-0` to `beat-5`)

Run it locally with `python3 -m http.server`, then open http://localhost:8000.

---
Concept prototype by Product@TAMU students (Fall 2026). Not affiliated with Apple. No Apple logos or assets are used, and all glyphs are hand-drawn approximations.
