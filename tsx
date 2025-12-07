import { useEffect, useState } from 'react';
import { Language } from 'types';
import { DropdownMenuItem } from 'components';

const FeatureCard = ({ icon, title, desc }) => {
  return (
    <div className="mx-auto mb-2 bg-background p-3 rounded-full shadow-sm inline-block">
      {icon}
    </div>
  );
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('hi'); // Default to Hindi

  useEffect(() => {
    const savedLang = localStorage.getItem('app-language') as Language;
    // Allow any valid language from the Language type
    if (savedLang && ['en', 'hi', 'pa', 'mr', 'ta', 'gu', 'bn'].includes(savedLang)) {
      setLanguage(savedLang);
    }
  }, []);

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
      <FeatureCard 
        icon={<CloudSun className="h-10 w-10 text-blue-500" />}
        title={t('feature_weather')}
        desc={t('feature_weather_desc')}
      />
      <FeatureCard 
        icon={<CloudSun className="h-10 w-10 text-blue-500" />}
        title={t('feature_weather')}
        desc={t('feature_weather_desc')}
      />
      <FeatureCard 
        icon={<CloudSun className="h-10 w-10 text-blue-500" />}
        title={t('feature_weather')}
        desc={t('feature_weather_desc')}
      />
      <FeatureCard 
        icon={<CloudSun className="h-10 w-10 text-blue-500" />}
        title={t('feature_weather')}
        desc={t('feature_weather_desc')}
      />
    </div>
  );
}