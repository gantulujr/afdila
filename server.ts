import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import axios from "axios";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for forwarding WhatsApp messages (prevents CORS and secures credentials)
  app.post("/api/whatsapp/send", async (req, res) => {
    const { phone, message, token, phoneNumberId } = req.body;

    if (!phone || !message) {
      return res.status(400).json({ error: "Phone and message format are required." });
    }

    const cleanPhone = phone.replace(/[^0-9]/g, "");
    const apiToken = token || process.env.GEMINI_API_KEY; // Fallback or user input
    const phoneId = phoneNumberId || "your-phone-id";

    // Standardized log to output in terminal
    console.log(`[WA Proxy] Routing message to ${cleanPhone}. Token Override: ${apiToken ? "Yes" : "No"}`);

    if (!token && (!process.env.WHATSAPP_TOKEN || process.env.WHATSAPP_TOKEN === "MY_WHATSAPP_TOKEN")) {
      // Mocking successful response if credentials haven't been provided, with diagnostic logs
      return res.json({
        simulated: true,
        status: "success",
        message: "BALASAN SIMULASI: Pesan CRM terkirim lokal lewat Mock Engine backend.",
        recipient: cleanPhone,
        body: message,
        timestamp: new Date().toISOString()
      });
    }

    const actualToken = token || process.env.WHATSAPP_TOKEN;
    const actualPhoneId = phoneNumberId || process.env.PHONE_NUMBER_ID;

    try {
      const endpoint = `https://graph.facebook.com/v19.0/${actualPhoneId}/messages`;
      const response = await axios.post(
        endpoint,
        {
          messaging_product: "whatsapp",
          to: cleanPhone,
          type: "text",
          text: { body: message }
        },
        {
          headers: {
            Authorization: `Bearer ${actualToken}`,
            "Content-Type": "application/json"
          }
        }
      );
      return res.json({ success: true, apiResponse: response.data });
    } catch (error: any) {
      console.error("[WA API Error] Failed Meta Request:", error?.response?.data || error.message);
      return res.status(error?.response?.status || 500).json({
        success: false,
        error: error?.response?.data || error.message
      });
    }
  });

  // Serve static assets or index.html in production / development via Vite middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
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
    console.log(`WhatsApp Mobile CRM backend active on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Critical server failure:", err);
});
