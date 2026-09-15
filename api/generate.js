import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Missing prompt" });

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "Missing GEMINI_API_KEY in Vercel" });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // This model name NEVER retires - auto updates
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const result = await model.generateContent(
      `You are Postcoglu Ltd, Kampala Uganda. Currency UGX only, never $. Use real new lines, no \\n text. Generate official document for: ${prompt}`
    );

    let text = result.response.text();
    text = text.replace(/\\n/g, "\n");

    return res.status(200).json({ text: text });

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
