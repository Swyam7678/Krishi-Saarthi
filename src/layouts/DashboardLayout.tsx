import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/lib/i18n";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
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
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full flex flex-col min-h-screen">
        <div className="p-4 border-b flex justify-between items-center bg-background sticky top-0 z-10">
            <div className="flex items-center gap-2">
                <SidebarTrigger />
                <h1 className="font-semibold text-lg hidden sm:block">{t('app_name')}</h1>
            </div>
            <div className="flex items-center gap-2">
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
        </div>
        <div className="flex-1 p-4 md:p-8 overflow-auto">
            <Outlet />
        </div>
        <ChatbotWidget npkData={npk} />
        <CompleteProfileModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} user={user} />
      </main>
    </SidebarProvider>
  );
}
