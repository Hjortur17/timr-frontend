"use client";

import { usePathname, useRouter } from "next/navigation";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const TABS = [
  {
    value: "company",
    label: "Fyrirtækið",
    path: "/dashboard/settings/company",
  },
  { value: "shifts", label: "Vaktir", path: "/dashboard/settings/shifts" },
  {
    value: "shifts-templates",
    label: "Vaktarplan",
    path: "/dashboard/settings/shifts-templates",
  },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const activeTab =
    TABS.find((t) => pathname === t.path || pathname.startsWith(t.path + "/"))?.value ?? TABS[0].value;

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <Tabs
        value={activeTab}
        onValueChange={(val) => {
          const tab = TABS.find((t) => t.value === val);
          if (tab) router.push(tab.path);
        }}
      >
        <TabsList>
          {TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="mt-4 -mx-4 sm:-mx-6 lg:-mx-8">{children}</div>
      </Tabs>
    </div>
  );
}
