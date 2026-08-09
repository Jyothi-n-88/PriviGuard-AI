import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import { Assessment } from './server/models/Assessment';
import { generateComprehensivePrivacyReport } from './server/services/geminiService';
import { GoogleGenAI } from '@google/genai';

async function test() {
  await mongoose.connect(process.env.MONGODB_URI || '');
  console.log("Connected to MongoDB.");

  const mockAssessmentLow = new Assessment({
    organizationId: new mongoose.Types.ObjectId(),
    title: "Employee Directory",
    processingActivity: "Store employee contact info",
    purpose: "Internal communication",
    dataSubjects: ["Employees"],
    personalDataCategories: ["Name", "Work Email", "Phone number"],
    dataSource: "Directly from employees",
    storageLocation: "Secure company database in EU",
    retentionPeriod: "One year after employment ends",
    dataSharing: "Internal only",
    securityMeasures: "Encryption at rest and in transit, RBAC, authentication, monitoring",
    calculatedRiskScore: 4,
    calculatedRiskLevel: "low",
    riskFactors: [],
    riskFindings: []
  });

  const apiKey = process.env.GEMINI_API_KEY;
  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `You are a privacy expert acting as a Data Protection Officer (DPO) generating a comprehensive Privacy Impact Assessment report.
Based on the provided facts about a data processing activity and its pre-calculated risk score, generate a detailed report.

The AI must follow these STRICT RULES:
- Use ONLY the supplied assessment facts as confirmed facts.
- NEVER invent organizational policies, controls, processes, certifications, contracts, legal bases, audits, or compliance activities.
- NEVER claim that something exists or does not exist unless supported by the assessment.
- When something is missing from the assessment, explicitly state that it was "not provided" or "not specified".
- Clearly distinguish factual observations from AI-generated interpretations.
- Compliance gaps based on missing information MUST be labelled as potential/unverified gaps or not provided.
- Recommendations may go beyond the supplied facts, but must be clearly presented as recommendations rather than existing organizational practices.
- DO NOT change or reinterpret the authoritative Phase 6 risk score. Treat calculatedRiskScore and calculatedRiskLevel as authoritative.
- The AI report is explanatory and advisory; it does not determine the official risk score.
- Avoid claiming that the organization is legally compliant/non-compliant with certainty; frame compliance findings as potential gaps requiring legal/privacy review.

Facts:
${JSON.stringify(mockAssessmentLow.toObject(), null, 2)}

Respond ONLY with a valid JSON object matching this schema:
{
  "executiveSummary": "A concise, professional executive summary suitable for management.",
  "complianceGaps": [
    {
      "title": "Title of the gap",
      "status": "confirmed" | "potential" | "not_provided",
      "reason": "Detailed explanation based strictly on provided facts.",
      "recommendation": "Suggested remediation action."
    }
  ],
  "riskExplanation": "A human-readable narrative explaining why the authoritative risk score is what it is, combining facts and findings.",
  "recommendations": ["Recommendation 1", "Recommendation 2"]
}`;

  const response = await ai.models.generateContent({
    model: 'gemini-3.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json'
    }
  });

  console.log(response.text);

  process.exit(0);
}

test();
