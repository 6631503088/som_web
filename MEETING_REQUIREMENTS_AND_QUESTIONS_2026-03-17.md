# SOM BI - Meeting Question Pack (Presentation Ready)

Date: March 17, 2026  
Project: School of Management Business Intelligence (SOM BI)

## 1) Meeting Objective
1. Confirm business and technical requirements for go-live scope.
2. Decide policy-level items that affect architecture and workflow.
3. Assign owners and deadlines for open decisions.

## 2) Suggested Agenda (60 minutes)
1. Context and target outcome (5 min)
2. Business policy decisions (15 min)
3. KPI/reporting decisions (15 min)
4. Technical advisor decisions (15 min)
5. Final approvals and owner assignment (10 min)

## 3) Current Workflow Summary (for slide context)

### A. User Flow
1. Sign in with Google.
2. User role is checked.
3. User enters role-specific dashboard.
4. Data is shown by role (Admin, Dean, Lecturer).

### B. Role Scopes
1. Admin: Institution-wide management and oversight.
2. Dean: Faculty/program-level monitoring and decision support.
3. Lecturer: Personal KPI and profile view.

## 4) Priority Questions For Stakeholders (Business)

### A. Access and Governance (Priority: High)
1. Should access be restricted to university email domains only?
2. Who is authorized to assign Admin and Dean roles?
3. Should role changes require approval and audit history?
4. Should deactivated accounts be blocked immediately across all active sessions?

### B. KPI and Evaluation Rules (Priority: High)
1. What is the official default evaluation period?
2. Should KPI history be editable after period close?
3. Can users compare periods side-by-side, or one period at a time?
4. What is the official source of truth for each KPI domain?
5. What is the official conflict rule if two data sources differ?

### C. Faculty Operation Rules (Priority: Medium)
1. Should publications/research be editable in SOM BI or read-only from source systems?
2. Should Dean permissions be read-only or include selected write actions?
3. Do we need formal data correction workflow with approval?

### D. Reporting and Decision Support (Priority: High)
1. Which dashboards/charts are mandatory for advisor and executive meetings?
2. Which export formats are mandatory (PDF, Excel, CSV, presentation-ready)?
3. Which KPI definitions are official for annual performance decisions?
4. Is full bilingual support (Thai/English) mandatory at go-live?

## 5) Priority Questions For University Tech Advisor Team

### A. Security and Identity (Priority: High)
1. What is the canonical lecturer identifier across systems?
2. What is the approved role and permission management model?
3. What minimum audit logging is required for compliance?
4. What security controls are mandatory at go-live (rate-limit, IP policy, secret rotation)?

### B. Integration and Reliability (Priority: High)
1. What SLA should be assumed for external university APIs?
2. What is the expected behavior when external API is unavailable?
3. Is there an official identity-mapping API/table that can be consumed?
4. Should background sync/caching be in go-live scope or phase 2?

### C. Infrastructure and Operations (Priority: Medium)
1. What environments are mandatory (dev/test/staging/prod)?
2. What are required backup and disaster recovery targets?
3. What monitoring/alerting baseline is required before launch?
4. What are expected peak users and performance targets?

### D. Data Governance (Priority: High)
1. What data classification applies to user and KPI records?
2. What is the retention policy for logs and KPI history?
3. Are there policy constraints for storing login metadata and IPs?

## 6) KPI API Questions For Phi Chai (Current Unclear Points)

### A. Endpoint Contract and Data Meaning (Priority: High)
1. Can you provide the official endpoint list for KPI domains and their exact request headers/parameters?
2. Is evaluateid mandatory for every KPI endpoint, and what is the official default when omitted?
3. What is the official meaning of each score field (weight, score, threshold, total) and how should they be displayed?
4. Are score formulas versioned? If formulas change, how do we know the effective date/version?
5. Is domain ordering fixed (Domain 1-5), or can domain mapping change by period/faculty?

### B. Identity and Filtering (Priority: High)
1. Is staffcode the only valid identity key for KPI endpoints, or can email/other IDs be used?
2. If one user has multiple affiliations/roles, how should data be filtered?
3. What should API return if staffcode exists but has no KPI data in selected period?
4. Is there an official API to map email to staffcode, or should this always be maintained internally?
5. KPI response currently does not include faculty/program name per lecturer. Should enrichment be handled on our side (join with local master data) or provided directly by university API side?
6. If enrichment is done on our side, which master table is the official source for faculty/program mapping and who owns updates?

### C. Reliability and Failure Behavior (Priority: High)
1. What uptime SLA and response-time target should we expect for KPI APIs?
2. What are rate limits per client/IP/token?
3. Are there maintenance windows where API may be unavailable, and how are we notified?
4. What is the required retry policy for transient failures (timeout, 5xx)?
5. Should client show empty state, last cached state, or strict error when KPI API is down?

### D. Authentication and Security (Priority: High)
1. What is the official token lifecycle (expiry, refresh strategy, max session duration)?
2. Are credentials environment-specific (dev/test/prod), and can separate accounts be issued?
3. Is credential rotation supported without downtime?
4. Are there IP allowlists or network restrictions required for production integration?
5. Is request signing or additional security header required beyond bearer token?

### E. Data Quality and Auditability (Priority: High)
1. How should we validate that KPI data is complete for a period before presenting official reports?
2. Is there any data status flag (draft/final/locked) from API?
3. If upstream data is corrected after release, do old period results change retroactively?
4. Is there an official reconciliation report/process between source systems and KPI API outputs?
5. Can we get a data dictionary document for all KPI response fields?

### F. Performance and Usage Pattern (Priority: Medium)
1. Are batch endpoints available for multiple staffcodes in one request?
2. What pagination/limit rules apply to large result sets?
3. Is server-side caching recommended, and what cache TTL is safe for KPI data?
4. Are there endpoints planned for deprecation soon that we should avoid?

### G. Answers Needed Today (Must Confirm)
1. Official default evaluateid policy.
2. Official source-of-truth and formula ownership for KPI scores.
3. API downtime behavior expected in UI (error vs cache vs zero).
4. Credential environment setup and rotation process.
5. Staff identity mapping rule (staffcode authority and mapping ownership).

## 7) Custom Feature Confirmation (Decide: Now vs Later)
1. Approval workflow module (role request/approve/revoke).
2. Data quality monitoring dashboard.
3. Manual KPI override with reason and approver.
4. Benchmarking view across programs/faculties.
5. One-click meeting briefing export.

## 8) Decisions Required Today (Final Check)
1. Access policy finalization.
2. Role governance finalization.
3. KPI source-of-truth finalization.
4. Evaluation period and lock policy finalization.
5. Go-live minimum compliance/security baseline finalization.

## 9) Decision Log Template (Use During Meeting)

| Item | Decision | Owner | Due Date | Phase |
|------|----------|-------|----------|-------|
| Access Policy |  |  |  |  |
| Role Governance |  |  |  |  |
| KPI Source of Truth |  |  |  |  |
| Evaluation Lock Rules |  |  |  |  |
| Security Baseline |  |  |  |  |
| KPI API Defaults and SLA |  |  |  |  |
| KPI Formula and Data Dictionary Owner |  |  |  |  |
| Identity Mapping Ownership |  |  |  |  |

## 10) Parking Lot (If Time Runs Out)
1. Nice-to-have dashboard enhancements.
2. Phase 2 integrations.
3. Advanced analytics and prediction features.

---
Prepared for advisor and stakeholder requirement alignment presentation.
