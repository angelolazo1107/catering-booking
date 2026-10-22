import { DEFAULT_TERMS_AND_CONDITIONS, DEFAULT_PACKAGE_INCLUSIONS } from "./tenantSchema";

export const CATERER_INFO = {
  businessName: "PLATABLE CATERING SERVICES",
  tagline: "Premier Philippine Catering & Banquet Events",
  tin: "",
  phone: "+63 917 000 0000",
  email: "inquiries@platablecatering.ph",
  website: "www.platablecatering.ph",
  address: "Brgy. Gaub, Cabatuan, Iloilo",
  bankDetails: {
    gcash: { name: "Platable Catering Services", number: "+63 917 000 0000" },
    selectedBank: "pnb",
    bankName: "Philippine National Bank (PNB)",
    accountName: "Platable Catering Services",
    accountNumber: "1234-5678-9012",
    branch: "Main Corporate Branch",
    accountType: "Corporate Current / Savings Account",
    acceptCardAtStore: true,
    cardPaymentNotes: "Credit & Debit Cards (Visa, Mastercard, BancNet, JCB) accepted via physical POS terminal at store commissary.",
    bdo: { accountName: "Platable Catering Services", accountNumber: "" },
    bpi: { accountName: "Platable Catering Services", accountNumber: "" }
  },
  termsAndConditions: DEFAULT_TERMS_AND_CONDITIONS,
  packageInclusions: DEFAULT_PACKAGE_INCLUSIONS
};

export const CATERING_PACKAGES = [
  {
    id: "package_1",
    name: "Package 1 (Palatable Classic Starter)",
    subtitle: "3 Regular Main Dishes, 1 Regular Side, 1 Regular Dessert, Rice/Soup & Beverage",
    badge: "Budget Friendly",
    pricePerPax: 480,
    minPax: 50,
    mainDishesCount: 3,
    sideDishes: { regular: 1, special: 0 },
    desserts: { regular: 1, special: 0 },
    courses: {
      beef: 1,
      pork: 1,
      chicken: 1,
      sideRegular: 1,
      sideSpecial: 0,
      dessertRegular: 1,
      dessertSpecial: 0,
      riceOrSoup: 1,
      drinks: 1
    },
    inclusions: [
      "3 Regular Main Dishes (Multiple from same course allowed: Beef, Pork, Chicken, Seafood)",
      "1 Regular Side Dish (Pasta, Noodles, or Vegetables)",
      "1 Regular Dessert",
      "Choice of: Steamed Rice or Hot Soup",
      "Choice of: Bottomless Soda or Juice",
      "Complete buffet table setup with chafing warmers & skirting",
      "Uniformed banquet servers and buffet crew"
    ]
  },
  {
    id: "package_2",
    name: "Package 2 (Palatable Fiesta Feast)",
    subtitle: "4 Regular Main Dishes, 1 Regular Side, 1 Regular Dessert, Rice/Soup & Beverage",
    badge: "Standard Value",
    pricePerPax: 550,
    minPax: 50,
    mainDishesCount: 4,
    sideDishes: { regular: 1, special: 0 },
    desserts: { regular: 1, special: 0 },
    courses: {
      beef: 1,
      pork: 1,
      chicken: 1,
      fish: 1,
      sideRegular: 1,
      sideSpecial: 0,
      dessertRegular: 1,
      dessertSpecial: 0,
      riceOrSoup: 1,
      drinks: 1
    },
    inclusions: [
      "4 Regular Main Dishes (Multiple from same course allowed: Beef, Pork, Chicken, Seafood)",
      "1 Regular Side Dish (Pasta, Noodles, or Vegetables)",
      "1 Regular Dessert",
      "Choice of: Steamed Rice or Hot Soup",
      "Choice of: Bottomless Soda or Juice",
      "Buffet table styling with centerpieces and formal table setting",
      "Dedicated Captain Waiter and banquet service team"
    ]
  },
  {
    id: "package_3",
    name: "Package 3 (Palatable Deluxe Buffet)",
    subtitle: "4 Regular Main Dishes, 1 Regular Side, 1 Special Side, 1 Regular Dessert, Rice/Soup & Beverage",
    badge: "Deluxe Feast",
    pricePerPax: 620,
    minPax: 50,
    mainDishesCount: 4,
    sideDishes: { regular: 1, special: 1 },
    desserts: { regular: 1, special: 0 },
    courses: {
      beef: 1,
      pork: 1,
      chicken: 1,
      fish: 1,
      sideRegular: 1,
      sideSpecial: 1,
      dessertRegular: 1,
      dessertSpecial: 0,
      riceOrSoup: 1,
      drinks: 1
    },
    inclusions: [
      "4 Regular Main Dishes (Multiple from same course allowed: Beef, Pork, Chicken, Seafood)",
      "1 Regular Side Dish",
      "1 Special Side Dish (Chef's Specialty Side included)",
      "1 Regular Dessert",
      "Choice of: Steamed Rice or Hot Soup",
      "Choice of: Bottomless Soda or Juice",
      "Elegant banquet presentation with floral table centerpieces",
      "Full linen, tableware, glassware, and uniformed waitstaff"
    ]
  },
  {
    id: "package_4",
    name: "Package 4 (Palatable Grand Feast)",
    subtitle: "5 Regular Main Dishes, 1 Regular Side, 1 Special Side, 1 Regular Dessert, 1 Special Dessert, Rice/Soup & Beverage",
    badge: "Palatable Best Seller ⭐",
    popular: true,
    pricePerPax: 680,
    minPax: 50,
    mainDishesCount: 5,
    sideDishes: { regular: 1, special: 1 },
    desserts: { regular: 1, special: 1 },
    courses: {
      beef: 1,
      pork: 1,
      chicken: 1,
      fish: 1,
      sideRegular: 1,
      sideSpecial: 1,
      dessertRegular: 1,
      dessertSpecial: 1,
      riceOrSoup: 1,
      drinks: 1
    },
    inclusions: [
      "5 Regular Main Dishes (Multiple from same course allowed: Beef, Pork, Chicken, Seafood)",
      "1 Regular Side Dish",
      "1 Special Side Dish (Chef's Specialty Side included)",
      "1 Regular Dessert",
      "1 Special Dessert (Chef's Specialty Dessert included)",
      "Choice of: Steamed Rice or Hot Soup",
      "Choice of: Bottomless Soda or Juice",
      "Full Presidential VIP table setup with fresh floral arrangements",
      "Captain Waiter, banquet coordinator and complete service crew"
    ]
  },
  {
    id: "package_5",
    name: "Package 5 (Palatable Royal Premiere VIP)",
    subtitle: "6 Regular Main Dishes, 1 Regular Side, 1 Special Side, 1 Regular Dessert, 1 Special Dessert, Rice/Soup & Beverage",
    badge: "Premiere VIP Luxe",
    pricePerPax: 780,
    minPax: 50,
    mainDishesCount: 6,
    sideDishes: { regular: 1, special: 1 },
    desserts: { regular: 1, special: 1 },
    courses: {
      beef: 1,
      pork: 1,
      chicken: 1,
      fish: 1,
      sideRegular: 1,
      sideSpecial: 1,
      dessertRegular: 1,
      dessertSpecial: 1,
      riceOrSoup: 1,
      drinks: 1
    },
    inclusions: [
      "6 Regular Main Dishes (Multiple from same course allowed: Beef, Pork, Chicken, Seafood)",
      "1 Regular Side Dish",
      "1 Special Side Dish (Chef's Specialty Side included)",
      "1 Regular Dessert",
      "1 Special Dessert (Chef's Specialty Dessert included)",
      "Choice of: Steamed Rice or Hot Soup",
      "Choice of: Bottomless Soda or Juice",
      "VIP styling with upgraded chairs, glassware and centerpieces",
      "Senior headwaiters, banquet manager and full formal attire crew"
    ]
  }
];

export function getMainDishesCount(pkg) {
  if (!pkg) return 5;
  // 1. Inclusions take precedence if specified explicitly in the bullet points (e.g. "4 Main Dishes", "5 Regular Main Dish")
  if (Array.isArray(pkg.inclusions)) {
    for (const inc of pkg.inclusions) {
      const match = inc.match(/(\d+)\s*(?:Regular|Gourmet)?\s*Main Dish(?:es)?/i) || inc.match(/(\d+)\s*Heavy Snacks/i);
      if (match) return parseInt(match[1], 10);
    }
  }
  // 2. Explicit mainDishesCount property
  if (typeof pkg.mainDishesCount === "number" && pkg.mainDishesCount > 0) {
    return pkg.mainDishesCount;
  }
  // 3. Check name or ID
  const nameOrId = `${pkg.name || ""} ${pkg.id || ""} ${pkg.subtitle || ""}`.toLowerCase();
  if (nameOrId.includes("package 1") || nameOrId.includes("pkg 1")) return 3;
  if (nameOrId.includes("package 2") || nameOrId.includes("pkg 2")) return 4;
  if (nameOrId.includes("package 3") || nameOrId.includes("pkg 3")) return 4;
  if (nameOrId.includes("package 4") || nameOrId.includes("pkg 4")) return 5;
  if (nameOrId.includes("package 5") || nameOrId.includes("pkg 5")) return 6;

  const c = pkg.courses || {};
  const count = (c.beef || 0) + (c.pork || 0) + (c.chicken || 0) + 
    (c.fish || c.fishOrSeafood || 0);
  return count > 0 ? count : 5;
}

export function getPackageCourseAllowances(pkg) {
  if (!pkg) {
    return {
      mainDishesCount: 5,
      regSidesCount: 1,
      specSidesCount: 1,
      regDessertsCount: 1,
      specDessertsCount: 1
    };
  }
  const mainDishesCount = getMainDishesCount(pkg);

  let regSidesCount;
  let specSidesCount;
  let regDessertsCount;
  let specDessertsCount;

  // 1. Check explicit fields
  if (typeof pkg.sideDishes?.regular === "number") regSidesCount = pkg.sideDishes.regular;
  if (typeof pkg.sideDishes?.special === "number") specSidesCount = pkg.sideDishes.special;
  if (typeof pkg.desserts?.regular === "number") regDessertsCount = pkg.desserts.regular;
  if (typeof pkg.desserts?.special === "number") specDessertsCount = pkg.desserts.special;

  // 2. Dynamically parse inclusions text (e.g. "1 Special Side", "1 Special Dessert", "2 Regular Side")
  if (Array.isArray(pkg.inclusions)) {
    for (const inc of pkg.inclusions) {
      const specSideMatch = inc.match(/(\d+)\s*Special\s*Side/i);
      if (specSideMatch && specSidesCount === undefined) {
        specSidesCount = parseInt(specSideMatch[1], 10);
      }
      const regSideMatch = inc.match(/(\d+)\s*(?:Regular\s*)?Side/i);
      if (regSideMatch && !/Special/i.test(inc) && regSidesCount === undefined) {
        regSidesCount = parseInt(regSideMatch[1], 10);
      }
      const specDessertMatch = inc.match(/(\d+)\s*Special\s*Dessert/i);
      if (specDessertMatch && specDessertsCount === undefined) {
        specDessertsCount = parseInt(specDessertMatch[1], 10);
      }
      const regDessertMatch = inc.match(/(\d+)\s*(?:Regular\s*)?Dessert/i);
      if (regDessertMatch && !/Special/i.test(inc) && regDessertsCount === undefined) {
        regDessertsCount = parseInt(regDessertMatch[1], 10);
      }
    }
  }

  // 3. Fallback based on package name or ID (e.g. "PACKAGE 4", "PACKAGE 3", "pkg_mv7tvw8v")
  const nameOrId = `${pkg.name || ""} ${pkg.id || ""} ${pkg.subtitle || ""}`.toLowerCase();
  if (nameOrId.includes("package 4") || nameOrId.includes("pkg 4") || nameOrId.includes("package 5") || nameOrId.includes("pkg 5") || pkg.id === "royal_premiere" || pkg.id === "grand_fiesta") {
    if (specSidesCount === undefined || specSidesCount === 0) specSidesCount = 1;
    if (specDessertsCount === undefined || specDessertsCount === 0) specDessertsCount = 1;
  }
  if (nameOrId.includes("package 3") || nameOrId.includes("pkg 3")) {
    if (regSidesCount === undefined) regSidesCount = 2;
    if (specDessertsCount === undefined || specDessertsCount === 0) specDessertsCount = 1;
  }
  if (nameOrId.includes("package 2") || nameOrId.includes("pkg 2")) {
    if (regSidesCount === undefined) regSidesCount = 2;
  }

  // Defaults
  regSidesCount = regSidesCount ?? (pkg.courses?.sideRegular ?? 1);
  specSidesCount = specSidesCount ?? (pkg.courses?.sideSpecial ?? 0);
  regDessertsCount = regDessertsCount ?? (pkg.courses?.dessertRegular ?? 1);
  specDessertsCount = specDessertsCount ?? (pkg.courses?.dessertSpecial ?? 0);

  return {
    mainDishesCount,
    regSidesCount,
    specSidesCount,
    regDessertsCount,
    specDessertsCount
  };
}

export const DEFAULT_SPECIAL_DISH_UPGRADE_RATE = 65;

export function getDishUpgradePrice(dish) {
  if (!dish) return 0;
  if (dish.tier !== "special" && !dish.premium) return 0;
  const priceNum = typeof dish.upgradePrice === "number" ? dish.upgradePrice : parseFloat(dish.upgradePrice);
  if (!isNaN(priceNum) && priceNum > 0) {
    return priceNum;
  }
  const lower = (dish.name || "").toLowerCase();
  if (lower.includes("roast beef")) return 95;
  if (lower.includes("tinu-om") || lower.includes("tinuom")) return 95;
  if (lower.includes("ox tongue") || lower.includes("lengua")) return 80;
  return DEFAULT_SPECIAL_DISH_UPGRADE_RATE;
}

export const DISH_MENU_OPTIONS = {
  beef: [
    // REGULAR DISH
    { id: "b_reg_1", name: "Beef Stroganoff", tier: "regular", description: "Tender beef strips sautéed with mushrooms and onions in velvety sour cream sauce" },
    { id: "b_reg_2", name: "Beef with Broccoli", tier: "regular", description: "Savory stir-fried beef slices with crisp fresh broccoli florets in oyster sauce" },
    { id: "b_reg_3", name: "Bakareta", tier: "regular", description: "Tender beef caldereta stewed in spiced tomato sauce with cheese, olives and bell peppers" },
    { id: "b_reg_4", name: "Beef Salpicao", tier: "regular", description: "Tender seared beef cubes cooked with butter, Worcestershire and crunchy toasted garlic" },
    { id: "b_reg_5", name: "Sweet and Sour Meatballs", tier: "regular", description: "Juicy beef meatballs glazed in tangy sweet-sour sauce with bell peppers" },
    { id: "b_reg_6", name: "Beef Picadillo", tier: "regular", description: "Ground beef sautéed with diced potatoes, carrots, raisins and green peas" },
    { id: "b_reg_7", name: "Beef Afritada", tier: "regular", description: "Hearty beef stew simmered with carrots, potatoes, bell peppers in tomato sauce" },
    { id: "b_reg_8", name: "Beef Steak Tagalog", tier: "regular", description: "Thin beef sirloin marinated in calamansi and soy sauce topped with sweet onion rings" },
    { id: "b_reg_9", name: "Beef Teriyaki", tier: "regular", description: "Tender beef slices glazed in savory-sweet Japanese teriyaki reduction" },
    { id: "b_reg_10", name: "Beef Kare Kare", tier: "regular", description: "Stewed beef and tripe in rich savory peanut sauce with blanched native greens and bagoong" },
    // SPECIAL DISH
    { id: "b_spec_1", name: "Crispy Beef Tadyang", tier: "special", premium: true, upgradePrice: 65, description: "Twice-cooked deep-fried beef short ribs with crunchy exterior served with spiced vinegar" },
    { id: "b_spec_2", name: "Baked Roast Beef in Mushroom and Mashed Potatoes", tier: "special", premium: true, upgradePrice: 95, description: "Slow-roasted tender beef sirloin served with creamy mushroom gravy and mashed potatoes" },
    { id: "b_spec_3", name: "Classic Beef Morcon", tier: "special", premium: true, upgradePrice: 65, description: "Rolled beef flank stuffed with sausages, boiled eggs, carrots, cheese and pickles" },
    { id: "b_spec_4", name: "Callos", tier: "special", premium: true, upgradePrice: 65, description: "Spanish-Filipino stew of tender ox tripe, chorizo de bilbao and garbanzos in paprika-tomato sauce" },
    { id: "b_spec_5", name: "Beef Kebab", tier: "special", premium: true, upgradePrice: 65, description: "Char-grilled spiced skewered beef cubes served with garlic yogurt dip" },
    { id: "b_spec_6", name: "Ox Tongue", tier: "special", premium: true, upgradePrice: 80, description: "Lengua Estofada / braised tender ox tongue in rich mushroom white cream sauce" },
    { id: "b_spec_7", name: "Beef Bulalo", tier: "special", premium: true, upgradePrice: 65, description: "Rich beef bone marrow soup with tender beef shank, corn cobs and cabbage" }
  ],
  pork: [
    // REGULAR DISH
    { id: "p_reg_1", name: "Pork Tonkatsu", tier: "regular", description: "Japanese-style crispy panko-breaded pork cutlet served with tonkatsu sauce" },
    { id: "p_reg_2", name: "Grilled Pork Belly", tier: "regular", description: "Char-grilled seasoned pork liempo basted with garlic calamansi soy marinade" },
    { id: "p_reg_3", name: "Pork Sisig", tier: "regular", description: "Sizzling minced pork jowl and belly seasoned with onions, calamansi and chili" },
    { id: "p_reg_4", name: "Pork Hamonado", tier: "regular", description: "Slow-simmered pork chunks in sweet pineapple juice glaze with pineapple tidbits" },
    { id: "p_reg_5", name: "Pork Humba", tier: "regular", description: "Tender pork belly braised with black beans, banana blossoms, brown sugar and vinegar" },
    { id: "p_reg_6", name: "Pork Estofado", tier: "regular", description: "Sweet and tangy braised pork shoulder with fried saba bananas and spices" },
    { id: "p_reg_7", name: "Pork BBQ", tier: "regular", description: "Classic Pinoy sweet-savory skewered pork barbecue grilled over charcoal" },
    { id: "p_reg_8", name: "Sweet and Sour Pork", tier: "regular", description: "Crispy battered pork bites tossed in vibrant sweet and tangy Cantonese glaze" },
    { id: "p_reg_9", name: "Crispy Pork Chop", tier: "regular", description: "Golden deep-fried seasoned pork chops with crisp crackling coating" },
    { id: "p_reg_10", name: "Letchon Kawali", tier: "regular", description: "Deep-fried boiled pork belly slabs with ultra-crispy skin served with liver sauce" },
    { id: "p_reg_11", name: "Pork Menudo", tier: "regular", description: "Stewed diced pork and liver with potatoes, carrots, chickpeas and tomato sauce" },
    { id: "p_reg_12", name: "Pork Sarciado", tier: "regular", description: "Sautéed pork slices cooked in fresh tomato, onion and egg reduction" },
    { id: "p_reg_13", name: "Creamy Pork and Mushroom", tier: "regular", description: "Tender pork strips smothered in rich mushroom and cream gravy" },
    { id: "p_reg_14", name: "Pork Sinigang", tier: "regular", description: "Traditional sour tamarind soup with pork belly chunks and native vegetables" },
    { id: "p_reg_15", name: "Crispy Pork Karekare", tier: "regular", description: "Crisp pork belly served with rich peanut sauce, blanched vegetables and bagoong" },
    { id: "p_reg_16", name: "Pork Dinakdakan", tier: "regular", description: "Ilocano grilled pork parts tossed in calamansi, ginger, onions and creamy dressing" },
    { id: "p_reg_17", name: "Pork Sinuglao", tier: "regular", description: "Savory duo of grilled pork belly and fresh tuna ceviche kinilaw" },
    { id: "p_reg_18", name: "Back Ribs with Buttered Vegetables", tier: "regular", description: "Tender braised pork back ribs served alongside buttered mixed vegetables" },
    // SPECIAL DISH
    { id: "p_spec_1", name: "Crispy Pata", tier: "special", premium: true, upgradePrice: 65, description: "Deep-fried pork knuckle with crispy blistered skin and tender meat served with spiced soy dip" },
    { id: "p_spec_2", name: "Patatim", tier: "special", premium: true, upgradePrice: 65, description: "Slow-braised tender pork leg in sweet aromatic soy sauce reduction with bok choy and mushrooms" },
    { id: "p_spec_3", name: "Pork Embutido", tier: "special", premium: true, upgradePrice: 65, description: "Festive Filipino ground pork meatloaf roll packed with ham, cheese, carrots and eggs" },
    { id: "p_spec_4", name: "Roasted Letchon Belly", tier: "special", premium: true, upgradePrice: 65, description: "Crispy rolled boneless pork belly roasted with lemongrass, scallions and garlic" }
  ],
  chicken: [
    // REGULAR DISH
    { id: "c_reg_1", name: "Chicken Cordon Bleu", tier: "regular", description: "Breaded chicken breast stuffed with sliced ham and melting cheese" },
    { id: "c_reg_2", name: "Herb Roasted Chicken", tier: "regular", description: "Oven-roasted chicken seasoned with rosemary, thyme, garlic and olive oil" },
    { id: "c_reg_3", name: "Crispy Chicken Ala King", tier: "regular", description: "Crispy fried chicken fillets served in creamy bell pepper and mushroom sauce" },
    { id: "c_reg_4", name: "Chicken Pastel", tier: "regular", description: "Slow-simmered chicken fillet with sausages, carrots and potatoes in rich cream sauce" },
    { id: "c_reg_5", name: "Chicken Estofado", tier: "regular", description: "Savory-sweet chicken braised in vinegar, soy sauce, fried plantains and spices" },
    { id: "c_reg_6", name: "Palatable Fried Chicken", tier: "regular", description: "Platable's signature crispy seasoned golden fried chicken" },
    { id: "c_reg_7", name: "Buttered Chicken", tier: "regular", description: "Tender fried chicken tossed in rich golden melted dairy butter and garlic" },
    { id: "c_reg_8", name: "Chicken Curry", tier: "regular", description: "Classic Filipino-style chicken curry with coconut milk, potatoes and bell peppers" },
    { id: "c_reg_9", name: "Chicken Sarciado", tier: "regular", description: "Braised chicken in rich savory tomato and egg sarciado sauce" },
    { id: "c_reg_10", name: "Creamy Herbed Chicken", tier: "regular", description: "Pan-seared chicken cutlets smothered in velvety herbed cream sauce" },
    { id: "c_reg_11", name: "Chicken BBQ", tier: "regular", description: "Char-grilled Filipino-style chicken skewers with sweet-savory barbecue glaze" },
    { id: "c_reg_12", name: "Chicken Teriyaki", tier: "regular", description: "Glazed chicken thigh cutlets in sweet Japanese teriyaki reduction with sesame seeds" },
    // SPECIAL DISH
    { id: "c_spec_1", name: "Lemon Butter Greek Chicken", tier: "special", premium: true, upgradePrice: 65, description: "Mediterranean style chicken roasted with fresh lemon juice, garlic, oregano and butter" },
    { id: "c_spec_2", name: "Native Chicken Halang Halang", tier: "special", premium: true, upgradePrice: 65, description: "Traditional spicy native chicken simmered in creamy coconut milk and chili peppers" },
    { id: "c_spec_3", name: "Tinu-om (Native Chicken Tinola in Banana Leaves)", tier: "special", premium: true, upgradePrice: 95, description: "Native chicken tinola wrapped and steamed in aromatic banana leaves with ginger and lemongrass" },
    { id: "c_spec_4", name: "Grilled Chimichurri Chicken", tier: "special", premium: true, upgradePrice: 65, description: "Char-grilled chicken fillets topped with vibrant fresh herb, garlic and olive oil chimichurri" },
    { id: "c_spec_5", name: "Chicken Embutido", tier: "special", premium: true, upgradePrice: 65, description: "Festive steamed chicken meatloaf roll filled with raisins, carrots, cheese and boiled eggs" },
    { id: "c_spec_6", name: "3 Flavored Korean Fried Chicken in: (Honey Soy Glace, Garlic Parmesan, Spicy Jalapeño)", tier: "special", premium: true, upgradePrice: 65, description: "Trio platter of crispy Korean fried chicken in honey soy glace, garlic parmesan, and spicy jalapeño" }
  ],
  fish: [
    // REGULAR DISH
    { id: "f_reg_1", name: "Fish Fillet (Cream Dory) in Garlic Cream Dip", tier: "regular", description: "Golden crispy fish fillet served with creamy garlic dip" },
    { id: "f_reg_2", name: "Fish Fillet (Cream Dory) Sweet and Sour", tier: "regular", description: "Crispy dory fish fillets tossed in sweet and tangy Cantonese glaze" },
    { id: "f_reg_3", name: "Fish with Tausi", tier: "regular", description: "Pan-fried fish fillet braised with fermented black beans, ginger and scallions" },
    { id: "f_reg_4", name: "Clam/Green Shell Tinola", tier: "regular", description: "Fresh clams and green mussels simmered in fragrant ginger and lemongrass broth" },
    { id: "f_reg_5", name: "Calamari", tier: "regular", description: "Crispy golden fried squid rings accompanied with house-made tartar sauce" },
    { id: "f_reg_6", name: "Buttered Garlic Shrimp", tier: "regular", description: "Fresh shrimp sautéed in generous real dairy butter, garlic and chili flakes" },
    // SPECIAL DISH
    { id: "f_spec_1", name: "Seafood Boil", tier: "special", premium: true, upgradePrice: 65, description: "Cajun-style boiled feast of shrimp, crabs, mussels, corn and sausage in spiced butter sauce" },
    { id: "f_spec_2", name: "Ebi Tempura", tier: "special", premium: true, upgradePrice: 65, description: "Japanese-style crispy light battered jumbo prawns served with sweet tentsuyu dip" },
    { id: "f_spec_3", name: "Rellenong Bangus", tier: "special", premium: true, upgradePrice: 65, description: "Whole milkfish stuffed with seasoned flaked bangus meat, raisins and vegetables" },
    { id: "f_spec_4", name: "Grilled Stuffed Bangus", tier: "special", premium: true, upgradePrice: 65, description: "Char-grilled milkfish filled with onions, tomatoes and ginger in banana leaf wrap" },
    { id: "f_spec_5", name: "Steamed Whole Fish with: (Mayonnaise, Mustard, Pickles, Ginger, Onions and Garlic)", tier: "special", premium: true, upgradePrice: 65, description: "Festive cold steamed whole fish beautifully garnished with mayonnaise-mustard dressing and relish" },
    { id: "f_spec_6", name: "Whole Sweet and Sour Fish", tier: "special", premium: true, upgradePrice: 65, description: "Crispy deep-fried whole fish drizzled with vibrant sweet and sour glaze" },
    { id: "f_spec_7", name: "Sweet and Spicy Crabs", tier: "special", premium: true, upgradePrice: 65, description: "Fresh whole crabs cooked in savory sweet and spicy chili-garlic glaze" },
    { id: "f_spec_8", name: "Creamy Baked Salmon", tier: "special", premium: true, upgradePrice: 65, description: "Baked salmon fillet with rich mayonnaise, garlic, parmesan and cream cheese topping" },
    { id: "f_spec_9", name: "Sinuglaw na Tangigue", tier: "special", premium: true, upgradePrice: 65, description: "Authentic Visayan raw Spanish mackerel ceviche kinilaw paired with grilled pork belly" },
    { id: "f_spec_10", name: "Shrimp Kinilaw", tier: "special", premium: true, upgradePrice: 65, description: "Fresh succulent shrimp cured in native vinegar, calamansi, ginger, onions and chili" }
  ],
  rice: [
    // REGULAR DISH
    { id: "r_reg_1", name: "Plain Steamed Rice", tier: "regular", description: "Fluffy steamed premium white jasmine rice" },
    { id: "r_reg_2", name: "Garlic Rice", tier: "regular", description: "Fragrant wok-tossed rice with toasted golden garlic bits" },
    { id: "r_reg_3", name: "Java Rice", tier: "regular", description: "Savory yellow seasoned rice cooked with turmeric, annatto and butter" },
    { id: "r_reg_4", name: "Crab and Corn Soup", tier: "regular", description: "Silky creamy corn chowder with sweet crab meat and egg ribbons" },
    { id: "r_reg_5", name: "Corn Soup", tier: "regular", description: "Hearty sweet yellow corn soup with delicate egg swirl" },
    { id: "r_reg_6", name: "Cream of Squash Soup", tier: "regular", description: "Velvety roasted native squash soup with cream and croutons" },
    { id: "r_reg_7", name: "Egg Drop Soup", tier: "regular", description: "Delicate seasoned broth with silky beaten egg threads and scallions" },
    { id: "r_reg_8", name: "Pancit Molo Soup", tier: "regular", description: "Ilonggo wonton dumpling soup with shredded chicken in savory broth" },
    { id: "r_reg_9", name: "Chicken Macaroni Soup", tier: "regular", description: "Comforting Filipino sopas with macaroni noodles, chicken and vegetables in milk broth" },
    { id: "r_reg_10", name: "Chicken Sotanghon Soup", tier: "regular", description: "Glass noodle soup with shredded chicken, shiitake mushrooms and toasted garlic" },
    { id: "r_reg_11", name: "Cream of Mushroom", tier: "regular", description: "Classic velvety mushroom soup enriched with butter and fresh cream" },
    // SPECIAL DISH
    { id: "r_spec_1", name: "Yangchow Fried Rice", tier: "special", premium: true, upgradePrice: 65, description: "Wok-fried rice with char siu bits, shrimp, green peas and scrambled eggs" },
    { id: "r_spec_2", name: "Kimchi Fried Rice", tier: "special", premium: true, upgradePrice: 65, description: "Korean-style wok fried rice with seasoned kimchi, sesame oil and nori" },
    { id: "r_spec_3", name: "Seafood Paella", tier: "special", premium: true, upgradePrice: 65, description: "Spanish rice cooked in saffron broth topped with shrimp, squid, clams and mussels" },
    { id: "r_spec_4", name: "Paella Negra", tier: "special", premium: true, upgradePrice: 65, description: "Rich Spanish rice infused with squid ink and tender squid rings with garlic aioli" },
    { id: "r_spec_5", name: "Arroz Valenciana", tier: "special", premium: true, upgradePrice: 65, description: "Visayan festive glutinous rice cooked with coconut milk, chicken, chorizo and boiled eggs" },
    { id: "r_spec_6", name: "Arroz Caldo Station", tier: "special", premium: true, upgradePrice: 65, description: "Interactive warm chicken ginger rice congee station with crispy garlic, eggs and spring onions" },
    { id: "r_spec_7", name: "Batchoy Station", tier: "special", premium: true, upgradePrice: 65, description: "Signature La Paz Batchoy noodle soup station with broth, pork cracklings and egg" }
  ],
  noodlesOrVeg: [
    // REGULAR DISH
    { id: "sd_reg_1", name: "Creamy Spaghetti", tier: "regular", description: "Filipino style sweet-savory creamy spaghetti with ground meat and cheese" },
    { id: "sd_reg_2", name: "Pancit Guisado", tier: "regular", description: "Classic stir-fried noodles with crisp vegetables and savory pork & chicken slices" },
    { id: "sd_reg_3", name: "Bihon Guisado", tier: "regular", description: "Delicate rice vermicelli noodles sautéed with vegetables, chicken and calamansi" },
    { id: "sd_reg_4", name: "Sotanghon Guisado", tier: "regular", description: "Glossy vermicelli glass noodles stir-fried with shredded chicken, mushrooms and annatto" },
    { id: "sd_reg_5", name: "Baked Penne Pasta", tier: "regular", description: "Al dente penne pasta baked in meaty tomato sauce topped with molten cheddar" },
    { id: "sd_reg_6", name: "Tuna Fucilli Salad", tier: "regular", description: "Chilled fusilli pasta tossed with flaked tuna, sweet relish, carrots and mayonnaise" },
    { id: "sd_reg_7", name: "Bam-I", tier: "regular", description: "Cebuano festive noodle medley of stir-fried canton and bihon with vegetables and meats" },
    { id: "sd_reg_8", name: "Mixed Buttered Vegetables", tier: "regular", description: "Medley of tender kernel corn, carrots, peas and french beans in rich dairy butter" },
    { id: "sd_reg_9", name: "Chopsuey", tier: "regular", description: "Crispy sautéed highland vegetables in savory glaze with chicken liver and quail eggs" },
    { id: "sd_reg_10", name: "Herbed Marble Potato", tier: "regular", description: "Roasted baby marble potatoes tossed in butter, rosemary, thyme and sea salt" },
    { id: "sd_reg_11", name: "Lumpiang Shanghai", tier: "regular", description: "Golden crispy fried spring rolls filled with seasoned minced pork and minced veggies" },
    { id: "sd_reg_12", name: "Fresh Lumpia", tier: "regular", description: "Hearty palm heart and vegetable roll wrapped in fresh crepe with sweet peanut garlic sauce" },
    { id: "sd_reg_13", name: "Japchae (Korean Noodles)", tier: "regular", description: "Korean stir-fried sweet potato glass noodles with vegetables, sesame and sweet soy" },
    { id: "sd_reg_14", name: "Potato Salad", tier: "regular", description: "Classic creamy diced potato salad with apples, eggs, chicken and mayonnaise" },
    // SPECIAL DISH
    { id: "sd_spec_1", name: "Assorted Canapés", tier: "special", premium: true, upgradePrice: 65, description: "Chef's gourmet finger-food platter of savory crostini, smoked ham and cheese canapés" },
    { id: "sd_spec_2", name: "Potato Gratin", tier: "special", premium: true, upgradePrice: 65, description: "Thinly sliced potatoes baked with garlic, nutmeg and rich heavy cream with golden cheese crust" },
    { id: "sd_spec_3", name: "Mixed Vegetable Gratin", tier: "special", premium: true, upgradePrice: 65, description: "Garden vegetables baked in velvety bechamel sauce and topped with melted cheese" },
    { id: "sd_spec_4", name: "Creamy Mashed Potatoes in Mushroom Gravy", tier: "special", premium: true, upgradePrice: 65, description: "Silky butter mashed potatoes served with rich wild mushroom brown gravy" },
    { id: "sd_spec_5", name: "Fresh Vietnamese Spring Rolls in Peanut Sauce", tier: "special", premium: true, upgradePrice: 65, description: "Translucent rice paper rolls filled with fresh herbs, vermicelli and shrimp with hoisin peanut dip" },
    { id: "sd_spec_6", name: "Lemon Chicken Zucchinni Pasta", tier: "special", premium: true, upgradePrice: 65, description: "Light refreshing pasta with sautéed chicken breast, ribboned zucchini, lemon and olive oil" },
    { id: "sd_spec_7", name: "Quiche", tier: "special", premium: true, upgradePrice: 65, description: "Savory French-style baked custard tart packed with bacon, cheese, spinach and herbs" },
    { id: "sd_spec_8", name: "Baked Cheesy Bacon Squash", tier: "special", premium: true, upgradePrice: 65, description: "Sweet roasted native squash cubes baked with melted mozzarella, cheddar and crispy bacon" },
    { id: "sd_spec_9", name: "Cauliflower Tots", tier: "special", premium: true, upgradePrice: 65, description: "Crispy golden baked cauliflower bites served with garlic aioli dipping sauce" }
  ],
  dessert: [
    // REGULAR
    { id: "d_reg_1", name: "Mango Tapioca", tier: "regular", description: "Sweet ripe Guimaras mangoes with soft tapioca sago pearls in sweetened cream" },
    { id: "d_reg_2", name: "Fruitcocktail Graham Float", tier: "regular", description: "Chilled layered dessert of sweet cream, graham crackers and mixed fruit cocktail" },
    { id: "d_reg_3", name: "Window Cathedral", tier: "regular", description: "Multi-colored translucent jelly cubes set in velvety sweet milk gelatin" },
    { id: "d_reg_4", name: "Coffee Jelly", tier: "regular", description: "Bittersweet coffee-infused gelatin cubes in rich sweetened condensed milk and cream" },
    { id: "d_reg_5", name: "Fruit Salad", tier: "regular", description: "Festive Filipino sweet fruit salad with nata de coco, kaong, apples and sweet cream" },
    { id: "d_reg_6", name: "Mango Float", tier: "regular", description: "Classic icebox cake layered with honey graham crackers, sweetened cream and fresh mango slices" },
    { id: "d_reg_7", name: "Assorted Cupcakes", tier: "regular", description: "Colorful mini party cupcakes with assorted chocolate, vanilla and mocha frostings" },
    { id: "d_reg_8", name: "Buko Pandan", tier: "regular", description: "Fragrant pandan jelly cubes and tender young coconut shreds in chilled rich cream" },
    // SPECIAL
    { id: "d_spec_1", name: "Assorted Pinoy Kakanins", tier: "special", premium: true, upgradePrice: 65, description: "Traditional fiesta platter of biko, puto, kutsinta, sapin-sapin and cassava cake" },
    { id: "d_spec_2", name: "Assorted Fresh Fruits on Cup", tier: "special", premium: true, upgradePrice: 65, description: "Refreshing medley of freshly carved seasonal melons, grapes, pineapple and berries in cups" },
    { id: "d_spec_3", name: "Assorted Dessert Shots", tier: "special", premium: true, upgradePrice: 65, description: "Artisanal dessert shooters including cheesecake mousse, chocolate ganache and tiramisu" },
    { id: "d_spec_4", name: "Strawberry Short Cake", tier: "special", premium: true, upgradePrice: 65, description: "Fluffy sponge cake layered with fresh Baguio strawberries and whipped Chantilly cream" },
    { id: "d_spec_5", name: "Halo Halo Station (50pax Up)", tier: "special", premium: true, upgradePrice: 65, description: "Interactive live Filipino shaved ice dessert station with all classic sweet preserves, leche flan and ube" },
    { id: "d_spec_6", name: "Pinoy Sorbet (50pax Up)", tier: "special", premium: true, upgradePrice: 65, description: "Authentic Filipino dirty ice cream sorbetes cart featuring ube, cheese and mango scoops" }
  ],
  drinks: [
    { id: "dr1", name: "Bottomless Signature Red Iced Tea", tier: "regular", description: "House blend iced tea brewed with sweet berry notes and calamansi zest" },
    { id: "dr2", name: "Fresh Calamansi & Dalandan Citrus Cooler", tier: "regular", description: "Cold-pressed native Philippine citrus sweetened with organic wild honey" },
    { id: "dr3", name: "Blue Lemonade Refresher with Mint", tier: "regular", description: "Refreshing blue lemonade infused with fresh crushed spearmint" },
    { id: "dr4", name: "Cucumber Mint Infused Iced Drink", tier: "regular", description: "Crisp cucumber essence with light citrus and chilled mineral water" }
  ]
};

export const CATERING_ADDONS = [
  {
    id: "lechon_small",
    name: "Whole Crispy Roast Lechon (Small)",
    category: "Roast & Carving",
    price: 8500,
    unit: "approx 15-18kg (serves 30-40 pax)",
    description: "Traditional whole roasted pig stuffed with lemongrass, garlic, and special spices. Includes native liver sauce.",
    popular: true
  },
  {
    id: "lechon_med",
    name: "Whole Crispy Roast Lechon (Medium)",
    category: "Roast & Carving",
    price: 10500,
    unit: "approx 20-23kg (serves 45-60 pax)",
    description: "Golden crispy skin and tender, aromatic meat roasted over charcoal fire. Includes liver gravy.",
    popular: false
  },
  {
    id: "lechon_large",
    name: "Whole Crispy Roast Lechon (Large)",
    category: "Roast & Carving",
    price: 12500,
    unit: "approx 25-28kg (serves 65-80 pax)",
    description: "Grand centerpiece lechon with extra crispy crackling skin and juicy seasoned ribs.",
    popular: false
  },
  {
    id: "halo_halo_station",
    name: "Pinoy Halo-Halo Dessert Bar Station",
    category: "Food Stations",
    price: 4500,
    unit: "100 Servings",
    description: "Interactive shaved ice station with shaved ice machine, ube halaya, leche flan, sago, nata de coco, sweetened beans, pinipig, and evaporated milk with attendant.",
    popular: true
  },
  {
    id: "sorbetes_cart",
    name: "Pinoy Sorbetes (Dirty Ice Cream) Wooden Cart",
    category: "Food Stations",
    price: 3500,
    unit: "approx 100-120 cones",
    description: "Authentic colorful wooden pushcart with 3 flavors (Cheese, Ube, Chocolate/Mango) in crispy wafer cones or sweet pandesal buns.",
    popular: true
  },
  {
    id: "grazing_table",
    name: "Deluxe Filipino Charcuterie & Grazing Table",
    category: "Food Stations",
    price: 6500,
    unit: "serves 50-70 pax",
    description: "Stylized appetizer spread with native sausages (longganisa bites), local artisanal cheeses (queso de bola, kesong puti), dried mangoes, crackers, nuts, and dips.",
    popular: false
  },
  {
    id: "mobile_bar",
    name: "Mobile Cocktails & Mocktails Bar",
    category: "Beverage Stations",
    price: 8000,
    unit: "3 Hours Open Bar (up to 70 pax)",
    description: "Lighted bar counter with 3 signature Filipino cocktails (e.g. Boracay Sunset, Manila Mule) and 2 non-alcoholic mocktails with professional bartender.",
    popular: false
  },
  {
    id: "tiffany_chairs",
    name: "Tiffany / Phoenix Chairs with VIP Linen Upgrade",
    category: "Venue Styling",
    price: 5000,
    unit: "up to 50-70 chairs",
    description: "Replace standard monobloc chairs with elegant Gold or White Tiffany chairs with cushions, paired with premium table runners.",
    popular: true
  },
  {
    id: "sound_and_lights",
    name: "Basic Acoustic Sound System & Mood Uplights",
    category: "Production",
    price: 6000,
    unit: "4 Hours Setup",
    description: "2 powered PA speakers, 2 wireless microphones, audio mixer, and 8 LED ambient mood uplights suitable for intimate to medium venues.",
    popular: false
  },
  {
    id: "presidential_flowers",
    name: "Fresh Floral Presidential & VIP Centerpieces",
    category: "Venue Styling",
    price: 4000,
    unit: "Set of 5 Tables",
    description: "Freshly arranged floral centerpieces with local roses, chrysanthemums, and lush foliage for VIP and bridal tables.",
    popular: false
  }
];

export const DELIVERY_LOCATIONS = [
  { id: "ncr", name: "Metro Manila (NCR)", fee: 1500, description: "Quezon City, Manila, Makati, Taguig, Pasig, Mandaluyong, etc." },
  { id: "south_near", name: "Cavite & Laguna (Near Metro)", fee: 2500, description: "Bacoor, Imus, Dasmariñas, San Pedro, Biñan, Santa Rosa" },
  { id: "east_rizal", name: "Rizal Province", fee: 2500, description: "Antipolo, Taytay, Cainta, Angono, San Mateo" },
  { id: "north_bulacan", name: "Bulacan Province", fee: 3500, description: "Meycauayan, Marilao, Malolos, San Jose Del Monte" },
  { id: "tagaytay_batangas", name: "Tagaytay & Batangas City", fee: 4500, description: "Tagaytay Ridge, Silang, Lipa, Batangas proper" },
  { id: "pampanga_clark", name: "Pampanga & Clark", fee: 4500, description: "San Fernando, Angeles City, Clark Freeport" },
  { id: "custom", name: "Custom Out-of-Town / Other Region", fee: 0, description: "Deliveries outside specified zones (Custom quote)" }
];

export const EVENT_TYPES = [
  { id: "wedding", name: "Kasal (Wedding Reception)" },
  { id: "debut", name: "18th Birthday Debut" },
  { id: "birthday", name: "Birthday Party / Milestone Celebration" },
  { id: "binyag", name: "Binyag (Christening / Baptism)" },
  { id: "corporate", name: "Corporate Event / Seminar / Gala" },
  { id: "reunion", name: "Grand Family Reunion / Fiesta" },
  { id: "anniversary", name: "Wedding Anniversary" },
  { id: "funeral", name: "Pamisa / Memorial Gathering" }
];
