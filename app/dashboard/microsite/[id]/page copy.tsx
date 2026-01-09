"use client";

import { useUser } from "@clerk/nextjs";
import { useState, useEffect, use } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Plus, Trash2, Save, GripVertical, Type, Palette, Link as LinkIcon, Smartphone, ExternalLink, AlertCircle } from "lucide-react";
import Link from "next/link";
import { THEMES } from "@/lib/themeConfig";
import DrivePicker from "../_components/DrivePicker"; 

// --- TYPE DEFINITIONS ---
type LinkItem = {
  id: string;
  type: "link" | "header";
  label: string;
  url?: string;
  active: boolean;
};

interface MicrositeForm {
  _id: Id<"microsites">;
  slug: string;
  title: string;
  bio?: string;
  theme: string;
  links: LinkItem[];
  imageUrl?: string;
  backgroundUrl?: string;
}

// --- HELPER: Ensure URL protocol ---
const formatUrl = (url: string) => {
    if (!url) return "";
    if (!/^https?:\/\//i.test(url)) {
        return `https://${url}`;
    }
    return url;
};

// --- MAIN EDITOR COMPONENT ---
export default function MicrositeEditor({ params }: { params: Promise<{ id: Id<"microsites"> }> }) {
  const { id } = use(params);

  // Data Fetching
  const micrositeData = useQuery(api.microsites.getMicrositeById, { id });
  const updateMicrosite = useMutation(api.microsites.updateMicrosite);
  
  // Local State
  const [formData, setFormData] = useState<MicrositeForm | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDirty, setIsDirty] = useState(false); // Melacak perubahan belum disimpan
  const [isMounted, setIsMounted] = useState(false); // Fix untuk Hydration DnD

  // 1. Handle Hydration & Initial Data Load
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Hanya set data jika formData masih kosong (Initial Load)
    // Ini mencegah ketikan user tertimpa saat Convex melakukan background refresh
    if (micrositeData && !formData) {
        setFormData({
            ...micrositeData,
            links: micrositeData.links as LinkItem[]
        });
    }
  }, [micrositeData, formData]);

  // Handle Input Change Wrapper (untuk set dirty state)
  const handleInputChange = (updater: (prev: MicrositeForm) => MicrositeForm) => {
      if (!formData) return;
      setFormData(updater(formData));
      setIsDirty(true);
  };

  if (!formData || !isMounted) return <div className="p-10 text-center animate-pulse text-gray-500">Memuat Editor...</div>;

  // --- LOGIC CRUD LINKS ---
  const addLink = () => {
    const newLink: LinkItem = { id: Date.now().toString(), type: "link", label: "", url: "", active: true };
    handleInputChange(prev => ({ ...prev, links: [...prev.links, newLink] }));
  };

  const addHeader = () => {
    const newHeader: LinkItem = { id: Date.now().toString(), type: "header", label: "", active: true };
    handleInputChange(prev => ({ ...prev, links: [...prev.links, newHeader] }));
  };

  const updateItem = (index: number, field: keyof LinkItem, value: string | boolean) => {
    handleInputChange(prev => {
        const newLinks = [...prev.links];
        newLinks[index] = { ...newLinks[index], [field]: value };
        return { ...prev, links: newLinks };
    });
  };

  const deleteItem = (index: number) => {
    if(!confirm("Hapus item ini?")) return;
    handleInputChange(prev => {
        const newLinks = [...prev.links];
        newLinks.splice(index, 1);
        return { ...prev, links: newLinks };
    });
  };

  const handleOnDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    handleInputChange(prev => {
        const items = Array.from(prev.links);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination!.index, 0, reorderedItem);
        return { ...prev, links: items };
    });
  };

  // --- SAVE LOGIC ---
  const handleSave = async () => {
    if (!formData) return;
    setLoading(true);
    try {
        // Validasi data sebelum kirim (opsional)
        const cleanedLinks = formData.links.map(l => ({
            ...l,
            url: l.type === 'link' ? formatUrl(l.url || "") : undefined
        }));

        await updateMicrosite({
            id: id,
            slug: formData.slug,
            title: formData.title,
            bio: formData.bio,
            theme: formData.theme,
            links: cleanedLinks,
            imageUrl: formData.imageUrl,
            backgroundUrl: formData.backgroundUrl
        });
        
        setIsDirty(false);
        // Bisa diganti dengan Toast Library (Sonner/Hot-Toast)
        alert("Berhasil disimpan!"); 
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : "Terjadi kesalahan";
        alert("Gagal: " + errorMessage);
    } finally {
        setLoading(false);
    }
  };

  const currentTheme = THEMES[formData.theme] || THEMES["simple-blue"];

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-100px)] flex gap-8 pb-10">
      
      {/* --- LEFT: EDITOR FORM --- */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-8 no-scrollbar pb-20">
        
        {/* Header Actions */}
        <div className="flex justify-between items-center sticky top-0 bg-[#f8faff]/95 backdrop-blur z-20 py-4 border-b">
            <div className="flex items-center gap-2">
                <Link href="/dashboard/microsite" className="text-gray-400 hover:text-gray-600 transition">← Kembali</Link>
                <div className="flex flex-col">
                    <h1 className="text-xl font-bold flex items-center gap-2">
                        Edit: {formData.title}
                        {isDirty && <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" title="Perubahan belum disimpan"></span>}
                    </h1>
                </div>
            </div>
            <button 
                onClick={handleSave} 
                disabled={loading || !isDirty} 
                className={`px-6 py-2 rounded-full font-bold flex items-center gap-2 transition shadow-sm
                    ${isDirty 
                        ? 'bg-[#0193ff] text-white hover:bg-[#007acc]' 
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
            >
                <Save size={18}/> {loading ? "Menyimpan..." : "Simpan"}
            </button>
        </div>

        {/* 1. Appearance Section */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border space-y-6">
            <div className="flex items-center gap-2 text-gray-700 font-bold border-b pb-2"><Palette size={18}/> Tampilan</div>
            
            <div className="grid md:grid-cols-2 gap-4">
                <DrivePicker 
                    label="Foto Profil" 
                    currentUrl={formData.imageUrl} 
                    onSelect={(url) => handleInputChange(prev => ({...prev, imageUrl: url}))}
                />
                <DrivePicker 
                    label="Background" 
                    currentUrl={formData.backgroundUrl} 
                    onSelect={(url) => handleInputChange(prev => ({...prev, backgroundUrl: url}))}
                />
            </div>

            {/* Theme Selector */}
            <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Pilih Tema</label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {Object.entries(THEMES).map(([key, style]) => (
                        <button 
                            key={key} 
                            onClick={() => handleInputChange(prev => ({...prev, theme: key}))}
                            className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all group ${formData.theme === key ? 'border-[#0193ff] ring-2 ring-blue-100 scale-105 shadow-md' : 'border-transparent hover:border-gray-200'}`}
                        >
                            <div className={`w-full h-full ${style.bg}`}></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className={`w-8 h-2 rounded shadow-sm ${style.button.split(' ')[0]}`}></div>
                            </div>
                            <div className="absolute bottom-0 w-full bg-black/60 text-[9px] text-white text-center py-1 truncate px-1">{style.label}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="text-xs font-bold text-gray-400 block mb-1">Nama Tampilan</label>
                    <input 
                        type="text" 
                        value={formData.title} 
                        onChange={e => handleInputChange(prev => ({...prev, title: e.target.value}))} 
                        className="w-full p-3 border border-gray-200 rounded-xl font-bold focus:ring-2 focus:ring-[#0193ff]/20 focus:border-[#0193ff] outline-none transition"
                    />
                </div>
                <div>
                     <label className="text-xs font-bold text-gray-400 block mb-1">URL Bio (Slug)</label>
                     <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50 overflow-hidden focus-within:ring-2 focus-within:ring-[#0193ff]/20 focus-within:border-[#0193ff] transition">
                        <span className="pl-3 text-gray-400 text-sm">/</span>
                        <input 
                            type="text" 
                            value={formData.slug} 
                            onChange={e => handleInputChange(prev => ({...prev, slug: e.target.value}))} 
                            className="w-full p-3 bg-transparent font-mono text-[#0193ff] outline-none"
                        />
                     </div>
                </div>
            </div>
            <textarea 
                placeholder="Bio / Deskripsi singkat..." 
                value={formData.bio || ""} 
                onChange={e => handleInputChange(prev => ({...prev, bio: e.target.value}))} 
                className="w-full p-3 border border-gray-200 rounded-xl h-24 text-sm focus:ring-2 focus:ring-[#0193ff]/20 focus:border-[#0193ff] outline-none transition resize-none"
            />
        </div>

        {/* 2. Link Builder Section */}
        <div className="space-y-4">
             <div className="flex justify-between items-center sticky top-[72px] bg-[#f8faff] z-10 py-2">
                <h3 className="font-bold text-gray-700 flex items-center gap-2"><LinkIcon size={18}/> Konten Link</h3>
                <div className="flex gap-2">
                    <button onClick={addHeader} className="text-xs font-bold bg-white border hover:bg-gray-50 text-gray-600 px-3 py-2 rounded-lg flex gap-1 items-center shadow-sm transition"><Type size={14}/> Header</button>
                    <button onClick={addLink} className="text-xs font-bold bg-[#0193ff] hover:bg-blue-600 text-white px-3 py-2 rounded-lg flex gap-1 items-center shadow-sm transition"><Plus size={14}/> Link</button>
                </div>
            </div>

            <DragDropContext onDragEnd={handleOnDragEnd}>
                <Droppable droppableId="links-list">
                    {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3 pb-4">
                            {formData.links.map((item, index) => (
                                <Draggable key={item.id} draggableId={item.id} index={index}>
                                    {(provided, snapshot) => (
                                        <div 
                                            ref={provided.innerRef} 
                                            {...provided.draggableProps} 
                                            className={`bg-white border rounded-xl p-4 flex gap-3 items-center transition-all ${
                                                snapshot.isDragging ? 'shadow-lg rotate-1 scale-[1.02] z-50' : 'shadow-sm'
                                            } ${item.type === 'header' ? 'border-l-4 border-l-gray-300 bg-gray-50/50' : 'border-l-4 border-l-[#0193ff]'}`}
                                        >
                                            <div {...provided.dragHandleProps} className="text-gray-300 cursor-grab active:cursor-grabbing hover:text-gray-500 p-1"><GripVertical size={20}/></div>
                                            
                                            <div className="flex-1 space-y-1">
                                                {/* Label Input */}
                                                <input 
                                                    type="text" 
                                                    value={item.label} 
                                                    onChange={e => updateItem(index, 'label', e.target.value)}
                                                    className={`w-full bg-transparent font-bold focus:outline-none placeholder:text-gray-300 ${item.type === 'header' ? 'text-sm uppercase tracking-wider text-gray-600' : 'text-gray-800'}`}
                                                    placeholder={item.type === 'header' ? "JUDUL KATEGORI" : "Label Tombol"}
                                                    autoFocus={item.label === ""}
                                                />
                                                {/* URL Input */}
                                                {item.type === 'link' && (
                                                    <div className="flex items-center gap-2">
                                                        <ExternalLink size={12} className="text-gray-300"/>
                                                        <input 
                                                            type="text" 
                                                            value={item.url || ""} 
                                                            onChange={e => updateItem(index, 'url', e.target.value)}
                                                            className="w-full text-xs text-gray-500 bg-transparent py-1 rounded focus:outline-none focus:text-[#0193ff]"
                                                            placeholder="https://tujuan.com"
                                                        />
                                                    </div>
                                                )}
                                            </div>

                                            <button onClick={() => deleteItem(index)} className="text-gray-300 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition group" title="Hapus">
                                                <Trash2 size={16} className="group-hover:scale-110 transition"/>
                                            </button>
                                        </div>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>
            
            {formData.links.length === 0 && (
                <div className="text-center p-12 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 flex flex-col items-center gap-2">
                    <AlertCircle size={32} className="opacity-20"/>
                    <p>Belum ada tautan.</p>
                    <p className="text-xs">Klik tombol di atas untuk menambah konten.</p>
                </div>
            )}
        </div>
      </div>

      {/* --- RIGHT: LIVE PREVIEW --- */}
      <div className="w-[340px] hidden lg:block pt-4 h-full sticky top-4">
         <div className="border-[10px] border-gray-800 rounded-[3rem] h-[680px] overflow-hidden shadow-2xl bg-gray-100 relative ring-1 ring-gray-950/50">
             
             {/* Dynamic Background */}
             <div className={`absolute inset-0 z-0 transition-colors duration-500 ${currentTheme.bg}`}>
                 {formData.backgroundUrl && (
                     <>
                        <img src={formData.backgroundUrl} className="w-full h-full object-cover opacity-90 transition-opacity" alt="background" />
                        <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]"></div>
                     </>
                 )}
             </div>

             {/* Content Area */}
             <div className="relative z-10 p-6 h-full overflow-y-auto no-scrollbar flex flex-col items-center pt-14">
                 {/* Avatar */}
                 <div className="w-24 h-24 rounded-full border-4 border-white/80 shadow-lg overflow-hidden mb-4 bg-gray-200 shrink-0 relative group cursor-pointer">
                     {formData.imageUrl ? (
                        <img src={formData.imageUrl} className="w-full h-full object-cover" alt="profile" />
                     ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No img</div>
                     )}
                 </div>
                 
                 <h2 className={`font-bold text-lg text-center leading-snug break-words max-w-full ${currentTheme.text}`}>
                     {formData.title || "Nama Anda"}
                 </h2>
                 <p className={`text-xs text-center mt-2 mb-8 px-2 opacity-90 leading-relaxed whitespace-pre-wrap ${currentTheme.text}`}>
                     {formData.bio || "Tulis deskripsi singkat tentang diri anda disini."}
                 </p>

                 {/* Links Render */}
                 <div className="w-full space-y-3 pb-10">
                     {formData.links.map((item) => (
                         item.type === 'header' ? (
                             <h3 key={item.id} className={`text-center text-[10px] font-bold uppercase tracking-[0.2em] mt-6 mb-1 opacity-70 ${currentTheme.header || currentTheme.text}`}>
                                 {item.label}
                             </h3>
                         ) : (
                             <div 
                                key={item.id} 
                                className={`w-full py-3.5 px-4 rounded-xl font-bold text-center text-sm transition-transform active:scale-95 shadow-sm flex items-center justify-center min-h-[48px] ${currentTheme.button}`}
                             >
                                 {item.label || "Link Tanpa Label"}
                             </div>
                         )
                     ))}
                 </div>
             </div>
         </div>
         <div className="text-center mt-6 text-xs font-medium text-gray-400 flex items-center justify-center gap-2">
            <Smartphone size={14}/> Live Preview
         </div>
      </div>

    </div>
  );
}