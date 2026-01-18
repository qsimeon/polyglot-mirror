export interface TranslationOptions {
  text: string;
  sourceLanguage: string;
  targetLanguage: string;
}

export interface TranslationResult {
  translatedText: string;
  detectedLanguage?: string;
}

// Simple mock translations for testing
const MOCK_TRANSLATIONS: Record<string, Record<string, string>> = {
  "hello": {
    "es": "hola",
    "fr": "bonjour",
    "de": "hallo",
    "it": "ciao",
    "pt": "olá",
    "ja": "こんにちは",
    "ko": "안녕하세요",
    "zh": "你好",
    "ar": "مرحبا",
    "hi": "नमस्ते",
    "gu": "નમસ્તે"
  },
  "how are you": {
    "es": "¿cómo estás?",
    "fr": "comment allez-vous?",
    "de": "wie geht es dir?",
    "it": "come stai?",
    "pt": "como você está?",
    "gu": "કેમ છો?"
  },
  "goodbye": {
    "es": "adiós",
    "fr": "au revoir",
    "de": "auf wiedersehen",
    "it": "arrivederci",
    "pt": "adeus",
  }
};

function getMockTranslation(text: string, targetLang: string): string | null {
  const lowerText = text.toLowerCase().trim();
  return MOCK_TRANSLATIONS[lowerText]?.[targetLang] || null;
}

export async function translateText(
  options: TranslationOptions
): Promise<TranslationResult> {
  const { text, sourceLanguage, targetLanguage } = options;

  try {
    // Try using the API through Next.js API route
    const response = await fetch("/api/translate", {
      method: "POST",
      body: JSON.stringify({
        q: text,
        source: sourceLanguage,
        target: targetLanguage,
        format: "text",
      }),
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error(`Translation API failed: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error);
    }

    return {
      translatedText: data.translatedText,
      detectedLanguage: data.detectedLanguage?.language,
    };
  } catch (error) {
    console.log("Translation API unavailable, trying fallback...");

    // Try mock translation as fallback
    const mockTranslation = getMockTranslation(text, targetLanguage);
    if (mockTranslation) {
      console.log("Using mock translation");
      return {
        translatedText: mockTranslation,
        detectedLanguage: sourceLanguage,
      };
    }

    // Last resort: return original with language tag
    return {
      translatedText: `[${targetLanguage}] ${text}`,
      detectedLanguage: sourceLanguage,
    };
  }
}
