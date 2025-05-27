import React from 'react'
import CouponItems from './_components/couponItems';
import getTrans from "@/lib/translation";
import { getCurrentLocale } from "@/lib/getCurrentLocale";

export default async function page() {
  const locale = await getCurrentLocale();

  const {t } = await getTrans(locale);
  return (
    <div>
      <CouponItems t={t} locale={locale} />   
    </div>
  )
}
