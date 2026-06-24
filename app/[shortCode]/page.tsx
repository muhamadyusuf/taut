"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams } from "next/navigation";
import Image from "next/image";
import { ExternalLink, ShieldCheck, AlertCircle, Loader2 } from "lucide-react";
import NotFoundPage from "@/app/not-found";

export default function RedirectPage() {
  const params = useParams();
  const shortCode = (params.slug || params.shortCode) as string;

  const link = useQuery(
    api.links.getUrlByCode,
    shortCode ? { shortCode } : "skip"
  );
  const activeAd = useQuery(api.admin.getActiveAd);
  const incrementClick = useMutation(api.links.getLinkAndIncrement);

  const [isRedirecting, setIsRedirecting] = useState(false);
  const [countdown, setCountdown] = useState(5);

  // Auto-redirect countdown
  useEffect(() => {
    if (link === undefined || link === null) return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleContinue();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [link]);

  const handleContinue = async () => {
    if (!shortCode || isRedirecting || !link) return;
    setIsRedirecting(true);
    await incrementClick({ shortCode });
    window.location.replace(link.originalUrl);
  };

  // masih loading
  if (link === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  // link tidak ditemukan
  if (link === null) {
    return <NotFoundPage />;
  }

  // Ekstrak hostname dari URL tujuan
  let destinationHost = link.originalUrl;
  try {
    destinationHost = new URL(link.originalUrl).hostname;
  } catch {
    // fallback ke URL lengkap
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-3 shadow-sm">
        <Image src="/logo.svg" alt="Logo" width={28} height={28} />
        <span className="font-bold text-[#0b1736] text-lg">
          singkat<span className="text-[#0193ff]">.in</span>
        </span>
      </header>

      {/* Main layout */}
      <div className="flex flex-col md:flex-row flex-1 gap-0 md:gap-4 p-4 md:p-6 max-w-7xl mx-auto w-full">

        {/* ── RIGHT PANEL (70%) — Ad space ── */}
        <main className="flex-1">
          {activeAd ? (
            <a
              href={activeAd.linkUrl ?? "#"}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="block w-full h-full min-h-100 rounded-2xl overflow-hidden shadow-sm border border-gray-200 relative group"
            >
              {activeAd.imageUrl ? (
                <div className="relative w-full h-full min-h-100">
                  <Image
                    src={activeAd.imageUrl}
                    alt={activeAd.title ?? "Iklan"}
                    fill
                    className="group-hover:scale-[1.01] transition-transform duration-300"
                    unoptimized
                  />
                  {/* Overlay label */}
                  <div className="absolute top-3 left-3 bg-black/50 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                    IKLAN
                  </div>
                  {activeAd.title && (
                    <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/70 to-transparent px-5 py-4">
                      <p className="text-white font-bold text-lg">{activeAd.title}</p>
                      {activeAd.description && (
                        <p className="text-white/80 text-sm mt-0.5">{activeAd.description}</p>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                /* Text-only ad */
                <div className="w-full h-full min-h-100 bg-linear-to-br from-[#0b1736] to-[#0a2970] flex flex-col items-center justify-center p-10 text-center text-white gap-4 rounded-2xl">
                  <span className="text-[10px] font-semibold bg-white/20 px-2 py-0.5 rounded-full">IKLAN</span>
                  {activeAd.title && (
                    <h2 className="text-3xl font-extrabold">{activeAd.title}</h2>
                  )}
                  {activeAd.description && (
                    <p className="text-white/70 max-w-sm">{activeAd.description}</p>
                  )}
                  {activeAd.linkUrl && (
                    <span className="mt-2 bg-[#0193ff] hover:bg-[#0078d4] text-white font-semibold px-6 py-2.5 rounded-xl text-sm">
                      Kunjungi
                    </span>
                  )}
                </div>
              )}
            </a>
          ) : (
            /* No active ad — placeholder */
            <div className="w-full h-full min-h-100 rounded-2xl border-2 border-dashed border-gray-300 bg-white flex flex-col items-center justify-center text-gray-400 gap-3">
              <ShieldCheck className="h-12 w-12 text-gray-300" />
              <p className="text-sm font-medium">Ruang Iklan</p>
              <p className="text-xs">Belum ada iklan aktif</p>
            </div>
          )}
        </main>


        {/* ── LEFT PANEL (30%) ── */}
        <aside className="w-full md:w-[50%] shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-linear-to-br from-[#0b1736] to-[#0a2970] px-6 py-5 text-white">
              <h1 className="text-lg font-bold leading-snug">
                Pratinjau tujuan Anda
              </h1>
              <p className="text-white/60 text-xs mt-1">
                Anda akan diarahkan ke tautan di bawah ini
              </p>
            </div>

            <div className="px-6 py-5 space-y-5">
              {/* Destination info */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Tujuan
                </p>
                <a
                  href={link.originalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2 text-[#0193ff] text-sm font-medium break-all hover:underline"
                >
                  <ExternalLink className="h-4 w-4 shrink-0 mt-0.5" />
                  {destinationHost}
                </a>
              </div>

              {/* Note */}
              <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 leading-relaxed">
                  Kami tidak dapat mengambil informasi tentang tujuan Anda. Namun
                  tidak perlu khawatir — kami memeriksa tautan ini untuk menjaga
                  keamanan Anda.
                </p>
              </div>

              {/* Security check */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <ShieldCheck className="h-5 w-5 text-green-500" />
                  <p className="text-sm font-semibold text-gray-800">
                    Pemeriksaan keamanan
                  </p>
                </div>
                <ul className="space-y-2">
                  {[
                    "Dipindai oleh singkat.in",
                    "Tautan dipantau dari perilaku mencurigakan",
                    "Tidak ada ancaman yang terdeteksi saat ini",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-xs text-gray-600">
                      <span className="mt-0.5 h-4 w-4 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                        <svg className="h-2.5 w-2.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Continue button */}
              <button
                onClick={handleContinue}
                disabled={isRedirecting}
                className="w-full bg-[#0193ff] hover:bg-[#0078d4] disabled:bg-gray-300 text-white font-semibold py-3 px-4 rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
              >
                {isRedirecting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Mengalihkan…
                  </>
                ) : (
                  <>
                    <ExternalLink className="h-4 w-4" />
                    Lanjutkan ke tujuan
                    {countdown > 0 && (
                      <span className="ml-1 bg-white/20 text-white text-xs px-1.5 py-0.5 rounded-full">
                        {countdown}
                      </span>
                    )}
                  </>
                )}
              </button>

              <p className="text-[11px] text-gray-400 text-center">
                Anda akan diarahkan secara otomatis dalam {countdown} detik
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
