/**
 * STATISTIK KLIK
 *
 * Retensi ditegakkan SAAT MEMBACA, bukan hanya lewat pekerjaan terjadwal.
 * Prinsipnya sama dengan resolvePlan(): kalau penghapusan berkala telat atau
 * gagal jalan, akun yang turun paket tidak boleh mendadak bisa melihat lagi
 * data setahun lalu. Pekerjaan terjadwal hanya membebaskan penyimpanan.
 */

import { v } from "convex/values";
import { internalMutation, query } from "./_generated/server";
import { getEntitlements } from "./entitlements";
import { getLimit, isUnlimited, planHasFeature } from "./plans";

const DAY_MS = 24 * 60 * 60 * 1000;

/** Batas waktu paling awal yang boleh dilihat akun ini. */
function retentionFloor(
  plan: Parameters<typeof getLimit>[0],
  legacyFree: boolean,
  now: number
): number {
  const days = getLimit(plan, "analyticsRetentionDays", legacyFree);
  if (isUnlimited(days)) return 0;
  return now - days * DAY_MS;
}

function jakartaDate(ts: number): string {
  const d = new Date(ts + 7 * 60 * 60 * 1000);
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${d.getUTCFullYear()}-${month}-${day}`;
}

function mergeBuckets(
  target: Record<string, number>,
  source: Record<string, number>
) {
  for (const [key, value] of Object.entries(source)) {
    target[key] = (target[key] ?? 0) + value;
  }
}

function topEntries(bucket: Record<string, number>, limit = 8) {
  return Object.entries(bucket)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([label, count]) => ({ label, count }));
}

/**
 * Ringkasan lengkap untuk halaman statistik.
 *
 * `days` adalah rentang yang diminta pengguna; hasilnya tetap dipotong oleh
 * batas retensi paketnya, jadi meminta 365 hari di paket gratis tetap hanya
 * mengembalikan tujuh hari terakhir.
 */
export const getOverview = query({
  args: { days: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const ent = await getEntitlements(ctx);
    const now = Date.now();

    const retentionDays = getLimit(
      ent.plan,
      "analyticsRetentionDays",
      ent.legacyFree
    );
    const floor = retentionFloor(ent.plan, ent.legacyFree, now);
    const requested = args.days ?? (isUnlimited(retentionDays) ? 90 : retentionDays);
    const since = Math.max(floor, now - requested * DAY_MS);
    const sinceDate = jakartaDate(since);

    const rows = await ctx.db
      .query("click_daily")
      .withIndex("by_userId_date", (q) =>
        q.eq("userId", identity.subject).gte("date", sinceDate)
      )
      .collect();

    const byDate: Record<string, number> = {};
    const byCountry: Record<string, number> = {};
    const byDevice: Record<string, number> = {};
    const byReferrer: Record<string, number> = {};
    const byLink: Record<string, number> = {};

    for (const row of rows) {
      byDate[row.date] = (byDate[row.date] ?? 0) + row.count;
      byLink[row.linkId] = (byLink[row.linkId] ?? 0) + row.count;
      mergeBuckets(byCountry, row.byCountry);
      mergeBuckets(byDevice, row.byDevice);
      mergeBuckets(byReferrer, row.byReferrer);
    }

    // Deret waktu diisi lengkap termasuk hari tanpa klik — grafik yang
    // melompati tanggal kosong membuat lonjakan terlihat lebih landai
    // daripada kenyataannya.
    const timeseries: { date: string; clicks: number }[] = [];
    for (let t = since; t <= now; t += DAY_MS) {
      const date = jakartaDate(t);
      timeseries.push({ date, clicks: byDate[date] ?? 0 });
    }

    const links = await ctx.db
      .query("links")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .collect();

    const linkTitle = new Map(
      links.map((l) => [l._id as string, l.title || l.shortCode])
    );

    const topLinks = Object.entries(byLink)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id, count]) => ({
        label: linkTitle.get(id) ?? "Tautan terhapus",
        count,
      }));

    const totalInRange = Object.values(byDate).reduce((a, b) => a + b, 0);

    return {
      plan: ent.plan,
      hasDetailed: planHasFeature(ent.plan, "detailed_analytics"),
      retentionDays,
      rangeDays: Math.round((now - since) / DAY_MS),

      totalInRange,
      // Penghitung sepanjang masa tetap dari tabel links: peristiwa lama sudah
      // dihapus oleh retensi, jadi menjumlah ulang dari sana akan menyusut
      // seiring waktu dan terlihat seperti kehilangan data.
      totalAllTime: links.reduce((acc, l) => acc + l.clicks, 0),
      activeLinks: links.length,

      timeseries,
      topLinks,
      topCountries: topEntries(byCountry),
      topDevices: topEntries(byDevice),
      topReferrers: topEntries(byReferrer),
    };
  },
});

/** Peristiwa terakhir, untuk daftar aktivitas. Hanya paket dengan analitik lengkap. */
export const getRecentEvents = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const ent = await getEntitlements(ctx);
    if (!planHasFeature(ent.plan, "detailed_analytics")) return [];

    const floor = retentionFloor(ent.plan, ent.legacyFree, Date.now());

    const events = await ctx.db
      .query("click_events")
      .withIndex("by_userId_ts", (q) =>
        q.eq("userId", identity.subject).gte("ts", floor)
      )
      .order("desc")
      .take(Math.min(args.limit ?? 25, 100));

    const links = await ctx.db
      .query("links")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .collect();
    const titles = new Map(
      links.map((l) => [l._id as string, l.title || l.shortCode])
    );

    return events.map((e) => ({
      id: e._id,
      ts: e.ts,
      linkTitle: titles.get(e.linkId as string) ?? "Tautan terhapus",
      country: e.country ?? null,
      city: e.city ?? null,
      device: e.device ?? null,
      browser: e.browser ?? null,
      referrerHost: e.referrerHost ?? null,
    }));
  },
});

/**
 * Membebaskan penyimpanan dari peristiwa yang sudah lewat masa retensi.
 *
 * Dijalankan bertahap dengan batas per eksekusi: satu akun bisa saja punya
 * ratusan ribu peristiwa kedaluwarsa, dan menghapus semuanya sekaligus akan
 * menabrak batas ukuran transaksi. Sisanya diambil pada jadwal berikutnya.
 */
export const purgeExpiredEvents = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const MAX_DELETIONS = 2000;
    let deleted = 0;

    for (const plan of ["free", "pro"] as const) {
      const users = await ctx.db
        .query("users")
        .withIndex("by_plan", (q) => q.eq("plan", plan))
        .collect();

      for (const user of users) {
        if (deleted >= MAX_DELETIONS) return { deleted, finished: false };

        const floor = retentionFloor(plan, user.legacyFree, now);
        if (floor <= 0) continue;

        const stale = await ctx.db
          .query("click_events")
          .withIndex("by_userId_ts", (q) =>
            q.eq("userId", user.clerkId).lt("ts", floor)
          )
          .take(MAX_DELETIONS - deleted);

        for (const event of stale) {
          await ctx.db.delete(event._id);
          deleted += 1;
        }
      }
    }

    return { deleted, finished: true };
  },
});
