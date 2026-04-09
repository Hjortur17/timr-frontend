"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import dayjs from "dayjs";
import { CalendarDays, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import Dialog from "@/components/Dialog";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type {
  Employee,
  GenerateScheduleForm,
  PatternType,
  Shift,
  ShiftTemplate,
  ShiftTemplateForm,
} from "@/types/forms";
import { generateScheduleFormSchema, shiftTemplateFormSchema } from "@/types/forms";
import { authHeaders } from "@/utils/auth";

const PATTERN_PRESETS: Record<string, { label: string; blocks: number[] }> = {
  "2-2-3": { label: "2-2-3", blocks: [2, 2, 3] },
  "5-5-4": { label: "5-5-4", blocks: [5, 5, 4] },
  "5-2": { label: "5-2", blocks: [5, 2] },
  "4-3": { label: "4-3", blocks: [4, 3] },
  custom: { label: "Sérsniðið", blocks: [] },
};

const EMPLOYEE_COLORS = [
  "bg-primary/70 text-primary-foreground",
  "bg-orange-400/70 text-white",
  "bg-violet-500/70 text-white",
  "bg-rose-400/70 text-white",
  "bg-sky-500/70 text-white",
  "bg-amber-400/70 text-white",
];

const DAY_LABELS = ["Mán", "Þri", "Mið", "Fim", "Fös", "Lau", "Sun"];

function computeRotationPreview(blocks: number[], employees: { id: number; name: string }[], cycles: number = 2) {
  if (blocks.length === 0 || employees.length === 0) return [];

  const cycleLength = blocks.reduce((a, b) => a + b, 0);
  const numBlocks = blocks.length;
  const numEmployees = employees.length;
  const rows: {
    day: number;
    dayLabel: string;
    employeeIndex: number;
    employeeName: string;
  }[] = [];

  for (let cycle = 0; cycle < cycles; cycle++) {
    let dayInCycle = 0;
    for (let blockIndex = 0; blockIndex < numBlocks; blockIndex++) {
      const empIndex = (cycle * numBlocks + blockIndex) % numEmployees;
      for (let d = 0; d < blocks[blockIndex]; d++) {
        const globalDay = cycle * cycleLength + dayInCycle;
        rows.push({
          day: globalDay,
          dayLabel: DAY_LABELS[dayInCycle % 7],
          employeeIndex: empIndex,
          employeeName: employees[empIndex].name,
        });
        dayInCycle++;
      }
    }
  }
  return rows;
}

export default function ShiftsTemplatePage() {
  const [templates, setTemplates] = useState<ShiftTemplate[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);

  const [openCreateDrawer, setOpenCreateDrawer] = useState(false);
  const [openEditDrawer, setOpenEditDrawer] = useState(false);
  const [openGenerateDrawer, setOpenGenerateDrawer] = useState(false);

  const [selectedTemplate, setSelectedTemplate] = useState<ShiftTemplate | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    axios
      .get("/api/manager/shift-templates", { headers: authHeaders() })
      .then((res) => setTemplates(res.data.data ?? []))
      .catch(console.error);

    axios
      .get("/api/manager/shifts", { headers: authHeaders() })
      .then((res) => setShifts(res.data.data ?? []))
      .catch(console.error);

    axios
      .get("/api/manager/employees", { headers: authHeaders() })
      .then((res) => setEmployees(res.data.data ?? []))
      .catch(console.error);
  }, []);

  const onCreated = (template: ShiftTemplate) => {
    setTemplates((prev) => [...prev, template]);
    setFormKey((k) => k + 1);
    setOpenCreateDrawer(false);
    toast.success("Vaktarplan búið til.");
  };

  const onUpdated = (template: ShiftTemplate) => {
    setTemplates((prev) => prev.map((t) => (t.id === template.id ? template : t)));
    setFormKey((k) => k + 1);
    setOpenEditDrawer(false);
    toast.success("Vaktarplan uppfært.");
  };

  const deleteTemplate = async (template: ShiftTemplate) => {
    try {
      await axios.delete(`/api/manager/shift-templates/${template.id}`, {
        headers: authHeaders(),
      });
      setTemplates((prev) => prev.filter((t) => t.id !== template.id));
      toast.success("Vaktarplani eytt.");
    } catch {
      toast.error("Ekki tókst að eyða vaktarplani.");
    }
    setShowDeleteDialog(false);
    setSelectedTemplate(null);
  };

  const getPatternLabel = (pattern: PatternType) => {
    return PATTERN_PRESETS[pattern]?.label ?? pattern;
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl space-y-16 sm:space-y-20 lg:mx-0 lg:max-w-none">
        <div>
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-base/7 font-semibold text-foreground">Vaktarplan</h2>
              <p className="mt-1 text-sm/6 text-muted-foreground">Skoðaðu og skipulagðu vaktir</p>
            </div>
            <Button type="button" onClick={() => setOpenCreateDrawer(true)}>
              Bæta við vakt
            </Button>
          </div>

          <div className="mt-6 border-t border-border pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="py-3.5 pr-3 pl-4 sm:pl-3">Nafn</TableHead>
                  <TableHead className="px-3 py-3.5">Mynstur</TableHead>
                  <TableHead className="px-3 py-3.5">Vakt</TableHead>
                  <TableHead className="px-3 py-3.5">Starfsmenn</TableHead>
                  <TableHead className="py-3.5 pr-4 pl-3 sm:pr-3">
                    <span className="sr-only">Aðgerðir</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((template) => (
                  <TableRow key={template.id} className="even:bg-muted/30">
                    <TableCell className="py-4 pr-3 pl-4 font-medium sm:pl-3">{template.name}</TableCell>
                    <TableCell className="px-3 py-4 text-muted-foreground">
                      {getPatternLabel(template.pattern)}
                    </TableCell>
                    <TableCell className="px-3 py-4 text-muted-foreground">{template.shift?.title ?? "–"}</TableCell>
                    <TableCell className="px-3 py-4 text-muted-foreground">
                      {template.employees?.length ?? 0} starfsmenn
                    </TableCell>
                    <TableCell className="flex justify-end gap-2 py-4 pr-4 pl-3 sm:pr-3">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTemplate(template);
                          setShowDeleteDialog(true);
                        }}
                      >
                        <Trash2 className="size-5 text-neutral-500 hover:text-red-700 duration-200 transition-colors cursor-pointer" />
                      </button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedTemplate(template);
                          setFormKey((k) => k + 1);
                          setOpenGenerateDrawer(true);
                        }}
                      >
                        <CalendarDays className="size-4 mr-1" />
                        Uppfæra vaktir
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setSelectedTemplate(template);
                          setFormKey((k) => k + 1);
                          setOpenEditDrawer(true);
                        }}
                      >
                        Breyta
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Create drawer */}
      <Sheet open={openCreateDrawer} onOpenChange={(value) => !value && setOpenCreateDrawer(false)}>
        <SheetContent side="right" className="sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Bæta við vaktarplani</SheetTitle>
          </SheetHeader>
          <div className="px-4">
            <ShiftTemplateFormComponent key={formKey} shifts={shifts} employees={employees} onSaved={onCreated} />
          </div>
        </SheetContent>
      </Sheet>

      {/* Edit drawer */}
      <Sheet open={openEditDrawer} onOpenChange={(value) => !value && setOpenEditDrawer(false)}>
        <SheetContent side="right" className="sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Breyta vaktarplani</SheetTitle>
          </SheetHeader>
          <div className="px-4">
            {selectedTemplate && (
              <ShiftTemplateFormComponent
                key={formKey}
                template={selectedTemplate}
                shifts={shifts}
                employees={employees}
                onSaved={onUpdated}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Generate drawer */}
      <Sheet open={openGenerateDrawer} onOpenChange={(value) => !value && setOpenGenerateDrawer(false)}>
        <SheetContent side="right" className="sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Uppfæra vaktir</SheetTitle>
          </SheetHeader>
          <div className="px-4">
            {selectedTemplate && (
              <GenerateScheduleFormComponent
                key={formKey}
                template={selectedTemplate}
                onGenerated={() => setOpenGenerateDrawer(false)}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>

      <Dialog
        open={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setSelectedTemplate(null);
        }}
        variant="danger"
        title="Eyða vaktarplani?"
        description="Ertu viss um að þú viljir eyða þessu vaktarplani? Ekki er hægt að endurheimta þessa aðgerð."
        onConfirm={() => selectedTemplate && deleteTemplate(selectedTemplate)}
        onCancel={() => {
          setShowDeleteDialog(false);
          setSelectedTemplate(null);
        }}
        buttonTextConfirm="Eyða"
        buttonTextCancel="Hætta við"
      />
    </div>
  );
}

function ShiftTemplateFormComponent({
  template,
  shifts,
  employees,
  onSaved,
}: {
  template?: ShiftTemplate;
  shifts: Shift[];
  employees: Employee[];
  onSaved: (template: ShiftTemplate) => void;
}) {
  const { register, handleSubmit, watch, setValue, control } = useForm<ShiftTemplateForm>({
    resolver: zodResolver(shiftTemplateFormSchema),
    defaultValues: {
      name: template?.name ?? "",
      description: template?.description ?? "",
      shift_id: template?.shift_id ?? 0,
      pattern: template?.pattern ?? "2-2-3",
      blocks: template?.blocks ?? [2, 2, 3],
      employee_ids: template?.employees?.map((e) => e.id) ?? [],
    },
  });

  const pattern = watch("pattern");
  const blocks = watch("blocks");
  const selectedEmployeeIds = watch("employee_ids");
  const [customBlocksInput, setCustomBlocksInput] = useState(
    template?.pattern === "custom" ? template.blocks.join(", ") : "",
  );

  // When pattern changes, update blocks
  useEffect(() => {
    if (pattern !== "custom") {
      const preset = PATTERN_PRESETS[pattern];
      if (preset) {
        setValue("blocks", preset.blocks);
      }
    }
  }, [pattern, setValue]);

  const toggleEmployee = (employeeId: number) => {
    const current = selectedEmployeeIds ?? [];
    if (current.includes(employeeId)) {
      setValue(
        "employee_ids",
        current.filter((id) => id !== employeeId),
      );
    } else {
      setValue("employee_ids", [...current, employeeId]);
    }
  };

  const handleCustomBlocksChange = (value: string) => {
    setCustomBlocksInput(value);
    const parsed = value
      .split(",")
      .map((s) => Number.parseInt(s.trim(), 10))
      .filter((n) => !Number.isNaN(n) && n > 0);
    if (parsed.length > 0) {
      setValue("blocks", parsed);
    }
  };

  const selectedEmployees = employees.filter((e) => (selectedEmployeeIds ?? []).includes(e.id));
  const previewData = computeRotationPreview(
    blocks ?? [],
    selectedEmployees.map((e) => ({ id: e.id, name: e.name })),
  );

  const onSubmit = async (data: ShiftTemplateForm) => {
    try {
      if (template) {
        const response = await axios.put(`/api/manager/shift-templates/${template.id}`, data, {
          headers: authHeaders(),
        });
        onSaved(response.data.data);
      } else {
        const response = await axios.post("/api/manager/shift-templates", data, {
          headers: authHeaders(),
        });
        onSaved(response.data.data);
      }
    } catch {
      toast.error("Villa kom upp. Reyndu aftur.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Name */}
      <div>
        <label htmlFor="tpl-name" className="block text-sm font-semibold text-foreground">
          Nafn
        </label>
        <div className="mt-2">
          <Input id="tpl-name" type="text" placeholder="t.d. Morgunvakt 2-2-3" {...register("name")} />
        </div>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="tpl-description" className="block text-sm font-semibold text-foreground">
          Lýsing (valfrjálst)
        </label>
        <div className="mt-2">
          <Input
            id="tpl-description"
            type="text"
            placeholder="Stutt lýsing á sniðmátinu"
            {...register("description")}
          />
        </div>
      </div>

      {/* Shift selector */}
      <div>
        <label htmlFor="tpl-shift" className="block text-sm font-semibold text-foreground">
          Vakt
        </label>
        <div className="mt-2">
          <Controller
            name="shift_id"
            control={control}
            render={({ field }) => (
              <select
                id="tpl-shift"
                value={field.value || ""}
                onChange={(e) => field.onChange(Number(e.target.value))}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="">Veldu vakt</option>
                {shifts.map((shift) => (
                  <option key={shift.id} value={shift.id}>
                    {shift.title} ({shift.start_time}–{shift.end_time})
                  </option>
                ))}
              </select>
            )}
          />
        </div>
      </div>

      {/* Pattern selector */}
      <div>
        <label htmlFor="tpl-pattern" className="block text-sm font-semibold text-foreground">
          Mynstur
        </label>
        <div className="mt-2">
          <Controller
            name="pattern"
            control={control}
            render={({ field }) => (
              <select
                id="tpl-pattern"
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {Object.entries(PATTERN_PRESETS).map(([key, { label }]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            )}
          />
        </div>

        {/* Show blocks info for presets */}
        {pattern !== "custom" && blocks && (
          <p className="mt-1 text-xs text-muted-foreground">
            Blokkir: {blocks.join(" – ")} ({blocks.reduce((a, b) => a + b, 0)} dagar í hringrás)
          </p>
        )}

        {/* Custom blocks input */}
        {pattern === "custom" && (
          <div className="mt-2">
            <Input
              type="text"
              placeholder="t.d. 3, 2, 2"
              value={customBlocksInput}
              onChange={(e) => handleCustomBlocksChange(e.target.value)}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Sláðu inn blokkastærðir, aðskildar með kommu.
              {blocks && blocks.length > 0 && <> Hringrás: {blocks.reduce((a, b) => a + b, 0)} dagar.</>}
            </p>
          </div>
        )}
      </div>

      {/* Employee selector */}
      <div>
        <label className="block text-sm font-semibold text-foreground">Starfsmenn (röðun skiptir máli)</label>
        <p className="mt-1 text-xs text-muted-foreground">
          Smelltu til að velja. Röðunin ákvarðar hvernig blokkum er úthlutað.
        </p>
        <div className="mt-2 space-y-1">
          {employees.map((employee) => {
            const isSelected = (selectedEmployeeIds ?? []).includes(employee.id);
            const orderIndex = (selectedEmployeeIds ?? []).indexOf(employee.id);
            return (
              <button
                key={employee.id}
                type="button"
                onClick={() => toggleEmployee(employee.id)}
                className={`flex w-full items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors ${
                  isSelected ? "border-primary bg-primary/5" : "border-input hover:bg-muted/50"
                }`}
              >
                {isSelected && (
                  <span
                    className={`flex size-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${EMPLOYEE_COLORS[orderIndex % EMPLOYEE_COLORS.length]}`}
                  >
                    {orderIndex + 1}
                  </span>
                )}
                {!isSelected && (
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full border border-input text-xs text-muted-foreground" />
                )}
                <span className={isSelected ? "font-medium" : "text-muted-foreground"}>{employee.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Rotation preview */}
      {previewData.length > 0 && (
        <div>
          <label className="block text-sm font-semibold text-foreground">Forskoðun</label>
          <div className="mt-2 overflow-x-auto">
            {[0, 1].map((cycleIdx) => {
              const cycleLength = blocks?.reduce((a, b) => a + b, 0) ?? 0;
              const cycleDays = previewData.filter(
                (r) => r.day >= cycleIdx * cycleLength && r.day < (cycleIdx + 1) * cycleLength,
              );
              if (cycleDays.length === 0) return null;
              return (
                <div key={cycleIdx} className="mb-2">
                  <p className="text-xs text-muted-foreground mb-1">Vika {cycleIdx + 1}</p>
                  <div className="flex gap-1">
                    {cycleDays.map((day) => {
                      const colorClass = EMPLOYEE_COLORS[day.employeeIndex % EMPLOYEE_COLORS.length];
                      return (
                        <div
                          key={day.day}
                          className={`flex flex-col items-center justify-center rounded-md px-2 py-1.5 text-xs ${colorClass}`}
                          style={{ minWidth: "3rem" }}
                        >
                          <span className="font-medium">{day.dayLabel}</span>
                          <span className="mt-0.5 text-[10px] truncate max-w-[3rem]">
                            {day.employeeName.split(" ")[0]}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <Button type="submit" variant="secondary" size="lg" className="w-full">
        {template ? "Vista breytingar" : "Búa til vaktarplan"}
      </Button>
    </form>
  );
}

function GenerateScheduleFormComponent({
  template,
  onGenerated,
}: {
  template: ShiftTemplate;
  onGenerated: () => void;
}) {
  const { handleSubmit, setValue, watch } = useForm<GenerateScheduleForm>({
    resolver: zodResolver(generateScheduleFormSchema),
    defaultValues: { start_date: "", end_date: "" },
  });

  const startDateStr = watch("start_date");
  const endDateStr = watch("end_date");

  const startDate = startDateStr ? new Date(startDateStr) : undefined;
  const endDate = endDateStr ? new Date(endDateStr) : undefined;

  const handleStartDateChange = (date: Date | undefined) => {
    const formatted = date ? dayjs(date).format("YYYY-MM-DD") : "";
    setValue("start_date", formatted);

    if (date) {
      const oneYearLater = dayjs(date).add(1, "year").format("YYYY-MM-DD");
      // Auto-set end date to 1 year ahead if no end date or current end date is before new start
      if (!endDateStr || dayjs(endDateStr).isBefore(dayjs(date))) {
        setValue("end_date", oneYearLater);
      }
    }
  };

  const onSubmit = async (data: GenerateScheduleForm) => {
    try {
      const response = await axios.post(`/api/manager/shift-templates/${template.id}/generate`, data, {
        headers: authHeaders(),
      });
      toast.success(`${response.data.assignments_created} vaktaráðningar búnar til.`);
      onGenerated();
    } catch {
      toast.error("Villa kom upp við að mynda röðun.");
    }
  };

  const today = new Date();
  const fiftyYearsFromNow = dayjs().add(50, "year").toDate();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Veldu hvenær vaktarplan á að byrja.</p>
        <p className="text-sm text-muted-foreground">Hægt að stilla hvenær það á að stoppa.</p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-foreground">Upphafsdagur</label>
        <div className="mt-2">
          <DatePicker
            id="gen-start"
            value={startDate}
            onChange={handleStartDateChange}
            placeholder="Veldu upphafsdagsetningu"
            captionLayout="dropdown"
            startMonth={today}
            endMonth={fiftyYearsFromNow}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-foreground">Lokadagur</label>
        <div className="mt-2">
          <DatePicker
            id="gen-end"
            value={endDate}
            onChange={(date) => setValue("end_date", date ? dayjs(date).format("YYYY-MM-DD") : "")}
            placeholder="Veldu lokadagsetningu"
            captionLayout="dropdown"
            startMonth={startDate ?? today}
            endMonth={fiftyYearsFromNow}
            disabled={{ before: startDate ?? today }}
          />
        </div>
      </div>

      <Button type="submit" variant="secondary" size="lg" className="w-full">
        Mynda röðun
      </Button>
    </form>
  );
}
