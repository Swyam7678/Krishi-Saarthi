import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ExternalLink, BookOpen, ShieldCheck, Sprout, Coins } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

export function SchemesCard() {
  const { t } = useLanguage();

  const schemes = [
    {
      id: "pm_kisan",
      icon: <Coins className="h-5 w-5 text-yellow-600" />,
      link: "https://pmkisan.gov.in/"
    },
    {
      id: "pmfby",
      icon: <ShieldCheck className="h-5 w-5 text-blue-600" />,
      link: "https://pmfby.gov.in/"
    },
    {
      id: "shc",
      icon: <Sprout className="h-5 w-5 text-green-600" />,
      link: "https://soilhealth.dac.gov.in/"
    },
    {
      id: "pkvy",
      icon: <BookOpen className="h-5 w-5 text-orange-600" />,
      link: "https://pgsindia-ncof.gov.in/pkvy/index.aspx"
    }
  ];

  return (
    <Card className="h-full flex flex-col shadow-sm hover:shadow-md transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <BookOpen className="h-6 w-6 text-primary" />
          {t('schemes_title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-[400px] px-6 pb-6">
          <div className="space-y-4">
            {schemes.map((scheme) => (
              <div key={scheme.id} className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors group">
                <div className="mt-1 bg-background p-2 rounded-full border shadow-sm group-hover:scale-110 transition-transform">
                  {scheme.icon}
                </div>
                <div className="flex-1 space-y-1">
                  <h4 className="font-semibold leading-none text-lg">{t(`scheme_${scheme.id}_title` as any)}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t(`scheme_${scheme.id}_desc` as any)}
                  </p>
                  <Button variant="link" className="h-auto p-0 text-primary mt-2 font-medium" asChild>
                    <a href={scheme.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                      {t('view_details')} <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}