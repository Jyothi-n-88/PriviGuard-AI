import React, { useEffect, useState } from 'react';
import { Building2, Save } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Button } from '../components/ui/Button';
import { Alert, AlertDescription } from '../components/ui/Alert';
import { organizationService } from '../services/organizationService';
import { Organization } from '../types/organization';

export function OrganizationSettings() {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    industry: '',
    size: '',
    country: '',
    contactEmail: ''
  });

  useEffect(() => {
    const fetchOrg = async () => {
      try {
        const res = await organizationService.getMyOrganization();
        setOrganization(res.data);
        setFormData({
          name: res.data.name || '',
          description: res.data.description || '',
          industry: res.data.industry || '',
          size: res.data.size || '',
          country: res.data.country || '',
          contactEmail: res.data.contactEmail || ''
        });
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load organization settings');
      } finally {
        setLoading(false);
      }
    };
    fetchOrg();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);
    
    try {
      const res = await organizationService.updateMyOrganization(formData);
      setOrganization(res.data);
      setSuccess('Organization updated successfully.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update organization');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8">Loading organization settings...</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Organization Settings" 
        description="Manage your organization's profile and configuration."
      />

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-50 text-green-800 border-green-200">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary-500" />
                Organization Details
              </CardTitle>
              <CardDescription>
                Basic information about your organization.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm">
                <div>
                  <span className="text-slate-500 block">Organization ID</span>
                  <span className="font-mono bg-slate-100 px-2 py-1 rounded">{organization?._id}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Slug</span>
                  <span className="font-mono">{organization?.slug}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Status</span>
                  <span className={`capitalize font-medium ${organization?.status === 'active' ? 'text-green-600' : 'text-slate-600'}`}>
                    {organization?.status}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-1 md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Update your organizational profile.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Organization Name *</Label>
                    <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Contact Email</Label>
                    <Input id="contactEmail" type="email" name="contactEmail" value={formData.contactEmail} onChange={handleChange} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input id="description" name="description" value={formData.description} onChange={handleChange} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry</Label>
                    <Input id="industry" name="industry" value={formData.industry} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="size">Size</Label>
                    <select 
                      id="size" 
                      name="size" 
                      value={formData.size} 
                      onChange={handleChange}
                      className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">Select size...</option>
                      <option value="startup">Startup (1-10)</option>
                      <option value="small">Small (11-50)</option>
                      <option value="medium">Medium (51-200)</option>
                      <option value="large">Large (201-1000)</option>
                      <option value="enterprise">Enterprise (1000+)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input id="country" name="country" value={formData.country} onChange={handleChange} />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button type="submit" disabled={saving}>
                    {saving && <Save className="w-4 h-4 mr-2 animate-pulse" />}
                    {!saving && <Save className="w-4 h-4 mr-2" />}
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
