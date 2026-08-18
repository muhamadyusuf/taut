import type { Metadata } from "next";
import Reveal from "@/app/_components/marketing/Reveal";
import PricingTable from "@/app/_components/billing/PricingTable";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionaries";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return locale === "en"
    ? {
        title: "Pricing & Plans",
        description:
          "Start free with unlimited links. Upgrade to Pro for ad-free pages, your own subdomain, dynamic QR, and full statistics.",
      }
    : {
        title: "Harga & Paket",
        description:
          "Mulai gratis tanpa batas jumlah tautan. Naik ke Pro untuk bebas halaman iklan, subdomain sendiri, QR dinamis, dan statistik lengkap.",
      };
}

export default async function PricingPage() {
  const locale = await getLocale();
  const t = getDictionary(locale).pricing;

  return (
    <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
      <Reveal>
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-block rounded-full bg-brand-soft px-4 py-1.5 text-sm font-bold text-brand-soft-fg">
            {t.badge}
          </span>
          <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl">
            {t.title}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            {t.subtitle}
          </p>
        </div>
      </Reveal>

      <div className="mt-14">
        <Reveal delay={120}>
          <PricingTable locale={locale} />
        </Reveal>
      </div>

      <div className="mx-auto mt-24 max-w-3xl">
        <h2 className="text-center text-2xl font-bold text-foreground">
          {t.faqTitle}
        </h2>
        <div className="mt-8 space-y-4">
          {t.faq.map((item, i) => (
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
