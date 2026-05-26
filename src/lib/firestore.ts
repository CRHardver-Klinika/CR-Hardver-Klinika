import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  query, 
  where, 
  getDocs, 
  orderBy,
  doc,
  getDoc,
  updateDoc,
  increment,
  setDoc
} from 'firebase/firestore';
import { db, auth } from './firebase';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
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

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const submitExternalLead = async (name: string, email: string, content: string) => {
  let endpoint = 'https://ais-pre-ta7a2rjrsgu3csqb4hq6o3-98336789424.europe-west2.run.app/api/external-lead';
  
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname.includes('ais-dev-') || hostname.includes('localhost') || hostname.includes('ais-dev-ta7a2rjrsgu3csqb4hq6o3')) {
      endpoint = 'https://ais-dev-ta7a2rjrsgu3csqb4hq6o3-98336789424.europe-west2.run.app/api/external-lead';
    }
  }
  
  const payload = {
    name,
    nev: name,
    email,
    content,
    message: content,
    uzenet: content,
    secretKey: "HardverKlinika_Secure_2024_Link",
    apiKey: "HardverKlinika_Secure_2024_Link"
  };

  // Set a 15-second timeout on the network request
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 15000);

  try {
    console.log(`Sending external lead request directly to ${endpoint}...`);
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    
    clearTimeout(id);

    // Read response safely as text first to bypass any HTML/non-JSON schema errors
    const responseText = await response.text();
    let responseData: any = null;
    let isJson = false;

    try {
      responseData = JSON.parse(responseText);
      isJson = true;
    } catch (parseError) {
      isJson = false;
    }

    if (!response.ok) {
      const serverError = isJson && responseData?.error ? responseData.error : `Szerver válasza (${response.status})`;
      throw new Error(serverError);
    }

    console.log("External lead sent successfully directly to CRM:", responseData);
    return true;
  } catch (error: any) {
    clearTimeout(id);
    if (error.name === 'AbortError') {
      throw new Error("A CRM szerver nem válaszolt időben (időtúllépés, 15mp).");
    }
    console.log("[CRM Sync Status] Note: External API sync not completed:", error.message || error);
    throw new Error(error.message || 'CRM szerver elérési vagy hálózati hiba.');
  }
};

export const submitMessage = async (name: string, email: string, content: string) => {
  const path = 'messages';
  const ownerId = "L7bYE6FvjKOKyNBsXayUYZnWAVw1";
  
  // 1. Save directly to the 'messages' collection
  try {
    const docRef = await addDoc(collection(db, path), {
      name,
      email,
      content,
      message: content,
      description: content,
      status: 'new',
      createdAt: serverTimestamp(),
      ownerId: ownerId,
      ownerUid: ownerId,
      userId: ownerId,
      ALAPÉRTELMEZETT_TULAJDONOS_AZONOSÍTÓ: ownerId
    });
    console.log('Message successfully saved directly to Firestore with ID:', docRef.id);
  } catch (firestoreError: any) {
    console.error('Core Firestore write to messages failed:', firestoreError);
    throw new Error('Hiba történt az üzenet küldése során. Kérjük, próbáld újra később!');
  }

  // 2. Save directly to 'service' collection (so it appears immediately under CRM "weboldal megkeresés")
  try {
    const todayStr = new Date().toISOString().split("T")[0];
    const serviceDocRef = await addDoc(collection(db, "service"), {
      ownerId: ownerId,
      workName: "Web Ajánlatkérés", // Filtering condition for Weboldal megkeresés
      date: todayStr,
      client: name,
      phone: "",
      email: email,
      address: "",
      device: "Weboldal megkeresés",
      issue: content,
      status: "Folyamatban",
      createdAt: serverTimestamp()
    });
    console.log('Successfully wrote web lead directly to service collection:', serviceDocRef.id);
  } catch (serviceError: any) {
    console.error('Core Firestore write to service collection failed:', serviceError);
  }

  // 3. Save directly to 'services' collection (just in case the other uses services)
  try {
    const todayStr = new Date().toISOString().split("T")[0];
    const servicesDocRef = await addDoc(collection(db, "services"), {
      ownerId: ownerId,
      workName: "Web Ajánlatkérés", // Filtering condition for Weboldal megkeresés
      date: todayStr,
      client: name,
      phone: "",
      email: email,
      address: "",
      device: "Weboldal megkeresés",
      issue: content,
      status: "Folyamatban",
      createdAt: serverTimestamp()
    });
    console.log('Successfully wrote web lead directly to services collection:', servicesDocRef.id);
  } catch (servicesError: any) {
    console.error('Core Firestore write to services collection failed:', servicesError);
  }

  // 4. Attempt secondary proxy synchronization to the database app's REST API (non-blocking fallback)
  try {
    console.log('Synchronizing lead over REST proxy to database app...');
    await submitExternalLead(name, email, content);
  } catch (proxyError: any) {
    console.warn('[Proxy Warning] Secondary REST API synchronization failed:', proxyError.message);
  }
};

export interface LiveStats {
  inquiries: number;
  views: number;
}

const INQUIRIES_BASE = 14;
const VIEWS_BASE = 48;

// Safety promise timeout wrapper with 1.5 seconds default threshold
const withTimeout = <T>(promise: Promise<T>, ms: number = 1500): Promise<T> => {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Timeout after ${ms}ms`));
    }, ms);

    promise
      .then((res) => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
};

export const getLiveStats = async (): Promise<LiveStats> => {
  try {
    const docRef = doc(db, 'stats', 'inquiry');
    // Bypasses hanging behavior due to browser adblockers or connection blockades
    const docSnap = await withTimeout(getDoc(docRef), 1500);
    if (docSnap.exists()) {
      const data = docSnap.data();
      const messagesCount = data.messagesCount || 0;
      const serviceCount = data.serviceCount || 0;
      const clicksCount = data.clicksCount || 0;
      const viewsCount = data.viewsCount || 0;
      return {
        inquiries: INQUIRIES_BASE + messagesCount + serviceCount + clicksCount,
        views: VIEWS_BASE + viewsCount
      };
    }
  } catch (err: any) {
    console.warn("[getLiveStats] Direct Firestore retrieval timed out or failed. Utilizing fallbacks:", err.message || err);
  }
  return { inquiries: INQUIRIES_BASE, views: VIEWS_BASE };
};

export const incrementStatsLive = async (type: 'view' | 'click'): Promise<LiveStats | null> => {
  try {
    const docRef = doc(db, 'stats', 'inquiry');
    const updates: any = {};
    if (type === 'view') {
      updates.viewsCount = increment(1);
    } else if (type === 'click') {
      updates.clicksCount = increment(1);
    }
    updates.updatedAt = serverTimestamp();
    
    // Try updating with a robust timeout constraint
    try {
      await withTimeout(updateDoc(docRef, updates), 1500);
    } catch (e: any) {
      if (e.message && e.message.includes('Timeout')) {
        console.warn("[incrementStatsLive] Timeout during update. Serving instant local increment fallback.");
        return {
          inquiries: INQUIRIES_BASE + (type === 'click' ? 1 : 0),
          views: VIEWS_BASE + (type === 'view' ? 1 : 0)
        };
      }
      
      if (e.code === 'not-found') {
        const initial: any = {
          messagesCount: 0,
          serviceCount: 0,
          clicksCount: type === 'click' ? 1 : 0,
          viewsCount: type === 'view' ? 1 : 0,
          updatedAt: serverTimestamp()
        };
        await withTimeout(setDoc(docRef, initial, { merge: true }), 1500);
      } else {
        throw e;
      }
    }
    
    // Safely retrieve the stats, guaranteed by the inner 1.5s timeout
    return await getLiveStats();
  } catch (err: any) {
    console.warn("[incrementStatsLive] Error updating stats on Firestore. Handling with fallback:", err.message || err);
    // Instant local optimistic update to continue giving immediate tactile feedback on clicked items
    return { 
      inquiries: INQUIRIES_BASE + (type === 'click' ? 1 : 0), 
      views: VIEWS_BASE + (type === 'view' ? 1 : 0) 
    };
  }
};
