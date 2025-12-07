import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Link } from "react-router";
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { CloudSun } from 'lucide-react';
import { t } from '@/lib/i18n';
import { Suspense, Routes, Route, RouteLoading, Landing } from '@/components';
import { lazy } from 'react';
import { TooltipProvider, LanguageProvider } from '@/components';

const [language, setLanguage] = useState<Language>(() => {
  const savedLang = localStorage.getItem('app-language') as Language;
  if (savedLang && ['en', 'hi', 'pa', 'mr', 'ta', 'gu', 'bn'].includes(savedLang)) {
    return savedLang;
  }
  return 'hi';
});

useEffect(() => {
  const savedLang = localStorage.getItem('app-language') as Language;
  // ...
    setLanguage(savedLang);
  // ...
}, []);

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold tracking-tight", className)}
      {...props}
    />
  )
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

<FeatureCard 
  icon={<CloudSun className="h-10 w-10 text-blue-500" />}
  title={t('feature_weather')}
  desc={t('feature_weather_desc')}
/>

<Suspense fallback={<RouteLoading />}>
  <Routes>
    <Route path="/" element={<Landing />} />
  </Routes>
</Suspense>

function RouteLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-muted-foreground">Loading...</div>
    </div>
  );
}
<p className="text-xl text-muted-foreground max-w-2xl mx-auto">
  {t('hero_desc')}
</p>