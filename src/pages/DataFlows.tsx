import { Network } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { EmptyState } from '../components/ui/EmptyState';

export function DataFlows() {
  return (
    <div>
      <PageHeader 
        title="Data Flows" 
        description="Visualize how personal data moves across systems, departments and third parties."
      />
      <EmptyState 
        icon={Network} 
        title="Data flow mapping" 
        description="Create dynamic data flow diagrams to visualize personal data lifecycles across your infrastructure."
      />
    </div>
  );
}
