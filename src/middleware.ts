import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  // قائمة اللغات المدعومة
  locales: ['en', 'ar'],
  
  // اللغة الافتراضية
  defaultLocale: 'en',
  
  // التوجيه تلقائياً حسب المتصفح
  localeDetection: true
});

export const config = {
  // تطبيق middleware على كل المسارات ما عدا المستثناة
  matcher: [
    // تطبيق على جميع pathnames إلا:
    '/((?!api|_next|_vercel|.*\\..*).*)',
    // ولكن تطبيق على api/... في المجلد الجذر
    '/',
    '/(ar|en)/:path*'
  ]
};