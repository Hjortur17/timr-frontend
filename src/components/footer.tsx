import Link from "next/link";

const footerLinks = {
  vara: [
    { name: "Eiginleikar", href: "#features" },
    { name: "Verðskrá", href: "#pricing" },
    { name: "Breytingaskrá", href: "#" },
  ],
  stuðningur: [
    { name: "Algengar spurningar", href: "#faq" },
    { name: "Samband", href: "#" },
  ],
  fyrirtæki: [{ name: "Um okkur", href: "#" }],
  lögfræðilegt: [
    { name: "Persónuverndarstefna", href: "#" },
    { name: "Skilmálar", href: "#" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-background border-t border-border">
      <div className="mx-auto max-w-8xl px-6 pt-16 pb-8 lg:px-8 lg:pt-24">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div>
            <Link href="/" className="text-xl font-bold text-primary">
              Timr
            </Link>
            <p className="mt-4 text-sm text-muted-foreground max-w-xs">
              Öruggt og þægilegt vaktakerfi hannað fyrir íslenska vinnustaði.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Vara</h3>
                <ul className="mt-4 space-y-3">
                  {footerLinks.vara.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold text-foreground">Stuðningur</h3>
                <ul className="mt-4 space-y-3">
                  {footerLinks.stuðningur.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold text-foreground">Skilmálar og lög</h3>
                <ul className="mt-4 space-y-3">
                  {footerLinks.lögfræðilegt.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-16 border-t border-border pt-8 flex justify-between">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Timr. Allur réttur áskilinn.
          </p>
          <Link href="https://www.hjorturfreyr.com" className="text-sm text-muted-foreground link hover:text-primary">
            Búið til af Hjörtur Freyr
          </Link>
        </div>
      </div>
    </footer>
  );
}
