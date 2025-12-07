import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, LineChart as LineChartIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useState } from "react";

interface MarketItem {
  name: string;
  min: number;
  max: number;
  avg: number;
  current: number;
  history: { date: string; price: number }[];
}

export function MarketCard({ data, location }: { data: MarketItem[] | null, location?: string }) {
  const [selectedCrop, setSelectedCrop] = useState<string>("");

  if (!data) return (
    <Card className="h-full animate-pulse">
      <CardHeader><CardTitle>मंडी भाव</CardTitle></CardHeader>
      <CardContent className="h-32 bg-muted/20 rounded-md" />
    </Card>
  );

  // Set default selected crop if not set
  if (!selectedCrop && data.length > 0) {
    setSelectedCrop(data[0].name);
  }

  const currentCropData = data.find(c => c.name === selectedCrop);

  return (
    <Card className="h-full flex flex-col border-l-4 border-l-orange-500 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <DollarSign className="h-5 w-5 text-orange-600" />
          <span>मंडी भाव {location ? <span className="text-sm font-normal text-muted-foreground">({location})</span> : null}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col min-h-0">
        <Tabs defaultValue="rates" className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="rates">Rates</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="rates" className="flex-1 min-h-0 mt-0">
            <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar h-[300px]">
              {data.map((item) => (
                <div key={item.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex flex-col">
                    <span className="font-semibold">{item.name}</span>
                    <span className="text-xs text-muted-foreground">औसत: ₹{item.avg}/q</span>
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
          </TabsContent>

          <TabsContent value="trends" className="flex-1 flex flex-col min-h-0 mt-0">
            <div className="mb-4">
              <Select value={selectedCrop} onValueChange={setSelectedCrop}>
                <SelectTrigger>
                  <SelectValue placeholder="फसल चुनें" />
                </SelectTrigger>
                <SelectContent>
                  {data.map((crop) => (
                    <SelectItem key={crop.name} value={crop.name}>
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
                  <p>चार्ट देखने के लिए फसल चुनें</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}