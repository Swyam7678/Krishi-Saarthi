import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Loader2, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { useState, useEffect, useMemo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MarketItem {
  id?: string;
  name: string;
  min: number;
  max: number;
  avg: number;
  current: number;
  history: { date: string; price: number }[];
}

interface MarketCardProps {
  data: MarketItem[] | null;
  location?: string;
  selectedCrops?: string[];
  onCropsChange?: (crops: string[]) => void;
}

export function MarketCard({ data, location, selectedCrops, onCropsChange }: MarketCardProps) {
  const { t } = useLanguage();
  const [selectedCrop, setSelectedCrop] = useState<string>("");

  const safeData = Array.isArray(data) ? data : [];

  // Filter data based on selected crops
  const filteredData = useMemo(() => {
    return selectedCrops && selectedCrops.length > 0 
      ? safeData.filter(item => {
          return selectedCrops.includes(item.id || "") || selectedCrops.includes(item.name);
        })
      : safeData;
  }, [safeData, selectedCrops]);

  // Set default selected crop for chart
  useEffect(() => {
    if (filteredData.length > 0) {
      const currentExists = filteredData.find(c => c.name === selectedCrop || c.id === selectedCrop);
      if (!selectedCrop || !currentExists) {
        setSelectedCrop(filteredData[0].id || filteredData[0].name);
      }
    }
  }, [filteredData, selectedCrop]);

  const selectedCropData = useMemo(() => {
    if (!safeData || !selectedCrop) return null;
    return safeData.find(c => c.id === selectedCrop || c.name === selectedCrop);
  }, [safeData, selectedCrop]);

  if (!data) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>{t('market_title')}</CardTitle>
          <CardDescription>{t('loading') || "Loading..."}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px]">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>{t('market_title')}</CardTitle>
        <CardDescription>
          {location ? `Prices in ${location}` : (t('market_desc' as any) || "Live market rates")}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <Tabs defaultValue="rates" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="rates">{t('rates')}</TabsTrigger>
            <TabsTrigger value="trends">{t('trends')}</TabsTrigger>
          </TabsList>

          <TabsContent value="rates" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {selectedCrops && selectedCrops.length 
                  ? `${selectedCrops.length} ${t('crops_selected')}`
                  : t('select_crops_desc')
                }
              </div>
              {selectedCrops && selectedCrops.length > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onCropsChange?.([])}
                  className="h-8 px-2 text-xs text-muted-foreground hover:text-destructive"
                >
                  {t('remove_all')}
                </Button>
              )}
            </div>

            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-4">
                {filteredData.map((item: any) => (
                  <div key={item.id || item.name} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{item.name}</span>
                        <Checkbox 
                          checked={selectedCrops?.includes(item.id || item.name) || false}
                          onCheckedChange={(checked: boolean | string) => {
                            if (onCropsChange) {
                              const id = item.id || item.name;
                              const newCrops = checked === true
                                ? [...(selectedCrops || []), id]
                                : (selectedCrops || []).filter(c => c !== id);
                              onCropsChange(newCrops);
                            }
                          }}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Avg: ₹{item.avg}/q
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">₹{item.current}</div>
                      <div className={`text-xs flex items-center justify-end gap-1 ${
                        item.current > item.avg ? 'text-green-600' : 
                        item.current < item.avg ? 'text-red-600' : 'text-muted-foreground'
                      }`}>
                        {item.current > item.avg ? <TrendingUp className="h-3 w-3" /> : 
                         item.current < item.avg ? <TrendingDown className="h-3 w-3" /> : 
                         <Minus className="h-3 w-3" />}
                        {Math.abs(((item.current - item.avg) / item.avg) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
                {filteredData.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    {t('no_crops')}
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="trends">
            <div className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <Label>{t('select_crop_view')}</Label>
                <Select
                  value={selectedCrop}
                  onValueChange={setSelectedCrop}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select crop" />
                  </SelectTrigger>
                  <SelectContent>
                    {data.map((item: any) => (
                      <SelectItem key={item.id || item.name} value={item.id || item.name}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedCropData ? (
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={selectedCropData.history}
                      margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis 
                        dataKey="date" 
                        className="text-xs text-muted-foreground" 
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis 
                        className="text-xs text-muted-foreground" 
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `₹${value}`}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="rounded-lg border bg-background p-2 shadow-sm">
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="flex flex-col">
                                    <span className="text-[0.70rem] uppercase text-muted-foreground">
                                      Price
                                    </span>
                                    <span className="font-bold text-muted-foreground">
                                      ₹{payload[0].value}
                                    </span>
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-[0.70rem] uppercase text-muted-foreground">
                                      Date
                                    </span>
                                    <span className="font-bold text-muted-foreground">
                                      {payload[0].payload.date}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="price"
                        stroke="hsl(var(--primary))"
                        fillOpacity={1}
                        fill="url(#colorPrice)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground border rounded-lg border-dashed">
                  {t('select_crop_view')}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}