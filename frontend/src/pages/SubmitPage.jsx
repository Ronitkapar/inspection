import { useState, useRef } from "react";
import api from "../api";

function SubmitPage() {
  const [formData, setFormData] = useState({
    activity_type: "tree",
    quantity: "",
    species_or_wattage: "",
    age_or_size: "",
  });
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const getLabel = () => {
    switch (formData.activity_type) {
      case "tree": return "Species";
      case "solar": return "Panel Wattage (W)";
      case "compost": return "Weight (kg)";
      default: return "Metadata";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please login to submit activities.");
      setLoading(false);
      return;
    }

    const data = new FormData();
    data.append("activity_type", formData.activity_type);
    data.append("quantity", formData.quantity);
    data.append("species_or_wattage", formData.species_or_wattage);
    data.append("age_or_size", formData.age_or_size);
    data.append("photo", photo);

    try {
      const response = await api.post("/activities/submit", data, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Submission failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Transaction Hash copied!");
  };

  if (loading) {
    return (
      <section className="hero-panel loading-state">
        <div className="loader-botanical">
          <div className="pulse-orb"></div>
          <p className="eyebrow">AI Verification</p>
          <h2>Analyzing biological signature...</h2>
          <p className="hero-copy">We are verifying your environmental contribution against our decentralized carbon standards.</p>
        </div>
      </section>
    );
  }

  if (result) {
    return (
      <section className="hero-panel result-state">
        <p className="eyebrow success-text">Verification Approved</p>
        <h1>Credits Minted</h1>
        
        <div className="credit-display">
          <span className="credit-value">{result.credits_earned}</span>
          <span className="credit-unit">VERDANT CREDITS</span>
        </div>

        <div className="ai-report">
          <h3>AI Auditor Findings:</h3>
          <p className="report-text">"{error?.detail || "Photo analysis confirms consistent biological growth for the claimed tree planting activity. Credits minted to on-chain vault."}"</p>
        </div>

        <div className="tx-meta">
          <span className="tx-label">TX HASH:</span>
          <code className="tx-value">
            {result.tx_hash.slice(0, 20)}...{result.tx_hash.slice(-4)}
          </code>
          <button className="copy-btn" onClick={() => copyToClipboard(result.tx_hash)}>COPY</button>
        </div>

        <button className="reset-btn" onClick={() => { setResult(null); setFormData({ activity_type: "tree", quantity: "", species_or_wattage: "", age_or_size: "" }); setPhoto(null); setPreview(null); }}>
          SUBMIT ANOTHER
        </button>
      </section>
    );
  }

  return (
    <section className="hero-panel form-panel">
      <p className="eyebrow">Contribution Portal</p>
      <h1>Submit your impact.</h1>
      
      <form className="submit-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="field-group">
            <label>Activity Type</label>
            <select name="activity_type" value={formData.activity_type} onChange={handleInputChange}>
              <option value="tree">Tree Planting</option>
              <option value="solar">Solar Energy</option>
              <option value="compost">Composting</option>
            </select>
          </div>

          <div className="field-group">
            <label>Quantity</label>
            <input 
              type="number" 
              name="quantity" 
              placeholder="e.g. 10" 
              value={formData.quantity} 
              onChange={handleInputChange} 
              required 
            />
          </div>

          <div className="field-group">
            <label>{getLabel()}</label>
            <input 
              type="text" 
              name="species_or_wattage" 
              placeholder={`Enter ${getLabel().toLowerCase()}`} 
              value={formData.species_or_wattage} 
              onChange={handleInputChange} 
              required 
            />
          </div>

          <div className="field-group">
            <label>Age / Size</label>
            <input 
              type="text" 
              name="age_or_size" 
              placeholder="e.g. 2 years or large" 
              value={formData.age_or_size} 
              onChange={handleInputChange} 
              required 
            />
          </div>
        </div>

        <div className="photo-upload-section">
          <label className="photo-trigger">
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange} 
              ref={fileInputRef} 
              required 
            />
            {preview ? (
              <div className="preview-container">
                <img src={preview} alt="Preview" />
                <div className="preview-overlay">CHANGE PHOTO</div>
              </div>
            ) : (
              <div className="upload-placeholder">
                <div className="upload-icon">↑</div>
                <span>UPLOAD PHOTO FOR AI VERIFICATION</span>
              </div>
            )}
          </label>
        </div>

        {error && <p className="form-error">{error}</p>}

        <button type="submit" className="submit-action-btn" disabled={loading}>
          {loading ? "PROCESSING..." : "MINT CARBON CREDITS"}
        </button>
      </form>
    </section>
  );
}

export default SubmitPage;
