# BUNKER – Visual Facility Map Screen – Interaction Model

## 0. Interaction Doctrine
**Primary inputs:** mouse + keyboard  
**Operator posture:** deliberate; no playful micro-gestures

**Core rule:** Selection is separate from commitment. The facility does not “accidentally” move.

---

## 1. Cursor Semantics
Mechanical cursor states:
- **NEUTRAL** (no target)
- **HOVER: WING** (wing perimeter)
- **HOVER: ROOM** (room cell)
- **HOVER: CONSOLE** (console hardpoint)
- **DENIED** (target exists but clearance insufficient)
- **LOCKED** (target unavailable due to facility state)

Hover never opens panels; hover only primes.

---

## 2. Selection Ladder (Wing → Room → Console)

### 2.1 Mouse
- **Left click:** select entity under cursor
- **Second left click** on same entity performs “confirm” only when a confirmable transition exists:
  - Wing: selection only
  - Room: selection only
  - Console: selection primes ledger action (does not auto-enter)

### 2.2 Keyboard
- **ESC:** collapse one rung  
  console → room → wing → none
- **ENTER:** triggers focused ledger action (if any); otherwise no-op
- **TAB / SHIFT+TAB:** cycles ledger focus only (never map geometry)

---

## 3. Zoom & Pan

### 3.1 Mouse Wheel
Wheel zoom centered on cursor. Discrete detents (mechanical), not infinite smooth scaling.

Zoom levels:
- **Z0 (Overview):** wings + rooms only
- **Z1 (Operational):** rooms + major consoles
- **Z2 (Console Detail):** all consoles; wiring overlays available in SYSTEMS mode

### 3.2 Pan
- **Middle mouse drag:** pan
- **Space + left drag:** pan (secondary)
- Pan disabled during ARM state (Section 6)

### 3.3 Recenter
- **R:** recenter to current operator location  
Recenter is logged: `NAV: RECENTER`

---

## 4. Mode Plate Interaction
Modes are physical plates, not tabs.

- **Click plate:** seat that plate (mode change)
- Plate change has a short mechanical delay (optional relay tick)
- **Keyboard 1–4:** mode select
  - 1 Overview
  - 2 Systems
  - 3 Access
  - 4 Incidents

If a plate change obscures the current selection:
- selection collapses upward to nearest visible entity
- log prints: `NAV: SELECTION COLLAPSED — VISIBILITY`

---

## 5. Ledger Interaction
Ledger is the authoritative control surface.
- Selection populates ledger
- Actions exist in ledger; map is not an action grid

Ledger actions (examples):
- **ENTER CONSOLE**
- **VIEW INCIDENT STACK**
- **REQUEST AUTHORIZATION** (if policy permits)

---

## 6. ARM → EXECUTE Doctrine (Restricted Actions)
Restricted actions alter facility state, not mere navigation.

Examples:
- door override (sealed/locked)
- incident acknowledgment
- containment seal
- restricted console entry (if policy requires)

### 6.1 ARM State
ARM is a deliberate safety posture.
- Triggered from ledger: **ARM CONTROLS**
- While armed:
  - pan disabled
  - mode plates locked
  - selection changes constrained to current scope
  - arming indicator must be visible (stamped overlay + lamp)

### 6.2 EXECUTE
EXECUTE requires:
- explicit target
- explicit action
- explicit confirm

Confirm pattern:
- `HOLD ENTER 1.0s` OR `CLICK + HOLD 1.0s`

Abort:
- **ESC** immediately disarms

### 6.3 Lockouts
ARM is denied if:
- global lamp is RED FLICKER and clearance below threshold
- cartography in SAFE MODE / telemetry unreliable

Denials are explicit and logged.

---

## 7. Accessibility & Readability Controls

### 7.1 Distance Viewing
- **F:** toggle FAR READ mode
  - increases label scale
  - reduces non-critical overlays
  - strengthens line weight

### 7.2 Reduced Flicker
- **Shift+F:** reduce scanline intensity / flicker artifacts

### 7.3 Keyboard-Only Operation (Minimum Viable)
- Mode switching via 1–4
- Selection stepping via arrows constrained by adjacency at current zoom
- **ENTER:** focus ledger
- **ESC:** collapse selection

---

## 8. Error Interaction Behaviors

### 8.1 Denied Target
Click selects target; actions remain disabled.
Ledger displays:
- `AUTHORIZATION REQUIRED`
- clearance delta
- optional request pathway (if present)

### 8.2 Telemetry Loss Mid-Use
- Lamps freeze → DIM / NO READ
- Operations requiring truth disabled
- Log prints diagnostic code and source

