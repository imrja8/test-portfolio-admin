"use client";
import React from 'react';
import * as LucideIcons from 'lucide-react';
import { COLLECTIONS } from '../constants';
import { pb } from '../services/pocketbase';
import { LogOut, Menu, X, ChevronRight, Code, Globe, Heart } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [siteLinks, setSiteLinks] = React.useState({ main: '', pocket: '' });
  const pathname = usePathname();
  const router = useRouter();

  // Derive active view from pathname
  let activeView = 'dashboard';
  if (pathname?.startsWith('/collections/')) {
    activeView = pathname.split('/')[2];
  } else if (pathname === '/dashboard' || pathname === '/') {
    activeView = 'dashboard';
  }

  React.useEffect(() => {
    const fetchData = async () => {
        try {
            const website = await pb.collection('website').getOne('website00000000').catch(() => null);
            setSiteLinks({
                main: website?.main || '/',
                pocket: website?.pocket || `${pb.baseUrl}/_/`
            });
        } catch (e) {
            console.error("Failed to fetch layout data", e);
        }
    };
    fetchData();
  }, []);

  const handleLogout = () => {
    pb.authStore.clear();
    window.location.href = '/';
  };

  const NavItem: React.FC<{ id: string; iconName: string; label: string }> = ({ id, iconName, label }) => {
    const Icon = (LucideIcons as any)[iconName] || LucideIcons.Box;
    const isActive = activeView === id;
    const href = id === 'dashboard' ? '/dashboard' : `/collections/${id}`;
    
    return (
      <Link
        href={href}
        onClick={() => setMobileMenuOpen(false)}
        className={`group w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-300 text-xs font-medium uppercase tracking-wider border relative overflow-hidden whitespace-nowrap ${
          isActive 
            ? 'bg-[#e0e0e0] text-[#101010] border-[#e0e0e0] shadow-glow' 
            : 'bg-[#1a1a1a] text-[#a0a0a0] border-transparent hover:bg-[#252525] hover:text-white'
        }`}
      >
        <Icon 
            size={16} 
            className={`transition-colors duration-300 shrink-0 ${isActive ? 'text-[#101010]' : 'text-[#666] group-hover:text-white'}`} 
        />
        <span className="truncate">{label}</span>
      </Link>
    );
  };

  const renderNavGroup = (title: string, category: string) => {
    const items = COLLECTIONS.filter(c => c.category === category);
    if (items.length === 0) return null;

    return (
      <div className="mb-8">
        <h3 className="px-4 text-[10px] font-bold text-[#555] uppercase tracking-[0.2em] mb-3">{title}</h3>
        <div className="space-y-1">
          {items.map((col) => (
            <NavItem key={col.id} id={col.id} iconName={col.icon} label={col.name} />
          ))}
        </div>
      </div>
    );
  };

  const SidebarContent = () => (
    <>
      <div className="mb-6">
          <NavItem id="dashboard" iconName="LayoutDashboard" label="Dashboard" />
      </div>
      
      {renderNavGroup('System', 'System')}
      {renderNavGroup('Content', 'Content')}
      {renderNavGroup('Pages', 'Pages')}
      {renderNavGroup('Inbox', 'Inbox')}
    </>
  );

  const activeCollection = COLLECTIONS.find(c => c.id === activeView);
  const pageTitle = activeView === 'dashboard' ? 'Dashboard' : activeCollection?.name || activeView;
  const pageCategory = activeView === 'dashboard' ? 'Overview' : activeCollection?.category || 'Management';

  return (
    <div className="flex h-screen bg-[#050505] text-[#e0e0e0] overflow-hidden relative font-sans">
      
      {/* Sidebar - Solid Dark */}
      <aside className="hidden md:flex flex-col w-64 h-full border-r border-[#222] bg-[#0a0a0a] z-20 shadow-xl">
        {/* Sidebar Header - Height Synced to Main Header (72px) */}
        <div className="h-[72px] flex items-center justify-center px-6 border-b border-[#222]">
          <div className="flex items-center gap-3">
             <div className="w-9 h-9 flex items-center justify-center text-white bg-gradient-to-br from-[#2a2a2a] to-[#121212] rounded-lg border border-[#333] shadow-inner">
                <Code size={20} strokeWidth={2.5} />
             </div>
             <h1 className="text-sm font-bold text-white tracking-[0.2em] uppercase leading-none mt-0.5">
                Admin Panel
             </h1>
          </div>
        </div>
        
        <nav className="flex-1 overflow-y-auto px-4 py-6 custom-scrollbar mask-image-b">
          <SidebarContent />
        </nav>

        <div className="p-6 border-t border-[#222] bg-[#0a0a0a]">
          <button 
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 px-3 py-3 w-full transition-all rounded-lg text-[10px] font-bold uppercase tracking-widest border 
            border-red-500/30 bg-red-500/5 text-red-400 hover:bg-red-500 hover:text-white"
          >
            <LogOut size={14} />
            <span>Terminate</span>
          </button>
        </div>
      </aside>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="absolute inset-0 z-50 bg-[#0a0a0a] md:hidden flex flex-col animate-in fade-in duration-300">
          <div className="h-[72px] flex items-center justify-between px-6 border-b border-[#222]">
             <div className="flex items-center gap-3">
                 <Code size={20} className="text-white" />
                 <span className="font-bold text-sm tracking-widest text-white uppercase">Menu</span>
             </div>
             <button onClick={() => setMobileMenuOpen(false)} className="p-2 bg-[#1a1a1a] rounded-lg text-white hover:bg-[#333]"><X size={20}/></button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
             <SidebarContent />
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#050505] relative z-10">
        
        {/* Mobile Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-[#222] bg-[#0a0a0a] md:hidden sticky top-0 z-30">
          <div className="flex items-center gap-3">
             <Code size={20} className="text-white" />
             <span className="font-bold text-white text-sm tracking-widest uppercase">Admin Panel</span>
          </div>
          <button onClick={() => setMobileMenuOpen(true)} className="p-2 text-[#e0e0e0] bg-[#1a1a1a] rounded-lg border border-[#333]">
            <Menu size={20} />
          </button>
        </header>

        {/* Desktop Header - Height Synced to Sidebar Header (72px) */}
        <header className="hidden md:flex items-center justify-between px-8 h-[72px] sticky top-0 z-30 bg-[#0a0a0a]/95 backdrop-blur-sm border-b border-[#222]">
            <div className="flex flex-col z-10 animate-fade-in-up justify-center h-full">
                 <div className="flex items-center gap-3 text-xs text-[#666] font-mono uppercase tracking-widest">
                    <span>{pageCategory}</span>
                    <ChevronRight size={12} className="text-[#444]" />
                    <span className="text-white text-sm font-bold">{pageTitle}</span>
                 </div>
            </div>

            <div className="flex items-center gap-6 z-10 animate-fade-in-up">
                <a 
                    href={siteLinks.main || '#'} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="group flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] hover:bg-[#e0e0e0] text-[#a0a0a0] hover:text-[#101010] border border-[#333] hover:border-white rounded-full text-xs font-bold uppercase tracking-widest transition-all" 
                >
                    <Globe size={16} />
                    <span>View Site</span>
                </a>
            </div>
        </header>

        <div className="flex-1 overflow-auto flex flex-col custom-scrollbar p-6 md:p-10 relative z-10">
             <div className="max-w-[1600px] mx-auto w-full flex-1">
                {children}
             </div>
        </div>

        {/* Sticky Footer */}
        <div className="flex-none py-3 border-t border-[#222] bg-[#0a0a0a] flex items-center justify-center gap-2 z-20 shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
             <span className="text-[10px] text-[#555] font-mono uppercase tracking-widest">Powered by Tegota</span>
             <Heart size={10} className="text-white fill-white animate-heartbeat" />
        </div>
      </main>
    </div>
  );
};