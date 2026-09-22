/**
 * STATISTIK KLIK
 *
 * Sengaja hanya membaca `links.clicks` (penghitung yang sudah ada dan sudah
 * ditulis setiap klik), bukan tabel peristiwa per-klik atau ringkasan harian
 * terpisah. Tautan yang viral dulu bisa menghasilkan ratusan ribu baris baru
 * sehari di tabel semacam itu; penghitung agregat di dokumen link sendiri
 * tidak menambah satu baris pun per klik.
 */

import { query } from "./_generated/server";

/**
 * Ringkasan untuk halaman statistik: total klik dan tautan mana yang paling
 * ramai. Tanpa rincian negara/perangkat/waktu karena data sedetail itu tidak
 * lagi disimpan.
 */
export const getOverview = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const links = await ctx.db
      .query("links")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .collect();

    const totalAllTime = links.reduce((acc, l) => acc + l.clicks, 0);

    const topLinks = [...links]
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 5)
      .map((l) => ({ label: l.title || l.shortCode, count: l.clicks }));

    return {
      totalAllTime,
      activeLinks: links.length,
      topLinks,
    };
  },
});
