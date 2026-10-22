import React, { useState, useEffect } from "react";
import ClientApp from "./ClientApp";
import AdminApp from "./AdminApp";
import { ShieldCheck, ArrowLeftRight } from "lucide-react";

export default function App() {
  // Determine mode based on build target, hostname, or local query param
  const [currentView, setCurrentView] = useState(() => {
    // 1. If explicit build target was set during Vite build:
    if (typeof __BUILD_TARGET__ !== "undefined") {
      if (__BUILD_TARGET__ === "admin") return "admin";
      if (__BUILD_TARGET__ === "client") return "client";
    }

    // 2. If running on production subdomains:
    if (typeof window !== "undefined") {
      const host = window.location.hostname.toLowerCase();
      if (host.includes("admin")) return "admin";

      // 3. If local query param override (e.g. localhost:5173?portal=admin):
      const params = new URLSearchParams(window.location.search);
      if (params.get("portal") === "admin") return "admin";
    }

    return "client";
  });

  const isLocalDev = typeof window !== "undefined" && 
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

  return (
    <>
      {currentView === "admin" ? <AdminApp /> : <ClientApp />}

      {/* Floating Developer Mode Switcher (Visible ONLY on localhost for easy testing) */}
      {isLocalDev && (
        <div style={{
          position: "fixed",
          bottom: "16px",
          left: "16px",
          zIndex: 9999,
          background: "rgba(15, 23, 42, 0.9)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          borderRadius: "30px",
          padding: "6px 14px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.3)"
        }}>
          <span style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: 600 }}>
            Local Dev Switch:
          </span>
          <button
            onClick={() => setCurrentView(prev => prev === "admin" ? "client" : "admin")}
            style={{
              background: currentView === "admin" ? "var(--gold-gradient)" : "#334155",
              color: "#ffffff",
              border: "none",
              borderRadius: "20px",
              padding: "4px 10px",
              fontSize: "0.75rem",
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px"
            }}
          >
            <ArrowLeftRight size={12} />
            <span>Switch to {currentView === "admin" ? "Client Website" : "Admin HQ"}</span>
          </button>
        </div>
      )}
    </>
  );
}
