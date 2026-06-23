/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User, Webinar, DB, INITIAL_USERS, INITIAL_WEBINARS, INITIAL_SETTINGS, INITIAL_CHAT_MESSAGES } from './database';
import { seedFirestoreIfNeeded, startRealtimeSync } from './firebase';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import AuthModal from './components/AuthModal';
import DashboardPeserta from './components/DashboardPeserta';
import DashboardAdmin from './components/DashboardAdmin';
import DashboardSuperAdmin from './components/DashboardSuperAdmin';
import { Calendar, Users, Award, PlayCircle, Filter, BookOpen, Clock, Heart, Shield, HelpCircle, ArrowRight, Sparkles, Building, Phone } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeView, setActiveView] = useState<'landing' | 'peserta_dashboard' | 'admin_dashboard' | 'superadmin_dashboard'>('landing');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'register'>('login');
  
  // Filtering states on Landing Page
  const [selectedBidangUsaha, setSelectedBidangUsaha] = useState<string>('Semua');
  const [selectedStatus, setSelectedStatus] = useState<string>('Semua');
  
  // Reload trigger
  const [refreshSeed, setRefreshSeed] = useState(0);

  useEffect(() => {
    // Seed Firestore with default data if empty
    seedFirestoreIfNeeded(INITIAL_USERS, INITIAL_WEBINARS, INITIAL_SETTINGS, INITIAL_CHAT_MESSAGES);

    // Subscribe to Firestore updates
    const syncUnsubscribe = startRealtimeSync(() => {
      // Force component re-render when Firestore triggers onSnapshot
      setRefreshSeed(prev => prev + 1);
      
      const lastUser = localStorage.getItem('umkm_last_active_user');
      if (lastUser) {
        try {
          const u = JSON.parse(lastUser) as User;
          const fresh = DB.getUserByEmail(u.email);
          if (fresh) {
            setCurrentUser(fresh);
          }
        } catch (e) {
          console.error('Error auto-refreshing user session:', e);
        }
      }
    });

    // Increase traffic count on page mount
    DB.increaseTraffic();

    // Check if there is already a logged-in user in memory
    const lastUser = localStorage.getItem('umkm_last_active_user');
    if (lastUser) {
      try {
        const u = JSON.parse(lastUser) as User;
        // Verify user still exists in DB
        const fresh = DB.getUserByEmail(u.email);
        if (fresh) {
          setCurrentUser(fresh);
          // Redirect to appropriate dashboard
          if (fresh.role === 'superadmin') setActiveView('superadmin_dashboard');
          else if (fresh.role === 'admin') setActiveView('admin_dashboard');
          else setActiveView('peserta_dashboard');
        }
      } catch (e) {
        console.error('Error logging in last active user', e);
      }
    }

    // Subscribe to local actions
    const unsubDB = DB.subscribe(() => {
      setRefreshSeed(prev => prev + 1);
    });

    return () => {
      unsubDB();
    };
  }, []);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('umkm_last_active_user', JSON.stringify(user));
    
    // Redirect cleanly
    if (user.role === 'superadmin') {
      setActiveView('superadmin_dashboard');
    } else if (user.role === 'admin') {
      setActiveView('admin_dashboard');
    } else {
      setActiveView('peserta_dashboard');
    }
    setRefreshSeed(prev => prev + 1);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('umkm_last_active_user');
    setActiveView('landing');
  };

  const handleOpenAuth = (mode: 'login' | 'register') => {
    setAuthInitialMode(mode);
    setAuthModalOpen(true);
  };

  // Direct role simulator switcher (for review ease!)
  const handleSimulateRole = (role: 'peserta' | 'admin' | 'superadmin') => {
    let email = 'peserta@umkm.id';
    if (role === 'admin') email = 'admin@umkm.id';
    if (role === 'superadmin') email = 'superadmin@umkm.id';

    const u = DB.getUserByEmail(email);
    if (u) {
      handleLoginSuccess(u);
    }
  };

  // Filter logic on the landing page
  const webinars = DB.getWebinars();
  const filteredWebinars = webinars.filter(w => {
    // Filtering by status
    if (selectedStatus !== 'Semua' && w.status !== selectedStatus) return false;
    
    // Filtering by speaker/description tags if matching categories (implied context)
    if (selectedBidangUsaha !== 'Semua') {
      const tag = selectedBidangUsaha.toLowerCase();
      const matchTitle = w.title.toLowerCase().includes(tag);
      const matchDesc = w.description.toLowerCase().includes(tag);
      if (!matchTitle && !matchDesc) return false;
    }
    return true;
  });

  const handleRegisterToWebinarFromLanding = (wId: string) => {
    if (!currentUser) {
      handleOpenAuth('register');
      return;
    }

    // Register user to webinar
    const updatedUser = { ...currentUser };
    if (!updatedUser.registeredWebinars.includes(wId)) {
      updatedUser.registeredWebinars.push(wId);
      
      // Increment count
      const web = DB.getWebinarById(wId);
      if (web) {
        web.registeredCount += 1;
        DB.updateWebinar(web);
      }
      
      DB.updateUser(updatedUser);
      setCurrentUser(updatedUser);
      localStorage.setItem('umkm_last_active_user', JSON.stringify(updatedUser));
      setRefreshSeed(prev => prev + 1);
    }
    
    // Redirect to dashboard to see conference room
    setActiveView('peserta_dashboard');
  };

  return (
    <div className="min-h-screen gradient-bg text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Navigation Header */}
      <Navbar
        currentUser={currentUser}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
        onRoleSwitch={handleSimulateRole}
        activeView={activeView}
        setActiveView={(v) => setActiveView(v)}
      />

      {/* Main Container Content */}
      <main className="flex-grow">
        
        {/* LANDING PAGE ROUTE */}
        {activeView === 'landing' && (
          <div className="space-y-16 pb-16">
            <Hero
              onExploreClick={() => {
                document.getElementById('webinar-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              onRegisterClick={() => handleOpenAuth('register')}
              isLoggedIn={currentUser !== null}
            />

            {/* List of Webinars Catalog */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8" id="webinar-section">
              <div className="text-center">
                <span className="text-indigo-400 text-xs font-mono font-bold uppercase tracking-widest block mb-1">
                  AGENDA TERJADWAL
                </span>
                <h2 className="text-3xl font-sans font-extrabold text-white">
                  Jadwal Kelas Webinar UMKM Terlaris
                </h2>
                <p className="text-xs text-slate-405 mt-2 max-w-2xl mx-auto">
                  Pelajari bidang operasional harian, perluas jejaring usaha Anda, dan raih sertifikat resmi kelulusan secara praktis dan 100% gratis.
                </p>
              </div>

              {/* Advanced Filtering controls */}
              <div className="glass border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
                
                {/* Category filters */}
                <div className="flex items-center space-x-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 scrollbar-none">
                  <span className="text-[11px] font-semibold uppercase font-mono text-slate-400 shrink-0">Filter Topik:</span>
                  {['Semua', 'Kuliner', 'Retail', 'Ekspor', 'Digital Marketing'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedBidangUsaha(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer ${
                        selectedBidangUsaha === cat 
                          ? 'bg-indigo-600 text-white font-bold accent-glow shadow-md' 
                          : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Status selector filter */}
                <div className="flex items-center space-x-2 shrink-0 w-full sm:w-auto justify-end">
                  <span className="text-[11px] font-semibold uppercase font-mono text-slate-400">Pelaksanaan:</span>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    id="filter-status-select"
                    className="glass text-slate-200 border border-white/10 text-xs rounded-xl px-3 py-1.5 outline-none cursor-pointer focus:border-indigo-505"
                  >
                    <option value="Semua">Semua Jadwal</option>
                    <option value="live">🔴 Sedang Live</option>
                    <option value="upcoming">🗓️ Mendatang</option>
                    <option value="completed">🎬 Rekaman Selesai</option>
                  </select>
                </div>

              </div>

              {/* Webinar Cards grid */}
              {filteredWebinars.length === 0 ? (
                <div className="text-center py-12 bg-slate-900/40 rounded-2xl border border-white/10 border-dashed">
                  <span className="text-3xl">🗓️</span>
                  <p className="text-sm text-slate-400 mt-2">Tidak ada webinar yang cocok dengan kriteria filter Anda.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredWebinars.map((webinar) => {
                    const isRegistered = currentUser?.registeredWebinars.includes(webinar.id) || false;

                    return (
                      <div 
                        key={webinar.id} 
                        className="glass border border-white/10 hover:border-indigo-500/30 rounded-2xl p-6 flex flex-col justify-between hover:shadow-xl hover:shadow-indigo-950/20 hover:-translate-y-0.5 transition-all group duration-300"
                      >
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider ${
                              webinar.status === 'live' 
                                ? 'bg-rose-500/15 text-rose-455 border border-rose-500/20 animate-pulse'
                                : webinar.status === 'completed'
                                  ? 'bg-slate-800/40 text-slate-350 border border-slate-700/50'
                                  : 'bg-indigo-950/50 text-indigo-305 border border-indigo-900/40'
                            }`}>
                              {webinar.status === 'live' ? '🔴 Live' : webinar.status === 'completed' ? '🎬 Completed' : '🗓️ Upcoming'}
                            </span>
                            <span className="text-xs text-slate-400 font-mono flex items-center space-x-1">
                              <Clock className="w-3.5 h-3.5 text-indigo-400" />
                              <span>{webinar.time}</span>
                            </span>
                          </div>

                          <h3 className="text-base font-bold text-slate-100 font-sans leading-snug group-hover:text-indigo-400 transition-colors duration-300">
                            {webinar.title}
                          </h3>

                          <p className="text-xs text-slate-350 line-clamp-3 leading-relaxed">
                            {webinar.description}
                          </p>
                        </div>

                        <div className="mt-6 pt-4 border-t border-white/10 space-y-4">
                          {/* Presenter details */}
                          <div className="flex items-center space-x-3">
                            <div className="w-9 h-9 bg-indigo-505/10 text-indigo-300 border border-indigo-500/20 font-bold text-xs rounded-full flex items-center justify-center">
                              {webinar.speaker.charAt(0)}
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-slate-200 leading-none">{webinar.speaker}</h4>
                              <p className="text-[10px] text-slate-400 mt-1 leading-none">{webinar.speakerTitle}</p>
                            </div>
                          </div>

                          {/* Quick action triggers */}
                          <div className="flex items-center justify-between gap-2.5 pt-2">
                            <span className="text-[10px] font-mono text-slate-400">{webinar.registeredCount} UMKM terdaftar</span>
                            {isRegistered ? (
                              <button
                                onClick={() => setActiveView('peserta_dashboard')}
                                className="px-3.5 py-1.5 glass text-slate-200 hover:text-white rounded-lg text-xs font-medium border border-white/15 transition-colors cursor-pointer"
                              >
                                Masuk Ruang
                              </button>
                            ) : (
                              <button
                                onClick={() => handleRegisterToWebinarFromLanding(webinar.id)}
                                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition cursor-pointer accent-glow"
                              >
                                {webinar.status === 'completed' ? 'Lihat Rekaman' : 'Ikuti Kelas'}
                              </button>
                            )}
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Testimonials / Program benefits */}
            <div className="glass border-t border-b border-white/5 py-16 backdrop-blur-md shadow-inner">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-2">
                  <div className="w-10 h-10 bg-indigo-500/15 text-indigo-300 border border-indigo-500/10 rounded-xl flex items-center justify-center font-bold">✓</div>
                  <h4 className="text-sm font-bold text-slate-200">100% Gratis Bersertifikat</h4>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans">Seluruh sesi webinar didukung penuh oleh asosiasi UMKM bersama kementerian untuk mengakselerasi keterampilan manajemen.</p>
                </div>
                <div className="space-y-2">
                  <div className="w-10 h-10 bg-violet-500/15 text-violet-300 border border-violet-500/10 rounded-xl flex items-center justify-center font-bold">✓</div>
                  <h4 className="text-sm font-bold text-slate-200">Integrasi Zoom Interaktif</h4>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans">Berdiskusi dua arah dengan pemateri, bertanya via board chat, dan menyerap materi praktek harian secara langsung.</p>
                </div>
                <div className="space-y-2">
                  <div className="w-10 h-10 bg-fuchsia-500/15 text-fuchsia-300 border border-fuchsia-500/10 rounded-xl flex items-center justify-center font-bold">✓</div>
                  <h4 className="text-sm font-bold text-slate-200">Alumni Terbukti Sukses Ekspor</h4>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans">Raih peluang jejaring dan saksikan ratusan komoditas retail kriya, kuliner, dan fashion binaan yang berhasil go global.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PESERTA DASHBOARD ROUTE */}
        {activeView === 'peserta_dashboard' && currentUser && (
          <DashboardPeserta
            currentUser={currentUser}
            onUpdateUser={(updated) => {
              setCurrentUser(updated);
              localStorage.setItem('umkm_last_active_user', JSON.stringify(updated));
            }}
          />
        )}

        {/* MODERATOR / ADMIN DASHBOARD ROUTE */}
        {activeView === 'admin_dashboard' && currentUser && (
          <DashboardAdmin
            currentUser={currentUser}
          />
        )}

        {/* SUPER ADMIN DASHBOARD ROUTE */}
        {activeView === 'superadmin_dashboard' && currentUser && (
          <DashboardSuperAdmin
            currentUser={currentUser}
            onRefreshAllData={() => setRefreshSeed(prev => prev + 1)}
          />
        )}

      </main>

      {/* FOOTER */}
      <footer className="glass border-t border-white/5 py-10 mt-16 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div>
            <span className="font-bold text-slate-350 tracking-tight text-sm font-sans block mb-1">
              🏢 WEBINAR UMKM ONLINE CENTER INDONESIA
            </span>
            <p className="text-[11px] text-slate-400">Platform akselerator bisnis mikro berdaulat, go-digital dan naik kelas.</p>
          </div>
          <div className="text-[11px] text-slate-455 font-mono">
            &copy; 2026 Webinar UMKM Online. Database: <strong className="text-indigo-400 font-semibold font-mono">Cloud Firestore / LocalStorage Persist</strong>.
          </div>
        </div>
      </footer>

      {/* Floater instant Role Simulator tool at bottom right */}
      <div className="fixed bottom-4 right-4 z-40 glass border border-white/10 rounded-2xl p-3.5 shadow-2xl flex flex-col items-center space-y-2 max-w-[210px] accent-glow-indigo" id="simulasi-peran-sidebar">
        <div className="flex items-center space-x-1.5 border-b border-white/10 pb-1.5 w-full justify-between">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span className="text-[9px] font-bold font-mono text-slate-350 tracking-wider">SIMULATOR PERAN</span>
          <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
        </div>
        
        <p className="text-[9px] text-slate-455 text-center leading-normal">
          Beralih hak akses instan untuk menguji visual dasbor:
        </p>
        
        <div className="grid grid-cols-1 gap-1.5 w-full">
          <button
            onClick={() => handleSimulateRole('peserta')}
            id="sim-peserta-trigger"
            className="w-full text-left py-1 px-1.5 bg-white/5 hover:bg-indigo-600/35 border border-white/5 rounded text-slate-200 text-[9px] font-medium transition cursor-pointer flex items-center justify-between"
          >
            <span>🎒 Peserta</span>
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
          </button>
          
          <button
            onClick={() => handleSimulateRole('admin')}
            id="sim-admin-trigger"
            className="w-full text-left py-1 px-1.5 bg-white/5 hover:bg-indigo-600/35 border border-white/5 rounded text-slate-200 text-[9px] font-medium transition cursor-pointer flex items-center justify-between"
          >
            <span>🛡️ Moderator</span>
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
          </button>
          
          <button
            onClick={() => handleSimulateRole('superadmin')}
            id="sim-super-trigger"
            className="w-full text-left py-1 px-1.5 bg-white/5 hover:bg-indigo-600/35 border border-white/5 rounded text-slate-200 text-[9px] font-medium transition cursor-pointer flex items-center justify-between"
          >
            <span>⚜️ Super Admin</span>
            <div className="w-1.5 h-1.5 rounded-full bg-violet-405"></div>
          </button>
        </div>

        <button
          onClick={() => {
            handleLogout();
            setActiveView('landing');
          }}
          className="text-[8px] text-slate-455 hover:text-rose-400 font-bold uppercase transition"
        >
          Reset Peran / Keluar
        </button>
      </div>

      {/* Auth modal Popup coordinator */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleLoginSuccess}
        initialMode={authInitialMode}
      />

    </div>
  );
}
