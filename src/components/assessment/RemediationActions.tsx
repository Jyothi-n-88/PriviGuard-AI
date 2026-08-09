import React, { useState, useEffect } from 'react';
import { Remediation, RemediationSourceType } from '../../types/remediation';
import { remediationService } from '../../services/remediationService';
import { Assessment } from '../../types/assessment';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { RoleGuard } from '../RoleGuard';
import { Alert, AlertDescription } from '../ui/Alert';
import { CreateRemediationModal } from './CreateRemediationModal';
import { RemediationDetailModal } from './RemediationDetailModal';

interface Props {
  assessment: Assessment;
  refreshAuditLogs: () => void;
  refreshTrigger?: number;
}

export function RemediationActions({ assessment, refreshAuditLogs, refreshTrigger = 0 }: Props) {
  const [remediations, setRemediations] = useState<Remediation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRemediation, setSelectedRemediation] = useState<Remediation | null>(null);

  useEffect(() => {
    fetchRemediations();
  }, [assessment._id, refreshTrigger]);

  const fetchRemediations = async () => {
    try {
      setLoading(true);
      const res = await remediationService.getAssessmentRemediations(assessment._id);
      setRemediations(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load remediations');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    fetchRemediations();
    refreshAuditLogs();
    setShowCreateModal(false);
    setSelectedRemediation(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-slate-100 text-slate-800';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
      case 'COMPLETED': return 'bg-indigo-100 text-indigo-800';
      case 'DPO_VERIFIED': return 'bg-green-100 text-green-800';
      case 'CLOSED': return 'bg-slate-200 text-slate-600';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-700 bg-red-50 border-red-200';
      case 'high': return 'text-orange-700 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-700 bg-green-50 border-green-200';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  const isOverdue = (remediation: Remediation) => {
    if (!remediation.dueDate) return false;
    if (['COMPLETED', 'DPO_VERIFIED', 'CLOSED'].includes(remediation.status)) return false;
    return new Date(remediation.dueDate) < new Date();
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Remediation Actions</CardTitle>
          <RoleGuard allowedRoles={['admin', 'dpo', 'privacy_manager', 'compliance_officer']}>
            <Button size="sm" onClick={() => setShowCreateModal(true)}>
              Create Remediation
            </Button>
          </RoleGuard>
        </CardHeader>
        <CardContent>
          {error && <Alert variant="destructive" className="mb-4"><AlertDescription>{error}</AlertDescription></Alert>}
          
          {loading ? (
            <div className="text-center text-slate-500 py-4">Loading remediations...</div>
          ) : remediations.length > 0 ? (
            <div className="space-y-4">
              {remediations.map(remediation => (
                <div key={remediation._id} className="border border-slate-200 rounded-lg p-4 flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-slate-900">{remediation.title}</h4>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${getStatusColor(remediation.status)}`}>
                        {remediation.status.replace('_', ' ')}
                      </span>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${getPriorityColor(remediation.priority)}`}>
                        {remediation.priority}
                      </span>
                      {isOverdue(remediation) && (
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-200">
                          Overdue
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-700">{remediation.description}</p>
                    <div className="text-xs text-slate-500 flex flex-col sm:flex-row sm:gap-4">
                      <span><strong>Source:</strong> {remediation.sourceType.replace('_', ' ')}</span>
                      {remediation.assignedTo && <span><strong>Assignee:</strong> {remediation.assignedTo.name}</span>}
                      {remediation.dueDate && <span><strong>Due:</strong> {new Date(remediation.dueDate).toLocaleDateString()}</span>}
                    </div>
                  </div>
                  <div>
                    <Button variant="outline" size="sm" onClick={() => setSelectedRemediation(remediation)}>
                      View / Update
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-slate-500 py-8">
              No remediation actions created yet.
            </div>
          )}
        </CardContent>
      </Card>

      {showCreateModal && (
        <CreateRemediationModal 
          assessmentId={assessment._id}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleSuccess}
        />
      )}

      {selectedRemediation && (
        <RemediationDetailModal 
          remediation={selectedRemediation}
          onClose={() => setSelectedRemediation(null)}
          onSuccess={handleSuccess}
        />
      )}
    </>
  );
}
