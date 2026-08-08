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

export function AssessmentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    fetchAssessment();
  }, [id]);

  const fetchAssessment = async () => {
    try {
      const res = await assessmentService.getAssessment(id!);
      setAssessment(res.data);
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
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to recalculate risk');
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
            <CardHeader><CardTitle>Security & Risk Mitigation</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-slate-500 mb-1">Security Measures</h4>
                <p className="text-slate-900 whitespace-pre-wrap">{assessment.securityMeasures || 'None specified'}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-slate-500 mb-1">Mitigation Measures</h4>
                <p className="text-slate-900 whitespace-pre-wrap">{assessment.mitigationMeasures || 'None specified'}</p>
              </div>
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
      </div>
    </div>
  );
}
