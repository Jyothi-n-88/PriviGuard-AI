import { Settings as SettingsIcon } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { EmptyState } from '../components/ui/EmptyState';

export function Settings() {
  return (
    <div>
      <PageHeader 
        title="Settings" 
        description="Configure PriviGuard AI preferences and system settings."
      />
      <EmptyState 
        icon={SettingsIcon} 
        title="System configuration" 
        description="Manage your account, API keys, AI copilot preferences, and notifications."
      />
    </div>
  );
}
