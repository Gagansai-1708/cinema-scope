
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SecuritySettingsPage() {
  return (
    <div className="border-b border-border">
        <div className="p-6">
            <h2 className="text-2xl font-bold">Security</h2>
            <p className="text-muted-foreground">Manage your account's security.</p>
        </div>
        <div className="p-6 pt-0 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Two-Factor Authentication</CardTitle>
                    <CardDescription>
                        Help protect your account from unauthorized access by requiring a second factor of authentication.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button>Manage 2FA</Button>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Apps and sessions</CardTitle>
                    <CardDescription>
                        See the apps connected to your account and manage your active sessions.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button>Manage Sessions</Button>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
