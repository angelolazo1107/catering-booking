// Master Equipment & Ingress/Egress Logistics Catalog

export const EQUIPMENT_CATEGORIES = [
  { id: "buffet", name: "Buffet Setup & Chafing Warmers" },
  { id: "dinnerware", name: "Dinnerware, Glassware & Flatware" },
  { id: "furniture", name: "Tables, Chairs & Linens" },
  { id: "stations", name: "Specialty Stations (Lechon, Hotdog, Desserts)" },
  { id: "beverage", name: "Beverage, Ice & Water Service" },
  { id: "styling", name: "Backdrop, Lighting & Ambient Decor" },
  { id: "logistics", name: "Transport, Electrical & Bus-Out Logistics" }
];

// Sample seed equipment used to dynamically generate or customize an Ingress/Egress manifest
export function generateDefaultIngressInventory(quotation = {}) {
  const pax = Number(quotation.pax) || 50;
  const packageName = (quotation.packageName || "").toLowerCase();
  const isKiddie = packageName.includes("kiddie") || packageName.includes("child") || packageName.includes("birthday");
  const isLuxeOrWedding = packageName.includes("kasalan") || packageName.includes("royal") || packageName.includes("wedding");

  // Dinnerware pax buffer (10-20% buffer over guaranteed pax)
  const platePax = Math.ceil(pax * 1.2 / 10) * 10;
  const roundTablesCount = Math.ceil(pax / 8);

  // Dishes count
  const dishList = quotation.dishes 
    ? (Array.isArray(quotation.dishes) ? quotation.dishes : Object.values(quotation.dishes).flat())
    : [];
  const dishCount = Math.max(dishList.length, 6);

  const items = [
    // 1. BUFFET & SERVING DISHES
    {
      id: "eq_serving_crates",
      category: "buffet",
      description: "SERVING DISH WITH WOOD CRATE (BIG)",
      qty: Math.max(Math.ceil(dishCount / 2), 4),
      unit: "PCS",
      remarks: "For main banquet viands & rice",
      ingressChecked: false,
      egressChecked: false
    },
    {
      id: "eq_soup_warmer_set",
      category: "buffet",
      description: "SOUP WARMER SET (Neck, Main Warmer, Soup Dish, Soup Ladle)",
      qty: 1,
      unit: "SET",
      remarks: "Complete set with heating burner",
      ingressChecked: false,
      egressChecked: false
    },
    {
      id: "eq_crate_warmers",
      category: "buffet",
      description: "WARMER FOR BIG CRATES (Chafing Heating Fuel / Sterno)",
      qty: Math.max(dishCount * 2, 16),
      unit: "PCS",
      remarks: "Heating supply for entire service",
      ingressChecked: false,
      egressChecked: false
    },
    {
      id: "eq_serving_spoons",
      category: "buffet",
      description: "SERVING SPOON FOR SERVING DISH (BIG)",
      qty: Math.max(dishCount, 7),
      unit: "PCS",
      remarks: "Stainless steel heavy-duty",
      ingressChecked: false,
      egressChecked: false
    },
    {
      id: "eq_food_tongs",
      category: "buffet",
      description: "FOOD TONGS",
      qty: 10,
      unit: "PCS",
      remarks: "Salad, viands & pastries",
      ingressChecked: false,
      egressChecked: false
    },
    {
      id: "eq_tong_holders",
      category: "buffet",
      description: "SERVING SPOON AND FOOD TONG HOLDER",
      qty: 10,
      unit: "PCS",
      remarks: "Drip trays on buffet table",
      ingressChecked: false,
      egressChecked: false
    },
    {
      id: "eq_crate_centerpiece_60",
      category: "buffet",
      description: "60X60 WOOD CRATE CENTER PC WITH 60X60 TILES",
      qty: 1,
      unit: "SET",
      remarks: "PARA SA BUFFET",
      ingressChecked: false,
      egressChecked: false
    },
    {
      id: "eq_crate_centerpiece_40",
      category: "buffet",
      description: "40X40 WOOD CRATE CENTER PC WITH 40X40 TILES",
      qty: 1,
      unit: "SETS",
      remarks: "PARA SA BUFFET",
      ingressChecked: false,
      egressChecked: false
    },
    {
      id: "eq_native_baskets",
      category: "buffet",
      description: "NATIVE CENTER PC BASKET",
      qty: 2,
      unit: "PCS",
      remarks: "Buffet floral / bread accent",
      ingressChecked: false,
      egressChecked: false
    },

    // 2. DINNERWARE & FLATWARE (Calculated with buffer)
    {
      id: "eq_dinner_plates",
      category: "dinnerware",
      description: "DINNER PLATES (Ceramic White)",
      qty: platePax,
      unit: "PCS",
      remarks: `Includes ${platePax - pax} extra reserve`,
      ingressChecked: false,
      egressChecked: false
    },
    {
      id: "eq_soup_bowls",
      category: "dinnerware",
      description: "SOUP BOWLS",
      qty: platePax,
      unit: "PCS",
      remarks: "For appetizers / soup course",
      ingressChecked: false,
      egressChecked: false
    },
    {
      id: "eq_saucer_plates",
      category: "dinnerware",
      description: "SAUCER PLATES",
      qty: platePax,
      unit: "PCS",
      remarks: "For dessert / cake station",
      ingressChecked: false,
      egressChecked: false
    },
    {
      id: "eq_spoon_fork_sets",
      category: "dinnerware",
      description: "SPOON AND FORK (Heavy Duty Stainless)",
      qty: platePax,
      unit: "SETS",
      remarks: "Clean and polished in pouches/baskets",
      ingressChecked: false,
      egressChecked: false
    },
    {
      id: "eq_water_goblets",
      category: "dinnerware",
      description: "WATER GOBLET (White/Clear Glass)",
      qty: platePax,
      unit: "PCS",
      remarks: "Table setup with water pitchers",
      ingressChecked: false,
      egressChecked: false
    },

    // 3. TABLES, CHAIRS & LINENS
    {
      id: "eq_round_tables",
      category: "furniture",
      description: "ROUND TABLES (Guest Dining)",
      qty: roundTablesCount,
      unit: "PCS",
      remarks: "ALL CREAM SKIRTING",
      ingressChecked: false,
      egressChecked: false
    },
    {
      id: "eq_buffet_tables_6ft",
      category: "furniture",
      description: "6FT LONG TABLE FOR BUFFET",
      qty: 2,
      unit: "PCS",
      remarks: "ALL CREAM SKIRTING",
      ingressChecked: false,
      egressChecked: false
    },
    {
      id: "eq_buffet_table_4ft",
      category: "furniture",
      description: "4FT BUFFET TABLE (GRAY)",
      qty: 1,
      unit: "PCS",
      remarks: "ALL CREAM SKIRTING",
      ingressChecked: false,
      egressChecked: false
    },
    {
      id: "eq_chair_cloths",
      category: "furniture",
      description: "CHAIR CLOTH / SEAT COVERS",
      qty: pax,
      unit: "PCS",
      remarks: "Ironed and fitted",
      ingressChecked: false,
      egressChecked: false
    },

    // 4. SPECIALTY FOOD STATIONS
    {
      id: "eq_lechon_tray",
      category: "stations",
      description: "LETCHON TRAY WITH LETCHON SAUCE HOLDER",
      qty: 1,
      unit: "SET",
      remarks: "BUTANG DAHON SAGING",
      ingressChecked: false,
      egressChecked: false
    },
    {
      id: "eq_lechon_warmer_lamp",
      category: "stations",
      description: "LETCHON LAMP WARMER",
      qty: 1,
      unit: "PCS",
      remarks: "For crisp skin preservation",
      ingressChecked: false,
      egressChecked: false
    },
    {
      id: "eq_candy_jars",
      category: "stations",
      description: "CANDY JARS (Glass Decorative)",
      qty: 5,
      unit: "PCS",
      remarks: "Dessert / candy station",
      ingressChecked: false,
      egressChecked: false
    },
    {
      id: "eq_white_yahong",
      category: "stations",
      description: "WHITE SMALL YAHONG (Condiments / Dip Bowls)",
      qty: 3,
      unit: "PCS",
      remarks: "For sauces & dressings",
      ingressChecked: false,
      egressChecked: false
    },
    {
      id: "eq_wood_risers",
      category: "stations",
      description: "WOOD RISERS (Multi-Tier Display)",
      qty: 5,
      unit: "PCS",
      remarks: "Dessert and carving risers",
      ingressChecked: false,
      egressChecked: false
    },

    // 5. BEVERAGE & ICE SERVICE
    {
      id: "eq_small_cooler",
      category: "beverage",
      description: "SMALL COOLER FOR ICE WITH SCOOPER",
      qty: 1,
      unit: "SET",
      remarks: "For beverage bar",
      ingressChecked: false,
      egressChecked: false
    },
    {
      id: "eq_juice_jars",
      category: "beverage",
      description: "JUICE JAR / BEVERAGE DISPENSER",
      qty: 2,
      unit: "PCS",
      remarks: "Bottomless iced tea & juice",
      ingressChecked: false,
      egressChecked: false
    },
    {
      id: "eq_water_pitchers",
      category: "beverage",
      description: "PITCHER FOR WATER",
      qty: 2,
      unit: "PCS",
      remarks: "Refilling guest goblets",
      ingressChecked: false,
      egressChecked: false
    },

    // 6. CAKE, SOUVENIRS & CANDY STATIONS
    {
      id: "eq_souvenir_crate_60",
      category: "stations",
      description: "60X60 WOOD CRATE CENTER PC WITH 60X60 TILES",
      qty: 1,
      unit: "SET",
      remarks: "PARA SA SOUVENIR CAKE AND CANDIES",
      ingressChecked: false,
      egressChecked: false
    },
    {
      id: "eq_souvenir_crate_40",
      category: "stations",
      description: "40X40 WOOD CRATE CENTER PC WITH 40X40 TILES",
      qty: 3,
      unit: "SETS",
      remarks: "PARA SA SOUVENIR CAKE AND CANDIES",
      ingressChecked: false,
      egressChecked: false
    },
    {
      id: "eq_white_lamp",
      category: "styling",
      description: "LAMP WHITE (Warm Ambient)",
      qty: 2,
      unit: "PCS",
      remarks: "Cake & backdrop highlight",
      ingressChecked: false,
      egressChecked: false
    },
    {
      id: "eq_hexagon_lamp",
      category: "styling",
      description: "HEXAGON LAMP",
      qty: 2,
      unit: "PCS",
      remarks: "Thematic accent table light",
      ingressChecked: false,
      egressChecked: false
    },

    // 7. BACKDROP & AMBIENCE (Especially if Kiddie/Debut)
    {
      id: "eq_backdrop_tela",
      category: "styling",
      description: "TELA (RED / BLUE / GREEN) PARA SA BACKDROP",
      qty: 1,
      unit: "SET",
      remarks: "Thematic fabric draping",
      ingressChecked: false,
      egressChecked: false
    },
    {
      id: "eq_flood_lamps",
      category: "styling",
      description: "FLOOD LAMP PARA SA BACKDROP",
      qty: 2,
      unit: "PCS",
      remarks: "Spotlights for stage/backdrop",
      ingressChecked: false,
      egressChecked: false
    },
    {
      id: "eq_buffet_pole_light",
      category: "styling",
      description: "POLE NGA GINA GAMIT SA BUFFET BUTANGAN SUGA",
      qty: 1,
      unit: "SET",
      remarks: "POLE KAG SUGA LANG WALA NA DECOR",
      ingressChecked: false,
      egressChecked: false
    },

    // 8. LOGISTICS, TRANSPORT & BUS-OUT
    {
      id: "eq_bus_out_tray",
      category: "logistics",
      description: "BUS OUT SPOON/FORK TRAY (GRAY)",
      qty: 1,
      unit: "PC",
      remarks: "Clearing & dish bus-out",
      ingressChecked: false,
      egressChecked: false
    },
    {
      id: "eq_yellow_cart",
      category: "logistics",
      description: "YELLOW CART (LOTUS)",
      qty: 1,
      unit: "PC",
      remarks: "Heavy equipment transport cart",
      ingressChecked: false,
      egressChecked: false
    },
    {
      id: "eq_ibox_extension",
      category: "logistics",
      description: "IBOX WITH EXTENSION CORD AND PLANTIA",
      qty: 1,
      unit: "SET",
      remarks: "Linens ironing & electric warming",
      ingressChecked: false,
      egressChecked: false
    }
  ];

  // If Kiddie package, append hotdog machine, condiments, balloon poles
  if (isKiddie) {
    items.push(
      {
        id: "eq_condiments_hotdog",
        category: "stations",
        description: "BULUTANGAN CONDIMENTS SA HOTDOG STATION (*Cheese, *Onions, *Pickles)",
        qty: 3,
        unit: "PCS",
        remarks: "Kiddie party hotdog bar",
        ingressChecked: false,
        egressChecked: false
      },
      {
        id: "eq_hotdog_bun_box",
        category: "stations",
        description: "HOTDOG BUN SULUDLAN WITH SUGA",
        qty: 1,
        unit: "SET",
        remarks: "Display container with warm light",
        ingressChecked: false,
        egressChecked: false
      },
      {
        id: "eq_hotdog_warmer",
        category: "stations",
        description: "HOTDOG WARMER MACHINE",
        qty: 1,
        unit: "PC",
        remarks: "Electric roller / steamer",
        ingressChecked: false,
        egressChecked: false
      },
      {
        id: "eq_balloon_pole",
        category: "styling",
        description: "BALLOON POLE & ARCH FRAME",
        qty: 1,
        unit: "SET",
        remarks: "DAL-ON LANG TANAN",
        ingressChecked: false,
        egressChecked: false
      },
      {
        id: "eq_balloon_ibox",
        category: "styling",
        description: "BALLOON IBOX (Electric Balloon Pump & Acc)",
        qty: 1,
        unit: "SET",
        remarks: "Balloon inflation kit",
        ingressChecked: false,
        egressChecked: false
      }
    );
  }

  return items;
}

export const OFFICIAL_INGRESS_DISCLAIMER_NOTE = 
  "Ingress and Egress form must be presented to client for them to double check upon set up, and upon pull out. Any damaged/lost item or equipment will be charged accordingly to client responsible for booking. If item/equipment unendorsed to client for double check for ingress/egress, all damaged/lost items will be automatically deducted to the salary of all staff on duty on the said booking.";
