"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login, type LoginState } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <form action={formAction}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="email">אימייל</FieldLabel>
          <Input id="email" name="email" type="email" autoComplete="username" required />
        </Field>
        <Field>
          <div className="flex items-center justify-between">
            <FieldLabel htmlFor="password">סיסמה</FieldLabel>
            <Link
              href="/forgot-password"
              className="text-sm text-primary hover:underline"
            >
              שכחת סיסמה?
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </Field>
        {state.error && <FieldError>{state.error}</FieldError>}
        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "מתחבר..." : "התחברות"}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          אין לך חשבון?{" "}
          <Link href="/register" className="text-primary hover:underline">
            הרשמה
          </Link>
        </p>
      </FieldGroup>
    </form>
  );
}
