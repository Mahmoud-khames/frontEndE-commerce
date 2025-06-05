import React from 'react'
import OrdersTable from './_components/OrderTable';

import getTrans from '@/lib/translation';
import { Locale } from '@/i18n.config';

export default async function page({
  params,
}: {
  params: { locale: Locale };
}) {
  const locale = params.locale;
  const { t } = await getTrans(locale);
  return (
    <div>
      <OrdersTable t={t} locale={locale} />
    </div>
  )
}
