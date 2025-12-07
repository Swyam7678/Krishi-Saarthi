import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Sprout, TrendingDown, TrendingUp } from "lucide-react";

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
          <div className="flex items-center gap-1 text-xs font-normal bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded-full">
            <Activity className="h-3 w-3 animate-pulse" />
            लाइव सेंसर
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-center">
        <div className="space-y-6 mt-2">
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
        </div>
      </CardContent>
    </Card>
  );
}