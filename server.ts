import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import nodemailer from "nodemailer";
import PDFDocument from "pdfkit";

function cleanHungarianText(text: string): string {
  if (!text) return "";
  return text
    .replace(/ő/g, "ö")
    .replace(/Ő/g, "Ö")
    .replace(/ű/g, "ü")
    .replace(/Ű/g, "Ü");
}

function createPdfBuffer(name: string, email: string, phone: string, content: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: "A4" });
      const buffers: Buffer[] = [];
      doc.on("data", (chunk) => buffers.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", (err) => reject(err));

      // Brand Neon/Cyan top accent bar
      doc.rect(0, 0, 595.28, 15).fill("#08f7fe"); 
      
      doc.moveDown(2);
      doc.fillColor("#111111")
         .fontSize(22)
         .font("Helvetica-Bold")
         .text("CR HARDVER KLINIKA", { align: "center" });
      
      doc.moveDown(0.2);
      doc.fillColor("#08f7fe")
         .fontSize(9)
         .font("Helvetica-Bold")
         .text("ONLINE ARAJANLATKERESI MINTA / BIZONYLAT", { align: "center", characterSpacing: 1.5 });
      
      doc.moveDown(1.5);
      doc.strokeColor("#e2e8f0").lineWidth(1).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      
      doc.moveDown(1);
      doc.fillColor("#718096")
         .fontSize(8)
         .font("Helvetica")
         .text(`Generalva: ${new Date().toLocaleString("hu-HU")}`, { align: "right" });

      doc.moveDown(1);
      doc.fillColor("#1a202c")
         .fontSize(14)
         .font("Helvetica-Bold")
         .text("Ugyfel adatai", { underline: false });
      
      doc.moveDown(0.6);
      
      doc.fontSize(10);
      const cleanName = cleanHungarianText(name);
      const cleanEmail = cleanHungarianText(email);
      const cleanPhone = cleanHungarianText(phone || "Nincs megadva");
      const cleanContent = cleanHungarianText(content);

      doc.font("Helvetica-Bold").fillColor("#4a5568").text("Nev: ", { continued: true })
         .font("Helvetica").fillColor("#1a202c").text(cleanName);
      doc.moveDown(0.4);
      
      doc.font("Helvetica-Bold").fillColor("#4a5568").text("E-mail cim: ", { continued: true })
         .font("Helvetica").fillColor("#1a202c").text(cleanEmail);
      doc.moveDown(0.4);
      
      doc.font("Helvetica-Bold").fillColor("#4a5568").text("Telefonszam: ", { continued: true })
         .font("Helvetica").fillColor("#1a202c").text(cleanPhone);
      
      doc.moveDown(1.5);
      doc.strokeColor("#e2e8f0").lineWidth(1).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      
      doc.moveDown(1.5);
      doc.fillColor("#1a202c")
         .fontSize(14)
         .font("Helvetica-Bold")
         .text("A hiba leirasa / Uzenet", { underline: false });
      
      doc.moveDown(0.8);
      
      const boxY = doc.y;
      doc.fontSize(10)
         .font("Helvetica")
         .fillColor("#2d3748")
         .text(cleanContent, 60, boxY, {
           width: 475,
           align: "justify",
           lineGap: 4
         });
      
      const textHeight = doc.heightOfString(cleanContent, { width: 475, lineGap: 4 });
      doc.strokeColor("#08f7fe")
         .lineWidth(3)
         .moveTo(50, boxY - 2)
         .lineTo(50, boxY + textHeight + 2)
         .stroke();

      doc.text("", 50, 750);
      doc.strokeColor("#e2e8f0").lineWidth(1).moveTo(50, 740).lineTo(545, 740).stroke();
      doc.moveDown(0.6);
      doc.fontSize(7)
         .font("Helvetica-Oblique")
         .fillColor("#a0aec0")
         .text("Ez a dokumentum digitalis bizonylatkent szolgal az onkiszolgalo webes felületen leadott hibabejelenteshez. CR Hardver Klinika (cimpianrobert@crhardverklinika.com)", { align: "center" });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

async function sendLeadEmailWithPdf(name: string, email: string, phone: string, content: string, pdfBuffer: Buffer) {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = parseInt(process.env.SMTP_PORT || "465");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || "cimpianrobert@crhardverklinika.com";
  
  const recipient = "cimpianrobert@crhardverklinika.com";

  console.log(`[Email Service] Preparing email for ${name}...`);

  if (!user || !pass) {
    throw new Error("SMTP hitelesitesi adatok nincsenek beallitva (SMTP_USER, SMTP_PASS hianyzik az .env fajlbol). Email nem kuldheto meg.");
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  const cleanName = cleanHungarianText(name);

  const mailOptions = {
    from: `CR Hardver Klinika Weboldal <${from}>`,
    to: recipient,
    subject: `Uj Arajanlatkeres - ${cleanName}`,
    text: `Uj arajanlatkeres erkezett a weboldalrol.\n\n` +
          `Nev: ${name}\n` +
          `E-mail: ${email}\n` +
          `Telefonszam: ${phone || 'Nincs megadva'}\n\n` +
          `Leiras:\n${content}\n\n` +
          `Mellekelve talalja az arajanlatkeres 1/1 PDF bizonylatat.\n`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; color: #1a202c;">
        <div style="background-color: #0a0a0a; border-radius: 12px; padding: 25px; text-align: center; margin-bottom: 25px; border: 1px solid rgba(8, 247, 254, 0.2);">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 900; letter-spacing: 1px;">CR HARDVER KLINIKA</h1>
          <p style="color: #08f7fe; margin: 5px 0 0 0; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;">Uj Weboldal Megkereses</p>
        </div>
        
        <p style="font-size: 15px; line-height: 1.6; color: #4a5568;">
          Tisztelt Cimpian Robert! Új árajánlatkérési bizonylat került beküldésre az Ön CR Hardver Klinika weboldaláról. Az alábbi adatokat adták meg:
        </p>
        
        <div style="background-color: #f7fafc; border-radius: 12px; padding: 20px; margin: 20px 0; border: 1px solid #edf2f7;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #718096; width: 30%; font-size: 13px; text-transform: uppercase;">Nev:</td>
              <td style="padding: 8px 0; font-weight: bold; color: #1a202c; font-size: 14px;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #718096; font-size: 13px; text-transform: uppercase;">E-mail:</td>
              <td style="padding: 8px 0; color: #08f7fe; font-size: 14px; font-weight: bold;"><a href="mailto:${email}" style="color: #08f7fe; text-decoration: none;">${email}</a></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #718096; font-size: 13px; text-transform: uppercase;">Telefon:</td>
              <td style="padding: 8px 0; color: #1a202c; font-size: 14px;">${phone || "Nincs megadva"}</td>
            </tr>
          </table>
        </div>
        
        <h3 style="color: #1a202c; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #edf2f7; padding-bottom: 8px; margin-top: 30px;">Hiba leirasa / Uzenet tartama</h3>
        <div style="background-color: #fff; border-left: 4px solid #08f7fe; padding: 15px; margin: 15px 0; font-size: 14px; line-height: 1.6; color: #2d3748; white-space: pre-wrap; font-style: italic;">${content}</div>
        
        <div style="background-color: #ebf8ff; border: 1px solid #bee3f8; border-radius: 12px; padding: 15px; margin-top: 30px; display: flex; align-items: center; gap: 10px;">
          <div style="font-size: 20px;">📎</div>
          <div style="font-size: 12px; color: #2b6cb0; font-weight: 500;">
            Az üzenet mellékleteként csatoltuk a professzionális, nyomtatható <strong>1/1 PDF dokumentumot</strong> az ügyfél adataival és leírásával.
          </div>
        </div>
        
        <p style="color: #a0aec0; font-size: 11px; text-align: center; margin-top: 40px; border-top: 1px solid #edf2f7; padding-top: 20px;">
          Ezt a levelet a CR Hardver Klinika automata lead-kezelő rendszere küldte.
        </p>
      </div>
    `,
    attachments: [
      {
        filename: `CR_Ajanlatkeres_${cleanName.replace(/\s+/g, "_")}.pdf`,
        content: pdfBuffer,
        contentType: "application/pdf"
      }
    ]
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email Service] Delivered message: ${info.messageId}`);
    return info;
  } catch (error: any) {
    let errMsg = error.message || String(error);
    if (errMsg.includes("Application-specific password required") || errMsg.includes("534-5.7.9") || errMsg.includes("Invalid login")) {
      throw new Error(
        "A Gmail SMTP szerver megtagadta a belépést (Application-specific password required / Invalid login). " +
        "Ez azért történik, mert a Gmail fiókján be van kapcsolva a 2-lépcsős azonosítás (2FA), és a sima jelszavával próbál belépni alkalmazás-specifikus jelszó helyett. " +
        "MEGOLDAÁS: 1. Nyissa meg a Google Fiók beállításait (https://myaccount.google.com). " +
        "2. A felső keresősávba írja be: 'Alkalmazásjelszavak' (vagy App Passwords). " +
        "3. Hozzon létre egy új alkalmazásjelszót, adjon neki tetszőleges nevet (pl: 'CR Weboldal Email'). " +
        "4. Másolja ki a generált 16 betűs sárga jelszót (szóközök nélkül). " +
        "5. Illessze be ezt a 16 betűs kódot az SMTP_PASS környezeti változó értékeként a fejlesztői felület Settings menüjében!"
      );
    }
    throw error;
  }
}

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

  // Enforce CORS manually on all API routes to allow requests from custom domains (e.g. cr-hardver-klinika.com)
  app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, x-api-key, api-key");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });

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

    // 3.5. Generate PDF and send email to cimpianrobert@crhardverklinika.com
    let emailSent = false;
    let emailError = "";
    try {
      console.log("[Lead Handler] Dynamically generating 1/1 PDF and emailing to cimpianrobert@crhardverklinika.com...");
      const pdfBuffer = await createPdfBuffer(name, email, phone, message);
      await sendLeadEmailWithPdf(name, email, phone, message, pdfBuffer);
      emailSent = true;
      console.log("[Lead Handler] PDF and Email sent successfully!");
    } catch (mailErr: any) {
      emailError = mailErr.message || String(mailErr);
      console.error("[Lead Handler] Email/PDF generation or sending aborted:", mailErr);
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
      nev: name,
      Name: name,
      Nev: name,
      Név: name,
      
      email,
      Email: email,
      
      phone,
      telefon: phone,
      Phone: phone,
      
      message,
      uzenet: message,
      content: message,
      Message: message,
      Uzenet: message,
      Üzenet: message,
      
      secretKey: apiKey, // PASS secretKey INSIDE the body as expected!
      apiKey: apiKey,
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
          emailSent,
          emailError,
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
          emailSent,
          emailError,
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
        emailSent,
        emailError,
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
