import React, { useState, useEffect } from "react";
import ClientNavbar from "./components/ClientNavbar";
import PricingCalculator from "./components/PricingCalculator";
import PrintableQuotation from "./components/PrintableQuotation";
import TrackReservation from "./components/TrackReservation";

import { 
  getPackages,
  getDishes,
  getAddons,
  getBookings,
  saveBooking
} from "./services/backendService";

import { 
  CATERING_PACKAGES as SEED_PACKAGES,
  DISH_MENU_OPTIONS as SEED_DISHES,
  CATERING_ADDONS as SEED_ADDONS
} from "./data/cateringData";

import { getStoredCompanies, getActiveCompany, saveStoredCompanies } from "./data/tenantSchema";
import { getCompaniesFromFirestore, getCompanyFromFirestore } from "./services/firebase";

import { CheckCircle2 } from "lucide-react";

export default function ClientApp() {
  const [activeTab, setActiveTab] = useState("calculator"); // "calculator", "track"
  const [activeQuotation, setActiveQuotation] = useState(null);
  const [packages, setPackages] = useState(SEED_PACKAGES);
  const [dishes, setDishes] = useState(SEED_DISHES);
  const [addons, setAddons] = useState(SEED_ADDONS);
  const [existingBookings, setExistingBookings] = useState([]);

  // Resolve which catering company this public booking site represents
  const [activeCompany, setActiveCompany] = useState(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const catererSlug = urlParams.get("caterer");
      if (catererSlug) {
        const list = getStoredCompanies();
        const found = list.find(c => c.id === catererSlug);
        if (found) return found;
      }
    } catch (e) {}
    return getActiveCompany();
  });

  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    loadClientData();
    syncCompanyFromCloud();
  }, []);

  useEffect(() => {
    const brandName = activeCompany?.name || "PLATABLE CATERING SERVICES";
    document.title = `${brandName} | Online Catering Reservation`;
  }, [activeCompany]);

  const syncCompanyFromCloud = async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const catererSlug = urlParams.get("caterer");
      
      const cloudCompanies = await getCompaniesFromFirestore();
      if (cloudCompanies && cloudCompanies.length > 0) {
        saveStoredCompanies(cloudCompanies);
        let matched = null;
        if (catererSlug) {
          matched = cloudCompanies.find(c => c.id === catererSlug);
        }
        if (!matched) {
          // Default to main_catering or the first company
          matched = cloudCompanies.find(c => c.id === "main_catering") || cloudCompanies[0];
        }
        if (matched) {
          setActiveCompany(matched);
        }
      }
    } catch (err) {
      console.warn("Could not sync company from cloud Firestore:", err);
    }
  };

  const loadClientData = async () => {
    try {
      const [pkgs, dishData, addonData, bookingList] = await Promise.all([
        getPackages(),
        getDishes(),
        getAddons(),
        getBookings(activeCompany?.id).catch(() => [])
      ]);
      if (pkgs && pkgs.length > 0) setPackages(pkgs);
      if (dishData && Object.keys(dishData).length > 0) setDishes(dishData);
      if (addonData && addonData.length > 0) setAddons(addonData);
      if (bookingList && Array.isArray(bookingList)) setExistingBookings(bookingList);
    } catch (err) {
      console.error("Failed to load catering data:", err);
    }
  };

  const showToast = (message, type = "success") => {
    setToastMessage({ message, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleGenerateQuote = (quoteData) => {
    setActiveQuotation(quoteData);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSaveQuote = async (quoteData) => {
    setIsSaving(true);
    try {
      const payload = {
        ...quoteData,
        companyId: activeCompany?.id || "main_catering",
        companyName: activeCompany?.name || "Catering Services PH"
      };
      const res = await saveBooking(payload);
      showToast(`Reservation ${quoteData.id} submitted for ${activeCompany?.name || "our team"}!`);
      return res;
    } catch (e) {
      showToast("Error submitting reservation: " + e.message, "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="app-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          zIndex: 999,
          background: toastMessage.type === "error" ? "#fef2f2" : "#ecfdf5",
          border: `1px solid ${toastMessage.type === "error" ? "#fecaca" : "#a7f3d0"}`,
          color: toastMessage.type === "error" ? "#991b1b" : "#065f46",
          padding: "0.85rem 1.25rem",
          borderRadius: "8px",
          boxShadow: "var(--shadow-lg)",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          fontSize: "0.88rem",
          fontWeight: 600,
          animation: "fadeIn 0.3s ease"
        }}>
          <CheckCircle2 size={18} color={toastMessage.type === "error" ? "#dc2626" : "#059669"} />
          <span>{toastMessage.message}</span>
        </div>
      )}

      {/* Header & Navigation */}
      <ClientNavbar
        activeCompany={activeCompany}
        activeTab={activeQuotation ? "calculator" : activeTab}
        setActiveTab={(tab) => {
          setActiveQuotation(null);
          setActiveTab(tab);
        }}
        onBookNow={() => {
          setActiveQuotation(null);
          setActiveTab("calculator");
          window.scrollTo({ top: 400, behavior: "smooth" });
        }}
      />

      {/* Main Content */}
      <main className="main-content">
        {activeQuotation && (
          /* View Formal Printable Quotation */
          <PrintableQuotation
            quotation={activeQuotation}
            catererInfo={activeCompany}
            onBack={() => {
              setActiveQuotation(null);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        )}

        {/* Pricing & Booking Calculator - kept mounted to preserve all inputs & state */}
        <div style={{ display: (!activeQuotation && activeTab === "calculator") ? "block" : "none" }}>
          <div className="page-hero no-print">
            <div className="hero-text">
              <h1>{activeCompany?.name || "Online Catering Quotation & Booking Portal"}</h1>
              <p>
                {activeCompany?.tagline || "Craft your feast with authentic Filipino viands, pax pricing, live carving stations, delivery logistics, and transparent 50% reservation downpayment scheduling."}
              </p>
            </div>
          </div>

          <PricingCalculator
            packagesList={packages}
            dishesMenu={dishes}
            availableAddons={addons}
            existingBookings={existingBookings}
            onGenerateQuote={handleGenerateQuote}
            onSaveQuote={handleSaveQuote}
            isSaving={isSaving}
          />
        </div>

        {/* Tracking Tab */}
        {!activeQuotation && activeTab === "track" && (
          <TrackReservation
            activeCompany={activeCompany}
            onViewBooking={(booking) => setActiveQuotation(booking)}
            onNewBooking={() => {
              setActiveQuotation(null);
              setActiveTab("calculator");
            }}
          />
        )}
      </main>

      {/* Dynamic Multi-Tenant Footer */}
      <footer className="no-print" style={{ borderTop: "1px solid var(--border-subtle)", padding: "2.5rem 1rem", marginTop: "3rem", background: "var(--surface)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "1rem" }}>
              {activeCompany?.name || "Catering Services PH"}
            </div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "3px" }}>
              {activeCompany?.tagline || "Premier Philippine Catering & Events Management"} • {activeCompany?.address || "Metro Manila, Philippines"}
            </div>
          </div>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
            © {new Date().getFullYear()} {activeCompany?.name || "Catering Services"}. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
