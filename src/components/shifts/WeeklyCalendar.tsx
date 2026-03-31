"use client";

import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  PointerSensor,
  TouchSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import axios from "axios";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import isoWeek from "dayjs/plugin/isoWeek";
import { ChevronLeft, ChevronRight, Plus, UserPlus, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { formatDuration } from "@/lib/utils";
import type { Employee, Shift, ShiftAssignment } from "@/types/forms";
import { authHeaders } from "@/utils/auth";
import { cn } from "@/utils/classname";
import Modal from "../Modal";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";

dayjs.extend(isoWeek);
dayjs.extend(customParseFormat);

const DAY_LABELS = ["MÁN", "ÞRI", "MIÐ", "FIM", "FÖS", "LAU", "SUN"];

const SHIFT_COLORS = [
  { bg: "bg-emerald-200", text: "text-emerald-800" },
  { bg: "bg-orange-200", text: "text-orange-800" },
  { bg: "bg-cyan-200", text: "text-cyan-800" },
  { bg: "bg-violet-200", text: "text-violet-800" },
  { bg: "bg-rose-200", text: "text-rose-800" },
  { bg: "bg-blue-200", text: "text-blue-800" },
  { bg: "bg-amber-200", text: "text-amber-800" },
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function getShiftColor(title: string) {
  return SHIFT_COLORS[hashString(title) % SHIFT_COLORS.length];
}

function formatShiftTime(time: string): string {
  // Accepts H:i or H:i:s
  const d = dayjs(time, ["HH:mm:ss", "HH:mm"], true);
  return d.isValid() ? d.format("HH:mm") : time;
}

function durationMinutes(startTime: string, endTime: string): number {
  const s = dayjs(startTime, ["HH:mm:ss", "HH:mm"], true);
  const e = dayjs(endTime, ["HH:mm:ss", "HH:mm"], true);
  return e.diff(s, "minute");
}

function getWeekDays(weekStart: dayjs.Dayjs): dayjs.Dayjs[] {
  return Array.from({ length: 7 }, (_, i) => weekStart.add(i, "day"));
}

interface WeeklyCalendarProps {
  onActionsChange?: (actions: React.ReactNode) => void;
}

export default function WeeklyCalendar({ onActionsChange }: WeeklyCalendarProps) {
  const [weekStart, setWeekStart] = useState(() => dayjs().startOf("isoWeek"));
  const [assignments, setAssignments] = useState<ShiftAssignment[]>([]);
  const [shiftTemplates, setShiftTemplates] = useState<Shift[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  const [showAddShiftModal, setShowAddShiftModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedDay, setSelectedDay] = useState<dayjs.Dayjs | null>(null);
  const [assigningShiftId, setAssigningShiftId] = useState<number | null>(null);

  const [activeAssignment, setActiveAssignment] = useState<ShiftAssignment | null>(null);

  const [isPublishingWeek, setIsPublishingWeek] = useState(false);
  const [isPublishingAll, setIsPublishingAll] = useState(false);

  const [justPublishedIds, setJustPublishedIds] = useState<number[] | null>(null);

  const weekDays = useMemo(() => getWeekDays(weekStart), [weekStart]);
  const weekEnd = weekDays[6];

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    }),
  );

  // Fetch templates and employees once; fetch assignments whenever the visible week changes.
  useEffect(() => {
    Promise.all([
      axios.get("/api/manager/shifts", { headers: authHeaders() }),
      axios.get("/api/manager/employees", { headers: authHeaders() }),
    ])
      .then(([shiftsRes, employeesRes]) => {
        setShiftTemplates(shiftsRes.data.data ?? []);
        setEmployees(employeesRes.data.data ?? []);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    setJustPublishedIds(null);
    const from = weekStart.format("YYYY-MM-DD");
    const to = weekEnd.format("YYYY-MM-DD");
    axios
      .get(`/api/manager/shift-assignments?from=${from}&to=${to}`, {
        headers: authHeaders(),
      })
      .then((res) => setAssignments(res.data.data ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [weekStart, weekEnd]);

  /** Map<employeeId, Map<dayIndex (0-6), ShiftAssignment[]>> */
  const assignmentsByEmployeeAndDay = useMemo(() => {
    const map = new Map<number, Map<number, ShiftAssignment[]>>();
    for (const a of assignments) {
      const dayIndex = dayjs(a.date).isoWeekday() - 1;
      let empMap = map.get(a.employee_id);
      if (!empMap) {
        empMap = new Map();
        map.set(a.employee_id, empMap);
      }
      let dayList = empMap.get(dayIndex);
      if (!dayList) {
        dayList = [];
        empMap.set(dayIndex, dayList);
      }
      dayList.push(a);
    }
    return map;
  }, [assignments]);

  const maxShiftsPerCell = useMemo(() => {
    let max = 0;
    for (const [, empMap] of assignmentsByEmployeeAndDay) {
      for (const [, dayAssignments] of empMap) {
        if (dayAssignments.length > max) max = dayAssignments.length;
      }
    }
    return max;
  }, [assignmentsByEmployeeAndDay]);

  const hasUnpublishedAssignments = useMemo(
    () => assignments.some((a) => !a.published || a.has_unpublished_changes),
    [assignments],
  );

  // ~50px per shift block (44px height + 6px gap) + 48px for add button and padding
  const rowMinHeight = Math.max(128, maxShiftsPerCell * 50 + 48);

  const getEmployeeWeekMinutes = useCallback(
    (employeeId: number): number => {
      const empMap = assignmentsByEmployeeAndDay.get(employeeId);
      if (!empMap) return 0;
      let total = 0;
      for (const [, dayAssignments] of empMap) {
        for (const a of dayAssignments) {
          total += durationMinutes(a.shift.start_time, a.shift.end_time);
        }
      }
      return total;
    },
    [assignmentsByEmployeeAndDay],
  );

  /** Unique shift templates (deduped by title) for the modal picker. */
  const uniqueTemplates = useMemo(() => {
    const seen = new Map<string, Shift>();
    for (const s of shiftTemplates) seen.set(s.title, s);
    return Array.from(seen.values());
  }, [shiftTemplates]);

  /** Shift IDs already assigned to the selected employee on the selected day. */
  const alreadyAssignedShiftIds = useMemo(() => {
    if (!selectedEmployee || !selectedDay) return new Set<number>();
    const dayIndex = selectedDay.isoWeekday() - 1;
    const empMap = assignmentsByEmployeeAndDay.get(selectedEmployee.id);
    const dayAssignments = empMap?.get(dayIndex) ?? [];
    return new Set(dayAssignments.map((a) => a.shift_id));
  }, [selectedEmployee, selectedDay, assignmentsByEmployeeAndDay]);

  const assignShift = async (template: Shift) => {
    if (!selectedEmployee || !selectedDay) return;
    if (assigningShiftId !== null) return;

    setAssigningShiftId(template.id);
    try {
      const response = await axios.post(
        "/api/manager/shift-assignments",
        {
          shift_id: template.id,
          employee_id: selectedEmployee.id,
          date: selectedDay.format("YYYY-MM-DD"),
          published: false,
        },
        { headers: authHeaders() },
      );
      const created = response.data.data as ShiftAssignment;
      setAssignments((prev) => [...prev, created]);
      setShowAddShiftModal(false);
      setSelectedEmployee(null);
      setSelectedDay(null);
      toast.success(response.data.message ?? "Vakt úthlutað");
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Ekki tókst að úthluta vakt";
      toast.error(message);
    } finally {
      setAssigningShiftId(null);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const assignment = event.active.data.current?.assignment as ShiftAssignment | undefined;
    setActiveAssignment(assignment ?? null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveAssignment(null);
    const { active, over } = event;
    if (!over) return;

    const dragData = active.data.current as
      | { assignment: ShiftAssignment; employeeId: number; dayIndex: number }
      | undefined;
    const dropData = over.data.current as { employeeId: number; dayIndex: number; day: dayjs.Dayjs } | undefined;

    if (!dragData || !dropData) return;
    if (dragData.employeeId === dropData.employeeId && dragData.dayIndex === dropData.dayIndex) return;

    const assignment = dragData.assignment;
    const newDate = dropData.day.format("YYYY-MM-DD");
    const newEmployeeId = dropData.employeeId;

    // Optimistic update
    const updated: ShiftAssignment = {
      ...assignment,
      date: newDate,
      employee_id: newEmployeeId,
    };
    setAssignments((prev) => prev.map((a) => (a.id === assignment.id ? updated : a)));

    try {
      const body: Record<string, unknown> = { date: newDate };
      if (dragData.employeeId !== dropData.employeeId) {
        body.employee_id = newEmployeeId;
      }
      const response = await axios.put(`/api/manager/shift-assignments/${assignment.id}`, body, {
        headers: authHeaders(),
      });
      const serverAssignment = response.data.data as ShiftAssignment;
      setAssignments((prev) => prev.map((a) => (a.id === assignment.id ? serverAssignment : a)));
      toast.success("Vakt færð");
    } catch (err: unknown) {
      setAssignments((prev) => prev.map((a) => (a.id === assignment.id ? assignment : a)));
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Ekki tókst að færa vakt";
      toast.error(message);
    }
  };

  const prevWeek = () => setWeekStart((w) => w.subtract(1, "week"));
  const nextWeek = () => setWeekStart((w) => w.add(1, "week"));
  const goToday = () => setWeekStart(dayjs().startOf("isoWeek"));

  const refetchAssignments = useCallback(async () => {
    const from = weekStart.format("YYYY-MM-DD");
    const to = weekEnd.format("YYYY-MM-DD");
    const res = await axios.get(`/api/manager/shift-assignments?from=${from}&to=${to}`, {
      headers: authHeaders(),
    });
    setAssignments(res.data.data ?? []);
  }, [weekStart, weekEnd]);

  const publishWeek = useCallback(async () => {
    if (isPublishingWeek) return;
    const unpublishedIds = assignments.filter((a) => !a.published || a.has_unpublished_changes).map((a) => a.id);
    if (unpublishedIds.length === 0) return;
    setIsPublishingWeek(true);
    try {
      const from = weekStart.format("YYYY-MM-DD");
      const to = weekEnd.format("YYYY-MM-DD");
      await axios.post("/api/manager/shifts/publish", { from, to }, { headers: authHeaders() });
      toast.success("Vaktir birtar");
      await refetchAssignments();
      setJustPublishedIds(unpublishedIds);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Ekki tókst að birta vaktir";
      toast.error(message);
    } finally {
      setIsPublishingWeek(false);
    }
  }, [assignments, weekStart, weekEnd, isPublishingWeek, refetchAssignments]);

  const publishAll = useCallback(async () => {
    if (isPublishingAll) return;
    const unpublishedIds = assignments.filter((a) => !a.published || a.has_unpublished_changes).map((a) => a.id);
    setIsPublishingAll(true);
    try {
      await axios.post("/api/manager/shifts/publish", {}, { headers: authHeaders() });
      toast.success("Allar vaktir birtar");
      await refetchAssignments();
      setJustPublishedIds(unpublishedIds);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Ekki tókst að birta vaktir";
      toast.error(message);
    } finally {
      setIsPublishingAll(false);
    }
  }, [assignments, isPublishingAll, refetchAssignments]);

  const undoPublish = useCallback(async () => {
    if (!justPublishedIds || justPublishedIds.length === 0) return;
    try {
      await axios.post("/api/manager/shifts/unpublish", { ids: justPublishedIds }, { headers: authHeaders() });
      toast.success("Birting afturkölluð");
      await refetchAssignments();
      setJustPublishedIds(null);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Ekki tókst að afturkalla birtingu";
      toast.error(message);
    }
  }, [justPublishedIds, refetchAssignments]);

  const removeAssignment = useCallback(
    async (assignmentId: number) => {
      const prev = assignments;
      setAssignments((a) => a.filter((x) => x.id !== assignmentId));
      try {
        await axios.delete(`/api/manager/shift-assignments/${assignmentId}`, {
          headers: authHeaders(),
        });
        toast.success("Vakt fjarlægð");
      } catch (err: unknown) {
        setAssignments(prev);
        const message =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          "Ekki tókst að fjarlægja vakt";
        toast.error(message);
      }
    },
    [assignments],
  );

  const today = dayjs();
  const isCurrentWeek = today.isoWeek() === weekStart.isoWeek() && today.year() === weekStart.year();

  useEffect(() => {
    if (!onActionsChange) return;
    onActionsChange(
      <RenderActions
        justPublishedIds={justPublishedIds}
        hasUnpublishedAssignments={hasUnpublishedAssignments}
        isPublishingWeek={isPublishingWeek}
        isPublishingAll={isPublishingAll}
        undoPublish={undoPublish}
        publishWeek={publishWeek}
        publishAll={publishAll}
      />,
    );
  }, [
    onActionsChange,
    justPublishedIds,
    hasUnpublishedAssignments,
    isPublishingWeek,
    isPublishingAll,
    undoPublish,
    publishWeek,
    publishAll,
  ]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-neutral-500">Hleð vöktum...</p>
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="mt-6">
        {/* Week Navigation */}
        <div className="mb-4 flex items-center gap-4">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={prevWeek}
              className="rounded-lg border border-neutral-300 p-2 hover:bg-neutral-50 transition-colors"
            >
              <ChevronLeft className="size-4 text-neutral-600" />
            </button>
            <button
              type="button"
              onClick={nextWeek}
              className="rounded-lg border border-neutral-300 p-2 hover:bg-neutral-50 transition-colors"
            >
              <ChevronRight className="size-4 text-neutral-600" />
            </button>
          </div>
          {!isCurrentWeek && (
            <button
              type="button"
              onClick={goToday}
              className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
            >
              Í dag
            </button>
          )}
          <h2 className="text-lg font-semibold text-neutral-900">
            {weekStart.format("D. MMM")} – {weekEnd.format("D. MMM YYYY")}
          </h2>
          {!onActionsChange && (
            <div className="ml-auto flex items-center gap-2">
              <RenderActions
                justPublishedIds={justPublishedIds}
                hasUnpublishedAssignments={hasUnpublishedAssignments}
                isPublishingWeek={isPublishingWeek}
                isPublishingAll={isPublishingAll}
                undoPublish={undoPublish}
                publishWeek={publishWeek}
                publishAll={publishAll}
              />
            </div>
          )}
        </div>

        {/* Calendar Grid */}
        <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white shadow-sm">
          <div className="min-w-[960px]">
            {/* Header Row */}
            <div className="grid grid-cols-[180px_repeat(7,1fr)] border-b border-neutral-200 bg-neutral-50">
              <div className="p-3 text-xs font-semibold uppercase tracking-wide text-neutral-500" />
              {weekDays.map((day, i) => {
                const isToday = day.isSame(today, "day");
                return (
                  <div
                    key={DAY_LABELS[i]}
                    className={cn("border-l border-neutral-200 px-3 py-2.5 text-center", isToday && "bg-primary/5")}
                  >
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                      {DAY_LABELS[i]}
                    </div>
                    <div className={cn("mt-0.5 text-xl font-bold", isToday ? "text-primary" : "text-neutral-900")}>
                      {day.date()}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Employee Rows */}
            {employees.length === 0 ? (
              <div className="px-6 py-16 text-center text-neutral-400">Engir starfsmenn fundust.</div>
            ) : (
              employees.map((employee) => {
                const totalMinutes = getEmployeeWeekMinutes(employee.id);
                const empMap = assignmentsByEmployeeAndDay.get(employee.id);

                return (
                  <div
                    key={employee.id}
                    className="grid grid-cols-[180px_repeat(7,1fr)] border-b border-neutral-100 last:border-b-0 hover:bg-neutral-50/40 transition-colors"
                    style={{ minHeight: rowMinHeight }}
                  >
                    {/* Employee Info */}
                    <div className="flex flex-col justify-center p-3">
                      <span className="text-sm font-semibold text-neutral-900 truncate">{employee.name}</span>
                      <span className="mt-0.5 text-xs text-neutral-400">
                        {totalMinutes > 0 ? formatDuration(totalMinutes, "minutes") : "0klst"}
                      </span>
                    </div>

                    {/* Day Cells */}
                    {weekDays.map((day, i) => {
                      const dayAssignments = empMap?.get(i) ?? [];
                      const isToday = day.isSame(today, "day");

                      return (
                        <DroppableCell
                          key={DAY_LABELS[i]}
                          id={`cell-${employee.id}-${i}`}
                          employeeId={employee.id}
                          dayIndex={i}
                          day={day}
                          isToday={isToday}
                        >
                          <div className="h-full flex flex-col gap-1.5">
                            {dayAssignments.map((assignment) => (
                              <DraggableShiftBlock
                                key={assignment.id}
                                assignment={assignment}
                                employeeId={employee.id}
                                dayIndex={i}
                                onRemove={removeAssignment}
                              />
                            ))}
                            <button
                              type="button"
                              onClick={() => {
                                setShowAddShiftModal(true);
                                setSelectedEmployee(employee);
                                setSelectedDay(day);
                              }}
                              className={cn(
                                "flex items-center justify-center rounded-lg transition-colors",
                                dayAssignments.length === 0
                                  ? "w-full h-full border-2 border-dashed border-neutral-300 p-6 hover:border-neutral-400 focus:outline-2 focus:outline-offset-2 focus:outline-secondary flex-col"
                                  : "size-6 w-full shrink-0 border border-dashed border-neutral-300 text-neutral-400 hover:border-neutral-400 hover:text-neutral-600 self-center",
                              )}
                            >
                              {dayAssignments.length === 0 ? (
                                <>
                                  <UserPlus className="size-6 mx-auto" />
                                  <span className="mt-2 block text-sm font-semibold">Bæta við vakt</span>
                                </>
                              ) : (
                                <Plus className="size-3.5" />
                              )}
                            </button>
                          </div>
                        </DroppableCell>
                      );
                    })}
                  </div>
                );
              })
            )}
          </div>
        </div>

        <Modal open={showAddShiftModal} onClose={() => setShowAddShiftModal(false)} hideButtons>
          <div className="w-full h-full">
            <h2 className="text-lg font-semibold mb-4">Bæta við vakt</h2>

            <div className="flex flex-col gap-2 w-full h-80 overflow-y-auto" aria-busy={assigningShiftId !== null}>
              {assigningShiftId !== null && <p className="text-sm text-neutral-500">Úthluta vakt...</p>}
              {uniqueTemplates.map((template) => {
                const isAssigned = alreadyAssignedShiftIds.has(template.id);
                return (
                  <button
                    key={template.id}
                    type="button"
                    disabled={isAssigned || assigningShiftId !== null}
                    className="text-left disabled:opacity-50 disabled:pointer-events-none relative"
                    onClick={() => assignShift(template)}
                  >
                    <ShiftBlock shift={template} />
                    {isAssigned && (
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-neutral-500">
                        Þegar úthlutað
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </Modal>
      </div>

      <DragOverlay>{activeAssignment && <ShiftBlock shift={activeAssignment.shift} dragging />}</DragOverlay>
    </DndContext>
  );
}

function DroppableCell({
  id,
  employeeId,
  dayIndex,
  day,
  isToday,
  children,
}: {
  id: string;
  employeeId: number;
  dayIndex: number;
  day: dayjs.Dayjs;
  isToday: boolean;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: { employeeId, dayIndex, day },
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "min-w-0 border-l border-neutral-100 p-2 transition-colors",
        isToday && "bg-primary/5",
        isOver && "bg-primary/10 ring-1 ring-inset ring-primary/30",
      )}
    >
      {children}
    </div>
  );
}

function DraggableShiftBlock({
  assignment,
  employeeId,
  dayIndex,
  onRemove,
}: {
  assignment: ShiftAssignment;
  employeeId: number;
  dayIndex: number;
  onRemove: (id: number) => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `assignment-${assignment.id}-emp-${employeeId}`,
    data: { assignment, employeeId, dayIndex },
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={cn("touch-none cursor-grab active:cursor-grabbing", isDragging && "opacity-40 cursor-grabbing")}
    >
      <ShiftBlock shift={assignment.shift} onRemove={() => onRemove(assignment.id)} />
    </div>
  );
}

function ShiftBlock({
  shift,
  dragging = false,
  onRemove,
}: {
  shift: Shift;
  dragging?: boolean;
  onRemove?: () => void;
}) {
  const color = getShiftColor(shift.title);

  return (
    <div
      className={cn(
        "w-full gap-2 rounded-lg flex items-center text-xs bg-neutral-200/50 py-2 px-3",
        dragging && "shadow-lg rotate-1",
      )}
    >
      <div className={cn("h-3 w-3 rounded-full shrink-0", color.bg)} />
      <div className="flex-1 flex flex-col items-start gap-0.5 min-w-0">
        <div className="font-semibold truncate">{shift.title}</div>
        {/*<span className="text-xs text-neutral-500">·</span>*/}
        <div className="font-medium opacity-90 shrink-0">
          {formatShiftTime(shift.start_time)}–{formatShiftTime(shift.end_time)}
        </div>
      </div>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="cursor-pointer shrink-0 rounded-full p-0.5 hover:bg-neutral-300/50 transition-colors"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}

function RenderActions({
  justPublishedIds,
  hasUnpublishedAssignments,
  isPublishingWeek,
  isPublishingAll,
  undoPublish,
  publishWeek,
  publishAll,
}: {
  justPublishedIds: number[] | null;
  hasUnpublishedAssignments: boolean;
  isPublishingWeek: boolean;
  isPublishingAll: boolean;
  undoPublish: () => void;
  publishWeek: () => void;
  publishAll: () => void;
}) {
  if (justPublishedIds) {
    return (
      <Button type="button" variant="ghost" size="lg" onClick={undoPublish}>
        Afturkalla birtingu
      </Button>
    );
  }

  if (hasUnpublishedAssignments && !justPublishedIds) {
    return (
      <>
        <Button type="button" variant="outline" size="lg" onClick={publishWeek} disabled={isPublishingWeek}>
          {isPublishingWeek && <Spinner className="size-4 animate-spin" />}
          Birta viku
        </Button>
        <Button type="button" size="lg" onClick={publishAll} disabled={isPublishingAll}>
          {isPublishingAll && <Spinner className="size-4 animate-spin" />}
          Birta allt
        </Button>
      </>
    );
  }

  return null;
}
