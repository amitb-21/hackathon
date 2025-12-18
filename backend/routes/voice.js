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
    formData.append('language', 'en'); // You can make this dynamic

    console.log('🚀 Sending to OpenAI Whisper API...');

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

    // Clean up the uploaded file
    fs.unlinkSync(filePath);

    res.json({
      success: true,
      transcription: transcription.trim()
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
 * GET /api/voice/formats
 * Get available audio formats
 */
router.get('/formats', (req, res) => {
  res.json({
    success: true,
    formats: ['mp3', 'opus', 'aac', 'flac']
  });
});

module.exports = router;