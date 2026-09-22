import React, { useState, useRef, useEffect } from 'react';
import Markdown from 'react-markdown';
import { 
  Bot, 
  Send, 
  User, 
  Sparkles, 
  Calendar, 
  Users, 
  Clock, 
  ShieldCheck, 
  AlertCircle, 
  ArrowRight,
  HelpCircle,
  Stethoscope,
  ChevronRight,
  RefreshCw,
  Mic,
  MicOff,
  Siren,
  HeartHandshake
} from 'lucide-react';
import { ChatMessage, AppTab } from '../types';

interface MediAIChatbotProps {
  onSelectDepartmentForBooking?: (department: string) => void;
  setActiveTab?: (tab: AppTab) => void;
}

const SAMPLE_PROMPTS = [
  'I have fever, cough and body pain for 2 days',
  'Eye irritation, redness and blurry vision',
  'Severe toothache with swollen gums and jaw ache',
  'Red itchy skin rash with small bumps on my arm',
  'Knee joint pain after morning walk and stiffness',
  'My 4-year-old child has 102°F fever and sore throat',
  'Chest tightness, palpitations and shortness of breath',
  'Severe migraine headache with nausea and light sensitivity',
];

export const MediAIChatbot: React.FC<MediAIChatbotProps> = ({
  onSelectDepartmentForBooking,
  setActiveTab,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'bot',
      text: 'Hello! I am **ZivaSaathi**, your SafeLifeSaathi clinical assistant.\n\nTell me what symptoms, pain, or health concerns you are experiencing. I will analyze your symptoms and guide you to the correct hospital OPD department.',
      timestamp: 'Just now',
      disclaimer: 'ZivaSaathi provides informational assistance and OPD navigation only. It does not replace professional medical diagnosis or treatment.',
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Web Speech API Voice Recognition
  const handleToggleVoice = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice recognition is not supported in this browser. Please type your symptoms.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputQuery(prev => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      console.warn('Speech recognition error:', e);
      setIsListening(false);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputQuery.trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symptoms: query,
          history: messages.map(m => ({ sender: m.sender, text: m.text })),
        }),
      });

      if (!res.ok) throw new Error('API response failed');

      const data = await res.json();
      
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: `Based on the symptoms you reported ("${query}"), **${data.recommendedDepartment}** is the recommended OPD clinical department.\n\n${data.explanation}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        recommendedDepartment: data.recommendedDepartment,
        urgency: data.urgency,
        recommendedDoctors: data.recommendedDoctors,
        suggestedActions: data.suggestedActions || ['Book OPD Token', 'View Doctors', 'Find Available Slot'],
        questionsForDoctor: data.questionsForDoctor,
        disclaimer: data.disclaimer || 'ZivaSaathi provides informational assistance and OPD navigation only. It does not replace professional medical diagnosis or treatment.',
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.warn('Fallback bot response triggered:', err);
      // Fallback
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: `Based on your symptoms, **General Medicine** is recommended for an initial clinical evaluation. Please book an OPD token or consult a doctor.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        recommendedDepartment: 'General Medicine',
        urgency: 'Routine',
        recommendedDoctors: ['Dr. Alok Sharma, MD Internal Medicine', 'Dr. Sunita Rao, MBBS, DNB'],
        suggestedActions: ['Book OPD Token', 'View Doctors', 'Find Available Slot'],
        questionsForDoctor: [
          'What is the underlying cause of these symptoms?',
          'Do I need any routine lab tests (CBC, Blood Sugar, X-Ray)?'
        ],
        disclaimer: 'ZivaSaathi provides informational assistance and OPD navigation only. It does not replace professional medical diagnosis or treatment.',
      };
      setMessages(prev => [...prev, botMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookToken = (dept: string) => {
    if (onSelectDepartmentForBooking) {
      onSelectDepartmentForBooking(dept);
    }
    if (setActiveTab) {
      setActiveTab('queue-system');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold shadow-xs">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">ZivaSaathi Patient OPD Assistant</h2>
              <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                Live Clinical AI
              </span>
            </div>
            <p className="text-xs text-slate-500">
              AI-assisted symptom evaluation to route you to the correct specialist OPD clinic and book tokens.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setMessages([messages[0]]);
          }}
          className="self-start sm:self-auto text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset Chat</span>
        </button>
      </div>

      {/* Main Chat Interface */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-[600px] overflow-hidden">
        
        {/* Messages Container */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-50/50">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';

            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className={`max-w-[85%] sm:max-w-[78%] space-y-2`}>
                  {/* Text Bubble */}
                  <div
                    className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                      isUser
                        ? 'bg-blue-600 text-white rounded-tr-xs'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-tl-xs'
                    }`}
                  >
                    <div className="prose prose-sm max-w-none text-inherit">
                      <Markdown>{msg.text}</Markdown>
                    </div>

                    {/* Department Recommendation Highlight Box */}
                    {msg.recommendedDepartment && (
                      <div className="mt-3 p-3.5 rounded-xl bg-purple-50 border border-purple-200 text-slate-900 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                            <Stethoscope className="w-4 h-4 text-purple-700" />
                            Recommended Department:
                          </div>
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                            msg.urgency === 'Emergency'
                              ? 'bg-red-600 text-white animate-pulse'
                              : msg.urgency === 'Priority'
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          }`}>
                            {msg.urgency || 'Routine'} Urgency
                          </span>
                        </div>

                        <div className="text-base font-extrabold text-purple-950 flex items-center gap-2">
                          <span>{msg.recommendedDepartment}</span>
                        </div>

                        {/* Emergency Banner if needed */}
                        {msg.urgency === 'Emergency' && (
                          <div className="p-2.5 bg-red-100 border border-red-300 rounded-lg text-red-900 text-xs flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 font-bold">
                              <Siren className="w-4 h-4 text-red-600 shrink-0 animate-bounce" />
                              <span>Critical Symptoms Detected – Immediate Emergency Response Recommended</span>
                            </div>
                            {setActiveTab && (
                              <button
                                onClick={() => setActiveTab('ambulance-clearance')}
                                className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold rounded-md shrink-0 shadow-xs"
                              >
                                Trigger Ambulance
                              </button>
                            )}
                          </div>
                        )}

                        {/* Doctors List */}
                        {msg.recommendedDoctors && msg.recommendedDoctors.length > 0 && (
                          <div className="text-[11px] text-slate-600 pt-1.5 border-t border-purple-200/70">
                            <span className="font-semibold text-slate-700">Available Specialists:</span>
                            <ul className="list-disc list-inside mt-0.5 text-slate-600">
                              {msg.recommendedDoctors.map((doc, i) => (
                                <li key={i}>{doc}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Questions for doctor */}
                        {msg.questionsForDoctor && msg.questionsForDoctor.length > 0 && (
                          <div className="text-[11px] text-slate-600 pt-1.5 border-t border-purple-200/70">
                            <span className="font-semibold text-slate-700">Questions to ask during consultation:</span>
                            <ul className="list-disc list-inside mt-0.5 space-y-0.5 text-slate-600">
                              {msg.questionsForDoctor.map((q, i) => (
                                <li key={i}>{q}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Direct Action Buttons */}
                        <div className="flex flex-wrap gap-2 pt-2">
                          <button
                            onClick={() => handleBookToken(msg.recommendedDepartment!)}
                            className="px-3.5 py-2 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Book OPD Token ({msg.recommendedDepartment})</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                          
                          <button
                            onClick={() => handleBookToken(msg.recommendedDepartment!)}
                            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-purple-700 border border-purple-300 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                          >
                            <Users className="w-3.5 h-3.5 text-purple-600" />
                            <span>View Queue & Live Slots</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Medical Disclaimer */}
                    {msg.disclaimer && (
                      <div className="mt-2 text-[10px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100 flex items-start gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span>{msg.disclaimer}</span>
                      </div>
                    )}
                  </div>

                  <span className="text-[10px] text-slate-400 block px-1">
                    {msg.timestamp}
                  </span>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 shadow-xs">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-purple-700 bg-purple-50 p-3 rounded-2xl w-fit border border-purple-200 shadow-xs">
              <Sparkles className="w-4 h-4 animate-spin text-purple-600" />
              <span>ZivaSaathi is analyzing your symptoms and matching department clinical protocols...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Preset Prompt Suggestions */}
        <div className="p-3 bg-white border-t border-slate-100">
          <div className="text-[11px] font-semibold text-slate-500 mb-1.5 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-purple-500" />
            Quick Example Symptoms:
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {SAMPLE_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt)}
                disabled={isLoading}
                className="whitespace-nowrap px-2.5 py-1 bg-slate-100 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200 text-slate-700 text-xs rounded-lg border border-slate-200 transition-colors shrink-0 cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center gap-2">
          <button
            type="button"
            onClick={handleToggleVoice}
            title={isListening ? "Listening... click to stop" : "Click to speak your symptoms"}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
              isListening 
                ? 'bg-red-500 text-white border-red-600 animate-pulse' 
                : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
            }`}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendMessage();
            }}
            placeholder={isListening ? "Listening to your voice..." : "Describe your symptoms (e.g. fever, headache, blurry eye vision, skin itching)..."}
            className="flex-1 bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-purple-500 shadow-xs"
          />

          <button
            onClick={() => handleSendMessage()}
            disabled={!inputQuery.trim() || isLoading}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all ${
              inputQuery.trim() && !isLoading
                ? 'bg-purple-600 hover:bg-purple-700 text-white cursor-pointer'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
