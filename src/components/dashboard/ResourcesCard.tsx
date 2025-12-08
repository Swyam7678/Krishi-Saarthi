import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Youtube, ExternalLink, PlayCircle } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

export function ResourcesCard() {
  const { t } = useLanguage();

  const resources = [
    {
      title: "Modern Farming Techniques",
      channel: "Indian Farmer",
      url: "https://www.youtube.com/c/IndianFarmer",
      description: "Learn about latest farming methods and tools.",
      color: "text-green-600"
    },
    {
      title: "Drip Irrigation Guide",
      channel: "Farming Leader",
      url: "https://www.youtube.com/results?search_query=drip+irrigation+system+installation+hindi",
      description: "Complete guide to installing drip irrigation.",
      color: "text-blue-600"
    },
    {
      title: "Organic Farming Tips",
      channel: "Kheti Ki Shaan",
      url: "https://www.youtube.com/results?search_query=organic+farming+techniques+india",
      description: "Tips for sustainable and organic farming.",
      color: "text-green-700"
    },
    {
      title: "Government Schemes Info",
      channel: "Hello Kisaan",
      url: "https://www.youtube.com/results?search_query=government+schemes+for+farmers+india",
      description: "Latest updates on farmer schemes.",
      color: "text-orange-600"
    }
  ];

  return (
    <Card className="h-full shadow-sm hover:shadow-md transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Youtube className="h-5 w-5 text-red-600" />
          <span>{t('resources_title')}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          {resources.map((resource, index) => (
            <div key={index} className="group flex items-start justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <PlayCircle className={`h-4 w-4 ${resource.color}`} />
                  <h4 className="font-medium leading-none group-hover:text-primary transition-colors">{resource.title}</h4>
                </div>
                <p className="text-sm text-muted-foreground pl-6">{resource.channel}</p>
                <p className="text-xs text-muted-foreground/80 pl-6 line-clamp-1">{resource.description}</p>
              </div>
              <Button variant="ghost" size="icon" className="shrink-0" asChild>
                <a href={resource.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                </a>
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
