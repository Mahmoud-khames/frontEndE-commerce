import { NextRequest, NextResponse } from "next/server";
import { i18n, LanguageType } from "./i18n.config";

// تحديد اللغة المفضلة من الكوكي أو الهيدر أو استخدام الافتراضية
function getPreferredLocale(request: NextRequest): LanguageType {
  const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value as LanguageType;

  if (cookieLocale && i18n.locales.includes(cookieLocale)) {
    return cookieLocale;
  }

  const acceptLanguage = request.headers.get("Accept-Language") || "";
  const acceptedLocales = acceptLanguage
    .split(",")
    .map(lang => lang.split(";")[0].trim());

  for (const lang of acceptedLocales) {
    const exact = i18n.locales.find(locale => locale === lang);
    if (exact) return exact;

    const partial = i18n.locales.find(locale =>
      locale.startsWith(lang) || lang.startsWith(locale)
    );
    if (partial) return partial;
  }

  return i18n.defaultLocale;
}

export default function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // تخطِ الملفات الثابتة وواجهات الـ API
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const pathnameHasLocale = i18n.locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );

  if (pathnameHasLocale) {
    const locale = pathname.split("/")[1] as LanguageType;
    const response = NextResponse.next();

    // إذا لم تكن لغة الكوكي مضبوطة، نضبطها
    if (!request.cookies.get("NEXT_LOCALE")) {
      response.cookies.set("NEXT_LOCALE", locale, {
        path: "/",
        maxAge: 60 * 60 * 24 * 365, // سنة
        sameSite: "strict",
      });
    }

    return response;
  }

  // لا يوجد لغة في الرابط → إعادة التوجيه
  const preferredLocale = getPreferredLocale(request);
  const newUrl = request.nextUrl.clone();
  newUrl.pathname = `/${preferredLocale}${pathname}`;

  return NextResponse.redirect(newUrl);
}

export const config = {
  matcher: ["/((?!api|_next|favicon.ico).*)"],
};
