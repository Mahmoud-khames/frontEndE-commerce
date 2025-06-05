
import getTrans from "@/lib/translation";
import ProfileForm from "@/components/account/ProfileForm";
import Link from "@/components/link";
import { Metadata } from "next";
import { getDictionary } from "@/lib/dictionary";
import { Locale } from "@/i18n.config";

export async function generateMetadata({ params }: { params: { locale: Locale } }): Promise<Metadata> {
  const dictionary = await getDictionary(params.locale);
  
  return {
    title: dictionary.metadata.profile.title,
    description: dictionary.metadata.profile.description,
  };
}

export default async function ProfilePage({
  params,
}: {
  params: { locale: Locale };
}) {
  const locale = params.locale;
  const { t } = await getTrans(locale);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumbs */}
      <div className="flex justify-start items-start gap-2 mb-8 text-gray-600">
        <Link href={`/${locale}`} className="text-gray-600 hover:underline">
          {t.navigation.home}
        </Link>
        <span>/</span>
        <Link href={`/${locale}/profile`} className="text-black hover:underline">
          {t.navigation.profile}
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full lg:w-1/4">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium mb-4">{t.account.myProfile}</h3>
            <ul className="space-y-2">
              <li className="py-2 border-b border-gray-100">
                <Link href={`/${locale}/profile`} className="text-primary font-medium">
                  {t.account.myProfile}
                </Link>
              </li>
              <li className="py-2 border-b border-gray-100">
                <Link href={`/${locale}/profile/orders`} className="text-gray-600 hover:text-primary">
                  {t.account.myOrders}
                </Link>
              </li>
              <li className="py-2 border-b border-gray-100">
                <Link href={`/${locale}/wishlist`} className="text-gray-600 hover:text-primary">
                  {t.account.myWishlist}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Main content */}
        <ProfileForm t={t} />
      </div>
    </div>
  );
}
