import ProductsTable from "./_components/ProductTable";
import getTrans from "@/lib/translation";
import { Locale } from "@/i18n.config";

export default async function ProductsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const locale = localeParam as Locale;
  const { t } = await getTrans(locale);

  return (
    <div className="">
      <ProductsTable t={t} locale={locale} />
    </div>
  );
}
