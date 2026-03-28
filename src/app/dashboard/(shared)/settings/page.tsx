import { ChevronDownIcon } from "lucide-react";
import { LinkedAccounts } from "@/components/LinkedAccounts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const inputClass =
  "block w-full rounded-md border border-border bg-background px-3 py-1.5 text-foreground placeholder:text-muted-foreground focus:outline-2 focus:-outline-offset-2 focus:outline-ring sm:text-sm/6";

export default function ShiftsPage() {
  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full">
        <h1 className="text-2xl/9 font-bold tracking-tight">Stillingar</h1>
        <p className="mt-2 text-sm/6 text-muted-foreground">Skoðaðu og skipulagðu vaktir.</p>
      </div>

      <form className="mt-6">
        <div className="space-y-12">
          {/* Personal Information section */}
          <div className="grid grid-cols-1 gap-x-8 gap-y-10 border-b border-border pb-12 md:grid-cols-3">
            <div>
              <h2 className="text-base/7 font-semibold">Personal Information</h2>
              <p className="mt-1 text-sm/6 text-muted-foreground">
                Use a permanent address where you can receive mail.
              </p>
            </div>

            <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6 md:col-span-2">
              <div className="sm:col-span-3">
                <label htmlFor="first-name" className="block text-sm/6 font-medium">
                  First name
                </label>
                <div className="mt-2">
                  <Input id="first-name" name="first-name" type="text" autoComplete="given-name" />
                </div>
              </div>
              <div className="sm:col-span-3">
                <label htmlFor="last-name" className="block text-sm/6 font-medium">
                  Last name
                </label>
                <div className="mt-2">
                  <Input id="last-name" name="last-name" type="text" autoComplete="family-name" />
                </div>
              </div>

              <div className="sm:col-span-4">
                <label htmlFor="email" className="block text-sm/6 font-medium">
                  Email address
                </label>
                <div className="mt-2">
                  <Input id="email" name="email" type="email" autoComplete="email" />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="country" className="block text-sm/6 font-medium">
                  Country
                </label>
                <div className="mt-2 grid grid-cols-1">
                  <select
                    id="country"
                    name="country"
                    autoComplete="country-name"
                    className="col-start-1 row-start-1 w-full appearance-none rounded-md border border-border bg-background py-1.5 pr-8 pl-3 text-foreground focus:outline-2 focus:-outline-offset-2 focus:outline-ring sm:text-sm/6"
                  >
                    <option>United States</option>
                    <option>Canada</option>
                    <option>Mexico</option>
                  </select>
                  <ChevronDownIcon
                    aria-hidden="true"
                    className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-muted-foreground sm:size-4"
                  />
                </div>
              </div>

              <div className="col-span-full">
                <label htmlFor="street-address" className="block text-sm/6 font-medium">
                  Street address
                </label>
                <div className="mt-2">
                  <Input id="street-address" name="street-address" type="text" autoComplete="street-address" />
                </div>
              </div>

              <div className="sm:col-span-2 sm:col-start-1">
                <label htmlFor="city" className="block text-sm/6 font-medium">
                  City
                </label>
                <div className="mt-2">
                  <Input id="city" name="city" type="text" autoComplete="address-level2" />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="region" className="block text-sm/6 font-medium">
                  State / Province
                </label>
                <div className="mt-2">
                  <Input id="region" name="region" type="text" autoComplete="address-level1" />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="postal-code" className="block text-sm/6 font-medium">
                  ZIP / Postal code
                </label>
                <div className="mt-2">
                  <Input id="postal-code" name="postal-code" type="text" autoComplete="postal-code" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-x-8 gap-y-10 border-b border-border pb-12 md:grid-cols-3">
            <div>
              <h2 className="text-base/7 font-semibold">Notifications</h2>
              <p className="mt-1 text-sm/6 text-muted-foreground">
                We'll always let you know about important changes, but you pick what else you want to hear about.
              </p>
            </div>

            <div className="max-w-2xl space-y-10 md:col-span-2">
              <fieldset>
                <legend className="text-sm/6 font-semibold">By email</legend>
                <div className="mt-6 space-y-6">
                  {[
                    {
                      id: "comments",
                      label: "Comments",
                      description: "Get notified when someones posts a comment on a posting.",
                      defaultChecked: true,
                    },
                    {
                      id: "candidates",
                      label: "Candidates",
                      description: "Get notified when a candidate applies for a job.",
                    },
                    {
                      id: "offers",
                      label: "Offers",
                      description: "Get notified when a candidate accepts or rejects an offer.",
                    },
                  ].map(({ id, label, description, defaultChecked }) => (
                    <div key={id} className="flex gap-3">
                      <div className="flex h-6 shrink-0 items-center">
                        <div className="group grid size-4 grid-cols-1">
                          <input
                            defaultChecked={defaultChecked}
                            id={id}
                            name={id}
                            type="checkbox"
                            aria-describedby={`${id}-description`}
                            className="col-start-1 row-start-1 appearance-none rounded-sm border border-border bg-background checked:border-primary checked:bg-primary indeterminate:border-primary indeterminate:bg-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:border-border disabled:bg-muted disabled:checked:bg-muted forced-colors:appearance-auto"
                          />
                          <svg
                            fill="none"
                            viewBox="0 0 14 14"
                            className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-disabled:stroke-foreground/25"
                          >
                            <path
                              d="M3 8L6 11L11 3.5"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="opacity-0 group-has-checked:opacity-100"
                            />
                            <path
                              d="M3 7H11"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="opacity-0 group-has-indeterminate:opacity-100"
                            />
                          </svg>
                        </div>
                      </div>
                      <div className="text-sm/6">
                        <label htmlFor={id} className="font-medium">
                          {label}
                        </label>
                        <p id={`${id}-description`} className="text-muted-foreground">
                          {description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </fieldset>

              <fieldset>
                <legend className="text-sm/6 font-semibold">Push notifications</legend>
                <p className="mt-1 text-sm/6 text-muted-foreground">
                  These are delivered via SMS to your mobile phone.
                </p>
                <div className="mt-6 space-y-6">
                  {[
                    { id: "push-everything", label: "Everything", defaultChecked: true },
                    { id: "push-email", label: "Same as email" },
                    { id: "push-nothing", label: "No push notifications" },
                  ].map(({ id, label, defaultChecked }) => (
                    <div key={id} className="flex items-center gap-x-3">
                      <input
                        defaultChecked={defaultChecked}
                        id={id}
                        name="push-notifications"
                        type="radio"
                        className="relative size-4 appearance-none rounded-full border border-border bg-background before:absolute before:inset-1 before:rounded-full before:bg-white not-checked:before:hidden checked:border-primary checked:bg-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:border-border disabled:bg-muted disabled:before:bg-muted-foreground forced-colors:appearance-auto forced-colors:before:hidden"
                      />
                      <label htmlFor={id} className="block text-sm/6 font-medium">
                        {label}
                      </label>
                    </div>
                  ))}
                </div>
              </fieldset>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-x-6">
          <button type="button" className="text-sm/6 font-semibold text-muted-foreground hover:text-foreground">
            Cancel
          </button>
          <Button type="submit">Save</Button>
        </div>
      </form>

      <div className="mt-12 border-t border-border pt-12">
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-3">
          <div>
            <LinkedAccounts />
          </div>
        </div>
      </div>
    </div>
  );
}
