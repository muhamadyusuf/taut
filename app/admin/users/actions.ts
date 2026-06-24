"use server";

import { clerkClient } from "@clerk/nextjs/server";

export type ClerkUserInfo = {
  id: string;
  email: string;
  name: string;
  imageUrl: string;
  createdAt: number;
};

export async function getUserInfoBatch(userIds: string[]): Promise<ClerkUserInfo[]> {
  if (userIds.length === 0) return [];

  const client = await clerkClient();
  const results = await Promise.allSettled(
    userIds.map((id) => client.users.getUser(id))
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
