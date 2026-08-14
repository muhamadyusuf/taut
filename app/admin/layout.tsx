import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import AdminSidebar from "./_components/AdminSidebar";

const ADMIN_EMAIL = "muhamadyusuf0012@gmail.com";

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
  if (email !== ADMIN_EMAIL) {
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
