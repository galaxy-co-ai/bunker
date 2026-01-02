# 04_EXPERIENCE_DESIGN/02_Navigation

This Canvas contains three documents, in locked order, for Phase 4.

---

# 04_EXPERIENCE_DESIGN/02_Navigation/BUNKER – Visual Facility Map Screen – Spec.md

## 0. Designation
**Module:** NAVIGATION / FACILITY CARTOGRAPHY

**Screen Name (diegetic):** FACILITY MAP BOARD

**Operator Intent:**
- Establish facility orientation at a glance.
- Traverse the bunker by **Wing → Room → Console**.
- Observe status, access constraints, and incidents without leaving the map.
- Transition from “where am I” to “what do I operate next” in one controlled action.

**Non‑negotiable:** This is not a modern “map UI.” This is a **control room schematic board** rendered through instrument glass.

---

## 1. Diegetic Object Model
The screen is presented as a physical installation:
- A **schematic plate** mounted behind instrument glass.
- Subtle CRT emergence: low bloom, restrained scanlines, phosphor persistence.
- Labels appear as stamped overlays and terminal callouts, never as web UI.

**Primary metaphor:** A bunker wall‑mounted map board with replaceable mode plates.

---

## 2. Screen Composition

### 2.1 Primary Regions
1) **Map Field (center)**
- The schematic itself.
- Defaults to the current facility level (or the last visited level).

2) **Mode Plate Rack (left vertical, physicalized)**
- Metal plates with engraved labels:
  - **OVERVIEW**
  - **SYSTEMS**
  - **ACCESS**
  - **INCIDENTS**
- One plate is seated (active). Others are racked (inactive).
- Plate change is a deliberate action with visible inertia.

3) **Location Path Rail (top)**
- A rigid breadcrumb rail (not clickable text by default).
- Format:
  - `LEVEL 02 ▸ EAST WING ▸ VECTOR VAULT ▸ CONSOLE: INDEX TERMINAL`
- Rail updates only after selection is confirmed (see Interaction Model).

4) **Global State Lamp + Facility Seal (top-right)**
- The facility insignia (Hatch Sigil) with the **global state lamp**:
  - DIM (Idle)
  - AMBER PULSE (Processing)
  - GREEN SOLID (Stable)
  - RED FLICKER (Fault)
- Lamp state is authoritative and overrides cosmetic cues.

5) **Map Context Ledger (right panel, narrow)**
- A vertical ledger: selected entity details (Wing/Room/Console).
- Feels like a clipped clipboard behind glass.

6) **Incident & Transit Log Strip (bottom)**
- A single-line or two-line feed.
- Shows:
  - navigation entries (operator movement)
  - access denials
  - incident assertions/clearances
  - system transitions (stable → fault)


### 2.2 Visual Hierarchy Rules
- **Geometry first** (walls, corridors, doors).
- **Access second** (locks, clearance marks).
- **State third** (status lamps, incident overlays).
- **Text last** (sparse, uppercase, condensed).

---

## 3. Cartography Grammar

### 3.1 Geometry
- Map is a **schematic**, not a blueprint:
  - Primary walls: thick line.
  - Secondary partitions: mid line.
  - Service corridors: thin line.
  - Vertical traversal (stairs/lifts): standardized glyph.
- Corners are squared and mechanical.
- No smooth bezier “modern map” curves.

### 3.2 Rooms as Functional Cells
Rooms are drawn as cells with:
- **Room Identifier** (short)
- **Room Type Glyph**
- **Status Lamp** (micro)

Room label format (example):
- `V‑VAULT` (Vector Vault)
- `ARCH‑STACK` (Archive Stacks)
- `ROUTER` (Routing Console Room)

### 3.3 Consoles
Consoles are anchors inside rooms:
- small hardpoint icon
- optional cable line to Systems conduits
- each console has:
  - identifier
  - state lamp
  - authorization ring (if restricted)

**Rule:** Room selection never implies console selection. Consoles are explicit.

### 3.4 Connectors & Adjacency
- Doors / hatches are explicit objects.
- Door state is visible:
  - OPEN / CLOSED / SEALED / LOCKED / OVERRIDDEN
- Adjacency lines never imply travel if a door is sealed.

---

## 4. Navigation Model (Wing → Room → Console)

### 4.1 Selecting a Wing
Wing selection highlights:
- wing perimeter
- wing name plate
- wing summary in ledger:
  - clearance requirement (if any)
  - active incidents count
  - critical consoles count

### 4.2 Selecting a Room
Room selection highlights:
- room cell
- door points into room
- room ledger:
  - function summary (diegetic)
  - live status
  - incident banners (if present)
  - consoles within

### 4.3 Selecting a Console
Console selection highlights:
- console hardpoint
- thin “cable” line to its system source (Systems mode)
- ledger shows:
  - console name
  - last operation timestamp
  - owning module
  - authorization requirement
  - action: **ENTER CONSOLE**

**ENTER CONSOLE** is the only action that causes a screen transition.

---

## 5. Map Modes (Physical Plates)
Each mode is a physical plate selection that re-layers the schematic.

### 5.1 OVERVIEW (Default)
Purpose: orientation.
- Show: geometry, room labels, minimal lamps.
- Hide: deep telemetry, wiring, verbose incidents.
- Incident visualization: only critical markers.

### 5.2 SYSTEMS
Purpose: “what powers what.”
- Overlay: conduits, data buses, module ownership.
- Show: cable lines from consoles to backend sources.
- Emphasize: router, model bays, job engine, stores.

### 5.3 ACCESS
Purpose: clearance & containment.
- Overlay: clearance tiers, locked doors, sealed zones.
- Show: authorization rings on restricted consoles.
- Emphasize: “ARM → EXECUTE” operations.

### 5.4 INCIDENTS
Purpose: triage.
- Overlay: incident fields, affected rooms, severity gradients.
- Show: incident cards in ledger, with timestamps and containment status.
- Hide: non-critical systems lines.

**Mode Change Rule:** Mode changes do not alter selection; they change the overlay. If selection becomes invalid (e.g., hidden console), selection collapses upward (console → room → wing).

---

## 6. State, Lamps, and Readouts

### 6.1 Lamps
Lamps exist at three scales:
- **Global** (Facility seal): system-wide truth.
- **Room** (micro lamp): operational condition of that room’s domain.
- **Console** (micro lamp): immediate console readiness.

Lamp truth table:
- GREEN SOLID: stable / ready
- AMBER PULSE: active / processing
- DIM: idle / awaiting input
- RED FLICKER: fault / denied / degraded

### 6.2 Incident Markers
Incidents are not popups.
- They are **placards**.
- They attach to a room edge or console hardpoint.
- They can be expanded in the ledger.

Placard content limits:
- one-line title
- severity glyph
- time stamp

---

## 7. Readability & Distance Rules
Designed for **control room distance viewing**.

### 7.1 Typography
- Uppercase condensed for labels.
- Monospace for IDs, times, metrics.

Minimum sizes:
- Room label: must remain legible at default zoom.
- Console label: appears only at medium zoom or higher.
- Micro text never below a readable threshold; below that, replace with glyphs.

### 7.2 Contrast & Glow
- Glow is functional (phosphor persistence), never decorative.
- Scanlines are restrained, do not reduce legibility.

### 7.3 Line Weight
- Avoid thin, modern hairlines.
- Structure lines maintain weight under all modes.

---

## 8. Failure Modes (Operator‑Facing)

### 8.1 Map Data Unavailable
Presentation:
- Map field shows **calibration grid** and stamped notice: `CARTOGRAPHY FEED LOST`
- Ledger shows last known facility snapshot time.
- Bottom log prints diagnostic entry with code.

### 8.2 Partial Telemetry Loss
- Geometry remains.
- Lamps for affected entities fall back to DIM with `NO READ` marker.
- Incidents can still be asserted manually if authorized.

### 8.3 Authorization Denial
- Attempted selection remains visible.
- Action buttons are disabled with stamped denial reason.
- Bottom log prints denial with clearance delta.

### 8.4 Inconsistent Topology
- If adjacency graph is invalid:
  - map enters `SAFE MODE` overlay
  - travel highlights disabled
  - ledger shows “TOPOLOGY CONFLICT” and lists invalid edges.

---

## 9. Integration with Global Systems

### 9.1 Global State Lamp
- Any RED FLICKER (global) forces:
  - incidents mode suggestion placard (non-blocking)
  - disables restricted “ARM” actions unless explicitly authorized.

### 9.2 Location Path Rail
- Updates only on confirmed selection.
- Doubles as a printed audit trail: every transition logs.

### 9.3 Logs
- Every selection emits a log entry:
  - `NAV: WING SELECTED — EAST WING`
  - `NAV: ROOM SELECTED — VECTOR VAULT`
  - `NAV: CONSOLE ENTERED — INDEX TERMINAL`
- Access denies emit:
  - `AUTH DENIED — CLEARANCE 2 REQUIRED`

---

## 10. Diegetic → Implementation Mapping (High Level)
This screen is a renderer + state reader. It does not own core truth.

Facility Map consumes:
- **Topology registry** (rooms, doors, adjacency)
- **Module registry** (which console belongs to which module)
- **Telemetry feed** (lamps, health, readiness)
- **Incident ledger** (active incidents)
- **Authorization policy** (clearance requirements)

Implementation note:
- Current local display stack indicates a **Tauri + Vite + React** build with Tailwind + Motion available.
- The map spec remains frontend-agnostic; renderer can be implemented in React/SVG/Canvas.

---

## 11. Acceptance Criteria
- Operator can orient from cold load in ≤ 3 seconds.
- Wing → Room → Console traversal requires no hidden gestures.
- Modes feel like physical plates (no “tab UI” behavior).
- Failure states are calm, mechanical, and explicit.
- The map never looks like a modern SaaS diagram.

---

# 04_EXPERIENCE_DESIGN/02_Navigation/BUNKER – Visual Facility Map Screen – Interaction Model.md

## 0. Interaction Doctrine
**Primary inputs:** mouse + keyboard.

**Operator posture:** deliberate; no playful micro-gestures.

**Core rule:** Selection is separate from commitment. The facility does not “accidentally” move.

---

## 1. Cursor Semantics
Cursor states are mechanical:
- **NEUTRAL** (no target)
- **HOVER: WING** (wing perimeter)
- **HOVER: ROOM** (room cell)
- **HOVER: CONSOLE** (console hardpoint)
- **DENIED** (target exists but clearance insufficient)
- **LOCKED** (target unavailable due to facility state)

Hover never opens panels; it only primes.

---

## 2. Selection Ladder (Wing → Room → Console)

### 2.1 Mouse
- **Left click** selects the entity under cursor.
- **Second left click** on the same entity performs “confirm” only if that entity has a confirmable transition:
  - Wing: no confirm transition (selection only)
  - Room: no confirm transition (selection only)
  - Console: confirm reveals **ENTER CONSOLE** action in ledger (does not auto-enter)

### 2.2 Keyboard
- **ESC**: collapse selection one rung:
  - console → room → wing → none
- **ENTER**:
  - if ledger has a focused action, ENTER triggers it
  - otherwise no-op
- **TAB / SHIFT+TAB**:
  - cycles ledger focusable elements only
  - never cycles map geometry

---

## 3. Zoom & Pan

### 3.1 Mouse Wheel
- Wheel zooms in/out centered on cursor.
- Zoom steps are discrete (mechanical detents), not smooth infinite.

Zoom levels:
- **Z0 (Overview)**: wings + rooms only.
- **Z1 (Operational)**: rooms + major consoles.
- **Z2 (Console Detail)**: all consoles + wiring overlays (Systems mode).

### 3.2 Pan
- **Middle mouse drag** pans.
- **Space + left drag** pans (secondary).
- Panning is disabled during ARM state (see Section 6).

### 3.3 Recenter
- **R** recenters to current operator location.
- Recentering is logged: `NAV: RECENTER`.

---

## 4. Mode Plate Interaction
Modes are not tabs.

- **Click plate**: seats that plate (mode change).
- Plate change has a short mechanical delay and audible relay tick (optional).
- **Keyboard (1–4)** selects mode:
  - 1 Overview
  - 2 Systems
  - 3 Access
  - 4 Incidents

If a plate change would obscure the current selection:
- selection collapses upward to the nearest visible entity.
- log prints: `NAV: SELECTION COLLAPSED — VISIBILITY`

---

## 5. Ledger Interaction
Ledger is the authoritative control surface.

- Selection populates ledger.
- Actions exist only in ledger; map itself is not a button farm.

Ledger action examples:
- **ENTER CONSOLE**
- **VIEW INCIDENT STACK**
- **REQUEST AUTHORIZATION** (if available)

---

## 6. ARM → EXECUTE Doctrine (Restricted Actions)
Restricted actions are operations that alter facility state, not mere navigation.

Examples:
- door override (sealed/locked)
- incident acknowledgment
- containment seal
- restricted console entry (if policy requires)

### 6.1 ARM State
ARM is a deliberate safety posture.
- Triggered from ledger: **ARM CONTROLS**
- While armed:
  - map pan is disabled
  - mode plate changes are disabled
  - selection changes are limited to the currently selected entity’s scope
  - UI presents a visible arming indicator (stamped overlay + lamp)

### 6.2 EXECUTE
- EXECUTE requires:
  - explicit target
  - explicit action
  - explicit confirm
- Confirm pattern:
  - `HOLD ENTER 1.0s` or `CLICK + HOLD 1.0s`
- Abort:
  - ESC immediately disarms

### 6.3 Lockouts
ARM is denied if:
- global lamp is RED FLICKER and operator clearance is below threshold
- telemetry feed is unreliable (map in SAFE MODE)

Denials are explicit and logged.

---

## 7. Accessibility & Readability Controls

### 7.1 Distance Viewing
- **F** toggles “FAR READ” mode:
  - increases label scale
  - reduces non-critical overlays
  - strengthens line weight

### 7.2 Reduced Flicker
- **Shift+F** toggles reduced scanline intensity.

### 7.3 Keyboard-Only Operation
Minimum viable:
- Mode switching via 1–4.
- Selection stepping via arrow keys within a constrained graph:
  - arrows move between adjacent rooms at current zoom
  - ENTER focuses ledger

---

## 8. Error Interaction Behaviors

### 8.1 Denied Target
- Click selects but action buttons remain disabled.
- Ledger displays:
  - `AUTHORIZATION REQUIRED`
  - clearance delta
  - optional request pathway

### 8.2 Telemetry Loss Mid-Use
- Lamps freeze and transition to DIM/NO READ.
- Any operation that would require truth becomes disabled.
- Log prints a diagnostic code.

---

# 04_EXPERIENCE_DESIGN/02_Navigation/BUNKER – Visual Facility Map Screen – Data Requirements.md

## 0. Data Contract Overview
The Facility Map Screen requires three categories of data:
1) **Topology** (static / rarely changing)
2) **Operational State** (live)
3) **Authorization & Incidents** (policy + event-driven)

All identifiers are stable, uppercase-safe, and audit-friendly.

---

## 1. Topology Data Model

### 1.1 Facility
- `facility_id`
- `designation` (e.g., VAULT‑7)
- `levels[]`

### 1.2 Level
- `level_id` (e.g., L02)
- `label` (e.g., LEVEL 02)
- `wings[]`
- `default_viewbox` (for map framing)

### 1.3 Wing
- `wing_id` (e.g., EAST)
- `label` (EAST WING)
- `bounds` (schematic polygon / rect)
- `rooms[]`

### 1.4 Room
- `room_id` (e.g., VECTOR_VAULT)
- `label_short` (V‑VAULT)
- `label_long` (VECTOR VAULT)
- `room_type` (enum)
- `geometry` (polygon)
- `doors[]`
- `consoles[]`
- `adjacent_room_ids[]` (derived; must be validated)

Room type enum examples (diegetic-first):
- `ROUTING_CHAMBER`
- `MODEL_BAYS`
- `CLOUD_RELAY`
- `VECTOR_VAULT`
- `ARCHIVE_STACKS`
- `JOBS_GALLERY`
- `LOGS_TERMINAL`
- `SECRETS_CAGE`
- `DIAGNOSTICS_BENCH`

### 1.5 Door / Hatch
- `door_id`
- `from_room_id`
- `to_room_id`
- `position` (point)
- `door_type` (HATCH | BLAST | SERVICE)
- `default_state` (CLOSED)

### 1.6 Console
- `console_id` (e.g., INDEX_TERMINAL)
- `label` (INDEX TERMINAL)
- `position` (point)
- `console_type` (enum)
- `module_binding` (see Module Registry)
- `access_policy_id` (nullable)

Console type enum examples:
- `ROUTER_CONSOLE`
- `MODEL_CONTROL`
- `JOB_DISPATCH`
- `VECTOR_INDEX`
- `ARCHIVE_BROWSER`
- `INCIDENT_DESK`
- `AUTHORIZATION_TERMINAL`

---

## 2. Operational State Model (Live)

### 2.1 Lamps
A unified lamp object applied to:
- facility
- room
- console

Fields:
- `state` (DIM | AMBER_PULSE | GREEN_SOLID | RED_FLICKER)
- `reason_code` (optional)
- `last_update_ts`
- `confidence` (0–1)

### 2.2 Door State
Fields:
- `door_id`
- `state` (OPEN | CLOSED | SEALED | LOCKED | OVERRIDDEN)
- `last_update_ts`

### 2.3 Console Readiness
Fields:
- `console_id`
- `readiness` (READY | BUSY | DEGRADED | OFFLINE | NO_READ)
- `last_operation_ts`
- `owner_module`

### 2.4 Map System Flags
Fields:
- `cartography_status` (OK | PARTIAL | LOST)
- `topology_valid` (true/false)
- `safe_mode` (true/false)

---

## 3. Incidents Model

### 3.1 Incident
Fields:
- `incident_id`
- `title`
- `severity` (LOW | MED | HIGH | CRITICAL)
- `status` (OPEN | CONTAINED | RESOLVED)
- `asserted_ts`
- `last_update_ts`
- `affected_room_ids[]`
- `affected_console_ids[]`
- `notes` (short; ledger expanded view)

### 3.2 Incident Presentation Rules
- Incidents can be attached to rooms or consoles.
- Incident overlays are derived from `affected_*` fields.

---

## 4. Authorization Model

### 4.1 Access Policy
Fields:
- `access_policy_id`
- `required_clearance` (integer tier)
- `restrictions` (array)
- `arm_required` (boolean)

### 4.2 Operator Clearance Snapshot
Fields:
- `operator_clearance` (integer)
- `session_authorizations[]` (temporary grants)
- `auth_expiry_ts` (nullable)

### 4.3 Denial Object (for logging)
Fields:
- `target_id`
- `policy_id`
- `operator_clearance`
- `required_clearance`
- `reason_code`

---

## 5. Module Registry Binding
The map must bind consoles to implemented modules.

Fields:
- `module_id`
- `module_name` (diegetic label)
- `module_route` (screen/console entrypoint)
- `telemetry_sources[]`

Examples (diegetic label → implementation concept):
- ROUTING CHAMBER → request router / model selector
- MODEL BAYS → local model manager (local runtime telemetry)
- CLOUD RELAY → external API clients telemetry
- VECTOR VAULT → embeddings/index store telemetry
- JOBS GALLERY → background job engine telemetry
- ARCHIVE STACKS → local file store index
- INCIDENT DESK → incident ledger + diagnostics

---

## 6. Source Mapping (Implementation Backing)
The following source categories are expected; the map consumes them via adapters.

### 6.1 Topology Registry
- Local static asset (JSON) versioned with the facility.
- Optionally compiled into the application build.

### 6.2 Telemetry Feed
- Local process stats + module status emitters.
- Must support:
  - periodic snapshots
  - event updates
  - confidence flagging

### 6.3 Incidents Ledger
- Append-only log with current-open index.
- Must support:
  - assert
  - update
  - resolve

### 6.4 Authorization Policy
- Local policy file + runtime session grants.
- Must support:
  - clearance tiers
  - ARM requirement

---

## 7. Validation Requirements
Before rendering:
- topology graph must validate:
  - all doors connect valid rooms
  - adjacency is symmetric
  - no orphan rooms without intended containment
- if invalid:
  - `safe_mode = true`
  - disable ARM operations

---

## 8. Minimal Payloads

### 8.1 Initial Load (Cold)
- facility topology
- last known lamp snapshot
- open incidents list (titles + targets)
- operator clearance snapshot

### 8.2 Live Tick
- lamp deltas
- door deltas
- incident deltas

---

## 9. Logging Requirements
Map interactions emit structured events:
- `NAV_SELECT_WING`
- `NAV_SELECT_ROOM`
- `NAV_SELECT_CONSOLE`
- `NAV_ENTER_CONSOLE`
- `MODE_CHANGE`
- `AUTH_DENIED`
- `SAFE_MODE_ENTERED`

Each event includes:
- timestamp
- operator session id
- target ids
- current mode
- current zoom

---

## 10. Outstanding Dependency
A referenced technical infrastructure standard document was not present in the current project filesystem. When provided, it should be used to finalize:
- module registry bindings
- telemetry source naming
- incident codes
- authorization tiers

