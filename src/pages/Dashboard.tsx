import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/use-auth";
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
import { LayoutDashboard, LogOut, Loader2, UserCircle } from "lucide-react";
import { CompleteProfileModal } from "@/components/CompleteProfileModal";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function Dashboard() {
  const { signOut, user, isAuthenticated, isLoading } = useAuth();
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
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    // Debug logging for auth state transitions
    console.log("Dashboard auth state:", { isLoading, isAuthenticated, hasUser: !!user });
    
    if (!isLoading && !isAuthenticated) {
      console.log("User not authenticated, redirecting to home...");
      navigate("/");
    }
  }, [isLoading, isAuthenticated, navigate, user]);

  // Load user preferences and check profile completion
  useEffect(() => {
    if (user) {
      // Debug log for user profile fields
      console.log("Checking user profile for completion:", {
        name: user.name,
        farmLocation: user.farmLocation,
        farmSize: user.farmSize,
        phoneNumber: user.phoneNumber
      });

      if (user.location && location === undefined) setLocation(user.location);
      if (user.sheetUrl && sheetUrl === undefined) setSheetUrl(user.sheetUrl);
      if (user.selectedCrops) setSelectedCrops(user.selectedCrops);

      // Check if profile is incomplete (including name)
      if (!user.name || !user.farmLocation || !user.farmSize || !user.phoneNumber) {
        console.log("Profile incomplete, triggering modal in 1s...");
        // Small delay to ensure UI is ready
        const timer = setTimeout(() => {
          console.log("Setting showProfileModal to true");
          setShowProfileModal(true);
        }, 1000);
        return () => clearTimeout(timer);
      } else {
        console.log("Profile is complete.");
      }
    }
  }, [user]);

  const fetchData = useCallback(async () => {
    setIsRefreshing(true);
    console.log("Refreshing dashboard data...");
    
    // Fetch data independently to prevent one failure from blocking others
    const fetchWeather = async () => {
      try {
        const w = await getWeather({ location, lang: language });
        setWeather(w);
      } catch (error: any) {
        console.error("Error fetching weather:", error);
        if (error.message && error.message.includes("Location not found")) {
          toast.error(t('error'));
          setLocation(undefined); // Reset to default
        }
      }
    };

    const fetchNPK = async () => {
      try {
        const n = await getNPK({ sheetUrl });
        setNpk(n);
      } catch (error) {
        console.error("Error fetching NPK:", error);
        // Keep previous data or handle specific NPK errors if needed
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

    try {
      await Promise.all([fetchWeather(), fetchNPK(), fetchMarket()]);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Unexpected error during refresh:", error);
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

  const handleResetProfile = async () => {
    if (confirm("This will clear your profile details to test the completion modal. Continue?")) {
      try {
        await updateUser({
          name: "",
          phoneNumber: "",
          farmLocation: "",
          farmSize: "",
        });
        toast.success("Profile cleared. Modal should appear shortly.");
      } catch (error) {
        console.error("Error resetting profile:", error);
        toast.error("Failed to reset profile");
      }
    }
  };

  const handleSignOut = async () => {
    console.log("Sign out initiated...");
    setIsSigningOut(true);
    try {
      await signOut();
      console.log("Sign out completed.");
      // Navigation handled by useEffect
    } catch (error) {
      console.error("Sign out error:", error);
      setIsSigningOut(false);
    }
  };

  if (isLoading || (!isAuthenticated && !isSigningOut)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
              <img src="/logo.svg" alt="Logo" className="h-8 w-8" />
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

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <UserCircle className="h-4 w-4" />
                  <span className="hidden sm:inline">{user?.name || "Profile"}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium leading-none">Farmer Profile</h4>
                    <p className="text-sm text-muted-foreground">
                      Your registered farm details.
                    </p>
                  </div>
                  <div className="grid gap-2">
                    <div className="grid grid-cols-3 items-center gap-4">
                      <span className="text-sm font-medium">Name:</span>
                      <span className="col-span-2 text-sm truncate">{user?.name || "-"}</span>
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                      <span className="text-sm font-medium">Phone:</span>
                      <span className="col-span-2 text-sm truncate">{user?.phoneNumber || "-"}</span>
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                      <span className="text-sm font-medium">Location:</span>
                      <span className="col-span-2 text-sm truncate">{user?.farmLocation || user?.location || "-"}</span>
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                      <span className="text-sm font-medium">Size:</span>
                      <span className="col-span-2 text-sm truncate">{user?.farmSize || "-"}</span>
                    </div>
                  </div>
                  <Button onClick={() => setShowProfileModal(true)} size="sm" className="w-full">
                    Edit Profile
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            {/* Dev Tool: Reset Profile for Testing */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetProfile}
              className="gap-2 text-orange-500 hover:text-orange-600 hover:bg-orange-50"
              title="Reset Profile (Test)"
            >
              <span className="text-xs">Reset (Test)</span>
            </Button>

            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="gap-2"
            >
              {isSigningOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
              <span className="hidden sm:inline">{t('sign_out')}</span>
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

        {/* Bottom Section: AI Recommendation, Schemes */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <CropRecommendation npkData={npk} />
          </div>
          <div className="h-full">
            <SchemesCard />
          </div>
        </div>
      </div>

      {/* Chatbot Widget */}
      <ChatbotWidget npkData={npk} onRefresh={fetchData} isLoading={isRefreshing} />
      
      {/* Profile Modal */}
      <CompleteProfileModal 
        isOpen={showProfileModal} 
        onClose={() => setShowProfileModal(false)} 
        user={user} 
      />
    </div>
  );
}