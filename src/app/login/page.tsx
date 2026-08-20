import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AuthLayout } from "@/components/auth/auth-layout";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <AuthLayout>
      <div className="auth-card w-full">
        <Card className="w-full border-none shadow-2xl">
          <CardHeader>
            <CardTitle className="text-xl">כניסה למערכת</CardTitle>
            <CardDescription>
              שמחים לראות אתכם שוב! התחברו כדי להמשיך לנהל את הלקוחות,
              הפגישות והתשלומים שלכם
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>
      </div>
    </AuthLayout>
  );
}
