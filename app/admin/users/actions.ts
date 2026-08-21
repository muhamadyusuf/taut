"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

export type ClerkUserInfo = {
  id: string;
  email: string;
  name: string;
  imageUrl: string;
  createdAt: number;
};

/**
 * Server Action adalah endpoint HTTP, bukan fungsi biasa.
 *
 * Siapa pun yang tahu id action-nya bisa memanggilnya langsung tanpa pernah
 * membuka halaman admin — jadi pemeriksaan peran harus ada DI SINI, bukan
 * hanya di layout yang me-render pemanggilnya. Tanpa ini seluruh email
 * pengguna bisa dipanen hanya dengan menebak id Clerk.
 */
async function assertAdmin(): Promise<void> {
  const { userId, getToken } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const token = await getToken({ template: "convex" });
  if (!token) throw new Error("Unauthorized");

  const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
  client.setAuth(token);

  // Peran dibaca dari sumber yang sama dengan seluruh backend: kolom `role`
  // di tabel users, bukan daftar email di dalam kode.
  const me = await client.query(api.users.getMe, {});
  if (!me?.isAdmin) throw new Error("Unauthorized: Admin only");
}

export async function getUserInfoBatch(userIds: string[]): Promise<ClerkUserInfo[]> {
  await assertAdmin();

  if (userIds.length === 0) return [];

  // Batas atas menahan pemanggilan yang meminta ribuan id sekaligus, yang
  // hanya masuk akal untuk pengurasan data.
  const ids = userIds.slice(0, 200);

  const client = await clerkClient();
  const results = await Promise.allSettled(
    ids.map((id) => client.users.getUser(id))
  );

  return results
    .filter(
      (r): r is PromiseFulfilledResult<Awaited<ReturnType<typeof client.users.getUser>>> =>
        r.status === "fulfilled"
    )
    .map((r) => ({
      id: r.value.id,
      email: r.value.emailAddresses[0]?.emailAddress ?? "(no email)",
      name:
        r.value.firstName
          ? `${r.value.firstName} ${r.value.lastName ?? ""}`.trim()
          : r.value.username ?? "Unknown",
      imageUrl: r.value.imageUrl,
      createdAt: r.value.createdAt,
    }));
}
