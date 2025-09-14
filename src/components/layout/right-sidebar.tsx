import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import Link from "next/link";
import { useRouter } from "next/navigation";

const trends = [
  { topic: "Sci-Fi", category: "Movies · Trending", posts: "125K posts" },
  { topic: "#CinemaScopeLaunch", category: "Trending in YourCountry", posts: "5.2K posts" },
  { topic: "DunePartTwo", category: "Movies · Trending", posts: "88K posts" },
  { topic: "OscarNoms", category: "Awards · Trending", posts: "210K posts" },
];

const suggestions = [
  { name: "A24", username: "A24", avatar: "https://pbs.twimg.com/profile_images/1473431189494210561/hQp0S3b5_400x400.jpg" },
  { name: "Letterboxd", username: "letterboxd", avatar: "https://pbs.twimg.com/profile_images/1640411261353566209/7j_I7y5H_400x400.jpg" },
  { name: "IMDb", username: "IMDb", avatar: "https://pbs.twimg.com/profile_images/1381613998398451713/dL55jXl1_400x400.jpg" }
];

const productionHouses = [
    { id: "1", name: "Universal Pictures", story: "Looking for a high-concept sci-fi thriller." },
    { id: "2", name: "Warner Bros.", story: "Seeking a character-driven historical drama." },
    { id: "3", name: "A24", story: "We want a script that is laugh-out-loud funny." },
];

export function RightSidebar() {
  const router = useRouter();
  
  const handleProductionClick = (id: string) => {
    router.push(`/submit/${id}`);
  };

  const handlePostOpportunityClick = () => {
    router.push('/post-opportunity');
  };

  return (
    <div className="space-y-4">
      <Card className="bg-secondary border-none">
          <CardHeader>
            <CardTitle className="text-lg">Cinema begins with a story.</CardTitle>
          </CardHeader>
          <CardContent>
            {productionHouses.map(ph => (
              <div key={ph.id} onClick={() => handleProductionClick(ph.id)} className="flex flex-col mb-4 hover:bg-accent/50 -mx-6 px-6 py-2 cursor-pointer transition-colors">
                <span className="font-semibold">{ph.name}</span>
                <span className="text-sm text-muted-foreground">{ph.story}</span>
              </div>
            ))}
            <Button variant="link" className="p-0 h-auto text-primary" asChild>
              <Link href="/search">Show more</Link>
            </Button>
          </CardContent>
      </Card>
      
      <Card className="bg-secondary border-none">
          <CardHeader>
            <CardTitle className="text-lg">Post Opportunities</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Are you a producer looking for the next big story? Post your requirements and find talented writers.</p>
            <Button className="w-full" onClick={handlePostOpportunityClick}>Post an Opportunity</Button>
          </CardContent>
      </Card>

      <Card className="bg-secondary border-none">
        <CardHeader>
          <CardTitle>What&apos;s Happening</CardTitle>
        </CardHeader>
        <CardContent>
          {trends.map(trend => (
            <div key={trend.topic} className="flex flex-col mb-4 hover:bg-accent/50 -mx-6 px-6 py-2 cursor-pointer transition-colors">
              <span className="text-xs text-muted-foreground">{trend.category}</span>
              <span className="font-semibold">{trend.topic}</span>
              <span className="text-xs text-muted-foreground">{trend.posts}</span>
            </div>
          ))}
          <Button variant="link" className="p-0 h-auto text-primary">Show more</Button>
        </CardContent>
      </Card>

      <Card className="bg-secondary border-none">
        <CardHeader>
          <CardTitle>Who to follow</CardTitle>
        </CardHeader>
        <CardContent>
          {suggestions.map(sugg => (
            <div key={sugg.username} className="flex items-center justify-between mb-4 hover:bg-accent/50 -mx-6 px-6 py-2 cursor-pointer transition-colors">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={sugg.avatar} />
                  <AvatarFallback>{sugg.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-sm hover:underline">{sugg.name}</p>
                  <p className="text-xs text-muted-foreground">@{sugg.username}</p>
                </div>
              </div>
              <Button size="sm" variant="outline" className="bg-foreground text-background hover:bg-foreground/90 rounded-full">Follow</Button>
            </div>
          ))}
           <Button variant="link" className="p-0 h-auto text-primary">Show more</Button>
        </CardContent>
      </Card>
      
      <div className="text-xs text-muted-foreground space-x-2 flex flex-wrap px-4">
        <Link href="#" className="hover:underline">Terms of Service</Link>
        <Link href="#" className="hover:underline">Privacy Policy</Link>
        <Link href="#" className="hover:underline">Cookie Policy</Link>
        <Link href="#" className="hover:underline">Accessibility</Link>
        <Link href="#" className="hover:underline">More...</Link>
        <span>© 2024 CinemaScope, Inc.</span>
      </div>

    </div>
  )
}
