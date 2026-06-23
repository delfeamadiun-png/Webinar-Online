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
