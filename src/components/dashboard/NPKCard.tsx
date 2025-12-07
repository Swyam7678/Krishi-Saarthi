import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Sprout, TrendingDown, TrendingUp, Settings, Link as LinkIcon, RotateCcw, AlertTriangle } from "lucide-react";
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
import { useState, useEffect } from "react";
import { FileSpreadsheet, Info } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface NPKData {
  n: number;
  p: number;
  k: number;
  status: {
    n: string;
    p: string;
    k: string;
  };
  trend?: {
    n: "up" | "down";
    p: "up" | "down";
    k: "up" | "down";
  };
  history?: {
    n: number;
    p: number;
    k: number;
    time: string;
  }[];
  isFallback?: boolean;
  error?: string;
}

interface NPKCardProps {
  data: NPKData | null;
  onSheetUrlChange?: (url: string | undefined) => void;
  currentUrl?: string;
}

export function NPKCard({ data, onSheetUrlChange, currentUrl }: NPKCardProps) {
  const [newUrl, setNewUrl] = useState(currentUrl || "");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      setNewUrl(currentUrl || "");
    }
  }, [open, currentUrl]);

  const handleUpdate = () => {
    if (onSheetUrlChange && newUrl.trim()) {
      onSheetUrlChange(newUrl.trim());
      setOpen(false);
    }
  };

  const handleReset = () => {
    if (onSheetUrlChange) {
      onSheetUrlChange(undefined);
      setOpen(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Optimal": return "bg-green-500";
      case "Moderate": return "bg-yellow-500";
      default: return "bg-red-500";
    }
  };

  const getTextColor = (status: string) => {
    switch (status) {
      case "Optimal": return "text-green-600 dark:text-green-400";
      case "Moderate": return "text-yellow-600 dark:text-yellow-400";
      default: return "text-red-600 dark:text-red-400";
    }
  };

  const TrendIcon = ({ direction }: { direction?: "up" | "down" }) => {
    if (!direction) return null;
    return direction === "up" ? (
      <TrendingUp className="h-3 w-3 text-green-500 ml-1" />
    ) : (
      <TrendingDown className="h-3 w-3 text-red-500 ml-1" />
    );
  };

  if (!data) return (
    <Card className="h-full animate-pulse">
      <CardHeader><CardTitle>NPK स्तर</CardTitle></CardHeader>
      <CardContent className="h-32 bg-muted/20 rounded-md" />
    </Card>
  );

  return (
    <Card className="h-full flex flex-col border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
      <CardHeader className="pb-2">
        <CardTitle className="flex justify-between items-center text-lg">
          <div className="flex items-center gap-2">
            <Sprout className="h-5 w-5 text-green-600" />
            <span>मिट्टी के पोषक तत्व (NPK)</span>
          </div>
          <div className="flex items-center gap-2">
            {data.isFallback && currentUrl ? (
              <div className="flex items-center gap-1 text-xs font-normal bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-2 py-1 rounded-full" title={data.error}>
                <AlertTriangle className="h-3 w-3" />
                सिमुलेशन (त्रुटि)
              </div>
            ) : (
              <div className="flex items-center gap-1 text-xs font-normal bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded-full">
                <Activity className="h-3 w-3 animate-pulse" />
                {data.isFallback ? "सिमुलेशन" : "लाइव सेंसर"}
              </div>
            )}
            {onSheetUrlChange && (
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-muted">
                    <Settings className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>डेटा स्रोत बदलें</DialogTitle>
                    <DialogDescription>
                      Google Sheet URL दर्ज करें जिसमें NPK डेटा हो।
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Input
                        id="url"
                        placeholder="Google Sheet URL..."
                        className="col-span-4"
                        value={newUrl}
                        onChange={(e) => setNewUrl(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleUpdate()}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      वर्तमान: {currentUrl ? "कस्टम शीट" : "डिफ़ॉल्ट (डेमो शीट)"}
                    </p>
                    
                    <div className="bg-muted/50 p-3 rounded-md text-xs space-y-2 border border-border">
                      <div className="flex items-center gap-2 font-medium text-foreground">
                        <FileSpreadsheet className="h-3.5 w-3.5" />
                        आवश्यक शीट प्रारूप (Required Format)
                      </div>
                      <p>आपकी Google Sheet में ये कॉलम हेडर (अंग्रेजी में) होने चाहिए:</p>
                      <div className="grid grid-cols-3 gap-2 font-mono bg-background p-2 rounded border text-center">
                        <div className="bg-muted/30 rounded px-1">Nitrogen</div>
                        <div className="bg-muted/30 rounded px-1">Phosphorus</div>
                        <div className="bg-muted/30 rounded px-1">Potassium</div>
                      </div>
                      <div className="flex gap-2 items-start text-muted-foreground">
                        <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                        <span>
                          सुनिश्चित करें कि शीट की शेयर सेटिंग्स में <strong>"Anyone with the link"</strong> चुना गया है।
                        </span>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    {currentUrl && (
                        <Button variant="outline" onClick={handleReset} className="mr-auto gap-2">
                            <RotateCcw className="h-4 w-4" />
                            रीसेट
                        </Button>
                    )}
                    <Button onClick={handleUpdate}>अपडेट करें</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col min-h-0">
        <Tabs defaultValue="overview" className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="flex-1 flex flex-col justify-center space-y-6 mt-0">
            {/* Nitrogen */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">नाइट्रोजन (N)</span>
                <div className="flex items-center">
                  <span className={`text-xs font-medium ${getTextColor(data.status.n)}`}>{data.n} mg/kg ({data.status.n})</span>
                  {data.trend && <TrendIcon direction={data.trend.n} />}
                </div>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div 
                  className={`h-full ${getStatusColor(data.status.n)} transition-all duration-1000`} 
                  style={{ width: `${Math.min(data.n / 2, 100)}%` }}
                />
              </div>
            </div>

            {/* Phosphorus */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">फॉस्फोरस (P)</span>
                <div className="flex items-center">
                  <span className={`text-xs font-medium ${getTextColor(data.status.p)}`}>{data.p} mg/kg ({data.status.p})</span>
                  {data.trend && <TrendIcon direction={data.trend.p} />}
                </div>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div 
                  className={`h-full ${getStatusColor(data.status.p)} transition-all duration-1000`} 
                  style={{ width: `${Math.min(data.p / 2, 100)}%` }}
                />
              </div>
            </div>

            {/* Potassium */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">पोटैशियम (K)</span>
                <div className="flex items-center">
                  <span className={`text-xs font-medium ${getTextColor(data.status.k)}`}>{data.k} mg/kg ({data.status.k})</span>
                  {data.trend && <TrendIcon direction={data.trend.k} />}
                </div>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div 
                  className={`h-full ${getStatusColor(data.status.k)} transition-all duration-1000`} 
                  style={{ width: `${Math.min(data.k / 3, 100)}%` }}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history" className="flex-1 min-h-0 mt-0">
            <div className="h-full w-full min-h-[200px]">
              {data.history && data.history.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.history} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="time" hide />
                    <YAxis fontSize={12} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      labelStyle={{ color: '#666', marginBottom: '4px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Line type="monotone" dataKey="n" stroke="#22c55e" strokeWidth={2} dot={false} name="Nitrogen" />
                    <Line type="monotone" dataKey="p" stroke="#eab308" strokeWidth={2} dot={false} name="Phosphorus" />
                    <Line type="monotone" dataKey="k" stroke="#3b82f6" strokeWidth={2} dot={false} name="Potassium" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                  No history available
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}