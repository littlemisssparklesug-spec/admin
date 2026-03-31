"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, Users, Trophy, MessageSquare, 
  Settings, LogOut, Menu, X, Sparkles, Image as ImageIcon,
  Layout, Crown, PlayCircle, Share2
} from 'lucide-react';
import { auth, db } from "../libs/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, onSnapshot } from "firebase/firestore";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({
    contestants: 0,
    results: 0,
    messages: 0
  });
  
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (!user) router.push('/');
      else setLoading(false);
    });

    const unsubContestants = onSnapshot(collection(db, "voting"), (snap) => {
      setCounts(prev => ({ ...prev, contestants: snap.size }));
    });
    const unsubResults = onSnapshot(collection(db, "results"), (snap) => {
      setCounts(prev => ({ ...prev, results: snap.size }));
    });
    const unsubMessages = onSnapshot(collection(db, "contactz"), (snap) => {
      setCounts(prev => ({ ...prev, messages: snap.size }));
    });

    return () => {
      unsubAuth();
      unsubContestants();
      unsubResults();
      unsubMessages();
    };
  }, [router]);

  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/admin', count: null },
    { name: 'Contestants', icon: <Users size={20} />, path: '/admin/contestants', count: counts.contestants },
    { name: 'Final Results', icon: <Trophy size={20} />, path: '/admin/results', count: counts.results },
    { name: 'Messages', icon: <MessageSquare size={20} />, path: '/admin/messages', count: counts.messages },
    { name: 'Gallery', icon: <ImageIcon size={20} />, path: '/admin/gallery', count: null },
    { name: 'Applications', icon: <Layout size={20} />, path: '/admin/app', count: null },
    { name: 'Queens', icon: <Crown size={20} />, path: '/admin/queens', count: null },
    { name: 'Slides', icon: <PlayCircle size={20} />, path: '/admin/slides', count: null },
    { name: 'Socials', icon: <Share2 size={20} />, path: '/admin/socials', count: null },
    { name: 'Settings', icon: <Settings size={20} />, path: '/admin/settings', count: null },
    { name: 'Programs', icon: <Settings size={20} />, path: '/admin/programs', count: null },
    { name: 'Volunteers', icon: <Users size={20} />, path: '/admin/volunteer', count: null },
    
  ];

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-950">
      <Sparkles size={48} className="text-pink-500 animate-bounce mb-4" />
      <div className="font-black text-pink-500 animate-pulse tracking-[0.3em] uppercase">Loading System</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex overflow-hidden">
      {/* Sidebar */}
      <aside 
        className={`${isSidebarOpen ? 'w-72' : 'w-24'} fixed inset-y-0 left-0 z-50 bg-slate-950 text-slate-300 transition-all duration-500 flex flex-col border-r border-slate-800`}
      >
        {/* Logo Section - shrink-0 prevents it from squishing */}
        <div className="p-8 flex items-center gap-4 text-white shrink-0">
          <div className="bg-pink-500 p-2 rounded-xl">
            <Sparkles size={24} className="text-white" />
          </div>
          {isSidebarOpen && <span className="font-black tracking-tighter text-2xl uppercase italic">Sparkle</span>}
        </div>

        {/* Scrollable Navigation Area */}
        <nav 
          className="flex-1 mt-2 px-4 space-y-2 overflow-y-auto scrollbar-hide hover:scrollbar-default"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#1e293b transparent' // slate-800
          }}
        >
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link 
                key={item.name} 
                href={item.path} 
                className={`flex items-center justify-between px-4 py-4 rounded-2xl transition-all group ${
                  isActive 
                    ? 'bg-pink-600 text-white shadow-lg shadow-pink-900/40' 
                    : 'hover:bg-slate-900 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className={`${isActive ? 'scale-110' : 'group-hover:scale-110'} transition-transform`}>
                    {item.icon}
                  </span>
                  {isSidebarOpen && (
                    <span className="font-bold text-[10px] uppercase tracking-widest whitespace-nowrap">
                      {item.name}
                    </span>
                  )}
                </div>
                {isSidebarOpen && item.count !== null && (
                  <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${
                    isActive ? 'bg-white text-pink-600' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {item.count}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout Section - shrink-0 ensures it stays at the bottom */}
        <div className="p-6 shrink-0 border-t border-slate-900">
          <button 
            onClick={() => signOut(auth)} 
            className="flex items-center gap-4 px-4 py-4 w-full rounded-2xl bg-slate-900/50 hover:bg-red-500/10 hover:text-red-500 transition-all border border-slate-800 group"
          >
            <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
            {isSidebarOpen && <span className="font-bold text-xs uppercase tracking-widest">Logout System</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col transition-all duration-500 ${isSidebarOpen ? 'ml-72' : 'ml-24'}`}>
        {/* Sticky Header */}
        <header className="h-24 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-10 sticky top-0 z-40 shrink-0">
          <button 
            onClick={() => setSidebarOpen(!isSidebarOpen)} 
            className="p-3 bg-slate-100 rounded-2xl text-slate-600 hover:bg-pink-50 hover:text-pink-600 transition-all shadow-sm"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div className="flex items-center gap-6">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-black text-slate-900 uppercase tracking-tighter leading-none">
                {auth.currentUser?.displayName || 'Admin User'}
              </p>
              <p className="text-[10px] text-pink-500 font-black uppercase mt-1 tracking-widest">System Controller</p>
            </div>
            <div className="w-12 h-12 rounded-2xl border-2 border-white shadow-lg overflow-hidden bg-pink-100 flex items-center justify-center">
               {auth.currentUser?.photoURL ? (
                 <img src={auth.currentUser.photoURL} alt="user" className="w-full h-full object-cover" />
               ) : (
                 <Users className="text-pink-500" size={24} />
               )}
            </div>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto p-10 bg-[#F8FAFC]">
          <div className="max-w-7xl mx-auto">
            {/* Quick Stats Dashboard Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <StatCard title="Total Contestants" count={counts.contestants} icon={<Users />} color="blue" />
              <StatCard title="Finalized Results" count={counts.results} icon={<Trophy />} color="pink" />
              <StatCard title="Unread Messages" count={counts.messages} icon={<MessageSquare />} color="purple" />
            </div>

            <div className="bg-white rounded-[3rem] p-1 border border-slate-200 shadow-sm min-h-[60vh]">
              <div className="p-8">{children}</div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

const StatCard = ({ title, count, icon, color }: any) => (
  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between group hover:border-pink-200 transition-all hover:shadow-md">
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{title}</p>
      <h3 className="text-4xl font-black text-slate-900 tracking-tighter">{count}</h3>
    </div>
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all group-hover:rotate-12 ${
      color === 'blue' ? 'bg-blue-50 text-blue-500' : 
      color === 'pink' ? 'bg-pink-50 text-pink-500' : 
      'bg-purple-50 text-purple-500'
    }`}>
      {React.cloneElement(icon, { size: 28 })}
    </div>
  </div>
);