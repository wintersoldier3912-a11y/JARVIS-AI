import React from 'react';
import { WorkflowStep, SystemState } from '../types';
import { BrainCircuit, PenTool, Zap } from 'lucide-react';

interface Props {
  currentState: SystemState;
}

const WorkflowMonitor: React.FC<Props> = ({ currentState }) => {
  const steps: WorkflowStep[] = [
    { name: 'ANALYZE', status: currentState === SystemState.ANALYZING || currentState === SystemState.ARCHITECTING || currentState === SystemState.EXECUTING ? 'active' : 'pending', description: 'Data Acquisition' },
    { name: 'ARCHITECT', status: currentState === SystemState.ARCHITECTING || currentState === SystemState.EXECUTING ? 'active' : 'pending', description: 'Model Construction' },
    { name: 'EXECUTE', status: currentState === SystemState.EXECUTING ? 'active' : 'pending', description: 'Protocol Initialization' },
  ];

  const getIcon = (name: string) => {
    switch(name) {
      case 'ANALYZE': return <BrainCircuit className="w-5 h-5" />;
      case 'ARCHITECT': return <PenTool className="w-5 h-5" />;
      case 'EXECUTE': return <Zap className="w-5 h-5" />;
      default: return null;
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {steps.map((step, idx) => {
        const isActive = step.status === 'active';
        return (
          <div key={idx} className={`flex items-center gap-3 p-2 rounded border-l-2 transition-all duration-300 ${isActive ? 'border-jarvis-blue bg-jarvis-blue/10' : 'border-gray-700 opacity-50'}`}>
            <div className={`${isActive ? 'text-jarvis-blue animate-pulse' : 'text-gray-500'}`}>
              {getIcon(step.name)}
            </div>
            <div className="flex flex-col">
              <span className={`font-mono text-xs tracking-wider ${isActive ? 'text-jarvis-blue' : 'text-gray-500'}`}>
                {step.name}
              </span>
              <span className="text-[10px] text-gray-400 uppercase tracking-widest">
                {step.description}
              </span>
            </div>
            {isActive && (
              <div className="ml-auto w-2 h-2 rounded-full bg-jarvis-blue animate-ping" />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default WorkflowMonitor;