import { GoogleGenAI } from '@google/genai';

const withRetry = async <T>(fn: () => Promise<T>, retries = 3, initialDelay = 2000): Promise<T> => {
  let attempt = 0;
  while (attempt < retries) {
    try {
      return await fn();
    } catch (error: any) {
      if (error?.status === 429 || error?.code === 429 || error?.message?.includes('429') || error?.message?.includes('quota') || error?.status === 'RESOURCE_EXHAUSTED') {
        attempt++;
        if (attempt >= retries) throw error;
        let delay = initialDelay * Math.pow(2, attempt);
        const retryMatch = error?.message?.match(/retry in (\d+(?:\.\d+)?)s/);
        if (retryMatch) {
          delay = Math.ceil(parseFloat(retryMatch[1]) * 1000) + 1000;
        }
        if (delay > 10000) {
          console.warn(`Gemini API Rate Limit hit. Delay ${delay}ms is too long, aborting retry.`);
          throw error;
        }
        console.warn(`Gemini API Rate Limit hit. Retrying in ${delay}ms... (Attempt ${attempt}/${retries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
  throw new Error("Max retries reached");
};

export interface AIAnalysisResult {
  derivedLikelihood: 'low' | 'medium' | 'high';
  derivedImpact: 'low' | 'medium' | 'high';
  insights: string[];
  recommendations: string[];
}

export const analyzeAssessmentWithAI = async (assessmentFacts: any): Promise<AIAnalysisResult | null> => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    const facts = {
      title: assessmentFacts.title,
      processingActivity: assessmentFacts.processingActivity,
      purpose: assessmentFacts.purpose,
      dataSubjects: assessmentFacts.dataSubjects,
      personalDataCategories: assessmentFacts.personalDataCategories,
      dataSource: assessmentFacts.dataSource,
      storageLocation: assessmentFacts.storageLocation,
      retentionPeriod: assessmentFacts.retentionPeriod,
      dataSharing: assessmentFacts.dataSharing,
      securityMeasures: assessmentFacts.securityMeasures,
    };

    const prompt = `You are a privacy expert analyzing a data processing activity for a Privacy Impact Assessment.
Based on the following facts, determine the privacy risk likelihood, risk impact, provide key insights (max 3), and actionable mitigation recommendations (max 3).

STRICT RULES:
- Use ONLY the supplied assessment facts.
- NEVER invent organizational policies, controls, processes, certifications, contracts, legal bases, audits, or compliance activities.
- If information is missing from the assessment, explicitly state that it was "not provided" or "not specified". Do not treat missing information as confirmed non-compliance.
- Ensure recommendations are actionable, specific, relevant to the assessment, and do not contradict supplied security measures (e.g. do not recommend encryption if it is already implemented).

Facts:
${JSON.stringify(facts, null, 2)}

Respond ONLY with a valid JSON object matching this schema:
{
  "derivedLikelihood": "low" | "medium" | "high",
  "derivedImpact": "low" | "medium" | "high",
  "insights": ["insight 1", "insight 2"],
  "recommendations": ["recommendation 1", "recommendation 2"]
}`;

    const response = await withRetry(() => ai.models.generateContent({
      model: 'gemini-3.5-flash-lite',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    }));

    if (response.text) {
      const parsed = JSON.parse(response.text) as any;
      const normalizedLikelihood = String(parsed.derivedLikelihood || '').trim().toLowerCase();
      const normalizedImpact = String(parsed.derivedImpact || '').trim().toLowerCase();

      if (['low', 'medium', 'high'].includes(normalizedLikelihood) && 
          ['low', 'medium', 'high'].includes(normalizedImpact)) {
        return {
          derivedLikelihood: normalizedLikelihood as 'low' | 'medium' | 'high',
          derivedImpact: normalizedImpact as 'low' | 'medium' | 'high',
          insights: Array.isArray(parsed.insights) ? parsed.insights : [],
          recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : []
        };
      }
    }
    return null;
  } catch (error: any) {
    console.warn('Gemini Analysis Failed:', error.message || 'Unknown error');
    return null;
  }
};

export interface ComplianceGap {
  title: string;
  status: 'confirmed' | 'potential' | 'not_provided';
  reason: string;
  recommendation: string;
  evidence?: string;
  confidence?: 'high' | 'medium' | 'low';
}

export interface AIReportResult {
  executiveSummary: string;
  complianceGaps: ComplianceGap[];
  riskExplanation: string;
  recommendations: string[];
}

export const generateComprehensivePrivacyReport = async (assessmentFacts: any): Promise<AIReportResult | null> => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    const facts = {
      title: assessmentFacts.title,
      processingActivity: assessmentFacts.processingActivity,
      purpose: assessmentFacts.purpose,
      description: assessmentFacts.description,
      dataSource: assessmentFacts.dataSource,
      storageLocation: assessmentFacts.storageLocation,
      retentionPeriod: assessmentFacts.retentionPeriod,
      dataSharing: assessmentFacts.dataSharing,
      securityMeasures: assessmentFacts.securityMeasures,
      calculatedRiskScore: assessmentFacts.calculatedRiskScore,
      calculatedRiskLevel: assessmentFacts.calculatedRiskLevel,
      riskFactors: assessmentFacts.riskFactors,
      riskFindings: assessmentFacts.riskFindings,
    };

    const prompt = `You are a privacy expert acting as a Data Protection Officer (DPO) generating a comprehensive Privacy Impact Assessment report.
Based on the provided facts about a data processing activity and its pre-calculated risk score, generate a detailed report.

The AI must follow these STRICT RULES:
- Use ONLY the supplied assessment facts as confirmed facts.
- NEVER invent organizational policies, controls, processes, certifications, contracts, legal bases, audits, or compliance activities.
- NEVER claim that something exists or does not exist unless supported by the assessment.
- When something is missing from the assessment, explicitly state that it was "not provided" or "not specified".
- Clearly distinguish factual observations from AI-generated interpretations. Every AI conclusion must clearly distinguish between FACT (directly provided), INFERENCE (AI interpretation based on facts), and RECOMMENDATION (suggested action).
- Compliance gaps based on missing information MUST be labelled as potential/unverified gaps or not provided.
- For compliance gaps, "status" MUST be exactly one of: "confirmed", "potential", or "not_provided".
- For each gap, you MUST provide "evidence" quoting exactly which factual assessment field supports the conclusion.
- For each gap, provide a "confidence" level ("high", "medium", "low") describing how strongly the conclusion is supported by facts.
- Recommendations may go beyond the supplied facts, but must be clearly presented as recommendations rather than existing organizational practices.
- DO NOT change or reinterpret the authoritative Phase 6 risk score. Treat calculatedRiskScore and calculatedRiskLevel as authoritative.
- The AI report is explanatory and advisory; it does not determine the official risk score.
- Avoid claiming that the organization is legally compliant/non-compliant with certainty; frame compliance findings as potential gaps requiring legal/privacy review.

Facts:
${JSON.stringify(facts, null, 2)}

Respond ONLY with a valid JSON object matching this schema:
{
  "executiveSummary": "A concise, professional executive summary suitable for management.",
  "complianceGaps": [
    {
      "title": "Title of the gap",
      "status": "confirmed",
      "reason": "Detailed explanation based strictly on provided facts. Clearly distinguish between fact and inference.",
      "evidence": "E.g., Retention Period: 5 years after employment ends",
      "confidence": "high",
      "recommendation": "Suggested remediation action."
    }
  ],
  "riskExplanation": "A human-readable narrative explaining why the authoritative risk score is what it is, combining facts and findings.",
  "recommendations": ["Recommendation 1", "Recommendation 2"]
}`;

    const response = await withRetry(() => ai.models.generateContent({
      model: 'gemini-3.5-flash-lite',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    }));

    if (response.text) {
      const parsed = JSON.parse(response.text) as AIReportResult;
      if (parsed.executiveSummary && parsed.complianceGaps && parsed.riskExplanation && parsed.recommendations) {
        return parsed;
      }
    }
    return null;
  } catch (error: any) {
    console.warn('Gemini Report Generation Failed:', error.message || 'Unknown error');
    return null;
  }
};
