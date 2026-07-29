"use client";

import { useActionState } from "react";
import { resetPassword, type ResetPasswordState } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";

const initialState: ResetPasswordState = {};

export function ResetPasswordForm() {
  const [state, formAction, pending] = useActionState(
    resetPassword,
    initialState
  );

  return (
    <form action={formAction}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="password">סיסמה חדשה</FieldLabel>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="confirmPassword">אימות סיסמה</FieldLabel>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
          />
        </Field>
        {state.error && <FieldError>{state.error}</FieldError>}
        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "מעדכן..." : "עדכון סיסמה"}
        </Button>
      </FieldGroup>
    </form>
  );
}
