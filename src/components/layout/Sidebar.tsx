import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShieldCheck, 
  AlertTriangle, 
  Network, 
  Wrench, 
  FileText, 
  Building2, 
  ActivitySquare, 
  Settings,
  X,
  Shield
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types/auth';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

type NavItem = {
  name: string;
  href: string;
  icon: any;
  allowedRoles?: UserRole[];
};

const mainNavItems: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Privacy Assessments', href: '/assessments', icon: ShieldCheck },
  { name: 'Risk Center', href: '/risk-center', icon: AlertTriangle },
  { name: 'Data Flows', href: '/data-flows', icon: Network, allowedRoles: ['admin', 'dpo', 'privacy_manager', 'compliance_officer', 'analyst'] },
  { name: 'Remediation', href: '/remediation', icon: Wrench, allowedRoles: ['admin', 'dpo', 'privacy_manager', 'compliance_officer', 'analyst'] },
  { name: 'Reports', href: '/reports', icon: FileText },
];

const managementNavItems: NavItem[] = [
  { name: 'Organizations', href: '/organizations', icon: Building2, allowedRoles: ['admin'] },
  { name: 'Processing Activities', href: '/processing-activities', icon: ActivitySquare, allowedRoles: ['admin', 'dpo', 'privacy_manager', 'compliance_officer', 'analyst'] },
];

const systemNavItems: NavItem[] = [
  { name: 'Settings', href: '/settings', icon: Settings, allowedRoles: ['admin'] },
];

export default function Sidebar({ sidebarOpen, setSidebarOpen }: SidebarProps) {
  const { user } = useAuth();
  
  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    cn(
      "group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
      isActive
        ? "bg-slate-800 text-white"
        : "text-slate-300 hover:bg-slate-800 hover:text-white"
    );

  const filterNavItems = (items: NavItem[]) => {
    return items.filter(item => {
      if (!item.allowedRoles) return true;
      if (!user?.role) return false;
      return item.allowedRoles.includes(user.role);
    });
  };

  const filteredMain = filterNavItems(mainNavItems);
  const filteredManagement = filterNavItems(managementNavItems);
  const filteredSystem = filterNavItems(systemNavItems);

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/80 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 flex-col bg-slate-950 transition-transform duration-300 ease-in-out lg:static lg:flex lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 shrink-0 items-center justify-between px-6 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2 text-white">
            <Shield className="h-6 w-6 text-blue-500" />
            <span className="text-lg font-bold tracking-tight">PriviGuard AI</span>
          </div>
          <button
            type="button"
            className="lg:hidden text-slate-400 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <span className="sr-only">Close sidebar</span>
            <X className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {filteredMain.length > 0 && (
            <div>
              <div className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Main</div>
              <div className="space-y-1">
                {filteredMain.map((item) => (
                  <NavLink key={item.name} to={item.href} className={navLinkClasses} onClick={() => setSidebarOpen(false)}>
                    <item.icon className="mr-3 h-5 w-5 shrink-0" aria-hidden="true" />
                    {item.name}
                  </NavLink>
                ))}
              </div>
            </div>
          )}

          {filteredManagement.length > 0 && (
            <div>
              <div className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Management</div>
              <div className="space-y-1">
                {filteredManagement.map((item) => (
                  <NavLink key={item.name} to={item.href} className={navLinkClasses} onClick={() => setSidebarOpen(false)}>
                    <item.icon className="mr-3 h-5 w-5 shrink-0" aria-hidden="true" />
                    {item.name}
                  </NavLink>
                ))}
              </div>
            </div>
          )}

          {filteredSystem.length > 0 && (
            <div>
              <div className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">System</div>
              <div className="space-y-1">
                {filteredSystem.map((item) => (
                  <NavLink key={item.name} to={item.href} className={navLinkClasses} onClick={() => setSidebarOpen(false)}>
                    <item.icon className="mr-3 h-5 w-5 shrink-0" aria-hidden="true" />
                    {item.name}
                  </NavLink>
                ))}
              </div>
            </div>
          )}
        </nav>
      </div>
    </>
  );
}
