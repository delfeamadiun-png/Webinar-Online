import { User, Webinar, ChatMessage, SystemSettings } from "./types";

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
  ticketPrice: 50000, 
  totalSales: 8250000, 
  trafficVisits: 1420,

  // Custom landing settings defaults
  landingTitle: 'WEBINAR UMKM',
  landingSubTitle: 'Online Hub',
  landingHeroBadge: 'Akselerasi Pengusaha Mikro Indonesia',
  landingHeroTitle: 'Go Digital & Naik Kelas',
  landingHeroDesc: 'Dapatkan ilmu bisnis praktis langsung dari para ahli pengekspor, praktisi digital marketing, dan konsultan keuangan nasional. Program dibimbing interaktif dengan materi PDF, e-sertifikat resmi, dan live workshop Zoom terintegrasi.',
  landingAgendaTitle: 'AGENDA TERJADWAL',
  landingFilterLabel: 'Filter Topik:',
  landingLogoUrl: '', // Default represents default Globe icon or a beautiful vector

  // Custom benefits list default items
  featuresList: [
    {
      id: 'feat-1',
      title: '100% Gratis Bersertifikat',
      description: 'Seluruh sesi webinar didukung penuh oleh asosiasi UMKM bersama kementerian untuk mengakselerasi keterampilan manajemen.'
    },
    {
      id: 'feat-2',
      title: 'Integrasi Zoom Interaktif',
      description: 'Berdiskusi dua arah dengan pemateri, bertanya via board chat, dan menyerap materi praktek harian secara langsung.'
    },
    {
      id: 'feat-3',
      title: 'Alumni Terbukti Sukses Ekspor',
      description: 'Raih peluang jejaring dan saksikan ratusan komoditas retail kriya, kuliner, dan fashion binaan yang berhasil go global.'
    }
  ],

  // Default certificate settings
  certSpeaker1Name: 'Dr. H. Sandiaga Uno, B.B.A.',
  certSpeaker1Sign: '',
  certSpeaker2Name: 'Ibu Rina Astuti, M.E.',
  certSpeaker2Sign: '',
  certSpeaker3Name: 'Bapak Budi Santoso, S.E.',
  certSpeaker3Sign: '',
  certSealImgUrl: ''
};
