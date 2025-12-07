import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Leaf, Sprout, Sun, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-green-50 to-white dark:from-green-950/20 dark:to-background">
      {/* Navbar */}
      <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2 font-bold text-2xl text-primary">
          <Sprout className="h-8 w-8" />
          KrishiSaarthi
        </div>
        <div className="flex gap-4">
          <Button variant="ghost" onClick={() => navigate("/auth")}>Sign In</Button>
          <Button onClick={() => navigate("/auth")}>Get Started</Button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 text-center py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto space-y-6"
        >
          <div className="inline-block px-4 py-1.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 font-medium text-sm mb-4">
            🌱 Smart Farming Assistant
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground">
            Empowering Farmers with <span className="text-primary">Smart Technology</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get real-time weather updates, live soil NPK data, market prices, and AI-powered crop recommendations all in one dashboard.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Button size="lg" className="text-lg px-8 h-14" onClick={() => navigate("/auth")}>
              Launch Dashboard <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto mt-24 px-4 w-full">
          <FeatureCard 
            icon={<Sun className="h-8 w-8 text-orange-500" />}
            title="Live Weather"
            description="Real-time temperature, humidity, and rain forecasts for your farm."
          />
          <FeatureCard 
            icon={<Leaf className="h-8 w-8 text-green-500" />}
            title="NPK Sensors"
            description="Monitor soil health with live Nitrogen, Phosphorus, and Potassium levels."
          />
          <FeatureCard 
            icon={<TrendingUp className="h-8 w-8 text-blue-500" />}
            title="Market Prices"
            description="Stay updated with the latest Mandi prices for your crops."
          />
          <FeatureCard 
            icon={<Sprout className="h-8 w-8 text-purple-500" />}
            title="AI Recommendations"
            description="Get smart crop suggestions based on your soil and weather conditions."
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-muted-foreground border-t">
        <p>© 2024 KrishiSaarthi. Empowering Agriculture.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="p-6 rounded-2xl bg-card border shadow-sm hover:shadow-md transition-all"
    >
      <div className="mb-4 p-3 bg-muted/50 rounded-xl w-fit">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </motion.div>
  );
}