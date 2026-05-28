import { Locale } from "@/i18n.config";
import UsersTable from "./_components/UsersTable";

import getTrans from "@/lib/translation";



export default async function UsersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const locale = localeParam as Locale;
  const { t } = await getTrans(locale);

  return (
    <div >
      <UsersTable t={t} locale={locale as string} />
    </div>
  );
}
