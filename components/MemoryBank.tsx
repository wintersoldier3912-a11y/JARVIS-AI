
import React, { useState, useEffect } from 'react';
import { MemoryEntry, MemoryType } from '../types';
import { memoryService } from '../services/memoryService';
import { Database, Search, Save, Trash2, Plus, Brain, Filter, Cpu, Clock, Tag } from 'lucide-react';
import HolographicCard from './HolographicCard';

const MemoryBank: React.FC = () => {
  const [memories, setMemories] = useState<MemoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'ALL' | MemoryType>('ALL');
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // New Memory Form State
  const [isAdding, setIsAdding] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [newType, setNewType] = useState<MemoryType>('FACT');
  const [newImportance, setNewImportance] = useState(50);
  const [newTags, setNewTags] = useState('');

  const fetchMemories = async () => {
    setLoading(true);
    const data = await memoryService.getMemories(activeFilter);
    setMemories(data);
    setLoading(false);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      fetchMemories();
      return;
    }
    setLoading(true);
    const data = await memoryService.searchMemories(searchQuery);
    setMemories(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchMemories();
  }, [activeFilter]);

  const handleDelete = async (id: string) => {
    await memoryService.deleteMemory(id);
    fetchMemories();
  };

  const handleAdd = async () => {
    if (!newContent.trim()) return;
    setLoading(true);
    await memoryService.addMemory(
      newContent, 
      newType, 
      newTags.split(',').map(t => t.trim()).filter(Boolean),
      newImportance
    );
    setIsAdding(false);
    setNewContent('');
    setNewTags('');
    setNewImportance(50);
    fetchMemories();
  };

  const runRetention = () => {
    const purged = memoryService.runRetentionProtocol();
    fetchMemories();
    // In a real app, show a toast here
    console.log(`Purged ${purged} old memories.`);
  };

  const getTypeColor = (type: MemoryType) => {
    switch (type) {
      case 'FACT': return 'text-jarvis-blue border-jarvis-blue';
      case 'INTERACTION': return 'text-green-400 border-green-400';
      case 'PREFERENCE': return 'text-purple-400 border-purple-400';
      case 'PROTOCOL': return 'text-jarvis-alert border-jarvis-alert';
      default: return 'text-gray-400 border-gray-400';
    }
  };

  return (
    <div className="flex flex-col h-full bg-black/40 text-jarvis-blue overflow-hidden relative font-mono">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-jarvis-blue/20 bg-black/60 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-jarvis-blue animate-pulse" />
          <span className="font-bold tracking-widest text-xs">MEMORY_CORE</span>
        </div>
        <div className="flex gap-2">
           <button onClick={runRetention} className="p-1 hover:text-white text-[10px] border border-jarvis-blue/30 rounded px-2" title="Run Retention Algorithm">
              OPTIMIZE
           </button>
           <button onClick={() => setIsAdding(!isAdding)} className="p-1 hover:text-white">
              {isAdding ? <Cpu className="w-4 h-4 text-jarvis-alert" /> : <Plus className="w-4 h-4" />}
           </button>
        </div>
      </div>

      {/* Controls */}
      <div className="p-3 border-b border-jarvis-blue/20 flex flex-col gap-3">
         <form onSubmit={handleSearch} className="relative group">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-jarvis-blue/50" />
            <input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="SEARCH_NEURAL_NET..."
              className="w-full bg-black/40 border border-jarvis-blue/20 rounded pl-7 pr-2 py-1 text-[10px] font-mono text-jarvis-blue focus:border-jarvis-blue outline-none transition-colors"
            />
         </form>

         <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
            {['ALL', 'FACT', 'INTERACTION', 'PREFERENCE', 'PROTOCOL'].map((type) => (
               <button
                 key={type}
                 onClick={() => setActiveFilter(type as any)}
                 className={`px-2 py-0.5 text-[8px] border rounded transition-all whitespace-nowrap ${activeFilter === type ? 'bg-jarvis-blue text-black border-jarvis-blue' : 'text-gray-500 border-gray-800 hover:border-jarvis-blue/50'}`}
               >
                 {type}
               </button>
            ))}
         </div>
      </div>

      {/* Add Memory Form */}
      {isAdding && (
         <div className="p-3 border-b border-jarvis-blue/20 bg-jarvis-blue/5 animate-in slide-in-from-top-2">
            <textarea 
               value={newContent}
               onChange={(e) => setNewContent(e.target.value)}
               placeholder="Enter new knowledge data..."
               className="w-full bg-black/60 border border-jarvis-blue/30 rounded p-2 text-xs text-white mb-2 focus:outline-none focus:border-jarvis-blue h-20"
            />
            <div className="grid grid-cols-2 gap-2 mb-2">
               <select 
                  value={newType} 
                  onChange={(e) => setNewType(e.target.value as MemoryType)}
                  className="bg-black border border-jarvis-blue/30 text-[10px] rounded p-1 text-jarvis-blue outline-none"
               >
                  <option value="FACT">FACT</option>
                  <option value="INTERACTION">INTERACTION</option>
                  <option value="PREFERENCE">PREFERENCE</option>
                  <option value="PROTOCOL">PROTOCOL</option>
               </select>
               <div className="flex items-center gap-2 border border-jarvis-blue/30 rounded px-2">
                  <span className="text-[8px] text-gray-500">IMPORTANCE</span>
                  <input 
                    type="range" 
                    min="0" max="100" 
                    value={newImportance} 
                    onChange={(e) => setNewImportance(parseInt(e.target.value))}
                    className="flex-1 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-jarvis-blue"
                  />
                  <span className="text-[8px]">{newImportance}%</span>
               </div>
            </div>
            <input 
               value={newTags}
               onChange={(e) => setNewTags(e.target.value)}
               placeholder="Tags (comma separated)..."
               className="w-full bg-black/60 border border-jarvis-blue/30 rounded p-1 text-[10px] text-gray-300 mb-2 focus:outline-none"
            />
            <button 
               onClick={handleAdd}
               className="w-full py-1 bg-jarvis-blue/20 border border-jarvis-blue text-jarvis-blue text-xs font-bold rounded hover:bg-jarvis-blue hover:text-black transition-colors"
            >
               WRITE_TO_CORE
            </button>
         </div>
      )}

      {/* Memory Stream List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2 relative">
         {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10 backdrop-blur-sm">
               <Brain className="w-8 h-8 text-jarvis-blue animate-pulse" />
            </div>
         )}
         
         {memories.length === 0 && !loading && (
            <div className="text-center py-8 opacity-50 text-xs">NO_DATA_FOUND</div>
         )}

         {memories.map(mem => (
            <div key={mem.id} className="group relative bg-black/40 border border-gray-800 hover:border-jarvis-blue/50 rounded p-3 transition-all">
               {/* Decorative Side Bar based on Type */}
               <div className={`absolute left-0 top-0 bottom-0 w-1 ${getTypeColor(mem.type).split(' ')[1].replace('border-', 'bg-')}`} />
               
               <div className="flex justify-between items-start mb-1 pl-2">
                  <span className={`text-[9px] font-bold border px-1 rounded ${getTypeColor(mem.type)}`}>
                     {mem.type}
                  </span>
                  <div className="flex items-center gap-2">
                     <span className="text-[8px] text-gray-500">{new Date(mem.timestamp).toLocaleDateString()}</span>
                     <button onClick={() => handleDelete(mem.id)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="w-3 h-3 text-gray-500 hover:text-jarvis-alert" />
                     </button>
                  </div>
               </div>

               <p className="text-xs text-gray-300 pl-2 mb-2 font-sans leading-relaxed">
                  {mem.content}
               </p>

               <div className="flex items-center justify-between pl-2 mt-2 pt-2 border-t border-white/5">
                  <div className="flex gap-1 flex-wrap">
                     {mem.tags.map((tag, i) => (
                        <span key={i} className="text-[8px] text-jarvis-blue/70 flex items-center gap-0.5">
                           <Tag className="w-2 h-2" /> {tag}
                        </span>
                     ))}
                  </div>
                  <div className="flex items-center gap-1" title="Importance Level">
                     <div className="w-16 h-1 bg-gray-800 rounded-full overflow-hidden">
                        <div 
                           className="h-full bg-jarvis-blue" 
                           style={{ width: `${mem.importance}%`, opacity: mem.importance / 100 }}
                        />
                     </div>
                  </div>
               </div>
            </div>
         ))}
      </div>
    </div>
  );
};

export default MemoryBank;
