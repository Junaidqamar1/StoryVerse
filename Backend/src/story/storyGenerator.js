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

function buildPrompt(userIdea, pageCount, language = 'English') {
  return `You are a bestselling published author known for prose that reads nothing like AI writing - tight, specific, sensory, alive on the page.

A user gave you this idea/dream/prompt:
"${userIdea}"

Write a complete illustrated story based on it with exactly ${pageCount} pages.

LANGUAGE REQUIREMENT:
The story's "title" and each page's narrative "text" MUST be written fluently in ${language}.
The "characterDescription" and "imagePrompt" fields must be kept in English to ensure accurate AI image generation.

CRAFT RULES (these matter more than plot):
- Open page 1 mid-action or mid-image, never with scene-setting throat-clearing.
- Show, don't tell. Instead of naming an emotion, describe the physical/sensory detail that reveals it.
- Vary sentence length hard - some pages should have one short, punchy sentence next to a longer flowing one.
- Use concrete, specific nouns and verbs.
- End every page on a hook, image, or unresolved beat that pulls the reader to the next page.
- Build one real narrative arc across all ${pageCount} pages.

CHARACTER CONSISTENCY:
Invent ONE clear, specific, visually distinctive main character and describe their fixed appearance concretely in English in "characterDescription".

FORMAT per page:
- "text": 2-4 sentences of the actual prose in ${language}.
- "imagePrompt": what's happening in THIS page's scene in English.

Return only the structured story data.`;
}

/**
 * Fallback story generator for when Gemini API hits quota limits (429) or is unavailable.
 * Supports multilingual story generation.
 */
function generateCreativeFallbackStory(userIdea, pageCount = 4, language = 'English') {
  const cleanIdea = userIdea.trim().replace(/[^\w\s]/gi, '');
  const words = cleanIdea.split(/\s+/).filter(Boolean);
  const titleCore = words.slice(0, 5).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');

  const titleTemplates = {
    Spanish: `La Leyenda de ${titleCore || 'El Viajero del Espacio'}`,
    French: `L'Histoire de ${titleCore || 'Le Voyageur des Étoiles'}`,
    German: `Die Geschichte von ${titleCore || 'Der Traumwanderer'}`,
    Hindi: `${titleCore || 'सपनों की यात्रा'} की कहानी`,
    Japanese: `${titleCore || '星の旅人'}の物語`,
    Italian: `La Storia di ${titleCore || 'Il Viaggiatore del Tempo'}`,
    Portuguese: `A História de ${titleCore || 'O Viajante das Estrelas'}`,
    English: titleCore ? `The Tale of ${titleCore}` : 'The Journey Beyond the Stars',
  };

  const title = titleTemplates[language] || titleTemplates.English;
  const characterDescription = 'A spirited adventurer with messy hazel hair, wearing a teal windbreaker jacket, a silver star compass necklace, and sturdy leather boots';

  const pages = [];
  const total = Math.max(3, Math.min(12, pageCount));

  for (let i = 1; i <= total; i++) {
    let text = '';
    let imagePrompt = '';

    if (i === 1) {
      if (language === 'Spanish') {
        text = `La aventura comenzó a mitad de camino en un mundo moldeado por visiones de ${userIdea}. El viento fresco soplaba en el horizonte trayendo ecos lejanos. Cada paso marcaba el comienzo de algo extraordinario.`;
      } else if (language === 'French') {
        text = `L'aventure s'est ouverte au milieu d'un monde façonné par des visions de ${userIdea}. Le vent frais balayait l'horizon, portant des échos lointains. Chaque pas marquait le début de quelque chose d'extraordinaire.`;
      } else if (language === 'German') {
        text = `Das Abenteuer begann mitten in einer Welt, die von Visionen von ${userIdea} geprägt war. Kühler Wind strich über den Horizont und trug ferne Melodien. Jeder Schritt war der Anfang von etwas Aussergewöhnlichem.`;
      } else if (language === 'Hindi') {
        text = `${userIdea} की कल्पनाओं से बनी दुनिया में एक नया अध्याय शुरू हुआ। ठंडी हवाएं क्षितिज पर बह रही थीं और हर कदम एक अनोखी यात्रा की ओर ले जा रहा था।`;
      } else if (language === 'Japanese') {
        text = `${userIdea}のビジョンによって形作られた世界へと冒険が始まりました。冷たい風が地平線を吹き抜け、遠くの響きを運んできます。踏み出す一歩一歩が、特別な物語の始まりでした。`;
      } else {
        text = `The adventure opened mid-stride into a world shaped by visions of ${userIdea}. Cool wind brushed against the horizon, carrying static and distant music. Every step forward marked the end of fear and the start of something extraordinary.`;
      }
      imagePrompt = `Opening scene of an epic journey inspired by ${userIdea}, standing at a breathtaking cliff overlook, cinematic wide angle, dramatic atmospheric sky.`;
    } else if (i === total) {
      if (language === 'Spanish') {
        text = `La luz dorada del sol bañaba el paisaje mientras se lograba la victoria final. El desafío de ${userIdea} fue superado con brillantez, transformando el camino hacia el futuro. La jornada estaba completa.`;
      } else if (language === 'French') {
        text = `La lumière dorée du soleil baignait le paysage alors que la victoire finale prenait forme. Le défi de ${userIdea} a été relevé avec éclat, transformant le chemin à venir. Le voyage était accompli.`;
      } else if (language === 'German') {
        text = `Goldenes Sonnenlicht tauchte die Landschaft in Glanz, als der finale Sieg errungen wurde. Die Herausforderung von ${userIdea} war meisterhaft bestanden. Die Reise war vollendet.`;
      } else if (language === 'Hindi') {
        text = `सुनहरी धूप पूरे परिदृश्य में फैल गई और अंतिम विजय हासिल हुई। ${userIdea} की चुनौती को साहस के साथ पूरा किया गया और यात्रा सफल रही।`;
      } else if (language === 'Japanese') {
        text = `黄金色の朝日が風景を包み込み、ついに勝利が訪れました。${userIdea}の試練は見事に乗り越えられ、新しい道が開かれました。旅はついに完了しました。`;
      } else {
        text = `Golden sunlight bathed the landscape as final victory took hold. The challenge of ${userIdea} was met with quiet brilliance, transforming the path ahead into a bright, endless meadow. The journey was complete.`;
      }
      imagePrompt = `Triumphant resolution scene, golden hour sunlight, peaceful majestic landscape, sense of quiet wonder and accomplishment.`;
    } else if (i === Math.floor(total / 2)) {
      if (language === 'Spanish') {
        text = `Las sombras se alargaban mientras un giro inesperado lo cambió todo. Frente al pulso central de ${userIdea}, se debía tomar una decisión decisiva. Ya no había vuelta atrás.`;
      } else if (language === 'French') {
        text = `Les ombres s'étiraient alors qu'un tournant soudain a tout changé. Au cœur de ${userIdea}, un choix décisif devait être fait. Il n'y avait plus de retour en arrière.`;
      } else if (language === 'German') {
        text = `Schatten verängten den Weg, als eine plötzliche Wendung alles veränderte. Im Zentrum von ${userIdea} musste eine mutige Entscheidung getroffen werden. Es gab kein Zurück mehr.`;
      } else if (language === 'Hindi') {
        text = `अचानक आए एक मोड़ ने सब कुछ बदल दिया। ${userIdea} के केंद्र में खड़े होकर एक महत्वपूर्ण निर्णय लेना था, अब पीछे हटने का कोई रास्ता नहीं था।`;
      } else if (language === 'Japanese') {
        text = `影が伸び、突然の展開がすべてを変えました。${userIdea}の中心に立ち、重大な決断を下さなければなりませんでした。もう後戻りはできません。`;
      } else {
        text = `Shadows stretched across the ancient stone archway as a sudden turn shifted everything. Standing at the central pulse of ${userIdea}, a single decisive choice had to be made. There was no returning to the way things were.`;
      }
      imagePrompt = `Dramatic turning point scene, ancient architectural ruins, mysterious glowing light sources, high contrast cinematic lighting.`;
    } else {
      if (language === 'Spanish') {
        text = `Avanzando más en el corazón de ${userIdea}, los detalles ocultos comenzaron a brillar bajo el crepúsculo. Cada momento revelaba una nueva capa del secreto.`;
      } else if (language === 'French') {
        text = `En s'enfonçant au cœur de ${userIdea}, des détails cachés ont commencé à briller sous le crépuscule. Chaque instant révélait une nouvelle facette du secret.`;
      } else if (language === 'German') {
        text = `Tiefer im Herzen von ${userIdea} begannen verborgene Geheimnisse zu leuchten. Jeder Augenblick enthüllte eine neue Ebene des Rätsels.`;
      } else if (language === 'Hindi') {
        text = `${userIdea} के रहस्यों में गहराई से उतरते ही नए संकेत सामने आने लगे और रोमांच बढ़ता गया।`;
      } else if (language === 'Japanese') {
        text = `${userIdea}の核心へと深く進むにつれ、隠された秘密が明かりの下で輝き始めました。刻一刻と謎が解き明かされていきます。`;
      } else {
        text = `Pressing deeper into the heart of ${userIdea}, hidden details began to glow under the twilight. Each passing moment unveiled another layer of the secret, building toward an unstoppable climax.`;
      }
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
async function generateStory(userIdea, pageCount, language = 'English') {
  try {
    const prompt = buildPrompt(userIdea, pageCount, language);
    const raw = await generateText({ prompt, responseSchema: STORY_SCHEMA });
    const story = JSON.parse(raw);

    if (Array.isArray(story.pages) && story.pages.length > 0) {
      console.log(`[storyGenerator] Gemini generated story in ${language}: "${story.title}" (${story.pages.length} pages)`);
      return story;
    }
  } catch (err) {
    console.warn(`[storyGenerator] Gemini API unavailable (${err.message}). Using Creative Story Engine fallback for ${language}.`);
  }

  return generateCreativeFallbackStory(userIdea, pageCount, language);
}

module.exports = { generateStory, generateCreativeFallbackStory };
