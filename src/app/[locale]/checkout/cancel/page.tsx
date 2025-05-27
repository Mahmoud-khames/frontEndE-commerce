import CancelContent from './_components/CancelContent';
import { getCurrentLocale } from '@/lib/getCurrentLocale';
import getTrans from '@/lib/translation';

export default async function CheckoutCancelPage() {
  const locale = await getCurrentLocale();
  const {t} = await getTrans(locale);
  
  return (
    <div>
      <CancelContent locale={locale} t={t.checkout}/>
    </div>
  );
}
