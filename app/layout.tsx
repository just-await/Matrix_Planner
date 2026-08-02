import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "Matrix Planner - Cyberpunk Planner & Tracker",
  description: "Gamified planner and tracker in Matrix style",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#030703",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <head>
        <Script 
          src="https://telegram.org/js/telegram-web-app.js" 
          strategy="beforeInteractive" 
        />
      </head>
      <body className="bg-[#030703] text-[#00FF66] antialiased">
        {children}
      </body>
    </html>
  );
}