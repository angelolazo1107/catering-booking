import React, { useState, useMemo } from "react";
import { Users, UserCheck, ShieldCheck, Clock, DollarSign, Printer, Check, AlertCircle } from "lucide-react";

export default function StaffLogisticsCalculator({ bookings = [] }) {
  const [selectedBookingId, setSelectedBookingId] = useState(bookings[0]?.id || "manual");
  const [manualPax, setManualPax] = useState(100);
  const [serviceStyle, setServiceStyle] = useState("buffet"); // "buffet" (1:25) or "plated" (1:18)
  const [hasLechonStation, setHasLechonStation] = useState(true);
  const [hasMobileBar, setHasMobileBar] = useState(false);

  const activeBooking = bookings.find(b => b.id === selectedBookingId);

  const currentPax = activeBooking ? (activeBooking.pax || 100) : manualPax;
  const isPremiere = activeBooking ? (activeBooking.packageId === "royal_premiere") : false;

  // Auto detect lechon and bar from booking addons
  const isLechonIncluded = useMemo(() => {
    if (activeBooking) {
      if (activeBooking.packageId === "royal_premiere") return true;
      return (activeBooking.selectedAddons || []).some(a => a.id && a.id.includes("lechon"));
    }
    return hasLechonStation;
  }, [activeBooking, hasLechonStation]);

  const isBarIncluded = useMemo(() => {
    if (activeBooking) {
      if (activeBooking.packageId === "royal_premiere") return true;
      return (activeBooking.selectedAddons || []).some(a => a.id && a.id.includes("bar"));
    }
    return hasMobileBar;
  }, [activeBooking, hasMobileBar]);

  // Compute Headcount
  const staffRatio = serviceStyle === "plated" ? 18 : 25;
  const banquetWaitersCount = Math.max(2, Math.ceil(currentPax / staffRatio));
  const captainWaitersCount = currentPax >= 150 ? 2 : 1;
  const buffetStewardsCount = Math.max(1, Math.ceil(currentPax / 60));
  const carversCount = isLechonIncluded ? 1 : 0;
  const bartendersCount = isBarIncluded ? Math.max(1, Math.ceil(currentPax / 80)) : 0;

  const totalCrewHeadcount = banquetWaitersCount + captainWaitersCount + buffetStewardsCount + carversCount + bartendersCount;

  // Wage estimates (PHP standard catering rates per event)
  const waiterRate = 800;
  const captainRate = 1400;
  const stewardRate = 750;
  const carverRate = 1000;
  const bartenderRate = 1100;

  const totalLaborBudget = 
    (banquetWaitersCount * waiterRate) +
    (captainWaitersCount * captainRate) +
    (buffetStewardsCount * stewardRate) +
    (carversCount * carverRate) +
    (bartendersCount * bartenderRate);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ maxWidth: "1150px", margin: "0 auto" }}>
      {/* Controls Header */}
      <div className="card-section no-print" style={{ padding: "1.25rem 1.5rem", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <span className="pkg-badge" style={{ position: "static", marginBottom: "0.4rem", display: "inline-block" }}>
              CaterFlow Operations
            </span>
            <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--text-primary)" }}>
              Banquet Service Crew & Staffing Logistics
            </h2>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "2px" }}>
              Automated crew allocations based on guest count, buffet style, carving stations, and mobile bars.
            </p>
          </div>

          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-secondary)" }}>Event:</label>
              <select
                className="form-select"
                style={{ minWidth: "220px", fontSize: "0.85rem" }}
                value={selectedBookingId}
                onChange={(e) => setSelectedBookingId(e.target.value)}
              >
                {bookings.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.id} — {b.clientName} ({b.pax} pax)
                  </option>
                ))}
                <option value="manual">Custom Staff Simulation</option>
              </select>
            </div>

            {selectedBookingId === "manual" && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <label style={{ fontSize: "0.8rem", fontWeight: 700 }}>Pax:</label>
                <input
                  type="number"
                  min="20"
                  step="10"
                  className="form-input"
                  style={{ width: "85px", fontSize: "0.85rem" }}
                  value={manualPax}
                  onChange={(e) => setManualPax(Math.max(10, Number(e.target.value)))}
                />
              </div>
            )}

            <button className="btn-primary" onClick={handlePrint} style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <Printer size={16} />
              <span>Print Crew Call Sheet</span>
            </button>
          </div>
        </div>
      </div>

      {/* Headcount KPIs */}
      <div className="no-print" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
        <div className="card-section" style={{ marginBottom: 0, padding: "1.2rem" }}>
          <div style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: 700 }}>Total Crew Required</div>
          <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--text-primary)", marginTop: "0.3rem" }}>
            {totalCrewHeadcount} <span style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>Staff</span>
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>For {currentPax} confirmed guests</div>
        </div>

        <div className="card-section" style={{ marginBottom: 0, padding: "1.2rem" }}>
          <div style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--gold-600)", fontWeight: 700 }}>Banquet Waiters</div>
          <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--gold-600)", marginTop: "0.3rem" }}>
            {banquetWaitersCount} <span style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>Attendants</span>
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Ratio: 1 waiter per {staffRatio} pax</div>
        </div>

        <div className="card-section" style={{ marginBottom: 0, padding: "1.2rem" }}>
          <div style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--emerald-600)", fontWeight: 700 }}>Estimated Payroll Budget</div>
          <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--emerald-600)", marginTop: "0.3rem" }}>
            ₱{totalLaborBudget.toLocaleString()}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Covered by Service Charge</div>
        </div>
      </div>

      {/* Printable Crew Call Sheet */}
      <div className="card-section print-clean-wrapper" style={{ padding: "2rem" }}>
        <div style={{ borderBottom: "2px solid var(--gold-500)", paddingBottom: "1.25rem", marginBottom: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1px", color: "var(--gold-600)", fontWeight: 800 }}>
              CaterFlow PH • Event Operations Call Sheet
            </div>
            <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text-primary)", margin: "0.25rem 0" }}>
              Banquet Staffing & Crew Deployment
            </h1>
            <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
              Client: <strong>{activeBooking ? activeBooking.clientName : "Special Event"}</strong> • Venue: <strong>{activeBooking ? activeBooking.venueName : "Grand Ballroom"}</strong>
            </div>
          </div>

          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-primary)" }}>
              Event Date: {activeBooking ? activeBooking.eventDate : new Date().toLocaleDateString()}
            </div>
            <div style={{ fontSize: "0.8rem", color: "var(--gold-700)", fontWeight: 700 }}>
              Buffet Serving: {activeBooking ? activeBooking.eventTime : "18:00"} (Call-time: 15:00)
            </div>
          </div>
        </div>

        {/* Breakdown Table */}
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
          <thead>
            <tr style={{ background: "var(--surface-sunken)", borderBottom: "1px solid var(--border-subtle)", color: "var(--text-muted)", fontSize: "0.75rem", textTransform: "uppercase" }}>
              <th style={{ padding: "0.75rem 1rem" }}>Role / Designation</th>
              <th style={{ padding: "0.75rem 1rem" }}>Allocation Rule</th>
              <th style={{ padding: "0.75rem 1rem", textAlign: "center" }}>Headcount</th>
              <th style={{ padding: "0.75rem 1rem", textAlign: "right" }} className="no-print">Honorarium</th>
              <th style={{ padding: "0.75rem 1rem", textAlign: "right" }}>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
              <td style={{ padding: "0.75rem 1rem", fontWeight: 700, color: "var(--text-primary)" }}>
                Captain Waiter / Banquet Supervisor
              </td>
              <td style={{ padding: "0.75rem 1rem", color: "var(--text-muted)" }}>
                Senior lead managing client coordination, sequence of service & VIP table
              </td>
              <td style={{ padding: "0.75rem 1rem", textAlign: "center", fontWeight: 800, color: "var(--gold-700)" }}>
                {captainWaitersCount}
              </td>
              <td style={{ padding: "0.75rem 1rem", textAlign: "right", color: "var(--text-muted)" }} className="no-print">
                ₱{captainRate}
              </td>
              <td style={{ padding: "0.75rem 1rem", textAlign: "right", fontWeight: 600 }}>
                ₱{(captainWaitersCount * captainRate).toLocaleString()}
              </td>
            </tr>

            <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
              <td style={{ padding: "0.75rem 1rem", fontWeight: 700, color: "var(--text-primary)" }}>
                Banquet Service Waiters
              </td>
              <td style={{ padding: "0.75rem 1rem", color: "var(--text-muted)" }}>
                Guest table attendance, drink refills, clearing plates & busboy duties
              </td>
              <td style={{ padding: "0.75rem 1rem", textAlign: "center", fontWeight: 800, color: "var(--gold-700)" }}>
                {banquetWaitersCount}
              </td>
              <td style={{ padding: "0.75rem 1rem", textAlign: "right", color: "var(--text-muted)" }} className="no-print">
                ₱{waiterRate}
              </td>
              <td style={{ padding: "0.75rem 1rem", textAlign: "right", fontWeight: 600 }}>
                ₱{(banquetWaitersCount * waiterRate).toLocaleString()}
              </td>
            </tr>

            <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
              <td style={{ padding: "0.75rem 1rem", fontWeight: 700, color: "var(--text-primary)" }}>
                Buffet Line Stewards
              </td>
              <td style={{ padding: "0.75rem 1rem", color: "var(--text-muted)" }}>
                Chafing fuel management, viand replenishment, sneeze guard cleanliness
              </td>
              <td style={{ padding: "0.75rem 1rem", textAlign: "center", fontWeight: 800, color: "var(--gold-700)" }}>
                {buffetStewardsCount}
              </td>
              <td style={{ padding: "0.75rem 1rem", textAlign: "right", color: "var(--text-muted)" }} className="no-print">
                ₱{stewardRate}
              </td>
              <td style={{ padding: "0.75rem 1rem", textAlign: "right", fontWeight: 600 }}>
                ₱{(buffetStewardsCount * stewardRate).toLocaleString()}
              </td>
            </tr>

            {carversCount > 0 && (
              <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                <td style={{ padding: "0.75rem 1rem", fontWeight: 700, color: "var(--text-primary)" }}>
                  Live Lechon Carver Chef
                </td>
                <td style={{ padding: "0.75rem 1rem", color: "var(--text-muted)" }}>
                  Specialist carving attendant for whole crispy roast pig station
                </td>
                <td style={{ padding: "0.75rem 1rem", textAlign: "center", fontWeight: 800, color: "var(--gold-700)" }}>
                  {carversCount}
                </td>
                <td style={{ padding: "0.75rem 1rem", textAlign: "right", color: "var(--text-muted)" }} className="no-print">
                  ₱{carverRate}
                </td>
                <td style={{ padding: "0.75rem 1rem", textAlign: "right", fontWeight: 600 }}>
                  ₱{(carversCount * carverRate).toLocaleString()}
                </td>
              </tr>
            )}

            {bartendersCount > 0 && (
              <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                <td style={{ padding: "0.75rem 1rem", fontWeight: 700, color: "var(--text-primary)" }}>
                  Cocktail & Mocktail Bartender
                </td>
                <td style={{ padding: "0.75rem 1rem", color: "var(--text-muted)" }}>
                  Dedicated bar tender for 3-hour open mobile bar station
                </td>
                <td style={{ padding: "0.75rem 1rem", textAlign: "center", fontWeight: 800, color: "var(--gold-700)" }}>
                  {bartendersCount}
                </td>
                <td style={{ padding: "0.75rem 1rem", textAlign: "right", color: "var(--text-muted)" }} className="no-print">
                  ₱{bartenderRate}
                </td>
                <td style={{ padding: "0.75rem 1rem", textAlign: "right", fontWeight: 600 }}>
                  ₱{(bartendersCount * bartenderRate).toLocaleString()}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Notes & Protocol Box */}
        <div style={{ background: "var(--surface-sunken)", padding: "1rem", borderRadius: "8px", border: "1px solid var(--border-subtle)", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
          <strong>Service Protocol:</strong>
          <ul style={{ margin: "0.4rem 0 0 1.2rem", padding: 0 }}>
            <li>Ingress & Setup: Exactly 3 hours before buffet opening. Egress clearing: 1 hour post-service.</li>
            <li>Uniform: Full formal black polo/barong, black slacks, leather shoes, service apron, and face mask.</li>
            <li>VIP Presidential table to be served plated courses by Captain Waiter.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
