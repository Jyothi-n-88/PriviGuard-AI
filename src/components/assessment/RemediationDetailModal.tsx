import React, { useState } from 'react';
import { X, CheckCircle, Play, Undo2, ShieldCheck, User } from 'lucide-react';
import { Button } from '../ui/Button';
import { Remediation } from '../../types/remediation';
import { remediationService } from '../../services/remediationService';
import { RoleGuard } from '../RoleGuard';

interface Props {
  remediation: Remediation;
  onClose: () => void;
  onSuccess: () => void;
}

export function RemediationDetailModal({ remediation, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [completionNotes, setCompletionNotes] = useState(remediation.completionNotes || '');
  const [evidenceRef, setEvidenceRef] = useState(remediation.evidenceRef || '');
  const [dpoComments, setDpoComments] = useState('');
  const [actionMode, setActionMode] = useState<'none' | 'complete' | 'verify'>('none');

  const handleStatusUpdate = async (status: string, extra: any = {}) => {
    try {
      setLoading(true);
      setError('');
      await remediationService.updateRemediationStatus(remediation._id, { status: status as any, ...extra });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update status');
      setLoading(false);
    }
  };

  const handleVerify = async (action: 'verify' | 'reopen') => {
    try {
      setLoading(true);
      setError('');
      await remediationService.verifyRemediation(remediation._id, { action, comments: dpoComments });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to verify');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            Remediation Action
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded uppercase">{remediation.status.replace('_', ' ')}</span>
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {error && <div className="p-3 bg-red-50 text-red-700 rounded text-sm">{error}</div>}
          
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">{remediation.title}</h3>
            <p className="text-slate-700 text-sm">{remediation.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-lg border border-slate-100">
            <div>
              <span className="text-slate-500 block mb-1">Priority</span>
              <span className="font-medium capitalize">{remediation.priority}</span>
            </div>
            <div>
              <span className="text-slate-500 block mb-1">Due Date</span>
              <span className="font-medium">{remediation.dueDate ? new Date(remediation.dueDate).toLocaleDateString() : 'None'}</span>
            </div>
            <div>
              <span className="text-slate-500 block mb-1">Assignee</span>
              <span className="font-medium flex items-center gap-1">
                <User className="w-3 h-3" /> {remediation.assignedTo?.name || 'Unassigned'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block mb-1">Source</span>
              <span className="font-medium capitalize">{remediation.sourceType.replace('_', ' ')}</span>
              {remediation.sourceReference && <div className="text-xs text-slate-400 mt-0.5">{remediation.sourceReference}</div>}
            </div>
          </div>

          {(remediation.completionNotes || remediation.evidenceRef || remediation.completionDate) && (
            <div className="border-t pt-4 space-y-3">
              <h4 className="font-semibold text-slate-900">Completion Details</h4>
              {remediation.completionDate && (
                <div className="text-sm"><span className="text-slate-500 w-32 inline-block">Completed On:</span> {new Date(remediation.completionDate).toLocaleString()}</div>
              )}
              {remediation.completionNotes && (
                <div className="text-sm"><span className="text-slate-500 w-32 inline-block align-top">Notes:</span> <span className="inline-block flex-1">{remediation.completionNotes}</span></div>
              )}
              {remediation.evidenceRef && (
                <div className="text-sm"><span className="text-slate-500 w-32 inline-block">Evidence Ref:</span> <span className="font-mono bg-slate-100 px-1 rounded">{remediation.evidenceRef}</span></div>
              )}
            </div>
          )}

          {remediation.dpoVerifiedBy && (
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg text-sm space-y-2 mt-4">
              <div className="flex items-center gap-2 text-green-800 font-semibold mb-2">
                <ShieldCheck className="w-4 h-4" /> DPO Verification
              </div>
              <div><span className="text-green-700 w-24 inline-block">Verified By:</span> <span className="font-medium">{remediation.dpoVerifiedBy.name}</span></div>
              <div><span className="text-green-700 w-24 inline-block">Verified At:</span> <span>{remediation.dpoVerifiedAt ? new Date(remediation.dpoVerifiedAt).toLocaleString() : ''}</span></div>
            </div>
          )}

          {/* Action Areas */}
          {actionMode === 'complete' && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 space-y-4 mt-4">
              <h4 className="font-medium text-blue-900">Mark as Completed</h4>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Completion Notes</label>
                <textarea 
                  className="w-full rounded border border-slate-300 p-2 text-sm"
                  rows={2}
                  value={completionNotes}
                  onChange={e => setCompletionNotes(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Evidence Reference (Link or ID)</label>
                <input 
                  type="text"
                  className="w-full rounded border border-slate-300 p-2 text-sm"
                  value={evidenceRef}
                  onChange={e => setEvidenceRef(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button size="sm" variant="outline" onClick={() => setActionMode('none')}>Cancel</Button>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={loading} onClick={() => handleStatusUpdate('COMPLETED', { completionNotes, evidenceRef })}>
                  Submit Completion
                </Button>
              </div>
            </div>
          )}

          {actionMode === 'verify' && (
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-100 space-y-4 mt-4">
              <h4 className="font-medium text-orange-900">DPO Verification</h4>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Comments (Required if Reopening)</label>
                <textarea 
                  className="w-full rounded border border-slate-300 p-2 text-sm"
                  rows={2}
                  value={dpoComments}
                  onChange={e => setDpoComments(e.target.value)}
                  placeholder="e.g. Evidence insufficient, please provide..."
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button size="sm" variant="outline" onClick={() => setActionMode('none')}>Cancel</Button>
                <Button size="sm" variant="outline" className="text-orange-700 border-orange-200 hover:bg-orange-100" disabled={loading} onClick={() => handleVerify('reopen')}>
                  Return to In Progress
                </Button>
                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" disabled={loading} onClick={() => handleVerify('verify')}>
                  Verify & Close
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t bg-slate-50 flex flex-wrap gap-2 justify-end">
          {remediation.status === 'OPEN' && (
            <Button size="sm" variant="outline" onClick={() => handleStatusUpdate('IN_PROGRESS')} disabled={loading}>
              <Play className="w-4 h-4 mr-2" /> Start Progress
            </Button>
          )}
          
          {remediation.status === 'IN_PROGRESS' && (
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => setActionMode('complete')} disabled={loading || actionMode === 'complete'}>
              <CheckCircle className="w-4 h-4 mr-2" /> Mark Complete
            </Button>
          )}
          
          {(remediation.status === 'COMPLETED' || remediation.status === 'DPO_VERIFIED') && (
            <RoleGuard allowedRoles={['admin', 'dpo']}>
              <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => setActionMode('verify')} disabled={loading || actionMode === 'verify'}>
                <ShieldCheck className="w-4 h-4 mr-2" /> DPO Review
              </Button>
            </RoleGuard>
          )}
          
          <Button size="sm" variant="outline" onClick={onClose} disabled={loading}>Close</Button>
        </div>
      </div>
    </div>
  );
}
