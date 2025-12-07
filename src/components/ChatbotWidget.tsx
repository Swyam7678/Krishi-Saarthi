import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { MessageCircle, X, Send, Sprout, Droplets, Leaf, Bot, AlertTriangle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface NPKData {
  n: number;
  p: number;
  k: number;
  moisture?: number;
  status: {
    n: string;
    p: string;
    k: string;
  };
}

interface ChatbotWidgetProps {
  npkData: NPKData | null;
}

interface Message {
  id: string;
  role: 'bot' | 'user';
  content: React.ReactNode;
  timestamp: Date;
}

export function ChatbotWidget({ npkData }: ChatbotWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const { t, language } = useLanguage();

  // Initialize chat with NPK analysis when data is available
  useEffect(() => {
    if (npkData && messages.length === 0) {
      const analysis = generateAnalysis(npkData);
      setMessages([
        {
          id: 'welcome',
          role: 'bot',
          content: t('chatbot_welcome'),
          timestamp: new Date()
        },
        {
          id: 'analysis',
          role: 'bot',
          content: analysis,
          timestamp: new Date()
        }
      ]);
    }
  }, [npkData, t, language]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const generateAnalysis = (data: NPKData) => {
    const issues = [];
    const recs = [];
    const crops = [];

    // Thresholds based on convex/npk.ts
    // N < 100 Low, P < 100 Low, K < 150 Low
    
    const isLowN = data.n < 100;
    const isLowP = data.p < 100;
    const isLowK = data.k < 150;

    if (isLowN) {
      issues.push({ text: t('low_n'), color: "text-red-500" });
      recs.push("Urea / Ammonium Sulfate");
      crops.push("Millets (Bajra/Jowar)", "Pulses (Moong/Urad)");
    }
    if (isLowP) {
      issues.push({ text: t('low_p'), color: "text-orange-500" });
      recs.push("Single Super Phosphate (SSP)");
      crops.push("Groundnut", "Pulses");
    }
    if (isLowK) {
      issues.push({ text: t('low_k'), color: "text-yellow-600" });
      recs.push("Muriate of Potash (MOP)");
      crops.push("Millets");
    }

    if (!isLowN && !isLowP && !isLowK) {
      return (
        <div className="space-y-3">
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
            <p className="font-medium text-green-700 dark:text-green-400 flex items-center gap-2">
              <Sprout className="h-4 w-4" /> {t('soil_healthy')}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{t('rec_healthy_crops')}</p>
            <div className="flex flex-wrap gap-2">
              {["Wheat", "Rice", "Sugarcane"].map(c => (
                <Badge key={c} variant="outline" className="bg-background">{c}</Badge>
              ))}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {/* Current Values */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className={cn("p-2 rounded bg-muted", isLowN ? "border-red-200 bg-red-50 text-red-700" : "text-green-700")}>
            <div className="font-bold">N</div>
            <div>{data.n}</div>
          </div>
          <div className={cn("p-2 rounded bg-muted", isLowP ? "border-orange-200 bg-orange-50 text-orange-700" : "text-green-700")}>
            <div className="font-bold">P</div>
            <div>{data.p}</div>
          </div>
          <div className={cn("p-2 rounded bg-muted", isLowK ? "border-yellow-200 bg-yellow-50 text-yellow-700" : "text-green-700")}>
            <div className="font-bold">K</div>
            <div>{data.k}</div>
          </div>
        </div>

        {/* Issues */}
        <div className="space-y-1">
          {issues.map((issue, i) => (
            <div key={i} className={cn("flex items-center gap-2 text-sm font-medium", issue.color)}>
              <AlertTriangle className="h-4 w-4" /> {issue.text}
            </div>
          ))}
        </div>

        {/* Fertilizer Recs */}
        {recs.length > 0 && (
          <div className="space-y-1 bg-blue-50 dark:bg-blue-900/10 p-3 rounded-md">
            <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wider">{t('rec_fertilizer')}</p>
            <ul className="list-disc list-inside text-sm text-blue-900 dark:text-blue-200">
              {recs.map((r, i) => <li key={i}>{r}</li>)}
            </ul>
          </div>
        )}

        {/* Crop Recs */}
        {crops.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('rec_crops')}</p>
            <div className="flex flex-wrap gap-2">
              {[...new Set(crops)].map(c => (
                <Badge key={c} variant="secondary">{c}</Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue("");

    // Simple mock response for now
    setTimeout(() => {
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content: "I am currently in NPK Analysis mode. Please use the dashboard for full AI features.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
    }, 1000);
  };

  return (
    <>
      {/* Toggle Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-xl z-50 transition-all duration-300 hover:scale-110",
          isOpen ? "bg-red-500 hover:bg-red-600 rotate-90" : "bg-primary hover:bg-primary/90"
        )}
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-8 w-8" />}
      </Button>

      {/* Chat Window */}
      <div className={cn(
        "fixed bottom-24 right-6 w-[350px] md:w-[400px] bg-background border rounded-xl shadow-2xl z-50 transition-all duration-300 origin-bottom-right flex flex-col overflow-hidden",
        isOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-10 pointer-events-none"
      )} style={{ maxHeight: 'calc(100vh - 120px)', height: '600px' }}>
        
        {/* Header */}
        <div className="bg-primary p-4 flex items-center gap-3 text-primary-foreground">
          <div className="bg-white/20 p-2 rounded-full">
            <Bot className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg leading-none">{t('chatbot_title')}</h3>
            <span className="text-xs opacity-80 flex items-center gap-1">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"/> Online
            </span>
          </div>
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4 bg-muted/30">
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex w-full",
                  msg.role === 'user' ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm",
                    msg.role === 'user' 
                      ? "bg-primary text-primary-foreground rounded-br-none" 
                      : "bg-card border rounded-bl-none"
                  )}
                >
                  {msg.content}
                  <div className={cn(
                    "text-[10px] mt-1 opacity-70 text-right",
                    msg.role === 'user' ? "text-primary-foreground" : "text-muted-foreground"
                  )}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="p-4 bg-background border-t">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex gap-2"
          >
            <Input 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={t('ask_me')}
              className="flex-1"
            />
            <Button type="submit" size="icon" disabled={!inputValue.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}
