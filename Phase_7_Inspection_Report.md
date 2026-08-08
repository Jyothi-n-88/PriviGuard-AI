# Phase 7 Read-Only Inspection & Implementation Proposal

## 1. Current Architecture Summary
- **Authentication & RBAC:** Express middleware (`auth.ts`, `authorize.ts`) using JWTs. Frontend guards via `RoleGuard.tsx` and `ProtectedRoute.tsx`. Roles include `admin`, `dpo`, `privacy_manager`, `compliance_officer`, `analyst`, and `viewer`.
- **Multi-tenant Isolation:** Strict filtering by `req.user.organizationId` on all API endpoints ensuring cross-tenant boundaries.
- **Privacy Assessment:** Create, read, update, delete functionality in `assessmentController.ts`, mapped to `AssessmentForm.tsx` and `Assessments.tsx`.
- **Phase 6 Risk Engine:** Deterministic numerical risk scoring (0-100) based on derived likelihood, impact, and other factors (`riskEngine.ts`). This is the authoritative scoring system.
- **Phase 6.5 AI Analysis:** An initial Gemini integration in `geminiService.ts` that dynamically derives `riskLikelihood`, `riskImpact`, `insights`, and `recommendations` upon assessment creation/update. It safely falls back to a keyword-based deterministic derivation if Gemini fails.
- **DPO Review:** DPO workflow in `AssessmentDetails.tsx` with statuses (`pending`, `approved`, `rejected`, `reassessed`) and comments.

## 2. Existing Functionality That Phase 7 Can Reuse
- The `geminiService.ts` service structure (handles API key correctly, uses `@google/genai` securely).
- The AI fallback logic and error handling pattern.
- The `AssessmentDetails.tsx` layout for adding new AI-generated widgets/panels.
- The authoritative Phase 6 numerical risk engine.

## 3. Gaps That Phase 7 Should Solve
The original requirements for Phase 7 (Gemini AI Integration) specify using Gemini to:
1. Explain risk levels.
2. Detect compliance gaps (e.g., GDPR, CCPA).
3. Recommend remediation steps (partially addressed in 6.5, but can be expanded into detailed action plans).
4. Generate executive summaries.

Phase 6.5 only gathered short bullet-point insights and recommendations to populate the risk engine inputs. Phase 7 needs to provide deep, comprehensive reporting and gap analysis without altering the Phase 6 score.

## 4. Proposed Phase 7 Feature Set
- **AI Executive Summary Generation:** Generate a concise, professional executive summary suitable for management.
- **AI Compliance Gap Detection:** Evaluate the assessment facts against standard privacy principles (e.g., purpose limitation, data minimization) to highlight specific compliance gaps.
- **AI Risk Explanation:** Generate a human-readable narrative explaining *why* the authoritative Phase 6 risk score is what it is, combining facts and rule-engine findings into a cohesive story.
- **On-Demand Generation:** Implement this as an on-demand "Generate AI Report" action in the UI, rather than blocking the standard save/update flow, ensuring the core assessment CRUD operations remain fast and resilient.

## 5. Database Changes
Update `server/models/Assessment.ts` to include:
- `executiveSummary` (String)
- `complianceGaps` (Array of Strings)
- `riskExplanation` (String)

## 6. API Changes
- **New Endpoint:** `POST /api/assessments/:id/generate-report`
  - Fetches the assessment and its authoritative Phase 6 findings.
  - Sends them to Gemini to generate the summary, gaps, and explanation.
  - Saves the results to the assessment document.

## 7. Frontend Changes
- **`AssessmentDetails.tsx`:** 
  - Add a "Generate AI Privacy Report" button (only visible if the report hasn't been generated, or as a refresh option).
  - Add new UI cards to display the Executive Summary, Compliance Gaps, and Risk Explanation.
- **`src/types/assessment.ts`:** Update interfaces to match the new database fields.
- **`src/services/assessmentService.ts`:** Add the API call for generating the report.

## 8. Security/RBAC Considerations
- The new endpoint must enforce `req.user.organizationId` tenant isolation.
- Only writer roles (`admin`, `dpo`, `privacy_manager`) should be allowed to trigger the report generation.
- Read-only roles can view the generated report but cannot trigger its generation.
- The Gemini API key remains strictly server-side.
- The prompt will only send necessary factual data and existing findings to Gemini, avoiding raw sensitive user PII.

## 9. Exact Files That Would Be Created/Modified
- `server/models/Assessment.ts` (Modified)
- `server/services/geminiService.ts` (Modified: add `generateComprehensiveReport` function)
- `server/controllers/assessmentController.ts` (Modified: add `generateReport` controller)
- `server/routes/assessment.ts` (Modified: add `POST /:id/generate-report` route)
- `src/types/assessment.ts` (Modified)
- `src/services/assessmentService.ts` (Modified)
- `src/pages/AssessmentDetails.tsx` (Modified)

## 10. Testing Strategy
- Verify the new endpoint works with the correct Gemini API key and safely fails (returning an error message, but not crashing the server) if the key is missing.
- Verify that the authoritative Phase 6 numerical risk score is NOT changed by the generation of this report.
- Verify strict RBAC and tenant isolation on the new endpoint.
- Verify UI gracefully handles the loading state of the AI generation.
