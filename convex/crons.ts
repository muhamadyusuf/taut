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
 * Membuang catatan keamanan yang sudah lewat masa simpan (90 hari).
 *
 * Catatan itu memuat alamat IP dan identitas orang. Menyimpannya selamanya
 * bukan kehati-hatian melainkan penimbunan: yang berguna untuk menindak sebuah
 * insiden adalah beberapa bulan terakhir, bukan tiga tahun lalu.
 */
crons.daily(
  "buang catatan keamanan kedaluwarsa",
  { hourUTC: 20, minuteUTC: 15 }, // 03:15 WIB
  internal.security.purgeOldEvents,
  {}
);

export default crons;
