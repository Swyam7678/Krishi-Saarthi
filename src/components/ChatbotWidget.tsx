import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { MessageCircle, X, Send, Mic, Volume2, VolumeX, Share2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface ChatbotWidgetProps {
  npkData: {
    n: number;
    p: number;
    k: number;
    status: { n: string; p: string; k: string };
  } | null;
}

export function ChatbotWidget({ npkData }: ChatbotWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { t, language } = useLanguage();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Recommendation Logic
  const getRecommendations = () => {
    if (!npkData) return { fertilizers: [], crops: [] };

    const fertilizers = [];
    const crops = [];
    let isHealthy = true;

    // Nitrogen Logic
    if (npkData.n < 100) { // Low
      fertilizers.push(t('low_n_fert'));
      crops.push(language === 'en' ? "Millets" : "बाजरा (Millets)", language === 'en' ? "Pulses" : "दालें (Pulses)");
      isHealthy = false;
    }

    // Phosphorus Logic
    if (npkData.p < 100) { // Low
      fertilizers.push(t('low_p_fert'));
      crops.push(language === 'en' ? "Pulses" : "दालें (Pulses)", language === 'en' ? "Groundnut" : "मूंगफली (Groundnut)");
      isHealthy = false;
    }

    // Potassium Logic
    if (npkData.k < 150) { // Low
      fertilizers.push(t('low_k_fert'));
      crops.push(language === 'en' ? "Millets" : "बाजरा (Millets)");
      isHealthy = false;
    }

    if (isHealthy) {
      fertilizers.push(t('healthy_soil'));
      crops.push(
        language === 'en' ? "Wheat" : "गेहूँ (Wheat)", 
        language === 'en' ? "Rice" : "धान (Rice)", 
        language === 'en' ? "Sugarcane" : "गन्ना (Sugarcane)"
      );
    }

    return { 
      fertilizers: [...new Set(fertilizers)], 
      crops: [...new Set(crops)] 
    };
  };

  const { fertilizers, crops } = getRecommendations();

  const handleSpeak = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    if (!npkData) return;

    const text = `
      ${t('chatbot_welcome')}
      ${t('nitrogen')}: ${npkData.n}, ${t('phosphorus')}: ${npkData.p}, ${t('potassium')}: ${npkData.k}.
      ${t('fertilizer_rec')}: ${fertilizers.join(", ")}.
      ${t('crop_rec')}: ${crops.join(", ")}.
    `;

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Try to set language
    if (language === 'hi') utterance.lang = 'hi-IN';
    else if (language === 'en') utterance.lang = 'en-IN';
    // Add other languages if supported by browser

    utterance.onend = () => setIsSpeaking(false);
    speechRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const handleWhatsAppShare = () => {
    if (!npkData) return;
    const text = `*KrishiSaarthi Report* 🌱\n\n*NPK Values:*\nN: ${npkData.n}\nP: ${npkData.p}\nK: ${npkData.k}\n\n*Fertilizers:* ${fertilizers.join(", ")}\n*Crops:* ${crops.join(", ")}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // Stop speaking when closed
  useEffect(() => {
    if (!isOpen) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [isOpen]);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
      {isOpen && (
        <Card className="w-[350px] h-[500px] mb-4 shadow-2xl border-2 border-primary/20 flex flex-col animate-in slide-in-from-bottom-10 fade-in duration-300">
          <CardHeader className="bg-primary text-primary-foreground py-3 px-4 rounded-t-lg flex flex-row justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="bg-white/20 p-1.5 rounded-full">
                <MessageCircle className="h-5 w-5" />
              </div>
              <CardTitle className="text-base">{t('chatbot_title')}</CardTitle>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/20 text-primary-foreground" onClick={() => setIsOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </CardHeader>
          
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
                      <p className="font-semibold text-primary">{t('live_npk')}:</p>
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
                      </div>
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

          <CardFooter className="p-3 bg-background border-t flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 gap-2"
              onClick={handleSpeak}
            >
              {isSpeaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              {isSpeaking ? t('stop_reading') : t('read_aloud')}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 gap-2 text-green-600 hover:text-green-700 hover:bg-green-50"
              onClick={handleWhatsAppShare}
            >
              <Share2 className="h-4 w-4" />
              WhatsApp
            </Button>
          </CardFooter>
        </Card>
      )}

      <Button
        onClick={() => setIsOpen(!isOpen)}
        size="lg"
        className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-primary hover:bg-primary/90"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </Button>
    </div>
  );
}
