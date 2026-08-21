"use client";

import { useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

/**
 * UMPAN YANG DITANAM DI BUNDEL APLIKASI
 *
 * Komponen ini tidak menggambar apa pun dan tidak pernah memanggil apa pun.
 * Satu-satunya tugasnya: memastikan nama-nama fungsi umpan benar-benar ikut
 * terbawa ke berkas JavaScript yang dikirim ke browser.
 *
 * Alasannya sederhana. Orang yang berniat usil pada aplikasi Convex hampir
 * selalu memulai dari tempat yang sama: membuka devtools, membaca bundel, dan
 * mencari nama fungsi yang terdengar menjanjikan. Umpan yang hanya hidup di
 * server tidak akan pernah ditemukan siapa pun — dan umpan yang tidak pernah
 * ditemukan tidak menangkap apa-apa.
 *
 * Yang tertangkap di sini bukan orang yang salah klik. Untuk sampai pada
 * `security.upgradePlanSelfService`, seseorang harus membaca bundel, menyalin
 * nama fungsinya, lalu memanggilnya sendiri dari console. Tidak ada jalan
 * setengah sengaja ke sana.
 *
 * Fungsi umpannya sendiri (convex/security.ts) tidak menyentuh data apa pun:
 * mereka mencatat, lalu menjawab dengan galat biasa.
 */
export default function HoneypotBait() {
  // Referensi sengaja disimpan ke variabel dan tidak dipakai — inilah yang
  // membuat nama-nama di atas ikut tercetak di bundel produksi.
  const grantPlan = useMutation(api.security.upgradePlanSelfService);
  const promote = useMutation(api.security.setUserRole);
  const settleOrder = useMutation(api.security.markOrderPaid);

  // Dipasang di objek global dengan nama yang menggoda. Siapa pun yang
  // mengetikkan `__adminTools` di console — bukan pengunjung biasa — akan
  // menemukan pintu yang tampak terbuka.
  //
  // Di dalam efek, bukan saat render: menulis ke objek global selagi render
  // adalah efek samping, dan React boleh menjalankan render berkali-kali atau
  // membuangnya di tengah jalan.
  useEffect(() => {
    const w = window as unknown as Record<string, unknown>;
    w.__adminTools = { grantPlan, promote, settleOrder };

    return () => {
      delete w.__adminTools;
    };
  }, [grantPlan, promote, settleOrder]);

  return (
    <div
      aria-hidden
      hidden
      data-admin-endpoint="/api/admin/grant-plan"
      data-internal-users="/api/internal/users"
      style={{ display: "none" }}
    />
  );
}
