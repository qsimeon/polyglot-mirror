import { NextRequest, NextResponse } from 'next/server';

const LANGUAGE_NAMES: Record<string, string> = {
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  it: 'Italian',
  pt: 'Portuguese',
  ja: 'Japanese',
  ko: 'Korean',
  zh: 'Chinese',
  ar: 'Arabic',
  hi: 'Hindi',
  gu: 'Gujarati',
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, targetLanguage } = body;

    if (!text || !targetLanguage) {
      return NextResponse.json(
        { error: "Missing text or targetLanguage" },
        { status: 400 }
      );
    }

    const targetLangName = LANGUAGE_NAMES[targetLanguage] || targetLanguage;
    console.log(`Translating "${text}" to ${targetLangName}`);

    const googleApiKey = process.env.GOOGLE_CLOUD_API_KEY;
    if (!googleApiKey) {
      return NextResponse.json(
        { error: "Google Cloud API key not configured" },
        { status: 500 }
      );
    }

    // Use Google Cloud Translation API for fast, reliable, free translation
    const url = `https://translation.googleapis.com/language/translate/v2?key=${googleApiKey}`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        q: text,
        target: targetLanguage,
        format: "text",
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Google Cloud Translation API error:", error);
      return NextResponse.json(
        { error: "Translation service error" },
        { status: response.status }
      );
    }

    const data = await response.json();
    const translatedText = data.data?.translations?.[0]?.translatedText;

    if (!translatedText) {
      return NextResponse.json(
        { error: "No translation returned" },
        { status: 500 }
      );
    }

    console.log("✅ Translation successful:", translatedText);

    return NextResponse.json({
      translatedText,
      targetLanguage,
    });
  } catch (error) {
    console.error("Translation API error:", error);
    return NextResponse.json(
      { error: "Translation failed", details: String(error) },
      { status: 500 }
    );
  }
}
