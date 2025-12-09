import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, X, RefreshCw, Loader2, VolumeX, Volume2, Volume1 } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ReportTab, NPKData } from "@/components/chatbot/ReportTab";
import { ChatTab } from "@/components/chatbot/ChatTab";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { getNPKStatus } from "@/lib/npk-config";

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
  const [autoSpeak, setAutoSpeak] = useState(false);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  
  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatAction = useAction(api.ai.chat);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Voice Input State
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const updateVoices = () => {
      if (typeof window !== 'undefined') {
        setVoices(window.speechSynthesis.getVoices());
      }
    };
    
    updateVoices();
    if (typeof window !== 'undefined') {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput((prev) => (prev ? prev + " " : "") + transcript);
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  useEffect(() => {
    if (recognitionRef.current) {
        const langMap: Record<string, string> = {
            'en': 'en-IN',
            'hi': 'hi-IN',
            'pa': 'pa-IN',
            'mr': 'mr-IN',
            'ta': 'ta-IN',
            'gu': 'gu-IN',
            'bn': 'bn-IN',
            'bho': 'hi-IN', // Fallback to Hindi as Bhojpuri specific might not exist
            'sat': 'hi-IN'  // Fallback to Hindi/English as Santali specific might not exist
        };
        recognitionRef.current.lang = langMap[language] || 'en-IN';
    }
  }, [language]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast.error("Speech recognition is not supported in this browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.error("Error starting speech recognition:", e);
        setIsListening(false);
      }
    }
  };

  // Recommendation Logic
  const getRecommendations = () => {
    if (!npkData) return { fertilizers: [], crops: [] };

    const fertilizers: string[] = [];
    const crops: string[] = [];
    let isHealthy = true;

    // Nitrogen Logic
    if (getNPKStatus(npkData.n, 'n') === 'low') {
      fertilizers.push(t('low_n_fert'));
      // Suggest nitrogen-fixing crops or hardy crops
      crops.push(language === 'en' ? "Legumes (Nitrogen Fixing)" : "दलहन (नाइट्रोजन फिक्सिंग)");
      crops.push(language === 'en' ? "Millets" : "बाजरा (Millets)");
      isHealthy = false;
    }

    // Phosphorus Logic
    if (getNPKStatus(npkData.p, 'p') === 'low') {
      fertilizers.push(t('low_p_fert'));
      crops.push(language === 'en' ? "Pulses" : "दालें (Pulses)");
      crops.push(language === 'en' ? "Groundnut" : "मूंगफली (Groundnut)");
      isHealthy = false;
    }

    // Potassium Logic
    if (getNPKStatus(npkData.k, 'k') === 'low') {
      fertilizers.push(t('low_k_fert'));
      crops.push(language === 'en' ? "Root Vegetables" : "कंदमूल सब्जियां");
      crops.push(language === 'en' ? "Millets" : "बाजरा (Millets)");
      isHealthy = false;
    }

    if (isHealthy) {
      fertilizers.push(t('healthy_soil'));
      crops.push(
        language === 'en' ? "Wheat" : "गेहूँ (Wheat)", 
        language === 'en' ? "Rice" : "धान (Rice)", 
        language === 'en' ? "Sugarcane" : "गन्ना (Sugarcane)",
        language === 'en' ? "Cotton" : "कपास (Cotton)"
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
      'bn': 'bn-IN',
      'bho': 'hi-IN', // Fallback
      'sat': 'hi-IN'  // Fallback
    };
    const targetLang = langMap[language] || 'en-IN';
    utterance.lang = targetLang;

    // Attempt to find a matching voice for better pronunciation
    // First try exact match (e.g., pa-IN)
    // Then try language match (e.g., pa)
    // Then try Hindi as a fallback for Indian languages (better phonemes than English)
    let matchingVoice = voices.find(v => v.lang === targetLang) || 
                        voices.find(v => v.lang.startsWith(language));
    
    if (!matchingVoice && language !== 'en') {
        // Fallback to Hindi voice for Indian languages if specific voice missing
        // This often sounds better than English voice reading Indian script
        matchingVoice = voices.find(v => v.lang.startsWith('hi'));
    }
    
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

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
      
      if (autoSpeak) {
        speakText(response);
      }
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end sm:bottom-6 sm:right-6">
      {isOpen && (
        <Card className={cn(
          "flex flex-col shadow-2xl border-2 border-primary/20 overflow-hidden bg-background/95 backdrop-blur-sm",
          // Mobile: Fixed full screen, high z-index to cover everything
          "fixed inset-0 z-[100] w-full h-[100dvh] rounded-none m-0",
          // Desktop: Static (inside flex container), specific dimensions, rounded
          "sm:static sm:z-auto sm:w-[400px] sm:h-[600px] sm:rounded-xl sm:mb-4",
          "animate-in slide-in-from-bottom-10 fade-in duration-300"
        )}>
          <CardHeader className="bg-primary text-primary-foreground py-3 px-4 flex flex-row justify-between items-center shrink-0">
            <div className="flex items-center gap-2">
              <div className="bg-white/20 p-1.5 rounded-full">
                <MessageCircle className="h-5 w-5" />
              </div>
              <CardTitle className="text-base">{t('chatbot_title')}</CardTitle>
            </div>
            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className={cn("h-8 w-8 hover:bg-white/20 text-primary-foreground transition-all", autoSpeak ? "bg-white/20" : "opacity-70")}
                onClick={() => {
                  setAutoSpeak(!autoSpeak);
                  toast.info(autoSpeak ? "Auto-speak disabled" : "Auto-speak enabled");
                }}
                title={autoSpeak ? "Disable auto-speak" : "Enable auto-speak"}
              >
                {autoSpeak ? <Volume2 className="h-4 w-4" /> : <Volume1 className="h-4 w-4" />}
              </Button>

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
                isListening={isListening}
                onToggleListening={toggleListening}
              />
            </TabsContent>
          </Tabs>
        </Card>
      )}

      <Button
        onClick={() => setIsOpen(!isOpen)}
        size="lg"
        className={cn(
          "h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-primary hover:bg-primary/90",
          // Hide toggle button on mobile when open (since it's full screen)
          isOpen ? "hidden sm:flex" : "flex"
        )}
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </Button>
    </div>
  );
}