import React from 'react';
import { Calendar, Users, Award, PlayCircle, ShieldCheck, Globe } from 'lucide-react';
import { DB, Webinar } from '../database';

interface HeroProps {
  onExploreClick: () => void;
  onRegisterClick: () => void;
  isLoggedIn: boolean;
}

export default function Hero({ onExploreClick, onRegisterClick, isLoggedIn }: HeroProps) {
  const webinars = DB.getWebinars();
  const liveWebinar = webinars.find(w => w.status === 'live');
  const upcomingWebinar = webinars.find(w => w.status === 'upcoming');
  const displayedWebinar = liveWebinar || upcomingWebinar || webinars[0];

  const getCategoryTag = (webinar: Webinar) => {
    const text = (webinar.title + " " + webinar.description).toLowerCase();
    if (text.includes("kuliner") || text.includes("makanan") || text.includes("resep")) return "KULINER";
    if (text.includes("retail") || text.includes("pembukuan") || text.includes("keuangan")) return "RETAIL & FINANCE";
    if (text.includes("ekspor") || text.includes("global") || text.includes("pasar luar")) return "EKSPOR";
    if (text.includes("digital") || text.includes("marketing") || text.includes("tiktok") || text.includes("iklan")) return "DIGITAL MARKETING";
    return "UMKM AKSELERASI";
  };
  return (
    <div className="relative overflow-hidden py-16 md:py-24 border-b border-white/10">
      {/* Decorative background grid and flares */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(99,102,241,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(99,102,241,0.04)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-60"></div>
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-20 right-0 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
          
          {/* Text Content */}
          <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-7 lg:text-left">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-6">
              <Globe className="w-3.5 h-3.5 text-indigo-400" />
              <span>Akselerasi Pengusaha Mikro Indonesia</span>
            </div>
            
            <h1 className="text-4xl tracking-tight font-sans font-extrabold text-white sm:text-5xl md:text-6xl leading-none">
              Webinar UMKM Online{' '}
              <span className="block text-gradient bg-gradient-to-r from-indigo-400 to-violet-300 bg-clip-text text-transparent">
                Go Digital & Naik Kelas
              </span>
            </h1>
            
            <p className="mt-4 text-base text-slate-350 sm:mt-5 sm:text-lg lg:text-base xl:text-lg leading-relaxed">
              Dapatkan ilmu bisnis praktis langsung dari para ahli pengekspor, praktisi digital marketing, dan konsultan keuangan nasional. Program dibimbing interaktif dengan materi PDF, e-sertifikat resmi, dan live workshop Zoom terintegrasi.
            </p>

            <div className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button
                onClick={onExploreClick}
                id="btn-explore-webinars"
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/20 text-center cursor-pointer flex items-center justify-center space-x-2 accent-glow"
              >
                <Calendar className="w-5 h-5 text-indigo-200" />
                <span>Lihat Jadwal Webinar</span>
              </button>
              
              {!isLoggedIn && (
                <button
                  onClick={onRegisterClick}
                  id="btn-hero-register"
                  className="px-6 py-3 glass hover:bg-white/10 text-slate-100 font-semibold rounded-xl border border-white/10 transition-all text-center cursor-pointer flex items-center justify-center space-x-2"
                >
                  <PlayCircle className="w-5 h-5 text-indigo-400" />
                  <span>Daftar Akun Baru</span>
                </button>
              )}
            </div>

            {/* Quick trust metrics */}
            <div className="mt-10 pt-8 border-t border-white/5 grid grid-cols-3 gap-4 text-left">
              <div>
                <span className="block text-2xl font-extrabold text-indigo-400 font-sans">15,000+</span>
                <span className="block text-xs uppercase tracking-wider text-slate-400 mt-1 font-mono">Alumni UMKM</span>
              </div>
              <div>
                <span className="block text-2xl font-extrabold text-violet-400 font-sans">40+</span>
                <span className="block text-xs uppercase tracking-wider text-slate-400 mt-1 font-mono">Pelatihan Aktif</span>
              </div>
              <div>
                <span className="block text-2xl font-extrabold text-sky-400 font-sans">100%</span>
                <span className="block text-xs uppercase tracking-wider text-slate-400 mt-1 font-mono">GRATIS Bersertifikat</span>
              </div>
            </div>
          </div>

          {/* Visual Badge Card or Showcase Box */}
          <div className="mt-12 sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-5 lg:flex lg:items-center">
            <div className="relative mx-auto w-full max-w-md lg:max-w-none">
              {/* Backglow glow decoration */}
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-violet-600 rounded-3xl blur-2xl opacity-20 transform -rotate-2"></div>
              
              <div className="relative glass border border-white/10 rounded-3xl p-6 shadow-2xl accent-glow-indigo">
                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                  <div className="flex items-center space-x-2">
                    {displayedWebinar?.status === 'live' ? (
                      <>
                        <span className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping"></span>
                        <span className="text-xs font-mono font-semibold text-rose-400 tracking-wider uppercase">🔴 Live Sekarang</span>
                      </>
                    ) : displayedWebinar?.status === 'completed' ? (
                      <>
                        <span className="text-xs font-mono font-semibold text-slate-400 tracking-wider uppercase font-mono">🎬 Rekaman Selesai</span>
                      </>
                    ) : (
                      <>
                        <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
                        <span className="text-xs font-mono font-semibold text-indigo-400 tracking-wider uppercase font-mono">🗓️ Kelas Mendatang</span>
                      </>
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-indigo-300 bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-500/10">IDR 0 (Free)</span>
                </div>

                {displayedWebinar ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-2.5">
                      <span className="inline-block px-2.5 py-1 bg-indigo-500/10 text-indigo-300 text-[10px] font-bold rounded border border-indigo-500/10 uppercase tracking-wide">
                        {getCategoryTag(displayedWebinar)}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono italic">{displayedWebinar.date}</span>
                    </div>
                    
                    <h3 className="text-base font-bold text-slate-100 font-sans leading-snug">
                      {displayedWebinar.title}
                    </h3>

                    <div className="p-3 bg-slate-950/40 rounded-xl border border-white/5 space-y-2">
                      <div className="flex items-center text-xs space-x-2">
                        <Users className="w-4 h-4 text-indigo-400" />
                        <span className="font-semibold text-indigo-300 font-mono">{displayedWebinar.registeredCount} UMKM Terdaftar</span>
                      </div>
                      <div className="flex items-center text-xs space-x-2 text-slate-300">
                        <Award className="w-4 h-4 text-violet-400" />
                        <span className="truncate">E-Sertifikat Kelulusan Resmi</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 pt-2">
                      <div className="w-9 h-9 bg-indigo-500/10 rounded-full flex items-center justify-center font-bold text-indigo-300 text-xs border border-indigo-500/25">
                        {displayedWebinar.speaker.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-slate-200 truncate">{displayedWebinar.speaker}</h4>
                        <p className="text-[10px] text-slate-400 truncate">{displayedWebinar.speakerTitle}</p>
                      </div>
                    </div>

                    <button
                      onClick={onExploreClick}
                      id="btn-hero-cta-quick"
                      className="w-full mt-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl tracking-wider uppercase transition-all shadow-md shadow-indigo-600/15 cursor-pointer accent-glow"
                    >
                      {displayedWebinar.status === 'live' ? 'Masuk Sesi Live Zoom' : 'Daftar & Ikuti Kelas'}
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-6 text-slate-500 text-xs">
                    Belum ada kelas webinar terdaftar.
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
