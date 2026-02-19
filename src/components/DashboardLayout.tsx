import { ReactNode } from "react";
import { Button } from "./ui/button";
import { LayoutDashboard, Award, LogOut, Home, FileText, HelpCircle } from "lucide-react";

const LOGO_SRC = "/assets/ChatGPT Image Feb 19, 2026, 10_08_07 PM.png";

interface DashboardLayoutProps {
  children: ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  municipalName?: string;
}

export function DashboardLayout({ children, currentPage, onNavigate, onLogout, municipalName }: DashboardLayoutProps) {
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'departments', label: 'Departments', icon: LayoutDashboard },
    { id: 'performance', label: 'Performance', icon: Award },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'help', label: 'Help & Support', icon: HelpCircle },
  ];

  // Municipal dashboard with sidebar
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center overflow-hidden">
              <img src={LOGO_SRC} alt="CivicChain logo" className="w-10 h-10 object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-gray-900 truncate">{municipalName || 'Municipal'}</h2>
              <p className="text-sm text-gray-500">Dashboard</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`group relative w-full overflow-hidden rounded-lg px-4 py-3 text-left transition-all duration-300 ${
                    currentPage === item.id
                      ? 'bg-blue-50 text-blue-700 shadow-sm'
                      : 'text-gray-700 hover:bg-gray-200 hover:text-slate-900 hover:shadow-sm hover:-translate-y-[1px]'
                  }`}
                >
                  <span
                    className={`pointer-events-none absolute inset-y-0 -left-24 w-20 -skew-x-12 bg-white/60 transition-transform duration-500 group-hover:translate-x-[260px] ${
                      currentPage === item.id ? "opacity-0" : "opacity-100"
                    }`}
                  />
                  <span className="relative flex items-center gap-3">
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <Button
            onClick={onLogout}
            variant="outline"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}

