import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";

export const metadata: Metadata = {
  title: "Hubungi Kami",
  description: "Kontak support dan lokasi Institut Teknologi Tangerang Selatan.",
};

const ADDRESS =
  "Komplek Komersial BSD, Jl. Raya Serpong No. Kav. 9, Lengkong Karya, Serpong Utara, Kota Tangerang Selatan, Banten 15331.";

const MAPS_LINK = "https://maps.app.goo.gl/smwybRtfetb8FgMb9";

export default function ContactPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-12 md:flex-row">
      {/* Kolom Kiri: Informasi */}
      <div className="flex-1 space-y-8">
        <div>
          <h1 className="mb-4 text-4xl font-extrabold text-foreground">Hubungi Kami</h1>
          <p className="text-lg text-muted-foreground">
            Punya pertanyaan, saran fitur, atau ingin melaporkan penyalahgunaan
            tautan? Tim Singkat.in siap membantu Anda.
          </p>
        </div>

        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="shrink-0 rounded-full bg-brand-soft p-3 text-brand">
              <MapPin size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Alamat</h2>
              <p className="mt-1 text-muted-foreground">{ADDRESS}</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="shrink-0 rounded-full bg-brand-soft p-3 text-brand">
              <Mail size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Email Support</h2>
              <a
                href="mailto:info@singkat.in"
                className="mt-1 block text-brand hover:underline"
              >
                info@singkat.in
              </a>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="shrink-0 rounded-full bg-brand-soft p-3 text-brand">
              <Phone size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Telepon</h2>
              <a
                href="tel:+6285772726737"
                className="mt-1 block text-muted-foreground hover:text-brand"
              >
                (+62) 857-7272-6737
              </a>
            </div>
          </div>
        </div>

        <a
          href={MAPS_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-ghost inline-flex text-sm"
        >
          Buka di Google Maps
        </a>
      </div>

      {/* Kolom Kanan: Peta */}
      {/* Peta dipendekkan di mobile supaya tidak menghabiskan satu layar penuh */}
      <div className="surface-panel h-80 flex-1 overflow-hidden p-2 sm:h-[420px] md:h-[500px]">
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
