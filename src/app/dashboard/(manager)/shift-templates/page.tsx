"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import Dialog from "@/components/Dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { Employee, GenerateScheduleForm, Shift, ShiftTemplate, ShiftTemplateForm } from "@/types/forms";
import { generateScheduleFormSchema, shiftTemplateFormSchema } from "@/types/forms";
import { authHeaders } from "@/utils/auth";

type PendingEntry = {
  shift_id: number;
  employee_id: number | null;
  day_offset: number;
};

export default function ShiftTemplatesPage() {
  const [templates, setTemplates] = useState<ShiftTemplate[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);

  const [formKey, setFormKey] = useState(0);

  const [openCreateDrawer, setOpenCreateDrawer] = useState(false);
  const [openEditDrawer, setOpenEditDrawer] = useState(false);
  const [openGenerateDrawer, setOpenGenerateDrawer] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ShiftTemplate | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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
  };

  const onUpdated = (template: ShiftTemplate) => {
    setTemplates((prev) => prev.map((t) => (t.id === template.id ? template : t)));
    setFormKey((k) => k + 1);
    setSelectedTemplate(null);
    setOpenEditDrawer(false);
  };

  const onOpenEditDrawer = (template: ShiftTemplate) => {
    setSelectedTemplate(template);
    setOpenEditDrawer(true);
  };

  const onOpenGenerateDrawer = (template: ShiftTemplate) => {
    setSelectedTemplate(template);
    setOpenGenerateDrawer(true);
  };

  const deleteTemplate = (template: ShiftTemplate) => {
    axios
      .delete(`/api/manager/shift-templates/${template.id}`, {
        headers: authHeaders(),
      })
      .then((res) => {
        setTemplates((prev) => prev.filter((t) => t.id !== template.id));
        setShowDeleteDialog(false);
        setSelectedTemplate(null);
        toast.success(res.data.message);
      })
      .catch((err) => {
        toast.error(err.response?.data?.message ?? "Villa við að eyða sniðmáti.");
      });
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full flex items-end justify-between">
        <div>
          <h1 className="text-2xl/9 font-bold tracking-tight text-neutral-900">Vaktasniðmát</h1>
          <p className="mt-2 text-sm/6 text-neutral-500">Búðu til endurteknar vaktaraðir og mynda röðun úr þeim.</p>
        </div>
        <Button type="button" size="lg" onClick={() => setOpenCreateDrawer(true)}>
          Bæta við sniðmáti
        </Button>
      </div>

      <div className="sm:mx-auto sm:w-full">
        <div className="mt-8 flow-root">
          <div className="-my-2 overflow-x-auto">
            <div className="inline-block min-w-full py-2 align-middle">
              <table className="relative min-w-full divide-y divide-gray-300">
                <thead>
                  <tr>
                    <th scope="col" className="py-3.5 pr-3 pl-4 text-left text-sm font-semibold text-gray-900 sm:pl-3">
                      Nafn
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Lýsing
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Hringrásdagar
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Færslur
                    </th>
                    <th scope="col" className="py-3.5 pr-4 pl-3 sm:pr-3">
                      <span className="sr-only">Aðgerðir</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {templates.map((template) => (
                    <tr key={template.id} className="even:bg-foreground-light">
                      <td className="py-4 pr-3 pl-4 text-sm font-medium whitespace-nowrap text-gray-900 sm:pl-3">
                        {template.name}
                      </td>
                      <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">
                        {template.description ?? "–"}
                      </td>
                      <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">
                        {template.cycle_length_days} {template.cycle_length_days === 1 ? "dagur" : "dagar"}
                      </td>
                      <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">
                        {template.entries?.length ?? 0}
                      </td>
                      <td className="py-4 pr-4 pl-3 text-right text-sm font-medium whitespace-nowrap sm:pr-3 flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setShowDeleteDialog(true);
                            setSelectedTemplate(template);
                          }}
                        >
                          <Trash2 className="size-5 text-neutral-500 hover:text-red-700 duration-200 transition-colors cursor-pointer" />
                        </button>
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => onOpenGenerateDrawer(template)}
                        >
                          Mynda röðun
                        </Button>
                        <Button type="button" variant="secondary" size="sm" onClick={() => onOpenEditDrawer(template)}>
                          Breyta
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <Sheet open={openCreateDrawer} onOpenChange={(value) => !value && setOpenCreateDrawer(false)}>
        <SheetContent side="right" className="sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Bæta við vaktasniðmáti</SheetTitle>
          </SheetHeader>
          <div className="px-4">
            <ShiftTemplateForm key={formKey} shifts={shifts} employees={employees} onSaved={onCreated} />
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={openEditDrawer} onOpenChange={(value) => !value && setOpenEditDrawer(false)}>
        <SheetContent side="right" className="sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Breyta vaktasniðmáti</SheetTitle>
          </SheetHeader>
          <div className="px-4">
            {selectedTemplate && (
              <ShiftTemplateForm
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

      <Sheet open={openGenerateDrawer} onOpenChange={(value) => !value && setOpenGenerateDrawer(false)}>
        <SheetContent side="right" className="sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Mynda röðun — {selectedTemplate?.name}</SheetTitle>
          </SheetHeader>
          <div className="px-4">
            {selectedTemplate && (
              <GenerateScheduleForm
                key={`generate-${selectedTemplate.id}`}
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
        title="Eyða vaktasniðmáti?"
        description="Ertu viss um að þú viljir eyða þessu vaktasniðmáti? Ekki er hægt að endurheimta þessa aðgerð."
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

function ShiftTemplateForm({
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
  const [entries, setEntries] = useState<PendingEntry[]>(
    template?.entries?.map((e) => ({
      shift_id: e.shift_id,
      employee_id: e.employee_id,
      day_offset: e.day_offset,
    })) ?? [],
  );

  const [newShiftId, setNewShiftId] = useState<string>("");
  const [newEmployeeId, setNewEmployeeId] = useState<string>("");
  const [newDayOffset, setNewDayOffset] = useState<string>("0");

  const { register, handleSubmit } = useForm<ShiftTemplateForm>({
    resolver: zodResolver(shiftTemplateFormSchema),
    defaultValues: {
      name: template?.name ?? "",
      description: template?.description ?? "",
      cycle_length_days: template?.cycle_length_days ?? 7,
    },
  });

  const addEntry = () => {
    if (!newShiftId) return;
    setEntries((prev) => [
      ...prev,
      {
        shift_id: Number(newShiftId),
        employee_id: newEmployeeId ? Number(newEmployeeId) : null,
        day_offset: Number(newDayOffset),
      },
    ]);
    setNewShiftId("");
    setNewEmployeeId("");
    setNewDayOffset("0");
  };

  const removeEntry = (index: number) => {
    setEntries((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: ShiftTemplateForm) => {
    const payload = { ...data, entries };

    if (template) {
      const response = await axios.put(`/api/manager/shift-templates/${template.id}`, payload, {
        headers: authHeaders(),
      });
      onSaved(response.data.data);
    } else {
      const response = await axios.post("/api/manager/shift-templates", payload, {
        headers: authHeaders(),
      });
      onSaved(response.data.data);
    }
  };

  const getShiftLabel = (shiftId: number) => {
    return shifts.find((s) => s.id === shiftId)?.title ?? `Vakt #${shiftId}`;
  };

  const getEmployeeLabel = (employeeId: number | null) => {
    if (!employeeId) return "Allir starfsmenn";
    return employees.find((e) => e.id === employeeId)?.name ?? `Starfsmaður #${employeeId}`;
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label htmlFor="tpl-name" className="block text-base/7 font-semibold text-neutral-950">
          Nafn
        </label>
        <div className="mt-2">
          <Input id="tpl-name" type="text" placeholder="t.d. 2-2-3 hringrás" {...register("name")} />
        </div>
      </div>

      <div>
        <label htmlFor="tpl-description" className="block text-base/7 font-semibold text-neutral-950">
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

      <div>
        <label htmlFor="tpl-cycle" className="block text-base/7 font-semibold text-neutral-950">
          Hringrásdagar
        </label>
        <div className="mt-2">
          <Input
            id="tpl-cycle"
            type="number"
            min={1}
            placeholder="7"
            {...register("cycle_length_days", { valueAsNumber: true })}
          />
        </div>
      </div>

      {/* Entries */}
      <div>
        <p className="block text-base/7 font-semibold text-neutral-950">Færslur</p>

        {entries.length > 0 && (
          <div className="mt-2 divide-y divide-gray-100 rounded-md border border-gray-200">
            {entries.map((entry, index) => (
              <div
                key={`${entry.shift_id}-${entry.employee_id}-${entry.day_offset}-${index}`}
                className="flex items-center justify-between px-3 py-2 text-sm"
              >
                <div className="min-w-0">
                  <span className="font-medium text-gray-900">Dagur {entry.day_offset}</span>
                  <span className="mx-1 text-gray-400">·</span>
                  <span className="text-gray-600">{getShiftLabel(entry.shift_id)}</span>
                  <span className="mx-1 text-gray-400">·</span>
                  <span className="text-gray-500">{getEmployeeLabel(entry.employee_id)}</span>
                </div>
                <button type="button" onClick={() => removeEntry(index)} className="ml-2 shrink-0">
                  <Trash2 className="size-4 text-neutral-400 hover:text-red-600 transition-colors cursor-pointer" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add entry form */}
        <div className="mt-3 space-y-2">
          <p className="text-sm font-medium text-neutral-700">Bæta við færslu</p>
          <div className="grid grid-cols-3 gap-2">
            <select
              value={newShiftId}
              onChange={(e) => setNewShiftId(e.target.value)}
              className="col-span-2 rounded-md border border-input bg-background px-3 py-1.5 text-sm shadow-xs focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="">Veldu vakt</option>
              {shifts.map((shift) => (
                <option key={shift.id} value={shift.id}>
                  {shift.title}
                </option>
              ))}
            </select>
            <Input
              type="number"
              min={0}
              placeholder="Dagur"
              value={newDayOffset}
              onChange={(e) => setNewDayOffset(e.target.value)}
            />
          </div>
          <select
            value={newEmployeeId}
            onChange={(e) => setNewEmployeeId(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm shadow-xs focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="">Allir starfsmenn</option>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.name}
              </option>
            ))}
          </select>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={addEntry}
            disabled={!newShiftId}
            className="flex items-center gap-1"
          >
            <Plus className="size-4" />
            Bæta við færslu
          </Button>
        </div>
      </div>

      <Button type="submit" variant="secondary" size="lg" className="w-full">
        {template ? "Vista breytingar" : "Búa til sniðmát"}
      </Button>
    </form>
  );
}

function GenerateScheduleForm({ template, onGenerated }: { template: ShiftTemplate; onGenerated: () => void }) {
  const { register, handleSubmit } = useForm<GenerateScheduleForm>({
    resolver: zodResolver(generateScheduleFormSchema),
    defaultValues: { start_date: "", end_date: "" },
  });

  const onSubmit = async (data: GenerateScheduleForm) => {
    const response = await axios.post(`/api/manager/shift-templates/${template.id}/generate`, data, {
      headers: authHeaders(),
    });
    toast.success(`${response.data.assignments_created} vaktaráðningar búnar til.`);
    onGenerated();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <p className="text-sm text-neutral-500">
        Veldu tímabil til að mynda vaktaráðningar út frá hringrás sniðmátsins ({template.cycle_length_days}{" "}
        {template.cycle_length_days === 1 ? "dagur" : "dagar"}).
      </p>

      <div>
        <label htmlFor="gen-start" className="block text-base/7 font-semibold text-neutral-950">
          Upphafsdagur
        </label>
        <div className="mt-2">
          <Input id="gen-start" type="date" {...register("start_date")} />
        </div>
      </div>

      <div>
        <label htmlFor="gen-end" className="block text-base/7 font-semibold text-neutral-950">
          Lokadagur
        </label>
        <div className="mt-2">
          <Input id="gen-end" type="date" {...register("end_date")} />
        </div>
      </div>

      <Button type="submit" variant="secondary" size="lg" className="w-full">
        Mynda röðun
      </Button>
    </form>
  );
}
