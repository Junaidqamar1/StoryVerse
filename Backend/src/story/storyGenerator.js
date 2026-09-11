const { generateText } = require('./geminiClient');

// Forces Gemini to return exactly this shape - no parsing guesswork.
const STORY_SCHEMA = {
  type: 'OBJECT',
  properties: {
    title: { type: 'STRING' },
    characterDescription: {
      type: 'STRING',
      description:
        "A short, specific, fixed description of the main character's appearance - hair, clothing, colors, distinguishing features. This exact description will be repeated on every page's image prompt so the character looks the same throughout the book. Be concrete (e.g. 'a girl with a short red buzzcut, a patched teal windbreaker, steel-toed boots, a brass compass necklace') not vague.",
    },
    pages: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          pageNumber: { type: 'INTEGER' },
          text: {
            type: 'STRING',
            description: '2-4 sentences of polished, publisher-quality prose for this page.',
          },
          imagePrompt: {
            type: 'STRING',
            description:
              "A concrete visual description of THIS page's scene only - setting, action, mood, camera angle. Do NOT restate character appearance here (that's handled separately) - focus on what's happening and where. No text/words in the image.",
          },
        },
        required: ['pageNumber', 'text', 'imagePrompt'],
      },
    },
  },
  required: ['title', 'characterDescription', 'pages'],
};

function buildPrompt(userIdea, pageCount) {
  return `You are a bestselling published author known for prose that reads nothing like AI writing - tight, specific, sensory, alive on the page.

A user gave you this idea/dream/prompt:
"${userIdea}"

Write a complete illustrated story based on it with exactly ${pageCount} pages.

CRAFT RULES (these matter more than plot):
- Open page 1 mid-action or mid-image, never with scene-setting throat-clearing ("Once upon a time," "In a world where," "It was a normal day until").
- Show, don't tell. Instead of naming an emotion ("she was terrified"), describe the physical/sensory detail that reveals it (her hands wouldn't stop shaking, the cold sweat on her collar).
- Vary sentence length hard - some pages should have one short, punchy sentence next to a longer flowing one. Uniform sentence rhythm is the #1 tell of AI-generated prose.
- Use concrete, specific nouns and verbs, not vague/abstract ones. "The gravity-locked boots" beats "special equipment." "He bolted" beats "he moved quickly."
- End every page on a hook, image, or unresolved beat that pulls the reader to the next page - never a neat little summary or a moral.
- Build one real narrative arc across all ${pageCount} pages: a clear want/problem established early, rising complications, a genuine turn or cost near the climax, and an ending that earns its resolution rather than just stopping.

BANNED - do not use these words/phrases or anything structurally identical to them:
"little did they know", "in that moment", "suddenly", "once upon a time", "and so", "with a mixture of X and Y", "it was clear that", "as if", opening a sentence with "-ing" verbs (e.g. "Walking through the door, she..."), any line that explicitly states the story's theme or moral out loud.

CHARACTER CONSISTENCY:
Invent ONE clear, specific, visually distinctive main character and describe their fixed appearance concretely in "characterDescription" (hair, clothing, colors, notable features). This description gets repeated verbatim on every page's illustration, so make it detailed enough to be visually unmistakable but not paragraph-length.

FORMAT per page:
- "text": 2-4 sentences of the actual prose, following all craft rules above.
- "imagePrompt": what's happening in THIS page's scene - setting, action, camera angle, mood. Do not re-describe the character's appearance here, only what they're doing and where. No text/words/letters/logos in the image itself. Never reference real copyrighted characters, franchises, or brands.

Return only the structured story data.`;
}

/**
 * Fallback story generator for when Gemini API hits quota limits (429) or is unavailable.
 * Guarantees that story creation NEVER fails for the user.
 */
function generateCreativeFallbackStory(userIdea, pageCount = 4) {
  const cleanIdea = userIdea.trim().replace(/[^\w\s]/gi, '');
  const words = cleanIdea.split(/\s+/).filter(Boolean);
  const titleCore = words.slice(0, 5).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  const title = titleCore ? `The Tale of ${titleCore}` : 'The Journey Beyond the Stars';

  const characterDescription = 'A spirited adventurer with messy hazel hair, wearing a teal windbreaker jacket, a silver star compass necklace, and sturdy leather boots';

  const pages = [];
  const total = Math.max(3, Math.min(12, pageCount));

  for (let i = 1; i <= total; i++) {
    let text = '';
    let imagePrompt = '';

    if (i === 1) {
      text = `The adventure opened mid-stride into a world shaped by visions of ${userIdea}. Cool wind brushed against the horizon, carrying static and distant music. Every step forward marked the end of fear and the start of something extraordinary.`;
      imagePrompt = `Opening scene of an epic journey inspired by ${userIdea}, standing at a breathtaking cliff overlook, cinematic wide angle, dramatic atmospheric sky.`;
    } else if (i === total) {
      text = `Golden sunlight bathed the landscape as final victory took hold. The challenge of ${userIdea} was met with quiet brilliance, transforming the path ahead into a bright, endless meadow. The journey was complete.`;
      imagePrompt = `Triumphant resolution scene, golden hour sunlight, peaceful majestic landscape, sense of quiet wonder and accomplishment.`;
    } else if (i === Math.floor(total / 2)) {
      text = `Shadows stretched across the ancient stone archway as a sudden turn shifted everything. Standing at the central pulse of ${userIdea}, a single decisive choice had to be made. There was no returning to the way things were.`;
      imagePrompt = `Dramatic turning point scene, ancient architectural ruins, mysterious glowing light sources, high contrast cinematic lighting.`;
    } else {
      text = `Pressing deeper into the heart of ${userIdea}, hidden details began to glow under the twilight. Each passing moment unveiled another layer of the secret, building toward an unstoppable climax.`;
      imagePrompt = `Exploring a mysterious vibrant setting, ethereal ambient glow, intricate environmental details, sense of curiosity and excitement.`;
    }

    pages.push({
      pageNumber: i,
      text,
      imagePrompt,
    });
  }

  return {
    title,
    characterDescription,
    pages,
  };
}

/**
 * Generates the full story (all pages) via Gemini call with seamless fallback.
 * Returns { title, characterDescription, pages: [{pageNumber, text, imagePrompt}] }
 */
async function generateStory(userIdea, pageCount) {
  try {
    const prompt = buildPrompt(userIdea, pageCount);
    const raw = await generateText({ prompt, responseSchema: STORY_SCHEMA });
    const story = JSON.parse(raw);

    if (Array.isArray(story.pages) && story.pages.length > 0) {
      console.log(`[storyGenerator] Gemini generated story: "${story.title}" (${story.pages.length} pages)`);
      return story;
    }
  } catch (err) {
    console.warn(`[storyGenerator] Gemini API unavailable (${err.message}). Using Creative Story Engine fallback.`);
  }

  return generateCreativeFallbackStory(userIdea, pageCount);
}

module.exports = { generateStory };
