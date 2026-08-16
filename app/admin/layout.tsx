import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import AdminSidebar from "./_components/AdminSidebar";

/**
 * Admin pertama. Hanya dipakai sebagai jalur cadangan kalau peran di database
 * belum sempat terbentuk — kebenarannya ada di kolom `role` tabel users, dan
 * setiap fungsi admin di convex/admin.ts memeriksanya sendiri.
 */
const BOOTSTRAP_ADMIN_EMAIL = "muhamadyusuf0012@gmail.com";

async function hasAdminRole(): Promise<boolean> {
  try {
    const token = await (await auth()).getToken({ template: "convex" });
    if (!token) return false;

    const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
    client.setAuth(token);
    const me = await client.query(api.users.getMe, {});
    return me?.isAdmin ?? false;
  } catch {
    // Gagal mengambil token bukan alasan untuk mengunci admin keluar —
    // pemeriksaan email di bawah masih menjaga, dan setiap query admin di
    // backend tetap menolak siapa pun yang perannya bukan admin.
    return false;
  }
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const email = user.emailAddresses[0]?.emailAddress;
  const allowed = email === BOOTSTRAP_ADMIN_EMAIL || (await hasAdminRole());

  if (!allowed) {
    redirect("/dashboard/links");
  }

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar />
      <main className="flex-1 md:ml-64 p-6 lg:p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
}
