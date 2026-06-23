import React from 'react';
import { User } from '../database';
import { LogOut, LogIn, Award, Shield, UserCheck, LayoutDashboard, Globe } from 'lucide-react';

interface NavbarProps {
  currentUser: User | null;
  onOpenAuth: (initialMode: 'login' | 'register') => void;
  onLogout: () => void;
  onRoleSwitch: (role: 'peserta' | 'admin' | 'superadmin') => void;
  activeView: string;
  setActiveView: (view: 'landing' | 'peserta_dashboard' | 'admin_dashboard' | 'superadmin_dashboard') => void;
}

export default function Navbar({
  currentUser,
  onOpenAuth,
  onLogout,
  onRoleSwitch,
  activeView,
  setActiveView
}: NavbarProps) {
  return (
    <nav className="glass text-white sticky top-0 z-50 shadow-lg border-b border-white/10 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div 
            className="flex items-center space-x-3 cursor-pointer" 
            onClick={() => setActiveView('landing')}
            id="nav-logo"
          >
            <div className="bg-indigo-600 text-white font-bold p-2 rounded-lg flex items-center justify-center accent-glow-sm">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-sans font-bold text-lg tracking-tight bg-gradient-to-r from-indigo-400 to-violet-300 bg-clip-text text-transparent">
                WEBINAR UMKM
              </span>
              <span className="block text-[10px] font-mono tracking-wider text-indigo-400 uppercase leading-none">
                Online Hub
              </span>
            </div>
          </div>

          {/* Quick Dashboard Links */}
          <div className="hidden md:flex space-x-2">
            <button
              onClick={() => setActiveView('landing')}
              id="btn-nav-beranda"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeView === 'landing' ? 'bg-white/10 text-white font-medium shadow-sm' : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              Beranda
            </button>

            {currentUser && (
              <>
                {currentUser.role === 'peserta' && (
                  <button
                    onClick={() => setActiveView('peserta_dashboard')}
                    id="btn-nav-dashboard-peserta"
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeView === 'peserta_dashboard' ? 'bg-white/10 text-white font-medium shadow-sm' : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-1.5">
                      <LayoutDashboard className="w-4 h-4" />
                      <span>Dashboard Saya</span>
                    </div>
                  </button>
                )}

                {(currentUser.role === 'admin' || currentUser.role === 'superadmin') && (
                  <button
                    onClick={() => setActiveView('admin_dashboard')}
                    id="btn-nav-dashboard-admin"
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeView === 'admin_dashboard' ? 'bg-white/10 text-indigo-300 font-medium' : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-1.5">
                      <UserCheck className="w-4 h-4" />
                      <span>Dashboard Moderator</span>
                    </div>
                  </button>
                )}

                {currentUser.role === 'superadmin' && (
                  <button
                    onClick={() => setActiveView('superadmin_dashboard')}
                    id="btn-nav-dashboard-super"
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeView === 'superadmin_dashboard' ? 'bg-white/10 text-violet-300 font-medium' : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-1.5">
                      <Shield className="w-4 h-4" />
                      <span>Super Admin Panel</span>
                    </div>
                  </button>
                )}
              </>
            )}
          </div>

          {/* User Auth Controls / Profile */}
          <div className="flex items-center space-x-3">
            {currentUser ? (
              <div className="flex items-center space-x-4">
                <div className="hidden lg:block text-right">
                  <div className="text-sm font-medium text-slate-200">{currentUser.namaLengkap}</div>
                  <div className="text-[11px] text-indigo-400 font-medium">
                    {currentUser.role === 'superadmin' ? '⚜️ Super Admin' : 
                     currentUser.role === 'admin' ? '🛡️ Moderator' : `🏬 ${currentUser.namaUsaha}`}
                  </div>
                </div>

                <div className="glass py-1 px-1.5 rounded-full border border-white/10 flex items-center space-x-1">
                  <span className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs accent-glow-sm">
                    {currentUser.namaLengkap.charAt(0)}
                  </span>
                  <button
                    onClick={onLogout}
                    title="Keluar"
                    id="btn-logout"
                    className="p-1 text-slate-400 hover:text-rose-400 rounded-full transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onOpenAuth('login')}
                  id="btn-login-trigger"
                  className="px-3 py-1.5 text-sm font-medium text-slate-300 hover:text-white transition-colors"
                >
                  Masuk
                </button>
                <button
                  onClick={() => onOpenAuth('register')}
                  id="btn-register-trigger"
                  className="px-4 py-1.5 bg-indigo-600 text-white hover:bg-indigo-500 text-sm font-medium rounded-lg accent-glow transition-all cursor-pointer"
                >
                  Daftar Kelas
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
