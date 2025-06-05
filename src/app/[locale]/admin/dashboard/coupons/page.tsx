import React from 'react'
import CouponItems from './_components/couponItems';
import getTrans from "@/lib/translation";

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
      <CouponItems t={t} locale={locale} />   
    </div>
  )
}
