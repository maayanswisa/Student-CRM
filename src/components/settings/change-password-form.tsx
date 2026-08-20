"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { changePassword, type ChangePasswordState } from "@/actions/settings";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field";

const initialState: ChangePasswordState = {};

export function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState(changePassword, initialState);

  useEffect(() => {
    if (state.success) toast.success("הסיסמה עודכנה בהצלחה");
  }, [state.success]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">שינוי סיסמה</CardTitle>
        <CardDescription>בחרו סיסמה חדשה לחשבון שלכם.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} key={state.success ? "reset" : "form"}>
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
            <Button type="submit" disabled={pending}>
              {pending ? "מעדכן..." : "עדכון סיסמה"}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
