import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, X, RefreshCw, Loader2, VolumeX } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ReportTab, NPKData } from "@/components/chatbot/ReportTab";
import { ChatTab } from "@/components/chatbot/ChatTab";

interface ChatbotWidgetProps {
  npkData: NPKData | null;
  onRefresh?: () => void;
  isLoading?: boolean;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export function ChatbotWidget({ npkData, onRefresh, isLoading = false }: ChatbotWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { t, language } = useLanguage();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  
  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatAction = useAction(api.ai.chat);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Recommendation Logic
  const getRecommendations = () => {
    if (!npkData) return { fertilizers: [], crops: [] };

    const fertilizers: string[] = [];
    const crops: string[] = [];
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

  const speakText = (text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    const langMap: Record<string, string> = {
      'en': 'en-IN',
      'hi': 'hi-IN',
      'pa': 'pa-IN',
      'mr': 'mr-IN',
      'ta': 'ta-IN',
      'gu': 'gu-IN',
      'bn': 'bn-IN'
    };
    utterance.lang = langMap[language] || 'en-IN';

    utterance.onend = () => setIsSpeaking(false);
    speechRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const handleSpeak = () => {
    if (isSpeaking) {
      stopSpeaking();
      return;
    }

    if (!npkData) return;

    const text = `
      ${t('chatbot_welcome')}\n
      ${t('nitrogen')}: ${npkData.n}, ${t('phosphorus')}: ${npkData.p}, ${t('potassium')}: ${npkData.k}.\n
      ${t('fertilizer_rec')}: ${fertilizers.join(", ")}.\n
      ${t('crop_rec')}: ${crops.join(", ")}.
    `;

    speakText(text);
  };

  const handleWhatsAppShare = () => {
    if (!npkData) return;
    const text = `*KrishiSaarthi Report* 🌱\n\n*NPK Values:*\nN: ${npkData.n}\nP: ${npkData.p}\nK: ${npkData.k}\n\n*Fertilizers:* ${fertilizers.join(", ")}\n*Crops:* ${crops.join(", ")}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isChatLoading) return;

    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsChatLoading(true);

    // Prepare context
    let context = "";
    if (npkData) {
      context = `Current Soil Data: N=${npkData.n}, P=${npkData.p}, K=${npkData.k}, Moisture=${npkData.moisture}%. Recommendations: Fertilizers=${fertilizers.join(", ")}, Crops=${crops.join(", ")}.`;
    }

    try {
      const response = await chatAction({
        message: userMsg,
        history: messages.map(m => ({ role: m.role, content: m.content })),
        context,
        lang: language
      });

      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
      
      // Auto-speak the response if desired, or just let user click. 
      // For now, we won't auto-speak to avoid annoyance, but the infrastructure is there.
    } catch (error) {
      console.error("Chat failed:", error);
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Auto-scroll chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // Stop speaking when closed
  useEffect(() => {
    if (!isOpen) {
      stopSpeaking();
    }
  }, [isOpen]);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
      {isOpen && (
        <Card className="w-[350px] h-[550px] mb-4 shadow-2xl border-2 border-primary/20 flex flex-col animate-in slide-in-from-bottom-10 fade-in duration-300 overflow-hidden">
          <CardHeader className="bg-primary text-primary-foreground py-3 px-4 flex flex-row justify-between items-center shrink-0">
            <div className="flex items-center gap-2">
              <div className="bg-white/20 p-1.5 rounded-full">
                <MessageCircle className="h-5 w-5" />
              </div>
              <CardTitle className="text-base">{t('chatbot_title')}</CardTitle>
            </div>
            <div className="flex items-center gap-1">
              {isSpeaking && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 hover:bg-white/20 text-primary-foreground animate-pulse" 
                  onClick={stopSpeaking}
                  title="Stop Speaking"
                >
                  <VolumeX className="h-4 w-4" />
                </Button>
              )}
              {onRefresh && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 hover:bg-white/20 text-primary-foreground" 
                  onClick={onRefresh} 
                  title={t('refresh')}
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                </Button>
              )}
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/20 text-primary-foreground" onClick={() => setIsOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          </CardHeader>
          
          <Tabs defaultValue="report" className="flex-1 flex flex-col overflow-hidden">
            <div className="px-4 pt-2 bg-muted/10 border-b">
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="report">Report</TabsTrigger>
                <TabsTrigger value="chat">Chat</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="report" className="flex-1 overflow-hidden p-0 m-0 data-[state=active]:flex flex-col">
              <ReportTab 
                npkData={npkData}
                fertilizers={fertilizers}
                crops={crops}
                isLoading={isLoading}
                isSpeaking={isSpeaking}
                onSpeak={handleSpeak}
                onShare={handleWhatsAppShare}
              />
            </TabsContent>

            <TabsContent value="chat" className="flex-1 overflow-hidden p-0 m-0 data-[state=active]:flex flex-col">
              <ChatTab 
                messages={messages}
                input={input}
                setInput={setInput}
                isChatLoading={isChatLoading}
                onSendMessage={handleSendMessage}
                scrollRef={scrollRef}
                onSpeak={speakText}
              />
            </TabsContent>
          </Tabs>
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