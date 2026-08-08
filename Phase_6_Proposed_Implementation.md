# PRIVIGUARD AI — PHASE 6 PROPOSED IMPLEMENTATION

## 1. Objective
Upgrade the existing simple `Likelihood × Impact` risk score into a deterministic, advanced rule-based Privacy Risk Engine without using AI (Gemini). The engine will calculate a 0-100 score, map to severity levels, and generate explainable findings with recommended mitigations based on the captured assessment data.

## 2. Files Inspected
- `server/models/Assessment.ts`
- `server/controllers/assessmentController.ts`
- `server/routes/assessment.ts`
- `server/controllers/dashboardController.ts`
- `src/pages/AssessmentForm.tsx`
- `src/pages/AssessmentDetails.tsx`
- `src/types/assessment.ts`

## 3. Risk Engine Rules & Scoring Formula (0-100)
The risk score will be a sum of several factors, capped at 100:

1. **Base Risk (0-40 points):**
   - Derived from Likelihood and Impact. 
   - Calculation: `(Likelihood(1-3) * Impact(1-3)) / 9 * 40`.

2. **Data Sensitivity (0-20 points):**
   - Keyword analysis on `processingActivity`, `purpose`, and `description`.
   - High-risk keywords: "health", "medical", "financial", "credit card", "ssn", "biometric", "children", "minors", "password".
   - Generates finding: "Sensitive Data Processing".

3. **Data Sharing & Transfers (0-15 points):**
   - Keyword analysis on `dataSharing`.
   - High-risk keywords: "external", "third party", "vendor", "public", "cross-border", "international".
   - Generates finding: "External Data Sharing / Transfers".

4. **Retention Risk (0-10 points):**
   - Keyword analysis on `retentionPeriod`.
   - High-risk keywords: "indefinite", "forever", "permanent", "unknown", "no limit".
   - Generates finding: "Indefinite Data Retention".

5. **Security Posture Risk (0-15 points):**
   - Keyword analysis on `securityMeasures`.
   - High-risk keywords: "none", "n/a", "missing", "weak".
   - Absence of positive keywords ("encryption", "access control", "mfa") adds risk.
   - Generates finding: "Weak Security Controls".

**Thresholds:**
- 0–24: Low
- 25–49: Medium
- 50–74: High
- 75–100: Critical

## 4. Proposed File Changes

### A. Database Schema (`server/models/Assessment.ts`)
Add new fields:
- `riskFactors: [{ type: String }]`
- `riskFindings: [{ category: String, severity: String, title: String, reason: String, recommendation: String }]`
- `riskEngineVersion: { type: String, default: 'rule-v1' }`
- `riskCalculatedAt: { type: Date }`

### B. Backend Services & Logic
- **Create** `server/services/riskEngine.ts`: Contains `calculatePrivacyRisk(assessment)` mapping the text inputs to scores, factors, and findings using RegEx/keywords.
- **Modify** `server/controllers/assessmentController.ts`: 
  - Call `calculatePrivacyRisk` when creating or updating assessments.
  - Implement `recalculateRisk` endpoint to allow manual triggering of the engine.
- **Modify** `server/routes/assessment.ts`: Add `POST /:id/recalculate-risk` endpoint (Role: admin, dpo, privacy_manager).
- **Modify** `server/controllers/dashboardController.ts`: Compute `privacyPostureScore` as `100 - average(riskScore)` and `activeRisks` from the new `riskFindings`.

### C. Frontend
- **Modify** `src/types/assessment.ts`: Add `RiskFinding`, `riskFactors`, etc.
- **Modify** `src/services/assessmentService.ts`: Add `recalculateRisk(id)`.
- **Modify** `src/pages/AssessmentDetails.tsx`: 
  - Overhaul the Risk Overview section to display the 0-100 score, factors, and a detailed list of Risk Findings with severities, reasons, and mitigations.
  - Add "Recalculate Risk" button.
- **Modify** `src/pages/Assessments.tsx`: Ensure the risk level and score columns reflect the new 0-100 system and level mapping.

## 5. Security & Isolation
- The `recalculateRisk` endpoint will strictly query by `req.user.organizationId` and the assessment ID to prevent cross-tenant manipulation.
- Frontend risk submissions will continue to be ignored; the server is the single source of truth.
