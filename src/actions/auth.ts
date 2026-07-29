"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export interface LoginState {
  error?: string;
}

export async function login(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "יש להזין אימייל וסיסמה" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    if (error.code === "invalid_credentials") {
      return { error: "פרטי התחברות שגויים" };
    }
    if (error.code === "email_not_confirmed") {
      return { error: "המייל טרם אושר - יש לאשר את המשתמש בלוח הבקרה של Supabase" };
    }
    return { error: `שגיאה: ${error.message}` };
  }

  redirect("/");
}

export interface RegisterState {
  error?: string;
  success?: boolean;
}

export async function register(
  _prevState: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!email || !password) {
    return { error: "יש להזין אימייל וסיסמה" };
  }
  if (password.length < 6) {
    return { error: "הסיסמה חייבת להכיל לפחות 6 תווים" };
  }
  if (password !== confirmPassword) {
    return { error: "הסיסמאות אינן תואמות" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    if (error.code === "user_already_exists") {
      return { error: "כבר קיים חשבון עם המייל הזה" };
    }
    return { error: `שגיאה: ${error.message}` };
  }

  if (data.session) {
    redirect("/");
  }

  return { success: true };
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export interface ForgotPasswordState {
  error?: string;
  success?: boolean;
}

export async function forgotPassword(
  _prevState: ForgotPasswordState,
  formData: FormData
): Promise<ForgotPasswordState> {
  const email = String(formData.get("email") ?? "");

  if (!email) {
    return { error: "יש להזין אימייל" };
  }

  const headersList = await headers();
  const origin =
    headersList.get("origin") ??
    `${headersList.get("x-forwarded-proto") ?? "https"}://${headersList.get("host")}`;

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/reset-password`,
  });

  if (error) {
    return { error: `שגיאה: ${error.message}` };
  }

  return { success: true };
}

export interface ResetPasswordState {
  error?: string;
}

export async function resetPassword(
  _prevState: ResetPasswordState,
  formData: FormData
): Promise<ResetPasswordState> {
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!password) {
    return { error: "יש להזין סיסמה חדשה" };
  }
  if (password.length < 6) {
    return { error: "הסיסמה חייבת להכיל לפחות 6 תווים" };
  }
  if (password !== confirmPassword) {
    return { error: "הסיסמאות אינן תואמות" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { error: `שגיאה: ${error.message}` };
  }

  redirect("/");
}
