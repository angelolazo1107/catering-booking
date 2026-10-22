import React, { useState } from "react";
import { 
  X, 
  Database, 
  CheckCircle2, 
  ExternalLink, 
  Save, 
  RotateCcw, 
  AlertCircle 
} from "lucide-react";
import { 
  getStoredFirebaseConfig, 
  saveStoredFirebaseConfig, 
  getDatabaseStatus 
} from "../services/firebase";

export default function FirebaseModal({ isOpen, onClose, onConfigUpdated }) {
  if (!isOpen) return null;

  const currentConfig = getStoredFirebaseConfig() || {};
  const status = getDatabaseStatus();

  const [jsonInput, setJsonInput] = useState("");
  const [formData, setFormData] = useState({
    apiKey: currentConfig.apiKey || "",
    authDomain: currentConfig.authDomain || "",
    projectId: currentConfig.projectId || "",
    storageBucket: currentConfig.storageBucket || "",
    messagingSenderId: currentConfig.messagingSenderId || "",
    appId: currentConfig.appId || ""
  });
  const [msg, setMsg] = useState(null);

  const handleJsonPaste = (e) => {
    const text = e.target.value;
    setJsonInput(text);

    // Attempt to extract firebaseConfig object
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        // clean up JS object to valid JSON if needed
        const cleaned = jsonMatch[0]
          .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":')
          .replace(/'/g, '"')
          .replace(/,\s*}/g, '}');
        const parsed = JSON.parse(cleaned);

        setFormData(prev => ({
          ...prev,
          apiKey: parsed.apiKey || prev.apiKey,
          authDomain: parsed.authDomain || prev.authDomain,
          projectId: parsed.projectId || prev.projectId,
          storageBucket: parsed.storageBucket || prev.storageBucket,
          messagingSenderId: parsed.messagingSenderId || prev.messagingSenderId,
          appId: parsed.appId || prev.appId
        }));
        setMsg({ type: "success", text: "Firebase config parsed and auto-filled!" });
      }
    } catch (err) {
      // Manual fill is fine
    }
  };

  const handleSave = () => {
    if (!formData.apiKey || !formData.projectId) {
      setMsg({ type: "error", text: "apiKey and projectId are required to connect to Firebase." });
      return;
    }

    saveStoredFirebaseConfig(formData);
    setMsg({ type: "success", text: "Firebase configuration saved! Reloading..." });
    setTimeout(() => {
      window.location.reload();
    }, 800);
  };

  const handleResetDemo = () => {
    saveStoredFirebaseConfig(null);
    setMsg({ type: "info", text: "Reset to Local Storage Demo mode. Reloading..." });
    setTimeout(() => {
      window.location.reload();
    }, 800);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Database size={22} color="var(--gold-600)" />
            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)" }}>
              Google Firebase Firestore Database Setup
            </h3>
          </div>
          <button 
            style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        {/* Current status pill */}
        <div style={{ 
          background: status.isLive ? "var(--emerald-50)" : "var(--gold-50)", 
          border: `1px solid ${status.isLive ? "var(--emerald-100)" : "var(--gold-200)"}`,
          borderRadius: "8px", 
          padding: "0.75rem 1rem", 
          marginBottom: "1.25rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Current Operating Mode:</div>
            <div style={{ fontWeight: 700, color: status.isLive ? "var(--emerald-600)" : "var(--gold-600)" }}>
              {status.mode}
            </div>
            {status.projectId && (
              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Project ID: {status.projectId}</div>
            )}
          </div>
          {status.hasConfig && (
            <button 
              className="btn-secondary" 
              style={{ fontSize: "0.75rem", padding: "0.35rem 0.7rem" }}
              onClick={handleResetDemo}
            >
              <RotateCcw size={13} />
              <span>Switch to Demo Mode</span>
            </button>
          )}
        </div>

        {msg && (
          <div style={{ 
            background: msg.type === "error" ? "var(--red-50)" : "var(--emerald-50)",
            border: `1px solid ${msg.type === "error" ? "var(--red-100)" : "var(--emerald-100)"}`,
            color: msg.type === "error" ? "var(--red-600)" : "var(--emerald-600)",
            padding: "0.6rem 0.8rem",
            borderRadius: "6px",
            fontSize: "0.82rem",
            marginBottom: "1rem"
          }}>
            {msg.text}
          </div>
        )}

        <div style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginBottom: "1rem", lineHeight: 1.5 }}>
          You can run this demo <strong>100% offline</strong> using Local Storage, or connect it to your live <strong>Google Firebase Project</strong> for real-time cloud sync.
        </div>

        {/* Quick Paste Snippet */}
        <div className="form-group" style={{ marginBottom: "1.25rem" }}>
          <label className="form-label">
            <span>Quick Paste Firebase Web Config</span>
            <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Paste from Firebase Console</span>
          </label>
          <textarea
            className="form-textarea"
            rows={3}
            placeholder='const firebaseConfig = { apiKey: "...", projectId: "..." };'
            value={jsonInput}
            onChange={handleJsonPaste}
            style={{ fontSize: "0.78rem", fontFamily: "monospace" }}
          />
        </div>

        {/* Form fields */}
        <div className="form-grid-2" style={{ gap: "0.75rem" }}>
          <div className="form-group">
            <label className="form-label">API Key</label>
            <input
              type="text"
              className="form-input"
              value={formData.apiKey}
              onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
              placeholder="AIzaSy..."
            />
          </div>

          <div className="form-group">
            <label className="form-label">Project ID</label>
            <input
              type="text"
              className="form-input"
              value={formData.projectId}
              onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
              placeholder="my-catering-app"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Auth Domain</label>
            <input
              type="text"
              className="form-input"
              value={formData.authDomain}
              onChange={(e) => setFormData({ ...formData, authDomain: e.target.value })}
              placeholder="my-catering-app.firebaseapp.com"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Storage Bucket</label>
            <input
              type="text"
              className="form-input"
              value={formData.storageBucket}
              onChange={(e) => setFormData({ ...formData, storageBucket: e.target.value })}
              placeholder="my-catering-app.appspot.com"
            />
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1.5rem" }}>
          <a
            href="https://console.firebase.google.com"
            target="_blank"
            rel="noreferrer"
            style={{ fontSize: "0.78rem", color: "var(--gold-600)", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px", textDecoration: "none" }}
          >
            <span>Open Firebase Console</span>
            <ExternalLink size={13} />
          </a>

          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button className="btn-primary" onClick={handleSave}>
              <Save size={16} />
              <span>Save & Connect</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
