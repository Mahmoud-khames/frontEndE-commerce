import React from 'react'
import OrdersTable from './_components/OrderTable';
import { getCurrentLocale } from '@/lib/getCurrentLocale';
import getTrans from '@/lib/translation';

export default async function page() {
  const locale = await getCurrentLocale();

  const { t } = await getTrans(locale);
  return (
    <div>
      <OrdersTable t={t} locale={locale} />
    </div>
  )
}
