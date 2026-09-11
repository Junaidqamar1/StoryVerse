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
async function illustrateBook(pages, characterDescription, bookTitle, styleKey) {
  const style = resolveStyle(styleKey);

  const results = await mapWithConcurrency(pages, config.imageConcurrency, (page) =>
    generateImageCloudflare({
      prompt: buildImagePrompt({
        styleFragment: style.promptFragment,
        characterDescription,
        pageImagePrompt: page.imagePrompt,
      }),
    })
  );

  return pages.map((page, i) => {
    const result = results[i];

    // Check if a valid response came back from Cloudflare
    if (result && result.success !== false) {
      return { 
        ...page, 
        image: result, // 👈 Passes the raw Cloudflare response to your route handler
        imageError: null 
      };
    }

    // Capture errors cleanly if Cloudflare failed
    const errorMsg = result?.errors?.[0]?.message || 'Image generation failed';
    return { 
      ...page, 
      image: null, 
      imageError: errorMsg 
    };
  });
}

module.exports = { illustrateBook };