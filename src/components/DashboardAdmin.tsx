import React, { useState } from 'react';
import { User, Webinar, DB } from '../database';
import { Video, Users, CheckCircle, MessageSquare, Trash2, Search, ArrowRight, Play, Mic, MicOff, Star, Sparkles, Plus, AlertCircle, FileText, Settings, Key } from 'lucide-react';
import ChatBox from './ChatBox';

interface DashboardAdminProps {
  currentUser: User;
}

export default function DashboardAdmin({ currentUser }: DashboardAdminProps) {
  const [webinars, setWebinars] = useState<Webinar[]>(DB.getWebinars());
  const [selectedWebinarId, setSelectedWebinarId] = useState<string>(webinars[0]?.id || '');
  const [users, setUsers] = useState<User[]>(DB.getUsers());
  const [isZoomStarting, setIsZoomStarting] = useState(false);
  const [zoomStarted, setZoomStarted] = useState<Record<string, boolean>>({});
  const [micState, setMicState] = useState<Record<string, boolean>>({}); // User email -> micron state (true = unmuted, false = muted)
  
  // Custom states for manual registrations and slides
  const [newSlideUrl, setNewSlideUrl] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const activeWebinar = webinars.find(w => w.id === selectedWebinarId) || webinars[0];

  // Refresh users list
  const reloadUsers = () => {
    setUsers(DB.getUsers());
  };

  const reloadWebinars = () => {
    setWebinars(DB.getWebinars());
  };

  // Filter participants registered for selected webinar
  const participantsRegistered = users.filter(u => 
    u.role === 'peserta' && u.registeredWebinars.includes(selectedWebinarId)
  );

  const handleStartMeeting = (webinarId: string) => {
    setIsZoomStarting(true);
    setTimeout(() => {
      setIsZoomStarting(false);
      setZoomStarted(prev => ({ ...prev, [webinarId]: true }));
      
      // Update status to 'live' in database
      const item = DB.getWebinarById(webinarId);
      if (item) {
        item.status = 'live';
        DB.updateWebinar(item);
        reloadWebinars();
      }
      setSuccessMsg('Sesi Zoom berhasil dimulai! Peserta sekarang dapat bergabung.');
      setTimeout(() => setSuccessMsg(''), 5000);
    }, 1500);
  };

  const handleStopMeeting = (webinarId: string) => {
    setZoomStarted(prev => ({ ...prev, [webinarId]: false }));
    const item = DB.getWebinarById(webinarId);
    if (item) {
      item.status = 'completed';
      DB.updateWebinar(item);
      reloadWebinars();
    }
    setSuccessMsg('Sesi webinar selesai. Rekaman & materi telah diaudit.');
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  const handleApproveRegistration = (email: string, webinarId: string) => {
    const user = DB.getUserByEmail(email);
    if (user && !user.registeredWebinars.includes(webinarId)) {
      user.registeredWebinars.push(webinarId);
      DB.updateUser(user);
      reloadUsers();
      
      // Increment registrant count
      const web = DB.getWebinarById(webinarId);
      if (web) {
        web.registeredCount += 1;
        DB.updateWebinar(web);
        reloadWebinars();
      }
      setSuccessMsg(`Pendaftaran ${user.namaLengkap} disetujui.`);
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  const toggleMic = (email: string) => {
    setMicState(prev => ({
      ...prev,
      [email]: !prev[email]
    }));
  };

  // Handle slide PDF URL update
  const handleUpdateSlide = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlideUrl) return;

    if (activeWebinar) {
      activeWebinar.materialUrl = newSlideUrl;
      DB.updateWebinar(activeWebinar);
      reloadWebinars();
      setSuccessMsg('Tautan materi PDF berhasil diperbarui!');
      setNewSlideUrl('');
      setTimeout(() => setSuccessMsg(''), 4000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Admin Title bar */}
      <div className="glass border border-white/10 rounded-2xl p-6 mb-8 flex flex-col md:flex-row md:items-center md:justify-between justify-start gap-4 shadow-xl accent-glow-indigo">
        <div>
          <span className="text-indigo-400 text-xs font-mono font-bold tracking-wider uppercase">DASHBOARD MODERATOR / ADMIN WEBINAR</span>
          <h1 className="text-2xl font-sans font-extrabold text-slate-100 mt-1">
            Kelola Sesi Pelatihan UMKM
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Mulai siaran Zoom, setujui pendaftaran peserta secara manual, moderasi kolom komentar, dan bagikan materi PDF kelas.
          </p>
        </div>

        {/* Selected webinar context filter */}
        <div className="bg-slate-950/40 p-2 border border-white/5 rounded-xl flex items-center space-x-2 shrink-0">
          <span className="text-slate-400 text-xs font-medium font-sans">Pilih Webinar:</span>
          <select
            value={selectedWebinarId}
            onChange={(e) => setSelectedWebinarId(e.target.value)}
            id="admin-webinar-selector"
            className="bg-slate-900 text-slate-200 border border-white/10 focus:border-indigo-505 rounded-lg py-1 px-2.5 text-xs outline-none cursor-pointer font-sans"
          >
            {webinars.map(w => (
              <option key={w.id} value={w.id}>{w.title.slice(0, 45)}...</option>
            ))}
          </select>
        </div>
      </div>

      {successMsg && (
        <div id="admin-success-toast" className="bg-indigo-500/15 border border-indigo-500/25 text-indigo-305 p-3 rounded-xl text-xs flex items-center space-x-2 mb-6 animate-in fade-in slide-in-from-top-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column - Active live conference controls */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Audio Conference Video Control Panel */}
          <div className="glass border border-white/10 rounded-2xl p-5 space-y-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center space-x-2">
                <Video className="w-5 h-5 text-indigo-400" />
                <span className="text-sm font-bold text-slate-200">Kontrol Ruangan & Siaran Zoom</span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">ID: {activeWebinar?.id}</span>
            </div>

            {activeWebinar ? (
              <div className="space-y-4">
                <div className="p-4 bg-white/5 rounded-xl space-y-2 border border-white/5">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 uppercase">
                    Status: {activeWebinar.status}
                  </span>
                  <h3 className="text-base font-bold text-slate-100 leading-snug">{activeWebinar.title}</h3>
                  <p className="text-xs text-slate-400">Narasumber: <strong className="text-slate-300">{activeWebinar.speaker}</strong>, {activeWebinar.speakerTitle}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Start/Stop meeting triggers */}
                  <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-3 flex flex-col justify-between shadow-inner">
                    <div>
                      <h4 className="text-xs font-bold text-slate-200">Kombinasi Integrasi Zoom API</h4>
                      <p className="text-[11px] text-slate-400 mt-1 leading-normal font-sans">
                        Koneksi terprogram dengan API Zoom Meetings. Mulai langsung dari dashboard ini sebagai Host untuk memulai siaran streaming.
                      </p>
                    </div>

                    <div className="pt-2">
                      {isZoomStarting ? (
                        <button disabled className="w-full py-2.5 bg-slate-800/80 text-slate-400 text-xs font-bold rounded-xl animate-pulse">
                          Memulai Rapat Zoom...
                        </button>
                      ) : activeWebinar.status === 'live' || zoomStarted[activeWebinar.id] ? (
                        <button
                          onClick={() => handleStopMeeting(activeWebinar.id)}
                          id={`btn-stop-zoom-${activeWebinar.id}`}
                          className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer"
                        >
                          Hentikan Sesi Rapat
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStartMeeting(activeWebinar.id)}
                          id={`btn-start-zoom-${activeWebinar.id}`}
                          className="w-full py-2.5 bg-indigo-650 hover:bg-indigo-550 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-indigo-600/10 cursor-pointer accent-glow"
                        >
                          Mulai Webinar (Zoom API)
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Presenter materials upload form */}
                  <form onSubmit={handleUpdateSlide} className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-3 flex flex-col justify-between shadow-inner">
                    <div>
                      <h4 className="text-xs font-bold text-slate-200">Bagikan Tautan Materi (PPT/PDF)</h4>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Masukkan tautan file PDF/Google Slides materi webinar ini agar dapat diunduh semua peserta di dashboard.
                      </p>
                    </div>

                    <div className="space-y-2 pt-2">
                      <input
                        type="url"
                        value={newSlideUrl}
                        onChange={(e) => setNewSlideUrl(e.target.value)}
                        placeholder="https://drive.google.com/..."
                        id="input-slide-url"
                        className="w-full bg-slate-950/40 border border-white/10 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:border-indigo-500 outline-none"
                      />
                      <button
                        type="submit"
                        id="btn-upload-slide"
                        className="w-full py-2 bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold rounded-lg transition-all border border-white/10 cursor-pointer"
                      >
                        Sematkan File PPT
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-slate-550">
                Pilih atau daftarkan webinar dari panel kontrol Super Admin.
              </div>
            )}
          </div>

          {/* Chat Moderation Panel */}
          {activeWebinar ? (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-200 font-sans flex items-center space-x-2">
                <MessageSquare className="w-5 h-5 text-indigo-400" />
                <span>Pemantauan & Moderasi Kolom Chat</span>
              </h2>
              <ChatBox webinar={activeWebinar} currentUser={currentUser} />
            </div>
          ) : null}

        </div>

        {/* Right Column - User control and approval list */}
        <div className="lg:col-span-4 space-y-6">

          {/* Ceklist Pelaksanaan Kelas Webinar */}
          <div className="glass border border-white/10 rounded-2xl p-5 space-y-4 shadow-lg">
            <div className="flex items-center space-x-2 border-b border-white/5 pb-3">
              <CheckCircle className="w-4.5 h-4.5 text-indigo-400 shrink-0" />
              <h4 className="text-xs font-bold text-slate-200 font-sans uppercase tracking-wider font-mono">Ceklist Webinar Selesai</h4>
            </div>
            
            <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
              Centang kelas di bawah jika sudah selesai dilaksanakan. <strong className="text-emerald-400 font-semibold font-sans">E-Sertifikat</strong> peserta baru akan muncul setelah status webinar diubah menjadi selesai.
            </p>

            <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
              {webinars.map((web) => {
                const isCompleted = web.status === 'completed';
                return (
                  <div key={web.id} className="bg-slate-950/40 p-2.5 rounded-xl border border-white/5 flex items-start justify-between space-x-3 hover:border-white/10 transition-all">
                    <div className="space-y-1 min-w-0 flex-1">
                      <h5 className="text-[11px] font-bold text-slate-200 truncate font-sans" title={web.title}>
                        {web.title}
                      </h5>
                      <div className="flex items-center space-x-2">
                        <span className={`text-[8px] font-mono font-bold px-1 py-0.2 rounded border uppercase shrink-0 ${
                          web.status === 'completed'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/15'
                            : web.status === 'live'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/15 animate-pulse'
                            : 'bg-indigo-505/10 text-indigo-400 border-indigo-500/15'
                        }`}>
                          {web.status}
                        </span>
                        <span className="text-[9px] text-slate-405 font-mono truncate">{web.date}</span>
                      </div>
                    </div>

                    <label className="flex items-center space-x-1 shrink-0 cursor-pointer pt-0.5">
                      <input
                        type="checkbox"
                        checked={isCompleted}
                        onChange={(e) => {
                          const updatedWeb = { ...web, status: e.target.checked ? 'completed' as const : 'upcoming' as const };
                          DB.updateWebinar(updatedWeb);
                          reloadWebinars();
                          setSuccessMsg(`Webinar "${web.title.slice(0, 20)}..." ditandai sebagai ${updatedWeb.status.toUpperCase()}. Sertifikat peserta diperbarui.`);
                          setTimeout(() => setSuccessMsg(''), 4000);
                        }}
                        id={`chk-complete-${web.id}`}
                        className="rounded border-white/10 text-indigo-600 focus:ring-0 w-3.5 h-3.5 bg-slate-900 cursor-pointer"
                      />
                      <span className="text-[10px] text-slate-300 font-medium font-sans">Selesai</span>
                    </label>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Participants micro control check-in mic mute/unmute */}
          <div className="glass border border-white/10 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-indigo-400 shrink-0" />
                <h3 className="text-sm font-bold text-slate-200">Peserta Terdaftar ({participantsRegistered.length})</h3>
              </div>
              <span className="text-[10px] bg-white/5 text-slate-300 px-2 py-0.5 rounded-full font-mono border border-white/5">
                {activeWebinar?.registeredCount || 0} RSVPs
              </span>
            </div>

            {participantsRegistered.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs font-sans">
                Belum ada peserta terdaftar khusus di kelas webinar ini.
              </div>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {participantsRegistered.map((user) => {
                  const hasCheckedIn = user.checkedIn.includes(selectedWebinarId);
                  const isUnmuted = micState[user.email] || false;
                  const isPaid = user.paidWebinars?.includes(selectedWebinarId) || false;

                  return (
                    <div 
                      key={user.email}
                      className="bg-slate-950/40 border border-white/5 rounded-xl p-3 flex items-center justify-between hover:border-white/10 transition-colors"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-1.5 flex-wrap">
                          <span className="text-xs font-bold text-slate-200 leading-none">{user.namaLengkap}</span>
                          {hasCheckedIn && (
                            <span className="bg-indigo-500/15 text-indigo-300 text-[8px] font-bold px-1.5 py-0.05 rounded border border-indigo-500/20">
                              Present
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 font-sans">{user.namaUsaha} ({user.bidangUsaha})</p>
                      </div>

                      {/* Micro actions / payment status and mic moderator control */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            const currentPaid = user.paidWebinars ? [...user.paidWebinars] : [];
                            const updatedPaid = currentPaid.includes(selectedWebinarId)
                              ? currentPaid.filter(id => id !== selectedWebinarId)
                              : [...currentPaid, selectedWebinarId];
                            const updatedUser = { ...user, paidWebinars: updatedPaid };
                            DB.updateUser(updatedUser);
                            reloadUsers();
                          }}
                          id={`btn-toggle-paid-${user.email.replace(/[@.]/g, '-')}`}
                          title={isPaid ? "Klik untuk tandai Belum Lunas" : "Klik untuk tandai Lunas"}
                          className={`px-2 py-0.5 text-[9px] font-sans font-bold uppercase rounded-lg border transition-all cursor-pointer ${
                            isPaid 
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/30'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20'
                          }`}
                        >
                          {isPaid ? 'Lunas' : 'Belum Lunas'}
                        </button>

                        <button
                          onClick={() => toggleMic(user.email)}
                          title={isUnmuted ? 'Mute' : 'Unmute'}
                          id={`btn-toggle-mic-${user.email.replace(/[@.]/g, '-')}`}
                          className={`p-1.5 rounded-lg transition-colors border ${
                            isUnmuted 
                              ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/20' 
                              : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-350 cursor-pointer'
                          }`}
                        >
                          {isUnmuted ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Participant Manual Registration Approval Panel */}
          <div className="glass border border-white/10 rounded-2xl p-5 space-y-4 shadow-lg">
            <div className="flex items-center space-x-2 border-b border-white/5 pb-3">
              <CheckCircle className="w-4.5 h-4.5 text-indigo-400" />
              <h4 className="text-xs font-bold text-slate-200 font-sans">Antrean Persetujuan Pendaftaran</h4>
            </div>

            {/* List users who ARE peserta but haven't registered to selected webinar */}
            {(() => {
              const pendingUsers = users.filter(u => 
                u.role === 'peserta' && !u.registeredWebinars.includes(selectedWebinarId)
              );

              if (pendingUsers.length === 0) {
                return (
                  <p className="text-[11px] text-slate-400 text-center py-2 font-sans">
                    Semua peserta terdaftar aktif telah disetujui.
                  </p>
                );
              }

              return (
                <div className="space-y-3">
                  {pendingUsers.map(user => (
                    <div key={user.email} className="bg-slate-950/40 p-3 rounded-xl border border-white/5 space-y-2">
                      <div>
                        <h4 className="text-xs font-bold text-slate-300 font-sans">{user.namaLengkap}</h4>
                        <p className="text-[10px] text-slate-400 font-sans">Usaha: <span className="text-indigo-300 font-semibold">{user.namaUsaha} ({user.bidangUsaha})</span></p>
                        <p className="text-[9px] text-slate-505 font-mono">WA: {user.whatsapp}</p>
                      </div>
                      
                      <button
                        onClick={() => handleApproveRegistration(user.email, selectedWebinarId)}
                        id={`btn-approve-${user.email.replace(/[@.]/g, '-')}`}
                        className="w-full text-center py-1 bg-white/5 hover:bg-indigo-600/35 text-slate-200 border border-white/10 rounded transition text-[10px] font-bold tracking-wide uppercase cursor-pointer"
                      >
                        Setujui Pendaftaran
                      </button>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>

        </div>
      </div>

    </div>
  );
}
