# BUNKER – Authorization & Access – Interaction Model

## 0. Interaction Doctrine
Authorization interactions must be:
- deliberate
- reversible
- logged
- calm under pressure

**Rule:** Authorization never presents as “friendly help.” It presents as facility procedure.

---

## 1. Where Authorization Appears
Authorization interactions occur in fixed facility surfaces:
- **Console Shell Context Ledger → AUTH plate**
- **Map Board → ACCESS mode overlay + ledger**
- **Operations Strip** (ARM initiation, restricted actions)

No module creates custom authorization dialogs.

---

## 2. Target Selection + Check
Every restricted intent follows:
1) Operator selects target (wing/room/console/action)
2) Facility performs **AUTH_CHECK**
3) Facility returns result:
   - ALLOW
   - ALLOW_WITH_CONDITIONS
   - DENY
   - LOCK

**Presentation rules**
- Result is shown as a placard in ledger.
- Map/console visuals update (authorization ring, disabled actions) without animation flourish.

---

## 3. Denial Flow

### 3.1 Immediate Denial (No Path)
If request is not permitted:
- Ledger posts stamped placard:
  - `AUTHORIZATION REQUIRED`
  - required clearance
  - reason code
- Operation/action remains disabled.
- Log: AUTH_DENIED

### 3.2 Denial With Request Path
If policy permits requesting a grant:
- Ledger shows **REQUEST GRANT** action.
- Selecting REQUEST GRANT opens a structured request card (ledger-contained).

Request card fields (minimum):
- Target
- Required clearance
- Requested duration (preset detents)
- Justification code (picklist)
- Optional note (short, single line)

Submit results:
- Log: GRANT_REQUESTED
- Ledger shows status: PENDING / APPROVED / REJECTED

**Rule:** No instant escalation without an audit trail.

---

## 4. Grant Approval Model
BUNKER is local-first. Approvals may be:
- self-approved (if operator tier allows)
- second-factor approved (if configured)
- policy-approved (automatic, rule-based)

### 4.1 Self-Approval
If operator clearance is within threshold:
- REQUEST GRANT returns immediate APPROVED.
- Grant token created with expiry.
- Log: GRANT_APPROVED (self)

### 4.2 Secondary Approval
If configured:
- System requires re-authorization step:
  - passphrase / hardware key / local factor
- Failure returns REJECTED with reason.

### 4.3 Automatic Policy Approval
If policy allows deterministic approvals:
- Facility validates request constraints.
- If constraints satisfied, approves.

---

## 5. Session Elevation
Elevation is not permanent. It is a **session grant**.

### 5.1 Elevation Indicators
When elevated:
- Session Stamp shows `AUTH STATE: ELEVATED`
- Ledger AUTH plate pins the active grants summary

### 5.2 Expiry + Revocation
- Grants expire automatically.
- Operator may revoke a grant from AUTH plate if policy allows.
- Expiry/revocation is logged.

---

## 6. ARM → EXECUTE Interaction
ARM is the facility’s protective posture for restricted operations.

### 6.1 Initiating ARM
- Operator selects restricted operation in Operations Strip.
- Facility runs AUTH_CHECK for ARM eligibility.

If allowed:
- Operator presses **ARM CONTROLS**.
- Shell enters ARMED state.
- Log: ARM_STARTED

If denied:
- Placard: `ARM DENIED` + reason.
- Log: AUTH_DENIED (arm)

### 6.2 Targeting During ARM
- Workbay becomes a target selection surface if required.
- Selection is constrained to the current scope.
- Mode plates and navigation are locked.

### 6.3 Execute Confirm
- Execute requires hold-to-confirm:
  - `HOLD ENTER 1.0s` or `CLICK + HOLD 1.0s`
- A mechanical countdown indicator appears.

Success:
- Log: ARM_EXECUTED + result code

Failure:
- Log: OPS_FAILED + reason

Abort:
- ESC exits ARMED immediately.
- Log: ARM_ABORTED

---

## 7. Terminal Lock / Re-Authorization

### 7.1 Manual Lock
- Operator selects **LOCK TERMINAL**.
- Terminal enters LOCKED state.
- Log: TERMINAL_LOCKED (manual)

### 7.2 Auto Lock (Timeout)
- Inactivity timer triggers lock.
- Log: TERMINAL_LOCKED (timeout)

### 7.3 Unlock
Unlock requires an authorization check.
- If allowed:
  - Terminal returns to prior state.
  - Log: TERMINAL_UNLOCKED
- If denied:
  - Lock persists.
  - Log: AUTH_DENIED (unlock)

**Rule:** Unlock does not restore elevated grants unless explicitly still valid.

---

## 8. Incident-Driven Lockouts
When incident policy enforces lockout:
- AUTH plate pins a `LOCKOUT ACTIVE` placard
- Restricted actions disable
- Map ACCESS mode shows sealed boundaries

Lockout resolution:
- incident resolved → policy lifts
- log: LOCKOUT_CLEARED

---

## 9. Accessibility / Readability
- All authorization placards must be legible at distance.
- Codes and clearance deltas use monospace.
- Far-read mode enlarges:
  - required clearance
  - reason code
  - remaining grant time

---

## 10. Logging Requirements (Interaction-Level)
Every interaction produces a deterministic audit event:
- AUTH_CHECK
- AUTH_DENIED
- GRANT_REQUESTED
- GRANT_APPROVED / GRANT_REJECTED
- GRANT_EXPIRED / GRANT_REVOKED
- ARM_STARTED / ARM_ABORTED / ARM_EXECUTED
- TERMINAL_LOCKED / TERMINAL_UNLOCKED
- LOCKOUT_ASSERTED / LOCKOUT_CLEARED

Each event includes:
- timestamp
- session id
- operator clearance
- target id(s)
- policy id
- result + reason code

