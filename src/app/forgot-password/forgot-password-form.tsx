"use client";

import Link from "next/link";
import { useActionState } from "react";
import { forgotPassword, type ForgotPasswordState } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";

const initialState: ForgotPasswordState = {};

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(
    forgotPassword,
    initialState
  );

  if (state.success) {
    return (
      <p className="text-center text-sm">
        אם קיים חשבון עם המייל הזה, נשלח אליו קישור לאיפוס הסיסמה. בדקו גם
        בתיקיית הספאם.
      </p>
    );
  }

  return (
    <form action={formAction}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="email">אימייל</FieldLabel>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            required
          />
        </Field>
        {state.error && <FieldError>{state.error}</FieldError>}
        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "שולח..." : "שליחת קישור לאיפוס"}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          נזכרתם בסיסמה?{" "}
          <Link href="/login" className="text-primary hover:underline">
            התחברות
          </Link>
        </p>
      </FieldGroup>
    </form>
  );
}
