# Authentication APIs

<cite>
**Referenced Files in This Document**
- [route.ts](file://app/api/auth/route.ts)
- [route.ts](file://app/api/auth/forgot/route.ts)
- [route.ts](file://app/api/auth/reset/route.ts)
- [db.ts](file://lib/db.ts)
- [cloudinary.ts](file://lib/cloudinary.ts)
- [schema.prisma](file://prisma/schema.prisma)
- [AuthModal.tsx](file://components/AuthModal.tsx)
- [useAuthGuard.ts](file://hooks/useAuthGuard.ts)
- [usePlayerStore.ts](file://store/usePlayerStore.ts)
- [page.tsx](file://app/admin/login/page.tsx)
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
This document provides comprehensive API documentation for SonicStream’s authentication endpoints. It covers:
- Main authentication route for sign-up and sign-in
- Avatar upload during sign-up
- Password reset initiation (forgot password)
- Password reset completion (reset password)
- Request/response schemas, error handling, and security considerations
- Client-side integration examples and common use cases

## Project Structure
The authentication system is implemented as Next.js App Router API routes backed by Prisma ORM and Cloudinary for avatar uploads. The frontend integrates via a modal component and a store for user state.

```mermaid
graph TB
subgraph "Frontend"
AM["AuthModal.tsx"]
UGS["useAuthGuard.ts"]
UPS["usePlayerStore.ts"]
ADM["AdminLoginPage.tsx"]
end
subgraph "Backend"
AUTH["POST /api/auth<br/>route.ts"]
FORGOT["POST /api/auth/forgot<br/>route.ts"]
RESET["POST /api/auth/reset<br/>route.ts"]
PRISMA["Prisma Client<br/>db.ts"]
SCHEMA["Prisma Schema<br/>schema.prisma"]
CLOUD["Cloudinary Upload<br/>cloudinary.ts"]
end
AM --> AUTH
UGS --> AM
ADM --> AUTH
AUTH --> PRISMA
AUTH --> CLOUD
FORGOT --> PRISMA
RESET --> PRISMA
PRISMA --> SCHEMA
```

**Diagram sources**
- [route.ts:15-72](file://app/api/auth/route.ts#L15-L72)
- [route.ts:5-67](file://app/api/auth/forgot/route.ts#L5-L67)
- [route.ts:13-47](file://app/api/auth/reset/route.ts#L13-L47)
- [db.ts:1-10](file://lib/db.ts#L1-L10)
- [cloudinary.ts:1-21](file://lib/cloudinary.ts#L1-L21)
- [schema.prisma:16-32](file://prisma/schema.prisma#L16-L32)

**Section sources**
- [route.ts:15-72](file://app/api/auth/route.ts#L15-L72)
- [route.ts:5-67](file://app/api/auth/forgot/route.ts#L5-L67)
- [route.ts:13-47](file://app/api/auth/reset/route.ts#L13-L47)
- [db.ts:1-10](file://lib/db.ts#L1-L10)
- [cloudinary.ts:1-21](file://lib/cloudinary.ts#L1-L21)
- [schema.prisma:16-32](file://prisma/schema.prisma#L16-L32)

## Core Components
- Authentication Route: Handles sign-up and sign-in with optional avatar upload and password hashing.
- Forgot Password Route: Initiates password reset by generating a token and sending an email.
- Reset Password Route: Verifies token and expiry, then updates the user’s password hash.
- Data Layer: Prisma models for User and PasswordReset; Cloudinary for avatar storage.
- Frontend Integration: Modal-based authentication flow and store-managed user state.

**Section sources**
- [route.ts:15-72](file://app/api/auth/route.ts#L15-L72)
- [route.ts:5-67](file://app/api/auth/forgot/route.ts#L5-L67)
- [route.ts:13-47](file://app/api/auth/reset/route.ts#L13-L47)
- [schema.prisma:16-32](file://prisma/schema.prisma#L16-L32)
- [cloudinary.ts:1-21](file://lib/cloudinary.ts#L1-L21)

## Architecture Overview
The authentication flow spans frontend and backend components. The frontend sends requests to API routes, which interact with the database and external services (Cloudinary and SMTP).

```mermaid
sequenceDiagram
participant FE as "Frontend"
participant AUTH as "/api/auth"
participant FORGOT as "/api/auth/forgot"
participant RESET as "/api/auth/reset"
participant DB as "Prisma/DB"
participant CDN as "Cloudinary"
Note over FE : Sign-up or Sign-in
FE->>AUTH : POST {action, email, password, name?, avatar?}
AUTH->>DB : Find user by email
alt Existing user on sign-up
AUTH-->>FE : 409 Email already registered
else New user
AUTH->>CDN : Upload avatar (optional)
CDN-->>AUTH : Avatar URL
AUTH->>DB : Create user with hashed password
AUTH-->>FE : {user}
end
Note over FE : Forgot Password
FE->>FORGOT : POST {email}
FORGOT->>DB : Find user
FORGOT->>DB : Delete old reset tokens
FORGOT->>DB : Create new token with expiry
FORGOT-->>FE : Message (success or no-op)
Note over FE : Reset Password
FE->>RESET : POST {token, password}
RESET->>DB : Find token and verify expiry
RESET->>DB : Update user password hash
RESET->>DB : Delete all reset tokens for user
RESET-->>FE : Success message
```

**Diagram sources**
- [route.ts:15-72](file://app/api/auth/route.ts#L15-L72)
- [route.ts:5-67](file://app/api/auth/forgot/route.ts#L5-L67)
- [route.ts:13-47](file://app/api/auth/reset/route.ts#L13-L47)
- [cloudinary.ts:9-18](file://lib/cloudinary.ts#L9-L18)
- [schema.prisma:16-32](file://prisma/schema.prisma#L16-L32)

## Detailed Component Analysis

### Main Authentication Endpoint: POST /api/auth
- Purpose: Perform sign-up or sign-in.
- Supported actions: signup, signin.
- Request Body:
  - action: "signup" | "signin"
  - email: string (required)
  - password: string (required)
  - name: string (optional; defaults to local part of email if omitted)
  - avatar: base64 image string (optional; uploaded to Cloudinary)
- Response Body (on success):
  - user: { id, email, name, avatarUrl, role }
- Behavior:
  - Sign-up:
    - Reject if email already exists.
    - Optionally upload avatar to Cloudinary and store secure URL.
    - Hash password using SHA-256 with a salt and create user.
  - Sign-in:
    - Find user by email.
    - Compare hashed password; reject if mismatch.
    - Return user profile.
- Errors:
  - 400: Missing fields, invalid action, weak password (in reset flow), invalid/expired token.
  - 401: Invalid credentials.
  - 409: Email already registered.
  - 500: Internal server error.

```mermaid
flowchart TD
Start(["POST /api/auth"]) --> Parse["Parse JSON body"]
Parse --> Validate{"Has email and password?"}
Validate --> |No| E400["400 Bad Request"]
Validate --> |Yes| Action{"action == 'signup' or 'signin'?"}
Action --> |signup| CheckDup["Find user by email"]
CheckDup --> Exists{"Exists?"}
Exists --> |Yes| E409["409 Conflict"]
Exists --> |No| Avail["Optional avatar upload"]
Avail --> Hash["Hash password with salt"]
Hash --> Create["Create user record"]
Create --> OK["200 OK {user}"]
Action --> |signin| Find["Find user by email"]
Find --> Found{"Found?"}
Found --> |No| E401a["401 Unauthorized"]
Found --> |Yes| Hash2["Hash provided password"]
Hash2 --> Match{"Hash matches stored?"}
Match --> |No| E401b["401 Unauthorized"]
Match --> |Yes| OK2["200 OK {user}"]
```

**Diagram sources**
- [route.ts:15-72](file://app/api/auth/route.ts#L15-L72)
- [cloudinary.ts:9-18](file://lib/cloudinary.ts#L9-L18)

**Section sources**
- [route.ts:15-72](file://app/api/auth/route.ts#L15-L72)
- [cloudinary.ts:9-18](file://lib/cloudinary.ts#L9-L18)

### Forgot Password Endpoint: POST /api/auth/forgot
- Purpose: Initiate password reset by generating a token and emailing a reset link.
- Request Body:
  - email: string (required)
- Response Body (on success):
  - message: string (safe message to avoid leaking email existence)
- Behavior:
  - Find user by email.
  - Delete previous reset tokens for the user.
  - Generate a random hex token with 1-hour expiry.
  - Persist token with expiry.
  - Attempt to send an email with a reset URL containing the token.
  - Return success regardless of email transport outcome.
- Errors:
  - 400: Missing email.
  - 500: Internal server error.

```mermaid
sequenceDiagram
participant FE as "Frontend"
participant FORGOT as "/api/auth/forgot"
participant DB as "Prisma/DB"
participant SMTP as "SMTP Transport"
FE->>FORGOT : POST {email}
FORGOT->>DB : Find user
FORGOT->>DB : Delete old tokens
FORGOT->>DB : Create new token (expires in 1h)
FORGOT->>SMTP : Send reset email
SMTP-->>FORGOT : Acknowledge
FORGOT-->>FE : {message}
```

**Diagram sources**
- [route.ts:5-67](file://app/api/auth/forgot/route.ts#L5-L67)

**Section sources**
- [route.ts:5-67](file://app/api/auth/forgot/route.ts#L5-L67)

### Reset Password Endpoint: POST /api/auth/reset
- Purpose: Complete password reset using a valid token.
- Request Body:
  - token: string (required)
  - password: string (required; minimum length enforced)
- Response Body (on success):
  - message: string
- Behavior:
  - Retrieve token and verify expiry.
  - Update user’s password hash.
  - Delete all reset tokens for the user.
  - Return success.
- Errors:
  - 400: Missing token/password, invalid/expired token, weak password.
  - 500: Internal server error.

```mermaid
flowchart TD
Start(["POST /api/auth/reset"]) --> Parse["Parse JSON body"]
Parse --> Validate{"Has token and password?"}
Validate --> |No| E400["400 Bad Request"]
Validate --> Len{"Password >= 6 chars?"}
Len --> |No| E400b["400 Bad Request"]
Len --> Fetch["Fetch token from DB"]
Fetch --> Exists{"Token exists and not expired?"}
Exists --> |No| E400c["400 Bad Request"]
Exists --> |Yes| Hash["Hash new password"]
Hash --> Update["Update user password hash"]
Update --> Clean["Delete all reset tokens for user"]
Clean --> OK["200 OK {message}"]
```

**Diagram sources**
- [route.ts:13-47](file://app/api/auth/reset/route.ts#L13-L47)

**Section sources**
- [route.ts:13-47](file://app/api/auth/reset/route.ts#L13-L47)

### Data Models and Relationships
- User model includes email, password hash, name, avatar URL, role, and timestamps. It has a relation to PasswordReset entries.
- PasswordReset model stores a unique token, expiry, and links to a user.

```mermaid
erDiagram
USER {
string id PK
string email UK
string passwordHash
string name
string avatarUrl
enum role
timestamp created_at
}
PASSWORD_RESET {
string id PK
string userId FK
string token UK
timestamp expires_at
timestamp created_at
}
USER ||--o{ PASSWORD_RESET : "has resets"
```

**Diagram sources**
- [schema.prisma:16-32](file://prisma/schema.prisma#L16-L32)
- [schema.prisma:100-110](file://prisma/schema.prisma#L100-L110)

**Section sources**
- [schema.prisma:16-32](file://prisma/schema.prisma#L16-L32)
- [schema.prisma:100-110](file://prisma/schema.prisma#L100-L110)

### Frontend Integration Examples
- Modal-based authentication:
  - Switch between sign-in and sign-up.
  - Optional name and avatar fields during sign-up.
  - On success, update user state in the store and close the modal.
- Admin login:
  - Uses the same authentication route but checks for ADMIN role and persists a session locally.
- Auth guard hook:
  - Opens the auth modal if a protected action is attempted while unauthenticated.

```mermaid
sequenceDiagram
participant UI as "AuthModal"
participant Store as "usePlayerStore"
participant API as "/api/auth"
UI->>API : POST {action, email, password, name?}
API-->>UI : {user} or error
UI->>Store : setUser(user)
UI-->>UI : Close modal
```

**Diagram sources**
- [AuthModal.tsx:26-50](file://components/AuthModal.tsx#L26-L50)
- [usePlayerStore.ts:114-114](file://store/usePlayerStore.ts#L114-L114)
- [useAuthGuard.ts:16-25](file://hooks/useAuthGuard.ts#L16-L25)

**Section sources**
- [AuthModal.tsx:26-50](file://components/AuthModal.tsx#L26-L50)
- [useAuthGuard.ts:16-25](file://hooks/useAuthGuard.ts#L16-L25)
- [usePlayerStore.ts:114-114](file://store/usePlayerStore.ts#L114-L114)
- [page.tsx:15-38](file://app/admin/login/page.tsx#L15-L38)

## Dependency Analysis
- Backend routes depend on:
  - Prisma client for database operations.
  - Cloudinary SDK for avatar uploads.
  - Crypto Web API for password hashing.
  - Nodemailer for sending reset emails.
- Frontend depends on:
  - Zustand store for user state persistence.
  - Auth modal and auth guard hook for UX and protection.

```mermaid
graph LR
AUTH["/api/auth"] --> PRISMA["Prisma Client"]
AUTH --> CLOUD["Cloudinary"]
FORGOT["/api/auth/forgot"] --> PRISMA
RESET["/api/auth/reset"] --> PRISMA
MODAL["AuthModal.tsx"] --> AUTH
MODAL --> STORE["usePlayerStore.ts"]
GUARD["useAuthGuard.ts"] --> MODAL
ADMIN["AdminLoginPage.tsx"] --> AUTH
```

**Diagram sources**
- [route.ts:1-3](file://app/api/auth/route.ts#L1-L3)
- [route.ts:1-3](file://app/api/auth/forgot/route.ts#L1-L3)
- [route.ts:1-2](file://app/api/auth/reset/route.ts#L1-L2)
- [cloudinary.ts:1-7](file://lib/cloudinary.ts#L1-L7)
- [db.ts:1-10](file://lib/db.ts#L1-L10)
- [AuthModal.tsx:1-12](file://components/AuthModal.tsx#L1-L12)
- [usePlayerStore.ts:1-10](file://store/usePlayerStore.ts#L1-L10)
- [useAuthGuard.ts:1-10](file://hooks/useAuthGuard.ts#L1-L10)
- [page.tsx:1-8](file://app/admin/login/page.tsx#L1-L8)

**Section sources**
- [route.ts:1-3](file://app/api/auth/route.ts#L1-L3)
- [route.ts:1-3](file://app/api/auth/forgot/route.ts#L1-L3)
- [route.ts:1-2](file://app/api/auth/reset/route.ts#L1-L2)
- [cloudinary.ts:1-7](file://lib/cloudinary.ts#L1-L7)
- [db.ts:1-10](file://lib/db.ts#L1-L10)
- [AuthModal.tsx:1-12](file://components/AuthModal.tsx#L1-L12)
- [usePlayerStore.ts:1-10](file://store/usePlayerStore.ts#L1-L10)
- [useAuthGuard.ts:1-10](file://hooks/useAuthGuard.ts#L1-L10)
- [page.tsx:1-8](file://app/admin/login/page.tsx#L1-L8)

## Performance Considerations
- Password hashing uses the browser’s Web Crypto API; ensure minimal overhead by avoiding unnecessary re-hashing.
- Avatar uploads are asynchronous; consider adding progress indicators and size limits on the client.
- Token cleanup is performed before creating new reset tokens to prevent accumulation.
- Email transport failures do not block the response; consider retry mechanisms or logging for monitoring.

[No sources needed since this section provides general guidance]

## Troubleshooting Guide
Common issues and resolutions:
- Invalid credentials:
  - Occurs when email does not exist or password hash mismatch during sign-in.
- Email already registered:
  - Returned on sign-up when the email is taken.
- Invalid or expired reset link:
  - Returned when token is missing, incorrect, or past expiry.
- Weak password:
  - Enforced during reset; ensure clients meet minimum length requirements.
- Internal server errors:
  - Logged in backend; check server logs for stack traces.

**Section sources**
- [route.ts:52-60](file://app/api/auth/route.ts#L52-L60)
- [route.ts:26-29](file://app/api/auth/route.ts#L26-L29)
- [route.ts:24-31](file://app/api/auth/reset/route.ts#L24-L31)
- [route.ts:20-22](file://app/api/auth/reset/route.ts#L20-L22)
- [route.ts:12-15](file://app/api/auth/forgot/route.ts#L12-L15)

## Conclusion
SonicStream’s authentication system provides a straightforward sign-up/sign-in flow with optional avatar uploads and a secure password reset mechanism. The backend routes are concise, rely on Prisma for data operations, and integrate with Cloudinary and SMTP for media and notifications. The frontend components offer a seamless user experience with modal-driven auth and guarded actions.

[No sources needed since this section summarizes without analyzing specific files]

## Appendices

### API Reference

- POST /api/auth
  - Request: { action: "signup" | "signin", email: string, password: string, name?: string, avatar?: string }
  - Responses:
    - 200: { user: { id, email, name, avatarUrl, role } }
    - 400: Missing fields or invalid action
    - 401: Invalid credentials
    - 409: Email already registered
    - 500: Internal server error

- POST /api/auth/forgot
  - Request: { email: string }
  - Responses:
    - 200: { message: string }
    - 400: Missing email
    - 500: Internal server error

- POST /api/auth/reset
  - Request: { token: string, password: string }
  - Responses:
    - 200: { message: string }
    - 400: Missing token/password, invalid/expired token, weak password
    - 500: Internal server error

**Section sources**
- [route.ts:15-72](file://app/api/auth/route.ts#L15-L72)
- [route.ts:5-67](file://app/api/auth/forgot/route.ts#L5-L67)
- [route.ts:13-47](file://app/api/auth/reset/route.ts#L13-L47)

### Security Considerations
- Password hashing uses a salted SHA-256; for production, consider bcrypt or Argon2.
- Token expiry is enforced; ensure clients handle expired links gracefully.
- Email-based reset avoids revealing whether an email is registered.
- Avatar uploads are transformed and stored securely via Cloudinary.

**Section sources**
- [route.ts:5-13](file://app/api/auth/route.ts#L5-L13)
- [route.ts:4-11](file://app/api/auth/reset/route.ts#L4-L11)
- [route.ts:12-15](file://app/api/auth/forgot/route.ts#L12-L15)
- [cloudinary.ts:9-18](file://lib/cloudinary.ts#L9-L18)

### Client Implementation Notes
- Use the modal component to trigger sign-up/sign-in and forgot password flows.
- After successful authentication, update the user state in the store to enable protected actions.
- Admin login requires ADMIN role and persists a session locally.

**Section sources**
- [AuthModal.tsx:26-50](file://components/AuthModal.tsx#L26-L50)
- [useAuthGuard.ts:16-25](file://hooks/useAuthGuard.ts#L16-L25)
- [usePlayerStore.ts:114-114](file://store/usePlayerStore.ts#L114-L114)
- [page.tsx:26-29](file://app/admin/login/page.tsx#L26-L29)