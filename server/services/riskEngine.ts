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
  const retentionKeywords = ['indefinite', 'forever', 'permanent', 'unknown', 'no limit'];
  if (textIncludes(assessment.retentionPeriod, retentionKeywords)) {
    score += 10;
    factors.push('Indefinite Data Retention');
    findings.push({
      category: 'Data Retention',
      severity: 'medium',
      title: 'Indefinite Data Retention',
      reason: 'The assessment indicates an indefinite, unknown, or permanent data retention period.',
      recommendation: 'Define a specific, justifiable retention period and implement automated data deletion/anonymization mechanisms.',
      points: 10
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
