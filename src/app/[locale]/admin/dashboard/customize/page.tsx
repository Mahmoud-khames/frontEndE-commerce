// app/[locale]/admin/customize/page.tsx
import { Metadata } from "next";
import getTrans from "@/lib/translation";
import { Locale } from "@/i18n.config";
import CustomizeManager from "./_components/CustomizeManager";

export const metadata: Metadata = {
  title: "Customize Hero Slides | Admin Dashboard",
  description: "Manage homepage hero slides and banners",
};

interface CustomizePageProps {
  params: {
    locale: Locale;
  };
}

export default async function CustomizePage({ params }: CustomizePageProps) {
  const { locale } = params;
  const { t } = await getTrans(locale);

  return (
    <div className="container mx-auto py-6 px-4">
      <CustomizeManager t={t} locale={locale} />
    </div>
  );
}