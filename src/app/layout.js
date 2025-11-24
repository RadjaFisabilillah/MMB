// src/app/layout.js
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        {/* Tautan Wajib PWA */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#323232" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
      </head>
      <body>
        <AuthProvider>
          <div
            className="flex flex-col min-h-screen"
            style={{ backgroundColor: "#323232" }}
          >
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
