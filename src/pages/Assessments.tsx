import { ShieldCheck, Plus } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { RoleGuard } from '../components/RoleGuard';

export function Assessments() {
  return (
    <div>
      <PageHeader 
        title="Privacy Assessments" 
        description="Create and manage privacy impact assessments for your organization's processing activities."
        action={
          <RoleGuard allowedRoles={['admin', 'dpo', 'privacy_manager']}>
            <Button><Plus className="mr-2 h-4 w-4" /> New Assessment</Button>
          </RoleGuard>
        }
      />
      <EmptyState 
        icon={ShieldCheck} 
        title="No assessments found" 
        description="Get started by creating a new Privacy Impact Assessment (PIA). AI-assisted evaluations will appear here."
        action={
          <RoleGuard allowedRoles={['admin', 'dpo', 'privacy_manager']}>
            <Button variant="outline">Create Assessment</Button>
          </RoleGuard>
        }
      />
    </div>
  );
}
