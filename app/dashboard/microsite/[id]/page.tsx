"use client";

import { useUser } from "@clerk/nextjs"; // 1. Pastikan ini ada
import { useState, useEffect, use } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Plus, Trash2, Save, GripVertical, Type, Palette, Link as LinkIcon, Smartphone, ExternalLink, AlertCircle, ChevronDown, X } from "lucide-react";
import Link from "next/link";
import { THEMES } from "@/lib/themeConfig";
import DrivePicker from "../_components/DrivePicker"; 
import { getIcon, ICONS } from "@/lib/iconMap"; // Import Icon Map
import { useLocale } from "@/lib/i18n/useLocale";
import { getDictionary } from "@/lib/i18n/dictionaries";

// ... (TYPE DEFINITIONS & HELPER tetap sama) ...
type LinkItem = {
  id: string;
  type: "link" | "header";
  label: string;
  url?: string;
  icon?: string;
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

const formatUrl = (url: string) => {
    if (!url) return "";
    if (!/^https?:\/\//i.test(url)) {
        return `https://${url}`;
    }
    return url;
};

export default function MicrositeEditor({ params }: { params: Promise<{ id: Id<"microsites"> }> }) {
  const { id } = use(params);

  const dict = getDictionary(useLocale()).dashboard;
  const t = dict.micrositeEditor;
  
  // 2. Ambil data user yang sedang login dari Clerk
  const { user } = useUser(); 

  const micrositeData = useQuery(api.microsites.getMicrositeById, { id });
  const updateMicrosite = useMutation(api.microsites.updateMicrosite);
  
  const [formData, setFormData] = useState<MicrositeForm | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [activeIconPicker, setActiveIconPicker] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (micrositeData && !formData) {
        setFormData({
            ...micrositeData,
            links: micrositeData.links as LinkItem[]
        });
    }
  }, [micrositeData, formData]);

  const handleInputChange = (updater: (prev: MicrositeForm) => MicrositeForm) => {
      if (!formData) return;
      setFormData(updater(formData));
      setIsDirty(true);
  };

  if (!formData || !isMounted) return <div className="p-10 text-center animate-pulse text-muted-foreground">{t.loading}</div>;

  // ... (LOGIC CRUD: addLink, addHeader, updateItem, deleteItem, handleOnDragEnd tetap sama) ...
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
    if(!confirm(t.deleteItemConfirm)) return;
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

  const handleSave = async () => {
    if (!formData) return;
    setLoading(true);
    try {
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
        alert(t.saved); 
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : dict.common.genericError;
        alert(t.saveFailed(errorMessage));
    } finally {
        setLoading(false);
    }
  };

  const currentTheme = THEMES[formData.theme] || THEMES["simple-blue"];

  // 3. LOGIC PENENTUAN GAMBAR UTAMA
  // Jika formData.imageUrl ada isinya (custom upload), pakai itu.
  // Jika kosong, pakai user?.imageUrl (dari Clerk).
  const displayImage = formData.imageUrl || user?.imageUrl;

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-100px)] flex gap-8 pb-10">
      
      {/* --- LEFT: EDITOR FORM --- */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-8 no-scrollbar pb-20">
        
        {/* Header Actions */}
        <div className="flex justify-between items-center sticky top-0 glass z-20 py-4 border-b border-border">
            <div className="flex items-center gap-2">
                <Link href="/dashboard/microsite" className="text-subtle hover:text-muted-foreground transition">{t.back}</Link>
                <h1 className="text-xl font-bold flex items-center gap-2">
                    {t.editPrefix} {formData.title}
                    {isDirty && <span className="w-2 h-2 bg-warning rounded-full animate-pulse" title={t.unsavedTitle}></span>}
                </h1>
            </div>
            <button 
                onClick={handleSave} 
                disabled={loading || !isDirty} 
                className={`px-6 py-2 rounded-full font-bold flex items-center gap-2 transition shadow-sm
                    ${isDirty 
                        ? 'bg-brand text-brand-contrast hover:bg-brand-hover' 
                        : 'bg-muted text-subtle cursor-not-allowed'}`}
            >
                <Save size={18}/> {loading ? dict.common.saving : dict.common.save}
            </button>
        </div>

        {/* 1. Appearance Section */}
        <div className="bg-card p-6 rounded-2xl shadow-sm border border-border space-y-6">
            <div className="flex items-center gap-2 text-foreground font-bold border-b border-border pb-2"><Palette size={18}/> {t.appearance}</div>
            
            <div className="grid md:grid-cols-2 gap-4">
                {/* Catatan: DrivePicker tetap menampilkan formData.imageUrl (nilai asli database).
                    Jika kosong, biarkan kosong agar user tahu dia belum set custom image.
                    Tapi kita bisa kasih hint text jika mau.
                */}
                <DrivePicker 
                    label={t.profilePhoto} 
                    currentUrl={formData.imageUrl} 
                    onSelect={(url) => handleInputChange(prev => ({...prev, imageUrl: url}))}
                />
                <DrivePicker 
                    label={t.background} 
                    currentUrl={formData.backgroundUrl} 
                    onSelect={(url) => handleInputChange(prev => ({...prev, backgroundUrl: url}))}
                />
            </div>

            {/* Theme Selector, Basic Info, Textarea Bio tetap sama ... */}
            <div>
                <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">{t.themeLabel}</label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {Object.entries(THEMES).map(([key, style]) => (
                        <button 
                            key={key} 
                            onClick={() => handleInputChange(prev => ({...prev, theme: key}))}
                            className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all group ${formData.theme === key ? 'border-brand ring-2 ring-ring scale-105 shadow-md' : 'border-transparent hover:border-border'}`}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="text-xs font-bold text-subtle block mb-1">{t.displayName}</label>
                    <input 
                        type="text" 
                        value={formData.title} 
                        onChange={e => handleInputChange(prev => ({...prev, title: e.target.value}))} 
                        className="w-full p-3 bg-input text-foreground border border-border rounded-xl font-bold focus:ring-4 focus:ring-ring focus:border-brand outline-none transition"
                    />
                </div>
                <div>
                     <label className="text-xs font-bold text-subtle block mb-1">{t.slugLabel}</label>
                     <div className="flex items-center border border-border rounded-xl bg-muted overflow-hidden focus-within:ring-4 focus-within:ring-ring focus-within:border-brand transition">
                        <span className="pl-3 text-subtle text-sm">/</span>
                        <input 
                            type="text" 
                            value={formData.slug} 
                            onChange={e => handleInputChange(prev => ({...prev, slug: e.target.value}))} 
                            className="w-full p-3 bg-transparent font-mono text-brand outline-none"
                        />
                     </div>
                </div>
            </div>
            <textarea 
                placeholder={t.bioPlaceholder} 
                value={formData.bio || ""} 
                onChange={e => handleInputChange(prev => ({...prev, bio: e.target.value}))} 
                className="w-full p-3 bg-input text-foreground border border-border rounded-xl h-24 text-sm focus:ring-4 focus:ring-ring focus:border-brand outline-none transition resize-none"
            />
        </div>

        {/* Link Builder Section tetap sama... */}
        <div className="space-y-4">
             {/* ... Kode drag and drop ... */}
             <div className="flex justify-between items-center sticky top-[72px] glass z-10 py-2">
                <h3 className="font-bold text-foreground flex items-center gap-2"><LinkIcon size={18}/> {t.contentHeading}</h3>
                <div className="flex gap-2">
                    <button onClick={addHeader} className="text-xs font-bold bg-card border hover:bg-muted text-muted-foreground px-3 py-2 rounded-lg flex gap-1 items-center shadow-sm transition"><Type size={14}/> {t.addHeader}</button>
                    <button onClick={addLink} className="text-xs font-bold bg-brand hover:bg-brand-hover text-brand-contrast px-3 py-2 rounded-lg flex gap-1 items-center shadow-sm transition"><Plus size={14}/> {t.addLink}</button>
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
                                            className={`bg-card border rounded-xl p-4 flex gap-3 items-center transition-all ${
                                                snapshot.isDragging ? 'shadow-lg rotate-1 scale-[1.02] z-50' : 'shadow-sm'
                                            } ${item.type === 'header' ? 'border-l-4 border-l-border-strong bg-muted/50' : 'border-l-4 border-l-brand'}`}
                                        >
                                            <div {...provided.dragHandleProps} className="text-subtle cursor-grab active:cursor-grabbing hover:text-muted-foreground p-1"><GripVertical size={20}/></div>
                                            
                                            <div className="flex-1 space-y-1">
                                                <input 
                                                    type="text" 
                                                    value={item.label} 
                                                    onChange={e => updateItem(index, 'label', e.target.value)}
                                                    className={`w-full bg-transparent font-bold focus:outline-none placeholder:text-subtle ${item.type === 'header' ? 'text-sm uppercase tracking-wider text-muted-foreground' : 'text-foreground'}`}
                                                    placeholder={item.type === 'header' ? t.headerPlaceholder : t.buttonLabelPlaceholder}
                                                    autoFocus={item.label === ""}
                                                />
                                                {item.type === 'link' && (
                                                    <div className="flex gap-3 w-full">

                                                        {/* === TOMBOL ICON PICKER (BARU) === */}
                                                        <div className="relative">
                                                            <button 
                                                                onClick={() => setActiveIconPicker(activeIconPicker === item.id ? null : item.id)}
                                                                className="w-10 h-10 border rounded-lg flex items-center justify-center bg-muted hover:bg-muted text-muted-foreground transition"
                                                                title={t.pickIcon}
                                                            >
                                                                {getIcon(item.icon)}
                                                            </button>

                                                            {/* POPOVER PILIHAN ICON */}
                                                            {activeIconPicker === item.id && (
                                                                <div className="absolute top-12 left-0 z-50 bg-card border shadow-xl rounded-xl p-3 w-64 grid grid-cols-5 gap-2 animate-in fade-in slide-in-from-top-2">
                                                                    {Object.keys(ICONS).filter(k => k !== 'default').map((iconKey) => (
                                                                        <button
                                                                            key={iconKey}
                                                                            onClick={() => {
                                                                                updateItem(index, 'icon', iconKey);
                                                                                setActiveIconPicker(null);
                                                                            }}
                                                                            className={`p-2 rounded-lg flex items-center justify-center hover:bg-brand-soft hover:text-brand transition ${item.icon === iconKey ? 'bg-brand-soft text-brand' : 'text-muted-foreground'}`}
                                                                            title={iconKey}
                                                                        >
                                                                            {ICONS[iconKey]}
                                                                        </button>
                                                                    ))}
                                                                    {/* Tombol Hapus Icon */}
                                                                    <button 
                                                                        onClick={() => { updateItem(index, 'icon', ""); setActiveIconPicker(null); }}
                                                                        className="p-2 rounded-lg flex items-center justify-center text-danger hover:bg-danger-soft col-span-5 text-xs font-bold mt-2 border-t pt-3"
                                                                    >
                                                                        <X size={14} className="mr-1"/> {t.removeIcon}
                                                                    </button>
                                                                </div>
                                                            )}
                                                            {/* Backdrop untuk menutup popover saat klik luar */}
                                                            {activeIconPicker === item.id && (
                                                                <div className="fixed inset-0 z-40" onClick={() => setActiveIconPicker(null)}></div>
                                                            )}
                                                        </div>

                                                        {/* INPUT FORM (URL & LABEL) */}
                                                        <div className="flex-1 space-y-2">
                                                            <input 
                                                                type="text" 
                                                                value={item.label} 
                                                                onChange={e => updateItem(index, 'label', e.target.value)}
                                                                className="w-full bg-transparent font-bold focus:outline-none text-foreground"
                                                                placeholder={t.linkLabelPlaceholder}
                                                            />
                                                            <div className="flex items-center gap-2">
                                                                <ExternalLink size={12} className="text-subtle"/>
                                                                <input 
                                                                    type="text" 
                                                                    value={item.url || ""} 
                                                                    onChange={e => updateItem(index, 'url', e.target.value)}
                                                                    className="w-full text-xs text-muted-foreground bg-transparent py-1 rounded focus:outline-none focus:text-brand"
                                                                    placeholder="https://..."
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <button onClick={() => deleteItem(index)} className="text-subtle hover:text-danger p-2 rounded-full hover:bg-danger-soft transition group" title={t.deleteItem}>
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
                <div className="text-center p-12 border-2 border-dashed border-border rounded-xl text-subtle flex flex-col items-center gap-2">
                    <AlertCircle size={32} className="opacity-20"/>
                    <p>{t.empty}</p>
                    <p className="text-xs">{t.emptyHint}</p>
                </div>
            )}
        </div>
      </div>

      {/* --- RIGHT: LIVE PREVIEW --- */}
      <div className="w-[340px] hidden lg:block pt-4 h-full sticky top-4">
         <div className="border-[10px] border-gray-800 rounded-[3rem] h-[680px] overflow-hidden shadow-2xl bg-muted relative ring-1 ring-gray-950/50">
             
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
                     
                     {/* 4. GUNAKAN displayImage DISINI */}
                     {displayImage ? (
                        <img src={displayImage} className="w-full h-full object-cover" alt="profile" />
                     ) : (
                        <div className="w-full h-full flex items-center justify-center text-subtle text-xs">No img</div>
                     )}

                 </div>
                 
                 <h2 className={`font-bold text-lg text-center leading-snug break-words max-w-full ${currentTheme.text}`}>
                     {formData.title || t.previewName}
                 </h2>
                 {/* ... Sisanya sama ... */}
                 <p className={`text-xs text-center mt-2 mb-8 px-2 opacity-90 leading-relaxed whitespace-pre-wrap ${currentTheme.text}`}>
                     {formData.bio || t.previewBio}
                 </p>

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
                                 {item.label || t.previewUnlabeled}
                             </div>
                         )
                     ))}
                 </div>
             </div>
         </div>
         <div className="text-center mt-6 text-xs font-medium text-subtle flex items-center justify-center gap-2">
            <Smartphone size={14}/> Live Preview
         </div>
      </div>

    </div>
  );
}