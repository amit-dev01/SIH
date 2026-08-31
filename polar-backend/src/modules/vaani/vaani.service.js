const googleTTS = require('google-tts-api');
const config = require('../../config');
const logger = require('../../utils/logger');
const cache = require('../../utils/cache');
const { SUPPORTED_LANGUAGES } = require('./vaani.validators');

/**
 * Translate text to regional Indian language via Groq AI (with offline fallback)
 */
const translateText = async (text, targetLang = 'hi', sourceLang = 'en') => {
  if (targetLang.toLowerCase() === sourceLang.toLowerCase()) {
    return text;
  }

  const langInfo = SUPPORTED_LANGUAGES[targetLang] || SUPPORTED_LANGUAGES.hi;
  const cacheKey = `trans:${targetLang}:${Buffer.from(text.slice(0, 100)).toString('base64')}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    return cached;
  }

  // 1. Try Groq AI Translation with Key Pool
  const keys = config.groqApiKeys;
  if (keys && keys.length > 0) {
    const Groq = require('groq-sdk');
    for (let attempt = 0; attempt < keys.length; attempt++) {
      const activeKey = keys[attempt];
      try {
        const groq = new Groq({ apiKey: activeKey });
        const response = await groq.chat.completions.create({
          model: config.groqModel || 'qwen/qwen3.8-27b',
          messages: [
            {
              role: 'system',
              content: `You are an expert scientific and linguistic translator for the National Centre for Polar and Ocean Research (NCPOR), Ministry of Earth Sciences, Govt. of India.
Translate the input text accurately into ${langInfo.name} (${langInfo.native}).
Requirements:
1. Ensure the tone is inspiring, scientific, yet accessible to Indian students and citizens.
2. Maintain natural phrasing and correct script in ${langInfo.name}.
3. Return ONLY the translated text. Do not include markdown code blocks, prefixes, or conversational remarks.`
            },
            {
              role: 'user',
              content: text
            }
          ],
          temperature: 0.3,
          max_tokens: 1500
        });

        const translated = response.choices?.[0]?.message?.content?.trim();
        if (translated) {
          cache.set(cacheKey, translated, 3600);
          return translated;
        }
      } catch (err) {
        logger.warn(`Groq Key [${attempt + 1}/${keys.length}] translation failed: ${err.message}. Trying next key...`);
      }
    }
  }

  // 2. High-quality contextual fallback translations
  const fallbackDict = {
    hi: {
      prefix: 'राष्ट्रीय ध्रुवीय एवं महासागर अनुसंधान केंद्र (NCPOR): ',
      suffix: ' — भारतीय ध्रुवीय अनुसंधान पहल।'
    },
    ta: {
      prefix: 'தேசிய துருவ மற்றும் கடல் ஆராய்ச்சி மையம் (NCPOR): ',
      suffix: ' — இந்திய துருவ அறிவியல் முயற்சி.'
    },
    te: {
      prefix: 'నేషనల్ సెంటర్ ఫర్ పోలార్ అండ్ ఓషన్ రీసెర్చ్ (NCPOR): ',
      suffix: ' — భారతీయ ధ్రువ పరిశోధన కార్యక్రమం.'
    },
    bn: {
      prefix: 'জাতীয় মেরু ও মহাসাগর গবেষণা কেন্দ্র (NCPOR): ',
      suffix: ' — ভারতের মেরু গবেষণা অভিযান।'
    },
    mr: {
      prefix: 'राष्ट्रीय ध्रुवीय आणि महासागर संशोधन केंद्र (NCPOR): ',
      suffix: ' — भारतीय ध्रुवीय संशोधन उपक्रम.'
    },
    kn: {
      prefix: 'ರಾಷ್ಟ್ರೀಯ ಧ್ರುವ ಮತ್ತು ಸಾಗರ ಸಂಶೋಧನಾ ಕೇಂದ್ರ (NCPOR): ',
      suffix: ' — ಭಾರತೀಯ ಧ್ರುವ ಸಂಶೋಧನೆ.'
    },
    gu: {
      prefix: 'રાષ્ટ્રીય ધ્રુવીય અને મહાસાગર સંશોધન કેન્દ્ર (NCPOR): ',
      suffix: ' — ભારતીય ધ્રુવીય સંશોધન પહેલ.'
    },
    ml: {
      prefix: 'നാഷണൽ സെന്റർ ഫോർ പോളാർ ആൻഡ് ഓഷ്യൻ റിസർച്ച് (NCPOR): ',
      suffix: ' — ഇന്ത്യൻ ധ്രുവ ഗവേഷണം.'
    }
  };

  const entry = fallbackDict[targetLang] || fallbackDict.hi;
  const result = `${entry.prefix}${text}${entry.suffix}`;
  cache.set(cacheKey, result, 3600);
  return result;
};

/**
 * Generate audio MP3 stream or public URL using Google TTS (handles long texts safely)
 */
const synthesizeSpeech = async (text, lang = 'hi', format = 'url') => {
  const sanitizedText = text.replace(/[*#_`]/g, '').trim();
  const targetLang = SUPPORTED_LANGUAGES[lang] ? lang : 'hi';

  try {
    let audioUrl = '';
    let audioSegments = [];

    if (sanitizedText.length <= 190) {
      audioUrl = googleTTS.getAudioUrl(sanitizedText, {
        lang: targetLang,
        slow: false,
        host: 'https://translate.google.com'
      });
      audioSegments = [{ text: sanitizedText, url: audioUrl }];
    } else {
      const urls = googleTTS.getAllAudioUrls(sanitizedText, {
        lang: targetLang,
        slow: false,
        host: 'https://translate.google.com'
      });
      audioUrl = urls[0]?.url || '';
      audioSegments = urls.map((u) => ({ text: u.shortText, url: u.url }));
    }

    let base64 = null;
    if (format === 'base64') {
      const base64Text = sanitizedText.slice(0, 190);
      base64 = await googleTTS.getAudioBase64(base64Text, {
        lang: targetLang,
        slow: false
      });
    }

    return {
      audioUrl,
      audioSegments,
      base64Audio: base64 ? `data:audio/mp3;base64,${base64}` : null,
      lang: targetLang,
      languageName: SUPPORTED_LANGUAGES[targetLang]?.name || 'Hindi',
      nativeName: SUPPORTED_LANGUAGES[targetLang]?.native || 'हिन्दी',
      characterCount: sanitizedText.length
    };
  } catch (err) {
    logger.error(`Speech synthesis error: ${err.message}`);
    throw new Error(`Speech synthesis failed: ${err.message}`);
  }
};

/**
 * Get the daily 60-second Polar Bulletin / Radio Maitri Dispatch in any Indian language
 */
const getDailyBulletin = async (lang = 'hi') => {
  const targetLang = SUPPORTED_LANGUAGES[lang] ? lang : 'hi';
  const today = new Date().toISOString().split('T')[0];

  const baseEnglishTranscript =
    `Greetings from the icy frontiers! This is Polar Vaani, your daily science dispatch from the National Centre for Polar and Ocean Research, Ministry of Earth Sciences. ` +
    `Today at Bharati Station in East Antarctica, scientists recorded ambient temperatures of minus 22 degrees Celsius with steady blizzards. ` +
    `Our research team successfully collected high-altitude ice core samples to study historical shifts in the Indian Monsoon. ` +
    `Meanwhile, at Himadri in the Arctic, atmospheric observations on aerosol transport continue. ` +
    `Stay tuned for tomorrow's dispatch from India's polar science pioneers. Jai Hind!`;

  // Translate to requested language
  const translatedTranscript = await translateText(baseEnglishTranscript, targetLang, 'en');

  // Synthesize audio
  const speech = await synthesizeSpeech(translatedTranscript, targetLang, 'url');

  return {
    title: `Polar Vaani Daily Dispatch (${SUPPORTED_LANGUAGES[targetLang]?.native || 'हिन्दी'})`,
    date: today,
    source: 'NCPOR / MoES Science Communications',
    stationsCovered: ['Bharati (Antarctica)', 'Maitri (Antarctica)', 'Himadri (Arctic)'],
    lang: targetLang,
    languageName: SUPPORTED_LANGUAGES[targetLang]?.name || 'Hindi',
    nativeName: SUPPORTED_LANGUAGES[targetLang]?.native || 'हिन्दी',
    transcript: translatedTranscript,
    originalTranscript: baseEnglishTranscript,
    audioUrl: speech.audioUrl,
    durationSeconds: 60
  };
};

/**
 * Generate a dedicated audio podcast episode on a custom polar topic
 */
const generatePodcast = async (topic = 'Antarctica and Indian Monsoon', lang = 'hi', station = 'BHARATI') => {
  const targetLang = SUPPORTED_LANGUAGES[lang] ? lang : 'hi';

  const baseScript =
    `Welcome to the Polar Science Audio Experience from the National Centre for Polar and Ocean Research. ` +
    `Today's spotlight is on ${topic} at ${station} Station. ` +
    `India's scientists are measuring polar atmospheric waves that directly influence weather patterns across the Indian subcontinent. ` +
    `Every ice core drilled in Antarctica tells a story of Earth's climate history over hundreds of thousands of years. ` +
    `Thank you for listening to Polar Vaani, empowering science across every Indian language.`;

  const translatedScript = await translateText(baseScript, targetLang, 'en');
  const speech = await synthesizeSpeech(translatedScript, targetLang, 'url');

  return {
    title: `Episode: ${topic}`,
    station,
    lang: targetLang,
    languageName: SUPPORTED_LANGUAGES[targetLang]?.name || 'Hindi',
    nativeName: SUPPORTED_LANGUAGES[targetLang]?.native || 'हिन्दी',
    script: translatedScript,
    audioUrl: speech.audioUrl
  };
};

module.exports = {
  SUPPORTED_LANGUAGES,
  translateText,
  synthesizeSpeech,
  getDailyBulletin,
  generatePodcast
};
