"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Zap, Search } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { logCompletedLesson } from "@/actions/lessons";
import { PAYMENT_METHOD_LABELS } from "@/lib/validation/student";
import { useEntityLabel } from "@/components/providers/entity-label-provider";
import { useSessionLabel } from "@/components/providers/session-label-provider";
import type { PaymentMethod, Student } from "@/types/database";

const METHODS: PaymentMethod[] = ["bit", "paybox", "cash", "bank_transfer"];

export function QuickActionFab({ students }: { students: Student[] }) {
  const router = useRouter();
  const entityLabel = useEntityLabel();
  const sessionLabel = useSessionLabel();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Student | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const filtered = students.filter((s) =>
    s.student_name.toLowerCase().includes(search.toLowerCase())
  );

  function reset() {
    setSelected(null);
    setSearch("");
  }

  async function log(paid: boolean, paymentMethod?: PaymentMethod) {
    if (!selected) return;
    setSubmitting(true);
    try {
      await logCompletedLesson({
        studentId: selected.id,
        price: selected.hourly_rate,
        paid,
        paymentMethod,
      });
      toast.success(`${sessionLabel.singular} עם ${selected.student_name} ${sessionLabel.verb("נרשם", "נרשמה")}`);
      setOpen(false);
      reset();
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "משהו השתבש");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Button
        size="icon-lg"
        className="fixed bottom-20 start-4 z-40 size-14 rounded-full shadow-lg md:hidden"
        onClick={() => setOpen(true)}
        aria-label={`רישום ${sessionLabel.singular} מהיר`}
      >
        <Zap className="size-6" />
      </Button>

      <Drawer
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) reset();
        }}
      >
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>
              {selected
                ? `${sessionLabel.singular} עם ${selected.student_name}`
                : `רישום ${sessionLabel.singular} מהיר`}
            </DrawerTitle>
          </DrawerHeader>

          <div className="flex flex-col gap-3 px-4 pb-6">
            {!selected ? (
              <>
                <div className="relative">
                  <Search className="pointer-events-none absolute right-2.5 top-2.5 size-4 text-muted-foreground" />
                  <Input
                    autoFocus
                    placeholder={`חיפוש ${entityLabel.singular}...`}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pe-8"
                  />
                </div>
                <div className="flex max-h-80 flex-col gap-1 overflow-y-auto">
                  {filtered.map((student) => (
                    <button
                      key={student.id}
                      type="button"
                      onClick={() => setSelected(student)}
                      className="rounded-lg border px-3 py-2.5 text-start text-sm hover:bg-muted"
                    >
                      {student.student_name}
                    </button>
                  ))}
                  {filtered.length === 0 && (
                    <p className="p-3 text-center text-sm text-muted-foreground">
                      לא נמצאו {entityLabel.plural}
                    </p>
                  )}
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  מחיר: {selected.hourly_rate.toFixed(0)} ₪ · {sessionLabel.singularDefinite}{" "}
                  {sessionLabel.verb("יירשם", "תירשם")} כ{sessionLabel.verb("הושלם", "הושלמה")} כעת
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {METHODS.map((method) => (
                    <Button
                      key={method}
                      variant="outline"
                      disabled={submitting}
                      onClick={() => log(true, method)}
                    >
                      {PAYMENT_METHOD_LABELS[method]}
                    </Button>
                  ))}
                </div>
                <Button variant="secondary" disabled={submitting} onClick={() => log(false)}>
                  טרם שולם
                </Button>
                <Button variant="ghost" disabled={submitting} onClick={reset}>
                  בחירת {entityLabel.singular} אחר/ת
                </Button>
              </>
            )}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
