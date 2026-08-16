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

export default crons;
