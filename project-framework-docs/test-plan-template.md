# Test Plan

**Project:** [Project Name]  
**Version:** 1.0  
**Generated:** [Date]  
**Last Updated:** [Date]  
**PRD Reference:** [Link to PRD]  
**MTS Reference:** [Link to MTS]

---

## Test Strategy

| Test Type | Coverage Target | Automation | Responsibility |
|-----------|-----------------|------------|----------------|
| Unit | 80%+ code coverage | Required | Developer |
| Integration | All API endpoints | Required | Developer |
| E2E | All critical paths | Required | QA/Developer |
| Performance | Key operations | As needed | QA |
| Security | Auth + data flows | Required | Security review |

### Test Priorities

1. **Critical Path** — User can complete core workflow
2. **Happy Path** — Standard use cases work
3. **Error Handling** — System fails gracefully
4. **Edge Cases** — Boundary conditions handled

---

## Coverage Matrix

| Feature ID | Feature | Unit | Integration | E2E | Status |
|------------|---------|------|-------------|-----|--------|
| F1 | [Name] | ⬜ 0/X | ⬜ 0/X | ⬜ 0/X | Not Started |
| F2 | [Name] | ⬜ 0/X | ⬜ 0/X | ⬜ 0/X | Not Started |
| F3 | [Name] | ⬜ 0/X | ⬜ 0/X | ⬜ 0/X | Not Started |
| F4 | [Name] | ⬜ 0/X | ⬜ 0/X | ⬜ 0/X | Not Started |

**Status Legend:**
- ⬜ Not Started
- 🔄 In Progress
- ✅ Complete
- ❌ Blocked

---

## Test Cases by Feature

---

### Feature: F1 — [Feature Name]

**Source:** PRD-F1  
**Acceptance Criteria Source:** PRD Section X.X

| Test ID | Description | Type | Input | Expected | Status |
|---------|-------------|------|-------|----------|--------|
| F1-T01 | [From acceptance criterion 1] | Unit | [Input] | [Output] | ⬜ |
| F1-T02 | [From acceptance criterion 2] | Unit | [Input] | [Output] | ⬜ |
| F1-T03 | [From acceptance criterion 3] | Integration | [Input] | [Output] | ⬜ |
| F1-T04 | [E2E for feature] | E2E | [Input] | [Output] | ⬜ |

**Edge Case Tests:**

| Test ID | Edge Case | Expected Behavior | Status |
|---------|-----------|-------------------|--------|
| F1-E01 | [Edge case from PRD] | [Expected behavior] | ⬜ |
| F1-E02 | [Edge case from PRD] | [Expected behavior] | ⬜ |

---

### Feature: F2 — [Feature Name]

**Source:** PRD-F2  
**Acceptance Criteria Source:** PRD Section X.X

| Test ID | Description | Type | Input | Expected | Status |
|---------|-------------|------|-------|----------|--------|
| F2-T01 | [From acceptance criterion 1] | Unit | [Input] | [Output] | ⬜ |
| F2-T02 | [From acceptance criterion 2] | Unit | [Input] | [Output] | ⬜ |
| F2-T03 | [Integration test] | Integration | [Input] | [Output] | ⬜ |

**Edge Case Tests:**

| Test ID | Edge Case | Expected Behavior | Status |
|---------|-----------|-------------------|--------|
| F2-E01 | [Edge case] | [Expected behavior] | ⬜ |

---

### Feature: F3 — [Feature Name]

**Source:** PRD-F3

| Test ID | Description | Type | Input | Expected | Status |
|---------|-------------|------|-------|----------|--------|
| F3-T01 | [Test description] | Unit | [Input] | [Output] | ⬜ |
| F3-T02 | [Test description] | Integration | [Input] | [Output] | ⬜ |

---

## Agent Test Suites

Tests verifying AI agents behave according to their constitutions.

---

### Agent: A1 — [Agent Name]

**Constitution Source:** Agent Crew Spec A1

| Test ID | Scenario | Expected Behavior | Status |
|---------|----------|-------------------|--------|
| A1-T01 | Task within responsibilities | Completes successfully | ⬜ |
| A1-T02 | Task outside boundaries | Refuses or hands off | ⬜ |
| A1-T03 | Failure scenario | Follows failure protocol | ⬜ |
| A1-T04 | Handoff trigger | Correct handoff executed | ⬜ |
| A1-T05 | Quality standards | Output meets all standards | ⬜ |

---

### Agent: A2 — [Agent Name]

**Constitution Source:** Agent Crew Spec A2

| Test ID | Scenario | Expected Behavior | Status |
|---------|----------|-------------------|--------|
| A2-T01 | Task within responsibilities | Completes successfully | ⬜ |
| A2-T02 | Task outside boundaries | Refuses or hands off | ⬜ |
| A2-T03 | Failure scenario | Follows failure protocol | ⬜ |
| A2-T04 | Handoff trigger | Correct handoff executed | ⬜ |

---

## Performance Benchmarks

| Operation | Target | Acceptable | Unacceptable | Test Method |
|-----------|--------|------------|--------------|-------------|
| [Operation 1] | < 100ms | < 500ms | > 500ms | [How measured] |
| [Operation 2] | < 1s | < 3s | > 3s | [How measured] |
| [Operation 3] | < 200ms | < 1s | > 1s | [How measured] |
| Page load | < 2s | < 4s | > 4s | Lighthouse |
| API response (p95) | < 200ms | < 500ms | > 500ms | Load test |

---

## Security Tests

| Test ID | Test | Description | Method | Status |
|---------|------|-------------|--------|--------|
| SEC-01 | Authentication bypass | Attempt access without token | Manual + Auto | ⬜ |
| SEC-02 | Token expiration | Verify expired tokens rejected | Auto | ⬜ |
| SEC-03 | SQL injection | Standard injection vectors | Auto (OWASP) | ⬜ |
| SEC-04 | XSS | Cross-site scripting vectors | Auto | ⬜ |
| SEC-05 | CSRF | Cross-site request forgery | Auto | ⬜ |
| SEC-06 | Authorization | Access resources without permission | Manual + Auto | ⬜ |
| SEC-07 | Data exposure | Verify PII not in logs/responses | Manual | ⬜ |
| SEC-08 | Rate limiting | Verify rate limits enforced | Auto | ⬜ |

---

## Test Environment

| Environment | Purpose | Data | URL | Notes |
|-------------|---------|------|-----|-------|
| Local | Development | Mock/Seed | localhost:3000 | Individual dev |
| CI | Automated tests | Mock | N/A | GitHub Actions |
| Staging | Integration | Sanitized prod | [URL] | Pre-prod mirror |
| Production | Smoke tests only | Real | [URL] | Post-deploy verify |

### Test Data Management

| Data Type | Source | Refresh Frequency |
|-----------|--------|-------------------|
| Seed data | [Script/file location] | Per test run |
| Mock data | [Location] | Static |
| Sanitized prod | [Process] | Weekly |

---

## Regression Protocol

When bugs are found:

1. **Write failing test** that reproduces the bug
2. **Fix the bug** in code
3. **Verify test passes** after fix
4. **Test becomes permanent** — added to regression suite
5. **Log in Decision Log** if fix changes MTS

---

## Test Execution Checklist

### Before Each Sprint

- [ ] All existing tests passing
- [ ] New feature tests written for sprint scope
- [ ] Test environment healthy

### Before Ship

- [ ] 100% of test cases pass
- [ ] Security test suite pass
- [ ] Performance benchmarks met
- [ ] No critical/major bugs open

---

## Change Log

| Date | Version | Change | Reason |
|------|---------|--------|--------|
| [Date] | 1.0 | Initial creation | Generated from PRD |
| | | | |

---

**End of Test Plan**
