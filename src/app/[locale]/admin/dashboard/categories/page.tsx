import CategoriesTable from "./_components/CategoriesTable";
import getTrans from "@/lib/translation";
import { getCurrentLocale } from "@/lib/getCurrentLocale";

export default async function CategoriesPage() {
  const locale = await getCurrentLocale();
  const { t } = await getTrans(locale);

  return (
    <div>
      <CategoriesTable t={t} locale={locale as string} />
    </div>
  );
}
