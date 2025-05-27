
import SuccessContent from './_components/SuccessContent';
import { getDictionary } from '@/lib/dictionaries';


// تعديل الدالة لتجنب استخدام headers
export default async function CheckoutSuccessPage({
  params: { locale }
}: {
  params: { locale: string }
}) {
  // استخدام params.locale بدلاً من getCurrentLocale الذي يستخدم headers
  const dictionary = await getDictionary(locale);
  
  return (
    <div>
      <SuccessContent locale={locale} t={dictionary.checkout}/>
    </div>
  );
}

