// const Dashboard = lazy(() => import("./pages/Dashboard.tsx"));
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