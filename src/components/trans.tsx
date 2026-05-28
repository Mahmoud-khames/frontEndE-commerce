import getTrans from "@/lib/translation";
import { Locale } from "@/i18n.config";
import { getCurrentLocale } from "@/lib/getCurrentLocale";

export default async function Trans() {
  const locale = await getCurrentLocale();
  const { t } = await getTrans(locale as Locale);
  return t; 
}
