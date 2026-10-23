import React from "react";
import { UtensilsCrossed, Database, Calculator, FileText, DollarSign, Sparkles } from "lucide-react";

export default function Navbar({ activeTab, setActiveTab, dbStatus, onOpenFirebaseModal }) {
  return (
    <header className="app-header">
      <div className="header-inner">
        <div className="brand-container">
          <div className="brand-icon-box">
            <UtensilsCrossed size={24} />
          </div>
          <div className="brand-title">
            <div>{activeCompany?.name || "Catering & Events PH"}</div>
            <div className="brand-tagline">{activeCompany?.tagline || "Philippine Catering & Events Management"}</div>
          </div>
        </div>

        <nav className="nav-tabs">
          <button
            className={`nav-tab-btn ${activeTab === "calculator" ? "active" : ""}`}
            onClick={() => setActiveTab("calculator")}
          >
            <Calculator size={17} />
            <span>Quotation Calculator</span>
          </button>
          <button
            className={`nav-tab-btn ${activeTab === "quotes" ? "active" : ""}`}
            onClick={() => setActiveTab("quotes")}
          >
            <FileText size={17} />
            <span>Quotations & Bookings</span>
          </button>
          <button
            className={`nav-tab-btn ${activeTab === "admin" ? "active" : ""}`}
            onClick={() => setActiveTab("admin")}
          >
            <Sparkles size={17} />
            <span>Package & Menu Backend</span>
          </button>
        </nav>

        <div>
          <button 
            className={`db-pill ${dbStatus.isLive ? "live" : "demo"}`}
            onClick={onOpenFirebaseModal}
            title="Click to configure Google Firebase connection"
          >
            <div className={`pulse-dot ${dbStatus.isLive ? "live" : "demo"}`} />
            <Database size={14} />
            <span>{dbStatus.isLive ? "Firebase: Live" : "Database: Demo Mode"}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
