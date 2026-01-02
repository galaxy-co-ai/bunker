# BUNKER — Boot Sequence (Shot List)

This shot list is written for production.
It assumes the **Silent Ritual** direction: minimal hum + relays, no narration, no music.

Two modes share the same language:
- **STANDARD:** condensed cut (10–14s)
- **CEREMONIAL:** extended cut (35–55s)

---

## 0) Global Cinematic Rules
- **Camera language:** locked-off, engineered framing, symmetrical when possible.
- **Motion:** slow settle, minimal easing, no “UI swoosh.”
- **Typography:** placard headings + monospace telemetry; short lines.
- **Audio:** one continuous hum bed; relay clicks only at state changes.
- **State lamp:** visible in every shot (or implied via HUD corner), transitions are meaningful events.

---

## 1) STANDARD CUT — 10–14 seconds

### S01 — BLACK / WAKE
- **Duration:** 0.8s
- **Visual:** black → faint phosphor noise emerges.
- **UI:** none initially.
- **Audio:** hum fades in from silence.

### S02 — INSTRUMENT GLASS EMERGENCE
- **Duration:** 1.0s
- **Visual:** CRT curvature becomes apparent; scanline stabilizes.
- **UI Text:** `FACILITY WAKE SEQUENCE`
- **State Lamp:** OFFLINE → PROCESSING (single relay click).

### S03 — ACCESS GATE CHECK
- **Duration:** 1.2s
- **Visual:** a small “access plate” illuminates.
- **UI Text:** `ACCESS GATE: VERIFIED`
- **Audio:** two fast relays (verify + lock).

### S04 — POWER BUS
- **Duration:** 1.0s
- **UI Text:** `POWER BUS: NOMINAL`
- **Visual:** one gauge needle settles; lamp turns steady.

### S05 — CORE BAY ONLINE
- **Duration:** 1.2s
- **UI Text:** `CORE BAY: ONLINE`
- **Visual:** rack lamp row resolves from flicker to steady.

### S06 — ARCHIVE STACKS MOUNTED
- **Duration:** 1.0s
- **UI Text:** `ARCHIVE STACKS: MOUNTED`
- **Visual:** “mount” indicator plate flips/illuminates.

### S07 — VECTOR VAULT READY
- **Duration:** 1.0s
- **UI Text:** `VECTOR VAULT: INDEX READY`
- **Visual:** thin line graph draws in, then holds.

### S08 — ROUTER TABLE LOADED
- **Duration:** 1.1s
- **UI Text:** `ROUTER CONSOLE: TABLE LOADED`
- **Visual:** table rows populate instantly; no scrolling.

### S09 — OBSERVATION DECK ACTIVE
- **Duration:** 1.0s
- **UI Text:** `OBSERVATION DECK: ACTIVE`
- **Visual:** a single trace indicator pulses once then steadies.

### S10 — INTEGRITY PASS
- **Duration:** 1.1s
- **UI Text:**
  - `INTEGRITY: PASS`
  - `INCIDENTS: NONE`
- **Audio:** one relay click (pass latch).

### S11 — COMMAND THEATER ONLINE
- **Duration:** 1.0s
- **UI Text:** `COMMAND THEATER: ONLINE`
- **Location Path:** `OPS / COMMAND THEATER / MAIN CONSOLE`
- **State Lamp:** PROCESSING → STABLE (settle sound: single heavy relay).

### S12 — HANDOFF
- **Duration:** 0.6s + 0.3–0.5s stillness
- **UI Text:** `OPERATOR CONTROL ENABLED`
- **Visual:** slight dim/bright “lock” on the text (one-frame) then still.
- **Input:** becomes active after stillness.

---

## 2) CEREMONIAL CUT — 35–55 seconds

### C01 — BLACK / HUM ARRIVAL
- **Duration:** 1.5s
- **Visual:** black; dust motes barely perceptible.
- **Audio:** hum arrives slowly.

### C02 — CRT WAKE WITH SERVICE ID
- **Duration:** 2.0s
- **UI Text:**
  - `FACILITY WAKE SEQUENCE`
  - `SERVICE ID: <HEX>`
  - `REV: <BUILD>`
- **State Lamp:** OFFLINE → PROCESSING.

### C03 — CONTAINMENT SEAL VERIFY
- **Duration:** 3.0s
- **UI Text:** `SEAL STATUS: VERIFIED`
- **Visual:** hatch icon outline flashes once; no linger.
- **Audio:** two relays, spaced.

### C04 — AIR HANDLING NOMINAL
- **Duration:** 3.0s
- **UI Text:** `AIR HANDLING: NOMINAL`
- **Visual:** pressure gauge needle settles; vent indicator goes steady.

### C05 — POWER BUS CALIBRATION
- **Duration:** 4.0s
- **UI Text:**
  - `POWER BUS: CALIBRATION`
  - `POWER BUS: NOMINAL`
- **Visual:** meter ramps then locks.

### C06 — CORE BAY SPIN-UP (BAY VIEW)
- **Duration:** 5.0s
- **UI Text:**
  - `CORE BAY: PREHEAT`
  - `CORE BAY: ONLINE`
- **Visual:** sequential lamp bank activation with slight stagger.

### C07 — ARCHIVE STACKS MOUNT + CHECKSUM
- **Duration:** 5.0s
- **UI Text:**
  - `ARCHIVE STACKS: MOUNTED`
  - `ARCHIVE STACKS: CHECKSUM PASS`
- **Visual:** mount plate + seal stamp (single frame): `VERIFIED`.

### C08 — VECTOR VAULT INTEGRITY
- **Duration:** 5.0s
- **UI Text:**
  - `VECTOR VAULT: INDEX READY`
  - `VECTOR VAULT: INTEGRITY PASS`
- **Visual:** thin waveform resolves; then holds.

### C09 — ROUTER PREFLIGHT
- **Duration:** 6.0s
- **UI Text:**
  - `ROUTER CONSOLE: TABLE LOADED`
  - `ROUTER CONSOLE: FALLBACKS VERIFIED`
  - `ROUTER CONSOLE: POLICY LOCKED`
- **Visual:** lock indicator plate illuminates.

### C10 — OBSERVATION DECK ONLINE
- **Duration:** 4.0s
- **UI Text:** `OBSERVATION DECK: ACTIVE`
- **Visual:** trace line appears; one pulse then steady.

### C11 — IDENTITY BEAT (SINGLE)
- **Duration:** 2.5s
- **Visual:** large **ZONE** numeral or **hatch sigil silhouette** appears once, centered.
- **Rule:** no slogans; no mascot.

### C12 — INTEGRITY & INCIDENTS
- **Duration:** 4.0s
- **UI Text:**
  - `INTEGRITY: PASS`
  - `INCIDENTS: NONE`
- **Audio:** one heavier relay.

### C13 — COMMAND THEATER ONLINE
- **Duration:** 4.0s
- **UI Text:** `COMMAND THEATER: ONLINE`
- **Location Path:** `OPS / COMMAND THEATER / MAIN CONSOLE`
- **State Lamp:** PROCESSING → STABLE.

### C14 — HANDOFF
- **Duration:** 1.0s + 0.3–0.5s stillness
- **UI Text:** `OPERATOR CONTROL ENABLED`
- **Input:** active after stillness.

---

## 3) Fault Branch Inserts (Used in both modes)

### F01 — INCIDENT FLAG
- **Insert Duration:** 2.0–3.0s
- **Trigger:** any failed subsystem check.
- **UI Text:**
  - `INCIDENT: <SUBSYSTEM> OUT OF RANGE`
  - `SEVERITY: <LEVEL>`
  - `REMEDIATION: SEE INCIDENT CONTROL`
- **State Lamp:** PROCESSING → FAULT.
- **Rule:** no handoff.

### F02 — ACKNOWLEDGEMENT REQUIREMENT
- **Insert Duration:** 2.0s
- **UI Text:** `ACKNOWLEDGEMENT REQUIRED`
- **Rule:** acknowledgement requires authorization; produces stamped receipt in logs.

---

## 4) Implementation Notes (Non-visual)
- Each shot corresponds to a deterministic boot step event.
- Event stream should write to a boot log and drive UI text updates.
- Audio relays trigger only on state transitions (not on every frame).

