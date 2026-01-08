"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { QRCode } from "react-qrcode-logo";
import { Download } from "lucide-react";
import { useRef } from "react";

export default function QrCodesPage() {
  const links = useQuery(api.links.getMyLinks);
  const qrRefs = useRef<{ [key: string]: HTMLDivElement }>({});

  const downloadQR = (id: string, shortCode: string) => {
    const qrElement = qrRefs.current[id];
    if (qrElement) {
      const canvas = qrElement.querySelector("canvas");
      if (canvas) {
        const pngUrl = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.href = pngUrl;
        downloadLink.download = `qr-${shortCode}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">QR Codes</h2>
        <p className="text-gray-500 mb-8">Download QR codes for your marketing materials.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {links?.map((link) => (
                <div key={link._id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition flex flex-col items-center text-center">
                    <div 
                      ref={(el) => {
                        if (el) qrRefs.current[link._id] = el;
                      }}
                      className="bg-white p-2 rounded-lg border border-gray-100 mb-4"
                    >
                        <QRCode
                            id={`qr-${link._id}`}
                            value={`${process.env.NEXT_PUBLIC_APP_URL}/${link.shortCode}`}
                            size={150}
                            ecLevel={"H"}
                            logoImage="/logo.svg"
                            logoWidth={40}
                            logoHeight={40}
                            logoOpacity={1}
                            quietZone={5}
                            qrStyle="squares"
                        />
                    </div>
                    <h3 className="font-bold text-gray-800 truncate w-full mb-1">{link.title || link.shortCode}</h3>
                    <p className="text-xs text-[#2a5bd7] mb-4 truncate w-full">/{link.shortCode}</p>
                    
                    <button 
                        onClick={() => downloadQR(link._id, link.shortCode)}
                        className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg text-sm font-semibold transition"
                    >
                        <Download size={16}/> Download PNG
                    </button>
                </div>
            ))}
        </div>
    </div>
  );
}