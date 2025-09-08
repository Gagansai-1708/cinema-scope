
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function NotificationSettingsPage() {
  return (
    <div className="border-b border-border">
        <div className="p-6">
            <h2 className="text-2xl font-bold">Notifications</h2>
            <p className="text-muted-foreground">Select the kinds of notifications you get about your activities, interests, and recommendations.</p>
        </div>
        <div className="p-6 pt-0 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Filters</CardTitle>
                    <CardDescription>
                        Choose the notifications you’d like to see — and those you don’t.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button>Manage Filters</Button>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Preferences</CardTitle>
                    <CardDescription>
                        Select your preferences by notification type.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button>Manage Preferences</Button>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
