import { 
  CATERING_PACKAGES as DEFAULT_PACKAGES, 
  DISH_MENU_OPTIONS as DEFAULT_DISHES, 
  CATERING_ADDONS as DEFAULT_ADDONS 
} from "../data/cateringData";

import { 
  getQuotationsList, 
  saveQuotation as saveFirebaseQuote, 
  updateQuotationStatus as updateFirebaseQuoteStatus, 
  updateBookingInventory as updateFirebaseBookingInventory,
  deleteQuotationById as deleteFirebaseQuote,
  getDatabaseStatus,
  getPackagesFromFirestore,
  savePackageToFirestore,
  deletePackageFromFirestore,
  getDishesFromFirestore,
  saveDishToFirestore,
  deleteDishFromFirestore,
  getAddonsFromFirestore,
  saveAddonToFirestore,
  deleteAddonFromFirestore
} from "./firebase";

const STORAGE_KEYS = {
  PACKAGES: "hapag_custom_packages",
  DISHES: "hapag_custom_dishes",
  ADDONS: "hapag_custom_addons",
  BOOKINGS: "hapag_local_quotations"
};

// Check if Express backend is running
let isServerOnline = null;
let lastCheckTime = 0;

export async function checkBackendStatus() {
  const now = Date.now();
  if (isServerOnline !== null && now - lastCheckTime < 10000) {
    return {
      isApiServer: isServerOnline,
      mode: isServerOnline ? "Node/Express REST API (Port 5000)" : getDatabaseStatus().mode
    };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);
    const res = await fetch("/api/system-status", { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      isServerOnline = true;
      lastCheckTime = now;
      return {
        isApiServer: true,
        mode: "Express REST API Backend (Port 5000 - Live)",
        details: data
      };
    }
  } catch (e) {
    // API server offline or not accessible
    isServerOnline = false;
  }

  lastCheckTime = now;
  const fbStatus = getDatabaseStatus();
  return {
    isApiServer: false,
    mode: fbStatus.isLive ? "Firebase Cloud Firestore (Live)" : "Local Storage (Demo Mode)",
    firebaseStatus: fbStatus
  };
}

// --- PACKAGES ---
export async function getPackages() {
  // 1. Try Live Cloud Firestore (Accessible on all hostings & domains)
  try {
    const cloudPkgs = await getPackagesFromFirestore();
    if (Array.isArray(cloudPkgs) && cloudPkgs.length > 0) {
      localStorage.setItem(STORAGE_KEYS.PACKAGES, JSON.stringify(cloudPkgs));
      return cloudPkgs;
    }
    // If Firestore collection is empty, seed defaults and local additions to cloud
    if (cloudPkgs !== null && Array.isArray(cloudPkgs) && cloudPkgs.length === 0) {
      const stored = getLocalPackages();
      const toSeed = (stored && stored.length > 0) ? stored : DEFAULT_PACKAGES;
      for (const p of toSeed) {
        await savePackageToFirestore(p);
      }
      return toSeed;
    }
  } catch (err) {
    console.warn("Firestore fetch packages error:", err);
  }

  // 2. Try Express API (only in local dev mode)
  if (isServerOnline) {
    try {
      const res = await fetch("/api/packages");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          localStorage.setItem(STORAGE_KEYS.PACKAGES, JSON.stringify(data));
          return data;
        }
      }
    } catch (err) {}
  }

  // 3. Try LocalStorage
  const stored = getLocalPackages();
  if (stored && stored.length > 0) return stored;

  // 4. Fallback to default seed packages
  return DEFAULT_PACKAGES;
}

export async function savePackage(pkg) {
  const pkgToSave = {
    ...pkg,
    id: pkg.id || "pkg_" + Date.now().toString(36),
    pricePerPax: Number(pkg.pricePerPax) || 0,
    minPax: Number(pkg.minPax) || 50,
    startingPrice: (Number(pkg.pricePerPax) || 0) * (Number(pkg.minPax) || 50),
    courses: pkg.courses || { beef: 1, pork: 1, chicken: 1, noodlesOrVeg: 1, rice: 1, dessert: 1, drinks: 1 },
    inclusions: Array.isArray(pkg.inclusions) ? pkg.inclusions : []
  };

  // 1. Save to Cloud Firestore
  try {
    await savePackageToFirestore(pkgToSave);
  } catch (err) {
    console.warn("Firestore save package error:", err);
  }

  // 2. Save to Express if running locally
  if (isServerOnline) {
    try {
      const isEdit = Boolean(pkg.id && !pkg.isNew);
      const url = isEdit ? `/api/packages/${pkg.id}` : "/api/packages";
      const method = isEdit ? "PUT" : "POST";
      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pkgToSave)
      });
    } catch (err) {}
  }

  // 3. Save to local storage cache
  const packages = getLocalPackages() || [...DEFAULT_PACKAGES];
  const existingIdx = packages.findIndex(p => p.id === pkgToSave.id);
  if (existingIdx >= 0) {
    packages[existingIdx] = pkgToSave;
  } else {
    packages.unshift(pkgToSave);
  }
  localStorage.setItem(STORAGE_KEYS.PACKAGES, JSON.stringify(packages));
  return pkgToSave;
}

export async function deletePackage(id) {
  // 1. Delete from Cloud Firestore
  try {
    await deletePackageFromFirestore(id);
  } catch (err) {
    console.warn("Firestore delete package error:", err);
  }

  // 2. Delete from Express if running locally
  if (isServerOnline) {
    try {
      await fetch(`/api/packages/${id}`, { method: "DELETE" });
    } catch (err) {}
  }

  // 3. Delete from local storage
  const packages = getLocalPackages() || [...DEFAULT_PACKAGES];
  const updated = packages.filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEYS.PACKAGES, JSON.stringify(updated));
  return true;
}

function getLocalPackages() {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.PACKAGES);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  return null;
}

// --- DISHES ---
export async function getDishes() {
  // 1. Try Cloud Firestore
  try {
    const cloudDishes = await getDishesFromFirestore();
    const hasPlatableMenu = cloudDishes?.chicken?.some(d => d.name === "Palatable Fried Chicken")
      && cloudDishes?.noodlesOrVeg?.some(d => d.name === "Creamy Spaghetti")
      && cloudDishes?.dessert?.some(d => d.name === "Mango Tapioca");

    if (cloudDishes && Object.keys(cloudDishes).length > 0 && hasPlatableMenu) {
      localStorage.setItem(STORAGE_KEYS.DISHES, JSON.stringify(cloudDishes));
      return cloudDishes;
    }
    
    // If dishes in Firestore are missing or outdated (e.g. from the old default seed)
    if (!cloudDishes || Object.keys(cloudDishes).length === 0 || !hasPlatableMenu) {
      for (const [cat, dishList] of Object.entries(DEFAULT_DISHES)) {
        for (const d of dishList) {
          await saveDishToFirestore({ ...d, category: cat });
        }
      }
      localStorage.setItem(STORAGE_KEYS.DISHES, JSON.stringify(DEFAULT_DISHES));
      return DEFAULT_DISHES;
    }
  } catch (err) {
    console.warn("Firestore fetch dishes error:", err);
  }

  // 2. Try Express API (local dev)
  if (isServerOnline) {
    try {
      const res = await fetch("/api/dishes");
      if (res.ok) {
        const data = await res.json();
        if (data && Object.keys(data).length > 0) {
          localStorage.setItem(STORAGE_KEYS.DISHES, JSON.stringify(data));
          return data;
        }
      }
    } catch (err) {}
  }

  // 3. Try LocalStorage
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.DISHES);
    if (stored) {
      const parsed = JSON.parse(stored);
      const hasPlatable = parsed?.chicken?.some(d => d.name === "Palatable Fried Chicken")
        && parsed?.noodlesOrVeg?.some(d => d.name === "Creamy Spaghetti")
        && parsed?.dessert?.some(d => d.name === "Mango Tapioca");
      if (parsed && Object.keys(parsed).length > 0 && hasPlatable) return parsed;
    }
  } catch (e) {}

  localStorage.setItem(STORAGE_KEYS.DISHES, JSON.stringify(DEFAULT_DISHES));
  return DEFAULT_DISHES;
}

export async function syncPlatableDishes() {
  try {
    for (const [cat, dishList] of Object.entries(DEFAULT_DISHES)) {
      for (const d of dishList) {
        await saveDishToFirestore({ ...d, category: cat });
      }
    }
    localStorage.setItem(STORAGE_KEYS.DISHES, JSON.stringify(DEFAULT_DISHES));
    return DEFAULT_DISHES;
  } catch (err) {
    console.warn("Failed to manually sync Platable dishes:", err);
    return DEFAULT_DISHES;
  }
}

export async function saveDish({ category, name, description, premium, tier, id, upgradePrice }) {
  const dishId = id || "d_" + Date.now().toString(36);
  const dishTier = tier || (premium ? "special" : "regular");
  const isSpecial = Boolean(premium || dishTier === "special");
  const parsedPrice = typeof upgradePrice === "number" ? upgradePrice : parseFloat(upgradePrice);
  const finalUpgradePrice = isSpecial 
    ? (!isNaN(parsedPrice) && parsedPrice > 0 ? parsedPrice : 65) 
    : 0;

  const dishToSave = {
    id: dishId,
    category: category || "beef",
    name,
    description: description || "",
    tier: dishTier,
    premium: isSpecial,
    upgradePrice: finalUpgradePrice
  };

  // 1. Save to Cloud Firestore
  try {
    await saveDishToFirestore(dishToSave);
  } catch (err) {}

  // 2. Save to Express if running locally
  if (isServerOnline) {
    try {
      const isEdit = Boolean(id);
      const url = isEdit ? `/api/dishes/${id}` : "/api/dishes";
      const method = isEdit ? "PUT" : "POST";
      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dishToSave)
      });
    } catch (err) {}
  }

  // 3. LocalStorage cache
  const allDishes = await getDishes();
  const copy = JSON.parse(JSON.stringify(allDishes));
  const cat = dishToSave.category;
  copy[cat] = copy[cat] || [];
  const idx = copy[cat].findIndex(d => d.id === dishId);
  if (idx >= 0) {
    copy[cat][idx] = dishToSave;
  } else {
    copy[cat].push(dishToSave);
  }
  localStorage.setItem(STORAGE_KEYS.DISHES, JSON.stringify(copy));
  return dishToSave;
}

export async function deleteDish(id) {
  try {
    await deleteDishFromFirestore(id);
  } catch (err) {}

  if (isServerOnline) {
    try {
      await fetch(`/api/dishes/${id}`, { method: "DELETE" });
    } catch (err) {}
  }

  const allDishes = await getDishes();
  const copy = JSON.parse(JSON.stringify(allDishes));
  for (const cat of Object.keys(copy)) {
    copy[cat] = copy[cat].filter(d => d.id !== id);
  }
  localStorage.setItem(STORAGE_KEYS.DISHES, JSON.stringify(copy));
  return true;
}

// --- ADDONS ---
export async function getAddons() {
  // 1. Try Cloud Firestore
  try {
    const cloudAddons = await getAddonsFromFirestore();
    if (Array.isArray(cloudAddons) && cloudAddons.length > 0) {
      localStorage.setItem(STORAGE_KEYS.ADDONS, JSON.stringify(cloudAddons));
      return cloudAddons;
    }
    if (cloudAddons !== null && Array.isArray(cloudAddons) && cloudAddons.length === 0) {
      for (const a of DEFAULT_ADDONS) {
        await saveAddonToFirestore(a);
      }
      return DEFAULT_ADDONS;
    }
  } catch (err) {}

  // 2. Try Express API (local dev)
  if (isServerOnline) {
    try {
      const res = await fetch("/api/addons");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          localStorage.setItem(STORAGE_KEYS.ADDONS, JSON.stringify(data));
          return data;
        }
      }
    } catch (err) {}
  }

  // 3. Try LocalStorage
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.ADDONS);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}

  return DEFAULT_ADDONS;
}

export async function saveAddon(addon) {
  const addonToSave = {
    ...addon,
    id: addon.id || "addon_" + Date.now().toString(36),
    price: Number(addon.price) || 0
  };

  try {
    await saveAddonToFirestore(addonToSave);
  } catch (err) {}

  if (isServerOnline) {
    try {
      const isEdit = Boolean(addon.id && !addon.isNew);
      const url = isEdit ? `/api/addons/${addon.id}` : "/api/addons";
      const method = isEdit ? "PUT" : "POST";
      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addonToSave)
      });
    } catch (err) {}
  }

  const addons = await getAddons();
  const copy = [...addons];
  const idx = copy.findIndex(a => a.id === addonToSave.id);
  if (idx >= 0) {
    copy[idx] = addonToSave;
  } else {
    copy.push(addonToSave);
  }
  localStorage.setItem(STORAGE_KEYS.ADDONS, JSON.stringify(copy));
  return addonToSave;
}

export async function deleteAddon(id) {
  try {
    await deleteAddonFromFirestore(id);
  } catch (err) {}

  if (isServerOnline) {
    try {
      await fetch(`/api/addons/${id}`, { method: "DELETE" });
    } catch (err) {}
  }

  const addons = await getAddons();
  const filtered = addons.filter(a => a.id !== id);
  localStorage.setItem(STORAGE_KEYS.ADDONS, JSON.stringify(filtered));
  return true;
}

// --- BOOKINGS & QUOTATIONS ---
export async function getBookings(companyId = null) {
  // 1. Try Express API
  try {
    const url = companyId ? `/api/bookings?companyId=${encodeURIComponent(companyId)}` : "/api/bookings";
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        return companyId ? data.filter(d => d.companyId === companyId) : data;
      }
    }
  } catch (err) {
    // API server offline
  }

  // 2. Try Firebase Cloud Firestore or LocalStorage (strictly isolated by companyId)
  return await getQuotationsList(companyId);
}

export async function saveBooking(bookingData) {
  const quoteToSave = {
    ...bookingData,
    updatedAt: new Date().toISOString()
  };

  // 1. Try Express API
  try {
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(quoteToSave)
    });

    if (res.ok) {
      const result = await res.json();
      // Also sync to Firebase/local storage as backup
      try { await saveFirebaseQuote(quoteToSave); } catch (e) {}
      return { success: true, id: result.booking?.id || quoteToSave.id, mode: "express" };
    }
  } catch (err) {
    console.warn("Express API save booking failed, falling back to Firebase/Local:", err);
  }

  // 2. Fallback to Firebase or LocalStorage
  return await saveFirebaseQuote(quoteToSave);
}

export async function updateBookingStatus(id, newStatus, customBookingRef = null, extraData = {}) {
  try {
    const res = await fetch(`/api/bookings/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus, bookingReference: customBookingRef, ...extraData })
    });
    if (res.ok) {
      await updateFirebaseQuoteStatus(id, newStatus, customBookingRef, extraData);
      return true;
    }
  } catch (err) {}

  return await updateFirebaseQuoteStatus(id, newStatus, customBookingRef, extraData);
}

export async function updateBookingInventory(id, inventoryData) {
  try {
    const res = await fetch(`/api/bookings/${id}/inventory`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(inventoryData)
    });
    if (res.ok) {
      await updateFirebaseBookingInventory(id, inventoryData);
      return true;
    }
  } catch (err) {}

  return await updateFirebaseBookingInventory(id, inventoryData);
}

export async function deleteBooking(id) {
  try {
    const res = await fetch(`/api/bookings/${id}`, { method: "DELETE" });
    if (res.ok) {
      await deleteFirebaseQuote(id);
      return true;
    }
  } catch (err) {}

  return await deleteFirebaseQuote(id);
}
