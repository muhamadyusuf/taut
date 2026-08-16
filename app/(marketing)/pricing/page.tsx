import type { Metadata } from "next";
import Reveal from "@/app/_components/marketing/Reveal";
import PricingTable from "@/app/_components/billing/PricingTable";

export const metadata: Metadata = {
  title: "Harga & Paket",
  description:
    "Mulai gratis tanpa batas jumlah tautan. Naik ke Pro untuk bebas halaman iklan, subdomain sendiri, QR dinamis, dan statistik lengkap.",
};

const FAQ = [
  {
    q: "Apakah paket gratis benar-benar tanpa batas?",
    a: "Untuk jumlah tautan pendek, ya, dan itu tidak akan berubah. Yang dibatasi hanya fitur lanjutan seperti halaman bio, formulir, dan sertifikat. Akun yang terdaftar sebelum paket berbayar ini dirilis tetap mendapat kuota tanpa batas untuk fitur-fitur intinya.",
  },
  {
    q: "Apa yang terjadi pada tautan saya kalau langganan berakhir?",
    a: "Tidak ada tautan yang dimatikan. Semua tetap bekerja seperti biasa; yang kembali adalah batasan paket gratis, misalnya halaman iklan antara dan riwayat statistik yang lebih pendek.",
  },
  {
    q: "Apakah pembayaran diperpanjang otomatis?",
    a: "Tidak. Paket berlaku sesuai masa yang Anda beli, lalu berhenti dengan sendirinya. Kami mengirim pengingat sebelum masa aktif habis supaya Anda bisa memutuskan sendiri mau lanjut atau tidak.",
  },
  {
    q: "Metode pembayaran apa saja yang tersedia?",
    a: "QRIS, transfer bank (virtual account), dan e-wallet, lewat Midtrans.",
  },
  {
    q: "Saya panitia acara, hanya butuh sertifikat untuk satu kegiatan.",
    a: "Hubungi kami lewat halaman Kontak. Kami menyiapkan paket sekali bayar untuk kebutuhan per acara, tanpa langganan bulanan.",
  },
];

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
      <Reveal>
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-block rounded-full bg-brand-soft px-4 py-1.5 text-sm font-bold text-brand-soft-fg">
            Harga
          </span>
          <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl">
            Mulai gratis, bayar saat memang butuh lebih
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Memendekkan tautan tetap gratis tanpa batas. Yang berbayar adalah
            kendali atas tampilan, kedalaman data, dan identitas merek Anda.
          </p>
        </div>
      </Reveal>

      <div className="mt-14">
        <Reveal delay={120}>
          <PricingTable />
        </Reveal>
      </div>

      <div className="mx-auto mt-24 max-w-3xl">
        <h2 className="text-center text-2xl font-bold text-foreground">
          Pertanyaan yang sering muncul
        </h2>
        <div className="mt-8 space-y-4">
          {FAQ.map((item, i) => (
            <Reveal key={item.q} delay={i * 60}>
              <details className="surface-panel group p-5">
                <summary className="cursor-pointer list-none font-bold text-foreground marker:hidden">
                  <span className="flex items-start justify-between gap-4">
                    {item.q}
                    <span
                      className="mt-1 shrink-0 text-muted-foreground transition-transform group-open:rotate-45"
                      aria-hidden
                    >
                      +
                    </span>
                  </span>
                </summary>
                <p className="mt-3 text-muted-foreground">{item.a}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}
