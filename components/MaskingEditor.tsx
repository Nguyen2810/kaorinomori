import React, { useRef, useEffect, useState, useCallback } from 'react';
import { BrushIcon } from './icons/BrushIcon';
import { EraserIcon } from './icons/EraserIcon';

interface MaskingEditorProps {
  imageSrc: string | null;
  onMaskChange: (maskBase64: string | null) => void;
}

export const MaskingEditor: React.FC<MaskingEditorProps> = ({ imageSrc, onMaskChange }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(20);
  const [isErasing, setIsErasing] = useState(false);

  const prepareCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Create a black background for the mask
    const ctx = canvas.getContext('2d');
    if (ctx) {
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        contextRef.current = ctx;
        onMaskChange(canvas.toDataURL('image/png').split(',')[1]);
    }
  }, [onMaskChange]);

  useEffect(() => {
    prepareCanvas();
  }, [imageSrc, prepareCanvas]);

  const startDrawing = ({ nativeEvent }: React.MouseEvent<HTMLCanvasElement>) => {
    const { offsetX, offsetY } = nativeEvent;
    if (!contextRef.current) return;
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const finishDrawing = () => {
    if (!contextRef.current) return;
    contextRef.current.closePath();
    setIsDrawing(false);
    if(canvasRef.current){
        onMaskChange(canvasRef.current.toDataURL('image/png').split(',')[1]);
    }
  };

  const draw = ({ nativeEvent }: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !contextRef.current) {
      return;
    }
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.strokeStyle = isErasing ? 'black' : 'white';
    contextRef.current.fillStyle = isErasing ? 'black' : 'white';
    contextRef.current.lineWidth = brushSize;
    contextRef.current.lineCap = 'round';
    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.stroke();
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
  };
  
  const handleClear = () => {
    prepareCanvas();
  }

  return (
    <div className="w-full space-y-4">
        {!imageSrc ? (
             <div className="w-full aspect-square bg-gray-200 rounded-lg flex items-center justify-center text-center text-gray-500 p-4">
                 <div>
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="mt-2 font-medium">Tải ảnh lên để bắt đầu tạo mặt nạ.</p>
                    <p className="text-sm">Vẽ lên sản phẩm bạn muốn giữ lại.</p>
                 </div>
            </div>
        ) : (
            <div className="relative w-full aspect-square rounded-lg overflow-hidden border">
                <img src={imageSrc} alt="Product to mask" className="absolute top-0 left-0 w-full h-full object-contain pointer-events-none" />
                <canvas
                    ref={canvasRef}
                    width={512}
                    height={512}
                    onMouseDown={startDrawing}
                    onMouseUp={finishDrawing}
                    onMouseMove={draw}
                    onMouseLeave={finishDrawing}
                    className="absolute top-0 left-0 w-full h-full opacity-50 cursor-crosshair"
                />
            </div>
        )}
      
      <div className="bg-gray-100 p-3 rounded-lg space-y-3">
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-2">
                <button 
                    onClick={() => setIsErasing(false)} 
                    className={`p-2 rounded-md transition-colors ${!isErasing ? 'bg-indigo-500 text-white' : 'bg-white hover:bg-gray-200'}`}
                    aria-label="Brush tool"
                >
                    <BrushIcon className="w-5 h-5"/>
                </button>
                 <button 
                    onClick={() => setIsErasing(true)} 
                    className={`p-2 rounded-md transition-colors ${isErasing ? 'bg-indigo-500 text-white' : 'bg-white hover:bg-gray-200'}`}
                    aria-label="Eraser tool"
                >
                    <EraserIcon className="w-5 h-5"/>
                </button>
           </div>
           <button onClick={handleClear} className="text-sm font-semibold text-gray-600 hover:text-indigo-600">
                Xóa mặt nạ
            </button>
        </div>
        <div className="flex items-center gap-3">
            <label htmlFor="brushSize" className="text-sm font-medium text-gray-700">Cỡ cọ:</label>
            <input
              id="brushSize"
              type="range"
              min="5"
              max="80"
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              className="w-full"
            />
        </div>
      </div>
    </div>
  );
};
