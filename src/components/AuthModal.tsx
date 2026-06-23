import React, { useState } from 'react';
import { User, DB } from '../database';
import { Mail, Lock, Phone, User as UserIcon, Building, Briefcase, X, ArrowRight, Shield, AlertCircle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
  initialMode: 'login' | 'register';
}

export default function AuthModal({ isOpen, onClose, onSuccess, initialMode }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  
  // Registration States
  const [namaLengkap, setNamaLengkap] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [namaUsaha, setNamaUsaha] = useState('');
  const [bidangUsaha, setBidangUsaha] = useState('Kuliner');
  
  // Login States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!namaLengkap || !email || !password || !whatsapp || !namaUsaha) {
      setErrorMsg('Semua kolom pendaftaran wajib diisi secara lengkap.');
      return;
    }

    // Check if email already registered
    const existing = DB.getUserByEmail(email);
    if (existing) {
      setErrorMsg('Email ini sudah terdaftar. Silakan login atau gunakan email lain.');
      return;
    }

    try {
      const newUser = DB.registerUser({
        id: email,
        namaLengkap,
        email,
        password,
        whatsapp,
        namaUsaha,
        bidangUsaha,
        role: 'peserta' // Default registration is Peserta
      });
      
      onSuccess(newUser);
      onClose();
      resetForm();
    } catch (e: any) {
      setErrorMsg('Gagal mendaftar: ' + e.message);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!loginEmail || !loginPassword) {
      setErrorMsg('Silakan masukkan email dan password Anda.');
      return;
    }

    const user = DB.getUserByEmail(loginEmail);
    if (!user || user.password !== loginPassword) {
      setErrorMsg('Email atau password tidak cocok.');
      return;
    }

    onSuccess(user);
    onClose();
    resetForm();
  };

  const handleDemoLogin = (emailStr: string, passStr: string) => {
    setErrorMsg('');
    const user = DB.getUserByEmail(emailStr);
    if (user) {
      onSuccess(user);
      onClose();
      resetForm();
    } else {
      setErrorMsg('Akun demo gagal dimuat. Pastikan database.ts diaktifkan.');
    }
  };

  const resetForm = () => {
    setNamaLengkap('');
    setEmail('');
    setPassword('');
    setWhatsapp('');
    setNamaUsaha('');
    setBidangUsaha('Kuliner');
    setLoginEmail('');
    setLoginPassword('');
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm cursor-pointer" 
        onClick={onClose}
      ></div>

      {/* Main Container */}
      <div className="relative glass border border-white/15 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl z-10 animate-in fade-in zoom-in duration-200 accent-glow-indigo">
        
        {/* Header decoration */}
        <div className="bg-gradient-to-r from-indigo-500 to-violet-600 h-1 w-full"></div>
        
        <button 
          onClick={onClose}
          id="btn-close-auth-modal"
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8">
          <div className="text-center mb-6">
            <span className="text-indigo-400 text-xs font-mono uppercase tracking-wider font-semibold">
              WEBINAR UMKM ONLINE APP
            </span>
            <h2 className="text-2xl font-sans font-bold text-slate-100 mt-1">
              {mode === 'login' ? 'Masuk ke Platform' : 'Pendaftaran Peserta Baru'}
            </h2>
            <p className="text-xs text-slate-450 mt-1">
              {mode === 'login' 
                ? 'Lanjutkan akses materi, forum diskusi, dan unduh sertifikat.' 
                : 'Isi formulir lengkap untuk verifikasi keabsahan sertifikat UMKM.'}
            </p>
          </div>

          {errorMsg && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 p-3 rounded-lg text-xs flex items-start space-x-2 mb-4" id="auth-error">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {mode === 'login' ? (
            /* LOGIN FORM */
            <form onSubmit={handleLogin} className="space-y-4" id="form-login">
              <div>
                <label className="block text-xs font-semibold text-slate-350 tracking-wider uppercase mb-1.5">
                  Alamat Email
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="nama@email.com"
                    id="input-login-email"
                    className="w-full glass-input border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-slate-200 text-sm outline-none transition-all placeholder:text-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/10"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-350 tracking-wider uppercase mb-1.5">
                  Kata Sandi (Password)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    id="input-login-password"
                    className="w-full glass-input border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-slate-200 text-sm outline-none transition-all placeholder:text-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/10"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                id="btn-login-submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl transition-all cursor-pointer shadow-md shadow-indigo-600/15 accent-glow"
              >
                Masuk Sekarang
              </button>
            </form>
          ) : (
            /* REGISTER FORM */
            <form onSubmit={handleRegister} className="space-y-4 max-h-[420px] overflow-y-auto pr-1" id="form-register">
              <div>
                <label className="block text-xs font-semibold text-slate-350 tracking-wider uppercase mb-1">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <UserIcon className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={namaLengkap}
                    onChange={(e) => setNamaLengkap(e.target.value)}
                    placeholder="Contoh: Ahmad Fauzi, S.E."
                    id="input-reg-nama"
                    className="w-full glass-input border border-white/10 rounded-xl py-2 pl-10 pr-3 text-slate-200 text-xs outline-none transition-all placeholder:text-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/10"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-350 tracking-wider uppercase mb-1">
                    Alamat Email
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@usaha.com"
                      id="input-reg-email"
                      className="w-full glass-input border border-white/10 rounded-xl py-2 pl-10 pr-3 text-slate-200 text-xs outline-none transition-all placeholder:text-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/10"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-350 tracking-wider uppercase mb-1">
                    Kata Sandi (Password)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 6 Karakter"
                      id="input-reg-password"
                      className="w-full glass-input border border-white/10 rounded-xl py-2 pl-10 pr-3 text-slate-200 text-xs outline-none transition-all placeholder:text-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/10"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-350 tracking-wider uppercase mb-1">
                    Nomor WhatsApp / HP
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <Phone className="w-4 h-4" />
                    </span>
                    <input
                      type="tel"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder="0812xxxxxxxx"
                      id="input-reg-whatsapp"
                      className="w-full glass-input border border-white/10 rounded-xl py-2 pl-10 pr-3 text-slate-200 text-xs outline-none transition-all placeholder:text-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/10"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-350 tracking-wider uppercase mb-1">
                    Nama Usaha / Brand
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <Building className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      value={namaUsaha}
                      onChange={(e) => setNamaUsaha(e.target.value)}
                      placeholder="Contoh: Kripik Sejahtera"
                      id="input-reg-namausaha"
                      className="w-full glass-input border border-white/10 rounded-xl py-2 pl-10 pr-3 text-slate-200 text-xs outline-none transition-all placeholder:text-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/10"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-350 tracking-wider uppercase mb-1">
                  Bidang Usaha
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Briefcase className="w-4 h-4" />
                  </span>
                  <select
                    value={bidangUsaha}
                    onChange={(e) => setBidangUsaha(e.target.value)}
                    id="input-reg-bidangusaha"
                    className="w-full glass text-slate-200 border border-white/10 rounded-xl py-2 pl-10 pr-3 text-xs outline-none transition-all cursor-pointer focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/10"
                  >
                    <option value="Kuliner" className="bg-slate-900 text-white">Kuliner</option>
                    <option value="Fashion" className="bg-slate-900 text-white">Fashion</option>
                    <option value="Perdagangan" className="bg-slate-900 text-white">Perdagangan</option>
                    <option value="Agrobisnis & Pertanian" className="bg-slate-900 text-white">Agrobisnis & Pertanian</option>
                    <option value="Produk Kreatif & Kerajinan" className="bg-slate-900 text-white">Produk Kreatif & Kerajinan</option>
                    <option value="Jasa" className="bg-slate-900 text-white">Jasa</option>
                    <option value="Teknologi" className="bg-slate-900 text-white">Teknologi</option>
                    <option value="Lainnya" className="bg-slate-900 text-white">Lainnya</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                id="btn-register-submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer uppercase tracking-wider shadow-md shadow-indigo-600/15 accent-glow"
              >
                Daftar Sebagai Peserta
              </button>
            </form>
          )}

          {/* Quick Demo Accounts Helper Panel */}
          <div className="mt-6 pt-5 border-t border-white/10">
            <span className="block text-[11px] font-semibold text-indigo-400 font-mono tracking-wide uppercase text-center mb-3">
              ⚡ Akun Demo Instan (Penguji / Assessor):
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                id="btn-demo-peserta"
                onClick={() => handleDemoLogin('peserta@umkm.id', 'peserta123')}
                className="py-1.5 px-1 bg-white/5 hover:bg-indigo-600/35 hover:border-indigo-500 border border-white/5 rounded-lg text-slate-200 text-[10px] text-center transition-all cursor-pointer"
              >
                🎒 Peserta
                <span className="block text-[8px] text-slate-405 font-mono">peserta123</span>
              </button>
              <button
                type="button"
                id="btn-demo-admin"
                onClick={() => handleDemoLogin('admin@umkm.id', 'admin123')}
                className="py-1.5 px-1 bg-white/5 hover:bg-indigo-600/35 hover:border-indigo-400 border border-white/5 rounded-lg text-slate-200 text-[10px] text-center transition-all cursor-pointer"
              >
                🛡️ Moderator
                <span className="block text-[8px] text-slate-405 font-mono">admin123</span>
              </button>
              <button
                type="button"
                id="btn-demo-superadmin"
                onClick={() => handleDemoLogin('superadmin@umkm.id', 'superadmin123')}
                className="py-1.5 px-1 bg-white/5 hover:bg-indigo-600/35 hover:border-violet-400 border border-white/5 rounded-lg text-slate-200 text-[10px] text-center transition-all cursor-pointer"
              >
                ⚜️ SuperAdmin
                <span className="block text-[8px] text-slate-405 font-mono flex-none">superadmin123</span>
              </button>
            </div>
          </div>

          <div className="mt-5 text-center">
            <button
              onClick={() => {
                setErrorMsg('');
                setMode(mode === 'login' ? 'register' : 'login');
              }}
              id="btn-toggle-auth-mode"
              className="inline-flex items-center space-x-1 text-xs text-slate-400 hover:text-indigo-400 transition-colors"
            >
              <span>
                {mode === 'login' 
                  ? 'Belum punya akun? Registrasi di sini' 
                  : 'Sudah memiliki akun terdaftar? Login'}
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
