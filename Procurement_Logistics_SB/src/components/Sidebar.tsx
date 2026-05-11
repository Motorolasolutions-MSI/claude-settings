import { LayoutDashboard, Plus, ClipboardList, BarChart3, Settings, ChevronRight } from 'lucide-react';
import { cn } from '../utils/helpers';

type Page = 'dashboard' | 'intake' | 'projects' | 'analytics';

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  projectCount: number;
  pendingCount: number;
}

const NAV_ITEMS: { id: Page; label: string; icon: React.ElementType; description: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, description: 'Overview & KPIs' },
  { id: 'projects', label: 'All Projects', icon: ClipboardList, description: 'View & manage projects' },
  { id: 'intake', label: 'New Request', icon: Plus, description: 'Submit a new project' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, description: 'Reports & insights' },
];

export function Sidebar({ currentPage, onNavigate, projectCount, pendingCount }: SidebarProps) {
  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col h-screen fixed left-0 top-0 z-40">
      <div className="px-6 py-5 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-violet-600 rounded-lg flex items-center justify-center">
            <Settings className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white leading-tight">Procurement</h1>
            <p className="text-xs text-slate-400 leading-tight">Tollgates</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all group',
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white',
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.label}</p>
                <p className={cn('text-xs truncate', isActive ? 'text-blue-200' : 'text-slate-500 group-hover:text-slate-400')}>
                  {item.description}
                </p>
              </div>
              {item.id === 'projects' && projectCount > 0 && (
                <span className={cn('text-xs px-1.5 py-0.5 rounded-full font-medium', isActive ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-300')}>
                  {projectCount}
                </span>
              )}
              {item.id === 'dashboard' && pendingCount > 0 && (
                <span className="text-xs px-1.5 py-0.5 rounded-full font-medium bg-amber-500 text-white">
                  {pendingCount}
                </span>
              )}
              {!isActive && <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-slate-400" />}
            </button>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-slate-700">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center text-xs font-bold text-white">
            SM
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-white truncate">Sarah Mitchell</p>
            <p className="text-xs text-slate-400 truncate">Procurement Director</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
