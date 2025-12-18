const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * TTS Service - Text to Speech
 * Handles speech synthesis using OpenAI TTS API
 */
class TTSService {
  /**
   * Convert text to speech
   * 
   * @param {string} text - Text to convert to speech
   * @param {Object} options - TTS options
   * @returns {Object} - { success, audioBuffer, audioFormat, size, processingTime }
   */
  async textToSpeech(text, options = {}) {
    try {
      const {
        voice = 'nova',
        language = 'en',
        format = 'mp3',
        speed = 1.0
      } = options;

      console.log(`🔊 Synthesizing speech (${voice}, ${language})...`);
      const startTime = Date.now();

      // Call OpenAI TTS API
      const response = await openai.audio.speech.create({
        model: 'tts-1',
        voice: voice,
        input: text,
        response_format: format,
        speed: speed
      });

      // Get audio buffer
      const buffer = Buffer.from(await response.arrayBuffer());
      const processingTime = Date.now() - startTime;

      console.log(`✅ Speech synthesized (${(buffer.length / 1024).toFixed(2)} KB, ${processingTime}ms)`);

      return {
        success: true,
        audioBuffer: buffer,
        audioFormat: format,
        size: buffer.length,
        processingTime,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('❌ TTS error:', error);
      return {
        success: false,
        error: error.message,
        audioBuffer: null
      };
    }
  }

  /**
   * Get supported voices
   */
  getSupportedVoices() {
    return {
      'alloy': {
        name: 'Alloy',
        gender: 'neutral',
        description: 'Neutral, balanced voice'
      },
      'echo': {
        name: 'Echo',
        gender: 'male',
        description: 'Male, clear voice'
      },
      'fable': {
        name: 'Fable',
        gender: 'male',
        description: 'Male, expressive voice'
      },
      'onyx': {
        name: 'Onyx',
        gender: 'male',
        description: 'Male, deep voice'
      },
      'nova': {
        name: 'Nova',
        gender: 'female',
        description: 'Female, warm voice'
      },
      'shimmer': {
        name: 'Shimmer',
        gender: 'female',
        description: 'Female, soft voice'
      }
    };
  }

  /**
   * Get supported audio formats
   */
  getSupportedFormats() {
    return {
      'mp3': { name: 'MP3', mimeType: 'audio/mpeg' },
      'opus': { name: 'Opus', mimeType: 'audio/opus' },
      'aac': { name: 'AAC', mimeType: 'audio/aac' },
      'flac': { name: 'FLAC', mimeType: 'audio/flac' }
    };
  }

  /**
   * Format voices for UI
   */
  getVoicesForUI() {
    const voices = this.getSupportedVoices();
    return Object.entries(voices).map(([code, info]) => ({
      code,
      name: info.name,
      gender: info.gender,
      description: info.description
    }));
  }

  /**
   * Format formats for UI
   */
  getFormatsForUI() {
    const formats = this.getSupportedFormats();
    return Object.entries(formats).map(([code, info]) => ({
      code,
      name: info.name,
      mimeType: info.mimeType
    }));
  }
}

module.exports = new TTSService();