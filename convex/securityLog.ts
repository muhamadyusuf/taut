/**
 * PENCATAT KEJADIAN KEAMANAN
 *
 * Dipisahkan dari convex/security.ts (yang berisi umpan dan halaman admin)
 * supaya modul mana pun bisa mencatat tanpa ikut menyeret lapisan izin:
 * convex/security.ts mengimpor convex/entitlements.ts, sedangkan pencatat ini
 * hanya butuh tabel users. Menyatukannya akan membuat modul dasar seperti
 * convex/abuse.ts mengimpor entitlements secara melingkar.
 *
 * DUA ATURAN YANG TIDAK BOLEH DILANGGAR PEMANGGIL:
 *
 * 1. Mencatat tidak boleh pernah menggagalkan apa pun. Karena itu seluruh isi
 *    recordSecurityEvent dibungkus try/catch.
 *
 * 2. JANGAN MENCATAT LALU MELEMPAR DI MUTATION YANG SAMA. Mutation Convex
 *    adalah satu transaksi: begitu handler-nya melempar, seluruh tulisan di
 *    dalamnya dibatalkan — termasuk catatan ini. Menjadwalkan lewat
 *    ctx.scheduler pun tidak menolong, karena penjadwalan ikut transaksional.
 *
 *    Akibatnya jebakan hanya benar-benar tercatat pada jalur yang BERAKHIR
 *    NORMAL. Itulah sebabnya:
 *      - fungsi umpan di convex/security.ts MENGEMBALIKAN objek galat, tidak
 *        melempar;
 *      - kolom umpan formulir menerima kiriman bot diam-diam lalu membuangnya,
 *        alih-alih menolaknya dengan galat;
 *      - batas laju dicatat pada panggilan yang MENGHABISKAN jatah — panggilan
 *        itu masih berakhir normal — bukan pada panggilan berikutnya yang
 *        ditolak dengan galat;
 *      - penolakan yang wajib melempar dan tidak punya panggilan "tepat
 *        sebelum" (akun terblokir, fungsi admin ditolak) memang TIDAK dicatat
 *        sama sekali, ketimbang dicatat dengan kode yang selalu dibatalkan.
 *
 *    Ini bukan kerapian gaya penulisan. Melanggarnya menghasilkan jebakan yang
 *    tampak terpasang, tidak pernah melempar galat, dan tidak menangkap apa pun.
 */

import type { MutationCtx, QueryCtx } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import { resolvePlan } from "./plans";

type Ctx = QueryCtx | MutationCtx;

/**
 * Salinan lokal dari pencarian user.
 *
 * Sengaja tidak mengimpor convex/entitlements.ts: lapisan izin di sana perlu
 * MENCATAT lewat berkas ini, dan saling mengimpor akan membuat lingkaran yang
 * urutan pemuatannya sulit ditebak.
 */
async function findUser(ctx: Ctx, clerkId: string): Promise<Doc<"users"> | null> {
  return await ctx.db
    .query("users")
    .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
    .first();
}

/** Ketukan berulang dalam rentang ini digabung ke satu baris. */
const DEDUPE_WINDOW_MS = 60 * 60 * 1000;

/**
 * Jenis kejadian yang dikenal.
 *
 * Ditulis sebagai satu daftar supaya label di halaman admin dan pencatat di
 * backend tidak pernah berbeda diam-diam.
 */
export const EVENT_KINDS = {
  honeypot_function: "Fungsi umpan dipanggil",
  honeypot_path: "Alamat umpan diketuk",
  honeypot_field: "Kolom umpan formulir terisi",
  password_bruteforce: "Sandi tautan ditebak berulang",
  blocked_link_access: "Tautan terblokir tetap diminta",
  rate_limited: "Batas laju tertembus",
} as const;

/**
 * Sengaja TIDAK ada di daftar di atas: "fungsi admin dipanggil non-admin" dan
 * "akun terblokir mencoba masuk". Keduanya hanya terjadi pada jalur yang
 * berakhir dengan melempar, dan tulisan pada jalur seperti itu selalu
 * dibatalkan bersama transaksinya. Mencantumkannya berarti menyediakan label
 * untuk kejadian yang tidak akan pernah muncul di halaman admin.
 */

export type EventKind = keyof typeof EVENT_KINDS;

export type Severity = "info" | "suspicious" | "malicious";

/**
 * Bobot bawaan tiap jenis.
 *
 * Umpan selalu "malicious": tidak ada jalan tak sengaja ke sana. Penjaga yang
 * berbunyi hanya "suspicious", karena sandi salah dan batas laju tertembus
 * juga terjadi pada orang yang sekadar keliru atau sedang sibuk.
 */
const DEFAULT_SEVERITY: Record<EventKind, Severity> = {
  honeypot_function: "malicious",
  honeypot_path: "malicious",
  honeypot_field: "malicious",
  password_bruteforce: "suspicious",
  blocked_link_access: "suspicious",
  rate_limited: "info",
};

export type EventInput = {
  kind: EventKind;
  target: string;
  severity?: Severity;
  detail?: string;
  method?: string;
  /** Diisi jalur HTTP; jalur fungsi Convex tidak pernah melihat header. */
  ip?: string;
  country?: string;
  city?: string;
  region?: string;
  userAgent?: string;
  referer?: string;
  /** Dipakai jalur HTTP yang identitasnya sudah dipastikan di sisi Next.js. */
  userId?: string;
};

/** Potong teks dari luar sebelum disimpan; log bukan tempat menaruh novel. */
function clip(value: string | undefined, max: number): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.length > max ? `${trimmed.slice(0, max)}…` : trimmed;
}

/**
 * Mencatat satu kejadian keamanan.
 *
 * Dipanggil dari mutation lain, jadi ia tidak boleh melempar apa pun: kegagalan
 * mencatat tidak boleh menggagalkan penjagaan yang sedang berlangsung, dan
 * tidak boleh pula membatalkan transaksi yang memanggilnya.
 */
export async function recordSecurityEvent(
  ctx: MutationCtx,
  input: EventInput
): Promise<void> {
  try {
    const now = Date.now();

    // Identitas diambil dari sesi bila ada. Argumen userId hanya dipakai jalur
    // HTTP, yang identitasnya sudah diverifikasi Clerk di sisi Next.js.
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject ?? input.userId;

    const user = userId ? await findUser(ctx, userId) : null;

    const actorKey = userId
      ? `user:${userId}`
      : input.ip
        ? `ip:${input.ip}`
        : "anon:unknown";

    const target = clip(input.target, 300) ?? "(tidak diketahui)";
    const dedupeKey = `${input.kind}|${actorKey}|${target}`;

    const severity = input.severity ?? DEFAULT_SEVERITY[input.kind];

    const existing = await ctx.db
      .query("security_events")
      .withIndex("by_dedupeKey", (q) => q.eq("dedupeKey", dedupeKey))
      .order("desc")
      .first();

    // Ketukan lanjutan dalam satu jam menambah penghitung baris yang sama.
    // Barisnya juga dibuka kembali (handledAt dikosongkan): pelaku yang
    // mengulang setelah perkaranya ditutup adalah kabar baru, bukan kabar lama.
    if (existing && now - existing.lastTs < DEDUPE_WINDOW_MS) {
      await ctx.db.patch(existing._id, {
        hits: existing.hits + 1,
        lastTs: now,
        handledAt: undefined,
        ...(input.detail ? { detail: clip(input.detail, 500) } : {}),
      });
      return;
    }

    await ctx.db.insert("security_events", {
      kind: input.kind,
      severity,
      actorKey,
      dedupeKey,

      userId: userId ?? undefined,
      email: user?.email ?? identity?.email ?? undefined,
      name: user?.name ?? identity?.name ?? undefined,
      plan: user ? resolvePlan(user) : undefined,

      ip: clip(input.ip, 64),
      country: clip(input.country, 8),
      city: clip(input.city, 120),
      region: clip(input.region, 120),
      userAgent: clip(input.userAgent, 400),
      referer: clip(input.referer, 300),

      target,
      method: clip(input.method, 12),
      detail: clip(input.detail, 500),

      hits: 1,
      firstTs: now,
      lastTs: now,
    });
  } catch (error) {
    // Sengaja ditelan. Lihat komentar di atas: pencatat tidak boleh menjadi
    // sebab gagalnya operasi yang ia awasi.
    console.error("Gagal mencatat kejadian keamanan:", error);
  }
}


