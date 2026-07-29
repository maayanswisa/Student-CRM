import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AuthLayout } from "@/components/auth/auth-layout";
import { ResetPasswordForm } from "./reset-password-form";

export default function ResetPasswordPage() {
  return (
    <AuthLayout>
      <div className="auth-card w-full">
        <Card className="w-full border-none shadow-2xl">
          <CardHeader>
            <CardTitle className="text-xl">איפוס סיסמה</CardTitle>
            <CardDescription>בחרו סיסמה חדשה לחשבון שלכם</CardDescription>
          </CardHeader>
          <CardContent>
            <ResetPasswordForm />
          </CardContent>
        </Card>
      </div>
    </AuthLayout>
  );
}
