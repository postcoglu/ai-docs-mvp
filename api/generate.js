import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { subject } = req.body;
  if (!subject) {
    return res.status(400).json({ error: "Missing subject" });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `You are Postcoglu Ltd official documentation expert in Kampala, Uganda.
Create a professional, formal, complete official document for: ${subject}

Requirements:
- English only, formal business language
- Include header: Postcoglu Ltd, Bus Charter, School Transport, Corporate Hire, Kampala
- Include date, reference number, sections, tables if needed
- Professional, bank/URA/UNEB ready, with stamp/signature lines at bottom
- Make it detailed and ready to print

Generate full document now:`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return res.status(200).json({ result: text });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
