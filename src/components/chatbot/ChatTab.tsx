import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Send, User, Bot, Volume2, Mic, MicOff, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { RefObject } from "react";
import { Link } from "react-router";

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatTabProps {
  messages: ChatMessage[];
  input: string;
  setInput: (value: string) => void;
  isChatLoading: boolean;
  onSendMessage: (e?: React.FormEvent) => void;
  scrollRef: RefObject<HTMLDivElement | null>;
  onSpeak: (text: string) => void;
  isListening: boolean;
  onToggleListening: () => void;
}

export function ChatTab({
  messages,
  input,
  setInput,
  isChatLoading,
  onSendMessage,
  scrollRef,
  onSpeak,
  isListening,
  onToggleListening
}: ChatTabProps) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground text-sm py-8 flex flex-col items-center gap-2">
              <p>Ask me anything about your farm!</p>
              <p className="text-xs opacity-70">Examples: "How to improve soil?", "Best crop for this season?"</p>
              
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2 text-xs"
                  onClick={() => onSpeak("Namaste! I am Krishi Saarthi, your farming assistant.")}
                >
                  <Volume2 className="h-3 w-3" /> Test Audio
                </Button>
                
                <Link to="/test-voice" target="_blank">
                  <Button variant="ghost" size="sm" className="gap-2 text-xs">
                    <ExternalLink className="h-3 w-3" /> Troubleshoot Voice
                  </Button>
                </Link>
              </div>
            </div>
          )}
          
          {messages.map((msg, i) => (
            <div key={i} className={cn("flex gap-3", msg.role === 'user' ? "flex-row-reverse" : "")}>
              <div className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center shrink-0 border",
                msg.role === 'user' ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary border-primary/20"
              )}>
                {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>
              <div className={cn(
                "p-3 shadow-sm text-sm max-w-[85%] rounded-2xl group relative",
                msg.role === 'user' ? "bg-primary text-primary-foreground rounded-tr-none" : "bg-white dark:bg-card border rounded-tl-none"
              )}>
                <p className="whitespace-pre-wrap">{msg.content}</p>
                {msg.role === 'assistant' && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute -bottom-8 left-0 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-primary"
                    onClick={() => onSpeak(msg.content)}
                    title="Read aloud"
                  >
                    <Volume2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
          
          {isChatLoading && (
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div className="bg-white dark:bg-card border rounded-2xl rounded-tl-none p-3 shadow-sm text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>
      
      <div className="p-3 bg-background border-t shrink-0">
        <form onSubmit={onSendMessage} className="flex gap-2">
          <Button 
            type="button" 
            variant={isListening ? "destructive" : "outline"} 
            size="icon" 
            onClick={onToggleListening}
            title={isListening ? "Stop listening" : "Start listening"}
            className={isListening ? "animate-pulse" : ""}
          >
            {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>
          <Input 
            placeholder={isListening ? "Listening..." : "Type your question..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isChatLoading}
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={!input.trim() || isChatLoading}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}