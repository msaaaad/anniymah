import { serverFetch } from "@/lib/api-server";
import type { StoreSettings, ThemeColorDefault } from "@/lib/api-types";
import { SettingsManager } from "@/components/admin/SettingsManager";

export const metadata = { title: "Store Settings · Anniymah Admin" };

export default async function SettingsPage() {
  const [settings, themeDefaults] = await Promise.all([
    serverFetch<StoreSettings>("/settings"),
    serverFetch<ThemeColorDefault[]>("/settings/theme/defaults"),
  ]);

  return <SettingsManager initialSettings={settings} themeDefaults={themeDefaults} />;
}
