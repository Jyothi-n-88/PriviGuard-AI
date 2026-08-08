# PRIVIGUARD AI — PHASE 6.5 IMPLEMENTATION PLAN

## 1. Inspection Summary
- **Current Assessment Flow:** `AssessmentForm.tsx` requires users to manually input `riskLikelihood`, `riskImpact`, and `mitigationMeasures`.
- **Existing Backend Logic:** `server/controllers/assessmentController.ts` calls `server/services/riskEngine.ts` (`calculatePrivacyRisk`). The risk engine relies on the user-provided likelihood and impact to calculate the baseline (0-40) risk points, then parses text for sensitive data, sharing, retention, and security to add more points.
- **Gemini Status:** No Gemini API usage exists yet. `GEMINI_API_KEY` is expected in the environment.
- **Security / RBAC:** JWT authentication, `requireRole` middleware for specific functions (e.g. create/edit requires `writerRoles`), and multi-tenant isolation via `req.user.organizationId` are strictly implemented across routes.

## 2. Assessment Form Redesign (Frontend)
- **`AssessmentForm.tsx`**: 
  - Remove form fields: `riskLikelihood`, `riskImpact`, and `mitigationMeasures`.
  - Keep all factual inputs (`processingActivity`, `purpose`, `securityMeasures`, etc.).

## 3. Deriving Likelihood & Impact (Backend Deterministic Fallback)
- **`server/services/riskEngine.ts`**:
  - Add a helper function `deriveBaseRiskIndicators(assessment)` before calculating the final score. 
  - The function will scan the assessment fields using a similar deterministic keyword approach to reasonably derive a baseline `riskLikelihood` (e.g., 'high' if external sharing & missing security; 'low' otherwise) and `riskImpact` (e.g., 'high' if sensitive data is involved).
  - Inject these derived indicators into the assessment before feeding it to the existing `calculatePrivacyRisk` engine.

## 4. Gemini AI Integration (Backend)
- **`server/services/geminiService.ts`**:
  - Create `analyzeAssessment(assessmentFacts)` that communicates with the Gemini API (via `@google/genai` SDK or HTTP fetch) using `process.env.GEMINI_API_KEY`.
  - The prompt will ask Gemini to output JSON containing: `insights` (contextual privacy observations), `recommendations` (mitigation suggestions), `derivedLikelihood`, `derivedImpact`.
  - Only send minimized, generalized fields (strip explicit IDs or overly specific data).
  - **Graceful Fallback:** Wrap the call in a `try/catch`. If Gemini fails or the API key is missing, seamlessly fall back to the deterministic derivation (Step 3).

## 5. Assessment Controller Updates
- **`server/controllers/assessmentController.ts`**:
  - Update `createAssessment`, `updateAssessment`, and `recalculateRisk`.
  - New Flow:
    1. Validate input & strip client-provided risk parameters.
    2. Attempt Gemini AI analysis.
    3. If AI succeeds: Use AI's `derivedLikelihood` and `derivedImpact` + AI `insights` and `recommendations`.
    4. If AI fails: Use deterministic `deriveBaseRiskIndicators` for likelihood/impact.
    5. Pass the chosen likelihood/impact to `calculatePrivacyRisk` (Phase 6 authoritative engine).
    6. Save everything to DB.

## 6. Database Schema Updates
- **`server/models/Assessment.ts`**:
  - Add new fields:
    - `aiInsights: [String]`
    - `aiRecommendations: [String]`
    - `dpoReviewStatus: { type: String, enum: ['pending', 'approved', 'rejected', 'reassessed'], default: 'pending' }`
    - `dpoReviewComment: String`
  - Make `riskLikelihood` and `riskImpact` internally managed (no longer required from the user directly).

## 7. DPO Review & Assessment Details (Frontend)
- **`src/pages/AssessmentDetails.tsx`**:
  - Split the view into two clear sections: **PRIVIGUARD RISK ANALYSIS** (System) and **DPO REVIEW**.
  - Show AI Insights and AI Recommendations if they exist. Label them as AI-generated. If not present, indicate that a rule-based analysis was used.
  - Implement a DPO review section where a privileged user can review the results, update `dpoReviewStatus`, and add a `dpoReviewComment`.
- **`src/types/assessment.ts` & `src/services/assessmentService.ts`**:
  - Add the new types.
  - Add endpoint/service method to update `dpoReviewStatus`.
