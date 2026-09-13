export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const { subject } = req.body || {};
    if (!subject) return res.status(400).json({ error: "Missing subject" });

    const key = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;
    if (!key) return res.status(500).json({ error: "Missing API KEY" });

    const prompt = `
You are a professional business document writer for POSTCOGLU LTD, a bus company in Kampala, Uganda.
Company: Postcoglu Ltd, Bus Charter, School Transport, Corporate Hire.
Write a FULL formal document in ENGLISH ONLY (never Japanese).

Subject from user: "${subject}"

Rules:
- If it's SOP: Use Purpose, Scope, Responsibility, Procedure step-by-step, KPIs, Approval Table.
- If it's Proposal/Business Plan: Use Executive Summary, Market Research, Budget Table (UGX), Timeline, Risks, Conclusion.
- If it's Checklist/Inspection: Use table with checkboxes, Pass/Fail.
- If it's Letter/Contract/MOU: Use formal letter format with dates, parties, terms.
- Always include Postcoglu Ltd branding context.
- Make it look official, professional, ready to print with stamp/signature lines.
- Length: Detailed, at least 500 words.
- Language: English only.

Generate now.
`;

    const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    const data = await resp.json();
    if (!resp.ok) return res.status(500).json({ error: data.error?.message || "Gemini error" });

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "No result";
    return res.status(200).json({ result: text });

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
