
import { MemoryEntry, MemoryType } from '../types';

// Simulated Database Key
const DB_KEY = 'JARVIS_MEMORY_CORE_V1';

// Initial Seed Data
const SEED_DATA: MemoryEntry[] = [
  { id: 'mem_001', content: 'User prefers dark mode interfaces with high contrast.', type: 'PREFERENCE', timestamp: Date.now(), lastAccessed: Date.now(), importance: 90, tags: ['ui', 'preference'] },
  { id: 'mem_002', content: 'Project Mark VII requires Arc Reactor output stabilization at 400GJ.', type: 'FACT', timestamp: Date.now() - 10000000, lastAccessed: Date.now(), importance: 95, tags: ['project', 'mark_vii', 'energy'] },
  { id: 'mem_003', content: 'Security Protocol Alpha initiated during breach simulation.', type: 'PROTOCOL', timestamp: Date.now() - 5000000, lastAccessed: Date.now(), importance: 80, tags: ['security', 'simulation'] },
  { id: 'mem_004', content: 'User requested silence during "Deep Work" hours (0800 - 1200).', type: 'INTERACTION', timestamp: Date.now() - 2000000, lastAccessed: Date.now(), importance: 70, tags: ['schedule', 'preference'] }
];

class MemoryService {
  private memoryCache: MemoryEntry[] = [];

  constructor() {
    this.loadDatabase();
  }

  private loadDatabase() {
    try {
      const stored = localStorage.getItem(DB_KEY);
      if (stored) {
        this.memoryCache = JSON.parse(stored);
      } else {
        this.memoryCache = [...SEED_DATA];
        this.saveDatabase();
      }
    } catch (e) {
      console.error("Memory Core Corruption:", e);
      this.memoryCache = [...SEED_DATA];
    }
  }

  private saveDatabase() {
    try {
      localStorage.setItem(DB_KEY, JSON.stringify(this.memoryCache));
    } catch (e) {
      console.error("Memory Write Error:", e);
    }
  }

  // --- CRUD OPERATIONS ---

  public async addMemory(content: string, type: MemoryType, tags: string[] = [], importance: number = 50): Promise<MemoryEntry> {
    // Simulate Network Latency
    await new Promise(resolve => setTimeout(resolve, 600));

    const newEntry: MemoryEntry = {
      id: `mem_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      content,
      type,
      tags,
      importance,
      timestamp: Date.now(),
      lastAccessed: Date.now()
    };

    this.memoryCache.unshift(newEntry);
    this.saveDatabase();
    return newEntry;
  }

  public async getMemories(filterType?: 'ALL' | MemoryType): Promise<MemoryEntry[]> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    let results = this.memoryCache;
    
    if (filterType && filterType !== 'ALL') {
      results = results.filter(m => m.type === filterType);
    }

    // Sort by importance and recency
    return results.sort((a, b) => b.timestamp - a.timestamp);
  }

  public async searchMemories(query: string): Promise<MemoryEntry[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const lowerQ = query.toLowerCase();
    
    return this.memoryCache.filter(m => 
      m.content.toLowerCase().includes(lowerQ) || 
      m.tags.some(t => t.toLowerCase().includes(lowerQ))
    ).map(m => {
       // Update last accessed on retrieval
       m.lastAccessed = Date.now();
       return m;
    });
  }

  public async updateMemory(id: string, updates: Partial<MemoryEntry>): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const idx = this.memoryCache.findIndex(m => m.id === id);
    if (idx === -1) return false;

    this.memoryCache[idx] = { ...this.memoryCache[idx], ...updates };
    this.saveDatabase();
    return true;
  }

  public async deleteMemory(id: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const initialLen = this.memoryCache.length;
    this.memoryCache = this.memoryCache.filter(m => m.id !== id);
    
    if (this.memoryCache.length !== initialLen) {
      this.saveDatabase();
      return true;
    }
    return false;
  }

  // --- ALGORITHMS ---

  public runRetentionProtocol(): number {
    // Expires memories that are old AND low importance
    // Returns count of purged memories
    const now = Date.now();
    const DAY = 86400000;
    
    const initialLen = this.memoryCache.length;
    
    this.memoryCache = this.memoryCache.filter(m => {
      const ageDays = (now - m.timestamp) / DAY;
      
      // Keep everything high importance
      if (m.importance > 80) return true;

      // Keep medium importance for a month
      if (m.importance > 50 && ageDays < 30) return true;

      // Keep low importance for a week
      if (m.importance <= 50 && ageDays < 7) return true;

      return false; // Purge
    });

    const purged = initialLen - this.memoryCache.length;
    if (purged > 0) this.saveDatabase();
    return purged;
  }
}

export const memoryService = new MemoryService();
