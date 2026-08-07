import { ActivitySquare } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { EmptyState } from '../components/ui/EmptyState';

export function ProcessingActivities() {
  return (
    <div>
      <PageHeader 
        title="Processing Activities" 
        description="Maintain an inventory of organizational data-processing activities."
      />
      <EmptyState 
        icon={ActivitySquare} 
        title="Activity Inventory (RoPA)" 
        description="Keep a centralized record of processing activities for compliance tracking."
      />
    </div>
  );
}
