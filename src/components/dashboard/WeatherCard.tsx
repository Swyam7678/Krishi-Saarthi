import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CloudRain, Droplets, Thermometer, Wind } from "lucide-react";

interface WeatherData {
  temp: number;
  humidity: number;
  windSpeed: number;
  rainChance: number;
  condition: string;
  location: string;
}

export function WeatherCard({ data }: { data: WeatherData | null }) {
  if (!data) return (
    <Card className="h-full animate-pulse">
      <CardHeader><CardTitle>मौसम का हाल</CardTitle></CardHeader>
      <CardContent className="h-32 bg-muted/20 rounded-md" />
    </Card>
  );

  return (
    <Card className="h-full border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
      <CardHeader className="pb-2">
        <CardTitle className="flex justify-between items-center text-lg">
          <span>मौसम का हाल</span>
          <span className="text-sm font-normal text-muted-foreground">{data.location}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
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
        
        <div className="grid grid-cols-3 gap-4">
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
      </CardContent>
    </Card>
  );
}