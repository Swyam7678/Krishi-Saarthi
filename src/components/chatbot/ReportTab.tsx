import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Volume2, VolumeX, Share2, Droplets, Sprout, Leaf, AlertTriangle, CheckCircle2, Info, ArrowDown, ArrowUp, Minus } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { getNPKStatus, getNPKProgressValue, NPK_THRESHOLDS, NPKType } from "@/lib/npk-config";

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

  // Helper to determine color based on value
  const getStatusColor = (value: number, type: NPKType) => {
    const status = getNPKStatus(value, type);
    if (status === 'low') return "text-red-500";
    if (status === 'high') return "text-amber-500";
    return "text-green-500";
  };

  const getStatusLabel = (value: number, type: NPKType) => {
    const status = getNPKStatus(value, type);
    
    if (status === 'low') return language === 'en' ? "Low" : "कम";
    if (status === 'high') return language === 'en' ? "High" : "अधिक";
    return language === 'en' ? "Optimal" : "उत्तम";
  };

  const getNutrientRole = (type: NPKType) => {
    if (type === 'n') return language === 'en' ? "Leaf Growth" : "पत्तियों का विकास";
    if (type === 'p') return language === 'en' ? "Root & Flower" : "जड़ और फूल";
    return language === 'en' ? "Overall Health" : "समग्र स्वास्थ्य";
  };

  const getStatusIcon = (value: number, type: NPKType) => {
    const status = getNPKStatus(value, type);

    if (status === 'low') return <ArrowDown className="h-3 w-3 text-red-500" />;
    if (status === 'high') return <ArrowUp className="h-3 w-3 text-amber-500" />;
    return <CheckCircle2 className="h-3 w-3 text-green-500" />;
  };

  const getIndicatorClass = (value: number, type: NPKType) => {
    const status = getNPKStatus(value, type);
    if (status === 'low') return "bg-red-500";
    if (status === 'high') return "bg-amber-500";
    return "bg-green-500";
  };

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

                <div className="grid grid-cols-1 gap-3">
                  {/* Nitrogen */}
                  <div className="bg-white dark:bg-card p-3 rounded-xl border shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 opacity-5">
                      <Leaf className="h-12 w-12" />
                    </div>
                    <div className="flex justify-between items-start mb-2 relative z-10">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-sm">Nitrogen (N)</span>
                          <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-normal bg-muted text-muted-foreground">
                            {getNutrientRole('n')}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          {getStatusIcon(npkData.n, 'n')}
                          <span className={`text-xs font-medium ${getStatusColor(npkData.n, 'n')}`}>
                            {getStatusLabel(npkData.n, 'n')}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-xl font-bold ${getStatusColor(npkData.n, 'n')}`}>{npkData.n}</span>
                        <p className="text-[10px] text-muted-foreground">mg/kg</p>
                      </div>
                    </div>
                    <Progress 
                      value={getNPKProgressValue(npkData.n, 'n')} 
                      className="h-2.5 bg-muted/50" 
                      indicatorClassName={getIndicatorClass(npkData.n, 'n')} 
                    />
                    <div className="flex justify-between text-[10px] text-muted-foreground mt-1 px-0.5">
                      <span>0</span>
                      <span>{NPK_THRESHOLDS.n.low}</span>
                      <span>{NPK_THRESHOLDS.n.high}+</span>
                    </div>
                  </div>

                  {/* Phosphorus */}
                  <div className="bg-white dark:bg-card p-3 rounded-xl border shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 opacity-5">
                      <Sprout className="h-12 w-12" />
                    </div>
                    <div className="flex justify-between items-start mb-2 relative z-10">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-sm">Phosphorus (P)</span>
                          <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-normal bg-muted text-muted-foreground">
                            {getNutrientRole('p')}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          {getStatusIcon(npkData.p, 'p')}
                          <span className={`text-xs font-medium ${getStatusColor(npkData.p, 'p')}`}>
                            {getStatusLabel(npkData.p, 'p')}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-xl font-bold ${getStatusColor(npkData.p, 'p')}`}>{npkData.p}</span>
                        <p className="text-[10px] text-muted-foreground">mg/kg</p>
                      </div>
                    </div>
                    <Progress 
                      value={getNPKProgressValue(npkData.p, 'p')} 
                      className="h-2.5 bg-muted/50" 
                      indicatorClassName={getIndicatorClass(npkData.p, 'p')} 
                    />
                    <div className="flex justify-between text-[10px] text-muted-foreground mt-1 px-0.5">
                      <span>0</span>
                      <span>{NPK_THRESHOLDS.p.low}</span>
                      <span>{NPK_THRESHOLDS.p.high}+</span>
                    </div>
                  </div>

                  {/* Potassium */}
                  <div className="bg-white dark:bg-card p-3 rounded-xl border shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 opacity-5">
                      <Droplets className="h-12 w-12" />
                    </div>
                    <div className="flex justify-between items-start mb-2 relative z-10">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-sm">Potassium (K)</span>
                          <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-normal bg-muted text-muted-foreground">
                            {getNutrientRole('k')}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          {getStatusIcon(npkData.k, 'k')}
                          <span className={`text-xs font-medium ${getStatusColor(npkData.k, 'k')}`}>
                            {getStatusLabel(npkData.k, 'k')}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-xl font-bold ${getStatusColor(npkData.k, 'k')}`}>{npkData.k}</span>
                        <p className="text-[10px] text-muted-foreground">mg/kg</p>
                      </div>
                    </div>
                    <Progress 
                      value={getNPKProgressValue(npkData.k, 'k')} 
                      className="h-2.5 bg-muted/50" 
                      indicatorClassName={getIndicatorClass(npkData.k, 'k')} 
                    />
                    <div className="flex justify-between text-[10px] text-muted-foreground mt-1 px-0.5">
                      <span>0</span>
                      <span>{NPK_THRESHOLDS.k.low}</span>
                      <span>{NPK_THRESHOLDS.k.high}+</span>
                    </div>
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