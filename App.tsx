import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { PromptInput } from './components/PromptInput';
import { GeneratedImageDisplay } from './components/GeneratedImageDisplay';
import { generateStudioImage, generatePromptSuggestion } from './services/geminiService';
import { SparklesIcon } from './components/icons/SparklesIcon';
import { ImagePreviewModal } from './components/ImagePreviewModal';
import { MaterialSelector } from './components/MaterialSelector';
import { CollectionOptionsSelector } from './components/CollectionOptionsSelector';
import { AspectRatioSelector } from './components/AspectRatioSelector';
import { padImage } from './utils/canvasUtils';
import { fileToBase64 } from './utils/fileUtils';
import { SuggestIcon } from './components/icons/SuggestIcon';
import { UploadIcon } from './components/icons/UploadIcon';
import { ZoomInIcon } from './components/icons/ZoomInIcon';
import { MagicWandIcon } from './components/icons/MagicWandIcon';
import { CloseIcon } from './components/icons/CloseIcon';

// Component for displaying the generation history
const HistoryGallery: React.FC<{
  images: string[];
  onImageClick: (images: string[], index: number) => void;
  onClear: () => void;
  onEditClick: (image: string) => void;
}> = ({ images, onImageClick, onClear, onEditClick }) => {
  if (images.length === 0) {
    return null; // Don't render anything if there's no history
  }

  return (
    <div className="max-w-7xl mx-auto mt-12">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-700">Lịch sử tạo ảnh</h2>
        <button
          onClick={onClear}
          className="text-sm font-semibold text-red-500 hover:text-red-700 transition-colors"
        >
          Xóa lịch sử
        </button>
      </div>
      <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4">
            {images.map((url, index) => (
              <div
                key={index}
                className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group"
              >
                <img
                  src={url}
                  alt={`Generated image ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center gap-2">
                   <button
                    onClick={() => onImageClick(images, index)}
                    className="w-8 h-8 bg-white/80 rounded-full flex items-center justify-center text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                    aria-label="Xem trước"
                  >
                    <ZoomInIcon className="w-5 h-5" />
                  </button>
                   <button
                    onClick={() => onEditClick(url)}
                    className="w-8 h-8 bg-white/80 rounded-full flex items-center justify-center text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                    aria-label="Tinh chỉnh"
                  >
                    <MagicWandIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
      </div>
    </div>
  );
};

// Component for uploading a multiple scene images.
const SceneUploader: React.FC<{
  onImageChange: (files: FileList | null) => void;
  previews: string[];
  onRemoveImage: (index: number) => void;
  onClearAll: () => void;
  onPreviewClick: (index: number) => void;
}> = ({ onImageChange, previews, onRemoveImage, onClearAll, onPreviewClick }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onImageChange(event.target.files);
    event.target.value = '';
  };
  
  const handleContainerClick = () => { fileInputRef.current?.click(); };
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => e.preventDefault(), []);
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    onImageChange(e.dataTransfer.files);
  }, [onImageChange]);

  return (
    <div 
      className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-500 transition-colors bg-gray-50 mb-4"
    >
       <div 
        className="absolute inset-0 cursor-pointer"
        onClick={handleContainerClick}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      ></div>
      {previews.length > 0 ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {previews.map((preview, index) => (
              <div key={index} className="relative aspect-video group">
                <img src={preview} alt={`Xem trước bối cảnh ${index + 1}`} className="w-full h-full object-cover rounded-md bg-white shadow-sm" />
                 <div
                  className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center cursor-pointer"
                  onClick={(e) => { e.stopPropagation(); onPreviewClick(index); }}
                >
                  <ZoomInIcon className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveImage(index);
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold hover:bg-red-600 transition-transform transform hover:scale-110 z-10"
                  aria-label={`Xóa ảnh ${index + 1}`}
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center pt-2 relative z-10">
            <p className="text-sm text-indigo-600 font-semibold">
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
          <UploadIcon className="w-10 h-10 text-gray-400" />
          <p className="font-semibold text-sm">
            <span className="text-indigo-600">Tải lên các ảnh bối cảnh</span>
          </p>
          <p className="text-xs">Kéo và thả hoặc nhấn vào đây</p>
        </div>
      )}
    </div>
  );
};


const App: React.FC = () => {
  const [productImages, setProductImages] = useState<File[]>([]);
  const [productImagePreviews, setProductImagePreviews] = useState<string[]>([]);
  const [prompt, setPrompt] = useState<string>('');
  const [material, setMaterial] = useState<string>('Default');
  const [aspectRatio, setAspectRatio] = useState<string>('1:1');
  const [generatedImageUrls, setGeneratedImageUrls] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [previewState, setPreviewState] = useState<{ images: string[]; startIndex: number } | null>(null);
  const [generationCount, setGenerationCount] = useState<number>(1);
  const [sceneMode, setSceneMode] = useState<'text' | 'image'>('text');
  const [sceneImages, setSceneImages] = useState<File[]>([]);
  const [sceneImagePreviews, setSceneImagePreviews] = useState<string[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [editingImage, setEditingImage] = useState<string | null>(null);


  // Load history from localStorage on initial render
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('generationHistory');
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
    } catch (error) {
      console.error("Failed to load history from local storage:", error);
      localStorage.removeItem('generationHistory'); // Clear corrupted data
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('generationHistory', JSON.stringify(history));
    } catch (error) {
      console.error("Failed to save history to local storage:", error);
    }
  }, [history]);

  useEffect(() => {
    // Cleanup object URLs on unmount
    return () => {
      productImagePreviews.forEach(url => URL.revokeObjectURL(url));
      sceneImagePreviews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [productImagePreviews, sceneImagePreviews]);

  const handleImageChange = (files: FileList | null) => {
    // Clean up all old object URLs before setting new ones
    productImagePreviews.forEach(url => URL.revokeObjectURL(url));
    setGeneratedImageUrls([]); // Reset results
    setEditingImage(null); // Exit editing mode

    if (files && files.length > 0) {
      const fileArray = Array.from(files);
      setProductImages(fileArray);
      
      const newPreviews = fileArray.map(file => URL.createObjectURL(file));
      setProductImagePreviews(newPreviews);
    } else {
      setProductImages([]);
      setProductImagePreviews([]);
    }
  };
  
  const handleSceneImageChange = (files: FileList | null) => {
    sceneImagePreviews.forEach(url => URL.revokeObjectURL(url));
    
    if (files && files.length > 0) {
        const fileArray = Array.from(files);
        setSceneImages(fileArray);
        const newPreviews = fileArray.map(file => URL.createObjectURL(file));
        setSceneImagePreviews(newPreviews);
    } else {
        setSceneImages([]);
        setSceneImagePreviews([]);
    }
  };

  const handleRemoveSceneImage = (indexToRemove: number) => {
    URL.revokeObjectURL(sceneImagePreviews[indexToRemove]);

    setSceneImages(prev => prev.filter((_, index) => index !== indexToRemove));
    setSceneImagePreviews(prev => prev.filter((_, index) => index !== indexToRemove));
  };
  
  const handleClearAllSceneImages = () => {
    sceneImagePreviews.forEach(url => URL.revokeObjectURL(url));
    setSceneImages([]);
    setSceneImagePreviews([]);
  };

  const handleRemoveImage = (indexToRemove: number) => {
    URL.revokeObjectURL(productImagePreviews[indexToRemove]);

    setProductImages(prev => prev.filter((_, index) => index !== indexToRemove));
    setProductImagePreviews(prev => prev.filter((_, index) => index !== indexToRemove));
  };
  
  const handleClearAllImages = () => {
    // Clean up all old object URLs
    productImagePreviews.forEach(url => URL.revokeObjectURL(url));
    
    setProductImages([]);
    setProductImagePreviews([]);
    setGeneratedImageUrls([]);
    setError(null);
  };
  
  const handleClearHistory = () => {
    setHistory([]);
  };

  const handleGeneratePrompt = useCallback(async () => {
    setIsGeneratingPrompt(true);
    setError(null);
    try {
        const suggestion = await generatePromptSuggestion();
        setPrompt(suggestion);
    } catch (err) {
        console.error(err);
        setError("Could not generate a suggestion. Please try again.");
    } finally {
        setIsGeneratingPrompt(false);
    }
  }, []);

  const handleStartEditing = (imageUrl: string) => {
    setEditingImage(imageUrl);
    setPrompt(''); // Clear prompt for the new edit instruction
    setGeneratedImageUrls([]); // Clear previous results
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEditing = () => {
    setEditingImage(null);
    setPrompt('');
  };

  const handleGenerateClick = useCallback(async () => {
    const isEditingMode = !!editingImage;

    if (!isEditingMode && productImages.length === 0) {
      setError('Vui lòng tải lên ít nhất một ảnh sản phẩm.');
      return;
    }
    if ((sceneMode === 'text' || isEditingMode) && !prompt) {
      setError(isEditingMode ? 'Vui lòng nhập mô tả cho việc chỉnh sửa.' : 'Vui lòng nhập mô tả cho bối cảnh.');
      return;
    }
    if (sceneMode === 'image' && !isEditingMode && sceneImages.length === 0) {
      setError('Vui lòng tải lên ít nhất một hình ảnh bối cảnh.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImageUrls([]);

    try {
      let primaryImageBase64: string;
      let primaryImageType: string;
      let allReferenceImagesBase64: string[] | undefined;

      if (isEditingMode) {
        primaryImageBase64 = editingImage!.split(',')[1];
        primaryImageType = editingImage!.match(/data:(image\/[^;]+);/)?.[1] || 'image/png';
        allReferenceImagesBase64 = undefined; // No reference images in edit mode
      } else {
        const allImagesBase64Promises = productImages.map(file => fileToBase64(file));
        const allImagesBase64 = await Promise.all(allImagesBase64Promises);
        primaryImageBase64 = allImagesBase64[0];
        primaryImageType = productImages[0].type;
        allReferenceImagesBase64 = allImagesBase64;
      }
      
      const { paddedImage } = await padImage(
        `data:${primaryImageType};base64,${primaryImageBase64}`, 
        aspectRatio
      );
      const paddedImageBase64 = paddedImage.split(',')[1];
      
      let sceneImagesBase64: string[] | undefined;
      let sceneImageMimeType: string | undefined;

      if (sceneMode === 'image' && !isEditingMode && sceneImages.length > 0) {
        sceneImagesBase64 = await Promise.all(sceneImages.map(file => fileToBase64(file)));
        sceneImageMimeType = sceneImages[0].type;
      }
      
      const generateImage = (modifier?: string) => generateStudioImage(
        paddedImageBase64, 
        primaryImageType, 
        prompt, 
        material, 
        modifier, 
        isEditingMode ? undefined : allReferenceImagesBase64,
        isEditingMode ? undefined : sceneImagesBase64,
        isEditingMode ? undefined : sceneImageMimeType,
        isEditingMode
      );

      // In editing mode, always generate a single image.
      const currentGenerationCount = isEditingMode ? 1 : generationCount;

      if (currentGenerationCount === 1) {
        const result = await generateImage();
        if (result.imageUrl) {
          setGeneratedImageUrls([result.imageUrl]);
          setHistory(prev => [result.imageUrl!, ...prev.filter(img => img !== editingImage)]); // Add new, remove old if it was from history
        } else {
           setError('AI không thể tạo ra hình ảnh. Vui lòng thử một lời nhắc hoặc hình ảnh khác.');
        }
      } else { // Collection mode (only for new generations)
        const compositionModifiers = [
          "A medium shot, eye-level, with the product as the clear focal point.",
          "A wider shot showing the product on a different surface within the same room, like a side table or shelf.",
          "A top-down 'flat lay' style shot, with complementary objects neatly arranged around the product.",
          "A close-up, detailed shot focusing on the product's texture and material, with the background softly blurred.",
          "A low-angle shot, looking slightly up at the product to give it a grander presence.",
          "A lifestyle shot with the product on a stack of books or next to a coffee cup.",
          "A shot from a 45-degree angle, showing the product's front and side.",
          "A shot where the product is placed near a window, with natural light creating soft shadows."
        ];

        const selectedModifiers = compositionModifiers.slice(0, currentGenerationCount);
        const promises = selectedModifiers.map(modifier => generateImage(modifier));
        const results = await Promise.all(promises);
        const successfulUrls = results.map(r => r.imageUrl).filter((url): url is string => url !== null);
        
        if (successfulUrls.length > 0) {
           setGeneratedImageUrls(successfulUrls);
           setHistory(prev => [...successfulUrls, ...prev]);
        }
        if (successfulUrls.length < currentGenerationCount) {
           setError(`AI đã tạo ${successfulUrls.length} trên ${currentGenerationCount} ảnh. Hãy thử một lời nhắc khác để có kết quả tốt hơn.`);
        }
      }
      if (isEditingMode) {
        handleCancelEditing(); // Exit editing mode after generation
      }
    } catch (err) {
      console.error(err);
      setError('Đã xảy ra lỗi không mong muốn. Vui lòng kiểm tra console và thử lại.');
    } finally {
      setIsLoading(false);
    }
  }, [productImages, prompt, material, generationCount, aspectRatio, sceneMode, sceneImages, editingImage]);

  const presetPrompts = [
    "A minimalist marble slab with soft, diffused morning light.",
    "A rustic wooden table, surrounded by dried lavender.",
    "A clean, modern bathroom on a white counter next to a golden faucet.",
    "A cozy living room, on a stack of books with a warm fireplace."
  ];
  
  const openPreview = (images: string[], startIndex: number) => setPreviewState({ images, startIndex });
  const closePreview = () => setPreviewState(null);

  const handleProductPreviewClick = (index: number) => {
    openPreview(productImagePreviews, index);
  };
  
  const handleScenePreviewClick = (index: number) => {
    openPreview(sceneImagePreviews, index);
  };
  
  const handleHistoryPreviewClick = (images: string[], index: number) => {
    openPreview(images, index);
  };

  const getGridClass = () => {
    switch (generatedImageUrls.length) {
      case 4: return 'grid-cols-2 grid-rows-2';
      case 6: return 'grid-cols-3 grid-rows-2';
      case 8: return 'grid-cols-4 grid-rows-2';
      default: return 'grid-cols-1 grid-rows-1';
    }
  };

  const isEditingMode = !!editingImage;
  const isGenerateDisabled = isLoading ||
                           (isEditingMode && !prompt) ||
                           (!isEditingMode && productImages.length === 0) ||
                           (!isEditingMode && sceneMode === 'text' && !prompt) ||
                           (!isEditingMode && sceneMode === 'image' && sceneImages.length === 0);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          
          {/* Column 1: Upload & Describe */}
          <div className="lg:col-span-1 bg-white rounded-2xl shadow-lg p-8 space-y-6">
            <div>
               {isEditingMode ? (
                <>
                  <h2 className="text-2xl font-bold text-gray-700 mb-4">1. Tinh chỉnh ảnh</h2>
                  <div className="relative aspect-square border rounded-lg p-2">
                    <img src={editingImage} alt="Ảnh đang chỉnh sửa" className="w-full h-full object-contain rounded-md" />
                    <button
                        onClick={handleCancelEditing}
                        className="absolute top-2 right-2 bg-gray-800 text-white rounded-full h-8 w-8 flex items-center justify-center text-xs font-bold hover:bg-black transition-transform transform hover:scale-110 z-10"
                        aria-label="Hủy Tinh chỉnh"
                    >
                        <CloseIcon className="w-5 h-5" />
                    </button>
                  </div>
                   <button
                    onClick={handleCancelEditing}
                    className="w-full text-center text-sm font-semibold text-indigo-600 hover:text-indigo-800 mt-2"
                  >
                    Hủy Tinh chỉnh
                  </button>
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-gray-700 mb-4">1. Tải ảnh lên</h2>
                  <ImageUploader 
                    onImageChange={handleImageChange} 
                    previews={productImagePreviews} 
                    onRemoveImage={handleRemoveImage} 
                    onClearAll={handleClearAllImages}
                    onPreviewClick={handleProductPreviewClick}
                  />
                  <p className="text-xs text-gray-500 mt-2">Ảnh đầu tiên sẽ được dùng làm sản phẩm chính. Các ảnh còn lại sẽ được dùng để tham khảo.</p>
                </>
              )}
            </div>
            <div className="pt-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-700">{isEditingMode ? '2. Mô tả thay đổi' : '2. Chọn bối cảnh'}</h2>
                {(sceneMode === 'text' && !isEditingMode) && (
                    <button
                        onClick={handleGeneratePrompt}
                        disabled={isGeneratingPrompt}
                        className="flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800 disabled:text-gray-400 disabled:cursor-wait transition-colors"
                    >
                        {isGeneratingPrompt ? (
                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            <SuggestIcon className="w-5 h-5" />
                        )}
                        <span>{isGeneratingPrompt ? 'Đang gợi ý...' : 'Gợi ý bối cảnh'}</span>
                    </button>
                )}
              </div>
              
              {!isEditingMode && (
                <div className="flex bg-gray-100 rounded-lg p-1 mb-4">
                    <button onClick={() => setSceneMode('text')} className={`w-1/2 py-2 text-sm font-semibold rounded-md transition-all duration-300 ${sceneMode === 'text' ? 'bg-white text-indigo-600 shadow' : 'bg-transparent text-gray-600'}`}>
                        Mô tả bằng văn bản
                    </button>
                    <button onClick={() => setSceneMode('image')} className={`w-1/2 py-2 text-sm font-semibold rounded-md transition-all duration-300 ${sceneMode === 'image' ? 'bg-white text-indigo-600 shadow' : 'bg-transparent text-gray-600'}`}>
                        Dùng ảnh bối cảnh
                    </button>
                </div>
              )}

              <MaterialSelector selectedMaterial={material} onMaterialChange={setMaterial} />
              <AspectRatioSelector selectedRatio={aspectRatio} onRatioChange={setAspectRatio} />
              
              {(sceneMode === 'text' || isEditingMode) ? (
                <>
                  <PromptInput value={prompt} onChange={setPrompt} placeholder={isEditingMode ? "ví dụ: Thêm một vài giọt nước trên bàn" : "ví dụ: Một ngọn nến thơm trên phiến đá cẩm thạch tối giản với ánh sáng buổi sáng dịu nhẹ."} />
                  {!isEditingMode && (
                    <div className="pt-2">
                      <h3 className="text-sm font-semibold text-gray-500 mb-2">Hoặc thử một ví dụ:</h3>
                      <div className="flex flex-wrap gap-2">
                        {presetPrompts.map((p, index) => (
                          <button key={index} onClick={() => setPrompt(p)} className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full py-1 px-3 transition-colors">
                            {p.split(' ')[2]}...
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : ( // Scene mode and not editing
                <>
                  <SceneUploader 
                    onImageChange={handleSceneImageChange} 
                    previews={sceneImagePreviews} 
                    onRemoveImage={handleRemoveSceneImage} 
                    onClearAll={handleClearAllSceneImages} 
                    onPreviewClick={handleScenePreviewClick}
                  />
                  <PromptInput value={prompt} onChange={setPrompt} placeholder="Tùy chọn: Thêm hướng dẫn đặt sản phẩm, ví dụ: 'đặt trên bàn gỗ'." />
                </>
              )}
            </div>
          </div>

          {/* Column 2: Result */}
          <div className="lg:col-span-1 bg-white rounded-2xl shadow-lg p-8">
             <h2 className="text-2xl font-bold text-gray-700 mb-4">3. Nhận kết quả</h2>
             {error && <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative" role="alert">{error}</div>}
             
             <div className="w-full aspect-square bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden relative shadow-inner">
                {isLoading && (
                    <div className="absolute inset-0 bg-white bg-opacity-80 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                    <svg className="animate-spin h-10 w-10 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="mt-4 text-gray-600 font-semibold">
                        {isEditingMode ? 'Đang áp dụng tinh chỉnh...' : (generationCount > 1 ? `Đang tạo bộ sưu tập ${generationCount} ảnh...` : 'Đang tạo ảnh của bạn...')}
                    </p>
                    </div>
                )}
                {!isLoading && generatedImageUrls.length === 0 && (
                    <div className="text-center text-gray-500 p-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="mt-2 font-medium">Ảnh của bạn sẽ xuất hiện ở đây.</p>
                        <p className="text-sm">{isEditingMode ? 'Nhập mô tả thay đổi và nhấn Áp dụng.' : 'Tải ảnh sản phẩm và chọn bối cảnh để bắt đầu.'}</p>
                    </div>
                )}
                 {!isLoading && generatedImageUrls.length > 0 && (
                    <div className={`grid ${getGridClass()} gap-1 w-full h-full`}>
                        {generatedImageUrls.map((url, index) => (
                            <GeneratedImageDisplay key={index} imageUrl={url} isLoading={false} onPreviewClick={() => openPreview(generatedImageUrls, index)} onEditClick={() => handleStartEditing(url)} />
                        ))}
                    </div>
                 )}
             </div>

             <div className="pt-6 space-y-4">
              {!isEditingMode && <CollectionOptionsSelector selectedCount={generationCount} onCountChange={setGenerationCount} />}
              <button
                onClick={handleGenerateClick}
                disabled={isGenerateDisabled}
                className="w-full bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-300 transform hover:scale-105 shadow-md"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang tạo...
                  </>
                ) : (
                  <>
                    {isEditingMode ? <MagicWandIcon className="w-5 h-5 mr-2" /> : <SparklesIcon className="w-5 h-5 mr-2" />}
                    {isEditingMode ? 'Áp dụng Tinh chỉnh' : (generationCount > 1 ? `Tạo bộ sưu tập (x${generationCount})` : 'Tạo ảnh Studio')}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
        <HistoryGallery 
          images={history} 
          onImageClick={handleHistoryPreviewClick} 
          onClear={handleClearHistory}
          onEditClick={handleStartEditing} 
        />
      </main>
      {previewState && (
        <ImagePreviewModal 
          images={previewState.images} 
          startIndex={previewState.startIndex} 
          onClose={closePreview} 
        />
      )}
    </div>
  );
};

export default App;