import { Locale } from "@/i18n.config";
import UsersTable from "./_components/UsersTable";

import getTrans from "@/lib/translation";



export default async function UsersPage({
  params,
}: {
  params: { locale: Locale };
}) {
  const locale = params.locale;
  const { t } = await getTrans(locale);

  return (
    <div >
      <UsersTable t={t} locale={locale as string} />
    </div>
  );
}
