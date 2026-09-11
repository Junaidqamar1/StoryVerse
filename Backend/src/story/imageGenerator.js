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

/**
 * Illustrates a whole book using Cloudflare Workers AI (FLUX.1 schnell).
 * Ported as-is from Junaid's story service.
 *
 * @param {Array<{pageNumber:number, text:string, imagePrompt:string}>} pages
 * @param {string} characterDescription - from storyGenerator, repeated on every page
 * @param {string} bookTitle - unused (kept for signature compatibility)
 * @param {string} styleKey - one of STYLE_PRESETS keys, e.g. "comic_color", "comic_bw", "storybook"
 * @returns {Promise<Array<{pageNumber:number, text:string, image:any|null, imageError:string|null}>>}
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

  // Fallback to Pollinations AI image generation service
  const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(fullPrompt)}?width=512&height=512&nologo=true`;
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