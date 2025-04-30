
import React, { useRef, useState, useEffect } from 'react';

interface CanvasProps {
  width: number;
  height: number;
  className?: string;
  onDrawingComplete: (dataURL: string) => void;
  imageUrl?: string;
  isActive: boolean;
}

const Canvas: React.FC<CanvasProps> = ({ 
  width, 
  height, 
  className = "", 
  onDrawingComplete,
  imageUrl,
  isActive
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const context = canvas.getContext('2d');
    setCtx(context);
    
    if (context) {
      context.lineJoin = 'round';
      context.lineCap = 'round';
      context.lineWidth = 5;
      context.strokeStyle = 'black';
    }
    
    // Clear canvas
    context?.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background image if provided
    if (imageUrl) {
      const img = new Image();
      img.onload = () => {
        context?.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
      img.src = imageUrl;
    }
  }, [imageUrl]);
  
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isActive) return;
    
    const canvas = canvasRef.current;
    if (!canvas || !ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };
  
  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !isActive) return;
    
    const canvas = canvasRef.current;
    if (!canvas || !ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };
  
  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      ctx?.closePath();
      
      // Send drawing data to parent
      const canvas = canvasRef.current;
      if (canvas) {
        const dataURL = canvas.toDataURL('image/png');
        onDrawingComplete(dataURL);
      }
    }
  };
  
  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={`drawing-canvas border ${isActive ? 'cursor-crosshair' : 'cursor-not-allowed opacity-50'} ${className}`}
      onMouseDown={startDrawing}
      onMouseMove={draw}
      onMouseUp={stopDrawing}
      onMouseLeave={stopDrawing}
    />
  );
};

export default Canvas;
