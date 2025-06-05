import CategoriesTable from "./_components/CategoriesTable";
import getTrans from "@/lib/translation";

import { Locale } from "@/i18n.config";

export default async function CategoriesPage({
  params,
}: {
  params: { locale: Locale };
}) {
  const locale = params.locale;
  const { t } = await getTrans(locale);

  return (
    <div>
      <CategoriesTable t={t} locale={locale as string} />
    </div>
  );
}
