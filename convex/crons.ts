import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

/**
 * Merapikan akun yang masa aktif paketnya sudah lewat.
 *
 * Ini bukan penjaga hak akses — resolvePlan() di convex/plans.ts sudah
 * menghitung langganan kedaluwarsa sebagai gratis setiap kali dibaca. Cron ini
 * hanya menjaga isi tabel tetap jujur saat dilihat admin, jadi kalau ia telat
 * atau gagal jalan, tidak ada user yang jadi menikmati paket gratisan.
 */
crons.daily(
  "turunkan paket yang sudah kedaluwarsa",
  { hourUTC: 18, minuteUTC: 5 }, // 01:05 WIB
  internal.billing.expireOverduePlans,
  {}
);

/**
 * Membebaskan penyimpanan dari peristiwa klik yang sudah lewat masa retensi.
 *
 * Sama seperti cron di atas, ini bukan penjaga hak akses: query statistik
 * sudah memotong sendiri rentang yang boleh dibaca tiap paket. Yang dikerjakan
 * di sini murni membuang data mentah yang tidak akan pernah ditampilkan lagi.
 *
 * Ringkasan harian sengaja TIDAK ikut dihapus. Ukurannya hanya satu baris per
 * tautan per hari, dan menyimpannya berarti akun yang naik paket langsung
 * melihat kembali riwayat agregatnya — rincian per peristiwa memang hilang,
 * tapi bentuk grafiknya utuh.
 */
crons.daily(
  "buang peristiwa klik kedaluwarsa",
  { hourUTC: 19, minuteUTC: 30 }, // 02:30 WIB
  internal.analytics.purgeExpiredEvents,
  {}
);

export default crons;
