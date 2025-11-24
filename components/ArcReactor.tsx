
import React from 'react';
import { SystemState } from '../types';

interface Props {
  state: SystemState;
}

const ArcReactor: React.FC<Props> = ({ state }) => {
  const isError = state === SystemState.ERROR;
  const isListening = state === SystemState.LISTENING;
  
  const baseColor = isError ? 'text-jarvis-alert' : 'text-jarvis-blue';
  const borderColor = isError ? 'border-jarvis-alert' : 'border-jarvis-blue';
  const shadowColor = isError ? '#ff3333' : '#00f0ff';

  return (
    <div className="relative flex items-center justify-center w-64 h-64 md:w-80 md:h-80 mx-auto transition-all duration-500 group">
      {/* Outer Glow */}
      <div className={`absolute inset-0 rounded-full blur-3xl opacity-20 bg-current ${baseColor}`} />

      {/* Outer Ring Structure */}
      <div className={`absolute inset-0 rounded-full border-4 border-dashed opacity-40 ${borderColor} animate-[spin_10s_linear_infinite]`} />
      
      {/* Middle Rotating Ring */}
      <div className={`absolute inset-6 rounded-full border border-t-4 border-b-4 border-opacity-60 ${borderColor} animate-[spin_4s_linear_infinite_reverse]`} />
      
      {/* Inner Mechanical Ring */}
      <div className={`absolute inset-12 rounded-full border-8 border-double opacity-80 ${borderColor} ${isListening ? 'scale-105' : 'scale-100'} transition-transform`} />
      
      {/* Core Energy */}
      <div className={`absolute inset-20 rounded-full ${isError ? 'bg-red-900' : 'bg-cyan-900'} opacity-30`} />
      <div className={`absolute inset-24 rounded-full border-2 ${borderColor} opacity-60`} />

      {/* The Light Source */}
      <div 
        className={`w-20 h-20 rounded-full bg-white shadow-[0_0_60px_${shadowColor}] transition-all duration-300 
        ${state === SystemState.ANALYZING ? 'animate-pulse scale-110' : ''}
        ${state === SystemState.LISTENING ? 'scale-90 shadow-[0_0_100px_#00f0ff]' : ''}
        `} 
      />
      
      {/* Holographic Data Overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <svg className="w-full h-full animate-[spin_20s_linear_infinite]" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="48" stroke="currentColor" strokeWidth="0.5" fill="none" strokeDasharray="10 20" className={baseColor} opacity="0.3" />
        </svg>
      </div>

      <div className={`absolute -bottom-16 font-mono text-sm tracking-[0.5em] ${baseColor} animate-pulse font-bold`}>
        {state.replace('_', ' ')}
      </div>
    </div>
  );
};

export default ArcReactor;
