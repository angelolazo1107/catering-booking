// Philippine Catering Standard Culinary Yield Formulas (Per Pax)
// Formulated for banquets, buffet line shrinkage, and prep planning

export const INGREDIENT_MARKET_PRICES = {
  beef_sirloin: { name: "Beef Sirloin / Shank", unit: "kg", pricePerUnit: 440, category: "Meat" },
  pork_belly: { name: "Pork Belly (Liempo Roll)", unit: "kg", pricePerUnit: 360, category: "Meat" },
  pork_shoulder: { name: "Pork Shoulder (Kasim)", unit: "kg", pricePerUnit: 320, category: "Meat" },
  chicken_whole: { name: "Bone-in Chicken Cuts", unit: "kg", pricePerUnit: 220, category: "Poultry" },
  chicken_fillet: { name: "Chicken Breast Fillet", unit: "kg", pricePerUnit: 260, category: "Poultry" },
  salmon_fillet: { name: "Norwegian Salmon Fillet", unit: "kg", pricePerUnit: 780, category: "Seafood" },
  dory_fillet: { name: "White Fish Fillet (Dory/Snapper)", unit: "kg", pricePerUnit: 240, category: "Seafood" },
  tiger_prawns: { name: "Fresh Tiger Prawns", unit: "kg", pricePerUnit: 580, category: "Seafood" },
  jasmine_rice: { name: "Premium Jasmine Rice (50kg/sack)", unit: "kg", pricePerUnit: 56, category: "Dry Goods" },
  glass_noodles: { name: "Sotanghon Vermicelli", unit: "kg", pricePerUnit: 180, category: "Dry Goods" },
  egg_noodles: { name: "Pancit Canton Noodles", unit: "kg", pricePerUnit: 140, category: "Dry Goods" },
  vegetables_mixed: { name: "Highland Mixed Veggies", unit: "kg", pricePerUnit: 110, category: "Produce" },
  potatoes_carrots: { name: "Potatoes & Carrots", unit: "kg", pricePerUnit: 95, category: "Produce" },
  garlic_onions: { name: "Garlic, Onions & Aromatics", unit: "kg", pricePerUnit: 130, category: "Produce" },
  coconut_cream: { name: "Fresh / Canned Coconut Cream", unit: "L", pricePerUnit: 120, category: "Dairy & Oils" },
  evap_condensed: { name: "Evaporated & Condensed Milk", unit: "can", pricePerUnit: 52, category: "Dairy & Oils" },
  butter_dairy: { name: "Pure Dairy Butter", unit: "kg", pricePerUnit: 380, category: "Dairy & Oils" },
  eggs_tray: { name: "Fresh Farm Eggs (30 pcs/tray)", unit: "tray", pricePerUnit: 240, category: "Dairy & Oils" },
  iced_tea_mix: { name: "Signature Iced Tea Powder Mix", unit: "pack", pricePerUnit: 150, category: "Beverage" }
};

// Dish to ingredients mapping (grams or units required per pax)
export const DISH_RECIPE_BOM = {
  // Beef
  "Special Beef Caldereta with Queso": [
    { key: "beef_sirloin", gramsPerPax: 125 },
    { key: "potatoes_carrots", gramsPerPax: 40 },
    { key: "garlic_onions", gramsPerPax: 20 },
    { key: "butter_dairy", gramsPerPax: 10 }
  ],
  "Slow-Braised USDA Angus Beef Shank in Burgundy Wine": [
    { key: "beef_sirloin", gramsPerPax: 140 },
    { key: "potatoes_carrots", gramsPerPax: 35 },
    { key: "garlic_onions", gramsPerPax: 25 },
    { key: "butter_dairy", gramsPerPax: 15 }
  ],
  "Classic Beef Kare-Kare with Bagoong Alamang": [
    { key: "beef_sirloin", gramsPerPax: 130 },
    { key: "vegetables_mixed", gramsPerPax: 50 },
    { key: "garlic_onions", gramsPerPax: 20 }
  ],
  "Slow-Roasted Beef with Mushroom Brown Gravy": [
    { key: "beef_sirloin", gramsPerPax: 135 },
    { key: "potatoes_carrots", gramsPerPax: 30 },
    { key: "butter_dairy", gramsPerPax: 15 }
  ],

  // Pork
  "Crispy Roasted Lechon Belly Roll": [
    { key: "pork_belly", gramsPerPax: 160 },
    { key: "garlic_onions", gramsPerPax: 25 }
  ],
  "Pork Hamonado Especial": [
    { key: "pork_shoulder", gramsPerPax: 135 },
    { key: "garlic_onions", gramsPerPax: 15 }
  ],
  "Lumpiang Shanghai with Sweet Chili Sauce": [
    { key: "pork_shoulder", gramsPerPax: 80 },
    { key: "potatoes_carrots", gramsPerPax: 25 },
    { key: "garlic_onions", gramsPerPax: 15 }
  ],

  // Chicken
  "Authentic Bacolod Chicken Inasal": [
    { key: "chicken_whole", gramsPerPax: 180 },
    { key: "garlic_onions", gramsPerPax: 25 }
  ],
  "Creamy Chicken Pastel with Sausages": [
    { key: "chicken_fillet", gramsPerPax: 110 },
    { key: "potatoes_carrots", gramsPerPax: 40 },
    { key: "butter_dairy", gramsPerPax: 12 }
  ],
  "Chicken Cordon Bleu with White Garlic Dip": [
    { key: "chicken_fillet", gramsPerPax: 130 },
    { key: "butter_dairy", gramsPerPax: 15 }
  ],

  // Fish & Seafood
  "Baked Norwegian Salmon with Lemon-Dill Cream": [
    { key: "salmon_fillet", gramsPerPax: 120 },
    { key: "butter_dairy", gramsPerPax: 20 },
    { key: "garlic_onions", gramsPerPax: 10 }
  ],
  "Pan-Seared Fish Fillet in Garlic Lemon Butter": [
    { key: "dory_fillet", gramsPerPax: 125 },
    { key: "butter_dairy", gramsPerPax: 20 },
    { key: "garlic_onions", gramsPerPax: 15 }
  ],
  "Buttered Garlic Shrimp with Chili Flakes": [
    { key: "tiger_prawns", gramsPerPax: 110 },
    { key: "butter_dairy", gramsPerPax: 25 },
    { key: "garlic_onions", gramsPerPax: 20 }
  ],

  // Noodles & Veg
  "Special Pancit Sotanghon Guisado": [
    { key: "glass_noodles", gramsPerPax: 35 },
    { key: "chicken_fillet", gramsPerPax: 25 },
    { key: "vegetables_mixed", gramsPerPax: 35 }
  ],
  "Truffle Cream Pancit Sotanghon with Shiitake": [
    { key: "glass_noodles", gramsPerPax: 35 },
    { key: "butter_dairy", gramsPerPax: 15 },
    { key: "vegetables_mixed", gramsPerPax: 25 }
  ],
  "Pancit Canton Especial with Bagnet Topping": [
    { key: "egg_noodles", gramsPerPax: 40 },
    { key: "pork_belly", gramsPerPax: 30 },
    { key: "vegetables_mixed", gramsPerPax: 40 }
  ],

  // Rice
  "Steamed Pandan Jasmine Rice": [
    { key: "jasmine_rice", gramsPerPax: 80 }
  ],
  "Golden Garlic Fried Rice": [
    { key: "jasmine_rice", gramsPerPax: 85 },
    { key: "garlic_onions", gramsPerPax: 15 }
  ],

  // Desserts
  "Authentic Buko Pandan Cream Salad": [
    { key: "coconut_cream", gramsPerPax: 35 },
    { key: "evap_condensed", unitsPerPax: 0.05 }
  ],
  "Special Creamy Leche Flan (Pinoy Creme Caramel)": [
    { key: "eggs_tray", unitsPerPax: 0.05 },
    { key: "evap_condensed", unitsPerPax: 0.06 }
  ],
  "Mango Tapioca Melody": [
    { key: "coconut_cream", gramsPerPax: 30 },
    { key: "evap_condensed", unitsPerPax: 0.04 }
  ],

  // Drinks
  "Bottomless Signature Red Iced Tea": [
    { key: "iced_tea_mix", unitsPerPax: 0.02 }
  ],
  "Fresh Calamansi & Dalandan Citrus Cooler": [
    { key: "iced_tea_mix", unitsPerPax: 0.02 }
  ]
};

// Compute total grocery list based on Pax and list of selected dishes
export function calculateKitchenGroceryBOM(dishesList = [], pax = 100) {
  const totals = {};

  dishesList.forEach(dishName => {
    const formulas = DISH_RECIPE_BOM[dishName];
    if (formulas) {
      formulas.forEach(item => {
        const meta = INGREDIENT_MARKET_PRICES[item.key] || { name: item.key, unit: "kg", pricePerUnit: 100, category: "Other" };
        
        if (!totals[item.key]) {
          totals[item.key] = {
            key: item.key,
            name: meta.name,
            unit: meta.unit,
            category: meta.category,
            pricePerUnit: meta.pricePerUnit,
            quantity: 0
          };
        }

        if (item.gramsPerPax) {
          // convert grams to kg
          totals[item.key].quantity += (item.gramsPerPax * pax) / 1000;
        } else if (item.unitsPerPax) {
          totals[item.key].quantity += item.unitsPerPax * pax;
        }
      });
    }
  });

  // Convert to array and round values
  const result = Object.values(totals).map(item => {
    let roundedQty = Math.ceil(item.quantity * 10) / 10;
    if (item.unit === "sack") roundedQty = Math.ceil(item.quantity);
    const estimatedCost = Math.round(roundedQty * item.pricePerUnit);

    return {
      ...item,
      quantity: roundedQty,
      estimatedCost
    };
  });

  // Calculate total raw ingredient cost
  const totalCost = result.reduce((sum, item) => sum + item.estimatedCost, 0);

  return {
    items: result,
    totalRawFoodCost: totalCost,
    pax
  };
}
