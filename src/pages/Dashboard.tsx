import { MarketCard } from "@/components/dashboard/MarketCard";
import { NPKCard } from "@/components/dashboard/NPKCard";
import { WeatherCard } from "@/components/dashboard/WeatherCard";
import { CropRecommendation } from "@/components/dashboard/CropRecommendation";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { useAction, useMutation } from "convex/react";
import { LayoutDashboard, LogOut, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router";
import { toast } from "sonner";

export default function Dashboard() {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  
  const getWeather = useAction(api.weather.getWeather);
  const getNPK = useAction(api.npk.getLiveNPK);
  const getMarket = useAction(api.market.getMarketPrices);
  const updateUser = useMutation(api.users.updateUser);

  const [weather, setWeather] = useState<any>(null);
  const [npk, setNpk] = useState<any>(null);
  const [market, setMarket] = useState<any>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [location, setLocation] = useState<string | undefined>(undefined);
  const [sheetUrl, setSheetUrl] = useState<string | undefined>(undefined);

  // Load user preferences
  useEffect(() => {
    if (user) {
      if (user.location && location === undefined) setLocation(user.location);
      if (user.sheetUrl && sheetUrl === undefined) setSheetUrl(user.sheetUrl);
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const [w, n, m] = await Promise.all([
        getWeather({ location }),
        getNPK({ sheetUrl }),
        getMarket({})
      ]);
      setWeather(w);
      setNpk(n);
      setMarket(m);
      setLastUpdated(new Date());
    } catch (error: any) {
      console.error("Error fetching dashboard data:", error);
      if (error.message && error.message.includes("Location not found")) {
        toast.error("स्थान नहीं मिला। कृपया सही शहर का नाम दर्ज करें।");
        setLocation(undefined); // Reset to default
      }
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Auto update every 10s
    return () => clearInterval(interval);
  }, [location, sheetUrl]); // Re-fetch when location or sheetUrl changes

  const handleLocationChange = (newLocation: string) => {
    setLocation(newLocation);
    if (user) {
      updateUser({ location: newLocation });
    }
  };

  const handleSheetUrlChange = (newUrl: string | undefined) => {
    setSheetUrl(newUrl);
    if (user) {
      updateUser({ sheetUrl: newUrl || "" });
    }
    toast.success(newUrl ? "डेटा स्रोत अपडेट किया गया" : "डिफ़ॉल्ट डेटा स्रोत पर रीसेट किया गया");
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
              <LayoutDashboard className="h-8 w-8" />
              KrishiSaarthi
            </h1>
            <p className="text-muted-foreground">स्मार्ट कृषि सहायक • स्वागत है, {user?.name || 'किसान'}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground hidden md:inline">
              अद्यतन: {lastUpdated.toLocaleTimeString()}
            </span>
            <Button variant="outline" size="sm" onClick={fetchData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              ताज़ा करें
            </Button>
            <Button variant="ghost" size="sm" onClick={() => signOut()}>
              <LogOut className="h-4 w-4 mr-2" />
              साइन आउट
            </Button>
          </div>
        </div>

        {/* Top Grid: Weather, NPK, Market */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="h-full">
            <WeatherCard data={weather} onLocationChange={handleLocationChange} />
          </div>
          <div className="h-full">
            <NPKCard data={npk} onSheetUrlChange={handleSheetUrlChange} currentUrl={sheetUrl} />
          </div>
          <div className="h-full">
            <MarketCard data={market} />
          </div>
        </div>

        {/* Bottom Section: AI Recommendation */}
        <div className="w-full">
          <CropRecommendation />
        </div>
      </div>
    </div>
  );
}