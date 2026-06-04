# TODOS

## P2 — Narrative tour beats (Approach C)
**What:** Turn the Branch-2 city flythrough into a guided *story* that argues the income
disparity, instead of a generic tour.

**Why:** The whole goal is a no-dataviz-context friend understanding it. A scripted arc
lands the metaphor harder than a flythrough with captions alone.

**How:** Reuse the Branch-2 tour timeline + the existing selection-dim shader. Beat sequence:
national-average framing → a Tier-1 giant → push into the gold ultra-rich apex while every
other pyramid desaturates (dim-shader, already built) → end on Khurja as a human anchor.
Plus a HUD-hidden "cinematic mode" for clean capture.

**Depends on:** Branch 2 tour timeline (`tour.ts` + `useTour`) existing. Not a blocker for
the engine.

**Context:** Surfaced in /office-hours (Approach C) and /plan-eng-review on 2026-06-04.
Design doc: `~/.gstack/projects/india-pyramids/uddit-main-design-20260604-233127.md`
("north star: B's engine + C's choreography").
