import React, { useState, useMemo, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  Users,
  MapPin,
  Eye,
  Plus,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  X,
  CreditCard,
  ClipboardCheck,
  Building2,
  CalendarDays
} from "lucide-react";
import { MAX_CONFIRMED_BOOKINGS_PER_DAY, formatTime12Hour } from "../utils/bookingUtils";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function BookingCalendarView({
  quotations = [],
  activeCompany,
  userRole = "company_admin",
  onViewQuote,
  onUpdateStatus,
  onOpenPaymentDetails,
  onOpenIngress,
  onOpenDirectBooking,
  onCreateNew,
  initialDate = null
}) {
  const today = useMemo(() => new Date(), []);
  const todayStr = useMemo(() => {
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const d = String(today.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }, [today]);

  const [currentYear, setCurrentYear] = useState(() => {
    if (initialDate && typeof initialDate === "string" && initialDate.includes("-")) {
      const parts = initialDate.split("-");
      if (parts[0] && !isNaN(Number(parts[0]))) return parseInt(parts[0], 10);
    }
    return today.getFullYear();
  });
  const [currentMonth, setCurrentMonth] = useState(() => {
    if (initialDate && typeof initialDate === "string" && initialDate.includes("-")) {
      const parts = initialDate.split("-");
      if (parts[1] && !isNaN(Number(parts[1]))) return parseInt(parts[1], 10) - 1;
    }
    return today.getMonth();
  });
  const [statusFilter, setStatusFilter] = useState("All");
  const [companyFilter, setCompanyFilter] = useState("current");
  const [selectedDay, setSelectedDay] = useState(() => (initialDate && typeof initialDate === "string" ? initialDate : null));

  useEffect(() => {
    if (initialDate && typeof initialDate === "string" && initialDate.includes("-")) {
      const parts = initialDate.split("-");
      if (parts[0] && parts[1]) {
        setCurrentYear(parseInt(parts[0], 10));
        setCurrentMonth(parseInt(parts[1], 10) - 1);
        setSelectedDay(initialDate);
      }
    }
  }, [initialDate]);

  const isSuperAdmin = userRole === "super_admin";
  const effectiveFilter = isSuperAdmin ? companyFilter : "current";

  // Tenant scoping: Company Admins only see their own company's bookings
  const scopedQuotes = useMemo(() => {
    return quotations.filter(q => {
      if (isSuperAdmin && effectiveFilter === "all") return true;
      return q.companyId === activeCompany?.id;
    });
  }, [quotations, isSuperAdmin, effectiveFilter, activeCompany?.id]);

  // Navigate to previous month
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  // Navigate to next month
  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  // Jump to Today
  const handleJumpToday = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
  };

  // Index of bookings by date string (YYYY-MM-DD)
  const bookingsByDate = useMemo(() => {
    const map = {};
    scopedQuotes.forEach(q => {
      if (!q.eventDate) return;
      const d = q.eventDate.split("T")[0];
      if (!map[d]) map[d] = [];
      map[d].push(q);
    });
    return map;
  }, [scopedQuotes]);

  // Compute calendar days grid for current month
  const calendarGrid = useMemo(() => {
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    const cells = [];

    // 1. Previous month trailing days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const prevM = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevY = currentMonth === 0 ? currentYear - 1 : currentYear;
      const dateStr = `${prevY}-${String(prevM + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
      cells.push({
        dayNum,
        dateStr,
        isCurrentMonth: false,
        isPrevMonth: true
      });
    }

    // 2. Current month days
    for (let dayNum = 1; dayNum <= daysInCurrentMonth; dayNum++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
      cells.push({
        dayNum,
        dateStr,
        isCurrentMonth: true,
        isToday: dateStr === todayStr
      });
    }

    // 3. Next month leading days to complete grid (multiples of 7, up to 35 or 42)
    const totalSlots = cells.length > 35 ? 42 : 35;
    const remainingSlots = totalSlots - cells.length;
    for (let dayNum = 1; dayNum <= remainingSlots; dayNum++) {
      const nextM = currentMonth === 11 ? 0 : currentMonth + 1;
      const nextY = currentMonth === 11 ? currentYear + 1 : currentYear;
      const dateStr = `${nextY}-${String(nextM + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
      cells.push({
        dayNum,
        dateStr,
        isCurrentMonth: false,
        isNextMonth: true
      });
    }

    return cells;
  }, [currentYear, currentMonth, todayStr]);

  // Month Statistics
  const monthStats = useMemo(() => {
    const prefix = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}`;
    const thisMonthBookings = scopedQuotes.filter(q => q.eventDate && q.eventDate.startsWith(prefix));

    const confirmed = thisMonthBookings.filter(q => q.status === "Confirmed").length;
    const ongoing = thisMonthBookings.filter(q => q.status === "Ongoing").length;
    const sent = thisMonthBookings.filter(q => q.status === "Sent").length;
    const completed = thisMonthBookings.filter(q => q.status === "Completed").length;

    const pipelineRevenue = thisMonthBookings
      .filter(q => q.status === "Confirmed" || q.status === "Ongoing" || q.status === "Sent")
      .reduce((sum, q) => sum + (q.grandTotal || 0), 0);

    // Count fully booked days (>= MAX_CONFIRMED_BOOKINGS_PER_DAY confirmed/ongoing)
    const datesInMonth = {};
    thisMonthBookings.forEach(q => {
      if (q.status === "Confirmed" || q.status === "Ongoing") {
        const d = q.eventDate.split("T")[0];
        datesInMonth[d] = (datesInMonth[d] || 0) + 1;
      }
    });

    const fullDaysCount = Object.values(datesInMonth).filter(c => c >= MAX_CONFIRMED_BOOKINGS_PER_DAY).length;

    return {
      total: thisMonthBookings.length,
      active: confirmed + ongoing,
      confirmed,
      ongoing,
      sent,
      completed,
      revenue: pipelineRevenue,
      fullDaysCount
    };
  }, [scopedQuotes, currentYear, currentMonth]);

  // Status Styling helper
  const getStatusColor = (status) => {
    switch (status) {
      case "Confirmed":
        return { bg: "#ecfdf5", border: "#a7f3d0", text: "#047857", dot: "#10b981" };
      case "Ongoing":
        return { bg: "#eff6ff", border: "#bfdbfe", text: "#1d4ed8", dot: "#3b82f6" };
      case "Sent":
        return { bg: "#fffbeb", border: "#fde68a", text: "#b45309", dot: "#f59e0b" };
      case "Completed":
        return { bg: "#f5f3ff", border: "#ddd6fe", text: "#6d28d9", dot: "#8b5cf6" };
      case "Cancelled":
        return { bg: "#fef2f2", border: "#fecaca", text: "#b91c1c", dot: "#ef4444" };
      default: // Draft
        return { bg: "#f8fafc", border: "#e2e8f0", text: "#475569", dot: "#94a3b8" };
    }
  };

  // Selected Day Bookings for Drawer
  const selectedDayBookings = useMemo(() => {
    if (!selectedDay) return [];
    const list = bookingsByDate[selectedDay] || [];
    if (statusFilter === "All") return list;
    return list.filter(q => q.status === statusFilter);
  }, [selectedDay, bookingsByDate, statusFilter]);

  const selectedDayConfirmedCount = useMemo(() => {
    if (!selectedDay) return 0;
    const list = bookingsByDate[selectedDay] || [];
    return list.filter(b => b.status === "Confirmed" || b.status === "Ongoing").length;
  }, [selectedDay, bookingsByDate]);

  // Year options: current year - 1 to current year + 4
  const yearOptions = useMemo(() => {
    const start = today.getFullYear() - 1;
    return Array.from({ length: 6 }, (_, i) => start + i);
  }, [today]);

  return (
    <div className="calendar-view-container" style={{ maxWidth: "1280px", margin: "0 auto" }}>
      {/* Top Banner / Monthly Metrics */}
      <div className="calendar-stats-grid" style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "1rem",
        marginBottom: "1.5rem"
      }}>
        <div className="card-section" style={{ marginBottom: 0, padding: "1.1rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.74rem", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: 700 }}>
              {MONTH_NAMES[currentMonth]} Events
            </span>
            <div style={{ background: "var(--gold-50)", color: "var(--gold-600)", padding: "5px", borderRadius: "8px" }}>
              <CalendarIcon size={16} />
            </div>
          </div>
          <div style={{ fontSize: "1.65rem", fontWeight: 800, color: "var(--text-primary)", marginTop: "0.4rem" }}>
            {monthStats.total}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            Total scheduled this month
          </div>
        </div>

        <div className="card-section" style={{ marginBottom: 0, padding: "1.1rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.74rem", textTransform: "uppercase", color: "var(--emerald-600)", fontWeight: 700 }}>
              Confirmed & In-Service
            </span>
            <div style={{ background: "var(--emerald-50)", color: "var(--emerald-600)", padding: "5px", borderRadius: "8px" }}>
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div style={{ fontSize: "1.65rem", fontWeight: 800, color: "var(--emerald-600)", marginTop: "0.4rem" }}>
            {monthStats.active}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            {monthStats.confirmed} Confirmed {monthStats.ongoing > 0 ? `• ${monthStats.ongoing} Ongoing` : ""}
          </div>
        </div>

        <div className="card-section" style={{ marginBottom: 0, padding: "1.1rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.74rem", textTransform: "uppercase", color: "var(--gold-600)", fontWeight: 700 }}>
              Month Pipeline Value
            </span>
            <div style={{ background: "var(--gold-50)", color: "var(--gold-600)", padding: "5px", borderRadius: "8px" }}>
              <DollarSign size={16} />
            </div>
          </div>
          <div style={{ fontSize: "1.65rem", fontWeight: 800, color: "var(--gold-600)", marginTop: "0.4rem" }}>
            ₱{monthStats.revenue.toLocaleString()}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            Estimated gross billing
          </div>
        </div>

        <div className="card-section" style={{ marginBottom: 0, padding: "1.1rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.74rem", textTransform: "uppercase", color: monthStats.fullDaysCount > 0 ? "#dc2626" : "var(--text-muted)", fontWeight: 700 }}>
              Maxed-Out Dates (3/3)
            </span>
            <div style={{ background: monthStats.fullDaysCount > 0 ? "#fef2f2" : "#f1f5f9", color: monthStats.fullDaysCount > 0 ? "#dc2626" : "var(--text-muted)", padding: "5px", borderRadius: "8px" }}>
              <AlertTriangle size={16} />
            </div>
          </div>
          <div style={{ fontSize: "1.65rem", fontWeight: 800, color: monthStats.fullDaysCount > 0 ? "#dc2626" : "var(--text-primary)", marginTop: "0.4rem" }}>
            {monthStats.fullDaysCount} {monthStats.fullDaysCount === 1 ? "Day" : "Days"}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            At max capacity (3 bookings)
          </div>
        </div>
      </div>

      {/* Main Calendar Card */}
      <div className="card-section" style={{ padding: "1.25rem", border: "1px solid var(--border-subtle)", boxShadow: "var(--shadow-sm)" }}>
        {/* Calendar Controls & Month Switcher */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
          paddingBottom: "1.25rem",
          borderBottom: "1px solid var(--border-subtle)"
        }}>
          {/* Left: Navigation Buttons & Month/Year Title */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <button
                type="button"
                className="btn-secondary"
                style={{ padding: "0.4rem 0.6rem", borderRadius: "8px" }}
                onClick={handlePrevMonth}
                title="Previous Month"
                aria-label="Previous Month"
              >
                <ChevronLeft size={16} />
              </button>

              <button
                type="button"
                className="btn-secondary"
                style={{ padding: "0.4rem 0.6rem", borderRadius: "8px" }}
                onClick={handleNextMonth}
                title="Next Month"
                aria-label="Next Month"
              >
                <ChevronRight size={16} />
              </button>

              <button
                type="button"
                className="btn-secondary"
                style={{ padding: "0.4rem 0.75rem", fontSize: "0.78rem", fontWeight: 700 }}
                onClick={handleJumpToday}
                title="Jump to Current Month"
              >
                Today
              </button>
            </div>

            {/* Month & Year Selectors */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <select
                className="form-input"
                style={{ padding: "0.4rem 0.75rem", fontWeight: 800, fontSize: "1rem", color: "var(--text-primary)", cursor: "pointer", width: "auto" }}
                value={currentMonth}
                onChange={(e) => setCurrentMonth(Number(e.target.value))}
              >
                {MONTH_NAMES.map((m, idx) => (
                  <option key={m} value={idx}>{m}</option>
                ))}
              </select>

              <select
                className="form-input"
                style={{ padding: "0.4rem 0.75rem", fontWeight: 800, fontSize: "1rem", color: "var(--text-primary)", cursor: "pointer", width: "auto" }}
                value={currentYear}
                onChange={(e) => setCurrentYear(Number(e.target.value))}
              >
                {yearOptions.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Right: Status Filters & SuperAdmin Tenant Toggle */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
            {isSuperAdmin && (
              <button
                type="button"
                style={{
                  background: companyFilter === "all" ? "var(--gold-50)" : "#ffffff",
                  border: `1px solid ${companyFilter === "all" ? "var(--gold-500)" : "var(--border-subtle)"}`,
                  color: companyFilter === "all" ? "var(--gold-700)" : "var(--text-secondary)",
                  padding: "0.35rem 0.7rem",
                  borderRadius: "8px",
                  fontSize: "0.76rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.3rem"
                }}
                onClick={() => setCompanyFilter(prev => prev === "current" ? "all" : "current")}
                title="SuperAdmin: Toggle company scoping"
              >
                <span>{companyFilter === "current" ? `🏢 ${activeCompany?.name?.split(" ")[0] || "Active"}` : "🌐 All Brands"}</span>
              </button>
            )}

            {/* Filter status pills */}
            <div style={{ display: "flex", gap: "3px", background: "#f1f5f9", padding: "3px", borderRadius: "8px" }}>
              {["All", "Confirmed", "Ongoing", "Sent", "Completed"].map(status => (
                <button
                  key={status}
                  style={{
                    background: statusFilter === status ? "var(--gold-gradient)" : "transparent",
                    color: statusFilter === status ? "#ffffff" : "var(--text-secondary)",
                    border: "none",
                    padding: "3px 9px",
                    borderRadius: "6px",
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    cursor: "pointer"
                  }}
                  onClick={() => setStatusFilter(status)}
                >
                  {status}
                </button>
              ))}
            </div>

            {onOpenDirectBooking && (
              <button
                type="button"
                className="btn-secondary"
                style={{ padding: "0.4rem 0.75rem", fontSize: "0.78rem", borderColor: "var(--border-gold)", color: "var(--gold-600)" }}
                onClick={() => onOpenDirectBooking()}
                title="Intake Direct Booking"
              >
                <Plus size={13} />
                <span>+ Intake</span>
              </button>
            )}

            {onCreateNew && (
              <button
                type="button"
                className="btn-primary"
                style={{ padding: "0.4rem 0.8rem", fontSize: "0.78rem" }}
                onClick={onCreateNew}
                title="Create Quotation"
              >
                <Plus size={13} />
                <span>Quote Calc</span>
              </button>
            )}
          </div>
        </div>

        {/* Legend Ribbon */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0.6rem 0",
          fontSize: "0.72rem",
          color: "var(--text-muted)",
          borderBottom: "1px solid var(--border-subtle)",
          flexWrap: "wrap",
          gap: "0.5rem"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
            <span style={{ fontWeight: 700, textTransform: "uppercase" }}>Status Legend:</span>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981", display: "inline-block" }} />
              <span>Confirmed</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#3b82f6", display: "inline-block" }} />
              <span>Ongoing (In-Service)</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#f59e0b", display: "inline-block" }} />
              <span>Sent / Inquiry</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#8b5cf6", display: "inline-block" }} />
              <span>Completed</span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
            <span style={{ fontWeight: 700, textTransform: "uppercase" }}>Daily Limit:</span>
            <span style={{ background: "#ecfdf5", color: "#047857", padding: "1px 6px", borderRadius: "4px", fontWeight: 700 }}>
              Max 3 Events / Day
            </span>
          </div>
        </div>

        {/* 7-Day Header */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          background: "#f8fafc",
          borderBottom: "1px solid var(--border-subtle)",
          textAlign: "center",
          fontWeight: 800,
          fontSize: "0.78rem",
          color: "var(--text-secondary)",
          padding: "0.6rem 0"
        }}>
          {DAY_NAMES.map((dayName, idx) => (
            <div key={dayName} style={{ color: (idx === 0 || idx === 6) ? "var(--gold-600)" : "inherit" }}>
              {dayName}
            </div>
          ))}
        </div>

        {/* Calendar Days 7-Column Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          borderLeft: "1px solid var(--border-subtle)",
          borderTop: "1px solid var(--border-subtle)",
          background: "var(--border-subtle)",
          gap: "1px"
        }}>
          {calendarGrid.map((cell) => {
            const allDayBookings = bookingsByDate[cell.dateStr] || [];
            const dayBookings = statusFilter === "All"
              ? allDayBookings
              : allDayBookings.filter(q => q.status === statusFilter);

            const confirmedCount = allDayBookings.filter(b => b.status === "Confirmed" || b.status === "Ongoing").length;
            const isFull = confirmedCount >= MAX_CONFIRMED_BOOKINGS_PER_DAY;
            const remainingSlots = Math.max(0, MAX_CONFIRMED_BOOKINGS_PER_DAY - confirmedCount);
            const isSelected = selectedDay === cell.dateStr;

            return (
              <div
                key={cell.dateStr}
                onClick={() => setSelectedDay(cell.dateStr)}
                style={{
                  background: cell.isCurrentMonth
                    ? cell.isToday
                      ? "#fffdf7"
                      : "#ffffff"
                    : "#f8fafc",
                  opacity: cell.isCurrentMonth ? 1 : 0.6,
                  minHeight: "115px",
                  padding: "0.45rem",
                  display: "flex",
                  flexDirection: "column",
                  cursor: "pointer",
                  position: "relative",
                  transition: "background 0.15s, box-shadow 0.15s",
                  outline: isSelected ? "2px solid var(--gold-500)" : "none",
                  outlineOffset: "-2px",
                  boxShadow: isSelected ? "inset 0 0 0 1px var(--gold-500)" : "none"
                }}
                className="calendar-day-cell"
              >
                {/* Cell Header: Day Number & Capacity Indicator */}
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "4px"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <span style={{
                      fontWeight: cell.isToday ? 900 : 700,
                      fontSize: "0.85rem",
                      color: cell.isToday
                        ? "#ffffff"
                        : cell.isCurrentMonth
                          ? "var(--text-primary)"
                          : "var(--text-dim)",
                      background: cell.isToday ? "var(--gold-600)" : "transparent",
                      width: cell.isToday ? "24px" : "auto",
                      height: cell.isToday ? "24px" : "auto",
                      borderRadius: cell.isToday ? "50%" : "0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}>
                      {cell.dayNum}
                    </span>

                    {cell.isToday && (
                      <span style={{ fontSize: "0.6rem", color: "var(--gold-600)", fontWeight: 800 }}>
                        TODAY
                      </span>
                    )}
                  </div>

                  {/* Daily Capacity Badge */}
                  {cell.isCurrentMonth && (
                    <div>
                      {isFull ? (
                        <span style={{
                          fontSize: "0.62rem",
                          background: "#fef2f2",
                          color: "#dc2626",
                          border: "1px solid #fecaca",
                          padding: "1px 5px",
                          borderRadius: "4px",
                          fontWeight: 800
                        }} title="Daily capacity reached (3/3 Confirmed Events)">
                          FULL (3/3)
                        </span>
                      ) : confirmedCount > 0 ? (
                        <span style={{
                          fontSize: "0.62rem",
                          background: confirmedCount === 2 ? "#fffbeb" : "#ecfdf5",
                          color: confirmedCount === 2 ? "#b45309" : "#047857",
                          border: `1px solid ${confirmedCount === 2 ? "#fde68a" : "#a7f3d0"}`,
                          padding: "1px 5px",
                          borderRadius: "4px",
                          fontWeight: 700
                        }} title={`${confirmedCount}/3 confirmed events booked`}>
                          {confirmedCount}/3
                        </span>
                      ) : (
                        <span style={{
                          fontSize: "0.6rem",
                          color: "var(--text-dim)",
                          padding: "1px 4px"
                        }}>
                          3 open
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Event Chips List */}
                <div style={{ display: "flex", flexDirection: "column", gap: "3px", flex: 1 }}>
                  {dayBookings.slice(0, 3).map((booking) => {
                    const style = getStatusColor(booking.status);
                    return (
                      <div
                        key={booking.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDay(cell.dateStr);
                          if (onViewQuote) onViewQuote(booking);
                        }}
                        style={{
                          background: style.bg,
                          border: `1px solid ${style.border}`,
                          color: style.text,
                          padding: "2px 5px",
                          borderRadius: "4px",
                          fontSize: "0.68rem",
                          fontWeight: 700,
                          lineHeight: 1.25,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          cursor: "pointer"
                        }}
                        title={`${formatTime12Hour(booking.eventTime)} • ${booking.clientName} (${booking.pax} Pax) • ${booking.status}`}
                      >
                        <span style={{
                          width: "5px",
                          height: "5px",
                          borderRadius: "50%",
                          background: style.dot,
                          flexShrink: 0
                        }} />
                        <span style={{ fontWeight: 800, fontSize: "0.65rem", flexShrink: 0 }}>
                          {booking.eventTime ? formatTime12Hour(booking.eventTime) : "Event"}:
                        </span>
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                          {booking.clientName || "Client"}
                        </span>
                        <span style={{ fontSize: "0.62rem", opacity: 0.85, flexShrink: 0, marginLeft: "auto" }}>
                          {booking.pax}p
                        </span>
                      </div>
                    );
                  })}

                  {dayBookings.length > 3 && (
                    <div style={{
                      fontSize: "0.63rem",
                      color: "var(--gold-600)",
                      fontWeight: 800,
                      textAlign: "right",
                      paddingRight: "2px",
                      marginTop: "auto"
                    }}>
                      +{dayBookings.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Slide-Over Drawer / Details Modal */}
      {selectedDay && (
        <div
          className="calendar-drawer-backdrop"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.45)",
            backdropFilter: "blur(4px)",
            zIndex: 9999,
            display: "flex",
            justifyContent: "flex-end",
            animation: "fadeIn 0.2s ease"
          }}
          onClick={() => setSelectedDay(null)}
        >
          <div
            className="calendar-drawer-panel"
            style={{
              width: "100%",
              maxWidth: "520px",
              background: "#ffffff",
              height: "100%",
              boxShadow: "var(--shadow-lg)",
              display: "flex",
              flexDirection: "column",
              animation: "slideInRight 0.25s ease"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div style={{
              padding: "1.25rem 1.5rem",
              borderBottom: "1px solid var(--border-subtle)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              background: "#fafafa"
            }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <CalendarDays size={20} color="var(--gold-600)" />
                  <h2 style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                    {new Date(selectedDay + "T00:00:00").toLocaleDateString("en-PH", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric"
                    })}
                  </h2>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginTop: "0.4rem" }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    Capacity Status:
                  </span>
                  {selectedDayConfirmedCount >= MAX_CONFIRMED_BOOKINGS_PER_DAY ? (
                    <span style={{
                      fontSize: "0.72rem",
                      background: "#fef2f2",
                      color: "#dc2626",
                      border: "1px solid #fecaca",
                      padding: "2px 8px",
                      borderRadius: "6px",
                      fontWeight: 800
                    }}>
                      ⚠️ FULLY BOOKED ({selectedDayConfirmedCount}/3 Slots Taken)
                    </span>
                  ) : (
                    <span style={{
                      fontSize: "0.72rem",
                      background: "#ecfdf5",
                      color: "#047857",
                      border: "1px solid #a7f3d0",
                      padding: "2px 8px",
                      borderRadius: "6px",
                      fontWeight: 700
                    }}>
                      ✓ {MAX_CONFIRMED_BOOKINGS_PER_DAY - selectedDayConfirmedCount} Slot(s) Available ({selectedDayConfirmedCount}/3 Booked)
                    </span>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedDay(null)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-muted)",
                  padding: "4px",
                  borderRadius: "6px"
                }}
                title="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* Drawer Body: Bookings List */}
            <div style={{ flex: 1, overflowY: "auto", padding: "1.25rem 1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <span style={{ fontSize: "0.78rem", fontWeight: 800, textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: "0.5px" }}>
                  Scheduled Events ({selectedDayBookings.length})
                </span>

                {onOpenDirectBooking && (
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ padding: "0.35rem 0.75rem", fontSize: "0.75rem", color: "var(--gold-600)", borderColor: "var(--border-gold)" }}
                    onClick={() => {
                      onOpenDirectBooking(selectedDay);
                      setSelectedDay(null);
                    }}
                  >
                    <Plus size={13} />
                    <span>+ Book This Date</span>
                  </button>
                )}
              </div>

              {selectedDayBookings.length === 0 ? (
                <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--text-muted)" }}>
                  <CalendarIcon size={36} style={{ opacity: 0.3, marginBottom: "0.5rem" }} />
                  <p style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--text-secondary)" }}>
                    No events scheduled for this date.
                  </p>
                  <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "4px" }}>
                    All 3 catering service slots are wide open!
                  </p>
                  {onOpenDirectBooking && (
                    <button
                      type="button"
                      className="btn-primary"
                      style={{ marginTop: "1rem", padding: "0.45rem 1rem", fontSize: "0.82rem" }}
                      onClick={() => {
                        onOpenDirectBooking(selectedDay);
                        setSelectedDay(null);
                      }}
                    >
                      <Plus size={14} />
                      <span>Intake Booking for {selectedDay}</span>
                    </button>
                  )}
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {selectedDayBookings.map((b) => {
                    const statusStyle = getStatusColor(b.status);
                    return (
                      <div
                        key={b.id}
                        style={{
                          background: "#ffffff",
                          border: "1px solid var(--border-subtle)",
                          borderRadius: "12px",
                          padding: "1rem",
                          boxShadow: "var(--shadow-xs)",
                          transition: "border-color 0.2s"
                        }}
                      >
                        {/* Event Card Header */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem", marginBottom: "0.5rem" }}>
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", flexWrap: "wrap" }}>
                              <span style={{
                                fontSize: "0.68rem",
                                background: statusStyle.bg,
                                color: statusStyle.text,
                                border: `1px solid ${statusStyle.border}`,
                                padding: "2px 7px",
                                borderRadius: "4px",
                                fontWeight: 800
                              }}>
                                {b.status}
                              </span>
                              {b.serviceType === "food_tray" || b.isFoodTray || b.packageId?.startsWith("food_tray") ? (
                                <span style={{ fontSize: "0.65rem", background: "var(--gold-100)", color: "var(--gold-800)", padding: "1px 6px", borderRadius: "4px", fontWeight: 700 }}>
                                  🍱 Food Tray
                                </span>
                              ) : b.serviceType === "pica_pica" || b.isPicaPica || b.packageId?.startsWith("pica_pica") ? (
                                <span style={{ fontSize: "0.65rem", background: "#fdf2f8", color: "#9d174d", border: "1px solid #fbcfe8", padding: "1px 6px", borderRadius: "4px", fontWeight: 700 }}>
                                  🍢 Pica Pica
                                </span>
                              ) : b.serviceType === "grazing_table" || b.isGrazingTable || b.packageId?.startsWith("grazing_") ? (
                                <span style={{ fontSize: "0.65rem", background: "#fffbeb", color: "#b45309", border: "1px solid #fde68a", padding: "1px 6px", borderRadius: "4px", fontWeight: 700 }}>
                                  🧀 Grazing Table
                                </span>
                              ) : null}
                              {b.bookingReference ? (
                                <span style={{ fontSize: "0.72rem", fontFamily: "monospace", color: "#047857", fontWeight: 700 }}>
                                  {b.bookingReference}
                                </span>
                              ) : (
                                <span style={{ fontSize: "0.72rem", fontFamily: "monospace", color: "var(--text-muted)" }}>
                                  Quote #{b.id}
                                </span>
                              )}
                            </div>
                            <h3 style={{ fontSize: "1rem", fontWeight: 800, color: "var(--text-primary)", marginTop: "4px", margin: "4px 0 0" }}>
                              {b.clientName}
                            </h3>
                            {b.packageName && (
                              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>
                                {b.packageName}
                              </div>
                            )}
                          </div>

                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontWeight: 800, fontSize: "1rem", color: "var(--text-primary)", fontFamily: "monospace" }}>
                              ₱{b.grandTotal?.toLocaleString()}
                            </div>
                            {b.isFullyPaid ? (
                              <span style={{ fontSize: "0.65rem", color: "#047857", fontWeight: 800 }}>✓ Fully Paid</span>
                            ) : b.downpaymentCollected ? (
                              <span style={{ fontSize: "0.65rem", color: "#b45309", fontWeight: 700 }}>Deposit Collected</span>
                            ) : (
                              <span style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>Unpaid</span>
                            )}
                          </div>
                        </div>

                        {/* Event Key Details */}
                        <div style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: "0.5rem",
                          fontSize: "0.78rem",
                          color: "var(--text-secondary)",
                          background: "#f8fafc",
                          padding: "0.65rem",
                          borderRadius: "8px",
                          marginBottom: "0.75rem"
                        }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                            <Clock size={14} color="var(--text-muted)" />
                            <span>Serving: <strong>{formatTime12Hour(b.eventTime)}</strong></span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                            <Users size={14} color="var(--text-muted)" />
                            <span>Pax: <strong>{b.pax} Guests</strong></span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                            <CalendarIcon size={14} color="var(--text-muted)" />
                            <span>Type: <strong>{b.eventTypeName || b.eventType || "Event"}</strong></span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                            <MapPin size={14} color="var(--text-muted)" />
                            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {b.venueName || "Venue TBA"}
                            </span>
                          </div>
                        </div>

                        {/* Card Action Buttons */}
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                          {onViewQuote && (
                            <button
                              type="button"
                              className="btn-secondary"
                              style={{ padding: "0.35rem 0.65rem", fontSize: "0.74rem" }}
                              onClick={() => {
                                onViewQuote(b);
                                setSelectedDay(null);
                              }}
                            >
                              <Eye size={13} />
                              <span>View Quote</span>
                            </button>
                          )}

                          {onOpenPaymentDetails && (
                            <button
                              type="button"
                              className="btn-secondary"
                              style={{ 
                                padding: "0.35rem 0.65rem", 
                                fontSize: "0.74rem", 
                                borderColor: b.status === "Completed" ? "#d8b4fe" : "var(--border-gold)", 
                                color: b.status === "Completed" ? "#7e22ce" : "var(--gold-600)",
                                background: b.status === "Completed" ? "#faf5ff" : "inherit"
                              }}
                              title={b.status === "Completed" ? "View Payment Details (Locked - Completed)" : "Payment / Deposit Details"}
                              onClick={() => {
                                onOpenPaymentDetails(b, b.status === "Ongoing" || b.status === "Completed" ? "ongoing" : "deposit");
                                setSelectedDay(null);
                              }}
                            >
                              <CreditCard size={13} />
                              <span>{b.status === "Completed" ? "View Payment (Locked)" : "Payment / Deposit"}</span>
                            </button>
                          )}

                          {onOpenIngress && (
                            <button
                              type="button"
                              className="btn-secondary"
                              style={{ padding: "0.35rem 0.65rem", fontSize: "0.74rem" }}
                              onClick={() => {
                                onOpenIngress(b);
                                setSelectedDay(null);
                              }}
                            >
                              <ClipboardCheck size={13} />
                              <span>Ingress</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Drawer Footer */}
            <div style={{
              padding: "1rem 1.5rem",
              borderTop: "1px solid var(--border-subtle)",
              background: "#fafafa",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <span style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>
                Selected Date: <strong>{selectedDay}</strong>
              </span>

              <button
                type="button"
                className="btn-secondary"
                style={{ padding: "0.45rem 0.85rem", fontSize: "0.8rem" }}
                onClick={() => setSelectedDay(null)}
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
