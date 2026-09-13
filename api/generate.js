export default async function handler(req,res){
res.setHeader("Access-Control-Allow-Origin","*");
res.setHeader("Access-Control-Allow-Methods","POST,OPTIONS");
res.setHeader("Access-Control-Allow-Headers","Content-Type");
if(req.method==="OPTIONS")return res.status(200).end();
try{
const b=req.body||{};
const k=process.env.GOOGLE_GENERATIVE_AI_API_KEY||process.env.GEMINI_API_KEY;
if(!k)return res.status(500).json({error:"Missing API key"});
const p=`Create ${b.docType||'SOP'} for Postcoglu: ${b.prompt||'bus inspection'}`;
const r=await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-3.6-flash:generateContent?key=${k}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{parts:[{text:p}]}]})});
const d=await r.json();
if(!r.ok)return res.status(500).json({error:d.error?.message});
return res.status(200).json({result:d.candidates[0].content.parts[0].text});
}catch(e){return res.status(500).json({error:e.message});}
}
