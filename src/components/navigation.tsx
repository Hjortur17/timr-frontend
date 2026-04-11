"use client";

import { MenuIcon } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const navigation = [
  { name: "features", href: "#features" },
  { name: "pricing", href: "#pricing" },
  { name: "faq", href: "#faq" },
];

export default function Navigation() {
  const t = useTranslations("landing");

  return (
    <nav
      aria-label="Global"
      className="mx-auto flex max-w-8xl items-center justify-between p-6 lg:px-8 animate-in fade-in duration-500 fill-mode-both"
    >
      <div className="flex items-center gap-x-12">
        <Link href="/" className="text-xl font-bold text-primary">
          Timr
        </Link>
        <NavigationMenu className="hidden lg:flex">
          <NavigationMenuList>
            {navigation.map((item) => (
              <NavigationMenuItem key={item.name}>
                <NavigationMenuLink href={item.href} className={navigationMenuTriggerStyle()}>
                  {t(`nav.${item.name}`)}
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
      </div>
      <div className="flex lg:hidden">
        <Sheet>
          <SheetTrigger render={<Button variant="ghost" size="icon" />}>
            <span className="sr-only">Open main menu</span>
            <MenuIcon />
          </SheetTrigger>
          <SheetContent side="right" className="p-6">
            <div className="flex items-center justify-between">
              <Link href="/" className="text-xl font-bold text-primary">
                Timr
              </Link>
            </div>
            <div className="mt-6 flow-root">
              <div className="-my-6 divide-y divide-border">
                <div className="space-y-2 py-6">
                  {navigation.map((item) => (
                    <Link
                      href={item.href}
                      key={item.name}
                      className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-foreground hover:bg-accent"
                    >
                      {t(`nav.${item.name}`)}
                    </Link>
                  ))}
                </div>
                <div className="py-6">
                  <Link
                    href="/login"
                    className="-mx-3 block rounded-lg px-3 py-2.5 text-base/7 font-semibold text-foreground hover:bg-accent"
                  >
                    {t("login")}
                  </Link>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
      <div className="hidden lg:flex gap-2">
        <Link href="/login">
          <Button variant="link" className="cursor-pointer">
            {t("login")}
          </Button>
        </Link>
        <Link href="/register">
          <Button className="cursor-pointer">{t("register")}</Button>
        </Link>
      </div>
    </nav>
  );
}
