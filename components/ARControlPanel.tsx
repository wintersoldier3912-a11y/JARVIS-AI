
import React, { useState, useEffect, useMemo } from 'react';
import { Box, Grid3X3, Trash2, Globe, Package, Plus, X, Settings, Move3d, Rotate3d, Aperture, Maximize2, Move, Search, List } from 'lucide-react';

interface Vector3 {
  x: number;
  y: number;
  z: number;
}

interface SceneObject {
  id: string;
  label: string;
  visualType: string;
  category: string;
  position: Vector3;
  rotation: Vector3;
  scale: Vector3;
}

interface LibraryItem {
  id: string;
  label: string;
  visualType: string;
  category: 'GEOMETRY' | 'ENV' | 'LIGHTS';
}

type EnvironmentType = 'STUDIO' | 'SPACE' | 'MINIMAL';
type LibraryCategory = 'ALL' | 'GEOMETRY' | 'ENV' | 'LIGHTS';

// Available visual templates for rendering
const INITIAL_LIBRARY: Record<'GEOMETRY' | 'ENV' | 'LIGHTS', LibraryItem[]> = {
  GEOMETRY: [
    { id: 'def_cube', label: 'Cube', visualType: 'CUBE_01', category: 'GEOMETRY' },
    { id: 'def_sphere', label: 'Sphere', visualType: 'SPHERE_UV', category: 'GEOMETRY' },
    { id: 'def_pyramid', label: 'Pyramid', visualType: 'PYRAMID', category: 'GEOMETRY' },
    { id: 'def_mono', label: 'Monolith', visualType: 'MONOLITH', category: 'GEOMETRY' }
  ],
  ENV: [
    { id: 'def_terrain', label: 'Terrain', visualType: 'TERRAIN_HM', category: 'ENV' },
    { id: 'def_grid', label: 'Hologrid', visualType: 'GRID_FLOOR', category: 'ENV' },
    { id: 'def_part', label: 'Stardust', visualType: 'PARTICLES', category: 'ENV' }
  ],
  LIGHTS: [
    { id: 'def_light', label: 'Omni Light', visualType: 'LIGHT_RIG', category: 'LIGHTS' },
    { id: 'def_neon', label: 'Neon Bar', visualType: 'NEON_BAR', category: 'LIGHTS' },
    { id: 'def_laser', label: 'Laser', visualType: 'LASER_EMITTER', category: 'LIGHTS' }
  ]
};

// Extracted to prevent re-mounting and focus loss on every render
const TransformControlRow = ({ 
  label, 
  icon: Icon, 
  value, 
  min, 
  max, 
  step,
  onChange 
}: {
  label: string;
  icon: any;
  value: Vector3;
  min: number;
  max: number;
  step: number;
  onChange: (axis: 'x' | 'y' | 'z', val: number) => void;
}) => (
  <div className="space-y-1">
    <div className="flex justify-between items-center text-[9px] font-mono text-gray-500">
      <div className="flex items-center gap-1">
        <Icon className="w-3 h-3 text-jarvis-blue" /> {label}
      </div>
    </div>
    <div className="grid grid-cols-3 gap-2">
      {(['x', 'y', 'z'] as const).map(axis => (
        <div key={axis} className="relative group">
          <span className="absolute left-1 top-1/2 -translate-y-1/2 text-[8px] font-mono text-jarvis-blue/50 uppercase">{axis}</span>
          <input 
            type="number"
            value={value[axis]}
            onChange={(e) => onChange(axis, parseFloat(e.target.value))}
            className="w-full bg-black/40 border border-gray-800 rounded pl-3 pr-1 py-0.5 text-[9px] font-mono text-gray-300 focus:border-jarvis-blue focus:text-jarvis-blue outline-none transition-colors"
            step={step}
          />
        </div>
      ))}
    </div>
    {/* Visual Slider for X axis (primary adjustment proxy) */}
    <input 
      type="range"
      min={min} max={max} step={step}
      value={value.x}
      onChange={(e) => onChange('x', parseFloat(e.target.value))}
      className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-jarvis-blue mt-1"
    />
  </div>
);

const ARControlPanel: React.FC = () => {
  const [rotation, setRotation] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [environment, setEnvironment] = useState<EnvironmentType>('STUDIO');
  const [selectedId, setSelectedId] = useState<string | null>('default-cube');
  const [activeCategory, setActiveCategory] = useState<LibraryCategory>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [objects, setObjects] = useState<SceneObject[]>([
    { 
      id: 'default-cube', 
      label: 'Cube', 
      visualType: 'CUBE_01', 
      category: 'GEOMETRY', 
      position: { x: 0, y: 0, z: 0 }, 
      rotation: { x: 45, y: 45, z: 0 },
      scale: { x: 1, y: 1, z: 1 }
    }
  ]);

  // Filter Logic
  const libraryItems = useMemo(() => {
    let items: LibraryItem[] = [];
    if (activeCategory === 'ALL') {
      items = [
        ...INITIAL_LIBRARY.GEOMETRY,
        ...INITIAL_LIBRARY.ENV,
        ...INITIAL_LIBRARY.LIGHTS
      ];
    } else {
      items = INITIAL_LIBRARY[activeCategory];
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(i => i.label.toLowerCase().includes(q));
    }
    return items;
  }, [activeCategory, searchQuery]);

  // Auto-rotate scene
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setRotation(prev => (prev + 0.2) % 360);
    }, 16);
    return () => clearInterval(interval);
  }, [isPaused]);

  const handleAddObject = (item: LibraryItem) => {
    const newObj: SceneObject = {
      id: `${item.visualType.toLowerCase()}-${Date.now()}`,
      label: item.label,
      visualType: item.visualType,
      category: item.category,
      position: { x: (Math.random() - 0.5) * 50, y: (Math.random() - 0.5) * 20, z: (Math.random() - 0.5) * 50 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 }
    };
    setObjects([...objects, newObj]);
    setSelectedId(newObj.id);
  };

  const handleUpdateTransform = (prop: 'position' | 'rotation' | 'scale', axis: 'x' | 'y' | 'z', value: number) => {
    if (!selectedId) return;
    setObjects(prev => prev.map(obj => {
      if (obj.id !== selectedId) return obj;
      return {
        ...obj,
        [prop]: { ...obj[prop], [axis]: value }
      };
    }));
  };

  const handleDelete = () => {
    if (!selectedId) return;
    setObjects(prev => prev.filter(o => o.id !== selectedId));
    setSelectedId(null);
  };

  const selectedObject = objects.find(o => o.id === selectedId);

  const renderObject = (obj: SceneObject) => {
    const isSelected = obj.id === selectedId;
    
    // Calculate CSS Transforms
    const transform = `
      translate3d(${obj.position.x}px, ${-obj.position.y}px, ${obj.position.z}px)
      rotateX(${obj.rotation.x}deg)
      rotateY(${obj.rotation.y}deg)
      rotateZ(${obj.rotation.z}deg)
      scale3d(${obj.scale.x}, ${obj.scale.y}, ${obj.scale.z})
    `;

    // Render style based on type
    let innerContent = null;
    let styleClass = '';

    switch(obj.visualType) {
      case 'CUBE_01':
        styleClass = 'border border-jarvis-blue bg-jarvis-blue/20';
        innerContent = <div className="absolute inset-0 border border-jarvis-blue/30 bg-jarvis-blue/10" />;
        break;
      case 'SPHERE_UV':
        styleClass = 'rounded-full border border-jarvis-cyan bg-jarvis-cyan/10 overflow-hidden';
        innerContent = <div className="w-full h-full rounded-full border-t border-jarvis-cyan opacity-50 animate-spin-slow" />;
        break;
      case 'GRID_FLOOR':
        return (
          <div 
            key={obj.id} 
            className="absolute w-96 h-96 border border-jarvis-blue/30 opacity-50"
            style={{ 
              transform: `translate3d(-50%, -50%, 0) rotateX(90deg) ${transform}`,
              backgroundImage: 'linear-gradient(rgba(0, 240, 255, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 240, 255, 0.2) 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }}
          />
        );
      case 'LIGHT_RIG':
        styleClass = 'rounded-full bg-white shadow-[0_0_50px_white]';
        break;
      default:
        styleClass = 'border border-white/50 bg-white/10';
    }

    return (
      <div 
        key={obj.id}
        onClick={(e) => { e.stopPropagation(); setSelectedId(obj.id); }}
        className={`absolute transform-style-3d cursor-pointer transition-transform duration-200 ${isSelected ? 'z-50' : 'z-0'}`}
        style={{ 
          transform: transform,
          width: '64px', 
          height: '64px',
          left: '50%',
          top: '50%',
          marginLeft: '-32px',
          marginTop: '-32px'
        }}
      >
        <div className={`w-full h-full flex items-center justify-center relative ${styleClass} ${isSelected ? 'ring-2 ring-jarvis-alert shadow-[0_0_30px_rgba(0,240,255,0.4)]' : ''}`}>
          {innerContent}
          {isSelected && (
            <div className="absolute -inset-4 border border-jarvis-alert/50 rounded-sm pointer-events-none">
              <div className="absolute -top-1 -left-1 w-2 h-2 border-t border-l border-jarvis-alert" />
              <div className="absolute -top-1 -right-1 w-2 h-2 border-t border-r border-jarvis-alert" />
              <div className="absolute -bottom-1 -left-1 w-2 h-2 border-b border-l border-jarvis-alert" />
              <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b border-r border-jarvis-alert" />
              {/* Axis Indicators */}
              <div className="absolute top-1/2 left-1/2 w-12 h-[1px] bg-red-500 origin-left transform" />
              <div className="absolute top-1/2 left-1/2 w-12 h-[1px] bg-green-500 origin-left transform -rotate-90" />
              <div className="absolute top-1/2 left-1/2 w-12 h-[1px] bg-blue-500 origin-left transform rotate-45" />
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderBackground = () => {
    switch (environment) {
      case 'SPACE':
        return (
          <div className="absolute inset-0 pointer-events-none bg-[#020205]" 
               style={{ 
                 backgroundImage: `
                     radial-gradient(white, rgba(255,255,255,.2) 2px, transparent 3px),
                     radial-gradient(white, rgba(255,255,255,.15) 1px, transparent 2px),
                     radial-gradient(white, rgba(255,255,255,.1) 2px, transparent 3px)
                 `,
                 backgroundSize: '550px 550px, 350px 350px, 250px 250px',
                 backgroundPosition: '0 0, 40px 60px, 130px 270px'
               }} 
          />
        );
      case 'MINIMAL':
        return <div className="absolute inset-0 pointer-events-none bg-[#111] bg-vignette" />;
      case 'STUDIO':
      default:
        return (
          <div className="absolute inset-0 opacity-20 pointer-events-none" 
               style={{ 
                 backgroundImage: `radial-gradient(circle at 50% 50%, #112 0%, #000 100%)` 
               }} 
          />
        );
    }
  };

  return (
    <div className="flex h-full w-full bg-black/80 text-jarvis-blue overflow-hidden relative font-mono">
      
      {/* LEFT COLUMN: Library */}
      <div className="w-16 md:w-56 flex flex-col border-r border-jarvis-blue/20 bg-black/60 z-20 backdrop-blur-xl transition-all">
        <div className="p-3 border-b border-jarvis-blue/20 flex flex-col gap-3">
          <div className="flex items-center gap-2 justify-center md:justify-start">
             <Package className="w-4 h-4 text-jarvis-blue" />
             <span className="hidden md:block font-bold tracking-widest text-xs">ASSETS</span>
          </div>
          
          {/* Search Bar */}
          <div className="hidden md:flex relative group">
             <div className="absolute inset-y-0 left-2 flex items-center pointer-events-none">
                <Search className="w-3 h-3 text-jarvis-blue/50" />
             </div>
             <input 
               type="text" 
               placeholder="FILTER..." 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="w-full bg-black/40 border border-jarvis-blue/20 rounded pl-7 pr-2 py-1 text-[10px] font-mono text-jarvis-blue focus:border-jarvis-blue/60 outline-none transition-colors"
             />
          </div>
        </div>
        
        {/* Category Tabs */}
        <div className="flex flex-col md:flex-row md:flex-wrap border-b border-jarvis-blue/20">
          {(['ALL', 'GEOMETRY', 'ENV', 'LIGHTS'] as const).map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`
                flex-1 p-2 md:py-2 md:px-1 flex justify-center items-center gap-1 transition-all relative overflow-hidden
                ${activeCategory === cat ? 'text-jarvis-blue bg-jarvis-blue/10' : 'text-gray-600 hover:text-jarvis-blue hover:bg-white/5'}
              `}
              title={cat}
            >
              {cat === 'ALL' && <Grid3X3 className="w-4 h-4" />}
              {cat === 'GEOMETRY' && <Box className="w-4 h-4" />}
              {cat === 'ENV' && <Globe className="w-4 h-4" />}
              {cat === 'LIGHTS' && <Aperture className="w-4 h-4" />}
              {activeCategory === cat && <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-jarvis-blue md:w-full md:h-0.5 md:top-auto md:bottom-0 md:left-0" />}
            </button>
          ))}
        </div>

        {/* Library List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-2 scrollbar-thin scrollbar-thumb-jarvis-blue/20">
          {libraryItems.length === 0 && (
             <div className="text-[10px] text-gray-600 text-center py-4 font-mono">NO_MATCHES</div>
          )}
          {libraryItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleAddObject(item)}
              className="w-full text-left p-2 rounded border border-gray-800 hover:border-jarvis-blue/50 hover:bg-jarvis-blue/5 transition-all group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-scanlines opacity-0 group-hover:opacity-10 transition-opacity" />
              <div className="flex justify-between items-start">
                  <div className="text-[10px] font-bold truncate relative z-10">{item.label}</div>
                  {activeCategory === 'ALL' && (
                     <span className="text-[7px] border border-gray-700 rounded px-1 text-gray-500 relative z-10">{item.category.substr(0,3)}</span>
                  )}
              </div>
              <div className="text-[8px] text-gray-500 relative z-10">{item.visualType}</div>
              <Plus className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-jarvis-blue" />
            </button>
          ))}
        </div>
      </div>

      {/* CENTER: 3D Viewport */}
      <div className="flex-1 relative perspective-container overflow-hidden bg-black" onClick={() => setSelectedId(null)}>
        
        {/* Background Layer */}
        {renderBackground()}
        
        {/* Overlay UI */}
        <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-2">
          {/* Pause/Play */}
          <button onClick={(e) => { e.stopPropagation(); setIsPaused(!isPaused); }} className="p-2 border border-jarvis-blue/30 rounded bg-black/40 hover:bg-jarvis-blue/10 transition-colors">
             {isPaused ? <Move className="w-4 h-4 text-jarvis-warn" /> : <Rotate3d className="w-4 h-4 text-jarvis-blue animate-spin-slow" />}
          </button>
          
          {/* Rotation Indicator */}
          <div className="px-3 py-2 border border-jarvis-blue/30 rounded bg-black/40 text-[10px] flex items-center gap-2">
            <span className="text-gray-500">CAM_ROT:</span>
            <span>{Math.round(rotation)}°</span>
          </div>

          {/* Environment Switcher */}
          <div className="flex bg-black/40 rounded border border-jarvis-blue/30 overflow-hidden">
             {(['STUDIO', 'SPACE', 'MINIMAL'] as EnvironmentType[]).map(env => (
                <button
                   key={env}
                   onClick={(e) => { e.stopPropagation(); setEnvironment(env); }}
                   className={`px-3 py-1 text-[9px] font-bold transition-colors ${environment === env ? 'bg-jarvis-blue text-black' : 'text-jarvis-blue hover:bg-jarvis-blue/20'}`}
                >
                   {env}
                </button>
             ))}
          </div>
        </div>

        <div className="absolute top-4 right-4 z-10 text-[10px] text-right opacity-50">
           VIEWPORT_Render_Core_2.5<br/>
           {objects.length} ENTITIES
        </div>

        {/* 3D Scene Container */}
        <div 
          className="w-full h-full flex items-center justify-center preserve-3d transition-transform duration-75"
          style={{ 
            perspective: '1000px',
            transformStyle: 'preserve-3d'
          }}
        >
          {/* World Pivot */}
          <div 
            className="relative w-0 h-0 preserve-3d"
            style={{ 
               transform: `rotateX(20deg) rotateY(${rotation}deg)` 
            }}
          >
             {/* Conditional Floor Grid */}
             {environment === 'STUDIO' && (
               <div className="absolute w-[800px] h-[800px] border border-jarvis-blue/10 rounded-full opacity-20" 
                    style={{ 
                      transform: 'translate(-50%, -50%, 0) rotateX(90deg)',
                      backgroundImage: 'linear-gradient(rgba(0, 240, 255, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 240, 255, 0.3) 1px, transparent 1px)',
                      backgroundSize: '40px 40px',
                    }} 
               />
             )}
             
             {objects.map(renderObject)}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Inspector / Properties */}
      {selectedObject && (
        <div className="absolute right-0 top-0 bottom-0 w-64 bg-black/90 border-l border-jarvis-blue/30 backdrop-blur-md z-30 flex flex-col animate-in slide-in-from-right">
          <div className="p-3 border-b border-jarvis-blue/20 flex justify-between items-center">
             <div className="flex flex-col">
                <span className="text-[10px] text-gray-500 uppercase">SELECTED_ENTITY</span>
                <span className="font-bold text-sm tracking-wider">{selectedObject.label}</span>
             </div>
             <button onClick={() => setSelectedId(null)} className="hover:text-white"><X className="w-4 h-4" /></button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6">
             
             <div className="space-y-4">
                <div className="flex items-center gap-2 text-jarvis-blue border-b border-jarvis-blue/10 pb-1">
                   <Settings className="w-3 h-3" />
                   <span className="text-[10px] font-bold">TRANSFORM</span>
                </div>
                
                <TransformControlRow 
                  label="POSITION" 
                  icon={Move3d}
                  value={selectedObject.position} 
                  min={-100} max={100} step={1}
                  onChange={(axis, val) => handleUpdateTransform('position', axis, val)}
                />

                <TransformControlRow 
                  label="ROTATION" 
                  icon={Rotate3d}
                  value={selectedObject.rotation} 
                  min={0} max={360} step={5}
                  onChange={(axis, val) => handleUpdateTransform('rotation', axis, val)}
                />

                <TransformControlRow 
                  label="SCALE" 
                  icon={Maximize2}
                  value={selectedObject.scale} 
                  min={0.1} max={5} step={0.1}
                  onChange={(axis, val) => handleUpdateTransform('scale', axis, val)}
                />
             </div>

             <div className="space-y-4">
                <div className="flex items-center gap-2 text-jarvis-blue border-b border-jarvis-blue/10 pb-1">
                   <List className="w-3 h-3" />
                   <span className="text-[10px] font-bold">ATTRIBUTES</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                   <div className="text-gray-500">ID:</div>
                   <div className="text-right truncate">{selectedObject.id}</div>
                   <div className="text-gray-500">TYPE:</div>
                   <div className="text-right">{selectedObject.visualType}</div>
                </div>
             </div>

          </div>

          <div className="p-4 border-t border-jarvis-blue/20">
             <button 
                onClick={handleDelete}
                className="w-full py-2 border border-jarvis-alert/50 text-jarvis-alert bg-jarvis-alert/10 rounded hover:bg-jarvis-alert/20 flex items-center justify-center gap-2 text-xs font-bold transition-all"
             >
                <Trash2 className="w-3 h-3" />
                DELETE OBJECT
             </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ARControlPanel;
