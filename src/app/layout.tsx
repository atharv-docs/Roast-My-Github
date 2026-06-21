import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Roast My GitHub",
  description: "Get your GitHub profile roasted by local AI. Hilarious analysis of your repos, commits, and coding habits.",
  keywords: ["GitHub", "Roast", "AI", "Developer", "Humor", "Ollama"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">{children}</body>
    </html>
  );
}