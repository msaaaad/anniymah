"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { apiJson } from "@/lib/api-client";
import { errorMessages } from "@/lib/api-error";
import type { StoreSettings, ThemeColors, ThemeColorDefault } from "@/lib/api-types";
import { cardClass, inputClass, labelClass } from "@/components/admin/styles";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

interface SettingsManagerProps {
  initialSettings: StoreSettings;
  themeDefaults: ThemeColorDefault[];
}

const HEX_REGEX = /^#[0-9a-fA-F]{6}$/;

export function SettingsManager({ initialSettings, themeDefaults }: SettingsManagerProps) {
  const router = useRouter();

  // General store settings state
  const [deliveryInside, setDeliveryInside] = useState(
    initialSettings.defaultDeliveryChargeInsideDhaka?.toString() ?? "60"
  );
  const [deliveryOutside, setDeliveryOutside] = useState(
    initialSettings.defaultDeliveryChargeOutsideDhaka?.toString() ?? "120"
  );
  const [whatsapp, setWhatsapp] = useState(initialSettings.whatsappNumber ?? "");
  const [phone, setPhone] = useState(initialSettings.contactPhone ?? "");
  const [email, setEmail] = useState(initialSettings.contactEmail ?? "");
  const [address, setAddress] = useState(initialSettings.contactAddress ?? "");
  const [announcementText, setAnnouncementText] = useState(initialSettings.announcementText ?? "");
  const [announcementActive, setAnnouncementActive] = useState(
    Boolean(initialSettings.announcementActive)
  );
  const [lowStockThreshold, setLowStockThreshold] = useState(
    initialSettings.lowStockThreshold?.toString() ?? "5"
  );

  // Theme colors state
  const [themeColors, setThemeColors] = useState<ThemeColors>({
    ...initialSettings.themeColors,
  });

  const [savingGeneral, setSavingGeneral] = useState(false);
  const [savingTheme, setSavingTheme] = useState(false);
  const [resettingTheme, setResettingTheme] = useState(false);

  // Tab state for clean navigation
  const [activeTab, setActiveTab] = useState<"general" | "theme">("general");

  // Handle saving general settings
  async function handleSaveGeneral(e: React.FormEvent) {
    e.preventDefault();
    setSavingGeneral(true);

    try {
      const payload = {
        defaultDeliveryChargeInsideDhaka: Math.max(0, parseInt(deliveryInside, 10) || 0),
        defaultDeliveryChargeOutsideDhaka: Math.max(0, parseInt(deliveryOutside, 10) || 0),
        whatsappNumber: whatsapp.trim(),
        contactPhone: phone.trim(),
        contactEmail: email.trim(), // empty string clears it
        contactAddress: address.trim(),
        announcementText: announcementText.trim(),
        announcementActive,
        lowStockThreshold: Math.max(0, parseInt(lowStockThreshold, 10) || 0),
      };

      await apiJson("/settings", "PATCH", payload);
      toast.success("Store settings updated successfully");
      router.refresh();
    } catch (err) {
      toast.error(errorMessages(err).join("\n") || "Failed to update store settings");
    } finally {
      setSavingGeneral(false);
    }
  }

  // Handle color change with hex validation
  function handleColorChange(key: keyof ThemeColors, value: string) {
    setThemeColors((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  // Handle saving theme colors
  async function handleSaveTheme() {
    // Validate all 12 keys
    for (const [key, val] of Object.entries(themeColors)) {
      if (!HEX_REGEX.test(val)) {
        toast.error(`Invalid hex color for "${key}": ${val}. Must be 6-digit hex (e.g. #C05112).`);
        return;
      }
    }

    setSavingTheme(true);
    try {
      await apiJson("/settings", "PATCH", {
        themeColors,
      });
      toast.success("Theme colors updated successfully");
      router.refresh();
    } catch (err) {
      toast.error(errorMessages(err).join("\n") || "Failed to update theme colors");
    } finally {
      setSavingTheme(false);
    }
  }

  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Handle resetting theme to defaults
  async function handleResetTheme() {
    setResettingTheme(true);
    try {
      const res = await apiJson<StoreSettings>("/settings/theme/reset", "POST");
      if (res && res.themeColors) {
        setThemeColors(res.themeColors);
      }
      toast.success("Theme colors reset to defaults");
      setShowResetConfirm(false);
      router.refresh();
    } catch (err) {
      toast.error(errorMessages(err).join("\n") || "Failed to reset theme colors");
    } finally {
      setResettingTheme(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-text sm:text-3xl">
            Store Settings
          </h1>
          <p className="mt-1 text-xs text-muted sm:text-sm">
            Manage contact channels, shipping fees, announcement banner, and storefront theme branding
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          type="button"
          onClick={() => setActiveTab("general")}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs sm:text-sm font-semibold transition-all ${
            activeTab === "general"
              ? "border-sage text-sage-dark"
              : "border-transparent text-muted hover:text-text"
          }`}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          </svg>
          <span>General & Shipping</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("theme")}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs sm:text-sm font-semibold transition-all ${
            activeTab === "theme"
              ? "border-sage text-sage-dark"
              : "border-transparent text-muted hover:text-text"
          }`}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4 4 4 0 014-4h2.5a.5.5 0 00.5-.5v-4a4 4 0 014-4 4 4 0 014 4v2.5a.5.5 0 00.5.5h4a4 4 0 014 4 4 4 0 01-4 4h-2.5a.5.5 0 00-.5.5v4a4 4 0 01-4 4 4 4 0 01-4-4v-2.5a.5.5 0 00-.5-.5H7z" />
          </svg>
          <span>Theme Branding Colors</span>
        </button>
      </div>

      {/* Tab 1: General & Shipping Form */}
      {activeTab === "general" && (
        <form onSubmit={handleSaveGeneral} className="space-y-6">
          {/* Announcement Banner Section */}
          <div className={`${cardClass} p-5 space-y-4`}>
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h2 className="font-heading text-base font-semibold text-text">Storefront Announcement Banner</h2>
                <p className="text-xs text-muted">Displays at the very top of all customer-facing storefront pages</p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={announcementActive}
                  onChange={(e) => setAnnouncementActive(e.target.checked)}
                  className="peer sr-only"
                />
                <div className="peer h-6 w-11 rounded-full bg-border peer-checked:bg-sage peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-['']" />
                <span className="ml-2 text-xs font-semibold text-text">
                  {announcementActive ? "Active" : "Disabled"}
                </span>
              </label>
            </div>

            <div>
              <label className={labelClass}>Banner Text</label>
              <input
                type="text"
                value={announcementText}
                onChange={(e) => setAnnouncementText(e.target.value)}
                placeholder="e.g. Free express delivery on all orders over ৳2,000 this week!"
                className={`${inputClass} mt-1 text-xs sm:text-sm`}
              />
            </div>

            {/* Live Banner Preview */}
            {announcementActive && (
              <div className="rounded-[8px] border border-sage-tint bg-sage-tint/30 p-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-sage-dark block mb-1">
                  Live Banner Preview
                </span>
                <div className="rounded-[6px] bg-sage px-3 py-2 text-center text-xs font-semibold text-white shadow-xs">
                  {announcementText || "Special announcement message appears here"}
                </div>
              </div>
            )}
          </div>

          {/* Delivery & Inventory Alerts Section */}
          <div className={`${cardClass} p-5 space-y-4`}>
            <div className="border-b border-border pb-3">
              <h2 className="font-heading text-base font-semibold text-text">Shipping Rates & Inventory Alerts</h2>
              <p className="text-xs text-muted">Default charges used for store checkout and stock warning limits</p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className={labelClass}>Inside Dhaka Delivery (৳)</label>
                <input
                  type="number"
                  min="0"
                  value={deliveryInside}
                  onChange={(e) => setDeliveryInside(e.target.value)}
                  className={`${inputClass} mt-1 font-mono text-xs sm:text-sm`}
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Outside Dhaka Delivery (৳)</label>
                <input
                  type="number"
                  min="0"
                  value={deliveryOutside}
                  onChange={(e) => setDeliveryOutside(e.target.value)}
                  className={`${inputClass} mt-1 font-mono text-xs sm:text-sm`}
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Low Stock Threshold (Units)</label>
                <input
                  type="number"
                  min="0"
                  value={lowStockThreshold}
                  onChange={(e) => setLowStockThreshold(e.target.value)}
                  className={`${inputClass} mt-1 font-mono text-xs sm:text-sm`}
                  required
                />
                <p className="mt-1 text-[11px] text-muted">
                  Products with stock ≤ this number show as low stock
                </p>
              </div>
            </div>
          </div>

          {/* Contact Details Section */}
          <div className={`${cardClass} p-5 space-y-4`}>
            <div className="border-b border-border pb-3">
              <h2 className="font-heading text-base font-semibold text-text">Customer Contact Channels</h2>
              <p className="text-xs text-muted">Displayed across footer, checkout, and customer support links</p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>WhatsApp Number</label>
                <input
                  type="text"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="e.g. 8801712345678"
                  className={`${inputClass} mt-1 font-mono text-xs sm:text-sm`}
                />
                <p className="mt-1 text-[11px] text-muted">Include country code without + sign for direct chat</p>
              </div>

              <div>
                <label className={labelClass}>Contact Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 01712345678"
                  className={`${inputClass} mt-1 font-mono text-xs sm:text-sm`}
                />
              </div>

              <div>
                <label className={labelClass}>Contact Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="support@anniymah.com (leave blank to clear)"
                  className={`${inputClass} mt-1 text-xs sm:text-sm`}
                />
              </div>

              <div>
                <label className={labelClass}>Store Address / Location</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. House 12, Road 4, Dhanmondi, Dhaka"
                  className={`${inputClass} mt-1 text-xs sm:text-sm`}
                />
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex justify-end gap-3">
            <button
              type="submit"
              disabled={savingGeneral}
              className="inline-flex items-center justify-center rounded-[8px] bg-sage px-6 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-2xs transition-colors hover:bg-sage-dark disabled:opacity-50"
            >
              {savingGeneral ? "Saving Settings..." : "Save Settings"}
            </button>
          </div>
        </form>
      )}

      {/* Tab 2: Theme Colors Customizer */}
      {activeTab === "theme" && (
        <div className="space-y-6">
          {/* Theme Banner & Reset bar */}
          <div className="flex flex-col gap-3 rounded-[12px] border border-border bg-surface p-5 sm:flex-row sm:items-center sm:justify-between shadow-2xs">
            <div>
              <h2 className="font-heading text-base font-semibold text-text">Storefront Palette & Variables</h2>
              <p className="text-xs text-muted">
                Each color maps directly to the live CSS variables used throughout the storefront. Values must be 6-digit hex.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                disabled={resettingTheme}
                className="inline-flex items-center justify-center rounded-[8px] border border-stone-300 bg-surface px-4 py-2 text-xs font-semibold text-stone-700 shadow-2xs transition-colors hover:bg-stone-100 disabled:opacity-50"
              >
                Reset All to Defaults
              </button>
              <button
                type="button"
                onClick={handleSaveTheme}
                disabled={savingTheme}
                className="inline-flex items-center justify-center rounded-[8px] bg-sage px-5 py-2 text-xs font-semibold text-white shadow-2xs transition-colors hover:bg-sage-dark disabled:opacity-50"
              >
                {savingTheme ? "Saving Colors..." : "Save Theme"}
              </button>
            </div>
          </div>

          {/* Live Mockup Preview Box */}
          <div className="rounded-[12px] border border-border bg-surface p-5 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted block mb-3">
              Interactive Storefront Mockup Preview
            </span>
            <div
              className="rounded-[10px] border p-6 transition-all"
              style={{
                backgroundColor: themeColors.bg,
                borderColor: themeColors.border,
                color: themeColors.text,
              }}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-4" style={{ borderColor: themeColors.border }}>
                <span className="font-heading text-lg font-bold" style={{ color: themeColors.text }}>
                  ANNIYMAH
                </span>
                <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ backgroundColor: themeColors.roseTint, color: themeColors.roseDark }}>
                  Luxury Perfumery
                </span>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div
                  className="rounded-[8px] border p-4 shadow-xs"
                  style={{ backgroundColor: themeColors.surface, borderColor: themeColors.border }}
                >
                  <div
                    className="h-24 w-full rounded-[6px] flex items-center justify-center text-xs font-medium"
                    style={{ backgroundColor: themeColors.mediaBg, color: themeColors.muted }}
                  >
                    Product Image Surface
                  </div>
                  <h4 className="mt-3 font-heading font-semibold text-sm" style={{ color: themeColors.text }}>
                    Amber & Oud EDP 50ml
                  </h4>
                  <p className="text-xs" style={{ color: themeColors.muted }}>
                    Rich oriental fragrance with warm amber notes
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="font-mono font-bold text-sm" style={{ color: themeColors.sageDark }}>
                      ৳3,500
                    </span>
                    <button
                      type="button"
                      className="rounded-[6px] px-3 py-1.5 text-xs font-semibold text-white shadow-xs"
                      style={{ backgroundColor: themeColors.sage }}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>

                <div
                  className="rounded-[8px] border p-4 shadow-xs flex flex-col justify-between"
                  style={{ backgroundColor: themeColors.surface, borderColor: themeColors.border }}
                >
                  <div>
                    <span className="rounded-md px-2 py-0.5 text-[11px] font-bold" style={{ backgroundColor: themeColors.sageTint, color: themeColors.sageDark }}>
                      Special Offer
                    </span>
                    <h4 className="mt-2 font-heading font-semibold text-sm" style={{ color: themeColors.text }}>
                      Complimentary Gift Wrapping
                    </h4>
                    <p className="mt-1 text-xs" style={{ color: themeColors.muted }}>
                      Every bottle arrives in our signature velvet pouch with wax seal.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="mt-4 rounded-[6px] px-3 py-1.5 text-xs font-semibold text-white"
                    style={{ backgroundColor: themeColors.rose }}
                  >
                    Explore Collection
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Color Pickers Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(Object.keys(themeColors) as Array<keyof ThemeColors>).map((key) => {
              const def = themeDefaults.find((d) => d.key === key);
              const defaultVal = def?.defaultColor ?? "#000000";
              const currentVal = themeColors[key];
              const isDefault = currentVal.toLowerCase() === defaultVal.toLowerCase();

              return (
                <div
                  key={key}
                  className="rounded-[10px] border border-border bg-surface p-4 shadow-2xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-mono text-xs font-bold text-text">--{key.replace(/([A-Z])/g, "-$1").toLowerCase()}</span>
                      <p className="mt-0.5 text-[11px] text-muted line-clamp-2">{def?.usage || key}</p>
                    </div>
                    {!isDefault && (
                      <button
                        type="button"
                        onClick={() => handleColorChange(key, defaultVal)}
                        className="text-[10px] font-semibold text-sage-dark hover:underline shrink-0"
                        title={`Reset to default ${defaultVal}`}
                      >
                        Reset
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Native color picker */}
                    <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-[8px] border border-border shadow-xs">
                      <input
                        type="color"
                        value={HEX_REGEX.test(currentVal) ? currentVal : defaultVal}
                        onChange={(e) => handleColorChange(key, e.target.value)}
                        className="absolute -top-2 -left-2 h-14 w-14 cursor-pointer border-0 p-0"
                      />
                    </div>

                    {/* Hex text input */}
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={currentVal}
                        maxLength={7}
                        onChange={(e) => handleColorChange(key, e.target.value)}
                        placeholder={defaultVal}
                        className={`${inputClass} font-mono text-xs uppercase py-1.5 px-3`}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-muted pt-1 border-t border-border/60">
                    <span>Default: <code className="font-mono">{defaultVal}</code></span>
                    {isDefault ? (
                      <span className="text-emerald-600 font-semibold">Default</span>
                    ) : (
                      <span className="text-amber-600 font-semibold">Custom</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Save Bar */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleSaveTheme}
              disabled={savingTheme}
              className="inline-flex items-center justify-center rounded-[8px] bg-sage px-6 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-2xs transition-colors hover:bg-sage-dark disabled:opacity-50"
            >
              {savingTheme ? "Saving Theme Colors..." : "Save Theme Colors"}
            </button>
          </div>
        </div>
      )}

      {/* SweetAlert-style Luxury Confirm Dialog for Theme Reset */}
      <ConfirmDialog
        open={showResetConfirm}
        variant="warning"
        title="Reset Theme to Defaults?"
        message="This will restore all 12 storefront color variables to their original factory defaults. Any custom color adjustments will be replaced."
        confirmLabel="Yes, Reset Palette"
        busy={resettingTheme}
        onConfirm={handleResetTheme}
        onCancel={() => setShowResetConfirm(false)}
      />
    </div>
  );
}
