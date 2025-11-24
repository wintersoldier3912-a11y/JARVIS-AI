
import React, { useState, useEffect } from 'react';
import { Wind, Activity, Thermometer, MapPin, RefreshCw, Database, Download, CheckCircle, ShieldAlert } from 'lucide-react';
import { UpdateStatus } from '../types';

interface Props {
  onUpdateStart: () => void;
  onUpdateComplete: (version: string) => void;
}

const CircularGauge: React.FC<{ 
  value: number; 
  max: number; 
  label: string; 
  color?: string; 
  size?: 'sm' | 'md' | 'lg' 
}> = ({ value, max, label, color = '#00f0ff', size = 'md' }) => {
  const radius = size === 'lg' ? 45 : size === 'md' ? 30 : 20;
  const stroke = size === 'lg' ? 6 : size === 'md' ? 4 : 3;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (value / max) * circumference;
  
  const dim = radius * 2;

  return (
    <div className="flex flex-col items-center justify-center relative group">
       <div className={`relative flex items-center justify-center`} style={{ width: dim, height: dim }}>
          {/* Background Circle */}
          <svg height={dim} width={dim} className="absolute rotate-[-90deg]">
             <circle
                stroke={color}
                strokeWidth={stroke}
                strokeOpacity="0.2"
                fill="transparent"
                r={normalizedRadius}
                cx={radius}
                cy={radius}
             />
             <circle
                stroke={color}
                fill="transparent"
                strokeWidth={stroke}
                strokeDasharray={circumference + ' ' + circumference}
                style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.5s ease-out' }}
                r={normalizedRadius}
                cx={radius}
                cy={radius}
             />
          </svg>
          
          {/* Inner Text */}
          <div className="font-mono font-bold text-white z-10 flex flex-col items-center justify-center">
             <span className={`${size === 'lg' ? 'text-2xl' : 'text-xs'}`}>
                {Math.round(value)}
                <span className="text-[10px] opacity-70">%</span>
             </span>
          </div>

          {/* Outer Rotating Ring Decoration */}
          <div className={`absolute inset-0 rounded-full border border-dashed border-${color.replace('#', '')} opacity-20 animate-spin-slow pointer-events-none`} 
               style={{ width: dim + 10, height: dim + 10, margin: -5 }} />
       </div>
       <span className="mt-2 text-[10px] font-mono tracking-widest text-jarvis-blue/70 uppercase group-hover:text-white transition-colors">{label}</span>
    </div>
  );
};

const SystemMonitor: React.FC<Props> = ({ onUpdateStart, onUpdateComplete }) => {
  const [time, setTime] = useState(new Date());
  const [cpu, setCpu] = useState(30);
  const [power, setPower] = useState(88);
  const [weather, setWeather] = useState<{temp: number, wind: number, aqi: number} | null>(null);
  const [location, setLocation] = useState<string>("SCANNING...");
  
  // Knowledge Base State
  const [updateStatus, setUpdateStatus] = useState<UpdateStatus>({
    isUpdating: false,
    progress: 0,
    currentTask: 'IDLE',
    lastUpdated: new Date(Date.now() - 86400000 * 3), // 3 days ago
    version: 'Mk.VII.89'
  });

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    const statTimer = setInterval(() => {
       setCpu(prev => Math.min(100, Math.max(10, prev + (Math.random() * 10 - 5))));
       setPower(prev => Math.max(0, prev - 0.01)); // Slowly draining
    }, 2000);
    
    // Environmental Sensors (Weather & AQI)
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocation(`${latitude.toFixed(2).replace('-', 'S').replace('.', '')} | ${longitude.toFixed(2).replace('-', 'W').replace('.', '')}`);
        
        try {
          const wRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,wind_speed_10m`);
          const wData = await wRes.json();
          const aRes = await fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&current=european_aqi`);
          const aData = await aRes.json();

          setWeather({
            temp: wData.current?.temperature_2m || 0,
            wind: wData.current?.wind_speed_10m || 0,
            aqi: aData.current?.european_aqi || 0
          });
        } catch (e) {
           console.error("Sensor Malfunction:", e);
           setLocation("SENSOR_OFFLINE");
        }
      }, (err) => {
         setLocation("GPS_LOST");
      });
    } else {
      setLocation("NO_GPS_MODULE");
    }

    return () => {
       clearInterval(timer);
       clearInterval(statTimer);
    };
  }, []);

  const startUpdate = () => {
    if (updateStatus.isUpdating) return;
    onUpdateStart();
    setUpdateStatus(prev => ({ ...prev, isUpdating: true, progress: 0, currentTask: 'INIT_HANDSHAKE' }));

    const steps = [
      { progress: 10, task: 'CONNECTING: arXiv.org API...' },
      { progress: 25, task: 'DOWNLOADING: IEEE Spectrum Recent...' },
      { progress: 40, task: 'PARSING: Global News Feeds...' },
      { progress: 60, task: 'INDEXING: New Medical Journals...' },
      { progress: 80, task: 'OPTIMIZING: Neural Weights...' },
      { progress: 95, task: 'FINALIZING: Integrity Check...' },
      { progress: 100, task: 'COMPLETE' }
    ];

    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      if (currentStep >= steps.length) {
        clearInterval(interval);
        const newVersion = `Mk.VII.${Math.floor(Math.random() * 900) + 100}`;
        setUpdateStatus({
          isUpdating: false,
          progress: 100,
          currentTask: 'IDLE',
          lastUpdated: new Date(),
          version: newVersion
        });
        onUpdateComplete(newVersion);
      } else {
        setUpdateStatus(prev => ({
          ...prev,
          progress: steps[currentStep].progress,
          currentTask: steps[currentStep].task
        }));
      }
    }, 1500);
  };

  const formatDate = (date: Date) => {
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    return {
      month: months[date.getMonth()],
      day: date.getDate(),
      dayName: date.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase()
    };
  };

  const { month, day, dayName } = formatDate(time);

  const getAqiColor = (aqi: number) => {
    if (aqi < 20) return 'text-green-400';
    if (aqi < 40) return 'text-jarvis-blue';
    if (aqi < 60) return 'text-yellow-400';
    return 'text-jarvis-alert';
  };

  return (
    <div className="flex flex-col gap-6 p-2">
      
      {/* Date Module */}
      <div className="flex items-center justify-between border-b border-jarvis-blue/20 pb-4">
         <div className="relative w-24 h-24 rounded-full border-4 border-jarvis-blue/20 flex items-center justify-center animate-[pulse_4s_infinite]">
            <div className="absolute inset-1 rounded-full border-t-2 border-jarvis-blue animate-spin-slow" />
            <div className="absolute inset-3 rounded-full border-b-2 border-jarvis-blue/50 animate-spin-reverse" />
            <div className="flex flex-col items-center">
               <span className="text-sm font-mono text-jarvis-blue tracking-widest">{month}</span>
               <span className="text-4xl font-bold font-sans text-white text-shadow-glow">{day}</span>
            </div>
         </div>
         <div className="flex flex-col items-end mr-2">
            <div className="text-3xl font-mono text-white tracking-widest text-shadow-glow">
              {time.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="text-xs font-mono text-jarvis-blue/60 tracking-[0.3em]">{dayName}</div>
            <div className="text-[10px] text-jarvis-alert mt-1 animate-pulse">SYSTEM_ONLINE</div>
         </div>
      </div>

      {/* Update Module */}
      <div className={`relative p-3 rounded border transition-colors duration-300 ${updateStatus.isUpdating ? 'border-jarvis-warn bg-jarvis-warn/10' : 'border-jarvis-blue/20 bg-black/40'}`}>
         {updateStatus.isUpdating && <div className="absolute inset-0 bg-scanlines opacity-20 pointer-events-none" />}
         
         <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-mono font-bold tracking-widest text-jarvis-blue flex items-center gap-1">
               <Database className="w-3 h-3" /> KNOWLEDGE_BASE
            </span>
            <span className="text-[9px] font-mono text-jarvis-blue/60">{updateStatus.version}</span>
         </div>

         {updateStatus.isUpdating ? (
            <div className="flex flex-col gap-2">
               <div className="flex justify-between text-[9px] font-mono text-jarvis-warn">
                  <span>{updateStatus.currentTask}</span>
                  <span>{updateStatus.progress}%</span>
               </div>
               <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-jarvis-warn shadow-[0_0_10px_orange] transition-all duration-300" 
                    style={{ width: `${updateStatus.progress}%` }} 
                  />
               </div>
            </div>
         ) : (
            <div className="flex flex-col gap-2">
               <div className="flex justify-between items-center text-[9px] font-mono text-gray-400">
                  <span>LAST_SYNC: {updateStatus.lastUpdated.toLocaleDateString()}</span>
                  <CheckCircle className="w-3 h-3 text-green-500" />
               </div>
               <button 
                 onClick={startUpdate}
                 className="w-full py-1.5 flex items-center justify-center gap-2 border border-jarvis-blue/30 rounded hover:bg-jarvis-blue/10 hover:border-jarvis-blue hover:text-white text-jarvis-blue transition-all active:scale-95 group"
               >
                  <RefreshCw className="w-3 h-3 group-hover:rotate-180 transition-transform duration-500" />
                  <span className="text-[9px] font-bold tracking-widest">INITIATE_UPDATE</span>
               </button>
            </div>
         )}
      </div>

      {/* Environmental Sensors */}
      <div className="relative border border-jarvis-blue/20 bg-jarvis-blue/5 rounded p-3 overflow-hidden">
         {/* Background Grid */}
         <div className="absolute inset-0 bg-hex-pattern opacity-10 pointer-events-none" />
         
         <div className="relative flex items-center justify-between mb-3 border-b border-jarvis-blue/10 pb-1">
            <span className="text-[10px] font-mono font-bold text-jarvis-blue tracking-widest">ENV_SENSORS</span>
            <div className="flex items-center gap-1 text-[10px] text-jarvis-blue/60 font-mono">
               <MapPin className="w-3 h-3" />
               <span className="truncate max-w-[120px]">{location}</span>
            </div>
         </div>
         
         {weather ? (
           <div className="relative grid grid-cols-3 gap-2">
              <div className="flex flex-col items-center p-2 bg-black/40 rounded border border-jarvis-blue/10 hover:border-jarvis-blue/40 transition-colors">
                 <Thermometer className="w-4 h-4 text-jarvis-blue mb-1" />
                 <span className="text-lg font-bold text-white font-sans">{Math.round(weather.temp)}°</span>
                 <span className="text-[8px] text-gray-500 font-mono">TEMP_C</span>
              </div>
              <div className="flex flex-col items-center p-2 bg-black/40 rounded border border-jarvis-blue/10 hover:border-jarvis-blue/40 transition-colors">
                 <Wind className="w-4 h-4 text-jarvis-cyan mb-1" />
                 <span className="text-lg font-bold text-white font-sans">{Math.round(weather.wind)}</span>
                 <span className="text-[8px] text-gray-500 font-mono">KPH_WND</span>
              </div>
              <div className="flex flex-col items-center p-2 bg-black/40 rounded border border-jarvis-blue/10 hover:border-jarvis-blue/40 transition-colors">
                 <Activity className={`w-4 h-4 mb-1 ${getAqiColor(weather.aqi)}`} />
                 <span className="text-lg font-bold text-white font-sans">{weather.aqi}</span>
                 <span className="text-[8px] text-gray-500 font-mono">AQI_IDX</span>
              </div>
           </div>
         ) : (
           <div className="flex items-center justify-center h-16">
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-jarvis-blue rounded-full animate-ping" />
                <span className="text-[10px] text-jarvis-blue/50 font-mono">CALIBRATING...</span>
             </div>
           </div>
         )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
         <CircularGauge value={cpu} max={100} label="CPU_LOAD" size="md" />
         <CircularGauge value={power} max={100} label="PWR_CELL" size="md" color="#00e5ff" />
      </div>

    </div>
  );
};

export default SystemMonitor;
