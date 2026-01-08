"use client";

import { useState, useEffect, use } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Plus, Trash2, Smartphone, Save, GripVertical, Image as ImageIcon, Type, Upload } from "lucide-react";
import Link from "next/link";

// --- TYPE DEFINITIONS ---
interface LinkItem {
  id: string;
  type: "link" | "header";
  label: string;
  url?: string;
  active: boolean;
}

interface MicrositeFormData {
  id: Id<"microsites">;
  title: string;
  slug: string;
  bio?: string;
  theme: string;
  links: LinkItem[];
  imageStorageId?: string;
  imageUrl?: string;
  backgroundStorageId?: string;
  backgroundUrl?: string;
}

// --- KOMPONEN UPLOAD GAMBAR ---
interface ImageUploaderProps {
  label: string;
  currentUrl?: string;
  onUpload: (storageId: string) => void;
}

const ImageUploader = ({ label, currentUrl, onUpload }: ImageUploaderProps) => {
    const generateUploadUrl = useMutation(api.microsites.generateUploadUrl);
    const [uploading, setUploading] = useState(false);

    const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            // 1. Minta URL Upload ke Convex
            const postUrl = await generateUploadUrl();
            // 2. Upload File ke URL tersebut
            const result = await fetch(postUrl, {
                method: "POST",
                headers: { "Content-Type": file.type },
                body: file,
            });
            const { storageId } = await result.json();
            // 3. Balikin Storage ID ke Parent
            onUpload(storageId); 
        } catch (err) {
            alert("Gagal upload gambar");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase">{label}</label>
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden border">
                    {currentUrl ? <img src={currentUrl} className="w-full h-full object-cover"/> : <ImageIcon className="m-auto mt-4 text-gray-300"/>}
                </div>
                <label className="cursor-pointer bg-white border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
                    {uploading ? "Uploading..." : <><Upload size={14}/> Ganti Gambar</>}
                    <input type="file" accept="image/*" className="hidden" onChange={handleFile}/>
                </label>
            </div>
        </div>
    );
};

// --- EDITOR UTAMA ---
export default function MicrositeEditor({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const micrositeData = useQuery(api.microsites.getMicrositeById, { id: id as Id<"microsites"> });
  const updateMicrosite = useMutation(api.microsites.updateMicrosite);

  // Form State
  const [formData, setFormData] = useState<MicrositeFormData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (micrositeData) {
      setFormData({
        ...micrositeData,
        id: micrositeData._id,
        imageUrl: micrositeData.imageUrl || undefined,
        backgroundUrl: micrositeData.backgroundUrl || undefined,
        links: (micrositeData.links as LinkItem[]).map((link) => ({
          ...link,
          type: link.type as "link" | "header",
        })),
      });
    }
  }, [micrositeData]);

  if (!formData) return <div className="p-10 text-center">Loading Editor...</div>;

  // --- LOGIC CRUD LINK ---
  const addLink = () => {
    const newLink: LinkItem = { id: Date.now().toString(), type: "link", label: "Tautan Baru", url: "https://", active: true };
    setFormData({ ...formData, links: [...formData.links, newLink] });
  };

  const addHeader = () => {
    const newHeader: LinkItem = { id: Date.now().toString(), type: "header", label: "JUDUL KATEGORI", active: true };
    setFormData({ ...formData, links: [...formData.links, newHeader] });
  };

  const updateItem = (index: number, field: string, value: string | boolean) => {
    const newLinks = [...formData.links];
    newLinks[index] = { ...newLinks[index], [field]: value };
    setFormData({ ...formData, links: newLinks });
  };

  const deleteItem = (index: number) => {
    if(!confirm("Hapus item ini?")) return;
    const newLinks = [...formData.links];
    newLinks.splice(index, 1);
    setFormData({ ...formData, links: newLinks });
  };

  // --- LOGIC DRAG & DROP ---
  const handleOnDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(formData.links);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setFormData({ ...formData, links: items });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
        await updateMicrosite({
            id: formData.id,
            slug: formData.slug,
            title: formData.title,
            bio: formData.bio,
            theme: formData.theme,
            links: formData.links,
            imageStorageId: formData.imageStorageId,
            backgroundStorageId: formData.backgroundStorageId
        });
        alert("Berhasil disimpan!");
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : "Terjadi kesalahan";
        alert("Gagal: " + errorMessage);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-100px)] flex gap-8 pb-10">
      
      {/* KIRI: FORM & BUILDER */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-8">
        
        {/* Header Editor */}
        <div className="flex justify-between items-center sticky top-0 bg-[#f8faff] z-10 py-4 border-b">
            <div className="flex items-center gap-2">
                <Link href="/dashboard/microsite" className="text-gray-400 hover:text-gray-600">← Kembali</Link>
                <h1 className="text-xl font-bold">Edit: {formData.title}</h1>
            </div>
            <button onClick={handleSave} disabled={loading} className="bg-[#0193ff] text-white px-6 py-2 rounded-full font-bold flex items-center gap-2 hover:bg-[#007acc]">
                <Save size={18}/> {loading ? "Menyimpan..." : "Simpan"}
            </button>
        </div>

        {/* 1. Appearance Section */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border space-y-6">
            <h3 className="font-bold text-gray-700">Tampilan Profil</h3>
            
            <div className="grid grid-cols-2 gap-6">
                <ImageUploader 
                    label="Foto Profil" 
                    currentUrl={formData.imageUrl} 
                    onUpload={(id: string) => setFormData({...formData, imageStorageId: id})}
                />
                <ImageUploader 
                    label="Background Image" 
                    currentUrl={formData.backgroundUrl} 
                    onUpload={(id: string) => setFormData({...formData, backgroundStorageId: id})}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-xs font-bold text-gray-400 block mb-1">Nama Halaman</label>
                    <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-3 border rounded-xl"/>
                </div>
                <div>
                     <label className="text-xs font-bold text-gray-400 block mb-1">URL Bio</label>
                     <input type="text" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} className="w-full p-3 border rounded-xl bg-gray-50"/>
                </div>
            </div>
             <textarea placeholder="Bio / Deskripsi..." value={formData.bio || ""} onChange={e => setFormData({...formData, bio: e.target.value})} className="w-full p-3 border rounded-xl h-20"/>
        </div>

        {/* 2. Link Builder (Drag & Drop) */}
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="font-bold text-gray-700">Susunan Link</h3>
                <div className="flex gap-2">
                    <button onClick={addHeader} className="text-xs font-bold bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg flex gap-1 items-center">
                        <Type size={14}/> + Header
                    </button>
                    <button onClick={addLink} className="text-xs font-bold bg-[#0193ff] hover:bg-blue-600 text-white px-3 py-2 rounded-lg flex gap-1 items-center">
                        <Plus size={14}/> + Link
                    </button>
                </div>
            </div>

            <DragDropContext onDragEnd={handleOnDragEnd}>
                <Droppable droppableId="links-list">
                    {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                            {formData.links.map((item: LinkItem, index: number) => (
                                <Draggable key={item.id} draggableId={item.id} index={index}>
                                    {(provided) => (
                                        <div ref={provided.innerRef} {...provided.draggableProps} className={`bg-white border rounded-xl p-4 flex gap-3 items-center shadow-sm ${item.type === 'header' ? 'border-l-8 border-l-gray-300 bg-gray-50' : 'border-l-8 border-l-[#0193ff]'}`}>
                                            <div {...provided.dragHandleProps} className="text-gray-400 cursor-grab hover:text-gray-600">
                                                <GripVertical size={20}/>
                                            </div>
                                            
                                            <div className="flex-1 space-y-2">
                                                <input 
                                                    type="text" 
                                                    value={item.label} 
                                                    onChange={e => updateItem(index, 'label', e.target.value)}
                                                    className={`w-full bg-transparent font-bold focus:outline-none ${item.type === 'header' ? 'text-lg uppercase tracking-wide text-gray-600' : 'text-gray-800'}`}
                                                    placeholder={item.type === 'header' ? "NAMA KATEGORI" : "Label Link"}
                                                />
                                                {item.type === 'link' && (
                                                    <input 
                                                        type="text" 
                                                        value={item.url} 
                                                        onChange={e => updateItem(index, 'url', e.target.value)}
                                                        className="w-full text-xs text-gray-500 bg-gray-50 p-1 rounded focus:outline-none"
                                                    />
                                                )}
                                            </div>

                                            <button onClick={() => deleteItem(index)} className="text-gray-300 hover:text-red-500 p-2">
                                                <Trash2 size={16}/>
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
             {formData.links.length === 0 && <div className="text-center p-8 border-dashed border-2 rounded-xl text-gray-400">Belum ada konten. Tambahkan Link atau Header.</div>}
        </div>
      </div>

      {/* KANAN: PREVIEW HP (LIVE) */}
      <div className="w-[360px] hidden lg:block pt-20">
         <div className="sticky top-10 border-[8px] border-gray-800 rounded-[3rem] h-[700px] overflow-hidden shadow-2xl bg-gray-100 relative">
             
             {/* Background Preview Logic */}
             <div className="absolute inset-0 z-0">
                 {formData.backgroundUrl ? (
                     <img src={formData.backgroundUrl} className="w-full h-full object-cover"/>
                 ) : (
                     <div className={`w-full h-full ${formData.theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-white'}`}></div>
                 )}
                 {/* Overlay agar teks terbaca kalau background foto */}
                 {formData.backgroundUrl && <div className="absolute inset-0 bg-black/40"></div>}
             </div>

             <div className="relative z-10 p-6 h-full overflow-y-auto no-scrollbar flex flex-col items-center pt-16">
                 {/* Avatar */}
                 <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden mb-4 bg-gray-200">
                     {formData.imageUrl ? <img src={formData.imageUrl} className="w-full h-full object-cover"/> : null}
                 </div>
                 <h2 className={`font-bold text-xl text-center mb-1 ${formData.backgroundUrl || formData.theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{formData.title}</h2>
                 <p className={`text-sm text-center mb-8 px-2 ${formData.backgroundUrl || formData.theme === 'dark' ? 'text-gray-200' : 'text-gray-500'}`}>{formData.bio}</p>

                 {/* Render Items */}
                 <div className="w-full space-y-3">
                     {formData.links.map((item: LinkItem) => (
                         item.type === 'header' ? (
                             <h3 key={item.id} className={`text-center text-xs font-bold uppercase tracking-widest mt-6 mb-2 ${formData.backgroundUrl || formData.theme === 'dark' ? 'text-white/80' : 'text-gray-400'}`}>
                                 {item.label}
                             </h3>
                         ) : (
                             <div key={item.id} className="w-full bg-white/90 hover:bg-white backdrop-blur-sm py-3.5 px-4 rounded-xl shadow-sm text-center font-bold text-gray-800 text-sm cursor-pointer transition">
                                 {item.label}
                             </div>
                         )
                     ))}
                 </div>
             </div>
         </div>
      </div>

    </div>
  );
}