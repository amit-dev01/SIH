const config = require('../config/index');
const logger = require('../utils/logger');

/**
 * Helper to extract a readable title or first sentence from source content
 */
const extractTitleFromContent = (sourceContent) => {
  if (!sourceContent) return 'Polar Science Breakthrough';

  const titleMatch = sourceContent.match(/Title:\s*([^\n]+)/i);
  if (titleMatch && titleMatch[1]) {
    return titleMatch[1].trim();
  }

  const lines = sourceContent.split('\n').map((l) => l.trim()).filter(Boolean);
  if (lines.length > 0) {
    return lines[0].replace(/^[#-*\s]+/, '').slice(0, 80);
  }

  return 'Polar Science Research';
};

/**
 * Mock generator that creates realistic, varied social posts based on platform and content
 */
const generateMockContent = async (platform, sourceContent) => {
  // Simulate AI latency
  await new Promise((resolve) => setTimeout(resolve, 500));

  const title = extractTitleFromContent(sourceContent);
  const isAntarctic = /antarct/i.test(sourceContent);
  const isArctic = /arctic/i.test(sourceContent);
  const isHimalaya = /himalay|siachen|glacier/i.test(sourceContent);

  const regionTag = isAntarctic
    ? '#IndiaInAntarctica #Antarctica'
    : isArctic
    ? '#IndiaInArctic #Himadri'
    : isHimalaya
    ? '#HimalayanGlaciers #Cryosphere'
    : '#PolarScience #OceanResearch';

  switch (platform) {
    case 'TWITTER': {
      const tweets = [
        `🇮🇳🧊 Did you know? ${title}! India's polar scientists are uncovering secrets that affect OUR climate and monsoon. Proud moment for Indian science! 🐧 ${regionTag} #NCPOR`,
        `❄️ Cutting-edge research from the icy frontiers! ${title}. How polar changes impact weather across India. 🇮🇳 #PolarScience #NCPOR #MoES ${regionTag}`,
        `🔬 Exciting update from NCPOR! ${title}. Indian researchers continue to lead global climate observations from pole to pole. 🌏 ${regionTag} #NCPOR`
      ];
      const selected = tweets[Math.floor(Math.random() * tweets.length)];
      return selected.length > 280 ? selected.slice(0, 277) + '...' : selected;
    }

    case 'FACEBOOK':
      return `🌍❄️ Ever wondered what Indian scientists are doing at the ends of the Earth?

${title} — and the findings are fascinating!

Our team at NCPOR (National Centre for Polar and Ocean Research, Ministry of Earth Sciences) is studying how polar ice dynamics affect weather patterns, sea levels, and agriculture right here in India. From the frozen landscapes of Antarctica to the high-altitude glaciers of the Himalayas, India's polar research is making global headlines.

Want to know more? Visit our Polar Science Outreach Portal to explore expedition reports, stunning photographs, and groundbreaking research datasets. 🇮🇳

#PolarScience #NCPOR #ClimateChange #MoES #IndiaAtThePoles ${regionTag}`;

    case 'INSTAGRAM':
      return `Imagine standing in -40°C, surrounded by endless white, knowing your research could help millions back home 🥶🏔️

${title}

India's brave polar scientists are out there right now, drilling ice cores, tracking glaciers, and studying oceans to understand how global climate shifts impact our monsoon system. 🇮🇳

Swipe through to see their incredible field journey and station life! 👉

.
.
#PolarScience #NCPOR #MoES #Antarctica #Arctic #Himalaya #ClimateChange #IndiaInAntarctica #Glaciology #WomenInSTEM #FieldWork`;

    case 'WEBSITE':
      return `## ${title}

India's commitment to polar research continues to reach new heights with this remarkable initiative by the National Centre for Polar and Ocean Research (NCPOR), Ministry of Earth Sciences.

The initiative brings together scientists and researchers from premier institutions across India to study some of the most remote and extreme environments on Earth. Their observations provide vital insights into global climate change, sea-level rise, and the complex teleconnections influencing the Indian monsoon.

Key highlights from this research include high-resolution data on ice sheet dynamics, atmospheric aerosol variations, and marine ecosystem responses. These findings directly contribute to global climate models while addressing critical national priorities in water and climate security.

All related expedition reports, high-resolution media, and scientific datasets are now accessible on this portal for researchers, students, and the curious public to explore.`;

    case 'LINKEDIN':
      return `🇮🇳 India's Polar Science Leadership: ${title}

I'm proud to share that the National Centre for Polar and Ocean Research (NCPOR), Ministry of Earth Sciences, continues to advance the frontiers of cryospheric and polar science with this significant initiative.

Key takeaways:
• Indian scientists are generating critical climate data from the world's most extreme environments.
• These observations directly impact our predictive understanding of the Indian monsoon and water security.
• India's sustained investment in polar research infrastructure (Bharati, Maitri, and Himadri stations) continues to deliver high-impact scientific returns.

This work exemplifies how Indian science addresses global environmental challenges while fulfilling national strategic priorities.

#PolarScience #NCPOR #MoES #ClimateResearch #IndiaInAntarctica #ScientificExcellence #Cryosphere`;

    default:
      return `📢 ${title}\n\nKey polar science insights from the National Centre for Polar and Ocean Research (NCPOR), Ministry of Earth Sciences, India. #PolarScience #NCPOR`;
  }
};

/**
 * Main function to generate outreach content via OpenAI, Ollama, or Mock
 */
const generateContent = async (systemPrompt, userPrompt, platform = 'TWITTER', sourceContent = '') => {
  const provider = (config.aiProvider || 'mock').toLowerCase();

  if (provider === 'openai') {
    if (!config.openaiKey || config.openaiKey.startsWith('sk-your')) {
      logger.warn('OpenAI API key missing or placeholder. Falling back to Mock provider.');
      return generateMockContent(platform, sourceContent);
    }

    try {
      const OpenAI = require('openai');
      const client = new OpenAI({ apiKey: config.openaiKey });

      const response = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1000
      });

      const content = response.choices?.[0]?.message?.content?.trim();
      if (!content) {
        throw new Error('Received empty response from OpenAI');
      }
      return content;
    } catch (error) {
      logger.error(`OpenAI error: ${error.message}`);
      logger.warn('Falling back to realistic Mock generation.');
      return generateMockContent(platform, sourceContent);
    }
  }

  if (provider === 'ollama') {
    try {
      const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
      const response = await fetch(`${ollamaUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama3.2',
          prompt: `${systemPrompt}\n\n${userPrompt}`,
          stream: false
        })
      });

      const data = await response.json();
      return data.response ? data.response.trim() : generateMockContent(platform, sourceContent);
    } catch (error) {
      logger.error(`Ollama error: ${error.message}`);
      logger.warn('Falling back to realistic Mock generation.');
      return generateMockContent(platform, sourceContent);
    }
  }

  // Default Mock Provider
  return generateMockContent(platform, sourceContent);
};

module.exports = {
  generateContent,
  generateMockContent
};
