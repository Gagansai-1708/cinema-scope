
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function HelpPage() {
  return (
    <div className="border-b border-border">
        <div className="p-6">
            <h2 className="text-2xl font-bold">Help Center</h2>
            <p className="text-muted-foreground">Find answers to your questions and get help with CinemaScope.</p>
        </div>
        <div className="p-6 pt-0 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Visit our Help Center</CardTitle>
                    <CardDescription>
                        Find articles, guides, and answers to frequently asked questions.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button>Open Help Center</Button>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Contact Support</CardTitle>
                    <CardDescription>
                        Can&apos;t find what you&apos;re looking for? Contact our support team.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button>Contact Us</Button>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
