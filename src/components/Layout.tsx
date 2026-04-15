import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, PenTool, PlayCircle, RefreshCw, Users, Bell, LogOut, ShoppingBag } from 'lucide-react';

const navItems = [
  { path: '/', label: '数字教材', icon: BookOpen, primary: true },
  { path: '/prep', label: '智能备课', icon: PenTool },
  { path: '/assistant', label: '我的课堂', icon: PlayCircle },
  { path: '/loop', label: '教学复盘', icon: RefreshCw },
  { path: '/community', label: '交流探讨', icon: Users },
  { path: '/store', label: '官方采购', icon: ShoppingBag },
];

export default function Layout({ children, onLogout }: { children: React.ReactNode, onLogout: () => void }) {
  const location = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  const isReader = location.pathname.startsWith('/reader');

  if (isReader) {
    return (
      <div className="flex flex-col h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
        <main className="flex-1 overflow-hidden relative">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      {/* Top Navigation Bar */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center px-6 justify-between shrink-0 shadow-sm z-20">
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-2 text-orange-600">
            <BookOpen className="w-7 h-7" />
            <span className="font-bold text-xl tracking-tight">教师用书（e堂好课版）</span>
          </div>
          
          <nav className="flex items-center gap-2">
            {navItems.map((item) => {
              // Highlight if exact match or if we are in a sub-route of the module (e.g., /reader belongs to /)
              const isActive = location.pathname === item.path || (item.path === '/' && location.pathname.startsWith('/reader'));
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium ${
                    item.primary
                      ? isActive
                        ? 'text-orange-700 bg-orange-50 ring-1 ring-orange-200 shadow-sm'
                        : 'text-orange-600 hover:bg-orange-50'
                      : isActive 
                        ? 'text-slate-700 bg-slate-100' 
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700 text-sm'
                  }`}
                >
                  <Icon className={`${item.primary ? 'w-5 h-5' : 'w-4 h-4'} ${isActive ? (item.primary ? 'text-orange-600' : 'text-slate-600') : (item.primary ? 'text-orange-400' : 'text-slate-400')}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          <div className="h-6 w-px bg-slate-200 mx-1"></div>
          
          <div className="relative">
            <div 
              className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-1.5 rounded-lg transition-colors"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-bold text-sm">
                李
              </div>
              <div className="flex flex-col hidden sm:flex">
                <span className="text-sm font-medium leading-none">李老师</span>
                <span className="text-xs text-slate-500 mt-1 leading-none">小学部</span>
              </div>
            </div>

            {showProfileMenu && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowProfileMenu(false)}
                ></div>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-20">
                  <button 
                    onClick={() => {
                      setShowProfileMenu(false);
                      onLogout();
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    退出登录
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden relative">
        {children}
      </main>
    </div>
  );
}
