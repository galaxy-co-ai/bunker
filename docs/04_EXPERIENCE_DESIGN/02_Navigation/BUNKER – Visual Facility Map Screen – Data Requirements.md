# BUNKER – Visual Facility Map Screen – Data Requirements

## 0. Data Contract Overview
Facility Map requires:
1) **Topology** (static / rarely changing)
2) **Operational State** (live)
3) **Authorization & Incidents** (policy + event-driven)

Identifiers are stable, uppercase-safe, audit-friendly.

---

## 1. Topology Data Model

### 1.1 Facility
- `facility_id`
- `designation` (e.g., VAULT-7)
- `levels[]`

### 1.2 Level
- `level_id` (e.g., L02)
- `label` (LEVEL 02)
- `wings[]`
- `default_viewbox` (map framing)

### 1.3 Wing
- `wing_id` (e.g., EAST)
- `label` (EAST WING)
- `bounds` (polygon/rect)
- `rooms[]`

### 1.4 Room
- `room_id` (e.g., VECTOR_VAULT)
- `label_short` (V-VAULT)
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
- `module_binding` (Module Registry)
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

### 2.1 Lamps (Unified)
Applied to facility / room / console:
- `state` (DIM | AMBER_PULSE | GREEN_SOLID | RED_FLICKER)
- `reason_code` (optional)
- `last_update_ts`
- `confidence` (0–1)

### 2.2 Door State
- `door_id`
- `state` (OPEN | CLOSED | SEALED | LOCKED | OVERRIDDEN)
- `last_update_ts`

### 2.3 Console Readiness
- `console_id`
- `readiness` (READY | BUSY | DEGRADED | OFFLINE | NO_READ)
- `last_operation_ts`
- `owner_module`

### 2.4 Map System Flags
- `cartography_status` (OK | PARTIAL | LOST)
- `topology_valid` (true/false)
- `safe_mode` (true/false)

---

## 3. Incidents Model

### 3.1 Incident
- `incident_id`
- `title`
- `severity` (LOW | MED | HIGH | CRITICAL)
- `status` (OPEN | CONTAINED | RESOLVED)
- `asserted_ts`
- `last_update_ts`
- `affected_room_ids[]`
- `affected_console_ids[]`
- `notes` (short; expands in ledger)

### 3.2 Presentation Rules
- Incidents attach to rooms or consoles.
- Overlays derived from affected targets.

---

## 4. Authorization Model

### 4.1 Access Policy
- `access_policy_id`
- `required_clearance` (tier integer)
- `restrictions[]`
- `arm_required` (boolean)

### 4.2 Operator Clearance Snapshot
- `operator_clearance` (tier integer)
- `session_authorizations[]` (temporary grants)
- `auth_expiry_ts` (nullable)

### 4.3 Denial Object (for logging)
- `target_id`
- `policy_id`
- `operator_clearance`
- `required_clearance`
- `reason_code`

---

## 5. Module Registry Binding
Consoles must bind to implemented modules.

- `module_id`
- `module_name` (diegetic label)
- `module_route` (console entrypoint)
- `telemetry_sources[]`

Examples (diegetic label → implementation concept):
- ROUTING CHAMBER → request router / model selector
- MODEL BAYS → local model manager telemetry
- CLOUD RELAY → external API client telemetry
- VECTOR VAULT → embeddings/index store telemetry
- JOBS GALLERY → background job engine telemetry
- ARCHIVE STACKS → local file store index
- INCIDENT DESK → incident ledger + diagnostics
- AUTHORIZATION TERMINAL → policy + grants

---

## 6. Source Mapping (Implementation Backing)
Map consumes data via adapters.

### 6.1 Topology Registry
- Local static JSON, versioned with facility
- Compiled into build if required

### 6.2 Telemetry Feed
- Local process stats + module emitters
- Supports periodic snapshots + event deltas + confidence

### 6.3 Incidents Ledger
- Append-only log with current-open index
- Supports assert / update / resolve

### 6.4 Authorization Policy
- Local policy file + runtime session grants
- Supports clearance tiers + ARM requirements

---

## 7. Validation Requirements
Before render:
- all doors connect valid rooms
- adjacency is symmetric
- no unintended orphan rooms

If invalid:
- `safe_mode = true`
- disable ARM operations

---

## 8. Minimal Payloads

### 8.1 Initial Load (Cold)
- topology
- last known lamp snapshot
- open incidents (titles + targets)
- operator clearance snapshot

### 8.2 Live Tick
- lamp deltas
- door deltas
- incident deltas

---

## 9. Logging Requirements
Emit structured events:
- `NAV_SELECT_WING`
- `NAV_SELECT_ROOM`
- `NAV_SELECT_CONSOLE`
- `NAV_ENTER_CONSOLE`
- `MODE_CHANGE`
- `AUTH_DENIED`
- `SAFE_MODE_ENTERED`

Each includes:
- timestamp
- operator session id
- target ids
- current mode
- current zoom

---

## 10. Dependency: Technical Infrastructure Standard
A referenced implementation backing document was not accessible in the current workspace. When available, it must be used to finalize:
- module registry bindings
- telemetry source naming
- incident codes
- authorization tiers

