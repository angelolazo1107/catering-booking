import React, { useState, useMemo, useEffect } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Wallet, 
  CreditCard, 
  Calendar, 
  PieChart, 
  BarChart3, 
  ArrowUpRight, 
  ArrowDownRight, 
  Percent, 
  Users, 
  Printer, 
  Plus, 
  Trash2, 
  Filter, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Receipt, 
  Package, 
  ShoppingBag, 
  Building2, 
  ChevronRight,
  Eye,
  FileSpreadsheet
} from "lucide-react";
import { calculateKitchenGroceryBOM } from "../data/recipeFormulas";
import { formatDisplayDate } from "../utils/bookingUtils";

const EXPENSES_STORAGE_KEY = "caterflow_custom_expenses";

// Standard sample expenses if none stored yet
const INITIAL_SAMPLE_EXPENSES = [
  { id: "exp-1", date: "2026-10-15", category: "Transportation", description: "Catering Van Fuel & Tollway (Subic Event)", amount: 3500, bookingId: "" },
  { id: "exp-2", date: "2026-10-18", category: "Kitchen & Utilities", description: "Industrial LPG Refill (2 x 50kg tanks)", amount: 5200, bookingId: "" },
  { id: "exp-3", date: "2026-10-20", category: "Ice & Beverage Supplies", description: "Food-grade Tube Ice & Beverage Garnishes", amount: 1800, bookingId: "" },
  { id: "exp-4", date: "2026-10-21", category: "Equipment & Rentals", description: "Tiffany Chairs & Cocktail Tables Rental", amount: 4500, bookingId: "" }
];

export default function FinancialSalesDashboard({ 
  quotations = [], 
  activeCompany = null, 
  userRole = "superadmin",
  onViewQuote = null 
}) {
  // Period filter: "this-month", "last-month", "this-quarter", "ytd", "all", "custom"
  const [periodFilter, setPeriodFilter] = useState("all");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  
  // Status filter: "all_active" (Confirmed, Ongoing, Completed), "all", "Completed", "Ongoing", "Confirmed"
  const [statusFilter, setStatusFilter] = useState("all_active");
  const [companyFilter, setCompanyFilter] = useState("all");

  // Custom operating expenses state
  const [expenses, setExpenses] = useState(() => {
    try {
      const stored = localStorage.getItem(EXPENSES_STORAGE_KEY);
      return stored ? JSON.parse(stored) : INITIAL_SAMPLE_EXPENSES;
    } catch {
      return INITIAL_SAMPLE_EXPENSES;
    }
  });

  // New expense modal / inline form
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [newExpense, setNewExpense] = useState({
    date: new Date().toISOString().split("T")[0],
    category: "Food & Market",
    description: "",
    amount: "",
    bookingId: ""
  });

  // Save expenses to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(expenses));
    } catch (e) {
      console.warn("Failed to persist custom expenses", e);
    }
  }, [expenses]);

  // Extract companies list for multi-tenant filter
  const companyOptions = useMemo(() => {
    const map = new Map();
    quotations.forEach(q => {
      if (q.companyId) {
        map.set(q.companyId, q.companyName || q.companyId);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [quotations]);

  // Date boundary calculation helper
  const getDateRange = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    if (periodFilter === "this-month") {
      const start = new Date(currentYear, currentMonth, 1);
      const end = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);
      return { start, end };
    }
    if (periodFilter === "last-month") {
      const start = new Date(currentYear, currentMonth - 1, 1);
      const end = new Date(currentYear, currentMonth, 0, 23, 59, 59);
      return { start, end };
    }
    if (periodFilter === "this-quarter") {
      const quarterMonth = Math.floor(currentMonth / 3) * 3;
      const start = new Date(currentYear, quarterMonth, 1);
      const end = new Date(currentYear, quarterMonth + 3, 0, 23, 59, 59);
      return { start, end };
    }
    if (periodFilter === "ytd") {
      const start = new Date(currentYear, 0, 1);
      const end = new Date(currentYear, 11, 31, 23, 59, 59);
      return { start, end };
    }
    if (periodFilter === "custom" && customStartDate && customEndDate) {
      const start = new Date(customStartDate);
      const end = new Date(customEndDate);
      end.setHours(23, 59, 59);
      return { start, end };
    }
    return { start: null, end: null };
  };

  const { start: dateStart, end: dateEnd } = getDateRange();

  // Filter bookings based on period, status, and company
  const filteredBookings = useMemo(() => {
    return quotations.filter(q => {
      // Company tenant filter
      if (companyFilter !== "all" && q.companyId !== companyFilter) {
        return false;
      }
      if (userRole === "company_admin" && activeCompany?.id && q.companyId !== activeCompany.id) {
        return false;
      }

      // Status filter
      if (statusFilter === "all_active") {
        if (q.status !== "Confirmed" && q.status !== "Ongoing" && q.status !== "Completed") {
          return false;
        }
      } else if (statusFilter !== "all") {
        if (q.status !== statusFilter) return false;
      }

      // Date filter (evaluate eventDate or createdAt)
      const dateStr = q.eventDate || q.createdAt;
      if (dateStart && dateEnd && dateStr) {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return true;
        if (d < dateStart || d > dateEnd) return false;
      }

      return true;
    });
  }, [quotations, companyFilter, userRole, activeCompany, statusFilter, dateStart, dateEnd]);

  // Filter custom expenses based on date range
  const filteredExpenses = useMemo(() => {
    return expenses.filter(exp => {
      if (dateStart && dateEnd && exp.date) {
        const d = new Date(exp.date);
        if (isNaN(d.getTime())) return true;
        if (d < dateStart || d > dateEnd) return false;
      }
      return true;
    });
  }, [expenses, dateStart, dateEnd]);

  // Compute Financial Aggregations
  const analytics = useMemo(() => {
    let grossContractedRevenue = 0;
    let totalCashCollected = 0;
    let totalReceivables = 0;
    let totalPax = 0;
    let totalEstimatedFoodBOM = 0;
    let totalEstimatedStaffWages = 0;

    const paymentMethodsMap = {
      Cash: { amount: 0, count: 0 },
      GCash: { amount: 0, count: 0 },
      "Bank Transfer": { amount: 0, count: 0 },
      "Credit/Debit Card": { amount: 0, count: 0 },
      Cheque: { amount: 0, count: 0 },
      Other: { amount: 0, count: 0 }
    };

    const packagePerformance = {};
    const monthlySales = {};

    filteredBookings.forEach(booking => {
      const total = Number(booking.grandTotal) || 0;
      const deposit = Number(booking.depositAmount) || 0;
      const finalPay = Number(booking.finalPaymentAmount) || 0;
      const pax = Number(booking.pax) || 0;
      const balance = booking.balanceDue !== undefined 
        ? Number(booking.balanceDue) 
        : Math.max(0, total - deposit - finalPay);

      grossContractedRevenue += total;
      totalPax += pax;

      // Cash realized
      let collected = 0;
      if (booking.isFullyPaid) {
        collected = total;
      } else {
        collected = deposit + finalPay;
      }
      totalCashCollected += collected;
      totalReceivables += balance;

      // Track payment methods
      const depMethod = booking.depositPaymentMethod || "Cash";
      const finMethod = booking.finalPaymentMethod || depMethod;

      if (booking.isFullyPaid) {
        if (!paymentMethodsMap[finMethod]) paymentMethodsMap[finMethod] = { amount: 0, count: 0 };
        paymentMethodsMap[finMethod].amount += total;
        paymentMethodsMap[finMethod].count += 1;
      } else {
        if (deposit > 0) {
          if (!paymentMethodsMap[depMethod]) paymentMethodsMap[depMethod] = { amount: 0, count: 0 };
          paymentMethodsMap[depMethod].amount += deposit;
          paymentMethodsMap[depMethod].count += 1;
        }
        if (finalPay > 0) {
          if (!paymentMethodsMap[finMethod]) paymentMethodsMap[finMethod] = { amount: 0, count: 0 };
          paymentMethodsMap[finMethod].amount += finalPay;
          paymentMethodsMap[finMethod].count += 1;
        }
      }

      // Compute estimated raw food BOM cost
      let eventFoodCost = 0;
      if (booking.dishes && booking.dishes.length > 0) {
        try {
          const bom = calculateKitchenGroceryBOM(booking.dishes, pax);
          eventFoodCost = bom.totalRawFoodCost || 0;
        } catch {
          eventFoodCost = Math.round(total * 0.32);
        }
      } else {
        eventFoodCost = Math.round(total * 0.32);
      }
      totalEstimatedFoodBOM += eventFoodCost;

      // Compute estimated staff crew wages
      const banquetWaitersCount = Math.max(2, Math.ceil(pax / 25));
      const captainCount = pax >= 150 ? 2 : 1;
      const stewardCount = Math.max(1, Math.ceil(pax / 60));
      const hasLechon = (booking.selectedAddons || []).some(a => a.id && a.id.includes("lechon")) || booking.packageId === "royal_premiere";
      const hasBar = (booking.selectedAddons || []).some(a => a.id && a.id.includes("bar")) || booking.packageId === "royal_premiere";

      const carverWage = hasLechon ? 1000 : 0;
      const barWage = hasBar ? Math.max(1, Math.ceil(pax / 80)) * 1100 : 0;
      const eventStaffWages = (banquetWaitersCount * 800) + (captainCount * 1400) + (stewardCount * 750) + carverWage + barWage;
      totalEstimatedStaffWages += eventStaffWages;

      // Track Package stats
      const pkgName = booking.packageName || "Custom Package";
      if (!packagePerformance[pkgName]) {
        packagePerformance[pkgName] = { name: pkgName, count: 0, revenue: 0, pax: 0 };
      }
      packagePerformance[pkgName].count += 1;
      packagePerformance[pkgName].revenue += total;
      packagePerformance[pkgName].pax += pax;

      // Track Monthly Sales (YYYY-MM)
      const dateKey = (booking.eventDate || booking.createdAt || "").substring(0, 7) || "Unscheduled";
      if (!monthlySales[dateKey]) {
        monthlySales[dateKey] = { key: dateKey, gross: 0, collected: 0, pax: 0, count: 0 };
      }
      monthlySales[dateKey].gross += total;
      monthlySales[dateKey].collected += collected;
      monthlySales[dateKey].pax += pax;
      monthlySales[dateKey].count += 1;
    });

    // Custom operating expenses total
    const totalCustomExpenses = filteredExpenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const totalExpenses = totalEstimatedFoodBOM + totalEstimatedStaffWages + totalCustomExpenses;

    const netProfitOnCollected = totalCashCollected - totalExpenses;
    const netProfitOnContract = grossContractedRevenue - totalExpenses;
    const profitMarginPercent = grossContractedRevenue > 0 
      ? Math.round((netProfitOnContract / grossContractedRevenue) * 100) 
      : 0;

    const foodCostRatio = grossContractedRevenue > 0
      ? Math.round((totalEstimatedFoodBOM / grossContractedRevenue) * 100)
      : 0;

    const laborCostRatio = grossContractedRevenue > 0
      ? Math.round((totalEstimatedStaffWages / grossContractedRevenue) * 100)
      : 0;

    const avgBookingValue = filteredBookings.length > 0 
      ? Math.round(grossContractedRevenue / filteredBookings.length) 
      : 0;

    const avgRevenuePerPax = totalPax > 0 
      ? Math.round(grossContractedRevenue / totalPax) 
      : 0;

    return {
      bookingCount: filteredBookings.length,
      totalPax,
      grossContractedRevenue,
      totalCashCollected,
      totalReceivables,
      totalEstimatedFoodBOM,
      totalEstimatedStaffWages,
      totalCustomExpenses,
      totalExpenses,
      netProfitOnCollected,
      netProfitOnContract,
      profitMarginPercent,
      foodCostRatio,
      laborCostRatio,
      avgBookingValue,
      avgRevenuePerPax,
      paymentMethodsMap,
      packageRankings: Object.values(packagePerformance).sort((a, b) => b.revenue - a.revenue),
      monthlyTrends: Object.values(monthlySales).sort((a, b) => a.key.localeCompare(b.key))
    };
  }, [filteredBookings, filteredExpenses]);

  // Handle adding custom expense
  const handleAddExpenseSubmit = (e) => {
    e.preventDefault();
    const numAmt = Number(newExpense.amount);
    if (!newExpense.description || isNaN(numAmt) || numAmt <= 0) {
      alert("Please enter a valid expense description and positive amount.");
      return;
    }

    const item = {
      id: `exp-${Date.now()}`,
      date: newExpense.date || new Date().toISOString().split("T")[0],
      category: newExpense.category,
      description: newExpense.description.trim(),
      amount: numAmt,
      bookingId: newExpense.bookingId.trim()
    };

    setExpenses(prev => [item, ...prev]);
    setNewExpense({
      date: new Date().toISOString().split("T")[0],
      category: "Food & Market",
      description: "",
      amount: "",
      bookingId: ""
    });
    setShowAddExpense(false);
  };

  const handleDeleteExpense = (id) => {
    if (window.confirm("Are you sure you want to delete this expense record?")) {
      setExpenses(prev => prev.filter(e => e.id !== id));
    }
  };

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", paddingBottom: "2rem" }}>
      {/* Top Controls & Header */}
      <div className="card-section no-print" style={{ padding: "1.25rem 1.5rem", marginBottom: "1.25rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "var(--gold-50)", color: "var(--gold-700)", border: "1px solid var(--gold-200)", padding: "3px 8px", borderRadius: "6px", fontSize: "0.72rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.4rem" }}>
              <TrendingUp size={13} />
              <span>Financial & Sales Intelligence</span>
            </div>
            <h2 style={{ fontSize: "1.45rem", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
              Income, Expenses & Sales Performance Monitoring
            </h2>
            <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", margin: "4px 0 0" }}>
              Real-time revenue collections, raw food procurement BOM, service labor wages, and net profit margins.
            </p>
          </div>

          <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setShowAddExpense(true)}
              style={{ display: "flex", alignItems: "center", gap: "6px", borderColor: "#cbd5e1" }}
            >
              <Plus size={16} color="#047857" />
              <span>Record Expense</span>
            </button>

            <button
              type="button"
              className="btn-primary"
              onClick={() => window.print()}
              style={{ display: "flex", alignItems: "center", gap: "6px" }}
            >
              <Printer size={16} />
              <span>Print Financial P&L</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "12px", marginTop: "1.25rem", paddingTop: "1rem", borderTop: "1px solid var(--border-subtle)" }}>
          {/* Period Filter */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Calendar size={15} color="var(--text-muted)" />
            <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-secondary)" }}>Period:</span>
            <select
              className="form-select"
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value)}
              style={{ fontSize: "0.78rem", padding: "0.35rem 0.65rem", width: "auto" }}
            >
              <option value="all">All-Time Contracts</option>
              <option value="this-month">This Month ({new Date().toLocaleDateString("en-PH", { month: "short", year: "numeric" })})</option>
              <option value="last-month">Last Month</option>
              <option value="this-quarter">This Quarter</option>
              <option value="ytd">Year-to-Date (YTD {new Date().getFullYear()})</option>
              <option value="custom">Custom Date Range...</option>
            </select>
          </div>

          {/* Custom Date Inputs if custom selected */}
          {periodFilter === "custom" && (
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="form-input"
                style={{ fontSize: "0.78rem", padding: "0.3rem 0.5rem", width: "auto" }}
              />
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>to</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="form-input"
                style={{ fontSize: "0.78rem", padding: "0.3rem 0.5rem", width: "auto" }}
              />
            </div>
          )}

          {/* Booking Status Filter */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Filter size={15} color="var(--text-muted)" />
            <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-secondary)" }}>Status:</span>
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ fontSize: "0.78rem", padding: "0.35rem 0.65rem", width: "auto" }}
            >
              <option value="all_active">Active Banquet Pipeline (Confirmed, Ongoing, Completed)</option>
              <option value="Completed">Completed Only (Final Settled)</option>
              <option value="Ongoing">Ongoing Events Only</option>
              <option value="Confirmed">Confirmed Bookings Only</option>
              <option value="all">Include Drafts & Pending</option>
            </select>
          </div>

          {/* Multi-Tenant Company Filter */}
          {userRole === "superadmin" && companyOptions.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Building2 size={15} color="var(--text-muted)" />
              <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-secondary)" }}>Tenant:</span>
              <select
                className="form-select"
                value={companyFilter}
                onChange={(e) => setCompanyFilter(e.target.value)}
                style={{ fontSize: "0.78rem", padding: "0.35rem 0.65rem", width: "auto" }}
              >
                <option value="all">All Catering Companies</option>
                {companyOptions.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}

          <div style={{ marginLeft: "auto", fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>
            Showing <strong>{analytics.bookingCount}</strong> events ({analytics.totalPax.toLocaleString()} guests)
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SECTION 1: PRIMARY FINANCIAL KPI SCORECARDS              */}
      {/* ======================================================== */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: "1rem", marginBottom: "1.25rem" }}>
        
        {/* KPI 1: Gross Sales Contracted */}
        <div className="card-section" style={{ padding: "1.15rem 1.25rem", borderLeft: "4px solid #0284c7" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Gross Contracted Sales
              </span>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", fontFamily: "monospace", marginTop: "4px" }}>
                ₱{analytics.grossContractedRevenue.toLocaleString()}
              </div>
            </div>
            <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "#f0f9ff", color: "#0284c7", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Receipt size={20} />
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px", fontSize: "0.72rem", color: "#64748b" }}>
            <span>{analytics.bookingCount} bookings</span>
            <span style={{ fontWeight: 700, color: "#0284c7" }}>Avg ₱{analytics.avgBookingValue.toLocaleString()} / evt</span>
          </div>
        </div>

        {/* KPI 2: Actual Cash Collected */}
        <div className="card-section" style={{ padding: "1.15rem 1.25rem", borderLeft: "4px solid #059669" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "#047857", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Realized Cash Inflow
              </span>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#047857", fontFamily: "monospace", marginTop: "4px" }}>
                ₱{analytics.totalCashCollected.toLocaleString()}
              </div>
            </div>
            <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "#ecfdf5", color: "#059669", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Wallet size={20} />
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px", fontSize: "0.72rem" }}>
            <span style={{ color: "#64748b" }}>Collected deposits + full pays</span>
            <span style={{ fontWeight: 800, color: "#047857" }}>
              {analytics.grossContractedRevenue > 0 ? `${Math.round((analytics.totalCashCollected / analytics.grossContractedRevenue) * 100)}% Collected` : "0%"}
            </span>
          </div>
        </div>

        {/* KPI 3: Accounts Receivable (Uncollected Balance) */}
        <div className="card-section" style={{ padding: "1.15rem 1.25rem", borderLeft: "4px solid #d97706" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "#92400e", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Pending Receivables
              </span>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#b45309", fontFamily: "monospace", marginTop: "4px" }}>
                ₱{analytics.totalReceivables.toLocaleString()}
              </div>
            </div>
            <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "#fffbeb", color: "#d97706", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Clock size={20} />
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px", fontSize: "0.72rem", color: "#64748b" }}>
            <span>Uncollected balance due</span>
            <span style={{ fontWeight: 700, color: "#b45309" }}>Due before/on ingress</span>
          </div>
        </div>

        {/* KPI 4: Total Event Operating Expenses */}
        <div className="card-section" style={{ padding: "1.15rem 1.25rem", borderLeft: "4px solid #e11d48" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "#9f1239", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Total Operating Expenses
              </span>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#be123c", fontFamily: "monospace", marginTop: "4px" }}>
                ₱{analytics.totalExpenses.toLocaleString()}
              </div>
            </div>
            <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "#fff1f2", color: "#e11d48", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <TrendingDown size={20} />
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px", fontSize: "0.72rem", color: "#64748b" }}>
            <span>Food BOM + Labor + Ops</span>
            <span style={{ fontWeight: 700, color: "#be123c" }}>
              {analytics.grossContractedRevenue > 0 ? `${Math.round((analytics.totalExpenses / analytics.grossContractedRevenue) * 100)}% Cost Ratio` : "0%"}
            </span>
          </div>
        </div>

        {/* KPI 5: Net Profit & Margin */}
        <div className="card-section" style={{ padding: "1.15rem 1.25rem", borderLeft: "4px solid #7e22ce" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "#6b21a8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Net Contract Profit
              </span>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#7e22ce", fontFamily: "monospace", marginTop: "4px" }}>
                ₱{analytics.netProfitOnContract.toLocaleString()}
              </div>
            </div>
            <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "#faf5ff", color: "#7e22ce", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <TrendingUp size={20} />
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px", fontSize: "0.72rem" }}>
            <span style={{ color: "#64748b" }}>Profit Margin</span>
            <span style={{ 
              fontWeight: 800, 
              color: analytics.profitMarginPercent >= 35 ? "#047857" : analytics.profitMarginPercent >= 20 ? "#b45309" : "#b91c1c",
              background: analytics.profitMarginPercent >= 35 ? "#ecfdf5" : "#fffbeb",
              padding: "1px 6px",
              borderRadius: "4px"
            }}>
              {analytics.profitMarginPercent}% Net
            </span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SECTION 2: CHARTS & BREAKDOWN MATRICES                   */}
      {/* ======================================================== */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "1.25rem", marginBottom: "1.25rem" }}>
        
        {/* Card A: Expense Structure Breakdown */}
        <div className="card-section" style={{ padding: "1.25rem 1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <PieChart size={18} color="#e11d48" />
              <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 800, color: "var(--text-primary)" }}>
                Cost & Expense Allocation
              </h3>
            </div>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>
              Total ₱{analytics.totalExpenses.toLocaleString()}
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {/* Food Cost */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: "4px" }}>
                <span style={{ fontWeight: 700, color: "#1e293b" }}>🍲 Kitchen Food Procurement (BOM)</span>
                <span style={{ fontWeight: 800, fontFamily: "monospace", color: "#047857" }}>
                  ₱{analytics.totalEstimatedFoodBOM.toLocaleString()} ({analytics.totalExpenses > 0 ? Math.round((analytics.totalEstimatedFoodBOM / analytics.totalExpenses) * 100) : 0}%)
                </span>
              </div>
              <div style={{ height: "8px", background: "#f1f5f9", borderRadius: "999px", overflow: "hidden" }}>
                <div 
                  style={{ 
                    height: "100%", 
                    background: "#059669", 
                    width: `${analytics.totalExpenses > 0 ? (analytics.totalEstimatedFoodBOM / analytics.totalExpenses) * 100 : 0}%`,
                    borderRadius: "999px" 
                  }} 
                />
              </div>
              <div style={{ fontSize: "0.7rem", color: "#64748b", marginTop: "2px" }}>
                Target: 28% - 35% of revenue • Currently: <strong>{analytics.foodCostRatio}%</strong> of gross sales
              </div>
            </div>

            {/* Crew & Labor Cost */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: "4px" }}>
                <span style={{ fontWeight: 700, color: "#1e293b" }}>👨‍🍳 Banquet Staff & Crew Wages</span>
                <span style={{ fontWeight: 800, fontFamily: "monospace", color: "#0284c7" }}>
                  ₱{analytics.totalEstimatedStaffWages.toLocaleString()} ({analytics.totalExpenses > 0 ? Math.round((analytics.totalEstimatedStaffWages / analytics.totalExpenses) * 100) : 0}%)
                </span>
              </div>
              <div style={{ height: "8px", background: "#f1f5f9", borderRadius: "999px", overflow: "hidden" }}>
                <div 
                  style={{ 
                    height: "100%", 
                    background: "#0284c7", 
                    width: `${analytics.totalExpenses > 0 ? (analytics.totalEstimatedStaffWages / analytics.totalExpenses) * 100 : 0}%`,
                    borderRadius: "999px" 
                  }} 
                />
              </div>
              <div style={{ fontSize: "0.7rem", color: "#64748b", marginTop: "2px" }}>
                Waiters, Captain, Stewards, Carver, Bartender wages • <strong>{analytics.laborCostRatio}%</strong> of gross sales
              </div>
            </div>

            {/* Custom / Operating Expenses */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: "4px" }}>
                <span style={{ fontWeight: 700, color: "#1e293b" }}>🚚 Operations, Gas, Transport & Rentals</span>
                <span style={{ fontWeight: 800, fontFamily: "monospace", color: "#d97706" }}>
                  ₱{analytics.totalCustomExpenses.toLocaleString()} ({analytics.totalExpenses > 0 ? Math.round((analytics.totalCustomExpenses / analytics.totalExpenses) * 100) : 0}%)
                </span>
              </div>
              <div style={{ height: "8px", background: "#f1f5f9", borderRadius: "999px", overflow: "hidden" }}>
                <div 
                  style={{ 
                    height: "100%", 
                    background: "#d97706", 
                    width: `${analytics.totalExpenses > 0 ? (analytics.totalCustomExpenses / analytics.totalExpenses) * 100 : 0}%`,
                    borderRadius: "999px" 
                  }} 
                />
              </div>
              <div style={{ fontSize: "0.7rem", color: "#64748b", marginTop: "2px" }}>
                Logged operational disbursements & equipment rentals ({filteredExpenses.length} entries)
              </div>
            </div>
          </div>
        </div>

        {/* Card B: Payment Method Inflows */}
        <div className="card-section" style={{ padding: "1.25rem 1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <CreditCard size={18} color="#059669" />
              <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 800, color: "var(--text-primary)" }}>
                Payment Method Collections
              </h3>
            </div>
            <span style={{ fontSize: "0.75rem", color: "#047857", fontWeight: 800 }}>
              ₱{analytics.totalCashCollected.toLocaleString()} in Bank/Register
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            {Object.entries(analytics.paymentMethodsMap).map(([method, data]) => {
              const share = analytics.totalCashCollected > 0 
                ? Math.round((data.amount / analytics.totalCashCollected) * 100) 
                : 0;
              const isCash = method === "Cash";
              const isGCash = method === "GCash";
              return (
                <div 
                  key={method}
                  style={{
                    padding: "0.65rem 0.85rem",
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    background: data.amount > 0 ? "#f8fafc" : "#ffffff",
                    opacity: data.amount > 0 ? 1 : 0.6
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2px" }}>
                    <span style={{ fontSize: "0.76rem", fontWeight: 800, color: isCash ? "#047857" : isGCash ? "#0284c7" : "#1e293b" }}>
                      {method}
                    </span>
                    <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "#64748b" }}>
                      {share}%
                    </span>
                  </div>
                  <div style={{ fontSize: "0.95rem", fontWeight: 800, fontFamily: "monospace", color: "#0f172a" }}>
                    ₱{data.amount.toLocaleString()}
                  </div>
                  <div style={{ fontSize: "0.68rem", color: "#64748b", marginTop: "2px" }}>
                    {data.count} transaction{data.count === 1 ? "" : "s"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SECTION 3: MONTHLY SALES TIMELINE & TOP PACKAGES         */}
      {/* ======================================================== */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "1.25rem", marginBottom: "1.25rem" }}>
        
        {/* Card C: Monthly Revenue Trends */}
        <div className="card-section" style={{ padding: "1.25rem 1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <BarChart3 size={18} color="#0284c7" />
              <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 800, color: "var(--text-primary)" }}>
                Monthly Booking Sales Volume
              </h3>
            </div>
            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 600 }}>
              Grouped by event date
            </span>
          </div>

          {analytics.monthlyTrends.length === 0 ? (
            <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)", fontSize: "0.85rem" }}>
              No monthly events recorded in this time filter.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {analytics.monthlyTrends.map(month => {
                const maxGross = Math.max(...analytics.monthlyTrends.map(m => m.gross), 1);
                const percent = Math.round((month.gross / maxGross) * 100);
                return (
                  <div key={month.key}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", marginBottom: "3px" }}>
                      <span style={{ fontWeight: 800, color: "#1e293b" }}>
                        🗓️ {month.key} ({month.count} event{month.count === 1 ? "" : "s"} • {month.pax.toLocaleString()} pax)
                      </span>
                      <span style={{ fontWeight: 800, fontFamily: "monospace", color: "#047857" }}>
                        ₱{month.gross.toLocaleString()}
                      </span>
                    </div>
                    <div style={{ height: "10px", background: "#f1f5f9", borderRadius: "999px", overflow: "hidden", display: "flex" }}>
                      <div 
                        style={{ 
                          height: "100%", 
                          background: "linear-gradient(90deg, #0284c7 0%, #059669 100%)", 
                          width: `${percent}%`,
                          borderRadius: "999px" 
                        }} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Card D: Top Selling Packages */}
        <div className="card-section" style={{ padding: "1.25rem 1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Package size={18} color="#7e22ce" />
              <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 800, color: "var(--text-primary)" }}>
                Top-Selling Catering Packages
              </h3>
            </div>
            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 600 }}>
              Ranked by revenue
            </span>
          </div>

          {analytics.packageRankings.length === 0 ? (
            <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)", fontSize: "0.85rem" }}>
              No package bookings in this period.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              {analytics.packageRankings.slice(0, 5).map((pkg, idx) => {
                const share = analytics.grossContractedRevenue > 0
                  ? Math.round((pkg.revenue / analytics.grossContractedRevenue) * 100)
                  : 0;
                return (
                  <div 
                    key={pkg.name}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "0.55rem 0.75rem",
                      borderRadius: "8px",
                      background: idx === 0 ? "#faf5ff" : "#f8fafc",
                      border: idx === 0 ? "1px solid #d8b4fe" : "1px solid #e2e8f0"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ 
                        width: "22px", 
                        height: "22px", 
                        borderRadius: "50%", 
                        background: idx === 0 ? "#7e22ce" : "#e2e8f0", 
                        color: idx === 0 ? "#ffffff" : "#475569", 
                        display: "flex", 
                        alignItems: "center", 
                        justifyContent: "center",
                        fontSize: "0.72rem",
                        fontWeight: 800 
                      }}>
                        {idx + 1}
                      </span>
                      <div>
                        <div style={{ fontSize: "0.8rem", fontWeight: 800, color: idx === 0 ? "#581c87" : "#0f172a" }}>
                          {pkg.name}
                        </div>
                        <div style={{ fontSize: "0.68rem", color: "#64748b" }}>
                          {pkg.count} booked • {pkg.pax.toLocaleString()} guests served
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "0.85rem", fontWeight: 800, fontFamily: "monospace", color: "#047857" }}>
                        ₱{pkg.revenue.toLocaleString()}
                      </div>
                      <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "#7e22ce" }}>
                        {share}% of sales
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* SECTION 4: CUSTOM OPERATING EXPENSE LOG (Ad-hoc costs)   */}
      {/* ======================================================== */}
      <div className="card-section" style={{ padding: "1.25rem 1.5rem", marginBottom: "1.25rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "0.5rem" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 800, color: "var(--text-primary)" }}>
              Custom Operations & Logistics Expense Log
            </h3>
            <p style={{ margin: "2px 0 0", fontSize: "0.76rem", color: "var(--text-muted)" }}>
              Track gasoline, vehicle transport, LPG tanks, ice, equipment rentals, and venue commissions.
            </p>
          </div>

          <button
            type="button"
            className="btn-secondary no-print"
            onClick={() => setShowAddExpense(!showAddExpense)}
            style={{ padding: "0.4rem 0.8rem", fontSize: "0.78rem", display: "flex", alignItems: "center", gap: "6px" }}
          >
            <Plus size={14} color="#047857" />
            <span>{showAddExpense ? "Hide Form" : "Add Expense Entry"}</span>
          </button>
        </div>

        {/* Add Expense Drawer / Form */}
        {showAddExpense && (
          <form 
            onSubmit={handleAddExpenseSubmit}
            className="no-print"
            style={{
              background: "#f8fafc",
              border: "1px solid #cbd5e1",
              borderRadius: "10px",
              padding: "1rem",
              marginBottom: "1rem",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "0.75rem",
              alignItems: "flex-end"
            }}
          >
            <div>
              <label style={{ display: "block", fontSize: "0.74rem", fontWeight: 700, marginBottom: "3px" }}>Date</label>
              <input
                type="date"
                required
                className="form-input"
                value={newExpense.date}
                onChange={(e) => setNewExpense(prev => ({ ...prev, date: e.target.value }))}
                style={{ fontSize: "0.8rem", padding: "0.4rem 0.6rem" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.74rem", fontWeight: 700, marginBottom: "3px" }}>Category</label>
              <select
                className="form-select"
                value={newExpense.category}
                onChange={(e) => setNewExpense(prev => ({ ...prev, category: e.target.value }))}
                style={{ fontSize: "0.8rem", padding: "0.4rem 0.6rem" }}
              >
                <option value="Food & Market">Food & Market Ingredients</option>
                <option value="Transportation">Transportation & Fuel</option>
                <option value="Kitchen & Utilities">Kitchen LPG & Utilities</option>
                <option value="Ice & Beverage Supplies">Ice & Beverage Supplies</option>
                <option value="Equipment & Rentals">Equipment & Furniture Rentals</option>
                <option value="Staff Crew Logistics">Staff Extra Per Diem / Logistics</option>
                <option value="Venue & Permits">Venue Commissions & Permits</option>
                <option value="Miscellaneous">Miscellaneous Operations</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.74rem", fontWeight: 700, marginBottom: "3px" }}>Description</label>
              <input
                type="text"
                required
                placeholder="e.g. 5 bags tube ice for mobile bar"
                className="form-input"
                value={newExpense.description}
                onChange={(e) => setNewExpense(prev => ({ ...prev, description: e.target.value }))}
                style={{ fontSize: "0.8rem", padding: "0.4rem 0.6rem" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.74rem", fontWeight: 700, marginBottom: "3px" }}>Amount (PHP)</label>
              <input
                type="number"
                min="1"
                step="any"
                required
                placeholder="₱ Amount"
                className="form-input"
                value={newExpense.amount}
                onChange={(e) => setNewExpense(prev => ({ ...prev, amount: e.target.value }))}
                style={{ fontSize: "0.8rem", padding: "0.4rem 0.6rem" }}
              />
            </div>

            <div style={{ display: "flex", gap: "6px" }}>
              <button
                type="submit"
                className="btn-primary"
                style={{ padding: "0.45rem 1rem", fontSize: "0.8rem", height: "35px" }}
              >
                Save Expense
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowAddExpense(false)}
                style={{ padding: "0.45rem 0.8rem", fontSize: "0.8rem", height: "35px" }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Expenses List Table */}
        {filteredExpenses.length === 0 ? (
          <div style={{ textAlign: "center", padding: "1.5rem", color: "var(--text-muted)", fontSize: "0.82rem" }}>
            No custom operating expenses recorded for this period. Click "+ Add Expense Entry" to record disbursements.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="admin-table" style={{ width: "100%", fontSize: "0.78rem" }}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th style={{ textAlign: "right" }}>Amount (PHP)</th>
                  <th className="no-print" style={{ textAlign: "center", width: "60px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map(exp => (
                  <tr key={exp.id}>
                    <td style={{ whiteSpace: "nowrap", color: "#64748b" }}>
                      {exp.date ? new Date(exp.date).toLocaleDateString() : "—"}
                    </td>
                    <td>
                      <span style={{ 
                        padding: "2px 6px", 
                        borderRadius: "4px", 
                        fontSize: "0.7rem", 
                        fontWeight: 700, 
                        background: "#f1f5f9", 
                        color: "#475569" 
                      }}>
                        {exp.category}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600, color: "#1e293b" }}>
                      {exp.description}
                    </td>
                    <td style={{ textAlign: "right", fontFamily: "monospace", fontWeight: 800, color: "#be123c" }}>
                      -₱{Number(exp.amount).toLocaleString()}
                    </td>
                    <td className="no-print" style={{ textAlign: "center" }}>
                      <button
                        type="button"
                        onClick={() => handleDeleteExpense(exp.id)}
                        style={{ background: "transparent", border: "none", color: "#dc2626", cursor: "pointer", padding: "3px" }}
                        title="Delete expense entry"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background: "#f8fafc", fontWeight: 800 }}>
                  <td colSpan={3} style={{ textAlign: "right", padding: "0.6rem 0.75rem" }}>
                    Total Custom Operations Expenses:
                  </td>
                  <td style={{ textAlign: "right", fontFamily: "monospace", color: "#be123c", padding: "0.6rem 0.75rem" }}>
                    -₱{analytics.totalCustomExpenses.toLocaleString()}
                  </td>
                  <td className="no-print"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* SECTION 5: EVENT-BY-EVENT PROFIT & LOSS TABLE           */}
      {/* ======================================================== */}
      <div className="card-section" style={{ padding: "1.25rem 1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "0.5rem" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 800, color: "var(--text-primary)" }}>
              Event-by-Event P&L (Profit & Loss) Breakdown
            </h3>
            <p style={{ margin: "2px 0 0", fontSize: "0.76rem", color: "var(--text-muted)" }}>
              Granular financial margins per booked event banquet contract.
            </p>
          </div>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            Showing <strong>{filteredBookings.length}</strong> event records
          </span>
        </div>

        {filteredBookings.length === 0 ? (
          <div style={{ textAlign: "center", padding: "2.5rem", color: "var(--text-muted)", fontSize: "0.85rem" }}>
            No event records match the selected period or filters.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="admin-table" style={{ width: "100%", fontSize: "0.76rem" }}>
              <thead>
                <tr>
                  <th>Booking Ref / Client</th>
                  <th>Event Date</th>
                  <th>Guests (Pax)</th>
                  <th style={{ textAlign: "right" }}>Contract Price</th>
                  <th style={{ textAlign: "right" }}>Cash Collected</th>
                  <th style={{ textAlign: "right" }}>Est. Food Cost</th>
                  <th style={{ textAlign: "right" }}>Est. Crew Labor</th>
                  <th style={{ textAlign: "right" }}>Net Profit</th>
                  <th style={{ textAlign: "center" }}>Margin</th>
                  <th style={{ textAlign: "center" }}>Status</th>
                  {onViewQuote && <th className="no-print" style={{ textAlign: "center", width: "50px" }}>View</th>}
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map(b => {
                  const total = Number(b.grandTotal) || 0;
                  const deposit = Number(b.depositAmount) || 0;
                  const finalPay = Number(b.finalPaymentAmount) || 0;
                  const collected = b.isFullyPaid ? total : (deposit + finalPay);
                  const pax = Number(b.pax) || 0;

                  // Est Food Cost
                  let foodCost = Math.round(total * 0.32);
                  if (b.dishes && b.dishes.length > 0) {
                    try {
                      foodCost = calculateKitchenGroceryBOM(b.dishes, pax).totalRawFoodCost || foodCost;
                    } catch {}
                  }

                  // Est Labor
                  const banquetWaitersCount = Math.max(2, Math.ceil(pax / 25));
                  const captainCount = pax >= 150 ? 2 : 1;
                  const stewardCount = Math.max(1, Math.ceil(pax / 60));
                  const laborCost = (banquetWaitersCount * 800) + (captainCount * 1400) + (stewardCount * 750);

                  const eventExpenses = foodCost + laborCost;
                  const eventProfit = total - eventExpenses;
                  const margin = total > 0 ? Math.round((eventProfit / total) * 100) : 0;

                  return (
                    <tr key={b.id}>
                      <td>
                        <div style={{ fontWeight: 800, color: "#0f172a" }}>{b.clientName}</div>
                        <div style={{ fontSize: "0.68rem", fontFamily: "monospace", color: "#64748b" }}>
                          {b.bookingReference || b.id}
                        </div>
                      </td>
                      <td style={{ whiteSpace: "nowrap" }}>
                        {b.eventDate ? formatDisplayDate(b.eventDate, { month: "short", day: "numeric", year: "numeric" }) : "—"}
                      </td>
                      <td style={{ fontWeight: 700 }}>
                        {pax} pax
                      </td>
                      <td style={{ textAlign: "right", fontFamily: "monospace", fontWeight: 800 }}>
                        ₱{total.toLocaleString()}
                      </td>
                      <td style={{ textAlign: "right", fontFamily: "monospace", fontWeight: 800, color: b.isFullyPaid ? "#047857" : "#0284c7" }}>
                        ₱{collected.toLocaleString()}
                        {b.isFullyPaid && <span style={{ marginLeft: "3px", fontSize: "0.65rem" }}>✓</span>}
                      </td>
                      <td style={{ textAlign: "right", fontFamily: "monospace", color: "#64748b" }}>
                        ₱{foodCost.toLocaleString()}
                      </td>
                      <td style={{ textAlign: "right", fontFamily: "monospace", color: "#64748b" }}>
                        ₱{laborCost.toLocaleString()}
                      </td>
                      <td style={{ textAlign: "right", fontFamily: "monospace", fontWeight: 800, color: eventProfit >= 0 ? "#047857" : "#b91c1c" }}>
                        ₱{eventProfit.toLocaleString()}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <span style={{
                          fontWeight: 800,
                          fontSize: "0.68rem",
                          padding: "2px 6px",
                          borderRadius: "4px",
                          background: margin >= 35 ? "#ecfdf5" : margin >= 20 ? "#fffbeb" : "#fef2f2",
                          color: margin >= 35 ? "#047857" : margin >= 20 ? "#b45309" : "#b91c1c"
                        }}>
                          {margin}%
                        </span>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <span style={{
                          fontSize: "0.68rem",
                          fontWeight: 700,
                          padding: "2px 6px",
                          borderRadius: "4px",
                          background: b.status === "Completed" ? "#faf5ff" : b.status === "Ongoing" ? "#fffbeb" : "#ecfdf5",
                          color: b.status === "Completed" ? "#7e22ce" : b.status === "Ongoing" ? "#b45309" : "#047857",
                          border: `1px solid ${b.status === "Completed" ? "#d8b4fe" : b.status === "Ongoing" ? "#fde68a" : "#a7f3d0"}`
                        }}>
                          {b.status === "Completed" ? "🔒 Completed" : b.status}
                        </span>
                      </td>
                      {onViewQuote && (
                        <td className="no-print" style={{ textAlign: "center" }}>
                          <button
                            type="button"
                            className="btn-secondary"
                            style={{ padding: "0.25rem 0.5rem" }}
                            title="View Quotation"
                            onClick={() => onViewQuote(b)}
                          >
                            <Eye size={13} />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr style={{ background: "#f8fafc", fontWeight: 800, borderTop: "2px solid #cbd5e1" }}>
                  <td colSpan={3} style={{ padding: "0.65rem 0.75rem" }}>
                    Total Period P&L ({filteredBookings.length} events):
                  </td>
                  <td style={{ textAlign: "right", fontFamily: "monospace", color: "#0f172a" }}>
                    ₱{analytics.grossContractedRevenue.toLocaleString()}
                  </td>
                  <td style={{ textAlign: "right", fontFamily: "monospace", color: "#047857" }}>
                    ₱{analytics.totalCashCollected.toLocaleString()}
                  </td>
                  <td style={{ textAlign: "right", fontFamily: "monospace", color: "#64748b" }}>
                    ₱{analytics.totalEstimatedFoodBOM.toLocaleString()}
                  </td>
                  <td style={{ textAlign: "right", fontFamily: "monospace", color: "#64748b" }}>
                    ₱{analytics.totalEstimatedStaffWages.toLocaleString()}
                  </td>
                  <td style={{ textAlign: "right", fontFamily: "monospace", color: "#7e22ce" }}>
                    ₱{(analytics.grossContractedRevenue - (analytics.totalEstimatedFoodBOM + analytics.totalEstimatedStaffWages)).toLocaleString()}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    {analytics.profitMarginPercent}%
                  </td>
                  <td colSpan={onViewQuote ? 2 : 1}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
