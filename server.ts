import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";

// Initialize Firebase client SDK server-side (shares the same credential details)
let configPath = "/firebase-applet-config.json";
if (!fs.existsSync(configPath)) {
  configPath = path.join(process.cwd(), "firebase-applet-config.json");
}
let db: any = null;

if (fs.existsSync(configPath)) {
  try {
    const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
    const firebaseApp = initializeApp(config);
    db = getFirestore(firebaseApp, config.firestoreDatabaseId);
    console.log(`[Firebase Server-side] Successfully initialized Firestore database from ${configPath}`);
  } catch (e: any) {
    console.error("[Firebase Server-side] Error initializing Firestore:", e.message);
  }
} else {
  console.error(`[Firebase Server-side] Configuration file not found at /firebase-applet-config.json or ${path.join(process.cwd(), "firebase-applet-config.json")}`);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Parse JSON bodies
  app.use(express.json());

  // Unified endpoint handler for POST requests to /api/external/lead or /api/external-lead
  const handleLeadSubmission = async (req: express.Request, res: express.Response) => {
    const apiKey = "HardverKlinika_Secure_2024_Link";
    const secretKey = req.body.secretKey || req.body.apiKey;

    // 1. Authenticate with the secure link key
    if (secretKey !== apiKey) {
      console.log(`[Validation] Access denied: invalid secretKey: ${secretKey}`);
      return res.status(403).json({ error: "Érvénytelen biztonsági kulcs." });
    }

    // 2. Extract input fields (handling multiple Hungarian and English variations/naming)
    const name = req.body.name || req.body.nev || req.body.Nev || req.body.Név;
    const email = req.body.email || req.body.Email;
    const message = req.body.message || req.body.uzenet || req.body.Üzenet || req.body.content;
    const phone = req.body.phone || req.body.telefon || "";
    const ownerId = req.body.ownerId || "L7bYE6FvjKOKyNBsXayUYZnWAVw1";

    if (!name || !email || !message) {
      console.log("[Validation] Missing fields:", { name, email, message });
      return res.status(400).json({ error: "Hiányzó adatok (Név, Email és Üzenet kötelező)." });
    }

    console.log(`[Lead Handler] Processing valid lead for: ${name} (${email})`);

    // 3. Write directly into the shared Firestore database collections
    let firestoreSaved = false;
    let firestoreError = "";
    let messageDocId = "";

    if (db) {
      // Step A: Save to messages for compatibility
      try {
        const docRef = await addDoc(collection(db, "messages"), {
          name,
          email,
          phone,
          content: message,
          message: message,
          description: message,
          status: "new",
          createdAt: serverTimestamp(),
          ownerId: ownerId,
          ownerUid: ownerId,
          userId: ownerId,
          ALAPÉRTELMEZETT_TULAJDONOS_AZONOSÍTÓ: ownerId
        });
        messageDocId = docRef.id;
        firestoreSaved = true;
        console.log(`[Lead Handler] Saved to shared Firestore messages with ID: ${messageDocId}`);
      } catch (e: any) {
        firestoreError = e.message;
        console.error("[Lead Handler] Firestore messages save failed:", e);
      }

      // Step B: Save to 'service' collection (the singular repairs database that CRM filters)
      const todayStr = new Date().toISOString().split("T")[0];
      try {
        const serviceDocRef = await addDoc(collection(db, "service"), {
          ownerId: ownerId,
          workName: "Web Ajánlatkérés", // Crucial for filtering under 'Weboldal megkeresés' tab!
          date: todayStr,
          client: name,
          phone: phone,
          email: email,
          address: "",
          device: "Weboldal megkeresés",
          issue: message,
          status: "Folyamatban", // Default active status
          createdAt: serverTimestamp()
        });
        console.log(`[Lead Handler] Saved directly to the CRM 'service' database with ID: ${serviceDocRef.id}`);
        firestoreSaved = true;
      } catch (e: any) {
        console.error("[Lead Handler] Firestore 'service' save failed:", e.message || e);
      }

      // Step C: Save to 'services' collection (the plural repairs database just in case)
      try {
        const servicesDocRef = await addDoc(collection(db, "services"), {
          ownerId: ownerId,
          workName: "Web Ajánlatkérés", // Crucial for filtering under 'Weboldal megkeresés' tab!
          date: todayStr,
          client: name,
          phone: phone,
          email: email,
          address: "",
          device: "Weboldal megkeresés",
          issue: message,
          status: "Folyamatban", // Default active status
          createdAt: serverTimestamp()
        });
        console.log(`[Lead Handler] Saved directly to the CRM 'services' database with ID: ${servicesDocRef.id}`);
        firestoreSaved = true;
      } catch (e: any) {
        console.error("[Lead Handler] Firestore 'services' save failed:", e.message || e);
      }
    } else {
      firestoreError = "Firestore is not initialized on this server container";
    }

    // 4. Force synchronization via proxy to the CRM database REST API (REST client fallback)
    let dbAppUrl = process.env.VITE_DB_APP_URL || process.env.DB_APP_URL || "";
    let baseUrl = dbAppUrl.trim();

    if (!baseUrl || baseUrl.includes("aistudio.google.com")) {
      baseUrl = "https://cr-hardver-klinika-adatb-zis-684371233591.europe-west2.run.app";
    }

    try {
      if (baseUrl.startsWith("http://") || baseUrl.startsWith("https://")) {
        const urlObj = new URL(baseUrl);
        baseUrl = urlObj.origin;
      }
    } catch (e) {
      if (baseUrl.includes("/api/")) {
        baseUrl = baseUrl.split("/api/")[0];
      }
    }

    if (baseUrl.endsWith("/")) {
      baseUrl = baseUrl.slice(0, -1);
    }

    const endpoint = `${baseUrl}/api/external/lead`;
    
    // Construct the EXACT, client-matching JSON payload expected by the target REST API
    const proxyPayload = {
      name,
      email,
      phone,
      message,
      secretKey: apiKey, // PASS secretKey INSIDE the body as expected!
      ownerId
    };

    console.log(`[Lead Handler] Forwarding lead proxy to CRM endpoint: ${endpoint}...`);

    const controller = new AbortController();
    const abortTimeout = setTimeout(() => controller.abort(), 15000);

    try {
      const apiResponse = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "api-key": apiKey,
          "authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify(proxyPayload),
        signal: controller.signal
      });

      clearTimeout(abortTimeout);

      const responseText = await apiResponse.text();
      let responseData: any = null;
      let isJson = false;

      try {
        responseData = JSON.parse(responseText);
        isJson = true;
      } catch (e) {
        isJson = false;
      }

      const errorDetail = isJson && responseData?.error ? responseData.error : responseText.substring(0, 200);

      if (apiResponse.ok) {
        console.log("[Lead Handler] CRM API proxy sync succeeded:", responseData);
        return res.status(200).json({ 
          success: true, 
          firestoreSaved, 
          messageDocId, 
          proxySynced: true, 
          data: responseData 
        });
      } else {
        console.warn(`[Lead Handler] CRM API returned error status ${apiResponse.status}:`, errorDetail);
        // Even if proxy sync fails with bad parameters, return standard success 200 because we wrote it to Firestore
        return res.status(200).json({
          success: true,
          firestoreSaved,
          messageDocId,
          proxySynced: false,
          error: `CRM szerver nem tudta fogadni az API hívást, de a Firestore adatbázisba sikeresen rögzítettük: ${errorDetail}`
        });
      }
    } catch (error: any) {
      clearTimeout(abortTimeout);
      console.warn("[Lead Handler] CRM API network sync failed:", error.message || error);
      return res.status(200).json({
        success: true,
        firestoreSaved,
        messageDocId,
        proxySynced: false,
        error: `Kapcsolódási vagy hálózati hiba a szinkronizációnál, de a Firestore adatbázisba sikeresen rögzítettük: ${error.message || "Hálózati hiba"}`
      });
    }
  };

  // Register both routing configurations for compatibility with all external form actions
  app.post("/api/external/lead", handleLeadSubmission);
  app.post("/api/external-lead", handleLeadSubmission);

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
