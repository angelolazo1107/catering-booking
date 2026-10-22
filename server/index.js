import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, "data", "db.json");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Helper: Read DB
function readDb() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      return { packages: [], dishes: {}, addons: [], bookings: [] };
    }
    const data = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading database file:", err);
    return { packages: [], dishes: {}, addons: [], bookings: [] };
  }
}

// Helper: Write DB
function writeDb(data) {
  try {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("Error writing database file:", err);
    return false;
  }
}

// --- Health / Status ---
app.get("/api/system-status", (req, res) => {
  const db = readDb();
  let totalDishes = 0;
  if (db.dishes) {
    Object.values(db.dishes).forEach(arr => {
      if (Array.isArray(arr)) totalDishes += arr.length;
    });
  }
  res.json({
    status: "ok",
    service: "CaterFlow PH Catering Backend Engine",
    mode: "express-rest-api",
    port: PORT,
    timestamp: new Date().toISOString(),
    counts: {
      packages: (db.packages || []).length,
      dishes: totalDishes,
      addons: (db.addons || []).length,
      bookings: (db.bookings || []).length
    }
  });
});

// --- PACKAGES CRUD ---
app.get("/api/packages", (req, res) => {
  const db = readDb();
  res.json(db.packages || []);
});

app.post("/api/packages", (req, res) => {
  const db = readDb();
  const pkg = req.body;
  if (!pkg.name || !pkg.pricePerPax) {
    return res.status(400).json({ error: "Package name and price per pax are required." });
  }

  const newId = pkg.id || "pkg_" + Date.now();
  const newPackage = {
    ...pkg,
    id: newId,
    minPax: Number(pkg.minPax) || 50,
    pricePerPax: Number(pkg.pricePerPax) || 0,
    startingPrice: (Number(pkg.pricePerPax) || 0) * (Number(pkg.minPax) || 50),
    createdAt: new Date().toISOString()
  };

  db.packages = db.packages || [];
  db.packages.push(newPackage);
  writeDb(db);

  res.status(201).json({ success: true, package: newPackage });
});

app.put("/api/packages/:id", (req, res) => {
  const db = readDb();
  const { id } = req.params;
  const updates = req.body;

  db.packages = db.packages || [];
  const index = db.packages.findIndex(p => p.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Package not found." });
  }

  const updatedPkg = {
    ...db.packages[index],
    ...updates,
    id, // preserve ID
    pricePerPax: Number(updates.pricePerPax ?? db.packages[index].pricePerPax),
    minPax: Number(updates.minPax ?? db.packages[index].minPax),
    updatedAt: new Date().toISOString()
  };
  updatedPkg.startingPrice = updatedPkg.pricePerPax * updatedPkg.minPax;

  db.packages[index] = updatedPkg;
  writeDb(db);

  res.json({ success: true, package: updatedPkg });
});

app.delete("/api/packages/:id", (req, res) => {
  const db = readDb();
  const { id } = req.params;
  const initialLength = (db.packages || []).length;
  db.packages = (db.packages || []).filter(p => p.id !== id);

  if (db.packages.length === initialLength) {
    return res.status(404).json({ error: "Package not found." });
  }

  writeDb(db);
  res.json({ success: true, message: `Package ${id} deleted.` });
});

// --- DISHES CRUD ---
app.get("/api/dishes", (req, res) => {
  const db = readDb();
  res.json(db.dishes || {});
});

app.post("/api/dishes", (req, res) => {
  const db = readDb();
  const { category, name, description, premium } = req.body;
  if (!category || !name) {
    return res.status(400).json({ error: "Category and dish name are required." });
  }

  db.dishes = db.dishes || {};
  db.dishes[category] = db.dishes[category] || [];

  const newDish = {
    id: "d_" + Date.now().toString(36),
    name,
    description: description || "",
    premium: Boolean(premium)
  };

  db.dishes[category].push(newDish);
  writeDb(db);

  res.status(201).json({ success: true, dish: newDish, category });
});

app.put("/api/dishes/:id", (req, res) => {
  const db = readDb();
  const { id } = req.params;
  const { category, name, description, premium } = req.body;

  db.dishes = db.dishes || {};
  let found = false;
  let targetDish = null;

  for (const cat of Object.keys(db.dishes)) {
    const list = db.dishes[cat];
    const idx = list.findIndex(d => d.id === id);
    if (idx !== -1) {
      if (category && category !== cat) {
        // Category changed: remove from old, add to new
        const [item] = list.splice(idx, 1);
        targetDish = { ...item, name: name || item.name, description: description ?? item.description, premium: premium ?? item.premium };
        db.dishes[category] = db.dishes[category] || [];
        db.dishes[category].push(targetDish);
      } else {
        db.dishes[cat][idx] = {
          ...list[idx],
          name: name || list[idx].name,
          description: description ?? list[idx].description,
          premium: premium ?? list[idx].premium
        };
        targetDish = db.dishes[cat][idx];
      }
      found = true;
      break;
    }
  }

  if (!found) {
    return res.status(404).json({ error: "Dish not found." });
  }

  writeDb(db);
  res.json({ success: true, dish: targetDish });
});

app.delete("/api/dishes/:id", (req, res) => {
  const db = readDb();
  const { id } = req.params;
  db.dishes = db.dishes || {};
  let deleted = false;

  for (const cat of Object.keys(db.dishes)) {
    const origLen = db.dishes[cat].length;
    db.dishes[cat] = db.dishes[cat].filter(d => d.id !== id);
    if (db.dishes[cat].length < origLen) {
      deleted = true;
      break;
    }
  }

  if (!deleted) {
    return res.status(404).json({ error: "Dish not found." });
  }

  writeDb(db);
  res.json({ success: true, message: `Dish ${id} deleted.` });
});

// --- ADDONS CRUD ---
app.get("/api/addons", (req, res) => {
  const db = readDb();
  res.json(db.addons || []);
});

app.post("/api/addons", (req, res) => {
  const db = readDb();
  const addon = req.body;
  if (!addon.name || addon.price === undefined) {
    return res.status(400).json({ error: "Addon name and price are required." });
  }

  const newAddon = {
    ...addon,
    id: addon.id || "addon_" + Date.now().toString(36),
    price: Number(addon.price) || 0,
    popular: Boolean(addon.popular)
  };

  db.addons = db.addons || [];
  db.addons.push(newAddon);
  writeDb(db);

  res.status(201).json({ success: true, addon: newAddon });
});

app.put("/api/addons/:id", (req, res) => {
  const db = readDb();
  const { id } = req.params;
  const updates = req.body;

  db.addons = db.addons || [];
  const idx = db.addons.findIndex(a => a.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: "Addon not found." });
  }

  const updatedAddon = {
    ...db.addons[idx],
    ...updates,
    id,
    price: Number(updates.price ?? db.addons[idx].price)
  };

  db.addons[idx] = updatedAddon;
  writeDb(db);

  res.json({ success: true, addon: updatedAddon });
});

app.delete("/api/addons/:id", (req, res) => {
  const db = readDb();
  const { id } = req.params;
  const origLen = (db.addons || []).length;
  db.addons = (db.addons || []).filter(a => a.id !== id);

  if (db.addons.length === origLen) {
    return res.status(404).json({ error: "Addon not found." });
  }

  writeDb(db);
  res.json({ success: true, message: `Addon ${id} deleted.` });
});

// --- BOOKINGS / QUOTATIONS CRUD ---
app.get("/api/bookings", (req, res) => {
  const db = readDb();
  const bookings = db.bookings || [];
  // Sort by createdAt descending
  bookings.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  res.json(bookings);
});

app.post("/api/bookings", (req, res) => {
  const db = readDb();
  const booking = req.body;
  if (!booking.clientName || !booking.packageName) {
    return res.status(400).json({ error: "Client name and package are required." });
  }

  const newId = booking.id || "BK-" + new Date().getFullYear() + "-" + Math.floor(1000 + Math.random() * 9000);
  const newBooking = {
    ...booking,
    id: newId,
    createdAt: booking.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: booking.status || "Draft"
  };

  db.bookings = db.bookings || [];
  // Check if booking with same ID already exists (update it)
  const existingIdx = db.bookings.findIndex(b => b.id === newBooking.id);
  if (existingIdx >= 0) {
    db.bookings[existingIdx] = newBooking;
  } else {
    db.bookings.unshift(newBooking);
  }

  writeDb(db);
  res.status(201).json({ success: true, booking: newBooking });
});

app.put("/api/bookings/:id", (req, res) => {
  const db = readDb();
  const { id } = req.params;
  const updates = req.body;

  db.bookings = db.bookings || [];
  const idx = db.bookings.findIndex(b => b.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: "Booking not found." });
  }

  const updatedBooking = {
    ...db.bookings[idx],
    ...updates,
    id,
    updatedAt: new Date().toISOString()
  };

  db.bookings[idx] = updatedBooking;
  writeDb(db);

  res.json({ success: true, booking: updatedBooking });
});

app.patch("/api/bookings/:id/status", (req, res) => {
  const db = readDb();
  const { id } = req.params;
  const { status, bookingReference, ...extraData } = req.body;

  if (!status) {
    return res.status(400).json({ error: "Status is required." });
  }

  db.bookings = db.bookings || [];
  const idx = db.bookings.findIndex(b => b.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: "Booking not found." });
  }

  db.bookings[idx] = {
    ...db.bookings[idx],
    ...extraData,
    status,
    ...(bookingReference ? { bookingReference } : {}),
    statusUpdatedAt: new Date().toISOString()
  };
  writeDb(db);

  res.json({ success: true, booking: db.bookings[idx] });
});

app.delete("/api/bookings/:id", (req, res) => {
  const db = readDb();
  const { id } = req.params;
  const origLen = (db.bookings || []).length;
  db.bookings = (db.bookings || []).filter(b => b.id !== id);

  if (db.bookings.length === origLen) {
    return res.status(404).json({ error: "Booking not found." });
  }

  writeDb(db);
  res.json({ success: true, message: `Booking ${id} deleted.` });
});

app.listen(PORT, () => {
  console.log(`🚀 Catering Backend Server running on http://localhost:${PORT}`);
});
