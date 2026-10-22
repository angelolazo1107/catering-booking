import React, { useState, useEffect } from "react";
import BookingsDashboard from "./components/BookingsDashboard";
import BookingCalendarView from "./components/BookingCalendarView";
import AdminPackageManager from "./components/AdminPackageManager";
import PrintableQuotation from "./components/PrintableQuotation";
import ClientPricingGuide from "./components/ClientPricingGuide";
import KitchenGroceryEstimator from "./components/KitchenGroceryEstimator";
import StaffLogisticsCalculator from "./components/StaffLogisticsCalculator";
import CompanySettings from "./components/CompanySettings";
import IngressEgressManager from "./components/IngressEgressManager";
import BookingPaymentModal from "./components/BookingPaymentModal";
import confetti from "canvas-confetti";

import { 
  checkBackendStatus,
  getPackages,
  savePackage,
  deletePackage,
  getDishes,
  saveDish,
  deleteDish,
  getAddons,
  saveAddon,
  deleteAddon,
  getBookings,
  saveBooking,
  updateBookingStatus,
  updateBookingInventory,
  deleteBooking
} from "./services/backendService";

import { 
  CATERING_PACKAGES as SEED_PACKAGES,
  DISH_MENU_OPTIONS as SEED_DISHES,
  CATERING_ADDONS as SEED_ADDONS
} from "./data/cateringData";

import { 
  getStoredCompanies,
  saveStoredCompanies,
  getActiveCompany,
  setActiveCompanyId 
} from "./data/tenantSchema";
import { getCompaniesFromFirestore } from "./services/firebase";
import { 
  formatBookingReference, 
  getConfirmedBookingsCountForDate, 
  MAX_CONFIRMED_BOOKINGS_PER_DAY 
} from "./utils/bookingUtils";

import { 
  ShieldCheck, 
  Lock, 
  LogOut, 
  FileText, 
  Database, 
  Package, 
  DollarSign, 
  CheckCircle2, 
  UtensilsCrossed,
  ShoppingCart,
  Users,
  Building2,
  Menu,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Plus,
  Check,
  ClipboardCheck,
  CalendarDays
} from "lucide-react";

const ADMIN_STORAGE_KEY = "caterflow_admin_auth";

export default function AdminApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem(ADMIN_STORAGE_KEY) === "true";
  });
  const [userRole, setUserRole] = useState(() => {
    return localStorage.getItem("caterflow_admin_role") || "super_admin";
  });

  const [companies, setCompanies] = useState(() => getStoredCompanies());
  const [activeCompany, setActiveCompany] = useState(() => {
    const lockedId = localStorage.getItem("caterflow_locked_company_id");
    if (lockedId) {
      const list = getStoredCompanies();
      const found = list.find(c => c.id === lockedId);
      if (found) return found;
    }
    return getActiveCompany();
  });
  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    return localStorage.getItem("caterflow_admin_sidebar") !== "collapsed";
  });

  const [loginForm, setLoginForm] = useState({ username: "admin", password: "" });
  const [loginError, setLoginError] = useState("");

  const [activeTab, setActiveTab] = useState("bookings"); // "bookings", "calendar", "packages", "pricing-guide"
  const [activeQuotation, setActiveQuotation] = useState(null);
  const [selectedIngressBooking, setSelectedIngressBooking] = useState(null);
  const [packageManagerSubTab, setPackageManagerSubTab] = useState("packages");
  const [prefilledBookingDate, setPrefilledBookingDate] = useState(null);
  const [quotations, setQuotations] = useState([]);
  const [packages, setPackages] = useState(SEED_PACKAGES);
  const [dishes, setDishes] = useState(SEED_DISHES);
  const [addons, setAddons] = useState(SEED_ADDONS);

  const [backendStatus, setBackendStatus] = useState({
    isApiServer: false,
    mode: "Cloud Firestore Live",
    firebaseStatus: { isLive: true }
  });

  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadAllAdminData(activeCompany, userRole);
    }
  }, [isAuthenticated, activeCompany?.id, userRole]);

  const loadAllAdminData = async (targetCompany = activeCompany, role = userRole) => {
    try {
      const companyFilterId = role === "company_admin" ? targetCompany?.id : null;
      const [status, pkgs, dishData, addonData, bookingData, cloudCompanies] = await Promise.all([
        checkBackendStatus(),
        getPackages(),
        getDishes(),
        getAddons(),
        getBookings(companyFilterId),
        getCompaniesFromFirestore().catch(() => [])
      ]);

      setBackendStatus(status);
      if (pkgs && pkgs.length > 0) setPackages(pkgs);
      if (dishData && Object.keys(dishData).length > 0) setDishes(dishData);
      if (addonData && addonData.length > 0) setAddons(addonData);
      if (bookingData && Array.isArray(bookingData)) setQuotations(bookingData);

      if (cloudCompanies && cloudCompanies.length > 0) {
        saveStoredCompanies(cloudCompanies);
        setCompanies(cloudCompanies);
        const currentTarget = cloudCompanies.find(c => c.id === targetCompany?.id) || cloudCompanies[0];
        if (currentTarget) setActiveCompany(currentTarget);
      }
    } catch (err) {
      console.error("Failed to load admin data:", err);
    }
  };

  const showToast = (message, type = "success") => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const refreshCompanies = () => {
    const list = getStoredCompanies();
    setCompanies(list);
    setActiveCompany(getActiveCompany());
  };

  const handleSelectCompany = (comp) => {
    if (userRole === "company_admin") return; // locked to tenant
    setActiveCompanyId(comp.id);
    setActiveCompany(comp);
    setIsCompanyDropdownOpen(false);
    showToast(`Switched active catering company to "${comp.name}"`);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => {
      const next = !prev;
      localStorage.setItem("caterflow_admin_sidebar", next ? "open" : "collapsed");
      return next;
    });
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    const entered = loginForm.password.trim();
    const allCompanies = getStoredCompanies();

    // 1. Check SuperAdmin Master Access
    if (entered === "admin2026" || entered === "caterflow2026" || entered === "admin") {
      setIsAuthenticated(true);
      setUserRole("super_admin");
      localStorage.setItem(ADMIN_STORAGE_KEY, "true");
      localStorage.setItem("caterflow_admin_role", "super_admin");
      localStorage.removeItem("caterflow_locked_company_id");
      setLoginError("");
      showToast("Signed in as Platform SuperAdmin. Multi-tenant switcher enabled.");
      return;
    }

    // 2. Check Company-Specific Passcode (Strict Tenant Lock)
    const matchedCompany = allCompanies.find(c => 
      c.adminPasscode && c.adminPasscode.toLowerCase() === entered.toLowerCase()
    );

    if (matchedCompany) {
      setIsAuthenticated(true);
      setUserRole("company_admin");
      setActiveCompany(matchedCompany);
      setActiveCompanyId(matchedCompany.id);
      localStorage.setItem(ADMIN_STORAGE_KEY, "true");
      localStorage.setItem("caterflow_admin_role", "company_admin");
      localStorage.setItem("caterflow_locked_company_id", matchedCompany.id);
      setLoginError("");
      showToast(`Welcome! Logged in as administrator for "${matchedCompany.name}".`);
      return;
    }

    setLoginError("Invalid passcode. Enter Master SuperAdmin key ('admin2026') or your Company Passcode.");
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole("company_admin");
    localStorage.removeItem(ADMIN_STORAGE_KEY);
    localStorage.removeItem("caterflow_admin_role");
    localStorage.removeItem("caterflow_locked_company_id");
  };

  const [paymentModalState, setPaymentModalState] = useState({
    isOpen: false,
    mode: "deposit",
    booking: null,
    customBookingRef: null
  });

  const handleOpenPaymentModal = (booking, mode = "deposit", customBookingRef = null) => {
    setPaymentModalState({
      isOpen: true,
      mode,
      booking,
      customBookingRef
    });
  };

  const handleUpdateStatus = async (id, newStatus, customBookingRef = null, paymentData = null) => {
    const booking = quotations.find(q => q.id === id) || (activeQuotation?.id === id ? activeQuotation : null);
    if (!booking) return false;

    if (booking?.status === "Completed") {
      alert(`Booking ${id} is marked as Completed and locked against any status changes.`);
      return false;
    }

    // INTERCEPT 1: If setting to "Confirmed" without paymentData, prompt for deposit details popup!
    if (newStatus === "Confirmed" && !paymentData) {
      if (booking?.eventDate) {
        const confirmedCount = getConfirmedBookingsCountForDate(quotations, booking.eventDate, id);
        if (confirmedCount >= MAX_CONFIRMED_BOOKINGS_PER_DAY) {
          const proceed = window.confirm(
            `⚠️ Daily Capacity Warning: There are already ${confirmedCount} confirmed bookings on ${booking.eventDate}. The maximum capacity is 3 bookings per day.\n\nDo you want to override and confirm anyway?`
          );
          if (!proceed) return false;
        }
      }
      handleOpenPaymentModal(booking, "deposit", customBookingRef);
      return false; // Wait for modal
    }

    // INTERCEPT 2: If setting to "Ongoing" without paymentData, prompt for ongoing payment verification popup!
    if (newStatus === "Ongoing" && !paymentData) {
      handleOpenPaymentModal(booking, "ongoing", customBookingRef);
      return false; // Wait for modal
    }

    // If changing to Confirmed, check daily capacity of 3
    if (newStatus === "Confirmed" && booking?.eventDate) {
      const confirmedCount = getConfirmedBookingsCountForDate(quotations, booking.eventDate, id);
      if (confirmedCount >= MAX_CONFIRMED_BOOKINGS_PER_DAY) {
        const proceed = window.confirm(
          `⚠️ Daily Capacity Warning: There are already ${confirmedCount} confirmed bookings on ${booking.eventDate}. The maximum capacity is 3 bookings per day.\n\nDo you want to override and confirm anyway?`
        );
        if (!proceed) return false;
      }
    }

    let bookingRef = customBookingRef || booking?.bookingReference;
    if ((newStatus === "Confirmed" || newStatus === "Ongoing") && !bookingRef && booking) {
      bookingRef = formatBookingReference(booking.eventDate, booking.eventTime, booking.clientName);
    }

    const payloadExtra = paymentData || {};
    await updateBookingStatus(id, newStatus, bookingRef, payloadExtra);
    const targetCompanyId = userRole === "company_admin" ? activeCompany?.id : null;
    const updatedBookings = await getBookings(targetCompanyId);
    setQuotations(updatedBookings);
    
    let msg = "";
    if (newStatus === "Confirmed") {
      const dpAmt = payloadExtra.depositAmount ? `₱${Number(payloadExtra.depositAmount).toLocaleString()}` : "";
      const dpMethod = payloadExtra.depositPaymentMethod || "Cash";
      msg = `Booking confirmed! ${dpAmt ? `Deposit of ${dpAmt} via ${dpMethod} recorded. ` : ""}Ref: ${bookingRef || id}`;
      confetti({ particleCount: 80, spread: 80, origin: { y: 0.6 } });
    } else if (newStatus === "Ongoing") {
      const payStatus = payloadExtra.isFullyPaid ? "Fully Paid" : "Partial Balance";
      const payMethod = payloadExtra.finalPaymentMethod || "Cash";
      msg = `Event set to Ongoing! Verified as ${payStatus} (${payMethod}).`;
      confetti({ particleCount: 80, spread: 80, origin: { y: 0.6 } });
    } else {
      msg = bookingRef && newStatus === "Confirmed"
        ? `Booking confirmed! Reference assigned: ${bookingRef}`
        : `Booking ${id} status updated to: ${newStatus}`;
    }
    showToast(msg);

    if (activeQuotation && activeQuotation.id === id) {
      setActiveQuotation(prev => ({ 
        ...prev, 
        ...payloadExtra,
        status: newStatus,
        ...(bookingRef ? { bookingReference: bookingRef } : {})
      }));
    }
    return true;
  };

  const handleConfirmPaymentModal = async (paymentData) => {
    if (!paymentModalState.booking) return;
    const { booking, mode, customBookingRef } = paymentModalState;
    const targetStatus = mode === "deposit" ? "Confirmed" : "Ongoing";

    setPaymentModalState({ isOpen: false, mode: "deposit", booking: null, customBookingRef: null });
    await handleUpdateStatus(booking.id, targetStatus, customBookingRef, paymentData);
  };

  const handleSaveInventory = async (id, inventoryData) => {
    await updateBookingInventory(id, inventoryData);
    const targetCompanyId = userRole === "company_admin" ? activeCompany?.id : null;
    const updatedBookings = await getBookings(targetCompanyId);
    setQuotations(updatedBookings);
    showToast(`Ingress & Egress equipment manifest saved for ${id}`);
    if (activeQuotation && activeQuotation.id === id) {
      setActiveQuotation(prev => ({ ...prev, ...inventoryData }));
    }
  };

  const handleDeleteQuote = async (id) => {
    if (window.confirm(`Are you sure you want to delete quotation ${id}?`)) {
      await deleteBooking(id);
      const targetCompanyId = userRole === "company_admin" ? activeCompany?.id : null;
      const updatedBookings = await getBookings(targetCompanyId);
      setQuotations(updatedBookings);
      showToast(`Quotation ${id} removed.`);
      if (activeQuotation && activeQuotation.id === id) {
        setActiveQuotation(null);
      }
    }
  };

  const handleSavePackage = async (pkg) => {
    await savePackage(pkg);
    const updated = await getPackages();
    setPackages(updated);
    showToast(`Package "${pkg.name}" saved!`);
  };

  const handleDeletePackage = async (id) => {
    if (window.confirm("Are you sure you want to delete this catering package?")) {
      await deletePackage(id);
      const updated = await getPackages();
      setPackages(updated);
      showToast("Package removed.");
    }
  };

  const handleSaveDish = async (dish) => {
    await saveDish(dish);
    const updated = await getDishes();
    setDishes(updated);
    showToast(`Viand "${dish.name}" saved!`);
  };

  const handleDeleteDish = async (id) => {
    if (window.confirm("Are you sure you want to remove this viand?")) {
      await deleteDish(id);
      const updated = await getDishes();
      setDishes(updated);
      showToast("Viand removed.");
    }
  };

  const handleSaveAddon = async (addon) => {
    await saveAddon(addon);
    const updated = await getAddons();
    setAddons(updated);
    showToast(`Add-on "${addon.name}" saved!`);
  };

  const handleDeleteAddon = async (id) => {
    if (window.confirm("Are you sure you want to remove this add-on item?")) {
      await deleteAddon(id);
      const updated = await getAddons();
      setAddons(updated);
      showToast("Add-on removed.");
    }
  };

  const handleSaveBookingDirect = async (booking) => {
    const res = await saveBooking(booking);
    const updated = await getBookings();
    setQuotations(updated);
    showToast(`Booking ${booking.id} recorded in Cloud Firestore!`);
    return res;
  };

  // LOGIN SCREEN IF NOT LOGGED IN
  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", padding: "1.5rem" }}>
        <div className="card-section" style={{ maxWidth: "420px", width: "100%", padding: "2.5rem 2rem", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)", border: "1px solid rgba(255, 255, 255, 0.1)" }}>
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <div style={{ width: "54px", height: "54px", background: "var(--gold-gradient)", borderRadius: "14px", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem", color: "#ffffff", boxShadow: "0 10px 15px -3px rgba(217, 119, 6, 0.4)" }}>
              <Lock size={26} />
            </div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-primary)" }}>
              CaterFlow PH • Admin Suite
            </h1>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.3rem" }}>
              Catering Operations & Management Portal
            </p>
          </div>

          {loginError && (
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", padding: "0.75rem 1rem", borderRadius: "8px", fontSize: "0.85rem", marginBottom: "1.25rem", textAlign: "center" }}>
              {loginError}
            </div>
          )}

          <div style={{ background: "#f8fafc", border: "1px solid var(--border-subtle)", borderRadius: "8px", padding: "0.75rem", fontSize: "0.76rem", color: "var(--text-secondary)", marginBottom: "1.25rem", lineHeight: 1.5 }}>
            <div style={{ fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.25rem", display: "flex", alignItems: "center", gap: "0.3rem" }}>
              <ShieldCheck size={14} color="var(--gold-600)" />
              <span>Admin Authentication:</span>
            </div>
            <div>• <strong>Master SuperAdmin Passcode:</strong> <code>admin2026</code> (Full platform setup)</div>
            <div>• <strong>Company Admin Passcode:</strong> <code>cater2026</code> (Or your company's custom passcode)</div>
          </div>

          <form onSubmit={handleLoginSubmit}>
            <div className="form-group" style={{ marginBottom: "1rem" }}>
              <label className="form-label">Administrator Account</label>
              <input
                type="text"
                required
                className="form-input"
                value={loginForm.username}
                onChange={(e) => setLoginForm(prev => ({ ...prev, username: e.target.value }))}
              />
            </div>

            <div className="form-group" style={{ marginBottom: "1.5rem" }}>
              <label className="form-label">Master Password / Passcode</label>
              <input
                type="password"
                required
                placeholder="Enter admin passcode"
                className="form-input"
                value={loginForm.password}
                onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
              />
            </div>

            <button type="submit" className="btn-primary" style={{ width: "100%", padding: "0.85rem", fontSize: "1rem" }}>
              <ShieldCheck size={18} />
              <span>Sign In to Admin Portal</span>
            </button>
          </form>

          <div style={{ marginTop: "1.5rem", textAlign: "center", fontSize: "0.75rem", color: "var(--text-dim)" }}>
            Protected staff portal • Cloud Firestore Synchronized
          </div>
        </div>
      </div>
    );
  }

  // AUTHENTICATED ADMIN DASHBOARD
  return (
    <div className="admin-layout">
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

      {/* Drawer backdrop for mobile screens */}
      {isSidebarOpen && (
        <div 
          className="sidebar-backdrop-mobile no-print"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}

      {/* Collapsible Sidebar Drawer */}
      <aside className={`admin-sidebar-drawer ${isSidebarOpen ? "open" : "collapsed"} no-print`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="sidebar-brand-icon">
              <ShieldCheck size={22} />
            </div>
            <div className="sidebar-brand-text">
              <div className="title">CaterFlow <span className="accent">PH</span></div>
              <div className="subtitle">Admin HQ</div>
            </div>
          </div>

          <button 
            type="button" 
            className="drawer-close-btn"
            onClick={toggleSidebar}
            title="Close Menu Drawer"
            aria-label="Close Menu Drawer"
          >
            <ChevronLeft size={18} />
          </button>
        </div>

        {/* Active Company Profile Box inside Sidebar */}
        <div className="sidebar-company-box">
          <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 800, letterSpacing: "0.5px", marginBottom: "0.3rem" }}>
            Active Catering Brand
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", minWidth: 0 }}>
              <div style={{ width: "24px", height: "24px", borderRadius: "6px", background: "var(--gold-100)", color: "var(--gold-700)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Building2 size={13} />
              </div>
              <div style={{ fontSize: "0.82rem", fontWeight: 800, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {activeCompany?.name || "My Catering Services"}
              </div>
            </div>

            <button
              type="button"
              style={{ background: "none", border: "none", color: "var(--gold-600)", cursor: "pointer", fontSize: "0.75rem", fontWeight: 700, padding: "2px 4px", flexShrink: 0 }}
              onClick={() => {
                setActiveQuotation(null);
                setActiveTab("company-settings");
                if (window.innerWidth <= 768) setIsSidebarOpen(false);
              }}
              title="Manage Companies"
            >
              Edit
            </button>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="sidebar-nav-list">
          <button
            className={`sidebar-nav-item ${activeTab === "bookings" ? "active" : ""}`}
            onClick={() => {
              setActiveQuotation(null);
              setActiveTab("bookings");
              if (window.innerWidth <= 768) setIsSidebarOpen(false);
            }}
            title="Event Bookings"
          >
            <FileText size={18} style={{ flexShrink: 0 }} />
            <span>Event Bookings</span>
            <span className="sidebar-badge">{quotations.length}</span>
          </button>

          <button
            className={`sidebar-nav-item ${activeTab === "calendar" ? "active" : ""}`}
            onClick={() => {
              setActiveQuotation(null);
              setActiveTab("calendar");
              if (window.innerWidth <= 768) setIsSidebarOpen(false);
            }}
            title="Monthly Event Booking Calendar"
          >
            <CalendarDays size={18} style={{ flexShrink: 0 }} />
            <span>Event Calendar</span>
            <span className="sidebar-badge" style={{ background: "#ecfdf5", color: "#047857" }}>
              {quotations.filter(q => q.status === "Confirmed" || q.status === "Ongoing").length}
            </span>
          </button>

          <button
            className={`sidebar-nav-item ${activeTab === "grocery-bom" ? "active" : ""}`}
            onClick={() => {
              setActiveQuotation(null);
              setActiveTab("grocery-bom");
              if (window.innerWidth <= 768) setIsSidebarOpen(false);
            }}
            title="Kitchen Grocery BOM (Raw Ingredients)"
          >
            <ShoppingCart size={18} style={{ flexShrink: 0 }} />
            <span>Kitchen Grocery BOM</span>
          </button>

          <button
            className={`sidebar-nav-item ${activeTab === "staff-logistics" ? "active" : ""}`}
            onClick={() => {
              setActiveQuotation(null);
              setActiveTab("staff-logistics");
              if (window.innerWidth <= 768) setIsSidebarOpen(false);
            }}
            title="Banquet Staff & Waiter Logistics"
          >
            <Users size={18} style={{ flexShrink: 0 }} />
            <span>Staff Logistics</span>
          </button>

          <button
            className={`sidebar-nav-item ${activeTab === "ingress-egress" ? "active" : ""}`}
            onClick={() => {
              setActiveQuotation(null);
              setActiveTab("ingress-egress");
              if (window.innerWidth <= 768) setIsSidebarOpen(false);
            }}
            title="Ingress & Egress Equipment Inventory Checklist"
          >
            <ClipboardCheck size={18} style={{ flexShrink: 0 }} />
            <span>Ingress / Egress</span>
          </button>

          <button
            className={`sidebar-nav-item ${activeTab === "packages" ? "active" : ""}`}
            onClick={() => {
              setActiveQuotation(null);
              setActiveTab("packages");
              if (window.innerWidth <= 768) setIsSidebarOpen(false);
            }}
            title="Packages & Viands Catalog Master"
          >
            <Package size={18} style={{ flexShrink: 0 }} />
            <span>Packages & Menu</span>
          </button>

          <button
            className={`sidebar-nav-item ${activeTab === "pricing-guide" ? "active" : ""}`}
            onClick={() => {
              setActiveQuotation(null);
              setActiveTab("pricing-guide");
              if (window.innerWidth <= 768) setIsSidebarOpen(false);
            }}
            title="Dev Costing, Market Rates & Client Pitch"
          >
            <DollarSign size={18} style={{ flexShrink: 0 }} />
            <span>Dev Pitch Costing</span>
          </button>

          <button
            className={`sidebar-nav-item ${activeTab === "company-settings" ? "active" : ""}`}
            onClick={() => {
              setActiveQuotation(null);
              setActiveTab("company-settings");
              if (window.innerWidth <= 768) setIsSidebarOpen(false);
            }}
            title="Company Settings & Multi-Tenant Profiles"
          >
            <Building2 size={18} style={{ flexShrink: 0 }} />
            <span>Company Settings</span>
          </button>
        </nav>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.74rem", color: "var(--text-muted)", padding: "0.25rem 0.25rem" }}>
            <span>CaterFlow Suite</span>
            <span style={{ fontWeight: 700, color: "var(--gold-600)" }}>v2.4 Live</span>
          </div>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <div className="admin-main-viewport">
        {/* Top Navbar */}
        <header className="app-header" style={{ borderBottom: "1px solid var(--border-subtle)", background: "#ffffff" }}>
          <div className="header-inner" style={{ maxWidth: "100%", padding: "0.75rem 1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              {/* Drawer Toggle Hamburger */}
              <button 
                type="button" 
                className="drawer-toggle-btn" 
                onClick={toggleSidebar}
                title={isSidebarOpen ? "Collapse Menu Drawer" : "Open Menu Drawer"}
              >
                <Menu size={18} />
              </button>

              {/* Company Switcher: SuperAdmin has Dropdown, Company Admin is Strictly Locked to their Tenant */}
              {userRole === "super_admin" ? (
                <div className="company-switcher-dropdown">
                  <button 
                    type="button" 
                    className="company-switcher-trigger"
                    onClick={() => setIsCompanyDropdownOpen(!isCompanyDropdownOpen)}
                  >
                    <Building2 size={16} color="var(--gold-600)" />
                    <span>{activeCompany?.name || "Select Catering Company"}</span>
                    <ChevronDown size={14} color="var(--text-muted)" style={{ transform: isCompanyDropdownOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
                  </button>

                  {isCompanyDropdownOpen && (
                    <div className="company-dropdown-menu">
                      <div style={{ padding: "0.4rem 0.65rem", fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 800, letterSpacing: "0.5px" }}>
                        Select Catering Company (SuperAdmin)
                      </div>
                      {companies.map(comp => (
                        <button
                          key={comp.id}
                          type="button"
                          className={`company-menu-item ${comp.id === activeCompany?.id ? "active" : ""}`}
                          onClick={() => handleSelectCompany(comp)}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <Building2 size={15} />
                            <span style={{ fontSize: "0.85rem" }}>{comp.name}</span>
                          </div>
                          {comp.id === activeCompany?.id && <Check size={14} color="var(--gold-600)" />}
                        </button>
                      ))}
                      <div style={{ borderTop: "1px solid var(--border-subtle)", marginTop: "0.4rem", paddingTop: "0.4rem" }}>
                        <button
                          type="button"
                          className="company-menu-item"
                          style={{ color: "var(--gold-600)", fontWeight: 700 }}
                          onClick={() => {
                            setIsCompanyDropdownOpen(false);
                            setActiveQuotation(null);
                            setActiveTab("company-settings");
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                            <Plus size={15} />
                            <span style={{ fontSize: "0.82rem" }}>+ Manage / Add New Company</span>
                          </div>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div 
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    background: "var(--gold-50)",
                    border: "1px solid var(--gold-200)",
                    borderRadius: "20px",
                    padding: "0.42rem 0.9rem",
                    fontSize: "0.84rem",
                    fontWeight: 700,
                    color: "var(--text-primary)"
                  }}
                  title="Tenant-Locked: You are accessing this company's private bookings"
                >
                  <Building2 size={16} color="var(--gold-600)" />
                  <span>{activeCompany?.name}</span>
                  <span style={{ fontSize: "0.68rem", background: "var(--gold-200)", color: "var(--gold-900)", padding: "1px 6px", borderRadius: "10px", fontWeight: 800 }}>
                    Company Admin
                  </span>
                </div>
              )}
            </div>

            {/* Right Topbar Status & Actions */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div className="db-pill live" title="Connected to Google Cloud Firestore">
                <div className="pulse-dot live" />
                <Database size={14} />
                <span>Firestore: Live</span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", background: "#f8fafc", padding: "0.35rem 0.75rem", borderRadius: "20px", border: "1px solid var(--border-subtle)", fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: 600 }}>
                <ShieldCheck size={15} color="var(--gold-500)" />
                <span>{userRole === "super_admin" ? "Master Admin" : "Company Admin"}</span>
              </div>

              <button 
                className="btn-secondary"
                style={{ padding: "0.45rem 0.85rem", fontSize: "0.82rem", color: "#dc2626", borderColor: "#fecaca" }}
                onClick={handleLogout}
                title="Lock Admin Portal"
              >
                <LogOut size={14} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Admin Content Body */}
        <main className="main-content" style={{ maxWidth: "100%", padding: "1.75rem" }}>
          {activeQuotation ? (
            <PrintableQuotation
              quotation={activeQuotation}
              catererInfo={activeCompany}
              isAdmin={true}
              onBack={() => setActiveQuotation(null)}
              onConfirmBooking={(id, status = "Confirmed", customRef = null) => handleUpdateStatus(id, status, customRef)}
              onOpenIngress={(q) => {
                setSelectedIngressBooking(q);
                setActiveQuotation(null);
                setActiveTab("ingress-egress");
              }}
            />
          ) : (
            <>
              {activeTab === "bookings" && (
                <>
                  <div className="page-hero no-print">
                    <div className="hero-text">
                      <h1>Real-Time Event Bookings & Inquiries</h1>
                      <p>
                        Monitor client reservations submitted via the public website, approve dates, update payment status (Downpayment Received / Balance Settled), and view quotations.
                      </p>
                    </div>
                  </div>

                  <BookingsDashboard
                    quotations={quotations}
                    activeCompany={activeCompany}
                    userRole={userRole}
                    onViewQuote={(q) => setActiveQuotation(q)}
                    onUpdateStatus={handleUpdateStatus}
                    onOpenPaymentDetails={(booking, mode) => handleOpenPaymentModal(booking, mode || (booking.status === "Ongoing" ? "ongoing" : "deposit"))}
                    onDeleteQuote={handleDeleteQuote}
                    onCreateNew={() => {
                      setPrefilledBookingDate(null);
                      setPackageManagerSubTab("packages");
                      setActiveTab("packages");
                    }}
                    onOpenDirectBooking={(date) => {
                      setPrefilledBookingDate(date || null);
                      setPackageManagerSubTab("new-booking");
                      setActiveTab("packages");
                    }}
                    onOpenIngress={(q) => {
                      setSelectedIngressBooking(q);
                      setActiveQuotation(null);
                      setActiveTab("ingress-egress");
                    }}
                  />
                </>
              )}

              {activeTab === "calendar" && (
                <>
                  <div className="page-hero no-print">
                    <div className="hero-text">
                      <h1>Monthly Event Booking Calendar</h1>
                      <p>
                        Monitor scheduled catering events, track daily kitchen capacity (max 3 bookings per day), and easily manage bookings for the month.
                      </p>
                    </div>
                  </div>

                  <BookingCalendarView
                    quotations={quotations}
                    activeCompany={activeCompany}
                    userRole={userRole}
                    onViewQuote={(q) => setActiveQuotation(q)}
                    onUpdateStatus={handleUpdateStatus}
                    onOpenPaymentDetails={(booking, mode) => handleOpenPaymentModal(booking, mode || (booking.status === "Ongoing" ? "ongoing" : "deposit"))}
                    onOpenDirectBooking={(date) => {
                      setPrefilledBookingDate(date || null);
                      setPackageManagerSubTab("new-booking");
                      setActiveTab("packages");
                    }}
                    onCreateNew={() => {
                      setPrefilledBookingDate(null);
                      setPackageManagerSubTab("packages");
                      setActiveTab("packages");
                    }}
                    onOpenIngress={(q) => {
                      setSelectedIngressBooking(q);
                      setActiveQuotation(null);
                      setActiveTab("ingress-egress");
                    }}
                  />
                </>
              )}

              {activeTab === "grocery-bom" && (
                <>
                  <div className="page-hero no-print">
                    <div className="hero-text">
                      <h1>Kitchen Grocery & Raw Ingredient BOM Estimator</h1>
                      <p>
                        Convert guest pax and chosen banquet viands into precise market procurement weights (kg of beef, pork, chicken, produce, sacks of rice), compute food cost margins, and print official chef prep sheets.
                      </p>
                    </div>
                  </div>

                  <KitchenGroceryEstimator bookings={quotations} />
                </>
              )}

              {activeTab === "staff-logistics" && (
                <>
                  <div className="page-hero no-print">
                    <div className="hero-text">
                      <h1>Banquet Waiter & Service Logistics Calculator</h1>
                      <p>
                        Calculate service staff headcount based on DOLE Philippine catering standards (1:25 buffet, 1:18 plated), assign Captain Waiters, Lechon Carvers, and Bartenders, and export printable crew dispatch sheets.
                      </p>
                    </div>
                  </div>

                  <StaffLogisticsCalculator bookings={quotations} />
                </>
              )}

              {activeTab === "ingress-egress" && (
                <>
                  <div className="page-hero no-print">
                    <div className="hero-text">
                      <h1>Ingress & Egress Equipment Inventory Management</h1>
                      <p>
                        Generate official equipment manifests per package, record dispatched and pulled-out banquet catering supplies, capture staff and client signatures, and enforce equipment accountability.
                      </p>
                    </div>
                  </div>

                  <IngressEgressManager
                    bookings={quotations}
                    activeCompany={activeCompany}
                    selectedBooking={selectedIngressBooking}
                    onSaveInventory={handleSaveInventory}
                    onBack={() => setActiveTab("bookings")}
                  />
                </>
              )}

              {activeTab === "packages" && (
                <>
                  <div className="page-hero no-print">
                    <div className="hero-text">
                      <h1>Catering Packages, Viands & Add-ons Master</h1>
                      <p>
                        Configure client packages (such as the ₱95k Premiere Banquet), add new recipes, manage carving stations, and record offline bookings directly to Cloud Firestore.
                      </p>
                    </div>
                  </div>

                  <AdminPackageManager
                    packages={packages}
                    dishes={dishes}
                    addons={addons}
                    bookings={quotations}
                    onSavePackage={handleSavePackage}
                    onDeletePackage={handleDeletePackage}
                    onSaveDish={handleSaveDish}
                    onDeleteDish={handleDeleteDish}
                    onSaveAddon={handleSaveAddon}
                    onDeleteAddon={handleDeleteAddon}
                    onSaveBooking={handleSaveBookingDirect}
                    onViewBooking={(booking) => setActiveQuotation(booking)}
                    backendStatus={backendStatus}
                    onRefreshData={loadAllAdminData}
                    initialSubTab={packageManagerSubTab}
                    initialBookingDate={prefilledBookingDate}
                  />
                </>
              )}

              {activeTab === "pricing-guide" && (
                <>
                  <div className="page-hero no-print">
                    <div className="hero-text">
                      <h1>Software Development Project Costing & Client Pricing</h1>
                      <p>
                        Philippine market benchmarks, scope calculator, milestone payment schedules, and a copyable client proposal for pitching this catering system.
                      </p>
                    </div>
                  </div>

                  <ClientPricingGuide />
                </>
              )}

              {activeTab === "company-settings" && (
                <>
                  <div className="page-hero no-print">
                    <div className="hero-text">
                      <h1>CaterFlow PH Multi-Tenant & Company Settings</h1>
                      <p>
                        Manage catering company profiles, banking/GCash settlement details, BIR registration, and operational booking limits. Switch between multiple catering businesses seamlessly.
                      </p>
                    </div>
                  </div>

                  <CompanySettings 
                    activeCompany={activeCompany}
                    onCompanyUpdated={() => {
                      refreshCompanies();
                      showToast("Company settings updated!");
                    }} 
                  />
                </>
              )}
            </>
          )}
        </main>
      </div>

      {/* Booking Payment Details Modal (Deposit Confirmation & Ongoing Verification) */}
      {paymentModalState.isOpen && (
        <BookingPaymentModal
          isOpen={paymentModalState.isOpen}
          mode={paymentModalState.mode}
          booking={paymentModalState.booking}
          onClose={() => setPaymentModalState(prev => ({ ...prev, isOpen: false, booking: null }))}
          onConfirm={handleConfirmPaymentModal}
        />
      )}
    </div>
  );
}
