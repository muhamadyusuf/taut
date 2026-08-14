import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";

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
          <h1 className="text-4xl font-extrabold mb-4 text-foreground">Hubungi Kami</h1>
          <p className="text-lg text-muted-foreground">
            Punya pertanyaan, saran fitur, atau ingin melaporkan penyalahgunaan
            tautan? Tim Singkat.in siap membantu Anda.
          </p>
        </div>

        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="bg-brand-soft p-3 rounded-full text-brand shrink-0">
              <MapPin size={24} />
            </div>
            <div>
              <h3 className="font-bold text-lg text-foreground">Alamat</h3>
              <p className="text-muted-foreground mt-1">
                Komplek Komersial BSD, Jl. Raya Serpong No.Kav.9, Lengkong Karya,
                Serpong Utara, Kota Tangerang Selatan, Banten 15331.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-brand-soft p-3 rounded-full text-brand shrink-0">
              <Mail size={24} />
            </div>
            <div>
              <h3 className="font-bold text-lg text-foreground">Email Support</h3>
              <a
                href="mailto:info@singkat.in"
                className="text-brand hover:underline mt-1 block"
              >
                info@singkat.in
              </a>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-brand-soft p-3 rounded-full text-brand shrink-0">
              <Phone size={24} />
            </div>
            <div>
              <h3 className="font-bold text-lg text-foreground">Telepon</h3>
              <p className="text-muted-foreground mt-1">(+62) 857-7272-6737</p>
            </div>
          </div>
        </div>

        <a
          href="https://maps.app.goo.gl/smwybRtfetb8FgMb9"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-ghost inline-flex text-sm"
        >
          Buka di Google Maps
        </a>
      </div>

      {/* Kolom Kanan: Peta */}
      <div className="flex-1 surface-panel p-2 h-[500px] overflow-hidden">
        <iframe
          title="Lokasi Institut Teknologi Tangerang Selatan"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3965.918494597563!2d106.65412687555317!3d-6.274447193714322!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69e553aeca8d97%3A0xd3e5d04eb554abde!2sInstitut%20Teknologi%20Tangerang%20Selatan!5e0!3m2!1sid!2sid!4v1767846832389!5m2!1sid!2sid"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          className="rounded-xl"
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </div>
  );
}
