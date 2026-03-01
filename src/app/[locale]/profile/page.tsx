// src/app/[locale]/profile/page.tsx
import getTrans from "@/lib/translation";
import ProfileForm from "@/components/account/ProfileForm";
import Link from "@/components/link";
import { Metadata } from "next";
import { Locale } from "@/i18n.config";
import { Card, CardContent } from "@/components/ui/card";
import { User, ShoppingBag, Heart, Settings } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const { t } = await getTrans(locale);
  const isRTL = locale === "ar";

  return {
    title: t.metadata?.profile?.title || (isRTL ? "الملف الشخصي" : "Profile"),
    description: t.metadata?.profile?.description || (isRTL ? "إدارة معلومات حسابك" : "Manage your account information"),
  };
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const { t } = await getTrans(locale);
  const isRTL = locale === "ar";

  const menuItems = [
    {
      href: `/${locale}/profile`,
      label: t.account?.myProfile || (isRTL ? "الملف الشخصي" : "My Profile"),
      icon: User,
      active: true,
    },
    {
      href: `/${locale}/profile/orders`,
      label: t.account?.myOrders || (isRTL ? "طلباتي" : "My Orders"),
      icon: ShoppingBag,
      active: false,
    },
    {
      href: `/${locale}/wishlist`,
      label: t.account?.myWishlist || (isRTL ? "المفضلة" : "Wishlist"),
      icon: Heart,
      active: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50" dir={isRTL ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 mb-8 text-sm text-muted-foreground">
          <Link href={`/${locale}`} className="hover:text-foreground transition-colors">
            {t.navigation?.home || (isRTL ? "الرئيسية" : "Home")}
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium">
            {t.navigation?.profile || (isRTL ? "الملف الشخصي" : "Profile")}
          </span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  {t.account?.accountSettings || (isRTL ? "إعدادات الحساب" : "Account Settings")}
                </h3>
                <nav className="space-y-1">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                          item.active
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <ProfileForm t={t} locale={locale} />
          </div>
        </div>
      </div>
    </div>
  );
}