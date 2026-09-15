import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST only" });
  }

  try {
    const { prompt } = req.body || {};
    if (!prompt || prompt.trim().length < 5) {
      return res.status(400).json({ error: "Prompt too short" });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "GEMINI_API_KEY missing in Vercel" });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // PRO model - July 2026 GA - your 5:49pm working model
    const model = genAI.getGenerativeModel({ 
      model: "gemini-3.6-flash",
      generationConfig: { temperature: 0.4, maxOutputTokens: 8000 }
    });

    const today = new Date().toLocaleDateString('en-UG', {
      day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Africa/Kampala'
    });

    const systemPrompt = `
You are Postcoglu Ltd, Kampala Uganda.
Plot 45 Kampala Road | TIN: 1002345678 | P.O Box 7788 | +256 700 000000
Rules:
- Currency: UGX ONLY. Never use $.
- Date: ${today} - Africa/Kampala.
- For invoices: Include EFRIS Fiscal Document No, Invoice Number, Bill To, UGX subtotal, VAT 18%, Total in UGX and in words.
- For bus docs: 51 seater focus, inspection checklist, driver, condition.
- Format: Real line breaks, no \\n text, professional Uganda business format.
- Footer: "System Generated Document - Valid with Stamp & Signature"

User request: ${prompt}
`;

    const result = await model.generateContent(systemPrompt);
    let text = result.response.text();
    
    // Clean formatting
    text = text.replace(/\\n/g, "\n");

    return res.status(200).json({ text });

  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
}
