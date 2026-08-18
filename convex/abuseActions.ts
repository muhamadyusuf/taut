"use node";

import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";

/**
 * Pemeriksaan tautan ke Google Safe Browsing.
 *
 * Dijalankan terjadwal SETELAH tautan dibuat, bukan sebelum: panggilan jaringan
 * tidak boleh berada di jalur pembuatan tautan. Kalau Google sedang lambat atau
 * mati, pengguna tetap harus bisa memendekkan tautannya — pemeriksaannya yang
 * menyusul beberapa detik kemudian.
 *
 * Butuh environment variable GOOGLE_SAFE_BROWSING_KEY di dashboard Convex.
 * Tanpa kunci itu pemeriksaan dilewati dengan diam — fitur pengaman yang
 * setengah terpasang tidak boleh membuat aplikasi utama gagal.
 */
export const checkLinkSafety = internalAction({
  args: {
    linkId: v.id("links"),
    url: v.string(),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.GOOGLE_SAFE_BROWSING_KEY;
    if (!apiKey) return { skipped: true as const };

    try {
      const response = await fetch(
        `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            client: { clientId: "singkat-in", clientVersion: "1.0.0" },
            threatInfo: {
              threatTypes: [
                "MALWARE",
                "SOCIAL_ENGINEERING",
                "UNWANTED_SOFTWARE",
                "POTENTIALLY_HARMFUL_APPLICATION",
              ],
              platformTypes: ["ANY_PLATFORM"],
              threatEntryTypes: ["URL"],
              threatEntries: [{ url: args.url }],
            },
          }),
        }
      );

      if (!response.ok) {
        console.error("Safe Browsing merespons", response.status);
        return { skipped: true as const };
      }

      const body = (await response.json()) as {
        matches?: { threatType?: string }[];
      };

      const matches = body.matches ?? [];
      if (matches.length === 0) {
        await ctx.runMutation(internal.abuse.applyThreatVerdict, {
          linkId: args.linkId,
          verdict: "active",
        });
        return { verdict: "active" as const };
      }

      const threatTypes = matches.map((m) => m.threatType).filter(Boolean);

      // Rekayasa sosial (phishing) dan perangkat perusak diblokir langsung —
      // keduanya merugikan pengunjung seketika. Sisanya ditandai agar admin
      // memutuskan, supaya positif palsu tidak langsung mematikan tautan sah.
      const severe = threatTypes.some(
        (t) => t === "MALWARE" || t === "SOCIAL_ENGINEERING"
      );

      await ctx.runMutation(internal.abuse.applyThreatVerdict, {
        linkId: args.linkId,
        verdict: severe ? "blocked" : "flagged",
        reason: `Google Safe Browsing: ${threatTypes.join(", ")}`,
      });

      return { verdict: severe ? ("blocked" as const) : ("flagged" as const) };
    } catch (error) {
      // Kegagalan jaringan tidak boleh menandai tautan sah sebagai berbahaya.
      console.error("Safe Browsing gagal dihubungi:", error);
      return { skipped: true as const };
    }
  },
});
