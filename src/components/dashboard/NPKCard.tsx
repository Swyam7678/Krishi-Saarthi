import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Sprout } from "lucide-react";

interface NPKData {
  n: number;
  p: number;
  k: number;
  status: {
    n: string;
    p: string;
    k: string;
  };
}

export function NPKCard({ data }: { data: NPKData | null }) {
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

  if (!data) return (
    <Card className="h-full animate-pulse">
      <CardHeader><CardTitle>NPK Levels</CardTitle></CardHeader>
      <CardContent className="h-32 bg-muted/20 rounded-md" />
    </Card>
  );

  return (
    <Card className="h-full border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
      <CardHeader className="pb-2">
        <CardTitle className="flex justify-between items-center text-lg">
          <div className="flex items-center gap-2">
            <Sprout className="h-5 w-5 text-green-600" />
            <span>Live Soil NPK</span>
          </div>
          <div className="flex items-center gap-1 text-xs font-normal bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded-full">
            <Activity className="h-3 w-3 animate-pulse" />
            Live Sensor
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 mt-2">
          {/* Nitrogen */}
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Nitrogen (N)</span>
              <span className={getTextColor(data.status.n)}>{data.n} mg/kg ({data.status.n})</span>
            </div>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <div 
                className={`h-full ${getStatusColor(data.status.n)} transition-all duration-1000`} 
                style={{ width: `${Math.min(data.n, 100)}%` }}
              />
            </div>
          </div>

          {/* Phosphorus */}
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Phosphorus (P)</span>
              <span className={getTextColor(data.status.p)}>{data.p} mg/kg ({data.status.p})</span>
            </div>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <div 
                className={`h-full ${getStatusColor(data.status.p)} transition-all duration-1000`} 
                style={{ width: `${Math.min(data.p, 100)}%` }}
              />
            </div>
          </div>

          {/* Potassium */}
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Potassium (K)</span>
              <span className={getTextColor(data.status.k)}>{data.k} mg/kg ({data.status.k})</span>
            </div>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <div 
                className={`h-full ${getStatusColor(data.status.k)} transition-all duration-1000`} 
                style={{ width: `${Math.min(data.k, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
