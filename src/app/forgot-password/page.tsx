import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AuthLayout } from "@/components/auth/auth-layout";
import { ForgotPasswordForm } from "./forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <AuthLayout>
      <div className="auth-card w-full">
        <Card className="w-full border-none shadow-2xl">
          <CardHeader>
            <CardTitle className="text-xl">שחזור סיסמה</CardTitle>
            <CardDescription>
              הזינו את כתובת האימייל שלכם ונשלח אליכם קישור לאיפוס הסיסמה
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ForgotPasswordForm />
          </CardContent>
        </Card>
      </div>
    </AuthLayout>
  );
}
