
import ProductsTable from "./_components/prodectTabel";
import getTrans from "@/lib/translation";
import { Locale } from "@/i18n.config";

export default async function ProductsPage({
  params,
}: {
  params: { locale: Locale };
}) {
  const locale = params.locale;
  const { t } = await getTrans(locale);

  return (
    <div className="">
      <ProductsTable t={t} locale={locale} />

    </div>
  );
}
