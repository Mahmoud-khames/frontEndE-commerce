import { headers } from 'next/headers';

/**
 * دالة تُستخدم داخل Server Component أو Layout للحصول على اللغة الحالية من الـ URL.
 * ⚠️ تعمل فقط أثناء وقت التشغيل (Runtime).
 * إذا تم استدعاؤها أثناء وقت البناء (Build time)، تُرجع اللغة الافتراضية 'en'.
 */
export async function getCurrentLocale(): Promise<'ar' | 'en'> {
  try {
    // في حالة البناء الثابت مثل generateStaticParams
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      return 'en';
    }

    const headersList = headers(); // لا تحتاج await لأن headers() ترجع كائن Headers
    const url = headersList.get('x-url') || ''; // هذا الهيدر يجب أن يُضاف من middleware أو platform مثل Vercel
    const locale = url.split('/')[1]; // استخراج الجزء الأول من المسار لتحديد اللغة

    return locale === 'ar' || locale === 'en' ? locale : 'en';
  } catch (error) {
    console.warn('❗️ getCurrentLocale fallback to "en":', error);
    return 'en';
  }
}

/**
 * دالة ثابتة تُستخدم في وظائف مثل generateMetadata أو generateStaticParams.
 * تُحوّل locale من الـ params إلى القيمة الصحيحة.
 */
export function getStaticLocale(localeParam: string): 'ar' | 'en' {
  return localeParam === 'ar' || localeParam === 'en' ? localeParam : 'en';
}
