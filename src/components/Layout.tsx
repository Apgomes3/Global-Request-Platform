import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ListTodo, 
  CheckSquare, 
  Settings, 
  Plus,
  Bell,
  HelpCircle,
  Search,
  ChevronRight
} from 'lucide-react';
import { cn } from '../lib/utils';

export const Sidebar = () => {
  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', to: '/' },
    { icon: ListTodo, label: 'My Requests', to: '/requests' },
    { icon: CheckSquare, label: 'Approvals', to: '/approvals' },
    { icon: Settings, label: 'Settings', to: '/settings' },
  ];

  return (
    <aside className="hidden lg:flex flex-col h-screen w-72 left-0 top-0 fixed bg-surface-container-low py-8 pl-6 z-40">
      <div className="mb-10 px-4">
        <h1 className="text-lg font-black text-on-surface">Request Center</h1>
        <p className="text-[10px] uppercase tracking-widest font-medium text-on-surface-variant">Enterprise Management</p>
      </div>
      
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-4 py-3 transition-all duration-200 rounded-l-lg",
              isActive 
                ? "bg-surface-container-lowest text-primary font-bold shadow-sm" 
                : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/50"
            )}
          >
            <item.icon size={20} />
            <span className="text-sm uppercase tracking-widest font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto pr-6">
        <Link 
          to="/new"
          className="w-full bg-gradient-to-br from-primary to-primary-container text-on-primary py-4 rounded-xl font-semibold shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          New Request
        </Link>
      </div>
    </aside>
  );
};

export const TopBar = ({ title }: { title?: string }) => {
  return (
    <header className="fixed top-0 right-0 left-0 lg:left-72 z-30 glass-header flex items-center justify-between px-6 lg:px-10 py-4">
      <div className="flex items-center gap-4">
        {title && <h2 className="font-headline text-xl font-bold tracking-tight text-on-surface">{title}</h2>}
      </div>
      
      <div className="flex items-center gap-4 lg:gap-6">
        <div className="relative hidden sm:block group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
          <input 
            type="text" 
            placeholder="Search requests..." 
            className="pl-10 pr-4 py-2 bg-surface-container-low border-none rounded-lg focus:ring-2 focus:ring-primary w-64 text-sm transition-all"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <button className="p-2 text-on-surface-variant hover:bg-surface-container-high rounded-full transition-all">
            <Bell size={20} />
          </button>
          <button className="p-2 text-on-surface-variant hover:bg-surface-container-high rounded-full transition-all">
            <HelpCircle size={20} />
          </button>
        </div>

        <div className="h-8 w-[1px] bg-outline-variant/30 mx-1 hidden sm:block"></div>
        
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-on-surface leading-none">Sarah Jenkins</p>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-tighter">Admin View</p>
          </div>
          <div className="w-10 h-10 rounded-full overflow-hidden border border-outline-variant/20">
            <img 
              src="https://picsum.photos/seed/executive/100/100" 
              alt="User profile" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </div>
    </header>
  );
};
