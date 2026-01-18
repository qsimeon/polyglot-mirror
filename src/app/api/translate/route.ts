import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { q, source, target, format } = body;

    console.log(`Translating "${q}" from ${source} to ${target}`);

    // Try LibreTranslate.com first (main instance)
    try {
      const response = await fetch("https://libretranslate.com/translate", {
        method: "POST",
        body: JSON.stringify({
          q,
          source,
          target,
          format: format || "text",
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Translation successful:", data.translatedText);
        return NextResponse.json({
          translatedText: data.translatedText,
          detectedLanguage: data.detectedLanguage?.language,
        });
      }
    } catch (e) {
      console.log("LibreTranslate.com failed, trying alternatives...");
    }

    // Try alternative instance
    try {
      const response = await fetch("https://translate.argosopentech.com/translate", {
        method: "POST",
        body: JSON.stringify({
          q,
          source,
          target,
          format: format || "text",
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json({
          translatedText: data.translatedText,
          detectedLanguage: data.detectedLanguage?.language,
        });
      }
    } catch (e) {
      console.log("Alternative instance also failed");
    }

    // All instances failed
    return NextResponse.json(
      { error: "All translation services unavailable" },
      { status: 503 }
    );
  } catch (error) {
    console.error("Translation API error:", error);
    return NextResponse.json(
      { error: "Translation failed", details: String(error) },
      { status: 500 }
    );
  }
}
