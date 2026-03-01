import type { Metadata } from "next";
import { Inter, Cairo } from "next/font/google";
import "./globals.css";
import Header from "@/components/header/Header";
import ScrollTop from "@/components/ScrollTop";
import Footer from "@/components/Footer/Footer";
import { AppProviders } from "@/providers/AppProviders";
import { Directions, Languages } from "@/constants/enums";
import { Locale } from "@/i18n.config";
import Script from "next/script";
import { getMessages } from "next-intl/server";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic"],
  weight: ["400", "500", "700"],
});

// Generate metadata dynamically based on locale
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const messages: any = await getMessages({ locale });

  return {
    title: {
      default: messages.metadata.defaultTitle || "Exclusive",
      template: `%s | ${messages.metadata.siteName || "Exclusive"}`,
    },
    description:
      messages.metadata.defaultDescription ||
      "Exclusive is a fashion website for women",
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_SITE_URL || "https://exclusive.com"
    ),
    alternates: {
      canonical: "/",
      languages: {
        en: "/en",
        ar: "/ar",
      },
    },
  };
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: Locale }>;
}>) {
  const { locale } = await params;
  const messages: any = await getMessages({ locale });
  const { navigation } = messages;
  const isRTL = locale === Languages.ARABIC;

  return (
    <html
      lang={locale}
      dir={isRTL ? Directions.RTL : Directions.LTR}
      suppressHydrationWarning={true}
    >
      <body
        className={`${inter.variable} ${cairo.variable} ${
          isRTL ? "font-cairo" : "font-inter"
        } antialiased w-full mx-auto bg-[#FFFFFF] overflow-x-hidden`}
        suppressHydrationWarning={true}
      >
        <AppProviders locale={locale} messages={messages}>
          <Header t={navigation} messages={messages} />
          <div className="h-[1px] w-full bg-[#E5E5E5] absolute top-[52px] md:top-[80px] left-0 z-10"></div>
          <main className="relative max-w-7xl mx-auto px-4 md:px-6 pt-[80px] min-h-[calc(100vh-80px)]">
            {children}
            <ScrollTop />
          </main>
          <Footer params={{ locale }} />
        </AppProviders>

        {/* Google Analytics */}
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXX"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-XXXXXXXX');
          `}
        </Script>
      </body>
    </html>
  );
}
