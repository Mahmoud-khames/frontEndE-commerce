import { Locale } from '@/i18n.config';
import CancelContent from './_components/CancelContent';
import getTrans from '@/lib/translation';

export default async function CheckoutCancelPage({
  params,
}: {
  params: { locale: Locale };
}) {
  const locale = params.locale;
  const { t } = await getTrans(locale);
  
  return (
    <div>
      <CancelContent locale={locale} t={t.checkout}/>
    </div>
  );
}
