import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/lib/i18n";
import { SchemesCard } from "@/components/dashboard/SchemesCard";
import { MarketCard } from "@/components/dashboard/MarketCard";
import { NPKCard } from "@/components/dashboard/NPKCard";
import { WeatherCard } from "@/components/dashboard/WeatherCard";
import { CropRecommendation } from "@/components/dashboard/CropRecommendation";
import { api } from "@/convex/_generated/api";
import { useAction, useMutation } from "convex/react";
import { toast } from "sonner";

export default function Overview() {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  
  const getWeather = useAction(api.weather.getWeather);
  const getNPK = useAction(api.npk.getLiveNPK);
  const getMarket = useAction(api.market.getMarketPrices);
  const updateUser = useMutation(api.users.updateUser);

  const [weather, setWeather] = useState<any>(null);
  const [npk, setNpk] = useState<any>(null);
  const [market, setMarket] = useState<any>(null);
  const [location, setLocation] = useState<string | undefined>(undefined);
  const [sheetUrl, setSheetUrl] = useState<string | undefined>(undefined);
  const [selectedCrops, setSelectedCrops] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      if (user.location && location === undefined) setLocation(user.location);
      if (user.sheetUrl && sheetUrl === undefined) setSheetUrl(user.sheetUrl);
      if (user.selectedCrops) setSelectedCrops(user.selectedCrops);
    }
  }, [user]);

  const fetchData = useCallback(async () => {
    const fetchWeather = async () => {
      try {
        const w = await getWeather({ location, lang: language });
        setWeather(w);
      } catch (error: any) {
        console.error("Error fetching weather:", error);
      }
    };

    const fetchNPK = async () => {
      try {
        const n = await getNPK({ sheetUrl });
        setNpk(n);
      } catch (error) {
        console.error("Error fetching NPK:", error);
      }
    };

    const fetchMarket = async () => {
      try {
        const m = await getMarket({ location, lang: language });
        setMarket(m);
      } catch (error) {
        console.error("Error fetching market:", error);
      }
    };

    await Promise.all([fetchWeather(), fetchNPK(), fetchMarket()]);
  }, [getWeather, getNPK, getMarket, location, sheetUrl, language]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleLocationChange = (newLocation: string) => {
    setLocation(newLocation);
    if (user) updateUser({ location: newLocation });
  };

  const handleSheetUrlChange = (newUrl: string | undefined) => {
    setSheetUrl(newUrl);
    if (user) updateUser({ sheetUrl: newUrl || "" });
    toast.success(newUrl ? t('success') : t('reset'));
  };

  const handleCropsChange = (crops: string[]) => {
    setSelectedCrops(crops);
    if (user) updateUser({ selectedCrops: crops });
    toast.success(t('success'));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">{t('dashboard')}</h2>
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CropRecommendation npkData={npk} />
        </div>
        <div className="h-full">
          <SchemesCard />
        </div>
      </div>
    </div>
  );
}
