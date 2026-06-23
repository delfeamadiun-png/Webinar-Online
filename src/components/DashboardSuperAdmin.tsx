import React, { useState } from 'react';
import { User, Webinar, SystemSettings, DB } from '../database';
import { Plus, Trash2, Edit, Save, Globe, Shield, UserX, Calendar, Key, Check, BarChart2, TrendingUp, Users, DollarSign, Settings, RefreshCw, Layers } from 'lucide-react';

interface DashboardSuperAdminProps {
  currentUser: User;
  onRefreshAllData?: () => void;
}

export default function DashboardSuperAdmin({ currentUser, onRefreshAllData }: DashboardSuperAdminProps) {
  const [webinars, setWebinars] = useState<Webinar[]>(DB.getWebinars());
  const [users, setUsers] = useState<User[]>(DB.getUsers());
  const [settings, setSettings] = useState<SystemSettings>(DB.getSettings());
  
  // Webinar CRUD Form States
  const [isEditingWebinar, setIsEditingWebinar] = useState<string | null>(null); // webinarId or 'new'
  const [title, setTitle] = useState('');
  const [speaker, setSpeaker] = useState('');
  const [speakerTitle, setSpeakerTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [status, setStatus] = useState<'upcoming' | 'live' | 'completed'>('upcoming');
  const [description, setDescription] = useState('');
  const [materialUrl, setMaterialUrl] = useState('');
  const [materialAudioUrl, setMaterialAudioUrl] = useState('');
  const [materialVideoUrl, setMaterialVideoUrl] = useState('');
  const [recordingUrl, setRecordingUrl] = useState('');
  const [zoomJoinUrl, setZoomJoinUrl] = useState('');
  const [zoomStartUrl, setZoomStartUrl] = useState('');

  // API Integration States
  const [zoomApiKey, setZoomApiKey] = useState(settings.zoomApiKey);
  const [zoomConnected, setZoomConnected] = useState(settings.zoomConnected);
  const [googleCalendarConnected, setGoogleCalendarConnected] = useState(settings.googleCalendarConnected);
  const [midtransConnected, setMidtransConnected] = useState(settings.midtransConnected);
  const [midtransClientKey, setMidtransClientKey] = useState(settings.midtransClientKey);
  const [ticketPrice, setTicketPrice] = useState(settings.ticketPrice);
  const [restrictZoomUnpaid, setRestrictZoomUnpaid] = useState(settings.restrictZoomUnpaid || false);
  const [bankInfoBank, setBankInfoBank] = useState(settings.bankInfoBank || 'Bank BCA');
  const [bankInfoNumber, setBankInfoNumber] = useState(settings.bankInfoNumber || '8830123456');
  const [bankInfoName, setBankInfoName] = useState(settings.bankInfoName || 'CV UMKM Digital Indonesia');

  const [successMsg, setSuccessMsg] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'webinars' | 'users' | 'api'>('overview');

  // Real-time state subscription to DB
  React.useEffect(() => {
    const unsubscribe = DB.subscribe(() => {
      setWebinars(DB.getWebinars());
      setUsers(DB.getUsers());
      const latestSettings = DB.getSettings();
      setSettings(latestSettings);
      setRestrictZoomUnpaid(latestSettings.restrictZoomUnpaid || false);
      setBankInfoBank(latestSettings.bankInfoBank || 'Bank BCA');
      setBankInfoNumber(latestSettings.bankInfoNumber || '8830123456');
      setBankInfoName(latestSettings.bankInfoName || 'CV UMKM Digital Indonesia');
    });
    return unsubscribe;
  }, []);

  const reloadData = () => {
    setWebinars(DB.getWebinars());
    setUsers(DB.getUsers());
    const latestSettings = DB.getSettings();
    setSettings(latestSettings);
    setRestrictZoomUnpaid(latestSettings.restrictZoomUnpaid || false);
    setBankInfoBank(latestSettings.bankInfoBank || 'Bank BCA');
    setBankInfoNumber(latestSettings.bankInfoNumber || '8830123456');
    setBankInfoName(latestSettings.bankInfoName || 'CV UMKM Digital Indonesia');
    if (onRefreshAllData) onRefreshAllData();
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedSettings: SystemSettings = {
      ...settings,
      zoomApiKey,
      zoomConnected,
      googleCalendarConnected,
      midtransConnected,
      midtransClientKey,
      restrictZoomUnpaid,
      bankInfoBank,
      bankInfoNumber,
      bankInfoName,
      ticketPrice: Number(ticketPrice)
    };
    DB.saveSettings(updatedSettings);
    setSettings(updatedSettings);
    setSuccessMsg('Konfigurasi API Integrasi & Rekening Bank berhasil diperbarui.');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleUserRoleChange = (email: string, newRole: 'peserta' | 'admin' | 'superadmin') => {
    const target = DB.getUserByEmail(email);
    if (target) {
      target.role = newRole;
      DB.updateUser(target);
      reloadData();
      setSuccessMsg(`Hak akses peran ${target.namaLengkap} diubah menjadi ${newRole.toUpperCase()}.`);
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  const handleOpenNewWebinarForm = () => {
    setIsEditingWebinar('new');
    setTitle('');
    setSpeaker('');
    setSpeakerTitle('');
    setDate('');
    setTime('13:00 - 15:00 WIB');
    setStatus('upcoming');
    setDescription('');
    setMaterialUrl('');
    setMaterialAudioUrl('');
    setMaterialVideoUrl('');
    setRecordingUrl('');
    const randomZoomId = Math.floor(100000000 + Math.random() * 900000000);
    const randomPasscode = Math.random().toString(36).substring(2, 8).toUpperCase();
    setZoomJoinUrl(`https://zoom.us/j/${randomZoomId}?pwd=${randomPasscode}`);
    setZoomStartUrl(`https://zoom.us/s/${randomZoomId}?pwd=${randomPasscode}`);
  };

  const handleOpenEditWebinarForm = (w: Webinar) => {
    setIsEditingWebinar(w.id);
    setTitle(w.title);
    setSpeaker(w.speaker);
    setSpeakerTitle(w.speakerTitle);
    setDate(w.date);
    setTime(w.time);
    setStatus(w.status);
    setDescription(w.description);
    setMaterialUrl(w.materialUrl || '');
    setMaterialAudioUrl(w.materialAudioUrl || '');
    setMaterialVideoUrl(w.materialVideoUrl || '');
    setRecordingUrl(w.recordingUrl || '');
    setZoomJoinUrl(w.zoomJoinUrl || '');
    setZoomStartUrl(w.zoomStartUrl || '');
  };

  const handleSaveWebinar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !speaker || !date || !time) {
      alert('Mohon lengkapi judul, narasumber, tanggal dan jam webinar.');
      return;
    }

    // Coerce other live webinars to completed if setting status to live
    if (status === 'live') {
      const allWebinars = DB.getWebinars();
      allWebinars.forEach(w => {
        // Exclude the current editing item to avoid nested save conflicts
        if (w.id !== isEditingWebinar && w.status === 'live') {
          const updated = { ...w, status: 'completed' as const };
          DB.updateWebinar(updated);
        }
      });
    }

    if (isEditingWebinar === 'new') {
      const newWeb: Webinar = {
        id: `webinar-${Date.now()}`,
        title,
        speaker,
        speakerTitle,
        date,
        time,
        status,
        description,
        materialUrl: materialUrl || undefined,
        materialAudioUrl: materialAudioUrl || undefined,
        materialVideoUrl: materialVideoUrl || undefined,
        recordingUrl: recordingUrl || undefined,
        zoomJoinUrl: zoomJoinUrl || 'https://zoom.us/j/' + Math.floor(100000000 + Math.random() * 900000000),
        zoomStartUrl: zoomStartUrl || 'https://zoom.us/s/' + Math.floor(100000000 + Math.random() * 900000000) + '_start',
        registeredCount: 0
      };
      DB.addWebinar(newWeb);
      setSuccessMsg('Jadwal Webinar baru berhasil ditambahkan.');
    } else if (isEditingWebinar) {
      const existing = DB.getWebinarById(isEditingWebinar);
      if (existing) {
        const updatedWeb: Webinar = {
          ...existing,
          title,
          speaker,
          speakerTitle,
          date,
          time,
          status,
          description,
          materialUrl: materialUrl || undefined,
          materialAudioUrl: materialAudioUrl || undefined,
          materialVideoUrl: materialVideoUrl || undefined,
          recordingUrl: recordingUrl || undefined,
          zoomJoinUrl: zoomJoinUrl || existing.zoomJoinUrl,
          zoomStartUrl: zoomStartUrl || existing.zoomStartUrl
        };
        DB.updateWebinar(updatedWeb);
        setSuccessMsg('Data webinar berhasil diperbarui.');
      }
    }

    setIsEditingWebinar(null);
    reloadData();
    setTimeout(() => setSuccessMsg(''), 4050);
  };

  const handleDeleteWebinar = (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus jadwal webinar ini? Tindakan ini bersifat permanen.')) {
      DB.deleteWebinar(id);
      reloadData();
      setSuccessMsg('Jadwal webinar berhasil dihapus dari sistem.');
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  // Bidang usaha demographic statistics calculation
  const statsBidangUsaha: Record<string, number> = {
    'Kuliner': 0,
    'Fashion': 0,
    'Perdagangan': 0,
    'Agrobisnis & Pertanian': 0,
    'Produk Kreatif & Kerajinan': 0,
    'Jasa': 0,
    'Teknologi': 0,
    'Lainnya': 0
  };

  users.forEach((u) => {
    if (u.role === 'peserta') {
      const key = u.bidangUsaha || 'Lainnya';
      if (statsBidangUsaha[key] !== undefined) {
        statsBidangUsaha[key] += 1;
      } else {
        statsBidangUsaha['Lainnya'] += 1;
      }
    }
  });

  const totalPesertaCount = users.filter(u => u.role === 'peserta').length;
  const totalRegistrationsCount = webinars.reduce((sum, w) => sum + (w.registeredCount || 0), 0);
  const activeUsersCount = users.filter(u => u.role === 'peserta' && u.registeredWebinars && u.registeredWebinars.length > 0).length;
  const totalCheckInsCount = users.reduce((sum, u) => sum + (u.checkedIn?.length || 0), 0);
  const attendanceRate = totalRegistrationsCount > 0 ? (totalCheckInsCount / totalRegistrationsCount) * 100 : 0;
  const totalCalculatedSales = webinars.reduce((sum, w) => sum + ((w.registeredCount || 0) * (settings.midtransConnected ? settings.ticketPrice : 0)), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Super Admin header */}
      <div className="glass border border-white/10 rounded-2xl p-6 mb-8 shadow-xl accent-glow-indigo">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between justify-start gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="bg-indigo-650 text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono">⚜️ Super Admin</span>
              <span className="text-slate-400 text-xs font-mono font-sans">• Kontrol Utama Aplikasi</span>
            </div>
            <h1 className="text-2xl font-sans font-extrabold text-slate-100 mt-1">
              Panel Kendali Webinar UMKM Online
            </h1>
            <p className="text-xs text-slate-400 mt-1 font-sans">
              Monitor statistik pengunjung harian, sunting hak akses kustom multi-peran, atur integrasi Midtrans, Zoom, Google Calendar, serta kelola jadwal webinar.
            </p>
          </div>

          <button
            onClick={reloadData}
            id="btn-refresh-data"
            className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white rounded-xl text-xs flex items-center space-x-1.5 transition-all border border-white/10 font-mono cursor-pointer shrink-0 self-start"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Muat Ulang DB</span>
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex border-t border-white/5 mt-6 pt-4 space-x-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            id="tab-overview"
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
              activeTab === 'overview' ? 'bg-indigo-600 text-white font-extrabold shadow shadow-indigo-600/20' : 'text-slate-400 hover:text-slate-250 hover:bg-white/5'
            }`}
          >
            Ringkasan Analitik
          </button>
          <button
            onClick={() => setActiveTab('webinars')}
            id="tab-webinars"
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
              activeTab === 'webinars' ? 'bg-indigo-600 text-white font-extrabold shadow shadow-indigo-600/20' : 'text-slate-400 hover:text-slate-250 hover:bg-white/5'
            }`}
          >
            Kelola Webinar
          </button>
          <button
            onClick={() => setActiveTab('users')}
            id="tab-users"
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
              activeTab === 'users' ? 'bg-indigo-600 text-white font-extrabold shadow shadow-indigo-600/20' : 'text-slate-400 hover:text-slate-250 hover:bg-white/5'
            }`}
          >
            Manajemen Role & User
          </button>
          <button
            onClick={() => setActiveTab('api')}
            id="tab-api"
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
              activeTab === 'api' ? 'bg-indigo-600 text-white font-extrabold shadow shadow-indigo-600/20' : 'text-slate-400 hover:text-slate-250 hover:bg-white/5'
            }`}
          >
            Integrasi API & Gateway
          </button>
        </div>
      </div>

      {successMsg && (
        <div id="superadmin-success-toast" className="bg-indigo-500/15 border border-indigo-500/25 text-indigo-305 p-3 rounded-xl text-xs flex items-center space-x-2 mb-6 animate-in fade-in slide-in-from-top-2">
          <Check className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* TAB CONTENTS */}
      
      {/* 1. ringkasan analitik */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          
          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass border border-white/10 rounded-2xl p-4 flex items-center space-x-3.5 shadow-lg">
              <div className="p-3 bg-indigo-500/15 text-indigo-300 rounded-xl">
                <Users className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <span className="block text-[10px] uppercase font-mono tracking-wider text-slate-400">User Aktif (UMKM)</span>
                <span className="text-lg font-extrabold text-slate-100">{activeUsersCount} / {totalPesertaCount} Orang</span>
              </div>
            </div>

            <div className="glass border border-white/10 rounded-2xl p-4 flex items-center space-x-3.5 shadow-lg">
              <div className="p-3 bg-indigo-505/15 text-indigo-300 rounded-xl">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-[10px] uppercase font-mono tracking-wider text-slate-400">Total Registrasi</span>
                <span className="text-lg font-extrabold text-slate-100">{totalRegistrationsCount} Tiket</span>
              </div>
            </div>

            <div className="glass border border-white/10 rounded-2xl p-4 flex items-center space-x-3.5 shadow-lg">
              <div className="p-3 bg-emerald-500/15 text-emerald-300 rounded-xl">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-[10px] uppercase font-mono tracking-wider text-slate-400">Penjualan Tiket</span>
                <span className="text-lg font-extrabold text-slate-100 font-mono text-emerald-400">Rp {totalCalculatedSales.toLocaleString('id-ID')}</span>
              </div>
            </div>

            <div className="glass border border-white/10 rounded-2xl p-4 flex items-center space-x-3.5 shadow-lg">
              <div className="p-3 bg-indigo-500/15 text-indigo-300 rounded-xl">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-[10px] uppercase font-mono tracking-wider text-slate-400">Rasio Kehadiran</span>
                <span className="text-lg font-extrabold text-slate-100 font-mono">{attendanceRate.toFixed(1)}%</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Bidang Usaha Distribution Chart */}
            <div className="lg:col-span-7 glass border border-white/10 rounded-2xl p-5 space-y-4 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-205">Demografi Bidang Usaha Peserta</h3>
                  <p className="text-[11px] text-slate-400">Sebaran pendaftar berdasarkan jenis komoditas usaha mikro.</p>
                </div>
                <BarChart2 className="w-4 h-4 text-slate-500" />
              </div>

              {/* Native responsive SVG layout bar graph */}
              <div className="space-y-3 pt-2 font-sans">
                {Object.entries(statsBidangUsaha).map(([label, count]) => {
                  const percentage = totalPesertaCount > 0 ? (count / totalPesertaCount) * 100 : 0;
                  
                  return (
                    <div key={label} className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-300 font-medium">{label}</span>
                        <span className="text-slate-400 font-mono">{count} UMKM ({percentage.toFixed(0)}%)</span>
                      </div>
                      
                      {/* Bar indicator */}
                      <div className="w-full bg-slate-950/40 rounded-full h-2 overflow-hidden border border-white/5">
                        <div 
                          className="bg-gradient-to-r from-indigo-500 to-indigo-650 h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(percentage, 2)}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Audit Check List */}
            <div className="lg:col-span-5 glass border border-white/10 rounded-2xl p-5 space-y-4 shadow-lg">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <h4 className="text-xs font-bold text-slate-200">User & Integrasi Overview</h4>
                <TrendingUp className="w-4 h-4 text-indigo-400" />
              </div>

              <div className="space-y-4 text-xs font-sans">
                <div className="p-3.5 bg-slate-955/40 rounded-xl border border-white/5 space-y-2.5">
                  <h5 className="font-bold text-slate-300 font-mono uppercase text-[10px] tracking-wider">Pembagian Peran Sistem</h5>
                  <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                    <div className="bg-indigo-950/30 border border-indigo-500/10 rounded-lg p-2">
                      <span className="block font-bold text-indigo-300 text-sm font-mono">{totalPesertaCount}</span>
                      <span className="text-slate-400">Peserta</span>
                    </div>
                    <div className="bg-indigo-950/30 border border-indigo-500/10 rounded-lg p-2">
                      <span className="block font-bold text-slate-300 text-sm font-mono">{users.filter(u => u.role === 'admin').length}</span>
                      <span className="text-slate-400">Moderator</span>
                    </div>
                    <div className="bg-indigo-950/30 border border-indigo-500/10 rounded-lg p-2">
                      <span className="block font-bold text-slate-300 text-sm font-mono">{users.filter(u => u.role === 'superadmin').length}</span>
                      <span className="text-slate-400">Super Admin</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className={`p-1 rounded-full ${zoomConnected ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/20' : 'bg-white/5 text-slate-500 border border-white/5'}`}>
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-250">Webinar Room API Integrasi Zoom</h5>
                    <p className="text-[10px] text-slate-400">{zoomConnected ? 'Tersambung mendeteksi credentials JWT' : 'Zoom API tidak diaktifkan'}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className={`p-1 rounded-full ${googleCalendarConnected ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/20' : 'bg-white/5 text-slate-500 border border-white/5'}`}>
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-250">Google Calendar Synchronization</h5>
                    <p className="text-[10px] text-slate-400">{googleCalendarConnected ? 'Otomatis sinkron saat jadwal webinar baru dibuat' : 'Belum tersambung OAuth'}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className={`p-1 rounded-full ${midtransConnected ? 'bg-indigo-500/15 text-indigo-305 border border-indigo-500/20' : 'bg-white/5 text-slate-500 border border-white/5'}`}>
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-250">Midtrans Payment Gateway (Sandbox)</h5>
                    <p className="text-[10px] text-slate-400">{midtransConnected ? `Kunci Klien aktif: ${midtransClientKey}` : 'Sistem berbayar Nonaktif (Default Seminar Gratis)'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Real-time Ticket Sales Report */}
          <div className="glass border border-white/10 rounded-2xl p-6 space-y-4 shadow-lg">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5 font-sans">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  Laporan Real-time Penjualan Tiket Webinar UMKM (Cloud Firestore)
                </h3>
                <p className="text-[11px] text-slate-400">Rincian pendapatan registrasi kelas gratis/berbayar berdasar jumlah pendaftar real-time yang tersinkron.</p>
              </div>
              <span className="bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 font-mono text-[9px] px-2.5 py-0.5 rounded font-bold uppercase tracking-wider">
                Firestore Live Sync
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-sans">
                <thead>
                  <tr className="border-b border-white/5 text-slate-400 font-mono text-[10px] uppercase tracking-wider">
                    <th className="pb-2.5 font-bold">Topik Kelas Webinar</th>
                    <th className="pb-2.5 font-bold text-center">Status Kelas</th>
                    <th className="pb-2.5 font-bold text-right">Harga Satuan</th>
                    <th className="pb-2.5 font-bold text-center">Registrasi (UMKM)</th>
                    <th className="pb-2.5 font-bold text-right">Total Penjualan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {webinars.map(w => {
                    const price = settings.midtransConnected ? settings.ticketPrice : 0;
                    const sales = (w.registeredCount || 0) * price;
                    return (
                      <tr key={w.id} className="text-slate-300 hover:bg-white/5 transition-colors">
                        <td className="py-3 font-semibold text-slate-205">{w.title}</td>
                        <td className="py-3 text-center">
                          <span className={`px-2 py-0.5 text-[9px] font-mono rounded font-bold uppercase ${
                            w.status === 'live' ? 'bg-rose-500/10 border border-rose-500/20 text-rose-300 animate-pulse' :
                            w.status === 'upcoming' ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-300' :
                            'bg-slate-500/10 border border-slate-500/20 text-slate-400'
                          }`}>
                            {w.status}
                          </span>
                        </td>
                        <td className="py-3 text-right font-mono">
                          {price > 0 ? `Rp ${price.toLocaleString('id-ID')}` : 'Gratis'}
                        </td>
                        <td className="py-3 text-center font-mono font-bold text-indigo-305">{w.registeredCount || 0} pendaftar</td>
                        <td className="py-3 text-right font-mono text-emerald-400 font-extrabold text-sm">
                          Rp {sales.toLocaleString('id-ID')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            <div className="bg-slate-950/30 rounded-xl p-3.5 flex flex-col sm:flex-row justify-between items-center text-xs gap-3 font-mono border border-white/5">
              <div className="text-slate-400">
                Skema Integrasi Gateway: <strong className="text-indigo-400 font-bold">{settings.midtransConnected ? 'Midtrans Production / Sandbox (Aktif)' : 'Kelas Beasiswa (Subsidized Gratis)'}</strong>
              </div>
              <div className="text-slate-300">
                Hub Penjualan Kumulatif: <strong className="text-emerald-400 text-sm font-extrabold">Rp {totalCalculatedSales.toLocaleString('id-ID')}</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. kelola webinar schedules CRUD */}
      {activeTab === 'webinars' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-205 font-sans">Jadwal Kelas Webinar Aktif</h2>
            <button
              onClick={handleOpenNewWebinarForm}
              id="btn-add-webinar-trigger"
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-505 text-white font-bold text-xs rounded-xl flex items-center space-x-1 transition-all cursor-pointer shadow-md shadow-indigo-600/10 accent-glow"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Jadwal Baru</span>
            </button>
          </div>

          {/* Form Create / Edit */}
          {isEditingWebinar && (
            <form onSubmit={handleSaveWebinar} className="glass border border-white/10 rounded-2xl p-5 space-y-4 animate-in slide-in-from-top-3 shadow-xl" id="form-crud-webinar">
              <h3 className="text-xs font-bold font-mono tracking-wide text-indigo-451 uppercase">
                {isEditingWebinar === 'new' ? '✨ Tambah Schedule Webinar Baru' : '📝 Sunting Jadwal Webinar'}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans">
                <div className="space-y-1.5">
                  <label className="block text-xs text-slate-300 font-medium">Judul Webinar</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Contoh: Optimalisasi Iklan TikTok untuk UMKM"
                    id="crud-title"
                    className="w-full bg-slate-950/40 border border-white/10 text-slate-200 text-xs rounded-xl px-3 py-2 outline-none focus:border-indigo-500 font-sans"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs text-slate-300 font-medium">Narasumber / Pembicara</label>
                  <input
                    type="text"
                    value={speaker}
                    onChange={(e) => setSpeaker(e.target.value)}
                    placeholder="Contoh: Budi Santoso, MBA"
                    id="crud-speaker"
                    className="w-full bg-slate-950/40 border border-white/10 text-slate-200 text-xs rounded-xl px-3 py-2 outline-none focus:border-indigo-500 font-sans"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-sans">
                <div className="space-y-1.5">
                  <label className="block text-xs text-slate-300 font-medium">Gelar/Jabatan Pembicara</label>
                  <input
                    type="text"
                    value={speakerTitle}
                    onChange={(e) => setSpeakerTitle(e.target.value)}
                    placeholder="Contoh: CEO Digital Agency"
                    className="w-full bg-slate-950/40 border border-white/10 text-slate-200 text-xs rounded-xl px-3 py-2 outline-none focus:border-indigo-500 font-sans"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs text-slate-300 font-medium">Tanggal Pelaksanaan</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    id="crud-date"
                    className="w-full bg-slate-950/40 border border-white/10 text-slate-200 text-xs rounded-xl px-3 py-2 outline-none focus:border-indigo-500 whitespace-nowrap font-sans"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs text-slate-300 font-medium">Jam Pelaksanaan</label>
                  <input
                    type="text"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    placeholder="Contoh: 14:00 - 16:00 WIB"
                    id="crud-time"
                    className="w-full bg-slate-950/40 border border-white/10 text-slate-200 text-xs rounded-xl px-3 py-2 outline-none focus:border-indigo-500 font-sans"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-sans">
                <div className="space-y-1.5">
                  <label className="block text-xs text-slate-300 font-medium">Status Webinar</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-slate-900 text-slate-200 border border-white/10 rounded-xl px-3 py-2 text-xs outline-none focus:border-indigo-500 cursor-pointer font-sans h-[38px]"
                  >
                    <option value="upcoming">upcoming</option>
                    <option value="live">live</option>
                    <option value="completed">completed</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs text-slate-300 font-medium">Link Slide PPT Materi (Opsional - PDF/Drive)</label>
                  <input
                    type="url"
                    value={materialUrl}
                    onChange={(e) => setMaterialUrl(e.target.value)}
                    placeholder="https://drive.google.com/..."
                    className="w-full bg-slate-950/40 border border-white/10 text-slate-200 text-xs rounded-xl px-3 py-2 outline-none focus:border-indigo-500 font-sans"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs text-emerald-400 font-bold">Link Materi Audio / Podcast (Materi Lunas)</label>
                  <input
                    type="url"
                    value={materialAudioUrl}
                    onChange={(e) => setMaterialAudioUrl(e.target.value)}
                    placeholder="https://soundcloud.com/... / MP3 link"
                    className="w-full bg-slate-950/40 border border-white/10 text-slate-200 text-xs rounded-xl px-3 py-2 outline-none focus:border-indigo-500 font-sans"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs text-indigo-400 font-bold">Link Materi Video / Youtube (Materi Lunas)</label>
                  <input
                    type="url"
                    value={materialVideoUrl}
                    onChange={(e) => setMaterialVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=... atau link lain"
                    className="w-full bg-slate-950/40 border border-white/10 text-slate-200 text-xs rounded-xl px-3 py-2 outline-none focus:border-indigo-500 font-sans"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-3">
                  <label className="block text-xs text-slate-300 font-medium">Link Youtube Video Rekaman Siaran (Status Completed - Registran Lunas)</label>
                  <input
                    type="url"
                    value={recordingUrl}
                    onChange={(e) => setRecordingUrl(e.target.value)}
                    placeholder="https://www.youtube.com/embed/..."
                    className="w-full bg-slate-950/40 border border-white/10 text-slate-200 text-xs rounded-xl px-3 py-2 outline-none focus:border-indigo-500 font-sans"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans border-t border-white/5 pt-3">
                <div className="space-y-1.5">
                  <label className="block text-xs text-sky-400 font-bold">Link Zoom Pelaksanaan (Join Link - ID & Passcode tersemat)</label>
                  <input
                    type="url"
                    value={zoomJoinUrl}
                    onChange={(e) => setZoomJoinUrl(e.target.value)}
                    placeholder="https://zoom.us/j/123000789?pwd=..."
                    className="w-full bg-slate-950/40 border border-white/10 text-slate-200 text-xs rounded-xl px-3 py-2 outline-none focus:border-sky-500 font-sans"
                    required
                  />
                  <span className="block text-[10px] text-slate-400">Tautan Zoom lengkap yang berisi Meeting ID dan parameter Passcode agar peserta langsung terhubung tanpa memasukkan password kembali.</span>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs text-slate-300 font-medium">Link Zoom Membuka Kelas (Start Link Host - Opsional)</label>
                  <input
                    type="url"
                    value={zoomStartUrl}
                    onChange={(e) => setZoomStartUrl(e.target.value)}
                    placeholder="https://zoom.us/s/123000789?pwd=..."
                    className="w-full bg-slate-950/40 border border-white/10 text-slate-200 text-xs rounded-xl px-3 py-2 outline-none focus:border-indigo-500 font-sans"
                  />
                  <span className="block text-[10px] text-slate-400">Tautan pembuka host agar admin dapat langsung meluncurkan meeting Zoom sebagai host/pemateri dari dashboard.</span>
                </div>
              </div>

              <div className="space-y-1.5 font-sans">
                <label className="block text-xs text-slate-300 font-medium">Deskripsi Webinar</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ceritakan detail poin pembelajaran kelas webinar ini untuk calon pendaftar..."
                  rows={3}
                  className="w-full bg-slate-950/40 border border-white/10 text-slate-200 text-xs rounded-xl px-3 py-2 outline-none focus:border-indigo-500 font-sans"
                ></textarea>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingWebinar(null)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 text-xs rounded-xl transition border border-white/5 cursor-pointer font-sans"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  id="btn-crud-save"
                  className="px-5 py-2 bg-indigo-650 hover:bg-indigo-550 text-white font-bold text-xs rounded-xl transition shadow-md shadow-indigo-600/10 cursor-pointer font-sans accent-glow"
                >
                  Simpan Jadwal
                </button>
              </div>
            </form>
          )}

          {/* List existing webinars with CRUD controls */}
          <div className="space-y-3">
            {webinars.map(w => (
              <div key={w.id} className="glass border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row md:items-center md:justify-between justify-start gap-4 shadow-md transition-all hover:border-indigo-500/20">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase border ${
                      w.status === 'live' 
                        ? 'bg-rose-500/10 text-rose-300 border-rose-550/20' 
                        : w.status === 'upcoming' 
                          ? 'bg-indigo-500/15 text-indigo-300 border-indigo-550/20'
                          : 'bg-white/5 text-slate-400 border-white/5'
                    }`}>
                      {w.status}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">{w.date} • {w.time}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-200 font-sans">{w.title}</h3>
                  <p className="text-[11px] text-slate-400 font-sans">Narasumber: <strong className="text-slate-350">{w.speaker}</strong> • {w.registeredCount} UMKM Terdaftar</p>
                </div>

                <div className="flex space-x-2 shrink-0">
                  <button
                    onClick={() => handleOpenEditWebinarForm(w)}
                    id={`btn-edit-webinar-${w.id}`}
                    className="p-1.5 bg-white/5 hover:bg-indigo-600/20 hover:text-indigo-300 text-slate-400 rounded-lg border border-white/5 transition-colors cursor-pointer"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteWebinar(w.id)}
                    id={`btn-delete-webinar-${w.id}`}
                    className="p-1.5 bg-white/5 hover:bg-rose-600/20 hover:text-rose-400 text-slate-400 rounded-lg border border-white/5 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Manajemen Role kustom (User Role Editor) */}
      {activeTab === 'users' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="border-b border-white/5 pb-3">
            <h2 className="text-lg font-bold text-slate-205 font-sans">User Role Editor & Manajemen Hak Akses</h2>
            <p className="text-xs text-slate-400 mt-1 font-sans">Ubah peran akun secara dinamis untuk menguji batasan dasbor Peserta, Moderator/Admin, atau Super Admin secara langsung.</p>
          </div>

          <div className="glass border border-white/10 rounded-2xl overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-955/40 text-slate-300 uppercase tracking-wider font-sans text-[10px] border-b border-white/5">
                  <tr>
                    <th className="p-4">Nama Lengkap & Usaha</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">No. HP / WA</th>
                    <th className="p-4">Sesi & Hak Akses Pendaftaran (Lunas / Ikut)</th>
                    <th className="p-4">Hak Akses Peran (Role)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-200 font-sans">
                  {users.map(u => (
                    <tr key={u.email} className="hover:bg-white/5 transition">
                      <td className="p-4">
                        <div className="font-bold text-slate-200">{u.namaLengkap}</div>
                        <div className="text-[10px] text-slate-400">{u.namaUsaha || 'UMKM Nasional'} ({u.bidangUsaha || 'Multi'})</div>
                      </td>
                      <td className="p-4 font-mono text-[11px] text-slate-305">{u.email}</td>
                      <td className="p-4 font-mono text-[11px] text-slate-305">{u.whatsapp}</td>
                      <td className="p-4 min-w-[280px]">
                        {u.role !== 'peserta' ? (
                          <span className="text-[10px] text-slate-500 italic block">Bukan Peserta (Akses Terbuka)</span>
                        ) : webinars.length === 0 ? (
                          <span className="text-[10px] text-slate-500 italic block">Belum ada kelas terdaftar</span>
                        ) : (
                          <div className="space-y-1 max-h-[140px] overflow-y-auto pr-1">
                            {webinars.map(web => {
                              const isRegistered = u.registeredWebinars.includes(web.id);
                              const isPaid = u.paidWebinars?.includes(web.id) || false;
                              return (
                                <div key={web.id} className="flex items-center justify-between bg-slate-950/40 p-1.5 rounded-lg border border-white/5 gap-2 text-[10px]">
                                  <span className="text-slate-300 truncate max-w-[120px]" title={web.title}>
                                    {web.title}
                                  </span>
                                  <div className="flex items-center space-x-2 shrink-0">
                                    <label className="flex items-center space-x-1 cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={isRegistered}
                                        onChange={() => {
                                          const updatedReg = isRegistered
                                            ? u.registeredWebinars.filter(id => id !== web.id)
                                            : [...u.registeredWebinars, web.id];
                                          let updatedPaid = u.paidWebinars ? [...u.paidWebinars] : [];
                                          if (isRegistered) {
                                            updatedPaid = updatedPaid.filter(id => id !== web.id);
                                          }
                                          const updatedUser = { ...u, registeredWebinars: updatedReg, paidWebinars: updatedPaid };
                                          DB.updateUser(updatedUser);
                                          reloadData();
                                        }}
                                        className="rounded border-white/10 text-indigo-600 focus:ring-0 w-3 h-3 bg-slate-900 cursor-pointer"
                                      />
                                      <span className="text-[9px] text-slate-400">Ikut</span>
                                    </label>

                                    <button
                                      disabled={!isRegistered}
                                      onClick={() => {
                                        const currentPaid = u.paidWebinars ? [...u.paidWebinars] : [];
                                        const updatedPaid = isPaid
                                          ? currentPaid.filter(id => id !== web.id)
                                          : [...currentPaid, web.id];
                                        const updatedUser = { ...u, paidWebinars: updatedPaid };
                                        DB.updateUser(updatedUser);
                                        reloadData();
                                      }}
                                      className={`px-1.5 py-0.5 text-[9px] font-bold rounded transition-all ${
                                        !isRegistered
                                          ? 'bg-slate-800 text-slate-500 border border-transparent cursor-not-allowed opacity-50'
                                          : isPaid
                                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 cursor-pointer text-[9px]'
                                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 cursor-pointer text-[9px]'
                                      }`}
                                    >
                                      {isPaid ? 'Lunas' : 'Belum'}
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <select
                          value={u.role}
                          onChange={(e) => handleUserRoleChange(u.email, e.target.value as any)}
                          id={`select-role-${u.email.replace(/[@.]/g, '-')}`}
                          className="bg-slate-900 text-slate-200 border border-white/10 focus:border-indigo-500 rounded-lg px-2 py-1 text-xs outline-none cursor-pointer h-[32px] font-sans"
                        >
                          <option value="peserta">PESERTA</option>
                          <option value="admin">MODERATOR / ADMIN</option>
                          <option value="superadmin">SUPER ADMIN</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. Integrasi API & payment gateway */}
      {activeTab === 'api' && (
        <form onSubmit={handleSaveSettings} className="glass border border-white/10 rounded-2xl p-6 space-y-6 shadow-xl" id="form-api-settings font-sans">
          <div className="border-b border-white/5 pb-3">
            <h2 className="text-lg font-bold text-slate-205 font-sans flex items-center space-x-2">
              <Key className="w-5 h-5 text-indigo-400 font-sans" />
              <span className="font-sans">Konfigurasi Integrasi API Eksternal</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1 font-sans">
              Atur credentials Zoom Developer, sinkronisasi Google Calendar, atau sistem pendaftaran berbayar / tiket premium via payment gateway Midtrans.
            </p>
          </div>

          <div className="space-y-6 font-sans">
            
            {/* Zoom Connection */}
            <div className="bg-slate-950/40 border border-white/5 rounded-xl p-4.5 space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                <h3 className="text-xs font-bold text-slate-200">1. Integrasi Zoom Developer App Suite</h3>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={zoomConnected} 
                    onChange={(e) => setZoomConnected(e.target.checked)} 
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                  <span className="ml-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    {zoomConnected ? 'AKTIF' : 'NONAKTIF'}
                  </span>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                <div className="space-y-1.5">
                  <label className="block text-slate-350">Zoom CLIENT SECRET / JWT SDK Key</label>
                  <input
                    type="text"
                    value={zoomApiKey}
                    onChange={(e) => setZoomApiKey(e.target.value)}
                    placeholder="Contoh: eyJhbGciOiJIUzI1NiJ9..."
                    id="zoom-api-key"
                    className="w-full bg-slate-950/40 border border-white/10 text-slate-300 text-xs rounded-xl px-3 py-2 outline-none focus:border-indigo-500 font-mono"
                    disabled={!zoomConnected}
                  />
                </div>
                <div className="p-3 bg-white/5 rounded-xl text-[11px] text-slate-405 self-end">
                  Zoom API digunakan untuk otomatis menggenerate link meeting, mengontrol mute/unmute, serta melacak daftar kehadiran absensi peserta webinar secara digital.
                </div>
              </div>
            </div>

            {/* Google Calendar Connection */}
            <div className="bg-slate-950/40 border border-white/5 rounded-xl p-4.5 space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                <h3 className="text-xs font-bold text-slate-200">2. Sinkronisasi Google Calendar</h3>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={googleCalendarConnected} 
                    onChange={(e) => setGoogleCalendarConnected(e.target.checked)} 
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                  <span className="ml-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    {googleCalendarConnected ? 'AKTIF' : 'NONAKTIF'}
                  </span>
                </label>
              </div>
              <p className="text-[11px] text-slate-405">
                Mengintegrasikan jadwal webinar UMKM harian langsung ke Google Calendar admin dan secara opsional memicu undangan notifikasi email ke kalender pribadi pendaftar.
              </p>
            </div>

            {/* Midtrans Connection */}
            <div className="bg-slate-950/40 border border-white/5 rounded-xl p-4.5 space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                <h3 className="text-xs font-bold text-slate-200">3. Gerbang Pembayaran Midtrans (Ticketing Sederhana)</h3>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={midtransConnected} 
                    onChange={(e) => setMidtransConnected(e.target.checked)} 
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                  <span className="ml-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    {midtransConnected ? 'AKTIF' : 'NONAKTIF'}
                  </span>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="block text-slate-350">Midtrans CLIENT KEY (Sandbox Mode)</label>
                    <input
                      type="text"
                      value={midtransClientKey}
                      onChange={(e) => setMidtransClientKey(e.target.value)}
                      placeholder="Contoh: SB-Mid-client-881h29b..."
                      id="midtrans-client-key"
                      className="w-full bg-slate-950/40 border border-white/10 text-slate-300 text-xs rounded-xl px-3 py-2 outline-none focus:border-indigo-500 font-mono"
                      disabled={!midtransConnected}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-slate-350 font-sans">Harga Standar Karcis Webinar (IDR)</label>
                    <input
                      type="number"
                      value={ticketPrice}
                      onChange={(e) => setTicketPrice(Number(e.target.value))}
                      placeholder="Contoh: 50000"
                      className="w-full bg-slate-950/40 border border-white/10 text-slate-300 text-xs rounded-xl px-3 py-1.5 outline-none focus:border-indigo-500 font-sans"
                      disabled={!midtransConnected}
                    />
                  </div>
                </div>
                <div className="p-4 bg-white/5 rounded-xl text-[11px] text-slate-405 space-y-2">
                  <p>Membantu UMKM melakukan setup monetisasi webinar jika webinar bersifat kelas bertaraf internasional / berbayar.</p>
                  <p className="text-indigo-400 font-semibold">• Saat non-aktif, pendaftaran disetting otomatis GRATIS 100%.</p>
                </div>
              </div>
            </div>

            {/* Keamanan & Pembatasan Akses Zoom */}
            <div className="bg-slate-950/40 border border-white/5 rounded-xl p-4.5 space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                <h3 className="text-xs font-bold text-slate-205">4. Aturan Akses Kelas & Pembatasan Zoom (Syarat Pembayaran)</h3>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={restrictZoomUnpaid} 
                    onChange={(e) => setRestrictZoomUnpaid(e.target.checked)} 
                    id="restrict-zoom-unpaid"
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-600"></div>
                  <span className="ml-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    {restrictZoomUnpaid ? 'DIBATASI' : 'BEBAS AKSES'}
                  </span>
                </label>
              </div>

              <div className="text-[11px] leading-relaxed text-slate-400 space-y-2">
                <p>
                  Jika diaktifkan (<strong className="text-rose-400 font-bold">DIBATASI</strong>), semua peserta dengan peran (role) <strong className="text-slate-300">Peserta</strong> yang mendaftar webinar <strong className="text-rose-455 font-bold">TIDAK BISA mengakses link Zoom</strong> jika status tiketnya belum Lunas.
                </p>
                <p className="text-indigo-400 font-medium">
                  • Admin dan Moderator dapat menandai secara manual status lunas peserta di baris pendaftar, atau peserta dapat melakukan pembayaran simulasi di dasbor mereka.
                </p>
              </div>
            </div>

            {/* Rekening Pembayaran Bank Manual */}
            <div className="bg-slate-950/40 border border-white/5 rounded-xl p-4.5 space-y-4">
              <div className="border-b border-white/5 pb-2.5">
                <h3 className="text-xs font-bold text-slate-205">5. Rekening Penampungan Pembayaran Manual</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Informasi nomor rekening bank yang muncul di dasbor peserta untuk panduan transfer pembayaran manual.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans">
                <div className="space-y-1">
                  <label className="block text-slate-400">Nama Bank / Fintech</label>
                  <input
                    type="text"
                    value={bankInfoBank}
                    onChange={(e) => setBankInfoBank(e.target.value)}
                    placeholder="Contoh: Bank BCA, Bank Mandiri, GoPay"
                    id="bank-info-bank"
                    className="w-full bg-slate-950/40 border border-white/10 text-slate-300 text-xs rounded-xl px-3 py-2 outline-none focus:border-indigo-500 font-sans"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-slate-400">Nomor Rekening / No. HP</label>
                  <input
                    type="text"
                    value={bankInfoNumber}
                    onChange={(e) => setBankInfoNumber(e.target.value)}
                    placeholder="Contoh: 8830123456"
                    id="bank-info-number"
                    className="w-full bg-slate-950/40 border border-white/10 text-slate-300 text-xs rounded-xl px-3 py-2 outline-none focus:border-indigo-500 font-mono"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-slate-400">Atas Nama (A/N)</label>
                  <input
                    type="text"
                    value={bankInfoName}
                    onChange={(e) => setBankInfoName(e.target.value)}
                    placeholder="Contoh: CV UMKM Digital"
                    id="bank-info-name"
                    className="w-full bg-slate-950/40 border border-white/10 text-slate-300 text-xs rounded-xl px-3 py-2 outline-none focus:border-indigo-500 font-sans"
                    required
                  />
                </div>
              </div>
            </div>

          </div>

          <div className="flex justify-end pt-3">
            <button
              type="submit"
              id="btn-save-settings"
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-550 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-indigo-600/10 cursor-pointer accent-glow"
            >
              Simpan Integrasi & Kunci API
            </button>
          </div>
        </form>
      )}

    </div>
  );
}
