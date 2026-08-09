import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, CheckCircle, Clock, AlertTriangle, FileText, CheckSquare, Activity, Cpu } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { RoleGuard } from '../components/RoleGuard';
import { dashboardService, DashboardSummary, DashboardActivity } from '../services/dashboardService';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

export function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [activity, setActivity] = useState<DashboardActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const [overviewRes, activityRes] = await Promise.all([
        dashboardService.getOverview(),
        dashboardService.getActivity()
      ]);
      setData(overviewRes.data);
      setActivity(activityRes.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Unable to load governance dashboard. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getRiskBadgeVariant = (level?: string) => {
    switch (level?.toLowerCase()) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high':
      case 'critical': return 'danger';
      default: return 'default';
    }
  };
  
  const getReviewBadgeVariant = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'approved': return 'success';
      case 'rejected': return 'danger';
      case 'reassessed': return 'warning';
      case 'pending': return 'default';
      default: return 'default';
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading governance dashboard...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>;
  }

  if (!data) {
    return <div className="p-8 text-center text-slate-500">No privacy activity yet.</div>;
  }

  const { overview, riskDistribution, remediation, aiGovernance, topRiskAssessments } = data;

  const riskChartData = [
    { name: 'Critical', value: riskDistribution.critical, color: '#ef4444' }, // red-500
    { name: 'High', value: riskDistribution.high, color: '#f97316' },     // orange-500
    { name: 'Medium', value: riskDistribution.medium, color: '#eab308' },   // yellow-500
    { name: 'Low', value: riskDistribution.low, color: '#22c55e' },      // green-500
  ].filter(d => d.value > 0);

  const remediationChartData = [
    { name: 'Open', value: remediation.open, fill: '#cbd5e1' }, // slate-300
    { name: 'In Progress', value: remediation.inProgress, fill: '#3b82f6' }, // blue-500
    { name: 'Completed', value: remediation.completed, fill: '#6366f1' }, // indigo-500
    { name: 'DPO Verified', value: remediation.dpoVerified, fill: '#10b981' }, // emerald-500
    { name: 'Closed', value: remediation.closed, fill: '#64748b' }, // slate-500
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Governance Dashboard" 
        description="Organization-wide privacy posture, compliance monitoring, and risk management."
        action={
          <RoleGuard allowedRoles={['admin', 'dpo', 'privacy_manager', 'compliance_officer', 'analyst']}>
            <Button onClick={() => navigate('/assessments/new')}>New Assessment</Button>
          </RoleGuard>
        }
      />

      {/* OVERVIEW METRICS */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Assessments</CardTitle>
            <FileText className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{overview.totalAssessments}</div>
            <p className="text-xs text-slate-500 mt-1">Across organization</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">High & Critical Risk</CardTitle>
            <ShieldAlert className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{overview.criticalRiskAssessments + overview.highRiskAssessments}</div>
            <p className="text-xs text-slate-500 mt-1">Require immediate attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Pending DPO Reviews</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{overview.pendingDpoReviews}</div>
            <p className="text-xs text-slate-500 mt-1">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Overdue Remediations</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{remediation.overdue}</div>
            <p className="text-xs text-slate-500 mt-1">Past due date</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        
        {/* RISK DISTRIBUTION */}
        <Card className="col-span-1 md:col-span-2 lg:col-span-2 flex flex-col">
          <CardHeader>
            <CardTitle>Risk Distribution</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col items-center justify-center min-h-[200px]">
            {riskChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={riskChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {riskChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-sm text-slate-500 flex flex-col items-center">
                <ShieldAlert className="h-8 w-8 text-slate-300 mb-2" />
                No scored risks found
              </div>
            )}
            {riskChartData.length > 0 && (
              <div className="flex flex-wrap justify-center gap-3 mt-2 text-xs">
                {riskChartData.map(d => (
                  <div key={d.name} className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }}></div>
                    <span className="text-slate-600">{d.name} ({d.value})</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* REMEDIATION STATUS */}
        <Card className="col-span-1 md:col-span-2 lg:col-span-3 flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Remediation Pipeline</CardTitle>
            <div className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">Total: {remediation.total}</div>
          </CardHeader>
          <CardContent className="flex-1 min-h-[200px]">
             {remediation.total > 0 ? (
               <ResponsiveContainer width="100%" height={240}>
                 <BarChart data={remediationChartData} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} />
                   <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                   <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                   <Tooltip cursor={{ fill: 'transparent' }} />
                   <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={50} />
                 </BarChart>
               </ResponsiveContainer>
             ) : (
              <div className="h-full flex flex-col items-center justify-center text-sm text-slate-500">
                <CheckSquare className="h-8 w-8 text-slate-300 mb-2" />
                No remediation tasks
              </div>
             )}
          </CardContent>
        </Card>

        {/* AI & GOVERNANCE */}
        <Card className="col-span-1 md:col-span-2 lg:col-span-2">
          <CardHeader>
            <CardTitle>AI & DPO Governance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-slate-50 border border-slate-100 rounded-lg p-3">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1"><Cpu className="w-3 h-3"/> AI Reports</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="block text-slate-500 text-xs">Fresh</span>
                  <span className="font-semibold text-emerald-600">{aiGovernance.freshReports}</span>
                </div>
                <div>
                  <span className="block text-slate-500 text-xs">Stale</span>
                  <span className="font-semibold text-amber-600">{aiGovernance.staleReports}</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-lg p-3">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1"><CheckCircle className="w-3 h-3"/> DPO Reviews</h4>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <span className="block text-slate-500 text-xs">Pending</span>
                  <span className="font-semibold text-slate-700">{overview.pendingDpoReviews}</span>
                </div>
                <div>
                  <span className="block text-slate-500 text-xs">Approved</span>
                  <span className="font-semibold text-emerald-600">{overview.approvedAssessments}</span>
                </div>
                <div>
                  <span className="block text-slate-500 text-xs">Rejected</span>
                  <span className="font-semibold text-red-600">{overview.rejectedAssessments}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        {/* TOP RISK ASSESSMENTS */}
        <Card>
          <CardHeader>
            <CardTitle>Highest Risk Assessments</CardTitle>
          </CardHeader>
          <CardContent>
            {topRiskAssessments.length > 0 ? (
              <div className="space-y-3">
                {topRiskAssessments.map(a => (
                  <div key={a._id} className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-lg border border-transparent hover:border-slate-100 transition-colors cursor-pointer" onClick={() => navigate(`/assessments/${a._id}`)}>
                    <div className="truncate pr-4 flex-1">
                      <div className="font-medium text-slate-900 truncate">{a.title}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                        <Badge variant={getReviewBadgeVariant(a.dpoReviewStatus)} className="text-[9px] px-1.5 py-0">
                          {a.dpoReviewStatus || 'pending'}
                        </Badge>
                        <span>Updated {new Date(a.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex-shrink-0 flex items-center gap-2">
                      <div className="text-right">
                        <div className="font-bold text-slate-900">{a.calculatedRiskScore} <span className="text-xs text-slate-500 font-normal">pts</span></div>
                      </div>
                      <Badge variant={getRiskBadgeVariant(a.calculatedRiskLevel)}>
                        {a.calculatedRiskLevel?.toUpperCase() || 'UNKNOWN'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-sm text-slate-500">No scored assessments found.</div>
            )}
          </CardContent>
        </Card>

        {/* RECENT ACTIVITY */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Governance Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {activity.length > 0 ? (
              <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent pl-6 md:pl-0">
                {activity.map((event, idx) => (
                  <div key={event._id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-5 h-5 rounded-full border-2 border-white bg-blue-100 text-blue-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 absolute -left-6 md:left-1/2 md:transform z-10"></div>
                    <div className="w-full md:w-[calc(50%-1.5rem)] bg-white p-3 rounded border border-slate-100 shadow-sm text-sm">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-slate-800 capitalize text-xs">
                          {event.action.replace(/_/g, ' ')}
                        </span>
                        <time className="text-[10px] text-slate-400 font-medium">
                          {new Date(event.createdAt).toLocaleDateString()}
                        </time>
                      </div>
                      {event.assessmentId && (
                        <div className="text-slate-600 text-xs mb-1 truncate">
                          <span className="font-medium text-slate-500">Target:</span> {event.assessmentId.title}
                        </div>
                      )}
                      <div className="text-slate-500 text-[10px]">
                        By {event.actorId?.name || 'Unknown'} ({event.actorRole})
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-sm text-slate-500">No recent activity.</div>
            )}
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
