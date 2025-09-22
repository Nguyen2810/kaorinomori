import React from 'react';
import { DownloadIcon } from './icons/DownloadIcon';
import { ZoomInIcon } from './icons/ZoomInIcon';
import { MagicWandIcon } from './icons/MagicWandIcon';

interface GeneratedImageDisplayProps {
  imageUrl: string | null;
  isLoading: boolean;
  onPreviewClick: () => void;
  onEditClick: () => void;
}

export const GeneratedImageDisplay: React.FC<GeneratedImageDisplayProps> = ({ imageUrl, isLoading, onPreviewClick, onEditClick }) => {
  if (!imageUrl) {
    // Parent component now handles the placeholder, so this can be null
    return null; 
  }

  return (
    <div className="w-full h-full bg-gray-100 flex items-center justify-center overflow-hidden relative group">
      <img 
        src={imageUrl} 
        alt="Generated studio shot" 
        className="object-contain w-full h-full" 
      />
      {/* Overlay with buttons appears on hover */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center"
        onClick={onPreviewClick}
      >
        <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPreviewClick();
            }}
            className="bg-white text-gray-800 font-semibold py-2 px-4 rounded-lg shadow-lg hover:bg-gray-100 transition-colors flex items-center transform hover:scale-105"
            aria-label="Preview image"
          >
            <ZoomInIcon className="w-5 h-5" />
          </button>
           <button
            onClick={(e) => {
              e.stopPropagation();
              onEditClick();
            }}
            className="bg-white text-gray-800 font-semibold py-2 px-4 rounded-lg shadow-lg hover:bg-gray-100 transition-colors flex items-center transform hover:scale-105"
            aria-label="Edit image"
          >
            <MagicWandIcon className="w-5 h-5" />
          </button>
          <a
            href={imageUrl}
            download={`ai-product-shot-${Date.now()}.png`}
            onClick={(e) => e.stopPropagation()}
            className="bg-white text-gray-800 font-semibold py-2 px-4 rounded-lg shadow-lg hover:bg-gray-100 transition-colors flex items-center transform hover:scale-105"
            aria-label="Download image"
          >
            <DownloadIcon className="w-5 h-5" />
          </a>
        </div>
      </div>
    </div>
  );
};