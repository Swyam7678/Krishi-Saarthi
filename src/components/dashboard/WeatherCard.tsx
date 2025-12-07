import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cloud, CloudRain, Droplets, Sun, Thermometer, Wind, CloudFog, CloudLightning, Snowflake, MapPin, CalendarDays, History, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useLanguage } from "@/lib/i18n";

interface ForecastDay {
  day: string;
  shortDate: string;
  temp: number;
  maxTemp: number;
  minTemp: number;
  rain: number;
  humidity?: number;
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
  history?: ForecastDay[];
  alerts?: string[];
}

interface WeatherCardProps {
  data: WeatherData | null;
  onLocationChange?: (location: string) => void;
}

export function WeatherCard({ data, onLocationChange }: WeatherCardProps) {
  const [newLocation, setNewLocation] = useState("");
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const { t } = useLanguage();

  const handleUpdate = () => {
    if (!newLocation.trim()) {
      setError(t('enter_city'));
      return;
    }

    if (onLocationChange && newLocation.trim()) {
      onLocationChange(newLocation.trim());
      setOpen(false);
      setNewLocation("");
      setError("");
    }
  };

  if (!data) return (
    <Card className="h-full animate-pulse">
      <CardHeader><CardTitle>{t('weather_title')}</CardTitle></CardHeader>
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
          <div className="flex items-center gap-2">
            <Sun className="h-5 w-5 text-blue-600" />
            <span>{t('weather_title')}</span>
          </div>
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
                    <DialogTitle>{t('location_change')}</DialogTitle>
                    <DialogDescription>
                      {t('enter_city')}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Input
                        id="location"
                        placeholder={t('location_placeholder')}
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
                    <Button onClick={handleUpdate}>{t('update_btn')}</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col min-h-0">
        {data.alerts && data.alerts.length > 0 && (
          <div className="mb-4 space-y-2">
            {data.alerts.map((alert, i) => (
              <Alert key={i} variant="destructive" className="py-2 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                <AlertTitle className="text-red-800 dark:text-red-300 text-sm font-bold">{t('alert')}</AlertTitle>
                <AlertDescription className="text-red-700 dark:text-red-300 text-xs">
                  {alert}
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        <Tabs defaultValue="current" className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="current" className="gap-2">
              <CalendarDays className="h-4 w-4" />
              {t('forecast')}
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <History className="h-4 w-4" />
              {t('history')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="current" className="flex-1 flex flex-col min-h-0 mt-0 space-y-4">
            <div className="flex items-center justify-between">
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
                <span className="text-xs text-muted-foreground">{t('humidity')}</span>
              </div>
              <div className="flex flex-col items-center p-2 bg-muted/30 rounded-lg">
                <CloudRain className="h-4 w-4 mb-1 text-blue-500" />
                <span className="text-sm font-semibold">{data.rainChance}%</span>
                <span className="text-xs text-muted-foreground">{t('rain')}</span>
              </div>
              <div className="flex flex-col items-center p-2 bg-muted/30 rounded-lg">
                <Wind className="h-4 w-4 mb-1 text-blue-500" />
                <span className="text-sm font-semibold">{data.windSpeed} km/h</span>
                <span className="text-xs text-muted-foreground">{t('wind')}</span>
              </div>
            </div>

            {data.forecast && (
              <div className="flex-1 flex flex-col min-h-0">
                <h4 className="text-sm font-semibold text-muted-foreground mb-2">{t('next_7_days')}</h4>
                <div className="space-y-2 overflow-y-auto pr-2 custom-scrollbar flex-1">
                  {data.forecast.map((day, index) => (
                    <div key={index} className="flex items-center justify-between text-sm p-2 rounded-md hover:bg-muted/50 transition-colors">
                      <span className="w-24 font-medium">{day.day}</span>
                      <div className="flex items-center gap-2">
                        {getWeatherIcon(day.condition)}
                        <span className="text-muted-foreground">{day.condition}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{day.maxTemp}°</span>
                        <span className="text-muted-foreground text-xs">{day.minTemp}°</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="flex-1 flex flex-col min-h-0 mt-0">
            <div className="flex-1 w-full min-h-[350px]">
              {data.history && data.history.length > 0 ? (
                <div className="h-full flex flex-col gap-2">
                  <div className="h-1/3 w-full">
                    <p className="text-xs text-muted-foreground mb-1 text-center">{t('temp_history')} (°C)</p>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={data.history} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                        <XAxis dataKey="shortDate" fontSize={10} tickLine={false} axisLine={false} interval={6} />
                        <YAxis fontSize={10} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                        <Tooltip 
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                          formatter={(value: number) => [`${value}°C`, 'Temp']}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="temp" 
                          stroke="#f97316" 
                          fillOpacity={1} 
                          fill="url(#colorTemp)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="h-1/3 w-full">
                    <p className="text-xs text-muted-foreground mb-1 text-center">{t('rain_history')} (mm)</p>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.history} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} vertical={false} />
                        <XAxis dataKey="shortDate" fontSize={10} tickLine={false} axisLine={false} interval={6} />
                        <YAxis fontSize={10} tickLine={false} axisLine={false} />
                        <Tooltip 
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                          formatter={(value: number) => [`${value} mm`, 'Rain']}
                          cursor={{fill: 'transparent'}}
                        />
                        <Bar dataKey="rain" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="h-1/3 w-full">
                    <p className="text-xs text-muted-foreground mb-1 text-center">{t('humidity_history')} (%)</p>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={data.history} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorHumidity" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                        <XAxis dataKey="shortDate" fontSize={10} tickLine={false} axisLine={false} interval={6} />
                        <YAxis fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} />
                        <Tooltip 
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                          formatter={(value: number) => [`${value}%`, 'Humidity']}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="humidity" 
                          stroke="#06b6d4" 
                          fillOpacity={1} 
                          fill="url(#colorHumidity)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  <p>{t('no_history')}</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}