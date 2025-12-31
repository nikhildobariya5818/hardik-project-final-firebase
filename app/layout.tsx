import type React from "react"
import "./globals.css"
import { AuthProvider } from "@/contexts/AuthContext"
import { QueryProvider } from "@/components/providers/QueryProvider"
import type { Metadata, Viewport } from "next"

export const metadata: Metadata = {
  title: "DeliveryPro - Material Delivery Management",
  description:
    "Complete solution for tracking truck deliveries, managing clients, generating invoices, and monitoring your construction material business",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "DeliveryPro",
  },
  applicationName: "DeliveryPro",
  formatDetection: {
    telephone: false,
  },
    generator: 'v0.app'
}

export const viewport: Viewport = {
  themeColor: "#1e40af",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/apple-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icon-light-32x32.png" />
      </head>
      <body>
        <QueryProvider>
          <AuthProvider>{children}</AuthProvider>
        </QueryProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      console.log('[v0] ServiceWorker registration successful');
                    },
                    function(err) {
                      console.log('[v0] ServiceWorker registration failed: ', err);
                    }
                  );
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}
