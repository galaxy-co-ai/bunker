# BUNKER — Boot Sequence (Final Spec)

**Mode:** Silent Ritual

**Boot Options:**
- **STANDARD BOOT (Default):** 10–14s
- **CEREMONIAL BOOT (Optional):** 35–55s

**Audio Doctrine:** Minimal facility hum + mechanical relays only.

**Visual Doctrine:** Subtle CRT emergence (instrument glass, scanline presence, restrained bloom). No modern glossy UI behavior.

**Control Handoff:** After **Command Theater** reaches **STABLE** and control systems complete integrity checks.

---

## 1) Design Intent
BUNKER boot is an operational ritual.
It communicates: containment, reliability, and operator authority.
No friendliness. No “welcome.” No performance.

---

## 2) Sequence Overview
Boot is a linear, timestamped procedure with explicit subsystem milestones. Every milestone writes to the log.

### Global State Lamp (Always Present)
State transitions (minimum):
- **OFFLINE** → **PROCESSING** → **STABLE**
If fault is detected, transition to **FAULT** and handoff is denied.

---

## 3) STANDARD BOOT (10–14 seconds)

### 3.1 Wake
- Screen: black.
- Sound: faint facility hum begins.
- Visual: CRT ghosting emerges (very subtle), then stabilizes.
- Text (top-left or placard band): **FACILITY WAKE SEQUENCE**
- Log entry: timestamp + WAKE initiated.

### 3.2 Access Gate
- Text: **ACCESS GATE: VERIFIED**
- If failed: hard cut to **ACCESS DENIED** (no comfort copy). Remains locked.
- Log entry: access result.

### 3.3 Core Spin-Up (Fast Milestones)
Milestones (each gets a one-line readout + log entry):
- **POWER BUS: NOMINAL**
- **CORE BAY: ONLINE**
- **ARCHIVE STACKS: MOUNTED**
- **VECTOR VAULT: INDEX READY**
- **ROUTER CONSOLE: TABLE LOADED**
- **OBSERVATION DECK: ACTIVE**

### 3.4 Integrity Checks
- Brief check lines (no progress bar theatrics):
  - **INTEGRITY: PASS**
  - **INCIDENTS: NONE**
- If failed: create INCIDENT card + remediation pointer; do not hand off.

### 3.5 Command Theater Online
- Location path locks in: **OPS / COMMAND THEATER / MAIN CONSOLE**
- Global lamp settles: **STABLE**

### 3.6 Handoff
- Text: **OPERATOR CONTROL ENABLED**
- Pause: 300–500ms stillness (weight)
- Input becomes active.
- Log entry: control enabled.

---

## 4) CEREMONIAL BOOT (35–55 seconds)
Ceremonial boot includes STANDARD steps plus deeper physicalized checks and one facility identity beat.

### 4.1 Containment Ritual (Added)
- One or two additional checks with audible relay emphasis:
  - **SEAL STATUS: VERIFIED**
  - **AIR HANDLING: NOMINAL**
- Optional stamp flashes (single frame): **VERIFIED** / **SEALED**

### 4.2 Bay-by-Bay Spin-Up (Added)
Same milestones as STANDARD, but paced with mechanical settle.
- Each milestone gets a short “settle” moment (lamp locks steady).

### 4.3 Archive & Index Scrub (Added)
- **ARCHIVE STACKS: CHECKSUM PASS**
- **VECTOR VAULT: INTEGRITY PASS**

### 4.4 Router Preflight (Added)
- **ROUTER CONSOLE: FALLBACKS VERIFIED**
- **ROUTER CONSOLE: POLICY LOCKED**

### 4.5 Identity Beat (Single, Non-Branded)
- Large zone numeral appears once (e.g., **ZONE 01**) or a hatch-sigil silhouette.
- No slogans. No mascot energy.

### 4.6 Handoff
Same as STANDARD.

---

## 5) Failure Handling (Non-Negotiable)

### 5.1 Fault Presentation
- Faults are calm and hard:
  - **INCIDENT: <SUBSYSTEM> OUT OF RANGE**
  - **SEVERITY: <LEVEL>**
  - **REMEDIATION: SEE INCIDENT CONTROL**

### 5.2 Fault State
- Global state lamp transitions to **FAULT**.
- Control handoff is denied.
- Acknowledgement requires authorization and produces a stamped log receipt.

---

## 6) Visual Implementation Notes (Guidance)
- No modern loading spinners.
- No “friendly” animations.
- Use instrument framing: bezel, fasteners, plate labels.
- CRT effects are restrained: slight scanline, slight curvature, subtle bloom.

---

## 7) Toggle Rules
- STANDARD is default.
- CEREMONIAL is a facility preference stored as a setting in Diagnostics.
- Operator can temporarily invoke CEREMONIAL from the Command Theater.

---

## 8) Acceptance Criteria
- Boot communicates containment + authority in under 2 seconds.
- Handoff moment is unmistakable.
- Logs exist for every milestone.
- Silent Ritual tone is preserved (no music, no narration, no hype).

