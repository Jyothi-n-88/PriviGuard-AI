import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import { Assessment } from './server/models/Assessment';
import { generateComprehensivePrivacyReport } from './server/services/geminiService';

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

  console.log("Generating report for Low Risk...");
  let report = await generateComprehensivePrivacyReport(mockAssessmentLow.toObject());
  console.log(JSON.stringify(report?.complianceGaps, null, 2));

  const mockAssessmentHigh = new Assessment({
    organizationId: new mongoose.Types.ObjectId(),
    title: "Patient Data Sync",
    processingActivity: "Sync patient medical records to cloud",
    purpose: "Machine learning research",
    dataSubjects: ["Patients"],
    personalDataCategories: ["Health data", "Biometrics", "Financial data"],
    dataSource: "Hospital database",
    storageLocation: "AWS US-East",
    retentionPeriod: "Indefinite",
    dataSharing: "External research partners",
    securityMeasures: "Password protection",
    calculatedRiskScore: 100,
    calculatedRiskLevel: "critical",
    riskFactors: [],
    riskFindings: []
  });

  console.log("\nGenerating report for High Risk...");
  report = await generateComprehensivePrivacyReport(mockAssessmentHigh.toObject());
  console.log(JSON.stringify(report?.complianceGaps, null, 2));

  process.exit(0);
}

test();
