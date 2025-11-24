import React, { useRef, useState, useMemo, forwardRef, useImperativeHandle } from 'react';

interface Props {
  children: React.ReactNode;
  className?: string;
  noTilt?: boolean;
  role?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-live'?: 'off' | 'assertive' | 'polite';
  'aria-busy'?: boolean;
  'aria-expanded'?: boolean;
  'aria-controls'?: string;
  'aria-checked'?: boolean | 'mixed';
  'aria-selected'?: boolean;
  'aria-haspopup'?: boolean | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog';
  'aria-pressed'?: boolean | 'mixed';
  tabIndex?: number;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'default' | 'alert' | 'simple';
}

const HolographicCard = forwardRef<HTMLDivElement, Props>(({ 
  children, 
  className = '', 
  noTilt = false,
  role,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
  'aria-live': ariaLive,
  'aria-busy': ariaBusy,
  'aria-expanded': ariaExpanded,
  'aria-controls': ariaControls,
  'aria-checked': ariaChecked,
  'aria-selected': ariaSelected,
  'aria-haspopup': ariaHasPopup,
  'aria-pressed': ariaPressed,
  tabIndex,
  onClick,
  disabled = false,
  variant = 'default'
}, ref) => {
  const internalRef = useRef<HTMLDivElement>(null);

  // Expose the underlying DOM element to parent components
  useImperativeHandle(ref, () => internalRef.current as HTMLDivElement);
  
  // State for interaction feedback
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (noTilt || !internalRef.current || disabled) return;

    const card = internalRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Enhanced rotation sensitivity for better holographic feel
    const rotateX = ((y - centerY) / centerY) * -6; 
    const rotateY = ((x - centerX) / centerX) * 6;

    setRotation({ x: rotateX, y: rotateY });
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setIsPressed(false);
    // Reset rotation is handled by state update which triggers the return transition
    if (!noTilt) {
      setRotation({ x: 0, y: 0 });
    }
  };

  const handleMouseDown = () => {
    if (!disabled) setIsPressed(true);
  };

  const handleMouseUp = () => setIsPressed(false);
  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  const handleClick = () => {
    if (onClick && !disabled) {
      onClick();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (onClick && !disabled && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      setIsPressed(true);
      onClick();
      setTimeout(() => setIsPressed(false), 200);
    }
  };

  const defaultRole = onClick ? 'button' : undefined;
  const computedRole = role || defaultRole;
  
  const defaultTabIndex = (onClick && !disabled) ? 0 : undefined;
  const computedTabIndex = tabIndex ?? defaultTabIndex;

  // Calculate dynamic transform based on state
  const transformString = useMemo(() => {
    if (disabled) return 'none';
    
    // Scale logic: Contract when pressed, Expand when focused/hovered
    const scale = isPressed ? 0.98 : (isHovering || isFocused ? 1.02 : 1);
    
    if (noTilt) {
      return scale !== 1 ? `scale3d(${scale}, ${scale}, ${scale})` : 'none';
    }

    return `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale3d(${scale}, ${scale}, ${scale})`;
  }, [rotation, isHovering, isFocused, isPressed, noTilt, disabled]);

  // Dynamic transition configuration for perfectly synchronized animation
  const transitionClass = useMemo(() => {
    if (disabled) return 'transition-all duration-300 ease-out';
    
    // Immediate response for press interaction
    if (isPressed) return 'transition-transform duration-75 ease-[cubic-bezier(0.1,0,0.9,1)]';
    
    // Smooth tracking for hover (optimized tracking latency)
    if (isHovering) return 'transition-transform duration-100 ease-out';
    
    // Smooth elastic return to rest state
    return 'transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]';
  }, [isPressed, isHovering, disabled]);

  const borderColor = variant === 'alert' ? 'border-jarvis-alert' : 'border-jarvis-blue';
  
  return (
    <div
      ref={internalRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`relative outline-none select-none group will-change-transform ${transitionClass} ${
        onClick && !disabled ? 'cursor-pointer' : ''
      } ${
        disabled ? 'opacity-50 cursor-not-allowed grayscale' : ''
      } ${className}`}
      style={{ transform: transformString }}
      role={computedRole}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      aria-describedby={ariaDescribedBy}
      aria-live={ariaLive}
      aria-busy={ariaBusy}
      aria-expanded={ariaExpanded}
      aria-controls={ariaControls}
      aria-checked={ariaChecked}
      aria-selected={ariaSelected}
      aria-haspopup={ariaHasPopup}
      aria-pressed={ariaPressed}
      aria-disabled={disabled}
      tabIndex={computedTabIndex}
    >
      {/* Glass Panel Background */}
      <div className={`absolute inset-0 bg-jarvis-panel backdrop-blur-sm transition-colors duration-300 ${
        isHovering || isFocused ? 'bg-opacity-80' : 'bg-opacity-60'
      }`} style={{ 
        clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)'
      }} />

      {/* Tech Borders / Corners */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top Left Bracket */}
        <svg className={`absolute top-0 left-0 w-6 h-6 ${borderColor} transition-all duration-300 ${isHovering || isFocused ? 'text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]' : ''}`} viewBox="0 0 24 24" fill="none">
          <path d="M1 23V8L8 1H23" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
        </svg>

        {/* Top Right Bracket */}
        <svg className={`absolute top-0 right-0 w-6 h-6 ${borderColor} transition-all duration-300 ${isHovering || isFocused ? 'text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]' : ''}`} viewBox="0 0 24 24" fill="none">
          <path d="M1 1H16L23 8V23" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
        </svg>

        {/* Bottom Left Bracket */}
        <svg className={`absolute bottom-0 left-0 w-6 h-6 ${borderColor} transition-all duration-300 ${isHovering || isFocused ? 'text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]' : ''}`} viewBox="0 0 24 24" fill="none">
          <path d="M23 1V16L16 23H1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
        </svg>

        {/* Bottom Right Bracket */}
        <svg className={`absolute bottom-0 right-0 w-6 h-6 ${borderColor} transition-all duration-300 ${isHovering || isFocused ? 'text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]' : ''}`} viewBox="0 0 24 24" fill="none">
          <path d="M1 1V16L8 23H23" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
        </svg>
        
        {/* Horizontal Connectors */}
        <div className={`absolute top-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-${borderColor.replace('border-', '')}/50 to-transparent transition-opacity duration-300 ${isHovering || isFocused ? 'opacity-100' : 'opacity-50'}`} />
        <div className={`absolute bottom-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-${borderColor.replace('border-', '')}/50 to-transparent transition-opacity duration-300 ${isHovering || isFocused ? 'opacity-100' : 'opacity-50'}`} />
      </div>
      
      {/* Scanline Overlay */}
      <div className="absolute inset-0 bg-scanlines opacity-10 pointer-events-none" style={{ 
        clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)'
      }}/>

      {/* Focus Ring (Visible only when focused via keyboard) */}
      {isFocused && !isPressed && (
        <div className="absolute inset-[-4px] border border-jarvis-blue/50 rounded-lg animate-pulse pointer-events-none" style={{
           clipPath: 'polygon(12px -4px, 100% -4px, 100% calc(100% - 12px), calc(100% - 12px) 100%, -4px 100%, -4px 12px)'
        }} />
      )}

      <div className="relative z-10 p-4 h-full">
        {children}
      </div>
    </div>
  );
});

HolographicCard.displayName = 'HolographicCard';

export default HolographicCard;