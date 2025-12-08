import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/lib/i18n";
import { WeatherCard } from "@/components/dashboard/WeatherCard";
import { api } from "@/convex/_generated/api";
import { useAction, useMutation } from "convex/react";

export default function WeatherPage() {
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const getWeather = useAction(api.weather.getWeather);
  const updateUser = useMutation(api.users.updateUser);
  const [weather, setWeather] = useState<any>(null);
  const [location, setLocation] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (user?.location) setLocation(user.location);
  }, [user]);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const w = await getWeather({ location, lang: language });
        setWeather(w);
      } catch (error) {
        console.error(error);
      }
    };
    fetchWeather();
  }, [getWeather, location, language]);

  const handleLocationChange = (newLocation: string) => {
    setLocation(newLocation);
    if (user) updateUser({ location: newLocation });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">{t('feature_weather')}</h2>
      <div className="max-w-2xl">
        <WeatherCard data={weather} onLocationChange={handleLocationChange} />
      </div>
    </div>
  );
}
