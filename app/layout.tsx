// app/layout.tsx
import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "Matrix Planner - Gamified Tracker",
  description: "Преврати свою рутину, задачи и цели в RPG-игру с прокачкой уровня и престижем.",
  metadataBase: new URL("https://matrix-planner-five.vercel.app"),
  manifest: "/manifest.json",
  openGraph: {
    title: "MATRIX PLANNER // Planner & Tracker",
    description: "Геймифицированный планер и трекер задач в стиле ретро-терминала Матрицы.",
    url: "https://matrix-planner-five.vercel.app",
    siteName: "Matrix Planner",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Matrix Planner Link Preview",
      },
    ],
    locale: "ru_RU",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MATRIX PLANNER",
    description: "Геймифицированный планер и трекер задач в стиле Матрицы",
    images: ["/og-image.png"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Matrix Planner",
  },
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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js');
                });
              }
            `,
          }}
        />
      </head>
      <body className="bg-[#030703] text-[#00FF66] antialiased">
        {children}
      </body>
    </html>
  );
}