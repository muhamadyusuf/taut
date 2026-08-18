"use client";

import { useRef } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { QRCode } from "react-qrcode-logo";
import { QRCodeSVG } from "qrcode.react";
import { Download, FileCode2, Loader2, QrCode as QrIcon } from "lucide-react";
import { DEFAULT_QR_STYLE } from "@/convex/qr";
import { downloadCanvasAsPng, downloadSvgNode } from "@/lib/qrDownload";
import QrStyleEditor from "./QrStyleEditor";

export default function QrCodesPage() {
  const links = useQuery(api.links.getMyLinks);
  const qrConfig = useQuery(api.qr.getMySettings);

  const canvasRefs = useRef<Record<string, HTMLDivElement>>({});
  const svgRefs = useRef<Record<string, SVGSVGElement | null>>({});

  const style = qrConfig?.style ?? DEFAULT_QR_STYLE;
  const canDownloadVector = qrConfig?.canDownloadVector ?? false;

  const linkUrl = (shortCode: string) =>
    `${process.env.NEXT_PUBLIC_APP_URL}/${shortCode}`;

  const handlePng = (id: string, shortCode: string) => {
    if (!downloadCanvasAsPng(canvasRefs.current[id], `qr-${shortCode}.png`)) {
      alert("QR belum selesai digambar. Coba lagi sebentar lagi.");
    }
  };

  const handleSvg = (id: string, shortCode: string) => {
    if (!downloadSvgNode(svgRefs.current[id] ?? null, `qr-${shortCode}.svg`)) {
      alert("QR vektor belum siap. Coba lagi sebentar lagi.");
    }
  };

  if (links === undefined || qrConfig === undefined) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-brand" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      <h2 className="mb-2 text-2xl font-bold text-foreground">QR Codes</h2>
      <p className="mb-8 text-muted-foreground">
        Unduh QR code untuk kebutuhan materi promosimu.
      </p>

      <QrStyleEditor
        style={style}
        canCustomize={qrConfig?.canCustomize ?? false}
        plan={qrConfig?.plan ?? "free"}
        previewValue={linkUrl(links[0]?.shortCode ?? "contoh")}
      />

      {links.length === 0 && (
        <div className="rounded-[30px] border-2 border-dashed border-border py-20 text-center">
          <QrIcon size={40} className="mx-auto mb-3 text-subtle" />
          <p className="font-medium text-muted-foreground">
            Belum ada link untuk dibuatkan QR.
          </p>
          <Link
            href="/dashboard/links"
            className="mt-3 inline-block font-bold text-brand hover:underline"
          >
            Buat tautan pertama
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {links.map((link) => (
          <div
            key={link._id}
            className="card-saweria flex flex-col items-center p-6 text-center hover:-translate-y-1"
          >
            {/* Latar mengikuti warna pilihan pemilik, bukan warna tema aplikasi —
                QR harus tampil sama persis seperti nanti saat dicetak. */}
            <div
              ref={(el) => {
                if (el) canvasRefs.current[link._id] = el;
              }}
              className="mb-4 rounded-lg border border-border p-2"
              style={{ background: style.bgColor }}
            >
              <QRCode
                value={linkUrl(link.shortCode)}
                size={150}
                ecLevel="H"
                fgColor={style.fgColor}
                bgColor={style.bgColor}
                logoImage={style.logoUrl || undefined}
                logoWidth={150 * style.logoSizeRatio}
                logoHeight={150 * style.logoSizeRatio}
                logoOpacity={1}
                quietZone={style.quietZone}
                qrStyle={style.dotStyle as "squares" | "dots" | "fluid"}
              />
            </div>

            {/* Sumber vektor, tidak ditampilkan. Hanya dirender untuk paket yang
                memang boleh mengunduhnya, supaya akun gratis tidak menanggung
                ongkos menggambar QR kedua yang tak pernah dipakai. */}
            {canDownloadVector && (
              <div className="hidden" aria-hidden>
                <QRCodeSVG
                  ref={(el) => {
                    svgRefs.current[link._id] = el;
                  }}
                  value={linkUrl(link.shortCode)}
                  size={1024}
                  level="H"
                  fgColor={style.fgColor}
                  bgColor={style.bgColor}
                  marginSize={2}
                  {...(style.logoUrl
                    ? {
                        imageSettings: {
                          src: style.logoUrl,
                          height: 1024 * style.logoSizeRatio,
                          width: 1024 * style.logoSizeRatio,
                          excavate: true,
                        },
                      }
                    : {})}
                />
              </div>
            )}

            <h3 className="mb-1 w-full truncate font-bold text-foreground">
              {link.title || link.shortCode}
            </h3>
            <p className="mb-4 w-full truncate text-xs text-brand">
              /{link.shortCode}
            </p>

            <div className="flex w-full gap-2">
              <button
                onClick={() => handlePng(link._id, link.shortCode)}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-muted py-2 text-sm font-semibold text-muted-foreground transition hover:bg-brand-soft hover:text-brand"
              >
                <Download size={16} /> PNG
              </button>

              {canDownloadVector ? (
                <button
                  onClick={() => handleSvg(link._id, link.shortCode)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-muted py-2 text-sm font-semibold text-muted-foreground transition hover:bg-brand-soft hover:text-brand"
                  title="Vektor, tidak pecah saat dicetak besar"
                >
                  <FileCode2 size={16} /> SVG
                </button>
              ) : (
                <Link href="/dashboard/billing" className="flex-1">
                  <button
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border py-2 text-sm font-semibold text-subtle transition hover:border-brand hover:text-brand"
                    title="Unduhan vektor tersedia di paket berbayar"
                  >
                    <FileCode2 size={16} /> SVG
                  </button>
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>

      {canDownloadVector && (
        <p className="mt-8 text-center text-xs text-muted-foreground">
          Berkas SVG memakai modul kotak dan resolusi 1024px agar paling aman
          dibaca pemindai saat dicetak besar.
        </p>
      )}
    </div>
  );
}
