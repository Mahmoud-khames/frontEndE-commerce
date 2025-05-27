import { getCurrentLocale } from "@/lib/getCurrentLocale";
import ProductsTable from "./_components/prodectTabel";
import getTrans from "@/lib/translation";

export default async function ProductsPage() {
  const locale = await getCurrentLocale();

  const {t } = await getTrans(locale);

  return (
    <div className="">
      <ProductsTable t={t} locale={locale} />

    </div>
  );
}
