import React, { useState, useMemo } from "react";
import { 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  Eye, 
  DollarSign, 
  Filter, 
  Plus, 
  Users, 
  TrendingUp,
  ClipboardCheck,
  Banknote,
  Receipt,
  LayoutList,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  X,
  AlertCircle,
  Sparkles,
  Search,
  RotateCcw
} from "lucide-react";
import BookingCalendarView from "./BookingCalendarView";
import { 
  MAX_CONFIRMED_BOOKINGS_PER_DAY,
  getConfirmedBookingsCountForDate,
  getRemainingSlotsForDate,
  isDateFullyBooked,
  formatTime12Hour
} from "../utils/bookingUtils";

/**
 * Format a local date safely into YYYY-MM-DD
 */
function getLocalDateString(val) {
  if (!val) return "";
  if (typeof val === "string") {
    if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
    if (val.includes("T")) return val.split("T")[0];
    const parsed = new Date(val);
    if (!isNaN(parsed.getTime())) {
      const y = parsed.getFullYear();
      const m = String(parsed.getMonth() + 1).padStart(2, "0");
      const d = String(parsed.getDate()).padStart(2, "0");
      return `${y}-${m}-${d}`;
    }
    return val;
  }
  if (val instanceof Date && !isNaN(val.getTime())) {
    const y = val.getFullYear();
    const m = String(val.getMonth() + 1).padStart(2, "0");
    const d = String(val.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  return "";
}

/**
 * Format date string into human friendly text: "Sat, Oct 24, 2026"
 */
function formatFriendlyDate(dateStr) {
  if (!dateStr) return "TBA";
  try {
    const raw = dateStr.includes("T") ? dateStr.split("T")[0] : dateStr;
    const parts = raw.split("-");
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      return d.toLocaleDateString("en-PH", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric"
      });
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}

/**
 * Full format for banners: "Saturday, October 24, 2026"
 */
function formatFullDate(dateStr) {
  if (!dateStr) return "TBA";
  try {
    const raw = dateStr.includes("T") ? dateStr.split("T")[0] : dateStr;
    const parts = raw.split("-");
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      return d.toLocaleDateString("en-PH", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
      });
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}

export default function BookingsDashboard({ 
  quotations = [], 
  activeCompany,
  userRole = "company_admin",
  onViewQuote, 
  onUpdateStatus, 
  onOpenPaymentDetails,
  onDeleteQuote, 
  onCreateNew,
  onOpenDirectBooking,
  onOpenIngress,
  defaultViewMode = "table"
}) {
  const [viewMode, setViewMode] = useState(defaultViewMode); // "table" or "calendar"
  const [filterStatus, setFilterStatus] = useState("All");
  const [companyFilter, setCompanyFilter] = useState("current"); // "current" or "all"
  const [searchTerm, setSearchTerm] = useState("");

  // Custom Date Filter State
  const [dateFilterPreset, setDateFilterPreset] = useState("all"); 
  // "all" | "today" | "tomorrow" | "this_week" | "this_month" | "next_month" | "specific" | "custom" | "unscheduled"
  const [dateFilterField, setDateFilterField] = useState("eventDate"); // "eventDate" | "createdAt"
  const [specificDate, setSpecificDate] = useState(() => getLocalDateString(new Date()));
  const [customRange, setCustomRange] = useState({ start: "", end: "" });
  const [sortBy, setSortBy] = useState("date_asc"); // "date_asc" | "date_desc" | "created_desc" | "total_desc" | "client_asc"

  const isSuperAdmin = userRole === "super_admin";
  const effectiveFilter = isSuperAdmin ? companyFilter : "current";

  // Precomputed Date Reference Values
  const todayStr = useMemo(() => getLocalDateString(new Date()), []);
  const tomorrowStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return getLocalDateString(d);
  }, []);

  const thisWeekRange = useMemo(() => {
    const now = new Date();
    const day = now.getDay();
    const start = new Date(now);
    start.setDate(now.getDate() - day);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return {
      start: getLocalDateString(start),
      end: getLocalDateString(end)
    };
  }, []);

  const thisMonthRange = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    return {
      start: getLocalDateString(new Date(y, m, 1)),
      end: getLocalDateString(new Date(y, m + 1, 0))
    };
  }, []);

  const nextMonthRange = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    return {
      start: getLocalDateString(new Date(y, m + 1, 1)),
      end: getLocalDateString(new Date(y, m + 2, 0))
    };
  }, []);

  // Strict tenant scoping: company admins only ever see their own company's bookings & metrics
  const scopedQuotes = useMemo(() => {
    return quotations.filter(q => {
      if (isSuperAdmin && effectiveFilter === "all") return true;
      return q.companyId === activeCompany?.id;
    });
  }, [quotations, isSuperAdmin, effectiveFilter, activeCompany?.id]);

  // Check if date filter is active
  const isDateFilterActive = dateFilterPreset !== "all";

  // Date Filter evaluation function
  const matchesDateFilter = (q) => {
    if (dateFilterPreset === "all") return true;

    const rawVal = dateFilterField === "eventDate" ? q.eventDate : (q.createdAt || q.date);
    const dateStr = getLocalDateString(rawVal);

    if (dateFilterPreset === "unscheduled") {
      return !dateStr;
    }

    if (!dateStr) return false;

    if (dateFilterPreset === "today") {
      return dateStr === todayStr;
    }
    if (dateFilterPreset === "tomorrow") {
      return dateStr === tomorrowStr;
    }
    if (dateFilterPreset === "this_week") {
      return dateStr >= thisWeekRange.start && dateStr <= thisWeekRange.end;
    }
    if (dateFilterPreset === "this_month") {
      return dateStr >= thisMonthRange.start && dateStr <= thisMonthRange.end;
    }
    if (dateFilterPreset === "next_month") {
      return dateStr >= nextMonthRange.start && dateStr <= nextMonthRange.end;
    }
    if (dateFilterPreset === "specific") {
      return specificDate ? dateStr === specificDate : true;
    }
    if (dateFilterPreset === "custom") {
      if (customRange.start && dateStr < customRange.start) return false;
      if (customRange.end && dateStr > customRange.end) return false;
      return true;
    }
    return true;
  };

  // Primary filtering
  const filteredQuotes = useMemo(() => {
    return scopedQuotes.filter(q => {
      const matchesStatus = filterStatus === "All" || q.status === filterStatus;
      const matchesDate = matchesDateFilter(q);
      const matchesSearch = !searchTerm || 
        (q.clientName && q.clientName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (q.id && q.id.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (q.bookingReference && q.bookingReference.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (q.venueName && q.venueName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (q.packageName && q.packageName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (q.serviceType && q.serviceType.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (q.companyName && q.companyName.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesStatus && matchesDate && matchesSearch;
    });
  }, [scopedQuotes, filterStatus, dateFilterPreset, dateFilterField, specificDate, customRange, searchTerm]);

  // Sorting
  const sortedQuotes = useMemo(() => {
    const list = [...filteredQuotes];
    list.sort((a, b) => {
      if (sortBy === "date_asc") {
        const da = a.eventDate ? a.eventDate.split("T")[0] : "9999-99-99";
        const db = b.eventDate ? b.eventDate.split("T")[0] : "9999-99-99";
        return da.localeCompare(db);
      }
      if (sortBy === "date_desc") {
        const da = a.eventDate ? a.eventDate.split("T")[0] : "0000-00-00";
        const db = b.eventDate ? b.eventDate.split("T")[0] : "0000-00-00";
        return db.localeCompare(da);
      }
      if (sortBy === "created_desc") {
        const ca = new Date(a.createdAt || 0).getTime();
        const cb = new Date(b.createdAt || 0).getTime();
        return cb - ca;
      }
      if (sortBy === "total_desc") {
        return (b.grandTotal || 0) - (a.grandTotal || 0);
      }
      if (sortBy === "client_asc") {
        return (a.clientName || "").localeCompare(b.clientName || "");
      }
      return 0;
    });
    return list;
  }, [filteredQuotes, sortBy]);

  // All-time scoped metrics
  const scopedConfirmedCount = scopedQuotes.filter(q => q.status === "Confirmed").length;
  const scopedOngoingCount = scopedQuotes.filter(q => q.status === "Ongoing").length;
  const scopedActiveCount = scopedConfirmedCount + scopedOngoingCount;
  const scopedTotalRevenue = scopedQuotes
    .filter(q => q.status === "Confirmed" || q.status === "Ongoing" || q.status === "Sent")
    .reduce((acc, q) => acc + (q.grandTotal || 0), 0);

  // Filtered metrics (when date filter or status filter is applied)
  const filteredConfirmedCount = filteredQuotes.filter(q => q.status === "Confirmed").length;
  const filteredOngoingCount = filteredQuotes.filter(q => q.status === "Ongoing").length;
  const filteredActiveCount = filteredConfirmedCount + filteredOngoingCount;
  const filteredTotalRevenue = filteredQuotes
    .filter(q => q.status === "Confirmed" || q.status === "Ongoing" || q.status === "Sent")
    .reduce((acc, q) => acc + (q.grandTotal || 0), 0);

  // Day inspection calculations for Specific Date filter
  const specificDateConfirmedCount = useMemo(() => {
    if (!specificDate) return 0;
    return getConfirmedBookingsCountForDate(scopedQuotes, specificDate);
  }, [scopedQuotes, specificDate]);

  const specificDateRemainingSlots = useMemo(() => {
    if (!specificDate) return MAX_CONFIRMED_BOOKINGS_PER_DAY;
    return getRemainingSlotsForDate(scopedQuotes, specificDate);
  }, [scopedQuotes, specificDate]);

  const isSpecificDateFullyBooked = useMemo(() => {
    if (!specificDate) return false;
    return isDateFullyBooked(scopedQuotes, specificDate);
  }, [scopedQuotes, specificDate]);

  const specificDateQuotes = useMemo(() => {
    if (!specificDate) return [];
    return scopedQuotes.filter(q => (q.eventDate ? q.eventDate.split("T")[0] : "") === specificDate);
  }, [scopedQuotes, specificDate]);

  const specificDateTotalPax = useMemo(() => {
    return specificDateQuotes.reduce((acc, q) => acc + (q.pax || 0), 0);
  }, [specificDateQuotes]);

  // Stepping Specific Date by +/- 1 day
  const handleStepSpecificDate = (deltaDays) => {
    const base = specificDate ? new Date(`${specificDate}T00:00:00`) : new Date();
    base.setDate(base.getDate() + deltaDays);
    setSpecificDate(getLocalDateString(base));
  };

  const handleResetDateFilter = () => {
    setDateFilterPreset("all");
    setCustomRange({ start: "", end: "" });
  };

  // Human description for the active date filter
  const dateFilterDescription = useMemo(() => {
    const fieldLabel = dateFilterField === "eventDate" ? "Event Date" : "Created Date";
    if (dateFilterPreset === "today") return `${fieldLabel}: Today (${formatFriendlyDate(todayStr)})`;
    if (dateFilterPreset === "tomorrow") return `${fieldLabel}: Tomorrow (${formatFriendlyDate(tomorrowStr)})`;
    if (dateFilterPreset === "this_week") return `${fieldLabel}: This Week (${formatFriendlyDate(thisWeekRange.start)} – ${formatFriendlyDate(thisWeekRange.end)})`;
    if (dateFilterPreset === "this_month") return `${fieldLabel}: This Month (${thisMonthRange.start.slice(0, 7)})`;
    if (dateFilterPreset === "next_month") return `${fieldLabel}: Next Month (${nextMonthRange.start.slice(0, 7)})`;
    if (dateFilterPreset === "specific") return `${fieldLabel}: ${formatFullDate(specificDate)}`;
    if (dateFilterPreset === "custom") {
      const s = customRange.start ? formatFriendlyDate(customRange.start) : "Start";
      const e = customRange.end ? formatFriendlyDate(customRange.end) : "End";
      return `${fieldLabel} Range: ${s} to ${e}`;
    }
    if (dateFilterPreset === "unscheduled") return `${fieldLabel}: Date TBA (Unscheduled)`;
    return "All Dates";
  }, [dateFilterPreset, dateFilterField, todayStr, tomorrowStr, thisWeekRange, thisMonthRange, nextMonthRange, specificDate, customRange]);

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
      {/* Top View Mode Switcher Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "1.25rem",
        background: "#ffffff",
        padding: "0.6rem 1rem",
        borderRadius: "12px",
        border: "1px solid var(--border-subtle)",
        boxShadow: "var(--shadow-xs)",
        flexWrap: "wrap",
        gap: "0.75rem"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <span style={{ fontSize: "0.76rem", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.4px" }}>
            Booking View:
          </span>
          <div style={{ display: "flex", gap: "4px", background: "#f1f5f9", padding: "3px", borderRadius: "8px" }}>
            <button
              type="button"
              style={{
                background: viewMode === "table" ? "#ffffff" : "transparent",
                color: viewMode === "table" ? "var(--text-primary)" : "var(--text-muted)",
                border: "none",
                padding: "4px 12px",
                borderRadius: "6px",
                fontSize: "0.78rem",
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "5px",
                boxShadow: viewMode === "table" ? "var(--shadow-xs)" : "none"
              }}
              onClick={() => setViewMode("table")}
            >
              <LayoutList size={14} />
              <span>Table List View</span>
            </button>
            <button
              type="button"
              style={{
                background: viewMode === "calendar" ? "var(--gold-gradient)" : "transparent",
                color: viewMode === "calendar" ? "#ffffff" : "var(--text-muted)",
                border: "none",
                padding: "4px 12px",
                borderRadius: "6px",
                fontSize: "0.78rem",
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "5px",
                boxShadow: viewMode === "calendar" ? "var(--shadow-xs)" : "none"
              }}
              onClick={() => setViewMode("calendar")}
            >
              <CalendarDays size={14} />
              <span>Monthly Calendar</span>
            </button>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.78rem", color: "var(--text-muted)" }}>
          {isDateFilterActive && (
            <span style={{
              background: "var(--gold-50)",
              color: "var(--gold-600)",
              border: "1px solid var(--gold-200)",
              padding: "2px 8px",
              borderRadius: "6px",
              fontWeight: 700,
              display: "inline-flex",
              alignItems: "center",
              gap: "4px"
            }}>
              <Calendar size={12} />
              Filtered: {sortedQuotes.length} of {scopedQuotes.length}
            </span>
          )}
          <span>Showing <strong>{sortedQuotes.length}</strong> records</span>
        </div>
      </div>

      {viewMode === "calendar" ? (
        <BookingCalendarView
          quotations={quotations}
          activeCompany={activeCompany}
          userRole={userRole}
          initialDate={specificDate || (customRange.start || null)}
          onViewQuote={onViewQuote}
          onUpdateStatus={onUpdateStatus}
          onOpenPaymentDetails={onOpenPaymentDetails}
          onOpenIngress={onOpenIngress}
          onOpenDirectBooking={onOpenDirectBooking}
          onCreateNew={onCreateNew}
        />
      ) : (
        <>
          {/* Active Date Filter Notice Pill (when filtered) */}
          {isDateFilterActive && (
            <div style={{
              marginBottom: "1rem",
              background: "linear-gradient(90deg, #fffbeb 0%, #fef3c7 100%)",
              border: "1px solid var(--gold-300)",
              borderRadius: "10px",
              padding: "0.6rem 1rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "0.6rem",
              boxShadow: "var(--shadow-xs)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.82rem", color: "var(--gold-600)" }}>
                <Calendar size={16} />
                <span>
                  Active Date Filter: <strong>{dateFilterDescription}</strong> — 
                  Showing <strong>{sortedQuotes.length}</strong> matching bookings ({filteredConfirmedCount} confirmed, {filteredOngoingCount} ongoing).
                </span>
              </div>
              <button
                type="button"
                onClick={handleResetDateFilter}
                style={{
                  background: "#ffffff",
                  border: "1px solid var(--gold-400)",
                  color: "var(--gold-600)",
                  padding: "3px 10px",
                  borderRadius: "6px",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px"
                }}
              >
                <X size={12} />
                <span>Clear Date Filter</span>
              </button>
            </div>
          )}

          {/* Metric Cards Banner */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem", marginBottom: "1.75rem" }}>
            <div className="card-section" style={{ marginBottom: 0, padding: "1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.78rem", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: 700 }}>
                  {isDateFilterActive ? "Filtered Bookings" : "Total Quotations"}
                </span>
                <div style={{ background: "var(--gold-50)", color: "var(--gold-600)", padding: "6px", borderRadius: "8px", border: "1px solid var(--gold-200)" }}>
                  <TrendingUp size={18} />
                </div>
              </div>
              <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--text-primary)", marginTop: "0.5rem" }}>
                {sortedQuotes.length}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                {isDateFilterActive 
                  ? `${scopedQuotes.length} all-time records in platform` 
                  : "Active inquiries & quotes"}
              </div>
            </div>

            <div className="card-section" style={{ marginBottom: 0, padding: "1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.78rem", textTransform: "uppercase", color: "var(--emerald-600)", fontWeight: 700 }}>
                  {isDateFilterActive ? "Period Confirmed / Ongoing" : "Confirmed & Ongoing"}
                </span>
                <div style={{ background: "var(--emerald-50)", color: "var(--emerald-600)", padding: "6px", borderRadius: "8px", border: "1px solid var(--emerald-100)" }}>
                  <CheckCircle2 size={18} />
                </div>
              </div>
              <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--emerald-600)", marginTop: "0.5rem" }}>
                {isDateFilterActive ? filteredActiveCount : scopedActiveCount}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                {isDateFilterActive 
                  ? `${filteredConfirmedCount} Confirmed • ${filteredOngoingCount} Ongoing in period`
                  : `${scopedConfirmedCount} Confirmed ${scopedOngoingCount > 0 ? `• ${scopedOngoingCount} Ongoing` : ""}`}
              </div>
            </div>

            <div className="card-section" style={{ marginBottom: 0, padding: "1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.78rem", textTransform: "uppercase", color: "var(--gold-600)", fontWeight: 700 }}>
                  {isDateFilterActive ? "Period Pipeline (PHP)" : "Active Pipeline (PHP)"}
                </span>
                <div style={{ background: "var(--gold-50)", color: "var(--gold-600)", padding: "6px", borderRadius: "8px", border: "1px solid var(--gold-200)" }}>
                  <DollarSign size={18} />
                </div>
              </div>
              <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--gold-600)", marginTop: "0.5rem" }}>
                ₱{(isDateFilterActive ? filteredTotalRevenue : scopedTotalRevenue).toLocaleString()}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                {isDateFilterActive ? "Revenue for selected date criteria" : "Total value in negotiation & booked"}
              </div>
            </div>
          </div>

          {/* Specific Date Inspection & Capacity Banner (Visible when dateFilterPreset === "specific") */}
          {dateFilterPreset === "specific" && (
            <div style={{
              background: "#ffffff",
              border: `2px solid ${isSpecificDateFullyBooked ? "var(--red-400)" : specificDateConfirmedCount === 2 ? "var(--gold-400)" : "var(--emerald-400)"}`,
              borderRadius: "14px",
              padding: "1.25rem",
              marginBottom: "1.5rem",
              boxShadow: "var(--shadow-sm)"
            }}>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "1rem",
                borderBottom: "1px solid var(--border-subtle)",
                paddingBottom: "0.85rem",
                marginBottom: "1rem"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                  <div style={{
                    background: isSpecificDateFullyBooked ? "var(--red-50)" : specificDateConfirmedCount === 2 ? "var(--gold-50)" : "var(--emerald-50)",
                    color: isSpecificDateFullyBooked ? "var(--red-600)" : specificDateConfirmedCount === 2 ? "var(--gold-600)" : "var(--emerald-600)",
                    padding: "8px",
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}>
                    <Calendar size={22} />
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                      <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800, color: "var(--text-primary)" }}>
                        {formatFullDate(specificDate)}
                      </h3>
                      {specificDate === todayStr && (
                        <span style={{ fontSize: "0.68rem", background: "var(--gold-100)", color: "var(--gold-600)", padding: "2px 7px", borderRadius: "6px", fontWeight: 800 }}>
                          TODAY
                        </span>
                      )}
                      {specificDate === tomorrowStr && (
                        <span style={{ fontSize: "0.68rem", background: "#ecfdf5", color: "#047857", padding: "2px 7px", borderRadius: "6px", fontWeight: 800 }}>
                          TOMORROW
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "2px" }}>
                      Kitchen Operations & Reservation Status on this Specific Date
                    </div>
                  </div>
                </div>

                {/* Day Navigation Steppers */}
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ padding: "0.35rem 0.65rem", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "3px" }}
                    onClick={() => handleStepSpecificDate(-1)}
                    title="Previous Day"
                  >
                    <ChevronLeft size={14} />
                    <span>Prev Day</span>
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ padding: "0.35rem 0.65rem", fontSize: "0.75rem", fontWeight: 700 }}
                    onClick={() => setSpecificDate(todayStr)}
                    title="Jump to Today"
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ padding: "0.35rem 0.65rem", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "3px" }}
                    onClick={() => handleStepSpecificDate(1)}
                    title="Next Day"
                  >
                    <span>Next Day</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>

              {/* Day Capacity & Metrics Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", alignItems: "center" }}>
                {/* Kitchen Slot Meter */}
                <div style={{ background: "#f8fafc", padding: "0.85rem", borderRadius: "10px", border: "1px solid var(--border-subtle)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>
                      Daily Capacity
                    </span>
                    <span style={{
                      fontSize: "0.75rem",
                      fontWeight: 800,
                      color: isSpecificDateFullyBooked ? "var(--red-600)" : specificDateConfirmedCount === 2 ? "var(--gold-600)" : "var(--emerald-600)"
                    }}>
                      {specificDateConfirmedCount} / {MAX_CONFIRMED_BOOKINGS_PER_DAY} Booked
                    </span>
                  </div>

                  {/* Visual 3-slot capacity bar */}
                  <div style={{ display: "flex", gap: "4px", height: "8px", borderRadius: "4px", overflow: "hidden", background: "#e2e8f0" }}>
                    {[0, 1, 2].map((slotIdx) => {
                      const isSlotFilled = slotIdx < specificDateConfirmedCount;
                      return (
                        <div
                          key={slotIdx}
                          style={{
                            flex: 1,
                            borderRadius: "2px",
                            background: isSlotFilled 
                              ? (isSpecificDateFullyBooked ? "var(--red-500)" : "var(--emerald-500)")
                              : "transparent"
                          }}
                        />
                      );
                    })}
                  </div>

                  <div style={{ fontSize: "0.73rem", color: "var(--text-muted)", marginTop: "0.4rem" }}>
                    {isSpecificDateFullyBooked ? (
                      <span style={{ color: "var(--red-600)", fontWeight: 700 }}>
                        ⚠️ Fully booked. Kitchen is at max capacity (3/3).
                      </span>
                    ) : (
                      <span>
                        ✓ <strong>{specificDateRemainingSlots}</strong> available slot{specificDateRemainingSlots > 1 ? "s" : ""} remaining for this date.
                      </span>
                    )}
                  </div>
                </div>

                {/* Pax & Value on this date */}
                <div style={{ background: "#f8fafc", padding: "0.85rem", borderRadius: "10px", border: "1px solid var(--border-subtle)" }}>
                  <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", marginBottom: "0.2rem" }}>
                    Bookings on Date
                  </div>
                  <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--text-primary)" }}>
                    {specificDateQuotes.length} <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)" }}>records</span>
                  </div>
                  <div style={{ fontSize: "0.73rem", color: "var(--text-muted)" }}>
                    {specificDateTotalPax > 0 ? `${specificDateTotalPax} total guest pax` : "No guest headcount recorded"}
                  </div>
                </div>

                {/* Revenue pipeline for this date */}
                <div style={{ background: "#f8fafc", padding: "0.85rem", borderRadius: "10px", border: "1px solid var(--border-subtle)" }}>
                  <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", marginBottom: "0.2rem" }}>
                    Contract Value
                  </div>
                  <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--gold-600)" }}>
                    ₱{specificDateQuotes.reduce((acc, q) => acc + (q.grandTotal || 0), 0).toLocaleString()}
                  </div>
                  <div style={{ fontSize: "0.73rem", color: "var(--text-muted)" }}>
                    From {specificDateQuotes.length} inquiry/contract(s)
                  </div>
                </div>

                {/* Quick actions for this specific date */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {onOpenDirectBooking && (
                    <button
                      type="button"
                      className="btn-primary"
                      style={{ padding: "0.45rem 0.8rem", fontSize: "0.78rem", justifyContent: "center" }}
                      onClick={() => onOpenDirectBooking(specificDate)}
                    >
                      <Plus size={14} />
                      <span>Book on {specificDate}</span>
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ padding: "0.4rem 0.8rem", fontSize: "0.78rem", justifyContent: "center", color: "var(--gold-600)", borderColor: "var(--border-gold)" }}
                    onClick={() => setViewMode("calendar")}
                  >
                    <CalendarDays size={14} />
                    <span>View in Calendar</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Quotations List Card with Integrated Filter Bar */}
          <div className="card-section">
            {/* Top Filter Bar Controls */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem", marginBottom: "1.25rem" }}>
              {/* Row 1: Section Title & Global Actions */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
                <div className="section-title" style={{ margin: 0 }}>
                  <span>Quotations & Event Bookings</span>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 400 }}>
                    ({sortedQuotes.length} records {isDateFilterActive || filterStatus !== "All" || searchTerm ? "matching filters" : ""})
                  </span>
                </div>

                <div style={{ display: "flex", gap: "0.6rem", alignItems: "center", flexWrap: "wrap" }}>
                  {/* SuperAdmin Multi-Tenant Switcher */}
                  {isSuperAdmin && (
                    <button
                      type="button"
                      style={{
                        background: companyFilter === "all" ? "var(--gold-50)" : "#ffffff",
                        border: `1px solid ${companyFilter === "all" ? "var(--gold-500)" : "var(--border-subtle)"}`,
                        color: companyFilter === "all" ? "var(--gold-700)" : "var(--text-secondary)",
                        padding: "0.4rem 0.75rem",
                        borderRadius: "8px",
                        fontSize: "0.78rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.35rem"
                      }}
                      onClick={() => setCompanyFilter(prev => prev === "current" ? "all" : "current")}
                      title="SuperAdmin: Toggle between active company bookings and all platform bookings"
                    >
                      <span>{companyFilter === "current" ? `🏢 ${activeCompany?.name?.split(" ")[0] || "Active"} Only` : "🌐 All Brands (SuperAdmin)"}</span>
                    </button>
                  )}

                  {onOpenDirectBooking && (
                    <button 
                      className="btn-secondary" 
                      style={{ padding: "0.45rem 0.85rem", fontSize: "0.82rem", borderColor: "var(--border-gold)", color: "var(--gold-600)" }}
                      onClick={() => onOpenDirectBooking(dateFilterPreset === "specific" ? specificDate : null)}
                    >
                      <Plus size={14} />
                      <span>+ Intake Booking</span>
                    </button>
                  )}

                  <button className="btn-primary" style={{ padding: "0.45rem 0.9rem", fontSize: "0.82rem" }} onClick={onCreateNew}>
                    <Plus size={15} />
                    <span>Quotation Calculator</span>
                  </button>
                </div>
              </div>

              {/* Row 2: Status Filter Pills + Search */}
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "0.75rem",
                padding: "0.6rem 0.75rem",
                background: "#f8fafc",
                borderRadius: "10px",
                border: "1px solid var(--border-subtle)"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
                    Status:
                  </span>
                  <div style={{ display: "flex", gap: "3px", flexWrap: "wrap" }}>
                    {["All", "Confirmed", "Ongoing", "Sent", "Draft", "Completed", "Cancelled"].map(status => (
                      <button
                        key={status}
                        style={{
                          background: filterStatus === status ? "var(--gold-gradient)" : "#ffffff",
                          color: filterStatus === status ? "#ffffff" : "var(--text-secondary)",
                          border: filterStatus === status ? "none" : "1px solid var(--border-subtle)",
                          padding: "3px 9px",
                          borderRadius: "6px",
                          fontSize: "0.74rem",
                          fontWeight: 700,
                          cursor: "pointer"
                        }}
                        onClick={() => setFilterStatus(status)}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                  <div style={{ position: "relative" }}>
                    <input
                      type="text"
                      placeholder="Search client, ID, venue, package..."
                      className="form-input"
                      style={{ width: "220px", padding: "0.35rem 0.65rem 0.35rem 2rem", fontSize: "0.8rem" }}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search size={14} style={{ position: "absolute", left: "9px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                  </div>

                  {/* Sort By Dropdown */}
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <ArrowUpDown size={14} style={{ color: "var(--text-muted)" }} />
                    <select
                      className="form-select"
                      style={{ padding: "0.35rem 0.5rem", fontSize: "0.76rem", fontWeight: 600, width: "auto" }}
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="date_asc">Event Date: Earliest First</option>
                      <option value="date_desc">Event Date: Latest First</option>
                      <option value="created_desc">Created: Newest First</option>
                      <option value="total_desc">Grand Total: Highest First</option>
                      <option value="client_asc">Client Name: A to Z</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Row 3: CUSTOM DATE FILTER BAR */}
              <div style={{
                background: isDateFilterActive ? "var(--gold-50)" : "#ffffff",
                border: `1px solid ${isDateFilterActive ? "var(--gold-300)" : "var(--border-subtle)"}`,
                borderRadius: "10px",
                padding: "0.65rem 0.85rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.6rem"
              }}>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "0.6rem"
                }}>
                  {/* Left: Date Presets */}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--gold-600)", fontWeight: 800, fontSize: "0.75rem", textTransform: "uppercase" }}>
                      <Calendar size={14} />
                      <span>Date Filter:</span>
                    </div>

                    {/* Field to Filter by (Event Date vs Created Date) */}
                    <select
                      className="form-select"
                      style={{ 
                        padding: "2px 6px", 
                        fontSize: "0.72rem", 
                        fontWeight: 700, 
                        width: "auto",
                        background: "#ffffff",
                        borderColor: "var(--gold-300)",
                        color: "var(--gold-600)"
                      }}
                      value={dateFilterField}
                      onChange={(e) => setDateFilterField(e.target.value)}
                      title="Choose whether to filter by Event Date or Booking Creation Date"
                    >
                      <option value="eventDate">Event Date (Operations)</option>
                      <option value="createdAt">Booking / Inquiry Date</option>
                    </select>

                    {/* Preset Buttons */}
                    <div style={{ display: "flex", gap: "3px", flexWrap: "wrap" }}>
                      {[
                        { id: "all", label: "All Dates" },
                        { id: "today", label: "Today" },
                        { id: "tomorrow", label: "Tomorrow" },
                        { id: "this_week", label: "This Week" },
                        { id: "this_month", label: "This Month" },
                        { id: "next_month", label: "Next Month" },
                        { id: "specific", label: "Specific Date 📅" },
                        { id: "custom", label: "Custom Range 🗓️" },
                        { id: "unscheduled", label: "Date TBA" }
                      ].map(preset => {
                        const isSelected = dateFilterPreset === preset.id;
                        return (
                          <button
                            key={preset.id}
                            type="button"
                            style={{
                              background: isSelected ? "var(--gold-gradient)" : "#ffffff",
                              color: isSelected ? "#ffffff" : "var(--text-secondary)",
                              border: isSelected ? "none" : "1px solid var(--border-subtle)",
                              padding: "3px 8px",
                              borderRadius: "6px",
                              fontSize: "0.72rem",
                              fontWeight: isSelected ? 800 : 600,
                              cursor: "pointer",
                              transition: "all 0.15s ease"
                            }}
                            onClick={() => {
                              setDateFilterPreset(preset.id);
                              if (preset.id === "specific" && !specificDate) {
                                setSpecificDate(todayStr);
                              }
                            }}
                          >
                            {preset.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Reset Date Filter Button */}
                  {isDateFilterActive && (
                    <button
                      type="button"
                      onClick={handleResetDateFilter}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "var(--text-muted)",
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "3px",
                        padding: "2px 6px"
                      }}
                      title="Clear custom date filter"
                    >
                      <RotateCcw size={12} />
                      <span>Reset Dates</span>
                    </button>
                  )}
                </div>

                {/* Sub-bar: Specific Date Picker Controls */}
                {dateFilterPreset === "specific" && (
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.6rem",
                    flexWrap: "wrap",
                    background: "#ffffff",
                    padding: "0.45rem 0.75rem",
                    borderRadius: "8px",
                    border: "1px dashed var(--gold-300)"
                  }}>
                    <span style={{ fontSize: "0.74rem", fontWeight: 700, color: "var(--gold-600)" }}>
                      Select Date:
                    </span>
                    <button
                      type="button"
                      className="btn-secondary"
                      style={{ padding: "2px 6px", fontSize: "0.72rem" }}
                      onClick={() => handleStepSpecificDate(-1)}
                      title="Previous Day"
                    >
                      <ChevronLeft size={13} />
                    </button>
                    <input
                      type="date"
                      className="form-input"
                      style={{ padding: "0.25rem 0.5rem", fontSize: "0.78rem", width: "145px", fontWeight: 700 }}
                      value={specificDate}
                      onChange={(e) => setSpecificDate(e.target.value)}
                    />
                    <button
                      type="button"
                      className="btn-secondary"
                      style={{ padding: "2px 6px", fontSize: "0.72rem" }}
                      onClick={() => handleStepSpecificDate(1)}
                      title="Next Day"
                    >
                      <ChevronRight size={13} />
                    </button>
                    <button
                      type="button"
                      className="btn-secondary"
                      style={{ padding: "2px 8px", fontSize: "0.72rem", fontWeight: 700 }}
                      onClick={() => setSpecificDate(todayStr)}
                    >
                      Today
                    </button>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 700, marginLeft: "0.25rem" }}>
                      ({formatFriendlyDate(specificDate)})
                    </span>
                  </div>
                )}

                {/* Sub-bar: Custom Date Range Pickers */}
                {dateFilterPreset === "custom" && (
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.6rem",
                    flexWrap: "wrap",
                    background: "#ffffff",
                    padding: "0.45rem 0.75rem",
                    borderRadius: "8px",
                    border: "1px dashed var(--gold-300)"
                  }}>
                    <span style={{ fontSize: "0.74rem", fontWeight: 700, color: "var(--gold-600)" }}>
                      Date Range:
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>From:</span>
                      <input
                        type="date"
                        className="form-input"
                        style={{ padding: "0.25rem 0.5rem", fontSize: "0.78rem", width: "135px" }}
                        value={customRange.start}
                        onChange={(e) => setCustomRange(prev => ({ ...prev, start: e.target.value }))}
                      />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>To:</span>
                      <input
                        type="date"
                        className="form-input"
                        style={{ padding: "0.25rem 0.5rem", fontSize: "0.78rem", width: "135px" }}
                        value={customRange.end}
                        onChange={(e) => setCustomRange(prev => ({ ...prev, end: e.target.value }))}
                      />
                    </div>
                    {(customRange.start || customRange.end) && (
                      <button
                        type="button"
                        className="btn-secondary"
                        style={{ padding: "2px 6px", fontSize: "0.7rem", color: "var(--text-muted)" }}
                        onClick={() => setCustomRange({ start: "", end: "" })}
                      >
                        Clear Range
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Bookings Table List */}
            {sortedQuotes.length === 0 ? (
              <div style={{ textAlign: "center", padding: "3.5rem 1rem", color: "var(--text-muted)" }}>
                <Calendar size={48} style={{ opacity: 0.25, marginBottom: "0.75rem", color: "var(--gold-500)" }} />
                <h4 style={{ color: "var(--text-primary)", fontWeight: 700, marginBottom: "0.35rem" }}>
                  No bookings found for the selected filter
                </h4>
                <p style={{ fontSize: "0.85rem", maxWidth: "420px", margin: "0 auto 1.25rem auto" }}>
                  {isDateFilterActive 
                    ? `There are no catering reservations matching "${dateFilterDescription}".`
                    : "No quotations or bookings match your search query."}
                </p>
                <div style={{ display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap" }}>
                  {isDateFilterActive && (
                    <button
                      type="button"
                      className="btn-secondary"
                      style={{ fontSize: "0.8rem", padding: "0.4rem 0.85rem" }}
                      onClick={handleResetDateFilter}
                    >
                      <RotateCcw size={14} />
                      <span>View All Dates</span>
                    </button>
                  )}
                  {dateFilterPreset === "specific" && onOpenDirectBooking && !isSpecificDateFullyBooked && (
                    <button
                      type="button"
                      className="btn-primary"
                      style={{ fontSize: "0.8rem", padding: "0.4rem 0.95rem" }}
                      onClick={() => onOpenDirectBooking(specificDate)}
                    >
                      <Plus size={14} />
                      <span>+ Book an Event on {specificDate}</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="dashboard-table-container">
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th>Quote Ref</th>
                      <th>Client & Brand</th>
                      <th style={{ background: dateFilterField === "eventDate" && isDateFilterActive ? "var(--gold-50)" : "inherit" }}>
                        Event Date & Venue
                      </th>
                      <th>Package & Pax</th>
                      <th>Total Amount</th>
                      <th>Status</th>
                      <th style={{ textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedQuotes.map(q => {
                      const quoteDateStr = q.eventDate ? q.eventDate.split("T")[0] : "";
                      const isToday = quoteDateStr === todayStr;
                      const isTomorrow = quoteDateStr === tomorrowStr;

                      return (
                        <tr key={q.id}>
                          <td>
                            {q.bookingReference ? (
                              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                                <span style={{ fontSize: "0.65rem", background: "#ecfdf5", color: "#047857", padding: "1px 6px", borderRadius: "4px", fontWeight: 800, width: "fit-content" }}>
                                  BOOKING REF
                                </span>
                                <strong style={{ color: "#047857", fontFamily: "monospace", fontSize: "0.8rem", wordBreak: "break-all" }}>
                                  {q.bookingReference}
                                </strong>
                                <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontFamily: "monospace" }}>
                                  Quote: {q.id}
                                </span>
                              </div>
                            ) : (
                              <strong style={{ color: "var(--gold-600)", fontFamily: "monospace" }}>{q.id}</strong>
                            )}
                          </td>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                              <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{q.clientName}</span>
                              {q.companyName && (
                                <span style={{ fontSize: "0.68rem", background: "#fef3c7", color: "#92400e", padding: "1px 6px", borderRadius: "4px", fontWeight: 700 }} title={`Booked with ${q.companyName}`}>
                                  {q.companyName.split(" ")[0]}
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                              {q.contactNumber} • {q.eventTypeName || q.eventType}
                            </div>
                          </td>
                          <td style={{ background: dateFilterField === "eventDate" && isDateFilterActive ? "var(--gold-50)" : "transparent" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "5px", flexWrap: "wrap" }}>
                              <strong style={{ color: "var(--text-primary)", fontSize: "0.85rem" }}>
                                {q.eventDate ? formatFriendlyDate(q.eventDate) : "Date TBA"}
                              </strong>
                              {isToday && (
                                <span style={{ fontSize: "0.63rem", background: "var(--gold-100)", color: "var(--gold-600)", padding: "1px 5px", borderRadius: "4px", fontWeight: 800 }}>
                                  TODAY
                                </span>
                              )}
                              {isTomorrow && (
                                <span style={{ fontSize: "0.63rem", background: "#ecfdf5", color: "#047857", padding: "1px 5px", borderRadius: "4px", fontWeight: 800 }}>
                                  TOMORROW
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                              {q.eventTime ? `${formatTime12Hour(q.eventTime)} • ` : ""}{q.venueName || "Venue TBA"}
                            </div>
                          </td>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                              <span style={{ fontWeight: 600 }}>{q.packageName}</span>
                              {q.serviceType === "promo" || q.isPromo || q.packageId?.startsWith("promo_") ? (
                                <span style={{ fontSize: "0.65rem", background: "#fef2f2", color: "#b91c1c", border: "1px solid #fca5a5", padding: "1px 6px", borderRadius: "4px", fontWeight: 700 }}>
                                  🎄 Bermonths Promo
                                </span>
                              ) : q.serviceType === "packed_meal" || q.isPackedMeal || q.packageId?.startsWith("pm_") ? (
                                <span style={{ fontSize: "0.65rem", background: "#fff7ed", color: "#c2410c", border: "1px solid #fed7aa", padding: "1px 6px", borderRadius: "4px", fontWeight: 700 }}>
                                  🍱 Packed Meal
                                </span>
                              ) : q.serviceType === "food_tray" || q.isFoodTray || q.packageId?.startsWith("food_tray") ? (
                                <span style={{ fontSize: "0.65rem", background: "var(--gold-100)", color: "var(--gold-800)", padding: "1px 6px", borderRadius: "4px", fontWeight: 700 }}>
                                  🍱 Food Tray
                                </span>
                              ) : q.serviceType === "pica_pica" || q.isPicaPica || q.packageId?.startsWith("pica_pica") ? (
                                <span style={{ fontSize: "0.65rem", background: "#fdf2f8", color: "#9d174d", border: "1px solid #fbcfe8", padding: "1px 6px", borderRadius: "4px", fontWeight: 700 }}>
                                  🍢 Pica Pica
                                </span>
                              ) : q.serviceType === "grazing_table" || q.isGrazingTable || q.packageId?.startsWith("grazing_") ? (
                                <span style={{ fontSize: "0.65rem", background: "#fffbeb", color: "#b45309", border: "1px solid #fde68a", padding: "1px 6px", borderRadius: "4px", fontWeight: 700 }}>
                                  🧀 Grazing Table
                                </span>
                              ) : (
                                <span style={{ fontSize: "0.65rem", background: "#f1f5f9", color: "#475569", padding: "1px 6px", borderRadius: "4px", fontWeight: 700 }}>
                                  🍽️ Buffet
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: "0.75rem", color: "var(--gold-600)", fontWeight: 600 }}>
                              {q.pax} Guests {q.paxRange ? `• ${q.paxRange}` : ""}
                            </div>
                          </td>
                          <td>
                            <div style={{ fontWeight: 800, fontFamily: "monospace", color: "var(--text-primary)" }}>
                              ₱{q.grandTotal?.toLocaleString()}
                            </div>
                            {q.isFullyPaid ? (
                              <div style={{ marginTop: "3px" }}>
                                <span 
                                  style={{ 
                                    fontSize: "0.68rem", 
                                    background: "#ecfdf5", 
                                    color: "#047857", 
                                    border: "1px solid #a7f3d0", 
                                    padding: "2px 6px", 
                                    borderRadius: "4px", 
                                    fontWeight: 800, 
                                    display: "inline-flex", 
                                    alignItems: "center", 
                                    gap: "3px",
                                    cursor: onOpenPaymentDetails ? "pointer" : "default"
                                  }}
                                  title={q.status === "Completed" 
                                    ? `Fully Paid via ${q.finalPaymentMethod || q.depositPaymentMethod || "Cash"} (Locked - Completed). Click to view details.` 
                                    : `Fully Paid via ${q.finalPaymentMethod || q.depositPaymentMethod || "Cash"}. Click to view details.`}
                                  onClick={() => onOpenPaymentDetails && onOpenPaymentDetails(q, "ongoing")}
                                >
                                  ✓ Fully Paid ({q.finalPaymentMethod || q.depositPaymentMethod || "Cash"})
                                </span>
                              </div>
                            ) : q.depositAmount ? (
                              <div style={{ marginTop: "3px", display: "flex", flexDirection: "column", gap: "2px" }}>
                                <span 
                                  style={{ 
                                    fontSize: "0.68rem", 
                                    background: "#eff6ff", 
                                    color: "#1d4ed8", 
                                    border: "1px solid #bfdbfe", 
                                    padding: "1px 6px", 
                                    borderRadius: "4px", 
                                    fontWeight: 700, 
                                    display: "inline-flex", 
                                    alignItems: "center", 
                                    gap: "3px",
                                    width: "fit-content",
                                    cursor: onOpenPaymentDetails ? "pointer" : "default"
                                  }}
                                  title={q.status === "Completed"
                                    ? `Deposit ₱${Number(q.depositAmount).toLocaleString()} via ${q.depositPaymentMethod || "Cash"} (Locked - Completed). Click to view details.`
                                    : `Deposit ₱${Number(q.depositAmount).toLocaleString()} via ${q.depositPaymentMethod || "Cash"}${q.depositNotes ? ` - "${q.depositNotes}"` : ""}. Click to view details.`}
                                  onClick={() => onOpenPaymentDetails && onOpenPaymentDetails(q, "deposit")}
                                >
                                  DP: ₱{Number(q.depositAmount).toLocaleString()} ({q.depositPaymentMethod || "Cash"})
                                </span>
                                <span style={{ fontSize: "0.68rem", color: "#b45309", fontWeight: 700 }}>
                                  Bal: ₱{(q.balanceDue !== undefined ? q.balanceDue : (q.grandTotal - q.depositAmount)).toLocaleString()}
                                </span>
                              </div>
                            ) : (
                              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "2px" }}>
                                DP: ₱{q.downpaymentRequired?.toLocaleString()}
                              </div>
                            )}
                          </td>
                          <td>
                            {q.status === "Completed" ? (
                              <span 
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "5px",
                                  padding: "0.3rem 0.65rem",
                                  fontSize: "0.75rem",
                                  fontWeight: 800,
                                  color: "#7e22ce",
                                  background: "#faf5ff",
                                  border: "1px solid #d8b4fe",
                                  borderRadius: "6px"
                                }}
                                title="This booking is Completed and locked against changes"
                              >
                                🔒 Completed (Locked)
                              </span>
                            ) : (
                              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                <select
                                  className="form-select"
                                  style={{ 
                                    padding: "0.3rem 0.5rem", 
                                    fontSize: "0.75rem", 
                                    width: "auto",
                                    fontWeight: 700,
                                    color: q.status === "Ongoing" ? "#b45309" : q.status === "Confirmed" ? "#047857" : q.status === "Cancelled" ? "#b91c1c" : "inherit",
                                    background: q.status === "Ongoing" ? "#fffbeb" : q.status === "Confirmed" ? "#ecfdf5" : q.status === "Cancelled" ? "#fef2f2" : "inherit",
                                    borderColor: q.status === "Ongoing" ? "#fde68a" : q.status === "Confirmed" ? "#a7f3d0" : ""
                                  }}
                                  value={q.status || "Draft"}
                                  onChange={(e) => onUpdateStatus(q.id, e.target.value)}
                                >
                                  <option value="Draft">Draft</option>
                                  <option value="Sent">Sent to Client</option>
                                  <option value="Confirmed">Confirmed Booking</option>
                                  <option value="Ongoing">Ongoing Event</option>
                                  <option value="Completed">Completed</option>
                                  <option value="Cancelled">Cancelled</option>
                                </select>

                                {/* Quick Workflow Buttons */}
                                {(q.status === "Draft" || q.status === "Sent") && (
                                  <button
                                    type="button"
                                    onClick={() => onUpdateStatus(q.id, "Confirmed")}
                                    style={{
                                      background: "#ecfdf5",
                                      border: "1px solid #a7f3d0",
                                      color: "#047857",
                                      fontSize: "0.68rem",
                                      fontWeight: 800,
                                      padding: "2px 6px",
                                      borderRadius: "4px",
                                      cursor: "pointer",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      gap: "3px"
                                    }}
                                    title="Confirm booking and record deposit payment"
                                  >
                                    <CheckCircle2 size={11} />
                                    <span>Confirm & DP</span>
                                  </button>
                                )}

                                {q.status === "Confirmed" && (
                                  <button
                                    type="button"
                                    onClick={() => onUpdateStatus(q.id, "Ongoing")}
                                    style={{
                                      background: "#fffbeb",
                                      border: "1px solid #fde68a",
                                      color: "#b45309",
                                      fontSize: "0.68rem",
                                      fontWeight: 800,
                                      padding: "2px 6px",
                                      borderRadius: "4px",
                                      cursor: "pointer",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      gap: "3px"
                                    }}
                                    title="Verify full payment and set as ongoing event"
                                  >
                                    <span>▶ Verify & Ongoing</span>
                                  </button>
                                )}
                              </div>
                            )}
                          </td>
                          <td style={{ textAlign: "right" }}>
                            <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                              {(q.depositAmount || q.isFullyPaid || q.status === "Confirmed" || q.status === "Ongoing" || q.status === "Completed") && (
                                <button
                                  className="btn-secondary"
                                  style={{ 
                                    padding: "0.4rem 0.6rem", 
                                    color: q.status === "Completed" ? "#7e22ce" : "#047857", 
                                    borderColor: q.status === "Completed" ? "#d8b4fe" : "#a7f3d0",
                                    background: q.status === "Completed" ? "#faf5ff" : "inherit"
                                  }}
                                  title={q.status === "Completed" ? "View Payment Details (Locked - Completed)" : "View / Edit Payment Details"}
                                  onClick={() => onOpenPaymentDetails && onOpenPaymentDetails(q, q.status === "Ongoing" || q.status === "Completed" ? "ongoing" : "deposit")}
                                >
                                  <Banknote size={15} />
                                </button>
                              )}
                              <button
                                className="btn-secondary"
                                style={{ padding: "0.4rem 0.6rem" }}
                                title="View & Print Quotation"
                                onClick={() => onViewQuote(q)}
                              >
                                <Eye size={15} />
                              </button>
                              <button
                                className="btn-secondary"
                                style={{ padding: "0.4rem 0.6rem", color: "#2563eb", borderColor: "#bfdbfe" }}
                                title="Ingress & Egress Equipment Manifest"
                                onClick={() => onOpenIngress && onOpenIngress(q)}
                              >
                                <ClipboardCheck size={15} />
                              </button>
                              <button
                                className="btn-secondary"
                                style={{ padding: "0.4rem 0.6rem", color: "var(--red-400)" }}
                                title="Delete Record"
                                onClick={() => onDeleteQuote(q.id)}
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
