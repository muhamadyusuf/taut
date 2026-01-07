import { Metadata } from "next";
import QrCodesClient from "./QrCodesClient"; // Import komponen client yang tadi di-rename

// DEFINISIKAN JUDUL DI SINI
export const metadata: Metadata = {
  title: "Kode QR Saya", 
};

export default function Page() {
  return <QrCodesClient />;
}