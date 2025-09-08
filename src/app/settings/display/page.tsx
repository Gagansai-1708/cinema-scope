
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function DisplaySettingsPage() {
  return (
    <div className="border-b border-border">
        <div className="p-6">
            <h2 className="text-2xl font-bold">Accessibility, display, and languages</h2>
            <p className="text-muted-foreground">Manage how CinemaScope content is displayed to you.</p>
        </div>
        <div className="p-6 pt-0 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Display</CardTitle>
                    <CardDescription>
                        Manage your font size, color, and background.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button>Manage Display</Button>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Language</CardTitle>
                    <CardDescription>
                        Select your preferred language for headlines, buttons, and other text from CinemaScope.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button>Manage Language</Button>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
