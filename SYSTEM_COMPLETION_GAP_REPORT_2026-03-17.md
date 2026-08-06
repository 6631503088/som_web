# SOM BI System Completion Gap Report

Date: March 17, 2026  
Scope: Current codebase assessment (frontend, backend, auth, data flow, operations)

## Overall Status
The system is functionally usable but not yet production-complete.

Current maturity estimate:
- Core features: Mostly implemented
- Access control and data governance: Partially implemented, with high-risk gaps
- Reporting trustworthiness: Partially implemented (fallback/sample data can mask failures)
- Operational readiness: Partial (limited quality gates and testing evidence)

## 1) Critical Gaps (Must Fix Before Full Completion)

### 1.1 Role provisioning is not controlled enough
- Role setup currently allows first-time role password creation from the role-setup flow.
- This should be replaced by admin-managed role assignment and/or backend-enforced approval process.

### 1.2 Secrets and external credentials are embedded with fallback defaults
- MFU API credentials are present as hardcoded fallbacks in frontend composables.
- MFU API credentials are also hardcoded in backend proxy settings.
- This creates credential leakage risk and weak secret governance.

### 1.3 Public staff-code lookup endpoint exposes internal identity mapping
- Email-to-staff-code lookup is publicly callable.
- This enables account enumeration risk and should require auth + rate limiting.

### 1.4 Authorization gap on budget write operations
- Budget create/update/delete endpoints are token-protected but do not consistently enforce staff ownership checks on write operations.
- A user can potentially submit another staff code in payload unless backend ownership check is added.

### 1.5 Fallback/sample data can be shown in production views
- Multiple KPI and lecturer pages intentionally show fallback or sample data when API calls fail.
- This is dangerous for decision-making dashboards if not visually and audibly marked as non-official.

## 2) Functional Completion Gaps

### 2.1 Dean workflow appears partially static
- Dean dashboard content is hardcoded (departments, counts) and not integrated with backend data source.
- This indicates unfinished role-specific workflow.

### 2.2 Evaluation period logic is partly hardcoded
- Several places default to evaluateid=9 and static year assumptions.
- Official period policy and closed-period behavior are not centralized.

### 2.3 Identity mapping strategy is inconsistent
- Some modules derive staff code from email prefix, others resolve via backend lookup.
- A single canonical identity mapping strategy is needed.

## 3) Engineering/Quality Gaps

### 3.1 No visible automated test baseline
- No test scripts/coverage observed in project package scripts.
- This increases regression risk for auth and KPI calculations.

### 3.2 Error and reliability policy not standardized
- Some modules return fallback values, others return errors.
- Need a consistent UX/error policy for “data unavailable” vs “true zero”.

### 3.3 Environment and configuration discipline needs tightening
- Runtime config is used, but fallback defaults include sensitive values.
- Environment parity and secret management standards should be formalized.

## 4) Required Confirmations (Business + Technical)

## A. Access and role governance
1. Final login policy: institutional domains only or all Google accounts?
2. Final role provisioning model: admin-assigned only vs self-onboarding with approval?
3. Should dean have admin-equivalent write permissions or limited read/supervision scope?

## B. Data authority and KPI policy
1. Source of truth per KPI domain: MFU API vs local DB mirror?
2. When sources conflict, which source wins?
3. Should dashboard ever display sample/fallback values in production?

## C. Evaluation period governance
1. Official default evaluation period rule.
2. Whether period data is immutable after close.
3. Whether historical recalc is allowed and audited.

## D. Security controls
1. Must all identity lookup endpoints require auth?
2. Is field-level ownership enforcement mandatory for all write endpoints?
3. Required audit logging scope (role changes, data edits, sensitive reads).

## 5) Recommended Completion Plan (Execution Order)

Phase 1 - Security hardening (highest priority)
1. Remove hardcoded credentials and rotate exposed secrets.
2. Lock down role assignment flow (disable self-bootstrap role password model).
3. Protect lookup endpoint with auth + throttling.
4. Enforce ownership checks on all budget and staff-scoped write endpoints.

Phase 2 - Data trustworthiness
1. Remove production sample data paths or clearly watermark as non-official.
2. Centralize evaluation period selection and default behavior.
3. Normalize staff identity resolution to one backend-owned mechanism.

Phase 3 - Workflow completion
1. Replace dean static dashboard content with live program/faculty data.
2. Validate role-based route and API parity across admin/dean/lecturer.

Phase 4 - Quality and release readiness
1. Add API integration tests for auth/authorization critical paths.
2. Add smoke tests for role login and dashboard data load.
3. Define release checklist: secrets, migrations, backups, monitoring, rollback.

## 6) Definition of “Full Completed” (Suggested)
The system should be marked complete only when:
1. No critical auth/security gaps remain.
2. All role workflows are data-driven (no critical static placeholders).
3. KPI outputs are sourced and labeled with trusted, governed rules.
4. Production has no hidden sample/fallback data used as official results.
5. Minimum regression tests and release checklist are in place.

---
Prepared as implementation-focused completion analysis for current system state.
