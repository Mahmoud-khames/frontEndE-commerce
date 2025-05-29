import Link from 'next/link'
import { getCurrentLocale } from "@/lib/getCurrentLocale"

export default async function NotFoundPage() {
  const locale = await getCurrentLocale()
  
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
      <div className="text-center">
        <h1 className="text-[72px] md:text-[120px] font-bold text-[#000000] leading-tight">
          404
        </h1>
        <p className="text-[16px] md:text-[18px] text-gray-600 mt-4">
          الصفحة غير موجودة
        </p>
        <Link 
          href={`/${locale}/`}
          className="mt-8 inline-block bg-[#DB4444] text-white px-8 py-3 rounded text-[16px] font-medium hover:bg-[#c13535] transition-colors"
        >
          العودة للصفحة الرئيسية
        </Link>
      </div>
    </div>
  )
}