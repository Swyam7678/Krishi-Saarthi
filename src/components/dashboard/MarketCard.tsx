import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, LineChart as LineChartIcon, Settings, Check } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLanguage } from "@/lib/i18n";

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

export function MarketCard({ data, location, selectedCrops = [], onCropsChange }: MarketCardProps) {
  const [selectedCrop, setSelectedCrop] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [tempSelectedCrops, setTempSelectedCrops] = useState<string[]>(selectedCrops);
  const { t } = useLanguage();

  if (!data) return (
    <Card className="h-full animate-pulse">
      <CardHeader><CardTitle>{t('market_title')}</CardTitle></CardHeader>
      <CardContent className="h-32 bg-muted rounded-md" />
    </Card>
  );

  const safeData = Array.isArray(data) ? data : [];

  // Filter data based on selected crops
  // Match by ID if available, otherwise by name
  const filteredData = selectedCrops.length > 0 
    ? safeData.filter(item => {
        // If selectedCrops contains IDs (lowercase), match ID
        // If selectedCrops contains Names (Capitalized/Hindi), match Name
        // We check both to be safe during migration
        return selectedCrops.includes(item.name) || (item.id && selectedCrops.includes(item.id));
      })
    : safeData;

  // Set default selected crop for chart if not set or not in filtered list
  if ((!selectedCrop || (filteredData.length > 0 && !filteredData.find(c => c.name === selectedCrop))) && filteredData.length > 0) {
    setSelectedCrop(filteredData[0].name);
  }

  const currentCropData = safeData.find(c => c.name === selectedCrop);

  const toggleCropSelection = (crop: MarketItem) => {
    const identifier = crop.id || crop.name; // Prefer ID for new selections
    setTempSelectedCrops(prev => {
      // Check if we have the ID or Name in the list
      const hasId = crop.id && prev.includes(crop.id);
      const hasName = prev.includes(crop.name);
      
      if (hasId || hasName) {
        return prev.filter(c => c !== crop.id && c !== crop.name);
      } else {
        return [...prev, identifier];
      }
    });
  };

  const handleSaveCrops = () => {
    if (onCropsChange) {
      onCropsChange(tempSelectedCrops);
    }
    setOpen(false);
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setTempSelectedCrops(selectedCrops);
    }
    setOpen(isOpen);
  };

  return (
    <Card className="h-full flex flex-col border-l-4 border-l-orange-500 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-orange-600" />
            <span>{t('market_title')} {location ? <span className="text-sm font-normal text-muted-foreground">({location})</span> : null}</span>
          </div>
          {onCropsChange && (
            <Dialog open={open} onOpenChange={handleOpenChange}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-muted">
                  <Settings className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>{t('select_crops')}</DialogTitle>
                  <DialogDescription>
                    {t('select_crops_desc')}
                  </DialogDescription>
                </DialogHeader>
                <ScrollArea className="h-[300px] pr-4">
                  <div className="grid grid-cols-1 gap-2">
                    {safeData.map((crop) => {
                      const isSelected = tempSelectedCrops.includes(crop.name) || (crop.id && tempSelectedCrops.includes(crop.id));
                      return (
                        <div 
                          key={crop.id || crop.name} 
                          className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                            isSelected
                              ? "bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800" 
                              : "hover:bg-muted"
                          }`}
                          onClick={() => toggleCropSelection(crop)}
                        >
                          <span className="font-medium">{crop.name}</span>
                          {isSelected && (
                            <Check className="h-4 w-4 text-orange-600" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
                <DialogFooter className="flex-col sm:flex-row gap-2">
                  <div className="flex-1 text-xs text-muted-foreground flex items-center">
                    {tempSelectedCrops.length} {t('crops_selected')}
                  </div>
                  <Button variant="outline" onClick={() => setTempSelectedCrops([])}>
                    {t('remove_all')}
                  </Button>
                  <Button onClick={handleSaveCrops}>{t('save')}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col min-h-0">
        <Tabs defaultValue="rates" className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="rates">{t('rates')}</TabsTrigger>
            <TabsTrigger value="trends">{t('trends')}</TabsTrigger>
          </TabsList>

          <TabsContent value="rates" className="flex-1 min-h-0 mt-0">
            {filteredData.length === 0 ? (
              <div className="h-full min-h-[200px] flex flex-col items-center justify-center text-muted-foreground p-4 text-center border-2 border-dashed rounded-lg">
                <p className="mb-2">{t('no_crops')}</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setOpen(true)}>{t('select_crops')}</Button>
                  {selectedCrops.length > 0 && (
                    <Button variant="ghost" size="sm" onClick={() => onCropsChange && onCropsChange([])}>
                      {t('reset') || "Reset"}
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar h-[300px]">
                {filteredData.map((item) => (
                  <div key={item.id || item.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex flex-col">
                      <span className="font-semibold">{item.name}</span>
                      <span className="text-xs text-muted-foreground">{t('avg')}: ₹{item.avg}/q</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-1 font-bold">
                        ₹{item.current}
                        {item.current > item.avg ? (
                          <TrendingUp className="h-3 w-3 text-green-500" />
                        ) : (
                          <TrendingDown className="h-3 w-3 text-red-500" />
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        ₹{item.min} - ₹{item.max}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="trends" className="flex-1 flex flex-col min-h-0 mt-0">
            <div className="mb-4">
              <Select value={selectedCrop} onValueChange={setSelectedCrop}>
                <SelectTrigger>
                  <SelectValue placeholder={t('select_crops')} />
                </SelectTrigger>
                <SelectContent>
                  {filteredData.map((crop) => (
                    <SelectItem key={crop.id || crop.name} value={crop.name}>
                      {crop.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1 min-h-[200px] w-full">
              {currentCropData ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={currentCropData.history} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis fontSize={12} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      formatter={(value: number) => [`₹${value}`, 'Price']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="price" 
                      stroke="#f97316" 
                      strokeWidth={2} 
                      dot={{ r: 4, fill: "#f97316" }} 
                      activeDot={{ r: 6 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  <LineChartIcon className="h-8 w-8 mb-2 opacity-20" />
                  <p>{t('select_crop_view')}</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}