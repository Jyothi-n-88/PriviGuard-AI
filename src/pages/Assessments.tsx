import React, { useEffect, useState } from 'react';
import { ShieldCheck, Plus, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/ui/PageHeader';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { RoleGuard } from '../components/RoleGuard';
import { assessmentService } from '../services/assessmentService';
import { Assessment } from '../types/assessment';

export function Assessments() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      const res = await assessmentService.getAssessments();
      setAssessments(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getRiskBadge = (level?: string) => {
    switch (level) {
      case 'low': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Low</span>;
      case 'medium': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Medium</span>;
      case 'high': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">High</span>;
      case 'critical': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Critical</span>;
      default: return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">Not Scored</span>;
    }
  };

  const getStatusBadge = (status: string) => {
    const formatted = status.replace('_', ' ');
    switch (status) {
      case 'completed': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">{formatted}</span>;
      case 'archived': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 capitalize">{formatted}</span>;
      case 'in_progress': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 capitalize">{formatted}</span>;
      default: return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 capitalize">{formatted}</span>;
    }
  };

  const filtered = assessments.filter(a => 
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.processingActivity.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Privacy Assessments" 
        description="Create and manage privacy impact assessments for your organization's processing activities."
        action={
          <RoleGuard allowedRoles={['admin', 'dpo', 'privacy_manager']}>
            <Button onClick={() => navigate('/assessments/new')}>
              <Plus className="mr-2 h-4 w-4" /> New Assessment
            </Button>
          </RoleGuard>
        }
      />

      {loading ? (
        <div className="p-8 text-center text-slate-500">Loading assessments...</div>
      ) : assessments.length === 0 ? (
        <EmptyState 
          icon={ShieldCheck} 
          title="No assessments found" 
          description="Get started by creating a new Privacy Impact Assessment (PIA). AI-assisted evaluations will appear here."
          action={
            <RoleGuard allowedRoles={['admin', 'dpo', 'privacy_manager']}>
              <Button onClick={() => navigate('/assessments/new')} variant="outline">Create Assessment</Button>
            </RoleGuard>
          }
        />
      ) : (
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="relative w-full sm:max-w-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-slate-400" />
                </div>
                <Input
                  type="text"
                  placeholder="Search assessments..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-slate-500">
                <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3">Title / Activity</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Risk Level</th>
                    <th className="px-6 py-3">Updated</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length > 0 ? filtered.map((assessment) => (
                    <tr key={assessment._id} className="bg-white border-b hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{assessment.title}</div>
                        <div className="text-xs text-slate-500 mt-0.5 line-clamp-1">{assessment.processingActivity}</div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(assessment.status)}
                      </td>
                      <td className="px-6 py-4">
                        {getRiskBadge(assessment.calculatedRiskLevel)}
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {new Date(assessment.updatedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/assessments/${assessment._id}`)}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                        No assessments match your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
