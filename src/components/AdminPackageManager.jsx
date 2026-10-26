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
import { EVENT_TYPES, DELIVERY_LOCATIONS, getDishUpgradePrice, getPackageCourseAllowances, CONFERENCE_MEAL_RATES } from "../data/cateringData";
import { syncPlatableDishes } from "../services/backendService";
import { 
  formatBookingReference, 
  getConfirmedBookingsCountForDate, 
  MAX_CONFIRMED_BOOKINGS_PER_DAY,
  formatTime12Hour,
  getConferenceEndDate
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
  const [packageCategoryFilter, setPackageCategoryFilter] = useState("all"); // "all", "buffet", "food_tray"

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
    packageId: packages[0]?.id || "package_1",
    pax: 100,
    deliveryLocation: "iloilo_free",
    status: "Confirmed",
    notes: "",
    conferenceDays: 3,
    agencyPoNumber: ""
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
      const isFoodTray = pkg.serviceType === "food_tray" || pkg.id?.startsWith("food_tray");
      const isPica = pkg.serviceType === "pica_pica" || pkg.id?.startsWith("pica_pica");
      const isGrazing = pkg.serviceType === "grazing_table" || pkg.id?.startsWith("grazing_");
      const isPacked = pkg.serviceType === "packed_meal" || pkg.id?.startsWith("pm_") || pkg.id?.startsWith("packed_meal");
      const isPromo = pkg.serviceType === "promo" || pkg.isPromo || pkg.id?.startsWith("promo_");
      setEditingPkg({
        ...pkg,
        serviceType: pkg.serviceType || (isPromo ? "promo" : isFoodTray ? "food_tray" : isPica ? "pica_pica" : isGrazing ? "grazing_table" : isPacked ? "packed_meal" : "buffet"),
        price: pkg.price !== undefined ? pkg.price : "",
        paxRange: pkg.paxRange || "",
        promoStartDate: pkg.promoStartDate || "2026-09-30",
        promoEndDate: pkg.promoEndDate || "2026-12-31",
        promoIsActive: pkg.promoIsActive !== undefined ? pkg.promoIsActive : true,
        mainDishesCount: allowances.mainDishesCount,
        regSidesCount: allowances.regSidesCount,
        specSidesCount: allowances.specSidesCount,
        regDessertsCount: allowances.regDessertsCount,
        specDessertsCount: allowances.specDessertsCount,
        slidersCount: allowances.slidersCount || pkg.picaAllowances?.sliders || pkg.grazingAllowances?.sliders || 2,
        canapesCount: allowances.canapesCount || pkg.picaAllowances?.canapes || pkg.grazingAllowances?.canapes || 5,
        fingerFoodCount: allowances.fingerFoodCount || pkg.picaAllowances?.fingerFood || 2,
        miniDessertsCount: allowances.miniDessertsCount || pkg.picaAllowances?.miniDesserts || 2,
        hasKakanin: Boolean(allowances.hasKakanin || pkg.picaAllowances?.hasKakanin),
        hasDiyStation: Boolean(allowances.hasDiyStation || pkg.picaAllowances?.hasDiyStation),
        hasDessertShots: Boolean(allowances.hasDessertShots || pkg.grazingAllowances?.hasDessertShots),
        inclusionsText: (pkg.inclusions || []).join("\n")
      });
    } else {
      const isTrayDefault = packageCategoryFilter === "food_tray";
      const isPicaDefault = packageCategoryFilter === "pica_pica";
      const isGrazingDefault = packageCategoryFilter === "grazing_table";
      const isPackedDefault = packageCategoryFilter === "packed_meal";
      const isPromoDefault = packageCategoryFilter === "promo";
      const defaultType = isPromoDefault ? "promo" : isTrayDefault ? "food_tray" : isPicaDefault ? "pica_pica" : isGrazingDefault ? "grazing_table" : isPackedDefault ? "packed_meal" : "buffet";
      setEditingPkg({
        id: "",
        serviceType: defaultType,
        name: "",
        subtitle: "",
        badge: isPromoDefault ? "🎄 Bermonths Promo" : isTrayDefault ? "Party Food Tray" : isPicaDefault ? "Pica Pica Station" : isGrazingDefault ? "Grazing Table" : isPackedDefault ? "Packed Meal Bento" : "Custom Package",
        popular: isPromoDefault,
        price: isPromoDefault ? 20000 : (isTrayDefault ? 7500 : (isGrazingDefault ? 85000 : "")),
        pricePerPax: isPromoDefault ? 400 : (isTrayDefault ? 500 : isPicaDefault ? 350 : (isGrazingDefault ? 567 : isPackedDefault ? 199 : 650)),
        minPax: isTrayDefault ? 10 : (isGrazingDefault ? 100 : 50),
        maxPax: isTrayDefault ? 15 : isGrazingDefault ? 150 : undefined,
        paxRange: isPromoDefault ? "Good for 50 PAX" : (isTrayDefault ? "10-15 PAX" : isPicaDefault ? "50 PAX Min" : isGrazingDefault ? "100-150 PAX" : (isPackedDefault ? "Min 50 PAX" : "")),
        promoStartDate: "2026-09-30",
        promoEndDate: "2026-12-31",
        promoIsActive: true,
        mainDishesCount: isPromoDefault ? 2 : ((isTrayDefault || isPicaDefault || isGrazingDefault || isPackedDefault) ? (isTrayDefault ? 3 : isPackedDefault ? 1 : 0) : 5),
        regSidesCount: isPromoDefault ? 1 : (isTrayDefault ? 2 : 1),
        specSidesCount: 0,
        regDessertsCount: isPromoDefault ? 1 : (isTrayDefault ? 0 : 1),
        specDessertsCount: 0,
        slidersCount: isGrazingDefault ? 4 : 2,
        canapesCount: 5,
        fingerFoodCount: 2,
        miniDessertsCount: 2,
        hasKakanin: false,
        hasDiyStation: false,
        hasDessertShots: false,
        courses: { beef: 1, pork: 1, chicken: 1, noodlesOrVeg: 1, rice: 1, dessert: 1, drinks: 1 },
        inclusionsText: isPromoDefault
          ? "2 Regular Main Dishes (Beef, Pork, Chicken, Seafood)\n1 Regular Side (Pasta, Noodles, or Veg)\n1 Regular Dessert (Filipino Dessert)\nHot Soup (Cream of Corn, Mushroom, Pumpkin, Sotanghon Broth)\nSteamed Pandan Jasmine Rice\nSoda or Fruit Juice\nRustic Buffet Table Setup & Styling\nTables and chairs for guests with table skirting, chair cover, centerpiece, fine dining setup\nFree transportation: Iloilo City, Cabatuan, Sta. Barbara, Pavia, San Miguel, Janiuay, Maasin\nFriendly uniformed servers/waitstaff (4hrs full catering service)\nComplimentary service water"
          : isPicaDefault
          ? "2 Sliders\n5 Canapés\n2 Finger Food\n2 Mini Dessert Cups\nChoice of: Juice or Coffee\nLive cocktail food station setup\nMinimum booking: 50 PAX"
          : isGrazingDefault
          ? "5 Kilos Italian Cured Meats\n5 Types of Imported Cheeses\n5 Seasonal Fruit Platters\n5 Canapés, 4 Sliders\nMix Nuts, Crackers, Bretzels\nGrazing Cups & Nachos Station\nArtisan Breadbasket with Jams"
          : isTrayDefault
          ? "3 Regular Main Dishes\n2 Regular Side Dishes\nFood-grade aluminum party food trays with secure lids\nFree delivery: Iloilo City, Pavia, Sta. Barbara, Cabatuan, Maasin, San Miguel, Janiuay\n50% downpayment upon booking, balance upon delivery"
          : "5 Main Dishes\nSteamed Pandan Jasmine Rice\n1 Filipino Dessert\nBottomless Iced Tea\nStandard Catering Setup"
      });
    }
    setIsPkgModalOpen(true);
  };

  const handleSavePkgSubmit = async (e) => {
    e.preventDefault();
    if (!editingPkg.name) return;

    const inclusions = editingPkg.inclusionsText
      ? editingPkg.inclusionsText.split("\n").map(s => s.trim()).filter(Boolean)
      : [];

    const isFoodTray = editingPkg.serviceType === "food_tray" || editingPkg.id?.startsWith("food_tray");
    const isPicaPica = editingPkg.serviceType === "pica_pica" || editingPkg.id?.startsWith("pica_pica");
    const isGrazing = editingPkg.serviceType === "grazing_table" || editingPkg.id?.startsWith("grazing_");
    const isPacked = editingPkg.serviceType === "packed_meal" || editingPkg.id?.startsWith("pm_") || editingPkg.id?.startsWith("packed_meal");
    const isPromo = editingPkg.serviceType === "promo" || editingPkg.isPromo || editingPkg.id?.startsWith("promo_");
    const parsedFixedPrice = editingPkg.price !== "" && editingPkg.price !== undefined ? Number(editingPkg.price) : undefined;
    const parsedPricePerPax = Number(editingPkg.pricePerPax) || (parsedFixedPrice && editingPkg.minPax ? Math.round(parsedFixedPrice / editingPkg.minPax) : 0);

    const picaAllowances = isPicaPica ? {
      sliders: Number(editingPkg.slidersCount) || 2,
      canapes: Number(editingPkg.canapesCount) || 5,
      fingerFood: Number(editingPkg.fingerFoodCount) || 2,
      miniDesserts: Number(editingPkg.miniDessertsCount) || 2,
      hasKakanin: Boolean(editingPkg.hasKakanin),
      hasDiyStation: Boolean(editingPkg.hasDiyStation),
      drinks: 1
    } : undefined;

    const grazingAllowances = isGrazing ? {
      canapes: Number(editingPkg.canapesCount) || 5,
      sliders: Number(editingPkg.slidersCount) || 4,
      hasDessertShots: Boolean(editingPkg.hasDessertShots)
    } : undefined;

    await onSavePackage({
      ...editingPkg,
      serviceType: editingPkg.serviceType || (isPromo ? "promo" : isFoodTray ? "food_tray" : isPicaPica ? "pica_pica" : isGrazing ? "grazing_table" : isPacked ? "packed_meal" : "buffet"),
      isPromo: isPromo,
      promoStartDate: editingPkg.promoStartDate || "2026-09-30",
      promoEndDate: editingPkg.promoEndDate || "2026-12-31",
      promoIsActive: editingPkg.promoIsActive !== undefined ? editingPkg.promoIsActive : true,
      price: parsedFixedPrice,
      paxRange: editingPkg.paxRange || undefined,
      inclusions,
      picaAllowances,
      grazingAllowances,
      mainDishesCount: (isPicaPica || isGrazing) ? 0 : (Number(editingPkg.mainDishesCount) || (isPromo ? 2 : (isPacked ? 1 : (isFoodTray ? 3 : 5)))),
      sideDishes: {
        regular: (isPicaPica || isGrazing) ? 0 : (Number(editingPkg.regSidesCount) ?? (isPromo ? 1 : (isFoodTray ? 2 : 1))),
        special: (isPicaPica || isGrazing) ? 0 : (Number(editingPkg.specSidesCount) ?? 0)
      },
      desserts: {
        regular: (isPicaPica || isGrazing) ? 0 : (Number(editingPkg.regDessertsCount) ?? (isFoodTray ? 0 : 1)),
        special: (isPicaPica || isGrazing) ? 0 : (Number(editingPkg.specDessertsCount) ?? 0)
      },
      pricePerPax: parsedPricePerPax,
      minPax: Number(editingPkg.minPax) || (isFoodTray ? 10 : (isPicaPica ? 50 : (isGrazing ? 100 : 50))),
      maxPax: editingPkg.maxPax ? Number(editingPkg.maxPax) : undefined
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
    const isConf = directBooking.eventType === "government_conference";
    const confDays = isConf ? Math.max(1, Number(directBooking.conferenceDays || 3)) : 1;
    const pkg = packages.find(p => p.id === directBooking.packageId) || packages[0];
    const paxNum = Number(directBooking.pax) || 100;
    const foodTotal = isConf 
      ? (paxNum * (CONFERENCE_MEAL_RATES?.dailyTotal || 1290) * confDays)
      : (paxNum * (pkg.pricePerPax || 0));

    const delivery = DELIVERY_LOCATIONS.find(d => d.id === directBooking.deliveryLocation) || DELIVERY_LOCATIONS[0];
    const deliveryFee = (delivery.fee || 0) * (isConf ? confDays : 1);
    const subtotal = foodTotal + deliveryFee;
    const serviceCharge = Math.round(subtotal * 0.1);
    const grandTotal = subtotal + serviceCharge;
    const downpaymentRequired = isConf ? 0 : Math.round(grandTotal * 0.5);

    const eventTypeObj = EVENT_TYPES.find(t => t.id === directBooking.eventType);

    const newBooking = {
      id: "BK-" + new Date().getFullYear() + "-" + Math.floor(1000 + Math.random() * 9000),
      createdAt: new Date().toISOString(),
      status: directBooking.status,
      clientName: directBooking.clientName,
      contactNumber: directBooking.contactNumber,
      email: directBooking.email,
      isConferenceBooking: isConf,
      conferenceDays: confDays,
      conferenceEndDate: isConf ? getConferenceEndDate(directBooking.eventDate, confDays) : directBooking.eventDate,
      agencyPoNumber: directBooking.agencyPoNumber || "",
      eventType: directBooking.eventType,
      eventTypeName: isConf ? `Government / Multi-Day Conference (${confDays} Days Full-Board)` : (eventTypeObj ? eventTypeObj.name : "Celebration"),
      eventDate: directBooking.eventDate,
      eventTime: directBooking.eventTime,
      venueName: directBooking.venueName || "Client Venue",
      venueAddress: directBooking.venueAddress || "Metro Manila",
      isFoodTray: pkg.serviceType === "food_tray" || pkg.id?.startsWith("food_tray"),
      isPicaPica: pkg.serviceType === "pica_pica" || pkg.id?.startsWith("pica_pica"),
      isGrazingTable: pkg.serviceType === "grazing_table" || pkg.id?.startsWith("grazing_"),
      serviceType: pkg.serviceType || (pkg.id?.startsWith("food_tray") ? "food_tray" : pkg.id?.startsWith("pica_pica") ? "pica_pica" : pkg.id?.startsWith("grazing_") ? "grazing_table" : "buffet"),
      packagePrice: pkg.price || null,
      paxRange: pkg.paxRange || null,
      packageId: isConf ? "gov_conference_full_board" : pkg.id,
      packageName: isConf ? `Government Full-Board Conference (${confDays} Days • 4 Meals/Day)` : pkg.name,
      pax: paxNum,
      pricePerPax: isConf ? (CONFERENCE_MEAL_RATES?.dailyTotal || 1290) : pkg.pricePerPax,
      foodTotal,
      dishes: isConf ? [
        "AM Snack: Sandwich + Drink (₱120/pax)",
        "Lunch Buffet: Package 1 - 3 Mains, 1 Side, Rice, Dessert, Beverage (₱480/pax)",
        "PM Snack: Pasta + Drink (₱140/pax)",
        "Dinner Buffet: Package 2 - 4 Mains, 1 Side, Rice, Dessert, Beverage (₱550/pax)"
      ] : (pkg.inclusions || []).slice(0, 5),
      selectedAddons: [],
      addonsTotal: 0,
      deliveryLocation: directBooking.deliveryLocation,
      deliveryFee,
      subtotal,
      serviceChargePercent: 10,
      serviceCharge,
      isVatEnabled: false,
      vatAmount: 0,
      discountAmount: 0,
      grandTotal,
      downpaymentRequired,
      balanceDue: isConf ? grandTotal : ((directBooking.status === "Confirmed" || directBooking.status === "Ongoing") ? downpaymentRequired : grandTotal),
      notes: directBooking.notes || (isConf ? "Government Conference booking backed by Agency PO / LDDAP-ADA." : "Direct booking recorded via Admin Portal."),
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
    { id: "drinks", name: "Inumin (Beverages)" },
    { id: "sliders", name: "🍔 Sliders (Pica & Grazing)" },
    { id: "canapes", name: "🥖 Canapés (Pica & Grazing)" },
    { id: "fingerFood", name: "🍟 Finger Food" },
    { id: "miniDesserts", name: "🍮 Mini Desserts" }
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

          {/* Service Type Filter Pills */}
          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem", flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-secondary)", marginRight: "0.25rem" }}>
              Filter Service:
            </span>
            <button
              type="button"
              onClick={() => setPackageCategoryFilter("all")}
              style={{
                padding: "0.4rem 0.85rem",
                borderRadius: "20px",
                border: packageCategoryFilter === "all" ? "1.5px solid var(--gold-600)" : "1px solid var(--border-subtle)",
                background: packageCategoryFilter === "all" ? "var(--gold-50)" : "#ffffff",
                color: packageCategoryFilter === "all" ? "var(--gold-700)" : "var(--text-secondary)",
                fontWeight: packageCategoryFilter === "all" ? 700 : 500,
                fontSize: "0.82rem",
                cursor: "pointer"
              }}
            >
              All Packages ({packages.length})
            </button>
            <button
              type="button"
              onClick={() => setPackageCategoryFilter("buffet")}
              style={{
                padding: "0.4rem 0.85rem",
                borderRadius: "20px",
                border: packageCategoryFilter === "buffet" ? "1.5px solid var(--gold-600)" : "1px solid var(--border-subtle)",
                background: packageCategoryFilter === "buffet" ? "var(--gold-50)" : "#ffffff",
                color: packageCategoryFilter === "buffet" ? "var(--gold-700)" : "var(--text-secondary)",
                fontWeight: packageCategoryFilter === "buffet" ? 700 : 500,
                fontSize: "0.82rem",
                cursor: "pointer"
              }}
            >
              🍽️ Buffet Catering ({packages.filter(p => p.serviceType === "buffet" || (!p.serviceType && !p.id?.startsWith("food_tray") && !p.id?.startsWith("pica_") && !p.id?.startsWith("grazing_"))).length})
            </button>
            <button
              type="button"
              onClick={() => setPackageCategoryFilter("food_tray")}
              style={{
                padding: "0.4rem 0.85rem",
                borderRadius: "20px",
                border: packageCategoryFilter === "food_tray" ? "1.5px solid var(--gold-600)" : "1px solid var(--border-subtle)",
                background: packageCategoryFilter === "food_tray" ? "var(--gold-50)" : "#ffffff",
                color: packageCategoryFilter === "food_tray" ? "var(--gold-700)" : "var(--text-secondary)",
                fontWeight: packageCategoryFilter === "food_tray" ? 700 : 500,
                fontSize: "0.82rem",
                cursor: "pointer"
              }}
            >
              🍱 Food Tray Packages ({packages.filter(p => p.serviceType === "food_tray" || p.id?.startsWith("food_tray")).length})
            </button>
            <button
              type="button"
              onClick={() => setPackageCategoryFilter("pica_pica")}
              style={{
                padding: "0.4rem 0.85rem",
                borderRadius: "20px",
                border: packageCategoryFilter === "pica_pica" ? "1.5px solid var(--gold-600)" : "1px solid var(--border-subtle)",
                background: packageCategoryFilter === "pica_pica" ? "var(--gold-50)" : "#ffffff",
                color: packageCategoryFilter === "pica_pica" ? "var(--gold-700)" : "var(--text-secondary)",
                fontWeight: packageCategoryFilter === "pica_pica" ? 700 : 500,
                fontSize: "0.82rem",
                cursor: "pointer"
              }}
            >
              🍢 Pica Pica Station ({packages.filter(p => p.serviceType === "pica_pica" || p.id?.startsWith("pica_pica")).length})
            </button>
            <button
              type="button"
              onClick={() => setPackageCategoryFilter("grazing_table")}
              style={{
                padding: "0.4rem 0.85rem",
                borderRadius: "20px",
                border: packageCategoryFilter === "grazing_table" ? "1.5px solid var(--gold-600)" : "1px solid var(--border-subtle)",
                background: packageCategoryFilter === "grazing_table" ? "var(--gold-50)" : "#ffffff",
                color: packageCategoryFilter === "grazing_table" ? "var(--gold-700)" : "var(--text-secondary)",
                fontWeight: packageCategoryFilter === "grazing_table" ? 700 : 500,
                fontSize: "0.82rem",
                cursor: "pointer"
              }}
            >
              🧀 Grazing Table ({packages.filter(p => p.serviceType === "grazing_table" || p.id?.startsWith("grazing_")).length})
            </button>
            <button
              type="button"
              onClick={() => setPackageCategoryFilter("packed_meal")}
              style={{
                padding: "0.4rem 0.85rem",
                borderRadius: "20px",
                border: packageCategoryFilter === "packed_meal" ? "1.5px solid var(--gold-600)" : "1px solid var(--border-subtle)",
                background: packageCategoryFilter === "packed_meal" ? "var(--gold-50)" : "#ffffff",
                color: packageCategoryFilter === "packed_meal" ? "var(--gold-700)" : "var(--text-secondary)",
                fontWeight: packageCategoryFilter === "packed_meal" ? 700 : 500,
                fontSize: "0.82rem",
                cursor: "pointer"
              }}
            >
              🍱 Packed Meals ({packages.filter(p => p.serviceType === "packed_meal" || p.id?.startsWith("pm_") || p.id?.startsWith("packed_meal")).length})
            </button>
            <button
              type="button"
              onClick={() => setPackageCategoryFilter("promo")}
              style={{
                padding: "0.4rem 0.85rem",
                borderRadius: "20px",
                border: packageCategoryFilter === "promo" ? "1.5px solid #dc2626" : "1px solid var(--border-subtle)",
                background: packageCategoryFilter === "promo" ? "#fef2f2" : "#ffffff",
                color: packageCategoryFilter === "promo" ? "#b91c1c" : "var(--text-secondary)",
                fontWeight: packageCategoryFilter === "promo" ? 700 : 500,
                fontSize: "0.82rem",
                cursor: "pointer"
              }}
            >
              🎄 Promos ({packages.filter(p => p.serviceType === "promo" || p.isPromo || p.id?.startsWith("promo_")).length})
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "1.25rem" }}>
            {packages
              .filter(pkg => {
                const isTray = pkg.serviceType === "food_tray" || pkg.id?.startsWith("food_tray");
                const isPica = pkg.serviceType === "pica_pica" || pkg.id?.startsWith("pica_pica");
                const isGrazing = pkg.serviceType === "grazing_table" || pkg.id?.startsWith("grazing_");
                const isPacked = pkg.serviceType === "packed_meal" || pkg.id?.startsWith("pm_") || pkg.id?.startsWith("packed_meal");
                const isPromo = pkg.serviceType === "promo" || pkg.isPromo || pkg.id?.startsWith("promo_");
                if (packageCategoryFilter === "buffet") return !isTray && !isPica && !isGrazing && !isPacked && !isPromo;
                if (packageCategoryFilter === "food_tray") return isTray;
                if (packageCategoryFilter === "pica_pica") return isPica;
                if (packageCategoryFilter === "grazing_table") return isGrazing;
                if (packageCategoryFilter === "packed_meal") return isPacked;
                if (packageCategoryFilter === "promo") return isPromo;
                return true;
              })
              .map((pkg) => {
                const isTray = pkg.serviceType === "food_tray" || pkg.id?.startsWith("food_tray");
                const isPica = pkg.serviceType === "pica_pica" || pkg.id?.startsWith("pica_pica");
                const isGrazing = pkg.serviceType === "grazing_table" || pkg.id?.startsWith("grazing_");
                const isPacked = pkg.serviceType === "packed_meal" || pkg.id?.startsWith("pm_") || pkg.id?.startsWith("packed_meal");
                const isPromo = pkg.serviceType === "promo" || pkg.isPromo || pkg.id?.startsWith("promo_");
                const isPremiere = !isTray && !isPica && !isGrazing && !isPacked && !isPromo && (pkg.id === "royal_premiere" || (pkg.pricePerPax >= 850 && pkg.minPax >= 70));
                const startingCost = pkg.price 
                  ? pkg.price 
                  : (pkg.pricePerPax || 0) * (pkg.minPax || (isTray ? 10 : (isPica ? 50 : (isGrazing ? 100 : 50))));
                const allowances = getPackageCourseAllowances(pkg);

                const badgeBg = isPromo ? "#fef2f2" : isTray ? "#fffbeb" : isPica ? "#f0fdf4" : isGrazing ? "#fef3c7" : isPacked ? "#fff7ed" : undefined;
                const badgeColor = isPromo ? "#dc2626" : isTray ? "#b45309" : isPica ? "#166534" : isGrazing ? "#92400e" : isPacked ? "#c2410c" : undefined;
                const badgeBorder = isPromo ? "#fca5a5" : isTray ? "#fde68a" : isPica ? "#bbf7d0" : isGrazing ? "#fcd34d" : undefined;

                return (
                  <div 
                    key={pkg.id} 
                    className="card-section" 
                    style={{ 
                      position: "relative",
                      marginBottom: 0, 
                      border: isPromo ? "2px solid #ef4444" : isPremiere ? "2px solid var(--gold-400)" : isTray ? "1.5px solid #d97706" : isPica ? "1.5px solid #16a34a" : isGrazing ? "1.5px solid #d97706" : "1px solid var(--border-subtle)",
                      boxShadow: isPromo ? "0 4px 14px rgba(239, 68, 68, 0.15)" : isPremiere ? "var(--shadow-gold)" : (isTray || isPica || isGrazing) ? "0 4px 12px rgba(217, 119, 6, 0.08)" : "var(--shadow-sm)"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                      <span className="pkg-badge" style={{ position: "static", marginBottom: "0.25rem", background: badgeBg, color: badgeColor, borderColor: badgeBorder }}>
                        {isPromo ? (pkg.badge || "🎄 Bermonths Promo") : isTray ? (pkg.badge || "🍱 Food Tray") : isPica ? (pkg.badge || "🍢 Pica Pica") : isGrazing ? (pkg.badge || "🧀 Grazing Table") : (pkg.badge || "Standard Tier")}
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
                        <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>
                          {(isTray || isGrazing) && pkg.price ? "Package Price" : "Rate Per Pax"}
                        </div>
                        <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--gold-600)" }}>
                          ₱{((isTray || isGrazing) && pkg.price ? pkg.price : (pkg.pricePerPax || 0)).toLocaleString()}
                          {(!pkg.price || (!isTray && !isGrazing)) && <span style={{ fontSize: "0.75rem", fontWeight: 500, color: "var(--text-muted)" }}>/pax</span>}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>
                          {(isTray || isGrazing) ? "Serving Capacity" : "Starting Package Min"}
                        </div>
                        <div style={{ fontSize: "1.1rem", fontWeight: 700, color: isPremiere ? "var(--emerald-600)" : "var(--text-primary)" }}>
                          {pkg.paxRange ? (
                            pkg.paxRange
                          ) : (
                            <>
                              ₱{startingCost.toLocaleString()}
                              <span style={{ fontSize: "0.75rem", fontWeight: 500, color: "var(--text-muted)" }}> ({pkg.minPax} pax)</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Allowances summary badge */}
                    <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
                      {isPica ? (
                        <>
                          <span style={{ fontSize: "0.72rem", background: "#fef3c7", color: "#b45309", padding: "2px 8px", borderRadius: "12px", fontWeight: 600 }}>
                            🍔 {allowances.slidersCount || 2} Sliders
                          </span>
                          <span style={{ fontSize: "0.72rem", background: "#f0fdf4", color: "#166534", padding: "2px 8px", borderRadius: "12px", fontWeight: 600 }}>
                            🥖 {allowances.canapesCount || 5} Canapés
                          </span>
                          <span style={{ fontSize: "0.72rem", background: "#fdf2f8", color: "#9d174d", padding: "2px 8px", borderRadius: "12px", fontWeight: 600 }}>
                            🍟 {allowances.fingerFoodCount || 2} Finger Food
                          </span>
                          <span style={{ fontSize: "0.72rem", background: "#eff6ff", color: "#1e40af", padding: "2px 8px", borderRadius: "12px", fontWeight: 600 }}>
                            🍮 {allowances.miniDessertsCount || 2} Desserts
                          </span>
                          {allowances.hasDiyStation && (
                            <span style={{ fontSize: "0.72rem", background: "#faf5ff", color: "#6b21a8", padding: "2px 8px", borderRadius: "12px", fontWeight: 600 }}>
                              🍩 DIY Live Station
                            </span>
                          )}
                        </>
                      ) : isGrazing ? (
                        <>
                          <span style={{ fontSize: "0.72rem", background: "#fef3c7", color: "#b45309", padding: "2px 8px", borderRadius: "12px", fontWeight: 600 }}>
                            🥖 {allowances.canapesCount || 5} Canapés
                          </span>
                          <span style={{ fontSize: "0.72rem", background: "#f0fdf4", color: "#166534", padding: "2px 8px", borderRadius: "12px", fontWeight: 600 }}>
                            🍔 {allowances.slidersCount || 4} Sliders
                          </span>
                          <span style={{ fontSize: "0.72rem", background: "#fdf2f8", color: "#9d174d", padding: "2px 8px", borderRadius: "12px", fontWeight: 600 }}>
                            🧀 Cured Meats & Cheeses
                          </span>
                          <span style={{ fontSize: "0.72rem", background: "#eff6ff", color: "#1e40af", padding: "2px 8px", borderRadius: "12px", fontWeight: 600 }}>
                            🌮 Nacho Station & Cups
                          </span>
                        </>
                      ) : (
                        <>
                          <span style={{ fontSize: "0.72rem", background: "var(--gold-50)", color: "var(--gold-700)", padding: "2px 8px", borderRadius: "12px", fontWeight: 600 }}>
                            🍛 {allowances.mainDishesCount} {allowances.mainDishesCount === 1 ? "Regular Main" : "Main Dishes"}
                          </span>
                          {allowances.regSidesCount > 0 && (
                            <span style={{ fontSize: "0.72rem", background: "#f0fdf4", color: "#166534", padding: "2px 8px", borderRadius: "12px", fontWeight: 600 }}>
                              🥗 {allowances.regSidesCount} Side{allowances.regSidesCount > 1 ? "s" : ""}
                            </span>
                          )}
                          {allowances.regDessertsCount > 0 && (
                            <span style={{ fontSize: "0.72rem", background: "#fdf2f8", color: "#9d174d", padding: "2px 8px", borderRadius: "12px", fontWeight: 600 }}>
                              🍮 {allowances.regDessertsCount} Dessert{allowances.regDessertsCount > 1 ? "s" : ""}
                            </span>
                          )}
                        </>
                      )}
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

              {directBooking.eventType === "government_conference" && (
                <div style={{
                  background: "#f0fdf4",
                  border: "1.5px solid #86efac",
                  borderRadius: "8px",
                  padding: "1rem",
                  marginBottom: "1rem"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "1.2rem" }}>🏛️</span>
                    <strong style={{ color: "#166534", fontSize: "0.95rem" }}>Government Multi-Day Full-Board Conference Mode</strong>
                    <span style={{ fontSize: "0.75rem", background: "#dcfce7", color: "#15803d", padding: "2px 8px", borderRadius: "12px", fontWeight: 700 }}>
                      0% Advance Deposit (COA / RA 9184)
                    </span>
                  </div>
                  <p style={{ fontSize: "0.8rem", color: "#166534", margin: 0, lineHeight: 1.5 }}>
                    Full-board meal rate: <strong>₱1,290 / pax / day</strong> (AM Snack + Lunch Package 1 + PM Snack + Dinner Package 2). Settled Net 30/45 Days via LandBank LDDAP-ADA.
                  </p>
                  
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "0.75rem" }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: "0.8rem" }}>Conference Duration (Days) *</label>
                      <input
                        type="number"
                        min="1"
                        max="14"
                        className="form-input"
                        value={directBooking.conferenceDays || 3}
                        onChange={(e) => setDirectBooking(prev => ({ ...prev, conferenceDays: Math.max(1, Number(e.target.value)) }))}
                      />
                      {directBooking.eventDate && (
                        <span style={{ fontSize: "0.72rem", color: "#15803d", marginTop: "3px", display: "block" }}>
                          📅 Coverage: <strong>{directBooking.eventDate}</strong> to <strong>{getConferenceEndDate(directBooking.eventDate, directBooking.conferenceDays || 3)}</strong>
                        </span>
                      )}
                    </div>
                    
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: "0.8rem" }}>Agency Purchase Order (PO) / PR Ref #</label>
                      <input
                        type="text"
                        placeholder="e.g. PO-2026-DEPED-0892"
                        className="form-input"
                        value={directBooking.agencyPoNumber || ""}
                        onChange={(e) => setDirectBooking(prev => ({ ...prev, agencyPoNumber: e.target.value }))}
                      />
                      <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "3px", display: "block" }}>
                        Audited reference for billing invoice & disbursement
                      </span>
                    </div>
                  </div>
                </div>
              )}

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
                  <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "3px", display: "block" }}>
                    Serving: <strong>{formatTime12Hour(directBooking.eventTime)}</strong>
                  </span>
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
                  {directBooking.eventType === "government_conference" ? (
                    <div style={{
                      padding: "0.6rem 0.85rem",
                      background: "var(--bg-subtle, #f8fafc)",
                      border: "1.5px solid #86efac",
                      borderRadius: "6px",
                      fontSize: "0.85rem",
                      color: "#166534",
                      fontWeight: 600
                    }}>
                      🏛️ Government Full-Board Conference Package (₱1,290/pax/day • 4 Meals/Day)
                    </div>
                  ) : (
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
                  )}
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
              {/* Service Type Selection */}
              <div style={{ marginBottom: "1.25rem" }}>
                <label className="form-label">Service Type *</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(105px, 1fr))", gap: "0.5rem" }}>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingPkg(prev => ({
                        ...prev,
                        serviceType: "buffet",
                        badge: prev.badge?.includes("Tray") || prev.badge?.includes("Pica") || prev.badge?.includes("Grazing") || prev.badge?.includes("PM") ? "Standard Tier" : prev.badge,
                        minPax: Math.max(20, prev.minPax || 50),
                        mainDishesCount: Math.max(3, prev.mainDishesCount || 5),
                        regSidesCount: prev.regSidesCount ?? 1,
                        regDessertsCount: prev.regDessertsCount ?? 1
                      }));
                    }}
                    style={{
                      padding: "0.6rem 0.4rem",
                      borderRadius: "8px",
                      border: editingPkg.serviceType === "buffet" ? "2px solid var(--gold-600)" : "1px solid var(--border-subtle)",
                      background: editingPkg.serviceType === "buffet" ? "var(--gold-50)" : "#ffffff",
                      color: editingPkg.serviceType === "buffet" ? "var(--gold-800)" : "var(--text-secondary)",
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.35rem",
                      fontSize: "0.78rem"
                    }}
                  >
                    🍽️ Buffet
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingPkg(prev => ({
                        ...prev,
                        serviceType: "food_tray",
                        badge: "Party Food Tray",
                        price: prev.price || 7500,
                        paxRange: prev.paxRange || "10-15 PAX",
                        minPax: prev.minPax <= 20 ? prev.minPax : 10,
                        mainDishesCount: prev.mainDishesCount || 3,
                        regSidesCount: prev.regSidesCount !== undefined ? prev.regSidesCount : 2,
                        regDessertsCount: 0
                      }));
                    }}
                    style={{
                      padding: "0.6rem 0.4rem",
                      borderRadius: "8px",
                      border: editingPkg.serviceType === "food_tray" ? "2px solid var(--gold-600)" : "1px solid var(--border-subtle)",
                      background: editingPkg.serviceType === "food_tray" ? "var(--gold-50)" : "#ffffff",
                      color: editingPkg.serviceType === "food_tray" ? "var(--gold-800)" : "var(--text-secondary)",
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.35rem",
                      fontSize: "0.78rem"
                    }}
                  >
                    🍱 Food Tray
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingPkg(prev => ({
                        ...prev,
                        serviceType: "pica_pica",
                        badge: "Cocktail Station",
                        pricePerPax: 350,
                        minPax: 50,
                        picaAllowances: prev.picaAllowances || { sliders: 3, canapes: 5, fingerFood: 3, miniDesserts: 2, hasKakanin: false, hasDiyStation: false }
                      }));
                    }}
                    style={{
                      padding: "0.6rem 0.4rem",
                      borderRadius: "8px",
                      border: editingPkg.serviceType === "pica_pica" ? "2px solid #047857" : "1px solid var(--border-subtle)",
                      background: editingPkg.serviceType === "pica_pica" ? "#ecfdf5" : "#ffffff",
                      color: editingPkg.serviceType === "pica_pica" ? "#065f46" : "var(--text-secondary)",
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.35rem",
                      fontSize: "0.78rem"
                    }}
                  >
                    🍢 Pica Pica
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingPkg(prev => ({
                        ...prev,
                        serviceType: "grazing_table",
                        badge: "Artisan Deluxe",
                        price: 85000,
                        pricePerPax: 850,
                        minPax: 100,
                        maxPax: 150,
                        paxRange: "100-150 PAX",
                        grazingAllowances: prev.grazingAllowances || { canapes: 5, sliders: 4, hasDessertShots: false }
                      }));
                    }}
                    style={{
                      padding: "0.6rem 0.4rem",
                      borderRadius: "8px",
                      border: editingPkg.serviceType === "grazing_table" ? "2px solid #7c3aed" : "1px solid var(--border-subtle)",
                      background: editingPkg.serviceType === "grazing_table" ? "#f5f3ff" : "#ffffff",
                      color: editingPkg.serviceType === "grazing_table" ? "#5b21b6" : "var(--text-secondary)",
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.35rem",
                      fontSize: "0.78rem"
                    }}
                  >
                    🧀 Grazing Table
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingPkg(prev => ({
                        ...prev,
                        serviceType: "packed_meal",
                        badge: "Min 50 PAX",
                        pricePerPax: 175,
                        minPax: 50,
                        mainDishesCount: 1,
                        regSidesCount: 1,
                        specSidesCount: 0,
                        regDessertsCount: 0,
                        specDessertsCount: 0
                      }));
                    }}
                    style={{
                      padding: "0.6rem 0.4rem",
                      borderRadius: "8px",
                      border: editingPkg.serviceType === "packed_meal" ? "2px solid #ea580c" : "1px solid var(--border-subtle)",
                      background: editingPkg.serviceType === "packed_meal" ? "#fff7ed" : "#ffffff",
                      color: editingPkg.serviceType === "packed_meal" ? "#c2410c" : "var(--text-secondary)",
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.35rem",
                      fontSize: "0.78rem"
                    }}
                  >
                    🍱 Packed Meal
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingPkg(prev => ({
                        ...prev,
                        serviceType: "promo",
                        badge: "🎄 Bermonths Promo",
                        price: 20000,
                        pricePerPax: 400,
                        minPax: 50,
                        paxRange: "Good for 50 PAX",
                        promoStartDate: prev.promoStartDate || "2026-09-30",
                        promoEndDate: prev.promoEndDate || "2026-12-31",
                        promoIsActive: prev.promoIsActive !== undefined ? prev.promoIsActive : true,
                        mainDishesCount: 2,
                        regSidesCount: 1,
                        specSidesCount: 0,
                        regDessertsCount: 1,
                        specDessertsCount: 0
                      }));
                    }}
                    style={{
                      padding: "0.6rem 0.4rem",
                      borderRadius: "8px",
                      border: editingPkg.serviceType === "promo" ? "2px solid #dc2626" : "1px solid var(--border-subtle)",
                      background: editingPkg.serviceType === "promo" ? "#fef2f2" : "#ffffff",
                      color: editingPkg.serviceType === "promo" ? "#b91c1c" : "var(--text-secondary)",
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.35rem",
                      fontSize: "0.78rem"
                    }}
                  >
                    🎄 Promo
                  </button>
                </div>
              </div>

              {/* Quick Template Presets */}
              <div style={{ marginBottom: "1.25rem", background: "var(--surface-sunken)", padding: "0.75rem", borderRadius: "8px" }}>
                <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "0.4rem" }}>
                  QUICK PRESETS / TEMPLATES:
                </div>
                <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                  {/* Pica Pica Presets */}
                  <button
                    type="button"
                    onClick={() => {
                      setEditingPkg(prev => ({
                        ...prev,
                        serviceType: "pica_pica",
                        name: "Petite Package (Pica Pica / Grazing)",
                        subtitle: "3 Kilos Cured Meats, 3 Cheeses, 3 Fruit Platters, 3 Canapés & 2 Sliders",
                        price: 25000,
                        pricePerPax: 500,
                        minPax: 30,
                        maxPax: 50,
                        paxRange: "Good for 30-50 PAX",
                        badge: "30-50 PAX • ₱25k",
                        picaAllowances: { sliders: 2, canapes: 3, fingerFood: 0, miniDesserts: 0, drinks: 0 },
                        grazingAllowances: { sliders: 2, canapes: 3 },
                        inclusionsText: "3 Kilos of Italian Cured Meats\n3 Types of Imported Cheeses\n3 Big Seasonal Fruit Platter\n3 Canapés, 2 Sliders\nMix Assorted Nuts and Dried Fruits\nWafers, Saltin Crackers, Bretzels\nArtisan Breadbasket with Jam and Bread"
                      }));
                    }}
                    style={{ fontSize: "0.72rem", padding: "4px 8px", borderRadius: "6px", background: "#ecfdf5", border: "1px solid #10b981", color: "#065f46", fontWeight: 600, cursor: "pointer" }}
                  >
                    🍢 Petite Package (₱25k / 30-50 PAX)
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingPkg(prev => ({
                        ...prev,
                        serviceType: "pica_pica",
                        name: "Party Package (Pica Pica / Grazing)",
                        subtitle: "4 Kilos Cured Meats, 4 Cheeses, 4 Fruit Platters, 4 Canapés, 3 Sliders & Sausage Platter",
                        price: 45000,
                        pricePerPax: 450,
                        minPax: 50,
                        maxPax: 100,
                        paxRange: "Good for 50-100 PAX",
                        badge: "50-100 PAX • ₱45k",
                        picaAllowances: { sliders: 3, canapes: 4, fingerFood: 0, miniDesserts: 0, drinks: 0 },
                        grazingAllowances: { sliders: 3, canapes: 4 },
                        inclusionsText: "4 Kilos of Italian Cured Meats\n4 Types of Imported Cheeses\n4 Big Seasonal Fruit Platter\n4 Canapés, 3 Sliders\nMix Assorted Nuts and Dried Fruits\nWafers, Saltin Crackers, Bretzels\nVegetables Sticks\nOlives, Cocktail Onions\nHungarian Sausage Platter\nArtisan Breadbasket with Jam and Bread"
                      }));
                    }}
                    style={{ fontSize: "0.72rem", padding: "4px 8px", borderRadius: "6px", background: "#ecfdf5", border: "1px solid #10b981", color: "#065f46", fontWeight: 600, cursor: "pointer" }}
                  >
                    🍢 Party Package (₱45k / 50-100 PAX)
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingPkg(prev => ({
                        ...prev,
                        serviceType: "pica_pica",
                        name: "Pica Pica Station - Option 1",
                        subtitle: "2 Sliders • 5 Canapés • 2 Finger Food • 2 Mini Desserts (Min 50 PAX)",
                        pricePerPax: 300,
                        minPax: 50,
                        badge: "Cocktail Option 1",
                        picaAllowances: { sliders: 2, canapes: 5, fingerFood: 2, miniDesserts: 2, hasKakanin: false, hasDiyStation: false },
                        inclusionsText: "Choice of 2 Sliders (Regular / Special)\nChoice of 5 Canapés (Regular / Special)\nChoice of 2 Finger Foods\nChoice of 2 Mini Dessert Cups\nChoice of Juice or Brewed Coffee\nRustic Cocktail Station Table Setup & Styling\nFood labels & Cocktail Toothpicks/Napkins\nService staff for replenishment (4 Hours Event duration)\nMinimum booking: 50 PAX"
                      }));
                    }}
                    style={{ fontSize: "0.72rem", padding: "4px 8px", borderRadius: "6px", background: "#ecfdf5", border: "1px solid #10b981", color: "#065f46", fontWeight: 600, cursor: "pointer" }}
                  >
                    🍢 Pica Pica Opt 1 (₱300/pax)
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingPkg(prev => ({
                        ...prev,
                        serviceType: "pica_pica",
                        name: "Pica Pica Station - Option 2",
                        subtitle: "3 Sliders • 5 Canapés • 3 Finger Food • 2 Mini Desserts (Min 50 PAX)",
                        pricePerPax: 350,
                        minPax: 50,
                        badge: "Cocktail Option 2",
                        picaAllowances: { sliders: 3, canapes: 5, fingerFood: 3, miniDesserts: 2, hasKakanin: false, hasDiyStation: false },
                        inclusionsText: "Choice of 3 Sliders (Regular / Special)\nChoice of 5 Canapés (Regular / Special)\nChoice of 3 Finger Foods\nChoice of 2 Mini Dessert Cups\nChoice of Juice or Brewed Coffee\nRustic Cocktail Station Table Setup & Styling\nFood labels & Cocktail Toothpicks/Napkins\nService staff for replenishment (4 Hours Event duration)\nMinimum booking: 50 PAX"
                      }));
                    }}
                    style={{ fontSize: "0.72rem", padding: "4px 8px", borderRadius: "6px", background: "#ecfdf5", border: "1px solid #10b981", color: "#065f46", fontWeight: 600, cursor: "pointer" }}
                  >
                    🍢 Pica Pica Opt 2 (₱350/pax)
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingPkg(prev => ({
                        ...prev,
                        serviceType: "pica_pica",
                        name: "Pica Pica Station - Option 3 (Grand)",
                        subtitle: "3 Sliders • 5 Canapés • 3 Finger Food • 3 Desserts • Kakanin • DIY Station",
                        pricePerPax: 425,
                        minPax: 50,
                        badge: "Grand Cocktail",
                        picaAllowances: { sliders: 3, canapes: 5, fingerFood: 3, miniDesserts: 3, hasKakanin: true, hasDiyStation: true },
                        inclusionsText: "Choice of 3 Sliders (Regular / Special)\nChoice of 5 Canapés (Regular / Special)\nChoice of 3 Finger Foods\nChoice of 3 Mini Dessert Cups\nTraditional Pinoy Kakanins Platter\nChoice of DIY Nacho Station OR DIY Mini Doughnut Station\nChoice of Juice or Brewed Coffee\nFull Deluxe Cocktail Station Setup & Attendant\nMinimum booking: 50 PAX"
                      }));
                    }}
                    style={{ fontSize: "0.72rem", padding: "4px 8px", borderRadius: "6px", background: "#ecfdf5", border: "1px solid #10b981", color: "#065f46", fontWeight: 600, cursor: "pointer" }}
                  >
                    🍢 Pica Pica Opt 3 (₱425/pax)
                  </button>

                  {/* Grazing Table Presets */}
                  <button
                    type="button"
                    onClick={() => {
                      setEditingPkg(prev => ({
                        ...prev,
                        serviceType: "grazing_table",
                        name: "Grazing Table - Deluxe Package",
                        subtitle: "Good for 100-150 PAX • Charcuterie, Artisan Cheeses, 5 Canapés, 4 Sliders",
                        price: 85000,
                        pricePerPax: 850,
                        minPax: 100,
                        maxPax: 150,
                        paxRange: "100-150 PAX",
                        badge: "Artisan Deluxe",
                        grazingAllowances: { canapes: 5, sliders: 4, hasDessertShots: false },
                        inclusionsText: "5 Kilos of Italian Cured Meats (Prosciutto, Salami, Coppa Ham)\n5 Types of Imported Cheeses (Brie, Cheddar, Gouda, Colby Jack, Feta)\n5 Big Seasonal Fruit Platters (Grapes, Berries, Melon, Kiwi, Oranges)\n5 Canapés of your choice\n4 Sliders of your choice\nMixed Assorted Nuts and Dried Fruits\nWafers, Saltin Crackers, Pretzels\nVegetables Sticks with Dips\nOlives, Cocktail Onions & Pickles\nHungarian Sausage Platter\nIndividual Grazing Cups\nNacho Station with warm cheese sauce\nArtisan Breadbasket with Gourmet Jams & Bread\nComplete Luxury Grazing Table Setup with Wooden Boards, Foliage & Styling"
                      }));
                    }}
                    style={{ fontSize: "0.72rem", padding: "4px 8px", borderRadius: "6px", background: "#f5f3ff", border: "1px solid #8b5cf6", color: "#5b21b6", fontWeight: 600, cursor: "pointer" }}
                  >
                    🧀 Grazing Deluxe (₱85k / 100-150 PAX)
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingPkg(prev => ({
                        ...prev,
                        serviceType: "grazing_table",
                        name: "Grazing Table - Premium Package",
                        subtitle: "Good for 150-200 PAX • Deluxe inclusions + Gourmet Dessert Shots",
                        price: 105000,
                        pricePerPax: 700,
                        minPax: 150,
                        maxPax: 200,
                        paxRange: "150-200 PAX",
                        badge: "Artisan Premium",
                        grazingAllowances: { canapes: 5, sliders: 4, hasDessertShots: true },
                        inclusionsText: "5 Kilos of Italian Cured Meats\n5 Types of Imported Cheeses\n5 Big Seasonal Fruit Platters\n5 Canapés of your choice\n4 Sliders of your choice\nMixed Assorted Nuts and Dried Fruits\nWafers, Saltin Crackers, Pretzels\nVegetables Sticks with Dips\nOlives, Cocktail Onions\nHungarian Sausage Platter\nNacho Station with Dips\nGrazing Cups for guests\nGourmet Dessert Shots\nArtisan Breadbasket with Gourmet Jams and Bread\nFull Luxury Grazing Table Grand Floral & Wooden Display Setup"
                      }));
                    }}
                    style={{ fontSize: "0.72rem", padding: "4px 8px", borderRadius: "6px", background: "#f5f3ff", border: "1px solid #8b5cf6", color: "#5b21b6", fontWeight: 600, cursor: "pointer" }}
                  >
                    🧀 Grazing Premium (₱105k / 150-200 PAX)
                  </button>

                  {/* Food Tray Presets */}
                  <button
                    type="button"
                    onClick={() => {
                      setEditingPkg(prev => ({
                        ...prev,
                        serviceType: "food_tray",
                        name: "Small Batch Package (10-15 PAX)",
                        subtitle: "3 Regular Main Dish + 2 Regular Side (Palatable Party Food Trays)",
                        price: 7500,
                        pricePerPax: 500,
                        minPax: 10,
                        maxPax: 15,
                        paxRange: "10-15 PAX",
                        badge: "Small Batch",
                        mainDishesCount: 3,
                        regSidesCount: 2,
                        specSidesCount: 0,
                        regDessertsCount: 0,
                        specDessertsCount: 0,
                        inclusionsText: "3 Regular Main Dishes (Choice of Beef, Pork, Chicken, Seafood)\n2 Regular Side Dishes (Pasta, Noodles, or Vegetables)\nFood-grade aluminum party food trays with secure lids\nFree delivery: Iloilo City, Pavia, Sta. Barbara, Cabatuan, Maasin, San Miguel, Janiuay\n50% downpayment upon booking, balance upon delivery\nStrictly no cancellation (70% cancellation fee)"
                      }));
                    }}
                    style={{ fontSize: "0.72rem", padding: "4px 8px", borderRadius: "6px", background: "#ffffff", border: "1px solid var(--border-subtle)", cursor: "pointer" }}
                  >
                    🍱 3 Mains + 2 Sides (₱7,500)
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingPkg(prev => ({
                        ...prev,
                        serviceType: "food_tray",
                        name: "Single Dish Party Food Tray (1 Viand)",
                        subtitle: "Select 1 Regular Dish Party Tray (Customizable A La Carte Viand)",
                        price: 2500,
                        pricePerPax: 200,
                        minPax: 10,
                        maxPax: 15,
                        paxRange: "10-15 PAX / Tray",
                        badge: "1 Regular Dish",
                        mainDishesCount: 1,
                        regSidesCount: 0,
                        specSidesCount: 0,
                        regDessertsCount: 0,
                        specDessertsCount: 0,
                        inclusionsText: "1 Regular Main Dish / Viand of your choice\nFood-grade aluminum party food tray with seal\nFree delivery: Iloilo City, Pavia, Sta. Barbara, Cabatuan, Maasin, San Miguel, Janiuay\nBook at least 2-3 days prior to event\n50% downpayment upon booking, balance upon delivery"
                      }));
                    }}
                    style={{ fontSize: "0.72rem", padding: "4px 8px", borderRadius: "6px", background: "#ffffff", border: "1px solid var(--border-subtle)", cursor: "pointer", color: "#b45309", fontWeight: 600 }}
                  >
                    🍲 Single Food Tray (1 Viand)
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingPkg(prev => ({
                        ...prev,
                        serviceType: "buffet",
                        name: "Classic Buffet Celebration",
                        subtitle: "5 Main Dishes + Steamed Rice + Dessert + Beverage",
                        price: "",
                        pricePerPax: 650,
                        minPax: 50,
                        maxPax: undefined,
                        paxRange: "",
                        badge: "Classic Tier",
                        mainDishesCount: 5,
                        regSidesCount: 1,
                        specSidesCount: 0,
                        regDessertsCount: 1,
                        specDessertsCount: 0,
                        inclusionsText: "5 Gourmet Main Dishes\nSteamed Pandan Jasmine Rice\n1 Filipino Dessert\nBottomless Iced Tea\nStandard Catering Setup with Buffet Table & Waitstaff"
                      }));
                    }}
                    style={{ fontSize: "0.72rem", padding: "4px 8px", borderRadius: "6px", background: "#ffffff", border: "1px solid var(--border-subtle)", cursor: "pointer" }}
                  >
                    🍽️ Classic Buffet (5 Mains)
                  </button>

                  {/* Packed Meal Presets */}
                  <button
                    type="button"
                    onClick={() => {
                      setEditingPkg(prev => ({
                        ...prev,
                        serviceType: "packed_meal",
                        name: "Packed Meal PM 1 (1 Main, 1 Side, Rice, Soda)",
                        subtitle: "Choice of Fried Chicken, Breaded Pork Chop, or Fish Fillet (Min 50 PAX)",
                        price: "",
                        pricePerPax: 175,
                        minPax: 50,
                        badge: "PM 1 (Min 50PAX)",
                        mainDishesCount: 1,
                        regSidesCount: 1,
                        specSidesCount: 0,
                        regDessertsCount: 0,
                        specDessertsCount: 0,
                        inclusionsText: "1 Main Viand (Fried Chicken / Breaded Pork Chop / Fish Fillet)\n1 Side Dish (Tuna Macaroni Salad / Buttered Veg / Sotanghon Guisado)\nChoice of Plain Rice or Garlic Rice\nChoice of Soda (Coke / Sprite / Royal)\nIndividual bento packaging with disposable cutlery & napkin\nMinimum booking: 50 PAX"
                      }));
                    }}
                    style={{ fontSize: "0.72rem", padding: "4px 8px", borderRadius: "6px", background: "#fff7ed", border: "1px solid #ea580c", color: "#c2410c", fontWeight: 600, cursor: "pointer" }}
                  >
                    🍱 PM 1 (₱175/pax)
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingPkg(prev => ({
                        ...prev,
                        serviceType: "packed_meal",
                        name: "Packed Meal PM 2 (1 Main, 2 Sides, Rice, Soda)",
                        subtitle: "Choice of Pork/Chicken Ala King, Curry Sauce, or Sweet & Sour / Pork BBQ (Min 50 PAX)",
                        price: "",
                        pricePerPax: 199,
                        minPax: 50,
                        badge: "PM 2 (Min 50PAX)",
                        mainDishesCount: 1,
                        regSidesCount: 2,
                        specSidesCount: 0,
                        regDessertsCount: 0,
                        specDessertsCount: 0,
                        inclusionsText: "1 Main Viand (Crispy Pork/Chicken Ala King / Breaded Curry / Pork BBQ)\n2 Side Dishes (Pasta, Lumpia, Sotanghon, Veg)\nChoice of Plain Rice or Garlic Rice\nChoice of Soda (Coke / Sprite / Royal)\nIndividual bento packaging with cutlery & napkin\nMinimum booking: 50 PAX"
                      }));
                    }}
                    style={{ fontSize: "0.72rem", padding: "4px 8px", borderRadius: "6px", background: "#fff7ed", border: "1px solid #ea580c", color: "#c2410c", fontWeight: 600, cursor: "pointer" }}
                  >
                    🍱 PM 2 (₱199/pax)
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingPkg(prev => ({
                        ...prev,
                        serviceType: "packed_meal",
                        name: "Packed Meal PM 3 Deluxe (2 Mains, 1 Side, Rice, Soda)",
                        subtitle: "2 Gourmet Mains + 1 Side + Plain/Garlic/Java Rice + Soda (Min 50 PAX)",
                        price: "",
                        pricePerPax: 299,
                        minPax: 50,
                        badge: "PM 3 Deluxe (Min 50PAX)",
                        mainDishesCount: 2,
                        regSidesCount: 1,
                        specSidesCount: 0,
                        regDessertsCount: 0,
                        specDessertsCount: 0,
                        inclusionsText: "2 Gourmet Main Viands (Beef Stroganof / Cordon Bleu / Pork BBQ / Fish Fillet / Chicken BBQ)\n1 Side Dish (Mashed Potatoes / Sotanghon / Pancit Canton)\nChoice of Plain Rice, Garlic Rice, or Java Rice\nChoice of Soda\nDeluxe multi-compartment bento container with cutlery\nMinimum booking: 50 PAX"
                      }));
                    }}
                    style={{ fontSize: "0.72rem", padding: "4px 8px", borderRadius: "6px", background: "#fff7ed", border: "1px solid #ea580c", color: "#c2410c", fontWeight: 600, cursor: "pointer" }}
                  >
                    🍱 PM 3 Deluxe (₱299)
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingPkg(prev => ({
                        ...prev,
                        serviceType: "packed_meal",
                        name: "Packed Meal PM 4 Deluxe (1 Main, 2 Sides, Dessert Cup, Rice, Soda)",
                        subtitle: "1 Main + 2 Sides + 1 Dessert Cup + Java/Garlic/Plain Rice + Soda (Min 50 PAX)",
                        price: "",
                        pricePerPax: 250,
                        minPax: 50,
                        badge: "PM 4 Deluxe (Min 50PAX)",
                        mainDishesCount: 1,
                        regSidesCount: 2,
                        specSidesCount: 0,
                        regDessertsCount: 1,
                        specDessertsCount: 0,
                        inclusionsText: "1 Gourmet Main Viand (Beef Broccoli / Pork or Chicken Estofado / Beef Bakareta)\n2 Side Dishes (Spaghetti / Pesto, Shanghai, Chopsuey, Fish Tofu, Croquettes)\n1 Dessert Cup (Creamy Fruit Salad / Mango Tapioca / Strawberry Shortcake)\nChoice of Plain, Garlic, or Java Rice\nChoice of Soda\nDeluxe bento packaging with cutlery\nMinimum booking: 50 PAX"
                      }));
                    }}
                    style={{ fontSize: "0.72rem", padding: "4px 8px", borderRadius: "6px", background: "#fff7ed", border: "1px solid #ea580c", color: "#c2410c", fontWeight: 600, cursor: "pointer" }}
                  >
                    🍱 PM 4 Deluxe (₱250)
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingPkg(prev => ({
                        ...prev,
                        serviceType: "packed_meal",
                        name: "Packed Meal PM 5 Premium (2 Mains, 1 Side, Dessert, Rice, Soda, Water)",
                        subtitle: "2 Premium Mains + 1 Side + 1 Dessert + Rice + Soda/C2 + Bottled Water (Min 50 PAX)",
                        price: "",
                        pricePerPax: 385,
                        minPax: 50,
                        badge: "PM 5 Premium (Min 50PAX)",
                        mainDishesCount: 2,
                        regSidesCount: 1,
                        specSidesCount: 0,
                        regDessertsCount: 1,
                        specDessertsCount: 0,
                        inclusionsText: "2 Premium Main Viands (Beef Stroganof, Teriyaki, Bakareta, Cordon Bleu, Bangus, Tonkatsu)\n1 Side Dish (Sautéed Veg / Penne Pasta or Tuna Pesto / Fresh Lumpia)\n1 Dessert Cup (Mango Tapioca / Creamy Fruit Salad)\nPlain Rice / Garlic Rice / Java Rice\nChoice of Soda or C2 Green Tea\n1 Bottled Water\nExecutive heavy-duty bento tray with cutlery\nMinimum booking: 50 PAX"
                      }));
                    }}
                    style={{ fontSize: "0.72rem", padding: "4px 8px", borderRadius: "6px", background: "#fff7ed", border: "1px solid #ea580c", color: "#c2410c", fontWeight: 600, cursor: "pointer" }}
                  >
                    🍱 PM 5 Premium (₱385)
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingPkg(prev => ({
                        ...prev,
                        serviceType: "packed_meal",
                        name: "Packed Meal PM 6 Premium (2 Mains, 2 Sides, Dessert, Rice, Soda, Water)",
                        subtitle: "2 Premium Mains + 2 Sides + 1 Dessert + Rice + Soda/C2 + Bottled Water (Min 50 PAX)",
                        price: "",
                        pricePerPax: 425,
                        minPax: 50,
                        badge: "PM 6 Premium (Min 50PAX)",
                        mainDishesCount: 2,
                        regSidesCount: 2,
                        specSidesCount: 0,
                        regDessertsCount: 1,
                        specDessertsCount: 0,
                        inclusionsText: "2 Premium Main Viands (Crispy Kare Kare, Chicken BBQ, Bakareta, Cordon Bleu, Hamonado, Fingers)\n2 Side Dishes (Chopsuey, Shanghai, Penne Pasta / Tuna Pesto, Fish Tofu, Meat Balls)\n1 Dessert Cup (Mango Tapioca / Strawberry Shortcake / Fruit Salad)\nPlain Rice / Garlic Rice / Java Rice\nChoice of Soda or C2 Green Tea\n1 Bottled Water\nVIP Executive bento tray with cutlery\nMinimum booking: 50 PAX"
                      }));
                    }}
                    style={{ fontSize: "0.72rem", padding: "4px 8px", borderRadius: "6px", background: "#fff7ed", border: "1px solid #ea580c", color: "#c2410c", fontWeight: 600, cursor: "pointer" }}
                  >
                    🍱 PM 6 Premium (₱425)
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingPkg(prev => ({
                        ...prev,
                        serviceType: "promo",
                        name: "Bermonths Promo 50 PAX (Full Catering + Mini Grazing Table)",
                        subtitle: "Full Catering Starts for Only ₱35,000 Good for 50 PAX • Good Food, Brighter Gatherings ♡",
                        price: 35000,
                        pricePerPax: 700,
                        minPax: 50,
                        maxPax: 50,
                        paxRange: "Good for 50 PAX",
                        badge: "🎄 ₱35,000 for 50 PAX",
                        promoStartDate: "2026-09-30",
                        promoEndDate: "2026-12-31",
                        promoRunsText: "SEPTEMBER 30 - DECEMBER 31",
                        promoIsActive: true,
                        mainDishesCount: 2,
                        regSidesCount: 1,
                        specSidesCount: 0,
                        regDessertsCount: 1,
                        specDessertsCount: 0,
                        inclusionsText: "2 Regular Mains (Choice of Beef, Pork, Chicken, Seafood)\n1 Regular Side (Pasta, Noodles, or Vegetable dish)\n1 Regular Dessert (Filipino sweet desserts)\nHot Soup (Choice of Cream of Corn, Wild Mushroom, Roasted Pumpkin, Sotanghon Broth)\nSteamed Pandan Jasmine Rice\nChoice of: Chilled Soda or Fruit Juice\nMini Grazing Table (Charcuterie Platter, Fruit Platter, DIY Nachos w/ Cheese Fountain, Canapés & Mini Cups)\nRustic Buffet Table Set up with warming chafers & styling\nTables and chairs for guests with table skirting, chair cover, simple table center pc, fine dinning set up\nFree transportation with in these areas: City of Iloilo, Cabatuan, Sta Barbara, Pavia, San Miguel, Janiuay, Maasin\nWith friendly uniformed servers/staffs (4hrs full catering service)\nService water\nBasic Balloon Backdrop"
                      }));
                    }}
                    style={{ fontSize: "0.72rem", padding: "4px 8px", borderRadius: "6px", background: "#fef2f2", border: "1px solid #ef4444", color: "#b91c1c", fontWeight: 700, cursor: "pointer" }}
                  >
                    🎄 Promo 50 PAX (₱35k + Grazing)
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingPkg(prev => ({
                        ...prev,
                        serviceType: "promo",
                        name: "Bermonths Promo 100 PAX (Full Catering + Mini Grazing Table + Whole Lechon)",
                        subtitle: "Full Catering Starts for Only ₱75,000 Good for 100 PAX • Good Food, Brighter Gatherings ♡",
                        price: 75000,
                        pricePerPax: 750,
                        minPax: 100,
                        maxPax: 100,
                        paxRange: "Good for 100 PAX",
                        badge: "🎄 ₱75,000 for 100 PAX • With Lechon",
                        promoStartDate: "2026-09-30",
                        promoEndDate: "2026-12-31",
                        promoRunsText: "SEPTEMBER 30 - DECEMBER 31",
                        promoIsActive: true,
                        hasLechon: true,
                        lechonDetails: "1 Whole Lechon (50kg Live weight)",
                        mainDishesCount: 3,
                        regSidesCount: 1,
                        specSidesCount: 0,
                        regDessertsCount: 1,
                        specDessertsCount: 0,
                        inclusionsText: "3 Regular Mains (Choice of Beef, Pork, Chicken, Seafood)\n1 Regular Side (Pasta, Noodles, or Vegetable dish)\n1 Regular Dessert (Filipino sweet desserts)\nHot Soup (Choice of Cream of Corn, Wild Mushroom, Roasted Pumpkin, Sotanghon Broth)\nSteamed Pandan Jasmine Rice\nChoice of: Chilled Soda or Fruit Juice\nMini Grazing Table (Charcuterie Platter, Fruit Platter, DIY Nachos w/ Cheese Fountain, Canapés & Mini Cups)\n1 Whole Lechon (50kg Live weight)\nBuffet table set up with full set of serving utensils and chafing dish\nTables and chairs for guests with table skirting, chair cover, simple table centerpiece, fine dining set up\nFree transportation within the following areas: City of Iloilo, Cabatuan, Sta Barbara, Pavia, San Miguel, Janiuay, Maasin\nAssorted drinks and ice\nWith friendly uniformed servers/staffs (4hrs full catering service)\nBasic Balloon Backdrop"
                      }));
                    }}
                    style={{ fontSize: "0.72rem", padding: "4px 8px", borderRadius: "6px", background: "#fef3c7", border: "1px solid #f59e0b", color: "#92400e", fontWeight: 700, cursor: "pointer" }}
                  >
                    🎄 Promo 100 PAX (₱75k + Grazing + Lechon)
                  </button>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: "1rem" }}>
                <label className="form-label">Package Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pica Pica Station - Option 2 / Grazing Table Deluxe"
                  className="form-input"
                  value={editingPkg.name}
                  onChange={(e) => setEditingPkg(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="form-group" style={{ marginBottom: "1rem" }}>
                <label className="form-label">Subtitle / Target Event</label>
                <input
                  type="text"
                  placeholder="e.g. 3 Sliders • 5 Canapés • 3 Finger Food • 2 Mini Desserts"
                  className="form-input"
                  value={editingPkg.subtitle}
                  onChange={(e) => setEditingPkg(prev => ({ ...prev, subtitle: e.target.value }))}
                />
              </div>

              {/* Pricing & Pax Grid */}
              {editingPkg.serviceType === "promo" || editingPkg.isPromo ? (
                <div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                    <div className="form-group">
                      <label className="form-label">Base Promo Price (₱) *</label>
                      <input
                        type="number"
                        required
                        min="1000"
                        placeholder="20000"
                        className="form-input"
                        value={editingPkg.price ?? 20000}
                        onChange={(e) => setEditingPkg(prev => ({ ...prev, price: e.target.value }))}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Base Included Guests (PAX) *</label>
                      <input
                        type="number"
                        required
                        min="20"
                        className="form-input"
                        value={editingPkg.minPax ?? 50}
                        onChange={(e) => setEditingPkg(prev => ({ ...prev, minPax: e.target.value }))}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Extra Guest Rate (₱/pax)</label>
                      <input
                        type="number"
                        min="0"
                        className="form-input"
                        placeholder="400"
                        value={editingPkg.pricePerPax ?? 400}
                        onChange={(e) => setEditingPkg(prev => ({ ...prev, pricePerPax: e.target.value }))}
                      />
                    </div>
                  </div>

                  {/* Customizable Promo Date Range & Status */}
                  <div style={{ marginBottom: "1.25rem", padding: "0.85rem", background: "#fef2f2", borderRadius: "8px", border: "1.5px solid #fca5a5" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6rem" }}>
                      <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#b91c1c" }}>
                        📅 CUSTOMIZABLE PROMO PERIOD & ELIGIBILITY:
                      </span>
                      <label style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.8rem", color: "#991b1b", fontWeight: 600, cursor: "pointer" }}>
                        <input
                          type="checkbox"
                          checked={editingPkg.promoIsActive !== false}
                          onChange={(e) => setEditingPkg(prev => ({ ...prev, promoIsActive: e.target.checked }))}
                        />
                        <span>Active Promo</span>
                      </label>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                      <div>
                        <label style={{ display: "block", fontSize: "0.74rem", fontWeight: 600, color: "#7f1d1d", marginBottom: "0.25rem" }}>
                          Promo Start Date
                        </label>
                        <input
                          type="date"
                          className="form-input"
                          value={editingPkg.promoStartDate || "2026-09-30"}
                          onChange={(e) => setEditingPkg(prev => ({ ...prev, promoStartDate: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "0.74rem", fontWeight: 600, color: "#7f1d1d", marginBottom: "0.25rem" }}>
                          Promo End Date
                        </label>
                        <input
                          type="date"
                          className="form-input"
                          value={editingPkg.promoEndDate || "2026-12-31"}
                          onChange={(e) => setEditingPkg(prev => ({ ...prev, promoEndDate: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "#991b1b", marginTop: "0.5rem" }}>
                      * Booking dates within this range will automatically activate Bermonths holiday promo pricing and inclusions.
                    </div>
                  </div>
                </div>
              ) : (editingPkg.serviceType === "grazing_table" || editingPkg.serviceType === "food_tray") ? (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                  <div className="form-group">
                    <label className="form-label">Fixed Package Price (₱) *</label>
                    <input
                      type="number"
                      required
                      min="1000"
                      placeholder="e.g. 85000"
                      className="form-input"
                      value={editingPkg.price ?? ""}
                      onChange={(e) => setEditingPkg(prev => ({ ...prev, price: e.target.value }))}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Serving Range / Pax Text</label>
                    <input
                      type="text"
                      placeholder="e.g. 100-150 PAX"
                      className="form-input"
                      value={editingPkg.paxRange ?? ""}
                      onChange={(e) => setEditingPkg(prev => ({ ...prev, paxRange: e.target.value }))}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Minimum Pax *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      className="form-input"
                      value={editingPkg.minPax}
                      onChange={(e) => setEditingPkg(prev => ({ ...prev, minPax: e.target.value }))}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Maximum Pax</label>
                    <input
                      type="number"
                      min="1"
                      placeholder="e.g. 150"
                      className="form-input"
                      value={editingPkg.maxPax ?? ""}
                      onChange={(e) => setEditingPkg(prev => ({ ...prev, maxPax: e.target.value ? Number(e.target.value) : undefined }))}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Est. Per-Pax Value (₱)</label>
                    <input
                      type="number"
                      min="0"
                      className="form-input"
                      value={editingPkg.pricePerPax || ""}
                      onChange={(e) => setEditingPkg(prev => ({ ...prev, pricePerPax: e.target.value }))}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Tier Badge</label>
                    <input
                      type="text"
                      placeholder="e.g. Artisan Deluxe"
                      className="form-input"
                      value={editingPkg.badge}
                      onChange={(e) => setEditingPkg(prev => ({ ...prev, badge: e.target.value }))}
                    />
                  </div>
                </div>
              ) : (
                /* Per-Pax Pricing Grid (Buffet or Pica Pica) */
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                  <div className="form-group">
                    <label className="form-label">Price Per Pax (₱) *</label>
                    <input
                      type="number"
                      required
                      min="100"
                      placeholder="e.g. 350"
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
                      placeholder="50"
                      className="form-input"
                      value={editingPkg.minPax}
                      onChange={(e) => setEditingPkg(prev => ({ ...prev, minPax: e.target.value }))}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Tier Badge</label>
                    <input
                      type="text"
                      placeholder={editingPkg.serviceType === "pica_pica" ? "e.g. Cocktail Option 2" : "e.g. Premiere Luxe"}
                      className="form-input"
                      value={editingPkg.badge}
                      onChange={(e) => setEditingPkg(prev => ({ ...prev, badge: e.target.value }))}
                    />
                  </div>
                </div>
              )}

              {/* Service-Specific Allowances */}
              {editingPkg.serviceType === "pica_pica" ? (
                <div style={{ marginBottom: "1rem", background: "#f0fdf4", padding: "0.85rem", borderRadius: "8px", border: "1px solid #bbf7d0" }}>
                  <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#166534", marginBottom: "0.6rem", textTransform: "uppercase" }}>
                    🍢 Pica Pica Station Allowances:
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "0.75rem", marginBottom: "0.75rem" }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: "0.74rem" }}>🍔 Sliders Count</label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        className="form-input"
                        value={editingPkg.picaAllowances?.sliders ?? 3}
                        onChange={(e) => setEditingPkg(prev => ({
                          ...prev,
                          picaAllowances: { ...prev.picaAllowances, sliders: Number(e.target.value) || 0 }
                        }))}
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: "0.74rem" }}>🥖 Canapés Count</label>
                      <input
                        type="number"
                        min="0"
                        max="15"
                        className="form-input"
                        value={editingPkg.picaAllowances?.canapes ?? 5}
                        onChange={(e) => setEditingPkg(prev => ({
                          ...prev,
                          picaAllowances: { ...prev.picaAllowances, canapes: Number(e.target.value) || 0 }
                        }))}
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: "0.74rem" }}>🍗 Finger Food Count</label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        className="form-input"
                        value={editingPkg.picaAllowances?.fingerFood ?? 3}
                        onChange={(e) => setEditingPkg(prev => ({
                          ...prev,
                          picaAllowances: { ...prev.picaAllowances, fingerFood: Number(e.target.value) || 0 }
                        }))}
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: "0.74rem" }}>🧁 Mini Dessert Cups</label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        className="form-input"
                        value={editingPkg.picaAllowances?.miniDesserts ?? 2}
                        onChange={(e) => setEditingPkg(prev => ({
                          ...prev,
                          picaAllowances: { ...prev.picaAllowances, miniDesserts: Number(e.target.value) || 0 }
                        }))}
                      />
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "1.5rem", fontSize: "0.82rem" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={editingPkg.picaAllowances?.hasKakanin ?? false}
                        onChange={(e) => setEditingPkg(prev => ({
                          ...prev,
                          picaAllowances: { ...prev.picaAllowances, hasKakanin: e.target.checked }
                        }))}
                      />
                      <span>Includes Pinoy Kakanins Platter</span>
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={editingPkg.picaAllowances?.hasDiyStation ?? false}
                        onChange={(e) => setEditingPkg(prev => ({
                          ...prev,
                          picaAllowances: { ...prev.picaAllowances, hasDiyStation: e.target.checked }
                        }))}
                      />
                      <span>Includes Choice of DIY Nacho or DIY Doughnut Station</span>
                    </label>
                  </div>
                </div>
              ) : editingPkg.serviceType === "grazing_table" ? (
                <div style={{ marginBottom: "1rem", background: "#f5f3ff", padding: "0.85rem", borderRadius: "8px", border: "1px solid #ddd6fe" }}>
                  <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#5b21b6", marginBottom: "0.6rem", textTransform: "uppercase" }}>
                    🧀 Grazing Table Inclusions & Allowances:
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem", marginBottom: "0.5rem" }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: "0.74rem" }}>🥖 Canapés Count</label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        className="form-input"
                        value={editingPkg.grazingAllowances?.canapes ?? 5}
                        onChange={(e) => setEditingPkg(prev => ({
                          ...prev,
                          grazingAllowances: { ...prev.grazingAllowances, canapes: Number(e.target.value) || 0 }
                        }))}
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: "0.74rem" }}>🍔 Sliders Count</label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        className="form-input"
                        value={editingPkg.grazingAllowances?.sliders ?? 4}
                        onChange={(e) => setEditingPkg(prev => ({
                          ...prev,
                          grazingAllowances: { ...prev.grazingAllowances, sliders: Number(e.target.value) || 0 }
                        }))}
                      />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", paddingTop: "1.2rem" }}>
                      <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", cursor: "pointer", fontSize: "0.82rem" }}>
                        <input
                          type="checkbox"
                          checked={editingPkg.grazingAllowances?.hasDessertShots ?? false}
                          onChange={(e) => setEditingPkg(prev => ({
                            ...prev,
                            grazingAllowances: { ...prev.grazingAllowances, hasDessertShots: e.target.checked }
                          }))}
                        />
                        <span>Includes Dessert Shots</span>
                      </label>
                    </div>
                  </div>
                  <p style={{ fontSize: "0.74rem", color: "#6d28d9", margin: 0 }}>
                    * Charcuterie standard items (5kg Cured Meats, 5 Cheeses, 5 Fruit Platters, Nuts, Crackers, Pretzels, Veggies, Sausage, Grazing Cups, Nachos, Artisan Breads) are automatically included.
                  </p>
                </div>
              ) : (
                /* Buffet / Food Tray Course Allowances Grid: Mains, Sides, Desserts */
                <div style={{ marginBottom: "1rem", background: "rgba(241, 245, 249, 0.5)", padding: "0.85rem", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
                  <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "0.6rem", textTransform: "uppercase" }}>
                    Dish / Viand Allowances:
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr 1fr 1fr", gap: "0.75rem" }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: "0.74rem" }}>🍛 Main Dishes *</label>
                      <input
                        type="number"
                        min="1"
                        max="15"
                        required
                        className="form-input"
                        value={editingPkg.mainDishesCount ?? (editingPkg.serviceType === "food_tray" ? 3 : 5)}
                        onChange={(e) => setEditingPkg(prev => ({ ...prev, mainDishesCount: Number(e.target.value) || 0 }))}
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: "0.74rem" }}>🥗 Reg Sides</label>
                      <input
                        type="number"
                        min="0"
                        max="5"
                        className="form-input"
                        value={editingPkg.regSidesCount ?? (editingPkg.serviceType === "food_tray" ? 2 : 1)}
                        onChange={(e) => setEditingPkg(prev => ({ ...prev, regSidesCount: Number(e.target.value) || 0 }))}
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: "0.74rem", color: "#92400e" }}>⭐ Spec Sides</label>
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
                      <label className="form-label" style={{ fontSize: "0.74rem" }}>🍮 Reg Desserts</label>
                      <input
                        type="number"
                        min="0"
                        max="5"
                        className="form-input"
                        value={editingPkg.regDessertsCount ?? (editingPkg.serviceType === "food_tray" ? 0 : 1)}
                        onChange={(e) => setEditingPkg(prev => ({ ...prev, regDessertsCount: Number(e.target.value) || 0 }))}
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: "0.74rem", color: "#92400e" }}>⭐ Spec Desserts</label>
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
                </div>
              )}

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
