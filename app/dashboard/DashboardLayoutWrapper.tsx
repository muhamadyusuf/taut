import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import DashboardLayout from "./layout";

async function validateUser() {
  const user = await currentUser();
  
  if (!user) {
    redirect("/sign-in");
  }
  
  const email = user.emailAddresses[0]?.emailAddress;

  if (!email || !email.endsWith("@itts.ac.id")) {
    redirect("/unauthorized");
  }
  
  return user;
}

export default async function DashboardLayoutWrapper({ children }: { children: React.ReactNode }) {
  await validateUser();
  
  return <DashboardLayout>{children}</DashboardLayout>;
}
