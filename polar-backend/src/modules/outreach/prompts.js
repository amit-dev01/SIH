/**
 * LLM Prompt templates for Polar Science social media outreach
 */

const SYSTEM_PROMPT = `You are a science communicator for India's National Centre for Polar and Ocean Research (NCPOR), Ministry of Earth Sciences.
Your job is to make polar and ocean science exciting and accessible to the Indian public. Use simple language, interesting facts, and a sense of wonder. Always highlight India's contribution to polar research. Be accurate — do not invent facts or numbers that are not in the source content.`;

const getPrompt = (platform, sourceContent) => {
  let userPrompt = '';

  switch (platform) {
    case 'TWITTER':
      userPrompt = `Write a Twitter/X post (MAXIMUM 280 characters, this is critical) about the following polar science content. Include 2-3 relevant hashtags like #PolarScience #NCPOR #IndiaInAntarctica #Arctic. Use 1-2 emojis. Make it engaging with a hook. Do NOT exceed 280 characters.

Content:
${sourceContent}`;
      break;

    case 'FACEBOOK':
      userPrompt = `Write a Facebook post (100-200 words) about the following polar science content. Start with an engaging question or surprising fact. Include a call-to-action at the end encouraging people to learn more. Use 2-3 emojis naturally. Make it shareable.

Content:
${sourceContent}`;
      break;

    case 'INSTAGRAM':
      userPrompt = `Write an Instagram caption (100-150 words) about the following polar science content. Be visually descriptive — paint a picture with words. Use 3-5 emojis throughout. End with 5-8 relevant hashtags on a new line. Make it feel personal and adventurous.

Content:
${sourceContent}`;
      break;

    case 'WEBSITE':
      userPrompt = `Write a short website article summary (300-500 words) about the following polar science content. Use an engaging headline. Structure with 2-3 short paragraphs. Include key facts and figures from the source. Make it SEO-friendly with natural keyword usage. Tone: informative but accessible to non-scientists.

Content:
${sourceContent}`;
      break;

    case 'LINKEDIN':
      userPrompt = `Write a LinkedIn post (150-250 words) about the following polar science content. Professional but enthusiastic tone. Highlight India's scientific achievement and its global significance. Mention the research team or institution. Include 3-5 relevant hashtags at the end. Make it suitable for a scientific and policy audience.

Content:
${sourceContent}`;
      break;

    default:
      userPrompt = `Write an engaging science communication post for ${platform} about the following polar science content:

Content:
${sourceContent}`;
  }

  return {
    system: SYSTEM_PROMPT,
    user: userPrompt
  };
};

module.exports = {
  SYSTEM_PROMPT,
  getPrompt
};
