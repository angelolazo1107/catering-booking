export const PHILIPPINE_BANKS = [
  { id: "pnb", name: "Philippine National Bank (PNB)", code: "PNB", isDefault: true },
  { id: "bdo", name: "BDO Unibank (Banco de Oro)", code: "BDO" },
  { id: "bpi", name: "Bank of the Philippine Islands (BPI)", code: "BPI" },
  { id: "metrobank", name: "Metropolitan Bank and Trust Company (Metrobank)", code: "MBTC" },
  { id: "landbank", name: "Land Bank of the Philippines", code: "LANDBANK" },
  { id: "unionbank", name: "Union Bank of the Philippines", code: "UBP" },
  { id: "securitybank", name: "Security Bank Corporation", code: "SECB" },
  { id: "rcbc", name: "Rizal Commercial Banking Corporation (RCBC)", code: "RCBC" },
  { id: "chinabank", name: "China Banking Corporation", code: "CHIB" },
  { id: "eastwest", name: "EastWest Banking Corporation", code: "EWBC" },
  { id: "dbp", name: "Development Bank of the Philippines (DBP)", code: "DBP" },
  { id: "aub", name: "Asia United Bank (AUB)", code: "AUB" },
  { id: "bankcom", name: "Bank of Commerce", code: "BNCOM" },
  { id: "pbcom", name: "Philippine Bank of Communications (PBCOM)", code: "PBCOM" },
  { id: "psbank", name: "Philippine Savings Bank (PSBank)", code: "PSB" },
  { id: "maya_bank", name: "Maya Bank", code: "MAYA" },
  { id: "seabank", name: "SeaBank Philippines", code: "SEABANK" },
  { id: "gotyme", name: "GoTyme Bank", code: "GOTYME" }
];

export const DEFAULT_TERMS_AND_CONDITIONS = [
  "Minimum number of Pax per booking:\n* **50 PAX- FULL COURSE MEAL BUFFET SET UP**",
  "Maximum of **4 Hours service**. An additional of **PHP 500.00 per hour** for catering equipment and **PHP 50.00 per hour per staff** for the time extention . Time booked upon contract signing is strictly followed.",
  "We allow our items/equipment for overnight given that client shall be the one to wash, polish, complete all equipment/item/utensils and deliver to Palatable commissary at Brgy.Gaub, Cabatuan, Iloilo **or an additional transportation** fee for next day pick up shall apply and be paid on the day of the event.",
  "Inventory form for Equipements will be presented and signed by our clients. Missing or damaged items on the venue shall be billed to our client.",
  "Client must contact Palatable **Two (2) weeks** prior to event to finalize all details of your event and set remaining concerns. Palatable is not liable for any other concerns did not relay 2 weeks prior to event.",
  "Kindly mention all allergies/food sensitivities during booking so our kitchen staff can adjust the menu of your choice. **Palatable is not liable to any allergy attacks on the event day.**",
  "Food on your end are not allowed on our buffet table, you may provide or add an additional table set up fee for us to accommodate food from your end. **NOTE: food on your end shall be on a separate buffet table and can be endorsed to our staff to be served.**"
];

export const DEFAULT_PACKAGE_INCLUSIONS = [
  "**SERVERS/FOOD ATTENDANT** will be provided on your booking. Number of servers/food attendant will depend on the number of pax booked.",
  "**Free Rustic theme Buffet set up** for every booking. 10% Charge of the whole total bill for theme of choice.",
  "You can choose any color of fabrics used for table cover, Palatable is more on with earth tone fabrics.",
  "**Free transportation within the city for ₱ 25,000.00 up bookings.** Transportation fee of **PHP 60.00/km back and forth** will be charged for out-of-town bookings; fee will be based depending on the distance of the venue from our commissary. **Free tables and chairs** for guests with skirting and seat cover for full course meal buffet bookings **₱30,000.00 up**. **Free Cocktail tables** on grazing, mobile bar set up and snack bar for bookings **₱ 30,000.00 up**.",
  "**Utensils (plate, spoon and fork,saucer,bowl and regular glass)** will be provided for full course meal booking.",
  "For grazing table bookings saucer and fork will be provided. However, if client considers other catering services or venues will be on hotels,etc Palatable will only provide disposable plates and cutlery to avoid damages and mixing of equipments with other caterers."
];

export const DEFAULT_COMPANIES = [
  {
    id: "main_catering",
    name: "PLATABLE CATERING SERVICES",
    tagline: "Premier Philippine Catering & Events Management",
    tin: "",
    phone: "+63 917 000 0000",
    email: "inquiries@platablecatering.ph",
    website: "www.platablecatering.ph",
    address: "Brgy. Gaub, Cabatuan, Iloilo",
    themeColor: "#d97706",
    adminPasscode: "cater2026",
    bankDetails: {
      gcash: { name: "Platable Catering Services", number: "+63 917 000 0000" },
      selectedBank: "pnb",
      bankName: "Philippine National Bank (PNB)",
      accountName: "Platable Catering Services",
      accountNumber: "1234-5678-9012",
      branch: "Main Corporate Branch",
      accountType: "Corporate Current / Savings Account",
      acceptCardAtStore: true,
      cardPaymentNotes: "Credit & Debit Cards (Visa, Mastercard, BancNet, JCB) accepted via physical POS terminal at store address.",
      bdo: { accountName: "Platable Catering Services", accountNumber: "" },
      bpi: { accountName: "Platable Catering Services", accountNumber: "" }
    },
    operationalSettings: {
      maxPaxPerDay: 500,
      maxEventsPerDay: 3,
      defaultServiceCharge: 10,
      vatEnabledByDefault: false,
      waiterWagePerEvent: 800,
      captainWagePerEvent: 1200
    },
    termsAndConditions: [...DEFAULT_TERMS_AND_CONDITIONS],
    packageInclusions: [...DEFAULT_PACKAGE_INCLUSIONS]
  }
];

export const STORAGE_KEY_ACTIVE_COMPANY = "caterflow_active_company_id";
export const STORAGE_KEY_COMPANIES = "caterflow_companies_list";

export function getStoredCompanies() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_COMPANIES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Strip out legacy mock companies & automatically update any stale "My Catering Services PH"
        let modified = false;
        let cleaned = parsed.filter(c => c.id !== "hapag_kalinga" && c.id !== "fiesta_deluxe");
        cleaned = cleaned.map(c => {
          let updated = { ...c };
          if (c.name === "My Catering Services PH" || !c.name) {
            modified = true;
            updated.name = "PLATABLE CATERING SERVICES";
            updated.tagline = c.tagline || "Premier Philippine Catering & Events Management";
          }
          if (!updated.bankDetails?.selectedBank) {
            modified = true;
            updated.bankDetails = {
              ...(updated.bankDetails || {}),
              selectedBank: "pnb",
              bankName: "Philippine National Bank (PNB)",
              accountName: updated.bankDetails?.pnb?.accountName || updated.bankDetails?.bdo?.accountName || updated.name || "Platable Catering Services",
              accountNumber: updated.bankDetails?.pnb?.accountNumber || updated.bankDetails?.bdo?.accountNumber || "1234-5678-9012",
              branch: "Main Corporate Branch",
              acceptCardAtStore: true,
              cardPaymentNotes: "Credit & Debit Cards (Visa, Mastercard, BancNet, JCB) accepted via physical POS terminal at store address."
            };
          }
          // Upgrade termsAndConditions if missing or using old legacy placeholder
          if (!updated.termsAndConditions || updated.termsAndConditions.length === 0 || updated.termsAndConditions[0]?.includes("50% reservation downpayment")) {
            modified = true;
            updated.termsAndConditions = [...DEFAULT_TERMS_AND_CONDITIONS];
          }
          // Upgrade packageInclusions if missing
          if (!updated.packageInclusions || updated.packageInclusions.length === 0) {
            modified = true;
            updated.packageInclusions = [...DEFAULT_PACKAGE_INCLUSIONS];
          }
          return updated;
        });

        if (cleaned.length > 0) {
          if (modified) {
            localStorage.setItem(STORAGE_KEY_COMPANIES, JSON.stringify(cleaned));
          }
          return cleaned;
        }
      }
    }
  } catch (e) {}
  return DEFAULT_COMPANIES;
}

export function saveStoredCompanies(companies) {
  localStorage.setItem(STORAGE_KEY_COMPANIES, JSON.stringify(companies));
}

export function getActiveCompanyId() {
  const current = localStorage.getItem(STORAGE_KEY_ACTIVE_COMPANY);
  if (current && current !== "hapag_kalinga" && current !== "fiesta_deluxe") {
    return current;
  }
  const list = getStoredCompanies();
  const fallbackId = list[0]?.id || "main_catering";
  localStorage.setItem(STORAGE_KEY_ACTIVE_COMPANY, fallbackId);
  return fallbackId;
}

export function setActiveCompanyId(id) {
  localStorage.setItem(STORAGE_KEY_ACTIVE_COMPANY, id);
}

export function getActiveCompany() {
  const list = getStoredCompanies();
  const currentId = getActiveCompanyId();
  const found = list.find(c => c.id === currentId) || list[0] || DEFAULT_COMPANIES[0];
  let updated = { ...found };
  if (found && (found.name === "My Catering Services PH" || !found.name)) {
    updated.name = "PLATABLE CATERING SERVICES";
  }
  if (!updated.termsAndConditions || updated.termsAndConditions.length === 0 || updated.termsAndConditions[0]?.includes("50% reservation downpayment")) {
    updated.termsAndConditions = [...DEFAULT_TERMS_AND_CONDITIONS];
  }
  if (!updated.packageInclusions || updated.packageInclusions.length === 0) {
    updated.packageInclusions = [...DEFAULT_PACKAGE_INCLUSIONS];
  }
  return updated;
}

