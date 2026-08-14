"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Loader2, Save, Eye, EyeOff, Store, Link as LinkIcon, AlertCircle, Palette, Check, Paintbrush } from "lucide-react";

// --- PRESET PRIMARY COLORS ---
const PRESET_COLORS = [
  "#3B82F6", // biru
  "#EF4444", // merah
  "#10B981", // hijau
  "#F59E0B", // amber
  "#8B5CF6", // ungu
  "#EC4899", // pink
  "#14B8A6", // teal
  "#F97316", // orange
  "#06B6D4", // cyan
  "#1E293B", // slate gelap
];

// --- THEME DEFINITIONS (untuk preview di settings) ---
const SHOP_THEMES = [
  {
    key: "classic",
    name: "Classic Blue",
    description: "Bersih & profesional, aksen biru cerah.",
    // Warna preview sengaja literal (bukan token tema aplikasi), karena yang
    // digambarkan adalah tampilan HALAMAN TOKO PUBLIK — bukan dashboard ini.
    preview: {
      bg: "bg-slate-100",
      header: "bg-white border border-slate-200",
      card: "bg-white border border-slate-200",
      btn: "bg-blue-500",
      accent: "text-blue-500",
    },
  },
  {
    key: "dark",
    name: "Dark Elegant",
    description: "Mewah & modern, tema gelap dengan aksen emas.",
    preview: {
      bg: "bg-gray-900",
      header: "bg-gray-800 border border-gray-700",
      card: "bg-gray-800 border border-gray-700",
      btn: "bg-amber-500",
      accent: "text-amber-400",
    },
  },
  {
    key: "minimal",
    name: "Warm Minimal",
    description: "Hangat & simpel, tampilan bersih tanpa distraksi.",
    preview: {
      bg: "bg-stone-100",
      header: "bg-stone-50 border border-stone-200",
      card: "bg-white border border-stone-200",
      btn: "bg-stone-900",
      accent: "text-stone-900",
    },
  },
] as const;

export default function ShopSettingsPage() {
  // 1. Fetch Data Existing
  const settings = useQuery(api.shop.getMySettings);
  const saveSettings = useMutation(api.shop.saveShopSettings);
  
  // 2. State Form
  const [form, setForm] = useState({
    shopName: "",
    slug: "",
    logoUrl: "",
    description: "",
    theme: "classic",
    primaryColor: "",
    clientKey: "",
    serverKey: "",
    isProduction: false,
  });

  const [showKey, setShowKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // 3. Populate Form saat data tersedia
  useEffect(() => {
    if (settings) {
        setForm({
            shopName: settings.shopName || "",
            slug: settings.slug || "",
            logoUrl: settings.logoUrl || "",
            description: settings.description || "",
            theme: settings.theme || "classic",
            primaryColor: settings.primaryColor || "",
            clientKey: settings.clientKey || "",
            serverKey: settings.serverKey || "",
            isProduction: settings.isProduction || false,
        });
    }
  }, [settings]);

  // 4. Handler Simpan
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
        await saveSettings(form);
        alert("Pengaturan toko berhasil disimpan!");
    } catch (err: unknown) {
        console.error(err);
        const message = err instanceof Error ? err.message : "Terjadi kesalahan";
        alert("Gagal menyimpan: " + message);
    } finally {
        setIsSaving(false);
    }
  };

  // 5. Handler Input Slug (Auto Format)
  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Hanya izinkan huruf kecil, angka, dan strip
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-");
    setForm({ ...form, slug: value });
  };

  // Loading State saat fetch awal
  if (settings === undefined) {
    return (
        <div className="flex flex-col items-center justify-center h-64 gap-2 text-muted-foreground">
            <Loader2 className="animate-spin" />
            <span className="text-sm">Memuat pengaturan...</span>
        </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      
      {/* HEADER */}
      <div>
        <h2 className="text-xl font-bold text-foreground">Pengaturan Toko</h2>
        <p className="text-sm text-muted-foreground">Kelola identitas toko dan konfigurasi pembayaran Anda.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        
        {/* --- BAGIAN 1: IDENTITAS TOKO --- */}
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm space-y-6">
            <div className="flex items-center gap-2 border-b border-border pb-4 mb-4">
                <Store className="text-brand" size={20} />
                <h3 className="font-bold text-foreground">Identitas Toko</h3>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Nama Toko */}
                <div className="col-span-2 md:col-span-1">
                    <label className="block text-sm font-bold text-foreground mb-1">Nama Toko</label>
                    <input 
                        required 
                        value={form.shopName} 
                        onChange={e => setForm({...form, shopName: e.target.value})}
                        className="w-full bg-input text-foreground border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand focus:outline-none transition" 
                        placeholder="Contoh: Toko Berkah Abadi"
                    />
                </div>

                {/* Slug URL */}
                <div className="col-span-2 md:col-span-1">
                    <label className="block text-sm font-bold text-foreground mb-1">URL Toko (Slug)</label>
                    <div className="flex items-center">
                        <span className="bg-muted border border-border border-r-0 rounded-l-lg px-3 py-2 text-muted-foreground text-sm font-mono whitespace-nowrap">
                            singkat.in/s/
                        </span>
                        <input 
                            required 
                            value={form.slug} 
                            onChange={handleSlugChange}
                            className="w-full border border-border rounded-r-lg px-3 py-2 font-mono text-sm focus:ring-2 focus:ring-brand focus:outline-none transition" 
                            placeholder="toko-berkah"
                        />
                    </div>
                    <p className="text-[10px] text-subtle mt-1">Hanya huruf kecil, angka, dan tanda strip (-).</p>
                </div>

                {/* Logo URL */}
                <div className="col-span-2">
                    <label className="block text-sm font-bold text-foreground mb-1">Logo URL (Opsional)</label>
                    <div className="flex gap-4 items-start">
                        <input 
                            value={form.logoUrl} 
                            onChange={e => setForm({...form, logoUrl: e.target.value})}
                            className="flex-1 bg-input text-foreground border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand focus:outline-none transition" 
                            placeholder="https://i.imgur.com/..."
                        />
                        {form.logoUrl && (
                            <div className="w-10 h-10 rounded-full border bg-muted overflow-hidden shrink-0">
                                <img src={form.logoUrl} alt="Preview" className="w-full h-full object-cover" />
                            </div>
                        )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Masukkan link gambar langsung (Direct Link).</p>
                </div>

                {/* Deskripsi Toko */}
                <div className="col-span-2">
                    <label className="block text-sm font-bold text-foreground mb-1">Deskripsi Toko <span className="font-normal text-subtle">(Opsional)</span></label>
                    <textarea
                        rows={3}
                        value={form.description}
                        onChange={e => setForm({ ...form, description: e.target.value })}
                        className="w-full bg-input text-foreground border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand focus:outline-none transition resize-none"
                        placeholder="Ceritakan sedikit tentang toko Anda. Teks ini akan tampil di halaman toko publik."
                    />
                    <p className="text-xs text-subtle mt-1">{form.description.length}/300 karakter</p>
                </div>
            </div>
        </div>

        {/* --- BAGIAN 1b: TAMPILAN TOKO --- */}
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm space-y-6">
            <div className="flex items-center gap-2 border-b border-border pb-4 mb-4">
                <Palette className="text-info" size={20} />
                <h3 className="font-bold text-foreground">Template Tampilan</h3>
            </div>
            <p className="text-sm text-muted-foreground -mt-2">Pilih tema visual untuk halaman toko publik Anda.</p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {SHOP_THEMES.map((theme) => {
                    const isSelected = form.theme === theme.key;
                    return (
                        <button
                            key={theme.key}
                            type="button"
                            onClick={() => setForm({ ...form, theme: theme.key })}
                            className={`relative text-left rounded-xl border-2 p-4 transition-all ${
                                isSelected
                                    ? "border-brand bg-brand-soft shadow-md"
                                    : "border-border hover:border-border-strong hover:shadow-sm"
                            }`}
                        >
                            {/* Check badge */}
                            {isSelected && (
                                <span className="absolute top-2 right-2 bg-brand text-brand-contrast rounded-full p-0.5">
                                    <Check size={10} />
                                </span>
                            )}

                            {/* Mini preview */}
                            <div className={`w-full h-16 rounded-lg mb-3 p-2 flex flex-col gap-1.5 ${theme.preview.bg}`}>
                                <div className={`w-full h-4 rounded ${theme.preview.header}`}></div>
                                <div className="flex gap-1.5 flex-1">
                                    <div className={`flex-1 rounded ${theme.preview.card}`}></div>
                                    <div className={`flex-1 rounded ${theme.preview.card}`}></div>
                                    <div className={`flex-1 rounded ${theme.preview.card} hidden sm:block`}></div>
                                </div>
                            </div>

                            <div className={`text-xs font-bold mb-0.5 ${isSelected ? "text-brand-soft-fg" : "text-foreground"}`}>{theme.name}</div>
                            <div className="text-xs text-muted-foreground leading-snug">{theme.description}</div>

                            {/* Accent dot */}
                            <div className={`mt-2 w-5 h-1.5 rounded-full ${theme.preview.btn}`}></div>
                        </button>
                    );
                })}
            </div>
        </div>

        {/* --- BAGIAN 1c: WARNA PRIMER --- */}
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm space-y-5">
            <div className="flex items-center gap-2 border-b border-border pb-4 mb-4">
                <Paintbrush className="text-info" size={20} />
                <h3 className="font-bold text-foreground">Warna Primer</h3>
            </div>
            <p className="text-sm text-muted-foreground -mt-2">
                Kustomisasi warna aksen tombol, harga, dan link di halaman toko publik.
                Biarkan &quot;Auto&quot; untuk mengikuti warna default tema.
            </p>

            {/* Swatch Presets */}
            <div className="flex flex-wrap gap-2.5 items-center">
                {/* Auto (gunakan default tema) */}
                <button
                    type="button"
                    title="Gunakan default tema"
                    onClick={() => setForm({ ...form, primaryColor: "" })}
                    className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all ${
                        !form.primaryColor
                            ? "border-foreground shadow-md scale-110"
                            : "border-border hover:border-border-strong"
                    }`}
                >
                    <span className="text-[9px] font-bold text-muted-foreground leading-none">Auto</span>
                </button>

                {PRESET_COLORS.map((color) => (
                    <button
                        type="button"
                        key={color}
                        title={color}
                        onClick={() => setForm({ ...form, primaryColor: color })}
                        style={{ backgroundColor: color }}
                        className={`w-9 h-9 rounded-full border-2 transition-all ${
                            form.primaryColor === color
                                ? "border-foreground scale-110 shadow-md"
                                : "border-transparent hover:scale-105 hover:shadow-sm"
                        }`}
                    />
                ))}
            </div>

            {/* Custom color input */}
            <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                    <label className="text-sm font-bold text-foreground">Warna Kustom:</label>
                    <input
                        type="color"
                        value={form.primaryColor || "#3B82F6"}
                        onChange={e => setForm({ ...form, primaryColor: e.target.value })}
                        className="w-10 h-10 rounded-lg border border-border cursor-pointer p-0.5"
                    />
                </div>
                <input
                    type="text"
                    value={form.primaryColor}
                    onChange={e => {
                        const val = e.target.value;
                        if (/^#?[0-9A-Fa-f]{0,6}$/.test(val)) {
                            setForm({ ...form, primaryColor: val.startsWith("#") || val === "" ? val : "#" + val });
                        }
                    }}
                    className="w-32 bg-input text-foreground border border-border rounded-lg px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-brand focus:outline-none transition"
                    placeholder="#3B82F6"
                    maxLength={7}
                />
                {form.primaryColor && (
                    <button
                        type="button"
                        onClick={() => setForm({ ...form, primaryColor: "" })}
                        className="text-xs text-subtle hover:text-danger transition"
                    >
                        Reset ke default
                    </button>
                )}
            </div>

            {/* Live preview */}
            {form.primaryColor && /^#[0-9A-Fa-f]{6}$/.test(form.primaryColor) && (
                <div className="flex items-center gap-4 p-3 bg-muted rounded-xl border border-border flex-wrap">
                    <button
                        type="button"
                        style={{ backgroundColor: form.primaryColor }}
                        className="px-4 py-2 rounded-xl text-white text-sm font-bold shadow-sm pointer-events-none"
                    >
                        + Tambah ke Keranjang
                    </button>
                    <span className="text-base font-extrabold" style={{ color: form.primaryColor }}>
                        Rp 150.000
                    </span>
                    <span className="text-xs text-subtle italic">← Preview warna primer</span>
                </div>
            )}
        </div>

        {/* --- BAGIAN 2: INTEGRASI MIDTRANS --- */}
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm space-y-6">
            <div className="flex items-center gap-2 border-b border-border pb-4 mb-4">
                <LinkIcon className="text-success" size={20} />
                <h3 className="font-bold text-foreground">Pembayaran (Midtrans)</h3>
            </div>

            {/* Environment Toggle */}
            <div className="p-4 bg-brand-soft rounded-lg border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h4 className="font-bold text-brand-soft-fg text-sm">Mode Environment</h4>
                    <p className="text-xs text-muted-foreground">Pilih &apos;Sandbox&apos; untuk testing, &apos;Production&apos; untuk menerima uang asli.</p>
                </div>
                <div className="flex bg-card rounded-md border shadow-sm overflow-hidden shrink-0">
                    <button 
                        type="button"
                        onClick={() => setForm({ ...form, isProduction: false })}
                        className={`px-4 py-2 text-xs font-bold transition-colors ${!form.isProduction ? 'bg-warning-soft text-warning' : 'text-muted-foreground hover:bg-muted'}`}
                    >
                        SANDBOX
                    </button>
                    <div className="w-px bg-border"></div>
                    <button 
                        type="button"
                        onClick={() => setForm({ ...form, isProduction: true })}
                        className={`px-4 py-2 text-xs font-bold transition-colors ${form.isProduction ? 'bg-success-soft text-success' : 'text-muted-foreground hover:bg-muted'}`}
                    >
                        PRODUCTION
                    </button>
                </div>
            </div>

            <div className="grid gap-6">
                <div>
                    <label className="block text-sm font-bold text-foreground mb-1">Client Key</label>
                    <input 
                        required 
                        value={form.clientKey} 
                        onChange={e => setForm({...form, clientKey: e.target.value})}
                        className="w-full bg-input text-foreground border border-border rounded-lg px-3 py-2 font-mono text-sm focus:ring-2 focus:ring-brand focus:outline-none transition" 
                        placeholder={form.isProduction ? "Mid-client-..." : "SB-Mid-client-..."}
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-foreground mb-1">Server Key</label>
                    <div className="relative">
                        <input 
                            required 
                            type={showKey ? "text" : "password"}
                            value={form.serverKey} 
                            onChange={e => setForm({...form, serverKey: e.target.value})}
                            className="w-full bg-input text-foreground border border-border rounded-lg px-3 py-2 font-mono text-sm pr-10 focus:ring-2 focus:ring-brand focus:outline-none transition" 
                            placeholder={form.isProduction ? "Mid-server-..." : "SB-Mid-server-..."}
                        />
                        <button 
                            type="button" 
                            onClick={() => setShowKey(!showKey)} 
                            className="absolute right-3 top-2.5 text-subtle hover:text-muted-foreground transition"
                        >
                            {showKey ? <EyeOff size={16}/> : <Eye size={16}/>}
                        </button>
                    </div>
                    <div className="flex items-start gap-2 mt-2 text-xs text-warning bg-warning-soft p-2 rounded border border-warning/25">
                        <AlertCircle size={14} className="mt-0.5 shrink-0"/>
                        <p>Server Key bersifat <b>RAHASIA</b>. Jangan pernah membagikannya kepada siapa pun selain di panel ini.</p>
                    </div>
                </div>
            </div>
        </div>

        {/* --- ACTION BUTTON --- */}
        <div className="flex justify-end pt-4">
            <button 
                disabled={isSaving} 
                type="submit" 
                className="btn-saweria w-full sm:w-auto px-8 py-3 rounded-xl flex justify-center items-center gap-2"
            >
                {isSaving ? <Loader2 className="animate-spin" size={20}/> : <Save size={20}/>} 
                Simpan Perubahan
            </button>
        </div>

      </form>
    </div>
  );
}