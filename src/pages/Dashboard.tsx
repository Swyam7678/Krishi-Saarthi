import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { useLanguage } from "@/lib/i18n";
import { ChatbotWidget } from "@/components/ChatbotWidget";
import { SchemesCard } from "@/components/dashboard/SchemesCard";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { MarketCard } from "@/components/dashboard/MarketCard";
import { NPKCard } from "@/components/dashboard/NPKCard";
import { WeatherCard } from "@/components/dashboard/WeatherCard";
import { CropRecommendation } from "@/components/dashboard/CropRecommendation";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { useAction, useMutation } from "convex/react";
import { LayoutDashboard, LogOut, Loader2 } from "lucide-react";

export default function Dashboard() {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  
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
  const [selectedCrops, setSelectedCrops] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load user preferences
  useEffect(() => {
    if (user) {
      if (user.location && location === undefined) setLocation(user.location);
      if (user.sheetUrl && sheetUrl === undefined) setSheetUrl(user.sheetUrl);
      if (user.selectedCrops) setSelectedCrops(user.selectedCrops);
    }
  }, [user]);

  const fetchData = useCallback(async () => {
    setIsRefreshing(true);
    console.log("Refreshing dashboard data...");
    try {
      const [w, n, m] = await Promise.all([
        getWeather({ location, lang: language }),
        getNPK({ sheetUrl }),
        getMarket({ location, lang: language })
      ]);
      setWeather(w);
      setNpk(n);
      setMarket(m);
      setLastUpdated(new Date());
    } catch (error: any) {
      console.error("Error fetching dashboard data:", error);
      if (error.message && error.message.includes("Location not found")) {
        toast.error(t('error'));
        setLocation(undefined); // Reset to default
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [getWeather, getNPK, getMarket, location, sheetUrl, language, t]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Auto update every 10s
    return () => clearInterval(interval);
  }, [fetchData]);

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
    toast.success(newUrl ? t('success') : t('reset'));
  };

  const handleCropsChange = (crops: string[]) => {
    setSelectedCrops(crops);
    if (user) {
      updateUser({ selectedCrops: crops });
    }
    toast.success(t('success'));
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
              <LayoutDashboard className="h-8 w-8" />
              {t('app_name')}
            </h1>
            <p className="text-muted-foreground">{t('subtitle')} • {t('welcome')}, {user?.name || t('farmer')}</p>
          </div>
          <div className="flex items-center gap-2">
            {isRefreshing && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
            <span className="text-xs text-muted-foreground hidden md:inline">
              {lastUpdated.toLocaleTimeString()}
            </span>
            
            <LanguageSwitcher />

            <Button variant="ghost" size="sm" onClick={() => signOut()}>
              <LogOut className="h-4 w-4 mr-2" />
              {t('sign_out')}
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
            <MarketCard 
              data={market} 
              location={location} 
              selectedCrops={selectedCrops} 
              onCropsChange={handleCropsChange}
            />
          </div>
        </div>

        {/* Bottom Section: AI Recommendation and Schemes */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <CropRecommendation />
          </div>
          <div className="h-full">
            <SchemesCard />
          </div>
        </div>
      </div>

      {/* Chatbot Widget */}
      <ChatbotWidget npkData={npk} onRefresh={fetchData} />
    </div>
  );
}