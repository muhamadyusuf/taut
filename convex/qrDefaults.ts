/**
 * Gaya QR bawaan singkat.in.
 *
 * File terpisah dari qr.ts supaya aman diimpor di browser — qr.ts mengimpor
 * `query`/`mutation` dari `_generated/server`, dan Convex melarang modul itu
 * dibundel ke client sekalipun yang dipakai cuma satu konstanta di dalamnya.
 */
export const DEFAULT_QR_STYLE = {
  fgColor: "#000000",
  bgColor: "#ffffff",
  logoUrl: undefined as string | undefined,
  logoSizeRatio: 0.22,
  dotStyle: "squares",
  quietZone: 5,
};
