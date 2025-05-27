import { NextRequest, NextResponse } from "next/server";
import { i18n } from "./i18n.config";

// Get the preferred locale from request
function getLocale(request: NextRequest) {
  // Check for cookie first
  const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;
  if (cookieLocale && i18n.locales.includes(cookieLocale)) {
    return cookieLocale;
  }

  // Check Accept-Language header
  const acceptLanguage = request.headers.get("Accept-Language") || "";
  const locales = acceptLanguage.split(",")
    .map(lang => lang.split(";")[0].trim())
    .filter(lang => i18n.locales.some(locale => 
      lang.startsWith(locale) || locale.startsWith(lang)
    ));

  if (locales.length > 0) {
    // Find the best match
    for (const locale of locales) {
      const exactMatch = i18n.locales.find(l => l === locale);
      if (exactMatch) return exactMatch;
      
      const partialMatch = i18n.locales.find(l => 
        locale.startsWith(l) || l.startsWith(locale)
      );
      if (partialMatch) return partialMatch;
    }
  }

  // Default to the default locale
  return i18n.defaultLocale;
}

export default async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Skip middleware for static files and API routes
  if (
    pathname.startsWith("/_next") || 
    pathname.startsWith("/api") ||
    pathname.includes(".") // Static files like images, css, etc.
  ) {
    return NextResponse.next();
  }

  // Check if path already has a locale
  const pathnameHasLocale = i18n.locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  // If path already has locale, continue
  if (pathnameHasLocale) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-url", request.url);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // If no locale in path, redirect to appropriate locale
  const locale = getLocale(request);
  const newUrl = new URL(`/${locale}${pathname || "/"}`, request.url);
  
  // Preserve query parameters
  request.nextUrl.searchParams.forEach((value, key) => {
    newUrl.searchParams.set(key, value);
  });
  
  return NextResponse.redirect(newUrl);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
