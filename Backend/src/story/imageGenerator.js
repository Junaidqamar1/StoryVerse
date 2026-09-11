const { generateImageCloudflare } = require('./cloudflareClient');
const { mapWithConcurrency } = require('../utils/concurrency');
const config = require('../config');
const { resolveStyle } = require('./styles');

function buildImagePrompt({ styleFragment, characterDescription, pageImagePrompt }) {
  return [
    styleFragment,
    `Main character: ${characterDescription}.`,
    `Scene: ${pageImagePrompt}.`,
    'No text, no words, no letters, no logos, no watermarks anywhere in the image. Do not depict any real copyrighted characters, franchises, or brands.',
  ].join(' ');
}

function buildConcisePollinationsPrompt({ styleName, pageImagePrompt, characterDescription }) {
  const shortStyle = styleName || 'storybook illustration';
  const cleanScene = (pageImagePrompt || '').replace(/^Scene:\s*/i, '').trim();
  const shortScene = cleanScene.slice(0, 100);
  const shortChar = (characterDescription || '').slice(0, 60);
  
  return `${shortStyle}, ${shortScene}, ${shortChar}`.trim();
}

/**
 * Creates a story-specific vector artwork fallback when AI image APIs are unavailable or rate-limited.
 */
function createStoryCraftSVG({ pageNumber, text, imagePrompt, styleKey, bookTitle }) {
  const isDark = styleKey === 'comic_bw' || styleKey === 'ink';
  const isComic = styleKey === 'comic_color' || styleKey === 'comic';
  
  const bg1 = isDark ? '#181E29' : (isComic ? '#FFF4E0' : '#FAF3E0');
  const bg2 = isDark ? '#0D1117' : (isComic ? '#FAD09C' : '#EAD7C3');
  const accent = isDark ? '#E2C044' : (isComic ? '#E05A47' : '#B85B35');
  const textColor = isDark ? '#F5F5F7' : '#2D231E';
  
  const cleanTitle = (bookTitle || 'Illustrated Storybook').replace(/[<>&'"]/g, '').slice(0, 40);
  const cleanText = (imagePrompt || text || 'Story illustration').replace(/[<>&'"]/g, '').slice(0, 70);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${bg1}"/>
        <stop offset="100%" stop-color="${bg2}"/>
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#bgGrad)"/>
    <rect x="24" y="24" width="552" height="552" rx="28" fill="none" stroke="${accent}" stroke-width="2" stroke-dasharray="6 6" opacity="0.5"/>
    <circle cx="300" cy="240" r="100" fill="${accent}" opacity="0.12"/>
    <circle cx="300" cy="240" r="60" fill="none" stroke="${accent}" stroke-width="2" opacity="0.3"/>
    <text x="300" y="225" text-anchor="middle" font-family="Georgia, serif" font-size="22" font-weight="bold" fill="${textColor}">${cleanTitle}</text>
    <text x="300" y="260" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="600" fill="${accent}" letter-spacing="2">CHAPTER ${pageNumber} • ILLUSTRATION</text>
    <text x="300" y="340" text-anchor="middle" font-family="Georgia, serif" font-size="13" fill="${textColor}" opacity="0.85">"${cleanText}..."</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

async function generateSinglePageImage(page, characterDescription, style, bookTitle) {
  const fullPrompt = buildImagePrompt({
    styleFragment: style.promptFragment,
    characterDescription,
    pageImagePrompt: page.imagePrompt,
  });

  // 1. Try Cloudflare Workers AI
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
    console.warn(`[imageGenerator] Cloudflare AI unavailable for page ${page.pageNumber}.`);
  }

  // 2. Try Pollinations AI with model=flux & validation
  const concisePrompt = buildConcisePollinationsPrompt({
    styleName: style.name || style.promptFragment?.slice(0, 40),
    pageImagePrompt: page.imagePrompt,
    characterDescription,
  });

  const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(concisePrompt)}?width=512&height=512&model=flux&nologo=true`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 18000);
    const imgRes = await fetch(pollinationsUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    const contentType = imgRes.headers.get('content-type') || '';
    if (imgRes.ok && contentType.includes('image')) {
      const arrayBuffer = await imgRes.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      if (buffer.length > 4000) {
        const base64Data = `data:image/jpeg;base64,${buffer.toString('base64')}`;
        console.log(`[imageGenerator] Successfully embedded Pollinations AI image for page ${page.pageNumber}`);
        return {
          ...page,
          image: base64Data,
          imageError: null,
        };
      }
    }
  } catch (pErr) {
    console.warn(`[imageGenerator] Pollinations fetch skipped for page ${page.pageNumber} (${pErr.message}). Using craft vector fallback.`);
  }

  // 3. Story-specific craft artwork SVG fallback
  const craftSvg = createStoryCraftSVG({
    pageNumber: page.pageNumber,
    text: page.text,
    imagePrompt: page.imagePrompt,
    styleKey: style.key || 'storybook',
    bookTitle,
  });

  return {
    ...page,
    image: craftSvg,
    imageError: null,
  };
}

/**
 * Illustrates a whole book using Cloudflare Workers AI with Pollinations AI & Craft Vector fallbacks.
 */
async function illustrateBook(pages, characterDescription, bookTitle, styleKey) {
  const style = resolveStyle(styleKey);

  const results = await mapWithConcurrency(pages, config.imageConcurrency, (page) =>
    generateSinglePageImage(page, characterDescription, style, bookTitle)
  );

  return results;
}

module.exports = { illustrateBook };