import { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { ToastProvider } from "@/components/layout/toast-provider";
import { SocketProvider } from "@/lib/socket-context";
import { NetworkProvider } from "@/lib/network-context";
import { MainNav } from "@/components/layout/main-nav";
import { Footer } from "@/components/layout/footer";
import { NetworkStatus } from "@/components/ui/network-status";
import { InstallPrompt } from "@/components/ui/install-prompt";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "BookBarter",
    template: "",
  },
  description: "A peer-to-peer platform to share and exchange books",
  keywords: [
    "books",
    "exchange",
    "sharing",
    "peer-to-peer",
    "p2p",
    "community",
    "reading",
  ],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "BookBarter",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta
          name="theme-color"
          content="#ffffff"
          media="(prefers-color-scheme: light)"
        />
        <meta
          name="theme-color"
          content="#121212"
          media="(prefers-color-scheme: dark)"
        />
      </head>
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <NetworkProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <SocketProvider>
              <MainNav />
              <NetworkStatus />
              <main className="flex-1">{children}</main>
              <Footer />
              <InstallPrompt />
              <ToastProvider />
            </SocketProvider>
          </ThemeProvider>
        </NetworkProvider>
      </body>
    </html>
  );
}
