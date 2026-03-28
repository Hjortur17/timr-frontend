"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import Dialog from "@/components/Dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Spinner } from "@/components/ui/spinner";
import type { Employee, EmployeeForm } from "@/types/forms";
import { employeeFormSchema } from "@/types/forms";
import { authHeaders } from "@/utils/auth";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);

  const [formKey, setFormKey] = useState(0);

  const [openCreateDrawer, setOpenCreateDrawer] = useState(false);
  const [openEditDrawer, setOpenEditDrawer] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [sendingInvite, setSendingInvite] = useState<Set<number>>(new Set());

  useEffect(() => {
    axios
      .get("/api/manager/employees", { headers: authHeaders() })
      .then((res) => setEmployees(res.data.data ?? []))
      .catch(console.error);
  }, []);

  const onCreated = (employee: Employee) => {
    setEmployees((prev) => [...prev, employee]);
    setFormKey((k) => k + 1);
    setOpenCreateDrawer(false);
  };

  const onUpdated = (employee: Employee) => {
    setEmployees((prev) => prev.map((e) => (e.id === employee.id ? employee : e)));
    setFormKey((k) => k + 1);
    setSelectedEmployee(null);
    setOpenEditDrawer(false);
  };

  const onOpenEditDrawer = (employee: Employee) => {
    setSelectedEmployee(employee);
    setOpenEditDrawer(true);
  };

  const sendInvite = (employee: Employee) => {
    setSendingInvite((prev) => new Set(prev).add(employee.id));
    axios
      .post(`/api/manager/employees/${employee.id}/invite`, {}, { headers: authHeaders() })
      .then((res) => toast.success(res.data.message))
      .catch((err) => toast.error(err.response?.data?.message ?? "Villa við að senda hlekk."))
      .finally(() =>
        setSendingInvite((prev) => {
          const next = new Set(prev);
          next.delete(employee.id);
          return next;
        }),
      );
  };

  const deleteEmployee = (employee: Employee) => {
    axios
      .delete(`/api/manager/employees/${employee.id}`, {
        headers: authHeaders(),
      })
      .then((res) => {
        setEmployees((prev) => prev.filter((e) => e.id !== employee.id));
        setShowDeleteDialog(false);
        setSelectedEmployee(null);

        toast.success(res.data.message);
      })
      .catch((err) => {
        toast.error(err.response.data.message);
      });
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full flex items-end justify-between">
        <div>
          <h1 className="text-2xl/9 font-bold tracking-tight text-neutral-900">Starfsmenn</h1>
          <p className="mt-2 text-sm/6 text-neutral-500">Skoðaðu og skipulagðu starfsmenn.</p>
        </div>

        <Button type="button" size="lg" onClick={() => setOpenCreateDrawer(true)}>
          Bæta við starfsmanni
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
                      Netfang
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Sími
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Aðgangur
                    </th>
                    <th scope="col" className="py-3.5 pr-4 pl-3 sm:pr-3">
                      <span className="sr-only">Edit</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {employees.map((employee) => (
                    <tr key={employee.id} className="even:bg-foreground-light">
                      <td className="py-4 pr-3 pl-4 text-sm font-medium whitespace-nowrap text-gray-900 sm:pl-3">
                        {employee.name}
                      </td>
                      <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">{employee.email ?? "–"}</td>
                      <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">{employee.phone ?? "–"}</td>
                      <td className="px-3 py-4 text-sm whitespace-nowrap">
                        {employee.has_account ? (
                          <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-green-600/20 ring-inset">
                            Virkur
                          </span>
                        ) : (
                          <div className="space-x-1">
                            <span className="inline-flex items-center rounded-full bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-gray-500/10 ring-inset">
                              Óskráður
                            </span>

                            {employee.email && (
                              <button
                                type="button"
                                onClick={() => sendInvite(employee)}
                                disabled={sendingInvite.has(employee.id)}
                                className="relative cursor-pointer inline-flex items-center justify-center rounded-full bg-primary px-2 py-1 text-xs font-medium text-primary-foreground ring-1 ring-gray-500/10 ring-inset disabled:opacity-60 disabled:cursor-not-allowed"
                              >
                                {sendingInvite.has(employee.id) && (
                                  <span className="absolute inset-0 flex items-center justify-center">
                                    <Spinner className="size-3" />
                                  </span>
                                )}
                                <span className={sendingInvite.has(employee.id) ? "invisible" : ""}>Senda hlekk</span>
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="py-4 pr-4 pl-3 text-right text-sm font-medium whitespace-nowrap sm:pr-3 flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setShowDeleteDialog(true);
                            setSelectedEmployee(employee);
                          }}
                        >
                          <Trash2 className="size-5 text-neutral-500 hover:text-red-700 duration-200 transition-colors cursor-pointer" />
                        </button>
                        <Button type="button" variant="secondary" size="sm" onClick={() => onOpenEditDrawer(employee)}>
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
        <SheetContent side="right" className="sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Bæta við starfsmanni</SheetTitle>
          </SheetHeader>
          <div className="px-4">
            <CreateEmployeeForm key={formKey} onCreated={onCreated} />
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={openEditDrawer} onOpenChange={(value) => !value && setOpenEditDrawer(false)}>
        <SheetContent side="right" className="sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Breyta starfsmanni</SheetTitle>
          </SheetHeader>
          <div className="px-4">
            {selectedEmployee && <EditEmployeeForm key={formKey} employee={selectedEmployee} onUpdated={onUpdated} />}
          </div>
        </SheetContent>
      </Sheet>

      <Dialog
        open={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setSelectedEmployee(null);
        }}
        variant="danger"
        title="Eyða starfsmanni?"
        description="Ertu viss um að þú viljir eyða völdnum starfmanni? Ekki er hægt að endurheimta þessa aðgerð."
        onConfirm={() => selectedEmployee && deleteEmployee(selectedEmployee)}
        onCancel={() => {
          setShowDeleteDialog(false);
          setSelectedEmployee(null);
        }}
        buttonTextConfirm="Eyða"
        buttonTextCancel="Hætta við"
      />
    </div>
  );
}

function EditEmployeeForm({ employee, onUpdated }: { employee: Employee; onUpdated: (employee: Employee) => void }) {
  const { register, handleSubmit } = useForm<EmployeeForm>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: {
      name: employee.name,
      email: employee.email ?? "",
      phone: employee.phone ?? "",
    },
  });

  const onSubmit = async (data: EmployeeForm) => {
    const response = await axios.put(`/api/manager/employees/${employee.id}`, data, {
      headers: authHeaders(),
    });
    onUpdated(response.data.data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label htmlFor="edit-name" className="block text-base/7 font-semibold text-neutral-950">
          Nafn
        </label>
        <div className="mt-2">
          <Input
            id="edit-name"
            type="text"
            placeholder="Fullt nafn"
            required
            {...register("name", { required: true })}
          />
        </div>
      </div>
      <div>
        <label htmlFor="edit-email" className="block text-base/7 font-semibold text-neutral-950">
          Netfang (valfrjálst)
        </label>
        <div className="mt-2">
          <Input id="edit-email" type="email" placeholder="netfang@timr.is" {...register("email")} />
        </div>
      </div>
      <div>
        <label htmlFor="edit-phone" className="block text-base/7 font-semibold text-neutral-950">
          Sími (valfrjálst)
        </label>
        <div className="mt-2">
          <Input id="edit-phone" type="tel" placeholder="000 0000" {...register("phone")} />
        </div>
      </div>

      <Button type="submit" variant="secondary" size="lg" className="w-full">
        Uppfæra
      </Button>
    </form>
  );
}

function CreateEmployeeForm({ onCreated }: { onCreated: (employee: Employee) => void }) {
  const { register, handleSubmit } = useForm<EmployeeForm>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: { name: "", email: "", phone: "" },
  });

  const onSubmit = async (data: EmployeeForm) => {
    const response = await axios.post("/api/manager/employees", data, {
      headers: authHeaders(),
    });
    onCreated(response.data.data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label htmlFor="create-name" className="block text-base/7 font-semibold text-neutral-950">
          Nafn
        </label>
        <div className="mt-2">
          <Input
            id="create-name"
            type="text"
            placeholder="Fullt nafn"
            required
            {...register("name", { required: true })}
          />
        </div>
      </div>
      <div>
        <label htmlFor="create-email" className="block text-base/7 font-semibold text-neutral-950">
          Netfang (valfrjálst)
        </label>
        <div className="mt-2">
          <Input id="create-email" type="email" placeholder="netfang@timr.is" {...register("email")} />
        </div>
      </div>
      <div>
        <label htmlFor="create-phone" className="block text-base/7 font-semibold text-neutral-950">
          Sími (valfrjálst)
        </label>
        <div className="mt-2">
          <Input id="create-phone" type="tel" placeholder="000 0000" {...register("phone")} />
        </div>
      </div>

      <Button type="submit" variant="secondary" size="lg" className="w-full">
        Bæta við starfsmanni
      </Button>
    </form>
  );
}
