import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Volume2, VolumeX, Share2, Droplets, Sprout, Leaf, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { Progress } from "@/components/ui/progress";

export interface NPKData {
  n: number;
  p: number;
  k: number;
  moisture?: number;
  status: { n: string; p: string; k: string; moisture?: string };
  isFallback?: boolean;
  timestamp?: number;
}

interface ReportTabProps {
  npkData: NPKData | null;
  fertilizers: string[];
  crops: string[];
  isLoading: boolean;
  isSpeaking: boolean;
  onSpeak: () => void;
  onShare: () => void;
}

export function ReportTab({ 
  npkData, 
  fertilizers, 
  crops, 
  isLoading, 
  isSpeaking, 
  onSpeak, 
  onShare 
}: ReportTabProps) {
  const { t, language } = useLanguage();

  // Helper to determine color based on value (simplified logic)
  const getStatusColor = (value: number, type: 'n' | 'p' | 'k') => {
    if (type === 'n') return value < 100 ? "text-red-500" : value > 200 ? "text-yellow-500" : "text-green-500";
    if (type === 'p') return value < 30 ? "text-red-500" : value > 80 ? "text-yellow-500" : "text-green-500";
    return value < 150 ? "text-red-500" : value > 300 ? "text-yellow-500" : "text-green-500";
  };

  const getProgressValue = (value: number, max: number) => Math.min((value / max) * 100, 100);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-muted/5">
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-6">
            {/* Welcome Message */}
            <div className="flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                <MessageCircle className="h-4 w-4 text-primary" />
              </div>
              <div className="bg-white dark:bg-card border rounded-2xl rounded-tl-none p-3 shadow-sm text-sm max-w-[90%]">
                <p>{t('chatbot_welcome')}</p>
              </div>
            </div>

            {/* NPK Analysis Card */}
            {npkData ? (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                <div className="flex items-center justify-between px-1">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    {t('live_npk')}
                  </h3>
                  {npkData.isFallback && (
                    <Badge variant="outline" className="text-[10px] h-5 border-yellow-500 text-yellow-600 bg-yellow-50">
                      Simulation
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Nitrogen */}
                  <div className="bg-white dark:bg-card p-3 rounded-xl border shadow-sm space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-muted-foreground">Nitrogen (N)</span>
                      <span className={`font-bold ${getStatusColor(npkData.n, 'n')}`}>{npkData.n}</span>
                    </div>
                    <Progress value={getProgressValue(npkData.n, 250)} className="h-2" indicatorClassName={npkData.n < 100 ? "bg-red-500" : "bg-green-500"} />
                    <p className="text-[10px] text-muted-foreground text-right">mg/kg</p>
                  </div>

                  {/* Phosphorus */}
                  <div className="bg-white dark:bg-card p-3 rounded-xl border shadow-sm space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-muted-foreground">Phosphorus (P)</span>
                      <span className={`font-bold ${getStatusColor(npkData.p, 'p')}`}>{npkData.p}</span>
                    </div>
                    <Progress value={getProgressValue(npkData.p, 100)} className="h-2" indicatorClassName={npkData.p < 30 ? "bg-red-500" : "bg-green-500"} />
                    <p className="text-[10px] text-muted-foreground text-right">mg/kg</p>
                  </div>

                  {/* Potassium */}
                  <div className="bg-white dark:bg-card p-3 rounded-xl border shadow-sm space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-muted-foreground">Potassium (K)</span>
                      <span className={`font-bold ${getStatusColor(npkData.k, 'k')}`}>{npkData.k}</span>
                    </div>
                    <Progress value={getProgressValue(npkData.k, 350)} className="h-2" indicatorClassName={npkData.k < 150 ? "bg-red-500" : "bg-green-500"} />
                    <p className="text-[10px] text-muted-foreground text-right">mg/kg</p>
                  </div>
                </div>

                {/* Moisture & Timestamp */}
                <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                  {npkData.moisture !== undefined && (
                    <div className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-md border border-blue-100 dark:border-blue-800">
                      <Droplets className="h-3 w-3" />
                      <span>{t('moisture')}: <strong>{npkData.moisture}%</strong></span>
                    </div>
                  )}
                  {npkData.timestamp && (
                    <span>{new Date(npkData.timestamp).toLocaleTimeString()}</span>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center space-y-3 animate-pulse">
                <div className="h-24 w-full bg-muted/20 rounded-xl" />
                <p className="text-sm text-muted-foreground">Analyzing soil data...</p>
              </div>
            )}

            {/* Recommendations Section */}
            {npkData && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
                
                {/* Fertilizer Recommendations */}
                <div className="bg-white dark:bg-card rounded-xl border shadow-sm overflow-hidden">
                  <div className="bg-orange-50 dark:bg-orange-900/10 px-4 py-3 border-b border-orange-100 dark:border-orange-900/20 flex items-center gap-2">
                    <div className="bg-orange-100 dark:bg-orange-900/30 p-1.5 rounded-full">
                      <Sprout className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    </div>
                    <h3 className="font-semibold text-sm text-orange-900 dark:text-orange-100">
                      {t('fertilizer_rec')}
                    </h3>
                  </div>
                  <div className="p-4">
                    {fertilizers.length > 0 ? (
                      <ul className="space-y-2">
                        {fertilizers.map((f, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <AlertTriangle className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Soil nutrients are balanced!</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Crop Recommendations (Low Cost / Natural) */}
                <div className="bg-white dark:bg-card rounded-xl border shadow-sm overflow-hidden">
                  <div className="bg-green-50 dark:bg-green-900/10 px-4 py-3 border-b border-green-100 dark:border-green-900/20 flex items-center gap-2">
                    <div className="bg-green-100 dark:bg-green-900/30 p-1.5 rounded-full">
                      <Leaf className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex flex-col">
                      <h3 className="font-semibold text-sm text-green-900 dark:text-green-100">
                        {t('crop_rec')}
                      </h3>
                      <span className="text-[10px] text-green-700 dark:text-green-300 opacity-80">
                        {language === 'en' ? "Best suited for current soil condition" : "वर्तमान मिट्टी की स्थिति के लिए उपयुक्त"}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex flex-wrap gap-2">
                      {crops.map((c, i) => (
                        <Badge 
                          key={i} 
                          variant="secondary" 
                          className="px-3 py-1.5 text-sm bg-green-50 text-green-700 hover:bg-green-100 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800"
                        >
                          {c}
                        </Badge>
                      ))}
                    </div>
                    <p className="mt-3 text-xs text-muted-foreground italic">
                      {language === 'en' 
                        ? "* These crops can grow with minimal additional fertilizers based on your current soil health."
                        : "* ये फसलें आपकी वर्तमान मिट्टी के स्वास्थ्य के आधार पर कम से कम अतिरिक्त खाद के साथ उग सकती हैं।"}
                    </p>
                  </div>
                </div>

              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>

      <CardFooter className="p-3 bg-background border-t flex gap-2 shrink-0">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1 gap-2 h-10"
          onClick={onSpeak}
        >
          {isSpeaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          {isSpeaking ? t('stop_reading') : t('read_aloud')}
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1 gap-2 h-10 text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
          onClick={onShare}
        >
          <Share2 className="h-4 w-4" />
          WhatsApp
        </Button>
      </CardFooter>
    </div>
  );
}