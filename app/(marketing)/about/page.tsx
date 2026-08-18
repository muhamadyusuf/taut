import type { Metadata } from "next";
import { Sparkles } from "lucide-react";
import Reveal from "@/app/_components/marketing/Reveal";
import FeatureCard, { type FeatureItem } from "@/app/_components/marketing/FeatureCard";
import {
  ShieldArt,
  GlobalArt,
  AnalyticsArt,
  CommunityArt,
} from "@/app/_components/marketing/FeatureArt";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionaries";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return locale === "en"
    ? {
        title: "About Singkat.in",
        description: "A modern link management platform for all your digital needs.",
      }
    : {
        title: "Tentang Singkat.in",
        description: "Platform manajemen tautan modern untuk semua kebutuhan digital.",
      };
}

const VALUE_ART = [ShieldArt, GlobalArt, AnalyticsArt, CommunityArt];
const VALUE_TINT = ["var(--brand)", "var(--warning)", "var(--success)", "var(--info)"];
const VALUE_WIDE = [true, false, false, true];

export default async function AboutPage() {
  const locale = await getLocale();
  const t = getDictionary(locale).about;
  const VALUES: FeatureItem[] = t.values.map((v, i) => ({
    ...v,
    art: VALUE_ART[i],
    tint: VALUE_TINT[i],
    wide: VALUE_WIDE[i],
  }));

  return (
    <div className="overflow-x-hidden">
      {/* ================= INTRO ================= */}
      <section className="bg-aurora relative px-6 py-16 lg:py-24">
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-50" aria-hidden />

        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-brand shadow-sm">
              <Sparkles size={15} />
              {t.badge}
            </span>
          </Reveal>

          <Reveal delay={90}>
            <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight text-foreground md:text-5xl lg:text-6xl">
              {t.title1}{" "}
              <span className="text-gradient-animated">{t.title2}</span>
            </h1>
          </Reveal>

          <Reveal delay={180}>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
              {t.intro}
            </p>
          </Reveal>
        </div>
      </section>

      {/* ================= NILAI ================= */}
      <section className="border-y border-border bg-card py-20 lg:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal className="mb-14 text-center">
            <h2 className="text-3xl font-bold text-foreground md:text-4xl">
              {t.valuesTitle}
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
              {t.valuesSubtitle}
            </p>
          </Reveal>

          <div className="scene-3d grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {VALUES.map((value, i) => (
              <Reveal
                key={value.title}
                delay={(i % 3) * 110}
                className={value.wide ? "lg:col-span-2" : ""}
              >
                <FeatureCard {...value} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

