export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method!== 'POST') return res.status(405).json({ error: 'POST only' });

  const { company, docType, prompt } = req.body;

  try {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'API key not configured on server' });
    }

    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `Create a professional ${docType} document for ${company}. ${prompt || ''}` }] }]
      })
    });

    const data = await r.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return res.status(500).json({ error: 'Gemini Error: ' + JSON.stringify(data) });
    }

    res.status(200).json({ result: text });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
