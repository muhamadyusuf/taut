import { redirect } from "next/navigation";
import Link from "next/link";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { Globe } from "lucide-react";

/**
 * Akar sebuah subdomain penyewa, mis. "tokosaya.singkat.in/".
 *
 * Kalau pemiliknya punya halaman bio, ke sanalah pengunjung dibawa — itu
 * jawaban yang paling masuk akal untuk orang yang mengetik nama subdomain
 * tanpa kode apa pun. Kalau tidak ada, halaman ini menjelaskan keadaannya
 * alih-alih menampilkan 404 yang membingungkan.
 */
export default async function SubdomainRootPage({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}) {
  const { subdomain } = await params;

  const owner = await fetchQuery(api.subdomains.getOwner, { subdomain }).catch(
    () => null
  );

  if (owner?.micrositeSlug) {
    redirect(`/bio/${owner.micrositeSlug}`);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center">
        <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-brand-soft text-brand">
          <Globe size={26} />
        </div>

        <h1 className="text-xl font-bold text-foreground">
          {subdomain}.singkat.in
        </h1>

        <p className="mt-3 text-muted-foreground">
          {owner
            ? "Alamat ini aktif, tetapi pemiliknya belum menyiapkan halaman utama. Tautan pendek di bawah alamat ini tetap bekerja seperti biasa."
            : "Alamat ini belum terdaftar."}
        </p>

        <Link href="https://singkat.in" className="mt-7 inline-block">
          <button className="btn-ghost px-8 py-3">Tentang singkat.in</button>
        </Link>
      </div>
    </div>
  );
}
