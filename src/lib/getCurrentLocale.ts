import { headers } from 'next/headers';

// الدالة الأصلية التي تستخدم headers
export async function getCurrentLocale() {
  try {
    // في حالة الإنشاء الثابت، سنعيد 'en' كلغة افتراضية
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      return 'en';
    }
    
    // استخدام headers فقط في وضع التشغيل الديناميكي
    const headersList = await headers();
    const url = headersList.get('x-url') || '';
    const locale = url.split('/')[1] || 'en';
    return locale === 'ar' || locale === 'en' ? locale : 'en';
  } catch (error) {
    // في حالة حدوث خطأ، نعيد اللغة الافتراضية
    return 'en';
  }
}

// دالة بديلة لا تستخدم headers للاستخدام في الصفحات الثابتة
export function getStaticLocale(localeParam: string) {
  return localeParam === 'ar' || localeParam === 'en' ? localeParam : 'en';
};
