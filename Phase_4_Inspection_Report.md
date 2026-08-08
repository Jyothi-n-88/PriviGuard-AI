# PRIVIGUARD AI — PHASE 4 INSPECTION REPORT

## 1. Files Inspected
- `server/models/User.ts`
- `server/models/Organization.ts`
- `server/controllers/authController.ts`
- `server/routes/auth.ts`
- `server/middleware/auth.ts` (inferred usage via context)
- `src/services/authService.ts`

## 2. Current Schema Findings
**User Model Fields:**
- `organizationId` (ObjectId ref to 'Organization')
- `name`, `email`, `passwordHash`
- `role` ('admin', 'dpo', 'privacy_manager', 'compliance_officer', 'analyst', 'viewer')
- `status` ('active', 'inactive')
- `emailVerified`, plus OTP-related fields (hash, expiry, attempts)
- Timestamps

**Organization Model Fields:**
- `name`, `slug` (auto-generated)
- `industry`, `size`, `country`, `contactEmail`
- `status` ('active', 'inactive')
- Timestamps
*Missing from Phase 4 requirements:* `description` and `ownerId`.

## 3. Current Architecture & Relationships
- **Current Authenticated User:** Identified via JWT. The `authenticate` middleware decodes the JWT and attaches `userId`, `organizationId`, and `role` to `req.user`.
- **Role Representation:** Handled via a simple string enum (`role`) on the User model.
- **Organization Creation:** The registration flow in `authController.ts` currently creates a *new* Organization first, and then creates the initial User assigned to that `organizationId` with the `dpo` role.
- **Owner Identification:** The first user defaults to `dpo`. Currently, no explicit `ownerId` connects the organization back to the creating user.

## 4. Implementation Plan for Phase 4

1. **Database / Schema Updates:**
   - Update `Organization.ts` to include `description` (String) and `ownerId` (ObjectId ref to 'User').
   - Modify the `register` flow in `authController.ts` to assign the newly created user's `_id` to the organization's `ownerId`.

2. **API Endpoints (New `organizationController.ts` & `organization.ts` route):**
   - `GET /api/organizations/me`: Fetch details for the authenticated user's organization using `req.user.organizationId`.
   - `PUT /api/organizations/me`: Update the organization (name, description, etc.), restricted to `dpo`/`admin` roles using existing RBAC.
   - `GET /api/organizations/me/members`: List all users where `organizationId === req.user.organizationId`.

3. **Multi-Tenant Security & RBAC:**
   - The backend will **strictly ignore** any `organizationId` passed in the request body/params for fetching or updating. It will exclusively use `req.user.organizationId` derived from the secure JWT.
   - `requireRole('dpo', 'admin')` will be applied to the `PUT /api/organizations/me` endpoint.

4. **Frontend Implementation:**
   - Create `src/services/organizationService.ts`.
   - Build `src/pages/OrganizationSettings.tsx` (view/edit details) and `src/pages/OrganizationMembers.tsx` (data table of members).
   - Integrate these routes under a secure dashboard layout utilizing the existing `ProtectedRoute` and `AuthContext`.

The current architecture is solid and already multi-tenant by design. We will leverage the existing registration flow rather than duplicating it.
