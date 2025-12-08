import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/lib/i18n";
import { MarketCard } from "@/components/dashboard/MarketCard";
import { api } from "@/convex/_generated/api";
import { useAction, useMutation } from "convex/react";
import { toast } from "sonner";

export default function MarketPage() {
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const getMarket = useAction(api.market.getMarketPrices);
  const updateUser = useMutation(api.users.updateUser);
  const [market, setMarket] = useState<any>(null);
  const [location, setLocation] = useState<string | undefined>(undefined);
  const [selectedCrops, setSelectedCrops] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      if (user.location) setLocation(user.location);
      if (user.selectedCrops) setSelectedCrops(user.selectedCrops);
    }
  }, [user]);

  useEffect(() => {
    const fetchMarket = async () => {
      try {
        const m = await getMarket({ location, lang: language });
        setMarket(m);
      } catch (error) {
        console.error(error);
      }
    };
    fetchMarket();
  }, [getMarket, location, language]);

  const handleCropsChange = (crops: string[]) => {
    setSelectedCrops(crops);
    if (user) updateUser({ selectedCrops: crops });
    toast.success(t('success'));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">{t('feature_market')}</h2>
      <div className="max-w-2xl">
        <MarketCard 
          data={market} 
          location={location} 
          selectedCrops={selectedCrops} 
          onCropsChange={handleCropsChange}
        />
      </div>
    </div>
  );
}
