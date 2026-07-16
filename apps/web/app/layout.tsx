import type { Metadata } from "next";
import "./globals.css";
import AppShell from "./components/AppShell";

export const metadata: Metadata = {
  title: "YINDEE — แชทออมนิแชนเนล",
  description: "Separated platform rooms with AI-assisted support workflows.",
  icons: {
    icon: "/yindee-logo.png",
    apple: "/yindee-logo.png"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
