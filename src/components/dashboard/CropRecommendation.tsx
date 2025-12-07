import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/convex/_generated/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "convex/react";
import { BrainCircuit, Loader2, Sprout, RotateCcw } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import ReactMarkdown from 'react-markdown';
import { useLanguage } from "@/lib/i18n";

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

export function CropRecommendation() {
  const [result, setResult] = useState<string | null>(null);
  const generateRecommendation = useAction(api.ai.generateCropRecommendation);
  const { t, language } = useLanguage();

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

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setResult(null); // Clear previous result while loading
      const response = await generateRecommendation({ ...values, lang: language });
      setResult(response);
      toast.success(t('success'));
    } catch (error) {
      toast.error(t('error'));
      console.error(error);
    }
  }

  return (
    <Card className="h-full border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <BrainCircuit className="h-5 w-5 text-purple-600" />
          <span>{t('ai_title')}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="nitrogen"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('nitrogen')}</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phosphorus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('phosphorus')}</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="potassium"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('potassium')}</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="ph"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('ph_level')}</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="rainfall"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('rainfall_mm')}</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="temperature"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('temp_c')}</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="humidity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('humidity_percent')}</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="soilType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('soil_type')}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('soil_type')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Loamy">{t('loamy')}</SelectItem>
                          <SelectItem value="Sandy">{t('sandy')}</SelectItem>
                          <SelectItem value="Clay">{t('clay')}</SelectItem>
                          <SelectItem value="Silt">{t('silt')}</SelectItem>
                          <SelectItem value="Peaty">{t('peaty')}</SelectItem>
                          <SelectItem value="Chalky">{t('chalky')}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1 bg-purple-600 hover:bg-purple-700" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? (
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
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    form.reset();
                    setResult(null);
                  }}
                  disabled={form.formState.isSubmitting}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </Form>

          <div className="bg-muted/30 rounded-lg p-4 overflow-y-auto max-h-[400px] custom-scrollbar">
            {result ? (
              <div className="prose prose-sm dark:prose-invert max-w-none animate-in fade-in duration-500">
                <ReactMarkdown>{result}</ReactMarkdown>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-center p-4">
                <Sprout className="h-12 w-12 mb-2 opacity-20" />
                <p>{t('fill_details')}</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}