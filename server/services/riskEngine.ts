import { IAssessment } from '../models/Assessment';

export interface RiskFinding {
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  reason: string;
  recommendation: string;
  points: number;
}

export interface RiskResult {
  score: number;
  level: 'low' | 'medium' | 'high' | 'critical';
  factors: string[];
  findings: RiskFinding[];
  version: string;
  calculatedAt: Date;
}

export const deriveBaseRiskIndicators = (assessment: Partial<IAssessment>) => {
  const textIncludes = (text: string | string[] | undefined, keywords: string[]): boolean => {
    if (!text) return false;
    const lowerText = Array.isArray(text) ? text.join(' ').toLowerCase() : text.toLowerCase();
    return keywords.some(kw => lowerText.includes(kw));
  };

  const sensitiveKeywords = ['health', 'medical', 'financial', 'credit card', 'ssn', 'biometric', 'children', 'minors', 'password', 'criminal', 'genetic'];
  const sharingKeywords = ['external', 'third party', 'vendor', 'public', 'cross-border', 'international'];
  const weakSecurityKeywords = ['none', 'n/a', 'missing', 'weak', 'no security', 'plain text'];

  const sensitivityText = [
    assessment.processingActivity,
    assessment.purpose,
    assessment.description,
    ...(assessment.personalDataCategories || []),
    ...(assessment.dataSubjects || [])
  ].join(' ');

  const sharingText = [
    assessment.dataSharing,
    ...(assessment.thirdPartyProcessors || [])
  ].join(' ');

  const hasSensitive = textIncludes(sensitivityText, sensitiveKeywords);
  const hasExternalSharing = textIncludes(sharingText, sharingKeywords);
  const hasWeakSecurity = textIncludes(assessment.securityMeasures, weakSecurityKeywords) || !assessment.securityMeasures || assessment.securityMeasures.trim() === '';

  let impact: 'low' | 'medium' | 'high' = 'low';
  if (hasSensitive) impact = 'high';
  else if (hasExternalSharing) impact = 'medium';

  let likelihood: 'low' | 'medium' | 'high' = 'low';
  if (hasWeakSecurity && hasExternalSharing) likelihood = 'high';
  else if (hasWeakSecurity || hasExternalSharing) likelihood = 'medium';

  return { likelihood, impact };
};

export const calculatePrivacyRisk = (assessment: Partial<IAssessment>): RiskResult => {
  let score = 0;
  const factors: string[] = [];
  const findings: RiskFinding[] = [];

  // 1. Base Risk (0-40 points)
  const valueMap: Record<string, number> = { low: 1, medium: 2, high: 3 };
  const lVal = assessment.riskLikelihood ? valueMap[assessment.riskLikelihood] : 0;
  const iVal = assessment.riskImpact ? valueMap[assessment.riskImpact] : 0;
  
  if (lVal && iVal) {
    const baseRisk = Math.round((lVal / 3) * (iVal / 3) * 40);
    score += baseRisk;
    factors.push(`Base Risk: Likelihood (${assessment.riskLikelihood}) × Impact (${assessment.riskImpact})`);
  }

  // Helper to safely check text
  const textIncludes = (text: string | string[] | undefined, keywords: string[]): boolean => {
    if (!text) return false;
    const lowerText = Array.isArray(text) ? text.join(' ').toLowerCase() : text.toLowerCase();
    return keywords.some(kw => lowerText.includes(kw));
  };

  // 2. Data Sensitivity (0-20 points)
  const sensitiveKeywords = ['health', 'medical', 'financial', 'credit card', 'ssn', 'biometric', 'children', 'minors', 'password', 'criminal', 'genetic'];
  const sensitivityText = [
    assessment.processingActivity,
    assessment.purpose,
    assessment.description,
    ...(assessment.personalDataCategories || []),
    ...(assessment.dataSubjects || [])
  ].join(' ');

  if (textIncludes(sensitivityText, sensitiveKeywords)) {
    score += 20;
    factors.push('Sensitive Data Processing');
    findings.push({
      category: 'Data Sensitivity',
      severity: 'high',
      title: 'Sensitive personal data processing',
      reason: 'The assessment indicates processing of potentially sensitive personal data (e.g., health, financial, minors).',
      recommendation: 'Apply enhanced access controls, minimize collected data, and review retention practices.',
      points: 20
    });
  }

  // 3. Data Sharing & Transfers (0-15 points)
  const sharingKeywords = ['external', 'third party', 'vendor', 'public', 'cross-border', 'international'];
  const sharingText = [
    assessment.dataSharing,
    ...(assessment.thirdPartyProcessors || [])
  ].join(' ');

  if (textIncludes(sharingText, sharingKeywords)) {
    score += 15;
    factors.push('External Data Sharing / Transfers');
    findings.push({
      category: 'Data Sharing',
      severity: 'medium',
      title: 'External Data Sharing',
      reason: 'Personal data is shared with external parties or transferred across borders.',
      recommendation: 'Review processor agreements, data processing addendums (DPAs), and applicable transfer safeguards (e.g., SCCs).',
      points: 15
    });
  }

  // 4. Retention Risk (0-10 points)
  let retentionPoints = 0;
  let retentionTitle = '';
  let retentionReason = '';
  let retentionRecommendation = '';
  let retentionSeverity: 'low' | 'medium' | 'high' | 'critical' = 'low';

  const retention = (assessment.retentionPeriod || '').toLowerCase().trim();

  if (!retention || retention === 'unknown' || retention === 'unspecified' || retention === 'n/a') {
    retentionPoints = 8;
    retentionTitle = 'Undefined Data Retention';
    retentionReason = 'The assessment does not define a specific endpoint for retaining personal data.';
    retentionRecommendation = 'Define a documented retention period and implement automated deletion or anonymization controls.';
    retentionSeverity = 'high';
  } else {
    const indefiniteKeywords = ['indefinite', 'forever', 'permanent', 'no limit'];
    const isIndefinite = indefiniteKeywords.some(kw => retention.includes(kw));

    if (isIndefinite) {
      retentionPoints = 10;
      retentionTitle = 'Indefinite Data Retention';
      retentionReason = 'The assessment does not define a specific endpoint for retaining personal data.';
      retentionRecommendation = 'Define a documented retention period and implement automated deletion or anonymization controls.';
      retentionSeverity = 'high';
    } else {
      const numMap: Record<string, number> = {
        'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
        'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10
      };
      let years: number | null = null;
      const yearMatch = retention.match(/(\d+)\s*year/);
      if (yearMatch) {
        years = parseInt(yearMatch[1], 10);
      } else {
        const words = retention.split(/[\s-]+/);
        for (let i = 0; i < words.length; i++) {
          if (words[i].startsWith('year')) {
            if (i > 0) {
              const prevWord = words[i-1];
              if (numMap[prevWord]) years = numMap[prevWord];
            }
          }
        }
      }
      
      if (years === null) {
        const monthMatch = retention.match(/(\d+)\s*month/);
        if (monthMatch) years = parseInt(monthMatch[1], 10) / 12;
      }
      
      if (years !== null) {
        if (years > 5) {
          retentionPoints = 7;
          retentionTitle = 'Extended Data Retention';
          retentionReason = `The assessment specifies a retention period of ${years} year(s). Extended retention increases the period during which personal data remains exposed to unauthorized access, misuse, or unnecessary processing.`;
          retentionRecommendation = 'Document the business or legal justification for the retention period and periodically review whether the data can be deleted, anonymized, or retained for a shorter period.';
          retentionSeverity = 'medium';
        } else if (years >= 3) {
          retentionPoints = 4;
          retentionTitle = 'Moderate Data Retention';
          retentionReason = `The assessment specifies a retention period of ${years} year(s).`;
          retentionRecommendation = 'Ensure that the retention period is legally or operationally justified and enforced.';
          retentionSeverity = 'low';
        } else if (years >= 1) {
          retentionPoints = 1;
          retentionTitle = 'Standard Data Retention';
          retentionReason = `The assessment specifies a retention period of ${years} year(s).`;
          retentionRecommendation = 'Ensure retention limits are enforced via automated deletion.';
          retentionSeverity = 'low';
        }
      }
    }
  }

  if (retentionPoints > 0) {
    score += retentionPoints;
    let factorLabel = 'Extended Data Retention';
    if (retentionPoints >= 8) factorLabel = 'Indefinite/Undefined Data Retention';
    else if (retentionPoints <= 2) factorLabel = 'Standard Data Retention';
    
    factors.push(factorLabel);
    
    findings.push({
      category: 'Data Retention',
      severity: retentionSeverity,
      title: retentionTitle,
      reason: retentionReason,
      recommendation: retentionRecommendation,
      points: retentionPoints
    });
  }

  // 5. Security Posture Risk (0-15 points)
  const weakSecurityKeywords = ['none', 'n/a', 'missing', 'weak', 'no security', 'plain text'];
  if (textIncludes(assessment.securityMeasures, weakSecurityKeywords)) {
    score += 15;
    factors.push('Weak Security Controls');
    findings.push({
      category: 'Security Controls',
      severity: 'high',
      title: 'Weak or Absent Security Controls',
      reason: 'The assessment explicitly states that security controls are weak or non-existent.',
      recommendation: 'Implement standard security measures such as encryption at rest/transit, strong authentication, and access controls immediately.',
      points: 15
    });
  } else if (!assessment.securityMeasures || assessment.securityMeasures.trim() === '') {
    // If empty, we don't assume weak, we just assume undocumented
    factors.push('Undocumented Security Controls');
    findings.push({
      category: 'Security Controls',
      severity: 'low',
      title: 'Undocumented Security Measures',
      reason: 'Security measures have not been documented in the assessment.',
      recommendation: 'Document the applied technical and organizational security measures to ensure accountability.',
      points: 0
    });
  }

  // Cap score at 100
  score = Math.min(score, 100);

  // Map to Risk Level
  let level: RiskResult['level'] = 'low';
  if (score >= 75) level = 'critical';
  else if (score >= 50) level = 'high';
  else if (score >= 25) level = 'medium';

  return {
    score,
    level,
    factors,
    findings: findings.sort((a, b) => b.points - a.points),
    version: 'rule-v1',
    calculatedAt: new Date()
  };
};
