import React, { useState, useEffect } from 'react';
import { Wrench } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { EmptyState } from '../components/ui/EmptyState';
import { Card, CardContent } from '../components/ui/Card';
import { remediationService } from '../services/remediationService';
import { Remediation as IRemediation } from '../types/remediation';
import { Button } from '../components/ui/Button';
import { RemediationDetailModal } from '../components/assessment/RemediationDetailModal';
import { Link } from 'react-router-dom';

export function Remediation() {
  const [remediations, setRemediations] = useState<IRemediation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRemediation, setSelectedRemediation] = useState<IRemediation | null>(null);

  useEffect(() => {
    fetchRemediations();
  }, []);

  const fetchRemediations = async () => {
    try {
      setLoading(true);
      const res = await remediationService.getRemediations();
      setRemediations(res.data);
    } catch (err) {
      console.error('Failed to load remediations', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    fetchRemediations();
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

  const isOverdue = (remediation: IRemediation) => {
    if (!remediation.dueDate) return false;
    if (['COMPLETED', 'DPO_VERIFIED', 'CLOSED'].includes(remediation.status)) return false;
    return new Date(remediation.dueDate) < new Date();
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <PageHeader 
        title="Remediation Tracker" 
        description="Track compliance gaps and remediation actions across your organization."
      />
      
      {loading ? (
        <div className="p-8 text-center text-slate-500">Loading tasks...</div>
      ) : remediations.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {remediations.map(remediation => (
            <Card key={remediation._id}>
              <CardContent className="p-4 flex flex-col md:flex-row md:items-start justify-between gap-4">
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
                  <div className="text-xs text-slate-500 flex flex-col sm:flex-row sm:gap-4 items-start sm:items-center">
                    <span><strong>Source:</strong> {remediation.sourceType.replace('_', ' ')}</span>
                    {remediation.assignedTo && <span><strong>Assignee:</strong> {remediation.assignedTo.name}</span>}
                    {remediation.dueDate && <span><strong>Due:</strong> {new Date(remediation.dueDate).toLocaleDateString()}</span>}
                    <span><strong>Assessment:</strong> <Link to={`/assessments/${remediation.assessmentId}`} className="text-indigo-600 hover:underline">View</Link></span>
                  </div>
                </div>
                <div>
                  <Button variant="outline" size="sm" onClick={() => setSelectedRemediation(remediation)}>
                    View / Update
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState 
          icon={Wrench} 
          title="No remediation tasks" 
          description="Remediation tasks assigned by the AI copilot or created manually will be tracked here."
        />
      )}

      {selectedRemediation && (
        <RemediationDetailModal 
          remediation={selectedRemediation}
          onClose={() => setSelectedRemediation(null)}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}
