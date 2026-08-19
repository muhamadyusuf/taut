import { SignOutButton } from "@clerk/nextjs";
import { ShieldAlert, LogOut } from "lucide-react";
import Link from "next/link";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionaries";

export default async function UnauthorizedPage() {
  const t = getDictionary(await getLocale()).dashboard.unauthorized;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
      <div className="card-saweria max-w-md w-full p-8 flex flex-col items-center">

        {/* Icon Besar */}
        <div className="bg-danger-soft p-4 rounded-full text-danger mb-6 animate-pulse">
          <ShieldAlert size={64} />
        </div>

        {/* Pesan Error */}
        <h1 className="text-2xl font-bold text-foreground mb-2">{t.title}</h1>
        <p className="text-muted-foreground mb-8 leading-relaxed">
          {t.body1} <b>{t.orgName}</b>.
          <br /><br />
          {t.body2}{" "}
          <span className="font-bold text-brand">@itts.ac.id</span>.
        </p>

        {/* Tombol Logout & Kembali */}
        <div className="flex flex-col w-full gap-3">
          <SignOutButton redirectUrl="/">
            <button className="w-full bg-danger hover:opacity-90 text-white font-semibold py-2.5 px-6 rounded-full transition active:scale-95 flex items-center justify-center gap-2">
              <LogOut size={18} /> {t.signOut}
            </button>
          </SignOutButton>

          <Link href="/" className="text-sm text-muted-foreground hover:text-brand mt-2 font-medium transition-colors">
            {t.backHome}
          </Link>
        </div>

      </div>
    </div>
  );
}
