import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mic, MicOff, Volume2, ArrowLeft, Check, AlertTriangle } from "lucide-react";
import { Link } from "react-router";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', sample: 'Hello, how can I help you with your farm today?' },
  { code: 'hi', name: 'Hindi', sample: 'नमस्ते, मैं आपकी खेती में कैसे मदद कर सकता हूँ?' },
  { code: 'pa', name: 'Punjabi', sample: 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ, ਮੈਂ ਤੁਹਾਡੀ ਖੇਤੀ ਵਿੱਚ ਕਿਵੇਂ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ?' },
  { code: 'mr', name: 'Marathi', sample: 'नमस्कार, मी तुमच्या शेतीमध्ये कशी मदत करू शकतो?' },
  { code: 'ta', name: 'Tamil', sample: 'வணக்கம், உங்கள் விவசாயத்தில் நான் எவ்வாறு உதவ முடியும்?' },
  { code: 'gu', name: 'Gujarati', sample: 'નમસ્તે, હું તમારી ખેતીમાં કેવી રીતે મદદ કરી શકું?' },
  { code: 'bn', name: 'Bengali', sample: 'নমস্কার, আমি আপনার কৃষিকাজে কীভাবে সাহায্য করতে পারি?' },
  { code: 'kn', name: 'Kannada', sample: 'ನಮಸ್ಕಾರ, ನಿಮ್ಮ ಕೃಷಿಯಲ್ಲಿ ನಾನು ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?' },
  { code: 'bho', name: 'Bhojpuri', sample: 'प्रणाम, हम रउआ के खेती में कईसे मदद कर सकिला?' },
  { code: 'sat', name: 'Santali', sample: 'ᱡᱚᱦᱟᱨ, ᱤᱧ ᱟᱢᱟᱜ ᱪᱟᱥ ᱠᱟᱹᱢᱤ ᱨᱮ ᱪᱮᱫ ᱞᱮᱠᱟᱧ ᱜᱚᱲᱚ ᱫᱟᱲᱮᱭᱟᱜᱼᱟ?' },
];

export default function TestVoice() {
  const [text, setText] = useState("Hello, this is a test of the voice functionality.");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>("");
  
  // Language Testing State
  const [testLang, setTestLang] = useState("en");
  const [matchedVoice, setMatchedVoice] = useState<SpeechSynthesisVoice | null>(null);
  
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

  // Update matched voice when test language or voices change
  useEffect(() => {
    if (voices.length === 0) return;

    const langMap: Record<string, string> = {
      'en': 'en-IN',
      'hi': 'hi-IN',
      'pa': 'pa-IN',
      'mr': 'mr-IN',
      'ta': 'ta-IN',
      'gu': 'gu-IN',
      'bn': 'bn-IN',
      'kn': 'kn-IN',
      'bho': 'hi-IN', // Fallback
      'sat': 'hi-IN'  // Fallback
    };
    
    const targetLang = langMap[testLang] || 'en-IN';
    
    // Logic from ChatbotWidget
    let matching = voices.find(v => v.lang === targetLang) || 
                   voices.find(v => v.lang.startsWith(testLang));
    
    if (!matching && testLang !== 'en') {
        // Fallback to Hindi voice for Indian languages if specific voice missing
        matching = voices.find(v => v.lang.startsWith('hi'));
    }

    setMatchedVoice(matching || null);
    
    // Update sample text
    const langData = SUPPORTED_LANGUAGES.find(l => l.code === testLang);
    if (langData) {
        setText(langData.sample);
    }
  }, [testLang, voices]);

  const handleSpeak = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Use the manually selected voice if in manual mode, otherwise use the matched voice for the language
    if (selectedVoice) {
      const voice = voices.find(v => v.name === selectedVoice);
      if (voice) utterance.voice = voice;
    }
    
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const handleTestSpeak = () => {
    if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    if (matchedVoice) {
        utterance.voice = matchedVoice;
    }
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  }

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
        // Set language for recognition
        const langMap: Record<string, string> = {
            'en': 'en-IN',
            'hi': 'hi-IN',
            'pa': 'pa-IN',
            'mr': 'mr-IN',
            'ta': 'ta-IN',
            'gu': 'gu-IN',
            'bn': 'bn-IN',
            'kn': 'kn-IN',
            'bho': 'hi-IN',
            'sat': 'hi-IN'
        };
        recognitionRef.current.lang = langMap[testLang] || 'en-IN';
        
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.error("Error starting recognition:", e);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-3xl space-y-6">
        <div className="flex items-center gap-4">
            <Link to="/">
                <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
            </Link>
            <h1 className="text-3xl font-bold">Voice Diagnostics</h1>
        </div>

        {/* Language Support Tester */}
        <Card className="border-primary/20 shadow-md">
            <CardHeader className="bg-primary/5">
                <CardTitle className="flex items-center gap-2">
                    <Volume2 className="h-5 w-5 text-primary" />
                    Language Support Tester
                </CardTitle>
                <CardDescription>
                    Verify which voice will be used for each supported language on your device.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label>Select Language to Test</Label>
                        <Select value={testLang} onValueChange={setTestLang}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {SUPPORTED_LANGUAGES.map(l => (
                                    <SelectItem key={l.code} value={l.code}>
                                        {l.name} ({l.code})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Detected System Voice</Label>
                        <div className={`p-3 rounded-md border flex items-center gap-2 ${matchedVoice ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300' : 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-300'}`}>
                            {matchedVoice ? (
                                <>
                                    <Check className="h-4 w-4 shrink-0" />
                                    <span className="text-sm font-medium truncate" title={matchedVoice.name}>
                                        {matchedVoice.name} ({matchedVoice.lang})
                                    </span>
                                </>
                            ) : (
                                <>
                                    <AlertTriangle className="h-4 w-4 shrink-0" />
                                    <span className="text-sm">No specific voice found (Using default)</span>
                                </>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            This is the voice the chatbot will use for {SUPPORTED_LANGUAGES.find(l => l.code === testLang)?.name}.
                        </p>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Test Phrase</Label>
                    <div className="flex gap-2">
                        <Input value={text} onChange={(e) => setText(e.target.value)} />
                        <Button onClick={handleTestSpeak} disabled={isSpeaking}>
                            {isSpeaking ? "Stop" : "Speak"}
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>

        {/* Manual Testing */}
        <Card>
          <CardHeader>
            <CardTitle>Manual Voice Explorer</CardTitle>
            <CardDescription>Explore all available voices on your system.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
                <Label>Select Any System Voice</Label>
                <select 
                    className="w-full p-2 border rounded-md bg-background text-sm"
                    value={selectedVoice}
                    onChange={(e) => setSelectedVoice(e.target.value)}
                >
                    {voices.map(v => (
                        <option key={v.name} value={v.name}>{v.name} ({v.lang}) {v.default ? '(Default)' : ''}</option>
                    ))}
                </select>
            </div>

            <Button onClick={handleSpeak} variant="outline" className="w-full">
              Test Selected Voice
            </Button>
          </CardContent>
        </Card>

        {/* STT Testing */}
        <Card>
          <CardHeader>
            <CardTitle>Microphone Test (STT)</CardTitle>
            <CardDescription>Test speech recognition for the selected language.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted rounded-md min-h-[100px] whitespace-pre-wrap border text-sm">
              {transcript || "Transcript will appear here..."}
            </div>
            
            <Button 
                onClick={toggleListening} 
                variant={isListening ? "destructive" : "default"}
                className="w-full"
            >
              {isListening ? <MicOff className="mr-2 h-4 w-4" /> : <Mic className="mr-2 h-4 w-4" />}
              {isListening ? "Stop Listening" : `Start Listening (${SUPPORTED_LANGUAGES.find(l => l.code === testLang)?.name})`}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}