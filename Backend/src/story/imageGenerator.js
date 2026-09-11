const { generateImageCloudflare } = require('./cloudflareClient');
const { mapWithConcurrency } = require('../utils/concurrency');
const config = require('../config');
const { resolveStyle } = require('./styles');

function buildImagePrompt({ styleFragment, characterDescription, pageImagePrompt }) {
  return [
    styleFragment,
    `Main character (keep this exact appearance consistent): ${characterDescription}.`,
    `Scene: ${pageImagePrompt}.`,
    'No text, no words, no letters, no logos, no watermarks anywhere in the image. Do not depict any real copyrighted characters, franchises, or brands.',
  ].join(' ');
}

function buildConcisePollinationsPrompt({ styleName, pageImagePrompt, characterDescription }) {
  const shortStyle = styleName || 'storybook illustration';
  const cleanScene = (pageImagePrompt || '').replace(/^Scene:\s*/i, '').trim();
  const shortScene = cleanScene.slice(0, 120);
  const shortChar = (characterDescription || '').slice(0, 80);
  
  return `${shortStyle}, ${shortScene}, ${shortChar}`.trim();
}

/**
 * Illustrates a whole book using Cloudflare Workers AI with Pollinations AI fallback.
 */
async function generateSinglePageImage(page, characterDescription, style) {
  const fullPrompt = buildImagePrompt({
    styleFragment: style.promptFragment,
    characterDescription,
    pageImagePrompt: page.imagePrompt,
  });

  try {
    const cloudflareResult = await generateImageCloudflare({ prompt: fullPrompt });
    if (cloudflareResult && cloudflareResult.base64) {
      return {
        ...page,
        image: `data:image/jpeg;base64,${cloudflareResult.base64}`,
        imageError: null,
      };
    }
  } catch (cfErr) {
    console.warn(`[imageGenerator] Cloudflare AI unavailable for page ${page.pageNumber} (${cfErr.message}). Using Pollinations AI fallback...`);
  }

  // Fallback to Pollinations AI image generation service with concise prompt
  const concisePrompt = buildConcisePollinationsPrompt({
    styleName: style.name || style.promptFragment?.slice(0, 40),
    pageImagePrompt: page.imagePrompt,
    characterDescription,
  });

  const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(concisePrompt)}?width=512&height=512&nologo=true`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    const imgRes = await fetch(pollinationsUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (imgRes.ok) {
      const arrayBuffer = await imgRes.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      if (buffer.length > 500) {
        const base64Data = `data:image/jpeg;base64,${buffer.toString('base64')}`;
        console.log(`[imageGenerator] Successfully fetched Pollinations base64 image for page ${page.pageNumber}`);
        return {
          ...page,
          image: base64Data,
          imageError: null,
        };
      }
    }
  } catch (pErr) {
    console.warn(`[imageGenerator] Direct Pollinations fetch skipped for page ${page.pageNumber} (${pErr.message}). Using direct URL fallback.`);
  }

  return {
    ...page,
    image: pollinationsUrl,
    imageError: null,
  };
}

/**
 * Illustrates a whole book using Cloudflare Workers AI with Pollinations AI fallback.
 */
async function illustrateBook(pages, characterDescription, bookTitle, styleKey) {
  const style = resolveStyle(styleKey);

  const results = await mapWithConcurrency(pages, config.imageConcurrency, (page) =>
    generateSinglePageImage(page, characterDescription, style)
  );

  return results;
}

module.exports = { illustrateBook };