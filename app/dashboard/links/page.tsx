import { Metadata } from "next";
import LinksClient from "./LinksClient"; // Import komponen client yang tadi di-rename

// DEFINISIKAN JUDUL DI SINI
export const metadata: Metadata = {
  title: "Tautan Saya", 
  // Hasilnya di browser akan jadi: "Tautan Saya | Taut.id"
};

export default function Page() {
  return <LinksClient />;
}