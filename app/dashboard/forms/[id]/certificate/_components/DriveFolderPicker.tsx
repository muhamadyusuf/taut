"use client";

import useDrivePicker from "react-google-drive-picker";
import { FolderOpen, X } from "lucide-react";
import { useEffect, useState } from "react";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY || "";
const TOKEN_EXPIRY_MS = 50 * 60 * 1000;

interface PickerCallbackData {
  action: string;
  docs: Array<{ id: string; name: string }>;
}

interface DriveFolderPickerProps {
  folderId?: string;
  folderName?: string;
  onSelect: (folderId: string, folderName: string) => void;
}

export default function DriveFolderPicker({ folderId, folderName, onSelect }: DriveFolderPickerProps) {
  const [openPicker, authResponse] = useDrivePicker();
  const [accessToken, setAccessToken] = useState("");

  useEffect(() => {
    const savedToken = localStorage.getItem("gdrive_access_token");
    const savedTime = localStorage.getItem("gdrive_token_timestamp");
    if (savedToken && savedTime && Date.now() - parseInt(savedTime, 10) < TOKEN_EXPIRY_MS) {
      setAccessToken(savedToken);
    }
  }, []);

  useEffect(() => {
    if (authResponse?.access_token) {
      setAccessToken(authResponse.access_token);
      localStorage.setItem("gdrive_access_token", authResponse.access_token);
      localStorage.setItem("gdrive_token_timestamp", Date.now().toString());
    }
  }, [authResponse]);

  const handleOpenPicker = () => {
    openPicker({
      clientId: GOOGLE_CLIENT_ID,
      developerKey: GOOGLE_API_KEY,
      viewId: "FOLDERS",
      setSelectFolderEnabled: true,
      setIncludeFolders: true,
      supportDrives: true,
      multiselect: false,
      token: accessToken,
      customScopes: ["https://www.googleapis.com/auth/drive.file"],
      callbackFunction: (data: PickerCallbackData) => {
        if (data.action === "picked") {
          const folder = data.docs[0];
          onSelect(folder.id, folder.name);
        }
      },
    });
  };

  return (
    <div className="space-y-2 p-4 border rounded-xl bg-muted border-border">
      <label className="text-xs font-bold text-muted-foreground uppercase">Folder Tujuan di Google Drive</label>
      {folderId ? (
        <div className="flex items-center justify-between gap-2 bg-card border border-border rounded-lg px-3 py-2">
          <span className="flex items-center gap-2 text-sm text-foreground truncate">
            <FolderOpen size={16} className="text-brand shrink-0" /> {folderName || folderId}
          </span>
          <button type="button" onClick={() => onSelect("", "")} className="text-subtle hover:text-danger shrink-0">
            <X size={14} />
          </button>
        </div>
      ) : (
        <p className="text-xs text-subtle">Belum ada folder dipilih. Sertifikat akan diunggah ke folder ini.</p>
      )}
      <button
        type="button"
        onClick={handleOpenPicker}
        className="w-full bg-card border border-border hover:border-brand hover:bg-brand-soft text-foreground font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition text-xs"
      >
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg"
          className="w-4 h-4"
          alt="Drive"
        />
        {folderId ? "Ganti Folder" : "Pilih Folder Drive"}
      </button>
    </div>
  );
}
