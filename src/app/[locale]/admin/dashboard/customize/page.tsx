

import getTrans from "@/lib/translation";

import { getCurrentLocale } from "@/lib/getCurrentLocale";
import { CustomizeManager } from "./_components/CustomizeManager";
export default async function CustomizePage() {
  const locale = await getCurrentLocale();
  const {t} = await getTrans(locale);
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">
        {t.admin?.customizeSettings || "Customize Settings"}
      </h1>
      <CustomizeManager t={t} locale={locale} />
    </div>
  );
}
