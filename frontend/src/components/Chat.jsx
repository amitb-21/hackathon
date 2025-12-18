import React, { useEffect, useRef, useState } from "react";
import { Send, Mic, Square, Volume2, VolumeX } from "lucide-react";
import "./Chat.css";

export function Chat({
  messages,
  userInput,
  setUserInput,
  isAiTyping,
  onSendMessage,
}) {
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioRef = useRef(null);

  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [currentAudio, setCurrentAudio] = useState(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Recording timer
  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        await sendAudioToBackend(audioBlob);

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const sendAudioToBackend = async (audioBlob) => {
    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");

      // Send selected language to help Whisper
      console.log(`🎤 Transcribing audio in ${selectedLanguage}...`);

      const response = await fetch(
        "http://localhost:5000/api/voice/transcribe",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (data.success && data.transcription) {
        console.log(
          `✅ Transcription (${data.language || selectedLanguage}):`,
          data.transcription
        );
        setUserInput(data.transcription);

        // Update language if auto-detected differently
        if (data.language && data.language !== selectedLanguage) {
          console.log(
            `🔄 Language auto-detected as ${data.language}, updating selector`
          );
          setSelectedLanguage(data.language);
        }
      } else {
        console.error("Transcription failed:", data.error);
        alert("Could not transcribe audio. Please try again.");
      }
    } catch (error) {
      console.error("Error sending audio:", error);
      alert("Error sending audio to server.");
    }
  };

  const handleVoiceClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const playVoiceResponse = (audioUrl) => {
    if (!audioUrl) return;

    // Stop current audio if playing
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    setCurrentAudio(audioUrl);
    setIsPlayingAudio(true);

    audio.play();

    audio.onended = () => {
      setIsPlayingAudio(false);
      setCurrentAudio(null);
    };

    audio.onerror = (error) => {
      console.error("Audio playback error:", error);
      setIsPlayingAudio(false);
      setCurrentAudio(null);
    };
  };

  const stopVoicePlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsPlayingAudio(false);
      setCurrentAudio(null);
    }
  };

  const formatMessage = (text) => {
    if (!text) return "";

    // Replace markdown bold with HTML
    let formatted = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

    // Replace markdown lists with proper HTML
    formatted = formatted.replace(
      /\*\*\*(.*?)\*\*\*/g,
      "<em><strong>$1</strong></em>"
    );

    // Convert bullet points
    formatted = formatted.replace(/^\* /gm, "• ");
    formatted = formatted.replace(/^\d+\. /gm, (match) => match);

    // Add line breaks for better readability
    formatted = formatted.replace(/\n/g, "<br/>");

    return formatted;
  };

  return (
    <div className="chat-container">
      {/* Language Selector */}
      <div className="language-selector">
        <label>🌐 Language:</label>
        <select
          value={selectedLanguage}
          onChange={(e) => setSelectedLanguage(e.target.value)}
          className="language-dropdown"
        >
          <option value="en">English</option>
          <optgroup label="Indian Languages">
            <option value="hi">हिंदी (Hindi)</option>
            <option value="bn">বাংলা (Bengali)</option>
            <option value="te">తెలుగు (Telugu)</option>
            <option value="ta">தமிழ் (Tamil)</option>
            <option value="mr">मराठी (Marathi)</option>
            <option value="gu">ગુજરાતી (Gujarati)</option>
            <option value="kn">ಕನ್ನಡ (Kannada)</option>
            <option value="ml">മലയാളം (Malayalam)</option>
            <option value="pa">ਪੰਜਾਬੀ (Punjabi)</option>
            <option value="or">ଓଡ଼ିଆ (Odia)</option>
            <option value="as">অসমীয়া (Assamese)</option>
            <option value="ur">اردو (Urdu)</option>
          </optgroup>
          <optgroup label="Other Languages">
            <option value="es">Español (Spanish)</option>
            <option value="fr">Français (French)</option>
            <option value="de">Deutsch (German)</option>
            <option value="pt">Português (Portuguese)</option>
            <option value="ru">Русский (Russian)</option>
            <option value="ja">日本語 (Japanese)</option>
            <option value="zh">中文 (Chinese)</option>
            <option value="ar">العربية (Arabic)</option>
            <option value="ko">한국어 (Korean)</option>
            <option value="it">Italiano (Italian)</option>
            <option value="nl">Nederlands (Dutch)</option>
            <option value="pl">Polski (Polish)</option>
            <option value="tr">Türkçe (Turkish)</option>
            <option value="vi">Tiếng Việt (Vietnamese)</option>
            <option value="th">ไทย (Thai)</option>
            <option value="id">Bahasa Indonesia (Indonesian)</option>
            <option value="ms">Bahasa Melayu (Malay)</option>
            <option value="fil">Filipino (Tagalog)</option>
            <option value="sw">Kiswahili (Swahili)</option>
          </optgroup>
        </select>
      </div>

      <div className="chat-messages" ref={chatContainerRef}>
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.type}`}>
            <div className="message-content">
              {/* Voice playback button for AI messages */}
              {msg.type === "ai" && msg.audioUrl && (
                <div className="voice-controls">
                  {isPlayingAudio && currentAudio === msg.audioUrl ? (
                    <button
                      className="voice-play-btn playing"
                      onClick={stopVoicePlayback}
                      title="Stop voice"
                    >
                      <VolumeX size={16} />
                    </button>
                  ) : (
                    <button
                      className="voice-play-btn"
                      onClick={() => playVoiceResponse(msg.audioUrl)}
                      title="Play voice response"
                    >
                      <Volume2 size={16} />
                    </button>
                  )}
                </div>
              )}

              <div
                className="message-text"
                dangerouslySetInnerHTML={{ __html: formatMessage(msg.text) }}
              />

              {/* Recommended Actions Section */}
              {msg.actions && msg.actions.length > 0 && (
                <div className="actions-section">
                  <div className="section-header">
                    <span className="icon">✅</span>
                    <span className="title">Recommended Actions</span>
                  </div>
                  <div className="actions-list">
                    {msg.actions.map((action, idx) => (
                      <div key={idx} className="action-item">
                        <span className="action-icon">🟢</span>
                        <div className="action-content">
                          <div className="action-text">{action.action}</div>
                          {action.priority && (
                            <span
                              className={`priority-badge ${action.priority.toLowerCase()}`}
                            >
                              {action.priority}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Insights Section */}
              {msg.insights && msg.insights.length > 0 && (
                <div className="insights-section">
                  <div className="section-header">
                    <span className="icon">💡</span>
                    <span className="title">Insights</span>
                  </div>
                  <div className="insights-list">
                    {msg.insights.map((insight, idx) => (
                      <div key={idx} className="insight-item">
                        {insight}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Alerts Section */}
              {msg.alerts && msg.alerts.length > 0 && (
                <div className="alerts-section">
                  <div className="section-header">
                    <span className="icon">⚠️</span>
                    <span className="title">Alerts</span>
                  </div>
                  <div className="alerts-list">
                    {msg.alerts.map((alert, idx) => (
                      <div
                        key={idx}
                        className={`alert-item ${alert.severity?.toLowerCase()}`}
                      >
                        <div className="alert-text">{alert.message}</div>
                        {alert.severity && (
                          <span
                            className={`severity-badge ${alert.severity.toLowerCase()}`}
                          >
                            {alert.severity}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {isAiTyping && (
          <div className="message ai typing">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container">
        <input
          type="text"
          className="chat-input"
          placeholder="Type or use voice..."
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isAiTyping || isRecording}
        />
        <button
          className={`voice-button ${isRecording ? "recording" : ""}`}
          onClick={handleVoiceClick}
          disabled={isAiTyping}
        >
          {isRecording ? (
            <>
              <Square size={20} />
              <span>{formatTime(recordingTime)}</span>
            </>
          ) : (
            <>
              <Mic size={20} />
              <span>Voice</span>
            </>
          )}
        </button>
        <button
          className="send-button"
          onClick={onSendMessage}
          disabled={isAiTyping || !userInput.trim() || isRecording}
        >
          <Send size={20} />
        </button>
      </div>

      <div className="quick-questions">
        <span className="quick-label">← QUICK QUESTIONS:</span>
        <button
          className="quick-question"
          onClick={() => setUserInput("What's my farm status?")}
        >
          What's my farm status?
        </button>
        <button
          className="quick-question"
          onClick={() => setUserInput("Fertilizer advice")}
        >
          Fertilizer advice
        </button>
        <button
          className="quick-question"
          onClick={() => setUserInput("Disease prevention")}
        >
          Disease prevention
        </button>
      </div>
    </div>
  );
}
