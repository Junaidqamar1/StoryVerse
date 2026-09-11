const config = require('../config');

const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

/**
 * Text generation only. Low-level POST to Gemini's generateContent
 * endpoint, with retries and backoff on transient failures (429/503).
 * Ported as-is from Junaid's story service.
 */
async function callGemini(model, body, { retries = 3 } = {}) {
  if (!config.geminiApiKey) {
    throw new Error(
      'GEMINI_API_KEY is not set. Get a free key at https://aistudio.google.com/apikey and add it to .env'
    );
  }

  const url = `${BASE_URL}/${model}:generateContent?key=${config.geminiApiKey}`;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errText = await res.text();
        if ((res.status === 429 || res.status === 503) && attempt < retries) {
          const waitMs = 1500 * Math.pow(2, attempt); // 1.5s, 3s, 6s
          console.warn(`  Gemini ${res.status} on ${model}, retrying in ${waitMs}ms (attempt ${attempt + 1}/${retries})...`);
          await new Promise((r) => setTimeout(r, waitMs));
          continue;
        }
        throw new Error(`Gemini API error (${res.status}): ${errText}`);
      }

      return await res.json();
    } catch (err) {
      if (attempt === retries) throw err;
    }
  }
}

/**
 * Text generation. Pass a JSON schema to force structured output -
 * this is what lets us get the whole story back as clean JSON in one call.
 */
async function generateText({ prompt, responseSchema }) {
  const body = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.9,
      ...(responseSchema && {
        responseMimeType: 'application/json',
        responseSchema,
      }),
    },
  };

  const data = await callGemini(config.textModel, body);
  const textOut = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!textOut) {
    throw new Error('Gemini returned no text content: ' + JSON.stringify(data));
  }
  return textOut;
}

module.exports = { generateText };
