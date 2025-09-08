
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AccountSettingsPage() {
  return (
    <div className="border-b border-border">
        <div className="p-6">
            <h2 className="text-2xl font-bold">Your Account</h2>
            <p className="text-muted-foreground">Manage your account settings and preferences.</p>
        </div>
        <div className="p-6 pt-0 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Account Information</CardTitle>
                    <CardDescription>
                        See your account information like your phone number and email address.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button>View Information</Button>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Change Your Password</CardTitle>
                    <CardDescription>
                        Change your password at any time.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button>Change Password</Button>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Deactivate Your Account</CardTitle>
                    <CardDescription>
                        Find out how you can deactivate your account.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button variant="destructive">Deactivate</Button>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
