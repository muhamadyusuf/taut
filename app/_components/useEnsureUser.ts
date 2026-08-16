"use client";

import { useEffect, useRef } from "react";
import { useConvexAuth, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

/**
 * Memastikan baris `users` untuk akun yang sedang login sudah ada.
 *
 * Dipanggil sekali di layout dasbor & admin. Tanpa ini, user tidak punya
 * tempat penyimpanan paket sama sekali dan selamanya dianggap gratis.
 *
 * Pemicunya sengaja `useConvexAuth`, bukan `isSignedIn` dari Clerk: Clerk
 * menyatakan "sudah login" lebih dulu daripada Convex selesai memasang token,
 * dan mutation yang berangkat di sela itu akan melihat identitas kosong lalu
 * diam-diam tidak melakukan apa pun.
 */
export function useEnsureUser() {
  const { isAuthenticated } = useConvexAuth();
  const ensureCurrent = useMutation(api.users.ensureCurrent);
  const sent = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || sent.current) return;
    sent.current = true;

    ensureCurrent().catch(() => {
      // Biarkan percobaan berikutnya jalan — kegagalan di sini tidak boleh
      // menghalangi user memakai dasbor, cukup dicoba lagi saat render ulang.
      sent.current = false;
    });
  }, [isAuthenticated, ensureCurrent]);
}
