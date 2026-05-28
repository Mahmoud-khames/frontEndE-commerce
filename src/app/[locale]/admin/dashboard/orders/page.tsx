import React from 'react'
import OrdersTable from './_components/OrderTable';

import getTrans from '@/lib/translation';
import { Locale } from '@/i18n.config';

export default async function page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const locale = localeParam as Locale;
  const { t } = await getTrans(locale);
  return (
    <div>
      <OrdersTable t={t} locale={locale} />
    </div>
  )
}
