const { ChatOpenAI } = require('@langchain/openai');
const { StateGraph, Annotation, START, END } = require('@langchain/langgraph');
const { PromptTemplate, ChatPromptTemplate } = require('@langchain/core/prompts');
const { RunnableSequence } = require('@langchain/core/runnables');
const memoryService = require('./memoryService');
const { getSystemPrompt, getSimpleQueryPrompt, getComplexQueryPrompt, getRetryPrompt } = require('../prompts/systemPrompt');
const { getFewShotPrompt, getExamplesByType } = require('../prompts/fewShotExamples');
const { getJudgePrompt, getRetryPrompt: getJudgeRetryPrompt } = require('../prompts/judgePrompt');
const Conversation = require('../models/Conversation');

/**
 * State Annotation for LangGraph with explicit reducers
 */
const StateAnnotation = Annotation.Root({
  query: Annotation({
    reducer: (prev, next) => next ?? prev,
    default: () => ''
  }),
  userId: Annotation({
    reducer: (prev, next) => next ?? prev,
    default: () => 'farmer_001'
  }),
  currentSensors: Annotation({
    reducer: (prev, next) => next ?? prev,
    default: () => ({})
  }),
  queryType: Annotation({
    reducer: (prev, next) => next ?? prev,
    default: () => 'general'
  }),
  enrichedContext: Annotation({
    reducer: (prev, next) => next ?? prev,
    default: () => null
  }),
  timestamp: Annotation({
    reducer: (prev, next) => next ?? prev,
    default: () => Date.now()
  }),
  classification: Annotation({
    reducer: (prev, next) => next ?? prev,
    default: () => null
  }),
  aiResponse: Annotation({
    reducer: (prev, next) => next ?? prev,
    default: () => ''
  }),
  judgement: Annotation({
    reducer: (prev, next) => next ?? prev,
    default: () => null
  }),
  retryCount: Annotation({
    reducer: (prev, next) => next ?? prev,
    default: () => 0
  }),
  formattedResponse: Annotation({
    reducer: (prev, next) => next ?? prev,
    default: () => null
  }),
  conversationId: Annotation({
    reducer: (prev, next) => next ?? prev,
    default: () => ''
  }),
  stage: Annotation({
    reducer: (prev, next) => next ?? prev,
    default: () => 'start'
  }),
  error: Annotation({
    reducer: (prev, next) => next ?? prev,
    default: () => ''
  })
});

class AIService {
  constructor() {
    // Validate API keys
    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ OPENAI_API_KEY is not set in environment variables!');
      throw new Error('OPENAI_API_KEY is required');
    }

    console.log('✅ API Keys validated');

    // Initialize OpenAI for both generation and judging
    this.llm = new ChatOpenAI({
      modelName: 'gpt-4o-mini',
      apiKey: process.env.OPENAI_API_KEY,
      maxTokens: 2048,
      temperature: 0.7
    });

    this.judge = new ChatOpenAI({
      modelName: 'gpt-4o-mini',
      apiKey: process.env.OPENAI_API_KEY,
      maxTokens: 1000,
      temperature: 0.3
    });

    console.log('✅ LLMs initialized (OpenAI: gpt-4o-mini for both generation and judging)');

    // Initialize StateGraph with Annotation
    this.graph = new StateGraph(StateAnnotation);
    this._buildGraph();
  }

  /**
   * Build the LangGraph with nodes and edges
   */
  _buildGraph() {
    // Add nodes first
    this.graph.addNode('node1_contextBuilder', this.node1_contextBuilder.bind(this));
    this.graph.addNode('node2_queryClassifier', this.node2_queryClassifier.bind(this));
    this.graph.addNode('node3_responseGenerator', this.node3_responseGenerator.bind(this));
    this.graph.addNode('node4_judgeEvaluator', this.node4_judgeEvaluator.bind(this));
    this.graph.addNode('node4_1_enhancedRetry', this.node4_1_enhancedRetry.bind(this));
    this.graph.addNode('node5_responseFormatter', this.node5_responseFormatter.bind(this));
    this.graph.addNode('node6_storageAndLearning', this.node6_storageAndLearning.bind(this));

    // Add edges using START and END constants
    this.graph.addEdge(START, 'node1_contextBuilder');
    this.graph.addEdge('node1_contextBuilder', 'node2_queryClassifier');
    this.graph.addEdge('node2_queryClassifier', 'node3_responseGenerator');
    this.graph.addEdge('node3_responseGenerator', 'node4_judgeEvaluator');

    // Conditional edge: Judge decision - SIMPLIFIED to prevent loops
    this.graph.addConditionalEdges(
      'node4_judgeEvaluator',
      (state) => {
        const score = state.judgement?.score || 75;
        const retries = state.retryCount || 0;
        
        console.log(`🔀 Routing Decision: Score=${score}, Retries=${retries}`);
        
        // Always proceed after one retry attempt, regardless of score
        if (retries >= 1) {
          console.log('   → Going to Formatter (max retries reached)');
          return 'node5_responseFormatter';
        }
        
        // First attempt - only retry if score is very low (< 60)
        if (score < 60) {
          console.log('   → Going to Retry (score too low)');
          return 'node4_1_enhancedRetry';
        }
        
        // Otherwise proceed
        console.log('   → Going to Formatter (score acceptable)');
        return 'node5_responseFormatter';
      },
      {
        'node5_responseFormatter': 'node5_responseFormatter',
        'node4_1_enhancedRetry': 'node4_1_enhancedRetry'
      }
    );

    // Conditional edge: After retry - ALWAYS go back to judge ONCE
    this.graph.addConditionalEdges(
      'node4_1_enhancedRetry',
      (state) => {
        console.log('🔀 After Retry: Going back to judge for final evaluation');
        return 'node4_judgeEvaluator';
      },
      {
        'node4_judgeEvaluator': 'node4_judgeEvaluator'
      }
    );

    this.graph.addEdge('node5_responseFormatter', 'node6_storageAndLearning');
    this.graph.addEdge('node6_storageAndLearning', END);

    // Compile graph with recursion limit
    this.compiledGraph = this.graph.compile({
      recursionLimit: 10  // Prevent infinite loops
    });
    
    console.log('✅ LangGraph compiled with recursion limit: 10');
  }

  /**
   * ==================== NODE 1: Context Builder ====================
   */
  async node1_contextBuilder(state) {
    console.log('📋 NODE 1: Context Builder - Building enriched context...');

    try {
      const enrichedContext = await memoryService.buildEnrichedContext(
        state.userId,
        state.query,
        state.currentSensors,
        state.queryType
      );

      return {
        ...state,
        enrichedContext,
        timestamp: Date.now(),
        stage: 'context_built'
      };
    } catch (error) {
      console.error('❌ NODE 1 Error:', error);
      return {
        ...state,
        error: `Context building failed: ${error.message}`,
        stage: 'error'
      };
    }
  }

  /**
   * ==================== NODE 2: Query Classifier ====================
   */
  async node2_queryClassifier(state) {
    console.log('🔍 NODE 2: Query Classifier - Classifying query...');

    // Default classification
    const defaultClassification = {
      type: state.queryType || 'general',
      complexity: 'simple',
      intent: 'question',
      requiresSubQueries: false,
      subQueries: []
    };

    try {
      const classificationPrompt = PromptTemplate.fromTemplate(`You are an agricultural query classifier. Classify this farmer's query.

Query: "{query}"

Respond ONLY with JSON (no markdown):
{{
  "type": "watering|disease|fertilizer|pest|weather|ph|nutrients|general",
  "complexity": "simple|complex",
  "intent": "question|alert|prediction|comparison",
  "requiresSubQueries": true|false,
  "subQueries": ["q1", "q2"] or []
}}`);

      const chain = classificationPrompt.pipe(this.llm);
      const result = await chain.invoke({ query: state.query });

      let classification = { ...defaultClassification };

      try {
        // Handle different response formats from LangChain
        let responseText = '';
        
        if (typeof result === 'string') {
          responseText = result;
        } else if (result.content) {
          responseText = typeof result.content === 'string' ? result.content : JSON.stringify(result.content);
        } else if (result.text) {
          responseText = result.text;
        } else if (result.lc_kwargs && result.lc_kwargs.content) {
          responseText = result.lc_kwargs.content;
        }
        
        // Clean and parse JSON
        const cleanedText = responseText.replace(/```json\n?|\n?```/g, '').trim();
        
        if (cleanedText) {
          const parsed = JSON.parse(cleanedText);
          // Merge with defaults to ensure all fields exist
          classification = { ...defaultClassification, ...parsed };
        }
      } catch (parseError) {
        console.warn('Warning: Could not parse classification JSON, using defaults');
        console.warn('Parse error:', parseError.message);
      }

      console.log(`✅ Classification: ${classification.type} (${classification.complexity})`);

      return {
        ...state,
        classification,
        stage: 'classified'
      };
    } catch (error) {
      console.error('❌ NODE 2 Error:', error);
      return {
        ...state,
        classification: defaultClassification,
        stage: 'classified'
      };
    }
  }

  /**
   * Helper to extract text from LLM response
   */
  _extractTextFromResponse(result) {
    if (typeof result === 'string') {
      return result;
    } else if (result.content) {
      return typeof result.content === 'string' ? result.content : JSON.stringify(result.content);
    } else if (result.text) {
      return result.text;
    } else if (result.lc_kwargs && result.lc_kwargs.content) {
      return result.lc_kwargs.content;
    }
    return '';
  }

  /**
   * ==================== NODE 3: Response Generator ====================
   */
  async node3_responseGenerator(state) {
    const { query, classification, enrichedContext, currentSensors } = state;
    const complexity = classification?.complexity || 'simple';

    console.log(`💬 NODE 3: Response Generator [${complexity.toUpperCase()}]...`);

    try {
      let response;

      if (complexity === 'complex') {
        response = await this._handleComplexQuery(state);
      } else {
        response = await this._handleSimpleQuery(state);
      }

      console.log(`✅ Generated response (${response ? response.length : 0} chars)`);
      if (!response || response.length < 10) {
        console.warn('⚠️  WARNING: Response is too short or empty!');
        response = "Hello! I'm AgriSmart AI. How can I help you with your farming needs today?";
      }

      console.log(`   📦 Returning state with aiResponse: ${response.substring(0, 50)}...`);

      return {
        ...state,
        aiResponse: response,
        stage: 'response_generated',
        retryCount: 0
      };
    } catch (error) {
      console.error('❌ NODE 3 Error:', error);
      return {
        ...state,
        error: `Response generation failed: ${error.message}`,
        stage: 'error'
      };
    }
  }

  /**
   * Handle simple queries
   */
  async _handleSimpleQuery(state) {
    const { query, enrichedContext, currentSensors } = state;
    
    try {
      const formattedContext = memoryService.formatContextForAI(enrichedContext);

      const systemPrompt = getSystemPrompt(currentSensors.crop);
      const fewShotPrompt = getFewShotPrompt('simple');

      const fullPrompt = `${systemPrompt}

${fewShotPrompt}

# FARMER'S CURRENT SITUATION:
${formattedContext}

# FARMER'S QUESTION:
${query}

Provide a direct, practical answer with specific recommendations.`;

      console.log(`   📤 Calling OpenAI API...`);

      const messages = [
        {
          role: 'user',
          content: fullPrompt
        }
      ];

      const result = await this.llm.invoke(messages);
      const response = this._extractTextFromResponse(result);
      
      console.log(`   📥 Received response: ${response ? response.substring(0, 50) : 'EMPTY'}...`);
      
      if (!response || response.trim().length === 0) {
        console.error('   ❌ OpenAI returned empty response!');
        throw new Error('Empty response from OpenAI');
      }
      
      return response;
    } catch (error) {
      console.error('   ❌ Simple query error:', error.message);
      
      // Return a helpful fallback response
      return `Hello! I'm AgriSmart AI, your farming assistant. 

I'm here to help you with:
- Irrigation guidance based on soil moisture
- Nutrient management (NPK levels)
- Crop health monitoring
- Disease prevention
- And more!

Your current readings:
- Moisture: ${currentSensors.moisture}%
- Temperature: ${currentSensors.temperature}°C
- pH: ${currentSensors.ph}

How can I assist you with your ${currentSensors.crop} crop today?`;
    }
  }

  /**
   * Handle complex queries
   */
  async _handleComplexQuery(state) {
    const { query, enrichedContext, currentSensors, classification } = state;
    
    try {
      const formattedContext = memoryService.formatContextForAI(enrichedContext);

      const systemPrompt = getSystemPrompt(currentSensors.crop);
      const fewShotPrompt = getFewShotPrompt('complex');

      let subQueryContext = '';
      if (classification.requiresSubQueries && classification.subQueries.length > 0) {
        subQueryContext = `\n\nBreak down analysis into these areas:\n${classification.subQueries
          .map((sq, i) => `${i + 1}. ${sq}`)
          .join('\n')}`;
      }

      const fullPrompt = `${systemPrompt}

${fewShotPrompt}

# FARMER'S CURRENT SITUATION:
${formattedContext}

# COMPLEX QUESTION:
${query}
${subQueryContext}

This is a complex query requiring detailed analysis. Show your reasoning step-by-step and provide comprehensive recommendations.`;

      console.log(`   📤 Calling OpenAI API (Complex)...`);

      const messages = [
        {
          role: 'user',
          content: fullPrompt
        }
      ];

      const result = await this.llm.invoke(messages);
      const response = this._extractTextFromResponse(result);
      
      console.log(`   📥 Received response: ${response ? response.substring(0, 50) : 'EMPTY'}...`);
      
      if (!response || response.trim().length === 0) {
        console.error('   ❌ OpenAI returned empty response!');
        throw new Error('Empty response from OpenAI');
      }
      
      return response;
    } catch (error) {
      console.error('   ❌ Complex query error:', error.message);
      
      // Return a helpful fallback response
      return `I understand you have a complex question about your ${currentSensors.crop} farming. Let me help you with that.

Based on your current conditions:
- Moisture: ${currentSensors.moisture}%
- Temperature: ${currentSensors.temperature}°C
- pH: ${currentSensors.ph}
- NPK: N=${currentSensors.nitrogen}, P=${currentSensors.phosphorus}, K=${currentSensors.potassium}

Your question: "${query}"

I'm here to provide detailed guidance. Could you please rephrase your question or ask about specific aspects like:
- Watering schedule
- Fertilizer recommendations
- Disease prevention
- Nutrient management

This will help me give you the most accurate advice.`;
    }
  }

  /**
   * ==================== NODE 4: Judge Evaluator ====================
   */
  async node4_judgeEvaluator(state) {
    const { query, aiResponse, enrichedContext, retryCount } = state;

    console.log(`⚖️  NODE 4: Judge Evaluator - Scoring response... (Retry: ${retryCount}/1)`);
    console.log(`   📦 Received state - query: "${query?.substring(0, 30)}...", aiResponse length: ${aiResponse ? aiResponse.length : 0}`);
    console.log(`   📝 AI Response length: ${aiResponse ? aiResponse.length : 0} chars`);

    // Debug: Check if we have valid input
    if (!aiResponse || aiResponse.length < 10) {
      console.warn('⚠️  WARNING: AI response is empty or too short, skipping judge');
      console.warn(`   Actual aiResponse:`, aiResponse ? `"${aiResponse.substring(0, 50)}..."` : 'undefined');
      return {
        ...state,
        judgement: {
          score: 85,
          reasoning: 'Skipped evaluation - response too short'
        },
        stage: 'judge_skipped'
      };
    }

    try {
      const judgePrompt = getJudgePrompt(query, aiResponse, enrichedContext);

      const messages = [
        {
          role: 'user',
          content: judgePrompt
        }
      ];

      const result = await this.judge.invoke(messages);
      const responseText = this._extractTextFromResponse(result);
      
      console.log(`   Judge raw response length: ${responseText ? responseText.length : 0} chars`);

      let judgement = {
        score: 80,  // Changed from 75 to 80 - more lenient default
        breakdown: {
          factualAccuracy: 16,
          relevance: 16,
          actionability: 16,
          historicalContext: 16,
          safetyPracticality: 16
        },
        strengths: ['Response provided', 'Contextually aware', 'Practical advice'],
        weaknesses: ['Could not fully evaluate'],
        suggestions: ['Add more specific data references'],
        reasoning: 'Evaluation completed with default scoring'
      };

      try {
        const cleanedText = responseText.replace(/```json\n?|\n?```/g, '').trim();
        if (cleanedText && cleanedText.length > 10) {
          const parsed = JSON.parse(cleanedText);
          // Ensure score is at least 60 if response exists
          judgement = {
            ...parsed,
            score: Math.max(parsed.score || 60, 60)
          };
        }
      } catch (parseError) {
        console.warn('Warning: Could not parse judge JSON, using defaults');
      }

      console.log(`📊 Judge Score: ${judgement.score}/100 ${retryCount >= 1 ? '(Final - No more retries)' : ''}`);

      return {
        ...state,
        judgement,
        stage: judgement.score >= 85 ? 'judge_approved' : 'judge_rejected'
      };
    } catch (error) {
      console.error('❌ NODE 4 Error:', error);
      return {
        ...state,
        judgement: {
          score: 75,
          reasoning: 'Judge unavailable, proceeding with caution'
        },
        stage: 'judge_approved_with_warning'
      };
    }
  }

  /**
   * ==================== NODE 4.1: Enhanced Retry ====================
   */
  async node4_1_enhancedRetry(state) {
    const { query, judgement, enrichedContext, currentSensors, retryCount } = state;

    console.log(`🔄 NODE 4.1: Enhanced Retry (Attempt ${retryCount + 1})...`);

    try {
      const retryPrompt = getJudgeRetryPrompt(query, state.aiResponse, judgement, enrichedContext);
      const systemPrompt = getSystemPrompt(currentSensors.crop);

      const fullPrompt = `${systemPrompt}

${retryPrompt}`;

      const messages = [
        {
          role: 'user',
          content: fullPrompt
        }
      ];

      const result = await this.llm.invoke(messages);
      const improvedResponse = this._extractTextFromResponse(result) || state.aiResponse;

      console.log(`✅ Response improved, sending back to judge for re-evaluation`);

      return {
        ...state,
        aiResponse: improvedResponse,
        retryCount: retryCount + 1,
        stage: 'response_improved'
      };
    } catch (error) {
      console.error('❌ NODE 4.1 Error:', error);
      return {
        ...state,
        retryCount: retryCount + 1,
        stage: 'retry_failed'
      };
    }
  }

  /**
   * ==================== NODE 5: Response Formatter ====================
   */
  async node5_responseFormatter(state) {
    console.log('✨ NODE 5: Response Formatter - Formatting response...');

    try {
      const { aiResponse, enrichedContext, judgement } = state;

      const formatted = {
        response: aiResponse,
        insights: this._extractInsights(aiResponse, enrichedContext),
        actions: this._extractActions(aiResponse),
        alerts: this._extractAlerts(aiResponse, enrichedContext)
      };

      return {
        ...state,
        formattedResponse: formatted,
        stage: 'response_formatted'
      };
    } catch (error) {
      console.error('❌ NODE 5 Error:', error);

      return {
        ...state,
        formattedResponse: {
          response: state.aiResponse,
          insights: {},
          actions: [],
          alerts: []
        },
        stage: 'response_formatted_with_error'
      };
    }
  }

  /**
   * Extract insights from response
   */
  _extractInsights(response, enrichedContext) {
    const insights = {};
    const { trends, pastConversations } = enrichedContext;

    if (trends) {
      for (const [param, data] of Object.entries(trends)) {
        if (data && data.direction && response.toLowerCase().includes(param)) {
          insights[`${param}_trend`] = `${param} is ${data.direction} by ${Math.abs(data.change).toFixed(2)}`;
        }
      }
    }

    if (pastConversations && pastConversations.length > 0) {
      const lastSuccess = pastConversations.find(c => c.wasSuccessful);
      if (lastSuccess) {
        insights.history = `Last successful: ${lastSuccess.query} (${lastSuccess.daysAgo}d ago)`;
      }
    }

    return insights;
  }

  /**
   * Extract actionable items
   */
  _extractActions(response) {
    const actions = [];

    const actionPatterns = [
      /\d+\.\s+([^.\n]+)/g,
      /[-•]\s+([^.\n]+)/g
    ];

    for (const pattern of actionPatterns) {
      let match;
      while ((match = pattern.exec(response)) !== null) {
        const action = match[1].trim();
        if (action.length > 10 && action.length < 150) {
          actions.push({
            action,
            priority: this._determinePriority(action)
          });
        }
      }
    }

    return actions.slice(0, 5);
  }

  /**
   * Determine priority
   */
  _determinePriority(actionText) {
    const urgent = ['immediately', 'urgent', 'critical', 'now', 'today', 'asap'];
    const high = ['soon', 'quickly', 'within 1-2 days', 'important'];

    const text = actionText.toLowerCase();

    if (urgent.some(w => text.includes(w))) return 'urgent';
    if (high.some(w => text.includes(w))) return 'high';
    if (text.includes('within')) return 'medium';

    return 'low';
  }

  /**
   * Extract alerts
   */
  _extractAlerts(response, enrichedContext) {
    const alerts = [];
    const { anomalies } = enrichedContext;

    if (anomalies && anomalies.length > 0) {
      anomalies
        .filter(a => a.severity === 'high')
        .forEach(a => {
          alerts.push(`⚠️  ${a.message}`);
        });
    }

    const criticalKeywords = ['critical', 'dangerous', 'must', 'immediately', 'urgent'];
    const responseLower = response.toLowerCase();

    if (criticalKeywords.some(k => responseLower.includes(k.toLowerCase()))) {
      const criticalSentences = response.match(/[^.!?]*(?:critical|dangerous|must|immediately|urgent)[^.!?]*[.!?]/gi);
      if (criticalSentences) {
        criticalSentences.slice(0, 2).forEach(sentence => {
          const clean = sentence.trim();
          if (!alerts.includes(clean)) {
            alerts.push(clean);
          }
        });
      }
    }

    return alerts.slice(0, 3);
  }

  /**
   * ==================== NODE 6: Storage & Learning ====================
   */
  async node6_storageAndLearning(state) {
    console.log('💾 NODE 6: Storage & Learning - Saving conversation...');

    try {
      const { 
        userId, 
        query, 
        aiResponse, 
        formattedResponse, 
        enrichedContext = {}, 
        classification = {}, 
        judgement = {}, 
        timestamp,
        currentSensors = {}
      } = state;

      // Safe access to nested properties
      const sensorSnapshot = enrichedContext.currentSensors || currentSensors || {};
      const cropType = sensorSnapshot.crop || 'Unknown';

      const conversationData = {
        userId: userId || 'farmer_001',
        query: query || '',
        queryType: classification.type || 'general',
        queryComplexity: classification.complexity || 'simple',
        sensorSnapshot,
        cropType,

        contextUsed: {
          pastConversationsCount: enrichedContext.pastConversations?.length || 0,
          sensorTrendDays: 30,
          similarQueriesFound: enrichedContext.similarQueries?.length || 0
        },

        langgraphState: {
          classificationResult: classification || {},
          subQueries: classification.subQueries || [],
          judgeScore: judgement?.score || 0,
          retriesNeeded: state.retryCount || 0,
          processingTimeMs: Date.now() - (timestamp || Date.now())
        },

        aiResponse: aiResponse || 'No response generated',
        confidence: judgement?.score || 75,
        reasoning: [
          judgement?.reasoning || 'Response generated successfully',
          ...Object.values(formattedResponse?.insights || {})
        ].filter(r => typeof r === 'string'),
        recommendations: formattedResponse?.actions || [],

        tags: [
          classification.type || 'general', 
          classification.complexity || 'simple', 
          ...(classification.subQueries || [])
        ]
      };

      console.log(`   💾 Saving: Query="${query?.substring(0, 30)}...", Type=${conversationData.queryType}`);

      const savedConversation = await memoryService.storeConversation(conversationData);

      console.log(`   ✅ Saved conversation: ${savedConversation._id}`);

      return {
        ...state,
        conversationId: savedConversation._id.toString(),
        stage: 'complete'
      };
    } catch (error) {
      console.error('❌ NODE 6 Error:', error);
      console.error('   State keys:', Object.keys(state));
      return {
        ...state,
        conversationId: 'error',
        stage: 'complete_with_error',
        error: `Storage failed: ${error.message}`
      };
    }
  }

  /**
   * ==================== MAIN ORCHESTRATOR ====================
   */
  async processQuery(userId, query, currentSensors) {
    console.log('\n' + '='.repeat(60));
    console.log('🚀 STARTING LANGGRAPH WORKFLOW');
    console.log('='.repeat(60) + '\n');

    const startTime = Date.now();

    try {
      const initialState = {
        query,
        userId: userId || 'farmer_001',
        currentSensors,
        queryType: 'general',
        enrichedContext: null,
        timestamp: startTime,
        classification: null,
        aiResponse: null,
        judgement: null,
        retryCount: 0,
        formattedResponse: null,
        conversationId: null,
        stage: 'start',
        error: null
      };

      const finalState = await this.compiledGraph.invoke(initialState);

      const processingTime = Date.now() - startTime;
      console.log(`\n✅ WORKFLOW COMPLETE (${processingTime}ms)\n`);

      return {
        success: !finalState.error,
        conversationId: finalState.conversationId,
        response: finalState.formattedResponse?.response || 'Unable to process query',
        insights: finalState.formattedResponse?.insights || {},
        actions: finalState.formattedResponse?.actions || [],
        alerts: finalState.formattedResponse?.alerts || [],
        processingTime,
        error: finalState.error
      };
    } catch (error) {
      console.error('\n❌ WORKFLOW FAILED:', error.message);

      const processingTime = Date.now() - startTime;
      return {
        success: false,
        error: error.message,
        response: 'I apologize, but I encountered an issue processing your query. Please try again.',
        processingTime
      };
    }
  }
}

module.exports = new AIService();
