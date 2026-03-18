import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BeatWise - Know your beats, prep your sets",
  description: "Save hours preparing your music library. BeatWise validates, organizes, and tags your tracks using AI—from download to session start.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;600;700&family=JetBrains+Mono:wght@400;600&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className="h-full antialiased">
        {children}
      </body>
    </html>
  );
}
