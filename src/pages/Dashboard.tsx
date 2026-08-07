import { Activity, ShieldAlert, CheckCircle, Clock } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { RoleGuard } from '../components/RoleGuard';

export function Dashboard() {
  return (
    <div>
      <PageHeader 
        title="Privacy Command Center" 
        description="Monitor privacy posture, assessment progress, risks and remediation across your organization."
        action={
          <RoleGuard allowedRoles={['admin', 'dpo', 'privacy_manager', 'compliance_officer', 'analyst']}>
            <Button>Start Assessment</Button>
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
            <div className="text-2xl font-bold text-slate-900">78/100</div>
            <p className="text-xs text-emerald-600 font-medium mt-1">+4% from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Active Risks</CardTitle>
            <ShieldAlert className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">12</div>
            <p className="text-xs text-slate-500 mt-1">3 Critical, 4 High</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Pending Assessments</CardTitle>
            <Clock className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">5</div>
            <p className="text-xs text-slate-500 mt-1">Requires DPO review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Remediation Tasks</CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">24</div>
            <p className="text-xs text-slate-500 mt-1">8 completed this week</p>
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
              {[
                { name: 'Customer Portal Data Flow', status: 'IN_REVIEW', risk: 'HIGH' },
                { name: 'HR Payroll Integration', status: 'COMPLETED', risk: 'LOW' },
                { name: 'Marketing Analytics Pipeline', status: 'DRAFT', risk: 'MEDIUM' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between border-b border-slate-100 pb-4 last:pb-0 last:border-0">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-slate-900">{item.name}</p>
                    <p className="text-xs text-slate-500">Updated 2 days ago</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={item.risk === 'HIGH' ? 'danger' : item.risk === 'MEDIUM' ? 'warning' : 'success'}>
                      {item.risk} RISK
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>AI Privacy Insights</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="rounded-md bg-slate-50 p-4 border border-slate-100">
               <p className="text-sm text-slate-600">
                 <strong>Insight:</strong> The recent "Marketing Analytics Pipeline" assessment indicates a potential compliance gap regarding cross-border data transfer without explicit standard contractual clauses.
               </p>
               <Button variant="outline" size="sm" className="mt-3 w-full">View Recommendation</Button>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
