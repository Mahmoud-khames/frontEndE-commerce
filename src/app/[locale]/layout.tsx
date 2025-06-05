

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/header/Header";
import ScrollTop from "@/components/ScrollTop";
import Footer from "@/components/Footer/Footer";
import ReduxProvider from "@/providers/ReduxProvider";
import { ToastContainer } from "react-toastify";
import { Directions, Languages } from "@/constants/enums";
import { Locale } from "@/i18n.config";
import Trans from "@/components/trans";
import Script from "next/script";
import { getDictionary } from "@/lib/dictionary";
import { getCurrentLocale } from "@/lib/getCurrentLocale";
import getTrans from "@/lib/translation";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "700"], 
});

// Generate metadata dynamically based on locale
export async function generateMetadata({
  params,
}: {
  params: { locale: Locale };
}): Promise<Metadata> {
  
  const dictionary = await getDictionary(params.locale);
  
  
  return {
    title: {
      default: dictionary.metadata.defaultTitle || "Exclusive",
      template: `%s | ${dictionary.metadata.siteName || "Exclusive"}`,
    },
    description: dictionary.metadata.defaultDescription || "Exclusive is a fashion website for women",
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://exclusive.com"),
    alternates: {
      canonical: '/',
      languages: {
        'en': '/en',
        'ar': '/ar',
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
  const locale = (await params).locale;
  const {t} = await getTrans(locale);
  const { navigation } = t;
  const isAdminRoute = typeof window !== 'undefined' ? 
    window.location.pathname.includes('/admin') : 
    false;

  return (
    <html
      lang={locale}
      dir={locale === Languages.ARABIC ? Directions.RTL : Directions.LTR}
      suppressHydrationWarning={true}
    >
      <body
        className={`${inter.variable} antialiased w-full mx-auto bg-[#FFFFFF] overflow-x-hidden`}
      >
        <ReduxProvider>
          <ToastContainer 
            position="bottom-right" 
            autoClose={3000}
            rtl={locale === Languages.ARABIC}
          />
          {!isAdminRoute && <Header t={navigation} />}
          {!isAdminRoute && (
            <div className="h-[1px] w-full bg-[#E5E5E5] absolute top-[52px] md:top-[80px] left-0 z-10"></div>
          )}
          <main
            className={`relative max-w-7xl mx-auto px-4 md:px-6 ${
              !isAdminRoute ? "pt-[80px] min-h-[calc(100vh-80px)]" : "min-h-screen"
            }`}
          >
            {children}
            <ScrollTop />
          </main>
          {!isAdminRoute && <Footer  params={params}/>}
        </ReduxProvider>
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



