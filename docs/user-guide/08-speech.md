# Speech & Audio
# Nu e configurat
Configure speech-to-text and text-to-speech capabilities for hands-free and accessible AI conversations.

## What You'll Learn

- Speech-to-Text (STT) configuration
- Text-to-Speech (TTS) settings
- Conversation Mode (hands-free chat)
- Voice selection and customization
- Audio recording in chat
- Troubleshooting audio issues

## Overview

TESSA supports bidirectional voice communication:

**Speech-to-Text (STT):**
- Speak your messages instead of typing
- Auto-transcribe audio recordings
- Multiple engine options
- Language selection

**Text-to-Speech (TTS):**
- Hear AI responses read aloud
- Choose from various voices
- Adjust playback speed
- Automatic or manual playback

**Conversation Mode:**
- Hands-free dialogue with AI
- Continuous back-and-forth
- Ideal for brainstorming, practice, accessibility

## Accessing Speech Settings

### Opening Speech Settings

1. Click your **user menu** or **Settings** icon
2. Go to **Settings**
3. Select **Speech** tab
4. See two modes:
   - **Simple:** Basic options
   - **Advanced:** Full control

### Simple vs. Advanced Mode

**Simple Mode:**
- Essential settings only
- Quick setup
- Less overwhelming
- Good for beginners

**Advanced Mode:**
- All available options
- Fine-grained control
- Conversation Mode
- Advanced features

**Switch modes:**
- Click **Simple** or **Advanced** tabs at the top
- Settings persist when switching

## Speech-to-Text (STT)

### Enabling STT

**Simple Mode:**
1. Toggle **Speech to Text** ON
2. Select **Engine**
3. Choose **Language**
4. Start using microphone in chat

**Advanced Mode:**
1. Toggle **Speech to Text** ON
2. Configure all options below
3. Fine-tune as needed

### STT Engines

**Browser (Built-in):**
- Uses your browser's speech recognition
- No API key required
- Works offline (in some browsers)
- Quality depends on browser
- Free

**External:**
- Uses external STT service
- Configured by administrator
- Usually better accuracy
- May require API key/credits
- Language support varies

**How to select:**
1. In Speech settings
2. Find **STT Engine** dropdown
3. Select **Browser** or **External**
4. Save settings

> **Note:** If only one option appears, your administrator has configured only that engine.

### Language Selection

Choose the language you'll speak:

1. Find **STT Language** dropdown
2. Select your language
   - English (US)
   - English (UK)
   - Spanish
   - French
   - German
   - And many more...
3. Speak in the selected language

> **Tip:** Match the STT language to the language you're speaking for best accuracy.

### Auto-Transcribe Audio

**What it does:** Automatically transcribes audio files you upload

**When enabled:**
- Upload audio file (MP3, WAV, M4A, etc.)
- File automatically transcribes to text
- Transcription appears in chat
- Can edit before sending

**To configure:**
1. Go to Speech settings (Advanced mode)
2. Toggle **Auto-transcribe audio** ON
3. Upload audio files to conversations
4. They transcribe automatically

### Voice Detection Sensitivity (Decibel Selector)

**Advanced mode only**

**What it controls:** How sensitive the microphone is to detecting speech

**Settings:**
- **Lower values** (e.g., -60 dB): More sensitive, picks up quiet speech
- **Higher values** (e.g., -30 dB): Less sensitive, ignores background noise

**To adjust:**
1. Advanced Speech settings
2. Find **Decibel Selector** or **Voice Detection**
3. Drag slider or enter value
4. Test with microphone
5. Adjust until comfortable

**When to adjust:**
- **Too sensitive:** Picking up background noise? Increase threshold
- **Not sensitive enough:** Not detecting your voice? Decrease threshold

### Using Speech-to-Text

**To speak a message:**

1. Click the **microphone icon** in the chat input
2. Allow microphone permissions (if first time)
3. Icon turns red/active
4. Start speaking
5. Speech converts to text as you speak
6. Click microphone again to stop
7. Edit text if needed
8. Send message

**Tips for better accuracy:**
- Speak clearly and at moderate pace
- Use good quality microphone
- Minimize background noise
- Pause briefly between sentences
- Use punctuation commands (if supported):
  - "period", "comma", "question mark"

## Text-to-Speech (TTS)

### Enabling TTS

**Simple Mode:**
1. Toggle **Text to Speech** ON
2. Select **Engine**
3. Choose **Voice**
4. AI responses play automatically (or click to play)

**Advanced Mode:**
1. Toggle **Text to Speech** ON
2. Configure engine, voice, and advanced options
3. Fine-tune playback settings

### TTS Engines

**Browser (Built-in):**
- Uses your browser's voices
- No API key required
- Works offline
- Quality varies
- Many voices available

**External:**
- Uses external TTS service
- Configured by administrator
- Usually better quality
- More realistic voices
- May require API key/credits

**How to select:**
1. In Speech settings
2. Find **TTS Engine** dropdown
3. Select **Browser** or **External**
4. Save settings

### Voice Selection

Choose the voice that reads responses:

**Browser voices:**
1. Select **Browser** engine
2. Find **Voice** dropdown
3. Browse available voices
   - Male/Female options
   - Different accents
   - Multiple languages
4. Select preferred voice
5. Test with a message

**External voices:**
1. Select **External** engine
2. Available voices depend on service
3. Often more natural-sounding
4. May include premium voices

**Voice preview:**
- Some systems allow voice preview
- Listen before selecting
- Choose voice that suits your preference

### Cloud Browser Voices

**Advanced mode only** (when using Browser engine)

**What it does:** Uses cloud-based browser voices (higher quality)

**Benefits:**
- Better voice quality
- More voices available
- More languages

**To enable:**
1. Ensure **Browser** engine selected
2. Toggle **Cloud Browser Voices** ON
3. Additional voices become available

> **Note:** Requires internet connection even for browser voices.

### Automatic Playback

**What it controls:** Whether AI responses play automatically or require manual click

**Automatic ON:**
- AI response plays immediately when complete
- Hands-free experience
- Good for Conversation Mode

**Automatic OFF:**
- Click play button to hear response
- More control
- Better for quiet environments

**To configure:**
1. Advanced Speech settings
2. Toggle **Automatic Playback** ON/OFF
3. Save preference

### Playback Rate

**What it controls:** Speed of speech playback

**Range:** Usually 0.5x to 2.0x
- **0.5x - 0.8x:** Slower (easier to follow, learning)
- **1.0x:** Normal speed (default)
- **1.2x - 1.5x:** Faster (save time, impatient listeners)
- **1.6x - 2.0x:** Very fast (experienced users)

**To adjust:**
1. Advanced Speech settings
2. Find **Playback Rate** slider
3. Drag to desired speed
4. Or enter specific value
5. Test with a message

> **Tip:** Start at 1.0x and adjust gradually to find your comfortable speed.

### TTS Caching

**What it does:** Saves generated speech for reuse

**Benefits:**
- Faster playback of repeated messages
- Saves API calls (for external services)
- Consistent voice for same text

**To enable:**
1. Advanced Speech settings
2. Toggle **Cache TTS** ON
3. Speech is cached locally

> **Note:** Cache is browser-local. Clear if voices change or issues occur.

### Using Text-to-Speech

**With automatic playback:**
- AI responds
- Response automatically plays
- Listen without clicking

**With manual playback:**
- AI responds
- Click **play button** (speaker icon) on message
- Audio plays
- Click **stop** to interrupt

**Playback controls:**
- **Play/Pause:** Start or pause playback
- **Stop:** End playback
- **Replay:** Play again (click play button again)

## Conversation Mode

**Advanced mode only**

### What Is Conversation Mode?

**Definition:** Hands-free, continuous conversation with AI

**How it works:**
1. You speak
2. AI listens and responds
3. AI response plays aloud
4. AI continues listening
5. Repeat seamlessly

**Use cases:**
- Hands-free brainstorming
- Language practice
- Accessibility
- Walking/driving discussions (when safe)
- Rapid idea exchange

### Enabling Conversation Mode

1. Go to Speech settings (Advanced mode)
2. Ensure both STT and TTS are enabled
3. Toggle **Conversation Mode** ON
4. Configure voice detection sensitivity
5. Save settings

### Using Conversation Mode

**To start:**
1. Enable Conversation Mode in settings
2. Click **Conversation Mode icon** in chat (if available)
3. Or start speaking—system listens automatically

**During conversation:**
- Speak naturally
- AI responds
- Response plays aloud
- AI continues listening
- No need to click anything

**To stop:**
- Click **Stop Conversation Mode** button
- Or say "stop" (if configured)
- Or toggle off in settings

### Best Practices

1. **Quiet environment:** Minimize background noise
2. **Clear speech:** Speak clearly and at moderate pace
3. **Good microphone:** Use quality microphone for best results
4. **Adjust sensitivity:** Fine-tune detection threshold
5. **Headphones recommended:** Prevents AI from "hearing" itself

## Troubleshooting

### Microphone Not Working

**Problem:** STT doesn't detect your voice

**Solutions:**
- Check browser permissions (allow microphone)
- Ensure microphone is connected and working
- Try a different browser
- Check microphone privacy settings in OS
- Test microphone in other apps
- Adjust decibel threshold (Advanced mode)

### Poor Transcription Accuracy

**Problem:** STT misunderstands what you say

**Solutions:**
- Speak more clearly and slowly
- Reduce background noise
- Check selected language matches your speech
- Try external engine (if available)
- Use a better microphone
- Reposition microphone closer to mouth

### TTS Not Playing

**Problem:** Responses don't play aloud

**Solutions:**
- Check TTS is enabled in settings
- Ensure volume is up
- Check browser audio isn't muted
- Try different TTS engine
- Try different voice
- Refresh page
- Check automatic playback setting

### Voice Sounds Robotic

**Problem:** TTS voice quality is poor

**Solutions:**
- Try external TTS engine (if available)
- Select different voice
- Enable cloud browser voices
- Some voices are naturally better quality
- External engines usually sound more natural

### Conversation Mode Not Working

**Problem:** Conversation Mode doesn't activate

**Solutions:**
- Ensure both STT and TTS are enabled
- Check microphone permissions
- Adjust voice detection sensitivity
- Check browser compatibility
- Restart browser
- Try in a quieter environment

### Audio Feedback Loop

**Problem:** AI "hears" itself and responds to its own speech

**Solutions:**
- Use headphones
- Lower speaker volume
- Adjust microphone sensitivity
- Move microphone away from speakers
- Disable automatic playback

## Configuration Examples

### Setup 1: Basic Voice Input

**Goal:** Type occasionally, speak when convenient

**Configuration:**
- STT: ON
- Engine: Browser
- Language: Your language
- TTS: OFF
- Conversation Mode: OFF

### Setup 2: Full Voice Experience

**Goal:** Hear all responses, hands-free when desired

**Configuration:**
- STT: ON
- Engine: External (if available)
- Language: Your language
- Auto-transcribe: ON
- TTS: ON
- Engine: External (if available)
- Automatic Playback: ON
- Playback Rate: 1.0x
- Conversation Mode: OFF (enable when needed)

### Setup 3: Hands-Free Workflow

**Goal:** Completely hands-free operation

**Configuration:**
- STT: ON
- Engine: Best available
- Language: Your language
- Auto-transcribe: ON
- Decibel Threshold: Adjusted for environment
- TTS: ON
- Engine: Best available
- Voice: Preferred natural voice
- Automatic Playback: ON
- Playback Rate: 1.2x
- Conversation Mode: ON

### Setup 4: Accessibility Focus

**Goal:** Maximum accessibility and ease of use

**Configuration:**
- STT: ON
- Engine: Most accurate
- Language: Primary language
- Auto-transcribe: ON
- Decibel: Lower (more sensitive)
- TTS: ON
- Engine: Clearest voice
- Voice: Most natural, clear voice
- Automatic Playback: ON
- Playback Rate: 0.8x - 1.0x (slower for clarity)
- Cache: ON (consistency)
- Conversation Mode: Available when needed

## Privacy and Security

### Microphone Permissions

- Browser requests permission before accessing microphone
- You can revoke permissions in browser settings
- TESSA doesn't access microphone without explicit permission
- Permissions persist per browser

### Audio Data

**Browser engine:**
- Processed locally in browser (when offline-capable)
- Or sent to browser's speech service

**External engine:**
- Audio sent to external service (e.g., OpenAI, Google)
- Subject to service's privacy policy
- Usually not stored long-term
- Check your administrator's configuration

**TTS caching:**
- Cached locally in browser
- Not sent to servers
- Cleared when you clear browser data

> **Important:** Be mindful of sensitive information when using speech features, especially in public spaces.

## Best Practices

### For Accuracy

1. **Use quality equipment:** Good microphone makes a difference
2. **Speak clearly:** Don't mumble or speak too fast
3. **Pause between thoughts:** Helps AI process segments
4. **Minimize noise:** Quiet environment improves recognition
5. **Match language settings:** STT language should match your speech

### For Efficiency

1. **Learn voice commands:** Speed up interactions
2. **Use shortcuts:** Commands like "period", "comma"
3. **Adjust playback speed:** Save time with faster playback
4. **Cache TTS:** Faster repeated playback
5. **Conversation Mode for brainstorming:** Rapid back-and-forth

### For Accessibility

1. **Adjust playback rate:** Slower if needed
2. **Use clear voices:** Natural, understandable voices
3. **Automatic playback:** Hands-free operation
4. **Sensitive microphone:** Lower decibel threshold
5. **Headphones:** Better audio quality and privacy

## Next Steps

Explore related features:

- **[Getting Started](./01-getting-started.md)**: Basic chat interactions
- **[Advanced Features](./09-advanced.md)**: Additional audio-related features
- **[Settings & Personalization](./10-settings.md)**: Additional customization options
- **[Troubleshooting & FAQ](./11-faq.md)**: More troubleshooting help

---

**Master speech features** for a more accessible and efficient AI experience!
