import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method!== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Missing prompt" });
    if (!process.env.GEMINI_API_KEY) return res.status(500).json({ error: "Missing GEMINI_API_KEY" });

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });

    const result = await model.generateContent(
      `Postcoglu Ltd Kampala Uganda. Currency UGX only. Real new lines. Generate official document for: ${prompt}`
    );

    const text = result.response.text();
    return res.status(200).json({ text });

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
