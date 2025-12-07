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
          कृषि सारथी
        </div>
        <div className="flex gap-4">
          <Button variant="ghost" onClick={() => navigate("/auth")}>लॉग इन</Button>
          <Button onClick={() => navigate("/auth")}>शुरू करें</Button>
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
            🌱 स्मार्ट खेती सहायक
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground">
            किसानों को <span className="text-primary">स्मार्ट तकनीक</span> से सशक्त बनाना
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            वास्तविक समय का मौसम, मिट्टी की जांच (NPK), मंडी भाव और AI आधारित फसल सलाह - सब कुछ एक ही जगह पर।
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Button size="lg" className="text-lg px-8 h-14" onClick={() => navigate("/auth")}>
              डैशबोर्ड खोलें <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto mt-24 px-4 w-full">
          <FeatureCard 
            icon={<Sun className="h-8 w-8 text-orange-500" />}
            title="मौसम का हाल"
            description="आपके खेत के लिए तापमान, नमी और बारिश का पूर्वानुमान।"
          />
          <FeatureCard 
            icon={<Leaf className="h-8 w-8 text-green-500" />}
            title="NPK सेंसर"
            description="मिट्टी की सेहत और नाइट्रोजन, फास्फोरस, पोटाश की जानकारी।"
          />
          <FeatureCard 
            icon={<TrendingUp className="h-8 w-8 text-blue-500" />}
            title="मंडी भाव"
            description="अपनी फसलों के लिए नवीनतम मंडी भाव जानें।"
          />
          <FeatureCard 
            icon={<Sprout className="h-8 w-8 text-purple-500" />}
            title="AI सलाह"
            description="मिट्टी और मौसम के आधार पर फसल की स्मार्ट सलाह।"
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-muted-foreground border-t">
        <p>© 2024 कृषि सारथी. भारतीय कृषि को सशक्त बनाना।</p>
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