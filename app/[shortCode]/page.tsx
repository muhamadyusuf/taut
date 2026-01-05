"use client";

import { useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams } from "next/navigation";

export default function RedirectPage() {
  const params = useParams();
  const shortCode = params.shortCode as string;
  
  // Panggil Mutation (bukan Query) agar bisa update database
  const getLink = useMutation(api.links.getLinkAndIncrement);

  useEffect(() => {
    const performRedirect = async () => {
      try {
        // Minta URL asli + Tambah Counter
        const originalUrl = await getLink({ shortCode });
        
        if (originalUrl) {
          // Redirect user ke URL asli
          window.location.replace(originalUrl);
        } else {
          // Jika link tidak ditemukan (Opsional: Redirect ke 404 atau Home)
          document.body.innerHTML = "Link not found / Link tidak ditemukan";
        }
      } catch (error) {
        console.error("Redirect error:", error);
      }
    };

    performRedirect();
  }, [shortCode, getLink]);

  // Tampilan loading sementara (sangat cepat)
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-500">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-4"></div>
      <p>Mengalihkan...</p>
    </div>
  );
}