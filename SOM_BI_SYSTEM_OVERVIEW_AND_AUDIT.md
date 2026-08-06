# SOM-BI System Overview & Audit Report

**Project:** SOM-BI — Faculty Performance Management System  
**Institution:** Mae Fah Luang University, School of Management  
**Domain:** [som.mlbbshop.app](https://som.mlbbshop.app)  
**Report Date:** March 22, 2026  
**Prepared by:** SOM-BI Development Team

---

## 1. Executive Summary

SOM-BI (School of Management — Business Intelligence) is a comprehensive web-based faculty performance management system built for the School of Management at Mae Fah Luang University. The system integrates with the university's **E-port KPI API** to fetch lecturer performance data across 5 evaluation domains, manages internal lecturer profiles, budget tracking, program management, and provides role-based dashboards for Administrators, Deans, and Lecturers.

### Key Highlights
- **59 lecturer profiles** across **8 academic programs**
- **80 budget projects** tracked
- **3 user roles**: Admin, Dean, Lecturer
- Real-time KPI data from MFU E-port API (via backend proxy)
- Firebase Authentication for secure access
- Deployed on DigitalOcean VPS with Nginx + SSL

---

## 2. System Architecture

### 2.1 High-Level Architecture Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                    Client (Browser)                          │
│                                                              │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐    │
│  │ Admin Panel  │  │ Dean Panel   │  │ Lecturer Panel   │    │
│  │ /admin/*     │  │ /dean/*      │  │ /lecturer/*      │    │
│  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘    │
│         │                 │                   │              │
│         └─────────────────┼───────────────────┘              │
│                           │                                  │
│                  ┌────────┴─────────┐                        │
│                  │  Nuxt 3 Frontend │                        │
│                  │  (SSR, Port 3000)│                        │
│                  └────────┬─────────┘                        │
└───────────────────────────┼──────────────────────────────────┘
                            │ HTTPS
                    ┌───────┴────────┐
                    │   Nginx Rev.   │
                    │   Proxy + SSL  │
                    │   (Port 443)   │
                    └───────┬────────┘
                            │
           ┌────────────────┼────────────────┐
           │                │                │
    ┌──────┴──────┐  ┌──────┴──────┐  ┌──────┴──────────┐
    │  SOM Backend │  │ SOM Frontend│  │ MoMo Learn      │
    │  Express.js  │  │  Nuxt 3 SSR │  │ Express.js      │
    │  Port 8080   │  │  Port 3000  │  │ Port 3200       │
    │  /api/*      │  │  /          │  │ /momo/*         │
    └──────┬──────┘  └─────────────┘  └─────────────────┘
           │
    ┌──────┴──────┐         ┌─────────────────────┐
    │  MySQL DB   │         │  MFU E-port API     │
    │  Port 3306  │         │  (External)         │
    │ senior_proj │         │  eport.mfu.ac.th    │
    └─────────────┘         └─────────────────────┘
           │
    ┌──────┴──────┐
    │  Firebase   │
    │  Auth + SDK │
    │ som-bi-fb   │
    └─────────────┘
```

### 2.2 Technology Stack

| Layer | Technology | Details |
|-------|-----------|---------|
| **Frontend** | Nuxt 3 (Vue 3) | SSR-enabled, TypeScript support |
| **CSS Framework** | TailwindCSS | v6.13.2 via @nuxtjs/tailwindcss |
| **Charts** | Chart.js 4.4.9 | With chartjs-plugin-datalabels |
| **Backend API** | Express.js 4.18 | Node.js REST API server |
| **Database** | MySQL 8.x | On localhost:3306 |
| **Authentication** | Firebase Auth | Google Identity Platform |
| **Admin SDK** | firebase-admin 12.x | Server-side token verification |
| **Process Manager** | PM2 6.0.14 | 3 processes managed |
| **Web Server** | Nginx | Reverse proxy + Let's Encrypt SSL |
| **Hosting** | DigitalOcean | 1 vCPU, 2GB RAM, 48GB Disk |
| **OS** | Ubuntu 24.04 | Linux 6.8.0-71-generic |

---

## 3. Server Infrastructure Audit

### 3.1 Server Specifications

| Metric | Value | Status |
|--------|-------|--------|
| **Provider** | DigitalOcean | ✅ Active |
| **Hostname** | ubuntu-som-1vcpu-2gb-sgp | Singapore Region |
| **CPU** | 1 vCPU (x86_64) | ⚠️ Minimal |
| **RAM** | 1.9 GB total / 921 MB used | ⚠️ 48% used |
| **Disk** | 48 GB total / 4.1 GB used (9%) | ✅ Healthy |
| **Swap** | 0 B | ⚠️ No swap configured |
| **IP** | 178.128.27.166 | ✅ Accessible |
| **Domain** | som.mlbbshop.app | ✅ SSL via Let's Encrypt |

### 3.2 Running Services (PM2)

| ID | Name | Status | Uptime | Memory | CPU |
|----|------|--------|--------|--------|-----|
| 0 | **som-backend** | ✅ Online | 4 Days | 108.7 MB | 0% |
| 1 | **som-frontend** | ✅ Online | 4 Days | 93.7 MB | 0% |
| 2 | **momo-learn** | ✅ Online | 2 Days | 66.4 MB | 0% |

**Total PM2 Memory:** ~269 MB across 3 processes

### 3.3 Port Allocation

| Port | Service | Binding |
|------|---------|---------|
| 22 | SSH | 0.0.0.0 |
| 80 | Nginx (HTTP→HTTPS redirect) | 0.0.0.0 |
| 443 | Nginx (HTTPS) | 0.0.0.0 + IPv6 |
| 3000 | SOM Frontend (Nuxt SSR) | 127.0.0.1 |
| 3200 | MoMo Learn Backend | 0.0.0.0 |
| 3306 | MySQL | 127.0.0.1 |
| 8080 | SOM Backend (Express) | 0.0.0.0 |
| 33060 | MySQL X Protocol | 127.0.0.1 |

### 3.4 Nginx Configuration

The Nginx reverse proxy is configured on `som.mlbbshop.app` with:

| Path | Upstream | Purpose |
|------|----------|---------|
| `/` | `http://127.0.0.1:3000` | SOM-BI Frontend (Nuxt) |
| `/api/` | `http://127.0.0.1:8080/api/` | SOM-BI Backend API |
| `/momo/` | `http://127.0.0.1:3200/` | MoMo Learn App |

- **SSL**: Let's Encrypt certificates (auto-renew via certbot)
- **HTTP → HTTPS**: 301 redirect configured
- **WebSocket**: Upgrade headers configured for all proxy locations

---

## 4. Application #1: SOM-BI (Senior Project)

### 4.1 Frontend Architecture (Nuxt 3)

**Pages Structure:**

| Route | Role | Purpose |
|-------|------|---------|
| `/` | Public | Landing / Login page |
| `/auth/role-setup` | Auth | Role assignment on first login |
| `/unauthorized` | All | Access denied page |
| **Admin Panel** | | |
| `/admin/dashboard` | Admin | Overall system dashboard |
| `/admin/kpi` | Admin | KPI overview for all lecturers |
| `/admin/kpi/[staffCode]` | Admin | Individual lecturer KPI detail |
| `/admin/budget` | Admin | Budget management |
| `/admin/programs` | Admin | Program CRUD management |
| `/admin/users` | Admin | User management |
| `/admin/profile` | Admin | Admin profile |
| `/admin/faculty/[slug]` | Admin | Faculty detail view |
| **Dean Panel** | | |
| `/dean/dashboard` | Dean | Dean overview dashboard |
| `/dean/faculty` | Dean | Faculty overview |
| `/dean/kpi` | Dean | KPI summarized view |
| **Lecturer Panel** | | |
| `/lecturer/dashboard` | Lecturer | Personal dashboard |
| `/lecturer/kpi-overview` | Lecturer | Personal KPI overview |
| `/lecturer/teaching-performance` | Lecturer | Teaching domain details |
| `/lecturer/research-performance` | Lecturer | Research domain details |
| `/lecturer/academic-performance` | Lecturer | Academic service details |
| `/lecturer/administration` | Lecturer | Administration details |
| `/lecturer/arts-culture` | Lecturer | Arts & culture details |
| `/lecturer/budget` | Lecturer | Personal budget view |
| `/lecturer/publications` | Lecturer | Publications management |

**Layouts:** admin.vue, dean.vue, lecturer.vue, default.vue

**Key Composables (19 total):**

| Composable | Purpose |
|------------|---------|
| `useFirebaseAuth` | Firebase authentication state |
| `useAdminKpiApi` | Admin KPI data fetching (all lecturers) |
| `useMfuKpiApi` | Lecturer KPI data (individual via E-port) |
| `useMfuTeachingApi` | Teaching domain raw data |
| `useMfuResearchApi` | Research domain raw data |
| `useMfuAcademicServiceApi` | Academic service raw data |
| `useMfuAdministrationApi` | Administration domain raw data |
| `useMfuArtsCultureApi` | Arts & culture raw data |
| `useEvaluationPeriods` | Evaluation period selection |
| `useKpiCache` | Client-side KPI data caching |
| `useAdminLecturers` | Lecturer CRUD operations |
| `useAdminPrograms` | Program CRUD operations |
| `useBudget` | Budget tracking |
| `useLecturerProfile` | Lecturer profile data |
| `useLecturerEducation` | Education records |
| `useLecturerPublications` | Publication records |
| `useLecturerResearch` | Research area records |
| `useAuthenticatedFetch` | Token-based API calls |
| `useAlert` | UI alert system |

### 4.2 Backend API (Express.js)

**Total API Endpoints: 42+**

| Category | Endpoints | Auth |
|----------|-----------|------|
| Health Check | `GET /api/health` | Public |
| Lecturer Profile | `GET /api/lecturer/profile/:staffCode` | Token + Staff Access |
| Lecturer Education | `GET /api/lecturer/education/:staffCode` | Token + Staff Access |
| Lecturer Research | `GET /api/research-studies/:staffCode` | Token + Staff Access |
| Lecturer Publications | `GET /api/lecturer/publications/:staffCode` | Token + Staff Access |
| Staff Code Lookup | `POST /api/lecturer/lookup-staffcode` | Public |
| Self Development | `GET /api/self-development/:staffCode` | Token + Staff Access |
| Budget | `GET/POST/PUT/DELETE /api/budget/*` | Token |
| Evaluation Periods | `GET /api/evaluation-periods` | Token |
| **Admin - Lecturers** | `GET/POST/PUT/DELETE /api/admin/lecturers` | Token + Admin |
| **Admin - Programs** | `GET/POST/PUT/DELETE /api/admin/programs` | Token + Admin |
| **Admin - Education** | `POST/PUT/DELETE /api/admin/education` | Token + Admin |
| **Admin - Publications** | `POST/PUT/DELETE /api/admin/publications` | Token + Admin |
| **Admin - Research** | `POST/DELETE /api/admin/research-areas` | Token + Admin |
| **Admin - Dashboard** | `GET /api/admin/dashboard/programs` | Token + Admin |
| **MFU Proxy** | `GET /api/mfu/get_Percentage` | Token + Admin |
| **MFU Proxy** | `GET /api/mfu/get_Evaluate` | Public |
| **MFU Proxy** | `GET /api/mfu/:endpoint` | Token + Admin |
| **Lecturer MFU Proxy** | `GET /api/lecturer/mfu/*` | Token |

### 4.3 Database Schema (MySQL)

**Database:** `senior_project` | **User:** `som_db`

| Table | Description | Records |
|-------|-------------|---------|
| `lecturer_profiles` | Core lecturer data with staff_code (PK), program_id (FK) | **59** |
| `programs` | Academic programs (ACC, BA, ECO, TRM, AVI, HRM, LOG, DEAN) | **8** |
| `budget_projects` | Budget tracking records | **80** |
| `budget_categories` | Budget category definitions | — |
| `project_owners` | Budget project ownership | — |
| `staff_budget_info` | Staff budget allocation | — |
| `lecturer_education` | Education history records | — |
| `lecturer_publications` | Publication records | — |
| `lecturer_research_areas` | Research area specializations | — |

**Key Table: `lecturer_profiles`**

| Column | Type | Key | Note |
|--------|------|-----|------|
| staff_code | varchar(20) | PK | Links to E-port API |
| staff_name | varchar(100) | | Full name with title |
| phone | varchar(20) | | Contact |
| location | varchar(100) | | Office location |
| program | varchar(100) | | Program name (text) |
| program_id | int | FK → programs | **Links lecturer to program** |
| position | varchar(50) | | Academic rank |
| email | varchar(255) | UNI | Login identifier |

**Programs Table:**

| program_id | program_code | program_name |
|-----------|-------------|-------------|
| 1 | ACC | Accounting |
| 2 | BA | Business Administration |
| 3 | ECO | Economics |
| 4 | TRM | Tourism Management |
| 5 | AVI | Aviation Management |
| 6 | HRM | Hospitality Management |
| 7 | LOG | Logistics Management |
| 8 | DEAN | Dean Office |

---

## 5. KPI Integration with MFU E-port API

### 5.1 External API Details

| Parameter | Value |
|-----------|-------|
| **Base URL** | `https://eport.mfu.ac.th/api/master` |
| **Auth Method** | Bearer Token (via /login) |
| **Credentials** | Username: `sombi` / Password: `kTzQmR7pWv9LbYD` |
| **Token Caching** | 23-hour expiry window |

### 5.2 KPI Evaluation Domains (5 Domains)

| Domain | Name | Description |
|--------|------|-------------|
| Domain 1 | **Teaching** | Undergraduate/graduate courses, student projects, thesis oversight |
| Domain 2 | **Research** | Research studies, publications, funding |
| Domain 3 | **Academic Service** | Community service, invited lectures, consulting |
| Domain 4 | **Administration** | Curricular committees, school committees, management |
| Domain 5 | **Arts & Culture** | Self-development, MFU activities, cultural preservation |

### 5.3 KPI Data Flow

```
┌─────────────────┐     staff_code      ┌───────────────────┐
│  SOM-BI Backend  │ ──────────────────► │  MFU E-port API   │
│  (Proxy Layer)   │                     │  eport.mfu.ac.th  │
│                  │ ◄────────────────── │                   │
│  /api/mfu/*      │  KPI % + Raw Scores │  /api/master/*    │
└────────┬─────────┘                     └───────────────────┘
         │
         │  Fetches per staff_code:
         │  - get_Percentage (overall scores)
         │  - get_UnderGraduate (teaching UG)
         │  - get_Graduate (teaching Grad)
         │  - get_ResearchStudy
         │  - get_Publication
         │  - get_AcademicService
         │  - get_Committee
         │  - get_SelfDevelopment
         │  - get_MFUActivity
         │  - ... and more
         │
    ┌────┴────────────────┐
    │  lecturer_profiles   │
    │  (staff_code + PK)   │
    │  program_id (FK)     │◄── KEY LINK: Maps KPI data
    └─────────────────────┘    to academic programs
```

### 5.4 Critical Design Decision: KPI ↔ Program Mapping

> **Meeting Outcome (March 18, 2026):**  
> During the meeting with the university's Tech team advisor and KPI API provider (Assist. Phi Chai), we requested that the E-port KPI API response include `program_id` or similar identifiers to enable filtering by program. **The university's tech team confirmed they cannot modify the original E-port API response.**

**Current Solution:** Our system matches KPI data to programs by:
1. Fetching KPI via `staff_code` from E-port API
2. Looking up `staff_code` in local `lecturer_profiles` table
3. Using `program_id` foreign key to determine which program the lecturer belongs to
4. Aggregating KPI scores per program at the application layer

**Data Flow for Program-Level KPI:**
```
E-port API                    Local DB                    Application
────────                     ─────────                   ───────────
get_Percentage  ──►  Match staff_code  ──►  Group by     ──►  Program KPI
(by staff_code)      in lecturer_profiles   program_id       Dashboard
                     table
```

---

## 6. Application #2: MoMo Learn

### 6.1 Overview

| Aspect | Details |
|--------|---------|
| **Name** | MoMo Learn |
| **Type** | Quiz & Question Management Backend |
| **URL** | `https://som.mlbbshop.app/momo/` |
| **Port** | 3200 |
| **Database** | SQLite (via better-sqlite3) |
| **Framework** | Express.js 4.21 |

### 6.2 Tech Stack

| Component | Technology |
|-----------|-----------|
| Backend | Express.js |
| Database | SQLite (better-sqlite3) |
| File Upload | Multer |
| IDs | UUID v9 |
| CORS | cors middleware |

---

## 7. Security Audit

### 7.1 Authentication & Authorization

| Layer | Implementation | Status |
|-------|---------------|--------|
| **User Auth** | Firebase Authentication | ✅ Secure |
| **Token Verification** | firebase-admin SDK (server-side) | ✅ Implemented |
| **Role-Based Access** | Admin, Dean, Lecturer middleware | ✅ Functional |
| **Staff Access Control** | checkStaffAccess middleware | ✅ Restricts lecturers to own data |
| **MFU API Proxy** | Backend proxies E-port calls | ✅ Hides credentials from client |

### 7.2 Security Concerns

| Issue | Severity | Description |
|-------|----------|-------------|
| ⚠️ Port 8080 exposed | Medium | Backend API port bound to 0.0.0.0, accessible directly |
| ⚠️ Port 3200 exposed | Medium | MoMo Learn port bound to 0.0.0.0, bypasses Nginx |
| ⚠️ No swap configured | Low | Server could OOM under load |
| ⚠️ E-port credentials in .env | Low | Properly server-side, but ensure .env not in git |
| ⚠️ Hardcoded fallback staff list | Low | Fallback in useAdminKpiApi.ts could become stale |
| ✅ HTTPS enforced | — | Let's Encrypt with auto-redirect |
| ✅ CORS configured | — | Restricted to known origins |
| ✅ MySQL bound to localhost | — | Not exposed externally |

---

## 8. Performance Assessment

### 8.1 Resource Utilization

| Resource | Usage | Threshold | Status |
|----------|-------|-----------|--------|
| CPU | 0% idle | — | ✅ Low load |
| RAM | 921 MB / 1.9 GB (48%) | 80% warning | ✅ Acceptable |
| Disk | 4.1 GB / 48 GB (9%) | 80% warning | ✅ Healthy |
| PM2 Processes | 3/3 online | — | ✅ All running |

### 8.2 KPI Data Loading Performance

- **Batch Size:** 10 concurrent E-port API calls
- **Total Lecturers:** 59 → ~6 batches
- **Timeout:** 30 seconds per request
- **Caching:** Client-side via `useKpiCache` composable
- **Potential Bottleneck:** Each lecturer KPI requires individual API call (no bulk endpoint)

---

## 9. Recommendations

### 9.1 Critical (Do Now)

1. **Bind ports 8080 and 3200 to 127.0.0.1** — currently exposed to internet
2. **Add swap space** (2 GB recommended) — prevent OOM kills
3. **Implement server-side KPI caching** — Redis or file-based cache for E-port data

### 9.2 Important (Do Soon)

4. **Build program-level KPI aggregation endpoint** — API that returns pre-computed per-program KPI averages
5. **Remove hardcoded fallback staff list** — rely only on database
6. **Add UFW firewall rules** — restrict to only ports 22, 80, 443
7. **Set up automated database backups** — daily MySQL dumps

### 9.3 Nice to Have (Future)

8. **Add monitoring** (e.g., PM2 Plus, or self-hosted Grafana)
9. **Implement rate limiting** on API endpoints
10. **Consider upgrading to 2 vCPU / 4 GB RAM** for better performance under load
11. **Add API pagination** for lecturer listing endpoints
12. **Implement E-port data refresh scheduling** — cron job to pre-fetch KPI data

---

## 10. Summary Statistics

| Metric | Count |
|--------|-------|
| Total Frontend Pages | 26 |
| Total API Endpoints | 42+ |
| Total Vue Composables | 19 |
| Total Vue Components | 13 |
| Database Tables | 9 |
| Lecturer Profiles | 59 |
| Academic Programs | 8 |
| Budget Projects | 80 |
| PM2 Processes | 3 |
| Web Applications | 2 (SOM-BI + MoMo Learn) |

---

*Report generated on March 22, 2026 — SOM-BI Development Team*
