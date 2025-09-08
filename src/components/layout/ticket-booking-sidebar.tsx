import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { MapPin } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "../ui/label";

type TicketBookingSidebarProps = {
    selectedLocation: string;
    onLocationChange: (location: string) => void;
};

const locations = ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia"];
const formats = ["2D", "3D", "IMAX", "4DX", "Dolby Atmos"];
const genres = ["Action", "Comedy", "Drama", "Horror", "Sci-Fi", "Thriller", "Romance"];

export function TicketBookingSidebar({ selectedLocation, onLocationChange }: TicketBookingSidebarProps) {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                <Select value={selectedLocation} onValueChange={onLocationChange}>
                    <SelectTrigger className="w-full bg-secondary border-none h-11 focus:ring-primary">
                        <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                        {locations.map(loc => (
                            <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <Card className="bg-secondary border-none">
                <CardHeader>
                    <CardTitle className="text-base">Filters</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <h3 className="font-semibold mb-2 text-sm">Format</h3>
                        <RadioGroup defaultValue="2D">
                           {formats.map(format => (
                             <div key={format} className="flex items-center space-x-2">
                                <RadioGroupItem value={format} id={`format-${format}`} />
                                <Label htmlFor={`format-${format}`}>{format}</Label>
                             </div>
                           ))}
                        </RadioGroup>
                    </div>
                     <div>
                        <h3 className="font-semibold mb-2 text-sm">Genre</h3>
                        <RadioGroup defaultValue="Action">
                           {genres.map(genre => (
                             <div key={genre} className="flex items-center space-x-2">
                                <RadioGroupItem value={genre} id={`genre-${genre}`} />
                                <Label htmlFor={`genre-${genre}`}>{genre}</Label>
                             </div>
                           ))}
                        </RadioGroup>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}