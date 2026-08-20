"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { markLessonPaid } from "@/actions/lessons";
import { PAYMENT_METHOD_LABELS } from "@/lib/validation/student";
import { useSessionLabel } from "@/components/providers/session-label-provider";
import type { PaymentMethod } from "@/types/database";

const METHODS: PaymentMethod[] = ["bit", "paybox", "cash", "bank_transfer"];

export function MarkPaidDialog({
  lessonId,
  studentId,
  open,
  onOpenChange,
}: {
  lessonId: string;
  studentId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const sessionLabel = useSessionLabel();
  const [submitting, setSubmitting] = useState<PaymentMethod | null>(null);

  async function choose(method: PaymentMethod) {
    setSubmitting(method);
    try {
      await markLessonPaid(lessonId, studentId, method);
      toast.success(`${sessionLabel.singularDefinite} ${sessionLabel.verb("סומן", "סומנה")} כשולם`);
      onOpenChange(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "משהו השתבש");
    } finally {
      setSubmitting(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xs">
        <DialogHeader>
          <DialogTitle>איך שולם?</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-2">
          {METHODS.map((method) => (
            <Button
              key={method}
              variant="outline"
              disabled={submitting !== null}
              onClick={() => choose(method)}
            >
              {submitting === method ? "..." : PAYMENT_METHOD_LABELS[method]}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
