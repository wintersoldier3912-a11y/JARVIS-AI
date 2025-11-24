
import React, { useEffect, useRef } from 'react';

const IngestionStream: React.FC<{ active: boolean }> = ({ active }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.parentElement?.clientWidth || 300;
    canvas.height = canvas.parentElement?.clientHeight || 200;

    const chars = '01ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const fontSize = 10;
    const columns = canvas.width / fontSize;
    const drops: number[] = new Array(Math.ceil(columns)).fill(1);

    const draw = () => {
      if (!active) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#00f0ff'; // JARVIS Blue
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 33);
    return () => clearInterval(interval);
  }, [active]);

  return (
    <div className="relative w-full h-32 overflow-hidden bg-black/50 border border-jarvis-blue/20 rounded mb-4">
      <div className="absolute top-1 left-2 text-[10px] font-mono text-jarvis-blue z-10 bg-black/80 px-1">
        DATA_INGESTION_PIPELINE.EXE
      </div>
      <canvas ref={canvasRef} className="w-full h-full opacity-60" />
    </div>
  );
};

export default IngestionStream;
