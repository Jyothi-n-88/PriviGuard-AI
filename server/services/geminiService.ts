import { GoogleGenAI } from '@google/genai';

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

Facts:
${JSON.stringify(facts, null, 2)}

Respond ONLY with a valid JSON object matching this schema:
{
  "derivedLikelihood": "low" | "medium" | "high",
  "derivedImpact": "low" | "medium" | "high",
  "insights": ["insight 1", "insight 2"],
  "recommendations": ["recommendation 1", "recommendation 2"]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    if (response.text) {
      const parsed = JSON.parse(response.text) as AIAnalysisResult;
      if (['low', 'medium', 'high'].includes(parsed.derivedLikelihood) && 
          ['low', 'medium', 'high'].includes(parsed.derivedImpact)) {
        return parsed;
      }
    }
    return null;
  } catch (error) {
    console.error('Gemini Analysis Failed:', error);
    return null;
  }
};
