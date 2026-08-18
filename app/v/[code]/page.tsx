import type { Metadata } from "next";
import Link from "next/link";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { BadgeCheck, ShieldX } from "lucide-react";

export const metadata: Metadata = {
  title: "Verifikasi Sertifikat",
  description: "Periksa keaslian sertifikat yang diterbitkan lewat singkat.in.",
};

export default async function VerifyPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  const result = await fetchQuery(api.verification.verifyCertificate, {
    code: decodeURIComponent(code),
  }).catch(() => null);

  const valid = result?.valid === true;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-lg">
        <div
          className={`rounded-2xl border bg-card p-8 text-center ${
            valid ? "border-success/30" : "border-danger/30"
          }`}
        >
          <div
            className={`mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl ${
              valid
                ? "bg-success-soft text-success"
                : "bg-danger-soft text-danger"
            }`}
          >
            {valid ? <BadgeCheck size={32} /> : <ShieldX size={32} />}
          </div>

          {valid && result ? (
            <>
              <h1 className="text-2xl font-bold text-foreground">
                Sertifikat terverifikasi
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Diterbitkan lewat singkat.in
              </p>

              <dl className="mt-8 space-y-4 text-left">
                {result.recipientName && (
                  <div>
                    <dt className="text-xs font-bold uppercase text-muted-foreground">
                      Atas nama
                    </dt>
                    <dd className="mt-0.5 text-lg font-bold text-foreground">
                      {result.recipientName}
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="text-xs font-bold uppercase text-muted-foreground">
                    Kegiatan
                  </dt>
                  <dd className="mt-0.5 font-bold text-foreground">
                    {result.eventTitle}
                  </dd>
                </div>
                {result.issuerName && (
                  <div>
                    <dt className="text-xs font-bold uppercase text-muted-foreground">
                      Penyelenggara
                    </dt>
                    <dd className="mt-0.5 text-foreground">{result.issuerName}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-xs font-bold uppercase text-muted-foreground">
                    Tanggal terbit
                  </dt>
                  <dd className="mt-0.5 text-foreground">
                    {format(new Date(result.issuedAt), "d MMMM yyyy", {
                      locale: localeId,
                    })}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase text-muted-foreground">
                    Kode
                  </dt>
                  <dd className="mt-0.5 font-mono text-foreground">{result.code}</dd>
                </div>
              </dl>

              <p className="mt-8 border-t border-border pt-5 text-xs text-muted-foreground">
                Halaman ini membuktikan sertifikat tersebut benar diterbitkan
                lewat sistem kami oleh penyelenggara di atas. Isi dan kredibilitas
                kegiatannya sendiri merupakan tanggung jawab penyelenggara.
              </p>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-foreground">
                Sertifikat tidak ditemukan
              </h1>
              <p className="mt-3 text-muted-foreground">
                {result && !result.valid
                  ? result.reason
                  : "Kode ini tidak terdaftar. Periksa kembali penulisannya."}
              </p>
            </>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link href="/" className="font-bold text-brand hover:underline">
            singkat.in
          </Link>{" "}
          — sertifikat digital yang bisa diperiksa siapa saja.
        </p>
      </div>
    </div>
  );
}
