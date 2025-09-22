import React, { useState, useCallback, useEffect } from 'react';
import { CloseIcon } from './icons/CloseIcon';

// Icons defined locally for this component
const ChevronLeftIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
  </svg>
);

const ChevronRightIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
  </svg>
);


interface ImagePreviewModalProps {
  images: string[];
  startIndex: number;
  onClose: () => void;
}

export const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({ images, startIndex, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [isAnimating, setIsAnimating] = useState(false);

  const goToPrevious = useCallback(() => {
    if (images.length <= 1) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
      setIsAnimating(false);
    }, 150); // Match animation duration
  }, [images.length]);

  const goToNext = useCallback(() => {
    if (images.length <= 1) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
      setIsAnimating(false);
    }, 150);
  }, [images.length]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
      if (images.length > 1) {
        if (event.key === 'ArrowLeft') {
          goToPrevious();
        } else if (event.key === 'ArrowRight') {
          goToNext();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, goToPrevious, goToNext, images.length]);

  if (images.length === 0) {
    return null;
  }

  const showNavigation = images.length > 1;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.2s ease-out; }
        .image-transition { transition: opacity 0.15s ease-in-out; }
        .image-fading { opacity: 0; }
      `}</style>
      
      <div
        className="relative bg-white p-2 rounded-lg shadow-2xl w-full max-w-4xl h-full max-h-[90vh] flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          key={currentIndex}
          src={images[currentIndex]}
          alt={`Generated image preview ${currentIndex + 1}`}
          className={`max-w-full max-h-full object-contain image-transition ${isAnimating ? 'image-fading' : ''}`}
        />

        {/* Navigation Buttons */}
        {showNavigation && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-40 text-white rounded-full h-12 w-12 flex items-center justify-center hover:bg-opacity-60 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white"
              aria-label="Previous image"
            >
              <ChevronLeftIcon className="w-7 h-7" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-40 text-white rounded-full h-12 w-12 flex items-center justify-center hover:bg-opacity-60 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white"
              aria-label="Next image"
            >
              <ChevronRightIcon className="w-7 h-7" />
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black bg-opacity-50 text-white text-sm font-semibold rounded-full px-3 py-1">
              {currentIndex + 1} / {images.length}
            </div>
          </>
        )}

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 sm:top-2 sm:right-2 bg-white text-gray-800 rounded-full h-10 w-10 flex items-center justify-center text-lg font-bold hover:bg-gray-200 transition-transform transform hover:scale-110 shadow-lg"
          aria-label="Close preview"
        >
          <CloseIcon className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};
