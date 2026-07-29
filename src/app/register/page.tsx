import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AuthLayout } from "@/components/auth/auth-layout";
import { RegisterForm } from "./register-form";

export default function RegisterPage() {
  return (
    <AuthLayout>
      <div className="auth-card w-full">
        <Card className="w-full border-none shadow-2xl">
          <CardHeader>
            <CardTitle className="text-xl">הרשמה</CardTitle>
            <CardDescription>
              הצטרפו עכשיו והתחילו לנהל את התלמידים שלכם בקלות
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RegisterForm />
          </CardContent>
        </Card>
      </div>
    </AuthLayout>
  );
}
