# SOM-BI Tuesday Meeting Summary & Outcomes

**Meeting Date:** Tuesday, March 18, 2026  
**Location:** University Tech Team Office / Online  
**Project:** SOM-BI — School of Management Business Intelligence System  
**Attendees:**
- SOM-BI Development Team (Thomas + Team)
- University Advisor
- KPI API Provider — Assist. Phi Chai (University Tech Team)

---

## 1. Meeting Purpose

The meeting was held to discuss and clarify the integration between our SOM-BI system and the university's **E-port KPI API**, with the goal of:

1. Understanding the full scope of available KPI endpoints
2. Requesting modifications to the KPI API response to include `program_id` or related program identifiers
3. Clarifying data ownership and mapping responsibilities
4. Aligning on KPI data flow architecture for program-level performance reporting

---

## 2. Key Discussion Points

### 2.1 KPI API Response Structure

We reviewed the current E-port KPI API response which provides performance data across **5 evaluation domains**:

| Domain | Name | Key Metrics |
|--------|------|-------------|
| Domain 1 | **Teaching Performance** | UG/Grad courses, student projects, thesis oversight, quality of work |
| Domain 2 | **Research & Academic Work** | Research studies, publications, textbooks, patents |
| Domain 3 | **Academic Services** | Service activities, invited lecturer, external committees |
| Domain 4 | **Administrative Duties** | Curricular/school committees, course coordination |
| Domain 5 | **Self & Organizational Development** | Self-development, MFU activities, arts & culture |

**Current API Response Fields (per lecturer):**
- `staffcode` — Staff identifier
- `staffname` — Full name
- `domainscorename` — Track name (e.g., "Teaching")
- `domain1weight` through `domain5weight` — Domain weights (%)
- `domain1score` through `domain5score` — Domain earned scores
- `domain1threshold` through `domain5threshold` — Domain thresholds
- `Academic Performance (60%)` — Academic component score
- `Behavior (40%)` — Behavior component score
- `Total Score (100%)` — Overall KPI percentage

### 2.2 Our Request: Include Program/Faculty Identifier

**What We Asked:**
We requested whether the E-port KPI API response could include `program_id`, `program_code`, `faculty_name`, or any related field so that we can:
- Filter lecturers by program directly from the API
- Calculate program-level KPI averages without maintaining a separate mapping
- Reduce dependency on our local database for program association

**Response from Assist. Phi Chai (University Tech Team):**

> ❌ **The university Tech team confirmed they CANNOT modify the original E-port KPI API response structure.**

**Reasons Given:**
- The E-port API is a centralized university-wide system managed by the IT division
- The KPI API endpoints and response schemas are governed by the original KPI documentation
- Adding custom fields (like `program_id`) would require changes to the core E-port system
- The Tech team does not have authority or access to modify the original API response structure
- Any changes to the API schema would need to go through the university's IT governance process, which is outside the scope of this project

### 2.3 Agreed Solution: Local Mapping Strategy

Since the API cannot be modified, the following approach was agreed upon:

**Our Responsibility:**
1. **Fetch KPI data using `staff_code`** — This is the only identifier available in the E-port API
2. **Maintain a local `lecturer_profiles` table** — Contains `staff_code` (PK) and `program_id` (FK)
3. **Match staff_code from API response with our database** — Join KPI data with program information
4. **Calculate program-level KPI at the application layer** — Aggregate scores by program

**Data Flow:**
```
E-port API                     Our System                      Output
──────────                    ──────────                      ────────
GET /get_Percentage     →    Match staff_code          →    Individual KPI
  (by staff_code)             in lecturer_profiles            Dashboard
                              table
                                    ↓
                              Get program_id            →    Program-level
                              from FK relationship            KPI Summary
                                    ↓
                              Aggregate scores          →    Dean Overview
                              by program_id                   Dashboard
```

---

## 3. Technical Details Confirmed

### 3.1 API Authentication
| Item | Detail |
|------|--------|
| **Base URL** | `https://eport.mfu.ac.th/api/master` |
| **Auth Method** | POST `/login` → Bearer Token |
| **Credentials** | Username: `sombi` / Password: provided |
| **Token Lifetime** | ~24 hours (we cache for 23 hours) |
| **Total Endpoints** | 45 (1 POST login + 44 GET data endpoints) |

### 3.2 KPI Endpoints Used
| Category | Endpoints | Count |
|----------|-----------|-------|
| Base Config | get_Evaluate, get_Percentage | 2 |
| Teaching (Domain 1) | get_Undergraduate, get_Graduate, raw scores, quality, etc. | 9 |
| Research (Domain 2) | get_ResearchStudies, get_ResearchPublication, raw scores, etc. | 9 |
| Academic Service (Domain 3) | get_AcademicServiceActivities, invited lecturer, raw scores | 7 |
| Administration (Domain 4) | Committees, coordination, raw scores | 10 |
| Self Development (Domain 5) | Self-development, MFU activities, raw scores | 7 |

### 3.3 Request Parameters (All GET endpoints)
| Header | Required | Description |
|--------|----------|-------------|
| `Authorization` | ✅ | Bearer {token} |
| `evaluateid` | ✅ | Evaluation round ID (e.g., 9) |
| `staffcode` | ⚠️ | Staff ID (optional for bulk) |
| `lang` | ✅ | Language: `th` or `en` |

### 3.4 Our Database Schema for Mapping
```sql
-- Table: lecturer_profiles (59 records)
staff_code    VARCHAR(20) PK   -- Links to E-port API staffcode
staff_name    VARCHAR(100)     -- Full name with academic title
program_id    INT FK           -- Links to programs table
program       VARCHAR(100)     -- Program name (text)
email         VARCHAR(255)     -- Login identifier (bridge to Firebase Auth)
position      VARCHAR(50)      -- Academic rank

-- Table: programs (8 records)
program_id    INT PK AUTO      -- 1-8
program_code  VARCHAR(20) UNI  -- ACC, BA, ECO, TRM, AVI, HRM, LOG, DEAN
program_name  VARCHAR(255) UNI -- Full program name
is_active     TINYINT(1)       -- Active flag
```

---

## 4. Action Items from Meeting

| # | Action Item | Owner | Status | Priority |
|---|-------------|-------|--------|----------|
| 1 | Maintain local `lecturer_profiles` → `programs` mapping | Dev Team | ✅ Done | High |
| 2 | Build backend proxy for E-port API (hide credentials) | Dev Team | ✅ Done | High |
| 3 | Implement per-lecturer KPI fetching via `staff_code` | Dev Team | ✅ Done | High |
| 4 | Build program-level KPI aggregation logic | Dev Team | 🔄 In Progress | High |
| 5 | Ensure all 59 lecturers have correct `program_id` | Dev Team | ✅ Done | High |
| 6 | Implement KPI caching (reduce API calls) | Dev Team | 🔄 Client-side done | Medium |
| 7 | Build Dean dashboard with program KPI averages | Dev Team | 🔄 In Progress | High |
| 8 | Keep lecturer_profiles database updated when staff changes | Dev Team / Admin | 📋 Ongoing | Medium |
| 9 | Confirm evaluation period defaults with advisor | Advisor | 📋 Pending | Medium |
| 10 | Request data dictionary from Tech team | Dev Team → Phi Chai | 📋 Pending | Low |

---

## 5. Challenges & Risks Identified

### 5.1 No Bulk API Endpoint
- **Issue:** We must call the E-port API individually for each of the 59 lecturers
- **Impact:** ~6 batches of 10 concurrent calls; total load time ~10-15 seconds
- **Mitigation:** Client-side caching via `useKpiCache` composable; plan to add server-side caching

### 5.2 No Program Identifier in API Response
- **Issue:** The core challenge — API doesn't include program/faculty data
- **Impact:** Extra local database dependency; potential for stale mapping if staff transfers between programs
- **Mitigation:** Admin interface for managing `lecturer_profiles` with program assignment; regular verification

### 5.3 API Availability
- **Issue:** No formal SLA or maintenance window notification from E-port API
- **Impact:** Dashboard may show empty/error states during API downtime
- **Mitigation:** Fallback data strategy; error state UI; planned server-side cache

### 5.4 Identity Mapping Consistency
- **Issue:** Email is the bridge between Firebase Auth and MySQL staff_code, but mapping relies on manual data entry
- **Impact:** New lecturers won't have KPI data until added to local database
- **Mitigation:** Public lookup endpoint (`POST /api/lecturer/lookup-staffcode`); admin CRUD interface

---

## 6. Current System Status (Post-Meeting)

| Component | Status | Details |
|-----------|--------|---------|
| **E-port API Integration** | ✅ Working | 45 endpoints proxied via backend |
| **Individual KPI Dashboard** | ✅ Complete | All 5 domains with charts and tables |
| **Admin KPI Overview** | ✅ Complete | All 59 lecturers with batch fetching |
| **Lecturer Profiles DB** | ✅ Complete | 59 profiles across 8 programs |
| **Program Management** | ✅ Complete | CRUD for 8 programs |
| **Staff → Program Mapping** | ✅ Complete | All lecturers have `program_id` assigned |
| **Program-level KPI Aggregation** | 🔄 In Progress | Need aggregation endpoint |
| **Server-side KPI Caching** | ❌ Not Started | Recommended for production |
| **Dean Dashboard** | 🔄 In Progress | Partially static content |

---

## 7. Next Steps

### Immediate (This Week)
1. Build program-level KPI aggregation endpoint on backend
2. Implement server-side KPI data caching (reduce E-port API load)
3. Update Dean dashboard with live program KPI data

### Short-term (Next 2 Weeks)
4. Add evaluation period comparison feature
5. Implement KPI data export (PDF/Excel)
6. Security hardening (bind ports, add swap, configure UFW)

### Medium-term (Before Go-Live)
7. Automated KPI refresh scheduling (cron job)
8. Monitoring and alerting setup
9. Comprehensive testing and QA
10. Data dictionary documentation from E-port team

---

## 8. Summary

The Tuesday meeting confirmed that **the E-port KPI API cannot be modified** to include program identifiers. Our team is fully responsible for:

1. **Maintaining the `staff_code` ↔ `program_id` mapping** in our local database
2. **Fetching KPI data per-lecturer** via the E-port API using `staff_code`
3. **Aggregating program-level performance** at the application layer
4. **Keeping the mapping current** when staff changes occur

This approach is **already implemented** in the current system with 59 lecturer profiles correctly mapped to 8 programs. The remaining work focuses on building the program-level aggregation views and improving caching/performance.

---

*Meeting Summary prepared on March 22, 2026*  
*SOM-BI Development Team*
