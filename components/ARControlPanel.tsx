
import React, { useState, useEffect } from 'react';
import { Box, Layers, Eye, Grid3X3, Trash2, Globe, Square, List, Package, Plus, X, Settings, Save, Maximize, Move3d, Rotate3d, Camera, Aperture } from 'lucide-react';

interface SceneObject {
  id: string;
  label: string;
  visualType: string;
  category: string;
  offset: { x: number; y: number; z: number };
  rotation: number;
}

interface LibraryItem {
  id: string;
  label: string;
  visualType: string;
}

type EnvironmentType = 'STUDIO' | 'SPACE' | 'MINIMAL';
type LibraryCategory = 'GEOMETRY' | 'ENV' | 'LIGHTS';

// Available visual templates for rendering
const VISUAL_TEMPLATES = [
  { id: 'CUBE_01', label: 'Holo Cube', category: 'GEOMETRY' },
  { id: 'SPHERE_UV', label: 'UV Sphere', category: 'GEOMETRY' },
  { id: 'PYRAMID', label: 'Pyramid', category: 'GEOMETRY' },
  { id: 'MONOLITH', label: 'Monolith', category: 'GEOMETRY' },
  { id: 'TERRAIN_HM', label: 'Terrain Map', category: 'ENV' },
  { id: 'GRID_FLOOR', label: 'Hologrid', category: 'ENV' },
  { id: 'PARTICLES', label: 'Stardust', category: 'ENV' },
  { id: 'LIGHT_RIG', label: 'Omni Light', category: 'LIGHTS' },
  { id: 'NEON_BAR', label: 'Neon Bar', category: 'LIGHTS' },
  { id: 'LASER_EMITTER', label: 'Laser', category: 'LIGHTS' }
];

const INITIAL_LIBRARY: Record<LibraryCategory, LibraryItem[]> = {
  GEOMETRY: [
    { id: 'def_cube', label: 'Cube', visualType: 'CUBE_01' },
    { id: 'def_sphere', label: 'Sphere', visualType: 'SPHERE_UV' },
    { id: 'def_pyramid', label: 'Pyramid', visualType: 'PYRAMID' },
    { id: 'def_mono', label: 'Monolith', visualType: 'MONOLITH' }
  ],
  ENV: [
    { id: 'def_terrain', label: 'Terrain', visualType: 'TERRAIN_HM' },
    { id: 'def_grid', label: 'Hologrid', visualType: 'GRID_FLOOR' },
    { id: 'def_part', label: 'Stardust', visualType: 'PARTICLES' }
  ],
  LIGHTS: [
    { id: 'def_light', label: 'Omni Light', visualType: 'LIGHT_RIG' },
    { id: 'def_neon', label: 'Neon Bar', visualType: 'NEON_BAR' },
    { id: 'def_laser', label: 'Laser', visualType: 'LASER_EMITTER' }
  ]
};

const ARControlPanel: React.FC = () => {
  const [rotation, setRotation] = useState(0);
  const [environment, setEnvironment] = useState<EnvironmentType>('STUDIO');
  const [objects, setObjects] = useState<SceneObject[]>([
    { id: 'default-cube', label: 'Cube', visualType: 'CUBE_01', category: 'GEOMETRY', offset: { x: 0, y: 0, z: 0 }, rotation: 0 }
  ]);
  
  // Library State
  const [library, setLibrary] = useState(INITIAL_LIBRARY);
  const [isManagingLibrary, setIsManagingLibrary] = useState(false);
  const [newAsset, setNewAsset] = useState<{label: string, category: LibraryCategory, visualType: string}>({
    label: '',
    category: 'GEOMETRY',
    visualType: 'CUBE_01'
  });

  // Lighting State
  const [ambientColor, setAmbientColor] = useState('#00f0ff');
  const [ambientIntensity, setAmbientIntensity] = useState(1.0);

  const [activeTab, setActiveTab] = useState<'LIBRARY' | 'SCENE' | 'ENVIRONMENT'>('LIBRARY');
  const [activeCategory, setActiveCategory] = useState<LibraryCategory | 'ALL'>('ALL');

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation(prev => (prev + 0.5) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const handleAddAsset = (item: LibraryItem, category: string) => {
    const newObj: SceneObject = {
      id: `${item.visualType}_${Date.now()}`,
      label: item.label,
      visualType: item.visualType,
      category,
      offset: {
        x: (Math.random() - 0.5) * 80,
        y: (Math.random() - 0.5) * 60,
        z: (Math.random() - 0.5) * 80
      },
      rotation: Math.random() * 360
    };
    setObjects(prev => [...prev, newObj]);
  };

  const handleCreateLibraryItem = () => {
    if (!newAsset.label.trim()) return;
    
    const newItem: LibraryItem = {
      id: `custom_${Date.now()}`,
      label: newAsset.label,
      visualType: newAsset.visualType
    };

    setLibrary(prev => ({
      ...prev,
      [newAsset.category]: [...prev[newAsset.category], newItem]
    }));

    setNewAsset({ label: '', category: 'GEOMETRY', visualType: 'CUBE_01' });
    setIsManagingLibrary(false);
  };

  const handleDeleteLibraryItem = (category: LibraryCategory, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLibrary(prev => ({
      ...prev,
      [category]: prev[category].filter(item => item.id !== id)
    }));
  };

  const handleRemoveObject = (id: string) => {
    setObjects(prev => prev.filter(o => o.id !== id));
  };

  const handleClearScene = () => {
    setObjects([]);
  };

  const renderObject = (obj: SceneObject) => {
    const commonClasses = "absolute top-1/2 left-1/2 transform-style-3d -translate-x-1/2 -translate-y-1/2 transition-all duration-500";
    const style: React.CSSProperties = { 
        transform: `translate3d(${obj.offset.x}px, ${obj.offset.y}px, ${obj.offset.z}px) rotateY(${obj.rotation + rotation}deg)`,
        transformStyle: 'preserve-3d'
    };

    switch (obj.visualType) {
      case 'CUBE_01':
        return (
          <div key={obj.id} className={`${commonClasses} w-16 h-16`} style={style}>
            <div className="absolute inset-0 border border-jarvis-blue/60 bg-jarvis-blue/10 opacity-80 transform translate-z-8 shadow-[0_0_15px_rgba(0,240,255,0.2)]" />
            <div className="absolute inset-0 border border-jarvis-blue/60 bg-jarvis-blue/10 opacity-80 transform -translate-z-8" />
            <div className="absolute inset-0 border border-jarvis-blue/60 bg-jarvis-blue/10 opacity-80 origin-left rotate-y-90 -translate-x-8" />
            <div className="absolute inset-0 border border-jarvis-blue/60 bg-jarvis-blue/10 opacity-80 origin-right rotate-y-90 translate-x-8" />
            <div className="absolute inset-0 border border-jarvis-blue/60 bg-jarvis-blue/10 opacity-80 origin-top rotate-x-90 -translate-y-8" />
            <div className="absolute inset-0 border border-jarvis-blue/60 bg-jarvis-blue/10 opacity-80 origin-bottom rotate-x-90 translate-y-8" />
            <div className="absolute inset-4 bg-jarvis-blue/30 animate-pulse blur-sm" />
          </div>
        );
      case 'MONOLITH':
        return (
            <div key={obj.id} className={`${commonClasses} w-8 h-24`} style={style}>
              <div className="absolute inset-0 bg-black/90 border border-white/30" />
              <div className="absolute inset-0 bg-gradient-to-t from-jarvis-blue/20 to-transparent" />
            </div>
        );
      case 'PYRAMID':
        return (
          <div key={obj.id} className={`${commonClasses} w-0 h-0`} style={style}>
             <div className="absolute border-l-[20px] border-r-[20px] border-b-[40px] border-l-transparent border-r-transparent border-b-jarvis-cyan/50 transform rotateX(30deg) translate-z-4 origin-bottom" />
             <div className="absolute border-l-[20px] border-r-[20px] border-b-[40px] border-l-transparent border-r-transparent border-b-jarvis-cyan/70 transform rotateY(90deg) rotateX(30deg) translate-z-4 origin-bottom" />
             <div className="absolute border-l-[20px] border-r-[20px] border-b-[40px] border-l-transparent border-r-transparent border-b-jarvis-cyan/50 transform rotateY(180deg) rotateX(30deg) translate-z-4 origin-bottom" />
             <div className="absolute border-l-[20px] border-r-[20px] border-b-[40px] border-l-transparent border-r-transparent border-b-jarvis-cyan/70 transform rotateY(270deg) rotateX(30deg) translate-z-4 origin-bottom" />
          </div>
        );
      case 'SPHERE_UV':
        return (
           <div key={obj.id} className={`${commonClasses} w-16 h-16`} style={style}>
              <div className="absolute inset-0 rounded-full border border-purple-400/50 animate-[spin_3s_linear_infinite] shadow-[0_0_10px_rgba(192,132,252,0.3)]" />
              <div className="absolute inset-0 rounded-full border border-purple-400/50 rotate-x-60 animate-[spin_4s_linear_infinite]" />
              <div className="absolute inset-0 rounded-full border border-purple-400/50 rotate-y-60 animate-[spin_5s_linear_infinite]" />
              <div className="absolute inset-4 rounded-full bg-purple-500/20 blur-md" />
           </div>
        );
      case 'TERRAIN_HM':
        return (
           <div key={obj.id} className={`${commonClasses} w-32 h-32`} style={style}>
              <div className="absolute inset-0 border border-green-400/30 bg-[linear-gradient(transparent_95%,#4ade80_95%),linear-gradient(90deg,transparent_95%,#4ade80_95%)] bg-[size:10px_10px] transform rotateX(90deg) opacity-60" />
              <div className="absolute inset-0 bg-green-500/5 rounded-full blur-xl" />
           </div>
        );
      case 'GRID_FLOOR':
        return (
            <div key={obj.id} className={`${commonClasses} w-48 h-48`} style={style}>
                <div className="absolute inset-0 border border-jarvis-blue/30 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-jarvis-blue/20 via-transparent to-transparent transform rotateX(90deg)" />
            </div>
        );
      case 'LIGHT_RIG':
        return (
           <div key={obj.id} className={`${commonClasses} w-2 h-2`} style={style}>
              <div className="absolute inset-0 bg-yellow-400 rounded-full shadow-[0_0_30px_#facc15]" />
              <div className="absolute top-1/2 left-1/2 w-32 h-[1px] bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute top-1/2 left-1/2 w-[1px] h-32 bg-gradient-to-b from-transparent via-yellow-400/50 to-transparent -translate-x-1/2 -translate-y-1/2" />
           </div>
        );
      case 'NEON_BAR':
        return (
            <div key={obj.id} className={`${commonClasses} w-2 h-24`} style={style}>
                <div className="absolute inset-0 bg-jarvis-alert shadow-[0_0_20px_#ff3333] animate-pulse" />
            </div>
        );
      case 'PARTICLES':
        return (
            <div key={obj.id} className={`${commonClasses} w-20 h-20`} style={style}>
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="absolute w-1 h-1 bg-white rounded-full animate-float shadow-[0_0_5px_white]" style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        animationDelay: `${i * 0.5}s`
                    }} />
                ))}
            </div>
        );
      case 'LASER_EMITTER':
          return (
             <div key={obj.id} className={`${commonClasses} w-40 h-0.5`} style={style}>
                <div className="absolute inset-0 bg-red-500 shadow-[0_0_15px_red]" />
                <div className="absolute right-0 top-1/2 w-2 h-2 bg-red-500 rounded-full -translate-y-1/2 shadow-[0_0_10px_red]" />
             </div>
          );
      default: 
        return (
            <div key={obj.id} className={`${commonClasses} w-8 h-8`} style={style}>
                <div className="absolute inset-0 border border-white/50 bg-white/10 backdrop-blur-sm" />
            </div>
        );
    }
  };

  const getFilteredAssets = () => {
    if (activeCategory === 'ALL') {
      return Object.entries(library).flatMap(([cat, assets]) => 
        assets.map(asset => ({ ...asset, category: cat as LibraryCategory }))
      );
    }
    return library[activeCategory].map(asset => ({ ...asset, category: activeCategory }));
  };

  const renderSimulatedEnvironment = () => {
    // Shared Noise Pattern (Simulated ISO Grain)
    const noiseOverlay = (
       <div className="absolute inset-0 opacity-[0.15] pointer-events-none z-0" 
            style={{ 
               backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.5'/%3E%3C/svg%3E")`,
               filter: 'contrast(150%) brightness(50%)' 
            }} 
       />
    );

    // Dynamic Sensor Tint (Reacts to ambient light)
    const sensorReaction = (
       <div 
          className="absolute inset-0 pointer-events-none transition-all duration-700 z-1"
          style={{ 
             backgroundColor: ambientColor,
             opacity: 0.05 * ambientIntensity, 
             mixBlendMode: 'screen',
             filter: `contrast(${1 + (ambientIntensity * 0.2)}) brightness(${0.8 + (ambientIntensity * 0.1)})` 
          }} 
       />
    );

    switch (environment) {
       case 'SPACE':
          return (
             <>
               <div className="absolute inset-0 bg-gradient-to-b from-[#020204] via-[#050510] to-[#080815]" />
               {noiseOverlay}
               <div className="absolute inset-0 bg-[radial-gradient(white_1px,transparent_1px)] bg-[length:50px_50px] opacity-60 animate-twinkle" />
               <div className="absolute inset-0 bg-[radial-gradient(white_1.5px,transparent_1.5px)] bg-[length:120px_120px] bg-[position:25px_25px] opacity-40" />
               <div className="absolute inset-0 bg-gradient-to-tr from-purple-900/20 via-transparent to-blue-900/20 mix-blend-screen" />
               {sensorReaction}
             </>
          );
       case 'MINIMAL':
          return (
             <>
               <div className="absolute inset-0 bg-[#0a0a0a]" />
               {noiseOverlay}
               <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px] opacity-20" />
               {sensorReaction}
             </>
          );
       case 'STUDIO':
       default:
          return (
             <>
               {/* Abstract Blurred Background simulating a room */}
               <div className="absolute inset-0 bg-[#050508]" />
               {noiseOverlay}
               {/* Simulated depth lighting */}
               <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,rgba(30,30,40,0.5)_0%,transparent_60%)] blur-3xl opacity-50" />
               {/* Floor Grid - Perspective Distorted */}
               <div 
                  className="absolute inset-0 bg-[linear-gradient(rgba(0,240,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,240,255,0.05)_1px,transparent_1px)] bg-[size:50px_50px] opacity-40 origin-bottom" 
                  style={{ transform: 'perspective(500px) rotateX(60deg) translateY(150px) scale(2.5)' }}
               />
               <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
               {sensorReaction}
             </>
          );
    }
  };

  return (
    <div className="w-full h-full flex flex-col relative overflow-hidden">
      {/* Background Grid Texture */}
      <div className="absolute inset-0 bg-hex-pattern opacity-5 pointer-events-none" />

      <div className="flex items-center justify-between mb-4 border-b border-jarvis-blue/20 pb-2 relative z-10">
         <div className="flex items-center gap-2">
            <Move3d className="w-4 h-4 text-jarvis-blue animate-pulse" />
            <span className="font-mono font-bold tracking-widest text-sm text-jarvis-blue">AR_MATRIX_CONSTRUCT</span>
         </div>
         <div className="flex items-center gap-2">
           <button 
             onClick={handleClearScene}
             className="text-[10px] font-mono text-jarvis-alert hover:bg-jarvis-alert/10 px-2 py-1 rounded border border-transparent hover:border-jarvis-alert transition-all flex items-center gap-1 uppercase tracking-wider"
             title="Purge System"
           >
             <Trash2 className="w-3 h-3" /> PURGE
           </button>
           <span className="text-[10px] font-mono text-jarvis-blue/60 bg-jarvis-blue/5 px-2 py-0.5 rounded border border-jarvis-blue/10">ENTITIES: {objects.length}</span>
         </div>
      </div>

      {/* 3D Visualization Area */}
      <div className="relative flex-1 border border-jarvis-blue/30 rounded-lg overflow-hidden mb-3 flex items-center justify-center perspective-1000 group transition-all duration-500 bg-black shadow-[inset_0_0_50px_rgba(0,0,0,0.8)]">
        
        {/* === SIMULATED ENVIRONMENT / CAMERA FEED === */}
        {renderSimulatedEnvironment()}

        {/* Scanning Effect Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-jarvis-blue/5 to-transparent h-[20%] animate-scan pointer-events-none z-20 mix-blend-screen" />
        
        {/* Viewport UI Overlay (Corners) */}
        <div className="absolute inset-0 border border-jarvis-blue/10 rounded-lg pointer-events-none z-30 shadow-[0_0_15px_rgba(0,240,255,0.05)]">
           <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-jarvis-blue/50" />
           <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-jarvis-blue/50" />
           <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-bottom-2 border-jarvis-blue/50" />
           <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-bottom-2 border-jarvis-blue/50" />
        </div>

        {/* Scanlines Effect */}
        <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] opacity-10 pointer-events-none z-20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_50%,rgba(0,0,0,0.8)_100%)] pointer-events-none z-20" />

        {/* Animated 3D Scene Container */}
        <div 
            className="relative w-32 h-32 transform-style-3d transition-transform duration-75 z-30" 
            style={{ 
                transform: `rotateX(60deg) rotateZ(${rotation}deg)`,
                transformStyle: 'preserve-3d',
                filter: `brightness(${ambientIntensity}) drop-shadow(0 0 ${15 * ambientIntensity}px ${ambientColor}40)`
            }}
        >
           {/* Center Pivot Marker */}
           <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 shadow-[0_0_15px_white]" />
           <div className="absolute top-1/2 left-1/2 w-32 h-32 border border-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 transform scale-150" />
           
           {/* Scene Objects */}
           {objects.map(renderObject)}

           {/* Reference Ring */}
           {environment !== 'MINIMAL' && (
             <div className="absolute inset-[-100%] border border-jarvis-blue/10 rounded-full opacity-20 transform translate-z-[-30px] bg-[radial-gradient(circle,rgba(0,240,255,0.1)_0%,transparent_70%)]" />
           )}
        </div>

        {/* HUD Overlay Stats */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 pointer-events-none z-40">
           <div className="flex items-center gap-2 text-[10px] font-mono text-jarvis-blue">
              <span className="w-2 h-2 bg-jarvis-blue rounded-full animate-pulse" />
              RENDERING_ENGINE_V4
           </div>
           <div className="text-[9px] font-mono text-jarvis-blue/60 pl-4">FPS: 60 // PING: 4ms</div>
           <div className="text-[9px] font-mono text-jarvis-blue/60 pl-4 mt-1">ISO: {Math.round(800 * ambientIntensity)}</div>
        </div>
        
        {/* Quick Toggles Overlay */}
        <div className="absolute bottom-3 right-3 flex gap-1 z-40">
             <button onClick={() => setEnvironment('STUDIO')} className={`p-2 rounded-sm transition-all duration-300 ${environment === 'STUDIO' ? 'bg-jarvis-blue text-black shadow-[0_0_10px_#00f0ff]' : 'bg-black/60 text-gray-500 border border-gray-800 hover:border-jarvis-blue hover:text-jarvis-blue'}`} title="Studio"><Grid3X3 className="w-4 h-4"/></button>
             <button onClick={() => setEnvironment('SPACE')} className={`p-2 rounded-sm transition-all duration-300 ${environment === 'SPACE' ? 'bg-jarvis-blue text-black shadow-[0_0_10px_#00f0ff]' : 'bg-black/60 text-gray-500 border border-gray-800 hover:border-jarvis-blue hover:text-jarvis-blue'}`} title="Space"><Globe className="w-4 h-4"/></button>
             <button onClick={() => setEnvironment('MINIMAL')} className={`p-2 rounded-sm transition-all duration-300 ${environment === 'MINIMAL' ? 'bg-jarvis-blue text-black shadow-[0_0_10px_#00f0ff]' : 'bg-black/60 text-gray-500 border border-gray-800 hover:border-jarvis-blue hover:text-jarvis-blue'}`} title="Minimal"><Square className="w-4 h-4"/></button>
        </div>
      </div>

      {/* Management Interface */}
      <div className="flex flex-col h-56 border-t border-jarvis-blue/20 pt-2 bg-black/20 backdrop-blur-sm">
         {/* Tabs */}
         <div className="flex items-center gap-2 mb-3 px-1 border-b border-white/5">
            {[
               { id: 'LIBRARY', icon: Package, label: 'ASSETS' },
               { id: 'SCENE', icon: List, label: 'GRAPH' },
               { id: 'ENVIRONMENT', icon: Settings, label: 'SYSTEM' }
            ].map(tab => (
               <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)} 
                  className={`flex-1 flex items-center justify-center gap-2 py-2 text-[10px] font-bold font-mono transition-all uppercase tracking-widest relative overflow-hidden group ${
                     activeTab === tab.id 
                     ? 'text-jarvis-blue bg-jarvis-blue/10 border-b-2 border-jarvis-blue' 
                     : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                  }`}
               >
                  <tab.icon className="w-3 h-3" /> {tab.label}
                  {activeTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-[1px] bg-jarvis-blue shadow-[0_0_10px_#00f0ff]" />}
               </button>
            ))}
         </div>

         {/* Tab Content */}
         <div className="flex-1 overflow-hidden relative px-1">
            
            {/* LIBRARY VIEW */}
            {activeTab === 'LIBRARY' && (
              <div className="h-full flex flex-col animate-in slide-in-from-left duration-300 fade-in">
                  {/* Category Filter */}
                  <div className="flex items-center justify-between mb-3">
                     <div className="flex gap-1 bg-black/40 p-1 rounded border border-gray-800">
                        {(['ALL', 'GEOMETRY', 'ENV', 'LIGHTS'] as const).map(cat => (
                           <button
                              key={cat}
                              onClick={() => setActiveCategory(cat)}
                              className={`px-3 py-1 rounded text-[9px] font-mono uppercase tracking-wider transition-all ${
                                 activeCategory === cat 
                                 ? 'bg-jarvis-blue text-black shadow-[0_0_10px_#00f0ff]' 
                                 : 'text-gray-500 hover:text-gray-300'
                              }`}
                           >
                              {cat}
                           </button>
                        ))}
                     </div>
                     <button 
                       onClick={() => setIsManagingLibrary(!isManagingLibrary)}
                       className={`p-1.5 rounded border transition-all ${isManagingLibrary ? 'border-jarvis-blue text-jarvis-blue bg-jarvis-blue/10' : 'border-gray-800 text-gray-500 hover:text-jarvis-blue'}`}
                       title="Add Custom Asset"
                     >
                       {isManagingLibrary ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                     </button>
                  </div>
                  
                  {/* Add Asset Form */}
                  {isManagingLibrary && (
                     <div className="mb-3 p-3 bg-jarvis-blue/5 border border-jarvis-blue/20 rounded-lg grid gap-2 relative overflow-hidden">
                        <div className="absolute inset-0 bg-scanlines opacity-10 pointer-events-none" />
                        <div className="text-[10px] font-mono text-jarvis-blue/70 mb-1">NEW_ASSET_PROTOCOL</div>
                        <div className="grid grid-cols-2 gap-2">
                           <input 
                              type="text" 
                              placeholder="ASSET_ID"
                              value={newAsset.label}
                              onChange={(e) => setNewAsset({...newAsset, label: e.target.value})}
                              className="bg-black/60 border border-jarvis-blue/30 rounded px-3 py-2 text-[10px] font-mono text-white placeholder-gray-600 outline-none focus:border-jarvis-blue transition-colors"
                           />
                           <select
                              value={newAsset.category}
                              onChange={(e) => setNewAsset({...newAsset, category: e.target.value as LibraryCategory})}
                              className="bg-black/60 border border-jarvis-blue/30 rounded px-3 py-2 text-[10px] font-mono text-white outline-none focus:border-jarvis-blue"
                           >
                              <option value="GEOMETRY">GEOMETRY</option>
                              <option value="ENV">ENVIRONMENT</option>
                              <option value="LIGHTS">LIGHTING</option>
                           </select>
                        </div>
                        <div className="grid grid-cols-[1fr,auto] gap-2">
                           <select
                              value={newAsset.visualType}
                              onChange={(e) => setNewAsset({...newAsset, visualType: e.target.value})}
                              className="bg-black/60 border border-jarvis-blue/30 rounded px-3 py-2 text-[10px] font-mono text-white outline-none focus:border-jarvis-blue"
                           >
                              {VISUAL_TEMPLATES.filter(t => t.category === newAsset.category).map(t => (
                                 <option key={t.id} value={t.id}>{t.label} [RENDER_CORE]</option>
                              ))}
                           </select>
                           <button 
                             onClick={handleCreateLibraryItem}
                             className="px-4 py-1 bg-jarvis-blue hover:bg-jarvis-cyan text-black font-bold rounded flex items-center justify-center shadow-[0_0_10px_rgba(0,240,255,0.4)] transition-all active:scale-95"
                           >
                             <Save className="w-4 h-4" />
                           </button>
                        </div>
                     </div>
                  )}

                  {/* Asset Grid */}
                  <div className="grid grid-cols-2 gap-2 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-jarvis-blue/20 content-start pb-2">
                     {getFilteredAssets().map((item) => (
                        <button
                           key={item.id}
                           onClick={() => handleAddAsset(item, item.category)}
                           className="group relative flex items-center gap-3 p-2 border border-jarvis-blue/10 rounded bg-black/40 hover:bg-jarvis-blue/5 hover:border-jarvis-blue/40 transition-all text-left active:scale-95 overflow-hidden"
                        >
                           <div className="absolute inset-0 bg-gradient-to-r from-jarvis-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                           
                           <div className="relative w-8 h-8 rounded bg-black/50 border border-jarvis-blue/20 flex items-center justify-center group-hover:border-jarvis-blue/60 group-hover:shadow-[0_0_10px_rgba(0,240,255,0.2)] transition-all">
                              <Box className="w-4 h-4 text-jarvis-blue/50 group-hover:text-jarvis-blue" />
                           </div>
                           
                           <div className="flex flex-col min-w-0 flex-1 relative z-10">
                              <span className="text-[10px] font-bold font-mono text-gray-300 group-hover:text-jarvis-blue truncate tracking-wider">{item.label}</span>
                              <span className="text-[8px] font-mono text-gray-600 truncate">{item.visualType}</span>
                           </div>
                           
                           <Plus className="w-3 h-3 text-gray-700 group-hover:text-jarvis-blue transition-colors" />

                           {/* Delete Button */}
                           {isManagingLibrary && (
                             <div 
                               onClick={(e) => handleDeleteLibraryItem(item.category, item.id, e)}
                               className="absolute top-0 right-0 bottom-0 w-8 bg-red-900/90 flex items-center justify-center translate-x-full group-hover:translate-x-0 transition-transform"
                             >
                               <X className="w-3 h-3 text-white" />
                             </div>
                           )}
                        </button>
                     ))}
                  </div>
              </div>
            )}

            {/* SCENE GRAPH VIEW */}
            {activeTab === 'SCENE' && (
               <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-jarvis-blue/20 pr-1 animate-in slide-in-from-right duration-300 fade-in">
                  {objects.length === 0 ? (
                     <div className="flex flex-col items-center justify-center h-full text-jarvis-blue/30 gap-3">
                        <Layers className="w-10 h-10 opacity-50" />
                        <span className="text-[10px] font-mono tracking-widest">NO_ENTITIES_DETECTED</span>
                     </div>
                  ) : (
                     <div className="space-y-1">
                        {objects.map((obj, idx) => (
                           <div key={obj.id} className="flex items-center justify-between p-2 border-l-2 border-l-jarvis-blue/50 border-y border-r border-white/5 bg-white/5 hover:bg-jarvis-blue/5 transition-colors group relative">
                              <div className="flex items-center gap-3">
                                 <span className="text-[9px] font-mono text-jarvis-blue/40 w-4">0{idx + 1}</span>
                                 <div className="flex flex-col">
                                    <span className="text-[10px] font-bold font-mono text-gray-200 tracking-wider">{obj.label.toUpperCase()}</span>
                                    <span className="text-[8px] font-mono text-jarvis-blue/60">ID: {obj.id.slice(0,8)}...</span>
                                 </div>
                              </div>
                              <button 
                                 onClick={() => handleRemoveObject(obj.id)}
                                 className="p-1.5 rounded hover:bg-red-900/50 text-gray-600 hover:text-red-400 transition-colors"
                              >
                                 <X className="w-3 h-3" />
                              </button>
                           </div>
                        ))}
                     </div>
                  )}
               </div>
            )}

            {/* ENVIRONMENT CONTROLS VIEW */}
            {activeTab === 'ENVIRONMENT' && (
               <div className="h-full p-1 animate-in slide-in-from-bottom duration-300 fade-in overflow-y-auto scrollbar-thin scrollbar-thumb-jarvis-blue/20">
                  <div className="flex flex-col gap-4">
                     
                     {/* Intensity Control */}
                     <div className="space-y-2 p-3 border border-white/5 rounded bg-black/40">
                        <div className="flex justify-between text-[10px] font-mono text-jarvis-blue">
                           <span className="tracking-widest flex items-center gap-2"><Aperture className="w-3 h-3"/> ILLUMINATION_LEVEL</span>
                           <span>{Math.round(ambientIntensity * 100)}%</span>
                        </div>
                        <input 
                           type="range" 
                           min="0.2" 
                           max="2.0" 
                           step="0.1" 
                           value={ambientIntensity} 
                           onChange={(e) => setAmbientIntensity(parseFloat(e.target.value))}
                           className="w-full accent-jarvis-blue h-1 bg-gray-800 rounded appearance-none cursor-pointer"
                        />
                     </div>

                     {/* Color Control */}
                     <div className="space-y-2 p-3 border border-white/5 rounded bg-black/40">
                        <span className="text-[10px] font-mono text-jarvis-blue tracking-widest">SPECTRUM_ANALYSIS</span>
                        <div className="flex gap-2 justify-between">
                           {['#00f0ff', '#ff3333', '#facc15', '#ffffff', '#a855f7'].map(color => (
                              <button
                                 key={color}
                                 onClick={() => setAmbientColor(color)}
                                 className={`w-8 h-8 rounded-sm border transition-all relative overflow-hidden group ${ambientColor === color ? 'border-white shadow-[0_0_10px_white]' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                 style={{ backgroundColor: color }}
                                 aria-label={`Select color ${color}`}
                              >
                                 <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                              </button>
                           ))}
                           <div className="relative w-8 h-8 rounded-sm overflow-hidden border border-gray-600 group cursor-pointer">
                              <div className="absolute inset-0 bg-[conic-gradient(from_180deg_at_50%_50%,#FF0000_0deg,#00FF00_120deg,#0000FF_240deg,#FF0000_360deg)] opacity-80 group-hover:opacity-100 transition-opacity" />
                              <input 
                                 type="color" 
                                 value={ambientColor}
                                 onChange={(e) => setAmbientColor(e.target.value)}
                                 className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              />
                           </div>
                        </div>
                     </div>
                     
                     <div className="mt-auto p-2 border-t border-jarvis-blue/20 text-center">
                        <div className="text-[9px] font-mono text-jarvis-blue/40 animate-pulse">SYSTEM_CALIBRATION_NOMINAL</div>
                     </div>
                  </div>
               </div>
            )}
         </div>
      </div>
    </div>
  );
};

export default ARControlPanel;
