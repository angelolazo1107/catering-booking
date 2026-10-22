import React, { useState } from "react";
import { DollarSign, CheckCircle2, ShieldAlert, Sparkles, Copy, Check, FileCode, Layers } from "lucide-react";

export default function ClientPricingGuide() {
  const [copied, setCopied] = useState(false);
  const [clientType, setClientType] = useState("sme"); // "home", "sme", "large"
  const [includeSms, setIncludeSms] = useState(false);
  const [includeOnlinePay, setIncludeOnlinePay] = useState(false);
  const [includeInventory, setIncludeInventory] = useState(false);
  const [timelineWeeks, setTimelineWeeks] = useState(3);

  // Compute recommended client fee in PHP
  let baseFee = 35000;
  if (clientType === "sme") baseFee = 55000;
  if (clientType === "large") baseFee = 95000;

  if (includeSms) baseFee += 8000;
  if (includeOnlinePay) baseFee += 15000;
  if (includeInventory) baseFee += 18000;

  const downpayment = Math.round(baseFee * 0.3);
  const milestone = Math.round(baseFee * 0.4);
  const finalBalance = baseFee - downpayment - milestone;

  const proposalText = `PROPOSAL & QUOTATION FOR WEB APPLICATION DEVELOPMENT
Project: Philippine Catering Booking & Quotation Management System
Client: [Client / Catering Business Name]
Prepared By: [Your Name / Agency]
Date: ${new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })}

1. PROJECT OBJECTIVES
To develop a high-performance web system allowing your catering team to instantly generate accurate Philippine Peso quotations, manage bookings/events, and deliver print-ready quotations with complete dish breakdowns and automated tax/service charge calculations.

2. SCOPE OF DELIVERABLES
- Interactive Philippine Catering Quotation Generator (Per-pax rates, viand customizer, Whole Lechon & station add-ons).
- Automatic Computations (10% Service Charge, Non-VAT Quotation, 50% reservation downpayment, balance scheduling).
- Formal PDF / Printable Quotation Layout with your business letterhead, TIN, and bank/GCash payment details.
- Cloud Database via Google Firebase for fast, 99.9% uptime real-time quotation & event tracking.
- Admin Dashboard to track event statuses (Draft, Sent, Confirmed, Completed).
${includeOnlinePay ? "- Payment Gateway Integration (GCash / Maya / Card payments via PayMongo or Maya)\n" : ""}${includeSms ? "- SMS Gateway Integration (Automated SMS confirmation to client via Semaphore)\n" : ""}${includeInventory ? "- Ingredient & Logistics Pax Estimator Module\n" : ""}- Deployment to your custom domain (.com or .ph) with SSL security.
- 30-Day Post-Launch Technical Support & Warranty.

3. INVESTMENT & PRICING
Total Contract Price: ₱${baseFee.toLocaleString()} PHP
Estimated Delivery Timeline: ${timelineWeeks} Weeks

4. PAYMENT TERMS & MILESTONES
- 30% Mobilization Downpayment: ₱${downpayment.toLocaleString()} PHP (Upon contract signing)
- 40% Milestone Demo: ₱${milestone.toLocaleString()} PHP (Upon functional prototype approval)
- 30% Final Turnover & Launch: ₱${finalBalance.toLocaleString()} PHP (Upon live deployment & training)`;

  const handleCopy = () => {
    navigator.clipboard.writeText(proposalText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
      <div className="card-section" style={{ border: "1px solid var(--border-subtle)" }}>
        <div className="section-header">
          <div>
            <span className="pkg-badge" style={{ position: "static", display: "inline-block", marginBottom: "0.5rem" }}>
              Freelance & Agency Costing Tool
            </span>
            <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.75rem", color: "var(--text-primary)" }}>
              How Much to Charge Your Client (Philippine Market Guide)
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "0.3rem" }}>
              Use this calculator to determine a profitable, competitive quote for developing this Catering Booking & Quotation System.
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--gold-600)", fontWeight: 700 }}>
              Recommended Client Fee
            </div>
            <div style={{ fontFamily: "var(--font-serif)", fontSize: "2.3rem", fontWeight: 800, color: "var(--gold-600)" }}>
              ₱{baseFee.toLocaleString()} <span style={{ fontSize: "1rem", color: "var(--text-muted)" }}>PHP</span>
            </div>
          </div>
        </div>

        <div className="form-grid-3" style={{ marginTop: "1.5rem" }}>
          <div className="form-group">
            <label className="form-label">Client Scale / Target Tier</label>
            <select 
              className="form-select"
              value={clientType}
              onChange={(e) => setClientType(e.target.value)}
            >
              <option value="home">Starter / Solo Caterer (₱25k - ₱35k)</option>
              <option value="sme">Established Local Caterer (₱45k - ₱65k) [Recommended]</option>
              <option value="large">Premier Catering / Multi-Branch (₱85k - ₱140k+)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Estimated Delivery Timeline</label>
            <select 
              className="form-select"
              value={timelineWeeks}
              onChange={(e) => setTimelineWeeks(Number(e.target.value))}
            >
              <option value={2}>2 Weeks (Rapid Delivery)</option>
              <option value={3}>3 Weeks (Standard Pace)</option>
              <option value={4}>4 Weeks (Includes Custom Reviews)</option>
              <option value={6}>6 Weeks (Extended Multi-Feature)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Hosting & Cloud Strategy</label>
            <div style={{ background: "#f8fafc", padding: "0.75rem", borderRadius: "8px", fontSize: "0.8rem", color: "var(--text-secondary)", border: "1px solid var(--border-subtle)" }}>
              Google Firebase Free Spark Tier (0 PHP/mo initially) + Free Vercel/Netlify hosting.
            </div>
          </div>
        </div>

        <div style={{ marginTop: "1.5rem", borderTop: "1px solid var(--border-subtle)", paddingTop: "1rem" }}>
          <label className="form-label" style={{ marginBottom: "0.75rem" }}>Scope Add-ons & Upsell Features</label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "0.85rem" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "0.75rem", background: "#ffffff", padding: "0.75rem 1rem", borderRadius: "8px", border: "1px solid var(--border-subtle)", cursor: "pointer", boxShadow: "var(--shadow-xs)" }}>
              <input 
                type="checkbox" 
                checked={includeOnlinePay} 
                onChange={(e) => setIncludeOnlinePay(e.target.checked)}
                style={{ accentColor: "var(--gold-500)", width: "18px", height: "18px" }}
              />
              <div>
                <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-primary)" }}>Online GCash / Maya Payments (+₱15,000)</div>
                <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>PayMongo or Maya API integration for instant online checkout</div>
              </div>
            </label>

            <label style={{ display: "flex", alignItems: "center", gap: "0.75rem", background: "#ffffff", padding: "0.75rem 1rem", borderRadius: "8px", border: "1px solid var(--border-subtle)", cursor: "pointer", boxShadow: "var(--shadow-xs)" }}>
              <input 
                type="checkbox" 
                checked={includeSms} 
                onChange={(e) => setIncludeSms(e.target.checked)}
                style={{ accentColor: "var(--gold-500)", width: "18px", height: "18px" }}
              />
              <div>
                <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-primary)" }}>Automated SMS Confirmations (+₱8,000)</div>
                <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Sends instant SMS quote & booking confirmation via Semaphore PH</div>
              </div>
            </label>

            <label style={{ display: "flex", alignItems: "center", gap: "0.75rem", background: "#ffffff", padding: "0.75rem 1rem", borderRadius: "8px", border: "1px solid var(--border-subtle)", cursor: "pointer", boxShadow: "var(--shadow-xs)" }}>
              <input 
                type="checkbox" 
                checked={includeInventory} 
                onChange={(e) => setIncludeInventory(e.target.checked)}
                style={{ accentColor: "var(--gold-500)", width: "18px", height: "18px" }}
              />
              <div>
                <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-primary)" }}>Pax & Ingredient Estimator (+₱18,000)</div>
                <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Calculates raw kilograms of meat/rice needed for the kitchen staff</div>
              </div>
            </label>
          </div>
        </div>

        {/* Milestone Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginTop: "1.5rem" }}>
          <div style={{ background: "#fffbeb", border: "1px solid #fde68a", padding: "1rem", borderRadius: "8px", textAlign: "center" }}>
            <div style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--gold-600)", fontWeight: 700 }}>1. Downpayment (30%)</div>
            <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--text-primary)", margin: "0.3rem 0" }}>₱{downpayment.toLocaleString()}</div>
            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Due upon contract signing to mobilize development</div>
          </div>
          <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", padding: "1rem", borderRadius: "8px", textAlign: "center" }}>
            <div style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "#1d4ed8", fontWeight: 700 }}>2. Demo Milestone (40%)</div>
            <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--text-primary)", margin: "0.3rem 0" }}>₱{milestone.toLocaleString()}</div>
            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Due after presenting the working Quotation & Booking demo</div>
          </div>
          <div style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", padding: "1rem", borderRadius: "8px", textAlign: "center" }}>
            <div style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "#047857", fontWeight: 700 }}>3. Final Turnover (30%)</div>
            <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--text-primary)", margin: "0.3rem 0" }}>₱{finalBalance.toLocaleString()}</div>
            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Due upon live domain deployment and staff training</div>
          </div>
        </div>
      </div>

      {/* Proposal Generator & Copier */}
      <div className="card-section">
        <div className="section-header">
          <div className="section-title">
            <FileCode size={20} color="var(--gold-600)" />
            <span>Ready-to-Send Client Proposal & Scope Document</span>
          </div>
          <button 
            className="btn-primary" 
            onClick={handleCopy}
            style={{ padding: "0.55rem 1rem", fontSize: "0.85rem" }}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            <span>{copied ? "Copied to Clipboard!" : "Copy Proposal Text"}</span>
          </button>
        </div>
        <textarea
          readOnly
          value={proposalText}
          className="form-textarea"
          rows={16}
          style={{ width: "100%", fontFamily: "monospace", fontSize: "0.82rem", lineHeight: "1.6", background: "#f8fafc", color: "var(--text-primary)", border: "1px solid #cbd5e1" }}
        />
      </div>
    </div>
  );
}
