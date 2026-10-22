import React, { useState } from "react";
import { Search, Calendar, MapPin, Users, CheckCircle2, Clock, AlertCircle, Phone, ArrowLeft, DollarSign, FileText } from "lucide-react";
import { getBookings } from "../services/backendService";
import { CATERER_INFO } from "../data/cateringData";

export default function TrackReservation({ activeCompany, onViewBooking, onNewBooking }) {
  const [refId, setRefId] = useState("");
  const [searchedBooking, setSearchedBooking] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    const query = refId.trim();
    if (!query) return;

    setIsLoading(true);
    try {
      const allBookings = await getBookings(activeCompany?.id);
      const found = allBookings.find(b => 
        (b.companyId === activeCompany?.id || !b.companyId) &&
        ((b.bookingReference && b.bookingReference.toLowerCase() === query.toLowerCase()) ||
        (b.id && b.id.toLowerCase() === query.toLowerCase()) ||
        (b.contactNumber && b.contactNumber.replace(/[^0-9]/g, "") === query.replace(/[^0-9]/g, "")))
      );
      setSearchedBooking(found || null);
      setHasSearched(true);
    } catch (err) {
      console.error("Error searching booking:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Confirmed":
        return { bg: "#ecfdf5", border: "#a7f3d0", color: "#065f46", text: "Confirmed (Reservation Downpayment Paid)" };
      case "Ongoing":
        return { bg: "#fffbeb", border: "#fde68a", color: "#b45309", text: "Ongoing (Event in Progress / Preparation)" };
      case "Completed":
        return { bg: "#faf5ff", border: "#e9d5ff", color: "#7e22ce", text: "Completed Event" };
      case "Cancelled":
        return { bg: "#fef2f2", border: "#fecaca", color: "#b91c1c", text: "Booking Cancelled" };
      case "Sent":
        return { bg: "#eff6ff", border: "#bfdbfe", color: "#1e40af", text: "Quotation Issued (Awaiting Confirmation)" };
      default:
        return { bg: "#fef3c7", border: "#fde68a", color: "#92400e", text: "Draft / Under Review by Catering Team" };
    }
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "1rem" }}>
      <div className="card-section" style={{ textAlign: "center", padding: "2.5rem 1.5rem" }}>
        <h2 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "0.5rem" }}>
          Track Your Event Reservation
        </h2>
        <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", maxWidth: "520px", margin: "0 auto 1.75rem" }}>
          Enter your Catering Reference Number (e.g. <code>QT-2026-XXXX</code> or <code>BK-2026-XXXX</code>) or contact number to check your date reservation, balance, and menu status.
        </p>

        <form onSubmit={handleSearch} style={{ maxWidth: "480px", margin: "0 auto", display: "flex", gap: "0.5rem" }}>
          <div style={{ position: "relative", flex: 1 }}>
            <Search size={18} style={{ position: "absolute", left: "12px", top: "12px", color: "var(--text-muted)" }} />
            <input
              type="text"
              required
              placeholder="e.g. QT-2026-0950 or 0917-xxx-xxxx"
              className="form-input"
              style={{ paddingLeft: "36px", fontSize: "0.95rem" }}
              value={refId}
              onChange={(e) => setRefId(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-primary" disabled={isLoading} style={{ whiteSpace: "nowrap" }}>
            {isLoading ? "Searching..." : "Track Status"}
          </button>
        </form>
      </div>

      {hasSearched && (
        <div>
          {searchedBooking ? (
            <div className="card-section" style={{ animation: "fadeIn 0.3s ease" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.75rem", marginBottom: "1.25rem", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "1rem" }}>
                <div>
                  <span style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: 700 }}>
                    {searchedBooking.bookingReference ? "Confirmed Booking Reference" : "Quote Reference"}
                  </span>
                  <div style={{ fontSize: "1.25rem", fontWeight: 800, color: searchedBooking.bookingReference ? "#047857" : "var(--gold-600)", fontFamily: "monospace", wordBreak: "break-all" }}>
                    {searchedBooking.bookingReference || searchedBooking.id}
                  </div>
                  {searchedBooking.bookingReference && (
                    <div style={{ fontSize: "0.74rem", color: "var(--text-muted)", fontFamily: "monospace" }}>
                      Original Quote: {searchedBooking.id}
                    </div>
                  )}
                  <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--text-primary)", marginTop: "2px" }}>
                    {searchedBooking.clientName}
                  </div>
                </div>

                <div>
                  {(() => {
                    const badge = getStatusBadge(searchedBooking.status);
                    return (
                      <span style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.4rem",
                        background: badge.bg,
                        border: `1px solid ${badge.border}`,
                        color: badge.color,
                        padding: "0.4rem 0.85rem",
                        borderRadius: "20px",
                        fontSize: "0.82rem",
                        fontWeight: 700
                      }}>
                        <CheckCircle2 size={15} />
                        <span>{badge.text}</span>
                      </span>
                    );
                  })()}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
                <div style={{ background: "var(--surface-sunken)", padding: "0.85rem", borderRadius: "8px" }}>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Event Date & Time</div>
                  <div style={{ fontWeight: 700, color: "var(--text-primary)", marginTop: "3px", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                    <Calendar size={15} color="var(--gold-600)" />
                    <span>{searchedBooking.eventDate || "TBA"} ({searchedBooking.eventTime || "Buffet"})</span>
                  </div>
                </div>

                <div style={{ background: "var(--surface-sunken)", padding: "0.85rem", borderRadius: "8px" }}>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Venue Location</div>
                  <div style={{ fontWeight: 700, color: "var(--text-primary)", marginTop: "3px", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                    <MapPin size={15} color="var(--gold-600)" />
                    <span>{searchedBooking.venueName || "Metro Manila"}</span>
                  </div>
                </div>

                <div style={{ background: "var(--surface-sunken)", padding: "0.85rem", borderRadius: "8px" }}>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Package & Guests</div>
                  <div style={{ fontWeight: 700, color: "var(--text-primary)", marginTop: "3px", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                    <Users size={15} color="var(--gold-600)" />
                    <span>{searchedBooking.pax} Pax • {searchedBooking.packageName}</span>
                  </div>
                </div>
              </div>

              {/* Payment Status Box */}
              <div style={{ background: "#fafafa", border: "1px solid var(--border-subtle)", borderRadius: "8px", padding: "1.25rem", marginBottom: "1.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
                  <div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Total Contract Price</div>
                    <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--text-primary)" }}>
                      ₱{(searchedBooking.grandTotal || 0).toLocaleString()}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
                      {searchedBooking.depositAmount ? "Recorded Deposit Paid" : "50% Downpayment (Reservation)"}
                    </div>
                    <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--emerald-600)" }}>
                      ₱{(searchedBooking.depositAmount || searchedBooking.downpaymentRequired || Math.round((searchedBooking.grandTotal || 0) * 0.5)).toLocaleString()}
                    </div>
                    {searchedBooking.depositPaymentMethod && (
                      <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                        Channel: <strong>{searchedBooking.depositPaymentMethod}</strong>
                      </div>
                    )}
                  </div>

                  <div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Remaining Balance Due</div>
                    <div style={{ fontSize: "1.2rem", fontWeight: 700, color: searchedBooking.isFullyPaid ? "var(--emerald-600)" : "var(--gold-600)" }}>
                      ₱{(searchedBooking.isFullyPaid ? 0 : (searchedBooking.balanceDue !== undefined ? searchedBooking.balanceDue : Math.round((searchedBooking.grandTotal || 0) * 0.5))).toLocaleString()}
                    </div>
                    {searchedBooking.isFullyPaid && (
                      <div style={{ fontSize: "0.72rem", color: "#047857", fontWeight: 700 }}>
                        ✓ 100% Fully Settled ({searchedBooking.finalPaymentMethod || searchedBooking.depositPaymentMethod || "Cash"})
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
                <a 
                  href={`tel:${CATERER_INFO.phone.split("/")[0].trim()}`}
                  style={{ textDecoration: "none", color: "var(--text-secondary)", fontSize: "0.85rem", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
                >
                  <Phone size={15} color="var(--gold-600)" />
                  <span>Need changes? Call our coordinator: <strong>{CATERER_INFO.phone.split("/")[0].trim()}</strong></span>
                </a>

                {onViewBooking && (
                  <button className="btn-primary" onClick={() => onViewBooking(searchedBooking)}>
                    <FileText size={16} />
                    <span>View Formal Quotation / PDF</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="card-section" style={{ textAlign: "center", padding: "2.5rem 1rem", color: "var(--text-muted)" }}>
              <AlertCircle size={40} color="var(--gold-500)" style={{ margin: "0 auto 0.75rem" }} />
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.3rem" }}>
                No Reservation Found
              </h3>
              <p style={{ fontSize: "0.85rem", maxWidth: "420px", margin: "0 auto 1.25rem" }}>
                We could not find an active reservation matching "{refId}". Please double check your quotation reference number or create a new booking below.
              </p>
              <button className="btn-primary" onClick={onNewBooking}>
                Book a Catering Package
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
