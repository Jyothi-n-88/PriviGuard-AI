import { Building2 } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { EmptyState } from '../components/ui/EmptyState';

export function Organizations() {
  return (
    <div>
      <PageHeader 
        title="Organizations" 
        description="Manage organizations and their privacy environments."
      />
      <EmptyState 
        icon={Building2} 
        title="Organization management" 
        description="Configure your primary organization and subsidiary entities here."
      />
    </div>
  );
}
