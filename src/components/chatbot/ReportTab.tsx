import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Volume2, VolumeX, Share2, Droplets } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

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
  const { t } = useLanguage();

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <CardContent className="flex-1 overflow-hidden p-0 bg-muted/10">
        <ScrollArea className="h-full p-4">
          <div className="space-y-4">
            {/* Welcome Message */}
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                <MessageCircle className="h-4 w-4 text-primary" />
              </div>
              <div className="bg-white dark:bg-card border rounded-2xl rounded-tl-none p-3 shadow-sm text-sm max-w-[85%]">
                <p>{t('chatbot_welcome')}</p>
              </div>
            </div>

            {/* NPK Data Card */}
            {npkData ? (
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                  <MessageCircle className="h-4 w-4 text-primary" />
                </div>
                <div className="bg-white dark:bg-card border rounded-2xl rounded-tl-none p-3 shadow-sm text-sm max-w-[85%] space-y-3 w-full">
                  <div className="flex justify-between items-center">
                    <p className="font-semibold text-primary">{t('live_npk')}:</p>
                    {npkData.isFallback && (
                      <Badge variant="outline" className="text-[10px] h-5 border-yellow-500 text-yellow-600 bg-yellow-50">
                        Simulation
                      </Badge>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded border border-green-100 dark:border-green-800">
                      <div className="text-xs text-muted-foreground">N</div>
                      <div className="font-bold text-green-700 dark:text-green-400">{npkData.n}</div>
                    </div>
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded border border-yellow-100 dark:border-yellow-800">
                      <div className="text-xs text-muted-foreground">P</div>
                      <div className="font-bold text-yellow-700 dark:text-yellow-400">{npkData.p}</div>
                    </div>
                    <div className="bg-orange-50 dark:bg-orange-900/20 p-2 rounded border border-orange-100 dark:border-orange-800">
                      <div className="text-xs text-muted-foreground">K</div>
                      <div className="font-bold text-orange-700 dark:text-orange-400">{npkData.k}</div>
                    </div>
                    
                    {npkData.moisture !== undefined && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded border border-blue-100 dark:border-blue-800 col-span-3 mt-1 flex items-center justify-center gap-2">
                        <Droplets className="h-3 w-3 text-blue-500" />
                        <div className="text-xs text-muted-foreground">{t('moisture')}</div>
                        <div className="font-bold text-blue-700 dark:text-blue-400">{npkData.moisture}%</div>
                      </div>
                    )}
                  </div>
                  
                  {npkData.timestamp && (
                    <p className="text-[10px] text-muted-foreground text-right flex justify-end items-center gap-1">
                      {isLoading && <span className="text-primary animate-pulse">Updating...</span>}
                      {new Date(npkData.timestamp).toLocaleTimeString()}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                  <MessageCircle className="h-4 w-4 text-primary" />
                </div>
                <div className="bg-white dark:bg-card border rounded-2xl rounded-tl-none p-3 shadow-sm text-sm max-w-[85%]">
                  <p className="animate-pulse">Loading data...</p>
                </div>
              </div>
            )}

            {/* Recommendations */}
            {npkData && (
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                  <MessageCircle className="h-4 w-4 text-primary" />
                </div>
                <div className="bg-white dark:bg-card border rounded-2xl rounded-tl-none p-3 shadow-sm text-sm max-w-[85%] space-y-3">
                  <div>
                    <p className="font-semibold text-primary mb-1">{t('fertilizer_rec')}:</p>
                    <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                      {fertilizers.map((f, i) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="border-t pt-2">
                    <p className="font-semibold text-primary mb-1">{t('crop_rec')}:</p>
                    <div className="flex flex-wrap gap-1">
                      {crops.map((c, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">{c}</Badge>
                      ))}
                    </div>
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
          className="flex-1 gap-2"
          onClick={onSpeak}
        >
          {isSpeaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          {isSpeaking ? t('stop_reading') : t('read_aloud')}
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1 gap-2 text-green-600 hover:text-green-700 hover:bg-green-50"
          onClick={onShare}
        >
          <Share2 className="h-4 w-4" />
          WhatsApp
        </Button>
      </CardFooter>
    </div>
  );
}
