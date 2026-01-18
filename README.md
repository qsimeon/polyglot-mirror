# Polyglot Mirror

A real-time speech translation application with facial tracking that displays translations in a 3D speech bubble following your mouth movements.

## Overview

Polyglot Mirror combines speech recognition, translation, and face tracking technologies to create an interactive language learning and communication tool. Speak in English, and watch as your words are translated in real-time into one of 11 supported languages, displayed in a speech bubble that moves with your face.

### Key Features

- **Real-time Speech Recognition**: Browser-based Web Speech API captures your voice
- **Instant Translation**: Google Cloud Translation API translates to 11 languages (500K characters/month free)
- **Face Tracking**: MediaPipe detects and tracks facial landmarks in real-time
- **3D Speech Bubble**: React Three Fiber renders a speech bubble that follows your mouth
- **Low Latency**: Optimized pipeline for minimal delay between speech and translation

### Technology Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **3D Graphics**: React Three Fiber, Three.js, GSAP
- **Face Tracking**: MediaPipe Tasks Vision
- **Speech Recognition**: Web Speech API (browser-based)
- **Translation**: Google Cloud Translation API
- **Styling**: Tailwind CSS

## How It Works

1. **Camera Capture**: MediaPipe accesses your webcam and detects facial landmarks
2. **Speech Input**: Web Speech API listens to your microphone and converts speech to text
3. **Translation**: Text is sent to Google Cloud Translation API
4. **Display**: Translated text appears in a 3D speech bubble that follows your mouth position
5. **Real-time Updates**: The bubble moves smoothly as you speak and move your head

### Architecture Flow

```
Webcam → MediaPipe Face Detection → Mouth Coordinates
                                          ↓
Microphone → Web Speech API → Text → Translation API → Translated Text
                                                              ↓
                                            React Three Fiber Speech Bubble
```

## Project Structure

```
polyglot-mirror/
├── src/
│   └── app/
│       ├── page.tsx                    # Entry point
│       ├── PolyglotMirror.tsx         # Main application component
│       ├── Experience.tsx              # 3D scene setup (camera, lighting)
│       ├── SpeechBubble.tsx           # 3D speech bubble component
│       ├── hooks/
│       │   ├── useSpeechRecognition.ts # Speech-to-text hook
│       │   └── useTranslation.ts       # Translation API hook
│       ├── components/
│       │   ├── LanguageSelector.tsx    # Language dropdown selector
│       │   ├── TranscriptDisplay.tsx   # Shows original text
│       │   └── ControlPanel.tsx        # Start/Stop listening controls
│       └── api/
│           └── translate/
│               └── route.ts            # Translation API endpoint
├── public/                             # Static assets
├── .env.local                          # Environment variables (not committed)
├── package.json                        # Dependencies
└── README.md                           # This file
```

### Architecture Overview

The application uses a **modular architecture** with separation of concerns:

- **Hooks**: Encapsulate speech recognition and translation logic
- **Components**: Reusable UI elements (language selector, controls, transcript)
- **API Routes**: Server-side translation endpoint
- **3D Scene**: React Three Fiber components for rendering

## Prerequisites

- **Node.js**: Version 20 or higher
- **Modern Browser**: Chrome, Edge, or Safari with WebRTC support
- **Google Cloud Account**: For Translation API (free tier: 500K characters/month)
- **Webcam & Microphone**: For face tracking and speech recognition

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
git clone https://github.com/yourusername/polyglot-mirror.git
cd polyglot-mirror
npm install
```

### 2. Set Up Google Cloud Translation API

#### Step-by-step guide:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Cloud Translation API**:
   - Navigate to "APIs & Services" → "Library"
   - Search for "Cloud Translation API"
   - Click "Enable"
4. Create an API Key:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "API Key"
   - (Recommended) Click "Restrict Key" and limit it to "Cloud Translation API"
5. Copy your API key

### 3. Configure Environment Variables

Create a `.env.local` file in the project root:

```bash
GOOGLE_CLOUD_API_KEY=your_api_key_here
```

**Important**: Never commit your `.env.local` file to version control. It's already included in `.gitignore`.

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage Guide

### Getting Started

1. **Grant Permissions**:
   - Allow camera access when prompted (for face tracking)
   - Allow microphone access when prompted (for speech recognition)

2. **Select Target Language**:
   - Use the language dropdown to choose your desired translation language
   - Default is Spanish (Español)

3. **Start Listening**:
   - Click "Start Listening" button
   - The button will turn red and say "Stop Listening"
   - Begin speaking in English

4. **See Translation**:
   - Your original text appears at the bottom of the screen
   - Translated text appears in the speech bubble above your face
   - The bubble follows your mouth movements in real-time

5. **Stop Listening**:
   - Click "Stop Listening" to pause speech recognition

### Tips for Best Results

- Speak clearly and at a moderate pace
- Ensure good lighting for accurate face tracking
- Position your face within the camera frame
- Minimize background noise for better speech recognition
- Keep your browser tab active (Web Speech API pauses on inactive tabs)

## Supported Languages

The application supports translation into 11 languages:

| Language | Code | Language | Code |
|----------|------|----------|------|
| Spanish | `es` | Japanese | `ja` |
| French | `fr` | Korean | `ko` |
| German | `de` | Chinese | `zh` |
| Italian | `it` | Arabic | `ar` |
| Portuguese | `pt` | Hindi | `hi` |
| Gujarati | `gu` | | |

## Development

### Adding New Languages

To add a new language:

1. Open `src/app/api/translate/route.ts`
2. Add the language code and name to the `LANGUAGE_NAMES` object:
   ```typescript
   const LANGUAGE_NAMES: Record<string, string> = {
     // ... existing languages
     ru: 'Russian',  // Add new language
   };
   ```
3. Open `src/app/components/LanguageSelector.tsx`
4. Add the language to the options array:
   ```typescript
   <option value="ru">Russian (Русский)</option>
   ```

### Modifying UI Components

- **Speech Bubble**: Edit `src/app/SpeechBubble.tsx` to customize appearance, size, or animation
- **Controls**: Modify `src/app/components/ControlPanel.tsx` for button styling or layout
- **Language Selector**: Update `src/app/components/LanguageSelector.tsx` for dropdown customization

### Extending Functionality

- **Add Text-to-Speech**: Integrate Web Speech Synthesis API to read translations aloud
- **Multiple Languages**: Support translating from any language (not just English)
- **Recording**: Add ability to record and save translation sessions
- **Offline Mode**: Cache translations for common phrases

### Build for Production

```bash
npm run build
npm start
```

## Technical Details

### Speech Recognition

- **Technology**: Web Speech API (built into modern browsers)
- **Language**: English (en-US) by default
- **Continuous Mode**: Captures speech continuously until stopped
- **Interim Results**: Real-time transcription as you speak

**Implementation**: See `src/app/hooks/useSpeechRecognition.ts:1`

### Translation

- **Service**: Google Cloud Translation API v2
- **Endpoint**: `https://translation.googleapis.com/language/translate/v2`
- **Method**: REST API (no additional packages required)
- **Free Tier**: 500,000 characters/month
- **Latency**: ~200-500ms per translation

**Implementation**: See `src/app/api/translate/route.ts:1`

### Face Tracking

- **Technology**: MediaPipe Face Landmarker
- **Model**: Face detection with 478 landmarks
- **Target**: Mouth region (for speech bubble positioning)
- **Performance**: ~30-60 FPS depending on hardware

**Key landmarks used**:
- Upper lip center
- Lower lip center
- Mouth corners

### 3D Rendering

- **Library**: React Three Fiber (React renderer for Three.js)
- **Animation**: GSAP for smooth speech bubble movement
- **Scene**: Orthographic camera positioned in front of face
- **Lighting**: Ambient + directional lights for depth

**Implementation**: See `src/app/Experience.tsx:1` and `src/app/SpeechBubble.tsx:1`

## Troubleshooting

### Camera Not Working

- Ensure you've granted camera permissions in your browser
- Check that no other application is using the camera
- Try refreshing the page and re-granting permissions
- Verify your browser supports WebRTC (Chrome, Edge, Safari recommended)

### Microphone Not Working

- Grant microphone permissions when prompted
- Check browser settings: `chrome://settings/content/microphone`
- Ensure microphone is not muted in system settings
- Test microphone in another application to verify it works

### Translation Errors

- **"Google Cloud API key not configured"**: Ensure `.env.local` exists with `GOOGLE_CLOUD_API_KEY`
- **"Translation service error"**: Verify API key is valid and Cloud Translation API is enabled
- **Rate limit errors**: Check you haven't exceeded 500K characters/month free tier
- **Network errors**: Verify internet connection

### Speech Recognition Not Starting

- **Only works in HTTPS**: Ensure you're using `https://` or `localhost`
- **Browser compatibility**: Use Chrome, Edge, or Safari (Firefox has limited support)
- **Language**: Web Speech API requires specific language codes (currently set to en-US)
- **Background tab**: Keep the browser tab active (API pauses on background tabs)

### Face Tracking Issues

- **Poor lighting**: Ensure adequate lighting on your face
- **Face position**: Keep your face centered and within camera frame
- **Performance**: Close other applications if tracking is laggy
- **Model loading**: Wait a few seconds for MediaPipe model to load on first run

### General Performance Issues

- **Hardware acceleration**: Enable GPU acceleration in browser settings
- **Close unused tabs**: Free up system resources
- **Update browser**: Ensure you're on the latest version
- **Reduce quality**: Lower camera resolution in browser settings if needed

## API Cost & Limits

### Google Cloud Translation API

- **Free Tier**: 500,000 characters/month
- **Pricing after free tier**: $20 per 1 million characters
- **Rate Limits**: 1000 requests/minute
- **Character Counting**: Counts input characters (not output)

**Estimated Usage**:
- Average sentence: 50 characters
- 10,000 translations/month = ~500,000 characters
- **Conclusion**: Free tier is sufficient for personal use and demos

## Future Enhancements

- [ ] Support translating from any language (not just English)
- [ ] Add text-to-speech to hear translations
- [ ] Implement conversation mode (two-way translation)
- [ ] Add translation history/session recording
- [ ] Support multiple faces (group conversations)
- [ ] Add gesture recognition for commands
- [ ] Implement offline mode with cached translations
- [ ] Add custom vocabulary/phrase books
- [ ] Support video recording of sessions
- [ ] Create mobile app version

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- **MediaPipe**: Google's open-source ML framework for face tracking
- **Google Cloud Translation**: Reliable, fast translation service
- **Web Speech API**: Browser-based speech recognition
- **React Three Fiber**: Declarative 3D rendering in React
- **Next.js**: Full-stack React framework

## Contact

For questions, issues, or feedback:
- Open an issue on [GitHub](https://github.com/yourusername/polyglot-mirror/issues)
- Email: your.email@example.com

---

Built with by [Your Name]

**Status**: Active Development | **Version**: 0.1.0 | **Last Updated**: January 2026
