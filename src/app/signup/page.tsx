import Link from "next/link";
import { SignUpForm } from "@/components/auth/signup-form";
import { Logo } from "@/components/logo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <Logo className="justify-center mb-2" />
          <CardTitle>Create an Account</CardTitle>
          <CardDescription>Join CinemaScope to explore the world of cinema.</CardDescription>
        </CardHeader>
        <CardContent>
          <SignUpForm />
          <p className="mt-4 px-8 text-center text-sm text-muted-foreground">
            By creating an account, you agree to our Terms of Service and Privacy Policy.
          </p>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="underline hover:text-primary">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
