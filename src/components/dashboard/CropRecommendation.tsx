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

const formSchema = z.object({
  nitrogen: z.coerce.number().min(0).max(200),
  phosphorus: z.coerce.number().min(0).max(200),
  potassium: z.coerce.number().min(0).max(200),
  soilType: z.string().min(1),
  ph: z.coerce.number().min(0).max(14),
  rainfall: z.coerce.number().min(0),
});

export function CropRecommendation() {
  const [result, setResult] = useState<string | null>(null);
  const generateRecommendation = useAction(api.ai.generateCropRecommendation);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      nitrogen: 50,
      phosphorus: 50,
      potassium: 50,
      soilType: "Loamy",
      ph: 6.5,
      rainfall: 100,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setResult(null); // Clear previous result while loading
      const response = await generateRecommendation(values);
      setResult(response);
      toast.success("सिफारिश तैयार है!");
    } catch (error) {
      toast.error("सिफारिश उत्पन्न करने में विफल");
      console.error(error);
    }
  }

  return (
    <Card className="h-full border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <BrainCircuit className="h-5 w-5 text-purple-600" />
          <span>AI फसल सुझाव</span>
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
                      <FormLabel>नाइट्रोजन (N)</FormLabel>
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
                      <FormLabel>फॉस्फोरस (P)</FormLabel>
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
                      <FormLabel>पोटैशियम (K)</FormLabel>
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
                      <FormLabel>pH स्तर</FormLabel>
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
                      <FormLabel>वर्षा (mm)</FormLabel>
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
                      <FormLabel>मिट्टी का प्रकार</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="मिट्टी का प्रकार चुनें" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Loamy">दोमट (Loamy)</SelectItem>
                          <SelectItem value="Sandy">रेतीली (Sandy)</SelectItem>
                          <SelectItem value="Clay">चिकनी (Clay)</SelectItem>
                          <SelectItem value="Silt">गाद (Silt)</SelectItem>
                          <SelectItem value="Peaty">पीट (Peaty)</SelectItem>
                          <SelectItem value="Chalky">चूना (Chalky)</SelectItem>
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
                      विश्लेषण कर रहा है...
                    </>
                  ) : (
                    <>
                      <Sprout className="mr-2 h-4 w-4" />
                      सुझाव प्राप्त करें
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
                <p>मिट्टी का विवरण दर्ज करें और "सुझाव प्राप्त करें" पर क्लिक करें।</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}