import React, { useState, useEffect } from "react";
import { 
  Package, 
  Utensils, 
  Sparkles, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Search, 
  Calendar, 
  Users, 
  DollarSign, 
  FileText, 
  Database,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { EVENT_TYPES, DELIVERY_LOCATIONS, getDishUpgradePrice, getPackageCourseAllowances } from "../data/cateringData";
import { syncPlatableDishes } from "../services/backendService";
import { 
  formatBookingReference, 
  getConfirmedBookingsCountForDate, 
  MAX_CONFIRMED_BOOKINGS_PER_DAY 
} from "../utils/bookingUtils";

export default function AdminPackageManager({
  packages,
  dishes,
  addons,
  bookings = [],
  onSavePackage,
  onDeletePackage,
  onSaveDish,
  onDeleteDish,
  onSaveAddon,
  onDeleteAddon,
  onSaveBooking,
  onViewBooking,
  backendStatus,
  onRefreshData,
  initialSubTab = "packages",
  initialBookingDate = null
}) {
  const [activeSubTab, setActiveSubTab] = useState(initialSubTab || "packages"); // "packages", "dishes", "addons", "new-booking"

  useEffect(() => {
    if (initialSubTab) setActiveSubTab(initialSubTab);
  }, [initialSubTab]);
  
  // Search states
  const [dishSearch, setDishSearch] = useState("");
  const [selectedDishCategory, setSelectedDishCategory] = useState("beef");

  // Package Edit/Create Modal State
  const [editingPkg, setEditingPkg] = useState(null);
  const [isPkgModalOpen, setIsPkgModalOpen] = useState(false);

  // Dish Edit/Create Modal State
  const [editingDish, setEditingDish] = useState(null);
  const [isDishModalOpen, setIsDishModalOpen] = useState(false);

  // Addon Edit/Create Modal State
  const [editingAddon, setEditingAddon] = useState(null);
  const [isAddonModalOpen, setIsAddonModalOpen] = useState(false);

  // Direct Booking Input State
  const [directBooking, setDirectBooking] = useState({
    clientName: "",
    contactNumber: "",
    email: "",
    eventType: "wedding",
    eventDate: initialBookingDate || new Date(Date.now() + 86400000 * 30).toISOString().split("T")[0],
    eventTime: "18:00",
    venueName: "",
    venueAddress: "",
    packageId: packages[0]?.id || "royal_premiere",
    pax: 100,
    deliveryLocation: "ncr",
    status: "Confirmed",
    notes: ""
  });

  useEffect(() => {
    if (initialBookingDate) {
      setDirectBooking(prev => ({ ...prev, eventDate: initialBookingDate }));
    }
  }, [initialBookingDate]);

  // Open Package Modal
  const handleOpenPkgModal = (pkg = null) => {
    if (pkg) {
      const allowances = getPackageCourseAllowances(pkg);
      setEditingPkg({
        ...pkg,
        mainDishesCount: allowances.mainDishesCount,
        regSidesCount: allowances.regSidesCount,
        specSidesCount: allowances.specSidesCount,
        regDessertsCount: allowances.regDessertsCount,
        specDessertsCount: allowances.specDessertsCount,
        inclusionsText: (pkg.inclusions || []).join("\n")
      });
    } else {
      setEditingPkg({
        id: "",
        name: "",
        subtitle: "",
        badge: "Custom Package",
        popular: false,
        pricePerPax: 650,
        minPax: 50,
        mainDishesCount: 5,
        regSidesCount: 1,
        specSidesCount: 0,
        regDessertsCount: 1,
        specDessertsCount: 0,
        courses: { beef: 1, pork: 1, chicken: 1, noodlesOrVeg: 1, rice: 1, dessert: 1, drinks: 1 },
        inclusionsText: "5 Main Dishes\nSteamed Pandan Jasmine Rice\n1 Filipino Dessert\nBottomless Iced Tea\nStandard Catering Setup"
      });
    }
    setIsPkgModalOpen(true);
  };

  const handleSavePkgSubmit = async (e) => {
    e.preventDefault();
    if (!editingPkg.name || !editingPkg.pricePerPax) return;

    const inclusions = editingPkg.inclusionsText
      ? editingPkg.inclusionsText.split("\n").map(s => s.trim()).filter(Boolean)
      : [];

    await onSavePackage({
      ...editingPkg,
      inclusions,
      mainDishesCount: Number(editingPkg.mainDishesCount) || 5,
      sideDishes: {
        regular: Number(editingPkg.regSidesCount) ?? 1,
        special: Number(editingPkg.specSidesCount) ?? 0
      },
      desserts: {
        regular: Number(editingPkg.regDessertsCount) ?? 1,
        special: Number(editingPkg.specDessertsCount) ?? 0
      },
      pricePerPax: Number(editingPkg.pricePerPax),
      minPax: Number(editingPkg.minPax)
    });
    setIsPkgModalOpen(false);
    setEditingPkg(null);
  };

  // Dish Sync State
  const [isSyncingDishes, setIsSyncingDishes] = useState(false);

  const handleSyncPlatableMenu = async () => {
    if (!window.confirm("Sync all menu viands to Platable Catering Services' official master menu (Regular & Special dishes)?")) return;
    setIsSyncingDishes(true);
    try {
      await syncPlatableDishes();
      if (onRefreshData) await onRefreshData();
      alert("Platable official menu successfully synchronized!");
    } catch (err) {
      alert("Error syncing dishes: " + err.message);
    } finally {
      setIsSyncingDishes(false);
    }
  };

  // Open Dish Modal
  const handleOpenDishModal = (dish = null, cat = selectedDishCategory) => {
    if (dish) {
      setEditingDish({
        ...dish,
        category: cat,
        tier: dish.tier || (dish.premium ? "special" : "regular"),
        upgradePrice: (dish.tier === "special" || dish.premium)
          ? getDishUpgradePrice(dish)
          : 65
      });
    } else {
      setEditingDish({
        id: "",
        category: cat,
        name: "",
        description: "",
        tier: "regular",
        premium: false,
        upgradePrice: 65
      });
    }
    setIsDishModalOpen(true);
  };

  const handleSaveDishSubmit = async (e) => {
    e.preventDefault();
    if (!editingDish.name) return;

    const isSpecial = editingDish.tier === "special" || Boolean(editingDish.premium);
    const parsedPrice = Number(editingDish.upgradePrice);
    const finalUpgradePrice = isSpecial
      ? (!isNaN(parsedPrice) && parsedPrice > 0 ? parsedPrice : 65)
      : 0;

    await onSaveDish({
      ...editingDish,
      premium: isSpecial,
      upgradePrice: finalUpgradePrice
    });
    setIsDishModalOpen(false);
    setEditingDish(null);
  };

  // Open Addon Modal
  const handleOpenAddonModal = (addon = null) => {
    if (addon) {
      setEditingAddon({ ...addon });
    } else {
      setEditingAddon({
        id: "",
        name: "",
        category: "Food Stations",
        price: 5000,
        unit: "serves 50 pax",
        description: "",
        popular: false
      });
    }
    setIsAddonModalOpen(true);
  };

  const handleSaveAddonSubmit = async (e) => {
    e.preventDefault();
    if (!editingAddon.name || editingAddon.price === undefined) return;

    await onSaveAddon({
      ...editingAddon,
      price: Number(editingAddon.price)
    });
    setIsAddonModalOpen(false);
    setEditingAddon(null);
  };

  // Handle Direct Booking Submission
  const handleDirectBookingSubmit = async (e) => {
    e.preventDefault();
    const pkg = packages.find(p => p.id === directBooking.packageId) || packages[0];
    const paxNum = Number(directBooking.pax) || 100;
    const foodTotal = paxNum * (pkg.pricePerPax || 0);

    const delivery = DELIVERY_LOCATIONS.find(d => d.id === directBooking.deliveryLocation) || DELIVERY_LOCATIONS[0];
    const subtotal = foodTotal + (delivery.fee || 0);
    const serviceCharge = Math.round(subtotal * 0.1);
    const grandTotal = subtotal + serviceCharge;
    const downpaymentRequired = Math.round(grandTotal * 0.5);

    const eventTypeObj = EVENT_TYPES.find(t => t.id === directBooking.eventType);

    const newBooking = {
      id: "BK-" + new Date().getFullYear() + "-" + Math.floor(1000 + Math.random() * 9000),
      createdAt: new Date().toISOString(),
      status: directBooking.status,
      clientName: directBooking.clientName,
      contactNumber: directBooking.contactNumber,
      email: directBooking.email,
      eventType: directBooking.eventType,
      eventTypeName: eventTypeObj ? eventTypeObj.name : "Celebration",
      eventDate: directBooking.eventDate,
      eventTime: directBooking.eventTime,
      venueName: directBooking.venueName || "Client Venue",
      venueAddress: directBooking.venueAddress || "Metro Manila",
      packageId: pkg.id,
      packageName: pkg.name,
      pax: paxNum,
      pricePerPax: pkg.pricePerPax,
      foodTotal,
      dishes: (pkg.inclusions || []).slice(0, 5),
      selectedAddons: [],
      addonsTotal: 0,
      deliveryLocation: directBooking.deliveryLocation,
      deliveryFee: delivery.fee || 0,
      subtotal,
      serviceChargePercent: 10,
      serviceCharge,
      isVatEnabled: false,
      vatAmount: 0,
      discountAmount: 0,
      grandTotal,
      downpaymentRequired,
      balanceDue: (directBooking.status === "Confirmed" || directBooking.status === "Ongoing") ? downpaymentRequired : grandTotal,
      notes: directBooking.notes || "Direct booking recorded via Admin Portal.",
      bookingReference: (directBooking.status === "Confirmed" || directBooking.status === "Ongoing")
        ? formatBookingReference(directBooking.eventDate, directBooking.eventTime, directBooking.clientName)
        : null
    };

    const res = await onSaveBooking(newBooking);
    if (res && onViewBooking) {
      onViewBooking(newBooking);
    }
  };

  const dishCategories = [
    { id: "beef", name: "Baka (Beef)" },
    { id: "pork", name: "Baboy (Pork)" },
    { id: "chicken", name: "Manok (Chicken)" },
    { id: "fish", name: "Isda & Seafood" },
    { id: "noodlesOrVeg", name: "Side Dish (Pasta & Veg)" },
    { id: "rice", name: "Kanin & Sabaw (Rice & Soup)" },
    { id: "dessert", name: "Panghimagas (Dessert)" },
    { id: "drinks", name: "Inumin (Beverages)" }
  ];

  const currentCategoryDishes = dishes[selectedDishCategory] || [];
  const filteredDishes = currentCategoryDishes.filter(d => 
    d.name.toLowerCase().includes(dishSearch.toLowerCase()) || 
    (d.description && d.description.toLowerCase().includes(dishSearch.toLowerCase()))
  );

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
      {/* Backend Status Bar */}
      <div className="card-section" style={{ padding: "1rem 1.5rem", marginBottom: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
          <div style={{ 
            background: backendStatus.isApiServer ? "#ecfdf5" : "#fef3c7", 
            color: backendStatus.isApiServer ? "#059669" : "#d97706", 
            padding: "8px", 
            borderRadius: "10px", 
            display: "flex" 
          }}>
            <Database size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--text-primary)" }}>
              {backendStatus.mode}
            </div>
            <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
              {backendStatus.isApiServer 
                ? "REST API endpoints active on http://localhost:5000/api • Auto-sync with server/data/db.json"
                : "Standalone Mode active • Data stored locally and synchronized with Firestore"}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <span style={{ fontSize: "0.82rem", background: "var(--surface-sunken)", padding: "4px 10px", borderRadius: "20px", border: "1px solid var(--border-subtle)" }}>
            <strong>{packages.length}</strong> Packages
          </span>
          <span style={{ fontSize: "0.82rem", background: "var(--surface-sunken)", padding: "4px 10px", borderRadius: "20px", border: "1px solid var(--border-subtle)" }}>
            <strong>{addons.length}</strong> Add-ons
          </span>
          <button 
            className="btn-secondary" 
            style={{ padding: "0.4rem 0.85rem", fontSize: "0.82rem" }}
            onClick={onRefreshData}
          >
            Sync / Refresh
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", borderBottom: "2px solid var(--border-subtle)", marginBottom: "1.5rem" }}>
        <button
          onClick={() => setActiveSubTab("packages")}
          style={{
            padding: "0.75rem 1.25rem",
            background: "none",
            border: "none",
            borderBottom: activeSubTab === "packages" ? "3px solid var(--gold-500)" : "3px solid transparent",
            color: activeSubTab === "packages" ? "var(--gold-600)" : "var(--text-muted)",
            fontWeight: activeSubTab === "packages" ? 700 : 500,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontSize: "0.95rem"
          }}
        >
          <Package size={18} />
          <span>Catering Packages ({packages.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab("dishes")}
          style={{
            padding: "0.75rem 1.25rem",
            background: "none",
            border: "none",
            borderBottom: activeSubTab === "dishes" ? "3px solid var(--gold-500)" : "3px solid transparent",
            color: activeSubTab === "dishes" ? "var(--gold-600)" : "var(--text-muted)",
            fontWeight: activeSubTab === "dishes" ? 700 : 500,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontSize: "0.95rem"
          }}
        >
          <Utensils size={18} />
          <span>Viands & Dish Library</span>
        </button>

        <button
          onClick={() => setActiveSubTab("addons")}
          style={{
            padding: "0.75rem 1.25rem",
            background: "none",
            border: "none",
            borderBottom: activeSubTab === "addons" ? "3px solid var(--gold-500)" : "3px solid transparent",
            color: activeSubTab === "addons" ? "var(--gold-600)" : "var(--text-muted)",
            fontWeight: activeSubTab === "addons" ? 700 : 500,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontSize: "0.95rem"
          }}
        >
          <Sparkles size={18} />
          <span>Add-ons & Live Stations ({addons.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab("new-booking")}
          style={{
            padding: "0.75rem 1.25rem",
            background: "none",
            border: "none",
            borderBottom: activeSubTab === "new-booking" ? "3px solid var(--gold-500)" : "3px solid transparent",
            color: activeSubTab === "new-booking" ? "var(--gold-600)" : "var(--text-muted)",
            fontWeight: activeSubTab === "new-booking" ? 700 : 500,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontSize: "0.95rem"
          }}
        >
          <Plus size={18} />
          <span>Direct Booking Input Form</span>
        </button>
      </div>

      {/* SUB-TAB 1: PACKAGES */}
      {activeSubTab === "packages" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
            <div>
              <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "var(--text-primary)" }}>
                Catering Package Configurations
              </h2>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                Define menu offerings, per-pax pricing, minimum guarantees, and inclusions. Changes immediately sync to the Quotation Engine.
              </p>
            </div>
            <button className="btn-primary" onClick={() => handleOpenPkgModal()}>
              <Plus size={16} />
              <span>+ Add New Package</span>
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "1.25rem" }}>
            {packages.map((pkg) => {
              const isPremiere = pkg.id === "royal_premiere" || (pkg.pricePerPax >= 850 && pkg.minPax >= 70);
              const startingCost = (pkg.pricePerPax || 0) * (pkg.minPax || 50);

              return (
                <div 
                  key={pkg.id} 
                  className="card-section" 
                  style={{ 
                    position: "relative",
                    marginBottom: 0, 
                    border: isPremiere ? "2px solid var(--gold-400)" : "1px solid var(--border-subtle)",
                    boxShadow: isPremiere ? "var(--shadow-gold)" : "var(--shadow-sm)"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                    <span className="pkg-badge" style={{ position: "static", marginBottom: "0.25rem" }}>
                      {pkg.badge || "Standard Tier"}
                    </span>
                    <div style={{ display: "flex", gap: "0.35rem" }}>
                      <button 
                        onClick={() => handleOpenPkgModal(pkg)}
                        style={{ background: "#f1f5f9", border: "none", borderRadius: "6px", padding: "6px", cursor: "pointer", color: "var(--text-secondary)" }}
                        title="Edit Package"
                      >
                        <Edit3 size={15} />
                      </button>
                      <button 
                        onClick={() => onDeletePackage(pkg.id)}
                        style={{ background: "#fef2f2", border: "none", borderRadius: "6px", padding: "6px", cursor: "pointer", color: "#dc2626" }}
                        title="Delete Package"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.25rem" }}>
                    {pkg.name}
                  </h3>
                  <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", minHeight: "36px", marginBottom: "1rem" }}>
                    {pkg.subtitle}
                  </p>

                  <div style={{ background: "var(--surface-sunken)", padding: "0.85rem", borderRadius: "8px", marginBottom: "1rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                    <div>
                      <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Rate Per Pax</div>
                      <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--gold-600)" }}>
                        ₱{pkg.pricePerPax.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Starting Package Min</div>
                      <div style={{ fontSize: "1.1rem", fontWeight: 700, color: isPremiere ? "var(--emerald-600)" : "var(--text-primary)" }}>
                        ₱{startingCost.toLocaleString()}
                        <span style={{ fontSize: "0.75rem", fontWeight: 500, color: "var(--text-muted)" }}> ({pkg.minPax} pax)</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "0.5rem", textTransform: "uppercase" }}>
                      Key Inclusions:
                    </div>
                    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                      {(pkg.inclusions || []).slice(0, 4).map((inc, i) => (
                        <li key={i} style={{ fontSize: "0.8rem", color: "var(--text-secondary)", display: "flex", alignItems: "flex-start", gap: "0.4rem" }}>
                          <Check size={14} color="var(--gold-600)" style={{ flexShrink: 0, marginTop: "2px" }} />
                          <span>{inc}</span>
                        </li>
                      ))}
                      {(pkg.inclusions || []).length > 4 && (
                        <li style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontStyle: "italic", marginLeft: "1.2rem" }}>
                          + {(pkg.inclusions || []).length - 4} more inclusions...
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: DISHES & VIANDS */}
      {activeSubTab === "dishes" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "var(--text-primary)" }}>
                Viands & Dish Master Library
              </h2>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                Manage recipes, Tagalog viand descriptions, and premium dish upgrades available for catering menus.
              </p>
            </div>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <button 
                type="button"
                className="btn-secondary" 
                onClick={handleSyncPlatableMenu}
                disabled={isSyncingDishes}
                style={{ fontSize: "0.82rem", display: "inline-flex", alignItems: "center", gap: "6px" }}
              >
                <RefreshCw size={14} className={isSyncingDishes ? "spin" : ""} />
                <span>{isSyncingDishes ? "Syncing..." : "Sync Platable Official Menu"}</span>
              </button>
              <button className="btn-primary" onClick={() => handleOpenDishModal(null, selectedDishCategory)}>
                <Plus size={16} />
                <span>+ Add Viand to {dishCategories.find(c => c.id === selectedDishCategory)?.name}</span>
              </button>
            </div>
          </div>

          {/* Category Tabs & Search Bar */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "0.75rem" }}>
            <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
              {dishCategories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedDishCategory(cat.id)}
                  style={{
                    padding: "0.45rem 0.85rem",
                    borderRadius: "20px",
                    border: "1px solid",
                    borderColor: selectedDishCategory === cat.id ? "var(--gold-500)" : "var(--border-subtle)",
                    background: selectedDishCategory === cat.id ? "var(--gold-50)" : "var(--surface)",
                    color: selectedDishCategory === cat.id ? "var(--gold-700)" : "var(--text-secondary)",
                    fontSize: "0.82rem",
                    fontWeight: selectedDishCategory === cat.id ? 700 : 500,
                    cursor: "pointer"
                  }}
                >
                  {cat.name} ({(dishes[cat.id] || []).length})
                </button>
              ))}
            </div>

            <div style={{ position: "relative", minWidth: "240px" }}>
              <Search size={16} style={{ position: "absolute", left: "10px", top: "10px", color: "var(--text-muted)" }} />
              <input
                type="text"
                placeholder="Search viands..."
                className="form-input"
                style={{ paddingLeft: "32px", fontSize: "0.85rem" }}
                value={dishSearch}
                onChange={(e) => setDishSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Dishes Table */}
          <div className="card-section" style={{ padding: 0, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ background: "var(--surface-sunken)", borderBottom: "1px solid var(--border-subtle)" }}>
                  <th style={{ padding: "0.75rem 1rem", fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Dish Name</th>
                  <th style={{ padding: "0.75rem 1rem", fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Description & Ingredients</th>
                  <th style={{ padding: "0.75rem 1rem", fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Tier</th>
                  <th style={{ padding: "0.75rem 1rem", fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDishes.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                      No viands found in this category. Click "+ Add Viand" above to create one.
                    </td>
                  </tr>
                ) : (
                  filteredDishes.map((dish) => (
                    <tr key={dish.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                      <td style={{ padding: "0.85rem 1rem", fontWeight: 600, color: "var(--text-primary)", fontSize: "0.9rem" }}>
                        {dish.name}
                      </td>
                      <td style={{ padding: "0.85rem 1rem", color: "var(--text-muted)", fontSize: "0.83rem", maxWidth: "450px" }}>
                        {dish.description || "No description specified"}
                      </td>
                      <td style={{ padding: "0.85rem 1rem" }}>
                        {(dish.tier === "special" || dish.premium) ? (
                          <span style={{ background: "#fef3c7", color: "#b45309", border: "1px solid #fde68a", padding: "2px 8px", borderRadius: "12px", fontSize: "0.72rem", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "3px" }}>
                            ⭐ Special (+₱{getDishUpgradePrice(dish)}/pax)
                          </span>
                        ) : (
                          <span style={{ background: "#f1f5f9", color: "#475569", border: "1px solid #e2e8f0", padding: "2px 8px", borderRadius: "12px", fontSize: "0.72rem", fontWeight: 600 }}>
                            Regular Dish
                          </span>
                        )}
                      </td>
                      <td style={{ padding: "0.85rem 1rem", textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: "0.4rem" }}>
                          <button
                            onClick={() => handleOpenDishModal(dish, selectedDishCategory)}
                            style={{ background: "#f1f5f9", border: "none", borderRadius: "6px", padding: "6px", cursor: "pointer", color: "var(--text-secondary)" }}
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => onDeleteDish(dish.id)}
                            style={{ background: "#fef2f2", border: "none", borderRadius: "6px", padding: "6px", cursor: "pointer", color: "#dc2626" }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: ADD-ONS & LIVE STATIONS */}
      {activeSubTab === "addons" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
            <div>
              <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "var(--text-primary)" }}>
                Live Stations & Catering Add-ons
              </h2>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                Whole Lechon roasting, Halo-Halo dessert carts, cocktail mobile bars, and styling options.
              </p>
            </div>
            <button className="btn-primary" onClick={() => handleOpenAddonModal()}>
              <Plus size={16} />
              <span>+ Add New Station / Item</span>
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1rem" }}>
            {addons.map(addon => (
              <div key={addon.id} className="card-section" style={{ marginBottom: 0, padding: "1.2rem", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.4rem" }}>
                    <span style={{ fontSize: "0.72rem", textTransform: "uppercase", background: "var(--gold-50)", color: "var(--gold-700)", padding: "2px 8px", borderRadius: "4px", fontWeight: 700 }}>
                      {addon.category}
                    </span>
                    <div style={{ display: "flex", gap: "0.3rem" }}>
                      <button 
                        onClick={() => handleOpenAddonModal(addon)}
                        style={{ background: "#f1f5f9", border: "none", borderRadius: "6px", padding: "5px", cursor: "pointer", color: "var(--text-secondary)" }}
                      >
                        <Edit3 size={14} />
                      </button>
                      <button 
                        onClick={() => onDeleteAddon(addon.id)}
                        style={{ background: "#fef2f2", border: "none", borderRadius: "6px", padding: "5px", cursor: "pointer", color: "#dc2626" }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)", marginTop: "0.3rem" }}>
                    {addon.name}
                  </h3>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.75rem" }}>
                    {addon.unit}
                  </div>
                  <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
                    {addon.description}
                  </p>
                </div>

                <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "0.75rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Price</div>
                  <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--gold-600)" }}>
                    ₱{addon.price.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 4: DIRECT BOOKING INPUT FORM */}
      {activeSubTab === "new-booking" && (
        <div style={{ maxWidth: "850px", margin: "0 auto" }}>
          <div className="card-section">
            <div className="section-header">
              <div>
                <span className="pkg-badge" style={{ position: "static", marginBottom: "0.5rem", display: "inline-block" }}>
                  Administrative Intake
                </span>
                <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)" }}>
                  Direct Catering Booking / Inquiries Entry
                </h2>
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                  Directly record a client contract, phone reservation, or confirmed event into the backend database.
                </p>
              </div>
            </div>

            <form onSubmit={handleDirectBookingSubmit} style={{ marginTop: "1.5rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                <div className="form-group">
                  <label className="form-label">Client Full Name / Organization *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Engr. Mark & Dr. Joyce Tan"
                    className="form-input"
                    value={directBooking.clientName}
                    onChange={(e) => setDirectBooking(prev => ({ ...prev, clientName: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Contact Mobile Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="0917-xxx-xxxx"
                    className="form-input"
                    value={directBooking.contactNumber}
                    onChange={(e) => setDirectBooking(prev => ({ ...prev, contactNumber: e.target.value }))}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                <div className="form-group">
                  <label className="form-label">Client Email Address</label>
                  <input
                    type="email"
                    placeholder="client@email.com"
                    className="form-input"
                    value={directBooking.email}
                    onChange={(e) => setDirectBooking(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Type of Event</label>
                  <select
                    className="form-select"
                    value={directBooking.eventType}
                    onChange={(e) => setDirectBooking(prev => ({ ...prev, eventType: e.target.value }))}
                  >
                    {EVENT_TYPES.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                <div className="form-group">
                  <label className="form-label">Event Date *</label>
                  <input
                    type="date"
                    required
                    className="form-input"
                    value={directBooking.eventDate}
                    onChange={(e) => setDirectBooking(prev => ({ ...prev, eventDate: e.target.value }))}
                  />
                  {directBooking.eventDate && getConfirmedBookingsCountForDate(bookings, directBooking.eventDate) >= MAX_CONFIRMED_BOOKINGS_PER_DAY && (
                    <div style={{ marginTop: "4px", fontSize: "0.72rem", color: "#dc2626", fontWeight: 700 }}>
                      ⚠️ {getConfirmedBookingsCountForDate(bookings, directBooking.eventDate)}/3 events already booked on this date!
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Buffet Serving Time</label>
                  <input
                    type="time"
                    className="form-input"
                    value={directBooking.eventTime}
                    onChange={(e) => setDirectBooking(prev => ({ ...prev, eventTime: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Guaranteed Pax *</label>
                  <input
                    type="number"
                    min="30"
                    step="5"
                    className="form-input"
                    value={directBooking.pax}
                    onChange={(e) => setDirectBooking(prev => ({ ...prev, pax: Number(e.target.value) }))}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                <div className="form-group">
                  <label className="form-label">Select Catering Package</label>
                  <select
                    className="form-select"
                    value={directBooking.packageId}
                    onChange={(e) => setDirectBooking(prev => ({ ...prev, packageId: e.target.value }))}
                  >
                    {packages.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} — ₱{p.pricePerPax}/pax (Min {p.minPax} pax)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Delivery Zone</label>
                  <select
                    className="form-select"
                    value={directBooking.deliveryLocation}
                    onChange={(e) => setDirectBooking(prev => ({ ...prev, deliveryLocation: e.target.value }))}
                  >
                    {DELIVERY_LOCATIONS.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.name} (+₱{d.fee.toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                <div className="form-group">
                  <label className="form-label">Venue Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Fernwood Gardens / Glass Garden"
                    className="form-input"
                    value={directBooking.venueName}
                    onChange={(e) => setDirectBooking(prev => ({ ...prev, venueName: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Venue Address / City</label>
                  <input
                    type="text"
                    placeholder="e.g. Quezon City, Metro Manila"
                    className="form-input"
                    value={directBooking.venueAddress}
                    onChange={(e) => setDirectBooking(prev => ({ ...prev, venueAddress: e.target.value }))}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.25rem" }}>
                <div className="form-group">
                  <label className="form-label">Booking Status</label>
                  <select
                    className="form-select"
                    value={directBooking.status}
                    onChange={(e) => setDirectBooking(prev => ({ ...prev, status: e.target.value }))}
                  >
                    <option value="Confirmed">Confirmed (Downpayment Received)</option>
                    <option value="Ongoing">Ongoing Event (In Prep / Execution)</option>
                    <option value="Sent">Quotation Sent (Awaiting Client)</option>
                    <option value="Draft">Draft Inquiry</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Special Notes / Motifs</label>
                  <input
                    type="text"
                    placeholder="e.g. Sage Green & Gold motif, VIP Lechon"
                    className="form-input"
                    value={directBooking.notes}
                    onChange={(e) => setDirectBooking(prev => ({ ...prev, notes: e.target.value }))}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
                <button type="button" className="btn-secondary" onClick={() => setActiveSubTab("packages")}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ padding: "0.75rem 1.75rem" }}>
                  <ShieldCheck size={18} />
                  <span>Save Booking to Backend & Generate Quote</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PACKAGE EDIT / CREATE MODAL */}
      {isPkgModalOpen && editingPkg && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.65)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1rem" }}>
          <div className="card-section" style={{ width: "100%", maxWidth: "600px", maxHeight: "90vh", overflowY: "auto", margin: 0, padding: "1.75rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text-primary)" }}>
                {editingPkg.id ? "Edit Catering Package" : "Create New Catering Package"}
              </h3>
              <button onClick={() => setIsPkgModalOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSavePkgSubmit}>
              <div className="form-group" style={{ marginBottom: "1rem" }}>
                <label className="form-label">Package Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Royal Premiere Banquet & VIP Feast"
                  className="form-input"
                  value={editingPkg.name}
                  onChange={(e) => setEditingPkg(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="form-group" style={{ marginBottom: "1rem" }}>
                <label className="form-label">Subtitle / Target Event</label>
                <input
                  type="text"
                  placeholder="e.g. Ultra-Luxury 7-Course Celebration with Carving Station"
                  className="form-input"
                  value={editingPkg.subtitle}
                  onChange={(e) => setEditingPkg(prev => ({ ...prev, subtitle: e.target.value }))}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                <div className="form-group">
                  <label className="form-label">Price Per Pax (₱) *</label>
                  <input
                    type="number"
                    required
                    min="100"
                    className="form-input"
                    value={editingPkg.pricePerPax}
                    onChange={(e) => setEditingPkg(prev => ({ ...prev, pricePerPax: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Minimum Pax *</label>
                  <input
                    type="number"
                    required
                    min="20"
                    className="form-input"
                    value={editingPkg.minPax}
                    onChange={(e) => setEditingPkg(prev => ({ ...prev, minPax: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Tier Badge</label>
                  <input
                    type="text"
                    placeholder="e.g. Premiere Luxe"
                    className="form-input"
                    value={editingPkg.badge}
                    onChange={(e) => setEditingPkg(prev => ({ ...prev, badge: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Main Dishes Allowance *</label>
                  <input
                    type="number"
                    min="1"
                    max="15"
                    required
                    className="form-input"
                    placeholder="e.g. 5"
                    value={editingPkg.mainDishesCount ?? 5}
                    onChange={(e) => setEditingPkg(prev => ({ ...prev, mainDishesCount: Number(e.target.value) || 0 }))}
                  />
                </div>
              </div>

              {/* Course Allowances Grid: Sides and Desserts */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "0.75rem", marginBottom: "1rem", background: "rgba(241, 245, 249, 0.5)", padding: "0.75rem", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: "0.74rem" }}>🥗 Regular Sides</label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    className="form-input"
                    value={editingPkg.regSidesCount ?? 1}
                    onChange={(e) => setEditingPkg(prev => ({ ...prev, regSidesCount: Number(e.target.value) || 0 }))}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: "0.74rem", color: "#92400e" }}>⭐ Special Sides</label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    className="form-input"
                    style={{ borderColor: "#f59e0b" }}
                    value={editingPkg.specSidesCount ?? 0}
                    onChange={(e) => setEditingPkg(prev => ({ ...prev, specSidesCount: Number(e.target.value) || 0 }))}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: "0.74rem" }}>🍮 Regular Desserts</label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    className="form-input"
                    value={editingPkg.regDessertsCount ?? 1}
                    onChange={(e) => setEditingPkg(prev => ({ ...prev, regDessertsCount: Number(e.target.value) || 0 }))}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: "0.74rem", color: "#92400e" }}>⭐ Special Desserts</label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    className="form-input"
                    style={{ borderColor: "#f59e0b" }}
                    value={editingPkg.specDessertsCount ?? 0}
                    onChange={(e) => setEditingPkg(prev => ({ ...prev, specDessertsCount: Number(e.target.value) || 0 }))}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: "1.25rem" }}>
                <label className="form-label">Inclusions (One line per bullet) *</label>
                <textarea
                  rows={5}
                  className="form-input"
                  style={{ fontFamily: "monospace", fontSize: "0.85rem" }}
                  placeholder="7 Gourmet Main Dishes&#10;Steamed Pandan Jasmine Rice&#10;2 Premium Desserts&#10;Included Whole Roast Lechon"
                  value={editingPkg.inclusionsText}
                  onChange={(e) => setEditingPkg(prev => ({ ...prev, inclusionsText: e.target.value }))}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
                <button type="button" className="btn-secondary" onClick={() => setIsPkgModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Package
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DISH EDIT / CREATE MODAL */}
      {isDishModalOpen && editingDish && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.65)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1rem" }}>
          <div className="card-section" style={{ width: "100%", maxWidth: "520px", margin: 0, padding: "1.75rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text-primary)" }}>
                {editingDish.id ? "Edit Viand Recipe" : "Add New Viand to Menu"}
              </h3>
              <button onClick={() => setIsDishModalOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveDishSubmit}>
              <div className="form-group" style={{ marginBottom: "1rem" }}>
                <label className="form-label">Viand Category</label>
                <select
                  className="form-select"
                  value={editingDish.category}
                  onChange={(e) => setEditingDish(prev => ({ ...prev, category: e.target.value }))}
                >
                  {dishCategories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: "1rem" }}>
                <label className="form-label">Viand Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Slow-Braised USDA Angus Beef Shank"
                  className="form-input"
                  value={editingDish.name}
                  onChange={(e) => setEditingDish(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="form-group" style={{ marginBottom: "1.25rem" }}>
                <label className="form-label">Description & Preparation</label>
                <textarea
                  rows={3}
                  className="form-input"
                  placeholder="Rich spiced reduction with pearl onions and herbs..."
                  value={editingDish.description}
                  onChange={(e) => setEditingDish(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="form-group" style={{ marginBottom: "1.25rem" }}>
                <label className="form-label">Dish Tier / Classification</label>
                <select
                  className="form-select"
                  value={editingDish.tier || (editingDish.premium ? "special" : "regular")}
                  onChange={(e) => {
                    const val = e.target.value;
                    setEditingDish(prev => ({
                      ...prev,
                      tier: val,
                      premium: val === "special",
                      upgradePrice: val === "special" ? (Number(prev.upgradePrice) || 65) : 0
                    }));
                  }}
                >
                  <option value="regular">Regular Dish</option>
                  <option value="special">⭐ Special Dish (Chef Specialty)</option>
                </select>
              </div>

              {(editingDish.tier === "special" || editingDish.premium) && (
                <div className="form-group" style={{ marginBottom: "1.25rem", background: "#fffbeb", padding: "12px 14px", borderRadius: "10px", border: "1px solid #fde68a" }}>
                  <label className="form-label" style={{ color: "#92400e", fontWeight: 700, display: "flex", justifyContent: "space-between" }}>
                    <span>⭐ Additional Special Dish Upgrade (₱ per pax)</span>
                    <span style={{ fontSize: "0.85rem", color: "#b45309" }}>₱{editingDish.upgradePrice ?? 65}/pax</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="5"
                    required
                    className="form-input"
                    style={{ background: "#ffffff", borderColor: "#fcd34d", fontWeight: 700, fontSize: "1rem" }}
                    value={editingDish.upgradePrice ?? 65}
                    onChange={(e) => setEditingDish(prev => ({ ...prev, upgradePrice: e.target.value }))}
                  />
                  <div style={{ fontSize: "0.75rem", color: "#b45309", marginTop: "5px", lineHeight: "1.3" }}>
                    Configure the per-pax surcharge when a customer upgrades to this dish. Default rate is <strong>₱65/pax</strong> (e.g. Roast Beef: <strong>₱95</strong>, Native Chicken Tinu-om: <strong>₱95</strong>, Ox Tongue: <strong>₱80</strong>).
                  </div>
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
                <button type="button" className="btn-secondary" onClick={() => setIsDishModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Viand
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD-ON EDIT / CREATE MODAL */}
      {isAddonModalOpen && editingAddon && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.65)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1rem" }}>
          <div className="card-section" style={{ width: "100%", maxWidth: "520px", margin: 0, padding: "1.75rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text-primary)" }}>
                {editingAddon.id ? "Edit Live Station / Add-on" : "Add New Station / Item"}
              </h3>
              <button onClick={() => setIsAddonModalOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveAddonSubmit}>
              <div className="form-group" style={{ marginBottom: "1rem" }}>
                <label className="form-label">Station / Item Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Whole Crispy Roast Lechon (Large)"
                  className="form-input"
                  value={editingAddon.name}
                  onChange={(e) => setEditingAddon(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    className="form-select"
                    value={editingAddon.category}
                    onChange={(e) => setEditingAddon(prev => ({ ...prev, category: e.target.value }))}
                  >
                    <option value="Roast & Carving">Roast & Carving</option>
                    <option value="Food Stations">Food Stations</option>
                    <option value="Beverage Stations">Beverage Stations</option>
                    <option value="Venue Styling">Venue Styling</option>
                    <option value="Production">Production & Lights</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Price (₱) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="100"
                    className="form-input"
                    value={editingAddon.price}
                    onChange={(e) => setEditingAddon(prev => ({ ...prev, price: e.target.value }))}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: "1rem" }}>
                <label className="form-label">Serving Unit / Capacity</label>
                <input
                  type="text"
                  placeholder="e.g. approx 25-28kg (serves 65-80 pax)"
                  className="form-input"
                  value={editingAddon.unit}
                  onChange={(e) => setEditingAddon(prev => ({ ...prev, unit: e.target.value }))}
                />
              </div>

              <div className="form-group" style={{ marginBottom: "1.25rem" }}>
                <label className="form-label">Item Description</label>
                <textarea
                  rows={3}
                  className="form-input"
                  placeholder="Details of the station, chef attendants, equipment included..."
                  value={editingAddon.description}
                  onChange={(e) => setEditingAddon(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
                <button type="button" className="btn-secondary" onClick={() => setIsAddonModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Station
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
