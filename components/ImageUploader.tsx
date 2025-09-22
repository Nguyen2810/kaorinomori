import React, { useRef, useCallback } from 'react';
import { UploadIcon } from './icons/UploadIcon';
import { ZoomInIcon } from './icons/ZoomInIcon';

interface ImageUploaderProps {
  onImageChange: (files: FileList | null) => void;
  previews: string[];
  onRemoveImage: (index: number) => void;
  onClearAll: () => void;
  onPreviewClick: (index: number) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageChange, previews, onRemoveImage, onClearAll, onPreviewClick }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    onImageChange(files);
     // Reset the input value to allow re-uploading the same file(s)
    event.target.value = '';
  };
  
  const handleContainerClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  }, []);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    onImageChange(files);
  }, [onImageChange]);

  return (
    <div 
      className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-brand transition-colors bg-gray-50"
    >
      <div 
        className="absolute inset-0 cursor-pointer"
        onClick={handleContainerClick}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      ></div>
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/png, image/jpeg, image/webp"
        multiple
      />
      {previews.length > 0 ? (
        <div className="space-y-4">
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {previews.map((preview, index) => (
                    <div key={index} className="relative aspect-square group">
                        <img src={preview} alt={`Product preview ${index + 1}`} className="w-full h-full object-contain rounded-md bg-white shadow-sm" />
                        <div
                          className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center cursor-pointer"
                          onClick={(e) => { e.stopPropagation(); onPreviewClick(index); }}
                        >
                           <ZoomInIcon className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <button
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent opening file dialog
                                onRemoveImage(index);
                            }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold hover:bg-red-600 transition-transform transform hover:scale-110 z-10"
                            aria-label={`Remove image ${index + 1}`}
                        >
                            &times;
                        </button>
                    </div>
                ))}
            </div>
            <div className="flex justify-between items-center pt-2 relative z-10">
                <p className="text-sm text-brand font-semibold">
                    Nhấn để thêm hoặc thay thế ảnh.
                </p>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onClearAll();
                    }}
                    className="text-sm font-semibold text-red-500 hover:text-red-700 transition-colors"
                >
                    Xóa tất cả
                </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center space-y-2 text-gray-500 pointer-events-none">
          <UploadIcon className="w-12 h-12 text-gray-400" />
          <p className="font-semibold">
            <span className="text-brand">Nhấn để tải lên</span> hoặc kéo và thả
          </p>
          <p className="text-xs">PNG, JPG, WEBP</p>
        </div>
      )}
    </div>
  );
};