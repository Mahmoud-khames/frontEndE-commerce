"use client";

import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { AdminDashboard } from "@/data/data";
import Link from "next/link";
import { Routes } from "@/constants/enums";

export function AppSidebar({ t, locale }: { t: any; locale: any }) {
  const pathname = usePathname();
  const isArabic = locale === "ar";
  
  return (
    <Sidebar className="sticky top-10 left-0 z-40 h-auto flex flex-col overflow-y-hidden overflow-x-hidden w-64 bg-white ">
      <SidebarContent className="p-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-600 font-medium">
            {t.admin.AdminDashboard}
          </SidebarGroupLabel>
          <SidebarGroupContent className="mt-4">
            <SidebarMenu>
              {AdminDashboard.map((item) => {
                // Check if current path matches exactly the dashboard route or is the root admin dashboard
                const isActive = 
                  pathname === `/${locale}/${item.url}` || 
                  (item.url === Routes.ADMIN_DASHBOARD && pathname === `/${locale}/admin/dashboard`);
                
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton asChild className="rounded-lg">
                      <Link
                        href={`/${locale}/${item.url}`}
                        className={`flex items-center gap-3 p-3 ${
                          isActive
                            ? "bg-secondary text-white "
                            : "text-gray-700"
                        }`}
                      >
                        {item.icon}
                        <span className="text-sm">
                          {isArabic && item.nameAr ? item.nameAr : item.name}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
