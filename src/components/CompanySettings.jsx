import React, { useState, useEffect } from "react";
import { 
  Building2, 
  Save, 
  Plus, 
  CheckCircle2, 
  CreditCard, 
  Phone, 
  Mail, 
  MapPin, 
  Sliders, 
  ShieldCheck,
  Check,
  Trash2,
  X,
  Sparkles,
  Copy,
  ExternalLink,
  Link2,
  Globe,
  Landmark,
  Wallet,
  FileText,
  ListChecks,
  RotateCcw,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import { 
  getStoredCompanies, 
  saveStoredCompanies, 
  getActiveCompanyId, 
  setActiveCompanyId,
  getActiveCompany,
  PHILIPPINE_BANKS,
  DEFAULT_TERMS_AND_CONDITIONS,
  DEFAULT_PACKAGE_INCLUSIONS
} from "../data/tenantSchema";
import { 
  saveCompanyToFirestore, 
  getCompaniesFromFirestore, 
  deleteCompanyFromFirestore 
} from "../services/firebase";

export default function CompanySettings({ activeCompany: propActiveCompany, onCompanyUpdated }) {
  const [companies, setCompanies] = useState(getStoredCompanies());
  const [selectedId, setSelectedId] = useState(propActiveCompany?.id || getActiveCompanyId());
  const [toast, setToast] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isSavingCloud, setIsSavingCloud] = useState(false);
  const [termsSubTab, setTermsSubTab] = useState("terms"); // "terms" | "inclusions"

  // Sync from Cloud Firestore on mount to pick up cross-origin updates
  useEffect(() => {
    getCompaniesFromFirestore().then(cloudList => {
      if (cloudList && cloudList.length > 0) {
        setCompanies(cloudList);
        saveStoredCompanies(cloudList);
      }
    }).catch(() => {});
  }, []);

  const activeCompany = propActiveCompany || companies.find(c => c.id === selectedId) || companies[0];

  const [formData, setFormData] = useState({
    ...activeCompany,
    bankDetails: { ...activeCompany.bankDetails },
    operationalSettings: { ...activeCompany.operationalSettings },
    termsAndConditions: Array.isArray(activeCompany.termsAndConditions) && activeCompany.termsAndConditions.length > 0 && !activeCompany.termsAndConditions[0]?.includes("50% reservation downpayment")
      ? [...activeCompany.termsAndConditions]
      : [...DEFAULT_TERMS_AND_CONDITIONS],
    packageInclusions: Array.isArray(activeCompany.packageInclusions) && activeCompany.packageInclusions.length > 0
      ? [...activeCompany.packageInclusions]
      : [...DEFAULT_PACKAGE_INCLUSIONS]
  });

  // Keep in sync when user switches company via the topbar dropdown
  useEffect(() => {
    if (propActiveCompany) {
      setSelectedId(propActiveCompany.id);
      setFormData({
        ...propActiveCompany,
        bankDetails: { ...propActiveCompany.bankDetails },
        operationalSettings: { ...propActiveCompany.operationalSettings },
        termsAndConditions: Array.isArray(propActiveCompany.termsAndConditions) && propActiveCompany.termsAndConditions.length > 0 && !propActiveCompany.termsAndConditions[0]?.includes("50% reservation downpayment")
          ? [...propActiveCompany.termsAndConditions]
          : [...DEFAULT_TERMS_AND_CONDITIONS],
        packageInclusions: Array.isArray(propActiveCompany.packageInclusions) && propActiveCompany.packageInclusions.length > 0
          ? [...propActiveCompany.packageInclusions]
          : [...DEFAULT_PACKAGE_INCLUSIONS]
      });
      setCompanies(getStoredCompanies());
    }
  }, [propActiveCompany]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCompanyForm, setNewCompanyForm] = useState({
    name: "",
    tagline: "Premier Philippine Catering & Events",
    tin: "",
    phone: "",
    email: "",
    address: "Brgy. Gaub, Cabatuan, Iloilo",
    adminPasscode: "",
    gcashName: "",
    gcashNumber: ""
  });

  const handleCompanySelect = (id) => {
    setSelectedId(id);
    setActiveCompanyId(id);
    const target = companies.find(c => c.id === id) || companies[0];
    setFormData({
      ...target,
      bankDetails: { ...target.bankDetails },
      operationalSettings: { ...target.operationalSettings },
      termsAndConditions: Array.isArray(target.termsAndConditions) && target.termsAndConditions.length > 0 && !target.termsAndConditions[0]?.includes("50% reservation downpayment")
        ? [...target.termsAndConditions]
        : [...DEFAULT_TERMS_AND_CONDITIONS],
      packageInclusions: Array.isArray(target.packageInclusions) && target.packageInclusions.length > 0
        ? [...target.packageInclusions]
        : [...DEFAULT_PACKAGE_INCLUSIONS]
    });
    if (onCompanyUpdated) onCompanyUpdated(target);
  };

  // Terms and Conditions Clause Handlers
  const handleTermChange = (index, value) => {
    setFormData(prev => {
      const next = [...(prev.termsAndConditions || DEFAULT_TERMS_AND_CONDITIONS)];
      next[index] = value;
      return { ...prev, termsAndConditions: next };
    });
  };

  const handleAddTerm = () => {
    setFormData(prev => ({
      ...prev,
      termsAndConditions: [...(prev.termsAndConditions || DEFAULT_TERMS_AND_CONDITIONS), ""]
    }));
  };

  const handleRemoveTerm = (index) => {
    setFormData(prev => {
      const next = (prev.termsAndConditions || DEFAULT_TERMS_AND_CONDITIONS).filter((_, i) => i !== index);
      return { ...prev, termsAndConditions: next };
    });
  };

  const handleMoveTerm = (index, direction) => {
    setFormData(prev => {
      const list = [...(prev.termsAndConditions || DEFAULT_TERMS_AND_CONDITIONS)];
      const target = index + direction;
      if (target < 0 || target >= list.length) return prev;
      const temp = list[index];
      list[index] = list[target];
      list[target] = temp;
      return { ...prev, termsAndConditions: list };
    });
  };

  const handleResetTerms = () => {
    if (window.confirm("Reset Terms & Conditions to standard Palatable Catering defaults?")) {
      setFormData(prev => ({
        ...prev,
        termsAndConditions: [...DEFAULT_TERMS_AND_CONDITIONS]
      }));
    }
  };

  // Package Inclusions Handlers
  const handleInclusionChange = (index, value) => {
    setFormData(prev => {
      const next = [...(prev.packageInclusions || DEFAULT_PACKAGE_INCLUSIONS)];
      next[index] = value;
      return { ...prev, packageInclusions: next };
    });
  };

  const handleAddInclusion = () => {
    setFormData(prev => ({
      ...prev,
      packageInclusions: [...(prev.packageInclusions || DEFAULT_PACKAGE_INCLUSIONS), ""]
    }));
  };

  const handleRemoveInclusion = (index) => {
    setFormData(prev => {
      const next = (prev.packageInclusions || DEFAULT_PACKAGE_INCLUSIONS).filter((_, i) => i !== index);
      return { ...prev, packageInclusions: next };
    });
  };

  const handleMoveInclusion = (index, direction) => {
    setFormData(prev => {
      const list = [...(prev.packageInclusions || DEFAULT_PACKAGE_INCLUSIONS)];
      const target = index + direction;
      if (target < 0 || target >= list.length) return prev;
      const temp = list[index];
      list[index] = list[target];
      list[target] = temp;
      return { ...prev, packageInclusions: list };
    });
  };

  const handleResetInclusions = () => {
    if (window.confirm("Reset Package Inclusions to standard Palatable Catering defaults?")) {
      setFormData(prev => ({
        ...prev,
        packageInclusions: [...DEFAULT_PACKAGE_INCLUSIONS]
      }));
    }
  };

  const renderPreviewFormatted = (text) => {
    if (!text) return <span style={{ color: "#94a3b8", fontStyle: "italic" }}>Empty clause...</span>;
    const lines = text.split("\n");
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
        {lines.map((line, lIdx) => {
          const trimmed = line.trim();
          const isSub = trimmed.startsWith("*") || trimmed.startsWith("-");
          const content = isSub ? trimmed.replace(/^[*–-]\s*/, "") : line;
          const parts = content.split(/(\*\*[^*]+\*\*)/g);
          return (
            <div key={lIdx} style={{ paddingLeft: isSub ? "1.25rem" : "0", color: isSub ? "#0f172a" : "inherit", fontWeight: isSub ? 600 : "normal" }}>
              {isSub ? "• " : ""}
              {parts.map((p, pIdx) => (
                p.startsWith("**") && p.endsWith("**") ? <strong key={pIdx} style={{ color: "#0f172a" }}>{p.slice(2, -2)}</strong> : p
              ))}
            </div>
          );
        })}
      </div>
    );
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSavingCloud(true);
    const updatedList = companies.map(c => c.id === selectedId ? formData : c);
    setCompanies(updatedList);
    saveStoredCompanies(updatedList);
    setActiveCompanyId(selectedId);
    
    try {
      await saveCompanyToFirestore(formData);
      setToast("Company profile saved & synced to live Cloud Firestore!");
    } catch (err) {
      console.warn("Firestore save failed:", err);
      setToast("Company profile saved locally!");
    } finally {
      setIsSavingCloud(false);
    }

    setTimeout(() => setToast(null), 3500);
    if (onCompanyUpdated) onCompanyUpdated(formData);
  };

  const handleCreateCompanySubmit = async (e) => {
    e.preventDefault();
    if (!newCompanyForm.name.trim()) return;

    const newId = "caterer_" + Date.now().toString(36);
    const createdCompany = {
      id: newId,
      name: newCompanyForm.name.trim(),
      tagline: newCompanyForm.tagline.trim() || "Premier Philippine Catering & Events",
      tin: newCompanyForm.tin.trim() || "000-000-000-00000",
      phone: newCompanyForm.phone.trim() || "0917-000-0000",
      email: newCompanyForm.email.trim() || "inquiries@caterer.ph",
      website: "www.caterflow.ph",
      address: newCompanyForm.address.trim() || "Metro Manila, Philippines",
      themeColor: "#d97706",
      adminPasscode: newCompanyForm.adminPasscode.trim() || ("cater_" + Date.now().toString(36).slice(-4)),
      bankDetails: {
        gcash: { 
          name: newCompanyForm.gcashName.trim() || newCompanyForm.name.trim(), 
          number: newCompanyForm.gcashNumber.trim() || newCompanyForm.phone.trim() 
        },
        maya: { name: newCompanyForm.name.trim(), number: newCompanyForm.phone.trim() },
        bdo: { accountName: newCompanyForm.name.trim(), accountNumber: "0000-0000-0000" },
        bpi: { accountName: newCompanyForm.name.trim(), accountNumber: "0000-0000-00" }
      },
      operationalSettings: {
        maxPaxPerDay: 400,
        maxEventsPerDay: 3,
        defaultServiceCharge: 10,
        vatEnabledByDefault: false,
        waiterWagePerEvent: 650,
        captainWagePerEvent: 1000
      },
      termsAndConditions: [...DEFAULT_TERMS_AND_CONDITIONS],
      packageInclusions: [...DEFAULT_PACKAGE_INCLUSIONS]
    };

    const nextList = [...companies, createdCompany];
    setCompanies(nextList);
    saveStoredCompanies(nextList);
    handleCompanySelect(newId);
    setIsModalOpen(false);
    setNewCompanyForm({
      name: "",
      tagline: "Premier Philippine Catering & Events",
      tin: "",
      phone: "",
      email: "",
      address: "Metro Manila, Philippines",
      gcashName: "",
      gcashNumber: ""
    });

    try {
      await saveCompanyToFirestore(createdCompany);
    } catch (err) {}

    setToast(`Company "${createdCompany.name}" registered and activated!`);
    setTimeout(() => setToast(null), 3500);
  };

  const handleDeleteCurrentCompany = async () => {
    if (companies.length <= 1) {
      alert("Cannot delete the only remaining catering company.");
      return;
    }

    if (window.confirm(`Are you sure you want to remove "${formData.name}"?`)) {
      const remaining = companies.filter(c => c.id !== selectedId);
      setCompanies(remaining);
      saveStoredCompanies(remaining);
      handleCompanySelect(remaining[0].id);
      
      try {
        await deleteCompanyFromFirestore(selectedId);
      } catch (e) {}

      setToast("Company profile deleted.");
      setTimeout(() => setToast(null), 3000);
    }
  };

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          zIndex: 999,
          background: "#ecfdf5",
          border: "1px solid #a7f3d0",
          color: "#065f46",
          padding: "0.85rem 1.25rem",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          fontSize: "0.88rem",
          fontWeight: 600,
          boxShadow: "var(--shadow-lg)"
        }}>
          <CheckCircle2 size={18} color="#059669" />
          <span>{toast}</span>
        </div>
      )}

      {/* Dedicated Public Booking Website Link for this Company */}
      <div className="card-section" style={{ padding: "1.35rem 1.5rem", marginBottom: "1.5rem", border: "1px solid var(--border-gold)", background: "linear-gradient(135deg, #fffbeb 0%, #ffffff 100%)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
          <div style={{ flex: 1, minWidth: "280px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.3rem" }}>
              <span className="pkg-badge" style={{ position: "static", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                <Globe size={13} />
                <span>Company Booking Website</span>
              </span>
              <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: 600 }}>
                • Configuring: <strong style={{ color: "var(--gold-700)" }}>{formData.name}</strong>
              </span>
            </div>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--text-primary)" }}>
              Dedicated Client Booking Website URL
            </h2>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "4px" }}>
              Give this dedicated link to clients, on Facebook posts, or Instagram bio. When customers open this URL, the website automatically displays <strong>{formData.name}</strong>'s branding, hotline, and payment QR, and all submitted event reservations are tagged directly to this company!
            </p>

            <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", marginTop: "0.95rem", flexWrap: "wrap" }}>
              <div style={{ background: "#ffffff", border: "1px solid var(--border-subtle)", borderRadius: "8px", padding: "0.5rem 0.85rem", fontSize: "0.85rem", fontFamily: "monospace", color: "var(--gold-700)", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.4rem", boxShadow: "inset 0 1px 2px rgba(0,0,0,0.03)" }}>
                <Link2 size={15} />
                <span>https://cater-booking.web.app/?caterer={formData.id}</span>
              </div>

              <button
                type="button"
                className="btn-secondary"
                style={{ padding: "0.5rem 0.95rem", fontSize: "0.82rem", display: "flex", alignItems: "center", gap: "0.4rem" }}
                onClick={() => {
                  const link = `https://cater-booking.web.app/?caterer=${formData.id}`;
                  navigator.clipboard.writeText(link);
                  setCopiedLink(true);
                  setTimeout(() => setCopiedLink(false), 2500);
                }}
              >
                {copiedLink ? <Check size={15} color="var(--emerald-600)" /> : <Copy size={15} />}
                <span>{copiedLink ? "Link Copied!" : "Copy Booking Link"}</span>
              </button>

              <a
                href={`https://cater-booking.web.app/?caterer=${formData.id}`}
                target="_blank"
                rel="noreferrer"
                className="btn-secondary"
                style={{ textDecoration: "none", padding: "0.5rem 0.95rem", fontSize: "0.82rem", display: "flex", alignItems: "center", gap: "0.4rem" }}
              >
                <ExternalLink size={15} />
                <span>Open Live Booking Site</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSave}>
        <div className="card-section" style={{ marginBottom: "1.5rem" }}>
          <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "1rem", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "0.5rem" }}>
            1. Business Letterhead & Identity
          </h3>

          <div className="form-grid-2" style={{ marginBottom: "1rem" }}>
            <div className="form-group">
              <label className="form-label">Catering Business Name *</label>
              <input
                type="text"
                required
                className="form-input"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Brand Tagline / Slogan</label>
              <input
                type="text"
                className="form-input"
                value={formData.tagline}
                onChange={(e) => setFormData(prev => ({ ...prev, tagline: e.target.value }))}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Tax Identification Number (TIN)</label>
              <input
                type="text"
                className="form-input"
                value={formData.tin}
                onChange={(e) => setFormData(prev => ({ ...prev, tin: e.target.value }))}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Contact Hotline / Mobile</label>
              <input
                type="text"
                className="form-input"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Inquiry Email</label>
              <input
                type="email"
                className="form-input"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Commissary Address</label>
              <input
                type="text"
                className="form-input"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Company Admin Passcode</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. cater2026"
                value={formData.adminPasscode || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, adminPasscode: e.target.value }))}
              />
              <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "2px" }}>
                Staff and managers using this passcode log into {formData.name} only and cannot see other catering companies.
              </span>
            </div>
          </div>
        </div>

        {/* Bank & GCash Payment Details */}
        <div className="card-section" style={{ marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "0.5rem", flexWrap: "wrap", gap: "0.5rem" }}>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-primary)", margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <CreditCard size={18} color="var(--gold-600)" />
              <span>2. Payment Accounts & Bank Binding (Printed on Formal Quotation)</span>
            </h3>
            <span style={{ fontSize: "0.74rem", background: "#fef3c7", color: "#92400e", padding: "2px 8px", borderRadius: "10px", fontWeight: 700, border: "1px solid #fde68a" }}>
              GCash • Bank Wire (PNB) • Physical Store POS
            </span>
          </div>

          {/* Sub-section A: GCash */}
          <div style={{ background: "rgba(2, 132, 199, 0.04)", border: "1px solid rgba(2, 132, 199, 0.2)", borderRadius: "10px", padding: "1.1rem", marginBottom: "1.25rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
              <div style={{ width: "28px", height: "28px", borderRadius: "6px", background: "#0284c7", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "0.8rem" }}>
                G
              </div>
              <strong style={{ fontSize: "0.92rem", color: "#0369a1" }}>GCash Payment Details (e-Wallet)</strong>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">GCash Registered Account Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Platable Catering Services / Maria Santos"
                  value={formData.bankDetails?.gcash?.name || ""}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    bankDetails: {
                      ...prev.bankDetails,
                      gcash: { ...prev.bankDetails.gcash, name: e.target.value }
                    }
                  }))}
                />
              </div>

              <div className="form-group">
                <label className="form-label">GCash Mobile Number (09XXXXXXXXX)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 0917-123-4567"
                  value={formData.bankDetails?.gcash?.number || ""}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    bankDetails: {
                      ...prev.bankDetails,
                      gcash: { ...prev.bankDetails.gcash, number: e.target.value }
                    }
                  }))}
                />
              </div>
            </div>
          </div>

          {/* Sub-section B: Selectable Philippine Bank to Bind to Quotation */}
          <div style={{ background: "rgba(217, 119, 6, 0.04)", border: "1px solid rgba(217, 119, 6, 0.25)", borderRadius: "10px", padding: "1.1rem", marginBottom: "1.25rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem", flexWrap: "wrap", gap: "0.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Landmark size={20} color="var(--gold-600)" />
                <strong style={{ fontSize: "0.92rem", color: "var(--gold-800)" }}>
                  Select Bank to Bind in Quotation (Philippine Commercial & Thrift Banks)
                </strong>
              </div>
              <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                Selected bank is bound & printed on official client quotes
              </span>
            </div>

            <div className="form-grid-2" style={{ marginBottom: "0.75rem" }}>
              <div className="form-group">
                <label className="form-label">Available Banks in the Philippines *</label>
                <select
                  className="form-select"
                  value={formData.bankDetails?.selectedBank || "pnb"}
                  onChange={(e) => {
                    const chosenId = e.target.value;
                    const bankObj = PHILIPPINE_BANKS.find(b => b.id === chosenId);
                    setFormData(prev => ({
                      ...prev,
                      bankDetails: {
                        ...prev.bankDetails,
                        selectedBank: chosenId,
                        bankName: bankObj ? bankObj.name : "Philippine National Bank (PNB)"
                      }
                    }));
                  }}
                  style={{ fontWeight: 600, color: "var(--text-primary)" }}
                >
                  <optgroup label="── RECOMMENDED / DEFAULT BANK ──">
                    {PHILIPPINE_BANKS.filter(b => b.isDefault).map(b => (
                      <option key={b.id} value={b.id}>⭐ {b.name} ({b.code})</option>
                    ))}
                  </optgroup>
                  <optgroup label="── ALL COMMERCIAL & DIGITAL BANKS IN PH ──">
                    {PHILIPPINE_BANKS.filter(b => !b.isDefault).map(b => (
                      <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
                    ))}
                  </optgroup>
                </select>
                <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "2px" }}>
                  Selected: <strong style={{ color: "var(--gold-700)" }}>{formData.bankDetails?.bankName || "Philippine National Bank (PNB)"}</strong>
                </span>
              </div>

              <div className="form-group">
                <label className="form-label">Bank Account Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Platable Catering Services Inc."
                  value={formData.bankDetails?.accountName || formData.bankDetails?.bdo?.accountName || formData.name || ""}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    bankDetails: {
                      ...prev.bankDetails,
                      accountName: e.target.value
                    }
                  }))}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Bank Account Number *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 1234-5678-9012"
                  value={formData.bankDetails?.accountNumber || formData.bankDetails?.bdo?.accountNumber || ""}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    bankDetails: {
                      ...prev.bankDetails,
                      accountNumber: e.target.value
                    }
                  }))}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Branch / Account Type (Optional)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Main Corporate Branch - Current Account"
                  value={formData.bankDetails?.branch || ""}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    bankDetails: {
                      ...prev.bankDetails,
                      branch: e.target.value
                    }
                  }))}
                />
              </div>
            </div>

            <div style={{ fontSize: "0.74rem", color: "#92400e", background: "#fef3c7", padding: "6px 10px", borderRadius: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
              <span>💡</span>
              <span>
                <strong>Quotation Binding Note:</strong> The bank selected above will be officially designated on every client quotation and event contract as the primary bank transfer channel.
              </span>
            </div>
          </div>

          {/* Sub-section C: Physical Store Card Payment Settings */}
          <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "1.1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem", flexWrap: "wrap", gap: "0.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <CreditCard size={18} color="#059669" />
                <strong style={{ fontSize: "0.92rem", color: "#065f46" }}>Physical Store Card Payment (POS Terminal)</strong>
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.78rem", cursor: "pointer", fontWeight: 700, color: "#065f46" }}>
                <input
                  type="checkbox"
                  checked={formData.bankDetails?.acceptCardAtStore ?? true}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    bankDetails: {
                      ...prev.bankDetails,
                      acceptCardAtStore: e.target.checked
                    }
                  }))}
                />
                <span>Enable Card Payment at Store in Quotation</span>
              </label>
            </div>

            <p style={{ fontSize: "0.82rem", color: "#475569", margin: "0 0 0.75rem 0", lineHeight: 1.45 }}>
              Clients can settle payments in person via Credit / Debit Card (Visa, Mastercard, BancNet, JCB). In the formal quotation, the payment terminal location will automatically reference your company commissary address: <strong style={{ color: "var(--text-primary)" }}>{formData.address || "Metro Manila, Philippines"}</strong>.
            </p>

            <div className="form-group">
              <label className="form-label">Card Payment Instructions / Terminal Operating Hours</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Available Mon-Sat 9:00 AM - 6:00 PM at our commissary office. Please bring your booking quote."
                value={formData.bankDetails?.cardPaymentNotes || ""}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  bankDetails: {
                    ...prev.bankDetails,
                    cardPaymentNotes: e.target.value
                  }
                }))}
              />
            </div>
          </div>
        </div>

        {/* Operational Guardrails */}
        <div className="card-section" style={{ marginBottom: "1.5rem" }}>
          <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "1rem", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "0.5rem" }}>
            3. Operational Limits & Labor Benchmarks
          </h3>

          <div className="form-grid-3">
            <div className="form-group">
              <label className="form-label">Max Guest Capacity / Day</label>
              <input
                type="number"
                min="100"
                step="50"
                className="form-input"
                value={formData.operationalSettings?.maxPaxPerDay || 400}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  operationalSettings: {
                    ...prev.operationalSettings,
                    maxPaxPerDay: Number(e.target.value)
                  }
                }))}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Max Events Bookable / Day</label>
              <input
                type="number"
                min="1"
                max="10"
                className="form-input"
                value={formData.operationalSettings?.maxEventsPerDay || 3}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  operationalSettings: {
                    ...prev.operationalSettings,
                    maxEventsPerDay: Number(e.target.value)
                  }
                }))}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Default Service Charge %</label>
              <input
                type="number"
                min="0"
                max="20"
                className="form-input"
                value={formData.operationalSettings?.defaultServiceCharge || 10}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  operationalSettings: {
                    ...prev.operationalSettings,
                    defaultServiceCharge: Number(e.target.value)
                  }
                }))}
              />
            </div>
          </div>
        </div>

        {/* Section 4: Quotation Contract Terms & Package Inclusions */}
        <div className="card-section" style={{ marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.75rem", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "0.75rem", marginBottom: "1.25rem" }}>
            <div>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
                4. Quotation Contract Terms & Package Inclusions
              </h3>
              <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", margin: "4px 0 0 0" }}>
                Add, edit, or customize the official Terms & Conditions and Package Inclusions displayed on Page 2 of every formal printable quotation and event contract.
              </p>
            </div>

            {/* Sub-tabs switcher */}
            <div style={{ display: "inline-flex", background: "#f1f5f9", padding: "3px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
              <button
                type="button"
                onClick={() => setTermsSubTab("terms")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "0.45rem 0.9rem",
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  borderRadius: "6px",
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  background: termsSubTab === "terms" ? "#ffffff" : "transparent",
                  color: termsSubTab === "terms" ? "#92400e" : "#64748b",
                  boxShadow: termsSubTab === "terms" ? "0 1px 3px rgba(0,0,0,0.1)" : "none"
                }}
              >
                <FileText size={15} />
                <span>Terms & Conditions ({formData.termsAndConditions?.length || 0})</span>
              </button>

              <button
                type="button"
                onClick={() => setTermsSubTab("inclusions")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "0.45rem 0.9rem",
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  borderRadius: "6px",
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  background: termsSubTab === "inclusions" ? "#ffffff" : "transparent",
                  color: termsSubTab === "inclusions" ? "#047857" : "#64748b",
                  boxShadow: termsSubTab === "inclusions" ? "0 1px 3px rgba(0,0,0,0.1)" : "none"
                }}
              >
                <ListChecks size={15} />
                <span>Package Inclusions ({formData.packageInclusions?.length || 0})</span>
              </button>
            </div>
          </div>

          {/* TAB 1: Terms & Conditions Management */}
          {termsSubTab === "terms" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "0.5rem" }}>
                <span style={{ fontSize: "0.82rem", color: "#475569", fontWeight: 600 }}>
                  Booking minimums, service hours, equipment policies, allergies, and client obligations:
                </span>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={handleResetTerms}
                    style={{ fontSize: "0.78rem", padding: "0.35rem 0.75rem", color: "#64748b" }}
                    title="Restore standard Palatable terms and conditions"
                  >
                    <RotateCcw size={14} />
                    <span>Reset to Defaults</span>
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={handleAddTerm}
                    style={{ fontSize: "0.78rem", padding: "0.35rem 0.85rem", color: "#92400e", borderColor: "#fde68a", background: "#fef3c7", fontWeight: 700 }}
                  >
                    <Plus size={14} />
                    <span>Add New Clause</span>
                  </button>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                {(formData.termsAndConditions || []).map((term, idx) => (
                  <div
                    key={`term-${idx}`}
                    style={{
                      background: "#ffffff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      padding: "0.85rem",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.03)"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                      <span style={{ fontSize: "0.76rem", fontWeight: 800, color: "#92400e", background: "#fef3c7", padding: "2px 8px", borderRadius: "4px" }}>
                        Clause #{idx + 1}
                      </span>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMoveTerm(idx, -1)}
                          style={{
                            background: "transparent",
                            border: "none",
                            cursor: idx === 0 ? "not-allowed" : "pointer",
                            opacity: idx === 0 ? 0.3 : 0.8,
                            padding: "3px"
                          }}
                          title="Move Up"
                        >
                          <ArrowUp size={15} color="#475569" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === (formData.termsAndConditions?.length || 1) - 1}
                          onClick={() => handleMoveTerm(idx, 1)}
                          style={{
                            background: "transparent",
                            border: "none",
                            cursor: idx === (formData.termsAndConditions?.length || 1) - 1 ? "not-allowed" : "pointer",
                            opacity: idx === (formData.termsAndConditions?.length || 1) - 1 ? 0.3 : 0.8,
                            padding: "3px"
                          }}
                          title="Move Down"
                        >
                          <ArrowDown size={15} color="#475569" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveTerm(idx)}
                          style={{
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            color: "#ef4444",
                            padding: "3px",
                            marginLeft: "4px"
                          }}
                          title="Delete Clause"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    <textarea
                      className="form-input"
                      rows={Math.max(2, term.split("\n").length + 1)}
                      style={{ fontSize: "0.82rem", lineHeight: 1.45, resize: "vertical", width: "100%", fontFamily: "inherit" }}
                      value={term}
                      placeholder="Enter contract term & condition clause..."
                      onChange={(e) => handleTermChange(idx, e.target.value)}
                    />

                    {/* Rich live preview */}
                    <div style={{ marginTop: "6px", background: "#f8fafc", padding: "6px 10px", borderRadius: "6px", fontSize: "0.76rem", color: "#334155", borderLeft: "3px solid #d97706" }}>
                      <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", marginBottom: "2px" }}>
                        Live Print Preview:
                      </div>
                      {renderPreviewFormatted(term)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: Package Inclusions Management */}
          {termsSubTab === "inclusions" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "0.5rem" }}>
                <span style={{ fontSize: "0.82rem", color: "#475569", fontWeight: 600 }}>
                  Standard servers, buffet setups, tableware, linen colors, and free delivery thresholds:
                </span>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={handleResetInclusions}
                    style={{ fontSize: "0.78rem", padding: "0.35rem 0.75rem", color: "#64748b" }}
                    title="Restore standard Palatable package inclusions"
                  >
                    <RotateCcw size={14} />
                    <span>Reset to Defaults</span>
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={handleAddInclusion}
                    style={{ fontSize: "0.78rem", padding: "0.35rem 0.85rem", color: "#047857", borderColor: "#a7f3d0", background: "#ecfdf5", fontWeight: 700 }}
                  >
                    <Plus size={14} />
                    <span>Add New Inclusion</span>
                  </button>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                {(formData.packageInclusions || []).map((inclusion, idx) => (
                  <div
                    key={`inc-${idx}`}
                    style={{
                      background: "#ffffff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      padding: "0.85rem",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.03)"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                      <span style={{ fontSize: "0.76rem", fontWeight: 800, color: "#047857", background: "#ecfdf5", padding: "2px 8px", borderRadius: "4px" }}>
                        Inclusion #{idx + 1}
                      </span>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMoveInclusion(idx, -1)}
                          style={{
                            background: "transparent",
                            border: "none",
                            cursor: idx === 0 ? "not-allowed" : "pointer",
                            opacity: idx === 0 ? 0.3 : 0.8,
                            padding: "3px"
                          }}
                          title="Move Up"
                        >
                          <ArrowUp size={15} color="#475569" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === (formData.packageInclusions?.length || 1) - 1}
                          onClick={() => handleMoveInclusion(idx, 1)}
                          style={{
                            background: "transparent",
                            border: "none",
                            cursor: idx === (formData.packageInclusions?.length || 1) - 1 ? "not-allowed" : "pointer",
                            opacity: idx === (formData.packageInclusions?.length || 1) - 1 ? 0.3 : 0.8,
                            padding: "3px"
                          }}
                          title="Move Down"
                        >
                          <ArrowDown size={15} color="#475569" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveInclusion(idx)}
                          style={{
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            color: "#ef4444",
                            padding: "3px",
                            marginLeft: "4px"
                          }}
                          title="Delete Inclusion"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    <textarea
                      className="form-input"
                      rows={Math.max(2, inclusion.split("\n").length + 1)}
                      style={{ fontSize: "0.82rem", lineHeight: 1.45, resize: "vertical", width: "100%", fontFamily: "inherit" }}
                      value={inclusion}
                      placeholder="Enter package inclusion details..."
                      onChange={(e) => handleInclusionChange(idx, e.target.value)}
                    />

                    {/* Rich live preview */}
                    <div style={{ marginTop: "6px", background: "#f8fafc", padding: "6px 10px", borderRadius: "6px", fontSize: "0.76rem", color: "#334155", borderLeft: "3px solid #059669" }}>
                      <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", marginBottom: "2px" }}>
                        Live Print Preview:
                      </div>
                      {renderPreviewFormatted(inclusion)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Formatting Tip Banner */}
          <div style={{ marginTop: "1.25rem", background: "#fefce8", border: "1px solid #fef08a", borderRadius: "8px", padding: "0.75rem 1rem", fontSize: "0.76rem", color: "#854d0e", display: "flex", alignItems: "flex-start", gap: "8px" }}>
            <span style={{ fontSize: "1rem" }}>💡</span>
            <div>
              <strong>Formatting Tip:</strong> Wrap key words or numbers in double asterisks like <code>**50 PAX**</code> or <code>**4 Hours service**</code> to display them in bold text in the printed contract. Start a line with <code>*</code> or <code>-</code> to indent it as a sub-bullet.
            </div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          {companies.length > 1 ? (
            <button
              type="button"
              className="btn-secondary"
              style={{ color: "#dc2626", borderColor: "#fecaca", padding: "0.75rem 1.25rem", fontSize: "0.85rem" }}
              onClick={handleDeleteCurrentCompany}
            >
              <Trash2 size={16} />
              <span>Delete Company Profile</span>
            </button>
          ) : (
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
              • Primary Tenant Active
            </div>
          )}

          <button type="submit" className="btn-primary" disabled={isSavingCloud} style={{ padding: "0.85rem 2rem", fontSize: "0.95rem" }}>
            <Save size={18} />
            <span>{isSavingCloud ? "Saving & Syncing to Cloud..." : "Save Company Configuration"}</span>
          </button>
        </div>
      </form>

      {/* Register New Company Modal */}
      {isModalOpen && (
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
          <div className="card-section" style={{ maxWidth: "560px", width: "100%", padding: "2rem", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)", border: "1px solid var(--border-gold)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "var(--gold-50)", color: "var(--gold-600)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Building2 size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--text-primary)" }}>
                    Register New Catering Company
                  </h3>
                  <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                    Add another catering business to your CaterFlow PH multi-tenant fleet
                  </p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateCompanySubmit}>
              <div className="form-group" style={{ marginBottom: "1rem" }}>
                <label className="form-label">Catering Business Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Solana Grand Banquet & Catering"
                  className="form-input"
                  value={newCompanyForm.name}
                  onChange={(e) => setNewCompanyForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="form-group" style={{ marginBottom: "1rem" }}>
                <label className="form-label">Brand Tagline / Specialty</label>
                <input
                  type="text"
                  placeholder="e.g. Luxury Wedding Feasts & High-End Corporate Banquets"
                  className="form-input"
                  value={newCompanyForm.tagline}
                  onChange={(e) => setNewCompanyForm(prev => ({ ...prev, tagline: e.target.value }))}
                />
              </div>

              <div className="form-grid-2" style={{ marginBottom: "1rem" }}>
                <div className="form-group">
                  <label className="form-label">Contact Hotline / Mobile *</label>
                  <input
                    type="text"
                    required
                    placeholder="0917-XXX-XXXX"
                    className="form-input"
                    value={newCompanyForm.phone}
                    onChange={(e) => setNewCompanyForm(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Inquiry Email</label>
                  <input
                    type="email"
                    placeholder="events@solanacatering.ph"
                    className="form-input"
                    value={newCompanyForm.email}
                    onChange={(e) => setNewCompanyForm(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: "1rem" }}>
                <label className="form-label">Company Admin Passcode *</label>
                <input
                  type="text"
                  placeholder="e.g. solana2026"
                  className="form-input"
                  value={newCompanyForm.adminPasscode}
                  onChange={(e) => setNewCompanyForm(prev => ({ ...prev, adminPasscode: e.target.value }))}
                />
                <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "2px" }}>
                  Staff using this passcode will ONLY see this catering company's bookings and revenue.
                </span>
              </div>

              <div className="form-grid-2" style={{ marginBottom: "1.5rem" }}>
                <div className="form-group">
                  <label className="form-label">GCash Account Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Maria Santos (Finance)"
                    className="form-input"
                    value={newCompanyForm.gcashName}
                    onChange={(e) => setNewCompanyForm(prev => ({ ...prev, gcashName: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">GCash Receiving Mobile Number</label>
                  <input
                    type="text"
                    placeholder="0917-XXX-XXXX"
                    className="form-input"
                    value={newCompanyForm.gcashNumber}
                    onChange={(e) => setNewCompanyForm(prev => ({ ...prev, gcashNumber: e.target.value }))}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  <span>Cancel</span>
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
                >
                  <Sparkles size={16} />
                  <span>Create & Activate Company</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
