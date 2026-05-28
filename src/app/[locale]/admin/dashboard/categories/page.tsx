import CategoriesTable from "./_components/CategoriesTable";
import getTrans from "@/lib/translation";

import { Locale } from "@/i18n.config";

export default async function CategoriesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const locale = localeParam as Locale;
  const { t } = await getTrans(locale);

  return (
    <div>
      <CategoriesTable t={t} locale={locale as string} />
    </div>
  );
}
