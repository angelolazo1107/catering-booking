import React, { useState, useEffect } from "react";
import { 
  ClipboardCheck, 
  Printer, 
  Plus, 
  Trash2, 
  RotateCcw, 
  CheckCircle2, 
  Save, 
  Search, 
  AlertTriangle,
  ArrowLeft,
  Package,
  Layers,
  Sparkles,
  Check,
  FileSpreadsheet
} from "lucide-react";
import { 
  EQUIPMENT_CATEGORIES, 
  generateDefaultIngressInventory, 
  OFFICIAL_INGRESS_DISCLAIMER_NOTE 
} from "../data/inventoryEquipmentData";

export default function IngressEgressManager({
  bookings = [],
  activeCompany,
  selectedBooking = null,
  onSaveInventory,
  onBack
}) {
  const [selectedBookingId, setSelectedBookingId] = useState(
    selectedBooking?.id || (bookings.length > 0 ? bookings[0].id : "")
  );

  const currentBooking = bookings.find(b => b.id === selectedBookingId) || selectedBooking || bookings[0];

  const [items, setItems] = useState([]);
  const [ingressStaff, setIngressStaff] = useState("");
  const [egressStaff, setEgressStaff] = useState("");
  const [clientSignName, setClientSignName] = useState("");
  const [generalRemarks, setGeneralRemarks] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [filterSearch, setFilterSearch] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // New item draft modal/form
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newItem, setNewItem] = useState({
    description: "",
    qty: 1,
    unit: "PCS",
    category: "buffet",
    remarks: ""
  });

  // Load inventory items when selected booking changes
  useEffect(() => {
    if (!currentBooking) {
      setItems([]);
      return;
    }

    if (currentBooking.ingressEgressItems && Array.isArray(currentBooking.ingressEgressItems) && currentBooking.ingressEgressItems.length > 0) {
      setItems(currentBooking.ingressEgressItems);
    } else {
      // Auto-generate default equipment inventory based on booking details & package
      const defaults = generateDefaultIngressInventory(currentBooking);
      setItems(defaults);
    }

    setIngressStaff(currentBooking.ingressStaffName || "");
    setEgressStaff(currentBooking.egressStaffName || "");
    setClientSignName(currentBooking.clientSignName || currentBooking.clientName || "");
    setGeneralRemarks(currentBooking.inventoryRemarks || "");
    setIsSaved(false);
  }, [currentBooking?.id]);

  if (!currentBooking && bookings.length === 0) {
    return (
      <div className="card-section" style={{ textAlign: "center", padding: "3rem 1.5rem" }}>
        <Package size={48} color="var(--gold-500)" style={{ margin: "0 auto 1rem" }} />
        <h3>No Event Bookings Found</h3>
        <p style={{ color: "var(--text-muted)", maxWidth: "450px", margin: "0.5rem auto 1.5rem" }}>
          You can create a quotation or record a direct event booking first to manage its equipment and ingress/egress inventory.
        </p>
        {onBack && (
          <button className="btn-secondary" onClick={onBack}>
            <ArrowLeft size={16} />
            <span>Back to Dashboard</span>
          </button>
        )}
      </div>
    );
  }

  // Calculate completion metrics
  const totalItemsCount = items.length;
  const ingressCheckedCount = items.filter(i => i.ingressChecked).length;
  const egressCheckedCount = items.filter(i => i.egressChecked).length;
  const ingressPercent = totalItemsCount ? Math.round((ingressCheckedCount / totalItemsCount) * 100) : 0;
  const egressPercent = totalItemsCount ? Math.round((egressCheckedCount / totalItemsCount) * 100) : 0;

  // Toggle checklist status
  const handleToggleIngress = (id) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, ingressChecked: !item.ingressChecked } : item));
    setIsSaved(false);
  };

  const handleToggleEgress = (id) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, egressChecked: !item.egressChecked } : item));
    setIsSaved(false);
  };

  const handleUpdateItemField = (id, field, value) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
    setIsSaved(false);
  };

  const handleDeleteItem = (id) => {
    setItems(prev => prev.filter(item => item.id !== id));
    setIsSaved(false);
  };

  const handleMarkAllIngress = (checked) => {
    setItems(prev => prev.map(item => ({ ...item, ingressChecked: checked })));
    setIsSaved(false);
  };

  const handleMarkAllEgress = (checked) => {
    setItems(prev => prev.map(item => ({ ...item, egressChecked: checked })));
    setIsSaved(false);
  };

  const handleResetToPackageDefault = () => {
    if (window.confirm("Reset all equipment checklist items to package defaults? Current changes will be overwritten.")) {
      const defaults = generateDefaultIngressInventory(currentBooking);
      setItems(defaults);
      setIsSaved(false);
    }
  };

  const handleAddNewItem = (e) => {
    e.preventDefault();
    if (!newItem.description.trim()) return;

    const itemToAdd = {
      id: "custom_" + Date.now().toString(36),
      description: newItem.description.trim(),
      qty: Number(newItem.qty) || 1,
      unit: newItem.unit.toUpperCase(),
      category: newItem.category,
      remarks: newItem.remarks.trim(),
      ingressChecked: false,
      egressChecked: false
    };

    setItems(prev => [...prev, itemToAdd]);
    setNewItem({
      description: "",
      qty: 1,
      unit: "PCS",
      category: "buffet",
      remarks: ""
    });
    setIsAddingItem(false);
    setIsSaved(false);
  };

  const handleSave = async () => {
    if (!currentBooking) return;
    setIsSaving(true);
    try {
      const inventoryData = {
        items,
        ingressStaffName: ingressStaff,
        egressStaffName: egressStaff,
        clientSignName: clientSignName,
        remarks: generalRemarks
      };

      if (onSaveInventory) {
        await onSaveInventory(currentBooking.id, inventoryData);
      }
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err) {
      console.error("Save inventory failed:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Filter items
  const filteredItems = items.filter(item => {
    const matchesCat = activeCategory === "all" || item.category === activeCategory;
    const matchesQuery = !filterSearch || 
      item.description.toLowerCase().includes(filterSearch.toLowerCase()) ||
      (item.remarks && item.remarks.toLowerCase().includes(filterSearch.toLowerCase()));
    return matchesCat && matchesQuery;
  });

  const formattedDate = currentBooking?.eventDate 
    ? new Date(currentBooking.eventDate).toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" })
    : "TBA";

  return (
    <div className="ingress-egress-container" style={{ maxWidth: "1200px", margin: "0 auto" }}>
      {/* Action Bar (Hidden in Print) */}
      <div className="quote-toolbar no-print" style={{ marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.75rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
          {onBack && (
            <button className="btn-secondary" onClick={onBack}>
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>
          )}

          {/* Booking Selector Dropdown */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-secondary)" }}>Event Booking:</span>
            <select
              className="form-select"
              style={{ minWidth: "260px", padding: "0.4rem 0.75rem", fontSize: "0.82rem", fontWeight: 700 }}
              value={selectedBookingId}
              onChange={(e) => setSelectedBookingId(e.target.value)}
            >
              {bookings.map(b => (
                <option key={b.id} value={b.id}>
                  {b.id} — {b.clientName} ({b.eventDate || "Date TBA"}, {b.pax} Pax)
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <button 
            className="btn-secondary"
            onClick={handleResetToPackageDefault}
            title="Reset equipment to default package setup"
          >
            <RotateCcw size={15} />
            <span>Reset Defaults</span>
          </button>

          <button 
            className="btn-secondary" 
            onClick={() => setIsAddingItem(!isAddingItem)}
            style={{ color: "var(--gold-600)", borderColor: "var(--gold-300)" }}
          >
            <Plus size={15} />
            <span>Add Equipment</span>
          </button>

          <button 
            className="btn-secondary" 
            onClick={handleSave} 
            disabled={isSaving}
            style={{ color: isSaved ? "var(--emerald-600)" : "inherit" }}
          >
            {isSaved ? <Check size={16} color="var(--emerald-500)" /> : <Save size={16} />}
            <span>{isSaving ? "Saving..." : isSaved ? "Saved to Cloud!" : "Save Manifest"}</span>
          </button>

          <button className="btn-primary" onClick={handlePrint}>
            <Printer size={16} />
            <span>Print Official Form</span>
          </button>
        </div>
      </div>

      {/* Booking Overview Card (Screen Mode) */}
      <div className="card-section no-print" style={{ marginBottom: "1.25rem", padding: "1.25rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
              {currentBooking?.bookingReference ? "Booking Reference" : "Quote Reference"}
            </div>
            <div style={{ fontSize: "1.05rem", fontWeight: 800, color: currentBooking?.bookingReference ? "#047857" : "var(--gold-600)", fontFamily: "monospace", wordBreak: "break-all" }}>
              {currentBooking?.bookingReference || currentBooking?.id || "BA#122025001"}
            </div>
            {currentBooking?.bookingReference && (
              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontFamily: "monospace" }}>
                Quote: {currentBooking.id}
              </div>
            )}
            <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-primary)", marginTop: "2px" }}>
              {currentBooking?.clientName}
            </div>
          </div>

          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
              Event Schedule & Venue
            </div>
            <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-primary)" }}>
              {formattedDate} {currentBooking?.eventTime ? `@ ${currentBooking.eventTime}` : ""}
            </div>
            <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
              {currentBooking?.venueName || "Venue TBA"}, {currentBooking?.venueAddress || ""}
            </div>
          </div>

          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
              Package & Pax
            </div>
            <div style={{ fontSize: "0.95rem", fontWeight: 800, color: "var(--emerald-600)" }}>
              {currentBooking?.pax || 50} Pax Guaranteed
            </div>
            <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)", fontWeight: 600 }}>
              {currentBooking?.packageName || "Standard Buffet"}
            </div>
          </div>

          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
              Ingress & Egress Readiness
            </div>
            <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.4rem" }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", fontWeight: 700, color: "#1e40af" }}>
                  <span>Ingress:</span>
                  <span>{ingressCheckedCount}/{totalItemsCount} ({ingressPercent}%)</span>
                </div>
                <div style={{ height: "6px", background: "#e2e8f0", borderRadius: "3px", overflow: "hidden", marginTop: "2px" }}>
                  <div style={{ width: `${ingressPercent}%`, height: "100%", background: "#3b82f6", transition: "width 0.3s" }} />
                </div>
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", fontWeight: 700, color: "#065f46" }}>
                  <span>Egress:</span>
                  <span>{egressCheckedCount}/{totalItemsCount} ({egressPercent}%)</span>
                </div>
                <div style={{ height: "6px", background: "#e2e8f0", borderRadius: "3px", overflow: "hidden", marginTop: "2px" }}>
                  <div style={{ width: `${egressPercent}%`, height: "100%", background: "#10b981", transition: "width 0.3s" }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Custom Item Drawer / Card (Hidden in Print) */}
      {isAddingItem && (
        <form onSubmit={handleAddNewItem} className="card-section no-print" style={{ marginBottom: "1.25rem", background: "var(--gold-50)", border: "1px solid var(--gold-300)" }}>
          <div style={{ fontWeight: 800, fontSize: "0.95rem", marginBottom: "0.75rem", color: "var(--gold-800)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <Plus size={16} />
            <span>Add Custom Catering Equipment to this Booking</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1.5fr 2fr", gap: "0.75rem", alignItems: "flex-end" }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: "0.75rem" }}>Equipment Description *</label>
              <input
                type="text"
                required
                placeholder="e.g. 6FT BUFFET SKIRT TABLE or EXTRA CHAIR COVERS"
                className="form-input"
                value={newItem.description}
                onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: "0.75rem" }}>Quantity *</label>
              <input
                type="number"
                min="1"
                required
                className="form-input"
                value={newItem.qty}
                onChange={(e) => setNewItem(prev => ({ ...prev, qty: e.target.value }))}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: "0.75rem" }}>Unit</label>
              <select
                className="form-select"
                value={newItem.unit}
                onChange={(e) => setNewItem(prev => ({ ...prev, unit: e.target.value }))}
              >
                <option value="PCS">PCS</option>
                <option value="SETS">SETS</option>
                <option value="PC">PC</option>
                <option value="UNITS">UNITS</option>
                <option value="ROLLS">ROLLS</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: "0.75rem" }}>Category</label>
              <select
                className="form-select"
                value={newItem.category}
                onChange={(e) => setNewItem(prev => ({ ...prev, category: e.target.value }))}
              >
                {EQUIPMENT_CATEGORIES.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: "0.75rem" }}>Remarks / Notes</label>
              <input
                type="text"
                placeholder="e.g. ALL CREAM SKIRTING or PARA SA BUFFET"
                className="form-input"
                value={newItem.remarks}
                onChange={(e) => setNewItem(prev => ({ ...prev, remarks: e.target.value }))}
              />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "1rem" }}>
            <button type="button" className="btn-secondary" onClick={() => setIsAddingItem(false)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              <Plus size={15} />
              <span>Add to Manifest</span>
            </button>
          </div>
        </form>
      )}

      {/* Screen Controls & Filters (Hidden in Print) */}
      <div className="card-section no-print" style={{ marginBottom: "1.25rem", padding: "1rem 1.25rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          {/* Category Tabs */}
          <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
            <button
              className={`pill-btn ${activeCategory === "all" ? "active" : ""}`}
              style={{
                background: activeCategory === "all" ? "var(--gold-gradient)" : "#f1f5f9",
                color: activeCategory === "all" ? "#ffffff" : "var(--text-secondary)",
                border: "none",
                padding: "4px 10px",
                borderRadius: "6px",
                fontSize: "0.75rem",
                fontWeight: 700,
                cursor: "pointer"
              }}
              onClick={() => setActiveCategory("all")}
            >
              All Categories ({items.length})
            </button>
            {EQUIPMENT_CATEGORIES.map(cat => {
              const count = items.filter(i => i.category === cat.id).length;
              if (count === 0) return null;
              return (
                <button
                  key={cat.id}
                  style={{
                    background: activeCategory === cat.id ? "var(--gold-gradient)" : "#f1f5f9",
                    color: activeCategory === cat.id ? "#ffffff" : "var(--text-secondary)",
                    border: "none",
                    padding: "4px 10px",
                    borderRadius: "6px",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    cursor: "pointer"
                  }}
                  onClick={() => setActiveCategory(cat.id)}
                >
                  {cat.name.split(" ")[0]} ({count})
                </button>
              );
            })}
          </div>

          {/* Quick Search & Bulk Actions */}
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <div style={{ position: "relative" }}>
              <Search size={14} style={{ position: "absolute", left: "10px", top: "9px", color: "var(--text-muted)" }} />
              <input
                type="text"
                placeholder="Search equipment..."
                className="form-input"
                style={{ width: "190px", padding: "0.35rem 0.65rem 0.35rem 1.9rem", fontSize: "0.8rem" }}
                value={filterSearch}
                onChange={(e) => setFilterSearch(e.target.value)}
              />
            </div>

            <button 
              type="button"
              className="btn-secondary" 
              style={{ fontSize: "0.75rem", padding: "0.35rem 0.65rem", color: "#1e40af", borderColor: "#bfdbfe" }}
              onClick={() => handleMarkAllIngress(true)}
              title="Mark all items as Ingress verified"
            >
              ✓ All Ingress
            </button>

            <button 
              type="button"
              className="btn-secondary" 
              style={{ fontSize: "0.75rem", padding: "0.35rem 0.65rem", color: "#065f46", borderColor: "#a7f3d0" }}
              onClick={() => handleMarkAllEgress(true)}
              title="Mark all items as Egress verified upon pullout"
            >
              ✓ All Egress
            </button>
          </div>
        </div>
      </div>

      {/* FORMAL PRINTABLE PAPER / INGRESS & EGRESS MANIFEST VIEW */}
      <div className="ingress-print-container" style={{ background: "#ffffff", padding: "1.5rem", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-subtle)", boxShadow: "var(--shadow-sm)" }}>
        
        {/* Header Block Matching User's Document */}
        <div className="ingress-header-grid" style={{ borderBottom: "2px solid #0f172a", paddingBottom: "0.75rem", marginBottom: "1rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <h1 style={{ fontSize: "1.45rem", fontWeight: 900, letterSpacing: "1.5px", color: "#0f172a", textTransform: "uppercase", margin: 0 }}>
                INGRESS AND EGRESS FORM
              </h1>
              <div style={{ fontSize: "0.8rem", color: "#475569", fontWeight: 700, marginTop: "2px" }}>
                {activeCompany?.name || "CATERFLOW PREMIER BANQUET LOGISTICS"}
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>DATE ISSUED / PURCHASED:</div>
              <div style={{ fontSize: "0.88rem", fontWeight: 800, color: "#0f172a" }}>
                {new Date().toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" })}
              </div>
              <div style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", fontWeight: 700, marginTop: "4px" }}>BOOKING NUMBER:</div>
              <div style={{ fontSize: "0.95rem", fontWeight: 900, color: "#047857", fontFamily: "monospace", wordBreak: "break-all" }}>
                {currentBooking?.bookingReference || currentBooking?.id || "BA#122025001"}
              </div>
              {currentBooking?.bookingReference && (
                <div style={{ fontSize: "0.7rem", color: "#64748b", fontFamily: "monospace" }}>
                  Quote Ref: {currentBooking.id}
                </div>
              )}
            </div>
          </div>

          {/* Meta Info Grid */}
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "1.2fr 2fr 1fr", 
            gap: "0.5rem 1rem", 
            background: "#f8fafc", 
            padding: "0.75rem", 
            border: "1px solid #cbd5e1", 
            borderRadius: "6px",
            marginTop: "0.75rem",
            fontSize: "0.82rem"
          }}>
            <div>
              <span style={{ color: "#64748b", fontWeight: 700, textTransform: "uppercase", fontSize: "0.7rem", display: "block" }}>CLIENT NAME:</span>
              <strong style={{ color: "#0f172a" }}>{currentBooking?.clientName || "N/A"}</strong>
            </div>

            <div>
              <span style={{ color: "#64748b", fontWeight: 700, textTransform: "uppercase", fontSize: "0.7rem", display: "block" }}>VENUE ADDRESS:</span>
              <span style={{ color: "#0f172a", fontWeight: 600 }}>
                {currentBooking?.venueName ? `${currentBooking.venueName}, ` : ""}{currentBooking?.venueAddress || "TBA"}
              </span>
            </div>

            <div>
              <span style={{ color: "#64748b", fontWeight: 700, textTransform: "uppercase", fontSize: "0.7rem", display: "block" }}>CONTACT NUMBER:</span>
              <strong style={{ color: "#0f172a" }}>{currentBooking?.contactNumber || "N/A"}</strong>
            </div>

            <div>
              <span style={{ color: "#64748b", fontWeight: 700, textTransform: "uppercase", fontSize: "0.7rem", display: "block" }}>EVENT DATE & TIME:</span>
              <strong style={{ color: "#0f172a" }}>
                {formattedDate} {currentBooking?.eventTime ? `@ ${currentBooking.eventTime}` : ""}
              </strong>
            </div>

            <div>
              <span style={{ color: "#64748b", fontWeight: 700, textTransform: "uppercase", fontSize: "0.7rem", display: "block" }}>PACKAGE SELECTED:</span>
              <span style={{ color: "#0f172a", fontWeight: 700 }}>
                {currentBooking?.packageName || "Catering Package"}
              </span>
            </div>

            <div>
              <span style={{ color: "#64748b", fontWeight: 700, textTransform: "uppercase", fontSize: "0.7rem", display: "block" }}>NUMBER OF PAX:</span>
              <strong style={{ color: "#047857", fontSize: "0.95rem" }}>{currentBooking?.pax || 50} PAX</strong>
            </div>
          </div>
        </div>

        {/* Selected Menu Dishes Sub-strip (Important for matching serving trays) */}
        {currentBooking?.dishes && (
          <div style={{ background: "#fffbeb", border: "1px dashed #fde68a", padding: "0.5rem 0.75rem", borderRadius: "6px", marginBottom: "0.75rem", fontSize: "0.78rem" }}>
            <span style={{ fontWeight: 800, color: "#92400e", textTransform: "uppercase", marginRight: "6px" }}>
              BANQUET DISHES FOR WARMERS:
            </span>
            <span style={{ color: "#78350f" }}>
              {(Array.isArray(currentBooking.dishes) ? currentBooking.dishes : Object.values(currentBooking.dishes).flat())
                .map((d, i) => `${i + 1}. ${typeof d === 'string' ? d : d.name}`)
                .join("  •  ") || "Standard banquet viands"}
            </span>
          </div>
        )}

        {/* EQUIPMENT TABLE */}
        <table className="ingress-manifest-table" style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem" }}>
          <thead>
            <tr style={{ background: "#0f172a", color: "#ffffff", textAlign: "left", fontSize: "0.74rem", textTransform: "uppercase" }}>
              <th style={{ padding: "0.6rem 0.5rem", width: "35px", textAlign: "center" }}>#</th>
              <th style={{ padding: "0.6rem 0.5rem" }}>EQUIPMENT DESCRIPTION</th>
              <th style={{ padding: "0.6rem 0.5rem", width: "55px", textAlign: "center" }}>QTY</th>
              <th style={{ padding: "0.6rem 0.5rem", width: "55px", textAlign: "center" }}>UNIT</th>
              <th style={{ padding: "0.6rem 0.5rem", width: "70px", textAlign: "center", background: "#1e3a8a" }}>INGRESS</th>
              <th style={{ padding: "0.6rem 0.5rem", width: "70px", textAlign: "center", background: "#065f46" }}>EGRESS</th>
              <th style={{ padding: "0.6rem 0.5rem" }}>REMARKS</th>
              <th className="no-print" style={{ padding: "0.6rem 0.5rem", width: "45px", textAlign: "center" }}>DEL</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item, idx) => (
              <tr 
                key={item.id} 
                style={{ 
                  borderBottom: "1px solid #e2e8f0",
                  background: idx % 2 === 0 ? "#ffffff" : "#f8fafc"
                }}
              >
                <td style={{ padding: "0.45rem 0.5rem", textAlign: "center", color: "#94a3b8", fontWeight: 600 }}>
                  {idx + 1}
                </td>

                <td style={{ padding: "0.45rem 0.5rem" }}>
                  <span style={{ fontWeight: 700, color: "#1e293b" }}>{item.description}</span>
                </td>

                <td style={{ padding: "0.45rem 0.5rem", textAlign: "center" }}>
                  <input
                    type="number"
                    min="1"
                    className="ingress-qty-input"
                    value={item.qty}
                    onChange={(e) => handleUpdateItemField(item.id, "qty", Number(e.target.value))}
                    style={{
                      width: "48px",
                      textAlign: "center",
                      border: "1px solid #cbd5e1",
                      borderRadius: "4px",
                      padding: "2px 4px",
                      fontSize: "0.8rem",
                      fontWeight: 800
                    }}
                  />
                </td>

                <td style={{ padding: "0.45rem 0.5rem", textAlign: "center", fontWeight: 700, color: "#64748b" }}>
                  {item.unit}
                </td>

                {/* INGRESS CHECKBOX */}
                <td style={{ padding: "0.45rem 0.5rem", textAlign: "center" }}>
                  <label style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                    <input
                      type="checkbox"
                      checked={Boolean(item.ingressChecked)}
                      onChange={() => handleToggleIngress(item.id)}
                      style={{ width: "16px", height: "16px", cursor: "pointer", accentColor: "#2563eb" }}
                    />
                  </label>
                </td>

                {/* EGRESS CHECKBOX */}
                <td style={{ padding: "0.45rem 0.5rem", textAlign: "center" }}>
                  <label style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                    <input
                      type="checkbox"
                      checked={Boolean(item.egressChecked)}
                      onChange={() => handleToggleEgress(item.id)}
                      style={{ width: "16px", height: "16px", cursor: "pointer", accentColor: "#059669" }}
                    />
                  </label>
                </td>

                {/* REMARKS */}
                <td style={{ padding: "0.45rem 0.5rem" }}>
                  <input
                    type="text"
                    value={item.remarks || ""}
                    onChange={(e) => handleUpdateItemField(item.id, "remarks", e.target.value)}
                    placeholder="e.g. ALL CREAM SKIRTING"
                    style={{
                      width: "100%",
                      border: "1px solid transparent",
                      background: "transparent",
                      fontSize: "0.78rem",
                      color: "#475569",
                      fontWeight: 600,
                      padding: "2px 4px"
                    }}
                    onFocus={(e) => e.target.style.borderColor = "#94a3b8"}
                    onBlur={(e) => e.target.style.borderColor = "transparent"}
                  />
                </td>

                {/* DELETE (NO PRINT) */}
                <td className="no-print" style={{ padding: "0.45rem 0.5rem", textAlign: "center" }}>
                  <button
                    type="button"
                    onClick={() => handleDeleteItem(item.id)}
                    title="Remove equipment item"
                    style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", padding: "2px" }}
                  >
                    <Trash2 size={13} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* General Inventory Remarks Box */}
        <div style={{ marginTop: "1rem", border: "1px solid #cbd5e1", borderRadius: "6px", padding: "0.6rem 0.75rem" }}>
          <div style={{ fontSize: "0.74rem", fontWeight: 800, color: "#475569", textTransform: "uppercase", marginBottom: "4px" }}>
            SPECIAL LOGISTICS & SETUP REMARKS:
          </div>
          <textarea
            className="form-input"
            rows={2}
            value={generalRemarks}
            onChange={(e) => {
              setGeneralRemarks(e.target.value);
              setIsSaved(false);
            }}
            placeholder="e.g. Venue has stairs leading to 2nd floor function hall. Extension wires provided for lechon and hotdog stations."
            style={{ width: "100%", fontSize: "0.8rem", resize: "vertical" }}
          />
        </div>

        {/* SIGNATURES BLOCK MATCHING PHYSICAL FORM */}
        <div className="ingress-signatures-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", marginTop: "2rem", paddingTop: "1rem", borderTop: "1px solid #cbd5e1" }}>
          {/* Left: INGRESS CHECKED BY */}
          <div>
            <div style={{ fontSize: "0.8rem", fontWeight: 800, textTransform: "uppercase", color: "#0f172a", marginBottom: "1.5rem" }}>
              INGRESS CHECKED BY (VENUE DISPATCH & SETUP):
            </div>
            
            <div style={{ borderBottom: "1.5px solid #0f172a", minHeight: "36px", display: "flex", alignItems: "flex-end", paddingBottom: "4px" }}>
              <input
                type="text"
                placeholder="Staff Full Name (Lead / Dispatcher)"
                value={ingressStaff}
                onChange={(e) => {
                  setIngressStaff(e.target.value);
                  setIsSaved(false);
                }}
                style={{ width: "100%", border: "none", outline: "none", fontWeight: 700, fontSize: "0.85rem", color: "#0f172a" }}
              />
            </div>
            <div style={{ fontSize: "0.74rem", color: "#64748b", textTransform: "uppercase", marginTop: "4px", fontWeight: 700 }}>
              NAME AND SIGNATURE OF STAFF
            </div>
          </div>

          {/* Right: EGRESS CHECKED BY */}
          <div>
            <div style={{ fontSize: "0.8rem", fontWeight: 800, textTransform: "uppercase", color: "#0f172a", marginBottom: "1.5rem" }}>
              EGRESS CHECKED BY (EVENT CLEARING & PULLOUT):
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <div style={{ borderBottom: "1.5px solid #0f172a", minHeight: "36px", display: "flex", alignItems: "flex-end", paddingBottom: "4px" }}>
                  <input
                    type="text"
                    placeholder="Staff Full Name"
                    value={egressStaff}
                    onChange={(e) => {
                      setEgressStaff(e.target.value);
                      setIsSaved(false);
                    }}
                    style={{ width: "100%", border: "none", outline: "none", fontWeight: 700, fontSize: "0.85rem", color: "#0f172a" }}
                  />
                </div>
                <div style={{ fontSize: "0.72rem", color: "#64748b", textTransform: "uppercase", marginTop: "4px", fontWeight: 700 }}>
                  NAME AND SIGNATURE OF STAFF
                </div>
              </div>

              <div>
                <div style={{ borderBottom: "1.5px solid #0f172a", minHeight: "36px", display: "flex", alignItems: "flex-end", paddingBottom: "4px" }}>
                  <input
                    type="text"
                    placeholder="Client Endorsement"
                    value={clientSignName}
                    onChange={(e) => {
                      setClientSignName(e.target.value);
                      setIsSaved(false);
                    }}
                    style={{ width: "100%", border: "none", outline: "none", fontWeight: 700, fontSize: "0.85rem", color: "#0f172a" }}
                  />
                </div>
                <div style={{ fontSize: "0.72rem", color: "#64748b", textTransform: "uppercase", marginTop: "4px", fontWeight: 700 }}>
                  NAME AND SIGNATURE OF CLIENT
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* OFFICIAL LIABILITY DISCLAIMER NOTE */}
        <div 
          className="ingress-legal-note"
          style={{ 
            marginTop: "1.75rem", 
            border: "1.5px solid #b45309", 
            background: "#fffbeb", 
            borderRadius: "6px", 
            padding: "0.75rem 1rem",
            fontSize: "0.75rem",
            lineHeight: "1.5",
            color: "#78350f"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontWeight: 900, textTransform: "uppercase", color: "#92400e", marginBottom: "4px" }}>
            <AlertTriangle size={15} color="#b45309" />
            <span>OFFICIAL CATERING EQUIPMENT ACCOUNTABILITY POLICY (NOTE):</span>
          </div>
          <p style={{ margin: 0, fontStyle: "italic" }}>
            {OFFICIAL_INGRESS_DISCLAIMER_NOTE}
          </p>
        </div>

      </div>
    </div>
  );
}
