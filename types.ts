
export enum SystemState {
  IDLE = 'IDLE',
  LISTENING = 'LISTENING',
  WATCHING = 'WATCHING',
  ANALYZING = 'ANALYZING',
  ARCHITECTING = 'ARCHITECTING',
  EXECUTING = 'EXECUTING',
  ERROR = 'ERROR'
}

export enum DomainModule {
  GENERAL = 'GENERAL',
  TACTICAL = 'TACTICAL_OPERATIONS',
  QUANTUM = 'QUANTUM_SCIENCES',
  ENGINEERING = 'ENGINEERING_CORE',
  BIO_SCIENCES = 'BIO_LABS',
  CREATIVE = 'CREATIVE_SUITE',
  GLOBAL = 'GLOBAL_AFFAIRS',
  VISION = 'COMPUTER_VISION',
  IOT = 'HOME_AUTOMATION',
  PROJECT = 'PROJECT_ASSISTANT',
  AR_VR = 'AR_VR_EXPERIENCE',
  MEMORY_CORE = 'MEMORY_MANAGEMENT_SYSTEM'
}

export interface SubModelCall {
  modelId: string;
  parameters: Record<string, any>;
  reasoning: string;
}

export interface KnowledgeNode {
  id: string;
  label: string;
  type: 'concept' | 'entity' | 'action';
  x?: number;
  y?: number;
}

export interface KnowledgeEdge {
  source: string;
  target: string;
  relation: string;
}

export interface HomeDevice {
  id: string;
  name: string;
  type: 'light' | 'thermostat' | 'lock' | 'switch';
  location: string;
  status: 'on' | 'off' | 'locked' | 'unlocked';
  value?: number; // e.g. brightness or temperature
}

export interface ExecutionResult {
  analysis: string;
  architecture: SubModelCall[];
  response: string;
  knowledgeGraph: { nodes: KnowledgeNode[]; edges: KnowledgeEdge[] };
  audioResponse?: string; 
  functionCalls?: Array<{name: string, args: any}>; // Added for automation handling
}

export interface Message {
  id: string;
  role: 'user' | 'model' | 'system';
  text: string;
  timestamp: number;
  domain?: DomainModule;
  metadata?: {
    analysis?: string;
    architecture?: SubModelCall[];
    knowledgeGraph?: { nodes: KnowledgeNode[]; edges: KnowledgeEdge[] };
    sources?: Array<{ uri: string; title: string }>;
    screenshot?: string;
  };
}

export interface WorkflowStep {
  name: string;
  status: 'pending' | 'active' | 'complete';
  description: string;
}

export interface UpdateStatus {
  isUpdating: boolean;
  progress: number;
  currentTask: string;
  lastUpdated: Date;
  version: string;
}

export type MemoryType = 'FACT' | 'INTERACTION' | 'PREFERENCE' | 'PROTOCOL';

export interface MemoryEntry {
  id: string;
  content: string;
  type: MemoryType;
  timestamp: number;
  lastAccessed: number;
  importance: number; // 0 to 100
  tags: string[];
}
