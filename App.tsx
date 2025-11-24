
import React, { useState, useEffect, useRef } from 'react';
import { Send, Globe, Shield, Activity, Cpu, Terminal, Layers, Mic, MicOff, Camera, Laptop, Home, Radio, Languages, Glasses, Power, Maximize2, Minimize2, Bell, AlertCircle, Database } from 'lucide-react';
import HolographicCard from './components/HolographicCard';
import ArcReactor from './components/ArcReactor';
import WorkflowMonitor from './components/WorkflowMonitor';
import SystemMonitor from './components/SystemMonitor';
import IngestionStream from './components/IngestionStream';
import ArchitectureView from './components/ArchitectureView';
import KnowledgeGraph from './components/KnowledgeGraph';
import VisionModule from './components/VisionModule';
import HomeAutomationPanel from './components/HomeAutomationPanel';
import ARControlPanel from './components/ARControlPanel';
import MemoryBank from './components/MemoryBank';
import { sendMessageToGemini } from './services/geminiService';
import { Message, SystemState, DomainModule, SubModelCall, KnowledgeNode, KnowledgeEdge, HomeDevice } from './types';

// Speech Recognition Type Extension
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

// HUD Overlay Component for Iron Man Look
const HUDOverlay = ({ minimal = false }) => (
  <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
    {/* Top Left Bracket */}
    <div className={`absolute top-4 left-4 w-64 h-32 border-l-2 border-t-2 border-jarvis-blue/40 rounded-tl-3xl opacity-60 transition-all duration-500 ${minimal ? '-translate-x-full' : 'translate-x-0'}`} />
    <div className={`absolute top-8 left-8 w-32 h-1 bg-jarvis-blue/20 transition-all duration-500 delay-100 ${minimal ? '-translate-x-full' : 'translate-x-0'}`} />
    
    {!minimal && (
      <div className="absolute top-4 left-[280px] flex gap-1 animate-in fade-in duration-1000">
         <div className="w-2 h-2 bg-jarvis-blue/40" />
         <div className="w-2 h-2 bg-jarvis-blue/20" />
         <div className="w-2 h-2 bg-jarvis-blue/10" />
      </div>
    )}

    {/* Top Right Bracket */}
    <div className={`absolute top-4 right-4 w-64 h-32 border-r-2 border-t-2 border-jarvis-blue/40 rounded-tr-3xl opacity-60 transition-all duration-500 ${minimal ? 'translate-x-full' : 'translate-x-0'}`} />
    <div className={`absolute top-8 right-8 w-32 h-1 bg-jarvis-blue/20 transition-all duration-500 delay-100 ${minimal ? 'translate-x-full' : 'translate-x-0'}`} />
    
    {!minimal && (
      <div className="absolute top-12 right-10 text-[10px] font-mono text-jarvis-blue/40 text-right">
         SYS.DIAG.894<br/>
         SEC.LEVEL.ALPHA
      </div>
    )}

    {/* Bottom Left Bracket */}
    <div className={`absolute bottom-4 left-4 w-64 h-32 border-l-2 border-b-2 border-jarvis-blue/40 rounded-bl-3xl opacity-60 transition-all duration-500 ${minimal ? '-translate-x-full' : 'translate-x-0'}`} />

    {/* Bottom Right Bracket */}
    <div className={`absolute bottom-4 right-4 w-64 h-32 border-r-2 border-b-2 border-jarvis-blue/40 rounded-br-3xl opacity-60 transition-all duration-500 ${minimal ? 'translate-x-full' : 'translate-x-0'}`} />

    {/* Center Vignette & Scanlines */}
    <div className="absolute inset-0 bg-vignette opacity-60" />
    <div className="absolute inset-0 bg-scanlines opacity-10" />
  </div>
);

type ViewMode = 'HUD' | 'FOCUS';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init',
      role: 'system',
      text: 'J.A.R.V.I.S. Online. Systems nominal. Voice & Vision protocols initialized.',
      timestamp: Date.now()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [systemState, setSystemState] = useState<SystemState>(SystemState.IDLE);
  const [activeDomain, setActiveDomain] = useState<DomainModule>(DomainModule.GENERAL);
  const [useSearch, setUseSearch] = useState(false);
  const [isVisionActive, setIsVisionActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [speechLang, setSpeechLang] = useState('en-US');
  const [viewMode, setViewMode] = useState<ViewMode>('HUD');
  const [notification, setNotification] = useState<{message: string, type: 'info' | 'success'} | null>(null);
  
  // Home Automation State
  const [homeDevices, setHomeDevices] = useState<HomeDevice[]>([
    { id: '1', name: 'Lab Overhead', type: 'light', location: 'lab', status: 'on', value: 85 },
    { id: '2', name: 'Workbench', type: 'light', location: 'lab', status: 'off', value: 0 },
    { id: '3', name: 'Main Hall', type: 'thermostat', location: 'hallway', status: 'on', value: 72 },
    { id: '4', name: 'Front Gate', type: 'lock', location: 'exterior', status: 'locked' },
    { id: '5', name: 'Server Room', type: 'switch', location: 'basement', status: 'on' }
  ]);

  // Voice State
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Visualizations
  const [currentPlan, setCurrentPlan] = useState<SubModelCall[]>([]);
  const [currentGraph, setCurrentGraph] = useState<{nodes: KnowledgeNode[], edges: KnowledgeEdge[]}>({nodes: [], edges: []});

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize Speech Recognition & Synthesis
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = speechLang;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        handleSendMessage(transcript);
        setIsListening(false);
        setSystemState(SystemState.IDLE);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
        setSystemState(SystemState.IDLE);
      };
    }

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        setAvailableVoices(voices);
      }
    };
    
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = speechLang;
    }
  }, [speechLang]);

  useEffect(() => {
     if (notification) {
        const timer = setTimeout(() => setNotification(null), 5000);
        return () => clearTimeout(timer);
     }
  }, [notification]);

  const toggleVoice = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      setSystemState(SystemState.IDLE);
    } else {
      window.speechSynthesis.cancel();
      recognitionRef.current?.start();
      setIsListening(true);
      setSystemState(SystemState.LISTENING);
    }
  };

  const speak = (text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text.replace(/<[^>]*>/g, "").substring(0, 200));
    synthesisRef.current = utterance;
    utterance.lang = speechLang;
    utterance.pitch = 0.9;
    utterance.rate = 1.05;
    
    const voice = availableVoices.find(v => v.lang === speechLang) || availableVoices[0];
    if (voice) utterance.voice = voice;

    utterance.onend = () => { synthesisRef.current = null; };
    window.speechSynthesis.speak(utterance);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentPlan, viewMode]);

  const updateDeviceState = (call: {name: string, args: any}) => {
     if (call.name !== 'control_home_device') return;
     const { device, action, value } = call.args;
     setHomeDevices(prev => prev.map(d => {
        if (d.name.toLowerCase().includes(device.toLowerCase())) {
           let newStatus = d.status;
           if (action.includes('on')) newStatus = 'on';
           if (action.includes('off')) newStatus = 'off';
           if (action.includes('lock')) newStatus = 'locked';
           if (action.includes('unlock')) newStatus = 'unlocked';
           return { ...d, status: newStatus as any, value: value ? Number(value) : d.value };
        }
        return d;
     }));
  };

  const handleSendMessage = async (textOverride?: string) => {
    const textToSend = textOverride || inputText;
    if (!textToSend.trim() && !capturedImage) return;

    // Auto-switch to Focus mode on first real interaction if not already
    if (viewMode === 'HUD' && messages.length > 0) {
       setViewMode('FOCUS');
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: textToSend,
      timestamp: Date.now(),
      metadata: capturedImage ? { screenshot: capturedImage } : undefined
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setCapturedImage(null);
    setIsVisionActive(false);
    setSystemState(SystemState.ANALYZING);
    
    try {
      const response = await sendMessageToGemini(userMsg.text, activeDomain, capturedImage, useSearch);
      
      setSystemState(SystemState.ARCHITECTING);
      setCurrentPlan(response.architecture);
      setCurrentGraph(response.knowledgeGraph);
      
      if (response.functionCalls) {
         response.functionCalls.forEach(updateDeviceState);
      }

      setTimeout(() => {
        setSystemState(SystemState.EXECUTING);
        const jarvisMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'model',
          text: response.response,
          timestamp: Date.now(),
          metadata: {
             sources: response.sources,
             analysis: response.analysis,
             architecture: response.architecture
          }
        };
        setMessages(prev => [...prev, jarvisMsg]);
        setSystemState(SystemState.IDLE);
        speak(response.response);
      }, 1000);

    } catch (e) {
      setSystemState(SystemState.ERROR);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleUpdateComplete = (version: string) => {
     setNotification({
        type: 'success',
        message: `KNOWLEDGE_BASE UPDATED TO VERSION ${version}. INTEGRITY 100%.`
     });
     speak("Knowledge base update complete. All systems optimized.");
  };

  const renderRightColumn = () => {
    if (activeDomain === DomainModule.IOT) {
      return (
        <HolographicCard className="flex-1 bg-black/60 border-jarvis-blue/50">
          <HomeAutomationPanel devices={homeDevices} onCommand={(cmd) => handleSendMessage(cmd)} />
        </HolographicCard>
      );
    }
    
    if (activeDomain === DomainModule.AR_VR) {
      return (
        <HolographicCard className="flex-1 bg-black/60 border-jarvis-blue/50 overflow-visible">
          <ARControlPanel />
        </HolographicCard>
      );
    }

    if (activeDomain === DomainModule.MEMORY_CORE) {
       return (
         <HolographicCard className="flex-1 bg-black/60 border-jarvis-blue/50 overflow-hidden">
            <MemoryBank />
         </HolographicCard>
       );
    }

    return (
       <>
          <HolographicCard className="h-56 bg-black/40 border-jarvis-blue/30">
              <div className="flex items-center gap-2 border-b border-jarvis-blue/20 pb-2 mb-2">
                <Activity className="w-4 h-4 text-jarvis-blue" />
                <span className="font-mono font-bold tracking-widest text-sm text-jarvis-blue">DATA_STREAM</span>
              </div>
              <IngestionStream active={systemState === SystemState.ANALYZING} />
          </HolographicCard>

          <HolographicCard className="flex-1 bg-black/40 border-jarvis-blue/30">
              <div className="flex items-center gap-2 border-b border-jarvis-blue/20 pb-2 mb-2">
                <Layers className="w-4 h-4 text-jarvis-blue" />
                <span className="font-mono font-bold tracking-widest text-sm text-jarvis-blue">GRAPH_NODES</span>
              </div>
              <KnowledgeGraph nodes={currentGraph.nodes} edges={currentGraph.edges} />
          </HolographicCard>
       </>
    );
  };

  return (
    <div className="h-screen bg-black text-jarvis-blue font-sans overflow-hidden relative selection:bg-jarvis-blue selection:text-black bg-tech-grid bg-cover transition-all duration-700">
      
      <HUDOverlay minimal={viewMode === 'FOCUS'} />

      {/* Global Notification Banner */}
      <div className={`absolute top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ${notification ? 'translate-y-0 opacity-100' : '-translate-y-20 opacity-0'}`}>
         {notification && (
            <div className="bg-jarvis-blue/10 border border-jarvis-blue text-jarvis-blue px-6 py-2 rounded shadow-[0_0_20px_rgba(0,240,255,0.4)] backdrop-blur-md flex items-center gap-3">
               <AlertCircle className="w-5 h-5 animate-pulse" />
               <span className="font-mono font-bold tracking-widest">{notification.message}</span>
            </div>
         )}
      </div>

      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
         {/* Center Vignette */}
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000000_90%)]" />
      </div>

      {/* Main HUD Layout */}
      <main className="relative z-10 w-full h-full flex p-6 gap-6 pt-16 pb-12 transition-all duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)]">
        
        {/* LEFT COLUMN: System Status & Diagnostics */}
        <aside className={`flex flex-col gap-4 transition-all duration-700 ${viewMode === 'FOCUS' ? '-ml-96 w-0 opacity-0 overflow-hidden' : 'w-80 opacity-100'}`}>
           <HolographicCard className="flex-none bg-black/40 border-jarvis-blue/30 backdrop-blur-md">
              <SystemMonitor onUpdateStart={() => speak("Initiating knowledge base synchronization protocol.")} onUpdateComplete={handleUpdateComplete} />
           </HolographicCard>
           
           <HolographicCard className="flex-1 flex flex-col gap-2 bg-black/40 border-jarvis-blue/30 backdrop-blur-md">
              <div className="flex items-center gap-2 border-b border-jarvis-blue/20 pb-2 mb-2">
                 <Shield className="w-4 h-4 text-jarvis-blue" />
                 <span className="font-mono font-bold tracking-widest text-sm text-jarvis-blue">PROTOCOL_SELECT</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                 {[
                   { id: DomainModule.IOT, icon: <Home className="w-4 h-4"/>, label: "HOME" },
                   { id: DomainModule.PROJECT, icon: <Laptop className="w-4 h-4"/>, label: "PROJ" },
                   { id: DomainModule.TACTICAL, icon: <Radio className="w-4 h-4"/>, label: "TACT" },
                   { id: DomainModule.AR_VR, icon: <Glasses className="w-4 h-4"/>, label: "AR/VR" },
                   { id: DomainModule.MEMORY_CORE, icon: <Database className="w-4 h-4"/>, label: "MEM" },
                   { id: DomainModule.GENERAL, icon: <Cpu className="w-4 h-4"/>, label: "CORE" }
                 ].map(mod => (
                   <button 
                      key={mod.id}
                      onClick={() => setActiveDomain(mod.id)} 
                      className={`p-3 border rounded text-[10px] font-mono flex flex-col items-center gap-1 transition-all hover:scale-105 active:scale-95 relative overflow-hidden group ${
                        activeDomain === mod.id 
                        ? 'bg-jarvis-blue/20 border-jarvis-blue text-white shadow-[0_0_10px_rgba(0,240,255,0.3)]' 
                        : 'border-jarvis-blue/20 text-gray-400 hover:text-jarvis-blue bg-black/40'
                      }`}
                   >
                      <div className="absolute inset-0 bg-scanlines opacity-20 pointer-events-none" />
                      {mod.icon}
                      {mod.label}
                   </button>
                 ))}
              </div>
              <div className="mt-auto">
                 <WorkflowMonitor currentState={systemState} />
              </div>
           </HolographicCard>
        </aside>

        {/* CENTER COLUMN: The Core (Chat & Arc Reactor) */}
        <section className={`flex flex-col relative min-w-0 transition-all duration-700 ${viewMode === 'FOCUS' ? 'flex-[1] max-w-4xl mx-auto' : 'flex-1'}`}>
           
           {/* Top Bar Status */}
           <header className="flex items-center justify-between mb-4 pb-2 absolute -top-10 left-0 right-0 z-20">
              <div className="flex items-center gap-4">
                 <div className="flex flex-col">
                    <h1 className="text-2xl font-bold tracking-[0.2em] font-mono text-white text-shadow-glow flex items-center gap-2">
                       <Power className="w-5 h-5 text-jarvis-blue animate-pulse" />
                       J.A.R.V.I.S.
                    </h1>
                    <span className="text-[9px] text-jarvis-blue/60 tracking-[0.4em] ml-7">INTEGRATED SYSTEM // MARK VII</span>
                 </div>
              </div>
              <div className="flex gap-4 items-center">
                 {/* View Toggle */}
                 <button 
                   onClick={() => setViewMode(prev => prev === 'HUD' ? 'FOCUS' : 'HUD')}
                   className="flex items-center gap-2 text-xs font-mono border border-jarvis-blue/30 px-3 py-1 rounded text-jarvis-blue bg-black/60 backdrop-blur-sm hover:bg-jarvis-blue/20 transition-all"
                 >
                   {viewMode === 'HUD' ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
                   {viewMode === 'HUD' ? 'FOCUS_MODE' : 'HUD_MODE'}
                 </button>

                 {/* Language Selector */}
                 <div className="flex items-center gap-2 text-xs font-mono border border-jarvis-blue/30 px-2 py-1 rounded text-jarvis-blue bg-black/60 backdrop-blur-sm">
                    <Languages className="w-3 h-3" />
                    <select 
                        value={speechLang}
                        onChange={(e) => setSpeechLang(e.target.value)}
                        className="bg-transparent outline-none appearance-none cursor-pointer uppercase w-16 text-[10px] font-bold text-center"
                    >
                        <option className="bg-black" value="en-US">ENG</option>
                        <option className="bg-black" value="hi-IN">HIN</option>
                        <option className="bg-black" value="ja-JP">JPN</option>
                    </select>
                 </div>

                 <div className={`flex items-center gap-2 text-xs font-mono border px-2 py-1 rounded backdrop-blur-sm bg-black/60 ${useSearch ? 'border-jarvis-blue text-jarvis-blue shadow-[0_0_5px_rgba(0,240,255,0.3)]' : 'border-gray-800 text-gray-600'}`}>
                    <Globe className="w-3 h-3" />
                    NET: {useSearch ? 'ON' : 'OFF'}
                 </div>
              </div>
           </header>

           {/* Main Viewport */}
           <div className={`flex-1 relative overflow-hidden flex flex-col rounded-lg border bg-black/30 backdrop-blur-sm transition-all duration-500 ${viewMode === 'FOCUS' ? 'border-jarvis-blue/10 bg-black/60 shadow-[0_0_50px_rgba(0,0,0,0.8)]' : 'border-jarvis-blue/20'}`}>
              
              {/* Background Arc Reactor (Fades in Focus Mode) */}
              <div className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-all duration-1000 ${
                 (messages.length > 1 || isVisionActive || viewMode === 'FOCUS') ? 'opacity-5 scale-125 blur-sm' : 'opacity-100 scale-100'
              }`}>
                 <ArcReactor state={systemState} />
              </div>

              {/* Chat Layer */}
              <div className="relative z-10 flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-jarvis-blue/30 p-4">
                 
                 {isVisionActive && (
                   <div className="w-full h-64 mb-4 border border-jarvis-blue/50 rounded overflow-hidden relative animate-in fade-in zoom-in shadow-[0_0_20px_rgba(0,240,255,0.2)]">
                      <VisionModule 
                        onCapture={(base64) => {
                          setCapturedImage(base64);
                          speak("Visual target acquired.");
                          handleSendMessage("Analyze this visual data.");
                        }} 
                        onClose={() => setIsVisionActive(false)}
                      />
                   </div>
                 )}

                 <div className={`space-y-6 ${viewMode === 'FOCUS' ? 'max-w-3xl mx-auto' : ''}`}>
                    {messages.slice(1).map((msg) => (
                        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                          <div className={`relative ${
                              msg.role === 'user' 
                              ? 'max-w-[85%] text-right' 
                              : viewMode === 'FOCUS' ? 'w-full' : 'max-w-[85%]'
                          }`}>
                              <div className={`text-[9px] font-mono opacity-50 mb-1 flex items-center gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {msg.role === 'user' ? <><span className="text-jarvis-cyan">USER_INPUT</span><Terminal className="w-3 h-3" /></> : `SYS_RESP // ${msg.timestamp}`}
                              </div>
                              
                              <div className={`p-4 border backdrop-blur-md shadow-lg transition-all duration-300 ${
                                  msg.role === 'user'
                                  ? 'bg-jarvis-blue/10 border-jarvis-blue/30 rounded-l-xl rounded-tr-xl text-white'
                                  : viewMode === 'FOCUS' 
                                    ? 'bg-transparent border-0 border-l-2 border-jarvis-blue/30 pl-6 rounded-none text-jarvis-blue/90' 
                                    : 'bg-black/80 border-jarvis-blue/20 rounded-r-xl rounded-tl-xl text-jarvis-blue/90'
                              }`}>
                                  <div className={`font-sans leading-relaxed whitespace-pre-wrap ${viewMode === 'FOCUS' ? 'text-lg text-gray-100' : 'text-sm md:text-base'}`}>
                                    {msg.text}
                                  </div>

                                  {msg.role === 'model' && (
                                    <div className="mt-4 pt-2 border-t border-white/5 opacity-80">
                                        {msg.metadata?.analysis && (
                                          <div className="text-[10px] font-mono text-jarvis-blue/70 mb-2 border-l-2 border-jarvis-blue/50 pl-2">
                                              {msg.metadata.analysis}
                                          </div>
                                        )}
                                        {msg.metadata?.architecture && <ArchitectureView plan={msg.metadata.architecture} />}
                                    </div>
                                  )}
                              </div>
                          </div>
                        </div>
                    ))}
                 </div>
                 <div ref={messagesEndRef} />
              </div>

              {/* Bottom Command Input */}
              <div className="mt-auto relative p-4 border-t border-jarvis-blue/20 bg-black/60 backdrop-blur-md">
                 <div className={`relative z-10 flex items-center gap-4 ${viewMode === 'FOCUS' ? 'max-w-3xl mx-auto' : ''}`}>
                    <button onClick={toggleVoice} className={`p-3 rounded-full transition-all border ${isListening ? 'border-jarvis-alert text-jarvis-alert bg-jarvis-alert/10 animate-pulse shadow-[0_0_15px_rgba(255,51,51,0.4)]' : 'border-jarvis-blue/30 text-jarvis-blue hover:bg-jarvis-blue/10'}`}>
                       {isListening ? <MicOff className="w-5 h-5"/> : <Mic className="w-5 h-5"/>}
                    </button>
                    <button onClick={() => setIsVisionActive(!isVisionActive)} className={`p-3 rounded-full transition-all border border-jarvis-blue/30 text-jarvis-blue hover:bg-jarvis-blue/10 ${isVisionActive ? 'bg-jarvis-blue/20 shadow-[0_0_10px_#00f0ff]' : ''}`}>
                       <Camera className="w-5 h-5"/>
                    </button>
                    
                    <div className="flex-1 relative group">
                       <div className="absolute -inset-0.5 bg-gradient-to-r from-jarvis-blue/30 to-jarvis-cyan/30 rounded opacity-30 group-hover:opacity-70 transition duration-500 blur"></div>
                       <input 
                          type="text" 
                          value={inputText}
                          onChange={(e) => setInputText(e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder="ENTER COMMAND PROTOCOL..."
                          className="relative w-full bg-black border border-jarvis-blue/30 rounded py-3 px-4 font-mono text-jarvis-blue placeholder-jarvis-blue/30 outline-none focus:border-jarvis-blue transition-colors"
                          disabled={systemState !== SystemState.IDLE}
                       />
                    </div>

                    <button onClick={() => handleSendMessage()} disabled={!inputText.trim()} className="p-3 text-jarvis-blue hover:text-white transition-colors disabled:opacity-50 hover:scale-110 transform duration-200">
                       <Send className="w-5 h-5" />
                    </button>
                 </div>
              </div>

           </div>
        </section>

        {/* RIGHT COLUMN: Knowledge & Context */}
        <aside className={`flex flex-col gap-4 transition-all duration-700 ${viewMode === 'FOCUS' ? '-mr-96 w-0 opacity-0 overflow-hidden' : 'w-80 opacity-100'}`}>
           {renderRightColumn()}
        </aside>

      </main>
    </div>
  );
};

export default App;
