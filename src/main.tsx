import { Toaster } from "@/components/ui/sonner";
import { InstrumentationProvider } from "@/instrumentation.tsx";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import { StrictMode, useEffect, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes, useLocation } from "react-router";
import { LanguageProvider } from "@/lib/i18n";
import { ThemeProvider } from "next-themes";
import "./index.css";
import "./types/global.d.ts";
import { TooltipProvider } from "@/components/ui/tooltip";

import Landing from "./pages/Landing.tsx";
import AuthPage from "./pages/Auth.tsx";

// Lazy load route components for better code splitting
const NotFound = lazy(() => import("./pages/NotFound.tsx"));
const TestVoice = lazy(() => import("./pages/TestVoice.tsx"));

// New Dashboard Components
const DashboardLayout = lazy(() => import("./layouts/DashboardLayout.tsx"));
const Overview = lazy(() => import("./pages/dashboard/Overview.tsx"));
const WeatherPage = lazy(() => import("./pages/dashboard/Weather.tsx"));
const SoilHealthPage = lazy(() => import("./pages/dashboard/SoilHealth.tsx"));
const MarketPage = lazy(() => import("./pages/dashboard/Market.tsx"));
const AdvisoryPage = lazy(() => import("./pages/dashboard/Advisory.tsx"));
const SchemesPage = lazy(() => import("./pages/dashboard/Schemes.tsx"));

// Simple loading fallback for route transitions
function RouteLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-muted-foreground">Loading...</div>
    </div>
  );
}

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

function RouteSyncer() {
  const location = useLocation();
  useEffect(() => {
    window.parent.postMessage(
      { type: "iframe-route-change", path: location.pathname },
      "*",
    );
  }, [location.pathname]);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data?.type === "navigate") {
        if (event.data.direction === "back") window.history.back();
        if (event.data.direction === "forward") window.history.forward();
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return null;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <LanguageProvider>
      <InstrumentationProvider>
        <ConvexAuthProvider client={convex}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <TooltipProvider>
              <BrowserRouter>
                <RouteSyncer />
                <Suspense fallback={<RouteLoading />}>
                  <Routes>
                    <Route path="/" element={<Landing />} />
                    <Route path="/auth" element={<AuthPage redirectAfterAuth="/dashboard" />} />
                    
                    {/* Dashboard Routes */}
                    <Route path="/dashboard" element={<DashboardLayout />}>
                      <Route index element={<Overview />} />
                      <Route path="weather" element={<WeatherPage />} />
                      <Route path="soil" element={<SoilHealthPage />} />
                      <Route path="market" element={<MarketPage />} />
                      <Route path="advisory" element={<AdvisoryPage />} />
                      <Route path="schemes" element={<SchemesPage />} />
                    </Route>

                    <Route path="/test-voice" element={<TestVoice />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
                <Toaster />
              </BrowserRouter>
            </TooltipProvider>
          </ThemeProvider>
        </ConvexAuthProvider>
      </InstrumentationProvider>
    </LanguageProvider>
  </StrictMode>,
);