import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, ShieldAlert, CheckCircle, Clock } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { RoleGuard } from '../components/RoleGuard';
import { dashboardService, DashboardSummary } from '../services/dashboardService';

export function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await dashboardService.getSummary();
      setData(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Unable to load privacy dashboard. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getRiskBadgeVariant = (level?: string) => {
    switch (level) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high':
      case 'critical': return 'danger';
      default: return 'default';
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading privacy posture...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>;
  }

  if (!data) {
    return <div className="p-8 text-center text-slate-500">No privacy activity yet.</div>;
  }

  return (
    <div>
      <PageHeader 
        title="Privacy Command Center" 
        description="Monitor privacy posture, assessment progress, risks and remediation across your organization."
        action={
          <RoleGuard allowedRoles={['admin', 'dpo', 'privacy_manager', 'compliance_officer', 'analyst']}>
            <Button onClick={() => navigate('/assessments/new')}>Start Assessment</Button>
          </RoleGuard>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Privacy Posture Score</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {data.privacyPostureScore !== null ? `${data.privacyPostureScore}/100` : '-- / 100'}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {data.privacyPostureScore !== null ? 'Calculated from assessments' : 'Complete an assessment to generate a score.'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Active Risks</CardTitle>
            <ShieldAlert className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{data.activeRisks}</div>
            <p className="text-xs text-slate-500 mt-1">
              {data.activeRisks > 0 ? 'Identified from assessments' : 'No active risks identified'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Pending Assessments</CardTitle>
            <Clock className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{data.pendingAssessments}</div>
            <p className="text-xs text-slate-500 mt-1">
              {data.pendingAssessments > 0 ? 'Requires attention' : 'All clear'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Remediation Tasks</CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{data.remediationTasks}</div>
            <p className="text-xs text-slate-500 mt-1">Not available yet</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Assessments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.recentAssessments.length > 0 ? (
                data.recentAssessments.map((item) => (
                  <div key={item._id} className="flex items-center justify-between border-b border-slate-100 pb-4 last:pb-0 last:border-0">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-slate-900">{item.title}</p>
                      <p className="text-xs text-slate-500">
                        Updated {new Date(item.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getRiskBadgeVariant(item.calculatedRiskLevel)}>
                        {item.calculatedRiskLevel ? `${item.calculatedRiskLevel.toUpperCase()} RISK` : 'NOT SCORED'}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 border rounded-lg border-dashed">
                  <p className="text-sm text-slate-500 mb-4">No assessments yet.</p>
                  <RoleGuard allowedRoles={['admin', 'dpo', 'privacy_manager', 'compliance_officer', 'analyst']}>
                    <Button variant="outline" size="sm" onClick={() => navigate('/assessments/new')}>
                      Start your first assessment
                    </Button>
                  </RoleGuard>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>AI Privacy Insights</CardTitle>
          </CardHeader>
          <CardContent>
            {data.aiInsights.length > 0 ? (
              <div className="space-y-4">
                {data.aiInsights.map((insight, idx) => (
                  <div key={idx} className="rounded-md bg-slate-50 p-4 border border-slate-100">
                    <p className="text-sm text-slate-600">
                      <strong>Insight:</strong> {insight}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-md bg-slate-50 p-4 border border-slate-100 text-center space-y-2">
                <p className="text-sm text-slate-600 font-medium">No insights available yet.</p>
                <p className="text-xs text-slate-500">Complete an assessment to generate privacy insights.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
