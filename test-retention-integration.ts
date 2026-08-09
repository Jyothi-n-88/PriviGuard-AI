import mongoose from 'mongoose';
import { Assessment } from './server/models/Assessment';
import { calculatePrivacyRisk, deriveBaseRiskIndicators } from './server/services/riskEngine';

async function test() {
  const baseAssessment = {
    organizationId: new mongoose.Types.ObjectId(),
    title: "Employee Directory",
    processingActivity: "Store employee contact info",
    purpose: "Internal communication",
    dataSubjects: ["Employees"],
    personalDataCategories: ["Name", "Work Email", "Phone number"],
    dataSource: "Directly from employees",
    storageLocation: "Secure company database in EU",
    dataSharing: "Internal only",
    securityMeasures: "Encryption at rest and in transit, RBAC, authentication, monitoring",
  };

  const tests = [
    { name: "Test 1 - Low Retention", retention: "1 year after employment ends" },
    { name: "Test 2 - Moderate Retention", retention: "5 years after employment ends" },
    { name: "Test 3 - High Retention", retention: "Indefinite" },
    { name: "Test 4 - Unknown Retention", retention: "Unknown" },
  ];

  let prevScore = -1;

  for (const t of tests) {
    console.log(`\n--- ${t.name} ---`);
    const assessmentObj = { ...baseAssessment, retentionPeriod: t.retention };
    const baseRisk = deriveBaseRiskIndicators(assessmentObj);
    const finalAssessment = { ...assessmentObj, riskLikelihood: baseRisk.likelihood, riskImpact: baseRisk.impact };
    const result = calculatePrivacyRisk(finalAssessment);

    console.log(`Score: ${result.score}`);
    console.log(`Level: ${result.level}`);
    const retentionFinding = result.findings.find(f => f.category === 'Data Retention');
    console.log(`Retention Finding:`, retentionFinding ? retentionFinding.title : 'None');
    console.log(`Points from Retention:`, retentionFinding ? retentionFinding.points : 0);
    
    if (prevScore !== -1) {
       console.log(`Score strictly greater than previous? ${result.score > prevScore}`);
    }
    prevScore = result.score;
  }
}

test();
