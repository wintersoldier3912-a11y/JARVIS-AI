
import React from 'react';
import { HomeDevice } from '../types';
import { Lightbulb, Thermometer, Lock, Unlock, Power, Fan, AlertTriangle, Grid, Activity } from 'lucide-react';

interface Props {
  devices: HomeDevice[];
  onCommand: (command: string) => void;
}

const HomeAutomationPanel: React.FC<Props> = ({ devices, onCommand }) => {
  const getIcon = (device: HomeDevice) => {
    // Icons use specific colors but inherit size from wrapper or default
    switch (device.type) {
      case 'light': return <Lightbulb className={`w-5 h-5 ${device.status === 'on' ? 'text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]' : 'text-gray-500'}`} />;
      case 'thermostat': return <Thermometer className={`w-5 h-5 ${device.status === 'on' ? 'text-jarvis-blue' : 'text-gray-500'}`} />;
      case 'lock': return device.status === 'locked' ? <Lock className="w-5 h-5 text-jarvis-alert drop-shadow-[0_0_5px_rgba(255,51,51,0.8)]" /> : <Unlock className="w-5 h-5 text-gray-500" />;
      case 'switch': return <Power className={`w-5 h-5 ${device.status === 'on' ? 'text-green-400 drop-shadow-[0_0_5px_rgba(74,222,128,0.8)]' : 'text-gray-500'}`} />;
      default: return <Fan className="w-5 h-5 text-gray-500" />;
    }
  };

  const activeCount = devices.filter(d => (d.type === 'light' || d.type === 'switch') && d.status === 'on').length;
  
  // Group Analysis
  const lightDevices = devices.filter(d => d.type === 'light');
  const lockDevices = devices.filter(d => d.type === 'lock');

  const isDeviceActive = (d: HomeDevice) => d.status === 'on' || d.status === 'locked';

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 border-b border-jarvis-blue/20 pb-2">
         <div className="flex items-center gap-2">
            <Power className="w-4 h-4 text-jarvis-blue animate-pulse" />
            <span className="font-mono font-bold tracking-widest text-sm text-jarvis-blue">HOME_LINK_PROTOCOL</span>
         </div>
         <span className="text-[10px] font-mono text-jarvis-blue/60">STATUS: ONLINE</span>
      </div>
      
      {/* Group Controls */}
      {(lightDevices.length > 0 || lockDevices.length > 0) && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          {lightDevices.length > 0 && (
            <div className="p-3 border border-jarvis-blue/20 rounded bg-jarvis-blue/5 backdrop-blur-sm flex flex-col gap-2 relative overflow-hidden group">
               <div className="absolute top-0 left-0 w-0.5 h-full bg-jarvis-blue/50" />
               <div className="flex items-center justify-between border-b border-jarvis-blue/10 pb-1">
                  <span className="text-[10px] font-mono text-jarvis-blue tracking-wider font-bold">LIGHT_GRID</span>
                  <div className="flex gap-1 items-center text-[10px] text-gray-500">
                    <Grid className="w-3 h-3" />
                    {lightDevices.length}
                  </div>
               </div>
               <div className="flex gap-2">
                  <button 
                    onClick={() => onCommand("Turn on all lights")}
                    className="flex-1 py-1 px-2 text-[10px] font-mono border border-jarvis-blue/30 rounded hover:bg-jarvis-blue/20 hover:border-jarvis-blue text-jarvis-blue transition-all active:scale-95"
                  >
                    ALL_ON
                  </button>
                  <button 
                    onClick={() => onCommand("Turn off all lights")}
                    className="flex-1 py-1 px-2 text-[10px] font-mono border border-jarvis-blue/30 rounded hover:bg-jarvis-blue/20 hover:border-jarvis-blue text-jarvis-blue transition-all active:scale-95"
                  >
                    ALL_OFF
                  </button>
               </div>
            </div>
          )}
          
          {lockDevices.length > 0 && (
            <div className="p-3 border border-jarvis-blue/20 rounded bg-jarvis-blue/5 backdrop-blur-sm flex flex-col gap-2 relative overflow-hidden group">
               <div className="absolute top-0 left-0 w-0.5 h-full bg-jarvis-alert/50" />
               <div className="flex items-center justify-between border-b border-jarvis-blue/10 pb-1">
                  <span className="text-[10px] font-mono text-jarvis-alert tracking-wider font-bold">PERIMETER</span>
                  <div className="flex gap-1 items-center text-[10px] text-gray-500">
                    <Lock className="w-3 h-3" />
                    {lockDevices.length}
                  </div>
               </div>
               <div className="flex gap-2">
                  <button 
                    onClick={() => onCommand("Lock all doors")}
                    className="flex-1 py-1 px-2 text-[10px] font-mono border border-jarvis-blue/30 rounded hover:bg-jarvis-blue/20 hover:border-jarvis-blue text-jarvis-blue transition-all active:scale-95"
                  >
                    SECURE
                  </button>
                  <button 
                    onClick={() => onCommand("Unlock all doors")}
                    className="flex-1 py-1 px-2 text-[10px] font-mono border border-jarvis-alert/30 rounded hover:bg-jarvis-alert/20 hover:border-jarvis-alert text-jarvis-alert transition-all active:scale-95"
                  >
                    OPEN
                  </button>
               </div>
            </div>
          )}
        </div>
      )}

      <div className="flex-1 grid grid-cols-1 gap-3 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-jarvis-blue/20 mb-3">
        {devices.map((device) => {
            const active = isDeviceActive(device);
            const isAlert = device.type === 'lock' && device.status === 'locked';
            
            // Dynamic Styles
            const borderColor = isAlert ? 'border-jarvis-alert' : active ? 'border-jarvis-blue' : 'border-gray-800';
            const bgColor = isAlert ? 'bg-jarvis-alert/10' : active ? 'bg-jarvis-blue/10' : 'bg-black/40';
            const glowShadow = isAlert ? 'shadow-[0_0_20px_rgba(255,51,51,0.15)]' : active ? 'shadow-[0_0_20px_rgba(0,240,255,0.15)]' : '';
            const textColor = isAlert ? 'text-jarvis-alert' : active ? 'text-jarvis-blue' : 'text-gray-500';
            const barColor = isAlert ? 'bg-jarvis-alert' : active ? 'bg-jarvis-blue' : 'bg-gray-700';

            return (
              <div key={device.id} className={`
                relative group overflow-hidden border rounded-r-lg transition-all duration-300
                ${borderColor} ${bgColor} ${glowShadow}
                hover:bg-opacity-30
              `}>
                
                {/* Prominent Status Bar with Glow */}
                <div className={`absolute top-0 bottom-0 left-0 w-1.5 transition-all duration-300 ${barColor} ${active ? 'shadow-[0_0_15px_currentColor]' : ''}`} />
                
                {/* Background Scanline Pattern for active devices */}
                {active && (
                   <div className="absolute inset-0 bg-scanlines opacity-10 pointer-events-none" />
                )}

                <div className="relative flex items-center justify-between p-3 pl-6">
                    <div className="flex items-center gap-4">
                      {/* Icon Container with Status Ring */}
                      <div className={`relative p-2.5 rounded-full border border-white/5 bg-black/40 backdrop-blur-md transition-transform group-hover:scale-105`}>
                          {active && (
                            <div className={`absolute inset-0 rounded-full border ${isAlert ? 'border-jarvis-alert' : 'border-jarvis-blue'} opacity-50 animate-ping`} />
                          )}
                          {getIcon(device)}
                      </div>
                      
                      <div className="flex flex-col">
                          <span className={`text-sm font-mono font-bold tracking-wide transition-colors ${active ? 'text-white' : 'text-gray-400'}`}>{device.name}</span>
                          <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">{device.location}</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5">
                      {/* Status Text with Indicator Dot */}
                      <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${barColor} ${active ? 'animate-pulse shadow-[0_0_8px_currentColor]' : ''}`} />
                          <span className={`text-xs font-bold font-mono tracking-widest ${textColor} drop-shadow-sm`}>
                              {device.status.toUpperCase()}
                          </span>
                      </div>
                      
                      {device.value !== undefined && (
                          <div className="flex items-center gap-2 mt-1">
                              <div className="w-20 h-1.5 bg-gray-800/80 rounded-full overflow-hidden border border-white/5">
                                  <div 
                                    className={`h-full transition-all duration-500 ${isAlert ? 'bg-jarvis-alert' : 'bg-jarvis-blue'} ${active ? 'shadow-[0_0_10px_currentColor]' : ''}`} 
                                    style={{ width: `${Math.min(device.value, 100)}%` }}
                                  />
                              </div>
                              <span className={`text-[10px] font-mono ${textColor}`}>{device.value}%</span>
                          </div>
                      )}
                    </div>
                </div>
              </div>
            );
        })}
      </div>

      <button 
        onClick={() => onCommand("Turn off all active lights and switches immediately.")}
        disabled={activeCount === 0}
        className={`
            group relative w-full py-3 px-4 flex items-center justify-center gap-2 
            border rounded font-mono text-xs font-bold tracking-widest uppercase transition-all overflow-hidden
            ${activeCount > 0 
                ? 'border-jarvis-alert text-jarvis-alert hover:bg-jarvis-alert/10 hover:shadow-[0_0_20px_rgba(255,51,51,0.3)]' 
                : 'border-gray-800 text-gray-600 cursor-not-allowed opacity-50'
            }
        `}
      >
        {activeCount > 0 && (
             <div className="absolute inset-0 bg-jarvis-alert/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
        )}
        <AlertTriangle className="w-4 h-4 z-10" />
        <span className="z-10">System Override: Shutdown ({activeCount})</span>
      </button>
    </div>
  );
};

export default HomeAutomationPanel;
