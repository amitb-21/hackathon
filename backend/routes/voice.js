const express = require('express');
const router = express.Router();
const multer = require('multer');
const FormData = require('form-data');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configure multer for file upload
const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB limit
  fileFilter: (req, file, cb) => {
    // Accept audio files
    if (file.mimetype.startsWith('audio/') || file.mimetype === 'video/webm') {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'));
    }
  }
});

/**
 * POST /api/voice/transcribe
 * Transcribe audio to text using OpenAI Whisper
 */
router.post('/transcribe', upload.single('audio'), async (req, res) => {
  let filePath = null;
  
  try {
    console.log('📝 Transcription request received');
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No audio file provided'
      });
    }

    filePath = req.file.path;
    console.log('📁 File saved:', filePath);
    console.log('📦 File size:', req.file.size, 'bytes');
    console.log('🎵 MIME type:', req.file.mimetype);

    // Check if OpenAI API key exists
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    // Create form data for OpenAI Whisper API
    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath), {
      filename: 'audio.webm',
      contentType: req.file.mimetype
    });
    formData.append('model', 'whisper-1');
    // Auto-detect language (supports Odia, Hindi, English, and 50+ languages)
    // Or specify language from request: req.body.language
    if (req.body.language) {
      formData.append('language', req.body.language);
    }
    // Note: Whisper supports these languages with 'or' code:
    // Odia (Oriya): 'or'
    // Hindi: 'hi' 
    // English: 'en'

    console.log('🤖 Analyzing with OpenAI Whisper API...');

    // Call OpenAI Whisper API
    const response = await axios.post(
      'https://api.openai.com/v1/audio/transcriptions',
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        maxBodyLength: Infinity,
        maxContentLength: Infinity
      }
    );

    const transcription = response.data.text;
    console.log('✅ Transcription successful:', transcription);
    
    // Detect language from transcription (simple detection)
    const detectedLanguage = req.body.language || detectLanguage(transcription);
    console.log('🌐 Language:', req.body.language ? `Specified as ${req.body.language}` : `Auto-detected as ${detectedLanguage}`);

    // Clean up the uploaded file
    fs.unlinkSync(filePath);

    res.json({
      success: true,
      transcription: transcription.trim(),
      language: detectedLanguage
    });

  } catch (error) {
    console.error('❌ Transcription error:', error.message);
    
    // Clean up file if it exists
    if (filePath && fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (cleanupError) {
        console.error('Error cleaning up file:', cleanupError);
      }
    }

    // Send appropriate error response
    let errorMessage = 'Could not transcribe audio';
    
    if (error.response) {
      console.error('OpenAI API error:', error.response.data);
      errorMessage = error.response.data.error?.message || errorMessage;
    } else if (error.message.includes('OPENAI_API_KEY')) {
      errorMessage = 'OpenAI API key not configured';
    }

    res.status(500).json({
      success: false,
      error: errorMessage
    });
  }
});

/**
 * POST /api/voice/synthesize
 * Convert text to speech using OpenAI TTS
 */
router.post('/synthesize', async (req, res) => {
  try {
    const { text, voice = 'nova', format = 'mp3' } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'Text is required'
      });
    }

    console.log('🔊 TTS request:', { text: text.substring(0, 50), voice, format });

    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    // Call OpenAI TTS API
    const response = await axios.post(
      'https://api.openai.com/v1/audio/speech',
      {
        model: 'tts-1',
        voice: voice,
        input: text,
        response_format: format
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        responseType: 'arraybuffer'
      }
    );

    const audioBuffer = Buffer.from(response.data);
    console.log('✅ TTS successful, audio size:', audioBuffer.length, 'bytes');

    // Set appropriate content type
    const contentTypes = {
      mp3: 'audio/mpeg',
      opus: 'audio/opus',
      aac: 'audio/aac',
      flac: 'audio/flac'
    };

    res.set('Content-Type', contentTypes[format] || 'audio/mpeg');
    res.send(audioBuffer);

  } catch (error) {
    console.error('❌ TTS error:', error.message);
    
    let errorMessage = 'Could not synthesize speech';
    
    if (error.response) {
      console.error('OpenAI API error:', error.response.data);
      errorMessage = error.response.data.error?.message || errorMessage;
    }

    res.status(500).json({
      success: false,
      error: errorMessage
    });
  }
});

/**
 * GET /api/voice/voices
 * Get available voices for TTS
 */
router.get('/voices', (req, res) => {
  res.json({
    success: true,
    voices: [
      { id: 'alloy', name: 'Alloy', description: 'Neutral and balanced' },
      { id: 'echo', name: 'Echo', description: 'Clear and articulate' },
      { id: 'fable', name: 'Fable', description: 'Warm and expressive' },
      { id: 'onyx', name: 'Onyx', description: 'Deep and authoritative' },
      { id: 'nova', name: 'Nova', description: 'Energetic and friendly' },
      { id: 'shimmer', name: 'Shimmer', description: 'Soft and gentle' }
    ]
  });
});

/**
 * GET /api/voice/languages
 * Get supported languages for voice input and output
 */
router.get('/languages', (req, res) => {
  res.json({
    success: true,
    languages: {
      indian: [
        { code: 'hi', name: 'Hindi', native: 'हिंदी', script: 'Devanagari' },
        { code: 'bn', name: 'Bengali', native: 'বাংলা', script: 'Bengali' },
        { code: 'te', name: 'Telugu', native: 'తెలుగు', script: 'Telugu' },
        { code: 'ta', name: 'Tamil', native: 'தமிழ்', script: 'Tamil' },
        { code: 'mr', name: 'Marathi', native: 'मराठी', script: 'Devanagari' },
        { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી', script: 'Gujarati' },
        { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ', script: 'Kannada' },
        { code: 'ml', name: 'Malayalam', native: 'മലയാളം', script: 'Malayalam' },
        { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ', script: 'Gurmukhi' },
        { code: 'or', name: 'Odia', native: 'ଓଡ଼ିଆ', script: 'Odia' },
        { code: 'as', name: 'Assamese', native: 'অসমীয়া', script: 'Bengali' },
        { code: 'ur', name: 'Urdu', native: 'اردو', script: 'Arabic' }
      ],
      international: [
        { code: 'en', name: 'English', native: 'English' },
        { code: 'es', name: 'Spanish', native: 'Español' },
        { code: 'fr', name: 'French', native: 'Français' },
        { code: 'de', name: 'German', native: 'Deutsch' },
        { code: 'pt', name: 'Portuguese', native: 'Português' },
        { code: 'ru', name: 'Russian', native: 'Русский' },
        { code: 'ja', name: 'Japanese', native: '日本語' },
        { code: 'zh', name: 'Chinese', native: '中文' },
        { code: 'ar', name: 'Arabic', native: 'العربية' },
        { code: 'ko', name: 'Korean', native: '한국어' },
        { code: 'it', name: 'Italian', native: 'Italiano' },
        { code: 'nl', name: 'Dutch', native: 'Nederlands' },
        { code: 'pl', name: 'Polish', native: 'Polski' },
        { code: 'tr', name: 'Turkish', native: 'Türkçe' },
        { code: 'vi', name: 'Vietnamese', native: 'Tiếng Việt' },
        { code: 'th', name: 'Thai', native: 'ไทย' },
        { code: 'id', name: 'Indonesian', native: 'Bahasa Indonesia' },
        { code: 'ms', name: 'Malay', native: 'Bahasa Melayu' },
        { code: 'fil', name: 'Filipino', native: 'Filipino' },
        { code: 'sw', name: 'Swahili', native: 'Kiswahili' }
      ]
    },
    total_supported: 32,
    whisper_note: 'OpenAI Whisper supports 50+ languages for speech-to-text',
    tts_note: 'OpenAI TTS can synthesize speech in all languages'
  });
});

/**
 * GET /api/voice/formats
 * Get available audio formats
 */
router.get('/formats', (req, res) => {
  res.json({
    success: true,
    formats: ['mp3', 'opus', 'aac', 'flac']
  });
});

/**
 * Language detection based on Unicode character ranges
 * Supports all major Indian languages
 */
function detectLanguage(text) {
  // Indian Language Unicode Ranges
  const languagePatterns = {
    'or': /[\u0B00-\u0B7F]/,    // Odia (Oriya)
    'hi': /[\u0900-\u097F]/,    // Hindi (Devanagari)
    'bn': /[\u0980-\u09FF]/,    // Bengali
    'te': /[\u0C00-\u0C7F]/,    // Telugu
    'ta': /[\u0B80-\u0BFF]/,    // Tamil
    'mr': /[\u0900-\u097F]/,    // Marathi (uses Devanagari)
    'gu': /[\u0A80-\u0AFF]/,    // Gujarati
    'kn': /[\u0C80-\u0CFF]/,    // Kannada
    'ml': /[\u0D00-\u0D7F]/,    // Malayalam
    'pa': /[\u0A00-\u0A7F]/,    // Punjabi (Gurmukhi)
    'as': /[\u0980-\u09FF]/,    // Assamese (uses Bengali script)
    'ur': /[\u0600-\u06FF]/,    // Urdu (Arabic script)
  };
  
  // Check each language pattern
  for (const [langCode, pattern] of Object.entries(languagePatterns)) {
    if (pattern.test(text)) {
      return langCode;
    }
  }
  
  // Default to English
  return 'en';
}

module.exports = router;