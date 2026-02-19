
import React, { useState } from 'react';
import { User, UserRole } from '../../types';
import { AppSection } from '../../App';
import { LogOut, Home, Settings, ClipboardList, Bed, Receipt, PieChart, Menu, X, ShieldCheck } from 'lucide-react';

interface LayoutProps {
  user: User;
  onLogout: () => void;
  activeSection: AppSection;
  setActiveSection: (section: AppSection) => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ user, onLogout, activeSection, setActiveSection, children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navigate = (section: AppSection) => {
    setActiveSection(section);
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b shadow-sm no-print">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-1.5 rounded-lg">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight">KBH</span>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 rounded-md bg-slate-100">
          {isSidebarOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 fixed md:static inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transition-transform duration-300 ease-in-out no-print
      `}>
        <div className="flex flex-col h-full">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-indigo-500 p-2 rounded-xl">
                <ShieldCheck className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg leading-tight">Kalpataru Boys Hostel</h1>
                <p className="text-slate-400 text-xs uppercase tracking-widest mt-1">Management System</p>
              </div>
            </div>

            <nav className="space-y-2">
              <NavItem 
                icon={<Home size={20}/>} 
                label="Dashboard" 
                active={activeSection === 'DASHBOARD'} 
                onClick={() => navigate('DASHBOARD')}
              />
              <NavItem 
                icon={<Bed size={20}/>} 
                label="Rooms" 
                active={activeSection === 'ROOMS'} 
                onClick={() => navigate('ROOMS')}
              />
              <NavItem 
                icon={<ClipboardList size={20}/>} 
                label="Complaints" 
                active={activeSection === 'COMPLAINTS'} 
                onClick={() => navigate('COMPLAINTS')}
              />
              <NavItem 
                icon={<Receipt size={20}/>} 
                label="Billing" 
                active={activeSection === 'BILLING'} 
                onClick={() => navigate('BILLING')}
              />
              {user.role === UserRole.MANAGER && (
                <NavItem 
                  icon={<PieChart size={20}/>} 
                  label="Analytics" 
                  active={activeSection === 'ANALYTICS'} 
                  onClick={() => navigate('ANALYTICS')}
                />
              )}
            </nav>
          </div>

          <div className="mt-auto p-6 border-t border-slate-800">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-lg">
                {user.name.charAt(0)}
              </div>
              <div className="overflow-hidden">
                <p className="font-medium truncate">{user.name}</p>
                <p className="text-slate-400 text-xs truncate capitalize">{user.role.toLowerCase()}</p>
              </div>
            </div>
            <button 
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="hidden md:flex items-center justify-between p-6 bg-white border-b no-print">
          <h2 className="text-xl font-semibold text-slate-800">
            {activeSection.charAt(0) + activeSection.slice(1).toLowerCase()}
          </h2>
          <div className="flex items-center gap-4">
            <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-sm font-medium rounded-full border border-indigo-100">
              Academic Year: {user.academicYear || 'N/A'}
            </span>
            <div className="w-px h-6 bg-slate-200 mx-2" />
            <Settings className="text-slate-400 cursor-pointer hover:text-indigo-600" size={20} />
          </div>
        </header>

        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={() => setIsSidebarOpen(false)} 
        />
      )}
    </div>
  );
};

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}

const NavItem = ({ icon, label, active, onClick }: NavItemProps) => (
  <button 
    onClick={onClick}
    className={`
      w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
      ${active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}
    `}
  >
    {icon}
    <span className="font-medium">{label}</span>
  </button>
);

export default Layout;