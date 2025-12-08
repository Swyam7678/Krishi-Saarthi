import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ExternalLink, BookOpen, ShieldCheck, Sprout, Coins, Loader2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect } from "react";

export function SchemesCard() {
  const { t } = useLanguage();
  const schemes = useQuery(api.schemes.getSchemes);
  const seedSchemes = useMutation(api.schemes.seed);

  useEffect(() => {
    // Auto-seed if empty (for demo purposes)
    if (schemes && schemes.length === 0) {
      seedSchemes();
    }
  }, [schemes, seedSchemes]);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "coins": return <Coins className="h-5 w-5 text-yellow-600" />;
      case "shield": return <ShieldCheck className="h-5 w-5 text-blue-600" />;
      case "sprout": return <Sprout className="h-5 w-5 text-green-600" />;
      case "book": return <BookOpen className="h-5 w-5 text-orange-600" />;
      default: return <BookOpen className="h-5 w-5 text-primary" />;
    }
  };

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
          {!schemes ? (
            <div className="flex items-center justify-center h-full py-10">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-4">
              {schemes.map((scheme) => (
                <div key={scheme._id} className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors group">
                  <div className="mt-1 bg-background p-2 rounded-full border shadow-sm group-hover:scale-110 transition-transform">
                    {getIcon(scheme.icon)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <h4 className="font-semibold leading-none text-lg">
                      {/* Try to translate using ID, fallback to DB title */}
                      {t(`scheme_${scheme.schemeId}_title` as any) !== `scheme_${scheme.schemeId}_title` 
                        ? t(`scheme_${scheme.schemeId}_title` as any) 
                        : scheme.title}
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {t(`scheme_${scheme.schemeId}_desc` as any) !== `scheme_${scheme.schemeId}_desc`
                        ? t(`scheme_${scheme.schemeId}_desc` as any)
                        : scheme.description}
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
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}