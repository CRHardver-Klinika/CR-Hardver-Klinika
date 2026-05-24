import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  query, 
  where, 
  getDocs, 
  orderBy,
  doc,
  getDoc
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
  const endpoint = '/api/external-lead';
  
  const payload = {
    name,
    email,
    content
  };

  // Set a 15-second timeout on the network request
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 15000);

  try {
    console.log(`Sending external lead proxy request to ${endpoint}...`);
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
      const serverError = isJson && responseData?.error ? responseData.error : `Szerver elérési válasz (${response.status})`;
      throw new Error(serverError);
    }

    console.log("External lead proxy sent successfully:", responseData);
    return true;
  } catch (error: any) {
    clearTimeout(id);
    if (error.name === 'AbortError') {
      throw new Error("A háttérszerver nem válaszolt időben (időtúllépés, 15mp).");
    }
    console.log("[Proxy Optional Sync Status] Note: External API sync not completed (swallowed safely):", error.message || error);
    throw new Error(error.message || 'Szerver elérési vagy hálózati hiba.');
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
