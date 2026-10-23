# Lecturer KPI Status & Audit Report

**Date:** October 23, 2026  
**Project:** School of Management Business Intelligence (SOM-BI)  
**Institution:** Mae Fah Luang University (MFU), School of Management  
**Scope:** Verification of KPI metrics for three selected faculty members and failure root-cause analysis.

---

## 1. Executive Summary

A validation audit was performed against the local database (`senior_project.lecturer_profiles`) and the live university **MFU E-port KPI API** (`https://eport.mfu.ac.th/api/master/get_Percentage`) for Evaluation Round 9 (`evaluateid: 9`).

### Quick Status Matrix

| Lecturer | Official Staff Code | In Local DB (`lecturer_profiles`) | E-port KPI API Status (Round 9) | Total Score | Status Verdict |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Asst. Prof. Dr. Tosporn Arreeras** | `63212199` | ✅ Found | ✅ Full Data Returned | **96.20%** | **Success** (Active & Excellent) |
| **Ajarn Dr. Piyatida Pianluprasidh** | `49212075` | ✅ Found | ⚠️ Record Exists (Zeroed) | **0.00%** | **Inactive / Sabbatical / Unscored** |
| **Asst. Prof. Dr. Phutawan Ho Wongyai** | *Unmapped* | ❌ Missing | ❌ Query Impossible | **N/A** | **Failed (Missing Staff Code & Profile)** |

---

## 2. Detailed Findings Per Lecturer

### 2.1 Assistant Professor Dr. Tosporn Arreeras
* **Staff Code:** `63212199`
* **Email:** `tosporn.arr@mfu.ac.th`
* **Academic Program:** Business Administration / Aviation Management (`program_id: 2`)
* **Local Database Status:** Present in `lecturer_profiles` table.
* **Evaluation Track:** **Research Track** (`domainscorename: Research`)
* **Live KPI Breakdown (Round 9):**
  * **Domain 1 (Teaching):** 34.90 / 35.00 *(Threshold: 90)*
  * **Domain 2 (Research):** 40.00 / 40.00 *(Threshold: 80)*
  * **Domain 3 (Academic Service):** 10.00 / 10.00 *(Threshold: 10)*
  * **Domain 4 (Administration):** 5.00 / 5.00 *(Threshold: 20)*
  * **Domain 5 (Development & Culture):** 10.00 / 10.00 *(Threshold: 40)*
  * **Academic Performance (60%):** **59.94%**
  * **Behavior Score (40%):** **36.26%**
  * **Total Score (100%):** **96.20%**
  * **Classification:** **Excellent** (`totalScore ≥ 85`)

---

### 2.2 Ajarn Dr. Piyatida Pianluprasidh
* **Staff Code:** `49212075`
* **Email:** `piyatida@mfu.ac.th`
* **Academic Program:** Business Administration (`program_id: 2`)
* **Local Database Status:** Present in `lecturer_profiles` table.
* **Evaluation Track:** **Teaching Track** (`domainscorename: Teaching`)
* **Live KPI Breakdown (Round 9):**
  * **Domain 1 (Teaching):** 0.00 / 60.00 *(Threshold: 170)*
  * **Domain 2 (Research):** 0.00 / 15.00 *(Threshold: 25)*
  * **Domain 3 (Academic Service):** 0.00 / 10.00 *(Threshold: 10)*
  * **Domain 4 (Administration):** 0.00 / 5.00 *(Threshold: 30)*
  * **Domain 5 (Development & Culture):** 0.00 / 10.00 *(Threshold: 40)*
  * **Academic Performance (60%):** **0.00%**
  * **Behavior Score (40%):** **0.00%**
  * **Total Score (100%):** **0.00%**
  * **Classification:** **Very Poor / On Leave**
  * **Audit Note:** The university E-port API returned HTTP 200 with an active record for Round 9, but all score buckets are zero. This typically indicates study leave, sabbatical, medical leave, or pending departmental score submission.

---

### 2.3 Assistant Professor Dr. Phutawan Ho Wongyai
* **Academic Identity:** Assistant Professor in the Aviation Business Management Programme, School of Management, Mae Fah Luang University.
* **Email:** `phutawan.ho@mfu.ac.th`
* **Local Database Status:** **Not Found** in `lecturer_profiles`.
* **API Result:** **Failed** (No query could be executed).

---

## 3. Root Cause Analysis: Why Phutawan Ho Wongyai Fails

The failure to retrieve KPI metrics for Dr. Phutawan Ho Wongyai is caused by a **data architecture dependency** between the application and the university's external E-port API:

```
[ User Selects / Signs In ]
         │
         ▼
[ Step 1: Identity Lookup ]
   Backend calls: SELECT staff_code FROM lecturer_profiles WHERE email = 'phutawan.ho@mfu.ac.th'
         │
         ▼
   ❌ RECORD NOT FOUND (HTTP 404: "Staff member not found for this email")
         │
         ▼
   ⛔ PIPELINE HALTED: No staff_code available
         │
         ▼
[ Step 2: University E-port KPI API ]
   GET https://eport.mfu.ac.th/api/master/get_Percentage
   Required Header: 'staffcode' ──► CANNOT BE SENT
```

### Detailed Breakdown of Constraints:

1. **The External KPI API Does Not Support Name or Email Lookups:**
   * The university's central API (`https://eport.mfu.ac.th/api/master/get_Percentage`) only accepts requests containing an official 8-digit university employee ID in the `staffcode` header.
   * If a request is sent without `staffcode`, the university API crashes with `HTTP 500: Internal Server Error`.

2. **The Database is the Sole Source of Identity Mapping:**
   * In SOM-BI, the local MySQL table `lecturer_profiles` bridges user identities (Google Auth email) to the university's backend (`staff_code`).
   * Because Dr. Phutawan was not included in the initial 59 seed records in `senior_project_final.sql`, the lookup fails at step 1.

3. **No Automatic Faculty Synchronization Exists:**
   * As documented in the system architecture review, the university Tech team does not allow external write access or automated synchronization of faculty rosters from the central HR system. New or missing lecturers must be registered in the local database.

---

## 4. Recommended Remediation Plan

To resolve the failure and enable KPI tracking for Dr. Phutawan Ho Wongyai:

### Step 1: Obtain the Official MFU Staff Code
Obtain Dr. Phutawan's 8-digit HR staff code from the School of Management personnel directory (e.g., `6XXXXXXX`).

### Step 2: Insert the Profile Record into MySQL
Execute the following SQL insertion into the `senior_project` database:

```sql
INSERT INTO `lecturer_profiles` (
  `staff_code`, 
  `staff_name`, 
  `phone`, 
  `location`, 
  `program`, 
  `program_id`, 
  `position`, 
  `email`
) VALUES (
  'YOUR_STAFF_CODE_HERE',                      -- Replace with actual 8-digit staff code
  'Assistant Professor Dr. Phutawan Ho Wongyai',
  '053-916-000',                              -- Office contact number
  'Chiang Rai, Thailand',
  'Aviation Management',
  5,                                          -- program_id 5 = Aviation Management (AVI)
  'Assistant Professor',
  'phutawan.ho@mfu.ac.th'
);
```

### Step 3: Verify KPI Retrieval
Once inserted, verify using the existing backend proxy:
```bash
curl -X GET "http://localhost:8080/api/mfu/get_Percentage?evaluateid=9&staffcode=YOUR_STAFF_CODE_HERE&lang=en" \
  -H "Authorization: Bearer <FIREBASE_ADMIN_TOKEN>"
```

The system will then display his full KPI card, domain weights, and radar charts across all admin and lecturer dashboards.
