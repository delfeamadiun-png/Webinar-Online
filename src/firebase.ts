import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy,
  writeBatch
} from "firebase/firestore";
import { User, Webinar, ChatMessage, SystemSettings, DB } from "./database";

const firebaseConfig = {
  projectId: "handy-modem-36d0h",
  appId: "1:548760493503:web:38f625c4fec3378de3950a",
  apiKey: "AIzaSyBC7osOXSRTXfRD1wknoxtoMp6ZulvYFbw",
  authDomain: "handy-modem-36d0h.firebaseapp.com",
  storageBucket: "handy-modem-36d0h.firebasestorage.app",
  messagingSenderId: "548760493503"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with the custom databaseId provided by AI Studio
export const db = getFirestore(app, "ai-studio-c6171ec4-6b1d-43ab-85fb-a8f7bb658b3b");

// Firebase status
let isSeeded = false;

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
      email: null,
      emailVerified: null,
      isAnonymous: null,
      tenantId: null,
      providerInfo: []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Seed Initial Data to Firestore if empty
export async function seedFirestoreIfNeeded(
  initialUsers: User[],
  initialWebinars: Webinar[],
  initialSettings: SystemSettings,
  initialChats: ChatMessage[]
) {
  if (isSeeded) return;
  try {
    console.log("Checking Firestore collections to ensure they are fully populated and self-healed...");

    // 1. Check & Seed Settings
    const settingsDocRef = doc(db, "settings", "global");
    try {
      const settingsSnap = await getDoc(settingsDocRef);
      if (!settingsSnap.exists()) {
        console.log("Settings global missing. Seeding system settings...");
        await setDoc(settingsDocRef, initialSettings);
      }
    } catch (e) {
      console.warn("Could not retrieve/seed settings, checking users...", e);
    }

    // 2. Check & Seed Users (especially superadmin)
    const superadminDocRef = doc(db, "users", "superadmin@umkm.id");
    try {
      const superadminSnap = await getDoc(superadminDocRef);
      if (!superadminSnap.exists()) {
        console.log("Superadmin account missing from Firestore. Seeding administrative and initial users...");
        for (const u of initialUsers) {
          await setDoc(doc(db, "users", u.email.toLowerCase()), u);
        }
      }
    } catch (e) {
      console.warn("Could not retrieve/seed users...", e);
    }

    // 3. Check & Seed Webinars
    try {
      const webinarsSnap = await getDocs(collection(db, "webinars"));
      if (webinarsSnap.empty) {
        console.log("Webinars collection empty. Seeding initial webinars...");
        for (const w of initialWebinars) {
          await setDoc(doc(db, "webinars", w.id), w);
        }
      }
    } catch (e) {
      console.warn("Could not retrieve/seed webinars...", e);
    }

    isSeeded = true;
    console.log("Firestore healing configuration complete.");
  } catch (err) {
    console.error("Error checking/seeding Firestore:", err);
  }
}

// Set up Real-time Listeners to pull data into LocalStorage transparently
export function startRealtimeSync(onUpdateCallback: () => void) {
  console.log("Starting real-time sync with Cloud Firestore...");

  // 1. Sync Settings
  const unsubSettings = onSnapshot(doc(db, "settings", "global"), (snap) => {
    if (snap.exists()) {
      const data = snap.data() as SystemSettings;
      localStorage.setItem("umkm_webinar_settings", JSON.stringify(data));
      onUpdateCallback();
    }
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, "settings/global");
  });

  // 2. Sync Users
  const unsubUsers = onSnapshot(collection(db, "users"), (snap) => {
    const users: User[] = [];
    snap.forEach((doc) => {
      users.push(doc.data() as User);
    });
    if (users.length > 0) {
      localStorage.setItem("umkm_webinar_users", JSON.stringify(users));
      onUpdateCallback();
    }
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, "users");
  });

  // 3. Sync Webinars
  const unsubWebinars = onSnapshot(collection(db, "webinars"), (snap) => {
    const webinars: Webinar[] = [];
    snap.forEach((doc) => {
      webinars.push(doc.data() as Webinar);
    });
    if (webinars.length > 0) {
      // Sort webinars by date & time or ID to keep consistent
      webinars.sort((a, b) => a.id.localeCompare(b.id));
      localStorage.setItem("umkm_webinar_webinars", JSON.stringify(webinars));
      onUpdateCallback();
    }
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, "webinars");
  });

  // 4. Sync Chats
  const unsubChats = onSnapshot(collection(db, "chats"), (snap) => {
    const chats: ChatMessage[] = [];
    snap.forEach((doc) => {
      chats.push(doc.data() as ChatMessage);
    });
    if (chats.length > 0) {
      localStorage.setItem("umkm_webinar_chats", JSON.stringify(chats));
      onUpdateCallback();
    }
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, "chats");
  });

  return () => {
    unsubSettings();
    unsubUsers();
    unsubWebinars();
    unsubChats();
  };
}

// CRUD operations that write directly to Firestore to keep database authoritative
export const FirestoreDB = {
  // Update/Save single user
  async saveUser(user: User): Promise<void> {
    try {
      await setDoc(doc(db, "users", user.email.toLowerCase()), user);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `users/${user.email.toLowerCase()}`);
    }
  },

  // Update/Save single webinar
  async saveWebinar(webinar: Webinar): Promise<void> {
    try {
      await setDoc(doc(db, "webinars", webinar.id), webinar);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `webinars/${webinar.id}`);
    }
  },

  // Delete single webinar
  async deleteWebinar(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, "webinars", id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `webinars/${id}`);
    }
  },

  // Add chat message
  async addChatMessage(msg: ChatMessage): Promise<void> {
    try {
      await setDoc(doc(db, "chats", msg.id), msg);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `chats/${msg.id}`);
    }
  },

  // Clear chat messages of a webinar
  async clearChats(webinarId: string, chats: ChatMessage[]): Promise<void> {
    try {
      const msgsToDelete = chats.filter(c => c.webinarId === webinarId);
      for (const m of msgsToDelete) {
        try {
          await deleteDoc(doc(db, "chats", m.id));
        } catch (e) {
          handleFirestoreError(e, OperationType.DELETE, `chats/${m.id}`);
        }
      }
    } catch (e) {
      console.error("Error clearing chats in Firestore:", e);
    }
  },

  // Save Settings
  async saveSettings(settings: SystemSettings): Promise<void> {
    try {
      await setDoc(doc(db, "settings", "global"), settings);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, "settings/global");
    }
  }
};
