import { useEffect, useState } from "react";
import { Outlet, useNavigate, Link, useLocation } from "react-router";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/lib/i18n";
import { cn } from "@/lib/utils";
>>>>>>> REPLACE
<<<<<<< SEARCH
  const { signOut, user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [showProfileModal, setShowProfileModal] = useState(false);
=======
  const { signOut, user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const [showProfileModal, setShowProfileModal] = useState(false);
>>>>>>> REPLACE
<<<<<<< SEARCH
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
        <Link to="/dashboard" className="flex items-center gap-2 font-semibold text-lg hover:opacity-80 transition-opacity">
          {t('app_name')}
        </Link>
        <div className="ml-auto flex items-center gap-2">
=======
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
        <Link to="/dashboard" className="flex items-center gap-2 font-semibold text-lg hover:opacity-80 transition-opacity mr-6">
          {t('app_name')}
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link 
            to="/dashboard" 
            className={cn("transition-colors hover:text-foreground/80", location.pathname === "/dashboard" ? "text-foreground" : "text-foreground/60")}
          >
            {t('dashboard') || "Overview"}
          </Link>
          <Link 
            to="/dashboard/market" 
            className={cn("transition-colors hover:text-foreground/80", location.pathname === "/dashboard/market" ? "text-foreground" : "text-foreground/60")}
          >
            {t('market_title') || "Market"}
          </Link>
          <Link 
            to="/dashboard/advisory" 
            className={cn("transition-colors hover:text-foreground/80", location.pathname === "/dashboard/advisory" ? "text-foreground" : "text-foreground/60")}
          >
            {t('feature_ai') || "Advisory"}
          </Link>
          <Link 
            to="/dashboard/schemes" 
            className={cn("transition-colors hover:text-foreground/80", location.pathname === "/dashboard/schemes" ? "text-foreground" : "text-foreground/60")}
          >
            {t('schemes') || "Schemes"}
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-2">
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { UserCircle, LogOut, RotateCcw, Loader2 } from "lucide-react";
import { CompleteProfileModal } from "@/components/CompleteProfileModal";
import { ChatbotWidget } from "@/components/ChatbotWidget";
import { useAction, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function DashboardLayout() {
  const { signOut, user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const updateUser = useMutation(api.users.updateUser);
  const [isSigningOut, setIsSigningOut] = useState(false);
  
  // NPK Data for Chatbot
  const getNPK = useAction(api.npk.getLiveNPK);
  const [npk, setNpk] = useState<any>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/");
    }
  }, [isLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (user) {
      if (!user.name || !user.farmLocation || !user.farmSize || !user.phoneNumber) {
        const timer = setTimeout(() => setShowProfileModal(true), 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [user]);

  useEffect(() => {
    const fetchNPK = async () => {
      if (user?.sheetUrl) {
        try {
          const n = await getNPK({ sheetUrl: user.sheetUrl });
          setNpk(n);
        } catch (e) {
          console.error(e);
        }
      }
    };
    fetchNPK();
  }, [user?.sheetUrl, getNPK]);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
    } catch (error) {
      setIsSigningOut(false);
    }
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

  if (isLoading || (!isAuthenticated && !isSigningOut)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
        <Link to="/dashboard" className="flex items-center gap-2 font-semibold text-lg hover:opacity-80 transition-opacity">
          {t('app_name')}
        </Link>
        <div className="ml-auto flex items-center gap-2">
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
                    <div className="grid gap-2 text-sm">
                        <div className="grid grid-cols-3 items-center gap-4">
                            <span className="font-medium">Name:</span>
                            <span className={cn("col-span-2 truncate", !user?.name && "text-muted-foreground italic")}>
                                {user?.name || "Not set"}
                            </span>
                        </div>
                        <div className="grid grid-cols-3 items-center gap-4">
                            <span className="font-medium">Phone:</span>
                            <span className={cn("col-span-2 truncate", !user?.phoneNumber && "text-muted-foreground italic")}>
                                {user?.phoneNumber || "Not set"}
                            </span>
                        </div>
                        <div className="grid grid-cols-3 items-center gap-4">
                            <span className="font-medium">Location:</span>
                            <span className={cn("col-span-2 truncate", (!user?.farmLocation && !user?.location) && "text-muted-foreground italic")}>
                                {user?.farmLocation || user?.location || "Not set"}
                            </span>
                        </div>
                        <div className="grid grid-cols-3 items-center gap-4">
                            <span className="font-medium">Size:</span>
                            <span className={cn("col-span-2 truncate", !user?.farmSize && "text-muted-foreground italic")}>
                                {user?.farmSize || "Not set"}
                            </span>
                        </div>
                    </div>
                    <Button onClick={() => setShowProfileModal(true)} size="sm" className="w-full">
                        Edit Profile
                    </Button>
                </div>
              </PopoverContent>
            </Popover>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetProfile}
              className="gap-2 text-orange-500 hover:text-orange-600 hover:bg-orange-50 hidden md:flex"
              title="Reset Profile (Test)"
            >
              <RotateCcw className="h-4 w-4" />
              <span className="hidden sm:inline text-xs">Reset (Test)</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSignOut} disabled={isSigningOut}>
                {isSigningOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
            </Button>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-8 overflow-auto">
        <Outlet />
      </main>
      <ChatbotWidget npkData={npk} />
      <CompleteProfileModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} user={user} />
    </div>
  );
}