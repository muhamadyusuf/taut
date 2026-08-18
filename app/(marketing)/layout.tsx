import Footer from "../_components/marketing/Footer";
import Navbar from "../_components/marketing/Navbar";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionaries";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const dict = getDictionary(locale);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Navbar nempel di atas */}
      <Navbar locale={locale} dict={{ nav: dict.nav, languageToggle: dict.languageToggle }} />

      {/* Isi Halaman (Home/About/Contact) */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer nempel di bawah */}
      <Footer dict={dict} />
    </div>
  );
}
