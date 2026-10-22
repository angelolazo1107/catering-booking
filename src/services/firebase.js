import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDoc,
  setDoc,
  query, 
  where,
  orderBy, 
  serverTimestamp 
} from "firebase/firestore";

import { 
  formatBookingReference 
} from "../utils/bookingUtils";

const STORAGE_KEY_CONFIG = "hapag_firebase_config";
const STORAGE_KEY_QUOTES = "hapag_local_quotations";

// Clean empty initial state for fresh production database
const SEED_QUOTES = [];

export function clearLocalQuotes() {
  localStorage.setItem(STORAGE_KEY_QUOTES, JSON.stringify([]));
}

export function getStoredFirebaseConfig() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.warn("Could not read stored Firebase config:", e);
  }

  // Fallback to environment variables if provided in Vite .env
  if (import.meta.env.VITE_FIREBASE_API_KEY && import.meta.env.VITE_FIREBASE_PROJECT_ID) {
    return {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID
    };
  }
  return null;
}

export function saveStoredFirebaseConfig(config) {
  if (!config) {
    localStorage.removeItem(STORAGE_KEY_CONFIG);
  } else {
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
  }
}

// Setup live Firebase app if configured
let dbInstance = null;
let firebaseAppInstance = null;

export function initFirebase() {
  const config = getStoredFirebaseConfig();
  if (config && config.apiKey && config.projectId) {
    try {
      firebaseAppInstance = getApps().length === 0 ? initializeApp(config) : getApp();
      dbInstance = getFirestore(firebaseAppInstance);
      return { isLive: true, projectId: config.projectId, db: dbInstance };
    } catch (err) {
      console.error("Firebase init failed, switching to Local Demo mode:", err);
      dbInstance = null;
      return { isLive: false, error: err.message };
    }
  }
  return { isLive: false, reason: "No credentials provided (Using local demo database)" };
}

const firebaseStatus = initFirebase();

export function getDatabaseStatus() {
  const config = getStoredFirebaseConfig();
  return {
    isLive: Boolean(dbInstance),
    mode: dbInstance ? "Firebase Cloud Firestore (Live)" : "Local Storage (Demo Mode)",
    projectId: config?.projectId || null,
    hasConfig: Boolean(config?.apiKey)
  };
}

// CRUD Operations: Dual Live Firebase + Local Fallback

export async function saveQuotation(quotationData) {
  const quoteId = quotationData.id || ("QT-" + Date.now().toString(36).toUpperCase());
  const quoteToSave = {
    ...quotationData,
    id: quoteId,
    updatedAt: new Date().toISOString()
  };

  if (dbInstance) {
    try {
      // Use setDoc with the human-readable quoteId as document key so doc(db, 'quotations', id) always matches directly
      const docRef = doc(dbInstance, "quotations", quoteId);
      await setDoc(docRef, {
        ...quoteToSave,
        serverCreatedAt: serverTimestamp(),
        serverUpdatedAt: serverTimestamp()
      }, { merge: true });
      return { success: true, id: quoteId, mode: "firebase" };
    } catch (error) {
      console.error("Firestore save error, saving to local backup:", error);
    }
  }

  // Local fallback
  const quotes = getLocalQuotes();
  const existingIdx = quotes.findIndex(q => q.id === quoteToSave.id);
  if (existingIdx >= 0) {
    quotes[existingIdx] = quoteToSave;
  } else {
    quotes.unshift(quoteToSave);
  }
  localStorage.setItem(STORAGE_KEY_QUOTES, JSON.stringify(quotes));
  return { success: true, id: quoteToSave.id, mode: "local" };
}

export async function getQuotationsList(companyId = null) {
  if (dbInstance) {
    try {
      let q;
      if (companyId) {
        q = query(collection(dbInstance, "quotations"), where("companyId", "==", companyId));
      } else {
        q = query(collection(dbInstance, "quotations"));
      }
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map(d => {
        const data = d.data();
        return { 
          firestoreId: d.id, 
          ...data,
          id: data.id || d.id 
        };
      });
      list.sort((a, b) => new Date(b.createdAt || b.updatedAt || 0) - new Date(a.createdAt || a.updatedAt || 0));
      return list;
    } catch (err) {
      console.warn("Firestore fetch failed, falling back to local:", err);
    }
  }
  const local = getLocalQuotes();
  if (companyId) {
    return local.filter(q => q.companyId === companyId);
  }
  return local;
}

export async function updateQuotationStatus(id, newStatus, customBookingRef = null, extraData = {}) {
  if (!id) return false;

  const localQuotes = getLocalQuotes();
  const existingLocal = localQuotes.find(q => q.id === id || q.firestoreId === id);

  // Completed status is permanently locked
  if (existingLocal?.status === "Completed") {
    console.warn(`Booking ${id} is Completed and locked against any status changes.`);
    return false;
  }

  // Compute booking reference (Date then time - client name) upon confirmation
  let bookingRef = customBookingRef || existingLocal?.bookingReference;
  if (!bookingRef && (newStatus === "Confirmed" || newStatus === "Ongoing")) {
    bookingRef = formatBookingReference(existingLocal?.eventDate, existingLocal?.eventTime, existingLocal?.clientName);
  }

  const cleanExtraData = { ...extraData };
  Object.keys(cleanExtraData).forEach(k => cleanExtraData[k] === undefined && delete cleanExtraData[k]);

  const fieldsToUpdate = {
    status: newStatus,
    statusUpdatedAt: new Date().toISOString(),
    serverUpdatedAt: serverTimestamp(),
    ...cleanExtraData
  };

  if (bookingRef) {
    fieldsToUpdate.bookingReference = bookingRef;
  }

  if (dbInstance) {
    try {
      let updatedInFirestore = false;
      // 1. Try direct doc reference
      const directRef = doc(dbInstance, "quotations", id);
      const directSnap = await getDoc(directRef);
      if (directSnap.exists()) {
        const docData = directSnap.data();
        if (docData?.status === "Completed") {
          console.warn(`Booking ${id} is Completed in Firestore and locked.`);
          return false;
        }
        if (!bookingRef && (newStatus === "Confirmed" || newStatus === "Ongoing")) {
          fieldsToUpdate.bookingReference = formatBookingReference(docData?.eventDate, docData?.eventTime, docData?.clientName);
        }
        await updateDoc(directRef, fieldsToUpdate);
        updatedInFirestore = true;
      }

      // 2. Query where field "id" == id (for legacy documents created with addDoc)
      if (!updatedInFirestore) {
        const q = query(collection(dbInstance, "quotations"), where("id", "==", id));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          if (snapshot.docs.some(d => d.data()?.status === "Completed")) {
            console.warn(`Booking ${id} is Completed in Firestore and locked.`);
            return false;
          }
          const updatePromises = snapshot.docs.map(d => {
            const docData = d.data();
            const payload = { ...fieldsToUpdate };
            if (!payload.bookingReference && (newStatus === "Confirmed" || newStatus === "Ongoing")) {
              payload.bookingReference = formatBookingReference(docData?.eventDate, docData?.eventTime, docData?.clientName);
            }
            return updateDoc(doc(dbInstance, "quotations", d.id), payload);
          });
          await Promise.all(updatePromises);
          updatedInFirestore = true;
        }
      }

      // 3. Fallback setDoc with merge so it never fails if document key was newly formed
      if (!updatedInFirestore) {
        await setDoc(directRef, {
          id: id,
          ...fieldsToUpdate
        }, { merge: true });
        updatedInFirestore = true;
      }
    } catch (e) {
      console.warn("Firestore status update failed:", e);
    }
  }

  // Update in local storage
  const quotes = getLocalQuotes();
  let found = false;
  const updated = quotes.map(q => {
    if (q.id === id || q.firestoreId === id) {
      found = true;
      return { 
        ...q, 
        ...cleanExtraData,
        status: newStatus, 
        statusUpdatedAt: new Date().toISOString(),
        ...(bookingRef ? { bookingReference: bookingRef } : {})
      };
    }
    return q;
  });
  if (!found) {
    updated.unshift({ 
      id, 
      ...cleanExtraData,
      status: newStatus, 
      statusUpdatedAt: new Date().toISOString(),
      ...(bookingRef ? { bookingReference: bookingRef } : {})
    });
  }
  localStorage.setItem(STORAGE_KEY_QUOTES, JSON.stringify(updated));
  return true;
}

export async function updateBookingInventory(id, inventoryData) {
  if (!id) return false;

  const dataToUpdate = {
    ingressEgressItems: inventoryData.items || [],
    ingressStaffName: inventoryData.ingressStaffName || "",
    egressStaffName: inventoryData.egressStaffName || "",
    clientSignName: inventoryData.clientSignName || "",
    inventoryRemarks: inventoryData.remarks || "",
    inventoryUpdatedAt: new Date().toISOString()
  };

  if (dbInstance) {
    try {
      let updatedInFirestore = false;
      const directRef = doc(dbInstance, "quotations", id);
      const directSnap = await getDoc(directRef);
      if (directSnap.exists()) {
        await updateDoc(directRef, {
          ...dataToUpdate,
          serverUpdatedAt: serverTimestamp()
        });
        updatedInFirestore = true;
      }

      if (!updatedInFirestore) {
        const q = query(collection(dbInstance, "quotations"), where("id", "==", id));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const updatePromises = snapshot.docs.map(d =>
            updateDoc(doc(dbInstance, "quotations", d.id), {
              ...dataToUpdate,
              serverUpdatedAt: serverTimestamp()
            })
          );
          await Promise.all(updatePromises);
          updatedInFirestore = true;
        }
      }

      if (!updatedInFirestore) {
        await setDoc(directRef, {
          id: id,
          ...dataToUpdate,
          serverUpdatedAt: serverTimestamp()
        }, { merge: true });
      }
    } catch (e) {
      console.warn("Firestore inventory update failed:", e);
    }
  }

  // Update in local storage
  const quotes = getLocalQuotes();
  const updated = quotes.map(q => {
    if (q.id === id || q.firestoreId === id) {
      return { ...q, ...dataToUpdate };
    }
    return q;
  });
  localStorage.setItem(STORAGE_KEY_QUOTES, JSON.stringify(updated));
  return true;
}

export async function deleteQuotationById(id) {
  if (!id) return false;

  if (dbInstance) {
    try {
      let deletedInFirestore = false;
      // 1. Try direct doc reference
      const directRef = doc(dbInstance, "quotations", id);
      const directSnap = await getDoc(directRef);
      if (directSnap.exists()) {
        await deleteDoc(directRef);
        deletedInFirestore = true;
      }

      // 2. Query where field "id" == id
      if (!deletedInFirestore) {
        const q = query(collection(dbInstance, "quotations"), where("id", "==", id));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const delPromises = snapshot.docs.map(d => deleteDoc(doc(dbInstance, "quotations", d.id)));
          await Promise.all(delPromises);
        }
      }
    } catch (e) {
      console.warn("Firestore delete failed:", e);
    }
  }

  const quotes = getLocalQuotes().filter(q => q.id !== id && q.firestoreId !== id);
  localStorage.setItem(STORAGE_KEY_QUOTES, JSON.stringify(quotes));
  return true;
}

function getLocalQuotes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_QUOTES);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Filter out old mock demo quotations
    return parsed.filter(q => q.id !== "QT-2026-0812" && q.id !== "QT-2026-0901" && q.id !== "QT-2026-0950");
  } catch (e) {
    return [];
  }
}

// --- COMPANIES FIRESTORE PERSISTENCE & CROSS-ORIGIN SYNC ---

export async function saveCompanyToFirestore(companyData) {
  if (!companyData || !companyData.id) return { success: false, reason: "Invalid company data" };
  const companyDocId = companyData.id;
  const payload = {
    ...companyData,
    updatedAt: new Date().toISOString()
  };

  if (dbInstance) {
    try {
      const docRef = doc(dbInstance, "companies", companyDocId);
      await setDoc(docRef, {
        ...payload,
        serverUpdatedAt: serverTimestamp()
      }, { merge: true });
      return { success: true, id: companyDocId, mode: "firebase" };
    } catch (error) {
      console.error("Firestore save company failed:", error);
    }
  }
  return { success: false, mode: "local" };
}

export async function getCompaniesFromFirestore() {
  if (dbInstance) {
    try {
      const snapshot = await getDocs(collection(dbInstance, "companies"));
      if (!snapshot.empty) {
        const list = snapshot.docs.map(d => ({ ...d.data(), id: d.id }));
        // Clean out any legacy mock tenants
        return list.filter(c => c.id !== "hapag_kalinga" && c.id !== "fiesta_deluxe");
      }
    } catch (err) {
      console.warn("Firestore fetch companies error:", err);
    }
  }
  return [];
}

export async function getCompanyFromFirestore(companyId) {
  if (dbInstance && companyId) {
    try {
      const docRef = doc(dbInstance, "companies", companyId);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        return { ...snapshot.data(), id: snapshot.id };
      }
    } catch (err) {
      console.warn("Firestore get company error:", err);
    }
  }
  return null;
}

export async function deleteCompanyFromFirestore(companyId) {
  if (dbInstance && companyId) {
    try {
      await deleteDoc(doc(dbInstance, "companies", companyId));
      return true;
    } catch (e) {
      console.warn("Firestore delete company error:", e);
    }
  }
  return false;
}

// --- PACKAGES FIRESTORE SYNC ---

export async function getPackagesFromFirestore() {
  if (dbInstance) {
    try {
      const snapshot = await getDocs(collection(dbInstance, "packages"));
      if (!snapshot.empty) {
        const list = snapshot.docs.map(d => ({ ...d.data(), id: d.id }));
        return list;
      }
      return [];
    } catch (err) {
      console.warn("Firestore getPackages error:", err);
    }
  }
  return null;
}

export async function savePackageToFirestore(pkg) {
  if (!pkg) return false;
  const pkgId = pkg.id || "pkg_" + Date.now().toString(36);
  const data = {
    ...pkg,
    id: pkgId,
    pricePerPax: Number(pkg.pricePerPax) || 0,
    minPax: Number(pkg.minPax) || 50,
    startingPrice: (Number(pkg.pricePerPax) || 0) * (Number(pkg.minPax) || 50),
    courses: pkg.courses || { beef: 1, pork: 1, chicken: 1, noodlesOrVeg: 1, rice: 1, dessert: 1, drinks: 1 },
    inclusions: Array.isArray(pkg.inclusions) ? pkg.inclusions : [],
    updatedAt: new Date().toISOString()
  };

  if (dbInstance) {
    try {
      const docRef = doc(dbInstance, "packages", pkgId);
      await setDoc(docRef, {
        ...data,
        serverUpdatedAt: serverTimestamp()
      }, { merge: true });
      return data;
    } catch (err) {
      console.error("Firestore savePackage error:", err);
    }
  }
  return data;
}

export async function deletePackageFromFirestore(id) {
  if (dbInstance && id) {
    try {
      await deleteDoc(doc(dbInstance, "packages", id));
      return true;
    } catch (err) {
      console.warn("Firestore deletePackage error:", err);
    }
  }
  return false;
}

// --- DISHES FIRESTORE SYNC ---

export async function getDishesFromFirestore() {
  if (dbInstance) {
    try {
      const snapshot = await getDocs(collection(dbInstance, "dishes"));
      if (!snapshot.empty) {
        const dishMap = {};
        snapshot.docs.forEach(d => {
          const item = { ...d.data(), id: d.id };
          const cat = item.category || "beef";
          if (!dishMap[cat]) dishMap[cat] = [];
          dishMap[cat].push(item);
        });
        return dishMap;
      }
      return null;
    } catch (err) {
      console.warn("Firestore getDishes error:", err);
    }
  }
  return null;
}

export async function saveDishToFirestore(dish) {
  if (!dish || !dish.name) return false;
  const dishId = dish.id || "d_" + Date.now().toString(36);
  const dishTier = dish.tier || (dish.premium ? "special" : "regular");
  const isSpecial = Boolean(dish.premium || dishTier === "special");
  const parsedPrice = typeof dish.upgradePrice === "number" ? dish.upgradePrice : parseFloat(dish.upgradePrice);
  const finalUpgradePrice = isSpecial
    ? (!isNaN(parsedPrice) && parsedPrice > 0 ? parsedPrice : 65)
    : 0;

  const data = {
    ...dish,
    id: dishId,
    category: dish.category || "beef",
    tier: dishTier,
    premium: isSpecial,
    upgradePrice: finalUpgradePrice,
    updatedAt: new Date().toISOString()
  };

  if (dbInstance) {
    try {
      const docRef = doc(dbInstance, "dishes", dishId);
      await setDoc(docRef, {
        ...data,
        serverUpdatedAt: serverTimestamp()
      }, { merge: true });
      return data;
    } catch (err) {
      console.error("Firestore saveDish error:", err);
    }
  }
  return data;
}

export async function deleteDishFromFirestore(id) {
  if (dbInstance && id) {
    try {
      await deleteDoc(doc(dbInstance, "dishes", id));
      return true;
    } catch (err) {
      console.warn("Firestore deleteDish error:", err);
    }
  }
  return false;
}

// --- ADDONS FIRESTORE SYNC ---

export async function getAddonsFromFirestore() {
  if (dbInstance) {
    try {
      const snapshot = await getDocs(collection(dbInstance, "addons"));
      if (!snapshot.empty) {
        return snapshot.docs.map(d => ({ ...d.data(), id: d.id }));
      }
      return null;
    } catch (err) {
      console.warn("Firestore getAddons error:", err);
    }
  }
  return null;
}

export async function saveAddonToFirestore(addon) {
  if (!addon || !addon.name) return false;
  const addonId = addon.id || "addon_" + Date.now().toString(36);
  const data = {
    ...addon,
    id: addonId,
    price: Number(addon.price) || 0,
    updatedAt: new Date().toISOString()
  };

  if (dbInstance) {
    try {
      const docRef = doc(dbInstance, "addons", addonId);
      await setDoc(docRef, {
        ...data,
        serverUpdatedAt: serverTimestamp()
      }, { merge: true });
      return data;
    } catch (err) {
      console.error("Firestore saveAddon error:", err);
    }
  }
  return data;
}

export async function deleteAddonFromFirestore(id) {
  if (dbInstance && id) {
    try {
      await deleteDoc(doc(dbInstance, "addons", id));
      return true;
    } catch (err) {
      console.warn("Firestore deleteAddon error:", err);
    }
  }
  return false;
}


