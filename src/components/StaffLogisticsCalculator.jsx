import React, { useState, useMemo } from "react";
import { Users, UserCheck, ShieldCheck, Clock, DollarSign, Printer, Check, AlertCircle } from "lucide-react";
import { formatTime12Hour } from "../utils/bookingUtils";

export default function StaffLogisticsCalculator({ bookings = [] }) {
  const [selectedBookingId, setSelectedBookingId] = useState(bookings[0]?.id || "manual");
  const [manualPax, setManualPax] = useState(100);
  const [serviceStyle, setServiceStyle] = useState("buffet"); // "buffet", "plated", "food_tray", "pica_pica", "grazing_table"
  const [hasLechonStation, setHasLechonStation] = useState(true);
  const [hasMobileBar, setHasMobileBar] = useState(false);

  const activeBooking = bookings.find(b => b.id === selectedBookingId);

  const currentPax = activeBooking ? (activeBooking.pax || 100) : manualPax;
  const isPremiere = activeBooking ? (activeBooking.packageId === "royal_premiere") : false;

  // Auto detect service type
  const effectiveServiceType = useMemo(() => {
    if (activeBooking) {
      if (activeBooking.serviceType) return activeBooking.serviceType;
      if (activeBooking.isPackedMeal || activeBooking.packageId?.startsWith("pm_")) return "packed_meal";
      if (activeBooking.isFoodTray || activeBooking.packageId?.startsWith("food_tray")) return "food_tray";
      if (activeBooking.isPicaPica || activeBooking.packageId?.startsWith("pica_pica")) return "pica_pica";
      if (activeBooking.isGrazingTable || activeBooking.packageId?.startsWith("grazing_")) return "grazing_table";
    }
    return serviceStyle;
  }, [activeBooking, serviceStyle]);

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

  // Compute Headcount based on Service Type
  const roles = useMemo(() => {
    if (effectiveServiceType === "packed_meal") {
      const driverCount = 1;
      const attendantCount = Math.max(1, Math.ceil(currentPax / 60));
      return [
        {
          title: "Logistics Dispatch Driver",
          rule: "Vehicle transit, thermal bento carrier box transport & drop-off handover",
          count: driverCount,
          rate: 900
        },
        {
          title: "Packed Meal Delivery & Handover Attendant",
          rule: "Meal box count verification, thermal unpacking, cutlery kit distribution & client sign-off",
          count: attendantCount,
          rate: 750
        }
      ];
    }

    if (effectiveServiceType === "food_tray") {
      const driverCount = 1;
      const attendantCount = Math.max(1, Math.ceil(currentPax / 50));
      return [
        {
          title: "Logistics Dispatch Driver",
          rule: "Delivery vehicle transit, thermal box transport & drop-off handover",
          count: driverCount,
          rate: 900
        },
        {
          title: "Food Tray Setup Attendant",
          rule: "Drop-off table setup, wire rack assembly, thermal unboxing & serving utensils handover",
          count: attendantCount,
          rate: 750
        }
      ];
    }

    if (effectiveServiceType === "pica_pica") {
      const supervisorCount = 1;
      const cocktailWaiters = Math.max(2, Math.ceil(currentPax / 35));
      const stationChef = 1;
      const bartenderCount = Math.max(1, Math.ceil(currentPax / 60));
      return [
        {
          title: "Cocktail Station Lead / Supervisor",
          rule: "Coordinates cocktail timeline, appetizer replenishment flow & VIP coordination",
          count: supervisorCount,
          rate: 1400
        },
        {
          title: "Cocktail Tray-Pass & Replenish Waiters",
          rule: "Continuous cocktail tray circulation, bite replenishments, and glass bussing (1:35 pax)",
          count: cocktailWaiters,
          rate: 800
        },
        {
          title: "DIY Station Attendant Chef",
          rule: "Manning live interactive appetizer station (Croissant / Nacho / Kakanin)",
          count: stationChef,
          rate: 1000
        },
        {
          title: "Beverage & Mocktail Server",
          rule: "Cocktail cooler dispenser management, ice service, and glassware refills",
          count: bartenderCount,
          rate: 1100
        }
      ];
    }

    if (effectiveServiceType === "grazing_table") {
      const stylistCount = 1;
      const replenishAttendant = Math.max(1, Math.ceil(currentPax / 50));
      const busser = 1;
      return [
        {
          title: "Master Charcuterie & Food Stylist",
          rule: "Lead food stylist for live tiered table aesthetic, floral layout, and charcuterie assembly",
          count: stylistCount,
          rate: 1800
        },
        {
          title: "Grazing Table Replenish Attendant",
          rule: "Monitoring charcuterie boards, cheese slicing, fruit refreshes, and bread refills",
          count: replenishAttendant,
          rate: 800
        },
        {
          title: "Glassware & Bus-Out Steward",
          rule: "Clearing cocktail plates, appetizer picks, used glassware, and table cleanliness",
          count: busser,
          rate: 750
        }
      ];
    }

    // Default: Banquet Buffet / Plated
    const staffRatio = serviceStyle === "plated" ? 18 : 25;
    const banquetWaitersCount = Math.max(2, Math.ceil(currentPax / staffRatio));
    const captainWaitersCount = currentPax >= 150 ? 2 : 1;
    const buffetStewardsCount = Math.max(1, Math.ceil(currentPax / 60));
    const carversCount = isLechonIncluded ? 1 : 0;
    const bartendersCount = isBarIncluded ? Math.max(1, Math.ceil(currentPax / 80)) : 0;

    const list = [
      {
        title: "Captain Waiter / Banquet Supervisor",
        rule: "Senior lead managing client coordination, sequence of service & VIP table",
        count: captainWaitersCount,
        rate: 1400
      },
      {
        title: "Banquet Service Waiters",
        rule: `Guest table attendance, drink refills, clearing plates & busboy duties (1:${staffRatio} pax)`,
        count: banquetWaitersCount,
        rate: 800
      },
      {
        title: "Buffet Line Stewards",
        rule: "Chafing fuel management, viand replenishment, sneeze guard cleanliness",
        count: buffetStewardsCount,
        rate: 750
      }
    ];

    if (carversCount > 0) {
      list.push({
        title: "Live Lechon Carver Chef",
        rule: "Specialist carving attendant for whole crispy roast pig station",
        count: carversCount,
        rate: 1000
      });
    }

    if (bartendersCount > 0) {
      list.push({
        title: "Banquet Bartender / Mixologist",
        rule: "Mobile bar cocktails, draft beer pouring & beverage station management",
        count: bartendersCount,
        rate: 1100
      });
    }

    return list;
  }, [effectiveServiceType, serviceStyle, currentPax, isLechonIncluded, isBarIncluded]);

  const totalCrewHeadcount = roles.reduce((sum, r) => sum + r.count, 0);
  const totalLaborBudget = roles.reduce((sum, r) => sum + (r.count * r.rate), 0);

  const handlePrint = () => {
    window.print();
  };

  const getServiceLabel = (type) => {
    switch (type) {
      case "packed_meal": return "🍱 Packed Meals / Bento";
      case "food_tray": return "🍱 Food Tray Drop-Off";
      case "pica_pica": return "🍢 Pica Pica Cocktail Station";
      case "grazing_table": return "🧀 Grazing Table Charcuterie";
      default: return "🍽️ Full Buffet Banquet";
    }
  };

  return (
    <div style={{ maxWidth: "1150px", margin: "0 auto" }}>
      {/* Controls Header */}
      <div className="card-section no-print" style={{ padding: "1.25rem 1.5rem", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "0.4rem" }}>
              <span className="pkg-badge" style={{ position: "static", display: "inline-block" }}>
                CaterFlow Operations
              </span>
              <span style={{ fontSize: "0.74rem", background: "var(--gold-100)", color: "var(--gold-800)", padding: "2px 8px", borderRadius: "12px", fontWeight: 700 }}>
                {getServiceLabel(effectiveServiceType)}
              </span>
            </div>
            <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--text-primary)" }}>
              Banquet Service Crew & Staffing Logistics
            </h2>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "2px" }}>
              Automated crew allocations based on guest count, buffet style, cocktail stations, and food styling.
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
                    {b.id} — {b.clientName} ({b.pax} pax • {b.serviceType === "packed_meal" ? "Packed Meal" : b.serviceType === "food_tray" ? "Tray" : b.serviceType === "pica_pica" ? "Pica" : b.serviceType === "grazing_table" ? "Grazing" : "Buffet"})
                  </option>
                ))}
                <option value="manual">Custom Staff Simulation</option>
              </select>
            </div>

            {selectedBookingId === "manual" && (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <label style={{ fontSize: "0.8rem", fontWeight: 700 }}>Pax:</label>
                  <input
                    type="number"
                    min="10"
                    step="5"
                    className="form-input"
                    style={{ width: "85px", fontSize: "0.85rem" }}
                    value={manualPax}
                    onChange={(e) => setManualPax(Math.max(5, Number(e.target.value)))}
                  />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <label style={{ fontSize: "0.8rem", fontWeight: 700 }}>Service:</label>
                  <select
                    className="form-select"
                    style={{ fontSize: "0.8rem" }}
                    value={serviceStyle}
                    onChange={(e) => setServiceStyle(e.target.value)}
                  >
                    <option value="buffet">Buffet (1:25 Waiters)</option>
                    <option value="plated">Plated (1:18 Waiters)</option>
                    <option value="packed_meal">Packed Meal / Bento (Min 50 PAX)</option>
                    <option value="food_tray">Food Tray Delivery</option>
                    <option value="pica_pica">Pica Pica Cocktail</option>
                    <option value="grazing_table">Grazing Table Styling</option>
                  </select>
                </div>
              </>
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
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>For {currentPax} confirmed guests ({getServiceLabel(effectiveServiceType)})</div>
        </div>

        <div className="card-section" style={{ marginBottom: 0, padding: "1.2rem" }}>
          <div style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--gold-600)", fontWeight: 700 }}>Active Roles</div>
          <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--gold-600)", marginTop: "0.3rem" }}>
            {roles.length} <span style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>Designations</span>
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Tailored to operational flow</div>
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
              Banquet Staffing & Crew Deployment ({getServiceLabel(effectiveServiceType)})
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
              Serving Time: {activeBooking ? formatTime12Hour(activeBooking.eventTime) : "6:00 PM"} (Call-time: 3:00 PM)
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
            {roles.map((r, idx) => (
              <tr key={idx} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                <td style={{ padding: "0.75rem 1rem", fontWeight: 700, color: "var(--text-primary)" }}>
                  {r.title}
                </td>
                <td style={{ padding: "0.75rem 1rem", color: "var(--text-muted)" }}>
                  {r.rule}
                </td>
                <td style={{ padding: "0.75rem 1rem", textAlign: "center", fontWeight: 800, color: "var(--gold-700)" }}>
                  {r.count}
                </td>
                <td style={{ padding: "0.75rem 1rem", textAlign: "right", color: "var(--text-muted)" }} className="no-print">
                  ₱{r.rate.toLocaleString()}
                </td>
                <td style={{ padding: "0.75rem 1rem", textAlign: "right", fontWeight: 600 }}>
                  ₱{(r.count * r.rate).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Notes & Protocol Box */}
        <div style={{ background: "var(--surface-sunken)", padding: "1rem", borderRadius: "8px", border: "1px solid var(--border-subtle)", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
          <strong>Service Protocol:</strong>
          <ul style={{ margin: "0.4rem 0 0 1.2rem", padding: 0 }}>
            <li>Ingress & Setup: Exactly 3 hours before serving time. Egress clearing: 1 hour post-service.</li>
            <li>Uniform: Full formal black polo/barong, black slacks, leather shoes, service apron, and face mask.</li>
            <li>Staff are required to double-check Ingress/Egress equipment checklists with client before and after service.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
