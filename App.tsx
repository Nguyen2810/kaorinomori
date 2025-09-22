
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { PromptInput } from './components/PromptInput';
import { MaterialSelector } from './components/MaterialSelector';
import { AspectRatioSelector } from './components/AspectRatioSelector';
import { CollectionOptionsSelector } from './components/CollectionOptionsSelector';
import { GeneratedImageDisplay } from './components/GeneratedImageDisplay';
import { ImagePreviewModal } from './components/ImagePreviewModal';
import { SparklesIcon } from './components/icons/SparklesIcon';
import { SuggestIcon } from './components/icons/SuggestIcon';
import { fileToBase64 } from './utils/fileUtils';
import { padImage } from './utils/canvasUtils';
import { generateStudioImage, generatePromptSuggestion } from './services/geminiService';

type GenerationMode = 'prompt' | 'scene' | 'edit';


function App() {
  const appRef = useRef<HTMLDivElement>(null);
  
  // Input State
  const [productImages, setProductImages] = useState<File[]>([]);
  const [productImagePreviews, setProductImagePreviews] = useState<string[]>([]);
  const [sceneImages, setSceneImages] = useState<File[]>([]);
  const [sceneImagePreviews, setSceneImagePreviews] = useState<string[]>([]);

  const [prompt, setPrompt] = useState<string>('');
  const [material, setMaterial] = useState<string>('Default');
  const [aspectRatio, setAspectRatio] = useState<string>('1:1');
  const [imageCount, setImageCount] = useState<number>(1);
  
  // App State
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuggesting, setIsSuggesting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<GenerationMode>('prompt');
  
  // Output State
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [isEditingSource, setIsEditingSource] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalImages, setModalImages] = useState<string[]>([]);
  const [modalStartIndex, setModalStartIndex] = useState<number>(0);

  // --- Handlers for Inputs ---

  const handleProductImageChange = useCallback(async (files: FileList | null) => {
    if (!files) return;
    const fileArray = Array.from(files);
    setProductImages(prev => [...prev, ...fileArray]);

    const previews = await Promise.all(fileArray.map(file => URL.createObjectURL(file)));
    setProductImagePreviews(prev => [...prev, ...previews]);
  }, []);

  const handleRemoveProductImage = useCallback((index: number) => {
    setProductImagePreviews(currentPreviews => {
        const urlToRevoke = currentPreviews[index];
        if (urlToRevoke) {
            URL.revokeObjectURL(urlToRevoke);
        }
        return currentPreviews.filter((_, i) => i !== index);
    });
    setProductImages(currentImages => currentImages.filter((_, i) => i !== index));
  }, []);
  
  const handleClearProductImages = useCallback(() => {
    setProductImagePreviews(currentPreviews => {
      currentPreviews.forEach(URL.revokeObjectURL);
      return [];
    });
    setProductImages([]);
  }, []);
  
  const handleSceneImageChange = useCallback(async (files: FileList | null) => {
    if (!files) return;
    const fileArray = Array.from(files);
    setSceneImages(prev => [...prev, ...fileArray]);

    const previews = await Promise.all(fileArray.map(file => URL.createObjectURL(file)));
    setSceneImagePreviews(prev => [...prev, ...previews]);
    if(fileArray.length > 0) setMode('scene');
  }, []);

  const handleRemoveSceneImage = useCallback((index: number) => {
    setSceneImagePreviews(currentPreviews => {
        const urlToRevoke = currentPreviews[index];
        if (urlToRevoke) {
            URL.revokeObjectURL(urlToRevoke);
        }
        return currentPreviews.filter((_, i) => i !== index);
    });
    setSceneImages(currentImages => {
      const newImages = currentImages.filter((_, i) => i !== index);
      if (newImages.length === 0) {
        setMode('prompt');
      }
      return newImages;
    });
  }, []);

  const handleClearSceneImages = useCallback(() => {
    setSceneImagePreviews(currentPreviews => {
      currentPreviews.forEach(URL.revokeObjectURL);
      return [];
    });
    setSceneImages([]);
    setMode('prompt');
  }, []);


  const handleSuggestPrompt = async () => {
    setIsSuggesting(true);
    setError(null);
    try {
        const suggestion = await generatePromptSuggestion();
        setPrompt(suggestion);
    } catch (err) {
        setError("Could not generate a prompt suggestion.");
    } finally {
        setIsSuggesting(false);
    }
  };

  // --- Modal Handlers ---

  const openModal = (images: string[], startIndex: number) => {
    setModalImages(images);
    setModalStartIndex(startIndex);
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
  };
  
  // --- Generation Logic ---

  const handleGenerate = async () => {
    if (productImages.length === 0 && mode !== 'edit') {
      setError('Please upload at least one product image to start.');
      return;
    }
    if (mode === 'edit' && !isEditingSource) {
      setError('An error occurred. No image is selected for editing.');
      return;
    }
    if (!prompt && (mode === 'prompt' || mode === 'edit')) {
      setError('Please provide a prompt describing the scene or the edit you want to make.');
      return;
    }
    
    setError(null);
    setIsLoading(true);
    setGeneratedImages([]);
    
    let primaryImageSrc: string | null = null;

    try {
      const isEditing = mode === 'edit' && isEditingSource !== null;
      
      const primaryImageFile = productImages[0];
      primaryImageSrc = isEditing ? isEditingSource! : URL.createObjectURL(primaryImageFile);
      
      const { paddedImage: paddedImageSrc } = await padImage(primaryImageSrc, aspectRatio);
      const paddedImageBlob = await (await fetch(paddedImageSrc)).blob();
      const primaryImageBase64 = await fileToBase64(new File([paddedImageBlob], "padded.png", { type: 'image/png' }));
      const primaryMimeType = 'image/png';
      
      const additionalImagesBase64 = await Promise.all(
        productImages.slice(1).map(file => fileToBase64(file))
      );
      
      let sceneImagesBase64: string[] | undefined;
      let sceneImageMimeType: string | undefined;

      if (mode === 'scene' && sceneImages.length > 0) {
        sceneImagesBase64 = await Promise.all(
          sceneImages.map(file => fileToBase64(file))
        );
        sceneImageMimeType = sceneImages[0].type;
      }
      
      const results: string[] = [];

      for (let i = 0; i < imageCount; i++) {
        const result = await generateStudioImage(
          primaryImageBase64,
          primaryMimeType,
          prompt,
          material,
          undefined,
          additionalImagesBase64,
          sceneImagesBase64,
          sceneImageMimeType,
          isEditing
        );

        if (result.imageUrl) {
          results.push(result.imageUrl);
          setGeneratedImages(prev => [...prev, result.imageUrl!]);
        } else {
            throw new Error("The model did not return an image.");
        }
      }

    } catch (err: any) {
      setError(err.message || 'An unknown error occurred during image generation.');
    } finally {
      setIsLoading(false);
      if (primaryImageSrc && mode !== 'edit') {
        URL.revokeObjectURL(primaryImageSrc);
      }
      if (mode === 'edit') {
        setMode('prompt');
        setIsEditingSource(null);
      }
    }
  };

  const handleEditClick = (imageUrl: string) => {
    setMode('edit');
    setIsEditingSource(imageUrl);
    setPrompt('');
    setGeneratedImages([]);
    handleClearProductImages();
    handleClearSceneImages();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Effect to handle iframe resizing
  useEffect(() => {
    const appElement = appRef.current;
    if (!appElement) return;

    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const height = entry.contentRect.height;
        window.parent.postMessage({
          type: 'resize-iframe',
          height: height,
        }, '*');
      }
    });

    resizeObserver.observe(appElement);

    // Cleanup on unmount
    return () => {
      resizeObserver.disconnect();
    };
  }, []);
  
  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      productImagePreviews.forEach(URL.revokeObjectURL);
      sceneImagePreviews.forEach(URL.revokeObjectURL);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  return (
    <div ref={appRef} className="bg-gray-100 font-sans text-gray-800">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

          {/* Left Column: Controls */}
          <div className="flex flex-col gap-6">
            
            {mode === 'edit' && isEditingSource && (
              <div className="border-2 border-brand rounded-lg p-4 bg-indigo-50">
                  <h2 className="text-lg font-bold text-brand mb-3">Chế độ chỉnh sửa</h2>
                  <div className="flex gap-4 items-center">
                    <img src={isEditingSource} alt="Editing source" className="w-24 h-24 object-contain rounded-md bg-white shadow-sm"/>
                    <div>
                      <p className="text-gray-600">Bạn đang chỉnh sửa hình ảnh này. Mô tả các thay đổi bạn muốn thực hiện trong hộp văn bản bên dưới.</p>
                       <button onClick={() => { setMode('prompt'); setIsEditingSource(null); }} className="text-sm font-semibold text-red-500 hover:text-red-700 mt-2">
                        Hủy chỉnh sửa
                      </button>
                    </div>
                  </div>
              </div>
            )}

            <div style={{ display: mode === 'edit' ? 'none' : 'block' }}>
              <label className="text-lg font-semibold text-gray-800 mb-2 block">1. Tải ảnh sản phẩm</label>
              <p className="text-sm text-gray-500 mb-3">Tải lên một hoặc nhiều ảnh của sản phẩm. Ảnh đầu tiên là ảnh chính.</p>
              <ImageUploader 
                previews={productImagePreviews}
                onImageChange={handleProductImageChange}
                onRemoveImage={handleRemoveProductImage}
                onClearAll={handleClearProductImages}
                onPreviewClick={(index) => openModal(productImagePreviews, index)}
              />
            </div>

            <div>
              <label className="text-lg font-semibold text-gray-800 mb-2 block">{mode === 'edit' ? '2. Mô tả chỉnh sửa của bạn' : '2. Mô tả bối cảnh'}</label>
              <p className="text-sm text-gray-500 mb-3">
                {mode === 'edit' ? 'Hãy cụ thể về những thay đổi bạn muốn xem.' : 'Mô tả chi tiết cảnh bạn muốn hoặc tải lên một hình ảnh để AI sử dụng làm bối cảnh.'}
              </p>
              
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <PromptInput 
                  value={prompt}
                  onChange={setPrompt}
                  placeholder={mode === 'edit' ? "ví dụ: làm cho nền tối hơn" : "ví dụ: Một ngọn nến thơm trên phiến đá cẩm thạch tối giản..."}
                />
                <div className="mt-2 flex justify-end">
                    <button 
                        onClick={handleSuggestPrompt}
                        disabled={isSuggesting || mode === 'edit'}
                        className="flex items-center gap-2 text-sm font-semibold text-brand hover:text-brand/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <SuggestIcon className="w-4 h-4" />
                        {isSuggesting ? 'Đang tạo...' : 'Gợi ý cho tôi'}
                    </button>
                </div>

                <div className="mt-4" style={{ display: mode === 'edit' ? 'none' : 'block' }}>
                  <p className="text-center text-sm text-gray-400 my-2">HOẶC TẢI LÊN ẢNH BỐI CẢNH</p>
                  <ImageUploader 
                    previews={sceneImagePreviews}
                    onImageChange={handleSceneImageChange}
                    onRemoveImage={handleRemoveSceneImage}
                    onClearAll={handleClearSceneImages}
                    onPreviewClick={(index) => openModal(sceneImagePreviews, index)}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-lg font-semibold text-gray-800 mb-2 block">3. Tùy chọn</label>
              <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
                <MaterialSelector selectedMaterial={material} onMaterialChange={setMaterial} />
                <AspectRatioSelector selectedRatio={aspectRatio} onRatioChange={setAspectRatio} />
                <CollectionOptionsSelector selectedCount={imageCount} onCountChange={setImageCount} />
              </div>
            </div>
            
            <div className="mt-4">
              <button 
                onClick={handleGenerate}
                disabled={isLoading}
                className="w-full bg-brand text-white font-bold py-4 px-6 rounded-lg text-lg hover:bg-brand/90 transition-all duration-300 transform hover:scale-[1.02] disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg"
              >
                {isLoading && (
                   <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                <SparklesIcon className="w-6 h-6" style={{ display: isLoading ? 'none' : 'block' }}/>
                <span>
                  {isLoading ? `Đang tạo (${generatedImages.length}/${imageCount})...` : (mode === 'edit' ? 'Áp dụng chỉnh sửa' : 'Tạo ảnh')}
                </span>
              </button>
              {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
            </div>

          </div>

          {/* Right Column: Output */}
          <div className="flex flex-col">
            <label className="text-lg font-semibold text-gray-800 mb-2 block">Kết quả</label>
            <div className="w-full aspect-square bg-white border border-gray-200 rounded-lg flex items-center justify-center overflow-hidden relative">
              {isLoading && generatedImages.length === 0 && (
                <div className="text-center text-gray-500">
                  <SparklesIcon className="w-16 h-16 text-brand/30 mx-auto animate-pulse" />
                  <p className="mt-4 font-semibold">Đang tạo ảnh ma thuật...</p>
                  <p className="text-sm">Vui lòng đợi trong giây lát.</p>
                </div>
              )}
              {!isLoading && generatedImages.length === 0 && (
                 <div className="text-center text-gray-400 p-8">
                  <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="mt-4 font-medium">Ảnh đã tạo của bạn sẽ xuất hiện ở đây.</p>
                </div>
              )}
              {generatedImages.length > 0 && (
                imageCount === 1 ? (
                  <GeneratedImageDisplay 
                    imageUrl={generatedImages[0]}
                    isLoading={isLoading}
                    onPreviewClick={() => openModal(generatedImages, 0)}
                    onEditClick={() => handleEditClick(generatedImages[0])}
                  />
                ) : (
                   <div className="grid grid-cols-2 gap-2 w-full h-full p-2">
                    {generatedImages.map((img, index) => (
                      <div key={index} className="relative aspect-square group">
                        <img src={img} alt={`Generated result ${index + 1}`} className="w-full h-full object-contain rounded-md" />
                         <div
                          className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center cursor-pointer"
                          onClick={() => openModal(generatedImages, index)}
                        >
                           <SparklesIcon className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    ))}
                    {isLoading && Array.from({ length: imageCount - generatedImages.length }).map((_, i) => (
                      <div key={`placeholder-${i}`} className="w-full h-full bg-gray-100 rounded-md flex items-center justify-center animate-pulse">
                        <SparklesIcon className="w-8 h-8 text-gray-300" />
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </main>

      {isModalOpen && (
        <ImagePreviewModal 
          images={modalImages}
          startIndex={modalStartIndex}
          onClose={closeModal}
        />
      )}
    </div>
  );
}

export default App;
