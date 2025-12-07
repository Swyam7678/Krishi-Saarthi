import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cloud, CloudRain, Droplets, Sun, Thermometer, Wind, CloudFog, CloudLightning, Snowflake, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";

interface ForecastDay {
  day: string;
  temp: number;
  condition: string;
}

interface WeatherData {
  temp: number;
  humidity: number;
  windSpeed: number;
  rainChance: number;
  condition: string;
  location: string;
  forecast?: ForecastDay[];
}

interface WeatherCardProps {
  data: WeatherData | null;
  onLocationChange?: (location: string) => void;
}

export function WeatherCard({ data, onLocationChange }: WeatherCardProps) {
  const [newLocation, setNewLocation] = useState("");
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");

  const handleUpdate = () => {
    if (!newLocation.trim()) {
      setError("कृपया शहर का नाम दर्ज करें");
      return;
    }

    if (onLocationChange && newLocation.trim()) {
      onLocationChange(newLocation);
      setOpen(false);
      setNewLocation("");
      setError("");
    }
  };

  if (!data) return (
    <Card className="h-full animate-pulse">
      <CardHeader><CardTitle>मौसम का हाल</CardTitle></CardHeader>
      <CardContent className="h-32 bg-muted/20 rounded-md" />
    </Card>
  );

  const getWeatherIcon = (condition: string) => {
    const c = condition.toLowerCase();
    if (c.includes("बारिश") || c.includes("rain")) return <CloudRain className="h-4 w-4 text-blue-500" />;
    if (c.includes("बादल") || c.includes("cloud")) return <Cloud className="h-4 w-4 text-gray-500" />;
    if (c.includes("कोहरा") || c.includes("fog")) return <CloudFog className="h-4 w-4 text-gray-400" />;
    if (c.includes("तूफान") || c.includes("storm")) return <CloudLightning className="h-4 w-4 text-yellow-600" />;
    if (c.includes("बर्फ") || c.includes("snow")) return <Snowflake className="h-4 w-4 text-cyan-400" />;
    return <Sun className="h-4 w-4 text-orange-500" />;
  };

  return (
    <Card className="h-full flex flex-col border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
      <CardHeader className="pb-2">
        <CardTitle className="flex justify-between items-center text-lg">
          <span>मौसम का हाल</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-normal text-muted-foreground truncate max-w-[120px] sm:max-w-[200px]" title={data.location}>
              {data.location}
            </span>
            {onLocationChange && (
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-muted">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>स्थान बदलें</DialogTitle>
                    <DialogDescription>
                      अपने क्षेत्र का मौसम देखने के लिए शहर का नाम दर्ज करें।
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Input
                        id="location"
                        placeholder="शहर का नाम (उदा. दिल्ली)"
                        className="col-span-4"
                        value={newLocation}
                        onChange={(e) => {
                          setNewLocation(e.target.value);
                          if (error) setError("");
                        }}
                        onKeyDown={(e) => e.key === 'Enter' && handleUpdate()}
                      />
                    </div>
                    {error && <p className="text-sm text-red-500">{error}</p>}
                  </div>
                  <DialogFooter>
                    <Button onClick={handleUpdate}>अपडेट करें</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <Thermometer className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="text-3xl font-bold">{data.temp}°C</div>
              <div className="text-sm text-muted-foreground">{data.condition}</div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="flex flex-col items-center p-2 bg-muted/30 rounded-lg">
            <Droplets className="h-4 w-4 mb-1 text-blue-500" />
            <span className="text-sm font-semibold">{data.humidity}%</span>
            <span className="text-xs text-muted-foreground">नमी</span>
          </div>
          <div className="flex flex-col items-center p-2 bg-muted/30 rounded-lg">
            <CloudRain className="h-4 w-4 mb-1 text-blue-500" />
            <span className="text-sm font-semibold">{data.rainChance}%</span>
            <span className="text-xs text-muted-foreground">बारिश</span>
          </div>
          <div className="flex flex-col items-center p-2 bg-muted/30 rounded-lg">
            <Wind className="h-4 w-4 mb-1 text-blue-500" />
            <span className="text-sm font-semibold">{data.windSpeed} km/h</span>
            <span className="text-xs text-muted-foreground">हवा</span>
          </div>
        </div>

        {data.forecast && (
          <div className="flex-1 flex flex-col min-h-0">
            <h4 className="text-sm font-semibold text-muted-foreground mb-2">आगामी 7 दिन</h4>
            <div className="space-y-2 overflow-y-auto pr-2 custom-scrollbar flex-1">
              {data.forecast.map((day, index) => (
                <div key={index} className="flex items-center justify-between text-sm p-2 rounded-md hover:bg-muted/50 transition-colors">
                  <span className="w-24 font-medium">{day.day}</span>
                  <div className="flex items-center gap-2">
                    {getWeatherIcon(day.condition)}
                    <span className="text-muted-foreground">{day.condition}</span>
                  </div>
                  <span className="font-bold">{day.temp}°C</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}