const getJudgePrompt = (originalQuery, aiResponse, context) => {
  // Safe destructuring with defaults
  const currentSensors = context?.currentSensors || {};
  
  return `You are an expert agricultural judge evaluating an AI farming assistant's response.

# FARMER'S QUERY:
"${originalQuery}"

# CURRENT CONTEXT PROVIDED:
- Soil Moisture: ${currentSensors.moisture || 0}%
- Soil pH: ${currentSensors.ph || 6.5}
- Nitrogen: ${currentSensors.nitrogen || 150} ppm
- Phosphorus: ${currentSensors.phosphorus || 50} ppm
- Potassium: ${currentSensors.potassium || 180} ppm
- Temperature: ${currentSensors.temperature || 25}°C
- Humidity: ${currentSensors.humidity || 60}%
- Crop: ${currentSensors.crop || 'Unknown'}

# AI'S RESPONSE:
${aiResponse || 'No response provided'}

# EVALUATION CRITERIA (Score 0-100):

1. **FACTUAL ACCURACY (0-20 points)**
   - Does the response correctly interpret sensor readings?
   - Are recommendations aligned with actual soil/weather data?
   - Are there any incorrect statements about crop requirements?
   - Does it reference correct optimal ranges for this crop?

2. **RELEVANCE TO QUERY (0-20 points)**
   - Does the response directly address what the farmer asked?
   - Are all recommendations directly related to the query?
   - Is there any unnecessary or off-topic information?
   - Does it acknowledge the farmer's specific situation?

3. **ACTIONABILITY (0-20 points)**
   - Does it provide clear, specific action steps?
   - Can the farmer actually do what's recommended?
   - Are there measurable targets/timelines?
   - Does it avoid vague or generic advice?

4. **HISTORICAL CONTEXT USAGE (0-20 points)**
   - Does it reference past conversations or patterns where relevant?
   - Does it acknowledge what worked before for this farmer?
   - Does it learn from the farmer's history?
   - Does it mention previous successful actions?

5. **SAFETY & PRACTICALITY (0-20 points)**
   - Are recommendations safe for the crop?
   - Are they practical given typical farmer constraints?
   - Does it warn about potential risks?
   - Does it avoid harmful advice?

# OUTPUT FORMAT:
Respond ONLY with valid JSON (no markdown, no extra text):

{
  "score": <0-100>,
  "breakdown": {
    "factualAccuracy": <0-20>,
    "relevance": <0-20>,
    "actionability": <0-20>,
    "historicalContext": <0-20>,
    "safetyPracticality": <0-20>
  },
  "strengths": [
    "<strength 1>",
    "<strength 2>",
    "<strength 3>"
  ],
  "weaknesses": [
    "<weakness 1 - be specific>",
    "<weakness 2 - be specific>",
    "<weakness 3 - be specific>"
  ],
  "suggestions": [
    "<improvement 1 - actionable>",
    "<improvement 2 - actionable>",
    "<improvement 3 - actionable>"
  ],
  "reasoning": "<2-3 sentences explaining the overall score>"
}`;
};

/**
 * Get retry/improvement prompt
 * Fed back to AI when score < 85
 */
const getRetryPrompt = (originalQuery, previousResponse, judgeFeedback, context) => {
  // Safe destructuring with defaults
  const currentSensors = context?.currentSensors || {};
  const pastConversations = context?.pastConversations || [];
  const weaknesses = judgeFeedback?.weaknesses || [];
  const suggestions = judgeFeedback?.suggestions || [];
  const score = judgeFeedback?.score || 0;
  
  return `You are AgriSmart AI, an expert agricultural consultant.

A farmer asked: "${originalQuery}"

You provided this response:
${previousResponse || 'No previous response'}

However, it scored ${score}/100 from an expert judge. Here's the feedback:

## Judge's Feedback:

**Weaknesses:**
${weaknesses.length > 0 ? weaknesses.map(w => `- ${w}`).join('\n') : '- None specified'}

**Suggestions for Improvement:**
${suggestions.length > 0 ? suggestions.map(s => `- ${s}`).join('\n') : '- None specified'}

---

## CURRENT CONTEXT:
- Soil Moisture: ${currentSensors.moisture || 0}%
- Soil pH: ${currentSensors.ph || 6.5}
- Nitrogen: ${currentSensors.nitrogen || 150} ppm
- Phosphorus: ${currentSensors.phosphorus || 50} ppm
- Potassium: ${currentSensors.potassium || 180} ppm
- Temperature: ${currentSensors.temperature || 25}°C
- Humidity: ${currentSensors.humidity || 60}%
- Crop: ${currentSensors.crop || 'Unknown'}

Recent History:
${pastConversations.length > 0 
  ? pastConversations.slice(0, 3).map(c => 
      `- ${c.daysAgo || 0}d ago: "${c.query || 'N/A'}" (${c.wasSuccessful ? 'Success ✅' : 'Failed ❌'})`
    ).join('\n')
  : 'No recent history'}

---

## YOUR TASK:
Rewrite your response by:
1. Directly addressing each weakness mentioned
2. Incorporating the judge's suggestions
3. Being more specific with data references
4. Providing clearer, more actionable steps
5. Referencing relevant historical patterns if available

Keep the response concise and practical. Focus on what works.`;
};

module.exports = {
  getJudgePrompt,
  getRetryPrompt
};
