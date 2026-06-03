"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Loader2, Save, Eye, EyeOff, Store, Link as LinkIcon, AlertCircle, Palette, Check } from "lucide-react";

// --- THEME DEFINITIONS (untuk preview di settings) ---
const SHOP_THEMES = [
  {
    key: "classic",
    name: "Classic Blue",
    description: "Bersih & profesional, aksen biru cerah.",
    preview: {
      bg: "bg-gray-100",
      header: "bg-white border border-gray-200",
      card: "bg-white border border-gray-200",
      btn: "bg-blue-600",
      accent: "text-blue-600",
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
      card: "bg-white border border-stone-100",
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
        <div className="flex flex-col items-center justify-center h-64 gap-2 text-gray-500">
            <Loader2 className="animate-spin" />
            <span className="text-sm">Memuat pengaturan...</span>
        </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      
      {/* HEADER */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">Pengaturan Toko</h2>
        <p className="text-sm text-gray-500">Kelola identitas toko dan konfigurasi pembayaran Anda.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        
        {/* --- BAGIAN 1: IDENTITAS TOKO --- */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
            <div className="flex items-center gap-2 border-b pb-4 mb-4">
                <Store className="text-blue-600" size={20} />
                <h3 className="font-bold text-gray-800">Identitas Toko</h3>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Nama Toko */}
                <div className="col-span-2 md:col-span-1">
                    <label className="block text-sm font-bold text-gray-700 mb-1">Nama Toko</label>
                    <input 
                        required 
                        value={form.shopName} 
                        onChange={e => setForm({...form, shopName: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none transition" 
                        placeholder="Contoh: Toko Berkah Abadi"
                    />
                </div>

                {/* Slug URL */}
                <div className="col-span-2 md:col-span-1">
                    <label className="block text-sm font-bold text-gray-700 mb-1">URL Toko (Slug)</label>
                    <div className="flex items-center">
                        <span className="bg-gray-100 border border-gray-300 border-r-0 rounded-l-lg px-3 py-2 text-gray-500 text-sm font-mono whitespace-nowrap">
                            singkat.in/s/
                        </span>
                        <input 
                            required 
                            value={form.slug} 
                            onChange={handleSlugChange}
                            className="w-full border border-gray-300 rounded-r-lg px-3 py-2 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition" 
                            placeholder="toko-berkah"
                        />
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">Hanya huruf kecil, angka, dan tanda strip (-).</p>
                </div>

                {/* Logo URL */}
                <div className="col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-1">Logo URL (Opsional)</label>
                    <div className="flex gap-4 items-start">
                        <input 
                            value={form.logoUrl} 
                            onChange={e => setForm({...form, logoUrl: e.target.value})}
                            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition" 
                            placeholder="https://i.imgur.com/..."
                        />
                        {form.logoUrl && (
                            <div className="w-10 h-10 rounded-full border bg-gray-50 overflow-hidden shrink-0">
                                <img src={form.logoUrl} alt="Preview" className="w-full h-full object-cover" />
                            </div>
                        )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Masukkan link gambar langsung (Direct Link).</p>
                </div>

                {/* Deskripsi Toko */}
                <div className="col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-1">Deskripsi Toko <span className="font-normal text-gray-400">(Opsional)</span></label>
                    <textarea
                        rows={3}
                        value={form.description}
                        onChange={e => setForm({ ...form, description: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition resize-none"
                        placeholder="Ceritakan sedikit tentang toko Anda. Teks ini akan tampil di halaman toko publik."
                    />
                    <p className="text-xs text-gray-400 mt-1">{form.description.length}/300 karakter</p>
                </div>
            </div>
        </div>

        {/* --- BAGIAN 1b: TAMPILAN TOKO --- */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
            <div className="flex items-center gap-2 border-b pb-4 mb-4">
                <Palette className="text-purple-600" size={20} />
                <h3 className="font-bold text-gray-800">Template Tampilan</h3>
            </div>
            <p className="text-sm text-gray-500 -mt-2">Pilih tema visual untuk halaman toko publik Anda.</p>

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
                                    ? "border-blue-500 bg-blue-50 shadow-md"
                                    : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                            }`}
                        >
                            {/* Check badge */}
                            {isSelected && (
                                <span className="absolute top-2 right-2 bg-blue-600 text-white rounded-full p-0.5">
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

                            <div className={`text-xs font-bold mb-0.5 ${isSelected ? "text-blue-700" : "text-gray-800"}`}>{theme.name}</div>
                            <div className="text-xs text-gray-500 leading-snug">{theme.description}</div>

                            {/* Accent dot */}
                            <div className={`mt-2 w-5 h-1.5 rounded-full ${theme.preview.btn}`}></div>
                        </button>
                    );
                })}
            </div>
        </div>

        {/* --- BAGIAN 2: INTEGRASI MIDTRANS --- */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
            <div className="flex items-center gap-2 border-b pb-4 mb-4">
                <LinkIcon className="text-green-600" size={20} />
                <h3 className="font-bold text-gray-800">Pembayaran (Midtrans)</h3>
            </div>

            {/* Environment Toggle */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h4 className="font-bold text-blue-900 text-sm">Mode Environment</h4>
                    <p className="text-xs text-blue-700">Pilih &apos;Sandbox&apos; untuk testing, &apos;Production&apos; untuk menerima uang asli.</p>
                </div>
                <div className="flex bg-white rounded-md border shadow-sm overflow-hidden shrink-0">
                    <button 
                        type="button"
                        onClick={() => setForm({ ...form, isProduction: false })}
                        className={`px-4 py-2 text-xs font-bold transition-colors ${!form.isProduction ? 'bg-orange-100 text-orange-700' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        SANDBOX
                    </button>
                    <div className="w-px bg-gray-200"></div>
                    <button 
                        type="button"
                        onClick={() => setForm({ ...form, isProduction: true })}
                        className={`px-4 py-2 text-xs font-bold transition-colors ${form.isProduction ? 'bg-green-100 text-green-700' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        PRODUCTION
                    </button>
                </div>
            </div>

            <div className="grid gap-6">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Client Key</label>
                    <input 
                        required 
                        value={form.clientKey} 
                        onChange={e => setForm({...form, clientKey: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono text-sm focus:ring-2 focus:ring-green-500 focus:outline-none transition" 
                        placeholder={form.isProduction ? "Mid-client-..." : "SB-Mid-client-..."}
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Server Key</label>
                    <div className="relative">
                        <input 
                            required 
                            type={showKey ? "text" : "password"}
                            value={form.serverKey} 
                            onChange={e => setForm({...form, serverKey: e.target.value})}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono text-sm pr-10 focus:ring-2 focus:ring-green-500 focus:outline-none transition" 
                            placeholder={form.isProduction ? "Mid-server-..." : "SB-Mid-server-..."}
                        />
                        <button 
                            type="button" 
                            onClick={() => setShowKey(!showKey)} 
                            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 transition"
                        >
                            {showKey ? <EyeOff size={16}/> : <Eye size={16}/>}
                        </button>
                    </div>
                    <div className="flex items-start gap-2 mt-2 text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-100">
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
                className="w-full sm:w-auto bg-black text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2 transition transform active:scale-95 shadow-lg"
            >
                {isSaving ? <Loader2 className="animate-spin" size={20}/> : <Save size={20}/>} 
                Simpan Perubahan
            </button>
        </div>

      </form>
    </div>
  );
}