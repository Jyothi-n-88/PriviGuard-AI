# PRIVIGUARD AI — PHASE 5 INSPECTION REPORT

## A. Current Architecture Summary
- **Backend:** Node.js, Express, Mongoose.
- **Authentication:** JWT-based. `authenticate` middleware decodes JWT and attaches `userId`, `organizationId`, and `role` to `req.user`.
- **Database:** MongoDB Atlas via Mongoose. `User` and `Organization` collections are established.
- **Frontend:** React (Vite), React Router, Tailwind CSS. State is managed locally or via basic context. Pages like `Assessments` currently show empty placeholders.
- **RBAC:** A `requireRole` middleware on the backend and `<RoleGuard>` on the frontend manage authorization. Existing roles: 'admin', 'dpo', 'privacy_manager', 'compliance_officer', 'analyst', 'viewer'.

## B. Recommended Phase 5 Architecture
The Privacy Assessment Module will use a standard RESTful architecture. 
- A new Mongoose model (`Assessment`) will store PIA data.
- An `assessmentController` will handle CRUD logic.
- An `assessment` route will expose REST endpoints.
- The frontend will have an `Assessments` list view, a `CreateAssessment` form, and an `AssessmentDetails` view.
- Multi-tenancy will be strictly enforced by querying the `organizationId` from `req.user`.

## C. Proposed MongoDB Schema
**Model:** `Assessment`
**Collection:** `assessments`
**Required Fields:**
- `organizationId`: ObjectId, ref 'Organization', indexed.
- `title`: String.
- `processingActivity`: String.
- `purpose`: String.
- `status`: String, enum: ['draft', 'in_progress', 'completed', 'archived'], default: 'draft'.
**Optional/Additional Fields:**
- `description`: String.
- `personalDataCategories`: [String].
- `dataSubjects`: [String].
- `dataSource`: String.
- `storageLocation`: String.
- `retentionPeriod`: String.
- `thirdPartyProcessors`: [String].
- `dataSharing`: String.
- `securityMeasures`: String.
**Risk Fields (Rule-based simple engine for now):**
- `riskLikelihood`: String, enum: ['low', 'medium', 'high'].
- `riskImpact`: String, enum: ['low', 'medium', 'high'].
- `calculatedRiskScore`: Number.
- `calculatedRiskLevel`: String, enum: ['low', 'medium', 'high', 'critical'].
- `identifiedRisks`: [String].
- `mitigationMeasures`: String.
**Timestamps:** true.
**Indexes:** `organizationId`, `status`.

## D. Proposed API Endpoints
All endpoints will be prefixed with `/api/assessments` and require `authenticate` middleware.
1. `POST /api/assessments` - Create a new assessment.
2. `GET /api/assessments` - List all assessments for the organization.
3. `GET /api/assessments/:id` - Get details of a single assessment.
4. `PUT /api/assessments/:id` - Update an existing assessment.
5. `DELETE /api/assessments/:id` - Delete an assessment.

## E. Proposed RBAC Permissions
Based on the existing roles, the following is recommended:
- **Create/Edit/Delete assessments:** `admin`, `dpo`, `privacy_manager`.
- **View assessments & risk information:** `admin`, `dpo`, `privacy_manager`, `compliance_officer`, `analyst`, `viewer`.

## F. Proposed Frontend Routes/Pages
**Routes:**
- `/assessments`: Dashboard/List view.
- `/assessments/new`: Form to create a new assessment.
- `/assessments/:id`: Detailed view of a specific assessment.
- `/assessments/:id/edit`: Form to edit an existing assessment.

**Components:**
- `AssessmentCard` / `AssessmentTable` for listing.
- `AssessmentForm` for creation/editing.
- `RiskBadge` for visualizing risk levels.

## G. Risk-scoring Design
A simple, explainable rule-based mechanism for Phase 5 (pre-Gemini):
- Assign numerical values: Low = 1, Medium = 2, High = 3.
- `calculatedRiskScore` = `Likelihood` × `Impact` (Score ranges from 1 to 9).
- `calculatedRiskLevel`:
  - 1-2: Low
  - 3-4: Medium
  - 6: High
  - 9: Critical
This provides a transparent baseline before introducing AI reasoning in future phases.

## H. Security and Multi-tenant Isolation Strategy
- **Isolation:** Every CRUD operation will explicitly filter by `req.user.organizationId`.
- **No IDOR:** The backend will never trust `organizationId` from request bodies, parameters, or headers. It will always use the decoded JWT payload.
- **Example Query:** `Assessment.find({ organizationId: req.user.organizationId })`.

## I. Exact List of Files
**Created:**
- `server/models/Assessment.ts`
- `server/controllers/assessmentController.ts`
- `server/routes/assessment.ts`
- `src/types/assessment.ts`
- `src/services/assessmentService.ts`
- `src/pages/AssessmentForm.tsx` (or Create/Edit pages)
- `src/pages/AssessmentDetails.tsx`

**Modified:**
- `server.ts` (to mount the new `/api/assessments` route)
- `src/App.tsx` (to add new React Router paths)
- `src/pages/Assessments.tsx` (to replace empty state with actual fetching and list view)

**Deleted:**
- None.

## J. Potential Risks or Compatibility Issues
- No immediate compatibility issues with the existing Phase 1-4 codebase. 
- Since the JWT structure provides the necessary `organizationId` and `role`, we can seamlessly implement multi-tenancy and RBAC without touching the Auth logic.

## K. Recommended Implementation Order
1. **Backend Database:** Create `Assessment` Mongoose schema.
2. **Backend Logic:** Create `assessmentController.ts` and `assessment.ts` routes.
3. **Backend Integration:** Mount routes in `server.ts`.
4. **Frontend Types & Services:** Create `src/types/assessment.ts` and `src/services/assessmentService.ts`.
5. **Frontend Pages:** Build `AssessmentForm.tsx` and `AssessmentDetails.tsx`.
6. **Frontend Integration:** Update `Assessments.tsx` (list view) and `src/App.tsx` (routing).
