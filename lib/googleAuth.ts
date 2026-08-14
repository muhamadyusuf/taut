"use client";

// Ambil access token Google (scope drive.file) tanpa membuka UI Picker,
// menggunakan Google Identity Services. Token di-cache bersama DrivePicker
// (kunci localStorage yang sama) supaya keduanya saling memakai sesi yang sama.

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
const TOKEN_EXPIRY_MS = 50 * 60 * 1000; // 50 menit, buffer aman sebelum 1 jam
const SCOPE = "https://www.googleapis.com/auth/drive.file";

interface TokenClientResponse {
  access_token?: string;
  error?: string;
}

interface GoogleAccountsOAuth2 {
  initTokenClient(config: {
    client_id: string;
    scope: string;
    callback: (response: TokenClientResponse) => void;
  }): { requestAccessToken: () => void };
}

declare global {
  interface Window {
    google?: { accounts?: { oauth2?: GoogleAccountsOAuth2 } };
  }
}

let gsiLoadPromise: Promise<void> | null = null;

function loadGsiScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("Tidak ada window"));
  if (window.google?.accounts?.oauth2) return Promise.resolve();
  if (gsiLoadPromise) return gsiLoadPromise;

  gsiLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Gagal memuat skrip Google Identity Services."));
    document.head.appendChild(script);
  });

  return gsiLoadPromise;
}

export function getCachedAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("gdrive_access_token");
  const time = localStorage.getItem("gdrive_token_timestamp");
  if (!token || !time) return null;
  if (Date.now() - parseInt(time, 10) > TOKEN_EXPIRY_MS) return null;
  return token;
}

export async function requestGoogleAccessToken(): Promise<string> {
  const cached = getCachedAccessToken();
  if (cached) return cached;

  await loadGsiScript();

  return new Promise((resolve, reject) => {
    if (!window.google?.accounts?.oauth2) {
      reject(new Error("Google Identity Services gagal dimuat."));
      return;
    }

    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: SCOPE,
      callback: (response) => {
        if (response.error || !response.access_token) {
          reject(new Error(response.error || "Gagal mendapatkan akses Google Drive."));
          return;
        }
        localStorage.setItem("gdrive_access_token", response.access_token);
        localStorage.setItem("gdrive_token_timestamp", Date.now().toString());
        resolve(response.access_token);
      },
    });

    client.requestAccessToken();
  });
}
