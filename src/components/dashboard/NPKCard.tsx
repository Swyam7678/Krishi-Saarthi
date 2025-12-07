import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sprout, Activity, AlertCircle, Droplets } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useLanguage } from "@/lib/i18n";

interface NPKData {
  n: number;
  p: number;
  k: number;
  moisture?: number;
  timestamp: number;
  status: {
    n: string;
    p: string;
    k: string;
    moisture?: string;
  };
  trend: {
    n: "up" | "down";
    p: "up" | "down";
    k: "up" | "down";
  };
  history: any[];
  isFallback: boolean;
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
  const { t } = useLanguage();

  const handleUpdate = () => {
    if (onSheetUrlChange) {
      onSheetUrlChange(newUrl.trim() || undefined);
      setOpen(false);
    }
  };

  if (!data) return (
    <Card className="h-full animate-pulse">
      <CardHeader><CardTitle>{t('npk_title')}</CardTitle></CardHeader>
      <CardContent className="h-32 bg-muted/20 rounded-md" />
    </Card>
  );

  return (
    <Card className="h-full flex flex-col border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
      <CardHeader className="pb-2">
        <CardTitle className="flex justify-between items-center text-lg">
          <div className="flex items-center gap-2">
            <Sprout className="h-5 w-5 text-green-600" />
            <span>{t('npk_title')}</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={data.isFallback ? "secondary" : "default"} className="text-xs">
              {data.isFallback ? (data.error ? t('simulation_error') : t('simulation')) : t('live_sensor')}
            </Badge>
            {onSheetUrlChange && (
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-muted">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t('data_source')}</DialogTitle>
                    <DialogDescription>
                      {t('sheet_instruction')} <code>Nitrogen, Phosphorus, Potassium, Moisture, Timestamp</code>
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">{t('sheet_url')}</label>
                      <Input
                        placeholder="https://docs.google.com/spreadsheets/d/..."
                        value={newUrl}
                        onChange={(e) => setNewUrl(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        {t('share_instruction')}
                      </p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => {
                      setNewUrl("");
                      if (onSheetUrlChange) {
                        onSheetUrlChange(undefined);
                        setOpen(false);
                      }
                    }}>{t('reset')}</Button>
                    <Button onClick={handleUpdate}>{t('save')}</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col min-h-0">
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="flex flex-col items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
            <span className="text-xs font-medium text-muted-foreground mb-1">N</span>
            <span className="text-2xl font-bold text-green-700 dark:text-green-400">{data.n}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
              data.status.n === 'Optimal' ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'
            }`}>
              {data.status.n}
            </span>
          </div>
          <div className="flex flex-col items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
            <span className="text-xs font-medium text-muted-foreground mb-1">P</span>
            <span className="text-2xl font-bold text-green-700 dark:text-green-400">{data.p}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
              data.status.p === 'Optimal' ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'
            }`}>
              {data.status.p}
            </span>
          </div>
          <div className="flex flex-col items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
            <span className="text-xs font-medium text-muted-foreground mb-1">K</span>
            <span className="text-2xl font-bold text-green-700 dark:text-green-400">{data.k}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
              data.status.k === 'Optimal' ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'
            }`}>
              {data.status.k}
            </span>
          </div>
        </div>

        {data.moisture !== undefined && (
          <div className="mb-4 flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
            <div className="flex items-center gap-2">
              <Droplets className="h-5 w-5 text-blue-500" />
              <span className="text-sm font-medium">{t('moisture')}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-blue-700 dark:text-blue-400">{data.moisture}%</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                data.status.moisture === 'Optimal' ? 'bg-blue-200 text-blue-800' : 'bg-yellow-200 text-yellow-800'
              }`}>
                {data.status.moisture}
              </span>
            </div>
          </div>
        )}

        <div className="flex-1 min-h-[150px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.history} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorN" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="time" fontSize={10} tickLine={false} axisLine={false} interval={4} />
              <YAxis fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Area 
                type="monotone" 
                dataKey="n" 
                stackId="1" 
                stroke="#22c55e" 
                fill="url(#colorN)" 
                name="Nitrogen"
              />
              <Area 
                type="monotone" 
                dataKey="p" 
                stackId="1" 
                stroke="#eab308" 
                fill="#eab308" 
                fillOpacity={0.3}
                name="Phosphorus"
              />
              <Area 
                type="monotone" 
                dataKey="k" 
                stackId="1" 
                stroke="#f97316" 
                fill="#f97316" 
                fillOpacity={0.3}
                name="Potassium"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}