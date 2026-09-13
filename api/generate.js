export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle browser preflight request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const {
      company = "Postcoglu",
      docType = "SOP",
      prompt = ""
    } = req.body || {};

    // Get Gemini API key
    const apiKey =
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "Missing Gemini API key"
      });
    }

    // Gemini model
    const model = "gemini-2.5-flash";

    // Gemini API request
  const response = await fetch(
  `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`,  `,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Create a ${docType} for ${company}.

${prompt}`
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();

    // Handle Gemini errors
    if (!response.ok) {
      return res.status(response.status).json({
        error:
          data?.error?.message ||
          "Gemini API request failed"
      });
    }

    // Extract generated text
    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    return res.status(200).json({
      result: text,
      modelUsed: model
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: error.message || "Server error"
    });
  }
}
