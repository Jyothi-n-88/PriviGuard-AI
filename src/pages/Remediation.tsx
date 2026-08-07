import { Wrench } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { EmptyState } from '../components/ui/EmptyState';

export function Remediation() {
  return (
    <div>
      <PageHeader 
        title="Remediation" 
        description="Track compliance gaps and remediation actions."
      />
      <EmptyState 
        icon={Wrench} 
        title="No pending tasks" 
        description="Remediation tasks assigned by the AI copilot or created manually will be tracked here."
      />
    </div>
  );
}
