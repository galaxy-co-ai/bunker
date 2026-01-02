# BUNKER — Facility Map (Diegetic Layout)

This is a **physical facility layout**, not a UX sitemap.
Every room maps to a real operational function. Navigation is performed via an in‑world schematic.

---

## 0. Facility Doctrine
- The facility is engineered for **containment, uptime, and maintainability**.
- Critical systems are **physically separated** (power, compute, archive, uplink).
- The operator’s path is short and authoritative: **Airlock → Security → Command Theater**.
- External dependencies are **optional**, **metered**, and **logged**.

---

## 1. Facility Topology (At a Glance)
- **LEVEL 0 — PERIMETER:** Entry, containment, access control
- **LEVEL 1 — OPS SPINE:** Central corridor, command, routing, incidents
- **LEVEL 2 — INFRA:** Power, cooling, maintenance
- **LEVEL 3 — DATA WING:** Local cores, archive stacks, vector index
- **LEVEL 4 — ANNEX:** Uplink relay (optional), monitoring tower

---

## 2. Level 0 — Perimeter (Access & Containment)

### A0 — Surface Vestibule (External Threshold)
- **Function:** Arrival staging; external comms cut; tool check.
- **Key Objects:** Outer door controls, warning placards, inspection plate.
- **Adjacency:** A1

### A1 — Decontamination / Airlock
- **Function:** Sealing ritual; contamination doctrine; pressure equalization.
- **Key Objects:** Air valves, indicator lamps, rinse hardware, timer gauge.
- **Adjacency:** A0, A2

### A2 — Security Checkpoint
- **Function:** Identity verification, authorization gating, lockdown initiation.
- **Key Objects:** Badge reader, keypad, key switch, access lamp, lockdown lever.
- **Adjacency:** A1, C0, U1 (gated), M2 (gated)

---

## 3. Level 1 — Operations Spine (Command)

### C0 — Central Corridor (The Spine)
- **Function:** Primary circulation; wings branch from here.
- **Key Objects:** Location plaques, hazard bands, emergency lighting.
- **Adjacency:** A2, O1, O2, O3, P1, D1, R1, M1

### O1 — Command Theater (Primary Control Room)
- **Function:** Facility overview; mission execution; global state; operator command presence.
- **Key Objects:** Main console, global state lamp, incident stack display, queue board.
- **Adjacency:** C0, O2, O3

### O2 — Routing & Policy Console
- **Function:** Mission classes, routing policy tables, constraints, fallbacks.
- **Key Objects:** Router table terminal, policy plates, arming key.
- **Adjacency:** O1, D1

### O3 — Incident Control / Lockdown Desk
- **Function:** Severity ladder, incident response procedures, containment actions.
- **Key Objects:** Alarm ladder, acknowledgement stamp, lockdown controls.
- **Adjacency:** O1, A2

---

## 4. Level 2 — Infrastructure (Power, Cooling, Maintenance)

### P1 — Power Distribution Room
- **Function:** Breakers, load shedding, power routing, stability doctrine.
- **Key Objects:** Breaker wall, power gauges, distribution schematics.
- **Adjacency:** C0, P2, M1

### P2 — Cooling & Ventilation Plant
- **Function:** Thermal constraint enforcement; filtration; airflow control.
- **Key Objects:** Dampers, pressure gauges, filter racks, maintenance tags.
- **Adjacency:** P1, D1

### M1 — Maintenance Shop
- **Function:** Repairs, upgrades, calibration tools, parts triage.
- **Key Objects:** Workbench, tooling wall, calibration kits, solder station.
- **Adjacency:** C0, P1, M2

### M2 — Parts Cage (Restricted)
- **Function:** Controlled inventory: core modules, keys, sealed media.
- **Key Objects:** Cage lock, inventory ledger, tamper seals.
- **Adjacency:** M1, A2

---

## 5. Level 3 — Data Wing (Compute + Archive)

### D1 — Compute Bay (Local Cores)
- **Function:** Local inference cores, execution runtime, routing endpoints.
- **Key Objects:** Rack stacks, status lamps, service plates, cable trays.
- **Adjacency:** C0, O2, P2, D2

### D2 — Archive Stacks (Cold Storage)
- **Function:** Snapshots, records, exports, sealed archives.
- **Key Objects:** Storage cages, archive ledger, retrieval cart.
- **Adjacency:** D1, V1

### V1 — Vector Index Vault
- **Function:** Embeddings index, semantic retrieval, RAG stores.
- **Key Objects:** Index cabinet, integrity gauges, rebuild switch.
- **Adjacency:** D2, R1

---

## 6. Level 4 — Research Annex (Analysis + Simulation)

### R1 — Analysis Lab
- **Function:** Controlled evaluations, profiling, diagnostics runs.
- **Key Objects:** Bench terminals, test harness panels, trace viewers.
- **Adjacency:** C0, V1, R2

### R2 — Simulation Chamber
- **Function:** Scenario runs, load tests, failure drills (safe containment).
- **Key Objects:** Run selectors, throttle levers, fault injectors (restricted).
- **Adjacency:** R1

---

## 7. Optional Wing — Uplink Annex (External Interfaces)

### U1 — Uplink Relay Room (Metered, Gated)
- **Function:** External model/API relays; strict metering; audit logging.
- **Key Objects:** Relay manifold, uplink meter, authorization switch.
- **Adjacency:** A2 (gated), D1

### U2 — Monitoring Tower (Telemetry & Alerts)
- **Function:** Observability, trace review, fault correlation, uptime alerts.
- **Key Objects:** Telemetry wall, alert ladder, trace archive terminal.
- **Adjacency:** U1, O3

---

## 8. Operator Flow (Critical Path)
1) **A0 → A1 → A2**: Enter, seal, authorize
2) **A2 → C0 → O1**: Move to command
3) **O1**: Execute missions; monitor state, queue, incidents
4) Branch as needed:
   - Routing/policy: **O2**
   - Faults/lockdown: **O3**
   - Local cores: **D1**
   - Archive/index: **D2/V1**
   - Maintenance: **M1/M2**
   - Uplink: **U1/U2** (only when authorized)

---

## 9. Room-to-System Mapping (Implementation Alignment)
*(Diegetic names first; implementation notes are parenthetical.)*

### Command & Control
- **O1 Command Theater** → Primary operator UI shell *(Next.js + React; desktop shell via Tauri)*
- **O2 Routing & Policy Console** → Router tables & fallbacks *(LiteLLM Proxy)*
- **O3 Incident Control** → Fault workflows & acknowledgements *(Sentry + BetterStack alerts; incident logs)*

### Local Execution
- **D1 Compute Bay** → Local model serving + tool runtime *(Ollama; local model set)*
- **R2 Simulation Chamber** → Scheduled jobs, drills, background runs *(Trigger.dev; optional automation runner)*

### Data Stores
- **D2 Archive Stacks** → Relational records & snapshots *(Neon Postgres for production; SQLite for local/embedded)*
- **V1 Vector Index Vault** → Embeddings store *(Qdrant)*
- **Archive Media** → Object storage *(Cloudflare R2)*

### Observability & Telemetry
- **U2 Monitoring Tower** → Traces, cost telemetry, prompt mgmt *(Langfuse)*
- **Cache / Rate Limiting** → Session and response cache *(Upstash Redis)*

### Security & Secrets
- **A2 Security Checkpoint** → Auth/org gating *(Clerk)*
- **M2 Parts Cage** → Secrets management *(Infisical)*

### External Relays
- **U1 Uplink Relay Room** → Cloud fallbacks *(Claude/OpenAI/Gemini/Perplexity where authorized)*

---

## 10. Navigation Principle (Non‑Negotiable)
Navigation is performed via **facility schematics** and **location path**.
- Location Path Format: **WING / ROOM / CONSOLE**
- No modern “sidebar app nav.” This is a bunker.

