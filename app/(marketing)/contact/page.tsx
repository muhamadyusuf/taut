import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Mail, MapPin, Phone } from "lucide-react";

export const metadata: Metadata = {
  title: "Hubungi Kami",
  description: "Kontak support dan lokasi Institut Teknologi Tangerang Selatan.",
};

export default function ContactPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col md:flex-row gap-12">
      
      {/* Kolom Kiri: Informasi */}
      <div className="flex-1 space-y-8">
        <div>
          <h1 className="text-4xl font-extrabold mb-4 text-[#2d3748]">Hubungi Kami</h1>
          <p className="text-lg text-gray-500">
            Punya pertanyaan, saran fitur, atau ingin melaporkan penyalahgunaan tautan? Tim Singkat.in siap membantu Anda.
          </p>
        </div>

        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="bg-blue-100 p-3 rounded-full text-[#0193ff]">
              <MapPin size={24} />
            </div>
            <div>
              <h3 className="font-bold text-lg">Alamat</h3>
              <p className="text-gray-500 mt-1">
                Komplek Komersial BSD, Jl. Raya Serpong No.Kav.9, Lengkong Karya, Serpong Utara, Kota Tangerang Selatan, Banten 15331.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-full text-[#0193ff]">
              <Mail size={24} />
            </div>
            <div>
              <h3 className="font-bold text-lg">Email Support</h3>
              <a href="mailto:info@singkat.in" className="text-[#0193ff] hover:underline mt-1 block">
                info@singkat.in
              </a>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-full text-[#0193ff]">
              <Phone size={24} />
            </div>
            <div>
              <h3 className="font-bold text-lg">Telepon</h3>
              <p className="text-gray-500 mt-1">(+62) 857-7272-6737</p>
            </div>
          </div>
        </div>
      </div>

      {/* Kolom Kanan: Peta / Gambar */}
      <div className="flex-1 bg-white p-2 rounded-b-3xl shadow-lg border border-gray-100 h-[500px] overflow-hidden relative">
          {/* Placeholder Peta - Anda bisa ganti dengan iframe Google Maps asli nanti */}
          <div className="w-full h-full bg-gray-100 rounded-2xl flex flex-col items-center justify-center text-gray-400">
              
          <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3965.918494597563!2d106.65412687555317!3d-6.274447193714322!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69e553aeca8d97%3A0xd3e5d04eb554abde!2sInstitut%20Teknologi%20Tangerang%20Selatan!5e0!3m2!1sid!2sid!4v1767846832389!5m2!1sid!2sid" width="100%" height="100%" style={{border: "0"}} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
              
              {/* Tombol Buka Maps */}
              <a 
                  href="https://maps.app.goo.gl/smwybRtfetb8FgMb9"
                  target="_blank"
                  className="mt-6 bg-white px-4 py-2 rounded-full shadow-sm text-sm font-bold text-[#0193ff] hover:bg-gray-50 transition"
              >
                  Buka di Google Maps
              </a><br/>
          </div>
      </div>
    </div>
  );
}