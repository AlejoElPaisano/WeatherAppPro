import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Climix",
  description: "Climix para consultar clima actual, pronostico y favoritos."
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>{children}</body>
    </html>
  );
}
