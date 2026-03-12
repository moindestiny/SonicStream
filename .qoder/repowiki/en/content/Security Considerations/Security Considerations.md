# Security Considerations

<cite>
**Referenced Files in This Document**
- [app/api/auth/route.ts](file://app/api/auth/route.ts)
- [app/api/auth/forgot/route.ts](file://app/api/auth/forgot/route.ts)
- [app/api/auth/reset/route.ts](file://app/api/auth/reset/route.ts)
- [app/api/admin/users/route.ts](file://app/api/admin/users/route.ts)
- [app/api/admin/stats/route.ts](file://app/api/admin/stats/route.ts)
- [app/api/admin/seed/route.ts](file://app/api/admin/seed/route.ts)
- [app/api/upload/route.ts](file://app/api/upload/route.ts)
- [lib/db.ts](file://lib/db.ts)
- [lib/cloudinary.ts](file://lib/cloudinary.ts)
- [prisma/schema.prisma](file://prisma/schema.prisma)
- [hooks/useAuthGuard.ts](file://hooks/useAuthGuard.ts)
- [app/admin/page.tsx](file://app/admin/page.tsx)
- [app/admin/login/page.tsx](file://app/admin/login/page.tsx)
- [app/reset-password/page.tsx](file://app/reset-password/page.tsx)
- [package.json](file://package.json)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [Project Structure](#project-structure)
3. [Core Components](#core-components)
4. [Architecture Overview](#architecture-overview)
5. [Detailed Component Analysis](#detailed-component-analysis)
6. [Dependency Analysis](#dependency-analysis)
7. [Performance Considerations](#performance-considerations)
8. [Troubleshooting Guide](#troubleshooting-guide)
9. [Conclusion](#conclusion)
10. [Appendices](#appendices)

## Introduction
This document provides comprehensive security documentation for SonicStream. It focuses on authentication and authorization, password hashing, session management, role-based access control, input validation and sanitization, protection against common vulnerabilities, secure API design, rate limiting and abuse prevention, data protection, encryption, privacy compliance, secure file uploads and Cloudinary integration, email service security, monitoring and logging, incident response, and secure development practices.

## Project Structure
SonicStream is a Next.js application with a layered architecture:
- Frontend pages and UI components under app/ and components/
- API routes under app/api/ implementing server-side logic
- Database access via Prisma ORM
- Utilities for Cloudinary image uploads and database client initialization
- Authentication and admin dashboards with local storage-based sessions

```mermaid
graph TB
subgraph "Frontend"
UI_Admin_Login["Admin Login Page<br/>(app/admin/login/page.tsx)"]
UI_Admin_Dashboard["Admin Dashboard<br/>(app/admin/page.tsx)"]
UI_Reset_Password["Reset Password Page<br/>(app/reset-password/page.tsx)"]
end
subgraph "API Routes"
API_Auth["Auth API<br/>(app/api/auth/route.ts)"]
API_Forgot["Forgot Password API<br/>(app/api/auth/forgot/route.ts)"]
API_Reset["Reset Password API<br/>(app/api/auth/reset/route.ts)"]
API_Admin_Users["Admin Users API<br/>(app/api/admin/users/route.ts)"]
API_Admin_Stats["Admin Stats API<br/>(app/api/admin/stats/route.ts)"]
API_Admin_Seed["Admin Seed API<br/>(app/api/admin/seed/route.ts)"]
API_Upload["Upload API<br/>(app/api/upload/route.ts)"]
end
subgraph "Libraries & Data"
Util_DB["DB Client<br/>(lib/db.ts)"]
Util_Cloudinary["Cloudinary Upload<br/>(lib/cloudinary.ts)"]
Schema_Prisma["Prisma Schema<br/>(prisma/schema.prisma)"]
end
UI_Admin_Login --> API_Auth
UI_Admin_Login --> API_Admin_Users
UI_Admin_Dashboard --> API_Admin_Stats
UI_Admin_Dashboard --> API_Admin_Users
UI_Reset_Password --> API_Reset
API_Auth --> Util_DB
API_Forgot --> Util_DB
API_Reset --> Util_DB
API_Admin_Users --> Util_DB
API_Admin_Stats --> Util_DB
API_Admin_Seed --> Util_DB
API_Upload --> Util_Cloudinary
Util_DB --> Schema_Prisma
```

**Diagram sources**
- [app/admin/login/page.tsx](file://app/admin/login/page.tsx)
- [app/admin/page.tsx](file://app/admin/page.tsx)
- [app/reset-password/page.tsx](file://app/reset-password/page.tsx)
- [app/api/auth/route.ts](file://app/api/auth/route.ts)
- [app/api/auth/forgot/route.ts](file://app/api/auth/forgot/route.ts)
- [app/api/auth/reset/route.ts](file://app/api/auth/reset/route.ts)
- [app/api/admin/users/route.ts](file://app/api/admin/users/route.ts)
- [app/api/admin/stats/route.ts](file://app/api/admin/stats/route.ts)
- [app/api/admin/seed/route.ts](file://app/api/admin/seed/route.ts)
- [app/api/upload/route.ts](file://app/api/upload/route.ts)
- [lib/db.ts](file://lib/db.ts)
- [lib/cloudinary.ts](file://lib/cloudinary.ts)
- [prisma/schema.prisma](file://prisma/schema.prisma)

**Section sources**
- [app/admin/login/page.tsx](file://app/admin/login/page.tsx)
- [app/admin/page.tsx](file://app/admin/page.tsx)
- [app/api/auth/route.ts](file://app/api/auth/route.ts)
- [app/api/admin/users/route.ts](file://app/api/admin/users/route.ts)
- [app/api/admin/stats/route.ts](file://app/api/admin/stats/route.ts)
- [app/api/admin/seed/route.ts](file://app/api/admin/seed/route.ts)
- [app/api/upload/route.ts](file://app/api/upload/route.ts)
- [lib/db.ts](file://lib/db.ts)
- [lib/cloudinary.ts](file://lib/cloudinary.ts)
- [prisma/schema.prisma](file://prisma/schema.prisma)

## Core Components
- Authentication and Authorization:
  - Email/password sign-up/sign-in with hashed passwords
  - Role-based access control (USER vs ADMIN)
  - Admin-only dashboard protected by local storage session and role checks
- Password Management:
  - Password reset with time-bound tokens and email delivery
- Data Access:
  - Prisma ORM for database queries and relations
- File Uploads:
  - Base64 image upload to Cloudinary with transformations
- Session Management:
  - Local storage-based admin session persistence

**Section sources**
- [app/api/auth/route.ts](file://app/api/auth/route.ts)
- [app/api/auth/forgot/route.ts](file://app/api/auth/forgot/route.ts)
- [app/api/auth/reset/route.ts](file://app/api/auth/reset/route.ts)
- [app/admin/page.tsx](file://app/admin/page.tsx)
- [app/admin/login/page.tsx](file://app/admin/login/page.tsx)
- [prisma/schema.prisma](file://prisma/schema.prisma)
- [lib/cloudinary.ts](file://lib/cloudinary.ts)

## Architecture Overview
The security architecture centers around:
- API boundaries enforcing authentication and authorization
- Role checks for privileged endpoints
- Secure password handling and reset workflows
- Controlled file upload pipeline to Cloudinary
- Database schema with strong typing and constraints

```mermaid
sequenceDiagram
participant Client as "Admin UI"
participant AuthAPI as "Auth API (/api/auth)"
participant DB as "Prisma DB"
participant AdminUI as "Admin Dashboard"
Client->>AuthAPI : POST /api/auth {action : "signin", email, password}
AuthAPI->>DB : findUnique(user by email)
DB-->>AuthAPI : user record
AuthAPI->>AuthAPI : hash password and compare
AuthAPI-->>Client : {user with role}
Client->>AdminUI : store admin-session in localStorage
AdminUI->>AdminUI : enforce role == ADMIN
```

**Diagram sources**
- [app/api/auth/route.ts](file://app/api/auth/route.ts)
- [app/admin/login/page.tsx](file://app/admin/login/page.tsx)
- [app/admin/page.tsx](file://app/admin/page.tsx)
- [lib/db.ts](file://lib/db.ts)

## Detailed Component Analysis

### Authentication and Authorization
- Sign-up and Sign-in:
  - Validates presence of email and password
  - On sign-up, optionally uploads avatar to Cloudinary and stores hashed password
  - On sign-in, compares hashed password and returns user with role
- Role-Based Access Control:
  - Role enum includes USER and ADMIN
  - Admin dashboard enforces role check and redirects unauthorized users
- Admin Session Management:
  - Stores minimal user info in localStorage under admin-session
  - Redirects to login if session missing or role is not ADMIN

```mermaid
flowchart TD
Start(["Admin Login"]) --> Fetch["Fetch /api/auth (signin)"]
Fetch --> Validate{"Credentials valid<br/>and role=ADMIN?"}
Validate --> |No| Error["Show error and stay on login"]
Validate --> |Yes| Store["Store {id,email,name,role} in localStorage"]
Store --> Navigate["Redirect to Admin Dashboard"]
Error --> End(["End"])
Navigate --> End
```

**Diagram sources**
- [app/admin/login/page.tsx](file://app/admin/login/page.tsx)
- [app/api/auth/route.ts](file://app/api/auth/route.ts)
- [app/admin/page.tsx](file://app/admin/page.tsx)

**Section sources**
- [app/api/auth/route.ts](file://app/api/auth/route.ts)
- [app/admin/login/page.tsx](file://app/admin/login/page.tsx)
- [app/admin/page.tsx](file://app/admin/page.tsx)
- [prisma/schema.prisma](file://prisma/schema.prisma)

### Password Hashing and Reset
- Hashing:
  - Uses Web Crypto SHA-256 with a fixed salt appended to the password
  - Note: For production, replace with a robust library designed for password hashing
- Reset Workflow:
  - Forgot endpoint generates a random token, stores expiry, and sends email
  - Reset endpoint validates token, expiry, hashes new password, updates user, and cleans tokens

```mermaid
sequenceDiagram
participant Client as "Client"
participant Forgot as "Forgot API (/api/auth/forgot)"
participant DB as "Prisma DB"
participant SMTP as "SMTP Transport"
Client->>Forgot : POST {email}
Forgot->>DB : findUnique(user)
DB-->>Forgot : user or null
Forgot->>DB : deleteMany(old tokens)
Forgot->>DB : create(reset token with expiry)
Forgot->>SMTP : send reset email with token
SMTP-->>Client : queued
```

**Diagram sources**
- [app/api/auth/forgot/route.ts](file://app/api/auth/forgot/route.ts)
- [prisma/schema.prisma](file://prisma/schema.prisma)

**Section sources**
- [app/api/auth/route.ts](file://app/api/auth/route.ts)
- [app/api/auth/forgot/route.ts](file://app/api/auth/forgot/route.ts)
- [app/api/auth/reset/route.ts](file://app/api/auth/reset/route.ts)
- [prisma/schema.prisma](file://prisma/schema.prisma)

### Admin Operations and RBAC
- Admin Dashboard:
  - Lists users with counts and stats
  - Supports role toggling and deletion
- Admin APIs:
  - GET /api/admin/users supports search and pagination-friendly ordering
  - DELETE and PATCH endpoints update roles and names
  - Stats endpoint aggregates counts and recent users

```mermaid
sequenceDiagram
participant AdminUI as "Admin Dashboard"
participant UsersAPI as "Admin Users API (/api/admin/users)"
participant StatsAPI as "Admin Stats API (/api/admin/stats)"
participant DB as "Prisma DB"
AdminUI->>StatsAPI : GET /api/admin/stats
StatsAPI->>DB : count and recent users
DB-->>StatsAPI : stats data
StatsAPI-->>AdminUI : stats
AdminUI->>UsersAPI : GET /api/admin/users?search=...
UsersAPI->>DB : findMany with filters and counts
DB-->>UsersAPI : users with stats
UsersAPI-->>AdminUI : users list
AdminUI->>UsersAPI : DELETE/PATCH {userId,data}
UsersAPI->>DB : delete/update
DB-->>UsersAPI : ok
UsersAPI-->>AdminUI : result
```

**Diagram sources**
- [app/admin/page.tsx](file://app/admin/page.tsx)
- [app/api/admin/users/route.ts](file://app/api/admin/users/route.ts)
- [app/api/admin/stats/route.ts](file://app/api/admin/stats/route.ts)
- [lib/db.ts](file://lib/db.ts)

**Section sources**
- [app/admin/page.tsx](file://app/admin/page.tsx)
- [app/api/admin/users/route.ts](file://app/api/admin/users/route.ts)
- [app/api/admin/stats/route.ts](file://app/api/admin/stats/route.ts)
- [lib/db.ts](file://lib/db.ts)

### Secure File Uploads and Cloudinary Integration
- Upload Endpoint:
  - Accepts base64 image and optional folder
  - Delegates upload to Cloudinary with configured transformations
- Cloudinary Configuration:
  - Reads credentials from environment variables
  - Applies transformations for avatar sizing and auto quality/format

```mermaid
sequenceDiagram
participant Client as "Client"
participant UploadAPI as "Upload API (/api/upload)"
participant Cloudinary as "Cloudinary Uploader"
Client->>UploadAPI : POST {image, folder?}
UploadAPI->>Cloudinary : upload(base64, folder, transforms)
Cloudinary-->>UploadAPI : secure_url
UploadAPI-->>Client : {url}
```

**Diagram sources**
- [app/api/upload/route.ts](file://app/api/upload/route.ts)
- [lib/cloudinary.ts](file://lib/cloudinary.ts)

**Section sources**
- [app/api/upload/route.ts](file://app/api/upload/route.ts)
- [lib/cloudinary.ts](file://lib/cloudinary.ts)

### Database Schema and Data Protection
- Strong Typing and Constraints:
  - Enum Role ensures only USER or ADMIN values
  - Unique constraints on email
  - Cascading deletes for related records
- Data Exposure:
  - API responses exclude sensitive fields; ensure no unintended leakage

```mermaid
erDiagram
USER {
string id PK
string email UK
string passwordHash
string name
string avatarUrl
enum role
datetime createdAt
}
PLAYLIST {
string id PK
string userId FK
string name
string description
string coverUrl
datetime createdAt
}
LIKEDSONG {
string id PK
string userId FK
string songId
datetime createdAt
}
QUEUEITEM {
string id PK
string userId FK
string songId
json songData
int position
datetime createdAt
}
FOLLOWEDARTIST {
string id PK
string userId FK
string artistId
string artistName
string artistImage
datetime createdAt
}
PASSWORDRESET {
string id PK
string userId FK
string token UK
datetime expiresAt
datetime createdAt
}
USER ||--o{ PLAYLIST : "creates"
USER ||--o{ LIKEDSONG : "likes"
USER ||--o{ QUEUEITEM : "queues"
USER ||--o{ FOLLOWEDARTIST : "follows"
USER ||--o{ PASSWORDRESET : "requests resets"
```

**Diagram sources**
- [prisma/schema.prisma](file://prisma/schema.prisma)

**Section sources**
- [prisma/schema.prisma](file://prisma/schema.prisma)

### Input Validation, Sanitization, and Vulnerability Mitigation
- Current State:
  - Minimal validation occurs at API boundaries (presence checks)
  - No explicit sanitization or escaping for HTML contexts
  - No CSRF protection middleware
  - No rate limiting or abuse controls
- Recommended Improvements:
  - Enforce strict input validation and sanitization (e.g., Zod)
  - Implement Content Security Policy (CSP), SameSite cookies, CSRF tokens
  - Add rate limiting per IP and per user
  - Escape HTML in frontend rendering contexts
  - Use HTTPS/TLS termination and secure cookie flags

[No sources needed since this section provides general guidance]

### Secure API Design Patterns
- Authentication:
  - Prefer short-lived tokens with refresh mechanisms
  - Avoid storing secrets in client-side storage for admin sessions
- Authorization:
  - Enforce RBAC on all privileged endpoints
  - Use least privilege for API keys and service accounts
- Error Handling:
  - Avoid leaking internal errors; return generic messages
  - Log structured errors with correlation IDs

[No sources needed since this section provides general guidance]

### Rate Limiting and Abuse Prevention
- Immediate Actions:
  - Integrate express-rate-limit or equivalent middleware
  - Apply limits to auth endpoints and admin endpoints
- Monitoring:
  - Track request volumes, error rates, and blocked requests
  - Alert on unusual spikes

[No sources needed since this section provides general guidance]

### Data Protection, Encryption, and Privacy
- At Rest:
  - Ensure database encryption at rest via hosting provider
- In Transit:
  - Enforce TLS 1.3+ for all endpoints
- Privacy:
  - Comply with applicable regulations (e.g., GDPR)
  - Minimize data retention; implement deletion on request

[No sources needed since this section provides general guidance]

### Email Service Security
- SMTP Configuration:
  - Use environment variables for credentials
  - Prefer OAuth or dedicated mail APIs over basic SMTP
- Token Delivery:
  - Ensure reset links are time-bound and single-use semantics

**Section sources**
- [app/api/auth/forgot/route.ts](file://app/api/auth/forgot/route.ts)
- [package.json](file://package.json)

### Security Monitoring, Logging, and Incident Response
- Logging:
  - Centralize logs and apply structured logging
  - Mask sensitive fields (tokens, emails)
- Monitoring:
  - Monitor anomalies (failed logins, repeated errors)
- Incident Response:
  - Define escalation paths and remediation steps
  - Rotate secrets and revoke compromised tokens promptly

[No sources needed since this section provides general guidance]

## Dependency Analysis
External dependencies relevant to security:
- Prisma Client for database access
- Cloudinary SDK for image uploads
- Nodemailer for sending reset emails
- Express Rate Limit (available in lockfile) for rate limiting

```mermaid
graph LR
AuthAPI["Auth API"] --> Prisma["@prisma/client"]
UploadAPI["Upload API"] --> CloudinarySDK["cloudinary"]
ForgotAPI["Forgot API"] --> Nodemailer["nodemailer"]
AdminUsersAPI["Admin Users API"] --> Prisma
AdminStatsAPI["Admin Stats API"] --> Prisma
AdminSeedAPI["Admin Seed API"] --> Prisma
```

**Diagram sources**
- [app/api/auth/route.ts](file://app/api/auth/route.ts)
- [app/api/upload/route.ts](file://app/api/upload/route.ts)
- [app/api/auth/forgot/route.ts](file://app/api/auth/forgot/route.ts)
- [app/api/admin/users/route.ts](file://app/api/admin/users/route.ts)
- [app/api/admin/stats/route.ts](file://app/api/admin/stats/route.ts)
- [app/api/admin/seed/route.ts](file://app/api/admin/seed/route.ts)
- [package.json](file://package.json)

**Section sources**
- [package.json](file://package.json)
- [lib/db.ts](file://lib/db.ts)
- [lib/cloudinary.ts](file://lib/cloudinary.ts)

## Performance Considerations
- Authentication and Admin endpoints are lightweight; ensure database connection pooling and indexing
- Cloudinary uploads add latency; consider CDN caching and pre-signed URLs for downloads
- Avoid excessive re-renders in admin UI; memoize queries and mutations

[No sources needed since this section provides general guidance]

## Troubleshooting Guide
- Authentication Failures:
  - Verify email uniqueness and correct password hashing
  - Check admin role enforcement in dashboard
- Upload Issues:
  - Confirm Cloudinary credentials and base64 format
- Admin Privileges:
  - Ensure seed endpoint created ADMIN user or role was updated
- Reset Link Problems:
  - Validate token expiry and SMTP configuration

**Section sources**
- [app/api/auth/route.ts](file://app/api/auth/route.ts)
- [app/admin/page.tsx](file://app/admin/page.tsx)
- [app/api/admin/seed/route.ts](file://app/api/admin/seed/route.ts)
- [app/api/auth/forgot/route.ts](file://app/api/auth/forgot/route.ts)
- [lib/cloudinary.ts](file://lib/cloudinary.ts)

## Conclusion
SonicStream implements foundational authentication and admin controls with role-based access and secure file uploads. To achieve production-grade security, adopt robust password hashing, implement CSRF protections, add rate limiting, harden input validation, strengthen transport and storage encryption, and establish comprehensive monitoring and incident response procedures.

[No sources needed since this section summarizes without analyzing specific files]

## Appendices

### Security Checklist
- Replace current password hashing with a secure library
- Add CSRF protection and SameSite cookies
- Implement rate limiting for auth and admin endpoints
- Enforce HTTPS/TLS and secure headers
- Sanitize and escape all user-generated content
- Review and restrict Cloudinary transformations
- Configure SMTP securely and rotate credentials
- Establish logging and alerting for security events
- Perform periodic vulnerability assessments

[No sources needed since this section provides general guidance]

### Vulnerability Assessment Guidelines
- Static Analysis: Scan for hardcoded secrets and unsafe patterns
- Dynamic Analysis: Penetration test auth, admin, and upload endpoints
- Dependency Review: Audit packages for known vulnerabilities
- Secrets Management: Ensure secrets are environment-driven and rotated

[No sources needed since this section provides general guidance]

### Secure Development Practices
- Treat security as code quality
- Enforce PR reviews with security checkpoints
- Automate linting and dependency scanning
- Keep dependencies updated and patched
- Document threat models and mitigations

[No sources needed since this section provides general guidance]