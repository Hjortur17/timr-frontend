"use client";

import { useTranslations } from "next-intl";
import { type ReactNode } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import CompanyStep from "@/components/onboarding/CompanyStep";
import DoneStep from "@/components/onboarding/DoneStep";
import ShiftsStep from "@/components/onboarding/ShiftsStep";
import StaffStep from "@/components/onboarding/StaffStep";
import ProgressBar from "@/components/ProgressBar";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { UserProvider, useUser } from "@/context/UserContext";
import { useDayjsLocale } from "@/hooks/use-dayjs-locale";
import type { User } from "@/types/forms";

const ONBOARDING_COMPLETE = 6;

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <UserProvider>
      <DashboardInner>{children}</DashboardInner>
    </UserProvider>
  );
}

function DashboardInner({ children }: { children: ReactNode }) {
  useDayjsLocale();
  const { user, setUser } = useUser();

  if (user.onboarding_step < ONBOARDING_COMPLETE) {
    return <OnboardingWizard user={user} setUser={setUser} />;
  }

  return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset className="mb-12">
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4 sm:px-6 lg:px-8">
            <SidebarTrigger className="-ml-1" />
            {/*<Separator
              orientation="vertical"
              className="mr-2 data-vertical:h-4 data-vertical:self-auto"
            />*/}
            {/*<Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">
                    Build Your Application
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>*/}
          </div>
        </header>

        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}

function stepStatus(index: number, currentStep: number): "complete" | "current" | "upcoming" {
  if (index + 1 < currentStep) return "complete";
  if (index + 1 === currentStep) return "current";
  return "upcoming";
}

function OnboardingWizard({ user, setUser }: { user: User; setUser: (user: User) => void }) {
  const t = useTranslations("onboarding");
  const currentStep = user.onboarding_step;

  const STEP_NAMES = [t("company"), t("shifts"), t("staff"), t("done")];

  const steps = STEP_NAMES.map((name, i) => ({
    id: `${t("step")} ${i + 1}`,
    name,
    href: "#",
    status: stepStatus(i, currentStep),
  }));

  const stepProps = { user, setUser };

  return (
    <div className="flex min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-3xl flex gap-12">
        <ProgressBar steps={steps} currentStep={currentStep} />

        {currentStep === 1 && <CompanyStep {...stepProps} />}
        {currentStep === 2 && <ShiftsStep {...stepProps} />}
        {currentStep === 3 && <StaffStep {...stepProps} />}
        {/*{currentStep === 4 && <SalaryStep {...stepProps} />}*/}
        {currentStep === 4 && <DoneStep {...stepProps} />}
      </div>
    </div>
  );
}
