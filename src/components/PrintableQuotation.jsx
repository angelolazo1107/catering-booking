import React, { useState, useEffect } from "react";
import { CATERER_INFO } from "../data/cateringData";
import { getStoredCompanies, getActiveCompany, DEFAULT_TERMS_AND_CONDITIONS, DEFAULT_PACKAGE_INCLUSIONS } from "../data/tenantSchema";
import { Printer, ArrowLeft, CheckCircle2, Copy, Check, Share2, ClipboardCheck, CreditCard, Landmark, MapPin } from "lucide-react";
import confetti from "canvas-confetti";
import { formatBookingReference } from "../utils/bookingUtils";

export default function PrintableQuotation({ quotation, catererInfo, onBack, onConfirmBooking, onOpenIngress, isAdmin = false }) {
  const [copied, setCopied] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(quotation?.status || "Draft");

  useEffect(() => {
    if (quotation?.status) {
      setCurrentStatus(quotation.status);
    }
  }, [quotation?.status]);

  if (!quotation) return null;

  // Resolve which company this quotation belongs to
  const activeCaterer = catererInfo || 
    (quotation.companyId && getStoredCompanies().find(c => c.id === quotation.companyId)) || 
    getActiveCompany() || 
    CATERER_INFO;

  const businessName = activeCaterer.name || activeCaterer.businessName || "Catering & Events PH";
  const bankDetails = activeCaterer.bankDetails || CATERER_INFO.bankDetails;
  const boundBankName = bankDetails.bankName || "Philippine National Bank (PNB)";
  const boundAccountNumber = bankDetails.accountNumber || bankDetails.bdo?.accountNumber || "1234-5678-9012";
  const boundAccountName = bankDetails.accountName || bankDetails.bdo?.accountName || businessName;

  // Resolve active Terms & Conditions and Package Inclusions from company settings or fallbacks
  const activeTerms = (Array.isArray(activeCaterer.termsAndConditions) && activeCaterer.termsAndConditions.length > 0 && !activeCaterer.termsAndConditions[0]?.includes("50% reservation downpayment"))
    ? activeCaterer.termsAndConditions
    : DEFAULT_TERMS_AND_CONDITIONS;

  const activeInclusions = (Array.isArray(activeCaterer.packageInclusions) && activeCaterer.packageInclusions.length > 0)
    ? activeCaterer.packageInclusions
    : DEFAULT_PACKAGE_INCLUSIONS;

  const renderFormattedClause = (text) => {
    if (!text) return null;
    const lines = text.split("\n");
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
        {lines.map((line, lIdx) => {
          const trimmed = line.trim();
          const isSub = trimmed.startsWith("*") || trimmed.startsWith("-");
          const content = isSub ? trimmed.replace(/^[*–-]\s*/, "") : line;
          
          const parts = content.split(/(\*\*[^*]+\*\*)/g);
          const renderedParts = parts.map((part, pIdx) => {
            if (part.startsWith("**") && part.endsWith("**")) {
              return <strong key={pIdx} style={{ color: "#0f172a" }}>{part.slice(2, -2)}</strong>;
            }
            return part;
          });

          return (
            <div 
              key={lIdx} 
              style={{ 
                paddingLeft: isSub ? "1.5rem" : "0", 
                fontWeight: isSub ? 700 : "normal",
                color: isSub ? "#0f172a" : "inherit"
              }}
            >
              {isSub ? "• " : ""}{renderedParts}
            </div>
          );
        })}
      </div>
    );
  };

  const validUntilDate = new Date(new Date(quotation.createdAt || Date.now()).getTime() + 14 * 86400000)
    .toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" });

  const dateIssued = new Date(quotation.createdAt || Date.now())
    .toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" });

  const eventDateFormatted = quotation.eventDate 
    ? new Date(quotation.eventDate).toLocaleDateString("en-PH", { weekday: 'long', year: "numeric", month: "long", day: "numeric" })
    : "TBA";

  // Ensure non-VAT quotation display (if a quotation previously had VAT embedded, normalize clean non-VAT pricing)
  const isVatQuotation = Boolean(quotation.isVatEnabled && quotation.vatAmount > 0);
  const cleanGrandTotal = isVatQuotation 
    ? (quotation.grandTotal - quotation.vatAmount) 
    : (quotation.grandTotal || 0);

  const isConfirmedOrOngoing = currentStatus === "Confirmed" || currentStatus === "Ongoing" || currentStatus === "Completed";
  const activeBookingReference = quotation.bookingReference || 
    (isConfirmedOrOngoing ? formatBookingReference(quotation.eventDate, quotation.eventTime, quotation.clientName) : null);

  // Helper to categorize menu inclusions for the selected package
  const categorizedMenu = (() => {
    let mainDishes = [];
    if (Array.isArray(quotation.selectedMainDishes) && quotation.selectedMainDishes.length > 0) {
      mainDishes = quotation.selectedMainDishes;
    } else if (quotation.courses) {
      ['beef', 'pork', 'chicken', 'fish'].forEach(k => {
        if (quotation.courses[k]) mainDishes.push(quotation.courses[k]);
      });
    }

    let regularSides = [];
    if (Array.isArray(quotation.selectedSides) && quotation.selectedSides.length > 0) {
      regularSides = quotation.selectedSides;
    } else if (quotation.sideDishes?.regular) {
      regularSides.push(quotation.sideDishes.regular);
      if (quotation.sideDishes.regular2) regularSides.push(quotation.sideDishes.regular2);
    }

    const specialSide = (quotation.selectedSpecialSide && quotation.selectedSpecialSide.trim()) ? quotation.selectedSpecialSide.trim() : null;

    const isRiceWaived = quotation.swapDeal === 'extra_main' || quotation.swapDeal === 'extra_side' || quotation.riceOrSoup?.includes("Waived") || quotation.otherDishes?.rice?.includes("Waived");
    const isDrinkWaived = quotation.swapDeal === 'extra_main' || quotation.swapDeal === 'extra_side' || quotation.beverage?.includes("Waived") || quotation.otherDishes?.drinks?.includes("Waived");
    const isDessertWaived = quotation.swapDeal === 'extra_main' || quotation.desserts?.regular?.includes("Waived") || quotation.otherDishes?.dessert?.includes("Waived");

    let regularDesserts = [];
    if (!isDessertWaived) {
      if (Array.isArray(quotation.selectedDessertsList) && quotation.selectedDessertsList.length > 0) {
        regularDesserts = quotation.selectedDessertsList;
      } else if (quotation.desserts?.regular && !quotation.desserts.regular.includes("Waived")) {
        regularDesserts.push(quotation.desserts.regular);
        if (quotation.desserts.regular2) regularDesserts.push(quotation.desserts.regular2);
      } else if (quotation.otherDishes?.dessert && !quotation.otherDishes.dessert.includes("Waived")) {
        regularDesserts = quotation.otherDishes.dessert.split(',').map(s => s.trim()).filter(Boolean);
      }
    }

    const specialDessert = isDessertWaived 
      ? null 
      : ((quotation.selectedSpecialDessert && quotation.selectedSpecialDessert.trim()) ? quotation.selectedSpecialDessert.trim() : null);
    const riceOrSoup = isRiceWaived ? null : (quotation.riceOrSoup || quotation.otherDishes?.rice || null);
    const beverage = isDrinkWaived ? null : (quotation.beverage || quotation.otherDishes?.drinks || null);

    // Fallback if dishes array was saved flat
    if (mainDishes.length === 0 && Array.isArray(quotation.dishes) && quotation.dishes.length > 0) {
      mainDishes = quotation.dishes;
    }

    return {
      mainDishes,
      regularSides,
      specialSide,
      regularDesserts,
      specialDessert,
      riceOrSoup,
      beverage,
      isRiceWaived,
      isDrinkWaived,
      isDessertWaived
    };
  })();

  const handlePrint = () => {
    window.print();
  };

  const handleCopySummary = () => {
    const swapNote = quotation.swapDeal && quotation.swapDeal !== "none"
      ? `Swap Deal: ${quotation.swapDealLabel || (quotation.swapDeal === 'extra_main' ? 'Waive Rice, Drinks & Dessert ➔ +1 Main Dish' : 'Waive Rice & Softdrinks ➔ +1 Side Dish')}\n`
      : "";

    const summary = isConfirmedOrOngoing ? 
`*CATERING EVENT BOOKING CONTRACT - ${businessName}*
*Booking Reference: ${activeBookingReference}*
Original Quote Ref: ${quotation.id}
Client: ${quotation.clientName}
Event: ${quotation.eventTypeName} on ${eventDateFormatted} (${quotation.eventTime || 'TBA'})
Venue: ${quotation.venueName}, ${quotation.venueAddress}
Guaranteed Pax: ${quotation.pax} Pax
Package: ${quotation.packageName} (₱${quotation.pricePerPax}/pax)
${swapNote}Add-ons: ${quotation.selectedAddons?.map(a => `${a.name} (x${a.qty})`).join(', ') || 'None'}
*Balance Grand Total: ₱${cleanGrandTotal?.toLocaleString()} PHP*
Accepted Payment Channels:
- GCash: ${bankDetails.gcash?.number || activeCaterer.phone || "N/A"} (${bankDetails.gcash?.name || businessName})
- Bank Transfer (${boundBankName}): Acct #${boundAccountNumber} (${boundAccountName})
- Card Payment (POS Terminal): Accepted at physical store located at ${activeCaterer.address}` :
`*CATERING QUOTATION SUMMARY - ${businessName}*
Quote Ref: ${quotation.id}
Client: ${quotation.clientName}
Event: ${quotation.eventTypeName} on ${eventDateFormatted} (${quotation.eventTime || 'TBA'})
Venue: ${quotation.venueName}, ${quotation.venueAddress}
Guaranteed Pax: ${quotation.pax} Pax
Package: ${quotation.packageName} (₱${quotation.pricePerPax}/pax)
${swapNote}Add-ons: ${quotation.selectedAddons?.map(a => `${a.name} (x${a.qty})`).join(', ') || 'None'}
*Balance Grand Total: ₱${cleanGrandTotal?.toLocaleString()} PHP*
Accepted Payment Channels:
- GCash: ${bankDetails.gcash?.number || activeCaterer.phone || "N/A"} (${bankDetails.gcash?.name || businessName})
- Bank Transfer (${boundBankName}): Acct #${boundAccountNumber} (${boundAccountName})
- Card Payment (POS Terminal): Accepted at physical store located at ${activeCaterer.address}`;

    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleStatusChange = async (nextStatus) => {
    const newBookingRef = (nextStatus === "Confirmed" || nextStatus === "Ongoing") 
      ? formatBookingReference(quotation.eventDate, quotation.eventTime, quotation.clientName) 
      : null;

    if (onConfirmBooking) {
      const res = await onConfirmBooking(quotation.id, nextStatus, newBookingRef);
      if (res !== false) {
        setCurrentStatus(nextStatus);
        if (nextStatus === "Confirmed" || nextStatus === "Ongoing") {
          confetti({
            particleCount: 80,
            spread: 80,
            origin: { y: 0.6 }
          });
        }
      }
    }
  };

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
      {/* Action Toolbar (Hidden in Print) */}
      <div className="quote-toolbar no-print">
        <button className="btn-secondary" onClick={onBack}>
          <ArrowLeft size={16} />
          <span>Back to Calculator</span>
        </button>

        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
          <button className="btn-secondary" onClick={handleCopySummary}>
            {copied ? <Check size={16} color="var(--emerald-400)" /> : <Copy size={16} />}
            <span>{copied ? "Summary Copied!" : "Copy Viber/SMS Summary"}</span>
          </button>

          {isAdmin && onConfirmBooking && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              {currentStatus === "Completed" ? (
                <span 
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px",
                    padding: "0.4rem 0.85rem",
                    fontSize: "0.82rem",
                    fontWeight: 800,
                    color: "#7e22ce",
                    background: "#faf5ff",
                    border: "1px solid #d8b4fe",
                    borderRadius: "6px"
                  }}
                  title="This event is marked as Completed and is locked from status changes"
                >
                  🔒 Completed (Locked)
                </span>
              ) : (
                <>
                  <select
                    className="form-select"
                    style={{
                      padding: "0.4rem 0.65rem",
                      fontSize: "0.82rem",
                      fontWeight: 700,
                      width: "auto",
                      color: currentStatus === "Ongoing" ? "#b45309" : currentStatus === "Confirmed" ? "#047857" : currentStatus === "Cancelled" ? "#b91c1c" : "inherit",
                      background: currentStatus === "Ongoing" ? "#fffbeb" : currentStatus === "Confirmed" ? "#ecfdf5" : currentStatus === "Cancelled" ? "#fef2f2" : "#ffffff",
                      borderColor: currentStatus === "Ongoing" ? "#fde68a" : currentStatus === "Confirmed" ? "#a7f3d0" : "var(--border-subtle)"
                    }}
                    value={currentStatus}
                    onChange={(e) => handleStatusChange(e.target.value)}
                  >
                    <option value="Draft">Draft</option>
                    <option value="Sent">Sent to Client</option>
                    <option value="Confirmed">Confirmed Booking</option>
                    <option value="Ongoing">Ongoing Event</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>

                  {/* Quick Action Button based on workflow stage */}
                  {(currentStatus === "Draft" || currentStatus === "Sent" || currentStatus === "Pending") && (
                    <button 
                      className="btn-secondary" 
                      onClick={() => handleStatusChange("Confirmed")}
                      style={{ borderColor: "rgba(16, 185, 129, 0.4)", color: "#047857", fontWeight: 700 }}
                      title="Approve and mark booking as confirmed"
                    >
                      <CheckCircle2 size={16} />
                      <span>Mark as Confirmed</span>
                    </button>
                  )}

                  {currentStatus === "Confirmed" && (
                    <button 
                      className="btn-secondary" 
                      onClick={() => handleStatusChange("Ongoing")}
                      style={{ borderColor: "rgba(245, 158, 11, 0.4)", color: "#b45309", fontWeight: 700 }}
                      title="Set event status as ongoing preparation or active service"
                    >
                      <span>▶ Set as Ongoing</span>
                    </button>
                  )}

                  {currentStatus === "Ongoing" && (
                    <button 
                      className="btn-secondary" 
                      onClick={() => handleStatusChange("Completed")}
                      style={{ borderColor: "rgba(126, 34, 206, 0.4)", color: "#7e22ce", fontWeight: 700 }}
                      title="Mark event banquet as successfully completed"
                    >
                      <CheckCircle2 size={16} />
                      <span>✓ Mark as Completed</span>
                    </button>
                  )}
                </>
              )}
            </div>
          )}

          {isAdmin && onOpenIngress && (
            <button 
              className="btn-secondary" 
              onClick={() => onOpenIngress(quotation)}
              style={{ color: "#2563eb", borderColor: "#bfdbfe", fontWeight: 700 }}
              title="Open Ingress & Egress Equipment Checklist"
            >
              <ClipboardCheck size={16} />
              <span>Ingress / Egress Form</span>
            </button>
          )}

          <button className="btn-primary" onClick={handlePrint}>
            <Printer size={16} />
            <span>Print or Save PDF</span>
          </button>
        </div>
      </div>

      {/* Formal Paper View (Printed Document) */}
      <div className="quotation-paper-container">
        {/* Header Letterhead */}
        <div className="quote-header-brand">
          <div className="caterer-letterhead">
            <h2>{businessName}</h2>
            <p style={{ fontWeight: 600, color: "#92400e", marginBottom: "4px" }}>{activeCaterer.tagline}</p>
            <p>{activeCaterer.address}</p>
            <p>TIN: {activeCaterer.tin} | Tel / Mobile: {activeCaterer.phone}</p>
            <p>Email: {activeCaterer.email} | Web: {activeCaterer.website || "www.caterflow.ph"}</p>
          </div>

          <div className="quote-meta-box">
            <div className="doc-type">
              {isConfirmedOrOngoing ? "CONFIRMED EVENT CONTRACT" : "OFFICIAL QUOTATION"}
            </div>
            
            {activeBookingReference ? (
              <div>
                <div style={{ fontSize: "0.72rem", color: "#64748b", textTransform: "uppercase", fontWeight: 700, marginTop: "4px" }}>
                  BOOKING REFERENCE:
                </div>
                <div className="quote-num" style={{ fontSize: "1.05rem", color: "#047857", wordBreak: "break-all" }}>
                  {activeBookingReference}
                </div>
                <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "2px" }}>
                  Quote Ref: <strong>{quotation.id}</strong>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: "0.72rem", color: "#64748b", textTransform: "uppercase", fontWeight: 700, marginTop: "4px" }}>
                  QUOTE REFERENCE:
                </div>
                <div className="quote-num">{quotation.id}</div>
              </div>
            )}

            <p style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "4px" }}>Date Issued: <strong>{dateIssued}</strong></p>
            <p style={{ fontSize: "0.8rem", color: "#64748b" }}>Valid Until: <strong>{validUntilDate}</strong></p>
            <div style={{ marginTop: "6px" }}>
              <span className={`status-pill ${currentStatus}`}>
                Status: {currentStatus === 'Confirmed' ? 'Confirmed Booking' : currentStatus === 'Ongoing' ? 'Ongoing Event' : currentStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Client & Event Info Block */}
        <div className="quote-info-grid">
          <div className="quote-info-col">
            <h4>Client Information</h4>
            <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#0f172a" }}>{quotation.clientName}</div>
            <div style={{ fontSize: "0.82rem", color: "#475569", marginTop: "2px" }}>Contact: {quotation.contactNumber}</div>
            <div style={{ fontSize: "0.82rem", color: "#475569" }}>Email: {quotation.email || "N/A"}</div>
          </div>

          <div className="quote-info-col">
            <h4>Event & Venue Specifications</h4>
            <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#0f172a" }}>
              {quotation.eventTypeName} ({quotation.pax} Guaranteed Pax)
            </div>
            <div style={{ fontSize: "0.82rem", color: "#475569", marginTop: "2px" }}>
              Date & Serving Time: <strong>{eventDateFormatted}</strong> at <strong>{quotation.eventTime || "TBA"}</strong>
            </div>
            <div style={{ fontSize: "0.82rem", color: "#475569" }}>
              Venue: {quotation.venueName} - {quotation.venueAddress}
            </div>
          </div>
        </div>

        {/* Catering Package & Food Breakdown */}
        <table className="quote-table">
          <thead>
            <tr>
              <th style={{ width: "55%" }}>Description & Inclusions</th>
              <th style={{ width: "15%", textAlign: "center" }}>Pax / Qty</th>
              <th className="text-right" style={{ width: "15%" }}>Unit Rate</th>
              <th className="text-right" style={{ width: "15%" }}>Amount (PHP)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "#0f172a", marginBottom: "4px" }}>
                  {quotation.packageName}
                </div>

                {quotation.swapDeal && quotation.swapDeal !== "none" && (
                  <div style={{ fontSize: "0.78rem", color: "#b45309", fontWeight: 600, marginBottom: "6px" }}>
                    Swap Deal: {quotation.swapDealLabel || (quotation.swapDeal === 'extra_main' ? 'Waive Rice, Drinks & Dessert ➔ +1 Main Dish' : 'Waive Rice & Softdrinks ➔ +1 Side Dish')}
                  </div>
                )}

                {/* Categorized Package Menu (Plain Text & Simplified) */}
                <div style={{ display: "flex", flexDirection: "column", gap: "5px", marginTop: "6px", fontSize: "0.82rem", color: "#334155", lineHeight: 1.5 }}>
                  {/* Category 1: Main Dishes */}
                  {categorizedMenu.mainDishes.length > 0 && (
                    <div>
                      <strong style={{ color: "#0f172a" }}>Main Dishes:</strong>{" "}
                      <span>
                        {categorizedMenu.mainDishes.map((dish, i) => {
                          const isSpecial = quotation.selectedSpecialDishes?.some(s => s.name?.includes(dish));
                          return (
                            <span key={i}>
                              {dish}{isSpecial ? " (Special)" : ""}{i < categorizedMenu.mainDishes.length - 1 ? ", " : ""}
                            </span>
                          );
                        })}
                      </span>
                    </div>
                  )}

                  {/* Category 2: Side Dishes */}
                  {(categorizedMenu.regularSides.length > 0 || categorizedMenu.specialSide) && (
                    <div>
                      <strong style={{ color: "#0f172a" }}>Side Dishes:</strong>{" "}
                      <span>
                        {[
                          ...categorizedMenu.regularSides,
                          categorizedMenu.specialSide 
                            ? `${categorizedMenu.specialSide} (${quotation.courseAllowances?.specSidesCount > 0 ? "Special Side - Included" : "Special Side Upgrade"})` 
                            : null
                        ].filter(Boolean).join(", ")}
                      </span>
                    </div>
                  )}

                  {/* Category 3: Desserts */}
                  {(categorizedMenu.regularDesserts.length > 0 || categorizedMenu.specialDessert || categorizedMenu.isDessertWaived) && (
                    <div>
                      <strong style={{ color: "#0f172a" }}>Dessert:</strong>{" "}
                      {categorizedMenu.isDessertWaived ? (
                        <span style={{ color: "#64748b", fontStyle: "italic" }}>Waived (Swapped for +1 Main Dish)</span>
                      ) : (
                        <span>
                          {[
                            ...categorizedMenu.regularDesserts,
                            categorizedMenu.specialDessert 
                              ? `${categorizedMenu.specialDessert} (${quotation.courseAllowances?.specDessertsCount > 0 ? "Special Dessert - Included" : "Special Dessert Upgrade"})` 
                              : null
                          ].filter(Boolean).join(", ")}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Category 4: Starch & Beverage */}
                  {(categorizedMenu.riceOrSoup || categorizedMenu.beverage || (categorizedMenu.isRiceWaived && categorizedMenu.isDrinkWaived)) && (
                    <div>
                      <strong style={{ color: "#0f172a" }}>Rice & Beverage:</strong>{" "}
                      {(categorizedMenu.isRiceWaived && categorizedMenu.isDrinkWaived) ? (
                        <span style={{ color: "#64748b", fontStyle: "italic" }}>Waived (Swapped)</span>
                      ) : (
                        <span>
                          {[
                            categorizedMenu.riceOrSoup,
                            categorizedMenu.beverage ? `${categorizedMenu.beverage} (Bottomless)` : null
                          ].filter(Boolean).join(", ")}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </td>
              <td style={{ textAlign: "center", verticalAlign: "top", paddingTop: "0.9rem" }}>
                <strong>{quotation.pax}</strong>
              </td>
              <td className="text-right" style={{ verticalAlign: "top", paddingTop: "0.9rem" }}>
                ₱{quotation.pricePerPax?.toLocaleString()}
              </td>
              <td className="text-right" style={{ verticalAlign: "top", paddingTop: "0.9rem", fontWeight: 700 }}>
                ₱{quotation.foodTotal?.toLocaleString()}
              </td>
            </tr>

            {/* Special Dishes Upgrade */}
            {quotation.selectedSpecialDishes && quotation.selectedSpecialDishes.length > 0 ? (
              quotation.selectedSpecialDishes.map((sDish, idx) => (
                <tr key={`spec-dish-${idx}`}>
                  <td>
                    <div style={{ fontWeight: 600 }}>⭐ Special Dish Upgrade: {sDish.name}</div>
                    <div style={{ fontSize: "0.72rem", color: "#64748b" }}>
                      Chef's specialty tier upgrade (+₱{sDish.upgradePrice || 65}/pax)
                    </div>
                  </td>
                  <td style={{ textAlign: "center" }}>{quotation.pax} pax</td>
                  <td className="text-right">₱{(sDish.upgradePrice || 65).toLocaleString()}</td>
                  <td className="text-right" style={{ fontWeight: 600 }}>₱{((sDish.upgradePrice || 65) * quotation.pax).toLocaleString()}</td>
                </tr>
              ))
            ) : quotation.specialDishesUpgradeTotal > 0 ? (
              <tr>
                <td>
                  <div style={{ fontWeight: 600 }}>⭐ Special Dish Upgrade ({quotation.specialDishesCount || 1} dish)</div>
                  <div style={{ fontSize: "0.72rem", color: "#64748b" }}>
                    Chef's specialty tier upgrade
                  </div>
                </td>
                <td style={{ textAlign: "center" }}>{quotation.pax} pax</td>
                <td className="text-right">₱{(quotation.specialDishesUpgradeRate || 65).toLocaleString()}</td>
                <td className="text-right" style={{ fontWeight: 600 }}>₱{quotation.specialDishesUpgradeTotal?.toLocaleString()}</td>
              </tr>
            ) : null}

            {/* Selected Add-ons */}
            {quotation.selectedAddons?.map((addon) => (
              <tr key={addon.id}>
                <td>
                  <div style={{ fontWeight: 600 }}>Add-on: {addon.name}</div>
                  <div style={{ fontSize: "0.72rem", color: "#64748b" }}>{addon.description}</div>
                </td>
                <td style={{ textAlign: "center" }}>{addon.qty}</td>
                <td className="text-right">₱{addon.price?.toLocaleString()}</td>
                <td className="text-right">₱{addon.itemTotal?.toLocaleString()}</td>
              </tr>
            ))}

            {/* Delivery Logistics */}
            <tr>
              <td>
                <div style={{ fontWeight: 600 }}>Catering Logistics & Transportation Fee</div>
                <div style={{ fontSize: "0.72rem", color: "#64748b" }}>
                  Delivery, buffet transport, chafing equipment delivery & retrieval
                </div>
              </td>
              <td style={{ textAlign: "center" }}>1 Trip</td>
              <td className="text-right">₱{quotation.deliveryFee?.toLocaleString()}</td>
              <td className="text-right">₱{quotation.deliveryFee?.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>

        {/* Financial Totals */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1.5rem" }}>
          <div style={{ width: "340px", display: "flex", flexDirection: "column", gap: "0.4rem", fontSize: "0.85rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", color: "#475569" }}>
              <span>Subtotal:</span>
              <span style={{ fontFamily: "monospace", fontWeight: 600 }}>₱{quotation.subtotal?.toLocaleString()}</span>
            </div>

            {quotation.serviceCharge > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", color: "#475569" }}>
                <span>Service Charge ({quotation.serviceChargePercent}%):</span>
                <span style={{ fontFamily: "monospace" }}>₱{quotation.serviceCharge?.toLocaleString()}</span>
              </div>
            )}

            {quotation.discountAmount > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", color: "#16a34a" }}>
                <span>Discount / Special Promo:</span>
                <span style={{ fontFamily: "monospace" }}>-₱{quotation.discountAmount?.toLocaleString()}</span>
              </div>
            )}

            <div style={{ height: "1px", background: "#cbd5e1", margin: "4px 0" }} />

            <div style={{ display: "flex", justifyContent: "space-between", background: "#fef3c7", padding: "8px 12px", borderRadius: "8px", border: "1px solid #fde68a", fontSize: "1.15rem", fontWeight: 800, color: "#92400e", marginTop: "4px" }}>
              <span>BALANCE GRAND TOTAL:</span>
              <span style={{ fontFamily: "monospace" }}>₱{cleanGrandTotal?.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Official Recorded Payment Details & Settlement Record */}
        {(quotation.depositAmount > 0 || quotation.isFullyPaid) && (
          <div style={{ 
            background: quotation.isFullyPaid ? "#f0fdf4" : "#f0f9ff", 
            border: `1.5px solid ${quotation.isFullyPaid ? "#86efac" : "#bae6fd"}`, 
            borderRadius: "10px", 
            padding: "1rem 1.25rem", 
            marginBottom: "1.25rem" 
          }}>
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center", 
              marginBottom: "0.6rem", 
              borderBottom: `1px solid ${quotation.isFullyPaid ? "#bbf7d0" : "#e0f2fe"}`, 
              paddingBottom: "0.4rem" 
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ 
                  background: quotation.isFullyPaid ? "#047857" : "#0284c7", 
                  color: "#ffffff", 
                  padding: "2px 8px", 
                  borderRadius: "4px", 
                  fontSize: "0.72rem", 
                  fontWeight: 900 
                }}>
                  {quotation.isFullyPaid ? "OFFICIAL RECEIPT: FULLY PAID" : "OFFICIAL DEPOSIT ACKNOWLEDGEMENT"}
                </span>
                <strong style={{ color: "#0f172a", fontSize: "0.85rem" }}>
                  Payment & Settlement Record
                </strong>
              </div>
              <span style={{ fontSize: "0.75rem", fontWeight: 800, color: quotation.isFullyPaid ? "#047857" : "#0284c7" }}>
                {quotation.isFullyPaid ? "✓ 100% Contract Cleared" : "Reservation Confirmed"}
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.75rem", fontSize: "0.78rem" }}>
              {quotation.depositAmount > 0 && (
                <div style={{ background: "#ffffff", padding: "0.65rem 0.85rem", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                  <div style={{ color: "#64748b", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase" }}>Reservation Deposit Paid</div>
                  <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#047857", fontFamily: "monospace", margin: "2px 0" }}>
                    ₱{Number(quotation.depositAmount).toLocaleString()}
                  </div>
                  <div style={{ fontWeight: 700, color: "#1e293b" }}>
                    Method: {quotation.depositPaymentMethod || "Cash"}
                  </div>
                  {quotation.depositPaidAt && (
                    <div style={{ fontSize: "0.7rem", color: "#64748b" }}>
                      Date: {new Date(quotation.depositPaidAt).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" })}
                    </div>
                  )}
                  {quotation.depositReference && (
                    <div style={{ fontSize: "0.7rem", color: "#0284c7", fontFamily: "monospace", fontWeight: 700 }}>
                      Ref: {quotation.depositReference}
                    </div>
                  )}
                  {quotation.depositNotes && (
                    <div style={{ fontSize: "0.7rem", color: "#475569", fontStyle: "italic", marginTop: "3px", borderTop: "1px dashed #e2e8f0", paddingTop: "3px" }}>
                      Notes: "{quotation.depositNotes}"
                    </div>
                  )}
                </div>
              )}

              {quotation.isFullyPaid && (
                <div style={{ background: "#ffffff", padding: "0.65rem 0.85rem", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                  <div style={{ color: "#64748b", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase" }}>Full Payment Settlement</div>
                  <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#047857", fontFamily: "monospace", margin: "2px 0" }}>
                    ₱{Number(quotation.finalPaymentAmount || (cleanGrandTotal - (quotation.depositAmount || 0))).toLocaleString()}
                  </div>
                  <div style={{ fontWeight: 700, color: "#1e293b" }}>
                    Method: {quotation.finalPaymentMethod || "Cash"}
                  </div>
                  {quotation.finalPaymentPaidAt && (
                    <div style={{ fontSize: "0.7rem", color: "#64748b" }}>
                      Date: {new Date(quotation.finalPaymentPaidAt).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" })}
                    </div>
                  )}
                  {quotation.finalPaymentReference && (
                    <div style={{ fontSize: "0.7rem", color: "#047857", fontFamily: "monospace", fontWeight: 700 }}>
                      Ref: {quotation.finalPaymentReference}
                    </div>
                  )}
                  {quotation.finalPaymentNotes && (
                    <div style={{ fontSize: "0.7rem", color: "#475569", fontStyle: "italic", marginTop: "3px", borderTop: "1px dashed #e2e8f0", paddingTop: "3px" }}>
                      Notes: "{quotation.finalPaymentNotes}"
                    </div>
                  )}
                </div>
              )}

              <div style={{ background: "#ffffff", padding: "0.65rem 0.85rem", borderRadius: "8px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <div style={{ color: "#64748b", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase" }}>Outstanding Balance Due</div>
                <div style={{ fontSize: "1.2rem", fontWeight: 900, color: quotation.isFullyPaid ? "#047857" : "#b45309", fontFamily: "monospace", margin: "2px 0" }}>
                  ₱{(quotation.balanceDue !== undefined ? quotation.balanceDue : (quotation.isFullyPaid ? 0 : Math.max(0, cleanGrandTotal - (quotation.depositAmount || 0)))).toLocaleString()}
                </div>
                <div style={{ fontSize: "0.72rem", color: quotation.isFullyPaid ? "#047857" : "#b45309", fontWeight: 700 }}>
                  {quotation.isFullyPaid ? "✓ Zero Balance Remaining" : "Payable before / during catering ingress"}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment Methods & Terms */}
        <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "1.1rem 1.25rem", marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.85rem", borderBottom: "1px solid #e2e8f0", paddingBottom: "0.5rem" }}>
            <h4 style={{ fontSize: "0.82rem", textTransform: "uppercase", color: "#1e293b", margin: 0, fontWeight: 800, letterSpacing: "0.04em" }}>
              Accepted Payment Channels (Philippine Banking, e-Wallet & Store POS)
            </h4>
            <span style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 600 }}>
              Payment channels for event booking
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.95rem", fontSize: "0.76rem" }}>
            {/* 1. GCash Channel */}
            <div style={{ background: "#ffffff", border: "1px solid #bae6fd", borderRadius: "8px", padding: "0.8rem 0.95rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "5px" }}>
                <span style={{ background: "#0284c7", color: "#ffffff", padding: "1px 6px", borderRadius: "4px", fontSize: "0.68rem", fontWeight: 900 }}>
                  GCASH
                </span>
                <strong style={{ color: "#0369a1", fontSize: "0.8rem" }}>Instant e-Wallet Transfer</strong>
              </div>
              <div style={{ fontSize: "0.95rem", fontWeight: 800, fontFamily: "monospace", color: "#0c4a6e", marginTop: "4px" }}>
                {bankDetails.gcash?.number || activeCaterer.phone || "0917-000-0000"}
              </div>
              <div style={{ color: "#334155", fontWeight: 600, fontSize: "0.75rem", marginTop: "2px" }}>
                Account Name: {bankDetails.gcash?.name || businessName}
              </div>
              <div style={{ color: "#64748b", fontSize: "0.7rem", marginTop: "4px", fontStyle: "italic", lineHeight: 1.3 }}>
                Kindly take a screenshot of your transaction receipt and reference number.
              </div>
            </div>

            {/* 2. Official Bank Channel (PNB or bound bank) */}
            <div style={{ background: "#ffffff", border: "1px solid #fde68a", borderRadius: "8px", padding: "0.8rem 0.95rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "5px" }}>
                <span style={{ background: "#d97706", color: "#ffffff", padding: "1px 6px", borderRadius: "4px", fontSize: "0.68rem", fontWeight: 900 }}>
                  BANK
                </span>
                <strong style={{ color: "#92400e", fontSize: "0.8rem" }}>
                  {boundBankName}
                </strong>
              </div>
              <div style={{ fontSize: "0.95rem", fontWeight: 800, fontFamily: "monospace", color: "#78350f", marginTop: "4px" }}>
                {boundAccountNumber}
              </div>
              <div style={{ color: "#334155", fontWeight: 600, fontSize: "0.75rem", marginTop: "2px" }}>
                Account Name: {boundAccountName}
              </div>
              {bankDetails.branch && (
                <div style={{ color: "#64748b", fontSize: "0.7rem" }}>
                  Branch / Type: {bankDetails.branch}
                </div>
              )}
              <div style={{ color: "#64748b", fontSize: "0.7rem", marginTop: "4px", fontStyle: "italic", lineHeight: 1.3 }}>
                Online bank transfer (InstaPay / PESONet) or over-the-counter deposit.
              </div>
            </div>

            {/* 3. Physical Store Card Payment Channel */}
            <div style={{ background: "#ffffff", border: "1px solid #a7f3d0", borderRadius: "8px", padding: "0.8rem 0.95rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "5px" }}>
                <span style={{ background: "#059669", color: "#ffffff", padding: "1px 6px", borderRadius: "4px", fontSize: "0.68rem", fontWeight: 900 }}>
                  CARD POS
                </span>
                <strong style={{ color: "#065f46", fontSize: "0.8rem" }}>Credit & Debit Card Terminal</strong>
              </div>
              <div style={{ color: "#1e293b", fontWeight: 700, fontSize: "0.75rem", marginTop: "3px" }}>
                📍 Physical Store Location:
              </div>
              <div style={{ color: "#334155", fontSize: "0.73rem", fontWeight: 600, lineHeight: 1.35, marginTop: "1px" }}>
                {activeCaterer.address || "Metro Manila, Philippines"}
              </div>
              <div style={{ color: "#065f46", fontSize: "0.7rem", fontWeight: 700, marginTop: "4px" }}>
                ✓ Visa, Mastercard, BancNet, JCB (Swipe / Tap)
              </div>
              <div style={{ color: "#64748b", fontSize: "0.7rem", marginTop: "2px", fontStyle: "italic", lineHeight: 1.3 }}>
                {bankDetails.cardPaymentNotes || "Visit our physical store commissary during office hours to swipe your card."}
              </div>
            </div>
          </div>
        </div>

        {/* PAGE 2: Official Terms, Conditions & Package Inclusions */}
        <div className="quote-page-2">
          <div className="quote-page-divider no-print">
            <span className="quote-page-pill">
              📄 Official Contract Page 2 (Terms & Package Inclusions)
            </span>
          </div>

          <div className="quote-page-2-header">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderBottom: "2px solid #0f172a", paddingBottom: "6px", marginBottom: "1.25rem" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", color: "#0f172a" }}>
                  {businessName}
                </h3>
                <p style={{ margin: "2px 0 0 0", fontSize: "0.74rem", color: "#64748b" }}>
                  Official Catering Contract Agreement • Quote Ref: <strong>{quotation.id}</strong> {activeBookingReference ? `• Ref: ${activeBookingReference}` : ""}
                </p>
              </div>
              <div style={{ textAlign: "right", fontSize: "0.74rem", color: "#64748b" }}>
                Client: <strong>{quotation.clientName}</strong> • Event Date: <strong>{eventDateFormatted}</strong>
              </div>
            </div>
          </div>

          {/* Section 1: Terms and Conditions */}
          <div style={{ marginBottom: "1.6rem" }}>
            <h3 style={{ 
              fontSize: "1.15rem", 
              fontWeight: 800, 
              color: "#0f172a", 
              textDecoration: "underline", 
              textUnderlineOffset: "4px",
              marginBottom: "0.75rem",
              letterSpacing: "0.02em"
            }}>
              Terms and Conditions:
            </h3>
            <ul style={{ 
              listStyleType: "disc", 
              paddingLeft: "1.25rem", 
              margin: 0, 
              display: "flex", 
              flexDirection: "column", 
              gap: "0.6rem",
              fontSize: "0.82rem",
              lineHeight: 1.5,
              color: "#1e293b"
            }}>
              {activeTerms.map((term, i) => (
                <li key={`term-${i}`} style={{ paddingLeft: "4px" }}>
                  {renderFormattedClause(term)}
                </li>
              ))}
            </ul>
          </div>

          {/* Section 2: Package Inclusions */}
          <div style={{ marginBottom: "2rem" }}>
            <h3 style={{ 
              fontSize: "1.15rem", 
              fontWeight: 800, 
              color: "#0f172a", 
              textDecoration: "underline", 
              textUnderlineOffset: "4px",
              marginBottom: "0.75rem",
              letterSpacing: "0.02em"
            }}>
              Package Inclusions:
            </h3>
            <ul style={{ 
              listStyleType: "disc", 
              paddingLeft: "1.25rem", 
              margin: 0, 
              display: "flex", 
              flexDirection: "column", 
              gap: "0.6rem",
              fontSize: "0.82rem",
              lineHeight: 1.5,
              color: "#1e293b"
            }}>
              {activeInclusions.map((inclusion, i) => (
                <li key={`inc-${i}`} style={{ paddingLeft: "4px" }}>
                  {renderFormattedClause(inclusion)}
                </li>
              ))}
            </ul>
          </div>

          {/* Signatures Conforme Section */}
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "1fr 1fr", 
            gap: "2.5rem", 
            marginTop: "2.5rem", 
            paddingTop: "1rem" 
          }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ width: "85%", margin: "0 auto 0.4rem auto", borderBottom: "1.5px solid #0f172a" }} />
              <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#0f172a" }}>
                {quotation.clientName}
              </div>
              <div style={{ fontSize: "0.72rem", color: "#64748b", textTransform: "uppercase", fontWeight: 600 }}>
                Printed Name and Signature of Client
              </div>
            </div>

            <div style={{ textAlign: "center" }}>
              <div style={{ width: "85%", margin: "0 auto 0.4rem auto", borderBottom: "1.5px solid #0f172a" }} />
              <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#0f172a" }}>
                Authorized Banquet Representative
              </div>
              <div style={{ fontSize: "0.72rem", color: "#64748b", textTransform: "uppercase", fontWeight: 600 }}>
                {businessName}
              </div>
            </div>
          </div>

          {/* Page 2 Footer */}
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center", 
            marginTop: "2.5rem", 
            paddingTop: "0.75rem", 
            borderTop: "1px dashed #cbd5e1", 
            fontSize: "0.7rem", 
            color: "#94a3b8", 
            fontWeight: 600 
          }}>
            <span>Official Catering Contract Terms & Inclusions Conforme</span>
            <span style={{ fontWeight: 800, color: "#475569", letterSpacing: "0.05em" }}>PAGE 2</span>
          </div>
        </div>
      </div>
    </div>
  );
}
