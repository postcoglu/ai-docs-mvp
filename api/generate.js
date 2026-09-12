export default async function handler(req, res) {
  if (req.method!== 'POST') return res.status(405).json({ error: 'POST only' });
  const { company, docType, prompt } = req.body;
  if (!process.env.OPENAI_API_KEY) return res.status(500).json({ error: 'Add OPENAI_API_KEY in Vercel Settings' });

  try {
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + process.env.OPENAI_API_KEY },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: `You are Postcoglu. Create professional ${docType} for ${company}. Structure: Title, Purpose, Scope, Responsibilities, Detailed Procedure (numbered steps), Safety/Compliance, Revision. Use Markdown.` },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1500
      })
    });
    const data = await r.json();
    if (data.error) return res.status(500).json({ error: data.error.message });
    res.status(200).json({ result: data.choices[0].message.content });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
