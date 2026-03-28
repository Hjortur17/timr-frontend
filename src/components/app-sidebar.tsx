"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Calendar, CalendarRange, Home, Users } from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useUser } from "@/context/UserContext";
import { NavSettings } from "./nav-settings";

const managerNavigation = [
  { title: "Vaktir", url: "/dashboard", icon: Calendar },
  { title: "Starfsfólk", url: "/dashboard/employees", icon: Users },
];

const employeeNavigation = [{ title: "Vaktir", url: "/dashboard", icon: Home }];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { isManager } = useUser();
  const pathname = usePathname();

  const isCurrent = (url: string) =>
    url === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(url);

  const navigation = (isManager ? managerNavigation : employeeNavigation).map(
    (item) => ({
      ...item,
      isActive: isCurrent(item.url),
    }),
  );

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navigation} />

        {isManager && <NavSettings />}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
