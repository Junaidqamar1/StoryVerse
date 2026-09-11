/**
 * Hardcoded art style presets, ported as-is from Junaid's story service.
 * We stopped letting the LLM invent a style description per book - it was
 * too inconsistent and too soft/generic ("warm watercolor" every time).
 * These fragments are written specifically to push FLUX.1 schnell toward
 * a bold, dynamic comic look instead.
 *
 * Never reference real copyrighted characters/franchises here or in any
 * generated prompt - keep it to style/technique descriptors only.
 */
const STYLE_PRESETS = {
  comic_color: {
    label: 'Color Comic',
    promptFragment:
      'professional comic book illustration, bold heavy black ink outlines, dynamic dramatic action pose, cinematic dramatic lighting with strong shadows, vibrant saturated colors, halftone dot shading, sharp high-contrast inking, detailed comic panel linework, energetic composition with motion lines',
  },
  comic_bw: {
    label: 'Black & White Ink',
    promptFragment:
      'black and white ink comic illustration, bold dramatic linework, heavy crosshatching and stippled halftone shading, high contrast noir lighting, dynamic action lines, detailed pen-and-ink technique, no color, graphic novel style',
  },
  storybook: {
    label: 'Storybook Watercolor',
    promptFragment:
      'warm watercolor and gouache children\'s storybook illustration, soft painterly texture, gentle whimsical linework, warm inviting color palette',
  },
};

const DEFAULT_STYLE = 'comic_color';

function resolveStyle(styleKey) {
  return STYLE_PRESETS[styleKey] || STYLE_PRESETS[DEFAULT_STYLE];
}

module.exports = { STYLE_PRESETS, DEFAULT_STYLE, resolveStyle };
