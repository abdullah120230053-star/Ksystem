import type { Metadata, Viewport } from "next";
import "./globals.css";
import { KsystemProvider } from "@/context/KsystemContext";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "نظام إدارة كُتّاب تحفيظ القرآن والاشتراكات",
  description: "نظام سحابي لإدارة الطلاب والعائلات والاشتراكات الشهرية والغياب اليومي والتقارير المالية لكتاب تحفيظ القرآن",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0F5132",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <AuthProvider>
          <KsystemProvider>
            {children}
          </KsystemProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
