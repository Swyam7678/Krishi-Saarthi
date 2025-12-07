import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";

interface MarketItem {
  name: string;
  min: number;
  max: number;
  avg: number;
  current: number;
}

export function MarketCard({ data }: { data: MarketItem[] | null }) {
  if (!data) return (
    <Card className="h-full animate-pulse">
      <CardHeader><CardTitle>Market Prices</CardTitle></CardHeader>
      <CardContent className="h-32 bg-muted/20 rounded-md" />
    </Card>
  );

  return (
    <Card className="h-full border-l-4 border-l-orange-500 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <DollarSign className="h-5 w-5 text-orange-600" />
          <span>Mandi Market Prices</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.map((item) => (
            <div key={item.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex flex-col">
                <span className="font-semibold">{item.name}</span>
                <span className="text-xs text-muted-foreground">Avg: ₹{item.avg}/q</span>
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
      </CardContent>
    </Card>
  );
}
