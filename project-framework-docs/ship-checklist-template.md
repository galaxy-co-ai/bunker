# Ship Checklist

**Project:** [Project Name]  
**Target Ship Date:** [Date]  
**Checklist Date:** [Date]  
**Reviewer:** [Name]

---

## Functional Completeness

All features work as specified.

| # | Criterion | Status | Notes |
|---|-----------|--------|-------|
| 1 | All MTS tasks marked complete | ⬜ | |
| 2 | All PRD Must-Have features implemented | ⬜ | |
| 3 | All PRD acceptance criteria verified | ⬜ | |
| 4 | All User Stories satisfied | ⬜ | |
| 5 | Project Brief success metrics achievable | ⬜ | |
| 6 | No missing functionality in critical path | ⬜ | |

**Functional Completeness:** ⬜ Pass | ⬜ Fail

---

## Quality

Product is stable and performant.

| # | Criterion | Status | Notes |
|---|-----------|--------|-------|
| 1 | All unit tests passing | ⬜ | |
| 2 | All integration tests passing | ⬜ | |
| 3 | All E2E tests passing | ⬜ | |
| 4 | Test coverage meets target | ⬜ | Target: [X]% |
| 5 | No critical bugs open | ⬜ | |
| 6 | No major bugs open | ⬜ | |
| 7 | Performance benchmarks met | ⬜ | |
| 8 | Code review completed for all changes | ⬜ | |
| 9 | No known regressions | ⬜ | |

**Quality:** ⬜ Pass | ⬜ Fail

---

## Documentation

Users and maintainers can understand the product.

| # | Criterion | Status | Notes |
|---|-----------|--------|-------|
| 1 | User documentation complete | ⬜ | |
| 2 | User documentation reviewed | ⬜ | |
| 3 | API documentation complete | ⬜ | |
| 4 | API documentation matches implementation | ⬜ | |
| 5 | README up to date | ⬜ | |
| 6 | Environment setup documented | ⬜ | |
| 7 | Deployment process documented | ⬜ | |
| 8 | Known issues documented | ⬜ | |

**Documentation:** ⬜ Pass | ⬜ Fail

---

## Operational Readiness

We can run and maintain this in production.

| # | Criterion | Status | Notes |
|---|-----------|--------|-------|
| 1 | Production environment configured | ⬜ | |
| 2 | Environment variables documented and set | ⬜ | |
| 3 | Database migrations ready | ⬜ | |
| 4 | Monitoring configured | ⬜ | Tool: [Name] |
| 5 | Alerting configured | ⬜ | Channel: [Destination] |
| 6 | Log aggregation working | ⬜ | Tool: [Name] |
| 7 | Backup procedure documented | ⬜ | |
| 8 | Backup procedure tested | ⬜ | |
| 9 | Recovery procedure documented | ⬜ | |
| 10 | Rollback procedure documented | ⬜ | |
| 11 | Rollback procedure tested | ⬜ | |
| 12 | SSL/TLS configured | ⬜ | |
| 13 | Domain/DNS configured | ⬜ | |

**Operational Readiness:** ⬜ Pass | ⬜ Fail

---

## Security

Product is secure for production.

| # | Criterion | Status | Notes |
|---|-----------|--------|-------|
| 1 | All security tests passing | ⬜ | |
| 2 | Authentication working correctly | ⬜ | |
| 3 | Authorization working correctly | ⬜ | |
| 4 | No sensitive data in logs | ⬜ | |
| 5 | No sensitive data in responses | ⬜ | |
| 6 | HTTPS enforced | ⬜ | |
| 7 | Security headers configured | ⬜ | |
| 8 | CORS properly configured | ⬜ | |
| 9 | Rate limiting configured | ⬜ | |
| 10 | Dependency vulnerability scan clean | ⬜ | Tool: [Name] |
| 11 | No hardcoded secrets in code | ⬜ | |
| 12 | Secrets properly managed | ⬜ | Tool: [Name] |

**Security:** ⬜ Pass | ⬜ Fail

---

## Final Checks

| # | Criterion | Status | Notes |
|---|-----------|--------|-------|
| 1 | Staging deployment successful | ⬜ | |
| 2 | Staging smoke tests pass | ⬜ | |
| 3 | Production deployment dry-run successful | ⬜ | |
| 4 | Decision Log reviewed for open items | ⬜ | |
| 5 | No blocking issues in backlog | ⬜ | |

**Final Checks:** ⬜ Pass | ⬜ Fail

---

## Sign-Off

| Role | Name | Approved | Date | Notes |
|------|------|----------|------|-------|
| Technical Lead | [Name] | ⬜ | | |
| Product Owner | [Name] | ⬜ | | |
| QA Lead | [Name] | ⬜ | | |

---

## Ship Verdict

### Summary

| Section | Status |
|---------|--------|
| Functional Completeness | ⬜ Pass / ⬜ Fail |
| Quality | ⬜ Pass / ⬜ Fail |
| Documentation | ⬜ Pass / ⬜ Fail |
| Operational Readiness | ⬜ Pass / ⬜ Fail |
| Security | ⬜ Pass / ⬜ Fail |
| Final Checks | ⬜ Pass / ⬜ Fail |
| Sign-Off | ⬜ Complete / ⬜ Pending |

### Verdict

**All sections pass + Sign-off complete?**

- ⬜ **SHIP** — Deploy to production
- ⬜ **NO SHIP** — Address failures below

### Blocking Issues (if NO SHIP)

| Issue | Section | Owner | Target Resolution |
|-------|---------|-------|-------------------|
| [Issue] | [Section] | [Who] | [Date] |

---

## Post-Ship Actions

Complete after successful deployment:

- [ ] Production deployment confirmed
- [ ] Health checks passing
- [ ] Monitoring showing expected metrics
- [ ] First real user transaction successful
- [ ] Team notified of ship
- [ ] Project Pulse updated to "Complete"
- [ ] Retrospective scheduled

---

**End of Ship Checklist**
