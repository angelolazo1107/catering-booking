import React, { useState, useMemo } from "react";
import { calculateKitchenGroceryBOM } from "../data/recipeFormulas";
import { 
  ShoppingCart, 
  Printer, 
  DollarSign, 
  Utensils, 
  Users, 
  CheckSquare, 
  Percent, 
  TrendingUp, 
  Sparkles,
  Calendar
} from "lucide-react";

export default function KitchenGroceryEstimator({ bookings = [] }) {
  // Select either an existing booking or manual simulation
  const [selectedBookingId, setSelectedBookingId] = useState(bookings[0]?.id || "manual");
  const [manualPax, setManualPax] = useState(100);

  const activeBooking = bookings.find(b => b.id === selectedBookingId);

  // Compute dishes and pax
  const dishesToEstimate = useMemo(() => {
    if (activeBooking && activeBooking.dishes && activeBooking.dishes.length > 0) {
      return activeBooking.dishes;
    }
    // Default sample banquet menu
    return [
      "Special Beef Caldereta with Queso",
      "Crispy Roasted Lechon Belly Roll",
      "Authentic Bacolod Chicken Inasal",
      "Pan-Seared Fish Fillet in Garlic Lemon Butter",
      "Special Pancit Sotanghon Guisado",
      "Steamed Pandan Jasmine Rice",
      "Authentic Buko Pandan Cream Salad",
      "Bottomless Signature Red Iced Tea"
    ];
  }, [activeBooking]);

  const currentPax = activeBooking ? (activeBooking.pax || 100) : manualPax;
  const contractedPrice = activeBooking ? (activeBooking.grandTotal || 0) : currentPax * 850;

  // Run BOM calculation
  const bomResult = useMemo(() => {
    return calculateKitchenGroceryBOM(dishesToEstimate, currentPax);
  }, [dishesToEstimate, currentPax]);

  const grossProfit = contractedPrice > 0 ? contractedPrice - bomResult.totalRawFoodCost : 0;
  const foodCostRatio = contractedPrice > 0 ? Math.round((bomResult.totalRawFoodCost / contractedPrice) * 100) : 0;
  const profitMarginPercent = 100 - foodCostRatio;

  const handlePrint = () => {
    window.print();
  };

  // Group grocery items by category
  const categories = ["Meat", "Poultry", "Seafood", "Dry Goods", "Produce", "Dairy & Oils", "Beverage"];
  const groupedItems = categories.map(cat => ({
    name: cat,
    items: bomResult.items.filter(i => i.category === cat)
  })).filter(g => g.items.length > 0);

  return (
    <div style={{ maxWidth: "1150px", margin: "0 auto" }}>
      {/* Control Banner (Hidden in Print) */}
      <div className="card-section no-print" style={{ padding: "1.25rem 1.5rem", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <span className="pkg-badge" style={{ position: "static", marginBottom: "0.4rem", display: "inline-block" }}>
              CaterFlow Kitchen Automation
            </span>
            <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--text-primary)" }}>
              Kitchen Grocery & Bill of Materials (BOM) Estimator
            </h2>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "2px" }}>
              Converts booked viands into exact market kilograms, rice sacks, and estimated food procurement costs.
            </p>
          </div>

          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-secondary)" }}>Select Event:</label>
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
                <option value="manual">Custom Simulation (Manual)</option>
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
                  style={{ width: "90px", fontSize: "0.85rem" }}
                  value={manualPax}
                  onChange={(e) => setManualPax(Math.max(10, Number(e.target.value)))}
                />
              </div>
            )}

            <button className="btn-primary" onClick={handlePrint} style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <Printer size={16} />
              <span>Print Chef Shopping List</span>
            </button>
          </div>
        </div>
      </div>

      {/* Financial KPIs Banner */}
      <div className="no-print" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
        <div className="card-section" style={{ marginBottom: 0, padding: "1.2rem" }}>
          <div style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: 700 }}>Total Booked Pax</div>
          <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--text-primary)", marginTop: "0.3rem" }}>
            {currentPax} <span style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>Guests</span>
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{dishesToEstimate.length} active course viands</div>
        </div>

        <div className="card-section" style={{ marginBottom: 0, padding: "1.2rem" }}>
          <div style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--gold-600)", fontWeight: 700 }}>Estimated Raw Food Cost</div>
          <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--gold-600)", marginTop: "0.3rem" }}>
            ₱{bomResult.totalRawFoodCost.toLocaleString()}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Wet market & dry goods budget</div>
        </div>

        <div className="card-section" style={{ marginBottom: 0, padding: "1.2rem" }}>
          <div style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: 700 }}>Contracted Event Revenue</div>
          <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--text-primary)", marginTop: "0.3rem" }}>
            ₱{contractedPrice.toLocaleString()}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Client contract grand total</div>
        </div>

        <div className="card-section" style={{ marginBottom: 0, padding: "1.2rem" }}>
          <div style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--emerald-600)", fontWeight: 700 }}>Gross Food Margin</div>
          <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--emerald-600)", marginTop: "0.3rem" }}>
            {profitMarginPercent}%
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--emerald-700)", fontWeight: 600 }}>
            +₱{grossProfit.toLocaleString()} profit before labor
          </div>
        </div>
      </div>

      {/* Printable Chef Market Preparation Sheet */}
      <div className="card-section print-clean-wrapper" style={{ padding: "2rem" }}>
        {/* Print Header */}
        <div style={{ borderBottom: "2px solid var(--gold-500)", paddingBottom: "1.25rem", marginBottom: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1px", color: "var(--gold-600)", fontWeight: 800 }}>
              CaterFlow PH • Kitchen Bill of Materials
            </div>
            <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text-primary)", margin: "0.25rem 0" }}>
              Market Procurement & Kitchen Prep Sheet
            </h1>
            <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
              Event: <strong>{activeBooking ? activeBooking.clientName : "Custom Banquet"}</strong> • Reference: <strong>{activeBooking ? activeBooking.id : "MANUAL-BOM"}</strong>
            </div>
          </div>

          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-primary)" }}>
              {activeBooking ? (activeBooking.eventDate || "Upcoming") : new Date().toLocaleDateString()}
            </div>
            <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--gold-600)" }}>
              {currentPax} PAX GUARANTEED
            </div>
          </div>
        </div>

        {/* Selected Dishes Summary Box */}
        <div style={{ background: "var(--surface-sunken)", padding: "1rem", borderRadius: "8px", marginBottom: "1.5rem", border: "1px solid var(--border-subtle)" }}>
          <div style={{ fontSize: "0.75rem", textTransform: "uppercase", fontWeight: 700, color: "var(--text-muted)", marginBottom: "0.5rem" }}>
            Menu Viands to Prepare for this Event:
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {dishesToEstimate.map((d, idx) => (
              <span key={idx} style={{ background: "#ffffff", border: "1px solid var(--border-subtle)", padding: "4px 10px", borderRadius: "14px", fontSize: "0.8rem", fontWeight: 600, color: "var(--text-primary)" }}>
                {d}
              </span>
            ))}
          </div>
        </div>

        {/* Grocery Breakdown by Category */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {groupedItems.map(group => (
            <div key={group.name} style={{ border: "1px solid var(--border-subtle)", borderRadius: "8px", overflow: "hidden" }}>
              <div style={{ background: "var(--surface-sunken)", padding: "0.6rem 1rem", borderBottom: "1px solid var(--border-subtle)", fontWeight: 700, fontSize: "0.85rem", color: "var(--text-primary)", display: "flex", justifyContent: "space-between" }}>
                <span>{group.name} Section</span>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{group.items.length} items</span>
              </div>

              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.85rem" }}>
                <thead>
                  <tr style={{ background: "#f8fafc", borderBottom: "1px solid var(--border-subtle)", color: "var(--text-muted)", fontSize: "0.75rem", textTransform: "uppercase" }}>
                    <th style={{ padding: "0.6rem 1rem", width: "40px" }}>Check</th>
                    <th style={{ padding: "0.6rem 1rem" }}>Ingredient Description</th>
                    <th style={{ padding: "0.6rem 1rem", textAlign: "right" }}>Total Required</th>
                    <th style={{ padding: "0.6rem 1rem", textAlign: "right" }} className="no-print">Est. Price/Unit</th>
                    <th style={{ padding: "0.6rem 1rem", textAlign: "right" }}>Est. Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {group.items.map(item => (
                    <tr key={item.key} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                      <td style={{ padding: "0.6rem 1rem", textAlign: "center" }}>
                        <div style={{ width: "16px", height: "16px", border: "1px solid #94a3b8", borderRadius: "3px", display: "inline-block" }} />
                      </td>
                      <td style={{ padding: "0.6rem 1rem", fontWeight: 600, color: "var(--text-primary)" }}>
                        {item.name}
                      </td>
                      <td style={{ padding: "0.6rem 1rem", textAlign: "right", fontWeight: 700, color: "var(--gold-700)" }}>
                        {item.quantity} {item.unit}
                      </td>
                      <td style={{ padding: "0.6rem 1rem", textAlign: "right", color: "var(--text-muted)" }} className="no-print">
                        ₱{item.pricePerUnit}
                      </td>
                      <td style={{ padding: "0.6rem 1rem", textAlign: "right", fontWeight: 600, color: "var(--text-primary)" }}>
                        ₱{item.estimatedCost.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>

        {/* Total Cost Footnote */}
        <div style={{ marginTop: "1.75rem", borderTop: "2px solid var(--border-subtle)", paddingTop: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
            Purchased By: __________________________ • Received by Chef: __________________________
          </div>
          <div style={{ textAlign: "right" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginRight: "0.5rem" }}>Total Estimated Grocery Budget:</span>
            <span style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--gold-600)" }}>
              ₱{bomResult.totalRawFoodCost.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
