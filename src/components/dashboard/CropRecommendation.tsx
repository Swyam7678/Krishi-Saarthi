import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/convex/_generated/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "convex/react";
import { BrainCircuit, Loader2, Sprout } from "lucide-react";
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
    resolver: zodResolver(formSchema),
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
      const response = await generateRecommendation(values);
      setResult(response);
      toast.success("Recommendation generated!");
    } catch (error) {
      toast.error("Failed to generate recommendation");
      console.error(error);
    }
  }

  return (
    <Card className="h-full border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <BrainCircuit className="h-5 w-5 text-purple-600" />
          <span>AI Crop Recommendation</span>
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
                      <FormLabel>Nitrogen (N)</FormLabel>
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
                      <FormLabel>Phosphorus (P)</FormLabel>
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
                      <FormLabel>Potassium (K)</FormLabel>
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
                      <FormLabel>pH Level</FormLabel>
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
                      <FormLabel>Rainfall (mm)</FormLabel>
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
                      <FormLabel>Soil Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select soil type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Loamy">Loamy</SelectItem>
                          <SelectItem value="Sandy">Sandy</SelectItem>
                          <SelectItem value="Clay">Clay</SelectItem>
                          <SelectItem value="Silt">Silt</SelectItem>
                          <SelectItem value="Peaty">Peaty</SelectItem>
                          <SelectItem value="Chalky">Chalky</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sprout className="mr-2 h-4 w-4" />
                    Get Recommendation
                  </>
                )}
              </Button>
            </form>
          </Form>

          <div className="bg-muted/30 rounded-lg p-4 overflow-y-auto max-h-[400px]">
            {result ? (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown>{result}</ReactMarkdown>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-center p-4">
                <Sprout className="h-12 w-12 mb-2 opacity-20" />
                <p>Enter soil details and click "Get Recommendation" to see AI suggestions.</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
