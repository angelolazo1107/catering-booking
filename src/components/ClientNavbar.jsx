import React from "react";
import { UtensilsCrossed, PhoneCall, CalendarCheck, Search, Sparkles } from "lucide-react";
import { getActiveCompany } from "../data/tenantSchema";

export default function ClientNavbar({ activeCompany: propCompany, activeTab, setActiveTab, onBookNow }) {
  const activeCompany = propCompany || getActiveCompany();

  return (
    <header className="app-header">
      <div className="header-inner">
        <div className="brand-container" style={{ cursor: "pointer" }} onClick={() => setActiveTab("calculator")}>
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
            <Sparkles size={17} />
            <span>Packages & Booking</span>
          </button>
          <button
            className={`nav-tab-btn ${activeTab === "track" ? "active" : ""}`}
            onClick={() => setActiveTab("track")}
          >
            <Search size={17} />
            <span>Track Reservation</span>
          </button>
        </nav>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <a 
            href={`tel:${(activeCompany?.phone || "0917-000-0000").split("/")[0].trim()}`}
            className="db-pill live"
            style={{ textDecoration: "none", color: "var(--emerald-700)" }}
            title="Call Catering Inquiries"
          >
            <PhoneCall size={14} />
            <span>Inquiries: {activeCompany?.phone || "0917-888-9922"}</span>
          </a>

          <button 
            className="btn-primary" 
            style={{ padding: "0.45rem 1rem", fontSize: "0.82rem" }}
            onClick={onBookNow}
          >
            <CalendarCheck size={15} />
            <span>Book an Event</span>
          </button>
        </div>
      </div>
    </header>
  );
}
