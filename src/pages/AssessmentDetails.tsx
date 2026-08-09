import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, RefreshCw } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Alert, AlertDescription } from '../components/ui/Alert';
import { RoleGuard } from '../components/RoleGuard';
import { assessmentService } from '../services/assessmentService';
import { Assessment } from '../types/assessment';
import { RemediationActions } from '../components/assessment/RemediationActions';
import { CreateRemediationModal } from '../components/assessment/CreateRemediationModal';
import { RemediationSourceType } from '../types/remediation';

export function AssessmentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [versions, setVersions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [createRemediationSource, setCreateRemediationSource] = useState<{ type: RemediationSourceType, ref: string, title: string } | null>(null);
  
  // This state exists to trigger a refresh in the RemediationActions child component
  const [remediationsRefreshKey, setRemediationsRefreshKey] = useState(0);

  useEffect(() => {
    fetchAssessment();
  }, [id]);

  const fetchAssessment = async () => {
    try {
      const res = await assessmentService.getAssessment(id!);
      setAssessment(res.data);
      const [logsRes, versionsRes] = await Promise.all([
        assessmentService.getAuditLogs(id!),
        assessmentService.getAssessmentVersions(id!)
      ]);
      setAuditLogs(logsRes.data || []);
      setVersions(versionsRes.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load assessment');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await assessmentService.deleteAssessment(id!);
      navigate('/assessments');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete assessment');
      setDeleteConfirm(false);
    }
  };

  const handleRecalculateRisk = async () => {
    try {
      setLoading(true);
      const res = await assessmentService.recalculateRisk(id!);
      setAssessment(res.data);
      const [logsRes, versionsRes] = await Promise.all([
        assessmentService.getAuditLogs(id!),
        assessmentService.getAssessmentVersions(id!)
      ]);
      setAuditLogs(logsRes.data || []);
      setVersions(versionsRes.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to recalculate risk');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async (status: string, comment?: string) => {
    try {
      setLoading(true);
      const res = await assessmentService.submitDpoReview(id!, status, comment);
      setAssessment(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update review status');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    try {
      setLoading(true);
      const res = await assessmentService.generatePrivacyReport(id!);
      setAssessment(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate AI report');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading assessment...</div>;
  if (error && !assessment) return <div className="p-8"><Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert></div>;
  if (!assessment) return <div className="p-8">Assessment not found.</div>;

  const getRiskColor = (level?: string) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      case 'medium': return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'high': return 'text-orange-700 bg-orange-50 border-orange-200';
      case 'critical': return 'text-red-700 bg-red-50 border-red-200';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  const isReportStale = assessment.aiReportGeneratedAt && (
    assessment.aiReportAssessmentUpdatedAt
      ? new Date(assessment.updatedAt).getTime() > new Date(assessment.aiReportAssessmentUpdatedAt).getTime() + 1000
      : new Date(assessment.updatedAt).getTime() > new Date(assessment.aiReportGeneratedAt).getTime() + 10000
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => navigate('/assessments')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PageHeader 
          title={assessment.title} 
          description={`Processing Activity: ${assessment.processingActivity}`}
        />
        <div className="flex items-center gap-2">
          <RoleGuard allowedRoles={['admin', 'dpo', 'privacy_manager']}>
            <Button variant="outline" className="border-indigo-200 text-indigo-700 hover:bg-indigo-50" onClick={handleGenerateReport}>
              {assessment.aiReportGeneratedAt ? 'Regenerate AI Privacy Report' : 'Generate AI Privacy Report'}
            </Button>
            <Button variant="outline" onClick={handleRecalculateRisk}>
              <RefreshCw className="w-4 h-4 mr-2" /> Recalculate Risk
            </Button>
            <Button variant="outline" onClick={() => navigate(`/assessments/${assessment._id}/edit`)}>
              <Edit className="w-4 h-4 mr-2" /> Edit
            </Button>
            {deleteConfirm ? (
              <div className="flex items-center gap-2">
                <Button variant="destructive" onClick={handleDelete}>Confirm Delete</Button>
                <Button variant="outline" onClick={() => setDeleteConfirm(false)}>Cancel</Button>
              </div>
            ) : (
              <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => setDeleteConfirm(true)}>
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </Button>
            )}
          </RoleGuard>
        </div>
      </div>

      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle>Assessment Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-slate-500 mb-1">Purpose of Processing</h4>
                <p className="text-slate-900">{assessment.purpose}</p>
              </div>
              {assessment.description && (
                <div>
                  <h4 className="text-sm font-medium text-slate-500 mb-1">Description</h4>
                  <p className="text-slate-900 whitespace-pre-wrap">{assessment.description}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                <div>
                  <h4 className="text-sm font-medium text-slate-500 mb-1">Data Source</h4>
                  <p className="text-slate-900">{assessment.dataSource || 'Not specified'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-500 mb-1">Storage Location</h4>
                  <p className="text-slate-900">{assessment.storageLocation || 'Not specified'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-500 mb-1">Retention Period</h4>
                  <p className="text-slate-900">{assessment.retentionPeriod || 'Not specified'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-500 mb-1">Data Sharing</h4>
                  <p className="text-slate-900">{assessment.dataSharing || 'Not specified'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Security</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-slate-500 mb-1">Security Measures</h4>
                <p className="text-slate-900 whitespace-pre-wrap">{assessment.securityMeasures || 'None specified'}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-indigo-100 shadow-sm">
            <CardHeader className="bg-indigo-50/50 border-b border-indigo-50">
              <div className="flex justify-between items-center">
                <CardTitle className="text-indigo-900">AI Privacy Report</CardTitle>
                {assessment.aiReportGeneratedAt && (
                  <span className="text-xs text-indigo-500 font-medium bg-indigo-100 px-2 py-1 rounded-full">
                    Generated by Gemini • {new Date(assessment.aiReportGeneratedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {assessment.aiReportGeneratedAt ? (
                <div className="space-y-6">
                  {isReportStale && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4 flex justify-between items-center text-yellow-800 text-sm">
                      <span><strong>Notice:</strong> The assessment facts have been modified since this report was generated. The analysis may be outdated.</span>
                      <RoleGuard allowedRoles={['admin', 'dpo', 'privacy_manager']}>
                        <Button onClick={handleGenerateReport} size="sm" variant="outline" className="border-yellow-300 text-yellow-800 hover:bg-yellow-100">
                          Regenerate Report
                        </Button>
                      </RoleGuard>
                    </div>
                  )}
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 mb-2">Executive Summary</h4>
                    <p className="text-slate-700 text-sm leading-relaxed">{assessment.executiveSummary}</p>
                  </div>
                  
                  <div className="border-t border-slate-100 pt-4">
                    <h4 className="text-sm font-semibold text-slate-900 mb-2">Compliance Gaps</h4>
                    {assessment.complianceGaps && assessment.complianceGaps.length > 0 ? (
                      <div className="space-y-4">
                        {assessment.complianceGaps.map((gap, idx) => {
                          if (typeof gap === 'string') {
                            return (
                              <div key={idx} className="flex items-start text-sm">
                                <span className="mr-2 text-orange-500">•</span>
                                <span className="text-slate-700">{gap}</span>
                              </div>
                            );
                          }
                          
                          let badgeColor = 'bg-slate-100 text-slate-800';
                          let badgeText = 'NOT PROVIDED';
                          if (gap.status === 'confirmed') {
                            badgeColor = 'bg-red-100 text-red-800 border border-red-200';
                            badgeText = 'CONFIRMED';
                          } else if (gap.status === 'potential') {
                            badgeColor = 'bg-orange-100 text-orange-800 border border-orange-200';
                            badgeText = 'POTENTIAL GAP';
                          } else if (gap.status === 'not_provided') {
                            badgeColor = 'bg-slate-100 text-slate-600 border border-slate-200';
                            badgeText = 'NOT PROVIDED';
                          }

                          let confidenceBadge = null;
                          if (gap.confidence) {
                            const confColor = gap.confidence === 'high' ? 'text-green-700 bg-green-50 border-green-200' : gap.confidence === 'medium' ? 'text-yellow-700 bg-yellow-50 border-yellow-200' : 'text-slate-700 bg-slate-50 border-slate-200';
                            confidenceBadge = (
                              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${confColor} ml-2`}>
                                {gap.confidence.charAt(0).toUpperCase() + gap.confidence.slice(1)} Confidence
                              </span>
                            );
                          }

                          return (
                            <div key={idx} className="bg-white border border-slate-200 rounded-md p-3 shadow-sm">
                              <div className="flex items-center justify-between mb-2">
                                <h5 className="font-medium text-slate-800 text-sm flex items-center">
                                  {gap.title}
                                  {confidenceBadge}
                                </h5>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeColor}`}>
                                  {badgeText}
                                </span>
                              </div>
                              {gap.evidence && (
                                <div className="bg-blue-50 border border-blue-100 p-2 rounded mb-2 text-xs">
                                  <span className="font-medium text-blue-800 block mb-1">Evidence (Fact):</span>
                                  <span className="text-blue-700 italic">"{gap.evidence}"</span>
                                </div>
                              )}
                              <p className="text-slate-600 text-xs mb-2">
                                <span className="font-medium text-slate-700">Reasoning (Inference):</span> {gap.reason}
                              </p>
                              <div className="bg-slate-50 p-2 rounded text-xs border border-slate-100 mb-2">
                                <span className="font-medium text-slate-700">Recommendation:</span> <span className="text-slate-600">{gap.recommendation}</span>
                              </div>
                              <RoleGuard allowedRoles={['admin', 'dpo', 'privacy_manager', 'compliance_officer']}>
                                <div className="flex justify-end mt-2">
                                  <Button size="sm" variant="outline" onClick={() => setCreateRemediationSource({ type: 'ai_compliance_gap', ref: gap.title, title: `Address: ${gap.title}` })}>
                                    Create Remediation
                                  </Button>
                                </div>
                              </RoleGuard>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500 italic">No significant compliance gaps identified.</p>
                    )}
                  </div>
                  
                  <div className="border-t border-slate-100 pt-4">
                    <h4 className="text-sm font-semibold text-slate-900 mb-2">Risk Explanation</h4>
                    <p className="text-slate-700 text-sm leading-relaxed">{assessment.riskExplanation}</p>
                  </div>
                  
                  <div className="border-t border-slate-100 pt-4">
                    <h4 className="text-sm font-semibold text-slate-900 mb-2">AI Recommendations</h4>
                    {assessment.aiReportRecommendations && assessment.aiReportRecommendations.length > 0 ? (
                      <ul className="space-y-2">
                        {assessment.aiReportRecommendations.map((rec, idx) => (
                          <li key={idx} className="flex items-start text-sm">
                            <span className="mr-2 text-green-500">→</span>
                            <span className="text-slate-700">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-slate-500 italic">No specific recommendations provided.</p>
                    )}
                  </div>

                  <div className="border-t border-slate-100 pt-4 mt-6">
                    <p className="text-[11px] text-slate-400 text-center uppercase tracking-wider">
                      AI-generated analysis is provided for privacy assessment and decision-support purposes. It does not constitute formal legal advice or a definitive determination of regulatory compliance.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-slate-500 mb-4">
                    Generate an AI Privacy Report to receive an executive summary, potential compliance gaps, risk explanation, and remediation recommendations.
                  </p>
                  <RoleGuard allowedRoles={['admin', 'dpo', 'privacy_manager']}>
                    <Button onClick={handleGenerateReport} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                      Generate Report Now
                    </Button>
                  </RoleGuard>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Risk Overview</CardTitle></CardHeader>
            <CardContent>
              <div className={`p-4 rounded-lg border flex flex-col items-center justify-center text-center ${getRiskColor(assessment.calculatedRiskLevel)}`}>
                <span className="text-sm font-semibold uppercase tracking-wider mb-1">Calculated Risk Level</span>
                <span className="text-3xl font-bold capitalize">{assessment.calculatedRiskLevel || 'Not Scored'}</span>
                {assessment.calculatedRiskScore !== undefined && (
                  <span className="text-sm mt-2 opacity-80 font-medium">Risk Score: {assessment.calculatedRiskScore} / 100</span>
                )}
              </div>
              
              <div className="mt-6 space-y-3 text-sm">
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-500">Likelihood:</span>
                  <span className="font-medium capitalize">{assessment.riskLikelihood || 'Not set'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-500">Impact:</span>
                  <span className="font-medium capitalize">{assessment.riskImpact || 'Not set'}</span>
                </div>
                {assessment.riskEngineVersion && (
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-slate-500">Engine Version:</span>
                    <span className="font-medium">{assessment.riskEngineVersion}</span>
                  </div>
                )}
                {assessment.riskCalculatedAt && (
                  <div className="flex justify-between items-center py-2">
                    <span className="text-slate-500">Calculated:</span>
                    <span className="font-medium">{new Date(assessment.riskCalculatedAt).toLocaleString()}</span>
                  </div>
                )}
              </div>
              
              {assessment.riskFactors && assessment.riskFactors.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-semibold text-slate-900 mb-3">Risk Factors</h4>
                  <ul className="space-y-2">
                    {assessment.riskFactors.map((factor, idx) => (
                      <li key={idx} className="flex items-start text-sm">
                        <span className="mr-2 text-slate-400">✓</span>
                        <span className="text-slate-700">{factor}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>AI Insights</CardTitle></CardHeader>
            <CardContent>
              {assessment.isAiGenerated ? (
                <div className="space-y-4">
                  <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded inline-block font-medium mb-2">Gemini Analysis Available</div>
                  {assessment.aiInsights && assessment.aiInsights.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 mb-2">Key Insights</h4>
                      <ul className="space-y-2">
                        {assessment.aiInsights.map((insight, idx) => (
                          <li key={idx} className="flex items-start text-sm">
                            <span className="mr-2 text-blue-500">•</span>
                            <span className="text-slate-700">{insight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {assessment.aiRecommendations && assessment.aiRecommendations.length > 0 && (
                    <div className="pt-2">
                      <h4 className="text-sm font-semibold text-slate-900 mb-2">AI Recommendations</h4>
                      <ul className="space-y-2">
                        {assessment.aiRecommendations.map((rec, idx) => (
                          <li key={idx} className="flex items-start text-sm">
                            <span className="mr-2 text-green-500">→</span>
                            <span className="text-slate-700">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-sm text-slate-500 italic">
                  AI analysis unavailable — showing deterministic rule-based analysis.
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>DPO Review</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 text-sm">Review Status:</span>
                <span className={`font-medium capitalize px-2 py-0.5 rounded text-sm ${assessment.dpoReviewStatus === 'approved' ? 'bg-green-100 text-green-800' : assessment.dpoReviewStatus === 'rejected' ? 'bg-red-100 text-red-800' : assessment.dpoReviewStatus === 'reassessed' ? 'bg-orange-100 text-orange-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {assessment.dpoReviewStatus || 'pending'}
                </span>
              </div>
              
              {assessment.dpoReviewComment && (
                <div className="pt-2">
                  <h4 className="text-sm font-medium text-slate-500 mb-1">DPO Comment</h4>
                  <p className="text-slate-900 text-sm whitespace-pre-wrap">{assessment.dpoReviewComment}</p>
                </div>
              )}
              
              <RoleGuard allowedRoles={['admin', 'dpo']}>
                <div className="pt-2 border-t border-slate-100 space-y-3">
                  <textarea
                    placeholder="Add a comment (required for Reject / Request Reassessment)..."
                    className="w-full text-sm rounded-md border border-slate-300 p-2 focus:outline-none focus:ring-2 focus:ring-slate-400"
                    rows={2}
                    id="dpo-comment"
                  ></textarea>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full text-green-700 hover:text-green-800 hover:bg-green-50 border-green-200"
                      onClick={() => {
                        const comment = (document.getElementById('dpo-comment') as HTMLTextAreaElement)?.value;
                        handleReviewSubmit('approved', comment);
                        if (document.getElementById('dpo-comment')) {
                          (document.getElementById('dpo-comment') as HTMLTextAreaElement).value = '';
                        }
                      }}
                    >
                      Approve
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full text-orange-700 hover:text-orange-800 hover:bg-orange-50 border-orange-200 whitespace-nowrap"
                      onClick={() => {
                        const comment = (document.getElementById('dpo-comment') as HTMLTextAreaElement)?.value;
                        if (!comment || comment.trim() === '') {
                           setError('A comment is required to request reassessment');
                           return;
                        }
                        handleReviewSubmit('reassessed', comment);
                        if (document.getElementById('dpo-comment')) {
                          (document.getElementById('dpo-comment') as HTMLTextAreaElement).value = '';
                        }
                      }}
                    >
                      Request Reassessment
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full text-red-700 hover:text-red-800 hover:bg-red-50 border-red-200"
                      onClick={() => {
                        const comment = (document.getElementById('dpo-comment') as HTMLTextAreaElement)?.value;
                        if (!comment || comment.trim() === '') {
                           setError('A comment is required to reject');
                           return;
                        }
                        handleReviewSubmit('rejected', comment);
                        if (document.getElementById('dpo-comment')) {
                          (document.getElementById('dpo-comment') as HTMLTextAreaElement).value = '';
                        }
                      }}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              </RoleGuard>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Metadata</CardTitle></CardHeader>
            <CardContent className="text-sm space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Status:</span>
                <span className="font-medium capitalize bg-slate-100 px-2 py-0.5 rounded text-slate-800">{assessment.status.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Created:</span>
                <span className="font-medium">{new Date(assessment.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Last Updated:</span>
                <span className="font-medium">{new Date(assessment.updatedAt).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>DPO Governance Summary</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Current Review Status:</span>
                <span className={`font-medium capitalize px-2 py-0.5 rounded ${assessment.dpoReviewStatus === 'approved' ? 'bg-green-100 text-green-800' : assessment.dpoReviewStatus === 'rejected' ? 'bg-red-100 text-red-800' : assessment.dpoReviewStatus === 'reassessed' ? 'bg-orange-100 text-orange-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {assessment.dpoReviewStatus || 'pending'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Review Date:</span>
                <span className="font-medium">{assessment.dpoReviewedAt ? new Date(assessment.dpoReviewedAt).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Current Risk Level:</span>
                <span className="font-medium capitalize">{assessment.calculatedRiskLevel || 'Not Scored'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Current Risk Score:</span>
                <span className="font-medium">{assessment.calculatedRiskScore ?? 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">AI Report Status:</span>
                <span className="font-medium">{assessment.aiReportGeneratedAt ? (isReportStale ? 'Stale' : 'Fresh') : 'Not Generated'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Assessment Version:</span>
                <span className="font-medium">v{assessment.version || 1}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="md:col-span-3">
          <Card>
            <CardHeader><CardTitle>Risk Findings & Recommendations</CardTitle></CardHeader>
            <CardContent>
              {assessment.riskFindings && assessment.riskFindings.length > 0 ? (
                <div className="space-y-6">
                  {assessment.riskFindings.map((finding, idx) => (
                    <div key={idx} className="border border-slate-200 rounded-lg overflow-hidden">
                      <div className={`px-4 py-3 border-b flex justify-between items-center ${getRiskColor(finding.severity)}`}>
                        <div className="font-medium">{finding.title}</div>
                        <div className="text-xs font-bold uppercase tracking-wider bg-white/50 px-2 py-1 rounded">
                          {finding.severity}
                        </div>
                      </div>
                      <div className="p-4 bg-white space-y-4 text-sm">
                        <div>
                          <div className="text-slate-500 font-medium mb-1">Reason:</div>
                          <div className="text-slate-900">{finding.reason}</div>
                        </div>
                        <div>
                          <div className="text-slate-500 font-medium mb-1">Recommendation:</div>
                          <div className="text-slate-900">{finding.recommendation}</div>
                        </div>
                        <RoleGuard allowedRoles={['admin', 'dpo', 'privacy_manager', 'compliance_officer']}>
                          <div className="flex justify-end mt-2 border-t pt-2">
                            <Button size="sm" variant="outline" onClick={() => setCreateRemediationSource({ type: 'risk_finding', ref: finding.title, title: `Address: ${finding.title}` })}>
                              Create Remediation
                            </Button>
                          </div>
                        </RoleGuard>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-slate-500 text-center py-8">
                  No significant risk findings identified by the rule engine.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-3">
          <RemediationActions 
            refreshTrigger={remediationsRefreshKey}
            assessment={assessment} 
            refreshAuditLogs={() => {
              assessmentService.getAuditLogs(id!).then(res => setAuditLogs(res.data || []));
            }} 
          />
        </div>

        <div className="md:col-span-3">
          <Card>
            <CardHeader><CardTitle>Governance Timeline</CardTitle></CardHeader>
            <CardContent>
              {auditLogs.length > 0 ? (
                <div className="space-y-4">
                  {auditLogs.map((log) => (
                    <div key={log._id} className="flex items-start text-sm border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                      <div className="min-w-[150px] text-slate-500">
                        {new Date(log.createdAt).toLocaleString()}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-slate-800 uppercase tracking-wider text-xs">
                          {log.action.replace(/_/g, ' ')}
                        </div>
                        <div className="text-slate-600 mt-1">
                          By: {log.actorId.name} ({log.actorRole})
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-slate-500 text-center py-4">No timeline events found.</div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-3">
          <Card>
            <CardHeader><CardTitle>Version History</CardTitle></CardHeader>
            <CardContent>
              {versions.length > 0 ? (
                <div className="space-y-4">
                  {versions.map((ver) => (
                    <div key={ver._id} className="border border-slate-200 rounded-lg overflow-hidden text-sm">
                      <div className="px-4 py-3 border-b bg-slate-50 flex justify-between items-center">
                        <div>
                          <span className="font-semibold text-slate-800 mr-2">Version {ver.versionNumber}</span>
                          <span className="text-slate-500 text-xs">{new Date(ver.createdAt).toLocaleString()}</span>
                        </div>
                        <div className="text-slate-600 text-xs">By {ver.changedBy.name} ({ver.changedBy.role})</div>
                      </div>
                      <div className="p-4 bg-white grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <span className="text-slate-500 block mb-1">Risk Score</span>
                          <span className="font-medium">{ver.calculatedRiskScore ?? 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block mb-1">Risk Level</span>
                          <span className="font-medium capitalize">{ver.calculatedRiskLevel || 'Not Scored'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-slate-500 text-center py-4">No version history found.</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {createRemediationSource && (
        <CreateRemediationModal
          assessmentId={assessment._id}
          initialSourceType={createRemediationSource.type}
          initialSourceReference={createRemediationSource.ref}
          initialTitle={createRemediationSource.title}
          onClose={() => setCreateRemediationSource(null)}
          onSuccess={() => {
            setCreateRemediationSource(null);
            setRemediationsRefreshKey(prev => prev + 1);
            assessmentService.getAuditLogs(id!).then(res => setAuditLogs(res.data || []));
          }}
        />
      )}
    </div>
  );
}
