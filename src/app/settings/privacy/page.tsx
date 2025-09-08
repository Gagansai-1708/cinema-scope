
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function PrivacySettingsPage() {
  return (
    <div className="border-b border-border">
        <div className="p-6">
            <h2 className="text-2xl font-bold">Privacy and safety</h2>
            <p className="text-muted-foreground">Manage what information you see and share on CinemaScope.</p>
        </div>
        <div className="p-6 pt-0 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Audience and tagging</CardTitle>
                    <CardDescription>
                        Manage what information you allow other people on CinemaScope to see.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button>Manage Audience</Button>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Content you see</CardTitle>
                    <CardDescription>
                        Decide what you see on CinemaScope based on your preferences.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button>Manage Content</Button>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
