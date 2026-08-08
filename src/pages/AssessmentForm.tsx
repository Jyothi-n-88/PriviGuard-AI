import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Button } from '../components/ui/Button';
import { Alert, AlertDescription } from '../components/ui/Alert';
import { assessmentService } from '../services/assessmentService';

export function AssessmentForm() {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    processingActivity: '',
    purpose: '',
    status: 'draft',
    description: '',
    dataSource: '',
    storageLocation: '',
    retentionPeriod: '',
    dataSharing: '',
    securityMeasures: ''
  });

  useEffect(() => {
    if (isEditing) {
      fetchAssessment();
    }
  }, [id]);

  const fetchAssessment = async () => {
    try {
      const res = await assessmentService.getAssessment(id!);
      const data = res.data;
      setFormData({
        title: data.title || '',
        processingActivity: data.processingActivity || '',
        purpose: data.purpose || '',
        status: data.status || 'draft',
        description: data.description || '',
        dataSource: data.dataSource || '',
        storageLocation: data.storageLocation || '',
        retentionPeriod: data.retentionPeriod || '',
        dataSharing: data.dataSharing || '',
        securityMeasures: data.securityMeasures || ''
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load assessment');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    
    try {
      if (isEditing) {
        await assessmentService.updateAssessment(id!, formData);
      } else {
        await assessmentService.createAssessment(formData);
      }
      navigate('/assessments');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save assessment');
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => navigate('/assessments')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <PageHeader 
          title={isEditing ? 'Edit Privacy Assessment' : 'New Privacy Assessment'} 
          description="Complete the form below to document a processing activity."
        />
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Assessment Title *</Label>
                <Input id="title" name="title" value={formData.title} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <select 
                  id="status" name="status" value={formData.status} onChange={handleChange} required
                  className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                >
                  <option value="draft">Draft</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea 
                id="description" name="description" value={formData.description} onChange={handleChange}
                className="flex w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 min-h-[100px]"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Processing Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="processingActivity">Processing Activity *</Label>
              <Input id="processingActivity" name="processingActivity" value={formData.processingActivity} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="purpose">Purpose of Processing *</Label>
              <Input id="purpose" name="purpose" value={formData.purpose} onChange={handleChange} required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dataSource">Data Source</Label>
                <Input id="dataSource" name="dataSource" value={formData.dataSource} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="storageLocation">Storage Location</Label>
                <Input id="storageLocation" name="storageLocation" value={formData.storageLocation} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="retentionPeriod">Retention Period</Label>
                <Input id="retentionPeriod" name="retentionPeriod" value={formData.retentionPeriod} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dataSharing">Data Sharing (Internal/External)</Label>
                <Input id="dataSharing" name="dataSharing" value={formData.dataSharing} onChange={handleChange} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Security Assessment</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="securityMeasures">Security Measures</Label>
              <textarea 
                id="securityMeasures" name="securityMeasures" value={formData.securityMeasures} onChange={handleChange}
                className="flex w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 min-h-[80px]"
                placeholder="Describe existing security controls (e.g. encryption, access control, MFA)"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate('/assessments')} disabled={saving}>Cancel</Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving...' : (isEditing ? 'Update Assessment' : 'Create Assessment')}
          </Button>
        </div>
      </form>
    </div>
  );
}
