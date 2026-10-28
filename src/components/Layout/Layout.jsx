import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Home, MessageSquare, ClipboardList, Wrench } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const BottomNav = () => {
  const location = useLocation();

  const navItems = [
    { to: '/', icon: Home, label: 'Beranda' },
    { to: '/chat', icon: MessageSquare, label: 'Chat' },
    { to: '/aktivitas', icon: ClipboardList, label: 'Aktivitas' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-neutral-950/95 backdrop-blur-md border-t border-neutral-800/80 z-50 md:hidden">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-4">
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive = to === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(to);
          return (
            <NavLink
              key={to}
              to={to}
              className={`flex flex-col items-center gap-1 py-1 px-4 rounded-xl transition-all ${
                isActive ? 'text-amber-400' : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              <div className={`p-1 rounded-lg ${isActive ? 'bg-amber-500/10' : ''}`}>
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-amber-400' : ''}`} />
              </div>
              <span className={`text-[11px] font-semibold tracking-wide ${isActive ? 'text-amber-400 font-bold' : ''}`}>
                {label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

const TopNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userData } = useAuth();

  const navItems = [
    { to: '/', label: 'Beranda' },
    { to: '/chat', label: 'Chat & AI' },
    { to: '/aktivitas', label: 'Aktivitas' },
  ];

  return (
    <header className="hidden md:flex fixed top-0 left-0 right-0 z-50 bg-neutral-950/90 backdrop-blur-md border-b border-neutral-800">
      <div className="max-w-6xl mx-auto w-full flex items-center justify-between px-6 h-16">
        {/* Logo */}
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => navigate('/')}
        >
          <img
            src="/logo.png"
            alt="Logo Benerin"
            className="w-9 h-9 object-contain group-hover:scale-105 transition-transform drop-shadow"
          />
          <span className="text-xl font-extrabold tracking-tight text-white select-none">
            BENER<span className="text-amber-400">IN</span>
          </span>
        </div>

        {/* Nav links */}
        <nav className="flex items-center gap-2">
          {navItems.map(({ to, label }) => {
            const isActive = to === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(to);
            return (
              <NavLink
                key={to}
                to={to}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-amber-400/10 text-amber-400 border border-amber-500/30'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                }`}
              >
                {label}
              </NavLink>
            );
          })}
        </nav>

        {/* Profile button */}
        <button
          onClick={() => navigate('/profile')}
          className="flex items-center gap-3 px-3.5 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 transition-colors"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-neutral-950 font-bold text-sm shadow-md">
            {userData?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <span className="text-sm font-medium text-neutral-200 max-w-[120px] truncate">
            {userData?.name || 'Profil'}
          </span>
        </button>
      </div>
    </header>
  );
};

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const { userData } = useAuth();

  return (
    <div className="min-h-screen bg-[#0b0c10] text-neutral-100 flex flex-col font-sans selection:bg-amber-500 selection:text-neutral-950">
      <TopNav />

      {/* Mobile top header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-neutral-950/95 backdrop-blur-md border-b border-neutral-800/80">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/')}>
            <img
              src="/logo.png"
              alt="Logo Benerin"
              className="w-8 h-8 object-contain drop-shadow"
            />
            <span className="text-lg font-black tracking-wider text-white">
              BENER<span className="text-amber-400">IN</span>
            </span>
          </div>
          <button
            onClick={() => navigate('/profile')}
            className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-neutral-950 font-bold text-xs shadow-md border border-amber-400/50"
          >
            {userData?.name?.charAt(0)?.toUpperCase() || 'U'}
          </button>
        </div>
      </div>

      {/* Main content */}
      <main className="pt-14 pb-20 md:pt-16 md:pb-8 flex-1">
        <div className="max-w-5xl mx-auto w-full">
          {children}
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Layout;
