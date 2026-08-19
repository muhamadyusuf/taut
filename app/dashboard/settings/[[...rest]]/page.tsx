"use client";

import { UserProfile } from "@clerk/nextjs";
import { Palette } from "lucide-react";
import { ThemeSwitcher, ThemeModeHint } from "@/app/_components/ThemeToggle";
import { useLocale } from "@/lib/i18n/useLocale";
import { getDictionary } from "@/lib/i18n/dictionaries";

export default function SettingsPage() {
  const t = getDictionary(useLocale()).dashboard.settings;

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-foreground mb-6">{t.accountTitle}</h2>

      {/* Menggunakan Komponen Bawaan Clerk untuk Manage Akun */}
      <div className="surface-panel overflow-hidden">
        <UserProfile
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "shadow-none border-none w-full",
              navbar: "hidden", // Sembunyikan navbar clerk agar lebih simple
              pageScrollBox: "p-0",
            },
          }}
        />
      </div>

      {/* Custom Settings App */}
      <div className="mt-8">
        <h3 className="text-lg font-bold text-foreground mb-4">{t.preferencesTitle}</h3>
        <div className="surface-panel divide-y divide-border">
          {/* Tema tampilan */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6">
            <div className="flex items-start gap-3">
              <div className="bg-brand-soft text-brand p-2 rounded-lg shrink-0">
                <Palette size={18} />
              </div>
              <div>
                <p className="font-medium text-foreground">{t.themeLabel}</p>
                <ThemeModeHint />
              </div>
            </div>
            <ThemeSwitcher className="self-start sm:self-auto" />
          </div>

          {/* Notifikasi email */}
          <div className="flex items-center justify-between gap-4 p-6">
            <div>
              <p className="font-medium text-foreground">{t.emailNotifications}</p>
              <p className="text-sm text-muted-foreground">{t.emailNotificationsHint}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-border-strong peer-focus:outline-none rounded-full peer peer-checked:bg-brand peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
