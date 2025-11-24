
import React, { useRef, useEffect, useState } from 'react';
import { Camera, RefreshCw, X } from 'lucide-react';

interface Props {
  onCapture: (base64: string) => void;
  onClose: () => void;
}

const VisionModule: React.FC<Props> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isFlashing, setIsFlashing] = useState(false);

  useEffect(() => {
    let mediaStream: MediaStream | null = null;
    
    const startCamera = async () => {
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error("Vision Module Malfunction:", err);
      }
    };
    startCamera();

    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      // Trigger flash effect
      setIsFlashing(true);

      const context = canvasRef.current.getContext('2d');
      if (context) {
        // Set canvas dimensions to match video
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        
        // Draw video frame to canvas
        context.drawImage(videoRef.current, 0, 0);
        
        // Get base64 string (remove data URL prefix for API)
        const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.8);
        const base64 = dataUrl.split(',')[1];
        
        // Short delay to allow flash animation to be seen before potentially closing/changing state
        setTimeout(() => {
          onCapture(base64);
          setIsFlashing(false);
        }, 150);
      }
    }
  };

  return (
    <div className="relative w-full h-full bg-black border border-jarvis-blue rounded overflow-hidden">
      {/* Camera Flash Overlay */}
      <div className={`absolute inset-0 bg-white z-50 pointer-events-none transition-opacity duration-200 ${isFlashing ? 'opacity-80' : 'opacity-0'}`} />

      <div className="absolute top-0 left-0 w-full bg-jarvis-blue/20 p-2 flex justify-between items-center z-10">
        <span className="text-xs font-mono text-jarvis-blue animate-pulse">VISION_MODULE_ACTIVE</span>
        <button onClick={onClose}><X className="w-4 h-4 text-jarvis-alert" /></button>
      </div>
      
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        className="w-full h-full object-cover opacity-80"
      />
      
      <canvas ref={canvasRef} className="hidden" />

      {/* HUD Overlay */}
      <div className="absolute inset-0 border-[20px] border-jarvis-blue/10 pointer-events-none">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 border border-jarvis-blue/50 rounded-full flex items-center justify-center">
            <div className="w-1 h-1 bg-jarvis-alert rounded-full" />
         </div>
         <div className="absolute top-4 right-4 font-mono text-[10px] text-jarvis-blue text-right">
            TARGET_ACQUISITION<br/>
            TRACKING...
         </div>
      </div>

      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4 z-20">
        <button 
          onClick={handleCapture}
          className="p-3 rounded-full bg-jarvis-blue/20 border border-jarvis-blue hover:bg-jarvis-blue/40 text-jarvis-blue transition-all active:scale-95 group"
          aria-label="Capture Image"
        >
          <Camera className="w-6 h-6 group-hover:scale-110 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default VisionModule;
