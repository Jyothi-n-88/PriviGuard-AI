# Phase_9_ReadOnly_Inspection_Report

## A. Current architecture
- **Backend:** Node.js, Express, MongoDB with Mongoose.
- **Frontend:** React SPA (Vite), Tailwind CSS, React Router.
- **Data Models:** 
  - `Assessment` captures all form data, `riskFindings` (deterministic rule-based risks), and `complianceGaps` / `aiRecommendations` (Gemini AI reports).
  - `User` and `Organization` manage identities, tenant isolation, and RBAC (`admin`, `dpo`, `privacy_manager`, `compliance_officer`, `analyst`, `viewer`).
  - `AuditLog` captures critical state changes like `risk_recalculated` and `dpo_approved`.
  - `AssessmentVersion` captures snapshots of factual data.
- **Integrations:** Risk scoring logic and Gemini AI are fully isolated and functional.

## B. Existing functionality that can be reused
- **Tenant Isolation:** Existing `authenticate` middleware automatically provides `req.user.organizationId` which can be enforced on all remediation queries.
- **RBAC:** `requireRole` middleware can limit remediation creation, updates, and DPO verification cleanly.
- **Audit Logging:** The `createAuditLog` mechanism in `auditService.ts` is robust. It only needs new enum values to support remediation tracking.
- **UI Architecture:** Existing layouts, Lucide icons, and Tailwind styles for cards/badges can be used for Remediation UI.

## C. Gaps identified
- **No Remediation Tracking:** Currently, recommendations from both the risk engine and AI are static text fields in the Assessment document. There is no mechanism to turn them into actionable, trackable tickets.
- **No Task Assignment:** The platform currently lacks a way to assign tasks to specific users within an organization.
- **No Remediation API:** Backend lacks controllers, routes, and models for remediations.

## D. Proposed remediation workflow
1. **Creation:** A user views an `Assessment`. Next to a "Risk Finding" or "AI Compliance Gap", they click "Create Remediation Action".
2. **Form:** A modal opens. The `sourceReference` (the text of the gap) is pre-filled. The user sets a `title`, `description`, `priority`, `dueDate`, and selects an `assignedTo` user from their organization.
3. **Execution:** The assigned user sees the task (status `OPEN`). They begin work (status `IN_PROGRESS`).
4. **Completion:** The assignee finishes the task, adds `completionNotes` or an `evidenceRef`, and marks it `COMPLETED`.
5. **Verification:** A user with the `dpo` or `admin` role reviews the completed task. If sufficient, they mark it `DPO_VERIFIED` (effectively closing the loop, transitioning to `CLOSED`). If insufficient, they can revert it to `IN_PROGRESS`.

## E. Proposed lifecycle/status model
**Stored Statuses:**
- `OPEN`
- `IN_PROGRESS`
- `COMPLETED`
- `DPO_VERIFIED`
- `CLOSED`

**Derived Display States:**
- `OVERDUE` (Calculated in the UI or via aggregation: `dueDate < new Date()` AND status is not `COMPLETED`, `DPO_VERIFIED`, or `CLOSED`).

## F. Proposed RBAC matrix
- **Create Remediation:** `admin`, `dpo`, `privacy_manager`, `compliance_officer`
- **Assign Remediation:** `admin`, `dpo`, `privacy_manager`
- **Update Remediation (progress/complete):** The assigned user, `admin`, `dpo`, `privacy_manager`
- **Verify / Close Remediation:** `admin`, `dpo`
- **View Remediations:** `admin`, `dpo`, `privacy_manager`, `compliance_officer`, `analyst`, `viewer`

## G. Proposed database schema
A dedicated `Remediation` model should be created, to ensure assessments don't hit BSON limits and to allow easy querying by assignee.

```typescript
export interface IRemediation extends Document {
  organizationId: mongoose.Types.ObjectId;
  assessmentId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  sourceType: 'risk_finding' | 'ai_compliance_gap' | 'dpo_recommendation' | 'other';
  sourceReference?: string; // Stored title/category of the gap for evidence
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'DPO_VERIFIED' | 'CLOSED';
  assignedTo?: mongoose.Types.ObjectId; // User ID
  createdBy: mongoose.Types.ObjectId; // User ID
  dueDate?: Date;
  completionDate?: Date;
  completionNotes?: string;
  evidenceRef?: string;
  dpoVerifiedBy?: mongoose.Types.ObjectId; // User ID
  dpoVerifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```
**Indexes:** `{ organizationId: 1, assessmentId: 1 }`, `{ organizationId: 1, assignedTo: 1 }`

## H. Proposed API endpoints
Base prefix: `/api`
- `POST /assessments/:id/remediations` - Create a new remediation.
- `GET /assessments/:id/remediations` - Get all remediations for an assessment.
- `GET /remediations` - Get all remediations for the organization (filterable by `assignedTo`, `status`).
- `GET /remediations/:id` - Get remediation details.
- `PUT /remediations/:id` - Update details (title, description, assignee, priority, dueDate).
- `PATCH /remediations/:id/status` - Change status (e.g., to IN_PROGRESS, COMPLETED).
- `PATCH /remediations/:id/verify` - DPO verification.

## I. Proposed UI changes
- **AssessmentDetails.tsx:** Add a "Remediation Actions" tab or section below Risk Findings. Add action buttons inside the Risk Finding cards to instantly spawn a new Remediation form pre-linked to that finding.
- **Dedicated Dashboard (Optional but recommended):** Create `src/pages/Remediations.tsx` to display an organization-wide Kanban board or Data Table of active remediation tasks.

## J. Audit-log integration
Expand `AuditLog` enum actions to include:
- `remediation_created`
- `remediation_assigned`
- `remediation_updated`
- `remediation_started`
- `remediation_completed`
- `remediation_verified`
- `remediation_closed`
- `remediation_reopened`
Whenever the Remediation Controller processes these events, it will call `createAuditLog`.

## K. Assessment/risk/AI integration
- **Risk Score Integrity:** Completing a remediation **will NOT** automatically lower the `calculatedRiskScore` or modify `riskFindings` in Phase 6. Phase 6 remains an authoritative snapshot.
- **AI Integrity:** Gemini reports remain untouched. 
- **Re-evaluation:** After closing critical remediations, the user can manually click "Recalculate Risk" or generate a new AI report, which generates a new `AssessmentVersion`.

## L. Tenant-isolation strategy
- All queries and mutations must include `organizationId: req.user.organizationId` in the Mongoose filter.
- Cross-tenant assignments must be prevented by verifying that the `assignedTo` user exists within `req.user.organizationId` before saving.

## M. Testing strategy
- **Tenant Security:** Verify users cannot read/update remediations belonging to another organization.
- **Assignment Validation:** Verify a user cannot be assigned a remediation if they belong to a different org.
- **Lifecycle Logic:** Test transitions (e.g., cannot verify a task that isn't `COMPLETED`).
- **Audit Trail:** Verify that transitions correctly spawn `AuditLog` records without touching `AssessmentVersion`.
- **RBAC Enforcement:** Ensure `analyst` cannot DPO-verify a task.

## N. Exact files to create/modify
**Create:**
- `server/models/Remediation.ts`
- `server/controllers/remediationController.ts`
- `server/routes/remediation.ts`
- `src/types/remediation.ts`
- `src/services/remediationService.ts`

**Modify:**
- `server.ts` (register new route)
- `server/models/AuditLog.ts` (expand action enums)
- `src/pages/AssessmentDetails.tsx` (add UI elements)
- (Optional) `src/App.tsx` & `src/components/layout/Sidebar.tsx` (to add global Remediations page).

## O. Risks and edge cases
- **Assessment Deletion:** Mongoose `findOneAndDelete` on Assessment does not cascade. We should modify `assessmentController.deleteAssessment` to also delete associated remediations.
- **User Deactivation:** If an assignee is deleted or deactivated, the UI must gracefully render "Unassigned" or "Unknown User" instead of crashing.
- **Confusion on Risk Scores:** Users might expect risk scores to go down automatically upon completion. The UI should guide them to manually re-run the risk engine/AI if they want a new score post-remediation.

## P. Recommended implementation order
1. Update `server/models/AuditLog.ts` enum.
2. Create `server/models/Remediation.ts`.
3. Create `server/controllers/remediationController.ts` and `server/routes/remediation.ts`.
4. Register the route in `server.ts`.
5. Create frontend typings and API service methods.
6. Build frontend UI components and integrate into `AssessmentDetails.tsx`.
7. Conduct end-to-end testing of the lifecycle and tenant isolation.
