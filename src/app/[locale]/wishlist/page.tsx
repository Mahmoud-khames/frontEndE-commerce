import Link from "@/components/link";
import WishListItems from "./_component/WishListItems";
import { getCurrentLocale } from "@/lib/getCurrentLocale";
import Trans from "@/components/trans";
import { Metadata } from "next";
import { getMessages } from "next-intl/server";
import getTrans from "@/lib/translation";
import { Locale } from "@/i18n.config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dictionary: any = await getMessages({ locale });

  return {
    title: dictionary.metadata.wishlist.title,
    description: dictionary.metadata.wishlist.description,
  };
}

export default async function WishlistPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const { t } = await getTrans(locale);
  const { navigation, wishlist } = t;
  const isRTL = locale === "ar";

  return (
    <div className="" dir={isRTL ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-gray-600">
        <div className="flex justify-start items-start gap-2 mb-10">
          <Link
            href={`/${locale}`}
            locale={locale}
            className="text-gray-600 hover:underline"
          >
            {navigation.home}
          </Link>
          <span>/</span>
          <Link
            href={`/${locale}/wishlist`}
            locale={locale}
            className="text-black hover:underline"
          >
            {navigation.wishlist}
          </Link>
        </div>
        <div className="flex flex-col gap-4 w-full items-center justify-center w-full">
          <WishListItems translations={{ wishlist }} locale={locale} />
        </div>
      </div>
    </div>
  );
}
