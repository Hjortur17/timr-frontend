import {
  Building,
  CalendarSync,
  CheckCircle2,
  ClockAlert,
  HandCoins,
  Lock,
  MonitorSmartphone,
  Scale,
} from "lucide-react";
import Link from "next/link";
import Navigation from "@/components/navigation";
import { Button } from "@/components/ui/button";

const features = [
  {
    name: "Vaktarplön",
    description:
      "Búði til vaktarplön langt fram í tímann. Notastu við fyrirfram skilgreindar reglur eins og 2-2-3 eða 5-5-4. Eða gerðu þitt eigið.",
    icon: CalendarSync,
  },
  {
    name: "Margir sölustaðir",
    description: "Ert þú að reka fleiri en einn stað? Það er hægt að stjórna mörgum stöðum og deildum á sama stað.",
    icon: Building,
  },
  {
    name: "Stafræn lausn",
    description: "Kerfið er aðgengilegt bæði í vafra eða í appi. Aðgengilegt á bæði IOS eða Android.",
    icon: MonitorSmartphone,
  },
  {
    name: "Viðvarrnir",
    description:
      "Kerfið lætur starfsmenn vita af næstu vakt og þegar nýtt vaktarplan hefur verið birt. Einnig lætur kerfið vita ef 11 tíma hvíldartími er brotinn.",
    icon: ClockAlert,
  },
  {
    name: "Launkostnaður",
    description:
      "Fylgstu með Launkostnaðanum fyrir þinn vinnustað. Hægt að sjá dagvinnu-, yfirvinnu- og stórhátíðarkaup.",
    icon: HandCoins,
  },
  {
    name: "Íslensk lög",
    description: "Kerfið er hannað fyrir íslenska vinnustaði, tekið er tillits til íslenska kjarasamninga og laga",
    icon: Scale,
  },
];

const tiers = [
  {
    name: "Nettur",
    id: "tier-nettur",
    href: "#",
    price: { monthly: "2.490 kr", annually: "2.075 kr" },
    description: "Allt sem þarf til að komast af stað með vaktastjórnun.",
    features: [
      "Allt að 15 starfsmenn",
      "Vaktaáætlun & birting vakta",
      "Starfsmannaapp (iOS & Android)",
      "GPS staðfest inn- og útstimplun",
      "Samstilling við tækjadagbók",
      "Excel & CSV útflutningur",
    ],
  },
  {
    name: "Þéttur",
    id: "tier-thettur",
    href: "#",
    price: { monthly: "5.490 kr", annually: "4.575 kr" },
    description: "Allt í Byrjanda pakka, auk verkfæra fyrir vaxandi fyrirtæki.",
    features: [
      "Allt að 40 starfsmenn",
      "Margir stjórnendur",
      "Vaktaskipti & opnar vaktir",
      "Yfirvinnueftirlit",
      "Samþætting við launakerfi",
    ],
  },
  {
    name: "Allur pakkinn",
    id: "tier-allur-pakkinn",
    href: "#",
    price: { monthly: "10.990 kr", annually: "9.158 kr" },
    description: "Allt í Vöxtupakka, auk ítarlegra verkfæra fyrir stærri rekstur.",
    features: [
      "Allt að 100 starfsmenn",
      "Margar starfsstöðvar",
      "Launaútflutningur",
      "Ítarleg skýrslugerð",
      "Forgangsstuðningur",
    ],
  },
];

function BrowserMockup() {
  return (
    <div className="relative w-full h-full min-h-[500px] lg:min-h-[max(70dvh,650px)] bg-primary overflow-hidden rounded-2xl">
      {/* Browser window — wider than container, clipped by section overflow */}
      <div className="absolute left-16 top-16 w-[160%] overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Browser toolbar */}
        <div className="flex items-center gap-4 border-b border-border/50 bg-white px-4 py-3">
          {/* Traffic lights */}
          <div className="flex gap-2">
            <div className="size-3 rounded-full bg-[#FF5F57]" />
            <div className="size-3 rounded-full bg-[#FEBC2E]" />
            <div className="size-3 rounded-full bg-[#28C840]" />
          </div>

          {/* Address bar */}
          <div className="flex flex-1 items-center justify-center">
            <div className="flex items-center gap-2 rounded-md bg-muted px-4 py-1 pr-50">
              <Lock className="size-3 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">timr.is</span>
            </div>
          </div>
        </div>

        {/* Browser body */}
        <div className="aspect-[4/3] bg-white" />
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <>
      <Navigation />

      <section className="overflow-hidden">
        <div className="mx-auto max-w-8xl px-6 py-16 lg:px-8 lg:py-16">
          <div className="flex flex-row items-center gap-12 lg:gap-16">
            {/* Left column */}
            <div className="flex flex-col gap-8 w-7/12">
              <span className="w-fit rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-primary">
                Ný uppfærsla
              </span>

              <h1 className="text-5xl font-extrabold tracking-tight text-foreground lg:text-6xl">
                Öruggt og þægilegt vaktakerfi
              </h1>

              <p className="max-w-lg text-lg leading-relaxed text-muted-foreground lg:text-xl">
                Lorem ipsum dolor sit amet consectetur. Volutpat diam varius gravida id. Sit lectus pharetra fermentum
                commodo est viverra. Purus nulla nisl pretium vel eu sed suspendisse molestie. Turpis eget erat id
                lacus.
              </p>

              <div className="flex items-center gap-2">
                <Link href="/register">
                  <Button size="lg" className="cursor-pointer">
                    Byrja núna
                  </Button>
                </Link>
                <Link href="#features">
                  <Button variant="ghost" size="lg" className="cursor-pointer">
                    Skoða meira
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right column */}
            <BrowserMockup />
          </div>
        </div>
      </section>

      <section className="bg-background py-24 sm:py-32">
        <div className="mx-auto max-w-8xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:mx-0">
            <h2 className="text-base/7 font-semibold text-primary">Eiginleikar</h2>
            <p className="mt-2 text-4xl font-semibold tracking-tight text-pretty text-foreground sm:text-5xl">
              Láttu okkur sjá um það
            </p>
            <p className="mt-6 text-lg/8 text-muted-foreground">
              Hvort sem þú ert að stjórna liltu fyrirtæki eða stóru að þá auðveldar Timir þér með umfangið í kringum
              vaktarskipulag.
            </p>
          </div>
          <dl className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 text-base/7 text-muted-foreground sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-x-16">
            {features.map((feature) => (
              <div key={feature.name} className="relative pl-9">
                <dt className="inline font-semibold text-foreground">
                  <feature.icon aria-hidden="true" className="absolute top-1 left-1 size-5 text-primary" />
                  {feature.name}
                </dt>{" "}
                <dd className="inline">{feature.description}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="bg-background py-24 sm:py-32">
        <div className="mx-auto max-w-8xl px-6 lg:px-8">
          <div className="mx-auto max-w-4xl sm:text-center">
            <h2 className="text-base/7 font-semibold text-primary">Verðskrá</h2>
            <p className="mt-2 text-5xl font-semibold tracking-tight text-pretty text-foreground sm:text-6xl sm:text-balance">
              Finndu það sem hentar þér
            </p>
          </div>
          <p className="mx-auto mt-6 max-w-2xl text-lg font-medium text-pretty text-muted-foreground sm:text-center sm:text-xl/8">
            Byrjaðu í dag með 30 daga prufu tímabili. Engin skuldbinding.
          </p>
          <div className="mt-20 flow-root">
            <div className="isolate -mt-16 grid max-w-sm grid-cols-1 gap-y-16 divide-y divide-border sm:mx-auto lg:-mx-8 lg:mt-0 lg:max-w-none lg:grid-cols-3 lg:divide-x lg:divide-y-0 xl:-mx-4">
              {tiers.map((tier) => (
                <div key={tier.id} className="pt-16 lg:px-8 lg:pt-0 xl:px-14">
                  <h3 id={tier.id} className="text-base/7 font-semibold text-foreground">
                    {tier.name}
                  </h3>
                  <p className="mt-6 flex items-baseline gap-x-1 mb-6">
                    <span className="text-5xl font-semibold tracking-tight text-foreground">{tier.price.monthly}</span>
                    <span className="text-sm/6 font-semibold text-muted-foreground">/mánuði</span>
                  </p>
                  <Link href={tier.href} aria-describedby={tier.id} className="w-full">
                    <Button className="w-full h-12 text-base font-semibold cursor-pointer">Byrja núna</Button>
                  </Link>
                  <p className="mt-6 text-sm/6 font-semibold text-foreground">{tier.description}</p>
                  <ul role="list" className="mt-6 space-y-3 text-sm/6 text-muted-foreground">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex gap-x-3">
                        <CheckCircle2 aria-hidden="true" className="h-6 w-5 flex-none text-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-background py-16 sm:py-24">
        <div className="mx-auto max-w-8xl sm:px-6 lg:px-8">
          <div className="relative isolate flex flex-col gap-10 overflow-hidden bg-foreground-light text-[rgb(46,80,70)] px-6 py-24 sm:rounded-3xl sm:px-24 xl:flex-row xl:items-center xl:py-32">
            <div className="max-w-xl xl:flex-auto xl:pr-12">
              <h2 className=" text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                Viltu fylgjast með okkur?
              </h2>
              <p className="mt-6">
                Skráðu þig á póstlista hjá okkur og fáðu að vita þegar ný uppfærsla að nýjar viðbætar bætast við
              </p>
            </div>
            <form className="w-full max-w-md">
              <div className="flex gap-x-4">
                <label htmlFor="email-address" className="sr-only">
                  Netfang
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  required
                  placeholder="Netfang"
                  autoComplete="email"
                  className="min-w-0 flex-auto rounded-md border border-border bg-background px-3.5 py-2 text-base text-foreground placeholder:text-muted-foreground focus:outline-2 focus:-outline-offset-2 focus:outline-primary sm:text-sm/6"
                />
                <Button type="submit" variant="secondary">
                  Skrá mig
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>

      <footer className="bg-white dark:bg-gray-900">
        <div className="mx-auto max-w-8xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
          <p className="mt-8 text-center text-sm/6 text-gray-600 md:order-1 md:mt-0 dark:text-gray-400">
            &copy; {new Date().getFullYear()}{" "}
            <Link href="https://hjorturfreyr.com" className="link">
              Hjörtur Freyr
            </Link>
            . Allur réttur áskilinn.
          </p>
        </div>
      </footer>
    </>
  );
}
