import { AlertTriangle } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { EmptyState } from '../components/ui/EmptyState';

export function RiskCenter() {
  return (
    <div>
      <PageHeader 
        title="Risk Center" 
        description="Monitor privacy risks and prioritize high-risk processing activities."
      />
      <EmptyState 
        icon={AlertTriangle} 
        title="Risk engine initializing" 
        description="The AI-powered risk scoring engine will analyze your privacy assessments and highlight vulnerabilities here."
      />
    </div>
  );
}
