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
import { useTranslations } from "next-intl";
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

export default function NotificationsPage() {
  const { isManager } = useUser();
  const t = useTranslations();
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
      .catch(() => toast.error(t("notifications.fetchError")))
      .finally(() => setLoading(false));
  }, [t]);

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
        toast.error(json.message ?? t("common.error"));
        return;
      }

      toast.success(t("notifications.settingsUpdated"));
    } catch {
      toast.error(t("notifications.settingsSaveError"));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
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
          <h2 className="text-base/7 font-semibold text-foreground">{t("notifications.title")}</h2>
          <p className="mt-1 text-sm/6 text-muted-foreground">{t("notifications.description")}</p>
        </div>

        {/* Mandatory employee notifications */}
        {employeeMandatory.length > 0 && (
          <NotificationSection
            title={t("notifications.mandatoryTitle")}
            description={t("notifications.mandatoryDescription")}
            preferences={employeeMandatory}
            onToggleNotification={toggleNotification}
            onToggleChannel={toggleChannel}
            onTimingChange={setTimingValue}
          />
        )}

        {/* Configurable employee notifications */}
        {employeeConfigurable.length > 0 && (
          <NotificationSection
            title={t("notifications.optionalTitle")}
            description={t("notifications.optionalDescription")}
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
                title={t("notifications.mandatoryManagerTitle")}
                description={t("notifications.mandatoryManagerDescription")}
                preferences={managerMandatory}
                onToggleNotification={toggleNotification}
                onToggleChannel={toggleChannel}
                onTimingChange={setTimingValue}
              />
            )}
            {managerConfigurable.length > 0 && (
              <NotificationSection
                title={t("notifications.optionalManagerTitle")}
                description={t("notifications.optionalManagerDescription")}
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
            {saving ? `${t("common.save")}...` : t("notifications.saveSettings")}
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
  const t = useTranslations("notifications");
  const Icon = ICON_MAP[pref.notification_type] ?? Bell;
  const isEnabled = pref.channel_push || pref.channel_email || pref.channel_in_app;

  const channelLabels: Record<string, string> = {
    push: t("channelPush"),
    email: t("channelEmail"),
    in_app: t("channelInApp"),
  };

  const timingLabels: Record<number, string> = {
    15: t("minutes15"),
    30: t("minutes30"),
    60: t("minutes60"),
  };

  const dayLabels: Record<string, string> = {
    sunday: t("sunday"),
    monday: t("monday"),
    tuesday: t("tuesday"),
    wednesday: t("wednesday"),
    thursday: t("thursday"),
    friday: t("friday"),
    saturday: t("saturday"),
  };

  return (
    <div className={`rounded-lg border border-border p-4 ${!pref.mandatory && !isEnabled ? "opacity-60" : ""}`}>
      <div className="flex items-start gap-x-3">
        <Icon className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-x-2">
              <p className="text-sm/6 font-medium text-foreground">{t(`type.${pref.notification_type}.label`)}</p>
              {pref.mandatory && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Lock className="size-3.5 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>{t("mandatoryTooltip")}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            {!pref.mandatory && (
              <Switch checked={isEnabled} onCheckedChange={() => onToggleNotification(pref.notification_type)} />
            )}
          </div>
          <p className="text-sm/6 text-muted-foreground">{t(`type.${pref.notification_type}.description`)}</p>

          {/* Channel toggles */}
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
                    {channelLabels[channel] ?? channel}
                  </label>
                );
              })}
            </div>
          )}

          {/* Timing config */}
          {pref.has_timing_config && pref.notification_type === "shift_start_reminder" && pref.timing_options && (
            <div className="mt-3">
              <label htmlFor={`timing-${pref.notification_type}`} className="text-xs text-muted-foreground">
                {t("reminderBefore")}
              </label>
              <select
                id={`timing-${pref.notification_type}`}
                value={(pref.timing_value?.minutes_before as number) ?? 30}
                onChange={(e) => onTimingChange(pref.notification_type, "minutes_before", Number(e.target.value))}
                className="mt-1 block h-9 rounded-md border border-input bg-transparent px-2.5 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {(pref.timing_options.minutes_before as number[]).map((min) => (
                  <option key={min} value={min}>
                    {timingLabels[min] ?? t("minutesFallback", { min })}
                  </option>
                ))}
              </select>
            </div>
          )}

          {pref.has_timing_config && pref.notification_type === "weekly_timesheet_summary" && pref.timing_options && (
            <div className="mt-3 flex items-center gap-x-3">
              <div>
                <label htmlFor={`timing-day-${pref.notification_type}`} className="text-xs text-muted-foreground">
                  {t("day")}
                </label>
                <select
                  id={`timing-day-${pref.notification_type}`}
                  value={(pref.timing_value?.day as string) ?? "sunday"}
                  onChange={(e) => onTimingChange(pref.notification_type, "day", e.target.value)}
                  className="mt-1 block h-9 rounded-md border border-input bg-transparent px-2.5 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  {(pref.timing_options.days as string[]).map((day) => (
                    <option key={day} value={day}>
                      {dayLabels[day] ?? day}
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-24">
                <label htmlFor={`timing-time-${pref.notification_type}`} className="text-xs text-muted-foreground">
                  {t("time")}
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
