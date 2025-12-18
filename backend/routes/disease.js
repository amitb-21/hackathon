const express = require('express');
const router = express.Router();
const multer = require('multer');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configure multer for image upload
const upload = multer({ 
  dest: 'uploads/diseases/',
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    // Accept image files only
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads/diseases');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✅ Created disease uploads directory');
}

/**
 * POST /api/disease/analyze
 * Analyze crop disease from image using OpenAI Vision API
 */
router.post('/analyze', upload.single('image'), async (req, res) => {
  let filePath = null;
  
  try {
    console.log('🔍 Disease analysis request received');
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No image file provided'
      });
    }

    filePath = req.file.path;
    console.log('📁 Image saved:', filePath);
    console.log('📦 File size:', req.file.size, 'bytes');

    // Check if OpenAI API key exists
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    // Read image and convert to base64
    const imageBuffer = fs.readFileSync(filePath);
    const base64Image = imageBuffer.toString('base64');
    const mimeType = req.file.mimetype;

    console.log('🤖 Analyzing with OpenAI Vision API...');

    // Call OpenAI Vision API with detailed agricultural analysis prompt
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `You are an expert agricultural pathologist with extensive field experience. Carefully examine every detail of this crop/plant image and provide a comprehensive analysis based ONLY on what you actually observe in the image.

CRITICAL INSTRUCTIONS:
1. Focus on VISUAL EVIDENCE: Describe exactly what you see - colors, patterns, shapes, textures, discoloration
2. Be HIGHLY SPECIFIC: Don't just say "spots" - describe their exact appearance (size, color, shape, distribution, borders)
3. Note PLANT HEALTH INDICATORS: Leaf turgor, color vibrancy, growth pattern, overall vigor
4. Identify PROGRESSION STAGES: Look for early vs. advanced symptoms, active vs. dormant infections
5. Consider ENVIRONMENTAL CLUES: Evidence of water stress, nutrient deficiency, physical damage

Provide your analysis in the following JSON format:

{
  "detected": true/false,
  "disease_name": "Specific disease name if identifiable, or descriptive name like 'Leaf Spot Disease' or 'Healthy Plant'",
  "confidence": 0-100 (your confidence level based on visual evidence quality and symptom clarity),
  "severity": "Low/Medium/High/Critical",
  "affected_parts": ["list all affected plant parts visible"],
  
  "visual_observations": {
    "leaf_condition": "Detailed description of leaf appearance, color, texture, firmness",
    "discoloration": "Exact colors observed (yellowing, browning, blackening, etc.) and their pattern",
    "lesion_characteristics": "Size, shape, color, texture, borders (sharp/diffuse), centers (sunken/raised)",
    "distribution_pattern": "Where symptoms appear (leaf tips, margins, veins, random, systematic)",
    "texture_changes": "Any wilting, crisping, curling, thickening, or other texture abnormalities",
    "additional_signs": "Mold, spores, insect damage, mechanical damage, anything unusual"
  },
  
  "symptoms": [
    "List 5-10 specific visual symptoms you observe",
    "Be extremely detailed about each symptom",
    "Include measurements when possible (e.g., '2-3mm spots')",
    "Note colors using specific terms (chlorotic, necrotic, dark brown, etc.)"
  ],
  
  "differential_diagnosis": [
    "Primary diagnosis with reasoning based on visual evidence",
    "Alternative possible diagnoses if symptoms are ambiguous",
    "What additional information would help confirm diagnosis"
  ],
  
  "causes": [
    "Most likely pathogen or cause based on observed symptoms",
    "Environmental factors that may contribute (based on visual clues)",
    "How this condition typically develops",
    "Why this particular crop is susceptible"
  ],
  
  "stage_analysis": {
    "current_stage": "Early/Intermediate/Advanced/Severe",
    "progression_indicators": "What symptoms indicate this stage",
    "time_estimate": "Estimated time since infection/issue started",
    "expected_progression": "What will happen if left untreated"
  },
  
  "treatment": [
    "IMMEDIATE actions (within 24 hours)",
    "SHORT-TERM treatment (this week) - include both organic and chemical options",
    "MEDIUM-TERM management (this month)",
    "Specific products or methods recommended with application instructions",
    "Expected recovery timeline with visual milestones",
    "What to do if treatment doesn't work"
  ],
  
  "prevention": [
    "Cultural practices to prevent recurrence",
    "Environmental modifications needed",
    "Sanitation and hygiene measures",
    "Resistant varieties to consider for future",
    "Monitoring schedule to catch early signs"
  ],
  
  "recommendations": [
    "Detailed care instructions specific to this plant's condition",
    "What to monitor daily/weekly",
    "When to seek professional help",
    "How to prevent spread to other plants",
    "Long-term soil/environment management"
  ],
  
  "spread_risk": {
    "risk_level": "Low/Medium/High/Critical",
    "spread_mechanism": "How this spreads (water, wind, insects, contact)",
    "vulnerable_plants": "What other crops are at risk",
    "containment_measures": "Specific steps to prevent spread"
  },
  
  "crop_type": "Identified crop/plant species",
  "image_quality_note": "Comment on image clarity and if better images would help diagnosis"
}

IMPORTANT: 
- If the plant appears healthy, still analyze it thoroughly and note positive indicators
- If you're uncertain, explain why and what would help confirm diagnosis
- Always base your analysis on VISUAL EVIDENCE from the image, not general knowledge
- Be honest about confidence levels - it's better to say "possibly X" than to guess
- Provide actionable, practical advice that a farmer can implement immediately

Respond ONLY with valid JSON, no markdown formatting or additional text.`
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType};base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 2000,
        temperature: 0.3
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const analysisText = response.data.choices[0].message.content;
    console.log('📥 Received analysis from OpenAI');

    // Parse JSON response
    let analysisData;
    try {
      // Remove markdown code blocks if present
      const cleanedText = analysisText.replace(/```json\n?|\n?```/g, '').trim();
      analysisData = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('Failed to parse JSON, using text response');
      analysisData = {
        detected: false,
        disease_name: 'Analysis Error',
        confidence: 0,
        description: analysisText,
        error: 'Could not parse structured response'
      };
    }

    // Add metadata
    analysisData.analyzed_at = new Date().toISOString();
    analysisData.image_path = filePath;

    console.log('✅ Analysis complete:', analysisData.disease_name);

    // Optionally save to database here
    // await saveAnalysisToDatabase(analysisData);

    res.json({
      success: true,
      analysis: analysisData
    });

  } catch (error) {
    console.error('❌ Disease analysis error:', error.message);
    
    // Clean up file if it exists
    if (filePath && fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (cleanupError) {
        console.error('Error cleaning up file:', cleanupError);
      }
    }

    let errorMessage = 'Could not analyze image';
    
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
 * GET /api/disease/history
 * Get disease analysis history for a user
 */
router.get('/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 10 } = req.query;

    res.json({
      success: true,
      history: [],
      message: 'History feature coming soon'
    });

  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({
      success: false,
      error: 'Could not fetch history'
    });
  }
});

// Clean up old disease images (run periodically)
const cleanupOldImages = () => {
  try {
    const files = fs.readdirSync(uploadsDir);
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    
    files.forEach(file => {
      const filePath = path.join(uploadsDir, file);
      const stats = fs.statSync(filePath);
      const age = now - stats.mtimeMs;
      
      if (age > maxAge) {
        fs.unlinkSync(filePath);
        console.log('🗑️ Cleaned up old disease image:', file);
      }
    });
  } catch (error) {
    console.error('Error cleaning up images:', error);
  }
};

// Run cleanup every 6 hours
setInterval(cleanupOldImages, 6 * 60 * 60 * 1000);

module.exports = router;
