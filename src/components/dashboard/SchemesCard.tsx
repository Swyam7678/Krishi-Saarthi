import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ExternalLink, BookOpen, ShieldCheck, Sprout, Coins, Loader2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

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

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>{t('schemes_title')}</CardTitle>
        <CardDescription>
          {t('schemes_desc' as any) || "Government schemes for farmers"}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-[400px] px-6">
          <Accordion type="single" collapsible className="w-full">
            {schemes?.map((scheme) => (
              <AccordionItem key={scheme._id} value={scheme._id}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2 text-left">
                    <span className="font-semibold">{scheme.title}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pt-2">
                    <p className="text-sm text-muted-foreground">{scheme.description}</p>
                    <div className="flex items-center justify-between">
                      <Button size="sm" variant="outline" className="gap-2" asChild>
                        <a href={scheme.link} target="_blank" rel="noopener noreferrer">
                          {t('view_details')} <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}