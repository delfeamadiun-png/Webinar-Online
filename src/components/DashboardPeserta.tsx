import React, { useState, useEffect } from 'react';
import { User, Webinar, DB } from '../database';
import { Calendar, Award, FileText, Video, CheckCircle, Search, QrCode, PlayCircle, Info, Bookmark, ExternalLink, Lock, CreditCard, Check, BookOpen, Download, Volume2, Tv } from 'lucide-react';
import ChatBox from './ChatBox';

function getYouTubeEmbedUrl(url: string) {
  if (!url) return '';
  let id = '';
  if (url.includes('embed/')) {
    id = url.split('embed/')[1]?.split('?')[0];
  } else if (url.includes('v=')) {
    id = url.split('v=')[1]?.split('&')[0];
  } else if (url.includes('youtu.be/')) {
    id = url.split('youtu.be/')[1]?.split('?')[0];
  }
  return id ? `https://www.youtube.com/embed/${id}` : url;
}

interface DashboardPesertaProps {
  currentUser: User;
  onUpdateUser: (user: User) => void;
}

export default function DashboardPeserta({ currentUser, onUpdateUser }: DashboardPesertaProps) {
  const webinars = DB.getWebinars();
  const settings = DB.getSettings();
  const [activePlayWebinarId, setActivePlayWebinarId] = useState<string | null>(null);
  const [payingWebinarId, setPayingWebinarId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCert, setActiveCert] = useState<{ webinarTitle: string; code: string; date: string } | null>(null);
  const [qrWebinarId, setQrWebinarId] = useState<string | null>(null);

  // Auto-play the live webinar if the user is registered but hasn't selected anything yet
  const registeredIdsString = currentUser.registeredWebinars.join(',');
  useEffect(() => {
    if (!activePlayWebinarId) {
      const liveEnrolled = webinars.find(w => w.status === 'live' && currentUser.registeredWebinars.includes(w.id));
      if (liveEnrolled) {
        setActivePlayWebinarId(liveEnrolled.id);
      }
    }
  }, [registeredIdsString, activePlayWebinarId]);

  // Filter webinars based on search
  const filteredWebinars = webinars.filter(w => 
    w.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    w.speaker.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Registered and non-registered webinars
  const registeredWebinars = webinars.filter(w => currentUser.registeredWebinars.includes(w.id));
  const availableWebinars = filteredWebinars.filter(w => !currentUser.registeredWebinars.includes(w.id));

  // Check for unpaid webinars under restricted zoom settings
  const unpaidWebinars = settings.restrictZoomUnpaid
    ? registeredWebinars.filter(w => {
        const price = w.price !== undefined ? w.price : (settings.midtransConnected ? settings.ticketPrice : 0);
        return price > 0 && !currentUser.paidWebinars?.includes(w.id);
      })
    : [];

  const handleRegisterWebinar = (webinarId: string) => {
    // Sync to user
    const updatedUser = { ...currentUser };
    if (!updatedUser.registeredWebinars.includes(webinarId)) {
      updatedUser.registeredWebinars.push(webinarId);
      
      // Update registrant count for webinar
      const webinar = DB.getWebinarById(webinarId);
      if (webinar) {
        webinar.registeredCount += 1;
        DB.updateWebinar(webinar);
      }
      
      DB.updateUser(updatedUser);
      onUpdateUser(updatedUser);
    }
  };

  const handleCheckIn = (webinarId: string) => {
    // Check if payment restriction is active and unpaid
    const webinar = DB.getWebinarById(webinarId);
    const price = webinar?.price !== undefined ? webinar.price : (settings.midtransConnected ? settings.ticketPrice : 0);
    if (settings.restrictZoomUnpaid && price > 0 && !currentUser.paidWebinars?.includes(webinarId)) {
      alert("Akses Presensi ditolak: Anda belum melunasi biaya tiket pendaftaran untuk kelas webinar ini.");
      return;
    }
    // Set checked in & issue certificate
    const updatedUser = { ...currentUser };
    if (!updatedUser.checkedIn.includes(webinarId)) {
      updatedUser.checkedIn.push(webinarId);
      
      // Issue certificate
      const randomId = `CERT-UMKM-${Math.floor(10000 + Math.random() * 90000)}`;
      updatedUser.certificates.push({
        webinarId,
        code: randomId,
        issuedAt: new Date().toISOString().split('T')[0]
      });

      DB.updateUser(updatedUser);
      onUpdateUser(updatedUser);
    }
    setQrWebinarId(null);
  };

  const selectedWebinarToPlay = webinars.find(w => w.id === activePlayWebinarId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Welcome Banner */}
      <div className="glass border border-white/10 rounded-2xl p-6 mb-8 text-white relative overflow-hidden shadow-xl accent-glow-indigo">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-2xl"></div>
        <div className="md:flex md:items-center md:justify-between">
          <div>
            <span className="text-indigo-400 text-xs font-mono font-bold tracking-wider uppercase">DASHBOARD PESERTA</span>
            <h1 className="text-2xl font-sans font-extrabold text-slate-100 mt-1">
              Selamat Datang Kembali, {currentUser.namaLengkap}!
            </h1>
            <p className="text-xs text-slate-300 mt-1.5 flex items-center space-x-2">
              <span className="bg-indigo-500/20 text-indigo-300 font-mono px-2 py-0.5 rounded text-[10px] uppercase font-semibold border border-indigo-500/10">
                🏬 {currentUser.namaUsaha}
              </span>
              <span>•</span>
              <span className="text-slate-400 font-sans">Bidang Usaha:</span> 
              <span className="text-violet-400 font-semibold font-mono">{currentUser.bidangUsaha}</span>
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 bg-slate-950/40 p-4 border border-white/5 rounded-xl grid grid-cols-2 gap-4 text-center">
            <div>
              <span className="block text-xl font-bold text-indigo-400 font-mono">{registeredWebinars.length}</span>
              <span className="block text-[10px] font-mono text-slate-400 uppercase">Diikuti</span>
            </div>
            <div>
              <span className="block text-xl font-bold text-violet-400 font-mono">
                {(() => {
                  return currentUser.certificates.filter(cert => {
                    const matchingWebinar = webinars.find(w => w.id === cert.webinarId);
                    if (!matchingWebinar) return false;
                    if (settings.restrictZoomUnpaid && !currentUser.paidWebinars?.includes(cert.webinarId)) {
                      return false;
                    }
                    if (matchingWebinar.status !== 'completed') {
                      return false;
                    }
                    return true;
                  }).length;
                })()}
              </span>
              <span className="block text-[10px] font-mono text-slate-400 uppercase">Sertifikat</span>
            </div>
          </div>
        </div>
      </div>

      {/* Unpaid Webinars Info & Bank Transfer Manual Guide */}
      {settings.restrictZoomUnpaid && unpaidWebinars.length > 0 && (
        <div className="glass border border-amber-500/20 bg-amber-500/5 rounded-2xl p-5 mb-8 text-white relative overflow-hidden shadow-lg animate-in fade-in slide-in-from-top-4 duration-300 font-sans">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-xl"></div>
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="space-y-2 max-w-3xl">
              <div className="flex items-center space-x-2">
                <span className="bg-amber-500 text-slate-950 font-bold px-2 py-0.5 rounded text-[10px] uppercase font-sans tracking-wide">
                  Butuh Pembayaran
                </span>
                <span className="text-amber-400 font-bold text-xs">Akses Rapat Zoom Terbatas</span>
              </div>
              <h2 className="text-sm font-bold text-slate-100">
                Anda memiliki <span className="text-amber-400">{unpaidWebinars.length}</span> kelas terdaftar yang belum lunas.
              </h2>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Sesuai dengan kebijakan sistem, Anda <strong className="text-rose-400 font-semibold font-sans">hanya bisa melihat informasi detail materi webinar</strong> di dashboard ini. Akses link Zoom atau live meeting akan otomatis terbuka setelah status keikutsertaan Anda ditandai <span className="text-emerald-400 font-bold font-sans">Lunas</span> oleh Admin.
              </p>

              {/* Bank Transfer Guide Box */}
              <div className="mt-3.5 bg-slate-950/55 border border-white/5 rounded-xl p-3.5 space-y-2.5">
                <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider">
                  🏦 Panduan Pembayaran Transfer Bank Manual (Diatur oleh Admin)
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs leading-tight font-sans">
                  <div>
                    <span className="block text-[9px] text-slate-500 uppercase tracking-widest">Bank Penerima</span>
                    <strong className="text-slate-200 mt-0.5 block font-mono text-xs">{settings.bankInfoBank}</strong>
                  </div>
                  <div>
                    <span className="block text-[9px] text-slate-500 uppercase tracking-widest">Nomor Rekening</span>
                    <strong className="text-emerald-400 mt-0.5 block font-mono text-xs">{settings.bankInfoNumber}</strong>
                  </div>
                  <div>
                    <span className="block text-[9px] text-slate-500 uppercase tracking-widest">Atas Nama (A/N)</span>
                    <strong className="text-slate-200 mt-0.5 block font-mono text-xs">{settings.bankInfoName}</strong>
                  </div>
                </div>
                <div className="pt-1.5 border-t border-white/5 text-[10px] text-slate-400 flex flex-wrap items-center gap-1">
                  <span>Nominal transfer: </span>
                  <strong className="text-amber-400 font-sans">Sesuai nominal harga tiket webinar masing-masing</strong>
                  <span>. Setelah transfer, klik tombol konfirmasi WA di bawah ini dengan melampirkan bukti setor:</span>
                </div>
              </div>
            </div>

            {/* Practical WhatsApp Shortcuts */}
            <div className="flex flex-col gap-2 shrink-0 md:w-56 font-sans">
              <span className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold">Grup Hubungi Admin via WA:</span>
              {unpaidWebinars.map(webinar => {
                const price = webinar.price !== undefined ? webinar.price : (settings.midtransConnected ? settings.ticketPrice : 0);
                const waUrl = `https://wa.me/6281803100222?text=${encodeURIComponent(
                  `Halo Admin, saya ingin konfirmasi bukti transfer pembayaran webinar "${webinar.title}" sebesar Rp ${price.toLocaleString('id-ID')} untuk akun ${currentUser.email}. Berikut bukti setoran saya.`
                )}`;
                return (
                  <a
                    key={webinar.id}
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between px-3 py-2 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/20 rounded-xl text-[10px] font-bold transition-all duration-200"
                    title={`Konfirmasi Pembayaran ${webinar.title} via WhatsApp 081803100222`}
                  >
                    <span className="truncate pr-2">Konfirmasi {webinar.title}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left column - Webinar lists */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Active play room (Streaming Screen & Chat) */}
          {selectedWebinarToPlay ? (
            <div className="glass border border-white/15 rounded-2xl p-4 space-y-4 shadow-2xl accent-glow-indigo" id="broadcast-room">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-rose-500 rounded-full animate-ping"></span>
                    <span className="text-xs font-semibold text-rose-450 uppercase font-mono">Live Siaran Interaktif</span>
                  </div>
                  <h2 className="text-base font-bold text-slate-100 font-sans mt-0.5">{selectedWebinarToPlay.title}</h2>
                </div>
                <button
                  onClick={() => setActivePlayWebinarId(null)}
                  id="btn-close-play"
                  className="px-3 py-1 bg-white/5 border border-white/10 hover:bg-white/10 text-xs text-slate-300 rounded-lg transition-all cursor-pointer"
                >
                  Tutup Ruangan
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                
                {/* Audio/Video screen */}
                <div className="md:col-span-7 space-y-3">
                  <div className="aspect-video bg-slate-950/70 border border-white/10 rounded-xl overflow-hidden relative flex items-center justify-center">
                    {selectedWebinarToPlay.status === 'live' ? (
                      settings.restrictZoomUnpaid && (selectedWebinarToPlay.price !== undefined ? selectedWebinarToPlay.price : (settings.midtransConnected ? settings.ticketPrice : 0)) > 0 && !currentUser.paidWebinars?.includes(selectedWebinarToPlay.id) ? (
                        <div className="text-center p-6 max-w-sm mx-auto">
                          <Lock className="w-12 h-12 text-rose-500 mx-auto mb-3 animate-bounce" />
                          <h4 className="text-sm font-bold text-rose-305 font-sans">Akses Rapat Zoom Terkunci</h4>
                          <p className="text-[11px] text-slate-300 mt-2 font-sans leading-relaxed">
                            Sesuai pengaturan sesi berbayar, Anda wajib melunasi pendaftaran kelas sebesar <strong className="text-emerald-400 font-bold font-sans">Rp {(selectedWebinarToPlay.price !== undefined ? selectedWebinarToPlay.price : settings.ticketPrice).toLocaleString('id-ID')}</strong> sebelum bergabung ke Zoom.
                          </p>
                          <div className="mt-4 flex justify-center">
                            <button
                              onClick={() => setPayingWebinarId(selectedWebinarToPlay.id)}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-555 text-white text-xs font-bold rounded-xl transition-all inline-flex items-center space-x-1.5 shadow-md shadow-emerald-500/15 cursor-pointer font-sans"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              <span>Bayar & Buka Zoom</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center p-4">
                          <PlayCircle className="w-14 h-14 text-indigo-400 mx-auto animate-pulse mb-3" />
                          <p className="text-sm font-semibold text-slate-200">Menghubungkan ke Zoom Host...</p>
                          <p className="text-[10px] text-slate-400 mt-1 font-mono">Muted by Host. Mute: OFF</p>
                          <div className="mt-4 flex justify-center space-x-2">
                            <a
                              href={selectedWebinarToPlay.zoomJoinUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-500 transition-all inline-flex items-center space-x-1 accent-glow"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>Buka Zoom App</span>
                            </a>
                          </div>
                        </div>
                      )
                    ) : selectedWebinarToPlay.status === 'completed' ? (
                      settings.restrictZoomUnpaid && (selectedWebinarToPlay.price !== undefined ? selectedWebinarToPlay.price : (settings.midtransConnected ? settings.ticketPrice : 0)) > 0 && !currentUser.paidWebinars?.includes(selectedWebinarToPlay.id) ? (
                        <div className="text-center p-6 max-w-sm mx-auto">
                          <Lock className="w-12 h-12 text-rose-500 mx-auto mb-3 animate-bounce" />
                          <h4 className="text-sm font-bold text-rose-300 font-sans">Rekaman & Materi Terkunci</h4>
                          <p className="text-[11px] text-slate-300 mt-2 font-sans leading-relaxed">
                            Sesuai kebijakan pendaftaran berbayar, akses rekaman dan materi pelajaran eksklusif untuk webinar ini terkunci. Anda wajib melunasi biaya pendaftaran sebesar <strong className="text-emerald-400 font-bold font-sans">Rp {(selectedWebinarToPlay.price !== undefined ? selectedWebinarToPlay.price : settings.ticketPrice).toLocaleString('id-ID')}</strong> untuk membuka seluruh materi dan video rekaman.
                          </p>
                          <div className="mt-4 flex justify-center">
                            <button
                              onClick={() => setPayingWebinarId(selectedWebinarToPlay.id)}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-555 text-white text-xs font-bold rounded-xl transition-all inline-flex items-center space-x-1.5 shadow-md shadow-emerald-500/15 cursor-pointer font-sans"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              <span>Bayar Tiket Sekarang</span>
                            </button>
                          </div>
                        </div>
                      ) : selectedWebinarToPlay.recordingUrl ? (
                        <iframe
                          className="w-full h-full"
                          src={getYouTubeEmbedUrl(selectedWebinarToPlay.recordingUrl)}
                          title="Rekaman Webinar"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      ) : (
                        <div className="text-center p-6 my-auto flex flex-col items-center justify-center h-full">
                          <Video className="w-12 h-12 text-indigo-400/40 mb-2 animate-pulse" />
                          <p className="text-xs font-bold text-slate-300 font-sans">Rekaman Siaran Belum Diunggah</p>
                          <p className="text-[10px] text-slate-400 mt-1 max-w-xs mx-auto font-sans">
                            Admin belum mengaktifkan / memperbarui tautan video rekaman untuk kelas ini. Sembari menunggu, Anda dapat mengakses berkas & materi pelajaran lengkap di bawah ini.
                          </p>
                        </div>
                      )
                    ) : (
                      <div className="text-center p-4">
                        <Calendar className="w-12 h-12 text-violet-400 mx-auto mb-3" />
                        <p className="text-xs text-slate-400">Siaran ini berlangsung pada {selectedWebinarToPlay.date} jam {selectedWebinarToPlay.time}</p>
                      </div>
                    )}
                  </div>

                  {/* Presence absensi widget */}
                  {settings.restrictZoomUnpaid && !currentUser.paidWebinars?.includes(selectedWebinarToPlay.id) ? (
                    <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center space-x-3 text-slate-300 font-sans">
                      <Lock className="w-5 h-5 text-rose-500 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-rose-400">Absensi & Sertifikat Terkunci</p>
                        <p className="text-[10px] text-slate-400">Akses absensi dan sertifikat terkunci hingga biaya pendaftaran diselesaikan.</p>
                      </div>
                    </div>
                  ) : !currentUser.checkedIn.includes(selectedWebinarToPlay.id) ? (
                    <div className="p-3 bg-indigo-500/10 border border-indigo-500/25 rounded-xl flex items-center justify-between font-sans">
                      <div className="flex items-center space-x-2">
                        <QrCode className="w-5 h-5 text-indigo-400" />
                        <div>
                          <p className="text-xs font-bold text-slate-200">Presensi Kehadiran & Sertifikat</p>
                          <p className="text-[10px] text-slate-405">Lakukan absensi untuk membuka akses penerbitan e-sertifikat.</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleCheckIn(selectedWebinarToPlay.id)}
                        id="btn-quick-checkin"
                        className="px-3 py-1 bg-indigo-650 text-white font-bold text-[10px] uppercase rounded-lg hover:bg-indigo-500 transition-all cursor-pointer accent-glow animate-pulse font-sans"
                      >
                        Absen Sekarang
                      </button>
                    </div>
                  ) : (
                    <div className="p-3 glass border border-white/10 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between justify-start gap-2.5 shadow-md font-sans">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-indigo-400 animate-in fade-in duration-300" />
                        <div>
                          <p className="text-xs font-bold text-indigo-400">Sudah Melakukan Absensi</p>
                          {selectedWebinarToPlay.status === 'completed' ? (
                            <p className="text-[10px] text-slate-400 font-sans">Sertifikat kelulusan webinar sudah siap diunduh.</p>
                          ) : (
                            <p className="text-[10px] text-slate-400 font-sans">Sertifikat akan muncul otomatis jika webinar sudah dilaksanakan oleh Admin / selesai.</p>
                          )}
                        </div>
                      </div>
                      {selectedWebinarToPlay.status === 'completed' ? (
                        <button
                          onClick={() => {
                            const certInfo = currentUser.certificates.find(c => c.webinarId === selectedWebinarToPlay.id);
                            if (certInfo) {
                              setActiveCert({
                                webinarTitle: selectedWebinarToPlay.title,
                                code: certInfo.code,
                                date: certInfo.issuedAt
                              });
                            }
                          }}
                          id="btn-view-cert"
                          className="px-3 py-1 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[10px] hover:bg-indigo-500/20 transition-all uppercase rounded font-bold cursor-pointer font-sans"
                        >
                          Lihat Sertifikat
                        </button>
                      ) : (
                        <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-1 rounded font-medium flex items-center space-x-1 border border-white/5 cursor-not-allowed">
                          <Lock className="w-3 h-3 text-rose-450" />
                          <span>Belum Dilaksanakan</span>
                        </span>
                      )}
                    </div>
                  )}

                  {/* Materi Belajar Eksklusif */}
                  {settings.restrictZoomUnpaid && (selectedWebinarToPlay.price !== undefined ? selectedWebinarToPlay.price : (settings.midtransConnected ? settings.ticketPrice : 0)) > 0 && !currentUser.paidWebinars?.includes(selectedWebinarToPlay.id) ? (
                    <div className="p-4 bg-slate-950/40 border border-rose-500/10 rounded-xl space-y-2">
                      <div className="flex items-center space-x-2 text-rose-300">
                        <Lock className="w-4 h-4 text-rose-500 animate-pulse" />
                        <span className="text-xs font-bold font-sans">Materi Belajar (Video, Audio & PDF) Terkunci</span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                        Sesuai kebijakan berbayar, seluruh materi Slide PDF, Audio podcast penjelasan narasumber, serta Video alternatif pembelajaran luar dari YouTube/sumber luar lainnya terkunci. Selesaikan pembayaran tiket sebesar <strong className="text-emerald-400 font-bold font-sans">Rp {(selectedWebinarToPlay.price !== undefined ? selectedWebinarToPlay.price : settings.ticketPrice).toLocaleString('id-ID')}</strong> untuk membuka akses materi lengkap.
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 glass rounded-xl border border-white/5 space-y-4 shadow-lg">
                      <div className="flex items-center space-x-2 text-indigo-400 border-b border-white/5 pb-2">
                        <BookOpen className="w-4 h-4 text-indigo-400" />
                        <h3 className="text-xs font-bold uppercase tracking-wider font-mono">Materi Pembelajaran Kelas (Eksklusif Lunas)</h3>
                      </div>

                      <div className="space-y-4">
                        {/* PDF / Slide */}
                        <div className="p-3 bg-white/5 border border-white/5 rounded-xl flex items-center justify-between font-sans">
                          <div className="flex items-center space-x-3 max-w-[70%]">
                            <div className="p-2 bg-indigo-500/15 text-indigo-300 rounded-lg shrink-0">
                              <FileText className="w-5 h-5" />
                            </div>
                            <div className="truncate text-left">
                              <span className="text-xs font-bold text-slate-200 block">Slide Presentasi PPT/PDF</span>
                              <span className="text-[9px] text-slate-400 block truncate">
                                {selectedWebinarToPlay.materialUrl ? selectedWebinarToPlay.materialUrl : 'Tautan PDF atau Slide Google Belum diunggah'}
                              </span>
                            </div>
                          </div>
                          {selectedWebinarToPlay.materialUrl ? (
                            <a
                              href={selectedWebinarToPlay.materialUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-550 text-white text-[10px] font-bold uppercase rounded-lg transition-all flex items-center space-x-1 cursor-pointer font-sans shadow shadow-indigo-600/25 shrink-0 animate-pulse"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Unduh PDF</span>
                            </a>
                          ) : (
                            <span className="text-[9px] text-slate-500 italic shrink-0">Segera Hadir</span>
                          )}
                        </div>

                        {/* AUDIO LESSON */}
                        <div className="p-3 bg-white/5 border border-white/5 rounded-xl space-y-2 font-sans">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3 max-w-[70%]">
                              <div className="p-2 bg-emerald-500/15 text-emerald-300 rounded-lg shrink-0">
                                <Volume2 className="w-5 h-5 animate-pulse" />
                              </div>
                              <div className="truncate text-left">
                                <span className="text-xs font-bold text-slate-200 block">Penjelasan Audio Podcast</span>
                                <span className="text-[9px] text-slate-400 block truncate">
                                  {selectedWebinarToPlay.materialAudioUrl ? selectedWebinarToPlay.materialAudioUrl : 'Tautan audio penjelasan materi belum diunggah'}
                                </span>
                              </div>
                            </div>
                            {selectedWebinarToPlay.materialAudioUrl ? (
                              <a
                                href={selectedWebinarToPlay.materialAudioUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold uppercase rounded-lg transition-all flex items-center space-x-1 cursor-pointer font-sans shadow shrink-0"
                              >
                                <ExternalLink className="w-3 h-3" />
                                <span>Dengar Link</span>
                              </a>
                            ) : (
                              <span className="text-[9px] text-slate-500 italic shrink-0">Segera Hadir</span>
                            )}
                          </div>
                          {selectedWebinarToPlay.materialAudioUrl && (
                            <div className="bg-slate-950/60 p-2 rounded-lg border border-white/5">
                              <audio 
                                src={selectedWebinarToPlay.materialAudioUrl} 
                                controls 
                                className="w-full h-8 outline-none text-xs rounded"
                              />
                            </div>
                          )}
                        </div>

                        {/* VIDEO SUPLEN / YOUTUBE */}
                        <div className="p-3 bg-white/5 border border-white/5 rounded-xl space-y-3 font-sans">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3 max-w-[70%]">
                              <div className="p-2 bg-rose-500/15 text-rose-300 rounded-lg shrink-0">
                                <Tv className="w-5 h-5" />
                              </div>
                              <div className="truncate text-left">
                                <span className="text-xs font-bold text-slate-200 block">Video Pembelajaran Suplemen</span>
                                <span className="text-[9px] text-slate-400 block truncate">
                                  {selectedWebinarToPlay.materialVideoUrl ? selectedWebinarToPlay.materialVideoUrl : 'Tautan video alternatif belum diunggah'}
                                </span>
                              </div>
                            </div>
                            {selectedWebinarToPlay.materialVideoUrl ? (
                              <a
                                href={selectedWebinarToPlay.materialVideoUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold uppercase rounded-lg transition-all flex items-center space-x-1 cursor-pointer font-sans shadow shrink-0"
                              >
                                <ExternalLink className="w-3" />
                                <span>Buka Link</span>
                              </a>
                            ) : (
                              <span className="text-[9px] text-slate-500 italic shrink-0">Segera Hadir</span>
                            )}
                          </div>
                          {selectedWebinarToPlay.materialVideoUrl && (
                            <div className="aspect-video w-full rounded-xl overflow-hidden border border-white/5 bg-slate-950 flex items-center justify-center">
                              {selectedWebinarToPlay.materialVideoUrl.includes('youtube.com') || selectedWebinarToPlay.materialVideoUrl.includes('youtu.be') ? (
                                <iframe
                                  className="w-full h-full"
                                  src={getYouTubeEmbedUrl(selectedWebinarToPlay.materialVideoUrl)}
                                  title="Video Materi Pembelajaran"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                ></iframe>
                              ) : (
                                <div className="text-center p-4">
                                  <Video className="w-8 h-8 text-rose-400 mx-auto mb-2" />
                                  <span className="text-xs text-slate-350 block mb-2 font-sans">Materi Video Eksternal</span>
                                  <a
                                    href={selectedWebinarToPlay.materialVideoUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-3 py-1 bg-white/10 hover:bg-white/15 text-[10px] uppercase font-bold text-slate-205 rounded-lg inline-flex items-center space-x-1 cursor-pointer font-sans"
                                  >
                                    <span>Buka Materi Video</span>
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                      </div>
                    </div>
                  )}

                  {/* Speaker card and summary */}
                  <div className="p-4 glass rounded-xl border border-white/5 space-y-3 shadow-lg">
                    <h3 className="text-sm font-bold text-slate-200">Tentang Webinar Ini</h3>
                    <p className="text-xs text-slate-350 leading-relaxed font-sans">{selectedWebinarToPlay.description}</p>
                    
                    {selectedWebinarToPlay.summary && (
                      <div className="pt-3 border-t border-white/5 space-y-1">
                        <h4 className="text-[11px] font-semibold text-indigo-400 font-mono tracking-wider">RANGKUMAN UTAMA:</h4>
                        <p className="text-xs text-slate-300 italic leading-normal font-mono bg-slate-950/40 p-2.5 rounded-lg border border-white/5">
                          "{selectedWebinarToPlay.summary}"
                        </p>
                      </div>
                    )}

                    <div className="pt-3 border-t border-white/5 flex items-center space-x-3">
                      <div className="w-10 h-10 bg-indigo-500/10 text-indigo-300 font-bold border border-indigo-500/20 rounded-full flex items-center justify-center">
                        {selectedWebinarToPlay.speaker.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-100">{selectedWebinarToPlay.speaker}</h4>
                        <p className="text-[10px] text-slate-400">{selectedWebinarToPlay.speakerTitle}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chatbox section */}
                <div className="md:col-span-5 h-[380px] md:h-auto">
                  <ChatBox webinar={selectedWebinarToPlay} currentUser={currentUser} />
                </div>

              </div>
            </div>
          ) : null}

          {/* Webinar Saya (Registered) */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-200 font-sans flex items-center space-x-2">
              <Bookmark className="w-5 h-5 text-indigo-400 animate-pulse" />
              <span>Webinar yang Saya Ikuti ({registeredWebinars.length})</span>
            </h2>

            {registeredWebinars.length === 0 ? (
              <div className="glass border border-white/5 border-dashed rounded-2xl p-8 text-center shadow-lg">
                <span className="text-2xl text-slate-500">🗓️</span>
                <p className="text-xs text-slate-300 mt-2 font-sans">Anda belum mendaftar ke webinar manapun.</p>
                <p className="text-[10px] text-slate-400 mt-1 font-sans">Daftar webinar menarik di bawah untuk mulai belajar!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {registeredWebinars.map((webinar) => (
                  <div key={webinar.id} className="glass border border-white/10 rounded-xl p-4 flex flex-col justify-between hover:border-indigo-500/30 hover:scale-[1.01] transition-all duration-300 shadow-md">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase border ${
                          webinar.status === 'live' 
                            ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30 animate-pulse'
                            : webinar.status === 'completed'
                              ? 'bg-white/5 text-slate-400 border-white/5'
                              : 'bg-violet-950/40 text-violet-300 border-violet-500/10'
                        }`}>
                          {webinar.status}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">{webinar.time}</span>
                      </div>
                      
                      <h3 className="text-xs font-bold text-slate-100 font-sans leading-snug hover:text-indigo-400 transition-colors">
                        {webinar.title}
                      </h3>

                      <p className="text-[10px] font-mono text-slate-400 mt-1">Narasumber: <strong className="text-slate-350">{webinar.speaker}</strong></p>

                      {/* Payment Status Badge inside card */}
                      {settings.restrictZoomUnpaid && (
                        <div className="mt-2.5 flex items-center justify-between bg-slate-950/30 border border-white/5 p-2 rounded-lg font-sans">
                          <span className="text-[9px] text-slate-400 font-medium">TIKET:</span>
                          {currentUser.paidWebinars?.includes(webinar.id) ? (
                            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider flex items-center space-x-1">
                              <Check className="w-2.5 h-2.5" />
                              <span>Lunas</span>
                            </span>
                          ) : (
                            <div className="flex items-center space-x-1.5">
                              <span className="bg-amber-500/10 text-amber-400 border border-amber-500/15 px-1.5 py-0.5 rounded text-[8px] font-semibold uppercase tracking-wider">
                                Belum Bayar
                              </span>
                              <button
                                onClick={() => setPayingWebinarId(webinar.id)}
                                className="px-2 py-0.5 bg-indigo-600/35 hover:bg-indigo-550 text-indigo-200 hover:text-white rounded text-[8px] font-bold uppercase transition-all cursor-pointer"
                              >
                                Bayar
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                      {/* Material Download */}
                      {settings.restrictZoomUnpaid && !currentUser.paidWebinars?.includes(webinar.id) ? (
                        <span className="text-[10px] text-rose-400 flex items-center space-x-1 font-sans font-semibold cursor-not-allowed animate-pulse" title="Selesaikan Pembayaran untuk membuka materi">
                          <Lock className="w-3.5 h-3.5 text-rose-500 inline shrink-0" />
                          <span>Materi Terkunci</span>
                        </span>
                      ) : (
                        <div className="flex items-center space-x-3.5">
                          {webinar.materialUrl && (
                            <a
                              href={webinar.materialUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center space-x-1 hover:underline cursor-pointer font-sans font-medium"
                              title="Unduh Slide PDF"
                            >
                              <FileText className="w-3.5 h-3.5 shrink-0" />
                              <span>PDF</span>
                            </a>
                          )}
                          {webinar.materialAudioUrl && (
                            <a
                              href={webinar.materialAudioUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] text-emerald-400 hover:text-emerald-300 flex items-center space-x-1 hover:underline cursor-pointer font-sans font-medium"
                              title="Dengar Audio Podcast"
                            >
                              <Volume2 className="w-3.5 h-3.5 shrink-0" />
                              <span>Audio</span>
                            </a>
                          )}
                          {webinar.materialVideoUrl && (
                            <a
                              href={webinar.materialVideoUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] text-rose-400 hover:text-rose-300 flex items-center space-x-1 hover:underline cursor-pointer font-sans font-medium"
                              title="Tonton Video Suplemen"
                            >
                              <Tv className="w-3.5 h-3.5 shrink-0" />
                              <span>Video</span>
                            </a>
                          )}
                          {!webinar.materialUrl && !webinar.materialAudioUrl && !webinar.materialVideoUrl && (
                            <span className="text-[9px] text-slate-500 italic">Materi belum diupload</span>
                          )}
                        </div>
                      )}

                      {/* Absen / Ruang */}
                      <div className="flex space-x-2">
                        {webinar.status !== 'upcoming' && (
                          <button
                            onClick={() => {
                              setActivePlayWebinarId(webinar.id);
                              // Scroll into view
                              setTimeout(() => {
                                document.getElementById('broadcast-room')?.scrollIntoView({ behavior: 'smooth' });
                              }, 100);
                            }}
                            id={`btn-enter-room-${webinar.id}`}
                            className="bg-indigo-650 hover:bg-indigo-550 text-white px-2.5 py-1 text-[10px] font-bold uppercase rounded-lg transition-all flex items-center space-x-1 cursor-pointer accent-glow"
                          >
                            <Video className="w-3 h-3" />
                            <span>Buka Ruang</span>
                          </button>
                        )}

                        {webinar.status === 'upcoming' && (
                          <button
                            onClick={() => setQrWebinarId(webinar.id)}
                            id={`btn-get-qr-${webinar.id}`}
                            className="bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 px-2 py-1 text-[10px] rounded transition flex items-center justify-center cursor-pointer">
                            <QrCode className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cari Kelas Baru */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h2 className="text-lg font-bold text-slate-200 font-sans flex items-center space-x-2">
                <Search className="w-5 h-5 text-indigo-404" />
                <span>Eksplorasi Webinar Baru</span>
              </h2>
              
              {/* Search input */}
              <div className="relative max-w-xs">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <Search className="w-3.5 h-3.5" />
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari tema, narasumber..."
                  id="search-webinar-input"
                  className="w-full bg-slate-950/40 border border-white/10 focus:border-indigo-500 text-xs text-slate-200 rounded-lg pl-8 pr-3 py-1.5 outline-none transition-all placeholder:text-slate-500 focus:ring-1 focus:ring-indigo-500/15"
                />
              </div>
            </div>

            {availableWebinars.length === 0 ? (
              <div className="glass border border-white/5 space-y-2 rounded-2xl p-6 text-center shadow-md">
                <p className="text-xs text-slate-400 font-sans">Tidak ada webinar lain yang tersedia saat ini.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {availableWebinars.map((webinar) => (
                  <div key={webinar.id} className="glass border border-white/10 rounded-xl p-5 hover:border-indigo-500/25 transition-all">
                    <div className="md:flex md:items-center md:justify-between gap-4">
                      <div className="flex-1 space-y-1.5">
                        <div className="flex items-center space-x-2 flex-wrap gap-1.5">
                          <span className="bg-white/5 text-slate-300 px-2 py-0.5 rounded text-[9px] font-mono border border-white/5">
                            📅 {webinar.date}
                          </span>
                          <span className="bg-white/5 text-slate-300 px-2 py-0.5 rounded text-[9px] font-mono border border-white/5">
                            ⏰ {webinar.time}
                          </span>
                        </div>
                        
                        <h3 className="text-sm font-bold text-slate-200 font-sans">{webinar.title}</h3>
                        
                        <p className="text-xs text-slate-400 italic">"{webinar.description}"</p>
                        
                        <div className="flex items-center space-x-1.5 pt-1.5">
                          <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse"></span>
                          <span className="text-[10px] text-slate-400 font-sans">
                            Narasumber: <strong className="text-slate-200">{webinar.speaker}</strong> ({webinar.speakerTitle})
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 md:mt-0 shrink-0 text-right space-y-2">
                        <span className="block text-[10px] text-slate-400 font-mono text-center md:text-right">{webinar.registeredCount} UMKM Terdaftar</span>
                        <button
                          onClick={() => handleRegisterWebinar(webinar.id)}
                          id={`btn-rsvp-${webinar.id}`}
                          className="w-full md:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase rounded-xl transition-all shadow-md shadow-indigo-650/15 cursor-pointer accent-glow"
                        >
                          Daftar Kelas Webinar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
           </div>

        </div>

        {/* Right column - Certificates & Quick Tools */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Certificate listing info */}
          <div className="glass border border-white/10 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center space-x-2 text-indigo-400 border-b border-white/5 pb-3 mb-4">
              <Award className="w-5 h-5 shrink-0" />
              <h3 className="text-sm font-bold text-slate-200">E-Sertifikat Kelulusan Saya</h3>
            </div>

            {(() => {
              const visibleCertificates = currentUser.certificates.filter(cert => {
                const matchingWebinar = webinars.find(w => w.id === cert.webinarId);
                if (!matchingWebinar) return false;
                if (settings.restrictZoomUnpaid && !currentUser.paidWebinars?.includes(cert.webinarId)) {
                  return false;
                }
                if (matchingWebinar.status !== 'completed') {
                  return false;
                }
                return true;
              });

              if (visibleCertificates.length === 0) {
                return (
                  <div className="text-center py-4 text-slate-400">
                    <span className="text-3xl">📜</span>
                    <p className="text-xs mt-2 font-sans">Belum ada sertifikat diterbitkan.</p>
                    <p className="text-[9px] text-slate-500 mt-1 italic font-sans font-sans">Absensi di dalam siaran webinar live atau rekaman yang selesai dikerjakan.</p>
                  </div>
                );
              }

              return (
                <div className="space-y-3">
                  {visibleCertificates.map((cert) => {
                    const matchingWebinar = webinars.find(w => w.id === cert.webinarId);
                    if (!matchingWebinar) return null;

                    return (
                      <div 
                        key={cert.webinarId}
                        className="bg-white/5 border border-white/5 rounded-xl p-3.5 space-y-2 hover:bg-white/10 transition-colors"
                      >
                        <span className="block text-[9px] font-mono text-indigo-400 font-semibold">{cert.code}</span>
                        <h4 className="text-xs font-bold text-slate-200 leading-snug">{matchingWebinar.title}</h4>
                        <p className="text-[10px] text-slate-400">Diterbitkan pada: {cert.issuedAt}</p>
                        
                        <button
                          onClick={() => {
                            setActiveCert({
                              webinarTitle: matchingWebinar.title,
                              code: cert.code,
                              date: cert.issuedAt
                            });
                          }}
                          id={`btn-print-cert-${cert.webinarId}`}
                          className="w-full mt-2 py-1.5 bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 font-bold text-[10px] uppercase tracking-wider rounded-lg transition-all cursor-pointer font-sans border border-indigo-500/20"
                        >
                          Buka Sertifikat Resmi
                        </button>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>

          {/* Quick FAQ / Info */}
          <div className="glass border border-white/10 rounded-2xl p-5 space-y-3 shadow-lg">
            <h4 className="text-xs font-bold text-indigo-400 font-mono tracking-wide uppercase">💡 Ketentuan E-Sertifikat</h4>
            <ol className="text-[11px] text-slate-300 space-y-2 list-decimal list-inside leading-relaxed font-sans">
              <li>Mendaftarlah pada kelas/topic webinar yang ingin Anda ikuti.</li>
              <li>Wajib hadir di siaran (atau lihat rekaman ulang) lalu tekan tombol <strong>"Absen Sekarang"</strong>.</li>
              <li>Sertifikat otomatis terbit di dashboard dan siap di-print/download.</li>
              <li>Sertifikat ini diakui secara resmi di UMKM Center Indonesia.</li>
            </ol>
          </div>

        </div>
      </div>

      {/* QR Code Attendee Absensi Overlay Modal */}
      {qrWebinarId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm cursor-pointer" onClick={() => setQrWebinarId(null)}></div>
          <div className="relative glass border border-white/10 rounded-2xl max-w-sm w-full p-6 text-center z-13 shadow-2xl">
            <span className="text-indigo-400 text-xs font-sans font-bold block mb-1">PRESENSI ABSENSI</span>
            <h3 className="text-sm font-bold text-slate-100">QR Code Tiket Webinar</h3>
            <p className="text-[11px] text-slate-400 mt-1 font-sans">Tunjukkan QR Code ini ke petugas/moderator di lokasi, atau klik tombol simulasi di bawah untuk check-in langsung.</p>
            
            {/* Visual QR Code Box */}
            <div className="my-6 mx-auto w-40 h-40 bg-white p-3 rounded-xl border border-slate-700 flex flex-col items-center justify-center relative">
              <div className="grid grid-cols-5 gap-1.5 w-full h-full opacity-90">
                {Array.from({ length: 25 }).map((_, i) => (
                  <div key={i} className={`rounded-sm ${(i + 4) % 3 === 0 || (i % 7 === 0) ? 'bg-slate-950' : 'bg-transparent'}`}></div>
                ))}
              </div>
              <span className="absolute bottom-1 right-2 text-[8px] font-mono text-slate-950 font-bold">UMKM ONLINE</span>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => handleCheckIn(qrWebinarId)}
                id="btn-trigger-scan"
                className="w-full py-2 bg-indigo-650 hover:bg-indigo-550 text-white font-bold text-xs rounded-xl tracking-wider uppercase transition-all cursor-pointer shadow-md accent-glow"
              >
                Simulasi Scan QR Tiket
              </button>
              <button
                onClick={() => setQrWebinarId(null)}
                id="btn-close-qr"
                className="w-full py-2 bg-white/5 border border-white/10 text-slate-300 text-xs rounded-xl hover:text-white transition-all cursor-pointer"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Real Visual E-Certificate overlay */}
      {activeCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm cursor-pointer" onClick={() => setActiveCert(null)}></div>
          <div className="relative bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full text-center z-13 overflow-hidden shadow-2xl animate-in font-sans">
            
            {/* Certificate graphics border in CSS */}
            <div className="p-6 sm:p-10 bg-gradient-to-br from-amber-50 to-amber-100 border-[16px] border-slate-900 text-slate-900 rounded-lg">
              <div className="border border-double border-amber-800/40 p-6 flex flex-col items-center justify-between">
                
                {/* Logo from settings */}
                <div className="mb-1 flex justify-center items-center">
                  {settings.landingLogoUrl ? (
                    <img 
                      src={settings.landingLogoUrl} 
                      className="h-10 sm:h-12 w-auto object-contain" 
                      alt="Webinar Logo Prefix Suffix" 
                      referrerPolicy="no-referrer" 
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-amber-800/10 text-amber-900 flex items-center justify-center font-bold text-lg border border-amber-800/20">
                      🎓
                    </div>
                  )}
                </div>

                {/* Ribbon decoration top */}
                <span className="text-[10px] font-extrabold text-amber-800 tracking-widest uppercase font-mono mb-1.5 mt-1">
                  📜 SERTIFIKAT KELULUSAN RESMI
                </span>
                
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-amber-950 px-2 tracking-wide text-center">
                  UMKM Digital Academy Indonesia
                </h2>
                
                <div className="w-[100px] h-0.5 bg-amber-800/35 my-3"></div>
 
                <p className="text-[10px] text-slate-700 italic font-mono mb-0.5">Diberikan dengan hormat kepada:</p>
                
                <h3 className="text-xl sm:text-2xl font-sans font-extrabold text-slate-950 tracking-tight my-2.5">
                  {currentUser.namaLengkap}
                </h3>

                <p className="text-[10px] sm:text-xs text-slate-700 max-w-md mx-auto leading-relaxed">
                  Atas partisipasi aktif, kehadiran penuh, dan penyelesaian tugas materi dalam modul pembelajaran:
                </p>

                <h4 className="text-xs sm:text-sm font-bold text-amber-900 my-2.5 font-sans px-4 bg-amber-50/70 border border-amber-800/10 py-1.5 rounded max-w-lg">
                  {activeCert.webinarTitle}
                </h4>

                <p className="text-[10px] sm:text-xs text-slate-700">
                  yang diselenggarakan secara daring oleh <strong>UMKM Online Center Indonesia</strong>.
                </p>

                {/* Aligned Footer badge of ID, Verified Seal, and Date as requested - now positioned ABOVE signatures */}
                <div className="grid grid-cols-3 gap-2 w-full mt-6 pt-4 border-t border-dashed border-amber-800/25 items-center text-center">
                  {/* Left: ID */}
                  <div className="flex flex-col justify-center">
                    <span className="block text-[7px] sm:text-[8px] font-bold text-slate-600 font-mono tracking-wide">ID SERTIFIKAT</span>
                    <span className="block text-[9px] sm:text-xs font-mono font-bold text-amber-950 mt-0.5 select-all">{activeCert.code}</span>
                  </div>

                  {/* Center: Seal Image customizable from Super Admin */}
                  <div className="flex flex-col items-center justify-center">
                    {settings.certSealImgUrl ? (
                      <img 
                        src={settings.certSealImgUrl} 
                        className="h-11 sm:h-12 w-auto object-contain mb-0.5" 
                        alt="Verified Seal" 
                        referrerPolicy="no-referrer" 
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full border-2 border-double border-amber-700 flex items-center justify-center text-[8px] text-amber-850 bg-amber-150 font-black font-serif shadow-sm">
                        GOLD
                      </div>
                    )}
                    <span className="text-[7px] font-extrabold tracking-wider mt-1 text-amber-900 uppercase font-mono">
                      VERIFIED ONLINE
                    </span>
                  </div>

                  {/* Right: Issued Date */}
                  <div className="flex flex-col justify-center">
                    <span className="block text-[7px] sm:text-[8px] font-bold text-slate-600 font-mono tracking-wide">TANGGAL TERBIT</span>
                    <span className="block text-[9px] sm:text-xs font-sans font-bold text-amber-950 mt-0.5">{activeCert.date}</span>
                  </div>
                </div>

                {/* 3-Column Narasumber / Signatures - now positioned BELOW ID & Seal details */}
                {(() => {
                  const s1Active = settings.certSpeaker1Active !== false;
                  const s2Active = settings.certSpeaker2Active !== false;
                  const s3Active = settings.certSpeaker3Active !== false;
                  const activeCount = [s1Active, s2Active, s3Active].filter(Boolean).length;
                  const gridColsClass = activeCount === 1 ? 'grid-cols-1' : activeCount === 2 ? 'grid-cols-2' : 'grid-cols-3';

                  if (activeCount === 0) return null;

                  return (
                    <div className={`grid ${gridColsClass} gap-3 w-full mt-5 pt-4 border-t border-amber-800/15 text-center`}>
                      {/* Column Narasumber 1 */}
                      {s1Active && (
                        <div className="flex flex-col items-center justify-between min-h-[85px]">
                          {settings.certSpeaker1Title && settings.certSpeaker1Title.trim() !== "" ? (
                            <span className="block text-[7px] text-slate-500 uppercase tracking-widest font-extrabold font-mono">{settings.certSpeaker1Title}</span>
                          ) : (
                            <div className="h-[10px]"></div>
                          )}
                          <div className="my-1.5 min-h-[36px] flex items-center justify-center">
                            {settings.certSpeaker1Sign ? (
                              settings.certSpeaker1Sign.startsWith('data:image') ? (
                                <img src={settings.certSpeaker1Sign} alt="Sign 1" className="h-8 object-contain max-w-[80px]" referrerPolicy="no-referrer" />
                              ) : (
                                <span className="font-serif italic font-extrabold text-amber-955 text-xs tracking-wide px-1 border-b border-amber-800/10 leading-none">{settings.certSpeaker1Sign}</span>
                              )
                            ) : (
                              <span className="font-serif italic font-extrabold text-amber-955 text-xs tracking-wide px-1 border-b border-amber-800/10 leading-none">S. Uno</span>
                            )}
                          </div>
                          <span className="block text-[8px] sm:text-[9px] font-bold text-slate-800 h-6 leading-tight truncate w-full px-0.5" title={settings.certSpeaker1Name || 'Dr. H. Sandiaga Uno, B.B.A.'}>
                            {settings.certSpeaker1Name || 'Dr. H. Sandiaga Uno, B.B.A.'}
                          </span>
                        </div>
                      )}

                      {/* Column Narasumber 2 */}
                      {s2Active && (
                        <div className="flex flex-col items-center justify-between min-h-[85px]">
                          {settings.certSpeaker2Title && settings.certSpeaker2Title.trim() !== "" ? (
                            <span className="block text-[7px] text-slate-500 uppercase tracking-widest font-extrabold font-mono">{settings.certSpeaker2Title}</span>
                          ) : (
                            <div className="h-[10px]"></div>
                          )}
                          <div className="my-1.5 min-h-[36px] flex items-center justify-center">
                            {settings.certSpeaker2Sign ? (
                              settings.certSpeaker2Sign.startsWith('data:image') ? (
                                <img src={settings.certSpeaker2Sign} alt="Sign 2" className="h-8 object-contain max-w-[80px]" referrerPolicy="no-referrer" />
                              ) : (
                                <span className="font-serif italic font-extrabold text-amber-955 text-xs tracking-wide px-1 border-b border-amber-800/10 leading-none">{settings.certSpeaker2Sign}</span>
                              )
                            ) : (
                              <span className="font-serif italic font-extrabold text-amber-955 text-xs tracking-wide px-1 border-b border-amber-800/10 leading-none">Rina A.</span>
                            )}
                          </div>
                          <span className="block text-[8px] sm:text-[9px] font-bold text-slate-800 h-6 leading-tight truncate w-full px-0.5" title={settings.certSpeaker2Name || 'Ibu Rina Astuti, M.E.'}>
                            {settings.certSpeaker2Name || 'Ibu Rina Astuti, M.E.'}
                          </span>
                        </div>
                      )}

                      {/* Column Narasumber 3 */}
                      {s3Active && (
                        <div className="flex flex-col items-center justify-between min-h-[85px]">
                          {settings.certSpeaker3Title && settings.certSpeaker3Title.trim() !== "" ? (
                            <span className="block text-[7px] text-slate-500 uppercase tracking-widest font-extrabold font-mono">{settings.certSpeaker3Title}</span>
                          ) : (
                            <div className="h-[10px]"></div>
                          )}
                          <div className="my-1.5 min-h-[36px] flex items-center justify-center">
                            {settings.certSpeaker3Sign ? (
                              settings.certSpeaker3Sign.startsWith('data:image') ? (
                                <img src={settings.certSpeaker3Sign} alt="Sign 3" className="h-8 object-contain max-w-[80px]" referrerPolicy="no-referrer" />
                              ) : (
                                <span className="font-serif italic font-extrabold text-amber-955 text-xs tracking-wide px-1 border-b border-amber-800/10 leading-none">{settings.certSpeaker3Sign}</span>
                              )
                            ) : (
                              <span className="font-serif italic font-extrabold text-amber-955 text-xs tracking-wide px-1 border-b border-amber-800/10 leading-none">Budi S.</span>
                            )}
                          </div>
                          <span className="block text-[8px] sm:text-[9px] font-bold text-slate-800 h-6 leading-tight truncate w-full px-0.5" title={settings.certSpeaker3Name || 'Bapak Budi Santoso, S.E.'}>
                            {settings.certSpeaker3Name || 'Bapak Budi Santoso, S.E.'}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })()}

              </div>
            </div>

            {/* Quick action buttons */}
            <div className="bg-slate-950 p-4 border-t border-slate-800 flex justify-end space-x-3">
              <button
                onClick={() => window.print()}
                id="btn-print-action"
                className="px-4 py-2 bg-slate-800 text-slate-200 font-bold text-xs rounded-xl hover:text-white transition-all cursor-pointer"
              >
                Cetak / Print
              </button>
              <button
                onClick={() => setActiveCert(null)}
                id="btn-close-cert"
                className="px-4 py-2 bg-indigo-650 hover:bg-indigo-550 text-white font-bold text-xs rounded-xl transition-all cursor-pointer accent-glow"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}

      {payingWebinarId && (() => {
        const matchingWebinar = webinars.find(w => w.id === payingWebinarId);
        const matchingWebinarTitle = matchingWebinar ? matchingWebinar.title : "Webinar";
        const matchingWebinarPrice = matchingWebinar?.price !== undefined ? matchingWebinar.price : (settings.midtransConnected ? settings.ticketPrice : 0);
        const payingWaUrl = `https://wa.me/6281803100222?text=${encodeURIComponent(
          `Halo Admin, saya ingin konfirmasi bukti transfer pembayaran webinar "${matchingWebinarTitle}" sebesar Rp ${matchingWebinarPrice.toLocaleString('id-ID')} untuk akun ${currentUser.email}. Berikut bukti setoran saya.`
        )}`;

        return (
          <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans">
            <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-in zoom-in duration-150 text-left">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-indigo-500/10 text-indigo-400 rounded-full flex items-center justify-center border border-indigo-500/20">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-100">Metode Pembayaran Tiket</h3>
                    <p className="text-[10px] text-slate-400">Pilih metode pembayaran untuk {matchingWebinarTitle}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setPayingWebinarId(null)}
                  className="text-slate-450 hover:text-white text-xs px-2 py-1 bg-white/5 rounded-lg border border-white/5 cursor-pointer font-sans"
                >
                  Tutup
                </button>
              </div>

              {/* Total Price Widget */}
              <div className="bg-slate-950/50 p-3.5 rounded-xl border border-white/5 flex items-center justify-between">
                <div>
                  <span className="block text-[9px] text-slate-500 uppercase tracking-wider font-semibold">Total Biaya Tiket</span>
                  <span className="text-lg font-mono font-bold text-emerald-400">Rp {matchingWebinarPrice.toLocaleString('id-ID')}</span>
                </div>
                <div className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-xl text-[9px] font-bold uppercase font-mono">
                  Belum Lunas
                </div>
              </div>

              {/* Way 1: Instant Simulation */}
              <div className="border border-white/5 bg-white/[0.01] rounded-xl p-4 space-y-3">
                <h4 className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
                  <span>Opsi 1: Otomatis (Simulasi Midtrans)</span>
                </h4>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  Lakukan simulasi pembayaran instan tanpa mentransfer uang sungguhan untuk menguji sistem lunas otomatis.
                </p>
                <button
                  onClick={() => {
                    const currentPaid = currentUser.paidWebinars ? [...currentUser.paidWebinars] : [];
                    if (!currentPaid.includes(payingWebinarId)) {
                      currentPaid.push(payingWebinarId);
                    }
                    const updatedUser = { ...currentUser, paidWebinars: currentPaid };
                    DB.updateUser(updatedUser);
                    onUpdateUser(updatedUser);
                    setPayingWebinarId(null);
                  }}
                  className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-550 text-white text-xs font-bold transition-all cursor-pointer shadow-lg shadow-indigo-600/15 flex items-center justify-center space-x-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Simulasikan Pembayaran Lunas</span>
                </button>
              </div>

              {/* Way 2: Manual Bank Transfer */}
              <div className="border border-white/5 bg-white/[0.01] rounded-xl p-4 space-y-3">
                <h4 className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                  <span>Opsi 2: Transfer Bank Manual</span>
                </h4>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  Silakan transfer senilai tagihan ke rekening bank resmi penyelenggara webinar berikut ini:
                </p>

                <div className="bg-slate-950/40 p-3 rounded-lg border border-white/5 text-[11px] font-mono space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500 uppercase tracking-wider text-[9px]">Bank:</span>
                    <span className="text-slate-200 font-bold font-sans">{settings.bankInfoBank}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 uppercase tracking-wider text-[9px]">No. Rek:</span>
                    <span className="text-emerald-400 font-bold select-all font-mono">{settings.bankInfoNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 uppercase tracking-wider text-[9px]">A/N:</span>
                    <span className="text-slate-200 font-semibold font-sans">{settings.bankInfoName}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="block text-[9px] text-slate-500 uppercase font-semibold">Setelah transfer, kirim bukti setor ke Admin:</span>
                  <a
                    href={payingWaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-555 text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center space-x-1.5 shadow-lg shadow-emerald-500/10"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Konfirmasi Bukti Setor via WhatsApp</span>
                  </a>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  onClick={() => setPayingWebinarId(null)}
                  className="px-4 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold rounded-lg border border-white/5 transition-colors cursor-pointer"
                >
                  Kembali ke Dashboard
                </button>
              </div>

            </div>
          </div>
        );
      })()}

    </div>
  );
}
