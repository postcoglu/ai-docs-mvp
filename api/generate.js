import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({error:"Method not allowed"});
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({error:"Missing prompt"});
    if (!process.env.GEMINI_API_KEY) return res.status(500).json({error:"Missing GEMINI_API_KEY"});

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const systemPrompt = `You are Postcoglu Ltd official document generator for Uganda.
MANDATORY RULES:
- Currency is ONLY UGX Uganda Shillings, NEVER $ dollars
- Format is for Uganda: URA, Kampala, English ONLY
- Use REAL line breaks, NEVER show \\n text
- Document must be professional, official, with header: Postcoglu Ltd, Kampala, Uganda
- Include: Date, Reference, Stamp & Signature lines
- For checklist, use table with [ ] tick boxes
- NO USA tax, NO Sales Tax, NO VAT %
- NO questions at end, just final document

User request: ${prompt}

Generate the final document now:`;

    const result = await model.generateContent(systemPrompt);
    let text = result.response.text();
    // Clean any escaped \n
    text = text.replace(/\\n/g, "\n");

    return res.status(200).json({ text });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
