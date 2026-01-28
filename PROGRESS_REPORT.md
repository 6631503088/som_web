# SOM BI System - Progress Modification Report

**Date:** January 9, 2026  
**Project:** School of Management Business Intelligence System  
**Meeting:** Project Advisor Progress Update

---

## 1. API Authentication System Upgrade

### Before Modification
- ❌ No API authentication
- ❌ All endpoints were publicly accessible
- ❌ No user verification
- ❌ Any user could access any data
- ❌ Security vulnerability - data exposed without protection

### After Modification
- ✅ **Role-Based Access Control (RBAC)** implemented
- ✅ **Firebase Authentication** integration with Google Sign-In
- ✅ **JWT Token Verification** on all API endpoints
- ✅ **Three user roles** defined: Admin, Dean, Lecturer

---

## 2. Role-Based Access Control Details

### User Roles & Permissions

| Role | Access Level | Permissions |
|------|--------------|-------------|
| **Admin** | Full Access | View all lecturers' data, manage users, access all dashboards |
| **Dean** | Faculty Access | View faculty-wide data, department statistics |
| **Lecturer** | Self Access Only | View own profile, own KPI data, own budget |

### Authentication Flow

```
1. User signs in with Google (@mfu.ac.th email)
           ↓
2. Firebase Auth validates credentials
           ↓
3. System checks Firestore 'users' collection for role
           ↓
4. If no role → Redirect to Role Setup page
           ↓
5. User selects role + enters role password
           ↓
6. Role assigned → Redirect to role-specific dashboard
           ↓
7. All API calls include Firebase ID Token
           ↓
8. Backend verifies token + checks role permissions
```

---

## 3. Technical Implementation

### Frontend (Nuxt.js/Vue.js)
- `useFirebaseAuth.ts` - Handles authentication state and role management
- `role-setup.vue` - New user role assignment page
- Role-based route guards on all pages
- Automatic redirect based on user role

### Backend (Node.js/Express)
- `middleware/auth.js` - Token verification middleware
- `verifyToken` - Validates Firebase ID tokens
- `checkStaffAccess` - Ensures lecturers can only access own data
- `requireAdmin` - Restricts admin-only endpoints

### Protected Endpoints

| Endpoint | Protection Level |
|----------|------------------|
| `/api/lecturer/profile/:staffCode` | Own data or Admin |
| `/api/lecturer/education/:staffCode` | Own data or Admin |
| `/api/budget/overview/:staffCode` | Own data or Admin |
| `/api/admin/lecturers` | Admin/Dean only |
| `/api/evaluation-periods` | All authenticated users |

---

## 4. Data Storage Architecture

### Firestore (Authentication & Roles)
```
Collection: users
Document ID: user email
Fields:
  - email: string
  - role: 'admin' | 'dean' | 'lecturer'
  - displayName: string
  - photoURL: string
  - isActive: boolean
  - createdAt: timestamp
  - lastLogin: string
```

### MySQL (Academic Data)
```
Table: lecturer_profiles
Primary Key: staff_code
Fields:
  - staff_code, staff_name, email, phone
  - location, program, position

Related Tables:
  - lecturer_education
  - lecturer_publications
  - lecturer_research_areas
  - budget_categories
  - budget_projects
```

### Relationship
- **Email** is the bridge between Firestore (auth) and MySQL (data)
- Staff code lookup: `SELECT staff_code FROM lecturer_profiles WHERE email = ?`

---

## 5. Security Improvements Summary

| Aspect | Before | After |
|--------|--------|-------|
| API Access | Public | Token Required |
| Data Isolation | None | Role-Based |
| User Verification | None | Firebase Auth |
| Route Protection | None | Role Guards |
| Admin Functions | Exposed | Protected |

---

## 6. Additional Updates

*(Add more updates below)*

- 

- 

- 

---

## 7. Next Steps / Planned Improvements

*(Add planned features)*

- 

- 

- 

---

**Prepared by:** Team Members  
**Advisor:** [Advisor Name]
