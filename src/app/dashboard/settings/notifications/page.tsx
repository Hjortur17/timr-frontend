"use client";

import {
  AlertTriangle,
  ArrowLeftRight,
  Bell,
  CalendarCheck,
  CalendarClock,
  ClipboardCheck,
  Clock,
  Coffee,
  Eye,
  FileText,
  Lock,
  Palmtree,
  ShieldAlert,
  TrendingUp,
  Umbrella,
  Users,
  UserX,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { TimeInput } from "@/components/ui/time-input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useUser } from "@/context/UserContext";
import { authHeaders } from "@/utils/auth";

interface NotificationPreference {
  notification_type: string;
  label: string;
  description: string;
  mandatory: boolean;
  manager_only: boolean;
  available_channels: string[];
  channel_push: boolean;
  channel_email: boolean;
  channel_in_app: boolean;
  has_timing_config: boolean;
  timing_options: Record<string, number[] | string[]> | null;
  timing_value: Record<string, unknown> | null;
}

const ICON_MAP: Record<string, React.ElementType> = {
  forgot_clock_out_reminder: Clock,
  forgot_clock_in_reminder: Clock,
  overtime_alert: AlertTriangle,
  timesheet_submission_deadline: FileText,
  schedule_change_alert: CalendarCheck,
  shift_start_reminder: Bell,
  shift_published: CalendarClock,
  break_time_reminder: Coffee,
  overtime_warning: TrendingUp,
  weekly_timesheet_summary: FileText,
  open_shift_available: Users,
  vacation_balance_reminder: Umbrella,
  shift_swap_request: ArrowLeftRight,
  vacation_request_response: Palmtree,
  overtime_escalation: ShieldAlert,
  forgot_clock_out_escalation: UserX,
  timesheet_approval_deadline: ClipboardCheck,
  unapproved_timesheets_alert: FileText,
  unusual_activity_alert: Eye,
};

const CHANNEL_LABELS: Record<string, string> = {
  push: "Push",
  email: "Tölvupóstur",
  in_app: "Í appi",
};

const TIMING_LABELS: Record<number, string> = {
  15: "15 mínútur",
  30: "30 mínútur",
  60: "1 klukkustund",
};

const DAY_LABELS: Record<string, string> = {
  sunday: "Sunnudagur",
  monday: "Mánudagur",
  tuesday: "Þriðjudagur",
  wednesday: "Miðvikudagur",
  thursday: "Fimmtudagur",
  friday: "Föstudagur",
  saturday: "Laugardagur",
};

export default function NotificationsPage() {
  const { isManager } = useUser();
  const [preferences, setPreferences] = useState<NotificationPreference[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/auth/notification-preferences", {
      headers: authHeaders(),
    })
      .then((res) => res.json())
      .then((json) => {
        setPreferences(json.data ?? []);
      })
      .catch(() => toast.error("Ekki tókst að sækja stillingar."))
      .finally(() => setLoading(false));
  }, []);

  function toggleNotification(type: string) {
    setPreferences((prev) =>
      prev.map((p) => {
        if (p.notification_type !== type) return p;
        const isCurrentlyOn = p.channel_push || p.channel_email || p.channel_in_app;
        if (isCurrentlyOn) {
          return {
            ...p,
            channel_push: false,
            channel_email: false,
            channel_in_app: false,
          };
        }
        // Turn on: restore defaults based on available channels
        return {
          ...p,
          channel_push: p.available_channels.includes("push"),
          channel_email: p.available_channels.includes("email"),
          channel_in_app: p.available_channels.includes("in_app"),
        };
      }),
    );
  }

  function toggleChannel(type: string, channel: string) {
    setPreferences((prev) =>
      prev.map((p) => {
        if (p.notification_type !== type) return p;
        const key = `channel_${channel}` as keyof NotificationPreference;
        return { ...p, [key]: !p[key] };
      }),
    );
  }

  function setTimingValue(type: string, key: string, value: unknown) {
    setPreferences((prev) =>
      prev.map((p) => {
        if (p.notification_type !== type) return p;
        return {
          ...p,
          timing_value: { ...(p.timing_value ?? {}), [key]: value },
        };
      }),
    );
  }

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/auth/notification-preferences", {
        method: "PUT",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({
          preferences: preferences.map(
            ({ notification_type, channel_push, channel_email, channel_in_app, timing_value }) => ({
              notification_type,
              channel_push,
              channel_email,
              channel_in_app,
              timing_value: timing_value ?? null,
            }),
          ),
        }),
      });

      if (!res.ok) {
        const json = await res.json();
        toast.error(json.message ?? "Villa kom upp.");
        return;
      }

      toast.success("Stillingar uppfærðar.");
    } catch {
      toast.error("Ekki tókst að vista stillingar.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <p className="text-sm text-muted-foreground">Hleð...</p>
      </div>
    );
  }

  const employeeMandatory = preferences.filter((p) => p.mandatory && !p.manager_only);
  const employeeConfigurable = preferences.filter((p) => !p.mandatory && !p.manager_only);
  const managerMandatory = preferences.filter((p) => p.mandatory && p.manager_only);
  const managerConfigurable = preferences.filter((p) => !p.mandatory && p.manager_only);

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl space-y-10 lg:mx-0 lg:max-w-none">
        {/* Header */}
        <div>
          <h2 className="text-base/7 font-semibold text-foreground">Tilkynningar</h2>
          <p className="mt-1 text-sm/6 text-muted-foreground">Veldu hvaða tilkynningar þú vilt fá og á hvaða rás.</p>
        </div>

        {/* Mandatory employee notifications */}
        {employeeMandatory.length > 0 && (
          <NotificationSection
            title="Nauðsynlegar tilkynningar"
            description="Ekki er hægt að slökkva á þessum tilkynningum en þú getur valið á hvaða rás þú færð þær."
            preferences={employeeMandatory}
            onToggleNotification={toggleNotification}
            onToggleChannel={toggleChannel}
            onTimingChange={setTimingValue}
          />
        )}

        {/* Configurable employee notifications */}
        {employeeConfigurable.length > 0 && (
          <NotificationSection
            title="Valfrjálsar tilkynningar"
            description="Þú getur kveikt eða slökkt á þessum tilkynningum."
            preferences={employeeConfigurable}
            onToggleNotification={toggleNotification}
            onToggleChannel={toggleChannel}
            onTimingChange={setTimingValue}
          />
        )}

        {/* Manager notifications */}
        {isManager && (managerMandatory.length > 0 || managerConfigurable.length > 0) && (
          <>
            {managerMandatory.length > 0 && (
              <NotificationSection
                title="Nauðsynlegar stjórnendatilkynningar"
                description="Þessar tilkynningar eru skylda fyrir stjórnendur."
                preferences={managerMandatory}
                onToggleNotification={toggleNotification}
                onToggleChannel={toggleChannel}
                onTimingChange={setTimingValue}
              />
            )}
            {managerConfigurable.length > 0 && (
              <NotificationSection
                title="Valfrjálsar stjórnendatilkynningar"
                description="Valfrjálsar tilkynningar fyrir stjórnendur."
                preferences={managerConfigurable}
                onToggleNotification={toggleNotification}
                onToggleChannel={toggleChannel}
                onTimingChange={setTimingValue}
              />
            )}
          </>
        )}

        {/* Save button */}
        <div className="border-t border-border pt-6">
          <Button onClick={save} disabled={saving}>
            {saving ? "Vista..." : "Vista stillingar"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function NotificationSection({
  title,
  description,
  preferences,
  onToggleNotification,
  onToggleChannel,
  onTimingChange,
}: {
  title: string;
  description: string;
  preferences: NotificationPreference[];
  onToggleNotification: (type: string) => void;
  onToggleChannel: (type: string, channel: string) => void;
  onTimingChange: (type: string, key: string, value: unknown) => void;
}) {
  return (
    <div className="border-t border-border pt-6">
      <h3 className="text-sm/6 font-semibold text-foreground">{title}</h3>
      <p className="mt-1 text-sm/6 text-muted-foreground">{description}</p>
      <div className="mt-4 space-y-4">
        {preferences.map((pref) => (
          <NotificationRow
            key={pref.notification_type}
            pref={pref}
            onToggleNotification={onToggleNotification}
            onToggleChannel={onToggleChannel}
            onTimingChange={onTimingChange}
          />
        ))}
      </div>
    </div>
  );
}

function NotificationRow({
  pref,
  onToggleNotification,
  onToggleChannel,
  onTimingChange,
}: {
  pref: NotificationPreference;
  onToggleNotification: (type: string) => void;
  onToggleChannel: (type: string, channel: string) => void;
  onTimingChange: (type: string, key: string, value: unknown) => void;
}) {
  const Icon = ICON_MAP[pref.notification_type] ?? Bell;
  const isEnabled = pref.channel_push || pref.channel_email || pref.channel_in_app;

  return (
    <div className={`rounded-lg border border-border p-4 ${!pref.mandatory && !isEnabled ? "opacity-60" : ""}`}>
      <div className="flex items-start gap-x-3">
        <Icon className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-x-2">
              <p className="text-sm/6 font-medium text-foreground">{pref.label}</p>
              {pref.mandatory && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Lock className="size-3.5 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>Þessi tilkynning er nauðsynleg og ekki er hægt að slökkva á henni.</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            {!pref.mandatory && (
              <Switch checked={isEnabled} onCheckedChange={() => onToggleNotification(pref.notification_type)} />
            )}
          </div>
          <p className="text-sm/6 text-muted-foreground">{pref.description}</p>

          {/* Channel toggles — always shown for mandatory, shown when enabled for configurable */}
          {(pref.mandatory || isEnabled) && (
            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
              {pref.available_channels.map((channel) => {
                const key = `channel_${channel}` as "channel_push" | "channel_email" | "channel_in_app";
                const checked = pref[key];
                const disabled = pref.mandatory && checked && !hasOtherActiveChannel(pref, channel);

                const id = `${pref.notification_type}-${channel}`;
                return (
                  <label key={channel} htmlFor={id} className="flex items-center gap-x-2 text-sm text-foreground">
                    <Checkbox
                      id={id}
                      checked={checked}
                      onCheckedChange={() => {
                        if (!disabled) onToggleChannel(pref.notification_type, channel);
                      }}
                      disabled={disabled}
                    />
                    {CHANNEL_LABELS[channel] ?? channel}
                  </label>
                );
              })}
            </div>
          )}

          {/* Timing config */}
          {pref.has_timing_config && pref.notification_type === "shift_start_reminder" && pref.timing_options && (
            <div className="mt-3">
              <label htmlFor={`timing-${pref.notification_type}`} className="text-xs text-muted-foreground">
                Áminning hversu löngu fyrir vakt
              </label>
              <select
                id={`timing-${pref.notification_type}`}
                value={(pref.timing_value?.minutes_before as number) ?? 30}
                onChange={(e) => onTimingChange(pref.notification_type, "minutes_before", Number(e.target.value))}
                className="mt-1 block h-9 rounded-md border border-input bg-transparent px-2.5 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {(pref.timing_options.minutes_before as number[]).map((min) => (
                  <option key={min} value={min}>
                    {TIMING_LABELS[min] ?? `${min} mín`}
                  </option>
                ))}
              </select>
            </div>
          )}

          {pref.has_timing_config && pref.notification_type === "weekly_timesheet_summary" && pref.timing_options && (
            <div className="mt-3 flex items-center gap-x-3">
              <div>
                <label htmlFor={`timing-day-${pref.notification_type}`} className="text-xs text-muted-foreground">
                  Dagur
                </label>
                <select
                  id={`timing-day-${pref.notification_type}`}
                  value={(pref.timing_value?.day as string) ?? "sunday"}
                  onChange={(e) => onTimingChange(pref.notification_type, "day", e.target.value)}
                  className="mt-1 block h-9 rounded-md border border-input bg-transparent px-2.5 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  {(pref.timing_options.days as string[]).map((day) => (
                    <option key={day} value={day}>
                      {DAY_LABELS[day] ?? day}
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-24">
                <label htmlFor={`timing-time-${pref.notification_type}`} className="text-xs text-muted-foreground">
                  Tími
                </label>
                <TimeInput
                  id={`timing-time-${pref.notification_type}`}
                  value={(pref.timing_value?.time as string) ?? "09:00"}
                  onChange={(e) => onTimingChange(pref.notification_type, "time", e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function hasOtherActiveChannel(pref: NotificationPreference, currentChannel: string): boolean {
  const channels = ["push", "email", "in_app"];
  return channels.some((ch) => {
    if (ch === currentChannel) return false;
    if (!pref.available_channels.includes(ch)) return false;
    const key = `channel_${ch}` as "channel_push" | "channel_email" | "channel_in_app";
    return pref[key];
  });
}
