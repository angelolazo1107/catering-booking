import React, { useState, useMemo, useEffect } from "react";
import { 
  CATERING_PACKAGES, 
  DISH_MENU_OPTIONS, 
  CATERING_ADDONS, 
  DELIVERY_LOCATIONS, 
  EVENT_TYPES,
  getDishUpgradePrice,
  DEFAULT_SPECIAL_DISH_UPGRADE_RATE,
  getMainDishesCount,
  getPackageCourseAllowances
} from "../data/cateringData";
import { 
  Check, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Utensils, 
  Sparkles, 
  Plus, 
  Minus,
  X, 
  Printer, 
  Save, 
  ChevronRight,
  Info,
  CalendarCheck,
  CheckCircle2,
  RotateCcw,
  AlertTriangle,
  ArrowRight
} from "lucide-react";
import confetti from "canvas-confetti";
import { 
  isDateFullyBooked, 
  getRemainingSlotsForDate, 
  getFullyBookedDatesList, 
  MAX_CONFIRMED_BOOKINGS_PER_DAY 
} from "../utils/bookingUtils";

const STORAGE_KEY_DRAFT_BOOKING = "caterflow_client_draft_booking";

function loadDraftBooking() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DRAFT_BOOKING);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error("Failed to load draft booking:", e);
  }
  return null;
}

export default function PricingCalculator({ 
  onGenerateQuote, 
  onSaveQuote, 
  isSaving,
  packagesList = CATERING_PACKAGES,
  dishesMenu = DISH_MENU_OPTIONS,
  availableAddons = CATERING_ADDONS,
  existingBookings = []
}) {
  const draft = useMemo(() => loadDraftBooking(), []);
  const [dateWarning, setDateWarning] = useState("");

  // 1. Client & Event Info
  const [clientInfo, setClientInfo] = useState(() => ({
    clientName: draft?.clientInfo?.clientName || "",
    contactNumber: draft?.clientInfo?.contactNumber || "",
    email: draft?.clientInfo?.email || "",
    eventType: draft?.clientInfo?.eventType || "wedding",
    eventDate: draft?.clientInfo?.eventDate || "",
    eventTime: draft?.clientInfo?.eventTime || "18:00",
    venueName: draft?.clientInfo?.venueName || "",
    venueAddress: draft?.clientInfo?.venueAddress || "",
    notes: draft?.clientInfo?.notes || ""
  }));

  // 2. Package & Pax
  const [selectedPkgId, setSelectedPkgId] = useState(() => draft?.selectedPkgId || "package_4");
  const currentPkg = useMemo(() => {
    if (!packagesList || packagesList.length === 0) return CATERING_PACKAGES[0];
    const match = packagesList.find(p => p.id === selectedPkgId) ||
      packagesList.find(p => p.id?.toLowerCase().includes(String(selectedPkgId).toLowerCase())) ||
      packagesList.find(p => p.name?.toLowerCase().includes(String(selectedPkgId).toLowerCase())) ||
      packagesList[0];
    return match;
  }, [selectedPkgId, packagesList]);

  const [pax, setPax] = useState(() => draft?.pax ?? 100);

  // Package course allowances (Main, Regular/Special Sides, Regular/Special Desserts)
  const baseCourseAllowances = useMemo(() => getPackageCourseAllowances(currentPkg), [currentPkg]);

  // Swap Deals: 'none' | 'extra_main' | 'extra_side'
  // Rule 1: No Rice + No Drinks + No Dessert => +1 Extra Main Dish
  // Rule 2: No Rice + No Softdrinks => +1 Extra Side Dish
  const [swapDeal, setSwapDeal] = useState(() => draft?.swapDeal || "none");

  const courseAllowances = useMemo(() => {
    const allowances = { ...baseCourseAllowances };
    if (swapDeal === "extra_main") {
      allowances.mainDishesCount += 1;
      allowances.regDessertsCount = 0;
      allowances.specDessertsCount = 0;
    } else if (swapDeal === "extra_side") {
      allowances.regSidesCount += 1;
    }
    return allowances;
  }, [baseCourseAllowances, swapDeal]);

  const maxMainDishes = courseAllowances.mainDishesCount;

  // 3. Selected Main Dishes (entrees from Beef, Pork, Chicken, Seafood)
  const [selectedMainDishes, setSelectedMainDishes] = useState(() => {
    if (Array.isArray(draft?.selectedMainDishes) && draft.selectedMainDishes.length > 0) {
      return draft.selectedMainDishes;
    }
    return [
      "Beef Stroganoff",
      "Pork Tonkatsu",
      "Chicken Cordon Bleu",
      "Fish Fillet (Cream Dory) in Garlic Cream Dip",
      "Palatable Fried Chicken"
    ];
  });

  // 4. Side Dishes (Regular and Special)
  const [selectedSides, setSelectedSides] = useState(() => {
    if (Array.isArray(draft?.selectedSides) && draft.selectedSides.length > 0) {
      return draft.selectedSides;
    }
    const legacy = [];
    if (draft?.sideDishes?.regular) legacy.push(draft.sideDishes.regular);
    if (draft?.sideDishes?.regular2) legacy.push(draft.sideDishes.regular2);
    return legacy.length > 0 ? legacy : ["Creamy Spaghetti", "Baked Penne Pasta"];
  });

  const [selectedSpecialSide, setSelectedSpecialSide] = useState(() => {
    return draft?.selectedSpecialSide || "";
  });

  // 5. Desserts (Regular and Special)
  const [selectedDessertsList, setSelectedDessertsList] = useState(() => {
    if (Array.isArray(draft?.selectedDessertsList) && draft.selectedDessertsList.length > 0) {
      return draft.selectedDessertsList;
    }
    const legacy = [];
    if (draft?.desserts?.regular) legacy.push(draft.desserts.regular);
    if (draft?.desserts?.regular2) legacy.push(draft.desserts.regular2);
    return legacy.length > 0 ? legacy : ["Mango Tapioca"];
  });

  const [selectedSpecialDessert, setSelectedSpecialDessert] = useState(() => {
    return draft?.selectedSpecialDessert || "";
  });

  const [sideLimitNotice, setSideLimitNotice] = useState("");
  const [dessertLimitNotice, setDessertLimitNotice] = useState("");

  const sideDishes = useMemo(() => ({
    regular: selectedSides[0] || "",
    regular2: selectedSides[1] || "",
    special: selectedSpecialSide || ""
  }), [selectedSides, selectedSpecialSide]);

  const desserts = useMemo(() => ({
    regular: selectedDessertsList[0] || "",
    regular2: selectedDessertsList[1] || "",
    special: selectedSpecialDessert || ""
  }), [selectedDessertsList, selectedSpecialDessert]);

  // Trim side dishes if package with fewer side allowance is selected
  useEffect(() => {
    if (selectedSides.length > courseAllowances.regSidesCount) {
      setSelectedSides(prev => prev.slice(0, courseAllowances.regSidesCount));
    }
  }, [courseAllowances.regSidesCount]);

  // Trim desserts if package with fewer dessert allowance is selected
  useEffect(() => {
    if (selectedDessertsList.length > courseAllowances.regDessertsCount) {
      setSelectedDessertsList(prev => prev.slice(0, courseAllowances.regDessertsCount));
    }
  }, [courseAllowances.regDessertsCount]);

  // 6. Choice of Rice or Soup
  const [riceOrSoup, setRiceOrSoup] = useState(() => draft?.riceOrSoup || draft?.otherDishes?.rice || "Plain Steamed Rice");

  // 7. Choice of Soda or Juice
  const [beverage, setBeverage] = useState(() => draft?.beverage || draft?.otherDishes?.drinks || "Bottomless Signature Red Iced Tea");

  const [dishLimitNotice, setDishLimitNotice] = useState("");

  // Trim main dishes if package with fewer main dish allowance is selected
  useEffect(() => {
    if (selectedMainDishes.length > maxMainDishes) {
      setSelectedMainDishes(prev => prev.slice(0, maxMainDishes));
    }
  }, [maxMainDishes]);

  // 8. Add-ons selection (array of { id, qty })
  const [selectedAddons, setSelectedAddons] = useState(() => draft?.selectedAddons || {
    lechon_small: 1,
    halo_halo_station: 1
  });

  // 9. Logistics & Pricing
  const [deliveryLocation, setDeliveryLocation] = useState(() => draft?.deliveryLocation || "ncr");
  const [customDeliveryFee, setCustomDeliveryFee] = useState(() => draft?.customDeliveryFee ?? 0);
  const [isServiceCharge, setIsServiceCharge] = useState(() => draft?.isServiceCharge ?? true);
  const [serviceChargePercent, setServiceChargePercent] = useState(() => draft?.serviceChargePercent ?? 10);
  const [discountAmount, setDiscountAmount] = useState(() => draft?.discountAmount ?? 0);

  // Auto-save draft inputs to localStorage on any change
  useEffect(() => {
    try {
      const dataToSave = {
        clientInfo,
        selectedPkgId,
        pax,
        swapDeal,
        selectedMainDishes,
        sideDishes,
        desserts,
        riceOrSoup,
        beverage,
        otherDishes: {
          rice: riceOrSoup,
          dessert: courseAllowances.regDessertsCount >= 2 
            ? `${desserts.regular}, ${desserts.regular2 || "Buko Pandan"}` 
            : desserts.regular,
          dessertSpecial: courseAllowances.specDessertsCount > 0 ? desserts.special : null,
          drinks: beverage
        },
        selectedDishes: {
          beef: selectedMainDishes[0] || "",
          pork: selectedMainDishes[1] || "",
          chicken: selectedMainDishes[2] || "",
          fish: selectedMainDishes[3] || "",
          noodlesOrVeg: courseAllowances.regSidesCount >= 2 
            ? `${sideDishes.regular}, ${sideDishes.regular2 || "Baked Penne Pasta"}` 
            : sideDishes.regular,
          sideSpecial: courseAllowances.specSidesCount > 0 ? sideDishes.special : null,
          rice: riceOrSoup,
          dessert: courseAllowances.regDessertsCount >= 2 
            ? `${desserts.regular}, ${desserts.regular2 || "Buko Pandan"}` 
            : desserts.regular,
          dessertSpecial: courseAllowances.specDessertsCount > 0 ? desserts.special : null,
          drinks: beverage
        },
        selectedAddons,
        deliveryLocation,
        customDeliveryFee,
        isServiceCharge,
        serviceChargePercent,
        discountAmount
      };
      localStorage.setItem(STORAGE_KEY_DRAFT_BOOKING, JSON.stringify(dataToSave));
    } catch (e) {
      console.warn("Failed to auto-save draft booking:", e);
    }
  }, [
    clientInfo,
    selectedPkgId,
    pax,
    swapDeal,
    selectedMainDishes,
    sideDishes,
    desserts,
    riceOrSoup,
    beverage,
    selectedAddons,
    deliveryLocation,
    customDeliveryFee,
    isServiceCharge,
    serviceChargePercent,
    discountAmount
  ]);

  const handleResetForm = () => {
    if (window.confirm("Are you sure you want to clear your current booking inputs and start fresh?")) {
      localStorage.removeItem(STORAGE_KEY_DRAFT_BOOKING);
      setClientInfo({
        clientName: "",
        contactNumber: "",
        email: "",
        eventType: "wedding",
        eventDate: "",
        eventTime: "18:00",
        venueName: "",
        venueAddress: "",
        notes: ""
      });
      setSelectedPkgId("royal_premiere");
      setPax(100);
      setSwapDeal("none");
      setSelectedSpecialSide("");
      setSelectedSpecialDessert("");
      setDiscountAmount(0);
      setCustomDeliveryFee(0);
      setDeliveryLocation("ncr");
      setValidationError("");
    }
  };

  // Booking confirmation modal & validation
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [validationError, setValidationError] = useState("");
  const [missingInclusionsModal, setMissingInclusionsModal] = useState(null);

  // Special Dish Upgrade Confirmation Modal State
  const [pendingSpecialUpgrade, setPendingSpecialUpgrade] = useState(null);

  // Helper to retrieve dish object from menu
  const getDishObject = (categoryKey, dishName) => {
    if (!dishName) return null;
    const catList = dishesMenu[categoryKey] || [];
    const found = catList.find(d => d.name === dishName);
    if (found) return found;
    for (const list of Object.values(dishesMenu)) {
      const f = list.find(d => d.name === dishName);
      if (f) return f;
    }
    return null;
  };

  // Helper to determine if a dish is special
  const isDishSpecial = (categoryKey, dishName) => {
    const dishObj = getDishObject(categoryKey, dishName);
    return Boolean(dishObj && (dishObj.tier === "special" || dishObj.premium));
  };

  // Calculations
  const foodTotal = pax * currentPkg.pricePerPax;

  // Selected Special Dishes and Upgrade Fee (Main dishes + Special Side & Special Dessert if not included in package)
  const selectedSpecialDishesList = useMemo(() => {
    const list = [];
    // 1. Special Main Dishes
    for (const name of selectedMainDishes) {
      const dishObj = getDishObject("", name);
      if (dishObj && (dishObj.tier === "special" || dishObj.premium)) {
        const upgradeRate = getDishUpgradePrice(dishObj);
        list.push({ 
          category: dishObj.category || "main", 
          name: name,
          upgradePrice: upgradeRate,
          totalUpgrade: upgradeRate * pax
        });
      }
    }
    // 2. Special Side Dish (upgrade fee of ₱65/pax if NOT included in package)
    if (selectedSpecialSide && (courseAllowances.specSidesCount || 0) === 0) {
      const dishObj = getDishObject("noodlesOrVeg", selectedSpecialSide);
      const upgradeRate = dishObj ? getDishUpgradePrice(dishObj) : DEFAULT_SPECIAL_DISH_UPGRADE_RATE;
      list.push({
        category: "side",
        name: `${selectedSpecialSide} (Special Side Upgrade)`,
        upgradePrice: upgradeRate,
        totalUpgrade: upgradeRate * pax
      });
    }
    // 3. Special Dessert (upgrade fee of ₱65/pax if NOT included in package and not waived)
    if (selectedSpecialDessert && (courseAllowances.specDessertsCount || 0) === 0 && swapDeal !== "extra_main") {
      const dishObj = getDishObject("dessert", selectedSpecialDessert);
      const upgradeRate = dishObj ? getDishUpgradePrice(dishObj) : DEFAULT_SPECIAL_DISH_UPGRADE_RATE;
      list.push({
        category: "dessert",
        name: `${selectedSpecialDessert} (Special Dessert Upgrade)`,
        upgradePrice: upgradeRate,
        totalUpgrade: upgradeRate * pax
      });
    }
    return list;
  }, [
    selectedMainDishes, 
    selectedSpecialSide, 
    selectedSpecialDessert, 
    courseAllowances.specSidesCount, 
    courseAllowances.specDessertsCount, 
    swapDeal, 
    dishesMenu, 
    pax
  ]);

  const specialDishesCount = selectedSpecialDishesList.length;
  const specialDishesUpgradeTotal = selectedSpecialDishesList.reduce((sum, d) => sum + (d.upgradePrice * pax), 0);

  const addonsList = useMemo(() => {
    const list = [];
    Object.entries(selectedAddons).forEach(([addonId, qty]) => {
      if (qty > 0) {
        const item = availableAddons.find(a => a.id === addonId);
        if (item) {
          list.push({ ...item, qty, itemTotal: item.price * qty });
        }
      }
    });
    return list;
  }, [selectedAddons, availableAddons]);

  const addonsTotal = addonsList.reduce((acc, curr) => acc + curr.itemTotal, 0);

  const deliveryFee = useMemo(() => {
    if (deliveryLocation === "custom") return Number(customDeliveryFee) || 0;
    const loc = DELIVERY_LOCATIONS.find(l => l.id === deliveryLocation);
    return loc ? loc.fee : 1500;
  }, [deliveryLocation, customDeliveryFee]);

  const subtotal = foodTotal + specialDishesUpgradeTotal + addonsTotal + deliveryFee;

  const serviceCharge = isServiceCharge 
    ? Math.round((subtotal) * (serviceChargePercent / 100)) 
    : 0;

  // Non-VAT Official Quotation (VAT is for official receipts, not quotations)
  const grandTotal = Math.max(0, subtotal + serviceCharge - Number(discountAmount || 0));
  const downpaymentRequired = Math.round(grandTotal * 0.50);
  const balanceDue = grandTotal - downpaymentRequired;
  const effectivePerPax = pax > 0 ? Math.round(grandTotal / pax) : 0;

  const handleAddonToggle = (addonId) => {
    setSelectedAddons(prev => {
      const copy = { ...prev };
      if (copy[addonId]) {
        delete copy[addonId];
      } else {
        copy[addonId] = 1;
      }
      return copy;
    });
  };

  const handleAddonQty = (addonId, delta) => {
    setSelectedAddons(prev => {
      const current = prev[addonId] || 0;
      const next = Math.max(0, current + delta);
      const copy = { ...prev };
      if (next === 0) {
        delete copy[addonId];
      } else {
        copy[addonId] = next;
      }
      return copy;
    });
  };

  const handleMainDishClick = (categoryKey, dish) => {
    const isAlreadySelected = selectedMainDishes.includes(dish.name);
    if (isAlreadySelected) {
      // Toggle off / remove
      setSelectedMainDishes(prev => prev.filter(name => name !== dish.name));
      setDishLimitNotice("");
      return;
    }

    if (selectedMainDishes.length >= maxMainDishes) {
      setDishLimitNotice(
        `Package limit reached: You have already selected all ${maxMainDishes} main dishes for ${currentPkg.name}. Deselect a dish first to pick this one.`
      );
      return;
    }

    const isSpecial = dish.tier === "special" || dish.premium;
    if (isSpecial) {
      const upgradeRate = getDishUpgradePrice(dish);
      setPendingSpecialUpgrade({
        categoryKey,
        dishName: dish.name,
        dishDescription: dish.description || "",
        currentDishName: "",
        upgradePrice: upgradeRate,
        isOtherDish: false
      });
    } else {
      setSelectedMainDishes(prev => [...prev, dish.name]);
      setDishLimitNotice("");
    }
  };

  const handleRemoveMainDish = (dishName) => {
    setSelectedMainDishes(prev => prev.filter(name => name !== dishName));
    setDishLimitNotice("");
  };

  // Side Dish Menu Box Selection Handlers
  const handleSideClick = (dish) => {
    const isAlreadySelected = selectedSides.includes(dish.name);
    if (isAlreadySelected) {
      setSelectedSides(prev => prev.filter(name => name !== dish.name));
      setSideLimitNotice("");
      return;
    }

    if (courseAllowances.regSidesCount === 1) {
      setSelectedSides([dish.name]);
      setSideLimitNotice("");
      return;
    }

    if (selectedSides.length >= courseAllowances.regSidesCount) {
      setSideLimitNotice(
        `Side dishes allowance reached: You've selected ${courseAllowances.regSidesCount} of ${courseAllowances.regSidesCount} regular sides for ${currentPkg.name}. Click any selected menu box to deselect or swap.`
      );
      return;
    }

    setSelectedSides(prev => [...prev, dish.name]);
    setSideLimitNotice("");
  };

  const handleRemoveSide = (dishName) => {
    setSelectedSides(prev => prev.filter(name => name !== dishName));
    setSideLimitNotice("");
  };

  const handleSpecialSideClick = (dish) => {
    if (selectedSpecialSide === dish.name) {
      setSelectedSpecialSide("");
    } else {
      setSelectedSpecialSide(dish.name);
    }
  };

  // Dessert Menu Box Selection Handlers
  const handleDessertClick = (dish) => {
    const isAlreadySelected = selectedDessertsList.includes(dish.name);
    if (isAlreadySelected) {
      setSelectedDessertsList(prev => prev.filter(name => name !== dish.name));
      setDessertLimitNotice("");
      return;
    }

    if (courseAllowances.regDessertsCount === 1) {
      setSelectedDessertsList([dish.name]);
      setDessertLimitNotice("");
      return;
    }

    if (selectedDessertsList.length >= courseAllowances.regDessertsCount) {
      setDessertLimitNotice(
        `Desserts allowance reached: You've selected ${courseAllowances.regDessertsCount} of ${courseAllowances.regDessertsCount} regular desserts for ${currentPkg.name}. Click any selected menu box to deselect or swap.`
      );
      return;
    }

    setSelectedDessertsList(prev => [...prev, dish.name]);
    setDessertLimitNotice("");
  };

  const handleRemoveDessert = (dishName) => {
    setSelectedDessertsList(prev => prev.filter(name => name !== dishName));
    setDessertLimitNotice("");
  };

  const handleSpecialDessertClick = (dish) => {
    if (selectedSpecialDessert === dish.name) {
      setSelectedSpecialDessert("");
    } else {
      setSelectedSpecialDessert(dish.name);
    }
  };

  const handleDropdownSelect = (categoryKey, newDishName) => {
    if (newDishName === otherDishes[categoryKey]) return;
    const isSpecial = isDishSpecial(categoryKey, newDishName);
    if (isSpecial) {
      const dishObj = getDishObject(categoryKey, newDishName);
      const upgradeRate = getDishUpgradePrice(dishObj);
      setPendingSpecialUpgrade({
        categoryKey,
        dishName: newDishName,
        dishDescription: dishObj?.description || "",
        currentDishName: otherDishes[categoryKey],
        upgradePrice: upgradeRate,
        isOtherDish: true
      });
    } else {
      setOtherDishes(prev => ({ ...prev, [categoryKey]: newDishName }));
    }
  };

  const handleConfirmSpecialUpgrade = () => {
    if (pendingSpecialUpgrade) {
      if (pendingSpecialUpgrade.isOtherDish) {
        setOtherDishes(prev => ({
          ...prev,
          [pendingSpecialUpgrade.categoryKey]: pendingSpecialUpgrade.dishName
        }));
      } else {
        setSelectedMainDishes(prev => {
          if (prev.includes(pendingSpecialUpgrade.dishName)) return prev;
          if (prev.length >= maxMainDishes) return prev;
          return [...prev, pendingSpecialUpgrade.dishName];
        });
        setDishLimitNotice("");
      }
      setPendingSpecialUpgrade(null);
    }
  };

  const handleCancelSpecialUpgrade = () => {
    setPendingSpecialUpgrade(null);
  };

  const renderViandCategory = (categoryKey, categoryTitle, icon) => {
    const allDishes = dishesMenu[categoryKey] || [];
    const regularDishes = allDishes.filter(d => d.tier !== "special" && !d.premium);
    const specialDishes = allDishes.filter(d => d.tier === "special" || d.premium);

    const selectedInCat = allDishes.filter(d => selectedMainDishes.includes(d.name));
    const countInCat = selectedInCat.length;

    return (
      <div className="viand-category-group" key={categoryKey} style={{ marginBottom: "1.75rem" }}>
        <div className="category-badge-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.85rem", flexWrap: "wrap", gap: "0.5rem" }}>
          <span className="category-name" style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)" }}>
            {icon} {categoryTitle}
          </span>
          <span style={{ 
            fontSize: "0.82rem", 
            color: countInCat > 0 ? "var(--gold-600)" : "var(--text-muted)", 
            fontWeight: 700,
            background: countInCat > 0 ? "var(--gold-50)" : "var(--surface)",
            border: countInCat > 0 ? "1px solid var(--gold-300)" : "1px solid var(--border-subtle)",
            padding: "2px 10px",
            borderRadius: "12px"
          }}>
            {countInCat > 0 ? `${countInCat} Selected from this Course` : "0 selected"}
          </span>
        </div>

        {/* REGULAR DISH SECTION */}
        <div style={{ marginBottom: "1.1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.6rem" }}>
            <span style={{ 
              fontSize: "0.74rem", 
              fontWeight: 800, 
              letterSpacing: "0.06em", 
              textTransform: "uppercase",
              color: "#334155", 
              background: "#f1f5f9", 
              border: "1px solid #cbd5e1",
              padding: "2px 8px", 
              borderRadius: "4px" 
            }}>
              (REGULAR DISH)
            </span>
            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
              {regularDishes.length} choices (multiple selections allowed)
            </span>
          </div>

          <div className="dish-options-grid">
            {regularDishes.map(dish => {
              const isSelected = selectedMainDishes.includes(dish.name);
              return (
                <div
                  key={dish.id}
                  className={`dish-card-item ${isSelected ? "selected" : ""}`}
                  onClick={() => handleMainDishClick(categoryKey, dish)}
                  style={{
                    cursor: "pointer",
                    transition: "all 0.18s ease"
                  }}
                >
                  <div className="dish-title">
                    <span>{dish.name}</span>
                    {isSelected && <Check size={16} color="var(--gold-400)" />}
                  </div>
                  {isSelected && (
                    <div style={{ fontSize: "0.68rem", color: "var(--gold-600)", fontWeight: 700, marginTop: "2px" }}>
                      ✓ Selected (Click to remove)
                    </div>
                  )}
                  {dish.description && <div className="dish-desc">{dish.description}</div>}
                </div>
              );
            })}
          </div>
        </div>

        {/* SPECIAL DISH SECTION */}
        {specialDishes.length > 0 && (
          <div style={{ marginTop: "1rem", paddingTop: "0.85rem", borderTop: "1px dashed var(--border-subtle)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.6rem" }}>
              <span style={{ 
                fontSize: "0.74rem", 
                fontWeight: 800, 
                letterSpacing: "0.06em", 
                textTransform: "uppercase",
                color: "#b45309", 
                background: "#fef3c7", 
                border: "1px solid #fde68a",
                padding: "2px 8px", 
                borderRadius: "4px",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px"
              }}>
                ⭐ (SPECIAL DISH)
              </span>
              <span style={{ fontSize: "0.72rem", color: "#b45309", fontWeight: 600 }}>
                {specialDishes.length} chef specialties (upgrades available)
              </span>
            </div>

            <div className="dish-options-grid">
              {specialDishes.map(dish => {
                const isSelected = selectedMainDishes.includes(dish.name);
                return (
                  <div
                    key={dish.id}
                    className={`dish-card-item special-dish-card ${isSelected ? "selected" : ""}`}
                    onClick={() => handleMainDishClick(categoryKey, dish)}
                    style={{
                      cursor: "pointer",
                      borderLeft: isSelected ? "4px solid var(--gold-500)" : "3px solid #f59e0b",
                      background: isSelected ? "var(--gold-50)" : "rgba(254, 243, 199, 0.2)",
                      transition: "all 0.18s ease"
                    }}
                  >
                    <div className="dish-title">
                      <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                        <span>{dish.name}</span>
                      </span>
                      {isSelected && <Check size={16} color="var(--gold-400)" />}
                    </div>
                    <div style={{ display: "inline-block", margin: "2px 0 4px 0" }}>
                      <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "#b45309", background: "#fef3c7", padding: "1px 6px", borderRadius: "10px", border: "1px solid #fcd34d" }}>
                        ⭐ Special Dish (+₱{getDishUpgradePrice(dish)}/pax)
                      </span>
                    </div>
                    {isSelected && (
                      <div style={{ fontSize: "0.68rem", color: "#b45309", fontWeight: 700 }}>
                        ✓ Selected (Click to remove)
                      </div>
                    )}
                    {dish.description && <div className="dish-desc">{dish.description}</div>}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  const compiledQuotationData = () => {
    const eventTypeObj = EVENT_TYPES.find(e => e.id === clientInfo.eventType);
    const quoteId = `QT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const swapDealLabel = swapDeal === "extra_main"
      ? "Waive Rice, Drinks & Dessert ➔ +1 Main Dish"
      : swapDeal === "extra_side"
      ? "Waive Rice & Softdrinks ➔ +1 Side Dish"
      : null;

    const allDishes = [
      ...selectedMainDishes,
      ...selectedSides,
      selectedSpecialSide ? selectedSpecialSide : null,
      ...(swapDeal === "extra_main" ? [] : selectedDessertsList),
      ...(swapDeal === "extra_main" ? [] : (selectedSpecialDessert ? [selectedSpecialDessert] : [])),
      ...(swapDeal !== "none" ? [] : [riceOrSoup]),
      ...(swapDeal !== "none" ? [] : [beverage])
    ].filter(Boolean);

    return {
      id: quoteId,
      createdAt: new Date().toISOString(),
      status: "Draft",
      ...clientInfo,
      eventTypeName: eventTypeObj?.name || clientInfo.eventType,
      packageId: currentPkg.id,
      packageName: currentPkg.name,
      pax,
      pricePerPax: currentPkg.pricePerPax,
      foodTotal,
      swapDeal,
      swapDealLabel,
      mainDishesCount: selectedMainDishes.length,
      maxMainDishes,
      courseAllowances,
      specialDishesCount,
      specialDishesUpgradeRate: DEFAULT_SPECIAL_DISH_UPGRADE_RATE,
      specialDishesUpgradeTotal,
      selectedSpecialDishes: selectedSpecialDishesList,
      dishes: allDishes,
      selectedMainDishes,
      selectedSides,
      selectedSpecialSide: selectedSpecialSide || null,
      selectedDessertsList: swapDeal === "extra_main" ? [] : selectedDessertsList,
      selectedSpecialDessert: swapDeal === "extra_main" ? null : (selectedSpecialDessert || null),
      sideDishes,
      desserts: swapDeal === "extra_main" ? { regular: "Waived (Swapped)", regular2: "", special: null } : desserts,
      riceOrSoup: swapDeal !== "none" ? "Waived (Swapped)" : riceOrSoup,
      beverage: swapDeal !== "none" ? "Waived (Swapped)" : beverage,
      otherDishes: {
        rice: swapDeal !== "none" ? "Waived (Swapped)" : riceOrSoup,
        dessert: swapDeal === "extra_main" 
          ? "Waived (Swapped for +1 Main Dish)" 
          : (courseAllowances.regDessertsCount >= 2 
            ? `${desserts.regular}, ${desserts.regular2 || "Buko Pandan"}` 
            : desserts.regular),
        dessertSpecial: swapDeal === "extra_main" ? null : (selectedSpecialDessert || null),
        drinks: swapDeal !== "none" ? "Waived (Swapped)" : beverage
      },
      selectedAddons: addonsList,
      addonsTotal,
      deliveryLocation,
      deliveryFee,
      subtotal,
      serviceChargePercent: isServiceCharge ? serviceChargePercent : 0,
      serviceCharge,
      isVatEnabled: false,
      vatAmount: 0,
      discountAmount: Number(discountAmount || 0),
      grandTotal,
      downpaymentRequired,
      balanceDue,
      effectivePerPax
    };
  };

  const handlePreviewQuote = () => {
    const quote = compiledQuotationData();
    onGenerateQuote(quote);
  };

  const scrollToSection = (sectionId) => {
    setMissingInclusionsModal(null);
    setTimeout(() => {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        el.style.transition = "box-shadow 0.3s ease, border-color 0.3s ease";
        el.style.boxShadow = "0 0 0 4px rgba(220, 38, 38, 0.4)";
        el.style.borderColor = "#ef4444";
        setTimeout(() => {
          el.style.boxShadow = "";
          el.style.borderColor = "";
        }, 2500);
      }
    }, 120);
  };

  const getMissingInclusions = () => {
    const missing = [];

    // 1. Client Full Name / Company Name
    if (!clientInfo.clientName || !clientInfo.clientName.trim()) {
      missing.push({
        id: "client-name",
        category: "Client & Event Details",
        badge: "Step 1",
        targetId: "section-client-details",
        title: "Client Name or Company Required",
        detail: "Please enter your Full Name or Company Name in Step 1.",
        icon: "👤",
        required: 1,
        current: 0
      });
    }

    // 2. Contact Number
    if (!clientInfo.contactNumber || !clientInfo.contactNumber.trim()) {
      missing.push({
        id: "client-contact",
        category: "Client & Event Details",
        badge: "Step 1",
        targetId: "section-client-details",
        title: "Philippine Contact Number Required",
        detail: "Please provide a valid Philippine mobile or landline number for reservation follow-up.",
        icon: "📞",
        required: 1,
        current: 0
      });
    }

    // 3. Target Event Date
    if (!clientInfo.eventDate || !clientInfo.eventDate.trim()) {
      missing.push({
        id: "event-date",
        category: "Client & Event Details",
        badge: "Step 1",
        targetId: "section-client-details",
        title: "Target Event Date Required",
        detail: "Please select your planned catering event date to check date availability.",
        icon: "📅",
        required: 1,
        current: 0
      });
    } else if (isDateFullyBooked(existingBookings, clientInfo.eventDate)) {
      missing.push({
        id: "event-date-booked",
        category: "Event Date Unavailable",
        badge: "Step 1",
        targetId: "section-client-details",
        title: "Selected Date is Fully Booked",
        detail: `The selected date (${clientInfo.eventDate}) has reached the maximum of ${MAX_CONFIRMED_BOOKINGS_PER_DAY} confirmed events. Please choose another date.`,
        icon: "🚫",
        required: 1,
        current: 0
      });
    }

    // 4. Main Dishes Selection
    const missingMainCount = maxMainDishes - selectedMainDishes.length;
    if (missingMainCount > 0) {
      missing.push({
        id: "main-dishes",
        category: "Main Course Selection",
        badge: "Step 3",
        targetId: "section-main-dishes",
        title: `Missing ${missingMainCount} Main Dish${missingMainCount > 1 ? "es" : ""}`,
        detail: `${currentPkg.name} includes ${maxMainDishes} main courses. You have selected ${selectedMainDishes.length} of ${maxMainDishes}. Please pick ${missingMainCount} more dish(es).`,
        icon: "🍽️",
        required: maxMainDishes,
        current: selectedMainDishes.length
      });
    }

    // 5. Regular Side Dishes
    const regSidesRequired = courseAllowances.regSidesCount || 0;
    if (regSidesRequired > 0) {
      const missingRegSides = regSidesRequired - selectedSides.length;
      if (missingRegSides > 0) {
        missing.push({
          id: "reg-sides",
          category: "Regular Side Dishes",
          badge: "Side Dishes",
          targetId: "section-side-dishes",
          title: `Missing ${missingRegSides} Regular Side Dish${missingRegSides > 1 ? "es" : ""}`,
          detail: `${currentPkg.name} includes ${regSidesRequired} regular side dish${regSidesRequired > 1 ? "es" : ""}. You have chosen ${selectedSides.length} of ${regSidesRequired}. Click a side dish menu box below.`,
          icon: "🥗",
          required: regSidesRequired,
          current: selectedSides.length
        });
      }
    }

    // 6. Special Side Dish
    const specSidesRequired = courseAllowances.specSidesCount || 0;
    if (specSidesRequired > 0 && (!selectedSpecialSide || !selectedSpecialSide.trim())) {
      missing.push({
        id: "spec-side",
        category: "Special Side Dish",
        badge: "Special Side",
        targetId: "section-side-dishes",
        title: "Missing 1 Special Side Dish",
        detail: `${currentPkg.name} includes 1 Chef's Special Side Dish (₱0 upgrade). Please click a Special Side menu box (e.g. Potato Gratin, Vegetable Medley).`,
        icon: "⭐",
        required: 1,
        current: 0
      });
    }

    // 7. Regular Desserts
    const regDessertsRequired = courseAllowances.regDessertsCount || 0;
    if (regDessertsRequired > 0) {
      const missingRegDesserts = regDessertsRequired - selectedDessertsList.length;
      if (missingRegDesserts > 0) {
        missing.push({
          id: "reg-desserts",
          category: "Regular Desserts",
          badge: "Desserts",
          targetId: "section-desserts",
          title: `Missing ${missingRegDesserts} Regular Dessert${missingRegDesserts > 1 ? "s" : ""}`,
          detail: `${currentPkg.name} includes ${regDessertsRequired} regular dessert${regDessertsRequired > 1 ? "s" : ""}. You have chosen ${selectedDessertsList.length} of ${regDessertsRequired}. Click a dessert menu box below.`,
          icon: "🍮",
          required: regDessertsRequired,
          current: selectedDessertsList.length
        });
      }
    }

    // 8. Special Dessert
    const specDessertsRequired = courseAllowances.specDessertsCount || 0;
    if (specDessertsRequired > 0 && (!selectedSpecialDessert || !selectedSpecialDessert.trim())) {
      missing.push({
        id: "spec-dessert",
        category: "Special Dessert",
        badge: "Special Dessert",
        targetId: "section-desserts",
        title: "Missing 1 Special Dessert",
        detail: `${currentPkg.name} includes 1 Special Dessert (₱0 upgrade). Please click a Special Dessert menu box (e.g. Assorted Pinoy Kakanins, Decadent Chocolate Cake).`,
        icon: "⭐",
        required: 1,
        current: 0
      });
    }

    // 9. Rice or Soup Choice (only required if not waived in swap deal)
    if (swapDeal === "none" && (!riceOrSoup || !riceOrSoup.trim())) {
      missing.push({
        id: "rice-soup",
        category: "Rice & Soup Choice",
        badge: "Rice/Soup",
        targetId: "section-rice-drinks",
        title: "Choice of Rice or Soup Required",
        detail: "Please choose your buffet starch (Steamed Jasmine Rice, Garlic Rice, or Savory Hot Soup).",
        icon: "🍚",
        required: 1,
        current: 0
      });
    }

    // 10. Beverage Choice (only required if not waived in swap deal)
    if (swapDeal === "none" && (!beverage || !beverage.trim())) {
      missing.push({
        id: "beverage",
        category: "Beverage Choice",
        badge: "Drinks",
        targetId: "section-rice-drinks",
        title: "Choice of Beverage Required",
        detail: "Please select the included bottomless beverage (Soda or Juice) for your event.",
        icon: "🍹",
        required: 1,
        current: 0
      });
    }

    return missing;
  };

  const handleConfirmBooking = async () => {
    const missing = getMissingInclusions();
    if (missing.length > 0) {
      setMissingInclusionsModal({
        items: missing,
        packageName: currentPkg.name
      });
      setValidationError(`Incomplete selections: ${missing.length} required package item${missing.length > 1 ? "s are" : " is"} missing.`);
      return;
    }

    setValidationError("");
    setMissingInclusionsModal(null);
    const quote = compiledQuotationData();
    quote.status = "Pending";
    const res = await onSaveQuote(quote);
    
    confetti({
      particleCount: 80,
      spread: 80,
      origin: { y: 0.6 }
    });

    setBookingSuccess(quote);
  };

  const handleSaveToDatabase = async () => {
    const quote = compiledQuotationData();
    const res = await onSaveQuote(quote);
    if (res?.success) {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.7 }
      });
    }
  };

  return (
    <div className="calculator-grid">
      {/* Left Column: Interactive Form & Selections */}
      <div className="calculator-controls">
        
        {/* Step 1: Client & Event Information */}
        <div className="card-section" id="section-client-details">
          <div className="section-header">
            <div className="section-title">
              <div className="step-number">1</div>
              <span>Event & Client Details</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              {(clientInfo.clientName || clientInfo.contactNumber || clientInfo.venueName) && (
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="btn-secondary"
                  style={{ padding: "0.25rem 0.6rem", fontSize: "0.75rem", border: "1px solid var(--border-subtle)" }}
                  title="Clear inputs and start a new booking"
                >
                  <RotateCcw size={12} />
                  <span>Start New / Clear</span>
                </button>
              )}
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Philippine Event Setup</span>
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Client Full Name / Company</label>
              <input
                type="text"
                className="form-input"
                value={clientInfo.clientName}
                onChange={(e) => setClientInfo({ ...clientInfo, clientName: e.target.value })}
                placeholder="e.g. Maria Santos / San Miguel Corp"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Contact Number (PH Mobile / Landline)</label>
              <input
                type="text"
                className="form-input"
                value={clientInfo.contactNumber}
                onChange={(e) => setClientInfo({ ...clientInfo, contactNumber: e.target.value })}
                placeholder="0917-XXX-XXXX"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                value={clientInfo.email}
                onChange={(e) => setClientInfo({ ...clientInfo, email: e.target.value })}
                placeholder="client@gmail.com"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Occasion / Event Type</label>
              <select
                className="form-select"
                value={clientInfo.eventType}
                onChange={(e) => setClientInfo({ ...clientInfo, eventType: e.target.value })}
              >
                {EVENT_TYPES.map(evt => (
                  <option key={evt.id} value={evt.id}>{evt.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                <label className="form-label" style={{ marginBottom: 0 }}>Target Event Date *</label>
                <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 600 }}>
                  Max 3 events / day
                </span>
              </div>

              <input
                type="date"
                className="form-input"
                min={new Date().toISOString().split("T")[0]}
                value={clientInfo.eventDate}
                onChange={(e) => {
                  const val = e.target.value;
                  if (!val) {
                    setClientInfo({ ...clientInfo, eventDate: "" });
                    setDateWarning("");
                    return;
                  }
                  if (isDateFullyBooked(existingBookings, val)) {
                    setClientInfo({ ...clientInfo, eventDate: "" });
                    setDateWarning(`🚫 Date Unavailable: ${new Date(val).toLocaleDateString("en-PH", { month: "long", day: "numeric", year: "numeric" })} has reached maximum capacity of ${MAX_CONFIRMED_BOOKINGS_PER_DAY} confirmed events. Please choose another date.`);
                    return;
                  }
                  setDateWarning("");
                  setClientInfo({ ...clientInfo, eventDate: val });
                }}
              />

              {dateWarning && (
                <div style={{ marginTop: "6px", background: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c", padding: "6px 10px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "6px" }}>
                  <AlertTriangle size={15} style={{ flexShrink: 0 }} />
                  <span>{dateWarning}</span>
                </div>
              )}

              {clientInfo.eventDate && !dateWarning && (
                <div style={{ marginTop: "6px", fontSize: "0.74rem", fontWeight: 700 }}>
                  {getRemainingSlotsForDate(existingBookings, clientInfo.eventDate) === 1 ? (
                    <span style={{ color: "#d97706", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                      ⚡ Only 1 slot left for this date! (2 of 3 confirmed)
                    </span>
                  ) : getRemainingSlotsForDate(existingBookings, clientInfo.eventDate) === 2 ? (
                    <span style={{ color: "#059669", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                      ✓ 2 slots available for this date (1 of 3 confirmed)
                    </span>
                  ) : (
                    <span style={{ color: "#059669", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                      ✓ Date Available (All 3 slots open)
                    </span>
                  )}
                </div>
              )}

              {getFullyBookedDatesList(existingBookings).length > 0 && (
                <div style={{ marginTop: "6px", fontSize: "0.72rem", color: "#64748b" }}>
                  <span style={{ fontWeight: 700, color: "#b91c1c" }}>Fully Booked Dates (Closed): </span>
                  {getFullyBookedDatesList(existingBookings).map(d => (
                    <span key={d} style={{ background: "#fee2e2", color: "#991b1b", padding: "1px 6px", borderRadius: "4px", marginRight: "4px", fontWeight: 700 }}>
                      {new Date(d).toLocaleDateString("en-PH", { month: "short", day: "numeric" })}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Buffet Serving Time</label>
              <input
                type="time"
                className="form-input"
                value={clientInfo.eventTime}
                onChange={(e) => setClientInfo({ ...clientInfo, eventTime: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Venue Name</label>
              <input
                type="text"
                className="form-input"
                value={clientInfo.venueName}
                onChange={(e) => setClientInfo({ ...clientInfo, venueName: e.target.value })}
                placeholder="e.g. The Glass Garden / Clubhouse"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Venue Address / City</label>
              <input
                type="text"
                className="form-input"
                value={clientInfo.venueAddress}
                onChange={(e) => setClientInfo({ ...clientInfo, venueAddress: e.target.value })}
                placeholder="e.g. Pasig City, Metro Manila"
              />
            </div>
          </div>
        </div>

        {/* Step 2: Catering Package & Pax Counter */}
        <div className="card-section">
          <div className="section-header">
            <div className="section-title">
              <div className="step-number">2</div>
              <span>Select Catering Package & Guest Count</span>
            </div>
            <span style={{ fontSize: "0.75rem", color: "var(--gold-400)", fontWeight: 700 }}>
              Per Pax Pricing (PHP)
            </span>
          </div>

          <div className="package-tiers-grid">
            {packagesList.map(pkg => (
              <div
                key={pkg.id}
                className={`package-card ${selectedPkgId === pkg.id ? "selected" : ""}`}
                onClick={() => {
                  setSelectedPkgId(pkg.id);
                  if (pax < pkg.minPax) setPax(pkg.minPax);
                }}
              >
                <div className="pkg-badge">{pkg.badge}</div>
                <div className="pkg-name">{pkg.name}</div>
                <div className="pkg-subtitle">{pkg.subtitle}</div>
                <div className="pkg-price-row">
                  <span className="pkg-price">₱{pkg.pricePerPax}</span>
                  <span className="pkg-unit">/ pax (min {pkg.minPax} pax)</span>
                </div>
                <ul className="pkg-inclusions">
                  {pkg.inclusions.slice(0, 4).map((inc, i) => (
                    <li key={i}>
                      <Check size={14} />
                      <span>{inc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Pax Slider & Counter */}
          <div className="pax-slider-card">
            <div className="pax-display-header">
              <div>
                <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)" }}>
                  Number of Guaranteed Guests (Pax)
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  Minimum {currentPkg.minPax} pax required for {currentPkg.name}
                </div>
              </div>

              <div className="pax-count-box">
                <button
                  type="button"
                  className="pax-btn"
                  onClick={() => setPax(prev => Math.max(currentPkg.minPax, prev - 10))}
                  disabled={pax <= currentPkg.minPax}
                >
                  <Minus size={16} />
                </button>
                <input
                  type="number"
                  className="pax-number-input"
                  value={pax}
                  min={currentPkg.minPax}
                  max={1000}
                  onChange={(e) => setPax(Math.max(currentPkg.minPax, Number(e.target.value) || currentPkg.minPax))}
                />
                <button
                  type="button"
                  className="pax-btn"
                  onClick={() => setPax(prev => prev + 10)}
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            <input
              type="range"
              className="pax-slider"
              min={currentPkg.minPax}
              max={500}
              step={5}
              value={pax}
              onChange={(e) => setPax(Number(e.target.value))}
            />

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", color: "var(--text-dim)" }}>
              <span>{currentPkg.minPax} pax</span>
              <span>150 pax</span>
              <span>300 pax</span>
              <span>500+ pax</span>
            </div>
          </div>
        </div>

        {/* Package Bargain & Custom Swap Deals Card */}
        <div className="card-section" id="section-swap-deals" style={{
          background: swapDeal !== "none" ? "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)" : "#ffffff",
          border: swapDeal !== "none" ? "2px solid #f59e0b" : "1px solid var(--border-subtle)",
          borderRadius: "12px",
          padding: "1.25rem",
          marginBottom: "1.25rem",
          transition: "all 0.25s ease"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.75rem", marginBottom: "0.85rem" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ fontSize: "1.35rem" }}>🔄</span>
                <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 800, color: "var(--text-main)" }}>
                  Package Bargain & Inclusion Swap Deals
                </h3>
                {swapDeal !== "none" && (
                  <span style={{
                    background: "#d97706",
                    color: "#ffffff",
                    fontSize: "0.7rem",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    padding: "2px 8px",
                    borderRadius: "12px",
                    letterSpacing: "0.04em"
                  }}>
                    Active Swap
                  </span>
                )}
              </div>
              <p style={{ margin: "4px 0 0 0", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                Want to customize inclusions? Authorized swap rules allow trading starch, beverages, and sweets for more hearty viands or pasta:
              </p>
            </div>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "0.75rem"
          }}>
            {/* Option 1: Standard Inclusions */}
            <div
              onClick={() => setSwapDeal("none")}
              style={{
                cursor: "pointer",
                padding: "0.85rem 1rem",
                borderRadius: "10px",
                border: swapDeal === "none" ? "2px solid var(--gold-500)" : "1px solid #e2e8f0",
                background: swapDeal === "none" ? "var(--gold-50, #fefce8)" : "#ffffff",
                transition: "all 0.2s ease"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                <span style={{ fontWeight: 800, fontSize: "0.88rem", color: "#0f172a" }}>
                  Standard Inclusions
                </span>
                {swapDeal === "none" && <Check size={18} color="var(--gold-500)" />}
              </div>
              <div style={{ fontSize: "0.76rem", color: "#64748b", lineHeight: 1.35 }}>
                Standard package setup: {baseCourseAllowances.mainDishesCount} Main Viands, {baseCourseAllowances.regSidesCount} Side(s), Desserts, Steamed Rice & Bottomless Drinks.
              </div>
            </div>

            {/* Option 2: No Rice + No Drinks + No Dessert -> +1 Extra Main */}
            <div
              onClick={() => setSwapDeal("extra_main")}
              style={{
                cursor: "pointer",
                padding: "0.85rem 1rem",
                borderRadius: "10px",
                border: swapDeal === "extra_main" ? "2px solid #b45309" : "1px solid #fed7aa",
                background: swapDeal === "extra_main" ? "#fff7ed" : "#fffaf5",
                transition: "all 0.2s ease"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                <span style={{ fontWeight: 800, fontSize: "0.88rem", color: "#9a3412", display: "flex", alignItems: "center", gap: "4px" }}>
                  <span>🥩</span>
                  <span>+1 Extra Main Dish</span>
                </span>
                {swapDeal === "extra_main" ? (
                  <Check size={18} color="#b45309" />
                ) : (
                  <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "#c2410c", background: "#ffedd5", padding: "1px 6px", borderRadius: "8px" }}>
                    Bargain Deal
                  </span>
                )}
              </div>
              <div style={{ fontSize: "0.76rem", color: "#7c2d12", lineHeight: 1.35 }}>
                <strong>Waive:</strong> No Rice + No Drinks + No Dessert<br />
                <strong>Equivalent:</strong> <strong>+{baseCourseAllowances.mainDishesCount + 1} Total Main Viands</strong> (+1 viand from Beef, Pork, Chicken, or Seafood).
              </div>
            </div>

            {/* Option 3: No Rice + No Softdrinks -> +1 Extra Side Dish */}
            <div
              onClick={() => setSwapDeal("extra_side")}
              style={{
                cursor: "pointer",
                padding: "0.85rem 1rem",
                borderRadius: "10px",
                border: swapDeal === "extra_side" ? "2px solid #15803d" : "1px solid #bbf7d0",
                background: swapDeal === "extra_side" ? "#f0fdf4" : "#f8fdf9",
                transition: "all 0.2s ease"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                <span style={{ fontWeight: 800, fontSize: "0.88rem", color: "#166534", display: "flex", alignItems: "center", gap: "4px" }}>
                  <span>🥗</span>
                  <span>+1 Extra Side Dish</span>
                </span>
                {swapDeal === "extra_side" ? (
                  <Check size={18} color="#15803d" />
                ) : (
                  <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "#15803d", background: "#dcfce7", padding: "1px 6px", borderRadius: "8px" }}>
                    Bargain Deal
                  </span>
                )}
              </div>
              <div style={{ fontSize: "0.76rem", color: "#14532d", lineHeight: 1.35 }}>
                <strong>Waive:</strong> No Rice + No Softdrinks<br />
                <strong>Equivalent:</strong> <strong>+{baseCourseAllowances.regSidesCount + 1} Total Side Dishes</strong> (+1 Pasta or Veg dish). Desserts remain included!
              </div>
            </div>
          </div>
        </div>

        {/* Step 3: Authentic Filipino Viands Picker */}
        <div className="card-section" id="section-main-dishes">
          <div className="section-header">
            <div className="section-title">
              <div className="step-number">3</div>
              <span>Filipino Viand & Course Selection</span>
            </div>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              {maxMainDishes} Main Dishes Included
            </span>
          </div>

          {/* MAIN DISHES ALLOWANCE TRACKER BANNER */}
          <div style={{
            background: selectedMainDishes.length === maxMainDishes 
              ? "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)" 
              : "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)",
            border: selectedMainDishes.length === maxMainDishes ? "1px solid #86efac" : "1px solid #fde68a",
            borderRadius: "12px",
            padding: "1rem 1.25rem",
            marginBottom: "1.5rem"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ fontSize: "1.25rem" }}>🍽️</span>
                  <span style={{ fontWeight: 800, fontSize: "1.05rem", color: selectedMainDishes.length === maxMainDishes ? "#166534" : "#92400e" }}>
                    Main Dishes Allowance: {selectedMainDishes.length} of {maxMainDishes} Selected
                  </span>
                  {selectedMainDishes.length === maxMainDishes && (
                    <span style={{ background: "#16a34a", color: "#fff", fontSize: "0.72rem", fontWeight: 700, padding: "2px 8px", borderRadius: "12px" }}>
                      Complete ✓
                    </span>
                  )}
                </div>
                <p style={{ margin: "4px 0 0 0", fontSize: "0.8rem", color: selectedMainDishes.length === maxMainDishes ? "#15803d" : "#b45309" }}>
                  {selectedMainDishes.length === maxMainDishes
                    ? `You've selected all ${maxMainDishes} main dishes for ${currentPkg.name}. You can click any selected dish to remove or swap it.`
                    : `Pick ${maxMainDishes - selectedMainDishes.length} more main dish(es). You can choose multiple dishes from the same course (e.g. 2 Beef, 2 Chicken, etc.)!`}
                </p>
              </div>
              <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-secondary)" }}>
                Package: <span style={{ color: "var(--gold-600)" }}>{currentPkg.name}</span>
              </div>
            </div>

            {/* Chips of currently selected main dishes with quick remove 'X' */}
            {selectedMainDishes.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.85rem", paddingTop: "0.75rem", borderTop: "1px dashed rgba(0,0,0,0.12)" }}>
                {selectedMainDishes.map((dishName, idx) => {
                  const dishObj = getDishObject("", dishName);
                  const isSpecial = dishObj && (dishObj.tier === "special" || dishObj.premium);
                  return (
                    <div
                      key={dishName + idx}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        background: isSpecial ? "#fef3c7" : "#ffffff",
                        border: isSpecial ? "1px solid #f59e0b" : "1px solid #cbd5e1",
                        color: isSpecial ? "#92400e" : "#1e293b",
                        padding: "4px 10px",
                        borderRadius: "20px",
                        fontSize: "0.78rem",
                        fontWeight: 600,
                        boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
                      }}
                    >
                      {isSpecial && <span>⭐</span>}
                      <span>{dishName}</span>
                      {isSpecial && <span style={{ fontSize: "0.7rem", color: "#b45309" }}>(+₱{getDishUpgradePrice(dishObj)}/pax)</span>}
                      <button
                        type="button"
                        onClick={() => handleRemoveMainDish(dishName)}
                        title="Remove dish"
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: "2px",
                          display: "inline-flex",
                          alignItems: "center",
                          color: "#ef4444",
                          marginLeft: "2px"
                        }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {dishLimitNotice && (
              <div style={{ marginTop: "0.65rem", background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", padding: "6px 12px", borderRadius: "8px", fontSize: "0.78rem", fontWeight: 600 }}>
                ⚠️ {dishLimitNotice}
              </div>
            )}
          </div>

          {/* Beef Options */}
          {renderViandCategory("beef", "Beef Course", "🥩")}

          {/* Pork Options */}
          {renderViandCategory("pork", "Pork Course", "🍖")}

          {/* Chicken Options */}
          {renderViandCategory("chicken", "Chicken Course", "🍗")}

          {/* Seafood Options */}
          {renderViandCategory("fish", "Seafood Course", "🐟")}
        </div>

        {/* Dedicated Section: Side Dish Selection with MENU BOXES */}
        <div className="card-section" id="section-side-dishes" style={{ marginTop: "1.25rem" }}>
          <div className="section-header">
            <div className="section-title">
              <span style={{ fontSize: "1.25rem" }}>🥗</span>
              <span>Side Dish Selection (Pasta & Vegetables)</span>
            </div>
            <span style={{ 
              fontSize: "0.78rem", 
              fontWeight: 700,
              color: "#166534", 
              background: "#dcfce7", 
              padding: "3px 10px", 
              borderRadius: "12px", 
              border: "1px solid #86efac" 
            }}>
              Included: {courseAllowances.regSidesCount} Regular Side{courseAllowances.regSidesCount > 1 ? "s" : ""}{courseAllowances.specSidesCount > 0 ? ` + ${courseAllowances.specSidesCount} Special Side` : ""}
            </span>
          </div>

          {/* ALLOWANCE TRACKER BANNER FOR SIDES */}
          <div style={{
            background: selectedSides.length === courseAllowances.regSidesCount 
              ? "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)" 
              : "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)",
            border: selectedSides.length === courseAllowances.regSidesCount ? "1px solid #86efac" : "1px solid #fde68a",
            borderRadius: "12px",
            padding: "1rem 1.25rem",
            marginBottom: "1.25rem"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ fontSize: "1.25rem" }}>🥗</span>
                  <span style={{ fontWeight: 800, fontSize: "1.05rem", color: selectedSides.length === courseAllowances.regSidesCount ? "#166534" : "#92400e" }}>
                    Regular Sides Allowance: {selectedSides.length} of {courseAllowances.regSidesCount} Selected
                  </span>
                  {selectedSides.length === courseAllowances.regSidesCount && (
                    <span style={{ background: "#16a34a", color: "#fff", fontSize: "0.72rem", fontWeight: 700, padding: "2px 8px", borderRadius: "12px" }}>
                      Complete ✓
                    </span>
                  )}
                </div>
                <p style={{ margin: "4px 0 0 0", fontSize: "0.8rem", color: selectedSides.length === courseAllowances.regSidesCount ? "#15803d" : "#b45309" }}>
                  {selectedSides.length === courseAllowances.regSidesCount
                    ? `You've selected all ${courseAllowances.regSidesCount} regular side dish menu box(es) for ${currentPkg.name}. Click any menu box below to change.`
                    : `Please click ${courseAllowances.regSidesCount - selectedSides.length} more side dish menu box below to complete your inclusion.`}
                </p>
              </div>
              <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-secondary)" }}>
                Package: <span style={{ color: "var(--gold-600)" }}>{currentPkg.name}</span>
              </div>
            </div>

            {/* Chips of currently selected side dishes with quick remove 'X' */}
            {selectedSides.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.85rem", paddingTop: "0.75rem", borderTop: "1px dashed rgba(0,0,0,0.12)" }}>
                {selectedSides.map((dishName) => (
                  <div
                    key={dishName}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      background: "#ffffff",
                      border: "1px solid #86efac",
                      color: "#166534",
                      padding: "4px 10px",
                      borderRadius: "20px",
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
                    }}
                  >
                    <span>🥗 {dishName}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSide(dishName)}
                      title="Remove side"
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: "2px",
                        display: "inline-flex",
                        alignItems: "center",
                        color: "#ef4444",
                        marginLeft: "2px"
                      }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {sideLimitNotice && (
              <div style={{ marginTop: "0.65rem", background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", padding: "6px 12px", borderRadius: "8px", fontSize: "0.78rem", fontWeight: 600 }}>
                ⚠️ {sideLimitNotice}
              </div>
            )}
          </div>

          {/* REGULAR SIDE DISHES MENU BOXES GRID */}
          <div style={{ marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
              <span style={{ 
                fontSize: "0.74rem", 
                fontWeight: 800, 
                letterSpacing: "0.06em", 
                textTransform: "uppercase", 
                color: "#166534", 
                background: "#dcfce7", 
                border: "1px solid #86efac",
                padding: "2px 8px", 
                borderRadius: "4px" 
              }}>
                REGULAR SIDE DISHES ({courseAllowances.regSidesCount} Included)
              </span>
              <span style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>
                Click any menu box to select
              </span>
            </div>

            <div className="dish-options-grid">
              {(dishesMenu.noodlesOrVeg || []).filter(d => d.tier !== "special" && !d.premium).map(dish => {
                const isSelected = selectedSides.includes(dish.name);
                return (
                  <div
                    key={dish.id}
                    className={`dish-card-item ${isSelected ? "selected" : ""}`}
                    onClick={() => handleSideClick(dish)}
                    style={{
                      cursor: "pointer",
                      transition: "all 0.18s ease"
                    }}
                  >
                    <div className="dish-title">
                      <span>{dish.name}</span>
                      {isSelected && <Check size={16} color="var(--gold-400)" />}
                    </div>
                    {isSelected && (
                      <div style={{ fontSize: "0.68rem", color: "var(--gold-600)", fontWeight: 700, marginTop: "2px" }}>
                        ✓ Selected (Click to remove)
                      </div>
                    )}
                    {dish.description && <div className="dish-desc">{dish.description}</div>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* SPECIAL SIDE DISH MENU BOXES (Included in Package 4, or Upgradeable for ₱65/pax) */}
          <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px dashed var(--border-subtle)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem", flexWrap: "wrap", gap: "0.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ 
                  fontSize: "0.74rem", 
                  fontWeight: 800, 
                  letterSpacing: "0.06em", 
                  textTransform: "uppercase", 
                  color: "#92400e", 
                  background: "#fef3c7", 
                  border: "1px solid #fde68a",
                  padding: "2px 8px", 
                  borderRadius: "4px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px"
                }}>
                  ⭐ SPECIAL SIDE DISH
                </span>
                <span style={{ 
                  fontSize: "0.72rem", 
                  color: courseAllowances.specSidesCount > 0 ? "#166534" : "#b45309", 
                  fontWeight: 700, 
                  background: courseAllowances.specSidesCount > 0 ? "#dcfce7" : "#fef3c7", 
                  padding: "2px 8px", 
                  borderRadius: "10px", 
                  border: courseAllowances.specSidesCount > 0 ? "1px solid #86efac" : "1px solid #fcd34d" 
                }}>
                  {courseAllowances.specSidesCount > 0 ? "⭐ Included in Package (₱0 Fee)" : "⭐ Upgrade Available (+₱65/pax)"}
                </span>
              </div>
              {selectedSpecialSide && (
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontSize: "0.78rem", color: "#92400e", fontWeight: 700 }}>
                    Selected: {selectedSpecialSide} {courseAllowances.specSidesCount > 0 ? "(Included)" : "(+₱65/pax)"} ✓
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedSpecialSide("")}
                    title="Remove Special Side"
                    style={{
                      background: "#fee2e2",
                      border: "1px solid #fca5a5",
                      borderRadius: "50%",
                      width: "18px",
                      height: "18px",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      color: "#b91c1c",
                      fontSize: "10px",
                      fontWeight: 800
                    }}
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>

            <div className="dish-options-grid">
              {(dishesMenu.noodlesOrVeg || []).filter(d => d.tier === "special" || d.premium).map(dish => {
                const isSelected = selectedSpecialSide === dish.name;
                return (
                  <div
                    key={dish.id}
                    className={`dish-card-item special-dish-card ${isSelected ? "selected" : ""}`}
                    onClick={() => handleSpecialSideClick(dish)}
                    style={{
                      cursor: "pointer",
                      borderLeft: isSelected ? "4px solid var(--gold-500)" : "3px solid #f59e0b",
                      background: isSelected ? "var(--gold-50)" : "rgba(254, 243, 199, 0.2)",
                      transition: "all 0.18s ease"
                    }}
                  >
                    <div className="dish-title">
                      <span>⭐ {dish.name}</span>
                      {isSelected && <Check size={16} color="var(--gold-400)" />}
                    </div>
                    <div style={{ display: "inline-block", margin: "2px 0 4px 0" }}>
                      <span style={{ 
                        fontSize: "0.68rem", 
                        fontWeight: 700, 
                        color: courseAllowances.specSidesCount > 0 ? "#166534" : "#b45309", 
                        background: courseAllowances.specSidesCount > 0 ? "#dcfce7" : "#fef3c7", 
                        padding: "1px 6px", 
                        borderRadius: "10px", 
                        border: courseAllowances.specSidesCount > 0 ? "1px solid #86efac" : "1px solid #fcd34d" 
                      }}>
                        {courseAllowances.specSidesCount > 0 ? "⭐ Included (₱0 Fee)" : "⭐ Upgrade (+₱65/pax)"}
                      </span>
                    </div>
                    {isSelected && (
                      <div style={{ fontSize: "0.68rem", color: "#b45309", fontWeight: 700 }}>
                        ✓ Selected {courseAllowances.specSidesCount > 0 ? "(Included)" : "(+₱65/pax Upgrade)"} (Click to deselect)
                      </div>
                    )}
                    {dish.description && <div className="dish-desc">{dish.description}</div>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Dedicated Section: Dessert Selection with MENU BOXES */}
        <div className="card-section" id="section-desserts" style={{ marginTop: "1.25rem" }}>
          <div className="section-header">
            <div className="section-title">
              <span style={{ fontSize: "1.25rem" }}>🍮</span>
              <span>Dessert Selection</span>
            </div>
            <span style={{ 
              fontSize: "0.78rem", 
              fontWeight: 700,
              color: swapDeal === "extra_main" ? "#b45309" : "#166534", 
              background: swapDeal === "extra_main" ? "#fef3c7" : "#dcfce7", 
              padding: "3px 10px", 
              borderRadius: "12px", 
              border: swapDeal === "extra_main" ? "1px solid #fde68a" : "1px solid #86efac" 
            }}>
              {swapDeal === "extra_main" 
                ? "Waived (Swapped for +1 Main Dish)" 
                : `Included: ${courseAllowances.regDessertsCount} Regular Dessert${courseAllowances.specDessertsCount > 0 ? ` + ${courseAllowances.specDessertsCount} Special Dessert` : ""}`}
            </span>
          </div>

          {swapDeal === "extra_main" ? (
            <div style={{
              background: "#fffaf5",
              border: "2px dashed #fdba74",
              borderRadius: "12px",
              padding: "1.75rem 1.5rem",
              textAlign: "center"
            }}>
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🔄</div>
              <div style={{ fontSize: "1.05rem", fontWeight: 800, color: "#9a3412" }}>
                Desserts Waived for +1 Extra Main Dish
              </div>
              <p style={{ margin: "6px auto 0 auto", maxWidth: "480px", fontSize: "0.82rem", color: "#7c2d12", lineHeight: 1.45 }}>
                Under the active bargain deal, all dessert allowances have been swapped to give your package an extra hearty Main Viand (+1 Beef, Pork, Chicken, or Seafood).
              </p>
              <button
                type="button"
                onClick={() => setSwapDeal("none")}
                style={{
                  marginTop: "1rem",
                  background: "#ffffff",
                  border: "1px solid #fed7aa",
                  color: "#c2410c",
                  fontWeight: 700,
                  fontSize: "0.78rem",
                  padding: "6px 14px",
                  borderRadius: "8px",
                  cursor: "pointer"
                }}
              >
                Restore Desserts (Switch to Standard Inclusions)
              </button>
            </div>
          ) : (
            <>
              {/* ALLOWANCE TRACKER BANNER FOR DESSERTS */}
          <div style={{
            background: selectedDessertsList.length === courseAllowances.regDessertsCount 
              ? "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)" 
              : "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)",
            border: selectedDessertsList.length === courseAllowances.regDessertsCount ? "1px solid #86efac" : "1px solid #fde68a",
            borderRadius: "12px",
            padding: "1rem 1.25rem",
            marginBottom: "1.25rem"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ fontSize: "1.25rem" }}>🍮</span>
                  <span style={{ fontWeight: 800, fontSize: "1.05rem", color: selectedDessertsList.length === courseAllowances.regDessertsCount ? "#166534" : "#92400e" }}>
                    Regular Desserts Allowance: {selectedDessertsList.length} of {courseAllowances.regDessertsCount} Selected
                  </span>
                  {selectedDessertsList.length === courseAllowances.regDessertsCount && (
                    <span style={{ background: "#16a34a", color: "#fff", fontSize: "0.72rem", fontWeight: 700, padding: "2px 8px", borderRadius: "12px" }}>
                      Complete ✓
                    </span>
                  )}
                </div>
                <p style={{ margin: "4px 0 0 0", fontSize: "0.8rem", color: selectedDessertsList.length === courseAllowances.regDessertsCount ? "#15803d" : "#b45309" }}>
                  {selectedDessertsList.length === courseAllowances.regDessertsCount
                    ? `You've selected all ${courseAllowances.regDessertsCount} regular dessert menu box(es) for ${currentPkg.name}. Click any menu box below to change.`
                    : `Please click ${courseAllowances.regDessertsCount - selectedDessertsList.length} more dessert menu box below.`}
                </p>
              </div>
              <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-secondary)" }}>
                Package: <span style={{ color: "var(--gold-600)" }}>{currentPkg.name}</span>
              </div>
            </div>

            {/* Chips of currently selected desserts with quick remove 'X' */}
            {selectedDessertsList.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.85rem", paddingTop: "0.75rem", borderTop: "1px dashed rgba(0,0,0,0.12)" }}>
                {selectedDessertsList.map((dishName) => (
                  <div
                    key={dishName}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      background: "#ffffff",
                      border: "1px solid #86efac",
                      color: "#166534",
                      padding: "4px 10px",
                      borderRadius: "20px",
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
                    }}
                  >
                    <span>🍮 {dishName}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveDessert(dishName)}
                      title="Remove dessert"
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: "2px",
                        display: "inline-flex",
                        alignItems: "center",
                        color: "#ef4444",
                        marginLeft: "2px"
                      }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {dessertLimitNotice && (
              <div style={{ marginTop: "0.65rem", background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", padding: "6px 12px", borderRadius: "8px", fontSize: "0.78rem", fontWeight: 600 }}>
                ⚠️ {dessertLimitNotice}
              </div>
            )}
          </div>

          {/* REGULAR DESSERTS MENU BOXES GRID */}
          <div style={{ marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
              <span style={{ 
                fontSize: "0.74rem", 
                fontWeight: 800, 
                letterSpacing: "0.06em", 
                textTransform: "uppercase", 
                color: "#166534", 
                background: "#dcfce7", 
                border: "1px solid #86efac",
                padding: "2px 8px", 
                borderRadius: "4px" 
              }}>
                REGULAR DESSERTS ({courseAllowances.regDessertsCount} Included)
              </span>
              <span style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>
                Click any menu box to select
              </span>
            </div>

            <div className="dish-options-grid">
              {(dishesMenu.dessert || []).filter(d => d.tier !== "special" && !d.premium).map(dish => {
                const isSelected = selectedDessertsList.includes(dish.name);
                return (
                  <div
                    key={dish.id}
                    className={`dish-card-item ${isSelected ? "selected" : ""}`}
                    onClick={() => handleDessertClick(dish)}
                    style={{
                      cursor: "pointer",
                      transition: "all 0.18s ease"
                    }}
                  >
                    <div className="dish-title">
                      <span>{dish.name}</span>
                      {isSelected && <Check size={16} color="var(--gold-400)" />}
                    </div>
                    {isSelected && (
                      <div style={{ fontSize: "0.68rem", color: "var(--gold-600)", fontWeight: 700, marginTop: "2px" }}>
                        ✓ Selected (Click to remove)
                      </div>
                    )}
                    {dish.description && <div className="dish-desc">{dish.description}</div>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* SPECIAL DESSERT MENU BOXES (Included in Package 3 & 4, or Upgradeable for ₱65/pax) */}
          <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px dashed var(--border-subtle)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem", flexWrap: "wrap", gap: "0.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ 
                  fontSize: "0.74rem", 
                  fontWeight: 800, 
                  letterSpacing: "0.06em", 
                  textTransform: "uppercase", 
                  color: "#92400e", 
                  background: "#fef3c7", 
                  border: "1px solid #fde68a",
                  padding: "2px 8px", 
                  borderRadius: "4px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px"
                }}>
                  ⭐ SPECIAL DESSERT
                </span>
                <span style={{ 
                  fontSize: "0.72rem", 
                  color: courseAllowances.specDessertsCount > 0 ? "#166534" : "#b45309", 
                  fontWeight: 700, 
                  background: courseAllowances.specDessertsCount > 0 ? "#dcfce7" : "#fef3c7", 
                  padding: "2px 8px", 
                  borderRadius: "10px", 
                  border: courseAllowances.specDessertsCount > 0 ? "1px solid #86efac" : "1px solid #fcd34d" 
                }}>
                  {courseAllowances.specDessertsCount > 0 ? "⭐ Included in Package (₱0 Fee)" : "⭐ Upgrade Available (+₱65/pax)"}
                </span>
              </div>
              {selectedSpecialDessert && (
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontSize: "0.78rem", color: "#92400e", fontWeight: 700 }}>
                    Selected: {selectedSpecialDessert} {courseAllowances.specDessertsCount > 0 ? "(Included)" : "(+₱65/pax)"} ✓
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedSpecialDessert("")}
                    title="Remove Special Dessert"
                    style={{
                      background: "#fee2e2",
                      border: "1px solid #fca5a5",
                      borderRadius: "50%",
                      width: "18px",
                      height: "18px",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      color: "#b91c1c",
                      fontSize: "10px",
                      fontWeight: 800
                    }}
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>

            <div className="dish-options-grid">
              {(dishesMenu.dessert || []).filter(d => d.tier === "special" || d.premium).map(dish => {
                const isSelected = selectedSpecialDessert === dish.name;
                return (
                  <div
                    key={dish.id}
                    className={`dish-card-item special-dish-card ${isSelected ? "selected" : ""}`}
                    onClick={() => handleSpecialDessertClick(dish)}
                    style={{
                      cursor: "pointer",
                      borderLeft: isSelected ? "4px solid var(--gold-500)" : "3px solid #f59e0b",
                      background: isSelected ? "var(--gold-50)" : "rgba(254, 243, 199, 0.2)",
                      transition: "all 0.18s ease"
                    }}
                  >
                    <div className="dish-title">
                      <span>⭐ {dish.name}</span>
                      {isSelected && <Check size={16} color="var(--gold-400)" />}
                    </div>
                    <div style={{ display: "inline-block", margin: "2px 0 4px 0" }}>
                      <span style={{ 
                        fontSize: "0.68rem", 
                        fontWeight: 700, 
                        color: courseAllowances.specDessertsCount > 0 ? "#166534" : "#b45309", 
                        background: courseAllowances.specDessertsCount > 0 ? "#dcfce7" : "#fef3c7", 
                        padding: "1px 6px", 
                        borderRadius: "10px", 
                        border: courseAllowances.specDessertsCount > 0 ? "1px solid #86efac" : "1px solid #fcd34d" 
                      }}>
                        {courseAllowances.specDessertsCount > 0 ? "⭐ Included (₱0 Fee)" : "⭐ Upgrade (+₱65/pax)"}
                      </span>
                    </div>
                    {isSelected && (
                      <div style={{ fontSize: "0.68rem", color: "#b45309", fontWeight: 700 }}>
                        ✓ Selected {courseAllowances.specDessertsCount > 0 ? "(Included)" : "(+₱65/pax Upgrade)"} (Click to deselect)
                      </div>
                    )}
                    {dish.description && <div className="dish-desc">{dish.description}</div>}
                  </div>
                );
              })}
            </div>
          </div>
            </>
          )}
        </div>

        {/* Dedicated Section: Choice of Rice/Soup and Soda/Juice */}
        <div className="card-section" id="section-rice-drinks" style={{ marginTop: "1.25rem" }}>
          <div className="section-header">
            <div className="section-title">
              <span style={{ fontSize: "1.25rem" }}>🍚</span>
              <span>Rice, Soup & Beverage Choices</span>
            </div>
            <span style={{ 
              fontSize: "0.75rem", 
              fontWeight: 700,
              color: swapDeal !== "none" ? "#b45309" : "var(--text-muted)",
              background: swapDeal !== "none" ? "#fef3c7" : "transparent",
              padding: swapDeal !== "none" ? "2px 8px" : "0",
              borderRadius: "8px",
              border: swapDeal !== "none" ? "1px solid #fde68a" : "none"
            }}>
              {swapDeal !== "none" 
                ? `Waived (Swapped for +1 ${swapDeal === "extra_main" ? "Main Dish" : "Side Dish"})` 
                : "Included in Package"}
            </span>
          </div>

          {swapDeal !== "none" ? (
            <div style={{
              background: swapDeal === "extra_main" ? "#fffaf5" : "#f0fdf4",
              border: swapDeal === "extra_main" ? "2px dashed #fdba74" : "2px dashed #86efac",
              borderRadius: "12px",
              padding: "1.75rem 1.5rem",
              textAlign: "center"
            }}>
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🔄</div>
              <div style={{ fontSize: "1.05rem", fontWeight: 800, color: swapDeal === "extra_main" ? "#9a3412" : "#166534" }}>
                Rice & Drinks Waived for +1 Extra {swapDeal === "extra_main" ? "Main Dish" : "Side Dish"}
              </div>
              <p style={{ margin: "6px auto 0 auto", maxWidth: "480px", fontSize: "0.82rem", color: swapDeal === "extra_main" ? "#7c2d12" : "#14532d", lineHeight: 1.45 }}>
                Under the active bargain deal, Rice/Soup and Beverage have been waived to grant your package an additional {swapDeal === "extra_main" ? "Main Course (+1 Viand)" : "Side Dish (+1 Pasta/Veg)"}.
              </p>
              <button
                type="button"
                onClick={() => setSwapDeal("none")}
                style={{
                  marginTop: "1rem",
                  background: "#ffffff",
                  border: swapDeal === "extra_main" ? "1px solid #fed7aa" : "1px solid #bbf7d0",
                  color: swapDeal === "extra_main" ? "#c2410c" : "#15803d",
                  fontWeight: 700,
                  fontSize: "0.78rem",
                  padding: "6px 14px",
                  borderRadius: "8px",
                  cursor: "pointer"
                }}
              >
                Restore Rice & Drinks (Switch to Standard Inclusions)
              </button>
            </div>
          ) : (
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">🍚 Choice of: Steamed Rice or Hot Soup *</label>
                <select
                  className="form-select"
                  value={riceOrSoup}
                  onChange={(e) => setRiceOrSoup(e.target.value)}
                >
                  <optgroup label="── RICE CHOICES ──">
                    {(dishesMenu.rice || []).filter(r => r.name.toLowerCase().includes("rice") || r.name.toLowerCase().includes("paella") || r.name.toLowerCase().includes("valenciana")).map(r => (
                      <option key={r.id} value={r.name}>{r.tier === "special" ? "⭐ " : ""}{r.name}</option>
                    ))}
                  </optgroup>
                  <optgroup label="── SOUP CHOICES ──">
                    {(dishesMenu.rice || []).filter(r => !r.name.toLowerCase().includes("rice") && !r.name.toLowerCase().includes("paella") && !r.name.toLowerCase().includes("valenciana")).map(r => (
                      <option key={r.id} value={r.name}>{r.tier === "special" ? "⭐ " : ""}{r.name}</option>
                    ))}
                  </optgroup>
                </select>
                <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "2px", display: "block" }}>
                  Select your buffet starch: Plain Steamed Jasmine Rice, Garlic Rice, or Savory Soup
                </span>
              </div>

              <div className="form-group">
                <label className="form-label">🍹 Choice of: Soda or Juice (Bottomless) *</label>
                <select
                  className="form-select"
                  value={beverage}
                  onChange={(e) => setBeverage(e.target.value)}
                >
                  {(dishesMenu.drinks || []).map(dr => (
                    <option key={dr.id} value={dr.name}>{dr.name}</option>
                  ))}
                </select>
                <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "2px", display: "block" }}>
                  Served ice-cold throughout the 4-hour banquet service
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Step 4: Special Event Add-ons & Stations */}
        <div className="card-section">
          <div className="section-header">
            <div className="section-title">
              <div className="step-number">4</div>
              <span>Philippine Event Add-ons & Live Stations</span>
            </div>
            <span style={{ fontSize: "0.75rem", color: "var(--gold-600)", fontWeight: 600 }}>Optional Upgrades</span>
          </div>

          <div className="addons-grid">
            {(availableAddons || []).map(addon => {
              const isSelected = Boolean(selectedAddons[addon.id]);
              const qty = selectedAddons[addon.id] || 0;

              return (
                <div
                  key={addon.id}
                  className={`addon-card ${isSelected ? "selected" : ""}`}
                  onClick={() => handleAddonToggle(addon.id)}
                >
                  <div className="addon-header-row">
                    <div>
                      <div className="addon-category">{addon.category}</div>
                      <div className="addon-name">{addon.name}</div>
                    </div>
                    {isSelected && (
                      <div style={{ background: "var(--gold-500)", color: "#ffffff", borderRadius: "50%", padding: "3px" }}>
                        <Check size={14} />
                      </div>
                    )}
                  </div>

                  <div className="addon-desc">{addon.description}</div>

                  <div className="addon-footer-row" onClick={(e) => e.stopPropagation()}>
                    <div>
                      <div className="addon-price">₱{addon.price.toLocaleString()}</div>
                      <div className="addon-unit">{addon.unit}</div>
                    </div>

                    {isSelected && (
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <button
                          type="button"
                          className="pax-btn"
                          style={{ width: "28px", height: "28px", fontSize: "1rem" }}
                          onClick={() => handleAddonQty(addon.id, -1)}
                        >
                          <Minus size={12} />
                        </button>
                        <span style={{ fontWeight: 800, minWidth: "20px", textAlign: "center" }}>{qty}</span>
                        <button
                          type="button"
                          className="pax-btn"
                          style={{ width: "28px", height: "28px", fontSize: "1rem" }}
                          onClick={() => handleAddonQty(addon.id, 1)}
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 5: Logistics, Surcharges & Taxes */}
        <div className="card-section">
          <div className="section-header">
            <div className="section-title">
              <div className="step-number">5</div>
              <span>Logistics, Taxes & Discount Settings</span>
            </div>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Billing Configuration</span>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Delivery Location / Transport Zone</label>
              <select
                className="form-select"
                value={deliveryLocation}
                onChange={(e) => setDeliveryLocation(e.target.value)}
              >
                {DELIVERY_LOCATIONS.map(loc => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name} {loc.fee > 0 ? `(+₱${loc.fee.toLocaleString()})` : ""}
                  </option>
                ))}
              </select>
            </div>

            {deliveryLocation === "custom" && (
              <div className="form-group">
                <label className="form-label">Custom Delivery Fee (PHP)</label>
                <input
                  type="number"
                  className="form-input"
                  value={customDeliveryFee}
                  onChange={(e) => setCustomDeliveryFee(Number(e.target.value))}
                  placeholder="₱3,000"
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Promotional / Special Discount (PHP)</label>
              <input
                type="number"
                className="form-input"
                value={discountAmount}
                onChange={(e) => setDiscountAmount(Number(e.target.value))}
                placeholder="0"
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: "2rem", marginTop: "1.25rem", flexWrap: "wrap" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "0.875rem" }}>
              <input
                type="checkbox"
                checked={isServiceCharge}
                onChange={(e) => setIsServiceCharge(e.target.checked)}
                style={{ accentColor: "var(--gold-500)", width: "16px", height: "16px" }}
              />
              <span>Include 10% Catering Service Charge (Staff & Equipment)</span>
            </label>
          </div>
        </div>
      </div>

      {/* Right Column: Sticky Real-time Price Summary & Actions */}
      <div className="sticky-summary-panel">
        <div className="summary-title-row">
          <div className="summary-heading">Quotation Summary</div>
          <span className="pkg-badge" style={{ position: "static" }}>{pax} Pax</span>
        </div>

        {/* Breakdown Items */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          <div className="line-item-row">
            <span>{currentPkg.name}</span>
            <span className="val">₱{foodTotal.toLocaleString()}</span>
          </div>
          <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "-4px" }}>
            ₱{currentPkg.pricePerPax} × {pax} guests ({maxMainDishes} Main Dishes)
          </div>

          {/* Selected Main Dishes Box in Summary */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border-subtle)", borderRadius: "8px", padding: "8px 10px", marginTop: "0.4rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>
              <span>Main Dishes ({selectedMainDishes.length}/{maxMainDishes}):</span>
              <span style={{ color: selectedMainDishes.length === maxMainDishes ? "#059669" : "#d97706" }}>
                {selectedMainDishes.length === maxMainDishes ? "Complete ✓" : `${maxMainDishes - selectedMainDishes.length} needed`}
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              {selectedMainDishes.map((name, i) => (
                <div key={i} style={{ fontSize: "0.72rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "4px" }}>
                  <span>•</span>
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: "6px", paddingTop: "6px", borderTop: "1px dashed var(--border-subtle)", fontSize: "0.72rem", color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: "3px" }}>
              {swapDeal !== "none" && (
                <div style={{ color: "#b45309", fontWeight: 700, background: "#fef3c7", padding: "2px 6px", borderRadius: "4px" }}>
                  🔄 Swap: {swapDeal === "extra_main" ? "Waived Rice, Drinks & Dessert ➔ +1 Main" : "Waived Rice & Drinks ➔ +1 Side"}
                </div>
              )}
              <div>🥗 <strong>Sides ({selectedSides.length}/{courseAllowances.regSidesCount}):</strong> {selectedSides.length > 0 ? selectedSides.join(" • ") : "None selected"}{selectedSpecialSide ? ` • ⭐ ${selectedSpecialSide}${courseAllowances.specSidesCount > 0 ? " (Included)" : " (+₱65/pax)"}` : ""}</div>
              {swapDeal === "extra_main" ? (
                <div>🍮 <strong>Desserts:</strong> <span style={{ fontStyle: "italic", color: "#64748b" }}>Waived (Swapped for +1 Main)</span></div>
              ) : (
                <div>🍮 <strong>Desserts ({selectedDessertsList.length}/{courseAllowances.regDessertsCount}):</strong> {selectedDessertsList.length > 0 ? selectedDessertsList.join(" • ") : "None selected"}{selectedSpecialDessert ? ` • ⭐ ${selectedSpecialDessert}${courseAllowances.specDessertsCount > 0 ? " (Included)" : " (+₱65/pax)"}` : ""}</div>
              )}
              {swapDeal !== "none" ? (
                <div>🍚🍹 <strong>Rice & Beverage:</strong> <span style={{ fontStyle: "italic", color: "#64748b" }}>Waived (Swapped)</span></div>
              ) : (
                <>
                  <div>🍚 <strong>Rice/Soup:</strong> {riceOrSoup}</div>
                  <div>🍹 <strong>Beverage:</strong> {beverage}</div>
                </>
              )}
            </div>
          </div>

          {specialDishesUpgradeTotal > 0 && (
            <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "8px", padding: "8px 10px", marginTop: "0.4rem" }}>
              <div className="line-item-row" style={{ color: "#92400e", fontWeight: 700 }}>
                <span>⭐ Special Dish Upgrades ({specialDishesCount})</span>
                <span className="val" style={{ color: "#b45309" }}>+₱{specialDishesUpgradeTotal.toLocaleString()}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "3px", marginTop: "4px" }}>
                {selectedSpecialDishesList.map(s => (
                  <div key={s.name} style={{ fontSize: "0.72rem", color: "#78350f", display: "flex", justifyContent: "space-between" }}>
                    <span>• {s.name} (+₱{s.upgradePrice}/pax)</span>
                    <span style={{ fontWeight: 600 }}>+₱{(s.upgradePrice * pax).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {addonsList.length > 0 && (
            <>
              <div className="line-item-row" style={{ marginTop: "0.5rem" }}>
                <span>Event Add-ons ({addonsList.length} items)</span>
                <span className="val">₱{addonsTotal.toLocaleString()}</span>
              </div>
              {addonsList.map(a => (
                <div key={a.id} style={{ fontSize: "0.72rem", color: "var(--text-muted)", display: "flex", justifyContent: "space-between" }}>
                  <span>• {a.name} (x{a.qty})</span>
                  <span>₱{a.itemTotal.toLocaleString()}</span>
                </div>
              ))}
            </>
          )}

          <div className="line-item-row" style={{ marginTop: "0.4rem" }}>
            <span>Logistics & Delivery Fee</span>
            <span className="val">₱{deliveryFee.toLocaleString()}</span>
          </div>

          <div className="divider-line" />

          <div className="line-item-row bold">
            <span>Subtotal</span>
            <span className="val">₱{subtotal.toLocaleString()}</span>
          </div>

          {isServiceCharge && (
            <div className="line-item-row">
              <span>Service Charge (10%)</span>
              <span className="val">₱{serviceCharge.toLocaleString()}</span>
            </div>
          )}


          {Number(discountAmount) > 0 && (
            <div className="line-item-row" style={{ color: "var(--emerald-400)" }}>
              <span>Special Discount</span>
              <span className="val">-₱{Number(discountAmount).toLocaleString()}</span>
            </div>
          )}
        </div>

        {/* Grand Total Highlight */}
        <div className="grand-total-box">
          <div className="grand-total-label">Balance Grand Total</div>
          <div className="grand-total-price">₱{grandTotal.toLocaleString()}</div>
          <div className="per-pax-rate">Effective Rate: <strong>₱{effectivePerPax.toLocaleString()} / pax</strong></div>
        </div>

        {/* Actions */}
        <div className="action-btn-group" style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          {validationError && (
            <div 
              onClick={() => {
                const missing = getMissingInclusions();
                if (missing.length > 0) {
                  setMissingInclusionsModal({
                    items: missing,
                    packageName: currentPkg.name
                  });
                }
              }}
              style={{ 
                background: "#fef2f2", 
                border: "1px solid #fecaca", 
                color: "#991b1b", 
                padding: "0.6rem 0.85rem", 
                borderRadius: "8px", 
                fontSize: "0.8rem", 
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "8px",
                transition: "all 0.15s ease"
              }}
              title="Click to view full checklist of missing inclusions"
            >
              <span>⚠️ {validationError}</span>
              <span style={{ fontSize: "0.72rem", background: "#fee2e2", padding: "2px 8px", borderRadius: "4px", color: "#b91c1c", fontWeight: 700, whiteSpace: "nowrap", border: "1px solid #fca5a5" }}>
                View Missing Details →
              </span>
            </div>
          )}

          <button
            type="button"
            className="btn-primary"
            style={{ 
              width: "100%", 
              padding: "0.95rem 1.25rem", 
              fontSize: "1.05rem", 
              fontWeight: 800, 
              background: "var(--gold-gradient)", 
              boxShadow: "0 10px 15px -3px rgba(217, 119, 6, 0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem"
            }}
            onClick={handleConfirmBooking}
            disabled={isSaving}
          >
            <CalendarCheck size={20} />
            <span>{isSaving ? "Submitting Reservation..." : "Confirm & Book This Event"}</span>
          </button>

          <button
            type="button"
            className="btn-secondary"
            style={{ width: "100%", padding: "0.75rem", fontSize: "0.85rem" }}
            onClick={handlePreviewQuote}
          >
            <Printer size={16} />
            <span>View & Print Formal Quotation</span>
          </button>
        </div>
      </div>

      {/* Booking Confirmation Success Modal */}
      {bookingSuccess && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(15, 23, 42, 0.75)",
          backdropFilter: "blur(6px)",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1rem"
        }}>
          <div className="card-section" style={{ maxWidth: "520px", width: "100%", padding: "2.25rem 2rem", textAlign: "center", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)", border: "1px solid var(--border-gold)" }}>
            <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "#ecfdf5", color: "#059669", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem", boxShadow: "0 4px 12px rgba(16, 185, 129, 0.2)" }}>
              <CheckCircle2 size={38} />
            </div>

            <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-primary)" }}>
              Reservation Successfully Booked!
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginTop: "0.4rem" }}>
              Thank you, <strong>{bookingSuccess.clientName}</strong>! Your event booking has been recorded directly into our system.
            </p>

            <div style={{ background: "var(--surface)", border: "1px solid var(--border-subtle)", borderRadius: "10px", padding: "1rem 1.25rem", margin: "1.25rem 0", textAlign: "left" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.45rem" }}>
                <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>Booking Reference ID:</span>
                <span style={{ fontWeight: 800, fontFamily: "monospace", color: "var(--gold-600)", fontSize: "0.95rem" }}>{bookingSuccess.id}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.45rem" }}>
                <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>Package & Guests:</span>
                <span style={{ fontWeight: 600, fontSize: "0.85rem" }}>{bookingSuccess.packageName} ({bookingSuccess.pax} Pax)</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.45rem" }}>
                <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>Target Event Date:</span>
                <span style={{ fontWeight: 600, fontSize: "0.85rem" }}>{bookingSuccess.eventDate || "To be confirmed"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px dashed var(--border-subtle)", paddingTop: "0.45rem", marginTop: "0.45rem" }}>
                <span style={{ fontSize: "0.88rem", fontWeight: 700 }}>Balance Grand Total:</span>
                <span style={{ fontWeight: 800, color: "var(--gold-600)", fontSize: "1.15rem", fontFamily: "monospace" }}>₱{bookingSuccess.grandTotal?.toLocaleString()}</span>
              </div>
            </div>

            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "1.5rem" }}>
              Our banquet coordinator will contact you at <strong>{bookingSuccess.contactNumber}</strong> to verify venue logistics and meal scheduling.
            </p>

            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
              <button 
                type="button"
                className="btn-primary"
                onClick={() => {
                  setBookingSuccess(null);
                  onGenerateQuote(bookingSuccess);
                }}
              >
                <Printer size={16} />
                <span>View & Print Contract</span>
              </button>
              <button 
                type="button"
                className="btn-secondary"
                onClick={() => setBookingSuccess(null)}
              >
                <span>Done</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Special Dish Upgrade Confirmation Modal */}
      {pendingSpecialUpgrade && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(15, 23, 42, 0.75)",
          backdropFilter: "blur(6px)",
          zIndex: 1050,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1rem"
        }}>
          <div className="card-section" style={{
            maxWidth: "500px",
            width: "100%",
            padding: "2rem",
            borderRadius: "16px",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.35)",
            background: "#ffffff",
            border: "2px solid #fde68a",
            textAlign: "left"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.85rem", marginBottom: "1.25rem" }}>
              <div style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: "#fef3c7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.5rem",
                flexShrink: 0
              }}>
                ⭐
              </div>
              <div>
                <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#92400e", margin: 0 }}>
                  Special Dish Upgrade
                </h3>
                <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: 0 }}>
                  Chef's Specialty Selection
                </p>
              </div>
            </div>

            <div style={{ marginBottom: "1.25rem" }}>
              <p style={{ fontSize: "0.95rem", color: "var(--text-primary)", marginBottom: "0.4rem" }}>
                You are selecting <strong style={{ color: "var(--gold-700)" }}>"{pendingSpecialUpgrade.dishName}"</strong>.
              </p>
              {pendingSpecialUpgrade.dishDescription && (
                <p style={{ fontSize: "0.83rem", color: "var(--text-muted)", fontStyle: "italic", background: "#f8fafc", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--border-subtle)", margin: 0 }}>
                  "{pendingSpecialUpgrade.dishDescription}"
                </p>
              )}
            </div>

            <div style={{
              background: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)",
              border: "1px solid #fde68a",
              borderRadius: "10px",
              padding: "1.1rem",
              marginBottom: "1.5rem"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.45rem" }}>
                <span style={{ fontSize: "0.88rem", fontWeight: 600, color: "#92400e" }}>Upgrade Fee:</span>
                <span style={{ fontSize: "1rem", fontWeight: 800, color: "#b45309" }}>₱{pendingSpecialUpgrade.upgradePrice || 65}.00 / pax</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px dashed #f59e0b", paddingTop: "0.45rem" }}>
                <span style={{ fontSize: "0.88rem", fontWeight: 700, color: "#78350f" }}>Total for {pax} guests:</span>
                <span style={{ fontSize: "1.2rem", fontWeight: 800, color: "#b45309" }}>+₱{((pendingSpecialUpgrade.upgradePrice || 65) * pax).toLocaleString()}</span>
              </div>
              <div style={{ fontSize: "0.75rem", color: "#b45309", marginTop: "0.6rem", lineHeight: "1.3" }}>
                Upgrading to this Special Dish adds <strong>₱{pendingSpecialUpgrade.upgradePrice || 65} per pax</strong> to your catering package.
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", flexWrap: "wrap" }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={handleCancelSpecialUpgrade}
                style={{ padding: "0.65rem 1.25rem", fontSize: "0.88rem" }}
              >
                Cancel (Keep Current Dish)
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={handleConfirmSpecialUpgrade}
                style={{
                  background: "linear-gradient(135deg, #d97706, #b45309)",
                  color: "#ffffff",
                  padding: "0.65rem 1.4rem",
                  fontSize: "0.88rem",
                  fontWeight: 700,
                  boxShadow: "0 4px 12px rgba(217, 119, 6, 0.3)"
                }}
              >
                Confirm Upgrade (+₱{((pendingSpecialUpgrade.upgradePrice || 65) * pax).toLocaleString()})
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Missing Inclusions Pop-up Error Modal */}
      {missingInclusionsModal && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(15, 23, 42, 0.78)",
          backdropFilter: "blur(6px)",
          zIndex: 1100,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1rem"
        }}>
          <div className="card-section" style={{
            maxWidth: "600px",
            width: "100%",
            padding: "2rem",
            borderRadius: "16px",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.45)",
            background: "#ffffff",
            border: "2px solid #fecaca",
            textAlign: "left",
            maxHeight: "90vh",
            display: "flex",
            flexDirection: "column"
          }}>
            {/* Modal Header */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", marginBottom: "1.25rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
                <div style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "14px",
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#dc2626",
                  flexShrink: 0
                }}>
                  <AlertTriangle size={30} />
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <h3 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#991b1b", margin: 0 }}>
                      Incomplete Package Inclusions
                    </h3>
                    <span style={{
                      background: "#fee2e2",
                      color: "#991b1b",
                      border: "1px solid #fca5a5",
                      fontSize: "0.72rem",
                      fontWeight: 800,
                      padding: "2px 8px",
                      borderRadius: "12px"
                    }}>
                      {missingInclusionsModal.items.length} {missingInclusionsModal.items.length === 1 ? "Item Missing" : "Items Missing"}
                    </span>
                  </div>
                  <p style={{ fontSize: "0.84rem", color: "#64748b", margin: "4px 0 0 0" }}>
                    Selected Package: <strong style={{ color: "var(--gold-600)" }}>{missingInclusionsModal.packageName}</strong>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setMissingInclusionsModal(null)}
                style={{
                  background: "#f1f5f9",
                  border: "none",
                  borderRadius: "8px",
                  width: "32px",
                  height: "32px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "#64748b"
                }}
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Subtitle Notice */}
            <div style={{
              background: "#fffbeb",
              border: "1px solid #fde68a",
              borderRadius: "10px",
              padding: "0.75rem 1rem",
              marginBottom: "1.25rem",
              fontSize: "0.84rem",
              color: "#92400e",
              lineHeight: 1.45
            }}>
              ⚠️ <strong>Action Required:</strong> You cannot confirm this banquet event until all included courses, viands, and client details are completed. Please review what is missing below:
            </div>

            {/* Scrollable Missing Inclusions Cards */}
            <div style={{
              overflowY: "auto",
              paddingRight: "6px",
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
              marginBottom: "1.5rem",
              maxHeight: "45vh"
            }}>
              {missingInclusionsModal.items.map((item, idx) => (
                <div
                  key={item.id || idx}
                  style={{
                    border: "1px solid #fed7aa",
                    background: "#fffaf5",
                    borderRadius: "12px",
                    padding: "0.95rem 1.1rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "1rem",
                    transition: "all 0.2s ease"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "0.85rem" }}>
                    <div style={{
                      fontSize: "1.4rem",
                      width: "40px",
                      height: "40px",
                      borderRadius: "10px",
                      background: "#ffedd5",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0
                    }}>
                      {item.icon}
                    </div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "3px", flexWrap: "wrap" }}>
                        <span style={{
                          fontSize: "0.68rem",
                          fontWeight: 800,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          background: "#fed7aa",
                          color: "#9a3412",
                          padding: "2px 6px",
                          borderRadius: "4px"
                        }}>
                          {item.badge}
                        </span>
                        <span style={{
                          fontSize: "0.68rem",
                          fontWeight: 700,
                          color: "#9a3412",
                          background: "rgba(254, 215, 170, 0.4)",
                          padding: "1px 6px",
                          borderRadius: "4px"
                        }}>
                          {item.category}
                        </span>
                        <strong style={{ fontSize: "0.92rem", color: "#7c2d12" }}>
                          {item.title}
                        </strong>
                      </div>
                      <p style={{ fontSize: "0.8rem", color: "#475569", margin: "3px 0 0 0", lineHeight: 1.4 }}>
                        {item.detail}
                      </p>
                      {item.required > 1 && (
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "6px" }}>
                          <div style={{ width: "100px", height: "6px", background: "#e2e8f0", borderRadius: "3px", overflow: "hidden" }}>
                            <div style={{
                              width: `${Math.min(100, Math.round((item.current / item.required) * 100))}%`,
                              height: "100%",
                              background: "#ea580c"
                            }} />
                          </div>
                          <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#c2410c" }}>
                            {item.current} of {item.required} Selected
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => scrollToSection(item.targetId)}
                    style={{
                      background: "#ea580c",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "8px",
                      padding: "8px 14px",
                      fontSize: "0.78rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                      boxShadow: "0 2px 6px rgba(234, 88, 12, 0.25)"
                    }}
                  >
                    <span>Select Now</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              ))}
            </div>

            {/* Modal Actions */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.75rem", borderTop: "1px solid #e2e8f0", paddingTop: "1rem", flexWrap: "wrap" }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setMissingInclusionsModal(null)}
                style={{ padding: "0.65rem 1.25rem", fontSize: "0.85rem" }}
              >
                Close & Review
              </button>
              
              {missingInclusionsModal.items.length > 0 && (
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => scrollToSection(missingInclusionsModal.items[0].targetId)}
                  style={{
                    background: "var(--gold-gradient)",
                    padding: "0.65rem 1.4rem",
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}
                >
                  <span>Go to First Missing Item ({missingInclusionsModal.items[0].badge})</span>
                  <ArrowRight size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
