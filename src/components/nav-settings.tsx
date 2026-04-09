"use client";

import { Building2Icon, CalendarRangeIcon, CalendarSyncIcon, UsersIcon } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

export function NavSettings() {
  const { isMobile } = useSidebar();
  const t = useTranslations();

  const navigation = [
    {
      title: t("nav.company"),
      url: "/dashboard/settings/company",
      icon: Building2Icon,
    },
    {
      title: t("nav.shifts"),
      url: "/dashboard/settings/shifts",
      icon: CalendarRangeIcon,
    },
    {
      title: t("nav.shiftTemplates"),
      url: "/dashboard/settings/shifts-templates",
      icon: CalendarSyncIcon,
    },
  ];

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>{t("nav.settings")}</SidebarGroupLabel>
      <SidebarMenu>
        {navigation.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton render={<Link href={item.url} />}>
              <item.icon />
              <span>{item.title}</span>
            </SidebarMenuButton>
            {/*<DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <SidebarMenuAction
                    showOnHover
                    className="aria-expanded:bg-muted"
                  />
                }
              >
                <MoreHorizontalIcon />
                <span className="sr-only">More</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-48 rounded-lg"
                side={isMobile ? "bottom" : "right"}
                align={isMobile ? "end" : "start"}
              >
                <DropdownMenuItem>
                  <FolderIcon className="text-muted-foreground" />
                  <span>View Project</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <ArrowRightIcon className="text-muted-foreground" />
                  <span>Share Project</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Trash2Icon className="text-muted-foreground" />
                  <span>Delete Project</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>*/}
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
