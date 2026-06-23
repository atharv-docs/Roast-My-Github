import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GitHub Roaster — Your Code Is on Trial",
  description: "Put a public GitHub profile under the spotlight and let AI roast the evidence.",
};

export const viewport: Viewport = {
  themeColor: "#090807",
  colorScheme: "dark",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
