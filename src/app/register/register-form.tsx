"use client";

import Link from "next/link";
import { useActionState } from "react";
import { register, type RegisterState } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";

const initialState: RegisterState = {};

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(register, initialState);

  if (state.success) {
    return (
      <p className="text-center text-sm">
        נרשמת בהצלחה! בדקי את תיבת המייל שלך ואשרי את החשבון כדי להתחבר.
      </p>
    );
  }

  return (
    <form action={formAction}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="email">אימייל</FieldLabel>
          <Input id="email" name="email" type="email" autoComplete="username" required />
        </Field>
        <Field>
          <FieldLabel htmlFor="password">סיסמה</FieldLabel>
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
          {pending ? "נרשם/ת..." : "הרשמה"}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          כבר יש לך חשבון?{" "}
          <Link href="/login" className="text-primary hover:underline">
            התחברות
          </Link>
        </p>
      </FieldGroup>
    </form>
  );
}
