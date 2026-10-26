import { DEFAULT_TERMS_AND_CONDITIONS, DEFAULT_PACKAGE_INCLUSIONS } from "./tenantSchema";

export const CATERER_INFO = {
  businessName: "PALATABLE CATERING SERVICES",
  tagline: "Premier Philippine Catering & Food Tray Services",
  tin: "",
  phone: "+63 956 009 4971",
  email: "palatableiloph@gmail.com",
  website: "www.palatablecatering.ph",
  address: "Brgy. Gaub, Cabatuan, Iloilo",
  bankDetails: {
    gcash: { name: "Palatable Catering Services", number: "+63 956 009 4971" },
    selectedBank: "pnb",
    bankName: "Philippine National Bank (PNB)",
    accountName: "Palatable Catering Services",
    accountNumber: "1234-5678-9012",
    branch: "Main Corporate Branch",
    accountType: "Corporate Current / Savings Account",
    acceptCardAtStore: true,
    cardPaymentNotes: "Credit & Debit Cards (Visa, Mastercard, BancNet, JCB) accepted via physical POS terminal at store commissary.",
    bdo: { accountName: "Palatable Catering Services", accountNumber: "" },
    bpi: { accountName: "Palatable Catering Services", accountNumber: "" }
  },
  termsAndConditions: DEFAULT_TERMS_AND_CONDITIONS,
  packageInclusions: DEFAULT_PACKAGE_INCLUSIONS
};

export const BUFFET_PACKAGES = [
  {
    id: "package_1",
    serviceType: "buffet",
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
    serviceType: "buffet",
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
    serviceType: "buffet",
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
    serviceType: "buffet",
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
    serviceType: "buffet",
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

export const FOOD_TRAY_PACKAGES = [
  {
    id: "food_tray_small",
    serviceType: "food_tray",
    name: "Small Batch Package (Food Tray)",
    subtitle: "3 Regular Main Dish + 2 Regular Side in Party Trays",
    badge: "10-15 PAX",
    popular: false,
    price: 7500,
    pricePerPax: 500,
    minPax: 10,
    maxPax: 15,
    paxRange: "10-15 PAX",
    mainDishesCount: 3,
    sideDishes: { regular: 2, special: 0 },
    desserts: { regular: 0, special: 0 },
    courses: {
      beef: 1,
      pork: 1,
      chicken: 1,
      sideRegular: 2,
      sideSpecial: 0,
      dessertRegular: 0,
      dessertSpecial: 0,
      riceOrSoup: 0,
      drinks: 0
    },
    inclusions: [
      "3 Regular Main Dishes (Choice of Beef, Pork, Chicken, Seafood)",
      "2 Regular Side Dishes (Pasta, Noodles, or Vegetables)",
      "Food-grade aluminum party food trays with secure lids",
      "Free delivery to Iloilo City, Pavia, Sta. Barbara, Cabatuan, Maasin, San Miguel, Janiuay",
      "Bookings placed 2-3 days prior to event",
      "50% downpayment upon booking, remaining balance upon delivery",
      "Strictly no cancellation (70% cancellation fee)"
    ]
  },
  {
    id: "food_tray_family",
    serviceType: "food_tray",
    name: "Family Party Package (Food Tray)",
    subtitle: "3 Regular Main Dish + 2 Regular Side in Party Trays",
    badge: "25-30 PAX",
    popular: true,
    price: 12500,
    pricePerPax: 417,
    minPax: 25,
    maxPax: 30,
    paxRange: "25-30 PAX",
    mainDishesCount: 3,
    sideDishes: { regular: 2, special: 0 },
    desserts: { regular: 0, special: 0 },
    courses: {
      beef: 1,
      pork: 1,
      chicken: 1,
      sideRegular: 2,
      sideSpecial: 0,
      dessertRegular: 0,
      dessertSpecial: 0,
      riceOrSoup: 0,
      drinks: 0
    },
    inclusions: [
      "3 Regular Main Dishes (Choice of Beef, Pork, Chicken, Seafood)",
      "2 Regular Side Dishes (Pasta, Noodles, or Vegetables)",
      "Food-grade aluminum party food trays with secure lids",
      "Free delivery to Iloilo City, Pavia, Sta. Barbara, Cabatuan, Maasin, San Miguel, Janiuay",
      "Bookings placed 2-3 days prior to event",
      "50% downpayment upon booking, remaining balance upon delivery",
      "Strictly no cancellation (70% cancellation fee)"
    ]
  },
  {
    id: "food_tray_bunch",
    serviceType: "food_tray",
    name: "The Big Bunch Package (Food Tray)",
    subtitle: "3 Regular Main Dish + 2 Regular Side in Party Trays",
    badge: "35-40 PAX",
    popular: false,
    price: 15500,
    pricePerPax: 388,
    minPax: 35,
    maxPax: 40,
    paxRange: "35-40 PAX",
    mainDishesCount: 3,
    sideDishes: { regular: 2, special: 0 },
    desserts: { regular: 0, special: 0 },
    courses: {
      beef: 1,
      pork: 1,
      chicken: 1,
      sideRegular: 2,
      sideSpecial: 0,
      dessertRegular: 0,
      dessertSpecial: 0,
      riceOrSoup: 0,
      drinks: 0
    },
    inclusions: [
      "3 Regular Main Dishes (Choice of Beef, Pork, Chicken, Seafood)",
      "2 Regular Side Dishes (Pasta, Noodles, or Vegetables)",
      "Food-grade aluminum party food trays with secure lids",
      "Free delivery to Iloilo City, Pavia, Sta. Barbara, Cabatuan, Maasin, San Miguel, Janiuay",
      "Bookings placed 2-3 days prior to event",
      "50% downpayment upon booking, remaining balance upon delivery",
      "Strictly no cancellation (70% cancellation fee)"
    ]
  },
  {
    id: "food_tray_single_dish",
    serviceType: "food_tray",
    name: "Single Dish / A La Carte Food Tray",
    subtitle: "Select 1 Regular Dish of your choice (Priced per pax / tray)",
    badge: "1 Regular Dish",
    popular: false,
    isCustomSingleDish: true,
    price: 2500,
    pricePerPax: 200,
    minPax: 10,
    maxPax: 50,
    paxRange: "10-15 PAX (Customizable)",
    mainDishesCount: 1,
    sideDishes: { regular: 0, special: 0 },
    desserts: { regular: 0, special: 0 },
    courses: {
      beef: 1,
      pork: 0,
      chicken: 0,
      sideRegular: 0,
      sideSpecial: 0,
      dessertRegular: 0,
      dessertSpecial: 0,
      riceOrSoup: 0,
      drinks: 0
    },
    inclusions: [
      "Select 1 Regular Dish (or Special Dish upgrade) from Palatable's Master Menu",
      "Freshly prepared in food-grade aluminum party tray",
      "Free delivery within Iloilo Free Zone (orders ₱5,000+)",
      "Customizable serving size based on guest headcount"
    ]
  }
];

export const PICA_PICA_PACKAGES = [
  {
    id: "pica_pica_petite",
    serviceType: "pica_pica",
    name: "Petite Package (Pica Pica / Grazing)",
    subtitle: "3 Kilos Cured Meats, 3 Cheeses, 3 Fruit Platters, 3 Canapés & 2 Sliders",
    badge: "30-50 PAX • ₱25,000",
    popular: false,
    price: 25000,
    pricePerPax: 500,
    minPax: 30,
    maxPax: 50,
    paxRange: "Good for 30-50 PAX",
    picaAllowances: {
      sliders: 2,
      canapes: 3,
      fingerFood: 0,
      miniDesserts: 0,
      drinks: 0
    },
    grazingAllowances: {
      sliders: 2,
      canapes: 3
    },
    inclusions: [
      "3 Kilos of Italian Cured Meats",
      "3 Types of Imported Cheeses",
      "3 Big Seasonal Fruit Platter",
      "3 Canapés, 2 Sliders",
      "Mix Assorted Nuts and Dried Fruits",
      "Wafers, Saltin Crackers, Bretzels",
      "Artisan Breadbasket with Jam and Bread"
    ]
  },
  {
    id: "pica_pica_party",
    serviceType: "pica_pica",
    name: "Party Package (Pica Pica / Grazing)",
    subtitle: "4 Kilos Cured Meats, 4 Cheeses, 4 Fruit Platters, 4 Canapés, 3 Sliders & Sausage Platter",
    badge: "50-100 PAX • ₱45,000",
    popular: true,
    price: 45000,
    pricePerPax: 450,
    minPax: 50,
    maxPax: 100,
    paxRange: "Good for 50-100 PAX",
    picaAllowances: {
      sliders: 3,
      canapes: 4,
      fingerFood: 0,
      miniDesserts: 0,
      drinks: 0
    },
    grazingAllowances: {
      sliders: 3,
      canapes: 4
    },
    inclusions: [
      "4 Kilos of Italian Cured Meats",
      "4 Types of Imported Cheeses",
      "4 Big Seasonal Fruit Platter",
      "4 Canapés, 3 Sliders",
      "Mix Assorted Nuts and Dried Fruits",
      "Wafers, Saltin Crackers, Bretzels",
      "Vegetables Sticks",
      "Olives, Cocktail Onions",
      "Hungarian Sausage Platter",
      "Artisan Breadbasket with Jam and Bread"
    ]
  },
  {
    id: "pica_pica_opt1",
    serviceType: "pica_pica",
    name: "Option 1 (Pica Pica Station)",
    subtitle: "2 Sliders, 5 Canapés, 2 Finger Food, 2 Mini Dessert Cups & Drinks",
    badge: "50 PAX Min • ₱300/pax",
    popular: false,
    pricePerPax: 300,
    minPax: 50,
    paxRange: "50 PAX Min",
    picaAllowances: {
      sliders: 2,
      canapes: 5,
      fingerFood: 2,
      miniDesserts: 2,
      drinks: 1
    },
    inclusions: [
      "2 Sliders (Choice of mini chicken, burgers, clubhouse, etc.)",
      "5 Canapés (Artisanal savory bite-sized appetizers)",
      "2 Finger Food (Hot savory finger foods with dips)",
      "2 Mini Dessert Cups (Chilled dessert shooters & sweet treats)",
      "Choice of: Refreshing Juice or Fresh Brewed Coffee",
      "Full live cocktail food station setup with rustic wooden risers, spotlights & greenery",
      "Minimum booking guarantee: 50 PAX"
    ]
  },
  {
    id: "pica_pica_opt2",
    serviceType: "pica_pica",
    name: "Option 2 (Pica Pica Station)",
    subtitle: "3 Sliders, 5 Canapés, 3 Finger Food, 2 Mini Dessert Cups & Drinks",
    badge: "Palatable Favorite ⭐",
    popular: true,
    pricePerPax: 350,
    minPax: 50,
    paxRange: "50 PAX Min",
    picaAllowances: {
      sliders: 3,
      canapes: 5,
      fingerFood: 3,
      miniDesserts: 2,
      drinks: 1
    },
    inclusions: [
      "3 Sliders (Choice of mini chicken, burgers, clubhouse, etc.)",
      "5 Canapés (Artisanal savory bite-sized appetizers)",
      "3 Finger Food (Hot savory finger foods with dips)",
      "2 Mini Dessert Cups (Chilled dessert shooters & sweet treats)",
      "Choice of: Refreshing Juice or Fresh Brewed Coffee",
      "Full live cocktail food station setup with rustic wooden risers, spotlights & greenery",
      "Minimum booking guarantee: 50 PAX"
    ]
  },
  {
    id: "pica_pica_opt3",
    serviceType: "pica_pica",
    name: "Option 3 - Grand (Pica Pica Station)",
    subtitle: "3 Sliders, 5 Canapés, 3 Finger Food, 3 Mini Desserts, Pinoy Kakanins & DIY Live Station",
    badge: "Grand Station Feast",
    popular: false,
    pricePerPax: 425,
    minPax: 50,
    paxRange: "50 PAX Min",
    picaAllowances: {
      sliders: 3,
      canapes: 5,
      fingerFood: 3,
      miniDesserts: 3,
      hasKakanin: true,
      hasDiyStation: true,
      drinks: 1
    },
    inclusions: [
      "3 Sliders (Choice of mini chicken, burgers, clubhouse, etc.)",
      "5 Canapés (Artisanal savory bite-sized appetizers)",
      "3 Finger Food (Hot savory finger foods with dips)",
      "3 Mini Dessert Cups (Chilled dessert shooters & sweet treats)",
      "Pinoy Kakanins (Traditional Filipino native delicacies included)",
      "Choice of: DIY Nacho Station OR DIY Mini Doughnut Station",
      "Choice of: Refreshing Juice or Fresh Brewed Coffee",
      "Complete live experiential cocktail station setup with service attendants",
      "Minimum booking guarantee: 50 PAX"
    ]
  }
];

export const GRAZING_TABLE_PACKAGES = [
  {
    id: "grazing_petite",
    serviceType: "grazing_table",
    name: "Petite Package (Grazing Table)",
    subtitle: "3 Kilos Cured Meats, 3 Cheeses, 3 Fruit Platters, 3 Canapés & 2 Sliders",
    badge: "30-50 PAX • ₱25,000",
    popular: false,
    price: 25000,
    pricePerPax: 500,
    minPax: 30,
    maxPax: 50,
    paxRange: "Good for 30-50 PAX",
    grazingAllowances: {
      canapes: 3,
      sliders: 2
    },
    inclusions: [
      "3 Kilos of Italian Cured Meats",
      "3 Types of Imported Cheeses",
      "3 Big Seasonal Fruit Platter",
      "3 Canapés, 2 Sliders",
      "Mix Assorted Nuts and Dried Fruits",
      "Wafers, Saltin Crackers, Bretzels",
      "Artisan Breadbasket with Jam and Bread"
    ]
  },
  {
    id: "grazing_party",
    serviceType: "grazing_table",
    name: "Party Package (Grazing Table)",
    subtitle: "4 Kilos Cured Meats, 4 Cheeses, 4 Fruit Platters, 4 Canapés, 3 Sliders & Sausage Platter",
    badge: "50-100 PAX • ₱45,000",
    popular: true,
    price: 45000,
    pricePerPax: 450,
    minPax: 50,
    maxPax: 100,
    paxRange: "Good for 50-100 PAX",
    grazingAllowances: {
      canapes: 4,
      sliders: 3
    },
    inclusions: [
      "4 Kilos of Italian Cured Meats",
      "4 Types of Imported Cheeses",
      "4 Big Seasonal Fruit Platter",
      "4 Canapés, 3 Sliders",
      "Mix Assorted Nuts and Dried Fruits",
      "Wafers, Saltin Crackers, Bretzels",
      "Vegetables Sticks",
      "Olives, Cocktail Onions",
      "Hungarian Sausage Platter",
      "Artisan Breadbasket with Jam and Bread"
    ]
  },
  {
    id: "grazing_deluxe",
    serviceType: "grazing_table",
    name: "Deluxe Grazing Table Package",
    subtitle: "Artisan Charcuterie, Imported Cheeses, 5 Canapés, 4 Sliders & Nachos Station",
    badge: "100-150 PAX",
    popular: true,
    price: 85000,
    pricePerPax: 567,
    minPax: 100,
    maxPax: 150,
    paxRange: "Good for 100-150 PAX",
    grazingAllowances: {
      canapes: 5,
      sliders: 4
    },
    inclusions: [
      "5 Kilos of Italian Cured Meats (Prosciutto, Salami, Mortadella, Coppa)",
      "5 Types of Premium Imported Cheeses (Brie, Gouda, Cheddar, Blue Cheese, etc.)",
      "5 Big Seasonal Fresh Fruit Platters",
      "5 Canapés (Curated from Palatable Canapés library)",
      "4 Sliders (Curated from Palatable Sliders library)",
      "Mix Assorted Nuts and Dried Fruits",
      "Wafers, Saltin Crackers, Bretzels & Vegetable Sticks",
      "Olives, Cocktail Onions & Dips",
      "Hungarian Sausage Platter",
      "Individual Grazing Cups",
      "Complete Nachos Station with warm cheese sauce & salsa",
      "Artisan Breadbasket with Gourmet Jams & Spreads",
      "Full thematic grazing table styling with tiered wooden slabs, fresh foliage & ambient lighting"
    ]
  },
  {
    id: "grazing_premium",
    serviceType: "grazing_table",
    name: "Premium Grazing Table Package",
    subtitle: "Grand Charcuterie Feast, 5 Canapés, 4 Sliders, Dessert Shots & Nachos Station",
    badge: "150-200 PAX",
    popular: false,
    price: 105000,
    pricePerPax: 525,
    minPax: 150,
    maxPax: 200,
    paxRange: "Good for 150-200 PAX",
    grazingAllowances: {
      canapes: 5,
      sliders: 4,
      hasDessertShots: true
    },
    inclusions: [
      "5 Kilos of Italian Cured Meats (Prosciutto, Salami, Mortadella, Coppa)",
      "5 Types of Premium Imported Cheeses (Brie, Gouda, Cheddar, Blue Cheese, etc.)",
      "5 Big Seasonal Fresh Fruit Platters",
      "5 Canapés (Curated from Palatable Canapés library)",
      "4 Sliders (Curated from Palatable Sliders library)",
      "Mix Assorted Nuts and Dried Fruits",
      "Wafers, Saltin Crackers, Bretzels & Vegetable Sticks",
      "Olives, Cocktail Onions & Dips",
      "Hungarian Sausage Platter",
      "Individual Grazing Cups",
      "Complete Nachos Station with warm cheese sauce & salsa",
      "Artisanal Dessert Shots (Cheesecake, Tiramisu, Chocolate Ganache)",
      "Artisan Breadbasket with Gourmet Jams & Spreads",
      "Grand luxury grazing table styling with tiered marble/wood stands, botanical decor & mood lighting"
    ]
  }
];

export const PACKED_MEAL_PACKAGES = [
  {
    id: "pm_1",
    serviceType: "packed_meal",
    code: "PM 1",
    name: "PM 1 Packed Meal (Bento)",
    category: "Packed Meals",
    subtitle: "1 Main Dish, 1 Side Dish, Plain or Garlic Rice, Soda",
    badge: "Min 50 PAX • ₱175",
    popular: false,
    pricePerPax: 175,
    minPax: 50,
    mainDishesCount: 1,
    sideDishes: { regular: 1, special: 0 },
    desserts: { regular: 0, special: 0 },
    riceOptions: ["Plain Rice", "Garlic Rice"],
    drinkOptions: ["Soda (Coke / Sprite / Royal)"],
    hasDessertCup: false,
    hasBottledWater: false,
    courses: {
      beef: 0,
      pork: 0,
      chicken: 1,
      sideRegular: 1,
      sideSpecial: 0,
      dessertRegular: 0,
      dessertSpecial: 0,
      riceOrSoup: 1,
      drinks: 1
    },
    inclusions: [
      "1 Main Dish (Choice of Fried Chicken, Breaded Pork Chop, or Fish Fillet)",
      "1 Side Dish (Tuna Macaroni Salad, Buttered Vegetables, or Sotanghon Guisado)",
      "Plain Rice or Garlic Rice",
      "Soda (Assorted Canned / Bottle)",
      "Food-grade compartmentalized bento box packaging",
      "Individually sealed cutlery pack (spoon, fork, napkin, toothpick)",
      "Minimum order guarantee: 50 PAX"
    ],
    comboOptions: [
      {
        code: "PM1A",
        name: "PM 1 - Option A",
        main: "Palatable Fried Chicken",
        side: "Tuna Macaroni Salad",
        rice: "Plain Rice or Garlic Rice",
        drinks: "Soda",
        items: ["Fried Chicken", "Tuna Macaroni Salad", "Plain Rice or Garlic Rice", "Soda"]
      },
      {
        code: "PM1B",
        name: "PM 1 - Option B",
        main: "Crispy Pork Chop",
        side: "Mixed Buttered Vegetables",
        rice: "Plain Rice or Garlic Rice",
        drinks: "Soda",
        items: ["Breaded Pork Chop", "Buttered Vegetables", "Plain Rice or Garlic Rice", "Soda"]
      },
      {
        code: "PM1C",
        name: "PM 1 - Option C",
        main: "Fish Fillet (Cream Dory) in Garlic Cream Dip",
        side: "Sotanghon Guisado",
        rice: "Plain Rice or Garlic Rice",
        drinks: "Soda",
        items: ["Fish Fillet", "Sotanghon Guisado", "Plain Rice or Garlic Rice", "Soda"]
      }
    ]
  },
  {
    id: "pm_2",
    serviceType: "packed_meal",
    code: "PM 2",
    name: "PM 2 Packed Meal (Bento)",
    category: "Packed Meals",
    subtitle: "1 Main Dish, 2 Side Dishes, Plain or Garlic Rice, Soda",
    badge: "Min 50 PAX • ₱199",
    popular: true,
    pricePerPax: 199,
    minPax: 50,
    mainDishesCount: 1,
    sideDishes: { regular: 2, special: 0 },
    desserts: { regular: 0, special: 0 },
    riceOptions: ["Plain Rice", "Garlic Rice"],
    drinkOptions: ["Soda (Coke / Sprite / Royal)"],
    hasDessertCup: false,
    hasBottledWater: false,
    courses: {
      beef: 0,
      pork: 0,
      chicken: 1,
      sideRegular: 2,
      sideSpecial: 0,
      dessertRegular: 0,
      dessertSpecial: 0,
      riceOrSoup: 1,
      drinks: 1
    },
    inclusions: [
      "1 Main Dish (Crispy Chicken/Pork Ala King, Curry Fillet, or Sweet & Sour / BBQ)",
      "2 Side Dishes (Baked Penne, Sotanghon, Lumpiang Gulay, or Lumpiang Shanghai)",
      "Plain Rice or Garlic Rice",
      "Soda (Assorted Canned / Bottle)",
      "Food-grade compartmentalized bento box packaging",
      "Individually sealed cutlery pack (spoon, fork, napkin, toothpick)",
      "Minimum order guarantee: 50 PAX"
    ],
    comboOptions: [
      {
        code: "PM2A",
        name: "PM 2 - Option A",
        main: "Crispy Chicken Ala King",
        side: "Baked Penne Pasta",
        side2: "Lumpiang Gulay",
        rice: "Plain Rice or Garlic Rice",
        drinks: "Soda",
        items: ["Crispy Chicken or Pork Ala King", "Baked Penne Pasta", "Lumpiang Gulay", "Plain Rice or Garlic Rice", "Soda"]
      },
      {
        code: "PM2B",
        name: "PM 2 - Option B",
        main: "Chicken Curry",
        side: "Mixed Buttered Vegetables",
        side2: "Lumpiang Shanghai",
        rice: "Plain Rice or Garlic Rice",
        drinks: "Soda",
        items: ["Breaded Chicken or Pork Fillet Curry Sauce", "Sautéed Vegetables", "Lumpiang Shanghai", "Plain Rice or Garlic Rice", "Soda"]
      },
      {
        code: "PM2C",
        name: "PM 2 - Option C",
        main: "Pork BBQ",
        side: "Sotanghon Guisado",
        side2: "Lumpiang Shanghai",
        rice: "Plain Rice or Garlic Rice",
        drinks: "Soda",
        items: ["Sweet & Sour Fish or Pork BBQ w/ Atchara", "Sotanghon Guisado", "Lumpiang Shanghai", "Plain Rice or Garlic Rice", "Soda"]
      }
    ]
  },
  {
    id: "pm_3",
    serviceType: "packed_meal",
    code: "PM 3",
    name: "PM 3 Packed Meal Deluxe (Bento)",
    category: "Packed Meal Deluxe",
    subtitle: "2 Main Dishes, 1 Side Dish, Plain / Garlic / Java Rice, Soda",
    badge: "Deluxe • Min 50 PAX • ₱299",
    popular: true,
    pricePerPax: 299,
    minPax: 50,
    mainDishesCount: 2,
    sideDishes: { regular: 1, special: 0 },
    desserts: { regular: 0, special: 0 },
    riceOptions: ["Plain Rice", "Garlic Rice", "Java Rice"],
    drinkOptions: ["Soda (Coke / Sprite / Royal)"],
    hasDessertCup: false,
    hasBottledWater: false,
    courses: {
      beef: 1,
      pork: 0,
      chicken: 1,
      sideRegular: 1,
      sideSpecial: 0,
      dessertRegular: 0,
      dessertSpecial: 0,
      riceOrSoup: 1,
      drinks: 1
    },
    inclusions: [
      "2 Main Dishes (Beef Stroganoff, Chicken Fillet, Cordon Bleu, BBQ, Fish Fillet)",
      "1 Side Dish (Mashed Potatoes, Sotanghon Guisado, or Pancit Canton)",
      "Plain Rice / Garlic Rice / Java Rice",
      "Soda (Assorted Canned / Bottle)",
      "Deluxe compartmentalized bento box packaging",
      "Individually sealed cutlery pack (spoon, fork, napkin, toothpick)",
      "Minimum order guarantee: 50 PAX"
    ],
    comboOptions: [
      {
        code: "PM3A",
        name: "PM 3 - Option A",
        main: "Beef Stroganoff",
        main2: "Herb Roasted Chicken",
        side: "Creamy Mashed Potatoes in Mushroom Gravy",
        rice: "Plain Rice / Garlic Rice / Java Rice",
        drinks: "Soda",
        items: ["Beef Stroganof", "Chicken Fillet", "Mashed Potatoes", "Plain Rice / Garlic Rice / Java Rice", "Soda"]
      },
      {
        code: "PM3B",
        name: "PM 3 - Option B",
        main: "Pork BBQ",
        main2: "Chicken Cordon Bleu",
        side: "Sotanghon Guisado",
        rice: "Plain Rice / Garlic Rice / Java Rice",
        drinks: "Soda",
        items: ["Pork BBQ", "Chicken Cordon Bleu", "Sotanghon Guisado", "Plain Rice / Garlic Rice / Java Rice", "Soda"]
      },
      {
        code: "PM3C",
        name: "PM 3 - Option C",
        main: "Fish Fillet (Cream Dory) Sweet and Sour",
        main2: "Chicken BBQ",
        side: "Pancit Guisado",
        rice: "Plain Rice / Garlic Rice / Java Rice",
        drinks: "Soda",
        items: ["Sweet and Sour Fish Fillet", "Chicken BBQ", "Pancit Canton Guisado", "Plain Rice / Garlic Rice / Java Rice", "Soda"]
      }
    ]
  },
  {
    id: "pm_4",
    serviceType: "packed_meal",
    code: "PM 4",
    name: "PM 4 Packed Meal Deluxe (Bento)",
    category: "Packed Meal Deluxe",
    subtitle: "1 Main Dish, 2 Side Dishes, 1 Dessert Cup, Plain / Garlic / Java Rice, Soda",
    badge: "Deluxe • Min 50 PAX • ₱250",
    popular: false,
    pricePerPax: 250,
    minPax: 50,
    mainDishesCount: 1,
    sideDishes: { regular: 2, special: 0 },
    desserts: { regular: 1, special: 0 },
    riceOptions: ["Plain Rice", "Garlic Rice", "Java Rice"],
    drinkOptions: ["Soda (Coke / Sprite / Royal)"],
    hasDessertCup: true,
    hasBottledWater: false,
    courses: {
      beef: 1,
      pork: 0,
      chicken: 0,
      sideRegular: 2,
      sideSpecial: 0,
      dessertRegular: 1,
      dessertSpecial: 0,
      riceOrSoup: 1,
      drinks: 1
    },
    inclusions: [
      "1 Main Dish (Beef with Broccoli, Pork/Chicken Estofado, or Beef Bakareta)",
      "2 Side Dishes (Spaghetti/Pesto, Shanghai, Chopsuey, Fish Tofu, or Croquettes)",
      "1 Chilled Dessert Cup (Creamy Fruit Salad, Mango Tapioca, Strawberry Short Cake)",
      "Plain Rice / Garlic Rice / Java Rice",
      "Soda (Assorted Canned / Bottle)",
      "Deluxe compartmentalized bento box packaging",
      "Individually sealed cutlery pack (spoon, fork, napkin, toothpick)",
      "Minimum order guarantee: 50 PAX"
    ],
    comboOptions: [
      {
        code: "PM4A",
        name: "PM 4 - Option A",
        main: "Beef with Broccoli",
        side: "Creamy Spaghetti",
        side2: "Lumpiang Shanghai",
        dessert: "Fruit Salad",
        rice: "Plain Rice / Garlic Rice / Java Rice",
        drinks: "Soda",
        items: ["Beef with Broccoli", "Creamy Spaghetti or Tuna Pesto", "Lumpiang Shanghai", "Creamy Fruit Salad", "Plain Rice / Garlic Rice / Java Rice", "Soda"]
      },
      {
        code: "PM4B",
        name: "PM 4 - Option B",
        main: "Pork Estofado",
        side: "Chopsuey",
        side2: "Fish Tofu",
        dessert: "Mango Tapioca",
        rice: "Plain Rice / Garlic Rice / Java Rice",
        drinks: "Soda",
        items: ["Pork or Chicken Estofado", "Chopsuey", "Fish Tofu", "Mango Tapioca", "Plain Rice / Garlic Rice / Java Rice", "Soda"]
      },
      {
        code: "PM4C",
        name: "PM 4 - Option C",
        main: "Bakareta",
        side: "Sotanghon Guisado",
        side2: "Potato Croquettes",
        dessert: "Strawberry Short Cake",
        rice: "Plain Rice / Garlic Rice / Java Rice",
        drinks: "Soda",
        items: ["Beef Bakareta", "Sotanghon Guisado", "Potato Croquettes", "Strawberry Short Cake", "Plain Rice / Garlic Rice / Java Rice", "Soda"]
      }
    ]
  },
  {
    id: "pm_5",
    serviceType: "packed_meal",
    code: "PM 5",
    name: "PM 5 Packed Meal Premium (Bento)",
    category: "Packed Meal Premium",
    subtitle: "2 Main Dishes, 1 Side Dish, 1 Dessert Cup, Rice, Soda/C2 & Bottled Water",
    badge: "Premium • Min 50 PAX • ₱385",
    popular: true,
    pricePerPax: 385,
    minPax: 50,
    mainDishesCount: 2,
    sideDishes: { regular: 1, special: 0 },
    desserts: { regular: 1, special: 0 },
    riceOptions: ["Plain Rice", "Garlic Rice", "Java Rice"],
    drinkOptions: ["Soda or C2 Green Tea + Bottled Water"],
    hasDessertCup: true,
    hasBottledWater: true,
    courses: {
      beef: 1,
      pork: 0,
      chicken: 1,
      sideRegular: 1,
      sideSpecial: 0,
      dessertRegular: 1,
      dessertSpecial: 0,
      riceOrSoup: 1,
      drinks: 2
    },
    inclusions: [
      "2 Main Dishes (Beef Stroganoff/Teriyaki, Bakareta/Cordon Bleu, Bangus/Tonkatsu)",
      "1 Side Dish (Sautéed Vegetables, Penne Pasta or Tuna Pesto, Fresh Lumpia)",
      "1 Chilled Dessert Cup (Mango Tapioca or Creamy Fruit Salad)",
      "Plain Rice / Garlic Rice / Java Rice",
      "Soda or C2 Green Tea",
      "Bottled Water (Individual 350ml / 500ml)",
      "Premium compartmentalized bento box packaging",
      "Individually sealed cutlery pack (spoon, fork, napkin, toothpick)",
      "Minimum order guarantee: 50 PAX"
    ],
    comboOptions: [
      {
        code: "PM5A",
        name: "PM 5 - Option A",
        main: "Beef Stroganoff",
        main2: "Chicken Teriyaki",
        side: "Mixed Buttered Vegetables",
        dessert: "Mango Tapioca",
        rice: "Plain Rice / Garlic Rice / Java Rice",
        drinks: "Soda or C2 + Bottled Water",
        items: ["Beef Stroganof", "Chicken Teriyaki", "Sautéed Vegetables", "Mango Tapioca", "Plain Rice / Garlic Rice / Java Rice", "Soda or C2", "Bottled Water"]
      },
      {
        code: "PM5B",
        name: "PM 5 - Option B",
        main: "Bakareta",
        main2: "Chicken Cordon Bleu",
        side: "Baked Penne Pasta",
        dessert: "Fruit Salad",
        rice: "Plain Rice / Garlic Rice / Java Rice",
        drinks: "Soda or C2 + Bottled Water",
        items: ["Beef Bakareta", "Chicken Cordon Bleu", "Penne Pasta or Penne Tuna Pesto", "Creamy Fruit Salad", "Plain Rice / Garlic Rice / Java Rice", "Soda or C2", "Bottled Water"]
      },
      {
        code: "PM5C",
        name: "PM 5 - Option C",
        main: "Rellenong Bangus",
        main2: "Pork Tonkatsu",
        side: "Fresh Lumpia",
        dessert: "Fruit Salad",
        rice: "Plain Rice / Garlic Rice / Java Rice",
        drinks: "Soda or C2 + Bottled Water",
        items: ["Rellenong Bangus", "Pork Tonkatsu", "Fresh Lumpia", "Creamy Fruit Salad", "Plain Rice / Garlic Rice / Java Rice", "Soda or C2", "Bottled Water"]
      }
    ]
  },
  {
    id: "pm_6",
    serviceType: "packed_meal",
    code: "PM 6",
    name: "PM 6 Packed Meal Premium (Bento)",
    category: "Packed Meal Premium",
    subtitle: "2 Main Dishes, 2 Side Dishes, 1 Dessert Cup, Rice, Soda/C2 & Bottled Water",
    badge: "Premium • Min 50 PAX • ₱425",
    popular: true,
    pricePerPax: 425,
    minPax: 50,
    mainDishesCount: 2,
    sideDishes: { regular: 2, special: 0 },
    desserts: { regular: 1, special: 0 },
    riceOptions: ["Plain Rice", "Garlic Rice", "Java Rice"],
    drinkOptions: ["Soda or C2 Green Tea + Bottled Water"],
    hasDessertCup: true,
    hasBottledWater: true,
    courses: {
      beef: 1,
      pork: 1,
      chicken: 0,
      sideRegular: 2,
      sideSpecial: 0,
      dessertRegular: 1,
      dessertSpecial: 0,
      riceOrSoup: 1,
      drinks: 2
    },
    inclusions: [
      "2 Main Dishes (Crispy Pork Kare-Kare/BBQ, Bakareta/Cordon Bleu, Hamonado/Chicken Fingers)",
      "2 Side Dishes (Chopsuey, Shanghai, Penne Pasta, Fish Tofu, Meatballs)",
      "1 Chilled Dessert Cup (Mango Tapioca, Strawberry Shortcake, Creamy Fruit Salad)",
      "Plain Rice / Garlic Rice / Java Rice",
      "Soda or C2 Green Tea",
      "Bottled Water (Individual 350ml / 500ml)",
      "Premium luxury compartmentalized bento box packaging",
      "Individually sealed cutlery pack (spoon, fork, napkin, toothpick)",
      "Minimum order guarantee: 50 PAX"
    ],
    comboOptions: [
      {
        code: "PM6A",
        name: "PM 6 - Option A",
        main: "Crispy Pork Karekare",
        main2: "Chicken BBQ",
        side: "Chopsuey",
        side2: "Lumpiang Shanghai",
        dessert: "Mango Tapioca",
        rice: "Plain Rice / Garlic Rice / Java Rice",
        drinks: "Soda or C2 + Bottled Water",
        items: ["Crispy Pork Kare Kare", "Chicken BBQ", "Chopsuey", "Lumpiang Shanghai", "Mango Tapioca", "Plain Rice / Garlic Rice / Java Rice", "Soda or C2", "Bottled Water"]
      },
      {
        code: "PM6B",
        name: "PM 6 - Option B",
        main: "Bakareta",
        main2: "Chicken Cordon Bleu",
        side: "Baked Penne Pasta",
        side2: "Fish Tofu",
        dessert: "Strawberry Short Cake",
        rice: "Plain Rice / Garlic Rice / Java Rice",
        drinks: "Soda or C2 + Bottled Water",
        items: ["Beef Bakareta", "Chicken Cordon Bleu", "Penne Pasta or Penne Tuna Pesto", "Fish Tofu", "Strawberry Shortcake", "Plain Rice / Garlic Rice / Java Rice", "Soda or C2", "Bottled Water"]
      },
      {
        code: "PM6C",
        name: "PM 6 - Option C",
        main: "Pork Hamonado",
        main2: "Chicken Fingers",
        side: "Chopsuey",
        side2: "Meat Balls",
        dessert: "Fruit Salad",
        rice: "Plain Rice / Garlic Rice / Java Rice",
        drinks: "Soda or C2 + Bottled Water",
        items: ["Pork Hamonado", "Chicken Fingers", "Chopsuey", "Meat Balls", "Creamy Fruit Salad", "Plain Rice / Garlic Rice / Java Rice", "Soda or C2", "Bottled Water"]
      }
    ]
  }
];

export const MINI_GRAZING_TABLE_INCLUSIONS = [
  "1 BIG Charcuterie Platter with Salami or Coppa Ham",
  "1 Big Fruit Platter",
  "DIY Nachos with Cheese Sauce Fountain",
  "Canapés: Truffle Egg Bites, Tuna Salad Bites, Chicken Ala King Bites, Hungarian Sausage, Cheese & Olives Skewers",
  "Mini Charcuterie Cups"
];

export const BERMONTHS_PROMO_PACKAGES = [
  {
    id: "promo_bermonths",
    serviceType: "promo",
    code: "PROMO-BER-50",
    name: "Bermonths Promo 50 PAX (Full Catering + Mini Grazing Table)",
    category: "Holiday Promo",
    subtitle: "Full Catering Starts for Only ₱35,000 Good for 50 PAX • Good Food, Brighter Gatherings ♡",
    badge: "🎄 ₱35,000 for 50 PAX",
    popular: true,
    isPromo: true,
    price: 35000,
    pricePerPax: 700,
    minPax: 50,
    maxPax: 50,
    paxRange: "Good for 50 PAX",
    // Customizable promo date range (Flyer: Sept 30 to Dec 31)
    promoStartDate: "2026-09-30",
    promoEndDate: "2026-12-31",
    promoRunsText: "SEPTEMBER 30 - DECEMBER 31",
    promoIsActive: true,
    mainDishesCount: 2,
    sideDishes: { regular: 1, special: 0 },
    desserts: { regular: 1, special: 0 },
    hasSoup: true,
    hasRice: true,
    hasDrink: true,
    hasMiniGrazingTable: true,
    courses: {
      beef: 1,
      pork: 1,
      chicken: 0,
      sideRegular: 1,
      sideSpecial: 0,
      dessertRegular: 1,
      dessertSpecial: 0,
      soup: 1,
      riceOrSoup: 1,
      drinks: 1
    },
    inclusions: [
      "2 Regular Mains (Choice of Beef, Pork, Chicken, or Seafood)",
      "1 Regular Side (Pasta, Noodles, or Vegetable dish)",
      "1 Regular Dessert (Filipino sweet desserts)",
      "Hot Soup (Choice of Cream of Corn, Wild Mushroom, Roasted Pumpkin, Sotanghon Broth)",
      "Steamed Pandan Jasmine Rice",
      "Choice of: Chilled Soda or Fruit Juice",
      "Mini Grazing Table (Charcuterie Platter, Fruit Platter, DIY Nachos w/ Cheese Fountain, Canapés & Mini Cups)",
      "Rustic Buffet Table Set up with warming chafers & styling",
      "Tables and chairs for guests with table skirting, chair cover, simple table center pc, fine dinning set up",
      "Free transportation with in these areas: City of Iloilo, Cabatuan, Sta Barbara, Pavia, San Miguel, Janiuay, Maasin",
      "With friendly uniformed servers/staffs (4hrs full catering service)",
      "Service water",
      "Basic Balloon Backdrop"
    ],
    miniGrazingInclusions: MINI_GRAZING_TABLE_INCLUSIONS
  },
  {
    id: "promo_bermonths_100",
    serviceType: "promo",
    code: "PROMO-BER-100",
    name: "Bermonths Promo 100 PAX (Full Catering + Mini Grazing Table + Whole Lechon)",
    category: "Holiday Promo",
    subtitle: "Full Catering Starts for Only ₱75,000 Good for 100 PAX • Good Food, Brighter Gatherings ♡",
    badge: "🎄 ₱75,000 for 100 PAX • With Lechon",
    popular: true,
    isPromo: true,
    hasLechon: true,
    lechonDetails: "1 Whole Lechon (50kg Live weight)",
    price: 75000,
    pricePerPax: 750,
    minPax: 100,
    maxPax: 100,
    paxRange: "Good for 100 PAX",
    // Customizable promo date range (Flyer: Sept 30 to Dec 31)
    promoStartDate: "2026-09-30",
    promoEndDate: "2026-12-31",
    promoRunsText: "SEPTEMBER 30 - DECEMBER 31",
    promoIsActive: true,
    mainDishesCount: 3,
    sideDishes: { regular: 1, special: 0 },
    desserts: { regular: 1, special: 0 },
    hasSoup: true,
    hasRice: true,
    hasDrink: true,
    hasMiniGrazingTable: true,
    courses: {
      beef: 1,
      pork: 1,
      chicken: 1,
      sideRegular: 1,
      sideSpecial: 0,
      dessertRegular: 1,
      dessertSpecial: 0,
      soup: 1,
      riceOrSoup: 1,
      drinks: 1
    },
    inclusions: [
      "3 Regular Mains (Choice of Beef, Pork, Chicken, or Seafood)",
      "1 Regular Side (Pasta, Noodles, or Vegetable dish)",
      "1 Regular Dessert (Filipino sweet desserts)",
      "Hot Soup (Choice of Cream of Corn, Wild Mushroom, Roasted Pumpkin, Sotanghon Broth)",
      "Steamed Pandan Jasmine Rice",
      "Choice of: Chilled Soda or Fruit Juice",
      "Mini Grazing Table (Charcuterie Platter, Fruit Platter, DIY Nachos w/ Cheese Fountain, Canapés & Mini Cups)",
      "1 Whole Lechon (50kg Live weight)",
      "Buffet table set up with full set of serving utensils and chafing dish",
      "Tables and chairs for guests with table skirting, chair cover, simple table centerpiece, fine dining set up",
      "Free transportation within the following areas: City of Iloilo, Cabatuan, Sta Barbara, Pavia, San Miguel, Janiuay, Maasin",
      "Assorted drinks and ice",
      "With friendly uniformed servers/staffs (4hrs full catering service)",
      "Basic Balloon Backdrop"
    ],
    miniGrazingInclusions: MINI_GRAZING_TABLE_INCLUSIONS
  }
];

export const SOUP_OPTIONS = [
  "Hot Cream of Corn Soup",
  "Cream of Wild Mushroom Soup",
  "Savory Roasted Pumpkin Soup",
  "Egg Drop & Sweet Corn Soup",
  "Clear Chicken Sotanghon Broth"
];

export const CATERING_PACKAGES = [
  ...BUFFET_PACKAGES,
  ...FOOD_TRAY_PACKAGES,
  ...PICA_PICA_PACKAGES,
  ...GRAZING_TABLE_PACKAGES,
  ...PACKED_MEAL_PACKAGES,
  ...BERMONTHS_PROMO_PACKAGES
];

export function getMainDishesCount(pkg) {
  if (!pkg) return 5;
  if (pkg.serviceType === "pica_pica" || pkg.id?.startsWith("pica_pica")) return 0;
  if (pkg.serviceType === "grazing_table" || pkg.id?.startsWith("grazing_")) return 0;
  if (pkg.serviceType === "packed_meal" || pkg.id?.startsWith("pm_") || pkg.id?.startsWith("packed_meal")) return pkg.mainDishesCount || 1;
  if (pkg.serviceType === "promo" || pkg.id?.startsWith("promo_") || pkg.isPromo) return pkg.mainDishesCount || 2;
  // 1. Inclusions take precedence if specified explicitly in the bullet points (e.g. "4 Main Dishes", "5 Regular Main Dish", "3 Regular Main Dish")
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
  // 3. Single dish tray
  if (pkg.id === "food_tray_single_dish" || pkg.isCustomSingleDish) return 1;
  // 4. Food tray packages default to 3
  if (pkg.serviceType === "food_tray" || pkg.id?.startsWith("food_tray")) return 3;

  // 5. Check name or ID
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

  // If Food Tray package:
  if (pkg.serviceType === "food_tray" || pkg.id?.startsWith("food_tray")) {
    const isSingle = pkg.id === "food_tray_single_dish" || pkg.isCustomSingleDish || mainDishesCount === 1;
    return {
      mainDishesCount: mainDishesCount || (isSingle ? 1 : 3),
      regSidesCount: typeof pkg.sideDishes?.regular === "number" ? pkg.sideDishes.regular : (isSingle ? 0 : 2),
      specSidesCount: typeof pkg.sideDishes?.special === "number" ? pkg.sideDishes.special : 0,
      regDessertsCount: typeof pkg.desserts?.regular === "number" ? pkg.desserts.regular : 0,
      specDessertsCount: typeof pkg.desserts?.special === "number" ? pkg.desserts.special : 0
    };
  }

  // If Pica Pica package:
  if (pkg.serviceType === "pica_pica" || pkg.id?.startsWith("pica_pica")) {
    return {
      mainDishesCount: 0,
      regSidesCount: 0,
      specSidesCount: 0,
      regDessertsCount: 0,
      specDessertsCount: 0,
      slidersCount: typeof pkg.picaAllowances?.sliders === "number" ? pkg.picaAllowances.sliders : 2,
      canapesCount: typeof pkg.picaAllowances?.canapes === "number" ? pkg.picaAllowances.canapes : 5,
      fingerFoodCount: typeof pkg.picaAllowances?.fingerFood === "number" ? pkg.picaAllowances.fingerFood : 0,
      miniDessertsCount: typeof pkg.picaAllowances?.miniDesserts === "number" ? pkg.picaAllowances.miniDesserts : 0,
      hasKakanin: Boolean(pkg.picaAllowances?.hasKakanin),
      hasDiyStation: Boolean(pkg.picaAllowances?.hasDiyStation)
    };
  }

  // If Grazing Table package:
  if (pkg.serviceType === "grazing_table" || pkg.id?.startsWith("grazing_")) {
    return {
      mainDishesCount: 0,
      regSidesCount: 0,
      specSidesCount: 0,
      regDessertsCount: 0,
      specDessertsCount: 0,
      canapesCount: typeof pkg.grazingAllowances?.canapes === "number" ? pkg.grazingAllowances.canapes : 5,
      slidersCount: typeof pkg.grazingAllowances?.sliders === "number" ? pkg.grazingAllowances.sliders : 4,
      hasDessertShots: Boolean(pkg.grazingAllowances?.hasDessertShots)
    };
  }

  // If Packed Meal / Bento package:
  if (pkg.serviceType === "packed_meal" || pkg.id?.startsWith("pm_") || pkg.id?.startsWith("packed_meal")) {
    return {
      mainDishesCount: typeof pkg.mainDishesCount === "number" ? pkg.mainDishesCount : (mainDishesCount || 1),
      regSidesCount: typeof pkg.sideDishes?.regular === "number" ? pkg.sideDishes.regular : 1,
      specSidesCount: typeof pkg.sideDishes?.special === "number" ? pkg.sideDishes.special : 0,
      regDessertsCount: typeof pkg.desserts?.regular === "number" ? pkg.desserts.regular : 0,
      specDessertsCount: 0,
      hasDessertCup: Boolean(pkg.hasDessertCup),
      hasBottledWater: Boolean(pkg.hasBottledWater)
    };
  }

  // If Bermonths Promo / Holiday Promo package:
  if (pkg.serviceType === "promo" || pkg.id?.startsWith("promo_") || pkg.isPromo) {
    return {
      mainDishesCount: typeof pkg.mainDishesCount === "number" ? pkg.mainDishesCount : (pkg.name?.includes("100") ? 3 : 2),
      regSidesCount: typeof pkg.sideDishes?.regular === "number" ? pkg.sideDishes.regular : 1,
      specSidesCount: typeof pkg.sideDishes?.special === "number" ? pkg.sideDishes.special : 0,
      regDessertsCount: typeof pkg.desserts?.regular === "number" ? pkg.desserts.regular : 1,
      specDessertsCount: 0,
      hasSoup: true,
      hasRice: true,
      hasDrink: true,
      hasMiniGrazingTable: true,
      hasLechon: Boolean(pkg.hasLechon)
    };
  }

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
  if (dish.category === "sliders" || dish.category === "canapes" || dish.id?.startsWith("sld_spec") || dish.id?.startsWith("cnp_spec")) return 45;
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
    { id: "sd_reg_15", name: "Tuna Macaroni Salad", tier: "regular", description: "Chilled elbow macaroni tossed with tuna flakes, relish, sweet carrots and light mayonnaise" },
    { id: "sd_reg_16", name: "Lumpiang Gulay", tier: "regular", description: "Crispy fried vegetable spring roll filled with bean sprouts, carrots and tofu" },
    { id: "sd_reg_17", name: "Penne Pasta or Penne Tuna Pesto", tier: "regular", description: "Al dente penne pasta tossed in rich basil herb garlic pesto and flaked tuna" },
    { id: "sd_reg_18", name: "Fish Tofu", tier: "regular", description: "Savory golden fish tofu cubes sautéed with bell peppers and mild sweet glaze" },
    { id: "sd_reg_19", name: "Potato Croquettes", tier: "regular", description: "Crispy golden fried mashed potato croquettes with melted savory cheese center" },
    { id: "sd_reg_20", name: "Meat Balls", tier: "regular", description: "Juicy seasoned pork-beef meatballs glazed in rich savory sauce" },
    { id: "sd_reg_21", name: "Chicken Fingers", tier: "regular", description: "Crispy panko-breaded golden chicken breast tenderloin fingers with dip" },
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
    { id: "dr4", name: "Cucumber Mint Infused Iced Drink", tier: "regular", description: "Crisp cucumber essence with light citrus and chilled mineral water" },
    { id: "dr5", name: "Soda (Coke)", tier: "regular", description: "Ice-cold Coca-Cola Soda (Bottomless)" },
    { id: "dr6", name: "Soda (Coke / Sprite / Royal)", tier: "regular", description: "Individual canned / bottled soda (Choice of Coke, Sprite, or Royal)" },
    { id: "dr7", name: "Soda or C2 Green Tea", tier: "regular", description: "Choice of chilled canned soda or C2 Green Tea (Apple / Lemon)" },
    { id: "dr8", name: "Bottled Water", tier: "regular", description: "Purified sealed bottled mineral water (350ml / 500ml)" }
  ],
  sliders: [
    // REGULAR CHOICES
    { id: "sld_reg_1", name: "Mini Crispy Chicken Sandwich", tier: "regular", description: "Crispy fried chicken cutlet in toasted mini brioche bun with honey mustard slaw" },
    { id: "sld_reg_2", name: "Mini BLT or Mini Cheese Burger", tier: "regular", description: "Juicy beef patty with melted cheddar, crisp lettuce, tomato, or bacon" },
    { id: "sld_reg_3", name: "Mini Ham and Cheese Slider", tier: "regular", description: "Savory ham and melting cheddar layered in buttered mini soft roll" },
    { id: "sld_reg_4", name: "Mini Cheesy Chicken Pesto", tier: "regular", description: "Shredded chicken tossed in fresh basil pesto and melted mozzarella" },
    { id: "sld_reg_5", name: "Mini Honey Glazed Chicken Sandwich", tier: "regular", description: "Sweet and savory honey glazed chicken breast in soft slider bun" },
    { id: "sld_reg_6", name: "Mini Club House Sandwich", tier: "regular", description: "Triple-decker finger sandwich with chicken, egg, ham, lettuce and cheese" },
    { id: "sld_reg_7", name: "Mini Tuna Salad Sandwich", tier: "regular", description: "Creamy flaked tuna spread with celery, pickles and light mayo" },
    { id: "sld_reg_8", name: "Mini Hawaiian Chicken Sandwich", tier: "regular", description: "Grilled teriyaki chicken fillet with caramelized pineapple ring" },
    { id: "sld_reg_9", name: "Mini Hawaiian Sandwich", tier: "regular", description: "Sweet cured ham with grilled pineapple slice and melted cheese" },
    { id: "sld_reg_10", name: "Mini Ham and Egg Sandwich", tier: "regular", description: "Classic breakfast slider with savory ham slice and fluffy egg omelet" },
    // SPECIAL CHOICES
    { id: "sld_spec_1", name: "Sour Dough Pastrami Sandwich", tier: "special", premium: true, upgradePrice: 45, description: "Peppered beef pastrami on artisan sourdough with dijon aioli" },
    { id: "sld_spec_2", name: "Turkey Sandwich", tier: "special", premium: true, upgradePrice: 45, description: "Roasted turkey breast with cranberry-apple spread and swiss cheese" },
    { id: "sld_spec_3", name: "Coppa Ham and Colby Jack Sandwich", tier: "special", premium: true, upgradePrice: 45, description: "Cured Italian coppa with marbled colby jack cheese on mini baguette" },
    { id: "sld_spec_4", name: "Pastrami, Jalapeño with Garlic Cream Cheese Sandwich", tier: "special", premium: true, upgradePrice: 45, description: "Spiced beef pastrami with pickled jalapeños and whipped garlic cream cheese" },
    { id: "sld_spec_5", name: "Glazed Bacon in Mango Salsa", tier: "special", premium: true, upgradePrice: 45, description: "Candied thick-cut bacon slider topped with zesty fresh mango salsa" },
    { id: "sld_spec_6", name: "Mortadela Pesto Sandwich", tier: "special", premium: true, upgradePrice: 45, description: "Thinly shaved Italian mortadella with pistachio pesto and provolone" },
    { id: "sld_spec_7", name: "Salami and Garlic Cream Cheese", tier: "special", premium: true, upgradePrice: 45, description: "Genoa salami slices paired with roasted garlic cream cheese spread" },
    { id: "sld_spec_8", name: "Bagel Breakfast Slider", tier: "special", premium: true, upgradePrice: 45, description: "Mini toasted bagel with cream cheese, savory sausage patty and egg" }
  ],
  canapes: [
    // REGULAR CHOICES
    { id: "cnp_reg_1", name: "Tuna Quinoa Salad", tier: "regular", description: "Protein-rich quinoa tossed with flaked tuna, diced peppers and lemon dressing on cucumber rounds" },
    { id: "cnp_reg_2", name: "Mini Olives, Hungarian Sausage and Cheese Skewers", tier: "regular", description: "Savory bite skewer with pitted olives, spiced Hungarian sausage and cheddar cubes" },
    { id: "cnp_reg_3", name: "Garlic Bread in Mango Salsa Dip", tier: "regular", description: "Toasted crunchy garlic crostini topped with vibrant Guimaras mango salsa" },
    { id: "cnp_reg_4", name: "Crab Cakes with Garlic Cream Cheese", tier: "regular", description: "Golden pan-seared mini crab cakes piped with rich garlic cream cheese" },
    { id: "cnp_reg_5", name: "Chicken Ala King Bites", tier: "regular", description: "Flaky pastry bites filled with creamy chicken, bell peppers and peas" },
    { id: "cnp_reg_6", name: "Chili Con Carne Bites", tier: "regular", description: "Crisp tortilla cups loaded with spiced beef chili, kidney beans and cheese" },
    { id: "cnp_reg_7", name: "Tuna Salad Bites", tier: "regular", description: "Savory mini pastry shells with zesty herbed tuna salad" },
    { id: "cnp_reg_8", name: "Jalapeño Devils Egg", tier: "regular", description: "Hard-boiled egg stuffed with creamy spiced yolk and jalapeño crown" },
    { id: "cnp_reg_9", name: "Potato Croquettes", tier: "regular", description: "Crispy fried mashed potato bites with melting cheese center" },
    { id: "cnp_reg_10", name: "Pita Bread with Hummus Dip", tier: "regular", description: "Toasted pita wedges served with velvety chickpea tahini hummus" },
    { id: "cnp_reg_11", name: "Crab Alegue and Quinoa Salad", tier: "regular", description: "Quinoa infused with rich crab fat aligue and calamansi zest" },
    { id: "cnp_reg_12", name: "Chorizo Salad Bites", tier: "regular", description: "Savory Spanish chorizo rounds over seasonal microgreens on crostini" },
    // SPECIAL CHOICES
    { id: "cnp_spec_1", name: "Garlic Stick Wrapped in Prosciutto with Creamy Dip", tier: "special", premium: true, upgradePrice: 45, description: "Crispy garlic grissini wrapped in cured Italian prosciutto with truffle cream dip" },
    { id: "cnp_spec_2", name: "Shrimp Cocktail", tier: "special", premium: true, upgradePrice: 45, description: "Chilled poached jumbo prawn served in shot glass with tangy cocktail sauce" },
    { id: "cnp_spec_3", name: "Poached Eggs with Asparagus and Hollandaise", tier: "special", premium: true, upgradePrice: 45, description: "Delicate quail egg with blanched asparagus tip and rich buttery hollandaise" },
    { id: "cnp_spec_4", name: "Quiche", tier: "special", premium: true, upgradePrice: 45, description: "French Lorraine-style mini quiche tartlet with bacon, caramelized onions and gruyère" },
    { id: "cnp_spec_5", name: "Baked Chicken Puff Pastry", tier: "special", premium: true, upgradePrice: 45, description: "Buttery golden puff pastry parcel filled with creamy tarragon chicken" },
    { id: "cnp_spec_6", name: "Whipped Beetroot and Feta Dip with Sour Dough Crackers", tier: "special", premium: true, upgradePrice: 45, description: "Vibrant pink whipped beet and greek feta spread on artisan sourdough crisps" },
    { id: "cnp_spec_7", name: "Roasted Chick Peas, Coppa Ham and Cream Cheese Bites", tier: "special", premium: true, upgradePrice: 45, description: "Crispy spiced chickpeas, cured coppa ham and cream cheese quenelle" },
    { id: "cnp_spec_8", name: "Mini Greek Salad Cups", tier: "special", premium: true, upgradePrice: 45, description: "Crisp cucumber, kalamata olives, cherry tomato and feta cheese cup" },
    { id: "cnp_spec_9", name: "Mini Caesar Salad Cups", tier: "special", premium: true, upgradePrice: 45, description: "Romaine ribbons tossed in parmesan caesar dressing with bacon bits & crouton" },
    { id: "cnp_spec_10", name: "Mini Chicken and Mango Salsa Salad Cups", tier: "special", premium: true, upgradePrice: 45, description: "Grilled chicken strips over fresh mango salsa in cocktail bite cup" }
  ],
  fingerFood: [
    { id: "ff_1", name: "Chicken Fingers with Dip", tier: "regular", description: "Tender golden breaded chicken breast strips with honey mustard or garlic mayo" },
    { id: "ff_2", name: "Cheese Sticks in Marinara Sauce", tier: "regular", description: "Crispy mozzarella and cheddar lumpia rolls with rich Italian marinara dip" },
    { id: "ff_3", name: "Nacho Cups", tier: "regular", description: "Crunchy corn tortilla chips with warm melted cheese, salsa and ground beef" },
    { id: "ff_4", name: "Jalapeño Cheese Egg Roll", tier: "regular", description: "Crispy fried spring roll stuffed with cream cheese and spicy jalapeño" },
    { id: "ff_5", name: "Dynamite", tier: "regular", description: "Classic Pinoy green finger chili stuffed with savory cheese in golden crisp wrapper" },
    { id: "ff_6", name: "Chicken Lollipop", tier: "regular", description: "Crispy French-trimmed chicken drumettes seasoned with herbs and sweet chili dip" },
    { id: "ff_7", name: "Potato Wedges", tier: "regular", description: "Seasoned crispy skin-on potato wedges dusted with smoked paprika and garlic" },
    { id: "ff_8", name: "Sweet Potato Wedges", tier: "regular", description: "Oven-roasted caramelized orange sweet potato wedges with spiced sour cream dip" },
    { id: "ff_9", name: "Ham and Cheese Rolls", tier: "regular", description: "Golden toasted finger bread rolls filled with sweet cured ham and melting cheddar" }
  ],
  miniDesserts: [
    { id: "md_1", name: "Mixed Seasonal Fruit Cups", tier: "regular", description: "Refreshing medley of freshly diced watermelon, melon, grapes and pineapple in shot cup" },
    { id: "md_2", name: "Mango Tapioca", tier: "regular", description: "Sweet ripe Guimaras mangoes with chewy sago pearls in rich chilled cream" },
    { id: "md_3", name: "Coffee Jelly", tier: "regular", description: "Espresso jelly cubes in sweet condensed milk cream and cocoa dusting" },
    { id: "md_4", name: "Strawberry Short Cake", tier: "regular", description: "Mini sponge cake shooter layered with Baguio strawberry compote and whipped cream" },
    { id: "md_5", name: "Blueberry Cheese Cake", tier: "regular", description: "Rich cream cheese mousse topped with tart sweet wild blueberry coulis" },
    { id: "md_6", name: "Mango Cheese Cake", tier: "regular", description: "Velvety cheesecake cup topped with sweet fresh Guimaras mango puree" },
    { id: "md_7", name: "Strawberry Cheese Cake", tier: "regular", description: "Individual cheesecake cup with crushed graham base and strawberry glaze" },
    { id: "md_8", name: "Biscoff Parfaits", tier: "regular", description: "Layered Lotus Biscoff biscuit crumbs, spiced speculoos cream and caramel drizzle" },
    { id: "md_9", name: "Churros Dip Shots", tier: "regular", description: "Cinnamon sugar dusted mini churro stick dipped in warm Belgian dark chocolate shot" },
    { id: "md_10", name: "Oreo Cheese Cake", tier: "regular", description: "Cookies and cream cheesecake shooter topped with crunchy Oreo cookie crumbles" }
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
  { 
    id: "iloilo_free", 
    name: "Iloilo Free Delivery Zone (₱0)", 
    fee: 0, 
    description: "FREE: Iloilo City, Pavia, Sta. Barbara, Cabatuan, Maasin, San Miguel, Janiuay" 
  },
  { 
    id: "iloilo_other", 
    name: "Other Iloilo Municipalities (₱600)", 
    fee: 600, 
    description: "Pototan, Alimodian, Leon, Leganes, Zarraga, Oton, Tigbauan, Barotac Nuevo, Dingle, etc." 
  },
  { 
    id: "panay_regional", 
    name: "Panay Regional / Out-of-Town (₱1,500)", 
    fee: 1500, 
    description: "Passi City, Guimaras, Antique, Capiz" 
  },
  { 
    id: "ncr", 
    name: "Metro Manila / Luzon (NCR) (₱1,500)", 
    fee: 1500, 
    description: "Quezon City, Manila, Makati, Taguig, Pasig, Mandaluyong, etc." 
  },
  { 
    id: "custom", 
    name: "Custom Delivery Distance (Custom Quote)", 
    fee: 0, 
    description: "Deliveries outside specified zones (Custom quote based on distance)" 
  }
];

export const EVENT_TYPES = [
  { id: "government_conference", name: "Government / Multi-Day Conference (AM/PM Snacks + Lunch + Dinner)" },
  { id: "corporate", name: "Corporate Event / Seminar / Gala" },
  { id: "wedding", name: "Kasal (Wedding Reception)" },
  { id: "debut", name: "18th Birthday Debut" },
  { id: "birthday", name: "Birthday Party / Milestone Celebration" },
  { id: "binyag", name: "Binyag (Christening / Baptism)" },
  { id: "reunion", name: "Grand Family Reunion / Fiesta" },
  { id: "anniversary", name: "Wedding Anniversary" },
  { id: "funeral", name: "Pamisa / Memorial Gathering" }
];

export const CONFERENCE_MEAL_RATES = {
  amSnack: 120, // Sandwich + Drink
  lunchPackage1: 480, // Package 1 (3 Mains, 1 Side, Rice, Dessert, Drink)
  pmSnack: 140, // Pasta + Drink
  dinnerPackage2: 550, // Package 2 (4 Mains, 1 Side, Rice, Dessert, Drink)
  dailyTotal: 1290 // 120 + 480 + 140 + 550
};

export const CONFERENCE_SNACK_OPTIONS = {
  sandwiches: [
    "Clubhouse Sandwich with Potato Crisps",
    "Chicken Salad Croissant Sandwich",
    "Cheesy Ham & Egg Brioche Sandwich",
    "Tuna Melt Toast with Herb Mayo",
    "Special Beef Burger with Cheese"
  ],
  pastas: [
    "Creamy Carbonara with Garlic Toast",
    "Creamy Spaghetti Bolognese",
    "Special Bam-i Guisado with Garlic Bread",
    "Classic Baked Macaroni with Bechamel",
    "Pancit Canton Special with Toppings"
  ],
  drinks: [
    "Fresh Calamansi Citrus Cooler",
    "Bottomless Signature Red Iced Tea",
    "Blue Lemonade Refresher with Mint",
    "Cucumber Mint Infused Iced Drink",
    "Soda (Coke)",
    "Freshly Brewed Hot Coffee / Tea"
  ]
};

