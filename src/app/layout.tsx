import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/auth-provider";
import { SearchCommandProvider } from "@/components/search-command-provider";
import { getSettings } from "@/lib/data/settings";

const VAZIRMATN_URL = "https://cdn.jsdelivr.net/fontsource/fonts/vazirmatn@latest/variable-full/vazirmatn-VariableFont_wght.woff2";
const JETBRAINS_URL = "https://cdn.jsdelivr.net/fontsource/fonts/jetbrains-mono@latest/variable-full/jetbrains-mono-VariableFont_wght.woff2";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const siteName = settings.siteName ?? "دِو‌نت";
  const title = `${siteName} — وبلاگ شخصی یک توسعه‌دهنده`;
  const description = settings.siteDescription ?? "مقالات تخصصی درباره Next.js، React، طراحی نرم‌افزار، DevOps و هوش مصنوعی — از تجربه‌ی واقعی یک توسعه‌دهنده.";

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
    title: {
      default: title,
      template: `%s — ${siteName}`,
    },
    description,
    keywords: ["وبلاگ توسعه", "Next.js", "React", "برنامه‌نویسی", "DevOps", "هوش مصنوعی", "TypeScript", "طراحی نرم‌افزار"],
    authors: [{ name: settings.authorName ?? "Developer" }],
    creator: settings.authorName ?? "Developer",
    publisher: siteName,
    icons: {
      icon: "/favicon.svg",
      shortcut: "/favicon.svg",
      apple: "/favicon.svg",
    },
    openGraph: {
      title,
      description,
      url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
      siteName,
      locale: "fa_IR",
      type: "website",
      images: settings.defaultOgImage ? [{ url: settings.defaultOgImage }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      },
    },
    alternates: {
      types: {
        "application/rss+xml": [{ url: "/rss.xml", title: siteName }],
      },
    },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafaf9" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1a1f" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

// Inline font loading script to prevent FOUC and theme flash
const themeInitScript = `
(function() {
  try {
    var stored = localStorage.getItem('theme');
    var systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var isDark = stored === 'dark' || (!stored && systemDark);
    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.setAttribute('dir', 'rtl');
    document.documentElement.setAttribute('lang', 'fa');
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        <link
          rel="preload"
          href={VAZIRMATN_URL}
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <style>{`
          @font-face {
            font-family: 'Vazirmatn';
            src: url('${VAZIRMATN_URL}') format('woff2-variations');
            font-weight: 100 900;
            font-style: normal;
            font-display: swap;
          }
          @font-face {
            font-family: 'JetBrains Mono';
            src: url('${JETBRAINS_URL}') format('woff2-variations');
            font-weight: 100 800;
            font-style: normal;
            font-display: swap;
          }
          :root {
            --font-vazirmatn: 'Vazirmatn';
            --font-jetbrains-mono: 'JetBrains Mono';
          }
        `}</style>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="font-sans antialiased bg-background text-foreground">
        <AuthProvider>
          <ThemeProvider>
            <SearchCommandProvider>
              {children}
              <Toaster />
              <SonnerToaster position="bottom-left" richColors />
            </SearchCommandProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
