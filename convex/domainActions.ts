"use node";

import { v } from "convex/values";
import { action, internalAction } from "./_generated/server";
import { api, internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";

/**
 * Jembatan ke Vercel Domains API.
 *
 * Kepemilikan domain tidak bisa kita berikan, hanya bisa dibuktikan: Vercel
 * yang menerbitkan sertifikat, dan ia baru mau melakukannya setelah DNS milik
 * pengguna benar-benar menunjuk ke sini. Karena itu seluruh kebenaran status
 * datang dari Vercel, dan tabel domains hanya menyimpan cerminannya.
 *
 * Butuh environment variable di dashboard Convex:
 *   VERCEL_API_TOKEN   — token dengan akses ke proyek
 *   VERCEL_PROJECT_ID  — id proyek (prj_...)
 *   VERCEL_TEAM_ID     — opsional, hanya bila proyek berada di dalam tim
 */
function vercelConfig() {
  const token = process.env.VERCEL_API_TOKEN;
  const projectId = process.env.VERCEL_PROJECT_ID;

  if (!token || !projectId) {
    throw new Error(
      "Domain sendiri belum dikonfigurasi. Set VERCEL_API_TOKEN dan VERCEL_PROJECT_ID di environment variable Convex."
    );
  }

  const teamQuery = process.env.VERCEL_TEAM_ID
    ? `?teamId=${process.env.VERCEL_TEAM_ID}`
    : "";

  return { token, projectId, teamQuery };
}

type VercelVerification = { type: string; domain: string; value: string };

async function vercelFetch(
  path: string,
  token: string,
  init?: RequestInit
): Promise<{ ok: boolean; status: number; body: Record<string, unknown> }> {
  const response = await fetch(`https://api.vercel.com${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  let body: Record<string, unknown> = {};
  try {
    body = (await response.json()) as Record<string, unknown>;
  } catch {
    // Sebagian respons Vercel (mis. DELETE sukses) tidak berisi JSON.
  }

  return { ok: response.ok, status: response.status, body };
}

/**
 * Mendaftarkan domain ke proyek Vercel dan mengembalikan petunjuk DNS.
 *
 * Domain yang sudah terpakai di proyek Vercel lain akan ditolak Vercel dengan
 * kode khusus; pesannya diterjemahkan supaya pengguna tahu harus berbuat apa
 * alih-alih membaca istilah internal Vercel.
 */
export const registerDomain = action({
  args: { domainId: v.id("domains") },
  handler: async (
    ctx,
    args
  ): Promise<{ status: string; verification: VercelVerification[]; note?: string }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const row = await ctx.runQuery(api.domains.getForAction, { id: args.domainId });
    if (!row) throw new Error("Domain tidak ditemukan atau bukan milik Anda.");

    const { token, projectId, teamQuery } = vercelConfig();

    const result = await vercelFetch(
      `/v10/projects/${projectId}/domains${teamQuery}`,
      token,
      { method: "POST", body: JSON.stringify({ name: row.domain }) }
    );

    if (!result.ok) {
      const error = (result.body.error ?? {}) as { code?: string; message?: string };

      // 409 berarti domain sudah terpasang di proyek ini — bukan kegagalan,
      // hanya pendaftaran ulang. Lanjutkan ke pemeriksaan status.
      if (result.status !== 409) {
        const note =
          error.code === "domain_already_in_use"
            ? "Domain ini sudah dipakai di proyek Vercel lain. Lepaskan dari sana lebih dulu."
            : (error.message ?? "Vercel menolak pendaftaran domain ini.");

        await ctx.runMutation(internal.domains.upsertStatus, {
          domainId: args.domainId,
          status: "error",
          note,
        });

        return { status: "error", verification: [], note };
      }
    }

    return await ctx.runAction(api.domainActions.checkDomain, {
      domainId: args.domainId,
    });
  },
});

/**
 * Memeriksa apakah DNS pengguna sudah benar dan sertifikatnya terbit.
 *
 * Dipanggil manual oleh pengguna lewat tombol, bukan berkala: perubahan DNS
 * bisa memakan waktu menit hingga jam, dan menjadwalkan pemeriksaan otomatis
 * setiap beberapa detik untuk setiap domain tertunda hanya menghabiskan kuota
 * API tanpa mempercepat apa pun.
 */
export const checkDomain = action({
  args: { domainId: v.id("domains") },
  handler: async (
    ctx,
    args
  ): Promise<{ status: string; verification: VercelVerification[]; note?: string }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const row = await ctx.runQuery(api.domains.getForAction, { id: args.domainId });
    if (!row) throw new Error("Domain tidak ditemukan atau bukan milik Anda.");

    const { token, projectId, teamQuery } = vercelConfig();

    // Dua panggilan berbeda dan keduanya perlu: `config` menjawab "apakah DNS
    // sudah menunjuk ke sini", sedangkan endpoint domain menjawab "apakah
    // kepemilikannya sudah terbukti". Domain bisa lolos satu tapi tidak yang lain.
    const [config, domain] = await Promise.all([
      vercelFetch(`/v6/domains/${row.domain}/config${teamQuery}`, token),
      vercelFetch(`/v9/projects/${projectId}/domains/${row.domain}${teamQuery}`, token),
    ]);

    const misconfigured = config.body.misconfigured === true;
    const verified = domain.body.verified === true;
    const verification = (domain.body.verification ?? []) as VercelVerification[];

    let status: string;
    let note: string | undefined;

    if (!domain.ok) {
      status = "error";
      note = "Domain belum terdaftar di Vercel. Coba daftarkan ulang.";
    } else if (!verified) {
      status = "pending";
      note = "Menunggu bukti kepemilikan. Tambahkan record di bawah ini ke DNS Anda.";
    } else if (misconfigured) {
      status = "pending";
      note = "Kepemilikan terbukti, tetapi DNS belum menunjuk ke server kami.";
    } else {
      status = "active";
      note = undefined;
    }

    await ctx.runMutation(internal.domains.upsertStatus, {
      domainId: args.domainId,
      status,
      note,
      verification: verification.length > 0 ? verification : undefined,
    });

    return { status, verification, note };
  },
});

/**
 * Melepas domain dari proyek Vercel.
 *
 * Internal, dan dijadwalkan oleh domains.remove setelah baris pemiliknya
 * dihapus. Sewaktu ini masih action publik yang menerima nama domain apa
 * adanya, pengguna mana pun yang sudah login bisa memanggilnya dengan domain
 * milik penyewa lain — atau dengan singkat.in sendiri — dan mencabutnya dari
 * proyek Vercel. Kepemilikan tidak bisa diperiksa di sini karena barisnya sudah
 * tiada saat pemanggilan; karena itu yang boleh memanggil hanya backend.
 */
export const unregisterDomain = internalAction({
  args: { domain: v.string() },
  handler: async (ctx, args): Promise<{ ok: boolean }> => {
    try {
      const { token, projectId, teamQuery } = vercelConfig();
      await vercelFetch(
        `/v9/projects/${projectId}/domains/${args.domain}${teamQuery}`,
        token,
        { method: "DELETE" }
      );
      return { ok: true };
    } catch {
      // Gagal melepas di sisi Vercel tidak boleh menghalangi pengguna
      // membersihkan daftarnya sendiri; sisanya dirapikan manual.
      return { ok: false };
    }
  },
});
