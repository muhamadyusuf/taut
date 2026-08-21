import { redirect } from "next/navigation";
import Link from "next/link";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { Globe } from "lucide-react";
import NotFoundPage from "@/app/not-found";

/** Akar sebuah domain milik pengguna, mis. "link.brandanda.com/". */
export default async function DomainRootPage({
  params,
}: {
  params: Promise<{ host: string }>;
}) {
  const { host } = await params;

  const owner = await fetchQuery(api.domains.getActiveByHost, { host }).catch(
    () => null
  );

  if (!owner) return <NotFoundPage />;

  const microsite = await fetchQuery(api.microsites.getFirstByUser, {
    userId: owner.userId,
  }).catch(() => null);

  if (microsite?.slug) {
    redirect(`/bio/${microsite.slug}`);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center">
        <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-brand-soft text-brand">
          <Globe size={26} />
        </div>
        <h1 className="text-xl font-bold text-foreground">{owner.domain}</h1>
        <p className="mt-3 text-muted-foreground">
          Alamat ini aktif, tetapi pemiliknya belum menyiapkan halaman utama.
          Tautan pendek di bawah alamat ini tetap bekerja seperti biasa.
        </p>
        <Link href="https://singkat.in" className="mt-7 inline-block">
          <button className="btn-ghost px-8 py-3">Tentang singkat.in</button>
        </Link>
      </div>
    </div>
  );
}
