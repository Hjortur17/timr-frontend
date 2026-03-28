"use client";

import { ChevronsUpDownIcon } from "lucide-react";
import * as React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { useUser } from "@/context/UserContext";
import type { Company } from "@/types/forms";

export function TeamSwitcher() {
  const { user } = useUser();
  const { isMobile } = useSidebar();

  const defaultCompany = user.companies.find((c) => c.id === user.company_id) ?? user.companies[0];

  const hasMultipleCompanies = user.companies.length > 1;

  const [activeCompany, setActiveCompany] = React.useState<Company | undefined>(defaultCompany);

  if (!activeCompany) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" disabled>
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              {user.name?.charAt(0).toUpperCase() ?? "?"}
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{user.name}</span>
              <span className="truncate text-xs text-muted-foreground">Employee</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="data-open:bg-sidebar-accent data-open:text-sidebar-accent-foreground"
              />
            }
          >
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              {activeCompany.name.charAt(0).toUpperCase()}
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{activeCompany.name}</span>
              <span className="truncate text-xs capitalize">{activeCompany.role}</span>
            </div>
            {hasMultipleCompanies && <ChevronsUpDownIcon className="ml-auto" />}
          </DropdownMenuTrigger>

          {hasMultipleCompanies && (
            <DropdownMenuContent
              className="min-w-56 rounded-lg"
              align="start"
              side={isMobile ? "bottom" : "right"}
              sideOffset={4}
            >
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-xs text-muted-foreground">Fyrirtæki</DropdownMenuLabel>
                {user.companies.map((company, index) => (
                  <DropdownMenuItem key={company.id} onClick={() => setActiveCompany(company)} className="gap-2 p-2">
                    <div className="flex size-6 items-center justify-center rounded-md border">
                      {company.name.charAt(0).toUpperCase()}
                    </div>
                    {company.name}
                    <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          )}
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
