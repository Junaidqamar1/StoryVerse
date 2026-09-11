require('dotenv').config();

module.exports = {
  // Core server
  port: process.env.PORT || 5000,
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
  databaseUrl: process.env.DATABASE_URL,
  frontendOrigin: process.env.FRONTEND_ORIGIN || '*',

  // Story text generation (Gemini). Not validated here at startup on
  // purpose - so the server still boots and auth works even before these
  // are set. The story-generation code itself throws a clear error if
  // these are missing at the moment /books/generate is actually called.
  geminiApiKey: process.env.GEMINI_API_KEY,
  textModel: process.env.TEXT_MODEL || 'gemini-3.6-flash',

  // Image generation (Cloudflare Workers AI - FLUX.1 schnell)
  cloudflareAccountId: process.env.CLOUDFLARE_ACCOUNT_ID,
  cloudflareApiToken: process.env.CLOUDFLARE_API_TOKEN,
  imageConcurrency: Number(process.env.IMAGE_CONCURRENCY || 3),
  defaultPageCount: Number(process.env.DEFAULT_PAGE_COUNT || 8),

  // Voice narration (ElevenLabs TTS)
  elevenlabsApiKey: process.env.ELEVENLABS_API_KEY,
  elevenlabsVoiceId: process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM', // Rachel
};
