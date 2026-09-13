export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin","*");
  res.setHeader("Access-Control-Allow-Methods","POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers","Content-Type");
  if(req.method==="OPTIONS") return res.status(200).end();
  try{
    const body=req.body||{};
    const apiKey=process.env.GEMINI_API_KEY||process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if(!apiKey) return res.status(500).json({error:"Missing API key in Vercel"});
    const model="gemini-3.6-flash";
    const prompt=`Create a detailed ${body.docType||'SOP'} for ${body.company||'Postcoglu'}. Task: ${body.prompt||'bus inspection'}. Use professional formatting.`;
    const r=await fetch("https://generativelanguage.googleapis.com/v1/models/"+model+":generateContent?key="+apiKey,{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({contents:[{parts:[{text:prompt}]}]})
    });
    const d=await r.json();
    if(!r.ok) return res.status(r.status).json({error:d.error?.message||"Gemini error",details:d});
    const text=d.candidates?.[0]?.content?.parts?.[0]?.text||"";
    return res.status(200).json({result:text,modelUsed:model});
  }catch(e){
    return res.status(500).json({error:e.message});
  }
}
