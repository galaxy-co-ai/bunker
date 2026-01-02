# BUNKER — Design System (Headless) Inventory

This is a headless, structural design system for a diegetic facility interface.
It defines primitives, components, states, and interaction doctrine without committing to final art.

---

## 1. Foundations

### 1.1 Design Tokens (Required)
- **Color Tokens**
  - Structural neutrals
  - CRT emission accents
  - State palette (stable/processing/degraded/fault/offline)
  - Warning bands (caution/warning/danger/restricted)
- **Typography Tokens**
  - Placard headings
  - Terminal mono
  - Telemetry numerics (tabular)
- **Spacing & Sizing Tokens**
  - Panel padding
  - Label gutters
  - Bay widths
  - Terminal line-height
- **Motion Tokens**
  - Scan timing
  - Stamp timing
  - Settle timing
  - Alert cadence

### 1.2 System State Doctrine (Global)
Global facility state is always visible and always logged:
- **Stable** (nominal)
- **Processing** (active)
- **Degraded** (caution)
- **Fault** (critical)
- **Offline** (dead)

State changes must:
- update a visible indicator (lamp/band)
- create a timestamped log entry
- optionally generate an incident (if severity threshold is crossed)

### 1.3 Interaction Doctrine
- **Operator is in command**; actions are deliberate.
- Critical actions use **ARM → EXECUTE** (two-step).
- Every meaningful action yields a **receipt** (log + stamp).
- Interrupts are explicit and often require a reason.

---

## 2. Layout Primitives

### 2.1 Facility Frame
Global shell for all screens:
- Header band (location path + global state)
- Primary panel field
- Secondary bays (logs/telemetry/incidents)

### 2.2 Panel Grid
- Fixed bay dimensions (engineered, not fluid)
- Snap-to-grid panel placement
- Explicit gutters for labeling and warnings

### 2.3 Plate + Bezel
- Outer plate: structure boundary
- Inner bezel: inset content boundary
- Fastener/edge conventions (headless spec only)

### 2.4 Dividers
- Hairline rule
- Riveted bar
- Warning tape divider (severity-coded)

### 2.5 Drawers / Bays
- Maintenance drawer
- Diagnostics drawer
- Archive drawer

---

## 3. Core Structural Components

### 3.1 Panel (Primary Container)
- Variants: Standard / Critical / Restricted
- Required: title placard, ID, revision, state indicator

### 3.2 Placard (Label Plate)
- Contains: label, subsystem ID, revision stamp slot
- Enforces tone: short, procedural, non-emotive

### 3.3 Terminal Window (CRT Container)
- Log mode, table mode, trace mode
- Fixed columns and tabular numeric alignment

### 3.4 Gauge
- Radial gauge
- Linear meter
- Required: ticks, thresholds, state banding

### 3.5 Status Lamp
- Dot lamp
- Bar lamp
- Beacon lamp
- Required: state mapping + cadence doctrine

### 3.6 Control Hardware (Inputs)
- Toggle switch
- Lever switch
- Push button (guarded optional)
- Rotary selector
- Key switch
- Keypad entry

---

## 4. Data & Telemetry Components

### 4.1 Log Stream (Append-Only)
- Timestamp required
- Subsystem tag required
- Severity flag required
- Cannot be “edited” (append-only doctrine)

### 4.2 Trace Viewer
- Step chain: input → route → exec → output → archive
- Each step has state and duration

### 4.3 Routing Table
- Policy rows: mission class, model/core, constraints, cost flags
- Changes require ARM → EXECUTE

### 4.4 Queue
- Job list with state + age + priority
- Supports abort with reason (logged)

### 4.5 Meter (Resources)
- CPU/compute draw proxy
- Storage usage
- Uplink usage (metered)
- Cost proxy (if applicable)

### 4.6 Incident Stack
- Severity ladder
- Remediation steps
- Acknowledgement + sign-off stamp

---

## 5. Navigation (Diegetic)

### 5.1 Facility Map Navigator
- Schematic-based
- Wing → Room → Console
- Selection changes location path in header

### 5.2 Location Path Component
- Format: **WING / ROOM / CONSOLE**
- Always visible

### 5.3 Module Bay Tabs (Physicalized)
- Tabs represented as labeled plates
- No modern sidebar patterns

---

## 6. Interaction Patterns (Doctrine)

### 6.1 Armed Actions
- ARM (pre-flight checks)
- EXECUTE (commits)
- Receipt stamp on completion

### 6.2 Calibration & Checks
- Multi-checkpoint progress
- Each checkpoint logs
- Completion yields CALIBRATION COMPLETE

### 6.3 Lockout & Authorization
- Restricted states require explicit authorization
- Visual lock indicator + reason
- Attempts are logged

### 6.4 Interrupt Handling
- Abort requires reason
- Abort produces incident entry if mid-critical run

### 6.5 Confirmations
- Confirmations are not popups; they are procedural steps
- Output is a log entry + stamp

---

## 7. States & Feedback (Required per Component)

### 7.1 Common States
- Default
- Focus (minimal)
- Armed
- Executing
- Success (quiet)
- Degraded
- Fault
- Offline
- Read-only
- Locked (restricted)

### 7.2 Severity Ladder (Incidents)
- Info
- Notice
- Caution
- Warning
- Critical

Severity affects:
- lamp cadence
- band intensity
- escalation routing (who/what is notified)

---

## 8. Readability & Accessibility
- Minimum font sizes for distance readability
- Terminal contrast doctrine
- Color redundancy: shape/text must echo severity
- Tabular alignment for telemetry and timestamps

---

## 9. Governance

### 9.1 Canon Compliance Checklist (Headless)
For any component/pattern:
- Does it exist physically in the facility?
- Does it clearly express state?
- Does it avoid modern SaaS tropes?
- Does it create logs/receipts for meaningful actions?
- Does it preserve operator authority?

### 9.2 Versioning
- Components carry IDs and revisions
- Changes are recorded in Decisions Log (separate doc)

