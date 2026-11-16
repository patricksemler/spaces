# Product Requirements Document (PRD)

**Product name:** Spaces

**Tagline:** A temporary Space that starts in the group chat so a friend group can plan and run one hangout across their Apple devices. When the hangout ends, it turns itself off.

**Team:** Product@TAMU, Apple team (Seamless Ecosystem prompt)

**Contributors:** Patrick Semler, Benjamin Aleman, Bhuvan Taliyakula, Diya Raj, Liam West

**Prototype:** [spaces.patricksemler.dev](https://spaces.patricksemler.dev) (interactive demo of the full flow)

**Resources:** [MVP + Prioritization Matrix Deliverable](https://docs.google.com/document/d/1S6kfDOHCfKETfV676o2o1yMP0QOPr4XOVpnjwf3l3y0/edit), [Research & User Persona](https://docs.google.com/document/d/1ZA6mgA6fKMqMzLd2dPdI82LgzYUM5DJS9imPPiThmco/edit), [Kickoff & Scoping](https://docs.google.com/document/d/1r3A4MygzdrTEIJ5X48EDs0MXy_tDkG_EWarfPLnXeDM/edit)

**Google Doc version:** [Spaces PRD - Final Submission](https://docs.google.com/document/d/1ts2kW_WFapLaut8p0cIzKxEmA2gLMGyUE3NhrULfXZI/edit?usp=sharing)

**Last updated:** November 16, 2026

---

# 1. Problem Alignment

## Problem Statement

Apple devices adapt to each person individually, but not to a group of friends. For socially active college students, that means planning and running a hangout takes a lot of manual coordination in the group chat and on everyone's phone. Our research shows the biggest pains come before the hangout: availability keeps changing, nobody can decide what to do, and costs get split by hand.

## Why It Matters

- **For users:** Everyone in our survey plans only in group chats. Plans get buried in the chat, availability keeps changing, and costs are split by hand in other apps. The organizer ends up doing most of the work. People who just join want an easy, private way to see who's coming and pay each other back.
- **For the business:** Spaces is about keeping people in the Apple ecosystem, not about selling new iPhones. It makes the Apple devices a friend group already owns more useful together. It also gives a group a reason to buy a shared accessory, like an Apple TV or HomePod for an apartment or dorm.
- **For the team and technology:** Every device has to stay in sync for the length of a hangout without draining the battery or sending constant notifications. Location sharing has to feel safe.

## Evidence and Research

- **User feedback:** Our survey has 10 responses. Everyone on the final version of the form plans only in group chats, splits costs by hand, and struggles to decide what to do. Changing availability was the biggest pain in the earlier responses (4 of 6). People are split on sharing their location, even for a short time. Sharing that turns off on its own was a must-have.
- **Product data:** None yet. We would measure repeat use in a later pilot.
- **Market research:** Apple Invites already handles RSVPs, shared albums, and playlists. But an invite is static: it's a page you send once and check.
- **Current limitations:** Most friend groups are mostly on iPhone, but not entirely. One survey respondent owns no Apple devices. Ten responses is also a small sample.
- **Key takeaways:** The pain before the hangout is well supported by our research. The pain during the hangout (sharing location, AirDropping photos, connecting a speaker from every phone) is not as well supported yet, because nobody listed device setup as a top pain. We plan a few follow-up interviews to check it. Until then, the during-hangout features stay at P1 and P2.

## Proposed Direction

Spaces lets students start a Space directly from a group chat for one hangout. It begins at the planning stage: friends join with one tap, pick the times that work for them, and see one live plan. During the hangout, their iPhones and one shared Apple TV show the plan, who's coming, and the cost split. Location sharing is an optional toggle that is off by default. When the Space ends, everything turns off automatically.

**Isn't this just Apple Invites?** No. Invites is static: it's a page you send once and check. Spaces is live. The plan updates as people's availability changes, and it changes how everyone's devices behave during the hangout (a Live Activity on each iPhone, the shared Apple TV, and sharing that turns itself off at the end).

**Why does Apple have to build this?** Spaces depends on parts of the system that App Store apps can't control: Messages, the Dynamic Island and Live Activities, Apple TV, and turning off sharing permissions automatically.

**Scope.** Following feedback from our mentor, Himel Saha, we narrowed the scope to iPhone plus one shared Apple TV, and to one type of Space: a temporary hangout. That fits our research best.

## User Scenarios

| User type | What they need |
|---|---|
| First-time user | Maya (the Social Coordinator) wants to start a hangout from the group chat without a new app. She wants to collect everyone's availability without a lot of back-and-forth, and she wants friends to join with one tap and no setup. |
| Experienced user | After a few hangouts, Maya is tired of repeating the same manual steps every time: sharing location, AirDropping photos, connecting a speaker, and chasing arrival times and payments. She wants the Space to handle those for her. |
| Returning user | Jordan (the Lowkey Joiner) joins plans instead of starting them, and wants to know who's actually coming before committing. A group counts as returning when it starts another Space for its next hangout. |
| Edge-case user | A friend who declines location sharing. A group whose plans change. A Space that ends early. |

## Goals and Success Measures

| Priority | Goal | How we'll measure it |
|---|---|---|
| 1 | Friend groups keep using Spaces (main metric) | The share of friend groups that start another Space within 30 days. We'll set the target after a pilot. |
| 2 | Less manual coordination | Planning a hangout takes 3–4 separate coordination steps in the group chat today. In Spaces it takes 1. |
| 3 | Easy to start and understand | At least 4 of 6 testers start a Space and invite friends without help, and can explain in their own words how Spaces differs from Apple Invites. |
| 4 | People feel comfortable with privacy (guardrails) | We watch how many people turn location sharing off, how many Spaces are ended early, and whether anyone is confused about what's being shared. Target: a survey score of 4 out of 5 or higher. |

## Out of Scope

| Item | Why it's out of scope |
|---|---|
| Devices other than iPhone and one shared Apple TV (Mac, iPad, Apple Watch, AirPods, HomePod) | We want to test the core flow first. Everything else can wait. |
| Other types of Space, like a permanent dorm Space or a party Space | We're only building the temporary hangout Space. |
| Anything low priority in the prioritization matrix (visual polish, templates) | The MVP doesn't need to be polished in its early stages. |
| Building more than the one flow we demo | We're only fully building start, invite, join, and end. |

## Problem Review

| Reviewer | Team / Role | Status | Comments |
|---|---|---|---|
| Patrick Semler | Leadership (project lead) | Agree | |
| Benjamin Aleman | Team member | Agree | |
| Bhuvan Taliyakula | Team member | Agree | |
| Diya Raj | Team member | Agree | |
| Liam West | Team member | Agree | |

**Ready to move on when:** The problem, target users, goals, scope boundaries, and supporting evidence have been reviewed and agreed upon.

---

# 2. Solution Alignment

## Solution Overview

**Features and Priorities**

| Feature | Description | Effort | Expected value | Priority | Release |
|---|---|---|---|---|---|
| Start and join from the group chat | The organizer taps the + button in a Messages group chat, chooses Create Space, and adds a name, a place, and 2–3 time options. Members get an invite card in the chat and join with one tap. | Medium | High | P0 | MVP |
| Shared Space page with availability picker | Members pick the times that work for them on the invite card, and the plan updates for everyone as answers come in. The page shows who joined, the times, the meeting place, and who has arrived. | Medium | High | P0 | MVP |
| Shared cost split | One cost split that everyone in the Space can see and pay their share back from. | Medium | High | P0 | MVP |
| Location off by default, and automatic turn-off | Location sharing is a toggle that is off by default. Everyone can see the end time, the organizer can end the Space early, and all sharing turns off when it ends. | Medium | High | P0 | MVP |
| Live Activity and shared Apple TV | A Live Activity (Dynamic Island and Lock Screen) to check on a live Space at a glance, and one shared Apple TV that shows the plan, who's coming, and the cost split during the hangout. | High | Medium | P1 | MVP, depending on follow-up interviews |
| Photo, video, and music sharing | Share to everyone's phones and the shared Apple TV. | High | Low | P2 | After testing |
| Polished design and templates | Visual polish, and presets for other kinds of hangouts. | Medium | Low | P3 | Later |

**Priority definitions**

- **P0 (Required):** The release cannot deliver its core value without it.
- **P1 (Important):** Strongly contributes to the intended outcome.
- **P2 (Optional):** Useful, but can be deferred.
- **P3 (Later):** Worth revisiting when there's more evidence, demand, or capacity.

## Key User Flows

**Prototype:** [spaces.patricksemler.dev](https://spaces.patricksemler.dev). It walks through this flow on three devices at once: the organizer's iPhone, a joiner's iPhone, and the shared Apple TV.

**Primary flow**

- **Entry point:** The organizer opens the group chat in Messages, taps the + button, and chooses Create Space.
- **Getting started:** The organizer adds a name, a place, and 2–3 time options. An invite card appears in the chat.
- **Main action:** Group members join with one tap and pick the times that work for them. The card shows how many people are free at each time, and the organizer locks in the final time. Members choose what they want to share. Location stays off unless they turn it on.
- **System response:** The Space page updates for everyone: who joined, the time, the meeting place, who has arrived, and the cost split. During the hangout, everyone's iPhone and the one shared Apple TV show the same plan.
- **Successful outcome:** Members check the details whenever they need to, so nobody has to keep asking for the time or place, and costs are split in one place.
- **Returning later:** When the Space ends, temporary sharing stops and members are asked what they want to keep. The group can start a new Space for their next hangout.

**Alternative flows and edge cases**

- A friend declines location sharing and can still use everything else in the Space.
- Plans change: when someone's availability changes, the plan updates for everyone.
- The Space ends early: the organizer can end it at any time, and sharing turns off right away.

## Functional Requirements

| ID | Requirement | Priority | Acceptance criteria |
|---|---|---|---|
| FR-01 | The organizer can create a Space from a Messages group chat with a name, a place, and 2–3 time options. | P0 | An invite card with the name, place, and times appears in the group chat. |
| FR-02 | A member can join with one tap. | P0 | After one tap the member shows as joined, with no setup on their phone. |
| FR-03 | Members can pick the times that work for them on the invite card, and the organizer can lock in the final time. | P0 | When someone changes their times, the plan updates for everyone in the Space. Once the organizer locks a time, everyone sees it as the final time. |
| FR-04 | The shared Space page shows who joined, the time, the meeting place, and who has arrived. | P0 | Everyone in the Space sees the same up-to-date page. |
| FR-05 | The Space has one shared cost split that everyone can see and pay back from. | P0 | Every member can see what they owe and pay it back from inside the Space. |
| FR-06 | Location sharing is an optional toggle that is off by default. | P0 | No location is shared until a member turns it on. Declining doesn't block anything else. |
| FR-07 | Every Space has an end time that everyone can see. The organizer can end the Space early. All sharing turns off automatically when it ends. | P0 | When the Space ends, on time or early, all temporary sharing stops and members are asked what they want to keep. |
| FR-08 | A Live Activity (Dynamic Island and Lock Screen) shows a live Space without constant notifications. | P1 | It only updates when something changes, and notifications are bundled into one. |
| FR-09 | One shared Apple TV shows the plan, who's coming, and the cost split during the hangout. | P1 | The Apple TV matches the shared Space page and stops showing it when the Space ends. |
| FR-10 | Members can share photos, video, and music to everyone's phones and the shared Apple TV. | P2 | To be defined if the follow-up interviews show a need. |

## Solution Review

| Reviewer | Team / Role | Status | Comments |
|---|---|---|---|
| Patrick Semler | Leadership (project lead) | Agree | |
| Benjamin Aleman | Team member | Agree | |
| Bhuvan Taliyakula | Team member | Agree | |
| Diya Raj | Team member | Agree | |
| Liam West | Team member | Agree | |

**Ready to move on when:** The team has reviewed the proposed scope, priorities, requirements, dependencies, and acceptance criteria.
