/**
 * Database Layer for Webinar UMKM Online
 * Stores data in LocalStorage to prevent data loss on browser refresh
 * as requested.
 */

export interface User {
  id: string; // email as ID
  namaLengkap: string;
  email: string;
  password?: string;
  whatsapp: string;
  namaUsaha: string;
  bidangUsaha: string; // Kuliner, Fashion, Perdagangan, etc.
  role: 'peserta' | 'admin' | 'superadmin';
  registeredWebinars: string[]; // Webinar ids
  paidWebinars?: string[]; // Paid webinar ids
  checkedIn: string[]; // Attended webinar ids
  certificates: {
    webinarId: string;
    code: string;
    issuedAt: string;
  }[];
}

export interface Webinar {
  id: string;
  title: string;
  speaker: string;
  speakerTitle: string;
  date: string;
  time: string;
  status: 'upcoming' | 'live' | 'completed';
  description: string;
  summary?: string; // AI generated summary
  materialUrl?: string; // PDF link
  materialAudioUrl?: string; // Audio link (MP3, Podcast URL, etc.)
  materialVideoUrl?: string; // External Video link (YouTube, external link, etc.)
  recordingUrl?: string; // Video URL
  zoomJoinUrl: string;
  zoomStartUrl: string;
  registeredCount: number;
}

export interface ChatMessage {
  id: string;
  webinarId: string;
  senderName: string;
  senderRole: 'peserta' | 'admin' | 'superadmin';
  message: string;
  timestamp: string;
}

export interface SystemSettings {
  zoomApiKey: string;
  zoomConnected: boolean;
  googleCalendarConnected: boolean;
  midtransConnected: boolean;
  midtransClientKey: string;
  restrictZoomUnpaid: boolean;
  bankInfoBank: string;
  bankInfoNumber: string;
  bankInfoName: string;
  ticketPrice: number;
  totalSales: number;
  trafficVisits: number;
}

export const INITIAL_WEBINARS: Webinar[] = [
  {
    id: 'webinar-1',
    title: 'Tips & Trik Digital Marketing untuk UMKM Kuliner Beromset Ratusan Juta',
    speaker: 'Budi Santoso, MBA',
    speakerTitle: 'Digital Strategist & Founder Kulinaria Grup',
    date: '2026-06-25',
    time: '14:00 - 16:00 WIB',
    status: 'upcoming',
    description: 'Pelajari dasar-dasar digital marketing, cara membuat konten viral di TikTok dan Instagram, serta bagaimana mengoptimalkan Google Maps bisnis untuk mendapatkan pelanggan lokal tanpa modal besar.',
    zoomJoinUrl: 'https://zoom.us/j/98765432101',
    zoomStartUrl: 'https://zoom.us/s/98765432101_start',
    registeredCount: 142
  },
  {
    id: 'webinar-2',
    title: 'Optimalisasi Finansial & Pembukuan Praktis Berbasis Aplikasi bagi Bisnis Retail',
    speaker: 'Rina Wijaya, CPA',
    speakerTitle: 'Konsultan Keuangan Independen & Penulis Buku Finansial UMKM',
    date: '2026-06-23', // Live today
    time: '10:00 - 12:00 WIB',
    status: 'live',
    description: 'Webinar interaktif mengulas teknik pencatatan kas harian, menghitung harga pokok penjualan (HPP) yang akurat, menghindari kebocoran modal, dan pemanfaatan aplikasi pembukuan digital gratis.',
    zoomJoinUrl: 'https://zoom.us/j/98765432102',
    zoomStartUrl: 'https://zoom.us/s/98765432102_start',
    registeredCount: 218
  },
  {
    id: 'webinar-3',
    title: 'Strategi Sukses Tembus Pasar Ekspor Kerajinan Tangan & Fashion Ramah Lingkungan',
    speaker: 'Denny Hermawan',
    speakerTitle: 'Export Advisor & Founder IndonesiaCraft',
    date: '2026-06-20',
    time: '09:00 - 11:30 WIB',
    status: 'completed',
    description: 'Bagaimana melihat peluang pasar internasional, menetapkan harga jual ekspor, memahami kepabeanan sederhana, dan berjejaring dengan pembeli luar negeri lewat pameran virtual.',
    summary: 'Webinar ini membahas pentingnya sertifikasi eco-friendly pada produk anyaman kriya, pembentukan brand identity yang menarik bagi pasar Eropa/Jepang, serta pemanfaatan export hub kementerian perdagangan untuk logistik yang lebih terjangkau.',
    materialUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', // Dummy PDF URL
    recordingUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    zoomJoinUrl: 'https://zoom.us/j/98765432103',
    zoomStartUrl: 'https://zoom.us/s/98765432103_start',
    registeredCount: 310
  }
];

export const INITIAL_USERS: User[] = [
  {
    id: 'superadmin@umkm.id',
    namaLengkap: 'Pak Budi Hartono',
    email: 'superadmin@umkm.id',
    password: 'superadmin123',
    whatsapp: '081234567890',
    namaUsaha: 'Kementerian UMKM Online',
    bidangUsaha: 'Teknologi',
    role: 'superadmin',
    registeredWebinars: ['webinar-1', 'webinar-2', 'webinar-3'],
    checkedIn: ['webinar-3'],
    certificates: []
  },
  {
    id: 'admin@umkm.id',
    namaLengkap: 'Siti Aminah',
    email: 'admin@umkm.id',
    password: 'admin123',
    whatsapp: '081299998888',
    namaUsaha: 'UMKM Center Indonesia',
    bidangUsaha: 'Jasa',
    role: 'admin',
    registeredWebinars: ['webinar-2', 'webinar-3'],
    checkedIn: ['webinar-3'],
    certificates: []
  },
  {
    id: 'peserta@umkm.id',
    namaLengkap: 'Ahmad Fauzi',
    email: 'peserta@umkm.id',
    password: 'peserta123',
    whatsapp: '085711223344',
    namaUsaha: 'Kripik Tempe Renyah Jaya',
    bidangUsaha: 'Kuliner',
    role: 'peserta',
    registeredWebinars: ['webinar-1', 'webinar-3'],
    checkedIn: ['webinar-3'],
    certificates: [
      {
        webinarId: 'webinar-3',
        code: 'CERT-UMKM-2026-00312',
        issuedAt: '2026-06-20'
      }
    ]
  }
];

export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'chat-1',
    webinarId: 'webinar-2',
    senderName: 'Ahmad Fauzi',
    senderRole: 'peserta',
    message: 'Selamat pagi bapak/ibu narasumber! Izin bertanya, untuk modal awal retail, lebih baik pakai modal sendiri atau pinjaman bank komersil ya?',
    timestamp: '10:05'
  },
  {
    id: 'chat-2',
    webinarId: 'webinar-2',
    senderName: 'Siti Aminah',
    senderRole: 'admin',
    message: 'Selamat pagi Kak Ahmad. Pertanyaan ditampung ya, nanti akan diajukan ke Ibu Rina di sesi tanya jawab.',
    timestamp: '10:06'
  },
  {
    id: 'chat-3',
    webinarId: 'webinar-2',
    senderName: 'Dewi Lestari',
    senderRole: 'peserta',
    message: 'Apakah ada materi slide PPT yang bisa kita download nanti?',
    timestamp: '10:12'
  },
  {
    id: 'chat-4',
    webinarId: 'webinar-2',
    senderName: 'Siti Aminah',
    senderRole: 'admin',
    message: 'Ada Kak Dewi, setelah sesi selesai, slide materi PDF bisa langsung diunduh lewat Dashboard Peserta masing-masing.',
    timestamp: '10:13'
  }
];

export const INITIAL_SETTINGS: SystemSettings = {
  zoomApiKey: 'ZOOM_CLIENT_ID_XYZ_99988',
  zoomConnected: true,
  googleCalendarConnected: true,
  midtransConnected: false,
  midtransClientKey: 'SB-Mid-client-881h29b',
  restrictZoomUnpaid: false,
  bankInfoBank: 'Bank BCA',
  bankInfoNumber: '8830123456',
  bankInfoName: 'CV UMKM Digital Indonesia',
  ticketPrice: 50000, // IDR 50k
  totalSales: 8250000, // Simulated sales value
  trafficVisits: 1420
};

// LocalStorage Helper Keys
const KEYS = {
  USERS: 'umkm_webinar_users',
  WEBINARS: 'umkm_webinar_webinars',
  CHAT: 'umkm_webinar_chats',
  SETTINGS: 'umkm_webinar_settings'
};

export function getStoredData<T>(key: string, defaultValue: T): T {
  try {
    const data = localStorage.getItem(key);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Error reading localStorage', e);
  }
  // If not found, store default value
  localStorage.setItem(key, JSON.stringify(defaultValue));
  return defaultValue;
}

export function setStoredData<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Error writing localStorage', e);
  }
}

// Real-time notification hooks
let listeners: Array<() => void> = [];

// Exportable Database Actions
export const DB = {
  subscribe(callback: () => void) {
    listeners.push(callback);
    return () => {
      listeners = listeners.filter(l => l !== callback);
    };
  },

  notify() {
    listeners.forEach(l => {
      try {
        l();
      } catch (e) {
        console.error("Listener error", e);
      }
    });
  },

  // USERS
  getUsers(): User[] {
    return getStoredData<User[]>(KEYS.USERS, INITIAL_USERS);
  },

  saveUsers(users: User[]): void {
    setStoredData(KEYS.USERS, users);
    // Write all users to Firestore (e.g. for role updates)
    import("./firebase").then(({ FirestoreDB }) => {
      for (const u of users) {
        FirestoreDB.saveUser(u);
      }
    });
    this.notify();
  },

  getUserByEmail(email: string): User | undefined {
    const found = this.getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
    if (found) return found;

    // Fallback to static INITIAL_USERS if sync hasn't written/re-seeded it yet
    const fallback = INITIAL_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (fallback) {
      const currentList = this.getUsers();
      if (!currentList.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        currentList.push(fallback);
        setStoredData(KEYS.USERS, currentList);
        // Async save to firestore
        import("./firebase").then(({ FirestoreDB }) => {
          FirestoreDB.saveUser(fallback);
        });
      }
      return fallback;
    }
    return undefined;
  },

  registerUser(newUser: Omit<User, 'registeredWebinars' | 'checkedIn' | 'certificates'>): User {
    const users = this.getUsers();
    const user: User = {
      ...newUser,
      registeredWebinars: [],
      checkedIn: [],
      certificates: []
    };
    users.push(user);
    setStoredData(KEYS.USERS, users);
    
    // Save to Firestore asynchronously
    import("./firebase").then(({ FirestoreDB }) => {
      FirestoreDB.saveUser(user);
    });
    
    this.notify();
    return user;
  },

  updateUser(updatedUser: User): void {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.email.toLowerCase() === updatedUser.email.toLowerCase());
    if (idx !== -1) {
      users[idx] = updatedUser;
      setStoredData(KEYS.USERS, users);
      
      // Save to Firestore asynchronously
      import("./firebase").then(({ FirestoreDB }) => {
        FirestoreDB.saveUser(updatedUser);
      });
      
      this.notify();
    }
  },

  // WEBINARS
  getWebinars(): Webinar[] {
    return getStoredData<Webinar[]>(KEYS.WEBINARS, INITIAL_WEBINARS);
  },

  saveWebinars(webinars: Webinar[]): void {
    setStoredData(KEYS.WEBINARS, webinars);
    this.notify();
  },

  getWebinarById(id: string): Webinar | undefined {
    return this.getWebinars().find(w => w.id === id);
  },

  addWebinar(webinar: Omit<Webinar, 'registeredCount'>): Webinar {
    const webinars = this.getWebinars();
    const newWebinar: Webinar = {
      ...webinar,
      registeredCount: 0
    };
    webinars.push(newWebinar);
    setStoredData(KEYS.WEBINARS, webinars);
    
    // Save to Firestore asynchronously
    import("./firebase").then(({ FirestoreDB }) => {
      FirestoreDB.saveWebinar(newWebinar);
    });
    
    this.notify();
    return newWebinar;
  },

  updateWebinar(updatedWebinar: Webinar): void {
    const webinars = this.getWebinars();
    const idx = webinars.findIndex(w => w.id === updatedWebinar.id);
    if (idx !== -1) {
      webinars[idx] = updatedWebinar;
      setStoredData(KEYS.WEBINARS, webinars);
      
      // Save to Firestore asynchronously
      import("./firebase").then(({ FirestoreDB }) => {
        FirestoreDB.saveWebinar(updatedWebinar);
      });
      
      this.notify();
    }
  },

  deleteWebinar(id: string): void {
    const webinars = this.getWebinars();
    const filtered = webinars.filter(w => w.id !== id);
    setStoredData(KEYS.WEBINARS, filtered);
    
    // Save to Firestore asynchronously
    import("./firebase").then(({ FirestoreDB }) => {
      FirestoreDB.deleteWebinar(id);
    });
    
    this.notify();
  },

  // CHAT
  getChats(webinarId: string): ChatMessage[] {
    const allChats = getStoredData<ChatMessage[]>(KEYS.CHAT, INITIAL_CHAT_MESSAGES);
    return allChats.filter(c => c.webinarId === webinarId);
  },

  addChatMessage(webinarId: string, senderName: string, senderRole: 'peserta' | 'admin' | 'superadmin', message: string): ChatMessage {
    const allChats = getStoredData<ChatMessage[]>(KEYS.CHAT, INITIAL_CHAT_MESSAGES);
    
    // Get formatted time (HH:MM)
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newMsg: ChatMessage = {
      id: `chat-${Date.now()}`,
      webinarId,
      senderName,
      senderRole,
      message,
      timestamp: timeStr
    };

    allChats.push(newMsg);
    setStoredData(KEYS.CHAT, allChats);
    
    // Save to Firestore asynchronously
    import("./firebase").then(({ FirestoreDB }) => {
      FirestoreDB.addChatMessage(newMsg);
    });
    
    this.notify();
    return newMsg;
  },

  clearChats(webinarId: string): void {
    const allChats = getStoredData<ChatMessage[]>(KEYS.CHAT, INITIAL_CHAT_MESSAGES);
    const filtered = allChats.filter(c => c.webinarId !== webinarId);
    setStoredData(KEYS.CHAT, filtered);
    
    // Save to Firestore asynchronously
    import("./firebase").then(({ FirestoreDB }) => {
      FirestoreDB.clearChats(webinarId, allChats);
    });
    
    this.notify();
  },

  // SYSTEM SETTINGS
  getSettings(): SystemSettings {
    return getStoredData<SystemSettings>(KEYS.SETTINGS, INITIAL_SETTINGS);
  },

  saveSettings(settings: SystemSettings): void {
    setStoredData(KEYS.SETTINGS, settings);
    
    // Save to Firestore asynchronously
    import("./firebase").then(({ FirestoreDB }) => {
      FirestoreDB.saveSettings(settings);
    });
    
    this.notify();
  },

  increaseTraffic(): number {
    const settings = this.getSettings();
    settings.trafficVisits += 1;
    setStoredData(KEYS.SETTINGS, settings);
    
    // Save to Firestore asynchronously
    import("./firebase").then(({ FirestoreDB }) => {
      FirestoreDB.saveSettings(settings);
    });
    
    this.notify();
    return settings.trafficVisits;
  }
};
