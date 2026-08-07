import { FileText } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { EmptyState } from '../components/ui/EmptyState';

export function Reports() {
  return (
    <div>
      <PageHeader 
        title="Reports" 
        description="Generate and review privacy and compliance reports."
      />
      <EmptyState 
        icon={FileText} 
        title="Reporting module" 
        description="Generate executive summaries, DPDP compliance reports, and audit logs here."
      />
    </div>
  );
}
