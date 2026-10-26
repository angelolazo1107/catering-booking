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
  getPackageCourseAllowances,
  CONFERENCE_MEAL_RATES,
  CONFERENCE_SNACK_OPTIONS,
  SOUP_OPTIONS,
  BERMONTHS_PROMO_PACKAGES,
  MINI_GRAZING_TABLE_INCLUSIONS
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
  MAX_CONFIRMED_BOOKINGS_PER_DAY,
  formatTime12Hour,
  getConferenceEndDate,
  formatDisplayDate
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
    notes: draft?.clientInfo?.notes || "",
    conferenceDays: draft?.clientInfo?.conferenceDays || 3,
    agencyPoNumber: draft?.clientInfo?.agencyPoNumber || ""
  }));

  // Government / Multi-Day Conference State
  const isConference = clientInfo.eventType === "government_conference";
  const [conferenceDays, setConferenceDays] = useState(() => draft?.conferenceDays || clientInfo.conferenceDays || 3);
  const [agencyPoNumber, setAgencyPoNumber] = useState(() => draft?.agencyPoNumber || clientInfo.agencyPoNumber || "");

  // Conference Meal Selections
  const [amSnackDish, setAmSnackDish] = useState(() => draft?.amSnackDish || CONFERENCE_SNACK_OPTIONS?.sandwiches?.[1] || "Chicken Salad Croissant Sandwich");
  const [amSnackDrink, setAmSnackDrink] = useState(() => draft?.amSnackDrink || "Freshly Brewed Hot Coffee / Tea");
  const [pmSnackDish, setPmSnackDish] = useState(() => draft?.pmSnackDish || CONFERENCE_SNACK_OPTIONS?.pastas?.[0] || "Creamy Carbonara with Garlic Toast");
  const [pmSnackDrink, setPmSnackDrink] = useState(() => draft?.pmSnackDrink || "Soda (Coke)");

  // Dinner Selections (Package 2: 4 Mains, 1 Side, Steamed Rice, Beverage, Dessert)
  const [dinnerMainDishes, setDinnerMainDishes] = useState(() => {
    if (Array.isArray(draft?.dinnerMainDishes) && draft.dinnerMainDishes.length > 0) {
      return draft.dinnerMainDishes;
    }
    return [
      "Beef Caldereta",
      "Pork Asado with Mushroom",
      "Buttered Garlic Herb Chicken",
      "Fish Fillet (Cream Dory) in Garlic Cream Dip"
    ];
  });
  const [dinnerSide, setDinnerSide] = useState(() => draft?.dinnerSide || "Chop Suey Guisado");
  const [dinnerDessert, setDinnerDessert] = useState(() => draft?.dinnerDessert || "Buko Pandan Salad");
  const [dinnerDrink, setDinnerDrink] = useState(() => draft?.dinnerDrink || "Bottomless Signature Red Iced Tea");
  const [dinnerRice, setDinnerRice] = useState(() => draft?.dinnerRice || "Plain Steamed Rice");

  // 2. Service Type & Package
  const [activeServiceType, setActiveServiceType] = useState(() => {
    if (draft?.serviceType) return draft.serviceType;
    if (draft?.selectedPkgId?.startsWith("food_tray")) return "food_tray";
    if (draft?.selectedPkgId?.startsWith("pica_pica")) return "pica_pica";
    if (draft?.selectedPkgId?.startsWith("grazing_table") || draft?.selectedPkgId?.startsWith("grazing_")) return "grazing_table";
    if (draft?.selectedPkgId?.startsWith("pm_") || draft?.selectedPkgId?.startsWith("packed_meal")) return "packed_meal";
    if (draft?.selectedPkgId === "promo_bermonths" || draft?.selectedPkgId?.startsWith("promo")) return "promo";
    return "buffet"; // "buffet" | "food_tray" | "pica_pica" | "grazing_table" | "packed_meal" | "promo"
  });

  const [selectedPkgId, setSelectedPkgId] = useState(() => draft?.selectedPkgId || "package_4");
  const currentPkg = useMemo(() => {
    if (!packagesList || packagesList.length === 0) return CATERING_PACKAGES[0];
    const match = packagesList.find(p => p.id === selectedPkgId) ||
      packagesList.find(p => p.id?.toLowerCase().includes(String(selectedPkgId).toLowerCase())) ||
      packagesList.find(p => p.name?.toLowerCase().includes(String(selectedPkgId).toLowerCase())) ||
      packagesList[0];
    return match;
  }, [selectedPkgId, packagesList]);

  const isFoodTray = activeServiceType === "food_tray" || currentPkg?.serviceType === "food_tray" || currentPkg?.id?.startsWith("food_tray");
  const isPicaPica = activeServiceType === "pica_pica" || currentPkg?.serviceType === "pica_pica" || currentPkg?.id?.startsWith("pica_pica");
  const isGrazingTable = activeServiceType === "grazing_table" || currentPkg?.serviceType === "grazing_table" || currentPkg?.id?.startsWith("grazing_table") || currentPkg?.id?.startsWith("grazing_");
  const isPackedMeal = activeServiceType === "packed_meal" || currentPkg?.serviceType === "packed_meal" || currentPkg?.id?.startsWith("pm_") || currentPkg?.id?.startsWith("packed_meal");
  const isPromo = activeServiceType === "promo" || currentPkg?.serviceType === "promo" || currentPkg?.isPromo || currentPkg?.id === "promo_bermonths";

  const [selectedPackedMealSet, setSelectedPackedMealSet] = useState(() => draft?.selectedPackedMealSet || "");

  // Customizable Promo Date Range (Flyer Default: Sept 30 - Dec 31)
  const [promoStartDate, setPromoStartDate] = useState(() => {
    return draft?.promoStartDate || currentPkg?.promoStartDate || "2026-09-30";
  });
  const [promoEndDate, setPromoEndDate] = useState(() => {
    return draft?.promoEndDate || currentPkg?.promoEndDate || "2026-12-31";
  });
  const [isCustomizingPromoDates, setIsCustomizingPromoDates] = useState(false);
  const [selectedSoup, setSelectedSoup] = useState(() => {
    return draft?.selectedSoup || "Hot Cream of Corn Soup";
  });

  const displayPackages = useMemo(() => {
    if (isConference) return packagesList;
    if (activeServiceType === "food_tray") {
      const trays = packagesList.filter(p => p.serviceType === "food_tray" || p.id?.startsWith("food_tray"));
      return trays.length > 0 ? trays : packagesList;
    }
    if (activeServiceType === "pica_pica") {
      const pica = packagesList.filter(p => p.serviceType === "pica_pica" || p.id?.startsWith("pica_pica"));
      return pica.length > 0 ? pica : packagesList;
    }
    if (activeServiceType === "grazing_table") {
      const grazing = packagesList.filter(p => p.serviceType === "grazing_table" || p.id?.startsWith("grazing_table") || p.id?.startsWith("grazing_"));
      return grazing.length > 0 ? grazing : packagesList;
    }
    if (activeServiceType === "packed_meal") {
      const packed = packagesList.filter(p => p.serviceType === "packed_meal" || p.id?.startsWith("pm_") || p.id?.startsWith("packed_meal"));
      return packed.length > 0 ? packed : packagesList;
    }
    if (activeServiceType === "promo") {
      const promos = packagesList.filter(p => p.serviceType === "promo" || p.isPromo || p.id?.startsWith("promo_"));
      return promos.length > 0 ? promos : BERMONTHS_PROMO_PACKAGES;
    }
    return packagesList.filter(p =>
      p.serviceType !== "food_tray" && !p.id?.startsWith("food_tray") &&
      p.serviceType !== "pica_pica" && !p.id?.startsWith("pica_pica") &&
      p.serviceType !== "grazing_table" && !p.id?.startsWith("grazing_table") && !p.id?.startsWith("grazing_") &&
      p.serviceType !== "packed_meal" && !p.id?.startsWith("pm_") && !p.id?.startsWith("packed_meal") &&
      p.serviceType !== "promo" && !p.id?.startsWith("promo_") && !p.isPromo
    );
  }, [packagesList, activeServiceType, isConference]);

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

  // 7b. Pica Pica & Grazing Table Selections
  const [selectedSliders, setSelectedSliders] = useState(() => {
    if (Array.isArray(draft?.selectedSliders) && draft.selectedSliders.length > 0) return draft.selectedSliders;
    return ["Mini Crispy Chicken Sandwich", "Mini BLT or Mini Cheese Burger", "Mini Cheesy Chicken Pesto"];
  });
  const [selectedCanapes, setSelectedCanapes] = useState(() => {
    if (Array.isArray(draft?.selectedCanapes) && draft.selectedCanapes.length > 0) return draft.selectedCanapes;
    return [
      "Tuna Quinoa Salad",
      "Mini Olives, Hungarian Sausage and Cheese Skewers",
      "Garlic Bread in Mango Salsa Dip",
      "Crab Cakes with Garlic Cream Cheese",
      "Chicken Ala King Bites"
    ];
  });
  const [selectedFingerFoods, setSelectedFingerFoods] = useState(() => {
    if (Array.isArray(draft?.selectedFingerFoods) && draft.selectedFingerFoods.length > 0) return draft.selectedFingerFoods;
    return ["Chicken Fingers with Dip", "Cheese Sticks in Marinara Sauce", "Potato Wedges"];
  });
  const [selectedMiniDesserts, setSelectedMiniDesserts] = useState(() => {
    if (Array.isArray(draft?.selectedMiniDesserts) && draft.selectedMiniDesserts.length > 0) return draft.selectedMiniDesserts;
    return ["Mixed Seasonal Fruit Cups", "Mango Tapioca", "Coffee Jelly"];
  });
  const [picaDiyStation, setPicaDiyStation] = useState(() => draft?.picaDiyStation || "DIY Nacho Station");
  const [picaBeverage, setPicaBeverage] = useState(() => draft?.picaBeverage || "Choice of Juice (House Red Iced Tea)");

  const picaAllowances = useMemo(() => {
    return {
      sliders: typeof currentPkg?.picaAllowances?.sliders === "number" ? currentPkg.picaAllowances.sliders : 2,
      canapes: typeof currentPkg?.picaAllowances?.canapes === "number" ? currentPkg.picaAllowances.canapes : 5,
      fingerFood: typeof currentPkg?.picaAllowances?.fingerFood === "number" ? currentPkg.picaAllowances.fingerFood : 0,
      miniDesserts: typeof currentPkg?.picaAllowances?.miniDesserts === "number" ? currentPkg.picaAllowances.miniDesserts : 0,
      hasKakanin: Boolean(currentPkg?.picaAllowances?.hasKakanin),
      hasDiyStation: Boolean(currentPkg?.picaAllowances?.hasDiyStation),
      drinks: typeof currentPkg?.picaAllowances?.drinks === "number" ? currentPkg.picaAllowances.drinks : 0
    };
  }, [currentPkg]);

  const grazingAllowances = useMemo(() => {
    return {
      canapes: typeof currentPkg?.grazingAllowances?.canapes === "number" ? currentPkg.grazingAllowances.canapes : 5,
      sliders: typeof currentPkg?.grazingAllowances?.sliders === "number" ? currentPkg.grazingAllowances.sliders : 4,
      hasDessertShots: Boolean(currentPkg?.grazingAllowances?.hasDessertShots || currentPkg?.id?.includes("premium"))
    };
  }, [currentPkg]);

  // Trim sliders if package has fewer
  useEffect(() => {
    const maxSliders = isPicaPica ? (picaAllowances.sliders ?? 3) : (grazingAllowances.sliders ?? 4);
    if (selectedSliders.length > maxSliders) {
      setSelectedSliders(prev => prev.slice(0, maxSliders));
    }
  }, [isPicaPica, isGrazingTable, picaAllowances.sliders, grazingAllowances.sliders]);

  // Trim canapes
  useEffect(() => {
    const maxCanapes = isPicaPica ? (picaAllowances.canapes ?? 5) : (grazingAllowances.canapes ?? 5);
    if (selectedCanapes.length > maxCanapes) {
      setSelectedCanapes(prev => prev.slice(0, maxCanapes));
    }
  }, [isPicaPica, isGrazingTable, picaAllowances.canapes, grazingAllowances.canapes]);

  // Trim finger foods
  useEffect(() => {
    const maxFinger = picaAllowances.fingerFood ?? 0;
    if (isPicaPica && selectedFingerFoods.length > maxFinger) {
      setSelectedFingerFoods(prev => prev.slice(0, maxFinger));
    }
  }, [isPicaPica, picaAllowances.fingerFood]);

  // Trim mini desserts
  useEffect(() => {
    const maxDesserts = picaAllowances.miniDesserts ?? 0;
    if (isPicaPica && selectedMiniDesserts.length > maxDesserts) {
      setSelectedMiniDesserts(prev => prev.slice(0, maxDesserts));
    }
  }, [isPicaPica, picaAllowances.miniDesserts]);

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
        serviceType: activeServiceType,
        selectedPkgId,
        pax,
        swapDeal,
        selectedMainDishes,
        sideDishes,
        desserts,
        riceOrSoup,
        beverage,
        selectedSliders,
        selectedCanapes,
        selectedFingerFoods,
        selectedMiniDesserts,
        selectedPackedMealSet,
        picaDiyStation,
        picaBeverage,
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
    activeServiceType,
    selectedPkgId,
    pax,
    swapDeal,
    selectedMainDishes,
    sideDishes,
    desserts,
    riceOrSoup,
    beverage,
    selectedSliders,
    selectedCanapes,
    selectedFingerFoods,
    selectedMiniDesserts,
    picaDiyStation,
    picaBeverage,
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
  const confDaysNum = isConference ? Math.max(1, Number(conferenceDays || 3)) : 1;
  const foodTotal = useMemo(() => {
    if (isConference) {
      return pax * (CONFERENCE_MEAL_RATES?.dailyTotal || 1290) * confDaysNum;
    }
    if (isGrazingTable) {
      if (typeof currentPkg.price === "number" && currentPkg.price > 0) {
        if (currentPkg.maxPax && pax > currentPkg.maxPax) {
          const extraRate = currentPkg.pricePerPax || Math.round(currentPkg.price / currentPkg.maxPax);
          return currentPkg.price + ((pax - currentPkg.maxPax) * extraRate);
        }
        return currentPkg.price;
      }
      return currentPkg.price || 85000;
    }
    if (isFoodTray) {
      if (typeof currentPkg.price === "number" && currentPkg.price > 0) {
        if (currentPkg.maxPax && pax > currentPkg.maxPax) {
          const extraRate = currentPkg.pricePerPax || Math.round(currentPkg.price / currentPkg.maxPax);
          return currentPkg.price + ((pax - currentPkg.maxPax) * extraRate);
        }
        return currentPkg.price;
      }
      return pax * (currentPkg.pricePerPax || 200);
    }
    if (isPicaPica) {
      if (typeof currentPkg.price === "number" && currentPkg.price > 0) {
        if (currentPkg.maxPax && pax > currentPkg.maxPax) {
          const extraRate = currentPkg.pricePerPax || Math.round(currentPkg.price / currentPkg.maxPax);
          return currentPkg.price + ((pax - currentPkg.maxPax) * extraRate);
        }
        return currentPkg.price;
      }
      return pax * (currentPkg.pricePerPax || 350);
    }
    if (isPackedMeal) {
      return pax * (currentPkg.pricePerPax || 175);
    }
    if (isPromo) {
      const basePax = currentPkg.minPax || (currentPkg.name?.includes("100") ? 100 : 50);
      const basePrice = currentPkg.price || (basePax === 100 ? 75000 : 35000);
      const extraRate = currentPkg.pricePerPax || (basePax === 100 ? 750 : 700);
      if (pax <= basePax) return basePrice;
      return basePrice + ((pax - basePax) * extraRate);
    }
    // Buffet
    return pax * (currentPkg.pricePerPax || 350);
  }, [isConference, isGrazingTable, isFoodTray, isPicaPica, isPackedMeal, isPromo, currentPkg, pax, confDaysNum]);

  // Selected Special Dishes and Upgrade Fee (Main dishes + Special Side & Special Dessert or Special Sliders/Canapés)
  const selectedSpecialDishesList = useMemo(() => {
    if (isConference) return []; // Government conference includes fixed package rates
    const list = [];

    // Pica Pica & Grazing Table Upgrades (Special Sliders & Special Canapés at +₱45/pax)
    if (isPicaPica || isGrazingTable) {
      for (const name of selectedSliders) {
        const dishObj = getDishObject("sliders", name);
        if (dishObj && (dishObj.tier === "special" || dishObj.premium)) {
          const upgradeRate = getDishUpgradePrice(dishObj) || 45;
          list.push({
            category: "sliders",
            name: `${name} (Special Slider Upgrade)`,
            upgradePrice: upgradeRate,
            totalUpgrade: upgradeRate * pax
          });
        }
      }

      for (const name of selectedCanapes) {
        const dishObj = getDishObject("canapes", name);
        if (dishObj && (dishObj.tier === "special" || dishObj.premium)) {
          const upgradeRate = getDishUpgradePrice(dishObj) || 45;
          list.push({
            category: "canapes",
            name: `${name} (Special Canapé Upgrade)`,
            upgradePrice: upgradeRate,
            totalUpgrade: upgradeRate * pax
          });
        }
      }
      return list;
    }

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
    isConference,
    isPicaPica,
    isGrazingTable,
    selectedSliders,
    selectedCanapes,
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
    const baseFee = deliveryLocation === "custom"
      ? (Number(customDeliveryFee) || 0)
      : (DELIVERY_LOCATIONS.find(l => l.id === deliveryLocation)?.fee || 1500);
    return isConference ? (baseFee * confDaysNum) : baseFee;
  }, [deliveryLocation, customDeliveryFee, isConference, confDaysNum]);

  const subtotal = foodTotal + specialDishesUpgradeTotal + addonsTotal + deliveryFee;

  const serviceCharge = isServiceCharge
    ? Math.round((subtotal) * (serviceChargePercent / 100))
    : 0;

  // Non-VAT Official Quotation (VAT is for official receipts, not quotations)
  const grandTotal = Math.max(0, subtotal + serviceCharge - Number(discountAmount || 0));
  // Government procurement relies on PO and LDDAP-ADA disbursement (0% cash advance DP)
  const downpaymentRequired = isConference ? 0 : Math.round(grandTotal * 0.50);
  const balanceDue = isConference ? grandTotal : (grandTotal - downpaymentRequired);
  const effectivePerPax = pax > 0 ? Math.round(grandTotal / (pax * (isConference ? confDaysNum : 1))) : 0;

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

  const handleSliderToggle = (dishName) => {
    const maxAllowed = isPicaPica ? (picaAllowances.sliders ?? 3) : (grazingAllowances.sliders ?? 4);
    if (selectedSliders.includes(dishName)) {
      setSelectedSliders(prev => prev.filter(n => n !== dishName));
    } else {
      if (selectedSliders.length < maxAllowed) {
        setSelectedSliders(prev => [...prev, dishName]);
      }
    }
  };

  const handleCanapeToggle = (dishName) => {
    const maxAllowed = isPicaPica ? (picaAllowances.canapes ?? 5) : (grazingAllowances.canapes ?? 5);
    if (selectedCanapes.includes(dishName)) {
      setSelectedCanapes(prev => prev.filter(n => n !== dishName));
    } else {
      if (selectedCanapes.length < maxAllowed) {
        setSelectedCanapes(prev => [...prev, dishName]);
      }
    }
  };

  const handleFingerFoodToggle = (dishName) => {
    const maxAllowed = picaAllowances.fingerFood ?? 0;
    if (selectedFingerFoods.includes(dishName)) {
      setSelectedFingerFoods(prev => prev.filter(n => n !== dishName));
    } else {
      if (selectedFingerFoods.length < maxAllowed) {
        setSelectedFingerFoods(prev => [...prev, dishName]);
      }
    }
  };

  const handleMiniDessertToggle = (dishName) => {
    const maxAllowed = picaAllowances.miniDesserts ?? 0;
    if (selectedMiniDesserts.includes(dishName)) {
      setSelectedMiniDesserts(prev => prev.filter(n => n !== dishName));
    } else {
      if (selectedMiniDesserts.length < maxAllowed) {
        setSelectedMiniDesserts(prev => [...prev, dishName]);
      }
    }
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

    const allDishes = isConference ? [
      `AM Snack: ${amSnackDish} & ${amSnackDrink}`,
      ...selectedMainDishes.slice(0, 3).map(d => `Lunch Main: ${d}`),
      `Lunch Side: ${selectedSides[0] || 'Side Dish'}`,
      `Lunch Rice: ${riceOrSoup}`,
      `Lunch Dessert: ${selectedDessertsList[0] || 'Dessert'}`,
      `Lunch Drink: ${beverage}`,
      `PM Snack: ${pmSnackDish} & ${pmSnackDrink}`,
      ...dinnerMainDishes.map(d => `Dinner Main: ${d}`),
      `Dinner Side: ${dinnerSide}`,
      `Dinner Rice: ${dinnerRice}`,
      `Dinner Dessert: ${dinnerDessert}`,
      `Dinner Drink: ${dinnerDrink}`
    ] : isPicaPica ? [
      ...selectedSliders.map(s => `Slider: ${s}`),
      ...selectedCanapes.map(c => `Canapé: ${c}`),
      ...selectedFingerFoods.map(f => `Finger Food: ${f}`),
      ...selectedMiniDesserts.map(d => `Mini Dessert: ${d}`),
      ...(picaAllowances.hasKakanin ? ["Pinoy Kakanins Platter"] : []),
      ...(picaAllowances.hasDiyStation ? [`Station: ${picaDiyStation}`] : []),
      `Beverage: ${picaBeverage}`
    ] : isGrazingTable ? [
      "5 Kilos of Italian Cured Meats (Prosciutto, Salami, Coppa Ham)",
      "5 Types of Imported Cheeses (Brie, Cheddar, Gouda, Colby Jack, Feta)",
      "5 Big Seasonal Fruit Platters",
      ...selectedCanapes.map(c => `Canapé: ${c}`),
      ...selectedSliders.map(s => `Slider: ${s}`),
      "Hungarian Sausage Platter",
      "Assorted Nuts, Dried Fruits, Wafers, Pretzels & Crackers",
      "Vegetable Sticks with Dips & Olives",
      "Grazing Cups & Nachos Station",
      ...(grazingAllowances.hasDessertShots ? ["Gourmet Dessert Shots"] : []),
      "Artisan Breadbasket with Gourmet Jams & Bread"
    ] : [
      ...selectedMainDishes,
      ...selectedSides,
      selectedSpecialSide ? selectedSpecialSide : null,
      ...(swapDeal === "extra_main" ? [] : selectedDessertsList),
      ...(swapDeal === "extra_main" ? [] : (selectedSpecialDessert ? [selectedSpecialDessert] : [])),
      ...(swapDeal !== "none" ? [] : [riceOrSoup]),
      ...(swapDeal !== "none" ? [] : [beverage])
    ].filter(Boolean);

    const conferenceMeals = isConference ? {
      amSnack: {
        title: "AM Snacks (09:30 AM)",
        time: "09:30 AM",
        rate: CONFERENCE_MEAL_RATES?.amSnack || 120,
        sandwich: amSnackDish,
        drink: amSnackDrink
      },
      lunch: {
        title: "Lunch Buffet - Package 1 (12:00 PM)",
        time: "12:00 PM",
        rate: CONFERENCE_MEAL_RATES?.lunchPackage1 || 480,
        packageName: "Package 1 (3 Mains, 1 Side, Rice, Dessert, Beverage)",
        mains: selectedMainDishes.slice(0, 3),
        side: selectedSides[0] || "Creamy Spaghetti",
        rice: riceOrSoup,
        dessert: selectedDessertsList[0] || "Mango Tapioca",
        drink: beverage
      },
      pmSnack: {
        title: "PM Snacks (03:00 PM)",
        time: "03:00 PM",
        rate: CONFERENCE_MEAL_RATES?.pmSnack || 140,
        pasta: pmSnackDish,
        drink: pmSnackDrink
      },
      dinner: {
        title: "Dinner Buffet - Package 2 (06:30 PM)",
        time: "06:30 PM",
        rate: CONFERENCE_MEAL_RATES?.dinnerPackage2 || 550,
        packageName: "Package 2 (4 Mains, 1 Side, Rice, Dessert, Beverage)",
        mains: dinnerMainDishes,
        side: dinnerSide,
        rice: dinnerRice,
        dessert: dinnerDessert,
        drink: dinnerDrink
      }
    } : null;

    return {
      id: quoteId,
      createdAt: new Date().toISOString(),
      status: "Draft",
      ...clientInfo,
      isFoodTray,
      isPicaPica,
      isGrazingTable,
      isPackedMeal,
      isPromo,
      serviceType: isPromo ? "promo" : isPicaPica ? "pica_pica" : isGrazingTable ? "grazing_table" : isPackedMeal ? "packed_meal" : isFoodTray ? "food_tray" : (currentPkg.serviceType || "buffet"),
      selectedPackedMealSet: isPackedMeal ? selectedPackedMealSet : null,
      promoStartDate: isPromo ? (promoStartDate || "2026-09-30") : null,
      promoEndDate: isPromo ? (promoEndDate || "2026-12-31") : null,
      promoRunsText: isPromo ? `${promoStartDate} - ${promoEndDate}` : null,
      selectedSoup: (isPromo || currentPkg.hasSoup) ? selectedSoup : null,
      notes: clientInfo.notes || "",
      hasMiniGrazingTable: Boolean(currentPkg.hasMiniGrazingTable || isPromo),
      hasLechon: Boolean(currentPkg.hasLechon),
      lechonDetails: currentPkg.lechonDetails || (currentPkg.hasLechon ? "1 Whole Lechon (50kg Live weight)" : null),
      miniGrazingInclusions: currentPkg.miniGrazingInclusions || MINI_GRAZING_TABLE_INCLUSIONS,
      packagePrice: currentPkg.price || null,
      paxRange: currentPkg.paxRange || null,
      packageInclusions: currentPkg.inclusions || [],
      inclusions: currentPkg.inclusions || [],
      isConferenceBooking: isConference,
      conferenceDays: isConference ? confDaysNum : 1,
      conferenceEndDate: isConference ? getConferenceEndDate(clientInfo.eventDate, confDaysNum) : clientInfo.eventDate,
      agencyPoNumber: agencyPoNumber || clientInfo.agencyPoNumber || "",
      conferenceMeals,
      eventTypeName: isConference
        ? `Government / Multi-Day Conference (${confDaysNum} Days Full-Board)`
        : (eventTypeObj?.name || clientInfo.eventType),
      packageId: isConference ? "gov_conference_full_board" : currentPkg.id,
      packageName: isConference
        ? `Government Full-Board Conference (${confDaysNum} Days • 4 Meals/Day)`
        : currentPkg.name,
      pax,
      pricePerPax: isConference ? (CONFERENCE_MEAL_RATES?.dailyTotal || 1290) : currentPkg.pricePerPax,
      foodTotal,
      swapDeal,
      swapDealLabel,
      mainDishesCount: selectedMainDishes.length,
      maxMainDishes,
      courseAllowances,
      picaAllowances,
      grazingAllowances,
      selectedSliders,
      selectedCanapes,
      selectedFingerFoods,
      selectedMiniDesserts,
      picaDiyStation,
      picaBeverage,
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
      amSnackDish,
      amSnackDrink,
      pmSnackDish,
      pmSnackDrink,
      dinnerMainDishes,
      dinnerSide,
      dinnerDessert,
      dinnerDrink,
      dinnerRice,
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

    // If Government / Multi-Day Conference Booking
    if (isConference) {
      // Conference Meal 1: AM Snacks
      if (!amSnackDish || !amSnackDish.trim()) {
        missing.push({
          id: "conf-am-snack",
          category: "AM Snacks (09:30 AM)",
          badge: "AM Snack",
          targetId: "section-conf-am-snack",
          title: "AM Snack Sandwich Required",
          detail: "Please pick a Sandwich for the AM Snack session.",
          icon: "🥪",
          required: 1,
          current: 0
        });
      }
      if (!amSnackDrink || !amSnackDrink.trim()) {
        missing.push({
          id: "conf-am-drink",
          category: "AM Snacks (09:30 AM)",
          badge: "AM Drink",
          targetId: "section-conf-am-snack",
          title: "AM Snack Beverage Required",
          detail: "Please select a Drink for the AM Snack session (e.g. Brewed Coffee or Juice).",
          icon: "☕",
          required: 1,
          current: 0
        });
      }

      // Conference Meal 2: Lunch Buffet (Package 1: 3 Mains, 1 Side, Rice, Dessert, Beverage)
      const missingLunchMains = 3 - selectedMainDishes.length;
      if (missingLunchMains > 0) {
        missing.push({
          id: "conf-lunch-mains",
          category: "Lunch Buffet - Package 1 (12:00 PM)",
          badge: "Lunch Mains",
          targetId: "section-conf-lunch",
          title: `Missing ${missingLunchMains} Lunch Main Dish${missingLunchMains > 1 ? "es" : ""}`,
          detail: `Lunch Package 1 includes 3 regular main viands. Please choose ${missingLunchMains} more dish(es).`,
          icon: "🍱",
          required: 3,
          current: selectedMainDishes.length
        });
      }
      if (selectedSides.length < 1) {
        missing.push({
          id: "conf-lunch-side",
          category: "Lunch Buffet - Package 1 (12:00 PM)",
          badge: "Lunch Side",
          targetId: "section-conf-lunch",
          title: "Lunch Side Dish Required",
          detail: "Please select 1 Side Dish (Noodles or Vegetables) for the Lunch Buffet.",
          icon: "🥗",
          required: 1,
          current: 0
        });
      }

      // Conference Meal 3: PM Snacks
      if (!pmSnackDish || !pmSnackDish.trim()) {
        missing.push({
          id: "conf-pm-snack",
          category: "PM Snacks (03:00 PM)",
          badge: "PM Snack",
          targetId: "section-conf-pm-snack",
          title: "PM Snack Pasta Required",
          detail: "Please select a Pasta / Noodles choice for the afternoon snack.",
          icon: "🍝",
          required: 1,
          current: 0
        });
      }
      if (!pmSnackDrink || !pmSnackDrink.trim()) {
        missing.push({
          id: "conf-pm-drink",
          category: "PM Snacks (03:00 PM)",
          badge: "PM Drink",
          targetId: "section-conf-pm-snack",
          title: "PM Snack Drink Required",
          detail: "Please select a Drink for the afternoon snack (e.g. Soda or Iced Tea).",
          icon: "🥤",
          required: 1,
          current: 0
        });
      }

      // Conference Meal 4: Dinner Buffet (Package 2: 4 Mains, 1 Side, Rice, Dessert, Beverage)
      const missingDinnerMains = 4 - dinnerMainDishes.length;
      if (missingDinnerMains > 0) {
        missing.push({
          id: "conf-dinner-mains",
          category: "Dinner Buffet - Package 2 (06:30 PM)",
          badge: "Dinner Mains",
          targetId: "section-conf-dinner",
          title: `Missing ${missingDinnerMains} Dinner Main Dish${missingDinnerMains > 1 ? "es" : ""}`,
          detail: `Dinner Package 2 includes 4 main viands. Please select ${missingDinnerMains} more dish(es).`,
          icon: "🍽️",
          required: 4,
          current: dinnerMainDishes.length
        });
      }

      return missing;
    }

    // If Pica Pica Station Booking
    if (isPicaPica) {
      const allowedSliders = picaAllowances.sliders || 2;
      const missingSliders = allowedSliders - selectedSliders.length;
      if (missingSliders > 0) {
        missing.push({
          id: "pica-sliders",
          category: "Pica Pica Sliders",
          badge: "Sliders",
          targetId: "section-pica-curation",
          title: `Missing ${missingSliders} Slider${missingSliders > 1 ? "s" : ""}`,
          detail: `${currentPkg.name} includes ${allowedSliders} sliders. Please select ${missingSliders} more slider(s).`,
          icon: "🍔",
          required: allowedSliders,
          current: selectedSliders.length
        });
      }

      const allowedCanapes = picaAllowances.canapes || 5;
      const missingCanapes = allowedCanapes - selectedCanapes.length;
      if (missingCanapes > 0) {
        missing.push({
          id: "pica-canapes",
          category: "Pica Pica Canapés",
          badge: "Canapés",
          targetId: "section-pica-curation",
          title: `Missing ${missingCanapes} Canapé${missingCanapes > 1 ? "s" : ""}`,
          detail: `${currentPkg.name} includes ${allowedCanapes} canapés. Please select ${missingCanapes} more canapé(s).`,
          icon: "🥖",
          required: allowedCanapes,
          current: selectedCanapes.length
        });
      }

      const allowedFingerFood = picaAllowances.fingerFood || 2;
      const missingFingerFood = allowedFingerFood - selectedFingerFoods.length;
      if (missingFingerFood > 0) {
        missing.push({
          id: "pica-fingerfood",
          category: "Finger Food",
          badge: "Finger Food",
          targetId: "section-pica-curation",
          title: `Missing ${missingFingerFood} Finger Food Item${missingFingerFood > 1 ? "s" : ""}`,
          detail: `${currentPkg.name} includes ${allowedFingerFood} finger food choices. Please select ${missingFingerFood} more item(s).`,
          icon: "🍗",
          required: allowedFingerFood,
          current: selectedFingerFoods.length
        });
      }

      const allowedDesserts = picaAllowances.miniDesserts || 2;
      const missingDesserts = allowedDesserts - selectedMiniDesserts.length;
      if (missingDesserts > 0) {
        missing.push({
          id: "pica-desserts",
          category: "Mini Desserts",
          badge: "Desserts",
          targetId: "section-pica-curation",
          title: `Missing ${missingDesserts} Mini Dessert Cup${missingDesserts > 1 ? "s" : ""}`,
          detail: `${currentPkg.name} includes ${allowedDesserts} mini dessert cups. Please select ${missingDesserts} more dessert(s).`,
          icon: "🧁",
          required: allowedDesserts,
          current: selectedMiniDesserts.length
        });
      }

      if (!picaBeverage || !picaBeverage.trim()) {
        missing.push({
          id: "pica-beverage",
          category: "Cocktail Beverage",
          badge: "Beverage",
          targetId: "section-pica-curation",
          title: "Beverage Choice Required",
          detail: "Please choose Juice or Brewed Coffee for your cocktail station.",
          icon: "☕",
          required: 1,
          current: 0
        });
      }

      return missing;
    }

    // If Grazing Table Booking
    if (isGrazingTable) {
      const allowedCanapes = grazingAllowances.canapes || 5;
      const missingCanapes = allowedCanapes - selectedCanapes.length;
      if (missingCanapes > 0) {
        missing.push({
          id: "grazing-canapes",
          category: "Grazing Table Canapés",
          badge: "Canapés",
          targetId: "section-pica-curation",
          title: `Missing ${missingCanapes} Canapé${missingCanapes > 1 ? "s" : ""}`,
          detail: `${currentPkg.name} includes ${allowedCanapes} canapés. Please select ${missingCanapes} more canapé(s).`,
          icon: "🥖",
          required: allowedCanapes,
          current: selectedCanapes.length
        });
      }

      const allowedSliders = grazingAllowances.sliders || 4;
      const missingSliders = allowedSliders - selectedSliders.length;
      if (missingSliders > 0) {
        missing.push({
          id: "grazing-sliders",
          category: "Grazing Table Sliders",
          badge: "Sliders",
          targetId: "section-pica-curation",
          title: `Missing ${missingSliders} Slider${missingSliders > 1 ? "s" : ""}`,
          detail: `${currentPkg.name} includes ${allowedSliders} sliders. Please select ${missingSliders} more slider(s).`,
          icon: "🍔",
          required: allowedSliders,
          current: selectedSliders.length
        });
      }

      return missing;
    }

    // If Packed Meal / Bento Booking
    if (isPackedMeal) {
      const reqMains = currentPkg.mainDishesCount || 1;
      const missingMains = reqMains - selectedMainDishes.length;
      if (missingMains > 0) {
        missing.push({
          id: "pm-mains",
          category: "Packed Meal Mains",
          badge: "Main Dishes",
          targetId: "section-packed-meal",
          title: `Missing ${missingMains} Main Dish${missingMains > 1 ? "es" : ""}`,
          detail: `${currentPkg.name} includes ${reqMains} main viand(s). Please select ${missingMains} more dish(es).`,
          icon: "🍱",
          required: reqMains,
          current: selectedMainDishes.length
        });
      }
      const reqSides = currentPkg.sideDishes?.regular || 1;
      const curSides = [sideDishes.regular, sideDishes.regular2].filter(Boolean).length;
      if (curSides < reqSides) {
        missing.push({
          id: "pm-sides",
          category: "Packed Meal Sides",
          badge: "Side Dishes",
          targetId: "section-packed-meal",
          title: `Missing ${reqSides - curSides} Side Dish${reqSides - curSides > 1 ? "es" : ""}`,
          detail: `${currentPkg.name} includes ${reqSides} side dish(es).`,
          icon: "🥗",
          required: reqSides,
          current: curSides
        });
      }
      return missing;
    }

    // 4. Main Dishes Selection (Standard Single-Event Booking)
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

    // For Food Tray packages, desserts, rice, and beverage are not mandatory buffet inclusions
    if (!isFoodTray) {
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

            {isConference && (
              <div style={{
                gridColumn: "1 / -1",
                background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
                border: "1.5px solid #93c5fd",
                borderRadius: "12px",
                padding: "1.1rem 1.25rem",
                marginTop: "0.25rem",
                marginBottom: "0.5rem"
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem", flexWrap: "wrap", gap: "0.5rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "1.3rem" }}>🏛️</span>
                    <div>
                      <strong style={{ color: "#1e3a8a", fontSize: "0.95rem" }}>Government / Multi-Day Conference Setup</strong>
                      <div style={{ fontSize: "0.74rem", color: "#2563eb" }}>Automated 4-meal daily billing with zero upfront cash advance requirement (PO backed)</div>
                    </div>
                  </div>
                  <span style={{ fontSize: "0.72rem", background: "#bfdbfe", color: "#1e40af", padding: "2px 8px", borderRadius: "12px", fontWeight: 800 }}>
                    LDDAP-ADA / PO Compatible
                  </span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1rem" }}>
                  <div>
                    <label className="form-label" style={{ fontSize: "0.8rem", color: "#1e40af" }}>Conference Duration (Days) *</label>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <input
                        type="number"
                        min="1"
                        max="14"
                        className="form-input"
                        value={conferenceDays}
                        onChange={(e) => {
                          const val = Math.max(1, Number(e.target.value) || 1);
                          setConferenceDays(val);
                          setClientInfo(prev => ({ ...prev, conferenceDays: val }));
                        }}
                        style={{ fontWeight: 800, fontSize: "1rem", maxWidth: "120px" }}
                      />
                      <span style={{ fontSize: "0.85rem", color: "#1e3a8a", fontWeight: 700 }}>
                        {conferenceDays} Continuous {conferenceDays === 1 ? "Day" : "Days"}
                      </span>
                    </div>
                    {clientInfo.eventDate && (
                      <div style={{ fontSize: "0.76rem", color: "#1d4ed8", fontWeight: 600, marginTop: "6px" }}>
                        📅 Multi-Day Schedule: <strong>{formatDisplayDate(clientInfo.eventDate, { month: "short", day: "numeric", year: "numeric" })}</strong> to <strong>{formatDisplayDate(getConferenceEndDate(clientInfo.eventDate, conferenceDays), { month: "short", day: "numeric", year: "numeric" })}</strong>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: "0.8rem", color: "#1e40af" }}>Agency Purchase Order (PO) / PR Reference (Optional)</label>
                    <input
                      type="text"
                      className="form-input"
                      value={agencyPoNumber}
                      onChange={(e) => {
                        setAgencyPoNumber(e.target.value);
                        setClientInfo(prev => ({ ...prev, agencyPoNumber: e.target.value }));
                      }}
                      placeholder="e.g. PO-2026-0382 / PR-DEPED-091"
                    />
                    <div style={{ fontSize: "0.72rem", color: "#3b82f6", marginTop: "4px" }}>
                      Gov't Terms: 0% advance deposit. Net 30/45 days via LDDAP-ADA on submission of DR & billing.
                    </div>
                  </div>
                </div>
              </div>
            )}

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
              <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "3px", display: "block" }}>
                Serving: <strong>{formatTime12Hour(clientInfo.eventTime)}</strong>
              </span>
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

            {/* Note / Remarks for Quotation (e.g. Fabric for Skirting, Motif, Ingress Details) */}
            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                <label className="form-label" style={{ marginBottom: 0, fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "6px" }}>
                  <span>📝 NOTE / REMARKS</span>
                  <span style={{ fontSize: "0.68rem", color: "var(--gold-600)", background: "#fef3c7", border: "1px solid #fde68a", padding: "1px 6px", borderRadius: "4px", fontWeight: 700 }}>
                    Official Quotation Note
                  </span>
                </label>
                <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                  e.g. Fabric motif, skirting color, special event setup
                </span>
              </div>
              <textarea
                className="form-input"
                rows={2}
                value={clientInfo.notes}
                onChange={(e) => setClientInfo({ ...clientInfo, notes: e.target.value })}
                placeholder="e.g. FABRIC FOR SKIRTING - ARMY GREEN"
                style={{ fontSize: "0.85rem", resize: "vertical" }}
              />
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "6px", alignItems: "center" }}>
                <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 600 }}>Quick Suggestions:</span>
                {[
                  "FABRIC FOR SKIRTING - ARMY GREEN",
                  "FABRIC FOR SKIRTING - CREAM & GOLD",
                  "FABRIC FOR SKIRTING - DUSTY BLUE",
                  "FABRIC FOR SKIRTING - EMERALD GREEN",
                  "BUFFET INGRESS AT 2:00 PM",
                  "EARLY TABLE SET UP REQUIRED"
                ].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      const current = clientInfo.notes ? clientInfo.notes.trim() : "";
                      const updated = current ? (current.includes(tag) ? current : `${current}\n${tag}`) : tag;
                      setClientInfo({ ...clientInfo, notes: updated });
                    }}
                    style={{
                      fontSize: "0.68rem",
                      background: "#f1f5f9",
                      border: "1px solid #cbd5e1",
                      borderRadius: "6px",
                      padding: "2px 8px",
                      cursor: "pointer",
                      color: "#334155",
                      fontWeight: 600
                    }}
                  >
                    + {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Catering Service, Package & Pax Counter */}
        <div className="card-section">
          <div className="section-header">
            <div className="section-title">
              <div className="step-number">2</div>
              <span>{isConference ? "Government Conference Meal Package & Pax" : "Select Catering Service & Package"}</span>
            </div>
            <span style={{ fontSize: "0.75rem", color: "var(--gold-400)", fontWeight: 700 }}>
              {isConference ? "Full-Board Daily Rate (PHP)" : isFoodTray ? "Food Tray / Party Rates (PHP)" : "Per Pax Pricing (PHP)"}
            </span>
          </div>

          {!isConference && (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "0.75rem",
              marginBottom: "1.25rem",
              background: "rgba(241, 245, 249, 0.7)",
              padding: "6px",
              borderRadius: "14px",
              border: "1px solid var(--border-subtle)"
            }}>
              {/* 1. Buffet */}
              <button
                type="button"
                onClick={() => {
                  setActiveServiceType("buffet");
                  const firstBuffet = packagesList.find(p => p.serviceType === "buffet" || (!p.serviceType && !p.id?.startsWith("food_tray") && !p.id?.startsWith("pica_pica") && !p.id?.startsWith("grazing_table"))) || packagesList[0];
                  if (firstBuffet) {
                    setSelectedPkgId(firstBuffet.id);
                    setPax(Math.max(firstBuffet.minPax || 50, 100));
                  }
                  setIsServiceCharge(true);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.85rem 0.9rem",
                  borderRadius: "10px",
                  border: activeServiceType === "buffet" ? "2px solid var(--gold-500)" : "1px solid transparent",
                  background: activeServiceType === "buffet" ? "#ffffff" : "transparent",
                  boxShadow: activeServiceType === "buffet" ? "0 4px 12px rgba(217, 119, 6, 0.12)" : "none",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.2s ease"
                }}
              >
                <span style={{ fontSize: "1.4rem" }}>🍽️</span>
                <div>
                  <div style={{ fontWeight: 800, fontSize: "0.88rem", color: activeServiceType === "buffet" ? "var(--gold-600)" : "var(--text-primary)" }}>
                    Full Buffet
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                    Complete dining setup & waitstaff (Min 50 Pax)
                  </div>
                </div>
              </button>

              {/* 2. Food Tray */}
              <button
                type="button"
                onClick={() => {
                  setActiveServiceType("food_tray");
                  const firstTray = packagesList.find(p => p.serviceType === "food_tray" || p.id?.startsWith("food_tray"));
                  if (firstTray) {
                    setSelectedPkgId(firstTray.id);
                    setPax(firstTray.minPax || 15);
                  }
                  setIsServiceCharge(false); // Party trays delivered without on-site waitstaff
                  setDeliveryLocation("iloilo_free");
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.85rem 0.9rem",
                  borderRadius: "10px",
                  border: activeServiceType === "food_tray" ? "2px solid var(--gold-500)" : "1px solid transparent",
                  background: activeServiceType === "food_tray" ? "#ffffff" : "transparent",
                  boxShadow: activeServiceType === "food_tray" ? "0 4px 12px rgba(217, 119, 6, 0.12)" : "none",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.2s ease"
                }}
              >
                <span style={{ fontSize: "1.4rem" }}>🍱</span>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <span style={{ fontWeight: 800, fontSize: "0.88rem", color: activeServiceType === "food_tray" ? "var(--gold-600)" : "var(--text-primary)" }}>
                      Food Trays
                    </span>
                    <span style={{ fontSize: "0.64rem", background: "#fef3c7", color: "#b45309", padding: "1px 5px", borderRadius: "8px", fontWeight: 800 }}>
                      Party
                    </span>
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                    3 Mains + 2 Sides or 1 Regular Viand Tray
                  </div>
                </div>
              </button>

              {/* 3. Pica Pica Station */}
              <button
                type="button"
                onClick={() => {
                  setActiveServiceType("pica_pica");
                  const firstPica = packagesList.find(p => p.serviceType === "pica_pica" || p.id?.startsWith("pica_pica"));
                  if (firstPica) {
                    setSelectedPkgId(firstPica.id);
                    setPax(firstPica.minPax || 30);
                  }
                  setIsServiceCharge(true);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.85rem 0.9rem",
                  borderRadius: "10px",
                  border: activeServiceType === "pica_pica" ? "2px solid #059669" : "1px solid transparent",
                  background: activeServiceType === "pica_pica" ? "#ffffff" : "transparent",
                  boxShadow: activeServiceType === "pica_pica" ? "0 4px 12px rgba(5, 150, 105, 0.15)" : "none",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.2s ease"
                }}
              >
                <span style={{ fontSize: "1.4rem" }}>🍢</span>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <span style={{ fontWeight: 800, fontSize: "0.88rem", color: activeServiceType === "pica_pica" ? "#047857" : "var(--text-primary)" }}>
                      Pica Pica Station
                    </span>
                    <span style={{ fontSize: "0.64rem", background: "#d1fae5", color: "#065f46", padding: "1px 5px", borderRadius: "8px", fontWeight: 800 }}>
                      Cocktail
                    </span>
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                    Cocktail sliders, canapés, cured meats & grazing bites
                  </div>
                </div>
              </button>

              {/* 4. Grazing Table */}
              <button
                type="button"
                onClick={() => {
                  setActiveServiceType("grazing_table");
                  const firstGrazing = packagesList.find(p => p.serviceType === "grazing_table" || p.id?.startsWith("grazing_table") || p.id?.startsWith("grazing_"));
                  if (firstGrazing) {
                    setSelectedPkgId(firstGrazing.id);
                    setPax(firstGrazing.minPax || 30);
                  }
                  setIsServiceCharge(true);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.85rem 0.9rem",
                  borderRadius: "10px",
                  border: activeServiceType === "grazing_table" ? "2px solid #7c3aed" : "1px solid transparent",
                  background: activeServiceType === "grazing_table" ? "#ffffff" : "transparent",
                  boxShadow: activeServiceType === "grazing_table" ? "0 4px 12px rgba(124, 58, 237, 0.15)" : "none",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.2s ease"
                }}
              >
                <span style={{ fontSize: "1.4rem" }}>🧀</span>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <span style={{ fontWeight: 800, fontSize: "0.88rem", color: activeServiceType === "grazing_table" ? "#5b21b6" : "var(--text-primary)" }}>
                      Grazing Table
                    </span>
                    <span style={{ fontSize: "0.64rem", background: "#ede9fe", color: "#6d28d9", padding: "1px 5px", borderRadius: "8px", fontWeight: 800 }}>
                      Artisan
                    </span>
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                    Luxury Charcuterie, 5kg Cured Meats & Cheeses
                  </div>
                </div>
              </button>

              {/* 5. Packed Meals / Bento */}
              <button
                type="button"
                onClick={() => {
                  setActiveServiceType("packed_meal");
                  const firstPacked = packagesList.find(p => p.serviceType === "packed_meal" || p.id?.startsWith("pm_") || p.id?.startsWith("packed_meal"));
                  if (firstPacked) {
                    setSelectedPkgId(firstPacked.id);
                    setPax(firstPacked.minPax || 50);
                  }
                  setIsServiceCharge(false);
                  setDeliveryLocation("iloilo_free");
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.85rem 0.9rem",
                  borderRadius: "10px",
                  border: activeServiceType === "packed_meal" ? "2px solid #ea580c" : "1px solid transparent",
                  background: activeServiceType === "packed_meal" ? "#ffffff" : "transparent",
                  boxShadow: activeServiceType === "packed_meal" ? "0 4px 12px rgba(234, 88, 12, 0.15)" : "none",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.2s ease"
                }}
              >
                <span style={{ fontSize: "1.4rem" }}>🍱</span>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <span style={{ fontWeight: 800, fontSize: "0.88rem", color: activeServiceType === "packed_meal" ? "#c2410c" : "var(--text-primary)" }}>
                      Packed Meals
                    </span>
                    <span style={{ fontSize: "0.64rem", background: "#ffedd5", color: "#c2410c", padding: "1px 5px", borderRadius: "8px", fontWeight: 800 }}>
                      Bento
                    </span>
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                    Individually packed bento meals & sets (Min 50 Pax)
                  </div>
                </div>
              </button>

              {/* 6. Bermonths Holiday Promo */}
              <button
                type="button"
                onClick={() => {
                  setActiveServiceType("promo");
                  const promoPkg = packagesList.find(p => p.serviceType === "promo" || p.id === "promo_bermonths" || p.isPromo) || BERMONTHS_PROMO_PACKAGES[0];
                  if (promoPkg) {
                    setSelectedPkgId(promoPkg.id);
                    setPax(promoPkg.minPax || 50);
                    if (promoPkg.promoStartDate) setPromoStartDate(promoPkg.promoStartDate);
                    if (promoPkg.promoEndDate) setPromoEndDate(promoPkg.promoEndDate);
                  }
                  setIsServiceCharge(false);
                  setDeliveryLocation("iloilo_free");
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.85rem 0.9rem",
                  borderRadius: "10px",
                  border: activeServiceType === "promo" ? "2px solid #dc2626" : "1px solid transparent",
                  background: activeServiceType === "promo" ? "#ffffff" : "transparent",
                  boxShadow: activeServiceType === "promo" ? "0 4px 14px rgba(220, 38, 38, 0.18)" : "none",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.2s ease"
                }}
              >
                <span style={{ fontSize: "1.4rem" }}>🎄</span>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <span style={{ fontWeight: 800, fontSize: "0.88rem", color: activeServiceType === "promo" ? "#b91c1c" : "var(--text-primary)" }}>
                      Bermonths Promo
                    </span>
                    <span style={{ fontSize: "0.64rem", background: "#fee2e2", color: "#991b1b", padding: "1px 5px", borderRadius: "8px", fontWeight: 800 }}>
                      From ₱35k
                    </span>
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                    50 & 100 PAX + Mini Grazing Table & Lechon
                  </div>
                </div>
              </button>
            </div>
          )}

          {/* Bermonths Holiday Promo Notice & Customizable Date Range Banner */}
          {isPromo && !isConference && (
            <div style={{
              background: "linear-gradient(135deg, #fef2f2 0%, #fff1f2 50%, #fffbeb 100%)",
              border: "2px solid #ef4444",
              borderRadius: "14px",
              padding: "1.25rem 1.4rem",
              marginBottom: "1.25rem",
              boxShadow: "0 4px 16px rgba(239, 68, 68, 0.12)",
              position: "relative"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.75rem", marginBottom: "0.85rem", borderBottom: "1px dashed #fca5a5", paddingBottom: "0.85rem" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "1.5rem" }}>🎄</span>
                    <h3 style={{ margin: 0, color: "#991b1b", fontSize: "1.2rem", fontWeight: 800 }}>
                      Palatable Bermonths Promo!
                    </h3>
                    <span style={{ fontSize: "0.74rem", background: "#fee2e2", color: "#991b1b", border: "1px solid #fecaca", padding: "2px 8px", borderRadius: "10px", fontWeight: 800 }}>
                      ₱{(currentPkg.price || 35000).toLocaleString()}.00 • {currentPkg.paxRange || "GOOD FOR " + (currentPkg.minPax || 50) + " PAX"}
                    </span>
                    {currentPkg.hasLechon && (
                      <span style={{ fontSize: "0.74rem", background: "#fef3c7", color: "#b45309", border: "1px solid #fde68a", padding: "2px 8px", borderRadius: "10px", fontWeight: 800 }}>
                        🐷 1 Whole Lechon (50kg) Included!
                      </span>
                    )}
                    <span style={{ fontSize: "0.74rem", background: "#fef3c7", color: "#92400e", padding: "2px 8px", borderRadius: "10px", fontWeight: 700 }}>
                      Full Catering Services
                    </span>
                  </div>
                  <p style={{ margin: "4px 0 0", fontSize: "0.82rem", color: "#7f1d1d", fontStyle: "italic" }}>
                    Good Food, Brighter Gatherings ♡ — Make your holiday gatherings extra special with us!
                  </p>
                </div>

                {/* Customizable Promo Dates Controls */}
                <div style={{ background: "#ffffff", padding: "0.6rem 0.85rem", borderRadius: "10px", border: "1px solid #fecaca", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ fontSize: "0.74rem", fontWeight: 800, color: "#991b1b", display: "flex", alignItems: "center", gap: "4px" }}>
                      📅 Customizable Promo Validity
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsCustomizingPromoDates(prev => !prev)}
                      style={{ fontSize: "0.68rem", color: "#b91c1c", background: "none", border: "none", textDecoration: "underline", cursor: "pointer", fontWeight: 700 }}
                    >
                      {isCustomizingPromoDates ? "Hide Editor" : "Edit Dates"}
                    </button>
                  </div>
                  
                  {isCustomizingPromoDates ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontSize: "0.65rem", color: "#64748b" }}>Starts:</span>
                        <input
                          type="date"
                          className="form-input"
                          style={{ padding: "3px 6px", fontSize: "0.75rem", width: "125px" }}
                          value={promoStartDate}
                          onChange={(e) => setPromoStartDate(e.target.value)}
                        />
                      </div>
                      <span style={{ color: "#94a3b8", fontSize: "0.8rem", marginTop: "12px" }}>—</span>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontSize: "0.65rem", color: "#64748b" }}>Ends:</span>
                        <input
                          type="date"
                          className="form-input"
                          style={{ padding: "3px 6px", fontSize: "0.75rem", width: "125px" }}
                          value={promoEndDate}
                          onChange={(e) => setPromoEndDate(e.target.value)}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setPromoStartDate("2026-09-30");
                          setPromoEndDate("2026-12-31");
                        }}
                        style={{ fontSize: "0.68rem", padding: "4px 6px", borderRadius: "6px", border: "1px solid #cbd5e1", background: "#f8fafc", cursor: "pointer", marginTop: "12px" }}
                        title="Reset to default flyer dates"
                      >
                        Reset
                      </button>
                    </div>
                  ) : (
                    <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#1e293b", fontFamily: "monospace" }}>
                      {promoStartDate} to {promoEndDate}
                    </div>
                  )}

                  {/* Real-time date status check against client's event date */}
                  {clientInfo.eventDate && (
                    <div style={{ fontSize: "0.72rem", fontWeight: 700, marginTop: "2px" }}>
                      {clientInfo.eventDate >= promoStartDate && clientInfo.eventDate <= promoEndDate ? (
                        <span style={{ color: "#15803d", display: "flex", alignItems: "center", gap: "4px" }}>
                          ✅ Selected date ({clientInfo.eventDate}) is within promo period!
                        </span>
                      ) : (
                        <span style={{ color: "#b45309", display: "flex", alignItems: "center", gap: "4px" }}>
                          ⚠️ Event date ({clientInfo.eventDate}) is outside promo window ({promoStartDate} – {promoEndDate}).
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* What is Included Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "0.75rem", fontSize: "0.78rem", color: "#7f1d1d" }}>
                <div>
                  <strong style={{ color: "#991b1b" }}>🍽️ Menu Inclusions ({currentPkg.name?.includes("100") ? "100 PAX" : "50 PAX"}):</strong>
                  <ul style={{ margin: "3px 0 0", paddingLeft: "1.1rem" }}>
                    <li><strong>{currentPkg.mainDishesCount || (currentPkg.name?.includes("100") ? 3 : 2)} Regular Mains</strong> (Choice of Beef, Pork, Chicken, Seafood)</li>
                    <li><strong>1 Regular Side</strong> (Pasta, Noodles, or Vegetable dish)</li>
                    <li><strong>1 Regular Dessert</strong> (Filipino festive sweet dessert)</li>
                    <li><strong>Hot Soup & Rice</strong> (Hot Soup + Steamed Jasmine Rice)</li>
                    <li><strong>Beverage</strong> (Chilled Soda or Fruit Juice)</li>
                    {currentPkg.hasLechon && (
                      <li style={{ color: "#b45309", fontWeight: 700 }}>
                        🐷 <strong>1 Whole Lechon (50kg Live weight)</strong> Included!
                      </li>
                    )}
                  </ul>
                </div>
                <div>
                  <strong style={{ color: "#991b1b" }}>🧀 Mini Grazing Table Inclusions:</strong>
                  <ul style={{ margin: "3px 0 0", paddingLeft: "1.1rem" }}>
                    <li><strong>1 BIG Charcuterie Platter</strong> with Salami or Coppa Ham</li>
                    <li><strong>1 Big Fruit Platter</strong> (Fresh seasonal fruits)</li>
                    <li><strong>DIY Nachos</strong> with Cheese Sauce Fountain</li>
                    <li><strong>Artisan Canapés:</strong> Truffle Egg Bites, Tuna Salad Bites, Chicken Ala King Bites, Hungarian Sausage, Cheese & Olives Skewers</li>
                    <li><strong>Mini Charcuterie Cups</strong> for guests</li>
                  </ul>
                </div>
                <div>
                  <strong style={{ color: "#991b1b" }}>✨ Full Setup & Service Inclusions:</strong>
                  <ul style={{ margin: "3px 0 0", paddingLeft: "1.1rem" }}>
                    <li><strong>Rustic Buffet Table Set up</strong> with chafing dishes & styling</li>
                    <li><strong>Tables and chairs for guests</strong> with table skirting, chair covers, simple centerpieces & fine dining setup</li>
                    <li><strong>Uniformed friendly servers/staff</strong> (4hrs full catering service)</li>
                    <li><strong>Service water</strong> and ice station</li>
                    <li><strong>Free transportation:</strong> City of Iloilo, Cabatuan, Sta. Barbara, Pavia, San Miguel, Janiuay, Maasin</li>
                    <li><strong>Basic Balloon Backdrop</strong></li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Packed Meal Flyer Notice Banner */}
          {isPackedMeal && !isConference && (
            <div style={{
              background: "linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)",
              border: "1.5px solid #fdba74",
              borderRadius: "12px",
              padding: "1rem 1.25rem",
              marginBottom: "1.25rem"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "1.2rem" }}>🍱</span>
                  <strong style={{ color: "#9a3412", fontSize: "0.92rem" }}>
                    The Palatable Packed Meal & Bento Box Service Notice
                  </strong>
                </div>
                <span style={{ fontSize: "0.74rem", background: "#fed7aa", color: "#7c2d12", padding: "2px 8px", borderRadius: "8px", fontWeight: 700 }}>
                  Min 50 PAX • Bento Packaging Included
                </span>
              </div>
              <div style={{ fontSize: "0.78rem", color: "#7c2d12", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "0.5rem" }}>
                <div>• <strong>Minimum Order</strong>: 50 PAX minimum guarantee for all packed meal packages.</div>
                <div>• <strong>Individually Packed</strong>: Hygienic partitioned food-grade bento boxes with disposable cutlery, napkin & toothpick.</div>
                <div>• <strong>Chef Pre-Sets or Custom</strong>: Choose chef-curated combos (Option A, B, or C) or customize your viands.</div>
                <div>• <strong>Free Local Delivery</strong>: Qualifying orders within Iloilo City, Pavia, Sta. Barbara, Cabatuan, etc.</div>
              </div>
            </div>
          )}

          {/* Food Tray Flyer Notice Banner */}
          {isFoodTray && !isConference && (
            <div style={{
              background: "linear-gradient(135deg, #fefce8 0%, #fffbeb 100%)",
              border: "1.5px solid #fde047",
              borderRadius: "12px",
              padding: "1rem 1.25rem",
              marginBottom: "1.25rem"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "1.2rem" }}>🚚</span>
                  <strong style={{ color: "#854d0e", fontSize: "0.92rem" }}>
                    Palatable Food Tray Delivery Notice
                  </strong>
                </div>
                <span style={{ fontSize: "0.74rem", background: "#fef08a", color: "#713f12", padding: "2px 8px", borderRadius: "8px", fontWeight: 700 }}>
                  Free Local Transport
                </span>
              </div>
              <div style={{ fontSize: "0.78rem", color: "#713f12", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "0.5rem" }}>
                <div>• <strong>Free Transportation Fee</strong> for: Iloilo City, Pavia, Sta. Barbara, Cabatuan, Maasin, San Miguel, Janiuay.</div>
                <div>• <strong>Advance Notice</strong>: Bookings must be placed at least <strong>2-3 days prior</strong> to event.</div>
                <div>• <strong>Payment Terms</strong>: 50% Downpayment to assure booking; remaining balance upon delivery.</div>
                <div>• <strong>Cancellation</strong>: Strictly no cancellation of orders. 70% collected if orders are cancelled.</div>
              </div>
            </div>
          )}

          {/* Pica Pica Flyer Notice Banner */}
          {isPicaPica && !isConference && (
            <div style={{
              background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
              border: "1.5px solid #86efac",
              borderRadius: "12px",
              padding: "1rem 1.25rem",
              marginBottom: "1.25rem"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "1.2rem" }}>🍢</span>
                  <strong style={{ color: "#166534", fontSize: "0.92rem" }}>
                    The Palatable Pica Pica Cocktail Station
                  </strong>
                </div>
                <span style={{ fontSize: "0.74rem", background: "#bbf7d0", color: "#14532d", padding: "2px 8px", borderRadius: "8px", fontWeight: 700 }}>
                  Minimum Booking: 50 PAX
                </span>
              </div>
              <div style={{ fontSize: "0.78rem", color: "#166534", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "0.5rem" }}>
                <div>• <strong>Cocktail Setup Included</strong>: Rustic wooden risers, cocktail toothpicks, cocktail paper napkins & elegant food markers.</div>
                <div>• <strong>Continuous Refill</strong>: Dedicated on-site attendant for 4 hours event replenishment.</div>
                <div>• <strong>Special Upgrades</strong>: Gourmet special sliders & canapés (pastrami, prosciutto, shrimp cocktail) available at +₱45/pax.</div>
                <div>• <strong>Option 3 Grand</strong>: Includes Traditional Pinoy Kakanin + choice of DIY Nacho or DIY Mini Doughnut Station!</div>
              </div>
            </div>
          )}

          {/* Grazing Table Flyer Notice Banner */}
          {isGrazingTable && !isConference && (
            <div style={{
              background: "linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)",
              border: "1.5px solid #c4b5fd",
              borderRadius: "12px",
              padding: "1rem 1.25rem",
              marginBottom: "1.25rem"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "1.2rem" }}>🧀</span>
                  <strong style={{ color: "#5b21b6", fontSize: "0.92rem" }}>
                    The Palatable Artisan Grazing Table Spread
                  </strong>
                </div>
                <span style={{ fontSize: "0.74rem", background: "#ddd6fe", color: "#4c1d95", padding: "2px 8px", borderRadius: "8px", fontWeight: 700 }}>
                  Luxury Charcuterie Setup
                </span>
              </div>
              <div style={{ fontSize: "0.78rem", color: "#5b21b6", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "0.5rem" }}>
                <div>• <strong>Grand Inclusions</strong>: 5 Kilos Italian Cured Meats, 5 Imported Cheeses, 5 Big Fruit Platters, Hungarian Sausage, Artisan Breads.</div>
                <div>• <strong>Included Savory Finger Fare</strong>: 5 Canapés + 4 Sliders of your choice from our gourmet library.</div>
                <div>• <strong>Deluxe vs Premium</strong>: Deluxe (100–150 PAX @ ₱85k) | Premium (150–200 PAX @ ₱105k with Gourmet Dessert Shots).</div>
                <div>• <strong>Ingress & Styling</strong>: Requires 2-3 hours on-site ingress styling with fresh eucalyptus, wooden boards, and risers.</div>
              </div>
            </div>
          )}

          {isConference ? (
            <div style={{
              background: "linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%)",
              border: "2px solid #3b82f6",
              borderRadius: "14px",
              padding: "1.5rem",
              marginBottom: "1.5rem"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem", marginBottom: "1rem" }}>
                <div>
                  <div style={{ display: "inline-block", background: "#2563eb", color: "#ffffff", padding: "3px 10px", borderRadius: "12px", fontSize: "0.72rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "6px" }}>
                    Official Government Conference Meal Package
                  </div>
                  <h3 style={{ margin: 0, fontSize: "1.3rem", fontWeight: 800, color: "#1e3a8a" }}>
                    Full-Board Conference Catering (4 Meals Daily)
                  </h3>
                  <p style={{ margin: "4px 0 0 0", fontSize: "0.85rem", color: "#475569" }}>
                    Standard full-board catering designed for government seminars, training workshops, and official conferences.
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "1.6rem", fontWeight: 900, color: "#1e40af", fontFamily: "monospace" }}>
                    ₱1,290.00
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "#64748b", fontWeight: 600 }}>
                    / pax / day (Min 30 pax)
                  </div>
                </div>
              </div>

              {/* 4-Meal Daily Breakdown Badges */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "0.75rem", marginTop: "0.75rem" }}>
                <div style={{ background: "#ffffff", border: "1px solid #bfdbfe", borderRadius: "10px", padding: "0.85rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                    <span style={{ fontWeight: 800, fontSize: "0.85rem", color: "#1e40af" }}>🥪 AM Snacks</span>
                    <span style={{ fontWeight: 700, fontSize: "0.8rem", color: "#2563eb" }}>₱120/pax</span>
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#475569" }}>Serving: 09:30 AM</div>
                  <div style={{ fontSize: "0.75rem", color: "#334155", fontWeight: 600, marginTop: "2px" }}>Sandwich + Hot/Cold Beverage</div>
                </div>

                <div style={{ background: "#ffffff", border: "1px solid #bbf7d0", borderRadius: "10px", padding: "0.85rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                    <span style={{ fontWeight: 800, fontSize: "0.85rem", color: "#166534" }}>🍱 Lunch Buffet</span>
                    <span style={{ fontWeight: 700, fontSize: "0.8rem", color: "#16a34a" }}>₱480/pax</span>
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#475569" }}>Serving: 12:00 PM • Package 1</div>
                  <div style={{ fontSize: "0.75rem", color: "#334155", fontWeight: 600, marginTop: "2px" }}>3 Mains + 1 Side + Rice + Dessert + Drink</div>
                </div>

                <div style={{ background: "#ffffff", border: "1px solid #fed7aa", borderRadius: "10px", padding: "0.85rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                    <span style={{ fontWeight: 800, fontSize: "0.85rem", color: "#9a3412" }}>🍝 PM Snacks</span>
                    <span style={{ fontWeight: 700, fontSize: "0.8rem", color: "#ea580c" }}>₱140/pax</span>
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#475569" }}>Serving: 03:00 PM</div>
                  <div style={{ fontSize: "0.75rem", color: "#334155", fontWeight: 600, marginTop: "2px" }}>Hot Pasta / Noodles + Cold Drink</div>
                </div>

                <div style={{ background: "#ffffff", border: "1px solid #ddd6fe", borderRadius: "10px", padding: "0.85rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                    <span style={{ fontWeight: 800, fontSize: "0.85rem", color: "#5b21b6" }}>🍽️ Dinner Buffet</span>
                    <span style={{ fontWeight: 700, fontSize: "0.8rem", color: "#7c3aed" }}>₱550/pax</span>
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#475569" }}>Serving: 06:30 PM • Package 2</div>
                  <div style={{ fontSize: "0.75rem", color: "#334155", fontWeight: 600, marginTop: "2px" }}>4 Mains + 1 Side + Rice + Dessert + Drink</div>
                </div>
              </div>

              <div style={{ marginTop: "1rem", paddingTop: "0.85rem", borderTop: "1px dashed #93c5fd", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
                <span style={{ fontSize: "0.82rem", color: "#1e40af", fontWeight: 700 }}>
                  Guaranteed Duration: {conferenceDays} {conferenceDays === 1 ? "Day" : "Days"} × {pax} Pax = {(conferenceDays * pax).toLocaleString()} Total Meal Covers
                </span>
                <span style={{ fontSize: "0.95rem", color: "#1e3a8a", fontWeight: 800 }}>
                  Daily Food Total: ₱{(pax * 1290).toLocaleString()} / day
                </span>
              </div>
            </div>
          ) : (
            <div className="package-tiers-grid">
              {displayPackages.map(pkg => {
                const isSelected = selectedPkgId === pkg.id;
                const hasFixedPrice = typeof pkg.price === "number" && pkg.price > 0;
                return (
                  <div
                    key={pkg.id}
                    className={`package-card ${isSelected ? "selected" : ""}`}
                    onClick={() => {
                      setSelectedPkgId(pkg.id);
                      if (pax < (pkg.minPax || 10)) setPax(pkg.minPax || 10);
                    }}
                    style={{
                      border: isSelected ? "2px solid var(--gold-500)" : "1px solid var(--border-subtle)"
                    }}
                  >
                    <div className="pkg-badge">{pkg.badge || (pkg.serviceType === "food_tray" ? "Food Tray" : "Buffet")}</div>
                    <div className="pkg-name">{pkg.name}</div>
                    <div className="pkg-subtitle">{pkg.subtitle}</div>
                    <div className="pkg-price-row">
                      {hasFixedPrice ? (
                        <>
                          <span className="pkg-price">₱{pkg.price.toLocaleString()}</span>
                          <span className="pkg-unit"> / {pkg.paxRange || `${pkg.minPax}-${pkg.maxPax || pkg.minPax} PAX`}</span>
                        </>
                      ) : (
                        <>
                          <span className="pkg-price">₱{pkg.pricePerPax}</span>
                          <span className="pkg-unit">/ pax (min {pkg.minPax || 10} pax)</span>
                        </>
                      )}
                    </div>
                    <ul className="pkg-inclusions">
                      {(pkg.inclusions || []).slice(0, 4).map((inc, i) => (
                        <li key={i}>
                          <Check size={14} />
                          <span>{inc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pax Slider & Counter */}
          <div className="pax-slider-card">
            <div className="pax-display-header">
              <div>
                <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)" }}>
                  Number of Guaranteed Guests (Pax)
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  {currentPkg.paxRange
                    ? `Serving Size: ${currentPkg.paxRange} (Minimum ${currentPkg.minPax || 10} pax)`
                    : `Minimum ${currentPkg.minPax || 10} pax required for ${currentPkg.name}`}
                </div>
              </div>

              <div className="pax-count-box">
                <button
                  type="button"
                  className="pax-btn"
                  onClick={() => setPax(prev => Math.max(currentPkg.minPax || 10, prev - (isFoodTray ? 5 : 10)))}
                  disabled={pax <= (currentPkg.minPax || 10)}
                >
                  <Minus size={16} />
                </button>
                <input
                  type="number"
                  className="pax-number-input"
                  value={pax}
                  min={currentPkg.minPax || 10}
                  max={1000}
                  onChange={(e) => setPax(Math.max(currentPkg.minPax || 10, Number(e.target.value) || (currentPkg.minPax || 10)))}
                />
                <button
                  type="button"
                  className="pax-btn"
                  onClick={() => setPax(prev => prev + (isFoodTray ? 5 : 10))}
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

        {/* Step 3: Menu Viand Selection / Conference 4-Meal Allotment */}
        {isConference ? (
          <div className="card-section" id="section-conference-meals">
            <div className="section-header">
              <div className="section-title">
                <div className="step-number">3</div>
                <span>Government Conference 4-Meal Daily Menu Allotment</span>
              </div>
              <span style={{ fontSize: "0.75rem", color: "#2563eb", fontWeight: 700 }}>
                4 Meal Slots / Day (₱1,290 / Pax Daily)
              </span>
            </div>

            {/* Meal 1: AM Snacks */}
            <div id="section-conf-am-snack" style={{
              background: "#ffffff",
              border: "1.5px solid #bfdbfe",
              borderRadius: "12px",
              padding: "1.25rem",
              marginBottom: "1.25rem"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.85rem", borderBottom: "1px solid #e0f2fe", paddingBottom: "0.5rem", flexWrap: "wrap", gap: "0.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "1.3rem" }}>🥪</span>
                  <h4 style={{ margin: 0, fontSize: "1rem", fontWeight: 800, color: "#1e40af" }}>
                    Meal 1: AM Snacks (09:30 AM Serving)
                  </h4>
                  <span style={{ fontSize: "0.72rem", background: "#dbeafe", color: "#1d4ed8", padding: "2px 8px", borderRadius: "10px", fontWeight: 700 }}>
                    ₱120 / pax Allotted
                  </span>
                </div>
                <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Sandwich + Hot / Cold Beverage</span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1rem" }}>
                <div>
                  <label className="form-label" style={{ fontSize: "0.8rem", fontWeight: 700, color: "#1e3a8a" }}>
                    Choice of Snack Sandwich *
                  </label>
                  <select
                    className="form-select"
                    value={amSnackDish}
                    onChange={(e) => setAmSnackDish(e.target.value)}
                  >
                    {(CONFERENCE_SNACK_OPTIONS?.sandwiches || []).map((s, idx) => (
                      <option key={idx} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: "0.8rem", fontWeight: 700, color: "#1e3a8a" }}>
                    Choice of AM Drink / Refreshment *
                  </label>
                  <select
                    className="form-select"
                    value={amSnackDrink}
                    onChange={(e) => setAmSnackDrink(e.target.value)}
                  >
                    {(CONFERENCE_SNACK_OPTIONS?.drinks || []).map((d, idx) => (
                      <option key={idx} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Meal 2: Lunch Buffet (Package 1: 3 Mains, 1 Side, Rice, Dessert, Beverage) */}
            <div id="section-conf-lunch" style={{
              background: "#ffffff",
              border: "1.5px solid #bbf7d0",
              borderRadius: "12px",
              padding: "1.25rem",
              marginBottom: "1.25rem"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.85rem", borderBottom: "1px solid #dcfce7", paddingBottom: "0.5rem", flexWrap: "wrap", gap: "0.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "1.3rem" }}>🍱</span>
                  <h4 style={{ margin: 0, fontSize: "1rem", fontWeight: 800, color: "#166534" }}>
                    Meal 2: Lunch Buffet - Package 1 (12:00 PM Serving)
                  </h4>
                  <span style={{ fontSize: "0.72rem", background: "#dcfce7", color: "#15803d", padding: "2px 8px", borderRadius: "10px", fontWeight: 700 }}>
                    ₱480 / pax Allotted
                  </span>
                </div>
                <span style={{ fontSize: "0.75rem", color: "#15803d", fontWeight: 700 }}>
                  3 Regular Mains + 1 Side + Steamed Rice + Dessert + Beverage
                </span>
              </div>

              {/* Lunch Mains Selector */}
              <div style={{ marginBottom: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem", flexWrap: "wrap", gap: "0.5rem" }}>
                  <label className="form-label" style={{ margin: 0, fontSize: "0.82rem", fontWeight: 700, color: "#166534" }}>
                    Select 3 Lunch Main Viands ({selectedMainDishes.slice(0, 3).length}/3 selected):
                  </label>
                  <span style={{ fontSize: "0.74rem", fontWeight: 700, color: selectedMainDishes.slice(0, 3).length === 3 ? "#16a34a" : "#d97706" }}>
                    {selectedMainDishes.slice(0, 3).length === 3 ? "Complete ✓" : `Pick ${3 - selectedMainDishes.slice(0, 3).length} more`}
                  </span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "0.5rem" }}>
                  {(dishesMenu.beef || []).concat(dishesMenu.pork || [], dishesMenu.chicken || [], dishesMenu.fish || [])
                    .filter(d => d.tier !== "special" && !d.premium)
                    .slice(0, 16)
                    .map(dish => {
                      const isSel = selectedMainDishes.slice(0, 3).includes(dish.name);
                      return (
                        <div
                          key={`lunch-${dish.name}`}
                          onClick={() => {
                            if (isSel) {
                              setSelectedMainDishes(prev => prev.filter(n => n !== dish.name));
                            } else if (selectedMainDishes.length < 3) {
                              setSelectedMainDishes(prev => [...prev, dish.name]);
                            }
                          }}
                          style={{
                            border: isSel ? "2px solid #16a34a" : "1px solid #e2e8f0",
                            background: isSel ? "#f0fdf4" : "#ffffff",
                            padding: "0.6rem 0.75rem",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontSize: "0.78rem",
                            fontWeight: isSel ? 700 : 500,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between"
                          }}
                        >
                          <span>{dish.name}</span>
                          {isSel && <Check size={14} color="#16a34a" />}
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Lunch Side, Rice, Drink, Dessert */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.75rem" }}>
                <div>
                  <label className="form-label" style={{ fontSize: "0.78rem", fontWeight: 700 }}>Lunch Side Dish *</label>
                  <select
                    className="form-select"
                    value={selectedSides[0] || ""}
                    onChange={(e) => setSelectedSides([e.target.value])}
                  >
                    {(dishesMenu.noodlesOrVeg || []).filter(d => d.tier !== "special" && !d.premium).map((d, i) => (
                      <option key={i} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: "0.78rem", fontWeight: 700 }}>Lunch Rice/Starch *</label>
                  <select
                    className="form-select"
                    value={riceOrSoup}
                    onChange={(e) => setRiceOrSoup(e.target.value)}
                  >
                    <option value="Plain Steamed Rice">Plain Steamed Rice</option>
                    <option value="Garlic Fragrant Rice">Garlic Fragrant Rice</option>
                    <option value="Hot Cream of Corn Soup">Hot Cream of Corn Soup</option>
                  </select>
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: "0.78rem", fontWeight: 700 }}>Lunch Beverage *</label>
                  <select
                    className="form-select"
                    value={beverage}
                    onChange={(e) => setBeverage(e.target.value)}
                  >
                    <option value="Bottomless Signature Red Iced Tea">Bottomless Signature Red Iced Tea</option>
                    <option value="Fresh Calamansi Citrus Cooler">Fresh Calamansi Citrus Cooler</option>
                    <option value="Soda (Coke)">Soda (Coke)</option>
                    <option value="Blue Lemonade Refresher">Blue Lemonade Refresher</option>
                  </select>
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: "0.78rem", fontWeight: 700 }}>Lunch Dessert *</label>
                  <select
                    className="form-select"
                    value={selectedDessertsList[0] || ""}
                    onChange={(e) => setSelectedDessertsList([e.target.value])}
                  >
                    {(dishesMenu.dessert || []).filter(d => d.tier !== "special" && !d.premium).map((d, i) => (
                      <option key={i} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Meal 3: PM Snacks */}
            <div id="section-conf-pm-snack" style={{
              background: "#ffffff",
              border: "1.5px solid #fed7aa",
              borderRadius: "12px",
              padding: "1.25rem",
              marginBottom: "1.25rem"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.85rem", borderBottom: "1px solid #ffedd5", paddingBottom: "0.5rem", flexWrap: "wrap", gap: "0.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "1.3rem" }}>🍝</span>
                  <h4 style={{ margin: 0, fontSize: "1rem", fontWeight: 800, color: "#9a3412" }}>
                    Meal 3: PM Snacks (03:00 PM Serving)
                  </h4>
                  <span style={{ fontSize: "0.72rem", background: "#ffedd5", color: "#c2410c", padding: "2px 8px", borderRadius: "10px", fontWeight: 700 }}>
                    ₱140 / pax Allotted
                  </span>
                </div>
                <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Hot Pasta / Specialty Noodles + Refreshment</span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1rem" }}>
                <div>
                  <label className="form-label" style={{ fontSize: "0.8rem", fontWeight: 700, color: "#7c2d12" }}>
                    Choice of Snack Pasta / Noodles *
                  </label>
                  <select
                    className="form-select"
                    value={pmSnackDish}
                    onChange={(e) => setPmSnackDish(e.target.value)}
                  >
                    {(CONFERENCE_SNACK_OPTIONS?.pastas || []).map((p, idx) => (
                      <option key={idx} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: "0.8rem", fontWeight: 700, color: "#7c2d12" }}>
                    Choice of PM Drink *
                  </label>
                  <select
                    className="form-select"
                    value={pmSnackDrink}
                    onChange={(e) => setPmSnackDrink(e.target.value)}
                  >
                    {(CONFERENCE_SNACK_OPTIONS?.drinks || []).map((d, idx) => (
                      <option key={idx} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Meal 4: Dinner Buffet (Package 2: 4 Mains, 1 Side, Rice, Dessert, Beverage) */}
            <div id="section-conf-dinner" style={{
              background: "#ffffff",
              border: "1.5px solid #ddd6fe",
              borderRadius: "12px",
              padding: "1.25rem",
              marginBottom: "1.25rem"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.85rem", borderBottom: "1px solid #ede9fe", paddingBottom: "0.5rem", flexWrap: "wrap", gap: "0.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "1.3rem" }}>🍽️</span>
                  <h4 style={{ margin: 0, fontSize: "1rem", fontWeight: 800, color: "#5b21b6" }}>
                    Meal 4: Dinner Buffet - Package 2 (06:30 PM Serving)
                  </h4>
                  <span style={{ fontSize: "0.72rem", background: "#ede9fe", color: "#6d28d9", padding: "2px 8px", borderRadius: "10px", fontWeight: 700 }}>
                    ₱550 / pax Allotted
                  </span>
                </div>
                <span style={{ fontSize: "0.75rem", color: "#5b21b6", fontWeight: 700 }}>
                  4 Regular Mains + 1 Side + Steamed Rice + Dessert + Beverage
                </span>
              </div>

              {/* Dinner Mains Selector */}
              <div style={{ marginBottom: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem", flexWrap: "wrap", gap: "0.5rem" }}>
                  <label className="form-label" style={{ margin: 0, fontSize: "0.82rem", fontWeight: 700, color: "#5b21b6" }}>
                    Select 4 Dinner Main Viands ({dinnerMainDishes.length}/4 selected):
                  </label>
                  <span style={{ fontSize: "0.74rem", fontWeight: 700, color: dinnerMainDishes.length === 4 ? "#7c3aed" : "#d97706" }}>
                    {dinnerMainDishes.length === 4 ? "Complete ✓" : `Pick ${4 - dinnerMainDishes.length} more`}
                  </span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "0.5rem" }}>
                  {(dishesMenu.beef || []).concat(dishesMenu.pork || [], dishesMenu.chicken || [], dishesMenu.fish || [])
                    .filter(d => d.tier !== "special" && !d.premium)
                    .slice(0, 16)
                    .map(dish => {
                      const isSel = dinnerMainDishes.includes(dish.name);
                      return (
                        <div
                          key={`dinner-${dish.name}`}
                          onClick={() => {
                            if (isSel) {
                              setDinnerMainDishes(prev => prev.filter(n => n !== dish.name));
                            } else if (dinnerMainDishes.length < 4) {
                              setDinnerMainDishes(prev => [...prev, dish.name]);
                            }
                          }}
                          style={{
                            border: isSel ? "2px solid #7c3aed" : "1px solid #e2e8f0",
                            background: isSel ? "#faf5ff" : "#ffffff",
                            padding: "0.6rem 0.75rem",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontSize: "0.78rem",
                            fontWeight: isSel ? 700 : 500,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between"
                          }}
                        >
                          <span>{dish.name}</span>
                          {isSel && <Check size={14} color="#7c3aed" />}
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Dinner Side, Rice, Drink, Dessert */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.75rem" }}>
                <div>
                  <label className="form-label" style={{ fontSize: "0.78rem", fontWeight: 700 }}>Dinner Side Dish *</label>
                  <select
                    className="form-select"
                    value={dinnerSide}
                    onChange={(e) => setDinnerSide(e.target.value)}
                  >
                    {(dishesMenu.noodlesOrVeg || []).filter(d => d.tier !== "special" && !d.premium).map((d, i) => (
                      <option key={`d-side-${i}`} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: "0.78rem", fontWeight: 700 }}>Dinner Rice *</label>
                  <select
                    className="form-select"
                    value={dinnerRice}
                    onChange={(e) => setDinnerRice(e.target.value)}
                  >
                    <option value="Plain Steamed Rice">Plain Steamed Rice</option>
                    <option value="Garlic Fried Rice">Garlic Fried Rice</option>
                    <option value="Yang Chow Fried Rice">Yang Chow Fried Rice</option>
                  </select>
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: "0.78rem", fontWeight: 700 }}>Dinner Beverage *</label>
                  <select
                    className="form-select"
                    value={dinnerDrink}
                    onChange={(e) => setDinnerDrink(e.target.value)}
                  >
                    <option value="Bottomless Signature Red Iced Tea">Bottomless Signature Red Iced Tea</option>
                    <option value="Fresh Calamansi Citrus Cooler">Fresh Calamansi Citrus Cooler</option>
                    <option value="Soda (Coke)">Soda (Coke)</option>
                    <option value="Blue Lemonade Refresher">Blue Lemonade Refresher</option>
                  </select>
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: "0.78rem", fontWeight: 700 }}>Dinner Dessert *</label>
                  <select
                    className="form-select"
                    value={dinnerDessert}
                    onChange={(e) => setDinnerDessert(e.target.value)}
                  >
                    {(dishesMenu.dessert || []).filter(d => d.tier !== "special" && !d.premium).map((d, i) => (
                      <option key={`d-des-${i}`} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        ) : isPicaPica ? (
          <div className="card-section" id="section-pica-curation">
            <div className="section-header">
              <div className="section-title">
                <div className="step-number">3</div>
                <span>Customize Pica Pica Cocktail Station Food Choices</span>
              </div>
              <span style={{ fontSize: "0.78rem", color: "#065f46", fontWeight: 700, background: "#d1fae5", padding: "3px 10px", borderRadius: "12px", border: "1px solid #a7f3d0" }}>
                {currentPkg.name} • {currentPkg.price ? `₱${currentPkg.price.toLocaleString()} (${currentPkg.paxRange || `${currentPkg.minPax}-${currentPkg.maxPax} PAX`})` : `₱${currentPkg.pricePerPax}/pax (Min ${currentPkg.minPax || 50} Pax)`}
              </span>
            </div>

            {/* Allowance Status Bar */}
            <div style={{
              background: "linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)",
              border: "1.5px solid #a7f3d0",
              borderRadius: "12px",
              padding: "1rem 1.25rem",
              marginBottom: "1.5rem"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 800, color: "#065f46" }}>
                    🍢 Pica Pica Course Allowances ({currentPkg.name})
                  </h4>
                  <p style={{ margin: "2px 0 0 0", fontSize: "0.76rem", color: "#047857" }}>
                    Select your artisan cocktail bites below. Special items add a +₱45/pax chef tier upgrade.
                  </p>
                </div>
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  <span style={{
                    fontSize: "0.74rem",
                    fontWeight: 700,
                    padding: "3px 8px",
                    borderRadius: "8px",
                    background: selectedSliders.length === (picaAllowances.sliders || 3) ? "#059669" : "#ffffff",
                    color: selectedSliders.length === (picaAllowances.sliders || 3) ? "#ffffff" : "#065f46",
                    border: "1px solid #059669"
                  }}>
                    🍔 Sliders: {selectedSliders.length}/{picaAllowances.sliders || 3}
                  </span>
                  <span style={{
                    fontSize: "0.74rem",
                    fontWeight: 700,
                    padding: "3px 8px",
                    borderRadius: "8px",
                    background: selectedCanapes.length === (picaAllowances.canapes || 5) ? "#059669" : "#ffffff",
                    color: selectedCanapes.length === (picaAllowances.canapes || 5) ? "#ffffff" : "#065f46",
                    border: "1px solid #059669"
                  }}>
                    🥪 Canapés: {selectedCanapes.length}/{picaAllowances.canapes || 5}
                  </span>
                  {(picaAllowances.fingerFood || 0) > 0 && (
                    <span style={{
                      fontSize: "0.74rem",
                      fontWeight: 700,
                      padding: "3px 8px",
                      borderRadius: "8px",
                      background: selectedFingerFoods.length === picaAllowances.fingerFood ? "#059669" : "#ffffff",
                      color: selectedFingerFoods.length === picaAllowances.fingerFood ? "#ffffff" : "#065f46",
                      border: "1px solid #059669"
                    }}>
                      🍗 Finger Food: {selectedFingerFoods.length}/{picaAllowances.fingerFood}
                    </span>
                  )}
                  {(picaAllowances.miniDesserts || 0) > 0 && (
                    <span style={{
                      fontSize: "0.74rem",
                      fontWeight: 700,
                      padding: "3px 8px",
                      borderRadius: "8px",
                      background: selectedMiniDesserts.length === picaAllowances.miniDesserts ? "#059669" : "#ffffff",
                      color: selectedMiniDesserts.length === picaAllowances.miniDesserts ? "#ffffff" : "#065f46",
                      border: "1px solid #059669"
                    }}>
                      🍮 Desserts: {selectedMiniDesserts.length}/{picaAllowances.miniDesserts}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Dedicated Grazing & Charcuterie Inclusions Card for Petite / Party Packages */}
            {currentPkg.inclusions && (currentPkg.id.includes("petite") || currentPkg.id.includes("party")) && (
              <div style={{
                background: "linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)",
                border: "1.5px solid #86efac",
                borderRadius: "12px",
                padding: "1.1rem 1.25rem",
                marginBottom: "1.5rem"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "0.65rem" }}>
                  <span style={{ fontSize: "1.3rem" }}>🧀</span>
                  <div>
                    <h4 style={{ margin: 0, fontSize: "0.98rem", fontWeight: 800, color: "#14532d" }}>
                      {currentPkg.name} — Included Artisan Charcuterie & Grazing Spread
                    </h4>
                    <div style={{ fontSize: "0.76rem", color: "#166534" }}>
                      Curated artisanal board inclusions from the official Palatable Catering spread
                    </div>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "0.45rem", fontSize: "0.8rem", color: "#15803d" }}>
                  {currentPkg.inclusions.map((inc, i) => (
                    <div key={i} style={{ background: "#ffffff", padding: "0.5rem 0.75rem", borderRadius: "8px", border: "1px solid #bbf7d0", display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ color: "#16a34a", fontWeight: 800 }}>✔</span>
                      <span style={{ fontWeight: 600, color: "#14532d" }}>{inc}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 1. SLIDERS (Regular & Special) */}
            <div style={{ marginBottom: "1.75rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem", flexWrap: "wrap", gap: "0.5rem" }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 800, color: "#1e293b", display: "flex", alignItems: "center", gap: "6px" }}>
                    <span>🍔 Sliders Selection</span>
                    <span style={{ fontSize: "0.75rem", color: "#047857", background: "#d1fae5", padding: "2px 8px", borderRadius: "10px", border: "1px solid #a7f3d0" }}>
                      Choose {picaAllowances.sliders || 3} Sliders ({selectedSliders.length} selected)
                    </span>
                  </h4>
                  <p style={{ margin: "3px 0 0 0", fontSize: "0.76rem", color: "var(--text-muted)" }}>
                    Includes 10 Regular choices (₱0 upgrade) and 8 Special Chef choices (+₱45/pax upgrade).
                  </p>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: "0.55rem" }}>
                {(dishesMenu.sliders || []).map(slider => {
                  const isSel = selectedSliders.includes(slider.name);
                  const isSpecial = slider.tier === "special" || slider.premium;
                  return (
                    <div
                      key={slider.id || slider.name}
                      onClick={() => handleSliderToggle(slider.name)}
                      style={{
                        padding: "0.65rem 0.8rem",
                        borderRadius: "8px",
                        border: isSel ? "2px solid #059669" : isSpecial ? "1px dashed #f59e0b" : "1px solid var(--border-subtle)",
                        background: isSel ? "#ecfdf5" : isSpecial ? "#fffdf5" : "#ffffff",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        transition: "all 0.15s ease"
                      }}
                    >
                      <div>
                        <div style={{ fontSize: "0.82rem", fontWeight: isSel ? 800 : 600, color: isSel ? "#065f46" : "var(--text-primary)" }}>
                          {slider.name}
                        </div>
                        {isSpecial && (
                          <span style={{ fontSize: "0.68rem", color: "#b45309", fontWeight: 700 }}>
                            ⭐ Special (+₱45/pax)
                          </span>
                        )}
                      </div>
                      {isSel && <Check size={16} color="#059669" />}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. CANAPÉS (Regular & Special) */}
            <div style={{ marginBottom: "1.75rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem", flexWrap: "wrap", gap: "0.5rem" }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 800, color: "#1e293b", display: "flex", alignItems: "center", gap: "6px" }}>
                    <span>🥪 Canapés Selection</span>
                    <span style={{ fontSize: "0.75rem", color: "#047857", background: "#d1fae5", padding: "2px 8px", borderRadius: "10px", border: "1px solid #a7f3d0" }}>
                      Choose {picaAllowances.canapes || 5} Canapés ({selectedCanapes.length} selected)
                    </span>
                  </h4>
                  <p style={{ margin: "3px 0 0 0", fontSize: "0.76rem", color: "var(--text-muted)" }}>
                    Includes 12 Regular choices (₱0 upgrade) and 10 Special Chef choices (+₱45/pax upgrade).
                  </p>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: "0.55rem" }}>
                {(dishesMenu.canapes || []).map(canape => {
                  const isSel = selectedCanapes.includes(canape.name);
                  const isSpecial = canape.tier === "special" || canape.premium;
                  return (
                    <div
                      key={canape.id || canape.name}
                      onClick={() => handleCanapeToggle(canape.name)}
                      style={{
                        padding: "0.65rem 0.8rem",
                        borderRadius: "8px",
                        border: isSel ? "2px solid #059669" : isSpecial ? "1px dashed #f59e0b" : "1px solid var(--border-subtle)",
                        background: isSel ? "#ecfdf5" : isSpecial ? "#fffdf5" : "#ffffff",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        transition: "all 0.15s ease"
                      }}
                    >
                      <div>
                        <div style={{ fontSize: "0.82rem", fontWeight: isSel ? 800 : 600, color: isSel ? "#065f46" : "var(--text-primary)" }}>
                          {canape.name}
                        </div>
                        {isSpecial && (
                          <span style={{ fontSize: "0.68rem", color: "#b45309", fontWeight: 700 }}>
                            ⭐ Special (+₱45/pax)
                          </span>
                        )}
                      </div>
                      {isSel && <Check size={16} color="#059669" />}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. FINGER FOOD */}
            {(picaAllowances.fingerFood || 0) > 0 && (
              <div style={{ marginBottom: "1.75rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem", flexWrap: "wrap", gap: "0.5rem" }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 800, color: "#1e293b", display: "flex", alignItems: "center", gap: "6px" }}>
                      <span>🍗 Finger Food Selection</span>
                      <span style={{ fontSize: "0.75rem", color: "#047857", background: "#d1fae5", padding: "2px 8px", borderRadius: "10px", border: "1px solid #a7f3d0" }}>
                        Choose {picaAllowances.fingerFood} Items ({selectedFingerFoods.length} selected)
                      </span>
                    </h4>
                    <p style={{ margin: "3px 0 0 0", fontSize: "0.76rem", color: "var(--text-muted)" }}>
                      Savory deep-fried and grilled cocktail delights.
                    </p>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: "0.55rem" }}>
                  {(dishesMenu.fingerFood || []).map(item => {
                    const isSel = selectedFingerFoods.includes(item.name);
                    return (
                      <div
                        key={item.id || item.name}
                        onClick={() => handleFingerFoodToggle(item.name)}
                        style={{
                          padding: "0.65rem 0.8rem",
                          borderRadius: "8px",
                          border: isSel ? "2px solid #059669" : "1px solid var(--border-subtle)",
                          background: isSel ? "#ecfdf5" : "#ffffff",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          transition: "all 0.15s ease"
                        }}
                      >
                        <span style={{ fontSize: "0.82rem", fontWeight: isSel ? 800 : 600, color: isSel ? "#065f46" : "var(--text-primary)" }}>
                          {item.name}
                        </span>
                        {isSel && <Check size={16} color="#059669" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 4. MINI DESSERT CUPS */}
            {(picaAllowances.miniDesserts || 0) > 0 && (
              <div style={{ marginBottom: "1.75rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem", flexWrap: "wrap", gap: "0.5rem" }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 800, color: "#1e293b", display: "flex", alignItems: "center", gap: "6px" }}>
                      <span>🍮 Mini Dessert Cups</span>
                      <span style={{ fontSize: "0.75rem", color: "#047857", background: "#d1fae5", padding: "2px 8px", borderRadius: "10px", border: "1px solid #a7f3d0" }}>
                        Choose {picaAllowances.miniDesserts} Dessert Cups ({selectedMiniDesserts.length} selected)
                      </span>
                    </h4>
                    <p style={{ margin: "3px 0 0 0", fontSize: "0.76rem", color: "var(--text-muted)" }}>
                      Individual chilled shooters, parfaits, and cheesecakes.
                    </p>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: "0.55rem" }}>
                  {(dishesMenu.miniDesserts || []).map(item => {
                    const isSel = selectedMiniDesserts.includes(item.name);
                    return (
                      <div
                        key={item.id || item.name}
                        onClick={() => handleMiniDessertToggle(item.name)}
                        style={{
                          padding: "0.65rem 0.8rem",
                          borderRadius: "8px",
                          border: isSel ? "2px solid #059669" : "1px solid var(--border-subtle)",
                          background: isSel ? "#ecfdf5" : "#ffffff",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          transition: "all 0.15s ease"
                        }}
                      >
                        <span style={{ fontSize: "0.82rem", fontWeight: isSel ? 800 : 600, color: isSel ? "#065f46" : "var(--text-primary)" }}>
                          {item.name}
                        </span>
                        {isSel && <Check size={16} color="#059669" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 5. Special Inclusions for Option 3 Grand Tier */}
            {picaAllowances.hasKakanin && (
              <div style={{ background: "#fefce8", border: "1.5px solid #fef08a", borderRadius: "10px", padding: "0.85rem 1rem", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "1.3rem" }}>🥥</span>
                <div>
                  <strong style={{ fontSize: "0.88rem", color: "#854d0e" }}>Included: Pinoy Kakanins Platter</strong>
                  <div style={{ fontSize: "0.74rem", color: "#a16207" }}>Traditional Filipino native delicacies included in Option 3 Grand Tier setup.</div>
                </div>
              </div>
            )}

            {picaAllowances.hasDiyStation && (
              <div style={{ background: "#eff6ff", border: "1.5px solid #bfdbfe", borderRadius: "10px", padding: "1rem", marginBottom: "1.25rem" }}>
                <label className="form-label" style={{ fontSize: "0.86rem", fontWeight: 800, color: "#1e40af", marginBottom: "0.5rem" }}>
                  🎪 Choice of Interactive DIY Food Station (Option 3 Inclusions):
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <button
                    type="button"
                    onClick={() => setPicaDiyStation("DIY Nacho Station")}
                    style={{
                      padding: "0.75rem",
                      borderRadius: "8px",
                      border: picaDiyStation === "DIY Nacho Station" ? "2px solid #2563eb" : "1px solid #cbd5e1",
                      background: picaDiyStation === "DIY Nacho Station" ? "#ffffff" : "transparent",
                      color: picaDiyStation === "DIY Nacho Station" ? "#1e40af" : "#475569",
                      fontWeight: 700,
                      cursor: "pointer",
                      textAlign: "left"
                    }}
                  >
                    🧀 DIY Nacho Station
                    <div style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 400 }}>Warm cheese fondue, salsa, ground beef & tortilla chips</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPicaDiyStation("DIY Mini Doughnut Station")}
                    style={{
                      padding: "0.75rem",
                      borderRadius: "8px",
                      border: picaDiyStation === "DIY Mini Doughnut Station" ? "2px solid #2563eb" : "1px solid #cbd5e1",
                      background: picaDiyStation === "DIY Mini Doughnut Station" ? "#ffffff" : "transparent",
                      color: picaDiyStation === "DIY Mini Doughnut Station" ? "#1e40af" : "#475569",
                      fontWeight: 700,
                      cursor: "pointer",
                      textAlign: "left"
                    }}
                  >
                    🍩 DIY Mini Doughnut Station
                    <div style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 400 }}>Assorted glazes, chocolate drizzles & colorful sprinkles</div>
                  </button>
                </div>
              </div>
            )}

            {/* 6. Choice of Beverage: Juice or Coffee */}
            {((picaAllowances.drinks || 0) > 0 || (!currentPkg.id.includes("petite") && !currentPkg.id.includes("party"))) && (
              <div style={{ background: "#f8fafc", border: "1px solid var(--border-subtle)", borderRadius: "10px", padding: "1rem" }}>
                <label className="form-label" style={{ fontSize: "0.85rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "0.4rem" }}>
                  🥤 Choice of Beverage (Included):
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <button
                    type="button"
                    onClick={() => setPicaBeverage("Choice of Juice (House Red Iced Tea)")}
                    style={{
                      padding: "0.75rem",
                      borderRadius: "8px",
                      border: picaBeverage.includes("Juice") ? "2px solid #059669" : "1px solid var(--border-subtle)",
                      background: picaBeverage.includes("Juice") ? "#ecfdf5" : "transparent",
                      color: picaBeverage.includes("Juice") ? "#065f46" : "var(--text-secondary)",
                      fontWeight: 700,
                      cursor: "pointer"
                    }}
                  >
                    🍹 Choice of Juice (House Red Iced Tea)
                  </button>

                  <button
                    type="button"
                    onClick={() => setPicaBeverage("Freshly Brewed Hot Coffee")}
                    style={{
                      padding: "0.75rem",
                      borderRadius: "8px",
                      border: picaBeverage.includes("Coffee") ? "2px solid #059669" : "1px solid var(--border-subtle)",
                      background: picaBeverage.includes("Coffee") ? "#ecfdf5" : "transparent",
                      color: picaBeverage.includes("Coffee") ? "#065f46" : "var(--text-secondary)",
                      fontWeight: 700,
                      cursor: "pointer"
                    }}
                  >
                    ☕ Freshly Brewed Hot Coffee
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : isGrazingTable ? (
          <div className="card-section" id="section-grazing-curation">
            <div className="section-header">
              <div className="section-title">
                <div className="step-number">3</div>
                <span>Customize Artisan Grazing Table</span>
              </div>
              <span style={{ fontSize: "0.78rem", color: "#5b21b6", fontWeight: 700, background: "#ede9fe", padding: "3px 10px", borderRadius: "12px", border: "1px solid #c4b5fd" }}>
                {currentPkg.name} • ₱{currentPkg.price?.toLocaleString()}
              </span>
            </div>

            {/* Luxury Charcuterie Spread Inclusions Card */}
            <div style={{
              background: "linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)",
              border: "1.5px solid #d8b4fe",
              borderRadius: "12px",
              padding: "1.25rem",
              marginBottom: "1.5rem"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "0.75rem" }}>
                <span style={{ fontSize: "1.4rem" }}>🧀</span>
                <div>
                  <h4 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 800, color: "#5b21b6" }}>
                    Standard Artisan Charcuterie Board Inclusions
                  </h4>
                  <div style={{ fontSize: "0.78rem", color: "#6d28d9" }}>
                    Prepared fresh on-site with fine styling, eucalyptus foliage & slate risers
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "0.6rem", fontSize: "0.8rem", color: "#4c1d95" }}>
                {(currentPkg.inclusions && currentPkg.inclusions.length > 0
                  ? currentPkg.inclusions
                  : [
                      "5 Kilos of Italian Cured Meats (Prosciutto, Salami, Mortadella, Coppa)",
                      "5 Types of Premium Imported Cheeses (Brie, Gouda, Cheddar, Blue Cheese, etc.)",
                      "5 Big Seasonal Fresh Fruit Platters",
                      "Hungarian Sausage Platter with gourmet mustard dip",
                      "Artisan Breadbasket with Jam and Bread",
                      "Wafers, Saltin Crackers & Bretzels",
                      "Vegetable Sticks with Creamy Dips",
                      "Olives, Cocktail Onions & Grazing Cups",
                      "Mix Assorted Nuts & Dried Fruits",
                      "Complete Nachos Station with warm cheese sauce & salsa"
                    ]
                ).map((inc, i) => (
                  <div key={i} style={{ background: "#ffffff", padding: "0.6rem 0.8rem", borderRadius: "8px", border: "1px solid #e9d5ff", display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ color: "#7c3aed", fontWeight: 800 }}>✔</span>
                    <strong>{inc}</strong>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Canapés */}
            <div style={{ marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem", flexWrap: "wrap", gap: "0.5rem" }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 800, color: "#1e293b", display: "flex", alignItems: "center", gap: "6px" }}>
                    <span>🥪 Choose {grazingAllowances.canapes || 5} Canapés for your Grazing Table</span>
                    <span style={{ fontSize: "0.75rem", color: "#7c3aed", background: "#f5f3ff", padding: "2px 8px", borderRadius: "10px", border: "1px solid #ddd6fe" }}>
                      {selectedCanapes.length} of {grazingAllowances.canapes || 5} selected
                    </span>
                  </h4>
                  <p style={{ margin: "3px 0 0 0", fontSize: "0.76rem", color: "var(--text-muted)" }}>
                    Select {grazingAllowances.canapes || 5} freshly styled finger canapés. Special options add +₱45/pax upgrade.
                  </p>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: "0.55rem" }}>
                {(dishesMenu.canapes || []).map(canape => {
                  const isSel = selectedCanapes.includes(canape.name);
                  const isSpecial = canape.tier === "special" || canape.premium;
                  return (
                    <div
                      key={canape.id || canape.name}
                      onClick={() => handleCanapeToggle(canape.name)}
                      style={{
                        padding: "0.65rem 0.8rem",
                        borderRadius: "8px",
                        border: isSel ? "2px solid #7c3aed" : isSpecial ? "1px dashed #f59e0b" : "1px solid var(--border-subtle)",
                        background: isSel ? "#f5f3ff" : isSpecial ? "#fffdf5" : "#ffffff",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        transition: "all 0.15s ease"
                      }}
                    >
                      <div>
                        <div style={{ fontSize: "0.82rem", fontWeight: isSel ? 800 : 600, color: isSel ? "#5b21b6" : "var(--text-primary)" }}>
                          {canape.name}
                        </div>
                        {isSpecial && (
                          <span style={{ fontSize: "0.68rem", color: "#b45309", fontWeight: 700 }}>
                            ⭐ Special (+₱45/pax)
                          </span>
                        )}
                      </div>
                      {isSel && <Check size={16} color="#7c3aed" />}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Custom Sliders */}
            <div style={{ marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem", flexWrap: "wrap", gap: "0.5rem" }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 800, color: "#1e293b", display: "flex", alignItems: "center", gap: "6px" }}>
                    <span>🍔 Choose {grazingAllowances.sliders || 4} Sliders for your Grazing Table</span>
                    <span style={{ fontSize: "0.75rem", color: "#7c3aed", background: "#f5f3ff", padding: "2px 8px", borderRadius: "10px", border: "1px solid #ddd6fe" }}>
                      {selectedSliders.length} of {grazingAllowances.sliders || 4} selected
                    </span>
                  </h4>
                  <p style={{ margin: "3px 0 0 0", fontSize: "0.76rem", color: "var(--text-muted)" }}>
                    Select {grazingAllowances.sliders || 4} mini sandwiches & burger sliders. Special options add +₱45/pax upgrade.
                  </p>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: "0.55rem" }}>
                {(dishesMenu.sliders || []).map(slider => {
                  const isSel = selectedSliders.includes(slider.name);
                  const isSpecial = slider.tier === "special" || slider.premium;
                  return (
                    <div
                      key={slider.id || slider.name}
                      onClick={() => handleSliderToggle(slider.name)}
                      style={{
                        padding: "0.65rem 0.8rem",
                        borderRadius: "8px",
                        border: isSel ? "2px solid #7c3aed" : isSpecial ? "1px dashed #f59e0b" : "1px solid var(--border-subtle)",
                        background: isSel ? "#f5f3ff" : isSpecial ? "#fffdf5" : "#ffffff",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        transition: "all 0.15s ease"
                      }}
                    >
                      <div>
                        <div style={{ fontSize: "0.82rem", fontWeight: isSel ? 800 : 600, color: isSel ? "#5b21b6" : "var(--text-primary)" }}>
                          {slider.name}
                        </div>
                        {isSpecial && (
                          <span style={{ fontSize: "0.68rem", color: "#b45309", fontWeight: 700 }}>
                            ⭐ Special (+₱45/pax)
                          </span>
                        )}
                      </div>
                      {isSel && <Check size={16} color="#7c3aed" />}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : isPackedMeal ? (
          <div className="card-section" id="section-packed-meal">
            <div className="section-header">
              <div className="section-title">
                <div className="step-number">3</div>
                <span>Customize Packed Meal / Bento Box Menu</span>
              </div>
              <span style={{ fontSize: "0.78rem", color: "#c2410c", fontWeight: 700, background: "#ffedd5", padding: "3px 10px", borderRadius: "12px", border: "1px solid #fed7aa" }}>
                {currentPkg.name} • ₱{currentPkg.pricePerPax}/pax (Min 50 Pax)
              </span>
            </div>

            {/* Inclusions Banner */}
            <div style={{
              background: "linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)",
              border: "1.5px solid #fed7aa",
              borderRadius: "12px",
              padding: "1rem 1.25rem",
              marginBottom: "1.5rem"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem", marginBottom: "0.75rem" }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 800, color: "#9a3412" }}>
                    🍱 {currentPkg.name} — Course Allowances
                  </h4>
                  <p style={{ margin: "2px 0 0 0", fontSize: "0.76rem", color: "#c2410c" }}>
                    Formula: <strong>{currentPkg.subtitle}</strong>
                  </p>
                </div>
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  <span style={{
                    fontSize: "0.74rem",
                    fontWeight: 700,
                    padding: "3px 8px",
                    borderRadius: "8px",
                    background: selectedMainDishes.length === (currentPkg.mainDishesCount || 1) ? "#ea580c" : "#ffffff",
                    color: selectedMainDishes.length === (currentPkg.mainDishesCount || 1) ? "#ffffff" : "#9a3412",
                    border: "1px solid #ea580c"
                  }}>
                    {selectedMainDishes.length}/{currentPkg.mainDishesCount || 1} Mains
                  </span>
                  <span style={{
                    fontSize: "0.74rem",
                    fontWeight: 700,
                    padding: "3px 8px",
                    borderRadius: "8px",
                    background: [sideDishes.regular, sideDishes.regular2].filter(Boolean).length === (currentPkg.sideDishes?.regular || 1) ? "#ea580c" : "#ffffff",
                    color: [sideDishes.regular, sideDishes.regular2].filter(Boolean).length === (currentPkg.sideDishes?.regular || 1) ? "#ffffff" : "#9a3412",
                    border: "1px solid #ea580c"
                  }}>
                    {[sideDishes.regular, sideDishes.regular2].filter(Boolean).length}/{currentPkg.sideDishes?.regular || 1} Sides
                  </span>
                  {currentPkg.hasDessertCup && (
                    <span style={{
                      fontSize: "0.74rem",
                      fontWeight: 700,
                      padding: "3px 8px",
                      borderRadius: "8px",
                      background: desserts.regular ? "#ea580c" : "#ffffff",
                      color: desserts.regular ? "#ffffff" : "#9a3412",
                      border: "1px solid #ea580c"
                    }}>
                      1 Dessert Cup
                    </span>
                  )}
                </div>
              </div>

              {/* Bento Box Features */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "0.5rem", fontSize: "0.78rem", color: "#7c2d12" }}>
                <div>✔ Partitioned hygienic bento box with snap lid</div>
                <div>✔ Sealed cutlery pack (spoon, fork, toothpick, napkin)</div>
                <div>✔ Prepared hot & fresh on event delivery schedule</div>
                <div>✔ Delivered in insulated thermal catering warmers</div>
              </div>
            </div>

            {/* Quick Chef Pre-Sets (Option A, Option B, Option C) from flyer */}
            {currentPkg.comboOptions && currentPkg.comboOptions.length > 0 && (
              <div style={{ marginBottom: "1.75rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem", flexWrap: "wrap", gap: "0.5rem" }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 800, color: "#1e293b", display: "flex", alignItems: "center", gap: "6px" }}>
                      <span>⭐ Palatable Chef Pre-Set Sets (1-Click Auto Select)</span>
                    </h4>
                    <p style={{ margin: "3px 0 0 0", fontSize: "0.76rem", color: "var(--text-muted)" }}>
                      Select an official chef combo from the flyer, or customize your dishes below:
                    </p>
                  </div>
                  {selectedPackedMealSet && selectedPackedMealSet !== "custom" && (
                    <span style={{ fontSize: "0.74rem", color: "#ea580c", background: "#fff7ed", padding: "2px 10px", borderRadius: "10px", border: "1px solid #fed7aa", fontWeight: 700 }}>
                      Selected: Set {selectedPackedMealSet.slice(-1)}
                    </span>
                  )}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "0.85rem" }}>
                  {currentPkg.comboOptions.map(combo => {
                    const isSelected = selectedPackedMealSet === combo.code;
                    return (
                      <div
                        key={combo.code}
                        onClick={() => {
                          setSelectedPackedMealSet(combo.code);
                          const mains = [combo.main, combo.main2].filter(Boolean);
                          setSelectedMainDishes(mains);
                          setSideDishes({
                            regular: combo.side || "",
                            regular2: combo.side2 || "",
                            special: ""
                          });
                          if (combo.dessert) {
                            setDesserts({ regular: combo.dessert, special: "" });
                          }
                          if (combo.rice) {
                            setRiceOrSoup(combo.rice);
                          }
                          if (combo.drinks) {
                            setBeverage(combo.drinks);
                          }
                        }}
                        style={{
                          padding: "1rem",
                          borderRadius: "12px",
                          border: isSelected ? "2px solid #ea580c" : "1px solid #e2e8f0",
                          background: isSelected ? "#fff7ed" : "#ffffff",
                          boxShadow: isSelected ? "0 4px 14px rgba(234, 88, 12, 0.15)" : "0 1px 3px rgba(0,0,0,0.05)",
                          cursor: "pointer",
                          transition: "all 0.2s ease"
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                          <span style={{ fontWeight: 800, fontSize: "0.92rem", color: isSelected ? "#c2410c" : "#0f172a" }}>
                            {combo.name}
                          </span>
                          <span style={{
                            fontSize: "0.68rem",
                            fontWeight: 800,
                            padding: "2px 8px",
                            borderRadius: "10px",
                            background: isSelected ? "#ea580c" : "#f1f5f9",
                            color: isSelected ? "#ffffff" : "#64748b"
                          }}>
                            {isSelected ? "Selected ✓" : combo.code}
                          </span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "0.78rem", color: "#334155" }}>
                          {combo.items.map((item, idx) => (
                            <div key={idx} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <span style={{ color: isSelected ? "#ea580c" : "#94a3b8" }}>✔</span>
                              <span style={{ fontWeight: idx < (currentPkg.mainDishesCount || 1) ? 700 : 500 }}>
                                {item}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Custom Viand Selection */}
            <div style={{ marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem", flexWrap: "wrap", gap: "0.5rem" }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 800, color: "#1e293b", display: "flex", alignItems: "center", gap: "6px" }}>
                    <span>🍗 Choose {currentPkg.mainDishesCount || 1} Main Viand{(currentPkg.mainDishesCount || 1) > 1 ? "s" : ""}</span>
                    <span style={{ fontSize: "0.75rem", color: "#c2410c", background: "#fff7ed", padding: "2px 8px", borderRadius: "10px", border: "1px solid #fed7aa" }}>
                      {selectedMainDishes.length} of {currentPkg.mainDishesCount || 1} selected
                    </span>
                  </h4>
                  <p style={{ margin: "3px 0 0 0", fontSize: "0.76rem", color: "var(--text-muted)" }}>
                    Select from Beef, Pork, Chicken, or Fish options:
                  </p>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: "0.55rem" }}>
                {[
                  ...(dishesMenu.chicken || []),
                  ...(dishesMenu.pork || []),
                  ...(dishesMenu.beef || []),
                  ...(dishesMenu.fish || [])
                ].filter(d => d.tier !== "special" && !d.premium).map(dish => {
                  const isSel = selectedMainDishes.includes(dish.name);
                  return (
                    <div
                      key={dish.id || dish.name}
                      onClick={() => {
                        setSelectedPackedMealSet("custom");
                        if (isSel) {
                          setSelectedMainDishes(prev => prev.filter(n => n !== dish.name));
                        } else {
                          const maxCount = currentPkg.mainDishesCount || 1;
                          if (selectedMainDishes.length < maxCount) {
                            setSelectedMainDishes(prev => [...prev, dish.name]);
                          } else if (maxCount === 1) {
                            setSelectedMainDishes([dish.name]);
                          }
                        }
                      }}
                      style={{
                        padding: "0.65rem 0.8rem",
                        borderRadius: "8px",
                        border: isSel ? "2px solid #ea580c" : "1px solid var(--border-subtle)",
                        background: isSel ? "#fff7ed" : "#ffffff",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        transition: "all 0.15s ease"
                      }}
                    >
                      <div>
                        <div style={{ fontSize: "0.82rem", fontWeight: isSel ? 800 : 600, color: isSel ? "#9a3412" : "var(--text-primary)" }}>
                          {dish.name}
                        </div>
                        <div style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>
                          {dish.description?.slice(0, 48)}...
                        </div>
                      </div>
                      {isSel && <Check size={16} color="#ea580c" />}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Custom Side Dishes */}
            <div style={{ marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem", flexWrap: "wrap", gap: "0.5rem" }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 800, color: "#1e293b", display: "flex", alignItems: "center", gap: "6px" }}>
                    <span>🥗 Choose {currentPkg.sideDishes?.regular || 1} Side Dish{(currentPkg.sideDishes?.regular || 1) > 1 ? "es" : ""}</span>
                  </h4>
                  <p style={{ margin: "3px 0 0 0", fontSize: "0.76rem", color: "var(--text-muted)" }}>
                    Tuna macaroni salad, buttered veggies, sotanghon, baked penne, lumpiang shanghai, etc.
                  </p>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: (currentPkg.sideDishes?.regular || 1) > 1 ? "1fr 1fr" : "1fr", gap: "1rem" }}>
                <div>
                  <label className="form-label" style={{ fontSize: "0.78rem", fontWeight: 700 }}>Side Dish 1 *</label>
                  <select
                    className="form-select"
                    value={sideDishes.regular}
                    onChange={(e) => {
                      setSelectedPackedMealSet("custom");
                      setSideDishes(prev => ({ ...prev, regular: e.target.value }));
                    }}
                  >
                    <option value="">-- Choose Side Dish 1 --</option>
                    {(dishesMenu.noodlesOrVeg || []).filter(d => d.tier !== "special" && !d.premium).map((d, i) => (
                      <option key={`pm-sd1-${i}`} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>
                {(currentPkg.sideDishes?.regular || 1) > 1 && (
                  <div>
                    <label className="form-label" style={{ fontSize: "0.78rem", fontWeight: 700 }}>Side Dish 2 *</label>
                    <select
                      className="form-select"
                      value={sideDishes.regular2 || ""}
                      onChange={(e) => {
                        setSelectedPackedMealSet("custom");
                        setSideDishes(prev => ({ ...prev, regular2: e.target.value }));
                      }}
                    >
                      <option value="">-- Choose Side Dish 2 --</option>
                      {(dishesMenu.noodlesOrVeg || []).filter(d => d.tier !== "special" && !d.premium).map((d, i) => (
                        <option key={`pm-sd2-${i}`} value={d.name}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Chilled Dessert Cup (If Package has Dessert Cup) */}
            {currentPkg.hasDessertCup && (
              <div style={{ marginBottom: "1.5rem" }}>
                <label className="form-label" style={{ fontSize: "0.78rem", fontWeight: 700, color: "#1e293b" }}>
                  🍮 Chilled Dessert Cup (Included) *
                </label>
                <select
                  className="form-select"
                  value={desserts.regular}
                  onChange={(e) => {
                    setSelectedPackedMealSet("custom");
                    setDesserts(prev => ({ ...prev, regular: e.target.value }));
                  }}
                >
                  <option value="Creamy Fruit Salad">Creamy Fruit Salad</option>
                  <option value="Mango Tapioca">Mango Tapioca</option>
                  <option value="Strawberry Short Cake">Strawberry Short Cake</option>
                  <option value="Coffee Jelly">Coffee Jelly</option>
                  <option value="Buko Pandan">Buko Pandan</option>
                  <option value="Fruit Salad">Fruit Salad</option>
                </select>
              </div>
            )}

            {/* Rice & Beverage Options */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label className="form-label" style={{ fontSize: "0.78rem", fontWeight: 700 }}>Rice Selection *</label>
                <select
                  className="form-select"
                  value={riceOrSoup}
                  onChange={(e) => {
                    setSelectedPackedMealSet("custom");
                    setRiceOrSoup(e.target.value);
                  }}
                >
                  {(currentPkg.riceOptions || ["Plain Rice", "Garlic Rice", "Java Rice"]).map((r, i) => (
                    <option key={`pm-rice-${i}`} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label" style={{ fontSize: "0.78rem", fontWeight: 700 }}>Beverage Selection *</label>
                <select
                  className="form-select"
                  value={beverage}
                  onChange={(e) => {
                    setSelectedPackedMealSet("custom");
                    setBeverage(e.target.value);
                  }}
                >
                  {(currentPkg.drinkOptions || ["Soda (Coke / Sprite / Royal)"]).map((dr, i) => (
                    <option key={`pm-dr-${i}`} value={dr}>{dr}</option>
                  ))}
                  <option value="Soda (Coke)">Soda (Coke)</option>
                  <option value="Soda (Sprite)">Soda (Sprite)</option>
                  <option value="Soda (Royal)">Soda (Royal)</option>
                  {currentPkg.hasBottledWater && (
                    <option value="Soda or C2 Green Tea + Bottled Water">Soda or C2 Green Tea + Bottled Water</option>
                  )}
                </select>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Package Bargain & Custom Swap Deals Card */}
            {!isFoodTray && !isPromo && (
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
            )}

            {/* Step 3: Authentic Filipino Viands Picker */}
            <div className="card-section" id="section-main-dishes">
              <div className="section-header">
                <div className="section-title">
                  <div className="step-number">3</div>
                  <span>{isFoodTray ? "Select Viands in Food Trays" : "Filipino Viand & Course Selection"}</span>
                </div>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  {maxMainDishes} Main Dish{maxMainDishes > 1 ? "es" : ""} {isFoodTray ? "in Trays" : "Included"}
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
              ) : isPromo ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem" }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 800, color: "#991b1b" }}>🍲 Choice of Hot Soup (Included in Promo) *</label>
                    <select
                      className="form-select"
                      value={selectedSoup}
                      onChange={(e) => setSelectedSoup(e.target.value)}
                    >
                      {SOUP_OPTIONS.map((s, idx) => (
                        <option key={idx} value={s}>{s}</option>
                      ))}
                    </select>
                    <span style={{ fontSize: "0.7rem", color: "#991b1b", marginTop: "2px", display: "block" }}>
                      Served hot in warm buffet soup tureens with bowls
                    </span>
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 800 }}>🍚 Steamed Jasmine Rice (Included in Promo) *</label>
                    <input
                      type="text"
                      className="form-input"
                      readOnly
                      value="Steamed Pandan Jasmine Rice (Complimentary)"
                      style={{ background: "#f8fafc", color: "#334155", fontWeight: 600 }}
                    />
                    <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "2px", display: "block" }}>
                      Fragrant steamed jasmine rice for all 50+ guests
                    </span>
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 800 }}>🍹 Choice of: Soda or Juice *</label>
                    <select
                      className="form-select"
                      value={beverage}
                      onChange={(e) => setBeverage(e.target.value)}
                    >
                      <option value="Soda (Coke / Sprite / Royal)">Soda (Coke / Sprite / Royal)</option>
                      <option value="Bottomless Signature Red Iced Tea">Bottomless Signature Red Iced Tea</option>
                      <option value="Fresh Calamansi Citrus Cooler">Fresh Calamansi Citrus Cooler</option>
                      <option value="Blue Lemonade Refresher">Blue Lemonade Refresher</option>
                    </select>
                    <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "2px", display: "block" }}>
                      Chilled refreshments throughout 4 hours catering service
                    </span>
                  </div>
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
          </>
        )}

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
          {isConference ? (
            <>
              <div className="line-item-row">
                <span style={{ fontWeight: 800, color: "#1e3a8a" }}>Government Conference ({confDaysNum} Days)</span>
                <span className="val" style={{ color: "#1e40af", fontWeight: 800 }}>₱{foodTotal.toLocaleString()}</span>
              </div>
              <div style={{ fontSize: "0.72rem", color: "#2563eb", marginTop: "-4px" }}>
                ₱1,290 / pax / day × {pax} guests × {confDaysNum} {confDaysNum === 1 ? "day" : "days"} (4 Meals Daily)
              </div>

              {/* 4-Meal Conference Schedule Summary Box */}
              <div style={{ background: "#f8fafc", border: "1px solid #93c5fd", borderRadius: "10px", padding: "10px", marginTop: "0.4rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", fontWeight: 800, color: "#1e3a8a", marginBottom: "6px" }}>
                  <span>Daily 4-Meal Schedule</span>
                  <span style={{ color: "#059669" }}>Allotted ✓</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "0.72rem", color: "#334155" }}>
                  <div>
                    <strong style={{ color: "#1e40af" }}>🥪 09:30 AM (AM Snacks):</strong>
                    <div style={{ paddingLeft: "8px", color: "#475569" }}>• {amSnackDish} + {amSnackDrink}</div>
                  </div>
                  <div>
                    <strong style={{ color: "#166534" }}>🍱 12:00 PM (Lunch - Pkg 1):</strong>
                    <div style={{ paddingLeft: "8px", color: "#475569" }}>
                      • Mains: {selectedMainDishes.slice(0, 3).join(", ") || "3 regular viands"}<br />
                      • Side: {selectedSides[0] || "Pasta/Veg"} • {riceOrSoup} • {selectedDessertsList[0] || "Dessert"} • {beverage}
                    </div>
                  </div>
                  <div>
                    <strong style={{ color: "#9a3412" }}>🍝 03:00 PM (PM Snacks):</strong>
                    <div style={{ paddingLeft: "8px", color: "#475569" }}>• {pmSnackDish} + {pmSnackDrink}</div>
                  </div>
                  <div>
                    <strong style={{ color: "#5b21b6" }}>🍽️ 06:30 PM (Dinner - Pkg 2):</strong>
                    <div style={{ paddingLeft: "8px", color: "#475569" }}>
                      • Mains: {dinnerMainDishes.join(", ") || "4 regular viands"}<br />
                      • Side: {dinnerSide} • {dinnerRice} • {dinnerDessert} • {dinnerDrink}
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : isPicaPica ? (
            <>
              <div className="line-item-row">
                <span style={{ fontWeight: 700 }}>{currentPkg.name}</span>
                <span className="val" style={{ fontWeight: 800 }}>₱{foodTotal.toLocaleString()}</span>
              </div>
              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "-4px" }}>
                ₱{currentPkg.pricePerPax} × {pax} guests (Min 50 Pax • Cocktail Setup)
              </div>

              {/* Pica Pica Selected Items Summary */}
              <div style={{ background: "var(--surface)", border: "1px solid var(--border-subtle)", borderRadius: "8px", padding: "8px 10px", marginTop: "0.4rem" }}>
                <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>
                  🍢 Cocktail Station Inclusions:
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "3px", fontSize: "0.72rem", color: "var(--text-secondary)" }}>
                  <div>🍔 <strong>Sliders ({selectedSliders.length}/{picaAllowances.sliders}):</strong> {selectedSliders.join(" • ") || "None"}</div>
                  <div>🥪 <strong>Canapés ({selectedCanapes.length}/{picaAllowances.canapes}):</strong> {selectedCanapes.join(" • ") || "None"}</div>
                  <div>🍗 <strong>Finger Food ({selectedFingerFoods.length}/{picaAllowances.fingerFood}):</strong> {selectedFingerFoods.join(" • ") || "None"}</div>
                  <div>🍮 <strong>Desserts ({selectedMiniDesserts.length}/{picaAllowances.miniDesserts}):</strong> {selectedMiniDesserts.join(" • ") || "None"}</div>
                  {picaAllowances.hasDiyStation && (
                    <div style={{ color: "#1e40af", fontWeight: 600 }}>🎪 <strong>Station:</strong> {picaDiyStation} + Kakanins</div>
                  )}
                  <div>🥤 <strong>Drink:</strong> {picaBeverage}</div>
                </div>
              </div>

              {specialDishesUpgradeTotal > 0 && (
                <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "8px", padding: "8px 10px", marginTop: "0.4rem" }}>
                  <div className="line-item-row" style={{ color: "#92400e", fontWeight: 700 }}>
                    <span>⭐ Special Upgrades ({specialDishesCount})</span>
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
            </>
          ) : isGrazingTable ? (
            <>
              <div className="line-item-row">
                <span style={{ fontWeight: 700 }}>{currentPkg.name}</span>
                <span className="val" style={{ fontWeight: 800 }}>₱{foodTotal.toLocaleString()}</span>
              </div>
              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "-4px" }}>
                Fixed Tier Rate: ₱{currentPkg.price?.toLocaleString()} for {currentPkg.paxRange || "100-150 PAX"}
              </div>

              {/* Grazing Table Selected Inclusions */}
              <div style={{ background: "var(--surface)", border: "1px solid var(--border-subtle)", borderRadius: "8px", padding: "8px 10px", marginTop: "0.4rem" }}>
                <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>
                  🧀 Grazing Table Spread Highlights:
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "3px", fontSize: "0.72rem", color: "var(--text-secondary)" }}>
                  <div>• 5kg Cured Meats & 5 Imported Cheeses</div>
                  <div>• 5 Big Fruit Platters & Hungarian Sausage</div>
                  <div>🥪 <strong>Canapés ({selectedCanapes.length}/5):</strong> {selectedCanapes.join(" • ")}</div>
                  <div>🍔 <strong>Sliders ({selectedSliders.length}/4):</strong> {selectedSliders.join(" • ")}</div>
                  {currentPkg.name?.includes("Premium") && (
                    <div style={{ color: "#5b21b6", fontWeight: 600 }}>🍮 <strong>Dessert Shots Included</strong></div>
                  )}
                </div>
              </div>
            </>
          ) : isPackedMeal ? (
            <>
              <div className="line-item-row">
                <span style={{ fontWeight: 700 }}>{currentPkg.name}</span>
                <span className="val" style={{ fontWeight: 800 }}>₱{foodTotal.toLocaleString()}</span>
              </div>
              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "-4px" }}>
                ₱{currentPkg.pricePerPax} × {pax} bento meals (Min 50 Pax • {currentPkg.subtitle})
              </div>

              {/* Packed Meal Selected Items Summary */}
              <div style={{ background: "var(--surface)", border: "1px solid var(--border-subtle)", borderRadius: "8px", padding: "8px 10px", marginTop: "0.4rem" }}>
                <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px", display: "flex", justifyContent: "space-between" }}>
                  <span>🍱 Bento Inclusions:</span>
                  {selectedPackedMealSet && selectedPackedMealSet !== "custom" && (
                    <span style={{ fontSize: "0.7rem", color: "#c2410c", background: "#ffedd5", padding: "1px 6px", borderRadius: "6px" }}>
                      {selectedPackedMealSet} Set
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "3px", fontSize: "0.72rem", color: "var(--text-secondary)" }}>
                  <div>🍗 <strong>Main Viand(s):</strong> {selectedMainDishes.join(" • ") || "None"}</div>
                  <div>🥗 <strong>Side(s):</strong> {[sideDishes.regular, sideDishes.regular2].filter(Boolean).join(" • ") || "None"}</div>
                  {currentPkg.hasDessertCup && (
                    <div>🍮 <strong>Dessert Cup:</strong> {desserts.regular || "Creamy Fruit Salad"}</div>
                  )}
                  <div>🍚 <strong>Rice:</strong> {riceOrSoup}</div>
                  <div>🥤 <strong>Drink:</strong> {beverage}</div>
                  {currentPkg.hasBottledWater && (
                    <div>💧 <strong>Water:</strong> Bottled Water Included</div>
                  )}
                </div>
              </div>
            </>
          ) : isPromo ? (
            <>
              <div className="line-item-row">
                <span style={{ fontWeight: 700, color: "#991b1b" }}>🎄 {currentPkg.name}</span>
                <span className="val" style={{ fontWeight: 800 }}>₱{foodTotal.toLocaleString()}</span>
              </div>
              <div style={{ fontSize: "0.72rem", color: "#991b1b", marginTop: "-4px" }}>
                {pax <= (currentPkg.minPax || 50)
                  ? `₱${(currentPkg.price || 35000).toLocaleString()} for ${currentPkg.minPax || 50} PAX (${currentPkg.name})`
                  : `₱${(currentPkg.price || 35000).toLocaleString()} (Base ${currentPkg.minPax || 50} PAX) + ₱${currentPkg.pricePerPax || 700} × ${pax - (currentPkg.minPax || 50)} Extra Guests`}
              </div>

              {/* Bermonths Promo Selected Items Summary */}
              <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", padding: "8px 10px", marginTop: "0.4rem" }}>
                <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#991b1b", marginBottom: "4px", display: "flex", justifyContent: "space-between" }}>
                  <span>🎄 Bermonths Promo Summary:</span>
                  <span style={{ fontSize: "0.7rem", color: "#b91c1c", fontWeight: 700 }}>
                    {promoStartDate} - {promoEndDate}
                  </span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "3px", fontSize: "0.72rem", color: "#7f1d1d" }}>
                  <div>🍗 <strong>Main Viands ({selectedMainDishes.length}/{courseAllowances.mainDishesCount}):</strong> {selectedMainDishes.join(" • ") || "None"}</div>
                  <div>🥗 <strong>Regular Side:</strong> {selectedSides.join(" • ") || "None"}</div>
                  <div>🍮 <strong>Regular Dessert:</strong> {selectedDessertsList[0] || desserts.regular || "None"}</div>
                  <div>🍲 <strong>Hot Soup:</strong> {selectedSoup}</div>
                  <div>🍚 <strong>Rice:</strong> Steamed Pandan Jasmine Rice</div>
                  <div>🥤 <strong>Drink:</strong> {beverage}</div>
                  <div>🧀 <strong>Mini Grazing Table:</strong> 1 Big Charcuterie Platter, 1 Big Fruit Platter, DIY Nachos w/ Cheese Fountain, Canapés, Mini Cups</div>
                  {currentPkg.hasLechon && (
                    <div style={{ color: "#b45309", fontWeight: 700 }}>🐷 <strong>Lechon:</strong> 1 Whole Lechon (50kg Live weight) Included!</div>
                  )}
                  {clientInfo.notes && (
                    <div style={{ color: "#0f172a", fontWeight: 700, borderTop: "1px dashed #fca5a5", paddingTop: "3px", marginTop: "3px" }}>
                      📝 <strong>Note / Remarks:</strong> {clientInfo.notes}
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="line-item-row">
                <span style={{ fontWeight: 700 }}>{currentPkg.name}</span>
                <span className="val" style={{ fontWeight: 800 }}>₱{foodTotal.toLocaleString()}</span>
              </div>
              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "-4px" }}>
                {isFoodTray && currentPkg.price
                  ? `Fixed Batch Rate: ₱${currentPkg.price.toLocaleString()} for ${currentPkg.paxRange || `${currentPkg.minPax}-${currentPkg.maxPax} PAX`} (${maxMainDishes} Mains + ${courseAllowances.regSidesCount} Sides)`
                  : `₱${currentPkg.pricePerPax} × ${pax} guests (${maxMainDishes} Main Dishes)`}
              </div>

              {/* Selected Main Dishes Box in Summary */}
              <div style={{ background: "var(--surface)", border: "1px solid var(--border-subtle)", borderRadius: "8px", padding: "8px 10px", marginTop: "0.4rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>
                  <span>{isFoodTray ? "Viands in Trays" : "Main Dishes"} ({selectedMainDishes.length}/{maxMainDishes}):</span>
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
                  {swapDeal !== "none" && !isFoodTray && (
                    <div style={{ color: "#b45309", fontWeight: 700, background: "#fef3c7", padding: "2px 6px", borderRadius: "4px" }}>
                      🔄 Swap: {swapDeal === "extra_main" ? "Waived Rice, Drinks & Dessert ➔ +1 Main" : "Waived Rice & Drinks ➔ +1 Side"}
                    </div>
                  )}
                  {courseAllowances.regSidesCount > 0 && (
                    <div>🥗 <strong>Sides ({selectedSides.length}/{courseAllowances.regSidesCount}):</strong> {selectedSides.length > 0 ? selectedSides.join(" • ") : "None selected"}{selectedSpecialSide ? ` • ⭐ ${selectedSpecialSide}${courseAllowances.specSidesCount > 0 ? " (Included)" : " (+₱65/pax)"}` : ""}</div>
                  )}
                  {!isFoodTray && (
                    <>
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
            </>
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
          <div className="per-pax-rate">Effective Rate: <strong>₱{effectivePerPax.toLocaleString()} / pax {isConference ? "/ day" : ""}</strong></div>
          {isConference && (
            <div style={{ marginTop: "8px", paddingTop: "6px", borderTop: "1px dashed rgba(255,255,255,0.3)", fontSize: "0.74rem", color: "#fef3c7", lineHeight: 1.35 }}>
              🏛️ <strong>Government Billing Terms:</strong> ₱0 Advance Downpayment Required. 100% backed by Agency Purchase Order (PO/PR: {agencyPoNumber || "On File"}), settled via LDDAP-ADA Net 30/45 Days.
            </div>
          )}
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
