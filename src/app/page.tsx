import type { LucideIcon } from "lucide-react";
import {
  Bell,
  BellRing,
  Building,
  CalendarCheck,
  CalendarDays,
  CalendarSync,
  CheckCircle2,
  Clock,
  ClockAlert,
  Download,
  Eye,
  HandCoins,
  Lock,
  MapPin,
  MonitorSmartphone,
  Palmtree,
  Scale,
  Timer,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import AnimateOnScroll from "@/components/animate-on-scroll";
import Footer from "@/components/footer";
import Navigation from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/utils/classname";

const featureIcons = [CalendarSync, Building, MonitorSmartphone, ClockAlert, HandCoins, Scale];

const featureKeys = ["schedules", "multiLocation", "digital", "alerts", "laborCost", "icelandicLaw"] as const;

const managerFeatureItems: { key: string; icon: LucideIcon }[] = [
  { key: "shiftPlans", icon: CalendarDays },
  { key: "timeClock", icon: Clock },
  { key: "vacationSystem", icon: Palmtree },
  { key: "gpsVerification", icon: MapPin },
  { key: "notifications", icon: Bell },
  { key: "dataExport", icon: Download },
  { key: "shiftPublishing", icon: Eye },
];

const employeeFeatureItems: { key: string; icon: LucideIcon }[] = [
  { key: "shiftOverview", icon: CalendarCheck },
  { key: "punchClock", icon: Timer },
  { key: "calendarSync", icon: CalendarSync },
  { key: "employeeNotifications", icon: BellRing },
  { key: "vacationOverview", icon: Palmtree },
];

const tierConfigs = [
  {
    id: "tier-nettur",
    featured: false,
    href: "/register?tier=nettur",
    price: { monthly: "2.490 kr", annually: "2.075 kr" },
    nameKey: "nettur" as const,
    descriptionKey: "nettorDescription" as const,
    featuresKey: "nettorFeatures" as const,
  },
  {
    id: "tier-thettur",
    featured: true,
    href: "/register?tier=thettur",
    price: { monthly: "5.490 kr", annually: "4.575 kr" },
    nameKey: "thettur" as const,
    descriptionKey: "thettorDescription" as const,
    featuresKey: "thettorFeatures" as const,
  },
  {
    id: "tier-allur-pakkinn",
    featured: false,
    href: "/register?tier=allur-pakkinn",
    price: { monthly: "10.990 kr", annually: "9.565 kr" },
    nameKey: "allurPakkinn" as const,
    descriptionKey: "allurPakkinnDescription" as const,
    featuresKey: "allurPakkinnFeatures" as const,
  },
];

const faqKeys = [
  { q: "freeTrial", a: "freeTrialAnswer" },
  { q: "employeeLimit", a: "employeeLimitAnswer" },
  { q: "employeeApp", a: "employeeAppAnswer" },
  { q: "icelandicAgreements", a: "icelandicAgreementsAnswer" },
  { q: "changePlan", a: "changePlanAnswer" },
  { q: "gps", a: "gpsAnswer" },
] as const;

function BrowserMockup() {
  return (
    <div className="relative w-full h-full overflow-hidden rounded-2xl">
      <div className="relative w-full overflow-hidden rounded-2xl bg-background border border-border shadow-2xl ring-1 ring-foreground/10">
        {/* Browser toolbar */}
        <div className="flex items-center gap-4 border-b border-border/50 bg-background px-4 py-3">
          <div className="flex gap-2">
            <div className="size-3 rounded-full bg-[#FF5F57]" />
            <div className="size-3 rounded-full bg-[#FEBC2E]" />
            <div className="size-3 rounded-full bg-[#28C840]" />
          </div>
          <div className="flex flex-1 items-center justify-center">
            <div className="flex items-center gap-2 rounded-md bg-muted px-4 py-1 pr-50">
              <Lock className="size-3 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">timr.is</span>
            </div>
          </div>
        </div>
        {/* Browser body */}
        <div className="h-full bg-background">
          <img
            alt="App screenshot"
            src="https://tailwindcss.com/plus-assets/img/component-images/project-app-screenshot.png"
            width={2432}
            height={1442}
            className="mb-[-12%]"
          />
        </div>
      </div>
    </div>
  );
}

export function generateMetadata(): Metadata {
  return {
    title: "Timr | Örrugt og þægilegt vaktakerfi",
    description:
      "Skipuleggðu vaktir, fylgstu með mætingu og gefðu starfsfólki yfirsýn yfir vinnutíma. Hannað fyrir íslenska vinnustaði með stuðning við kjarasamninga.",
    keywords: [
      "vaktakerfi",
      "vaktarplan",
      "starfsmannakerfi",
      "mætingaskráning",
      "vinnuskipulag",
      "vaktaskipulag",
      "shift management",
      "timr",
    ],
    openGraph: {
      title: "Timr | Örrugt og þægilegt vaktakerfi",
      description:
        "Skipuleggðu vaktir, fylgstu með mætingu og gefðu starfsfólki yfirsýn yfir vinnutíma — allt á einum stað.",
      url: "https://timr.is",
      siteName: "Timr",
      locale: "is_IS",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "Timr | Örrugt og þægilegt vaktakerfi",
      description:
        "Skipuleggðu vaktir, fylgstu með mætingu og gefðu starfsfólki yfirsýn yfir vinnutíma — allt á einum stað.",
    },
    alternates: {
      canonical: "https://timr.is",
    },
  };
}

export default async function Home() {
  const t = await getTranslations("landing");

  return (
    <>
      <Navigation />

      <header className="bg-background py-24 sm:py-32 animate-in fade-in slide-in-from-bottom-14 duration-700 fill-mode-both">
        <div className="mx-auto max-w-8xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl sm:text-center">
            <h1 className="mt-10 text-4xl font-bold tracking-tight text-pretty text-foreground sm:text-6xl sm:text-balance">
              {t("heroTitle")}
            </h1>
            <p className="mt-6 text-lg/8 text-muted-foreground">{t("heroDescription")}</p>
            <div className="mt-10 flex items-center justify-start sm:justify-center gap-x-6">
              <Link href="/register">
                <Button className="w-full cursor-pointer h-12 px-8 text-base">{t("startNow")}</Button>
              </Link>
              <Link href="#features" className="text-sm/6 font-semibold text-foreground">
                {t("learnMore")} <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </div>
        </div>
        <div className="relative overflow-hidden pt-16 lg:pt-24" id="features">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 min-h-[500px]">
            <AnimateOnScroll className="fade-in slide-in-from-bottom-8 duration-700 delay-300">
              <BrowserMockup />
            </AnimateOnScroll>
            <div aria-hidden="true" className="relative">
              <div className="absolute -inset-x-20 bottom-0 bg-linear-to-t from-background pt-[7%]" />
            </div>
          </div>
        </div>
        <div className="mx-auto mt-16 max-w-8xl px-6 sm:mt-20 md:mt-24 lg:px-8">
          <dl className="mx-auto grid max-w-2xl grid-cols-1 gap-x-6 gap-y-10 text-base/7 text-muted-foreground sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-x-8 lg:gap-y-16">
            {featureKeys.map((key, index) => {
              const Icon = featureIcons[index];
              return (
                <AnimateOnScroll
                  key={key}
                  className="fade-in slide-in-from-bottom-4 duration-500"
                  delay={`delay-${index * 100}`}
                >
                  <div className="relative pl-9">
                    <dt className="inline font-semibold text-foreground">
                      <Icon aria-hidden="true" className="absolute top-1 left-1 size-5 text-primary" />
                      {t(`features.${key}`)}
                    </dt>{" "}
                    <dd className="inline">{t(`features.${key}Description`)}</dd>
                  </div>
                </AnimateOnScroll>
              );
            })}
          </dl>
        </div>
      </header>

      <div className="bg-background">
        <div className="mx-auto max-w-[1880px] py-24 sm:px-6 sm:py-32 lg:px-8">
          <AnimateOnScroll className="fade-in slide-in-from-bottom-6 duration-700">
            <div className="relative isolate overflow-hidden bg-foreground-light text-[#2e5046] px-6 py-24 text-left sm:rounded-3xl sm:px-16">
              <div className="flex mx-auto max-w-6xl px-6 lg:px-8 flex-col items-start justify-start">
                <h2 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">{t("ctaTitle")}</h2>
                <figure className="relative isolate pt-6">
                  <blockquote className="text-lg/8 text-pretty space-y-4">
                    <p>
                      Ástæðan af hverju ég lagði af stað í þessa vegferð er einföld, ég hef bæði verið starfsmaður og
                      yfirmaður sem hef unnið með Excel sem vaktaskipulag. Þegar ég fór að skoða önnur kerfi sem gætu
                      leyst Excel af hólmi fann ég ekki rétta lausnina. Annað hvort voru sambærileg kerfi of dýr, buðu
                      ekki upp á það sem okkur vantaði eða einfaldlega virkuðu ekki.
                    </p>
                    <p>
                      Þess vegna bjó ég til Timr. Forrit með einfalda verðskrá, eiginleika sem nýtast öllum fyrirtækjum,
                      bæði stórum og smáum, og einfalt viðmót fyrir stjórnendur sem og starfsfólk.
                    </p>
                  </blockquote>
                  <figcaption className="mt-8 text-right">
                    <div className="font-semibold before:content-['—'] before:mr-2">Hjörtur Freyr</div>
                  </figcaption>
                </figure>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </div>

      <section className="bg-background py-24 sm:py-32">
        <div className="mx-auto max-w-8xl px-6 lg:px-8">
          <AnimateOnScroll className="fade-in slide-in-from-bottom-4 duration-500">
            <div className="mx-auto max-w-4xl sm:text-center">
              <p className="text-base/7 font-semibold text-primary">{t("detailedFeaturesPreTitle")}</p>
              <h2 className="mt-2 text-4xl font-semibold tracking-tight text-pretty text-foreground sm:text-5xl sm:text-balance">
                {t("detailedFeaturesTitle")}
              </h2>
              <p className="mt-6 text-lg/8 text-muted-foreground">{t("detailedFeaturesDescription")}</p>
            </div>
          </AnimateOnScroll>
          <div className="mx-auto mt-16 max-w-4xl">
            <Tabs defaultValue={0}>
              <TabsList className="mx-auto w-full max-w-md">
                <TabsTrigger value={0} className="flex-1">
                  {t("forManagers")}
                </TabsTrigger>
                <TabsTrigger value={1} className="flex-1">
                  {t("forEmployees")}
                </TabsTrigger>
              </TabsList>
              <TabsContent value={0} className="mt-10">
                <dl className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2">
                  {managerFeatureItems.map(({ key, icon: Icon }, index) => (
                    <AnimateOnScroll
                      key={key}
                      className="fade-in slide-in-from-bottom-4 duration-500"
                      delay={`delay-${index * 100}`}
                    >
                      <div className="relative pl-12">
                        <dt className="text-base font-semibold text-foreground">
                          <div className="absolute top-0 left-0 flex size-9 items-center justify-center rounded-lg bg-primary">
                            <Icon aria-hidden="true" className="size-5 text-primary-foreground" />
                          </div>
                          {t(`managerFeatures.${key}`)}
                        </dt>
                        <dd className="mt-2 text-base/7 text-muted-foreground">
                          {t(`managerFeatures.${key}Description`)}
                        </dd>
                      </div>
                    </AnimateOnScroll>
                  ))}
                </dl>
              </TabsContent>
              <TabsContent value={1} className="mt-10">
                <dl className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2">
                  {employeeFeatureItems.map(({ key, icon: Icon }, index) => (
                    <AnimateOnScroll
                      key={key}
                      className="fade-in slide-in-from-bottom-4 duration-500"
                      delay={`delay-${index * 100}`}
                    >
                      <div className="relative pl-12">
                        <dt className="text-base font-semibold text-foreground">
                          <div className="absolute top-0 left-0 flex size-9 items-center justify-center rounded-lg bg-primary">
                            <Icon aria-hidden="true" className="size-5 text-primary-foreground" />
                          </div>
                          {t(`employeeFeatures.${key}`)}
                        </dt>
                        <dd className="mt-2 text-base/7 text-muted-foreground">
                          {t(`employeeFeatures.${key}Description`)}
                        </dd>
                      </div>
                    </AnimateOnScroll>
                  ))}
                </dl>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>

      <section className="bg-background py-24 sm:py-32" id="pricing">
        <div className="mx-auto max-w-8xl px-6 lg:px-8">
          <AnimateOnScroll className="fade-in slide-in-from-bottom-4 duration-500">
            <div className="mx-auto max-w-4xl sm:text-center">
              <p className="text-base/7 font-semibold text-primary">{t("pricingTitle")}</p>
              <h2 className="mt-2 text-4xl font-semibold tracking-tight text-pretty text-foreground sm:text-5xl sm:text-balance">
                {t("pricingHeading")}
              </h2>
            </div>
            <p className="mx-auto mt-6 max-w-2xl text-lg font-medium text-pretty text-muted-foreground sm:text-center sm:text-xl/8">
              {t("pricingDescription")}
            </p>
          </AnimateOnScroll>
          <form className="mt-20 group/tiers">
            <div className="flex justify-center">
              <fieldset aria-label={t("paymentFrequency")}>
                <div className="grid grid-cols-2 gap-x-1 rounded-full p-1 text-center text-xs/5 font-semibold ring-1 ring-border">
                  <label className="group relative rounded-full px-2.5 py-1 has-checked:bg-primary">
                    <input
                      defaultValue="monthly"
                      defaultChecked
                      name="frequency"
                      type="radio"
                      className="absolute inset-0 appearance-none rounded-full"
                    />
                    <span className="text-muted-foreground group-has-checked:text-primary-foreground">
                      {t("monthly")}
                    </span>
                  </label>
                  <label className="group relative rounded-full px-2.5 py-1 has-checked:bg-primary">
                    <input
                      defaultValue="annually"
                      name="frequency"
                      type="radio"
                      className="absolute inset-0 appearance-none rounded-full"
                    />
                    <span className="text-muted-foreground group-has-checked:text-primary-foreground">
                      {t("annually")}
                    </span>
                  </label>
                </div>
              </fieldset>
            </div>
            <div className="isolate mx-auto mt-10 grid max-w-md grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
              {tierConfigs.map((tier, index) => {
                const tierFeatures = t.raw(`tiers.${tier.featuresKey}`) as string[];
                return (
                  <AnimateOnScroll
                    key={tier.id}
                    className="fade-in slide-in-from-bottom-6 duration-500"
                    delay={`delay-${index * 100}`}
                  >
                    <div
                      data-featured={tier.featured ? "true" : undefined}
                      className="group/tier rounded-3xl p-8 ring-2 ring-border data-featured:ring-primary xl:p-10"
                    >
                      <div className="flex items-center justify-between gap-x-4">
                        <h3 id={tier.id} className="text-lg/8 font-semibold text-foreground">
                          {t(`tiers.${tier.nameKey}`)}
                        </h3>
                        <p className="rounded-full bg-secondary px-2.5 py-1 text-xs/5 font-semibold text-primary group-not-data-featured/tier:hidden">
                          {t("mostPopular")}
                        </p>
                      </div>
                      <p className="mt-4 text-sm/6 text-muted-foreground">{t(`tiers.${tier.descriptionKey}`)}</p>
                      <p className="mt-6 flex items-baseline gap-x-1 group-not-has-[[name=frequency][value=monthly]:checked]/tiers:hidden">
                        <span className="text-4xl font-semibold tracking-tight text-foreground">
                          {tier.price.monthly}
                        </span>
                        <span className="text-sm/6 font-semibold text-muted-foreground">{t("perMonth")}</span>
                      </p>
                      <p className="mt-6 flex items-baseline gap-x-1 group-not-has-[[name=frequency][value=annually]:checked]/tiers:hidden">
                        <span className="text-4xl font-semibold tracking-tight text-foreground">
                          {tier.price.annually}
                        </span>
                        <span className="text-sm/6 font-semibold text-muted-foreground">{t("perMonth")}</span>
                      </p>
                      <Link href={tier.href} aria-describedby={tier.id} className="mt-6 block">
                        <Button className="w-full cursor-pointer h-12 text-base">{t("startNow")}</Button>
                      </Link>
                      <ul className="mt-8 space-y-3 text-sm/6 text-muted-foreground xl:mt-10">
                        {tierFeatures.map((feature: string) => (
                          <li key={feature} className="flex gap-x-3">
                            <CheckCircle2 aria-hidden="true" className="h-6 w-5 flex-none text-primary" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </AnimateOnScroll>
                );
              })}
            </div>
          </form>
        </div>
      </section>

      <div className="mx-auto max-w-2xl px-6 pb-8 sm:pt-12 sm:pb-24 lg:max-w-8xl lg:px-8 lg:pb-32" id="faq">
        <AnimateOnScroll className="fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">{t("faqTitle")}</h2>
        </AnimateOnScroll>
        <dl className="mt-20 divide-y divide-border">
          {faqKeys.map((faq, index) => (
            <AnimateOnScroll
              key={faq.q}
              className="fade-in slide-in-from-bottom-3 duration-500"
              delay={`delay-${index * 100}`}
            >
              <div
                className={cn(
                  "py-8 lg:grid lg:grid-cols-12 lg:gap-8",
                  index === 0 && "pt-0",
                  index === faqKeys.length - 1 && "pb-0",
                )}
              >
                <dt className="text-base/7 font-semibold text-foreground lg:col-span-5">{t(`faqs.${faq.q}`)}</dt>
                <dd className="mt-4 lg:col-span-7 lg:mt-0">
                  <p className="text-base/7 text-muted-foreground">{t(`faqs.${faq.a}`)}</p>
                </dd>
              </div>
            </AnimateOnScroll>
          ))}
        </dl>
      </div>

      <AnimateOnScroll className="fade-in duration-500">
        <Footer />
      </AnimateOnScroll>
    </>
  );
}
