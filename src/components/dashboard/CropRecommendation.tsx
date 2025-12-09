import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/convex/_generated/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction, useQuery } from "convex/react";
import { BrainCircuit, Loader2, Sprout, RotateCcw, Zap, History, Calendar } from "lucide-react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import ReactMarkdown from 'react-markdown';
import { useLanguage } from "@/lib/i18n";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";

interface CropRecommendationProps {
  npkData?: {
    n: number;
    p: number;
    k: number;
    moisture?: number;
  } | null;
}

const formSchema = z.object({
  nitrogen: z.coerce.number().min(0).max(200),
  phosphorus: z.coerce.number().min(0).max(200),
  potassium: z.coerce.number().min(0).max(200),
  soilType: z.string().min(1),
  ph: z.coerce.number().min(0).max(14),
  rainfall: z.coerce.number().min(0),
  temperature: z.coerce.number().min(-50).max(60),
  humidity: z.coerce.number().min(0).max(100),
});

export function CropRecommendation({ npkData }: CropRecommendationProps) {
  const [result, setResult] = useState<string | null>(null);
  const generateRecommendation = useAction(api.ai.generateCropRecommendation);
  const history = useQuery(api.recommendations.getUserRecommendations);
  const { t, language } = useLanguage();

  const [soilType, setSoilType] = useState("Loamy");
  const [ph, setPh] = useState(6.5);
  const [rainfall, setRainfall] = useState(100);
  const [temperature, setTemperature] = useState(25);
  const [isLoading, setIsLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<any>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      nitrogen: 50,
      phosphorus: 50,
      potassium: 50,
      soilType: "Loamy",
      ph: 6.5,
      rainfall: 100,
      temperature: 25,
      humidity: 60,
    },
  });

  const handleUseLiveData = () => {
    if (npkData) {
      form.setValue("nitrogen", npkData.n);
      form.setValue("phosphorus", npkData.p);
      form.setValue("potassium", npkData.k);
      if (npkData.moisture) {
        // Map moisture to humidity as a proxy if needed, or just keep it separate
        // For now, we'll just set NPK as that's the core data
      }
      toast.success(t('success'));
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);
      setResult(null); // Clear previous result while loading
      // Mock recommendation for now since the AI action might need specific return type handling
      // In a real scenario, we would parse the response
      const response = await generateRecommendation({ ...values, lang: language });
      
      // Simple parsing or direct usage depending on response format
      setRecommendation({
        crop: "Suggested Crop", 
        reason: response
      });
      
      toast.success(t('success'));
    } catch (error) {
      toast.error(t('error'));
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleGetRecommendation = () => {
    // Manually trigger form submission with current state values
    const values = {
      nitrogen: form.getValues("nitrogen"),
      phosphorus: form.getValues("phosphorus"),
      potassium: form.getValues("potassium"),
      soilType,
      ph,
      rainfall,
      temperature,
      humidity: form.getValues("humidity")
    };
    onSubmit(values);
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BrainCircuit className="h-5 w-5 text-primary" />
          {t('ai_title')}
        </CardTitle>
        <CardDescription>
          {t('ai_desc') || "Get personalized crop suggestions based on soil health"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('soil_type')}</Label>
                <Select value={soilType} onValueChange={setSoilType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="loamy">{t('loamy')}</SelectItem>
                    <SelectItem value="sandy">{t('sandy')}</SelectItem>
                    <SelectItem value="clay">{t('clay')}</SelectItem>
                    <SelectItem value="silt">{t('silt')}</SelectItem>
                    <SelectItem value="peaty">{t('peaty')}</SelectItem>
                    <SelectItem value="chalky">{t('chalky')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('ph_level')}</Label>
                <Input 
                  type="number" 
                  step="0.1" 
                  value={ph} 
                  onChange={(e) => setPh(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('rainfall_mm')}</Label>
                <Input 
                  type="number" 
                  value={rainfall} 
                  onChange={(e) => setRainfall(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('temp_c')}</Label>
                <Input 
                  type="number" 
                  value={temperature} 
                  onChange={(e) => setTemperature(parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            <Button 
              className="w-full" 
              onClick={handleGetRecommendation}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('analyzing')}
                </>
              ) : (
                <>
                  <Sprout className="mr-2 h-4 w-4" />
                  {t('get_suggestion')}
                </>
              )}
            </Button>

            {recommendation && (
              <div className="mt-4 space-y-4">
                <Alert>
                  <Sprout className="h-4 w-4" />
                  <AlertTitle>{t('crop_rec')}</AlertTitle>
                  <AlertDescription className="mt-2">
                    <div className="font-medium text-lg">{recommendation.crop}</div>
                    <div className="text-muted-foreground mt-1 text-sm">{recommendation.reason}</div>
                  </AlertDescription>
                </Alert>
              </div>
            )}
            
            {!recommendation && !isLoading && (
              <div className="text-center text-muted-foreground py-8">
                {t('fill_details')}
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}