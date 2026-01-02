# 01_Authorization_Access — Canon Index

## Folder Designation
**Phase:** 06 — AUTHORITY LAYER  
**Module:** AUTHORIZATION & ACCESS

**Purpose:** Facility-wide governance for:
- clearance tiers
- policies
- session grants
- denials
- lockouts
- ARM gating
- audit integrity

---

## Canon Documents (Locked)
1) **BUNKER – Authorization & Access – Spec.md**
- clearance tiers
- policy precedence
- denial doctrine
- ARM gating
- audit minimums

2) **BUNKER – Authorization & Access – Interaction Model.md**
- denial flows
- grant request/approval flows
- session elevation
- lock terminal behavior
- incident-driven lockouts

3) **BUNKER – Authorization & Access – Data Requirements.md**
- policy graph data model
- grant objects + expiry
- lockout objects
- audit stream schema

---

## Interfaces Governed
This module is authoritative for the following facility surfaces:
- **Facility Map Board**
  - ACCESS mode overlay
  - denied target presentation
  - selection visibility doctrine
- **Module Console Shell**
  - AUTH ledger plate
  - session stamp
  - ARM eligibility checks
  - terminal lock/unlock behavior
- **All Modules**
  - action permission checks
  - restricted operations requiring ARM
  - denial messaging templates (via Reason Code Registry)

---

## Required Dependencies
- **Reason Code Registry** must be used for:
  - denial reason codes
  - lockout codes
  - standard placard strings

---

## Non-Drift Enforcement
- Modules may not invent new clearance tiers.
- Modules may not invent alternate confirm patterns for restricted actions.
- All grants must be time-bound and logged.
- All denial and lockout messaging must resolve to a reason code.

