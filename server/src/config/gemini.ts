import { GoogleGenAI } from '@google/genai';
import { ENV } from './env.js';

let genAiInstance: GoogleGenAI | null = null;

if (ENV.GEMINI_API_KEY) {
  try {
    genAiInstance = new GoogleGenAI({ apiKey: ENV.GEMINI_API_KEY });
  } catch (err) {
    console.warn('[Gemini Config] Error initializing GoogleGenAI:', err);
  }
}

export const ai = genAiInstance;
export const isGeminiReady = (): boolean => Boolean(ai && ENV.GEMINI_API_KEY);
