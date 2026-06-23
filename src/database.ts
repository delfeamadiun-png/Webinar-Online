/**
 * Database Layer for Webinar UMKM Online
 * Stores data in LocalStorage to prevent data loss on browser refresh
 * as requested.
 */

import { User, Webinar, ChatMessage, SystemSettings } from "./types";
import { 
  INITIAL_USERS, 
  INITIAL_WEBINARS, 
  INITIAL_SETTINGS, 
  INITIAL_CHAT_MESSAGES 
} from "./initialData";
import { FirestoreDB } from "./firebase";

export type { User, Webinar, ChatMessage, SystemSettings };
export { 
  INITIAL_USERS, 
  INITIAL_WEBINARS, 
  INITIAL_SETTINGS, 
  INITIAL_CHAT_MESSAGES 
};

// LocalStorage Helper Keys

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
    for (const u of users) {
      FirestoreDB.saveUser(u);
    }
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
        // Save to firestore statically
        FirestoreDB.saveUser(fallback);
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
    
    // Save to Firestore statically
    FirestoreDB.saveUser(user);
    
    this.notify();
    return user;
  },

  updateUser(updatedUser: User): void {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.email.toLowerCase() === updatedUser.email.toLowerCase());
    if (idx !== -1) {
      users[idx] = updatedUser;
      setStoredData(KEYS.USERS, users);
      
      // Save to Firestore statically
      FirestoreDB.saveUser(updatedUser);
      
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
    
    // Save to Firestore statically
    FirestoreDB.saveWebinar(newWebinar);
    
    this.notify();
    return newWebinar;
  },

  updateWebinar(updatedWebinar: Webinar): void {
    const webinars = this.getWebinars();
    const idx = webinars.findIndex(w => w.id === updatedWebinar.id);
    if (idx !== -1) {
      webinars[idx] = updatedWebinar;
      setStoredData(KEYS.WEBINARS, webinars);
      
      // Save to Firestore statically
      FirestoreDB.saveWebinar(updatedWebinar);
      
      this.notify();
    }
  },

  deleteWebinar(id: string): void {
    const webinars = this.getWebinars();
    const filtered = webinars.filter(w => w.id !== id);
    setStoredData(KEYS.WEBINARS, filtered);
    
    // Save to Firestore statically
    FirestoreDB.deleteWebinar(id);
    
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
    
    // Save to Firestore statically
    FirestoreDB.addChatMessage(newMsg);
    
    this.notify();
    return newMsg;
  },

  clearChats(webinarId: string): void {
    const allChats = getStoredData<ChatMessage[]>(KEYS.CHAT, INITIAL_CHAT_MESSAGES);
    const filtered = allChats.filter(c => c.webinarId !== webinarId);
    setStoredData(KEYS.CHAT, filtered);
    
    // Save to Firestore statically
    FirestoreDB.clearChats(webinarId, allChats);
    
    this.notify();
  },

  // SYSTEM SETTINGS
  getSettings(): SystemSettings {
    return getStoredData<SystemSettings>(KEYS.SETTINGS, INITIAL_SETTINGS);
  },

  saveSettings(settings: SystemSettings): void {
    setStoredData(KEYS.SETTINGS, settings);
    
    // Save to Firestore statically
    FirestoreDB.saveSettings(settings);
    
    this.notify();
  },

  increaseTraffic(): number {
    const settings = this.getSettings();
    settings.trafficVisits += 1;
    setStoredData(KEYS.SETTINGS, settings);
    
    // Save to Firestore statically
    FirestoreDB.saveSettings(settings);
    
    this.notify();
    return settings.trafficVisits;
  }
};
