const config = require('../config');

const XAI_BASE_URL = 'https://api.x.ai/v1/chat/completions';

/**
 * Story text generation using xAI Grok API (grok-2-latest)
 * with retries and structured JSON output.
 */
async function callGrok(prompt, { retries = 3 } = {}) {
  const apiKey = config.grokApiKey || config.geminiApiKey;
  if (!apiKey) {
    throw new Error('GROK_API_KEY / XAI_API_KEY is not set in .env. Get a key at https://console.x.ai');
  }

  const model = config.grokModel || 'grok-2-latest';
  const isXaiKey = apiKey.startsWith('xai-') || config.grokApiKey;

  if (isXaiKey) {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        console.log(`[Grok API] Generating story with model ${model} (attempt ${attempt + 1}/${retries + 1})...`);
        const response = await fetch(XAI_BASE_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: model,
            messages: [
              {
                role: 'system',
                content:
                  'You are a World-Class Master Storyteller and Award-Winning Author (Pixar, Studio Ghibli, NYT Bestseller caliber). Respond strictly with a valid JSON object containing title, characterDescription, and pages array.',
              },
              {
                role: 'user',
                content: prompt,
              },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.8,
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          if ((response.status === 429 || response.status >= 500) && attempt < retries) {
            const waitMs = 1500 * Math.pow(2, attempt);
            console.warn(`  Grok ${response.status}, retrying in ${waitMs}ms...`);
            await new Promise((r) => setTimeout(r, waitMs));
            continue;
          }
          throw new Error(`Grok API Error (${response.status}): ${errText}`);
        }

        const data = await response.json();
        const content = data?.choices?.[0]?.message?.content;
        if (content) {
          console.log('[Grok API] Story text successfully generated via Grok!');
          return content;
        }
      } catch (err) {
        if (attempt === retries) throw err;
      }
    }
  }

  // Fallback to Gemini if Gemini key is set
  const { generateText: callGemini } = require('./geminiClient');
  return await callGemini({ prompt });
}

module.exports = { callGrok };
