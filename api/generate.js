export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS, GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method === 'GET') return res.status(200).json({status: 'API alive'});
  try {
    const { company='Postcoglu', docType='SOP', prompt='' } = req.body || {};
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({error: 'Missing API key'});
    const model = 'gemini-3.6-flash';
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({contents:[{parts:[{text:`Create ${docType} for ${company}: ${prompt}`}]}]})
    });
    const data = await r.json();
    if (data.error) return res.status(500).json({error: data.error.message});
    return res.status(200).json({result: data?.candidates?.[0]?.content?.parts?.[0]?.text, modelUsed: model});
  } catch(e){ return res.status(500).json({error: e.message}); }
}
