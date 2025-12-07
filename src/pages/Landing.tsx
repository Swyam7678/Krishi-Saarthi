import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Sprout, CloudSun, TrendingUp, BrainCircuit } from "lucide-react";
import { Link } from "react-router";
import { useLanguage } from "@/lib/i18n";

export default function Landing() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero Section */}
      <header className="w-full py-6 px-4 md:px-8 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-2 font-bold text-2xl text-primary">
          <Sprout className="h-8 w-8" />
          {t('app_name')}
        </div>
        <Link to="/auth">
          <Button>{t('login_title')}</Button>
        </Link>
      </header>

      <main className="flex-1">
        <section className="py-20 px-4 text-center space-y-6 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-primary">
            {t('hero_title')}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('hero_desc')}
          </p>
          <div className="flex justify-center gap-4 pt-4">
            <Link to="/auth">
              <Button size="lg" className="gap-2">
                {t('get_started')} <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">{t('features')}</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <FeatureCard 
                icon={<CloudSun className="h-10 w-10 text-blue-500" />}
                title={t('feature_weather')}
                desc={t('feature_weather_desc')}
              />
              <FeatureCard 
                icon={<Sprout className="h-10 w-10 text-green-500" />}
                title={t('feature_soil')}
                desc={t('feature_soil_desc')}
              />
              <FeatureCard 
                icon={<TrendingUp className="h-10 w-10 text-orange-500" />}
                title={t('feature_market')}
                desc={t('feature_market_desc')}
              />
              <FeatureCard 
                icon={<BrainCircuit className="h-10 w-10 text-purple-500" />}
                title={t('feature_ai')}
                desc={t('feature_ai_desc')}
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="py-6 text-center text-sm text-muted-foreground border-t">
        © {new Date().getFullYear()} {t('app_name')}. All rights reserved.
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <Card className="text-center hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="mx-auto mb-2 bg-background p-3 rounded-full shadow-sm inline-block">
          {icon}
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{desc}</p>
      </CardContent>
    </Card>
  );
}