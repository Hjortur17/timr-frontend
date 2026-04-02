"use client";

import { Calendar, ClockPlus, FileClock, Home, Users } from "lucide-react";
import { usePathname } from "next/navigation";
import * as React from "react";
import { Nav } from "react-day-picker";
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
import { NavSecondary } from "./nav-secondary";
import { NavSettings } from "./nav-settings";

const managerNavigation = [
  { title: "Vaktir", url: "/dashboard", icon: Calendar },
  { title: "Starfsfólk", url: "/dashboard/employees", icon: Users },
  { title: "Tímaskráning", url: "/dashboard/time-entry", icon: FileClock },
];

const employeeNavigation = [
  { title: "Vaktir", url: "/dashboard", icon: Home },
  { title: "Stimpilklukka", url: "/dashboard/punch-clock", icon: ClockPlus },
  { title: "Tímaskráning", url: "/dashboard/time-entry", icon: FileClock },
];

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

        {/*<NavSecondary className="mt-auto" />*/}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
