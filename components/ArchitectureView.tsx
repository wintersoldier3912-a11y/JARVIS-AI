
import React from 'react';
import { SubModelCall } from '../types';
import { Network, Database, ChevronRight } from 'lucide-react';

interface Props {
  plan: SubModelCall[];
}

const ArchitectureView: React.FC<Props> = ({ plan }) => {
  if (!plan || plan.length === 0) return null;

  return (
    <div className="w-full mt-4 border-t border-jarvis-blue/30 pt-4">
      <div className="flex items-center gap-2 mb-2">
        <Network className="w-4 h-4 text-jarvis-blue" />
        <span className="text-xs font-mono font-bold text-jarvis-blue uppercase tracking-widest">
          Sub-Model Architecture
        </span>
      </div>
      <div className="space-y-3">
        {plan.map((call, idx) => (
          <div key={idx} className="relative group">
            <div className="absolute -left-3 top-0 bottom-0 w-[1px] bg-jarvis-blue/30" />
            <div className="absolute -left-3 top-3 w-2 h-[1px] bg-jarvis-blue/30" />
            
            <div className="bg-jarvis-blue/5 border border-jarvis-blue/20 rounded p-2 hover:bg-jarvis-blue/10 transition-colors">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold text-jarvis-blue font-mono">
                  {call.modelId}
                </span>
                <Database className="w-3 h-3 text-jarvis-blue/60" />
              </div>
              <div className="text-[10px] text-gray-400 font-mono mb-2 border-b border-white/5 pb-1">
                REQ: {call.reasoning}
              </div>
              <div className="grid grid-cols-1 gap-1">
                {Object.entries(call.parameters || {}).map(([key, val]) => (
                  <div key={key} className="flex items-center gap-1 text-[10px] font-mono">
                    <ChevronRight className="w-3 h-3 text-jarvis-blue/50" />
                    <span className="text-gray-500">{key}:</span>
                    <span className="text-gray-300 truncate">{String(val)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ArchitectureView;
