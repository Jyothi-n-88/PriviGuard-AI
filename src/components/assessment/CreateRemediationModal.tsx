import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '../ui/Button';
import { RemediationSourceType, RemediationPriority } from '../../types/remediation';
import { remediationService } from '../../services/remediationService';
import { organizationService } from '../../services/organizationService';

interface Props {
  assessmentId: string;
  initialSourceType?: RemediationSourceType;
  initialSourceReference?: string;
  initialTitle?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateRemediationModal({ assessmentId, initialSourceType = 'other', initialSourceReference = '', initialTitle = '', onClose, onSuccess }: Props) {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState('');
  const [sourceType, setSourceType] = useState<RemediationSourceType>(initialSourceType);
  const [sourceReference, setSourceReference] = useState(initialSourceReference);
  const [priority, setPriority] = useState<RemediationPriority>('medium');
  const [assignedTo, setAssignedTo] = useState('');
  const [dueDate, setDueDate] = useState('');
  
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    organizationService.getMyOrganizationMembers()
      .then(res => setMembers(res.data))
      .catch(err => console.error('Failed to load members', err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) {
      setError('Title and description are required.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await remediationService.createRemediation(assessmentId, {
        title,
        description,
        sourceType,
        sourceReference,
        priority,
        assignedTo: assignedTo || undefined,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create remediation');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold text-slate-800">Create Remediation</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && <div className="p-3 bg-red-50 text-red-700 rounded text-sm">{error}</div>}
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
            <input 
              type="text" 
              className="w-full rounded-md border border-slate-300 p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description *</label>
            <textarea 
              className="w-full rounded-md border border-slate-300 p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Source Type</label>
              <select 
                className="w-full rounded-md border border-slate-300 p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                value={sourceType}
                onChange={e => setSourceType(e.target.value as RemediationSourceType)}
              >
                <option value="other">Other</option>
                <option value="risk_finding">Risk Finding</option>
                <option value="ai_compliance_gap">AI Compliance Gap</option>
                <option value="dpo_recommendation">DPO Recommendation</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Source Reference</label>
              <input 
                type="text" 
                className="w-full rounded-md border border-slate-300 p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                value={sourceReference}
                onChange={e => setSourceReference(e.target.value)}
                placeholder="e.g. Risk ID or title"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
              <select 
                className="w-full rounded-md border border-slate-300 p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                value={priority}
                onChange={e => setPriority(e.target.value as RemediationPriority)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Assign To</label>
              <select 
                className="w-full rounded-md border border-slate-300 p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                value={assignedTo}
                onChange={e => setAssignedTo(e.target.value)}
              >
                <option value="">Unassigned</option>
                {members.map(m => (
                  <option key={m._id} value={m._id}>{m.name} ({m.email})</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
            <input 
              type="date" 
              className="w-full rounded-md border border-slate-300 p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
            />
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t mt-6">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
