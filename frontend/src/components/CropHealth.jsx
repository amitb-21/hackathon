import React, { useState } from "react";
import {
  Upload,
  Camera,
  X,
  AlertCircle,
  CheckCircle,
  Loader,
} from "lucide-react";
import "./CropHealth.css";

export function CropHealth() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError("Image size must be less than 10MB");
        return;
      }

      setSelectedImage(file);
      setError(null);
      setAnalysisResult(null);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) {
      setError("Please select an image first");
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("image", selectedImage);

      console.log("📤 Uploading image for analysis...");

      const response = await fetch(
        "http://localhost:5000/api/disease/analyze",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (data.success) {
        console.log("✅ Analysis complete:", data.analysis);
        setAnalysisResult(data.analysis);
      } else {
        throw new Error(data.error || "Analysis failed");
      }
    } catch (err) {
      console.error("❌ Analysis error:", err);
      setError(err.message || "Failed to analyze image. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleClear = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setAnalysisResult(null);
    setError(null);
  };

  const getSeverityColor = (severity) => {
    const colors = {
      Low: "#4caf50",
      Medium: "#ff9800",
      High: "#f44336",
      Critical: "#d32f2f",
    };
    return colors[severity] || "#757575";
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return "#4caf50";
    if (confidence >= 60) return "#ff9800";
    return "#f44336";
  };

  return (
    <div className="crop-health-container">
      <div className="health-header">
        <h2>🔬 Crop Disease Detection</h2>
        <p>
          Upload an image of your crop to detect diseases and get treatment
          recommendations
        </p>
      </div>

      <div className="health-content">
        {/* Upload Section */}
        <div className="upload-section">
          {!imagePreview ? (
            <label className="upload-area">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                style={{ display: "none" }}
              />
              <Upload size={48} />
              <h3>Upload Crop Image</h3>
              <p>Click to select or drag and drop</p>
              <p className="file-info">PNG, JPG, WEBP up to 10MB</p>
            </label>
          ) : (
            <div className="image-preview-container">
              <div className="image-preview">
                <img src={imagePreview} alt="Selected crop" />
                <button className="clear-button" onClick={handleClear}>
                  <X size={20} />
                </button>
              </div>

              <div className="action-buttons">
                <button
                  className="analyze-button"
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? (
                    <>
                      <Loader className="spinner" size={20} />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Camera size={20} />
                      Analyze Disease
                    </>
                  )}
                </button>

                <button className="change-button" onClick={handleClear}>
                  Change Image
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="error-message">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Results Section */}
        {analysisResult && (
          <div className="results-section">
            <div className="result-header">
              <div className="result-title">
                <h3>{analysisResult.disease_name}</h3>
                {analysisResult.detected ? (
                  <span className="status-badge detected">
                    Disease Detected
                  </span>
                ) : (
                  <span className="status-badge healthy">Healthy</span>
                )}
              </div>

              <div className="result-metrics">
                <div className="metric">
                  <span className="metric-label">Confidence</span>
                  <span
                    className="metric-value"
                    style={{
                      color: getConfidenceColor(analysisResult.confidence),
                    }}
                  >
                    {analysisResult.confidence}%
                  </span>
                </div>

                {analysisResult.severity && (
                  <div className="metric">
                    <span className="metric-label">Severity</span>
                    <span
                      className="metric-value"
                      style={{
                        color: getSeverityColor(analysisResult.severity),
                      }}
                    >
                      {analysisResult.severity}
                    </span>
                  </div>
                )}

                {analysisResult.stage && (
                  <div className="metric">
                    <span className="metric-label">Stage</span>
                    <span className="metric-value">{analysisResult.stage}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            {analysisResult.description && (
              <div className="result-card">
                <h4>📋 Description</h4>
                <p>{analysisResult.description}</p>
              </div>
            )}

            {/* Visual Observations */}
            {analysisResult.visual_observations && (
              <div className="result-card visual-obs">
                <h4>👁️ Visual Observations</h4>
                <div className="observations-grid">
                  {analysisResult.visual_observations.leaf_condition && (
                    <div className="obs-item">
                      <strong>Leaf Condition:</strong>
                      <p>{analysisResult.visual_observations.leaf_condition}</p>
                    </div>
                  )}
                  {analysisResult.visual_observations.discoloration && (
                    <div className="obs-item">
                      <strong>Discoloration:</strong>
                      <p>{analysisResult.visual_observations.discoloration}</p>
                    </div>
                  )}
                  {analysisResult.visual_observations
                    .lesion_characteristics && (
                    <div className="obs-item">
                      <strong>Lesion Characteristics:</strong>
                      <p>
                        {
                          analysisResult.visual_observations
                            .lesion_characteristics
                        }
                      </p>
                    </div>
                  )}
                  {analysisResult.visual_observations.distribution_pattern && (
                    <div className="obs-item">
                      <strong>Distribution Pattern:</strong>
                      <p>
                        {
                          analysisResult.visual_observations
                            .distribution_pattern
                        }
                      </p>
                    </div>
                  )}
                  {analysisResult.visual_observations.texture_changes && (
                    <div className="obs-item">
                      <strong>Texture Changes:</strong>
                      <p>
                        {analysisResult.visual_observations.texture_changes}
                      </p>
                    </div>
                  )}
                  {analysisResult.visual_observations.additional_signs && (
                    <div className="obs-item">
                      <strong>Additional Signs:</strong>
                      <p>
                        {analysisResult.visual_observations.additional_signs}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Symptoms */}
            {analysisResult.symptoms && analysisResult.symptoms.length > 0 && (
              <div className="result-card">
                <h4>🔍 Observed Symptoms</h4>
                <ul className="symptoms-list">
                  {analysisResult.symptoms.map((symptom, idx) => (
                    <li key={idx}>{symptom}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Differential Diagnosis */}
            {analysisResult.differential_diagnosis &&
              analysisResult.differential_diagnosis.length > 0 && (
                <div className="result-card diagnosis">
                  <h4>🔬 Differential Diagnosis</h4>
                  <ul className="diagnosis-list">
                    {analysisResult.differential_diagnosis.map(
                      (diagnosis, idx) => (
                        <li key={idx}>{diagnosis}</li>
                      )
                    )}
                  </ul>
                </div>
              )}

            {/* Stage Analysis */}
            {analysisResult.stage_analysis && (
              <div className="result-card stage">
                <h4>📊 Stage Analysis</h4>
                <div className="stage-details">
                  {analysisResult.stage_analysis.current_stage && (
                    <div className="stage-item">
                      <strong>Current Stage:</strong>
                      <span className="stage-badge">
                        {analysisResult.stage_analysis.current_stage}
                      </span>
                    </div>
                  )}
                  {analysisResult.stage_analysis.progression_indicators && (
                    <div className="stage-item">
                      <strong>Progression Indicators:</strong>
                      <p>
                        {analysisResult.stage_analysis.progression_indicators}
                      </p>
                    </div>
                  )}
                  {analysisResult.stage_analysis.time_estimate && (
                    <div className="stage-item">
                      <strong>Time Estimate:</strong>
                      <p>{analysisResult.stage_analysis.time_estimate}</p>
                    </div>
                  )}
                  {analysisResult.stage_analysis.expected_progression && (
                    <div className="stage-item">
                      <strong>Expected Progression:</strong>
                      <p>
                        {analysisResult.stage_analysis.expected_progression}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Causes */}
            {analysisResult.causes && analysisResult.causes.length > 0 && (
              <div className="result-card causes">
                <h4>🦠 Causes</h4>
                <ul className="causes-list">
                  {analysisResult.causes.map((cause, idx) => (
                    <li key={idx}>{cause}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Treatment */}
            {analysisResult.treatment &&
              analysisResult.treatment.length > 0 && (
                <div className="result-card treatment">
                  <h4>💊 Treatment & Solutions</h4>
                  <ol className="treatment-list">
                    {analysisResult.treatment.map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ol>
                </div>
              )}

            {/* Prevention */}
            {analysisResult.prevention &&
              analysisResult.prevention.length > 0 && (
                <div className="result-card prevention">
                  <h4>🛡️ Prevention Measures</h4>
                  <ul className="prevention-list">
                    {analysisResult.prevention.map((measure, idx) => (
                      <li key={idx}>{measure}</li>
                    ))}
                  </ul>
                </div>
              )}

            {/* Recommendations */}
            {analysisResult.recommendations &&
              analysisResult.recommendations.length > 0 && (
                <div className="result-card recommendations">
                  <h4>💡 Additional Recommendations</h4>
                  <ul className="recommendations-list">
                    {analysisResult.recommendations.map((rec, idx) => (
                      <li key={idx}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}

            {/* Affected Parts */}
            {analysisResult.affected_parts &&
              analysisResult.affected_parts.length > 0 && (
                <div className="result-card">
                  <h4>🌿 Affected Parts</h4>
                  <div className="tags">
                    {analysisResult.affected_parts.map((part, idx) => (
                      <span key={idx} className="tag">
                        {part}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            {/* Spread Risk */}
            {analysisResult.spread_risk && (
              <div className="result-card alert">
                {typeof analysisResult.spread_risk === "object" ? (
                  <>
                    <h4>
                      ⚠️ Spread Risk: {analysisResult.spread_risk.risk_level}
                    </h4>
                    {analysisResult.spread_risk.spread_mechanism && (
                      <div className="risk-item">
                        <strong>Spread Mechanism:</strong>
                        <p>{analysisResult.spread_risk.spread_mechanism}</p>
                      </div>
                    )}
                    {analysisResult.spread_risk.vulnerable_plants && (
                      <div className="risk-item">
                        <strong>Vulnerable Plants:</strong>
                        <p>{analysisResult.spread_risk.vulnerable_plants}</p>
                      </div>
                    )}
                    {analysisResult.spread_risk.containment_measures && (
                      <div className="risk-item">
                        <strong>Containment Measures:</strong>
                        <p>{analysisResult.spread_risk.containment_measures}</p>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <h4>⚠️ Spread Risk: {analysisResult.spread_risk}</h4>
                    <p>
                      {analysisResult.spread_risk === "High" &&
                        "High risk of spreading to other plants. Isolate affected plants immediately and take preventive measures for nearby crops."}
                      {analysisResult.spread_risk === "Medium" &&
                        "Moderate risk of spreading. Monitor nearby plants closely and maintain good hygiene practices."}
                      {analysisResult.spread_risk === "Low" &&
                        "Low risk of spreading. Continue regular monitoring and maintain healthy growing conditions."}
                    </p>
                  </>
                )}
              </div>
            )}

            {/* Image Quality Note */}
            {analysisResult.image_quality_note && (
              <div className="result-card info">
                <h4>📷 Image Quality Note</h4>
                <p>{analysisResult.image_quality_note}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
