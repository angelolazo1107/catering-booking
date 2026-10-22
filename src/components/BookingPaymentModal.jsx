import React, { useState, useEffect } from "react";
import { 
  X, 
  CheckCircle2, 
  DollarSign, 
  Banknote, 
  Smartphone, 
  CreditCard, 
  Building2, 
  FileCheck2, 
  Calendar, 
  User, 
  MapPin, 
  Clock, 
  AlertCircle, 
  ShieldCheck, 
  Receipt,
  FileText
} from "lucide-react";

const PAYMENT_METHODS = [
  { id: "Cash", label: "Cash Payment", icon: Banknote, color: "#047857", bg: "#ecfdf5", border: "#a7f3d0" },
  { id: "GCash", label: "GCash Transfer", icon: Smartphone, color: "#0284c7", bg: "#f0f9ff", border: "#bae6fd" },
  { id: "Bank Transfer", label: "Bank Transfer", icon: Building2, color: "#b45309", bg: "#fffbeb", border: "#fde68a" },
  { id: "Credit/Debit Card", label: "Card (Store POS)", icon: CreditCard, color: "#7e22ce", bg: "#faf5ff", border: "#e9d5ff" },
  { id: "Cheque", label: "Bank Cheque", icon: FileCheck2, color: "#475569", bg: "#f8fafc", border: "#cbd5e1" },
  { id: "Other", label: "Other / Custom", icon: Receipt, color: "#0f172a", bg: "#f1f5f9", border: "#cbd5e1" }
];

export default function BookingPaymentModal({
  isOpen,
  mode = "deposit", // "deposit" (for Confirmed), "ongoing" (for Ongoing), "view_edit"
  booking,
  onClose,
  onConfirm
}) {
  if (!isOpen || !booking) return null;

  const grandTotal = Number(booking.grandTotal) || 0;
  const standardDP = Number(booking.downpaymentRequired) || Math.round(grandTotal * 0.5);
  const recordedDeposit = Number(booking.depositAmount) || 0;
  const initialRemainingBalance = Math.max(0, grandTotal - recordedDeposit);

  // Form states for deposit mode
  const [depositAmount, setDepositAmount] = useState(
    recordedDeposit > 0 ? recordedDeposit : standardDP
  );
  const [depositMethod, setDepositMethod] = useState(booking.depositPaymentMethod || "Cash");
  const [depositRef, setDepositRef] = useState(booking.depositReference || "");
  const [depositNotes, setDepositNotes] = useState(booking.depositNotes || "");
  const [depositDate, setDepositDate] = useState(
    booking.depositPaidAt 
      ? new Date(booking.depositPaidAt).toISOString().split("T")[0] 
      : new Date().toISOString().split("T")[0]
  );

  // Form states for ongoing verification mode
  const [isFullyPaid, setIsFullyPaid] = useState(
    booking.isFullyPaid !== undefined 
      ? booking.isFullyPaid 
      : (initialRemainingBalance <= 0)
  );
  const [finalAmount, setFinalAmount] = useState(
    booking.finalPaymentAmount 
      ? booking.finalPaymentAmount 
      : initialRemainingBalance
  );
  const [finalMethod, setFinalMethod] = useState(booking.finalPaymentMethod || "Cash");
  const [finalRef, setFinalRef] = useState(booking.finalPaymentReference || "");
  const [finalNotes, setFinalNotes] = useState(booking.finalPaymentNotes || "");
  const [finalDate, setFinalDate] = useState(
    booking.finalPaymentPaidAt 
      ? new Date(booking.finalPaymentPaidAt).toISOString().split("T")[0] 
      : new Date().toISOString().split("T")[0]
  );

  const [errorMsg, setErrorMsg] = useState("");

  // Sync state if booking or mode changes
  useEffect(() => {
    if (booking) {
      if (mode === "deposit") {
        setDepositAmount(booking.depositAmount > 0 ? booking.depositAmount : standardDP);
        setDepositMethod(booking.depositPaymentMethod || "Cash");
        setDepositRef(booking.depositReference || "");
        setDepositNotes(booking.depositNotes || "");
      } else if (mode === "ongoing") {
        const remaining = Math.max(0, grandTotal - (booking.depositAmount || 0));
        setIsFullyPaid(booking.isFullyPaid !== undefined ? booking.isFullyPaid : true);
        setFinalAmount(booking.finalPaymentAmount || remaining);
        setFinalMethod(booking.finalPaymentMethod || "Cash");
        setFinalRef(booking.finalPaymentReference || "");
        setFinalNotes(booking.finalPaymentNotes || "");
      }
      setErrorMsg("");
    }
  }, [booking, mode]);

  const handleDepositPreset = (percent) => {
    const val = Math.round(grandTotal * (percent / 100));
    setDepositAmount(val);
  };

  const handleOngoingFullyPaidToggle = (checked) => {
    setIsFullyPaid(checked);
    if (checked) {
      setFinalAmount(initialRemainingBalance);
    }
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    setErrorMsg("");

    if (mode === "deposit") {
      const numDP = Number(depositAmount);
      if (isNaN(numDP) || numDP <= 0) {
        setErrorMsg("Please specify a valid deposit payment amount greater than 0.");
        return;
      }

      const calculatedBalance = Math.max(0, grandTotal - numDP);
      const isFull = calculatedBalance === 0;

      onConfirm({
        depositAmount: numDP,
        depositPaymentMethod: depositMethod,
        depositPaidAt: depositDate ? new Date(depositDate).toISOString() : new Date().toISOString(),
        depositReference: depositRef.trim(),
        depositNotes: depositNotes.trim(),
        isFullyPaid: isFull,
        balanceDue: calculatedBalance,
        paymentRecordedAt: new Date().toISOString(),
        paymentLastUpdatedBy: "Admin"
      });
    } else if (mode === "ongoing") {
      const numFinal = Number(finalAmount);
      if (isFullyPaid && numFinal < 0) {
        setErrorMsg("Final payment amount cannot be negative.");
        return;
      }

      const balanceRemaining = isFullyPaid 
        ? 0 
        : Math.max(0, initialRemainingBalance - (isNaN(numFinal) ? 0 : numFinal));

      onConfirm({
        isFullyPaid: Boolean(isFullyPaid),
        finalPaymentAmount: isNaN(numFinal) ? 0 : numFinal,
        finalPaymentMethod: finalMethod,
        finalPaymentPaidAt: finalDate ? new Date(finalDate).toISOString() : new Date().toISOString(),
        finalPaymentReference: finalRef.trim(),
        finalPaymentNotes: finalNotes.trim(),
        balanceDue: balanceRemaining,
        ongoingVerifiedAt: new Date().toISOString(),
        paymentLastUpdatedBy: "Admin"
      });
    }
  };

  const isDepositMode = mode === "deposit";
  const currentRemainingDepositBalance = Math.max(0, grandTotal - (Number(depositAmount) || 0));

  return (
    <div 
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.72)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "1rem",
        overflowY: "auto"
      }}
      onClick={onClose}
    >
      <div 
        style={{
          background: "#ffffff",
          borderRadius: "16px",
          width: "100%",
          maxWidth: "680px",
          maxHeight: "92vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)",
          overflow: "hidden"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div 
          style={{
            padding: "1.25rem 1.5rem",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: isDepositMode 
              ? "linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)" 
              : "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div 
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "10px",
                background: isDepositMode ? "#047857" : "#d97706",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: isDepositMode ? "0 4px 10px rgba(4, 120, 87, 0.25)" : "0 4px 10px rgba(217, 119, 6, 0.25)"
              }}
            >
              {isDepositMode ? <CheckCircle2 size={24} /> : <ShieldCheck size={24} />}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 800, color: "#0f172a" }}>
                {isDepositMode 
                  ? "Confirm Booking & Record Deposit Payment" 
                  : "Verify Payment & Set to Ongoing Event"}
              </h3>
              <p style={{ margin: "2px 0 0", fontSize: "0.78rem", color: "#64748b" }}>
                {isDepositMode 
                  ? "Input reservation downpayment details, payment method & admin notes to confirm." 
                  : "Verify full payment settlement and payment method before starting event service."}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "#94a3b8",
              cursor: "pointer",
              padding: "6px",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.15s ease"
            }}
            title="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div style={{ padding: "1.25rem 1.5rem", overflowY: "auto", flex: 1 }}>
          {/* Quick Booking Info Card */}
          <div 
            style={{
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "12px",
              padding: "1rem",
              marginBottom: "1.25rem"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.5rem" }}>
              <div>
                <span style={{ fontSize: "0.7rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Client & Event Details
                </span>
                <div style={{ fontSize: "1rem", fontWeight: 800, color: "#0f172a", marginTop: "2px" }}>
                  {booking.clientName}
                  {booking.bookingReference && (
                    <span style={{ marginLeft: "8px", fontSize: "0.75rem", fontFamily: "monospace", color: "#047857", background: "#ecfdf5", padding: "2px 6px", borderRadius: "4px", fontWeight: 700 }}>
                      {booking.bookingReference}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: "0.78rem", color: "#64748b", marginTop: "2px" }}>
                  📅 {booking.eventDate || "TBA"} {booking.eventTime ? `at ${booking.eventTime}` : ""} • 📍 {booking.venueName || "Venue TBA"}
                </div>
                <div style={{ fontSize: "0.76rem", color: "#64748b", marginTop: "1px" }}>
                  🍽️ {booking.packageName} ({booking.pax} Guests)
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: "0.7rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Grand Total Contract
                </span>
                <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "#0f172a", fontFamily: "monospace" }}>
                  ₱{grandTotal.toLocaleString()}
                </div>
                {isDepositMode && (
                  <div style={{ fontSize: "0.72rem", color: "#047857", fontWeight: 700 }}>
                    Std 50% DP: ₱{standardDP.toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          </div>

          {errorMsg && (
            <div 
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "0.75rem 1rem",
                borderRadius: "8px",
                background: "#fef2f2",
                border: "1px solid #fecaca",
                color: "#b91c1c",
                fontSize: "0.82rem",
                marginBottom: "1rem"
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* ======================================================== */}
          {/* MODE: DEPOSIT PAYMENT (Confirm Booking) */}
          {/* ======================================================== */}
          {isDepositMode && (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.15rem" }}>
              {/* Deposit Amount Input & Presets */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                  <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "#1e293b" }}>
                    Deposit Payment Amount (PHP) <span style={{ color: "#dc2626" }}>*</span>
                  </label>
                  <div style={{ display: "flex", gap: "4px" }}>
                    <button
                      type="button"
                      onClick={() => handleDepositPreset(50)}
                      style={{
                        background: depositAmount === standardDP ? "#ecfdf5" : "#f1f5f9",
                        border: `1px solid ${depositAmount === standardDP ? "#047857" : "#cbd5e1"}`,
                        color: depositAmount === standardDP ? "#047857" : "#475569",
                        fontSize: "0.7rem",
                        padding: "2px 8px",
                        borderRadius: "4px",
                        fontWeight: 700,
                        cursor: "pointer"
                      }}
                    >
                      50% (Standard)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDepositPreset(30)}
                      style={{
                        background: "#f1f5f9",
                        border: "1px solid #cbd5e1",
                        color: "#475569",
                        fontSize: "0.7rem",
                        padding: "2px 8px",
                        borderRadius: "4px",
                        fontWeight: 700,
                        cursor: "pointer"
                      }}
                    >
                      30% (Mobilization)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDepositPreset(100)}
                      style={{
                        background: "#f1f5f9",
                        border: "1px solid #cbd5e1",
                        color: "#475569",
                        fontSize: "0.7rem",
                        padding: "2px 8px",
                        borderRadius: "4px",
                        fontWeight: 700,
                        cursor: "pointer"
                      }}
                    >
                      100% (Full Pay)
                    </button>
                  </div>
                </div>

                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", fontWeight: 800, color: "#64748b", fontSize: "1rem" }}>
                    ₱
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    required
                    style={{
                      width: "100%",
                      padding: "0.6rem 0.75rem 0.6rem 2rem",
                      fontSize: "1.1rem",
                      fontWeight: 800,
                      fontFamily: "monospace",
                      border: "2px solid #cbd5e1",
                      borderRadius: "8px",
                      outline: "none",
                      boxSizing: "border-box"
                    }}
                    placeholder="Enter deposit amount"
                  />
                </div>

                {/* Balance preview */}
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px", fontSize: "0.75rem" }}>
                  <span style={{ color: "#64748b" }}>
                    Remaining Balance after Deposit:
                  </span>
                  <strong style={{ color: currentRemainingDepositBalance === 0 ? "#047857" : "#b45309", fontFamily: "monospace" }}>
                    {currentRemainingDepositBalance === 0 ? "✓ ₱0 (Paid in Full)" : `₱${currentRemainingDepositBalance.toLocaleString()}`}
                  </strong>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#1e293b", marginBottom: "0.45rem" }}>
                  Payment Method Received <span style={{ color: "#dc2626" }}>*</span>
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "0.5rem" }}>
                  {PAYMENT_METHODS.map((pm) => {
                    const IconComponent = pm.icon;
                    const isSelected = depositMethod === pm.id;
                    const isCash = pm.id === "Cash";
                    return (
                      <button
                        key={pm.id}
                        type="button"
                        onClick={() => setDepositMethod(pm.id)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          padding: "0.55rem 0.75rem",
                          borderRadius: "8px",
                          border: isSelected 
                            ? `2px solid ${pm.color}` 
                            : isCash 
                              ? "2px solid #a7f3d0" 
                              : "1px solid #e2e8f0",
                          background: isSelected ? pm.bg : isCash ? "#f0fdf4" : "#ffffff",
                          cursor: "pointer",
                          textAlign: "left",
                          transition: "all 0.15s ease",
                          position: "relative"
                        }}
                      >
                        <div style={{ color: pm.color, display: "flex", alignItems: "center" }}>
                          <IconComponent size={18} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: "0.78rem", fontWeight: 800, color: isSelected ? pm.color : "#1e293b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {pm.id}
                          </div>
                          {isCash && (
                            <div style={{ fontSize: "0.62rem", color: "#047857", fontWeight: 700 }}>
                              Handover / On-site
                            </div>
                          )}
                        </div>
                        {isSelected && (
                          <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: pm.color }} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Payment Date & Reference */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#1e293b", marginBottom: "0.3rem" }}>
                    Payment Date Received
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      type="date"
                      value={depositDate}
                      onChange={(e) => setDepositDate(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "0.45rem 0.65rem",
                        fontSize: "0.82rem",
                        border: "1px solid #cbd5e1",
                        borderRadius: "8px",
                        boxSizing: "border-box"
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#1e293b", marginBottom: "0.3rem" }}>
                    Reference / Receipt # (Optional)
                  </label>
                  <input
                    type="text"
                    value={depositRef}
                    onChange={(e) => setDepositRef(e.target.value)}
                    placeholder={depositMethod === "Cash" ? "e.g. Cash OR #1042, Store Receipt" : "e.g. GCash Ref #, Bank Slip #"}
                    style={{
                      width: "100%",
                      padding: "0.45rem 0.65rem",
                      fontSize: "0.82rem",
                      border: "1px solid #cbd5e1",
                      borderRadius: "8px",
                      boxSizing: "border-box"
                    }}
                  />
                </div>
              </div>

              {/* Admin Notes */}
              <div>
                <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.78rem", fontWeight: 700, color: "#1e293b", marginBottom: "0.3rem" }}>
                  <span>Admin Confirmation Notes</span>
                  <span style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: 400 }}>Saved to booking record</span>
                </label>
                <textarea
                  rows={2}
                  value={depositNotes}
                  onChange={(e) => setDepositNotes(e.target.value)}
                  placeholder="e.g. Received cash deposit at office. Issued official acknowledgement. Balance due on event date before buffet ingress."
                  style={{
                    width: "100%",
                    padding: "0.5rem 0.65rem",
                    fontSize: "0.82rem",
                    border: "1px solid #cbd5e1",
                    borderRadius: "8px",
                    resize: "vertical",
                    boxSizing: "border-box",
                    fontFamily: "inherit"
                  }}
                />
              </div>

              {/* Modal Actions */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.5rem", borderTop: "1px solid #f1f5f9", paddingTop: "1rem" }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    padding: "0.55rem 1.15rem",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    background: "#ffffff",
                    color: "#475569",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "0.55rem 1.25rem",
                    borderRadius: "8px",
                    border: "none",
                    background: "#047857",
                    color: "#ffffff",
                    fontWeight: 800,
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    boxShadow: "0 4px 12px rgba(4, 120, 87, 0.25)"
                  }}
                >
                  <CheckCircle2 size={16} />
                  <span>Confirm Booking & Save Deposit</span>
                </button>
              </div>
            </form>
          )}

          {/* ======================================================== */}
          {/* MODE: ONGOING PAYMENT VERIFICATION (Before Set to Ongoing) */}
          {/* ======================================================== */}
          {!isDepositMode && (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.15rem" }}>
              {/* Previous Payment Summary Card */}
              <div 
                style={{
                  background: "#fffbeb",
                  border: "1px solid #fde68a",
                  borderRadius: "10px",
                  padding: "0.85rem 1rem",
                  fontSize: "0.8rem"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                  <span style={{ fontWeight: 800, color: "#92400e" }}>
                    📋 Recorded Reservation Deposit:
                  </span>
                  <span style={{ fontWeight: 800, color: "#047857", fontFamily: "monospace", fontSize: "0.9rem" }}>
                    ₱{recordedDeposit.toLocaleString()} ({booking.depositPaymentMethod || "Cash"})
                  </span>
                </div>
                {booking.depositPaidAt && (
                  <div style={{ fontSize: "0.72rem", color: "#78350f" }}>
                    Paid on {new Date(booking.depositPaidAt).toLocaleDateString()} {booking.depositReference ? `• Ref: ${booking.depositReference}` : ""}
                  </div>
                )}
                {booking.depositNotes && (
                  <div style={{ fontSize: "0.72rem", color: "#92400e", fontStyle: "italic", marginTop: "3px" }}>
                    "{booking.depositNotes}"
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "6px", borderTop: "1px dashed #fcd34d", paddingTop: "5px" }}>
                  <span style={{ fontWeight: 700, color: "#78350f" }}>Remaining Balance Before Event Service:</span>
                  <strong style={{ color: initialRemainingBalance === 0 ? "#047857" : "#b45309", fontFamily: "monospace", fontSize: "0.95rem" }}>
                    ₱{initialRemainingBalance.toLocaleString()}
                  </strong>
                </div>
              </div>

              {/* Full Payment Verification Toggle */}
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#1e293b", marginBottom: "0.45rem" }}>
                  Payment Verification Status <span style={{ color: "#dc2626" }}>*</span>
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <button
                    type="button"
                    onClick={() => handleOngoingFullyPaidToggle(true)}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      padding: "0.75rem 1rem",
                      borderRadius: "10px",
                      border: isFullyPaid ? "2px solid #047857" : "1px solid #cbd5e1",
                      background: isFullyPaid ? "#ecfdf5" : "#ffffff",
                      cursor: "pointer",
                      textAlign: "left"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", color: isFullyPaid ? "#047857" : "#475569", fontWeight: 800, fontSize: "0.85rem" }}>
                      <CheckCircle2 size={18} />
                      <span>Fully Paid (100% Settled)</span>
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: "3px" }}>
                      All balance cleared. Zero remaining balance.
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOngoingFullyPaidToggle(false)}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      padding: "0.75rem 1rem",
                      borderRadius: "10px",
                      border: !isFullyPaid ? "2px solid #d97706" : "1px solid #cbd5e1",
                      background: !isFullyPaid ? "#fffbeb" : "#ffffff",
                      cursor: "pointer",
                      textAlign: "left"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", color: !isFullyPaid ? "#b45309" : "#475569", fontWeight: 800, fontSize: "0.85rem" }}>
                      <Clock size={18} />
                      <span>Partial / Balance Pending</span>
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: "3px" }}>
                      Balance to be collected post-event or during egress.
                    </div>
                  </button>
                </div>
              </div>

              {/* Payment Method Used for Balance / Settlement */}
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#1e293b", marginBottom: "0.45rem" }}>
                  Payment Method Used for Balance / Verification <span style={{ color: "#dc2626" }}>*</span>
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "0.5rem" }}>
                  {PAYMENT_METHODS.map((pm) => {
                    const IconComponent = pm.icon;
                    const isSelected = finalMethod === pm.id;
                    const isCash = pm.id === "Cash";
                    return (
                      <button
                        key={pm.id}
                        type="button"
                        onClick={() => setFinalMethod(pm.id)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          padding: "0.55rem 0.75rem",
                          borderRadius: "8px",
                          border: isSelected 
                            ? `2px solid ${pm.color}` 
                            : isCash 
                              ? "2px solid #a7f3d0" 
                              : "1px solid #e2e8f0",
                          background: isSelected ? pm.bg : isCash ? "#f0fdf4" : "#ffffff",
                          cursor: "pointer",
                          textAlign: "left",
                          transition: "all 0.15s ease"
                        }}
                      >
                        <div style={{ color: pm.color, display: "flex", alignItems: "center" }}>
                          <IconComponent size={18} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: "0.78rem", fontWeight: 800, color: isSelected ? pm.color : "#1e293b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {pm.id}
                          </div>
                          {isCash && (
                            <div style={{ fontSize: "0.62rem", color: "#047857", fontWeight: 700 }}>
                              Cash Settlement
                            </div>
                          )}
                        </div>
                        {isSelected && (
                          <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: pm.color }} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Balance Amount Paid & Date */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#1e293b", marginBottom: "0.3rem" }}>
                    {isFullyPaid ? "Settled Balance Amount (PHP)" : "Amount Paid Today (PHP)"}
                  </label>
                  <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", fontWeight: 800, color: "#64748b" }}>
                      ₱
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={finalAmount}
                      onChange={(e) => setFinalAmount(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "0.45rem 0.65rem 0.45rem 1.8rem",
                        fontSize: "0.95rem",
                        fontWeight: 700,
                        fontFamily: "monospace",
                        border: "1px solid #cbd5e1",
                        borderRadius: "8px",
                        boxSizing: "border-box"
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#1e293b", marginBottom: "0.3rem" }}>
                    Verification Date
                  </label>
                  <input
                    type="date"
                    value={finalDate}
                    onChange={(e) => setFinalDate(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.45rem 0.65rem",
                      fontSize: "0.82rem",
                      border: "1px solid #cbd5e1",
                      borderRadius: "8px",
                      boxSizing: "border-box"
                    }}
                  />
                </div>
              </div>

              {/* Reference Number */}
              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#1e293b", marginBottom: "0.3rem" }}>
                  OR / Receipt / Handover Reference (Optional)
                </label>
                <input
                  type="text"
                  value={finalRef}
                  onChange={(e) => setFinalRef(e.target.value)}
                  placeholder={finalMethod === "Cash" ? "e.g. Cash collected on-site by Head Waiter / OR #5819" : "e.g. Bank Confirmation / GCash Reference"}
                  style={{
                    width: "100%",
                    padding: "0.45rem 0.65rem",
                    fontSize: "0.82rem",
                    border: "1px solid #cbd5e1",
                    borderRadius: "8px",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              {/* Admin Verification Notes */}
              <div>
                <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.78rem", fontWeight: 700, color: "#1e293b", marginBottom: "0.3rem" }}>
                  <span>Admin Verification Notes for Ongoing Service</span>
                  <span style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: 400 }}>Saved to booking record</span>
                </label>
                <textarea
                  rows={2}
                  value={finalNotes}
                  onChange={(e) => setFinalNotes(e.target.value)}
                  placeholder="e.g. Full cash payment verified by Head Coordinator prior to food service. Ingress completed and buffet ready for presentation."
                  style={{
                    width: "100%",
                    padding: "0.5rem 0.65rem",
                    fontSize: "0.82rem",
                    border: "1px solid #cbd5e1",
                    borderRadius: "8px",
                    resize: "vertical",
                    boxSizing: "border-box",
                    fontFamily: "inherit"
                  }}
                />
              </div>

              {/* Modal Actions */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.5rem", borderTop: "1px solid #f1f5f9", paddingTop: "1rem" }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    padding: "0.55rem 1.15rem",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    background: "#ffffff",
                    color: "#475569",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "0.55rem 1.25rem",
                    borderRadius: "8px",
                    border: "none",
                    background: "#d97706",
                    color: "#ffffff",
                    fontWeight: 800,
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    boxShadow: "0 4px 12px rgba(217, 119, 6, 0.25)"
                  }}
                >
                  <ShieldCheck size={16} />
                  <span>Verify Payment & Set to Ongoing</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
