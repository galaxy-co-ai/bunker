# BUNKER – Authorization & Access – Spec

## 0. Designation
**System:** FACILITY AUTHORIZATION LAYER  
**Artifact:** AUTHORIZATION & ACCESS DOCTRINE  
**Scope:** Facility-wide (Map Board + Console Shell + Modules)

**Purpose**
- Define who may see, enter, and operate restricted facility zones and consoles.
- Govern all **ARM → EXECUTE** operations.
- Provide calm, mechanical denials with audit integrity.
- Ensure the facility is always in control, never surprised.

**Non-negotiable**
Authorization is not a “login.” It is **clearance + policy + session grants** under continuous audit.

---

## 1. Core Concepts

### 1.1 Clearance
A persistent operator tier used as the baseline for access.

### 1.2 Policy
Rules attached to targets (wings, rooms, doors, consoles, actions).

### 1.3 Session Grants
Temporary, scoped allowances applied to the current session.
- Always time-bound.
- Always logged.
- Always reversible.

### 1.4 Targets
Authorization can apply to:
- **Navigation targets:** wing, room, door/hatch
- **Console targets:** console entry
- **Operation targets:** specific actions (especially destructive)

---

## 2. Clearance Tiers
Tiers are numeric and monotonically increasing. Names are diegetic, not friendly.

**Tier 0 — OBSERVER**
- Read-only viewing of non-sensitive areas.
- No ARM.

**Tier 1 — OPERATOR**
- Normal module operations.
- No destructive actions.

**Tier 2 — TECHNICIAN**
- Diagnostics access.
- Limited ARM for contained actions.

**Tier 3 — SUPERVISOR**
- Broader access, incident acknowledgment.
- ARM permitted for operational overrides.

**Tier 4 — COMMAND**
- Containment controls.
- Purge/override actions permitted by policy.

**Tier 5 — DIRECTORATE**
- Full facility control.
- Emergency override authority.

**Rule:** Tier names are cosmetic; tier number is truth.

---

## 3. Access Surfaces

### 3.1 Visibility vs Entry vs Operation
Authorization is separated into three surfaces:
- **VISIBILITY:** may the operator see the target on the map / ledger.
- **ENTRY:** may the operator enter the room/console.
- **OPERATION:** may the operator execute actions within.

A target can be visible but non-enterable. A console can be enterable but operation-locked.

### 3.2 Default Visibility Doctrine
- Restricted targets remain **visible** unless facility policy demands concealment.
- Concealment is reserved for high-sensitivity assets.

---

## 4. Policy Attach Points
Policies may attach at multiple layers, highest precedence wins:
1) Facility-level policy (global)
2) Level policy
3) Wing policy
4) Room policy
5) Console policy
6) Action policy

**Rule:** Action policy overrides console policy. Console policy overrides room policy, etc.

---

## 5. Authorization Results
Every access check returns a structured result.

### 5.1 Allow
- Target accessible.

### 5.2 Allow With Conditions
- Allowed but requires additional posture:
  - ARM required
  - Secondary confirm required
  - Time window constraints

### 5.3 Deny
- Deny is calm and explicit.
- Deny provides:
  - required clearance
  - reason code
  - request pathway (if permitted)

### 5.4 Lock
- Facility-level lockout state:
  - SAFE MODE
  - telemetry unreliable
  - incident-driven lockdown

---

## 6. Denial Doctrine (Operator-Facing)
Denials are not popups. They are stamped placards and ledger entries.

Denial placard format:
- `AUTHORIZATION REQUIRED`
- `CLEARANCE: <OPERATOR> / REQUIRED: <TARGET>`
- `REASON: <CODE>`
- Optional: `REQUEST GRANT` (if allowed)

**Rule:** Denial never removes the target from view mid-session. The facility does not hide its own architecture.

---

## 7. Session Stamp Requirements
Console Shell must present a session stamp including:
- SESSION ID
- OPERATOR CLEARANCE
- AUTH STATE (normal / elevated / armed)
- LOCAL TIME

During ARM state, session stamp must become visually dominant.

---

## 8. ARM Gating Standard
ARM is permitted only when:
- operator clearance meets `arm_min_clearance`
- telemetry confidence meets `arm_min_confidence`
- global state lamp is not forcing lockout (unless emergency override policy)

ARM always logs:
- arm start
- target
- action
- confirm
- result
- abort

---

## 9. Lock Terminal
Terminal lock is a facility posture.

**Lock triggers**
- manual operator lock
- inactivity timeout
- incident policy escalation

**Locked state rules**
- Workbay becomes inaccessible.
- Path rail remains visible.
- Only permitted actions:
  - unlock (authorized)
  - return to map (if allowed)
  - diagnostics entry (if authorized)

Unlock attempts are logged, including failures.

---

## 10. Incident-Driven Authorization
Incidents can modify policy temporarily:
- seal doors
- lock consoles
- require re-authorization
- restrict ARM actions

**Rule:** Incident policy is always time-bound and auditable.

---

## 11. Audit Integrity
Authorization is a first-class audit stream.

**Minimum log events**
- AUTH_CHECK (target, result)
- AUTH_DENIED (reason, clearance delta)
- GRANT_REQUESTED
- GRANT_APPROVED / GRANT_REJECTED
- GRANT_EXPIRED / GRANT_REVOKED
- ARM_STARTED / ARM_ABORTED / ARM_EXECUTED
- TERMINAL_LOCKED / TERMINAL_UNLOCKED

Logs must be append-only and timestamped.

---

## 12. Acceptance Criteria
- Denials are explicit, calm, and never ambiguous.
- Restricted operations cannot execute without ARM posture.
- Authorization rules are consistent across Map Board and Console Shell.
- Every grant and denial is auditable.
- Lockouts are authoritative and override module behavior.

