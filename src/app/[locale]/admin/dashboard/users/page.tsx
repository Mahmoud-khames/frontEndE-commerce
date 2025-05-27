import UsersTable from "./_components/UsersTable";

import getTrans from "@/lib/translation";

import { getCurrentLocale } from "@/lib/getCurrentLocale";

export default async function UsersPage() {
  const locale = await getCurrentLocale();

  const { t } = await getTrans(locale);

  return (
    <div >
      <UsersTable t={t} locale={locale as string} />
    </div>
  );
}
