import Trans from "@/components/trans";
import { AppSidebar } from "../_components/sideBar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { getCurrentLocale } from "@/lib/getCurrentLocale";
import { Locale } from "@/i18n.config";
import getTrans from "@/lib/translation";

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: Locale };
}) {
  const locale = params.locale;
  const {t }= await getTrans(locale);


  return (
    <SidebarProvider>
      <div className="flex flex-col min-h-screen overflow-hidden">
        {/* Main Content Area */}
        <div className="flex flex-1 ">
          {/* Sidebar */}
          <div className=" block md:hidden">
            <SidebarTrigger />
          </div>
          <AppSidebar t={t} locale={locale} />

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto p-6 ">
            <div className="overflow-y-auto ">{children}</div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
