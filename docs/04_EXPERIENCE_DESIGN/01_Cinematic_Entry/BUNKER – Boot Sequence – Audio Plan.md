# BUNKER — Boot Sequence (Audio Plan)

Direction: **Silent Ritual**.
Audio is infrastructure: hum + relays only.
No music. No narration. No “startup jingle.”

---

## 1) Core Principles
- **Presence over performance:** sound establishes “place,” not excitement.
- **Mechanical truth:** every sound corresponds to a state change.
- **Silence has meaning:** avoid constant chatter.

---

## 2) Layers

### 2.1 Ambient Bed (Facility Hum)
- **Description:** low, stable HVAC/power hum with subtle, slow variance.
- **Goal:** establish bunker depth and continuous operation.
- **Mix Notes:**
  - keep low-frequency controlled; avoid ear fatigue
  - no pulsing; no rhythmic pattern
  - add faint distant ventilation texture (very low)

### 2.2 Relay/Contact Clicks (State Events)
- **Description:** short mechanical clicks, clacks, latch thunks.
- **Use:** ONLY when:
  - global state lamp changes
  - subsystem milestone locks
  - authorization gates verify/deny
- **Cadence Doctrine:**
  - verified: two fast contacts (verify + lock)
  - stable settle: one heavier relay
  - fault: one sharp contact + immediate silence drop (0.2–0.4s) before hum returns

### 2.3 Optional (Not default): Panel Switch Throw
- **Status:** disabled by default.
- **Use case:** only if boot is triggered by a physical “initialize” control.

---

## 3) Cue Sheet (STANDARD BOOT)

### A — Wake
- Hum fade-in: 0.6–1.2s
- No clicks.

### B — OFFLINE → PROCESSING
- One relay click.

### C — Access Gate Verified
- Two fast relays.

### D — Subsystem Milestones
- Use **micro-click** only on “lock” moments.
- Do not click on every line.

### E — PROCESSING → STABLE
- One heavier relay.

### F — Handoff
- No celebratory sound.
- Optional: a single soft contact if you need a tactile confirmation.

---

## 4) Cue Sheet (CEREMONIAL BOOT)
Same doctrine, slightly more audible “weight.”
- Keep hum constant.
- Use relays sparingly: every 2–4 seconds, not faster.

---

## 5) Fault Behavior
When fault occurs:
1) sharp contact click
2) hum drops briefly (0.2–0.4s)
3) hum returns at slightly reduced level
4) no further clicks until acknowledgement/authorization

---

## 6) Deliverables (Audio Asset List)

### 6.1 Hum Beds
- HUM_A (clean)
- HUM_B (slightly strained)
- HUM_C (degraded)

### 6.2 Relay Pack
- RELAY_LIGHT_01–05
- RELAY_HEAVY_01–03
- RELAY_DOUBLE_FAST_01–03
- RELAY_SHARP_FAULT_01–03

### 6.3 Optional Mechanicals
- SWITCH_THROW_01–03
- LATCH_THUNK_01–03

---

## 7) Implementation Notes
- Route audio from the boot state machine (event-driven).
- Avoid overlapping relay sounds; enforce cooldown (150–250ms).
- Respect user volume controls; never blast.

