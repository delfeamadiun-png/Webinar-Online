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
  price?: number;
}

export interface ChatMessage {
  id: string;
  webinarId: string;
  senderName: string;
  senderRole: 'peserta' | 'admin' | 'superadmin';
  message: string;
  timestamp: string;
}

export interface FeatureBenefit {
  id: string;
  title: string;
  description: string;
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

  // Custom landing settings
  landingTitle?: string;
  landingSubTitle?: string;
  landingHeroBadge?: string;
  landingHeroTitle?: string;
  landingHeroDesc?: string;
  landingAgendaTitle?: string;
  landingFilterLabel?: string;
  landingLogoUrl?: string; // base64 or URL

  // Custom features lists (Create, Update, Delete supported)
  featuresList?: FeatureBenefit[];

  // Custom Certificate fields
  certSpeaker1Name?: string;
  certSpeaker1Sign?: string;
  certSpeaker1Title?: string;
  certSpeaker1Active?: boolean;
  certSpeaker2Name?: string;
  certSpeaker2Sign?: string;
  certSpeaker2Title?: string;
  certSpeaker2Active?: boolean;
  certSpeaker3Name?: string;
  certSpeaker3Sign?: string;
  certSpeaker3Title?: string;
  certSpeaker3Active?: boolean;
  certSealImgUrl?: string;
}
