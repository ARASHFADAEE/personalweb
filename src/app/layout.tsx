import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/auth-provider";
import { SearchCommandProvider } from "@/components/search-command-provider";
import { getSettings } from "@/lib/data/settings";
import { getSiteUrl } from "@/lib/site-url";

const IRANYEKANX_URL = "/fonts/IRANYekanXVF.woff2";
const IRANYEKANX_MONO_URL = "/fonts/IRANYekanXVF.woff2";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const siteName = settings.siteName || "دِو‌نت";
  const title =
    settings.defaultSeoTitle?.trim() ||
    `${siteName} — وبلاگ شخصی یک توسعه‌دهنده`;
  const description =
    settings.defaultSeoDescription?.trim() ||
    settings.siteDescription ||
    "مقالات تخصصی درباره Next.js، React، طراحی نرم‌افزار، DevOps و هوش مصنوعی — از تجربه‌ی واقعی یک توسعه‌دهنده.";

  const siteUrl = getSiteUrl();

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: title,
      template: `%s — ${siteName}`,
    },
    description,
    keywords: ["وبلاگ توسعه", "Next.js", "React", "برنامه‌نویسی", "DevOps", "هوش مصنوعی", "TypeScript", "طراحی نرم‌افزار"],
    authors: [{ name: settings.authorName || "Developer" }],
    creator: settings.authorName || "Developer",
    publisher: siteName,
    icons: {
      icon: "/favicon.svg",
      shortcut: "/favicon.svg",
      apple: "/favicon.svg",
    },
    openGraph: {
      title,
      description,
      url: siteUrl,
      siteName,
      locale: "fa_IR",
      type: "website",
      images: settings.defaultOgImage ? [{ url: settings.defaultOgImage }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: settings.defaultOgImage ? [settings.defaultOgImage] : undefined,
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
      canonical: "/",
      types: {
        "application/rss+xml": [{ url: "/rss.xml", title: siteName }],
      },
    },
    ...(settings.googleVerification
      ? {
          verification: {
            google: settings.googleVerification.replace(/^google-site-verification=/, ""),
          },
        }
      : {}),
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafaf9" },
    { media: "(prefers-color-scheme: dark)", color: "#121218" },
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
    var isDark = stored === 'dark' || ((stored === 'system' || !stored) && systemDark);
    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
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
        <style>{`
          @font-face {
            font-family: 'IRANYekanX';
            src: url('${IRANYEKANX_URL}') format('woff2');
            font-weight: 100 900;
            font-style: normal;
            font-display: swap;
          }
          @font-face {
            font-family: 'IRANYekanXMono';
            src: url('${IRANYEKANX_MONO_URL}') format('woff2');
            font-weight: 100 900;
            font-style: normal;
            font-display: swap;
          }
          :root {
            --font-vazirmatn: 'IRANYekanX', 'Tahoma', 'Segoe UI', sans-serif;
            --font-jetbrains-mono: 'IRANYekanXMono', 'Consolas', 'Monaco', monospace;
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
