

import getTrans from "@/lib/translation";

import { CustomizeManager } from "./_components/CustomizeManager";
import { Locale } from "@/i18n.config";
export default async function CustomizePage({
  params,
}: {
  params: { locale: Locale };
}) {
  const locale = params.locale;
  const { t } = await getTrans(locale);
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">
        {t.admin?.customizeSettings || "Customize Settings"}
      </h1>
      <CustomizeManager t={t} locale={locale} />
    </div>
  );
}
