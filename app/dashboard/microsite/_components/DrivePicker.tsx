"use client";

import useDrivePicker from "react-google-drive-picker";
import { Image as ImageIcon, CheckCircle, AlertTriangle, Loader2, Wrench, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocale } from "@/lib/i18n/useLocale";
import { getDictionary } from "@/lib/i18n/dictionaries";

// --- KONFIGURASI ---
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY || "";
const TOKEN_EXPIRY_MS = 50 * 60 * 1000; // 50 Menit (Buffer aman sebelum 1 jam)

// --- TIPE DATA ---
interface DrivePickerProps {
  label: string;
  currentUrl?: string | null;
  onSelect: (url: string) => void;
}

interface PickerCallbackData {
  action: string;
  docs: Array<{ id: string; name: string; mimeType: string }>;
}

interface Permission {
  type: string;
  role?: string;
}

export default function DrivePicker({ label, currentUrl, onSelect }: DrivePickerProps) {
  const t = getDictionary(useLocale()).dashboard.drivePicker;
  const [openPicker, authResponse] = useDrivePicker();
  
  // State
  const [status, setStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid'>('idle');
  const [fileId, setFileId] = useState<string>("");
  const [accessToken, setAccessToken] = useState<string>("");
  const [isFixing, setIsFixing] = useState(false);

  // Helper: Bersihkan Sesi
  const clearSession = () => {
    localStorage.removeItem("gdrive_access_token");
    localStorage.removeItem("gdrive_token_timestamp");
    setAccessToken("");
  };

  // 1. LOAD TOKEN SAAT MOUNT (DENGAN CEK WAKTU)
  useEffect(() => {
    const savedToken = localStorage.getItem("gdrive_access_token");
    const savedTime = localStorage.getItem("gdrive_token_timestamp");
    const now = Date.now();

    if (savedToken && savedTime) {
        const age = now - parseInt(savedTime, 10);
        // Jika token masih fresh (< 50 menit)
        if (age < TOKEN_EXPIRY_MS) {
            setAccessToken(savedToken);
        } else {
            console.log("Token Google Drive kadaluarsa, menghapus sesi...");
            clearSession();
        }
    } else {
        // Jika tidak ada timestamp (format lama), hapus saja biar aman
        if (savedToken) clearSession();
    }
  }, []);

  // 2. TANGKAP TOKEN BARU DARI PICKER
  useEffect(() => {
    // Hanya update jika ada token baru dan valid
    if (authResponse && authResponse.access_token) {
        const newToken = authResponse.access_token;
        setAccessToken(newToken);
        
        // Simpan Token & Waktu
        localStorage.setItem("gdrive_access_token", newToken);
        localStorage.setItem("gdrive_token_timestamp", Date.now().toString());
    }
  }, [authResponse]);

  // Efek: Reset status & Extract File ID
  useEffect(() => {
    if (!currentUrl) {
        setStatus('idle');
        setFileId("");
    } else {
        const match = currentUrl.match(/id=([^&]+)/);
        if (match && match[1]) {
            setFileId(match[1]);
            // Cek permission hanya jika ada token
            if (accessToken) verifyPublicPermission(match[1], accessToken);
        }
    }
  }, [currentUrl, accessToken]);

  // 3. FUNGSI CEK IZIN
  const verifyPublicPermission = async (fId: string, token: string) => {
    if (!token) return;
    setStatus('checking');
    try {
        const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fId}?fields=permissions`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        // JIKA TOKEN KADALUARSA (401), HAPUS DARI STORAGE
        if (res.status === 401) {
            clearSession();
            return;
        }

        if (!res.ok) throw new Error(t.permissionCheckFailed);

        const data = await res.json();
        const permissions: Permission[] = data.permissions || [];
        const isPublic = permissions.some((p: Permission) => p.type === 'anyone');

        setStatus(isPublic ? 'valid' : 'invalid');
    } catch (err) {
        console.error("Verify Error:", err);
        if (accessToken) setStatus('invalid'); 
    }
  };

  // 4. MAGIC FIX (Auto Public)
  const makePublic = async () => {
      if (!accessToken || !fileId) {
          alert(t.sessionExpired);
          clearSession();
          return;
      }
      setIsFixing(true);
      try {
          const url = `https://www.googleapis.com/drive/v3/files/${fileId}/permissions?supportsAllDrives=true`;
          
          const res = await fetch(url, {
              method: "POST",
              headers: {
                  Authorization: `Bearer ${accessToken}`,
                  "Content-Type": "application/json",
              },
              body: JSON.stringify({ role: "reader", type: "anyone" }),
          });

          if (res.status === 401) {
             throw new Error("Token kadaluarsa (401).");
          }

          if (!res.ok) {
              const errData = await res.json();
              throw new Error(errData.error?.message || t.permissionChangeFailed);
          }

          await verifyPublicPermission(fileId, accessToken);
          
          // Refresh URL gambar agar cache browser ter-reset
          if (currentUrl) {
             const baseUrl = currentUrl.split('&t=')[0];
             const separator = baseUrl.includes('?') ? '&' : '?';
             onSelect(`${baseUrl}${separator}t=${Date.now()}`); 
          }
          alert(t.madePublic);
      } catch (err: unknown) {
          const message = err instanceof Error ? err.message : t.unknownError;
          
          // Jika gagal karena token, hapus token agar user login ulang
          if (message.includes("Token") || message.includes("401")) {
             clearSession();
             alert(t.googleExpired);
          } else {
             alert(t.failedPrefix + message);
          }
      } finally {
          setIsFixing(false);
      }
  };

  // 5. HANDLE PICKER
  const handleOpenPicker = () => {
    // Jika token kosong (karena logout/expire), picker akan otomatis buka popup login
    openPicker({
      clientId: GOOGLE_CLIENT_ID,
      developerKey: GOOGLE_API_KEY,
      viewId: "DOCS_IMAGES",
      showUploadView: true,
      showUploadFolders: true,
      supportDrives: true,
      multiselect: false,
      token: accessToken, // Kirim token jika ada
      customScopes: ['https://www.googleapis.com/auth/drive.file'], 
      callbackFunction: (data: PickerCallbackData) => {
        if (data.action === "picked") {
          const file = data.docs[0];
          setFileId(file.id);
          // Gunakan URL thumbnail kualitas tinggi
          const directLink = `https://drive.google.com/thumbnail?id=${file.id}&sz=w1000`;
          onSelect(directLink);
        }
        if (data.action === "cancel") {
            console.log("User cancel picker");
        }
      },
    });
  };

  // === 6. HANDLE REMOVE ===
  const handleRemove = (e: React.MouseEvent) => {
      e.stopPropagation(); 
      onSelect(""); 
      setFileId("");
      setStatus('idle');
  };

  return (
    <div className={`space-y-3 p-4 border rounded-xl transition-all duration-300 ${status === 'invalid' ? 'bg-danger-soft border-danger/40 shadow-sm' : 'bg-muted border-border'}`}>
      <div className="flex justify-between items-center">
        <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2">
            {label} {status === 'invalid' && <span className="animate-pulse w-2 h-2 bg-danger rounded-full"></span>}
        </label>
        {status === 'checking' && <span className="text-[10px] bg-brand-soft text-brand-soft-fg px-2 py-1 rounded-full flex items-center gap-1 font-bold"><Loader2 size={10} className="animate-spin"/> {t.checkingPermission}</span>}
        {status === 'valid' && <span className="text-[10px] bg-success-soft text-success px-2 py-1 rounded-full flex items-center gap-1 font-bold"><CheckCircle size={12}/> {t.public}</span>}
      </div>

      <div className="flex gap-4 items-start">
        <div className={`w-20 h-20 bg-card rounded-lg overflow-visible border shrink-0 relative group ${status === 'invalid' ? 'border-danger opacity-80' : ''}`}>
          
          {currentUrl ? (
            <>
                <img 
                    src={currentUrl} 
                    className="w-full h-full object-cover rounded-lg" 
                    alt="Preview" 
                    referrerPolicy="no-referrer" 
                    onError={() => setStatus('invalid')} 
                    onLoad={() => status !== 'valid' && status !== 'checking' ? setStatus('valid') : null} 
                />
                
                {/* BUTTON REMOVE */}
                <button 
                    type="button"
                    onClick={handleRemove}
                    className="absolute -top-2 -right-2 bg-card text-muted-foreground hover:text-danger border border-border rounded-full p-1 shadow-md hover:bg-danger-soft hover:border-danger/30 transition-all z-10 opacity-100 scale-100"
                    title={t.removeImage}
                >
                    <X size={12} strokeWidth={3} />
                </button>
            </>
          ) : (
            <ImageIcon className="m-auto mt-6 text-subtle" />
          )}
        </div>

        <div className="flex-1 space-y-2">
            <button type="button" onClick={handleOpenPicker} className="w-full bg-card border border-border hover:border-brand hover:bg-brand-soft text-foreground font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition text-xs">
                <img src="https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg" className="w-4 h-4" alt="Drive"/>
                {currentUrl ? t.changeFile : t.pickFile}
            </button>
            
            {status === 'invalid' && (
                <div className="text-[10px] text-danger bg-card p-2.5 rounded-lg border border-danger/30 shadow-sm animate-in slide-in-from-top-2">
                    <div className="flex gap-2 mb-2">
                        <AlertTriangle size={16} className="shrink-0 text-danger"/>
                        <div><p className="font-bold">{t.invalidTitle}</p><p className="leading-tight opacity-80">{t.invalidBody}</p></div>
                    </div>
                    {accessToken ? (
                        <button type="button" onClick={makePublic} disabled={isFixing} className="w-full bg-danger hover:opacity-90 text-white py-1.5 px-3 rounded flex items-center justify-center gap-1.5 font-bold transition shadow-sm disabled:opacity-50">
                            {isFixing ? <><Loader2 size={12} className="animate-spin"/> {t.makingPublic}</> : <><Wrench size={12}/> {t.makePublic}</>}
                        </button>
                    ) : (
                        <div className="text-center italic opacity-60 mt-1 text-[9px]">{t.reloginHint}</div>
                    )}
                </div>
            )}
        </div>
      </div>
    </div>
  );
}