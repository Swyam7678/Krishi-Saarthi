import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mic, MicOff, Volume2, ArrowLeft } from "lucide-react";
import { Link } from "react-router";

export default function TestVoice() {
  const [text, setText] = useState("Hello, this is a test of the voice functionality.");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>("");
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Load voices
    const updateVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
      if (availableVoices.length > 0 && !selectedVoice) {
        setSelectedVoice(availableVoices[0].name);
      }
    };

    window.speechSynthesis.onvoiceschanged = updateVoices;
    updateVoices();

    // Setup Speech Recognition
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      
      recognition.onresult = (event: any) => {
        let finalTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
            setTranscript(prev => prev + " " + finalTranscript);
        }
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

  const handleSpeak = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    if (selectedVoice) {
      const voice = voices.find(v => v.name === selectedVoice);
      if (voice) utterance.voice = voice;
    }
    
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition not supported in this browser.");
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
        console.error("Error starting recognition:", e);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background p-8 flex flex-col items-center">
      <div className="w-full max-w-2xl space-y-6">
        <div className="flex items-center gap-4">
            <Link to="/">
                <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
            </Link>
            <h1 className="text-3xl font-bold">Voice Functionality Test</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Text to Speech (TTS)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Text to Speak</Label>
              <Input value={text} onChange={(e) => setText(e.target.value)} />
            </div>
            
            <div className="space-y-2">
                <Label>Select Voice</Label>
                <select 
                    className="w-full p-2 border rounded-md bg-background"
                    value={selectedVoice}
                    onChange={(e) => setSelectedVoice(e.target.value)}
                >
                    {voices.map(v => (
                        <option key={v.name} value={v.name}>{v.name} ({v.lang})</option>
                    ))}
                </select>
            </div>

            <Button onClick={handleSpeak} className="w-full">
              <Volume2 className="mr-2 h-4 w-4" />
              {isSpeaking ? "Stop Speaking" : "Speak Text"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Speech to Text (STT)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted rounded-md min-h-[100px] whitespace-pre-wrap border">
              {transcript || "Transcript will appear here..."}
            </div>
            
            <Button 
                onClick={toggleListening} 
                variant={isListening ? "destructive" : "default"}
                className="w-full"
            >
              {isListening ? <MicOff className="mr-2 h-4 w-4" /> : <Mic className="mr-2 h-4 w-4" />}
              {isListening ? "Stop Listening" : "Start Listening"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
