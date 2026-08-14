"use client";

import { ReactNode } from "react";
import { ThemeProvider, useTheme } from "next-themes";
import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

/**
 * Clerk merender UI-nya sendiri (modal login, UserButton, UserProfile) sehingga
 * tidak ikut class `.dark` kita. Warnanya disuntik lewat `appearance.variables`
 * agar tetap sinkron dengan tema aktif.
 */
function ClerkWithTheme({ children }: { children: ReactNode }) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <ClerkProvider
      appearance={{
        variables: isDark
          ? {
              colorPrimary: "#3aade0",
              colorBackground: "#121a26",
              colorText: "#e6edf7",
              colorTextSecondary: "#93a4bb",
              colorInputBackground: "#16202c",
              colorInputText: "#e6edf7",
              colorNeutral: "#e6edf7",
              colorDanger: "#f87171",
              colorSuccess: "#4ade80",
              colorWarning: "#fbbf24",
              borderRadius: "0.75rem",
              fontFamily: "'Poppins', sans-serif",
            }
          : {
              colorPrimary: "#0193ff",
              colorBackground: "#ffffff",
              colorText: "#1f2b3d",
              colorTextSecondary: "#64748b",
              colorInputBackground: "#ffffff",
              colorInputText: "#1f2b3d",
              borderRadius: "0.75rem",
              fontFamily: "'Poppins', sans-serif",
            },
        elements: {
          card: "shadow-xl",
        },
      }}
    >
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}

export default function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <ClerkWithTheme>{children}</ClerkWithTheme>
    </ThemeProvider>
  );
}
