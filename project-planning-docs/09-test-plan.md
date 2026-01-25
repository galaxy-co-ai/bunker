# Test Plan: Bunker

**Version:** 1.0  
**Created:** January 25, 2026  
**Author:** GalaxyCo.ai  
**Status:** Draft

---

## Overview

This test plan is auto-generated from PRD acceptance criteria. Each criterion becomes a test case.

---

## Test Coverage Matrix

| Feature ID | Feature | Unit Tests | Integration Tests | E2E Tests | Status |
|------------|---------|------------|-------------------|-----------|--------|
| F1 | Project CRUD | 4 | 2 | 2 | Not Started |
| F2 | Project Switcher | 2 | 1 | 1 | Not Started |
| F3 | Roadmap View | 2 | 1 | 1 | Not Started |
| F4 | Sprint Manager | 6 | 3 | 2 | Not Started |
| F5 | Context Panel | 3 | 1 | 1 | Not Started |
| F6 | Agent Chat | 4 | 2 | 2 | Not Started |
| F7 | Model Selector | 2 | 1 | 1 | Not Started |
| F8 | Ollama Integration | 3 | 2 | 1 | Not Started |
| F9 | Claude API Integration | 2 | 2 | 1 | Not Started |
| F10 | OpenAI API Integration | 2 | 2 | 1 | Not Started |
| F11 | Context Injection | 3 | 2 | 1 | Not Started |
| F12 | Secrets Manager | 4 | 2 | 1 | Not Started |
| F13 | File Tree | 3 | 1 | 1 | Not Started |
| F14 | Doc Viewer | 2 | 1 | 1 | Not Started |
| F15 | SQLite Database | 8 | 2 | 0 | Not Started |
| F16 | Settings Page | 3 | 1 | 1 | Not Started |

**Total:** 53 Unit | 26 Integration | 18 E2E

---

## Test Cases by Feature

### F1: Project CRUD

#### TC-F1-01: Create project with valid data
**Type:** Unit  
**Acceptance Criteria:** Project created and appears in project list  
**Steps:**
1. Call createProject({ name: "Test", description: "Desc" })
2. Assert project returned with generated ID
3. Assert project appears in getProjects() result

#### TC-F1-02: Create project validates required fields
**Type:** Unit  
**Acceptance Criteria:** Show validation error "Project name required"  
**Steps:**
1. Call createProject({ name: "" })
2. Assert error thrown with message "Project name required"

#### TC-F1-03: Edit project updates database
**Type:** Unit  
**Acceptance Criteria:** Changes saved to database, UI updates  
**Steps:**
1. Create project
2. Call updateProject(id, { name: "New Name" })
3. Assert getProject(id) returns updated name

#### TC-F1-04: Delete project removes all related data
**Type:** Unit  
**Acceptance Criteria:** Project removed, cascade delete sprints/tasks/docs  
**Steps:**
1. Create project with sprint and tasks
2. Call deleteProject(id)
3. Assert project, sprints, tasks all deleted

#### TC-F1-05: Project CRUD API integration
**Type:** Integration  
**Steps:**
1. POST /api/projects → 201
2. GET /api/projects → includes new project
3. PATCH /api/projects/[id] → 200
4. DELETE /api/projects/[id] → 204
5. GET /api/projects → project removed

#### TC-F1-06: Create project E2E
**Type:** E2E  
**Steps:**
1. Click "New Project" button
2. Fill name and description
3. Click "Create"
4. Assert project appears in sidebar

---

### F2: Project Switcher

#### TC-F2-01: Switch project updates active state
**Type:** Unit  
**Steps:**
1. Set activeProjectId to project A
2. Call setActiveProject(projectB.id)
3. Assert activeProjectId is project B

#### TC-F2-02: Switch project loads context
**Type:** Integration  
**Steps:**
1. Switch to project B
2. Assert context panel shows project B's docs
3. Assert URL changes to /projects/[B.id]

#### TC-F2-03: Switch project E2E
**Type:** E2E  
**Acceptance Criteria:** Switch takes < 500ms  
**Steps:**
1. Click project A in sidebar
2. Measure time to context panel update
3. Assert < 500ms

---

### F3: Roadmap View

#### TC-F3-01: Roadmap displays milestones
**Type:** Unit  
**Steps:**
1. Create project with 3 sprints
2. Render RoadmapView
3. Assert 3 milestones displayed

#### TC-F3-02: Roadmap shows progress
**Type:** Integration  
**Steps:**
1. Complete some tasks in sprint
2. Assert progress bar reflects completion %

#### TC-F3-03: Roadmap E2E
**Type:** E2E  
**Steps:**
1. Navigate to project page
2. Assert roadmap visible
3. Add milestone, assert it appears

---

### F4: Sprint Manager

#### TC-F4-01: Create sprint
**Type:** Unit  
**Steps:**
1. Call createSprint({ name: "Sprint 1", projectId })
2. Assert sprint created with 'planned' status

#### TC-F4-02: Create sprint validates dates
**Type:** Unit  
**Steps:**
1. Call createSprint with end < start
2. Assert validation error

#### TC-F4-03: Add task to sprint
**Type:** Unit  
**Steps:**
1. Call createTask({ title: "Task 1", sprintId })
2. Assert task created with 'todo' status

#### TC-F4-04: Complete task updates status
**Type:** Unit  
**Steps:**
1. Call updateTask(id, { status: 'done' })
2. Assert task status is 'done'
3. Assert completed_at is set

#### TC-F4-05: Complete sprint archives it
**Type:** Unit  
**Steps:**
1. Call completeSprint(id)
2. Assert sprint status is 'completed'
3. Assert completed_at is set

#### TC-F4-06: Reorder tasks
**Type:** Unit  
**Steps:**
1. Create 3 tasks
2. Call reorderTasks([task3, task1, task2])
3. Assert order_index updated correctly

#### TC-F4-07: Sprint CRUD API integration
**Type:** Integration  
**Steps:**
1. POST /api/projects/[id]/sprints → 201
2. POST /api/sprints/[id]/tasks → 201
3. PATCH /api/tasks/[id] → 200
4. PATCH /api/sprints/[id]/complete → 200

#### TC-F4-08: Sprint manager E2E
**Type:** E2E  
**Steps:**
1. Navigate to sprints page
2. Create sprint
3. Add tasks
4. Check off task
5. Assert progress updates

---

### F5: Context Panel

#### TC-F5-01: Context panel displays tabs
**Type:** Unit  
**Steps:**
1. Render ContextPanel
2. Assert Docs, Files, Sprint tabs visible

#### TC-F5-02: Tab switching
**Type:** Unit  
**Steps:**
1. Click Files tab
2. Assert Files content visible
3. Assert Docs content hidden

#### TC-F5-03: Context panel E2E
**Type:** E2E  
**Steps:**
1. Select project
2. Assert context panel shows project docs
3. Switch tabs, assert content changes

---

### F6: Agent Chat

#### TC-F6-01: Send message stores in DB
**Type:** Unit  
**Steps:**
1. Call sendMessage({ content: "Hello" })
2. Assert message saved with role 'user'

#### TC-F6-02: Receive AI response
**Type:** Integration  
**Steps:**
1. Send message to chat API
2. Assert streaming response received
3. Assert assistant message saved

#### TC-F6-03: Chat history persists
**Type:** Unit  
**Steps:**
1. Send messages
2. Refresh page
3. Assert messages still visible

#### TC-F6-04: Empty message prevented
**Type:** Unit  
**Steps:**
1. Attempt to send empty string
2. Assert submission blocked

#### TC-F6-05: Chat E2E
**Type:** E2E  
**Steps:**
1. Navigate to chat
2. Type message, press Enter
3. Assert message appears
4. Assert AI response streams in

---

### F7: Model Selector

#### TC-F7-01: Model selector shows available models
**Type:** Unit  
**Steps:**
1. Render ModelSelector with models
2. Assert all models in dropdown

#### TC-F7-02: Model selection persists
**Type:** Integration  
**Steps:**
1. Select model
2. Refresh
3. Assert same model selected

#### TC-F7-03: Model selector E2E
**Type:** E2E  
**Steps:**
1. Open model dropdown
2. Select different model
3. Send message
4. Assert correct model used

---

### F8: Ollama Integration

#### TC-F8-01: Connect to Ollama
**Type:** Integration  
**Steps:**
1. Configure Ollama URL
2. Call testConnection()
3. Assert success when Ollama running

#### TC-F8-02: List Ollama models
**Type:** Integration  
**Steps:**
1. Call getModels()
2. Assert returns array of pulled models

#### TC-F8-03: Send message to Ollama
**Type:** Integration  
**Steps:**
1. Call chat with Ollama model
2. Assert streamed response received

#### TC-F8-04: Handle Ollama not running
**Type:** Unit  
**Steps:**
1. Call testConnection() with bad URL
2. Assert error "Cannot connect to Ollama"

---

### F9-F10: Claude/OpenAI Integration

*Similar test cases to F8 for API key validation and message sending.*

---

### F11: Context Injection

#### TC-F11-01: Context prepended to message
**Type:** Unit  
**Steps:**
1. Build context for project
2. Assert context includes project description
3. Assert context includes current sprint

#### TC-F11-02: Context toggle works
**Type:** Integration  
**Steps:**
1. Disable context injection
2. Send message
3. Assert no context in API payload

#### TC-F11-03: Context truncation
**Type:** Unit  
**Steps:**
1. Create very large context
2. Build context
3. Assert context under model limit

---

### F12: Secrets Manager

#### TC-F12-01: Create secret encrypts value
**Type:** Unit  
**Steps:**
1. Call createSecret({ key: "API_KEY", value: "secret" })
2. Read raw DB value
3. Assert value is encrypted (not plaintext)

#### TC-F12-02: Retrieve secret decrypts
**Type:** Unit  
**Steps:**
1. Create encrypted secret
2. Call getSecret(id)
3. Assert returns decrypted value

#### TC-F12-03: List secrets hides values
**Type:** Unit  
**Steps:**
1. Create secrets
2. Call listSecrets()
3. Assert values not included

#### TC-F12-04: Delete secret
**Type:** Unit  
**Steps:**
1. Create secret
2. Call deleteSecret(id)
3. Assert secret removed

---

### F13: File Tree

#### TC-F13-01: Load file tree
**Type:** Integration  
**Steps:**
1. Set project path to test directory
2. Get file tree
3. Assert returns nested structure

#### TC-F13-02: Ignore patterns applied
**Type:** Unit  
**Steps:**
1. Create dir with node_modules
2. Get file tree
3. Assert node_modules excluded

#### TC-F13-03: Handle invalid path
**Type:** Unit  
**Steps:**
1. Set invalid project path
2. Get file tree
3. Assert error "Directory not found"

---

### F14: Doc Viewer

#### TC-F14-01: Render markdown
**Type:** Unit  
**Steps:**
1. Render DocViewer with markdown content
2. Assert headers, lists, code blocks rendered

#### TC-F14-02: Handle large doc
**Type:** Unit  
**Steps:**
1. Create 100KB doc
2. Render DocViewer
3. Assert truncation or scroll working

---

### F15: SQLite Database

*Core database tests for each table: insert, select, update, delete, foreign keys, indexes.*

---

### F16: Settings Page

#### TC-F16-01: Load settings
**Type:** Unit  
**Steps:**
1. Call getSettings()
2. Assert returns settings object

#### TC-F16-02: Update settings
**Type:** Unit  
**Steps:**
1. Call updateSettings({ theme: 'dark' })
2. Assert setting persisted

#### TC-F16-03: Settings E2E
**Type:** E2E  
**Steps:**
1. Navigate to settings
2. Change theme
3. Assert theme applied

---

## Non-Functional Tests

### Performance

| Test | Target | Method |
|------|--------|--------|
| Project switch time | < 500ms | Measure with performance.now() |
| Chat send latency | < 100ms | Measure until stream starts |
| File tree load | < 1s for 1000 files | Profile with test directory |

### Security

| Test | Validation |
|------|------------|
| Secrets encrypted | Verify raw DB values are not plaintext |
| No API keys in logs | Search logs for key patterns |
| Local-only API | Verify no external calls except AI providers |

---

## Test Execution Plan

1. **Unit tests:** Run with each MTS task completion
2. **Integration tests:** Run at end of each phase
3. **E2E tests:** Run at end of each sprint
4. **Full regression:** Run before ship (Task 88)

---

**End of Test Plan**
