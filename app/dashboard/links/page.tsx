import { Metadata } from "next";
import LinksClient from "./LinksClient"; // Import komponen client yang tadi di-rename

// DEFINISIKAN JUDUL DI SINI
export const metadata: Metadata = {
  title: "Tautan Saya", 
};

export default function Page() {
  return <LinksClient />;
}