require('dotenv').config();

const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required env var: ${envVar}`);
  }
}

// Extract and deduplicate Groq keys (supports single key or comma/newline separated pool)
const rawGroqKeys = process.env.GROQ_API_KEYS || process.env.GROQ_API_KEY || '';
const groqApiKeys = rawGroqKeys
  .split(/[,\n\r]+/)
  .map((k) => k.trim())
  .filter((k) => k && !k.startsWith('gsk_your'));

// Extract and deduplicate Gemini keys (supports single key or comma/newline separated pool)
const rawGeminiKeys = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || '';
const geminiApiKeys = rawGeminiKeys
  .split(/[,\n\r]+/)
  .map((k) => k.trim())
  .filter((k) => k && !k.startsWith('AIzaSyYour'));

const config = {
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  port: parseInt(process.env.PORT, 10) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  aiProvider: (process.env.AI_PROVIDER || 'groq').toLowerCase(),
  // Groq LPU
  groqApiKey: groqApiKeys[0] || process.env.GROQ_API_KEY || '',
  groqApiKeys: groqApiKeys.length > 0 ? groqApiKeys : (process.env.GROQ_API_KEY ? [process.env.GROQ_API_KEY] : []),
  groqModel: process.env.GROQ_MODEL || 'qwen/qwen3.8-27b',
  // Google Gemini
  geminiApiKey: geminiApiKeys[0] || process.env.GEMINI_API_KEY || '',
  geminiApiKeys: geminiApiKeys.length > 0 ? geminiApiKeys : (process.env.GEMINI_API_KEY ? [process.env.GEMINI_API_KEY] : []),
  geminiModel: process.env.GEMINI_MODEL || 'gemini-3.6-flash'
};

module.exports = config;
