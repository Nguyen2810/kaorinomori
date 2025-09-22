import React, { useState, useCallback, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI, Modality } from "@google/genai";

// --- START OF ICONS ---

const SparklesIcon = (props) => (
  React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", ...props },
    React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.553L16.5 21.75l-.398-1.197a3.375 3.375 0 00-2.456-2.456L12.75 18l1.197-.398a3.375 3.375 0 002.456-2.456L16.5 14.25l.398 1.197a3.375 3.375 0 002.456 2.456L20.25 18l-1.197.398a3.375 3.375 0 00-2.456 2.456z" })
  )
);

const UploadIcon = (props) => (
  React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", ...props },
    React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 16.5V9.75m0 0l-3.75 3.75M12 9.75l3.75 3.75M3 17.25V21h18v-3.75M3 12h18M3 6.75h18" })
  )
);

const DownloadIcon = (props) => (
  React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", ...props },
    React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" })
  )
);

const ZoomInIcon = (props) => (
  React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", ...props },
    React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" })
  )
);

const CloseIcon = (props) => (
  React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", ...props },
    React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M6 18L18 6M6 6l12 12" })
  )
);

const SuggestIcon = (props) => (
  React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", ...props },
    React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.311a15.045 15.045 0 01-4.5 0M3 16.5c0-4.142 3.358-7.5 7.5-7.5s7.5 3.358 7.5 7.5c0 1.33-1.07 2.41-2.408 2.41-.39 0-.756-.11-1.076-.308a11.96 11.96 0 00-3.424-.653 11.96 11.96 0 00-3.424.653c-.32.198-.686.308-1.076.308-1.338 0-2.408-1.08-2.408-2.41zM4.5 9a3.75 3.75 0 017.5 0v.008A3.75 3.75 0 014.5 9z" })
  )
);

const MagicWandIcon = (props) => (
  React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", ...props },
    React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.4c-.364.463-.7.896-1.027 1.345a.75.75 0 11-1.22-.872l.94-1.299a1.5 1.5 0 00-1.156-2.475l-.542-.155a.75.75 0 01-.466-1.182l.94-1.299m19.58-9.052a3 3 0 00-5.78-1.128 2.25 2.25 0 01-2.4-2.4c.364-.463.7-.896 1.027-1.345a.75.75 0 111.22.872l-.94 1.299a1.5 1.5 0 001.156 2.475l.542.155a.75.75 0 01.466 1.182l-.94 1.299m-18.008 9.052a3 3 0 005.78 1.128 2.25 2.25 0 012.4 2.4c-.364.463-.7.896-1.027 1.345a.75.75 0 11-1.22-.872l.94-1.299a1.5 1.5 0 00-1.156-2.475l-.542-.155a.75.75 0 01-.466-1.182l.94-1.299" })
  )
);


// --- END OF ICONS ---


// --- START OF UTILS ---

const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const base64String = reader.result.split(',')[1];
        resolve(base64String);
      } else {
        reject(new Error("Failed to read file as base64 string."));
      }
    };
    reader.onerror = (error) => reject(error);
  });
};

const loadImage = (src) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = (err) => reject(err);
      img.src = src;
    });
};

const parseRatio = (ratioStr) => {
    const [width, height] = ratioStr.split(':').map(Number);
    return width / height;
};

const padImage = async (originalImageSrc, targetRatioStr) => {
    
    const image = await loadImage(originalImageSrc);

    const targetRatio = parseRatio(targetRatioStr);
    const originalRatio = image.width / image.height;

    let newWidth, newHeight;

    if (targetRatio > originalRatio) {
        newWidth = image.height * targetRatio;
        newHeight = image.height;
    } else {
        newWidth = image.width;
        newHeight = image.width / targetRatio;
    }
    
    const imageCanvas = document.createElement('canvas');
    imageCanvas.width = newWidth;
    imageCanvas.height = newHeight;
    const imageCtx = imageCanvas.getContext('2d');
    if (!imageCtx) throw new Error("Could not get canvas context for image");

    imageCtx.fillStyle = 'black';
    imageCtx.fillRect(0, 0, newWidth, newHeight);

    const dx = (newWidth - image.width) / 2;
    const dy = (newHeight - image.height) / 2;

    imageCtx.drawImage(image, dx, dy);

    return {
        paddedImage: imageCanvas.toDataURL('image/png'),
    };
};

// --- END OF UTILS ---


// --- START OF SERVICES ---

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const getMaterialInstruction = (material) => {
    switch (material) {
        case 'Glossy':
            return "The product's surface must be rendered as glossy and shiny, with clear highlights reflecting the light source.";
        case 'Frosted':
            return "The product's surface must be rendered as frosted and matte, with soft, diffused light on its surface.";
        case 'Mirrored':
            return "The product's surface must be rendered as a completely opaque and solid, highly reflective mirror or chrome, accurately reflecting the surrounding scene. It must not be transparent.";
        case 'Transparent':
            return "The product's surface must be rendered as clear, transparent glass. The wax and wick inside the candle must be visible through the glass."
        default:
            return "Preserve the product's original material texture as much as possible.";
    }
}

const generatePromptSuggestion = async () => {
  try {
      const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: "Generate a short, creative, one-sentence scene description for a professional photo of a scented candle product. Be descriptive and evoke a mood.",
          config: {
              temperature: 0.9,
          }
      });
      
      const suggestion = response.text.trim();
      return suggestion.replace(/^"|"$/g, '');

  } catch (error) {
      console.error("Error generating prompt suggestion:", error);
      return "A scented candle on a minimalist marble slab with soft, diffused morning light.";
  }
};

const generateStudioImage = async (
    primaryImageBase64, 
    mimeType, 
    prompt, 
    material, 
    compositionModifier,
    additionalImagesBase64,
    sceneImagesBase64,
    sceneImageMimeType,
    isEditing = false
) => {
  try {
    const materialInstruction = getMaterialInstruction(material);
    
    const parts = [];
    let textPrompt = '';

    if (isEditing) {
        // --- ITERATIVE EDITING MODE ---
        parts.push({
            inlineData: { data: primaryImageBase64, mimeType: mimeType }
        });

        textPrompt = `
          You are an expert photo editor. You are given a source image. Your task is to modify it based *only* on the following instruction, while preserving the original image's integrity as much as possible.

          1.  **Source Image:** The image provided is the base you must work from.
          
          2.  **User Instruction:** "${prompt}".
          
          3.  **Core Task:** Apply the change described in the user instruction to the source image. The change should be seamless and photorealistic.
          
          4.  **Preservation:** Unless the instruction explicitly asks to change the style, composition, product, or lighting, you must preserve them from the original image. Do not add, remove, or change any other elements.
          
          5.  **Material Properties:** Apply this material modification: ${materialInstruction}

          6.  **Quality and Resolution:**
              - **Generate the final edited photograph at the highest possible quality and resolution.** Aim for sharp, photorealistic details, as if it were shot with a professional DSLR camera.

          7.  **Final Output Constraints:**
              - The final image must be a single, cohesive photograph.
              - **Crucially, the final image must not contain any black bars or empty padded areas.** The scene must extend to all edges of the frame to create a complete, professional photograph.
        `;
        parts.push({ text: textPrompt });
    
    } else if (sceneImagesBase64 && sceneImagesBase64.length > 0 && sceneImageMimeType) {
        // --- SCENE IMAGE MODE ---
        sceneImagesBase64.forEach(b64 => {
            parts.push({
                inlineData: { data: b64, mimeType: sceneImageMimeType }
            });
        });

        parts.push({
            inlineData: { data: primaryImageBase64, mimeType: mimeType }
        });

        if (additionalImagesBase64) {
            additionalImagesBase64.forEach(b64 => {
                parts.push({
                    inlineData: { data: b64, mimeType: mimeType }
                });
            });
        }
        
        textPrompt = `
          You are an expert photo editor. Your task is to seamlessly blend a product from one image into a scene from another.

          1.  **Inputs Provided:** You have been given images in this order: 1. A set of one or more background scene images showing different views of the same room/environment. 2. The main product image (which contains the product on a simple background). You may also receive additional reference images of the same product.
          
          2.  **Core Task:** First, automatically identify and segment the main product from its background in the product image (image 2). Then, place this segmented product realistically into the environment shown in the background scene images (images 1).
          
          3.  **Placement & Composition:**
              - Use all of the provided scene images to get a comprehensive understanding of the room's layout, lighting, and style. The final generated image should look like it was taken in that same room, even if it's a new angle.
              - Adhere to these user instructions for placement: "${prompt || 'Place the product in a natural and visually appealing location.'}"
              - For this specific shot, apply this composition rule: "${compositionModifier || 'Ensure the product is a clear focal point.'}"
              - Use the additional reference images to understand the product's shape and form from different angles, which will help in placing it realistically.

          4.  **Realism is Key:**
              - Match the lighting, shadows, perspective, and scale of the scene perfectly. The product should not look like it was just pasted on.
              - Apply the material properties: ${materialInstruction}
          
          5.  **Quality and Resolution:**
              - **Generate the final photograph at the highest possible quality and resolution.** Aim for sharp, photorealistic details, as if it were shot with a professional DSLR camera. It should be suitable for high-resolution displays (2K to 4K).

          6.  **Final Output Constraints:**
              - The final image must be a single, cohesive photograph.
              - **Crucially, the final image must not contain any black bars or empty padded areas.** The scene must extend to all edges of the frame to create a complete, professional photograph.
        `;
        parts.push({ text: textPrompt });

    } else {
        // --- TEXT PROMPT MODE ---
        parts.push({
          inlineData: { data: primaryImageBase64, mimeType: mimeType, },
        });
        if (additionalImagesBase64) {
            additionalImagesBase64.forEach(b64 => {
                parts.push({
                    inlineData: { data: b64, mimeType: mimeType, }
                });
            });
        }
        const compositionInstruction = compositionModifier ? ` The specific shot composition is: ${compositionModifier}` : '';
        textPrompt = `
          You are an expert art director creating a photorealistic product shot.

          1.  **Product Image:** You are provided with a product image. Your first task is to automatically identify and segment the main product from its background. Preserve the segmented product perfectly. The original background should be completely replaced.
          
          2.  **Reference Images (IMPORTANT):** You are also provided with several additional reference images showing the same product from different angles and in different poses (e.g., standing, lying down, with a lid). Use the variety of angles and poses in these Reference Images as direct inspiration for the product's final presentation in this shot.
          
          3.  **Core Scene:** The new background and environment are defined by this description: "${prompt}". The mood, lighting, and color palette from this description must be consistent across the entire collection.
          
          4.  **Specific Composition:** For this specific image, follow this instruction: "${compositionInstruction || 'The product should be the central focus of the image.'}"
          
          5.  **Execution & Constraints:**
              - Replace the original background with the described scene.
              - Apply the material properties: ${materialInstruction}
              - The generated background must seamlessly fill the entire image frame.
              - **Crucially, the final image must not contain any black bars or empty padded areas.** The scene must extend to all edges of the frame to create a complete, professional photograph.
              - **Generate the final photograph at the highest possible quality and resolution.** Aim for sharp, photorealistic details, as if it were shot with a professional DSLR camera. It should be suitable for high-resolution displays (2K to 4K).
        `;
        parts.push({ text: textPrompt });
    }


    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image-preview',
      contents: { parts },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });
    
    let imageUrl = null;
    let text = null;
    
    if (response.candidates && response.candidates.length > 0) {
      for (const part of response.candidates[0].content.parts) {
        if (part.text) {
          text = part.text;
        } else if (part.inlineData) {
          const base64ImageBytes = part.inlineData.data;
          const imageMimeType = part.inlineData.mimeType;
          imageUrl = `data:${imageMimeType};base64,${base64ImageBytes}`;
        }
      }
    }

    return { imageUrl, text };

  } catch (error) {
    console.error("Error generating image with Gemini API:", error);
    throw new Error("Failed to generate image. Please check your API key and network connection.");
  }
};
// --- END OF SERVICES ---


// --- START OF COMPONENTS ---

const Header = () => {
  return (
    React.createElement('header', { className: "bg-white shadow-sm" },
      React.createElement('div', { className: "container mx-auto px-4 py-4" },
        React.createElement('h1', { className: "text-3xl font-bold text-gray-800 tracking-tight" }, "Kaori No Mori - Studio sản phẩm ✨"),
        React.createElement('p', { className: "text-gray-500 mt-1" }, "Tạo ảnh sản phẩm chuyên nghiệp ngay lập tức.")
      )
    )
  );
};

const ImageUploader = ({ onImageChange, previews, onRemoveImage, onClearAll, onPreviewClick }) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const files = event.target.files;
    onImageChange(files);
    event.target.value = '';
  };
  
  const handleContainerClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleDragOver = useCallback((event) => {
    event.preventDefault();
  }, []);

  const handleDrop = useCallback((event) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    onImageChange(files);
  }, [onImageChange]);

  return (
    React.createElement('div', { 
      className: "relative border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-500 transition-colors bg-gray-50"
    },
      React.createElement('div', {
        className: "absolute inset-0 cursor-pointer",
        onClick: handleContainerClick,
        onDragOver: handleDragOver,
        onDrop: handleDrop
      }),
      React.createElement('input', {
        type: "file",
        ref: fileInputRef,
        onChange: handleFileChange,
        className: "hidden",
        accept: "image/png, image/jpeg, image/webp",
        multiple: true
      }),
      previews.length > 0 ? (
        React.createElement('div', { className: "space-y-4" },
            React.createElement('div', { className: "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-3 lg:grid-cols-4 gap-4" },
                previews.map((preview, index) => (
                    React.createElement('div', { key: index, className: "relative aspect-square group" },
                        React.createElement('img', { src: preview, alt: `Product preview ${index + 1}`, className: "w-full h-full object-contain rounded-md bg-white shadow-sm" }),
                        React.createElement('div', {
                            className: "absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center cursor-pointer",
                            onClick: (e) => { e.stopPropagation(); onPreviewClick(index); }
                        }, 
                           React.createElement(ZoomInIcon, { className: "w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" })
                        ),
                        React.createElement('button', {
                            onClick: (e) => {
                                e.stopPropagation();
                                onRemoveImage(index);
                            },
                            className: "absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold hover:bg-red-600 transition-transform transform hover:scale-110 z-10",
                            'aria-label': `Remove image ${index + 1}`
                        }, "×")
                    )
                ))
            ),
            React.createElement('div', { className: "flex justify-between items-center pt-2 relative z-10" },
                React.createElement('p', { className: "text-sm text-indigo-600 font-semibold" }, "Nhấn để thêm hoặc thay thế ảnh."),
                React.createElement('button', {
                    onClick: (e) => {
                        e.stopPropagation();
                        onClearAll();
                    },
                    className: "text-sm font-semibold text-red-500 hover:text-red-700 transition-colors"
                }, "Xóa tất cả")
          )
        )
      ) : (
        React.createElement('div', { className: "flex flex-col items-center justify-center space-y-2 text-gray-500 pointer-events-none" },
          React.createElement(UploadIcon, { className: "w-12 h-12 text-gray-400" }),
          React.createElement('p', { className: "font-semibold" },
            React.createElement('span', { className: "text-indigo-600" }, "Nhấn để tải lên"), " hoặc kéo và thả"
          ),
          React.createElement('p', { className: "text-xs" }, "PNG, JPG, WEBP")
        )
      )
    )
  );
};

const SceneUploader = ({ onImageChange, previews, onRemoveImage, onClearAll, onPreviewClick }) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    onImageChange(event.target.files);
    event.target.value = '';
  };
  
  const handleContainerClick = () => { fileInputRef.current?.click(); };
  const handleDragOver = useCallback((e) => e.preventDefault(), []);
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    onImageChange(e.dataTransfer.files);
  }, [onImageChange]);

  return (
    React.createElement('div', { 
      className: "relative border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-500 transition-colors bg-gray-50 mb-4"
    },
      React.createElement('div', {
          className: "absolute inset-0 cursor-pointer",
          onClick: handleContainerClick,
          onDragOver: handleDragOver,
          onDrop: handleDrop
      }),
      previews.length > 0 ? (
        React.createElement('div', { className: "space-y-4" },
          React.createElement('div', { className: "grid grid-cols-2 sm:grid-cols-3 gap-4" },
            previews.map((preview, index) => (
              React.createElement('div', { key: index, className: "relative aspect-video group" },
                React.createElement('img', { src: preview, alt: `Xem trước bối cảnh ${index + 1}`, className: "w-full h-full object-cover rounded-md bg-white shadow-sm" }),
                React.createElement('div', {
                    className: "absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center cursor-pointer",
                    onClick: (e) => { e.stopPropagation(); onPreviewClick(index); }
                },
                    React.createElement(ZoomInIcon, { className: "w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" })
                ),
                React.createElement('button', {
                  onClick: (e) => {
                    e.stopPropagation();
                    onRemoveImage(index);
                  },
                  className: "absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold hover:bg-red-600 transition-transform transform hover:scale-110 z-10",
                  'aria-label': `Xóa ảnh ${index + 1}`
                }, "×")
              )
            ))
          ),
          React.createElement('div', { className: "flex justify-between items-center pt-2 relative z-10" },
            React.createElement('p', { className: "text-sm text-indigo-600 font-semibold" }, "Nhấn để thêm hoặc thay thế ảnh."),
            React.createElement('button', {
              onClick: (e) => {
                e.stopPropagation();
                onClearAll();
              },
              className: "text-sm font-semibold text-red-500 hover:text-red-700 transition-colors"
            }, "Xóa tất cả")
          )
        )
      ) : (
        React.createElement('div', { className: "flex flex-col items-center justify-center space-y-2 text-gray-500 pointer-events-none" },
          React.createElement('input', {
            type: "file",
            ref: fileInputRef,
            onChange: handleFileChange,
            className: "hidden",
            accept: "image/png, image/jpeg, image/webp",
            multiple: true
          }),
          React.createElement(UploadIcon, { className: "w-10 h-10 text-gray-400" }),
          React.createElement('p', { className: "font-semibold text-sm" },
            React.createElement('span', { className: "text-indigo-600" }, "Tải lên các ảnh bối cảnh")
          ),
          React.createElement('p', { className: "text-xs" }, "Kéo và thả hoặc nhấn vào đây")
        )
      )
    )
  );
};

const PromptInput = ({ value, onChange, placeholder }) => {
  return (
    React.createElement('textarea', {
      value: value,
      onChange: (e) => onChange(e.target.value),
      placeholder: placeholder || "e.g., A scented candle on a minimalist marble slab with soft, diffused morning light.",
      rows: 4,
      className: "w-full p-3 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow resize-none placeholder:text-gray-500"
    })
  );
};

const GeneratedImageDisplay = ({ imageUrl, isLoading, onPreviewClick, onEditClick }) => {
  if (!imageUrl) {
    return null; 
  }

  return (
    React.createElement('div', { className: "w-full h-full bg-gray-100 flex items-center justify-center overflow-hidden relative group" },
      React.createElement('img', { 
        src: imageUrl, 
        alt: "Generated studio shot", 
        className: "object-contain w-full h-full" 
      }),
      React.createElement('div', { 
        className: "absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center",
        onClick: onPreviewClick
      },
        React.createElement('div', { className: "flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300" },
          React.createElement('button', {
            onClick: (e) => { e.stopPropagation(); onPreviewClick(); },
            className: "bg-white text-gray-800 font-semibold py-2 px-4 rounded-lg shadow-lg hover:bg-gray-100 transition-colors flex items-center transform hover:scale-105",
            'aria-label': "Preview image"
          }, React.createElement(ZoomInIcon, { className: "w-5 h-5" })),
          React.createElement('button', {
            onClick: (e) => { e.stopPropagation(); onEditClick(); },
            className: "bg-white text-gray-800 font-semibold py-2 px-4 rounded-lg shadow-lg hover:bg-gray-100 transition-colors flex items-center transform hover:scale-105",
            'aria-label': "Edit image"
          }, React.createElement(MagicWandIcon, { className: "w-5 h-5" })),
          React.createElement('a', {
            href: imageUrl,
            download: `ai-product-shot-${Date.now()}.png`,
            onClick: (e) => e.stopPropagation(),
            className: "bg-white text-gray-800 font-semibold py-2 px-4 rounded-lg shadow-lg hover:bg-gray-100 transition-colors flex items-center transform hover:scale-105",
            'aria-label': "Download image"
          }, React.createElement(DownloadIcon, { className: "w-5 h-5" }))
        )
      )
    )
  );
};

const ImagePreviewModal = ({ images, startIndex, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(startIndex);
    const [isAnimating, setIsAnimating] = useState(false);

    const ChevronLeftIcon = (props) => (
        React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 2, stroke: "currentColor", ...props },
            React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M15.75 19.5L8.25 12l7.5-7.5" })
        )
    );

    const ChevronRightIcon = (props) => (
        React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 2, stroke: "currentColor", ...props },
            React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M8.25 4.5l7.5 7.5-7.5 7.5" })
        )
    );

    const goToPrevious = useCallback(() => {
        if (images.length <= 1) return;
        setIsAnimating(true);
        setTimeout(() => {
            setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
            setIsAnimating(false);
        }, 150);
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
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') onClose();
            if (images.length > 1) {
                if (event.key === 'ArrowLeft') goToPrevious();
                else if (event.key === 'ArrowRight') goToNext();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose, goToPrevious, goToNext, images.length]);

    if (images.length === 0) return null;
    const showNavigation = images.length > 1;

    return React.createElement('div', {
        className: "fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 animate-fade-in",
        onClick: onClose,
        role: "dialog",
        'aria-modal': "true"
    },
        React.createElement('style', null, `
            @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
            .animate-fade-in { animation: fade-in 0.2s ease-out; }
            .image-transition { transition: opacity 0.15s ease-in-out; }
            .image-fading { opacity: 0; }
        `),
        React.createElement('div', {
            className: "relative bg-white p-2 rounded-lg shadow-2xl w-full max-w-4xl h-full max-h-[90vh] flex items-center justify-center",
            onClick: (e) => e.stopPropagation()
        },
            React.createElement('img', {
                key: currentIndex,
                src: images[currentIndex],
                alt: `Generated image preview ${currentIndex + 1}`,
                className: `max-w-full max-h-full object-contain image-transition ${isAnimating ? 'image-fading' : ''}`
            }),
            showNavigation && React.createElement(React.Fragment, null,
                React.createElement('button', {
                    onClick: goToPrevious,
                    className: "absolute left-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-40 text-white rounded-full h-12 w-12 flex items-center justify-center hover:bg-opacity-60 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white",
                    'aria-label': "Previous image"
                }, React.createElement(ChevronLeftIcon, { className: "w-7 h-7" })),
                React.createElement('button', {
                    onClick: goToNext,
                    className: "absolute right-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-40 text-white rounded-full h-12 w-12 flex items-center justify-center hover:bg-opacity-60 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white",
                    'aria-label': "Next image"
                }, React.createElement(ChevronRightIcon, { className: "w-7 h-7" })),
                React.createElement('div', {
                    className: "absolute bottom-4 left-1/2 -translate-x-1/2 bg-black bg-opacity-50 text-white text-sm font-semibold rounded-full px-3 py-1"
                }, `${currentIndex + 1} / ${images.length}`)
            ),
            React.createElement('button', {
                onClick: onClose,
                className: "absolute -top-3 -right-3 sm:top-2 sm:right-2 bg-white text-gray-800 rounded-full h-10 w-10 flex items-center justify-center text-lg font-bold hover:bg-gray-200 transition-transform transform hover:scale-110 shadow-lg",
                'aria-label': "Close preview"
            }, React.createElement(CloseIcon, { className: "w-6 h-6" }))
        )
    );
};


const MaterialSelector = ({ selectedMaterial, onMaterialChange }) => {
  const materials = [
    { id: 'Default', name: 'Mặc định' },
    { id: 'Glossy', name: 'Bóng' },
    { id: 'Frosted', name: 'Mờ' },
    { id: 'Mirrored', name: 'Tráng gương' },
    { id: 'Transparent', name: 'Trong suốt' },
  ];

  return (
    React.createElement('div', { className: "mb-4" },
      React.createElement('h3', { className: "text-md font-semibold text-gray-600 mb-3" }, "Chất liệu sản phẩm:"),
      React.createElement('div', { className: "flex flex-wrap gap-2" },
        materials.map((material) => (
          React.createElement('button', {
            key: material.id,
            onClick: () => onMaterialChange(material.id),
            className: `text-sm font-medium rounded-full py-2 px-4 transition-colors duration-200 ease-in-out
              ${selectedMaterial === material.id
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`
          }, material.name)
        ))
      )
    )
  );
};

const AspectRatioSelector = ({ selectedRatio, onRatioChange }) => {
    const ratios = [
      { id: '1:1', name: 'Vuông (1:1)' },
      { id: '16:9', name: 'Ngang (16:9)' },
      { id: '9:16', name: 'Dọc (9:16)' },
      { id: '4:3', name: 'Ảnh (4:3)' },
    ];

    return (
        React.createElement('div', { className: "mb-4" },
            React.createElement('h3', { className: "text-md font-semibold text-gray-600 mb-3" }, "Tỷ lệ khung hình:"),
            React.createElement('div', { className: "flex flex-wrap gap-2" },
                ratios.map((ratio) => (
                    React.createElement('button', {
                        key: ratio.id,
                        onClick: () => onRatioChange(ratio.id),
                        className: `text-sm font-medium rounded-full py-2 px-4 transition-colors duration-200 ease-in-out
              ${selectedRatio === ratio.id
                                ? 'bg-indigo-600 text-white shadow'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`
                    }, ratio.name)
                ))
            )
        )
    );
};

const CollectionOptionsSelector = ({ selectedCount, onCountChange }) => {
  const options = [
    { id: 1, name: 'Một ảnh' },
    { id: 4, name: 'Bộ sưu tập x4' },
    { id: 6, name: 'Bộ sưu tập x6' },
    { id: 8, name: 'Bộ sưu tập x8' },
  ];

  return (
    React.createElement('div', null,
      React.createElement('h3', { className: "text-md font-semibold text-gray-600 mb-3" }, "Chế độ tạo ảnh:"),
      React.createElement('div', { className: "grid grid-cols-4 gap-1 bg-gray-200 rounded-lg p-1" },
        options.map((option) => (
          React.createElement('button', {
            key: option.id,
            onClick: () => onCountChange(option.id),
            className: `py-2 text-sm font-semibold rounded-md transition-all duration-300 ${
              selectedCount === option.id
                ? 'bg-white text-indigo-600 shadow'
                : 'bg-transparent text-gray-600 hover:bg-gray-300'
            }`
          }, option.name)
        ))
      )
    )
  );
};

const HistoryGallery = ({ images, onImageClick, onClear, onEditClick }) => {
  if (images.length === 0) {
    return null;
  }

  return React.createElement('div', { className: "max-w-7xl mx-auto mt-12" },
    React.createElement('div', { className: "flex justify-between items-center mb-4" },
      React.createElement('h2', { className: "text-2xl font-bold text-gray-700" }, "Lịch sử tạo ảnh"),
      React.createElement('button', {
        onClick: onClear,
        className: "text-sm font-semibold text-red-500 hover:text-red-700 transition-colors"
      }, "Xóa lịch sử")
    ),
    React.createElement('div', { className: "bg-white rounded-2xl shadow-lg p-6" },
      React.createElement('div', { className: "grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4" },
        images.map((url, index) =>
          React.createElement('div', {
            key: index,
            className: "relative aspect-square bg-gray-100 rounded-lg overflow-hidden group",
          },
            React.createElement('img', {
              src: url,
              alt: `Generated image ${index + 1}`,
              className: "w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            }),
            React.createElement('div', { className: "absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center gap-2" },
                React.createElement('button', {
                    onClick: () => onImageClick(images, index),
                    className: "w-8 h-8 bg-white/80 rounded-full flex items-center justify-center text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white",
                    'aria-label': "Xem trước"
                }, React.createElement(ZoomInIcon, { className: "w-5 h-5"})),
                 React.createElement('button', {
                    onClick: () => onEditClick(url),
                    className: "w-8 h-8 bg-white/80 rounded-full flex items-center justify-center text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white",
                    'aria-label': "Tinh chỉnh"
                }, React.createElement(MagicWandIcon, { className: "w-5 h-5"}))
            )
          )
        )
      )
    )
  );
};


// --- END OF COMPONENTS ---


// --- START OF APP ---

const App = () => {
  const [productImages, setProductImages] = useState([]);
  const [productImagePreviews, setProductImagePreviews] = useState([]);
  const [prompt, setPrompt] = useState('');
  const [material, setMaterial] = useState('Default');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [generatedImageUrls, setGeneratedImageUrls] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [error, setError] = useState(null);
  const [previewState, setPreviewState] = useState(null);
  const [generationCount, setGenerationCount] = useState(1);
  const [sceneMode, setSceneMode] = useState('text');
  const [sceneImages, setSceneImages] = useState([]);
  const [sceneImagePreviews, setSceneImagePreviews] = useState([]);
  const [history, setHistory] = useState([]);
  const [editingImage, setEditingImage] = useState(null);

  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('generationHistory');
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
    } catch (error) {
      console.error("Failed to load history from local storage:", error);
      localStorage.removeItem('generationHistory');
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('generationHistory', JSON.stringify(history));
    } catch (error) {
      console.error("Failed to save history to local storage:", error);
    }
  }, [history]);

  useEffect(() => {
    return () => {
      productImagePreviews.forEach(url => URL.revokeObjectURL(url));
      sceneImagePreviews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [productImagePreviews, sceneImagePreviews]);

  const handleImageChange = (files) => {
    productImagePreviews.forEach(url => URL.revokeObjectURL(url));
    setGeneratedImageUrls([]);
    setEditingImage(null);

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
  
  const handleSceneImageChange = (files) => {
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
  
  const handleRemoveSceneImage = (indexToRemove) => {
    URL.revokeObjectURL(sceneImagePreviews[indexToRemove]);
    setSceneImages(prev => prev.filter((_, index) => index !== indexToRemove));
    setSceneImagePreviews(prev => prev.filter((_, index) => index !== indexToRemove));
  };
  
  const handleClearAllSceneImages = () => {
    sceneImagePreviews.forEach(url => URL.revokeObjectURL(url));
    setSceneImages([]);
    setSceneImagePreviews([]);
  };

  const handleRemoveImage = (indexToRemove) => {
    URL.revokeObjectURL(productImagePreviews[indexToRemove]);
    setProductImages(prev => prev.filter((_, index) => index !== indexToRemove));
    setProductImagePreviews(prev => prev.filter((_, index) => index !== indexToRemove));
  };
  
  const handleClearAllImages = () => {
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

  const handleStartEditing = (imageUrl) => {
    setEditingImage(imageUrl);
    setPrompt('');
    setGeneratedImageUrls([]);
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
      let primaryImageBase64;
      let primaryImageType;
      let allReferenceImagesBase64;

      if (isEditingMode) {
        primaryImageBase64 = editingImage.split(',')[1];
        primaryImageType = editingImage.match(/data:(image\/[^;]+);/)?.[1] || 'image/png';
        allReferenceImagesBase64 = undefined;
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
      
      let sceneImagesBase64;
      let sceneImageMimeType;

      if (sceneMode === 'image' && !isEditingMode && sceneImages.length > 0) {
        sceneImagesBase64 = await Promise.all(sceneImages.map(file => fileToBase64(file)));
        sceneImageMimeType = sceneImages[0].type;
      }
      
      const generateImage = (modifier) => generateStudioImage(
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
      
      const currentGenerationCount = isEditingMode ? 1 : generationCount;

      if (currentGenerationCount === 1) {
        const result = await generateImage();
        if (result.imageUrl) {
          setGeneratedImageUrls([result.imageUrl]);
          setHistory(prev => [result.imageUrl, ...prev.filter(img => img !== editingImage)]);
        } else {
           setError('AI không thể tạo ra hình ảnh. Vui lòng thử một lời nhắc hoặc hình ảnh khác.');
        }
      } else {
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
        const successfulUrls = results.map(r => r.imageUrl).filter(url => url !== null);
        
        if (successfulUrls.length > 0) {
           setGeneratedImageUrls(successfulUrls);
           setHistory(prev => [...successfulUrls, ...prev]);
        }
        if (successfulUrls.length < currentGenerationCount) {
           setError(`AI đã tạo ${successfulUrls.length} trên ${currentGenerationCount} ảnh. Hãy thử một lời nhắc khác để có kết quả tốt hơn.`);
        }
      }
      if (isEditingMode) {
        handleCancelEditing();
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
  
  const openPreview = (images, startIndex) => setPreviewState({ images, startIndex });
  const closePreview = () => setPreviewState(null);

  const handleProductPreviewClick = (index) => {
    openPreview(productImagePreviews, index);
  };
  
  const handleScenePreviewClick = (index) => {
    openPreview(sceneImagePreviews, index);
  };
  
  const handleHistoryPreviewClick = (images, index) => {
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
  
  const mainContent = React.createElement(
    'div',
    { className: 'min-h-screen bg-gray-50 text-gray-800 font-sans' },
    React.createElement(Header),
    React.createElement(
      'main',
      { className: 'container mx-auto px-4 py-8' },
      React.createElement(
        'div',
        { className: 'grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto' },
        // Column 1
        React.createElement(
          'div',
          { className: 'lg:col-span-1 bg-white rounded-2xl shadow-lg p-8 space-y-6' },
          React.createElement(
            'div',
            null,
            isEditingMode ? React.createElement(React.Fragment, null, 
                React.createElement('h2', { className: 'text-2xl font-bold text-gray-700 mb-4' }, '1. Tinh chỉnh ảnh'),
                React.createElement('div', { className: 'relative aspect-square border rounded-lg p-2' },
                    React.createElement('img', { src: editingImage, alt: "Ảnh đang chỉnh sửa", className: 'w-full h-full object-contain rounded-md' }),
                    React.createElement('button', {
                        onClick: handleCancelEditing,
                        className: 'absolute top-2 right-2 bg-gray-800 text-white rounded-full h-8 w-8 flex items-center justify-center text-xs font-bold hover:bg-black transition-transform transform hover:scale-110 z-10',
                        'aria-label': 'Hủy Tinh chỉnh'
                    }, React.createElement(CloseIcon, { className: 'w-5 h-5' }))
                ),
                React.createElement('button', {
                    onClick: handleCancelEditing,
                    className: 'w-full text-center text-sm font-semibold text-indigo-600 hover:text-indigo-800 mt-2'
                }, 'Hủy Tinh chỉnh')
            ) : React.createElement(React.Fragment, null, 
                React.createElement('h2', { className: 'text-2xl font-bold text-gray-700 mb-4' }, '1. Tải ảnh lên'),
                React.createElement(ImageUploader, { 
                    onImageChange: handleImageChange, 
                    previews: productImagePreviews, 
                    onRemoveImage: handleRemoveImage, 
                    onClearAll: handleClearAllImages,
                    onPreviewClick: handleProductPreviewClick
                }),
                React.createElement('p', { className: 'text-xs text-gray-500 mt-2' }, 'Ảnh đầu tiên sẽ được dùng làm sản phẩm chính. Các ảnh còn lại sẽ được dùng để tham khảo.')
            )
          ),
          React.createElement(
            'div',
            { className: 'pt-4' },
             React.createElement('div', { className: "flex justify-between items-center mb-4" },
                React.createElement('h2', { className: 'text-2xl font-bold text-gray-700' }, isEditingMode ? '2. Mô tả thay đổi' : '2. Chọn bối cảnh'),
                (sceneMode === 'text' && !isEditingMode) && React.createElement(
                'button',
                {
                  onClick: handleGeneratePrompt,
                  disabled: isGeneratingPrompt,
                  className: 'flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800 disabled:text-gray-400 disabled:cursor-wait transition-colors'
                },
                isGeneratingPrompt
                  ? React.createElement('svg', { className: 'animate-spin h-4 w-4', xmlns: 'http://www.w3.org/2000/svg', fill: 'none', viewBox: '0 0 24 24' },
                      React.createElement('circle', { className: 'opacity-25', cx: '12', cy: '12', r: '10', stroke: 'currentColor', strokeWidth: '4' }),
                      React.createElement('path', { className: 'opacity-75', fill: 'currentColor', d: 'M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z' }))
                  : React.createElement(SuggestIcon, { className: 'w-5 h-5' }),
                React.createElement('span', null, isGeneratingPrompt ? 'Đang gợi ý...' : 'Gợi ý bối cảnh')
              )
            ),
            !isEditingMode && React.createElement('div', { className: "flex bg-gray-100 rounded-lg p-1 mb-4" },
              React.createElement('button', { onClick: () => setSceneMode('text'), className: `w-1/2 py-2 text-sm font-semibold rounded-md transition-all duration-300 ${sceneMode === 'text' ? 'bg-white text-indigo-600 shadow' : 'bg-transparent text-gray-600'}`}, 'Mô tả bằng văn bản'),
              React.createElement('button', { onClick: () => setSceneMode('image'), className: `w-1/2 py-2 text-sm font-semibold rounded-md transition-all duration-300 ${sceneMode === 'image' ? 'bg-white text-indigo-600 shadow' : 'bg-transparent text-gray-600'}`}, 'Dùng ảnh bối cảnh')
            ),
            React.createElement(MaterialSelector, { selectedMaterial: material, onMaterialChange: setMaterial }),
            React.createElement(AspectRatioSelector, { selectedRatio: aspectRatio, onRatioChange: setAspectRatio }),
            (sceneMode === 'text' || isEditingMode) ?
              React.createElement(React.Fragment, null,
                React.createElement(PromptInput, { value: prompt, onChange: setPrompt, placeholder: isEditingMode ? "ví dụ: Thêm một vài giọt nước trên bàn" : "ví dụ: Một ngọn nến thơm trên phiến đá cẩm thạch tối giản với ánh sáng buổi sáng dịu nhẹ." }),
                !isEditingMode && React.createElement(
                  'div',
                  { className: 'pt-2' },
                  React.createElement('h3', { className: 'text-sm font-semibold text-gray-500 mb-2' }, 'Hoặc thử một ví dụ:'),
                  React.createElement('div', { className: 'flex flex-wrap gap-2' },
                    presetPrompts.map((p, index) =>
                      React.createElement('button', { key: index, onClick: () => setPrompt(p), className: 'text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full py-1 px-3 transition-colors' }, p.split(' ')[2] + '...'))))
              ) :
              React.createElement(React.Fragment, null,
                  React.createElement(SceneUploader, { 
                      onImageChange: handleSceneImageChange, 
                      previews: sceneImagePreviews, 
                      onRemoveImage: handleRemoveSceneImage, 
                      onClearAll: handleClearAllSceneImages,
                      onPreviewClick: handleScenePreviewClick
                  }),
                  React.createElement(PromptInput, { value: prompt, onChange: setPrompt, placeholder: "Tùy chọn: Thêm hướng dẫn đặt sản phẩm, ví dụ: 'đặt trên bàn gỗ'." })
              )
          )
        ),
        // Column 2
        React.createElement(
          'div',
          { className: 'lg:col-span-1 bg-white rounded-2xl shadow-lg p-8' },
          React.createElement('h2', { className: 'text-2xl font-bold text-gray-700 mb-4' }, '3. Nhận kết quả'),
          error && React.createElement('div', { className: 'mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative', role: 'alert' }, error),
          React.createElement(
            'div',
            { className: 'w-full aspect-square bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden relative shadow-inner' },
            isLoading &&
              React.createElement(
                'div',
                { className: 'absolute inset-0 bg-white bg-opacity-80 backdrop-blur-sm flex flex-col items-center justify-center z-10' },
                React.createElement('svg', { className: 'animate-spin h-10 w-10 text-indigo-600', xmlns: 'http://www.w3.org/2000/svg', fill: 'none', viewBox: '0 0 24 24' },
                  React.createElement('circle', { className: 'opacity-25', cx: '12', cy: '12', r: '10', stroke: 'currentColor', strokeWidth: '4' }),
                  React.createElement('path', { className: 'opacity-75', fill: 'currentColor', d: 'M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z' })),
                React.createElement('p', { className: 'mt-4 text-gray-600 font-semibold' }, isEditingMode ? 'Đang áp dụng tinh chỉnh...' : (generationCount > 1 ? `Đang tạo bộ sưu tập ${generationCount} ảnh...` : 'Đang tạo ảnh của bạn...'))
              ),
            !isLoading && generatedImageUrls.length === 0 &&
              React.createElement(
                'div',
                { className: 'text-center text-gray-500 p-4' },
                React.createElement('svg', { xmlns: 'http://www.w3.org/2000/svg', className: 'mx-auto h-16 w-16 text-gray-400', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', strokeWidth: 1 },
                  React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', d: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' })),
                React.createElement('p', { className: 'mt-2 font-medium' }, 'Ảnh của bạn sẽ xuất hiện ở đây.'),
                React.createElement('p', { className: 'text-sm' }, isEditingMode ? 'Nhập mô tả thay đổi và nhấn Áp dụng.' : 'Tải ảnh sản phẩm và chọn bối cảnh để bắt đầu.')
              ),
            !isLoading && generatedImageUrls.length > 0 &&
              React.createElement(
                'div',
                { className: `grid ${getGridClass()} gap-1 w-full h-full` },
                generatedImageUrls.map((url, index) => React.createElement(GeneratedImageDisplay, { key: index, imageUrl: url, isLoading: false, onPreviewClick: () => openPreview(generatedImageUrls, index), onEditClick: () => handleStartEditing(url) }))
              )
          ),
          React.createElement(
            'div',
            { className: 'pt-6 space-y-4' },
            !isEditingMode && React.createElement(CollectionOptionsSelector, { selectedCount: generationCount, onCountChange: setGenerationCount }),
            React.createElement(
              'button',
              {
                onClick: handleGenerateClick,
                disabled: isGenerateDisabled,
                className: 'w-full bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-300 transform hover:scale-105 shadow-md'
              },
              isLoading
                ? React.createElement(React.Fragment, null,
                    React.createElement('svg', { className: 'animate-spin -ml-1 mr-3 h-5 w-5 text-white', xmlns: 'http://www.w3.org/2000/svg', fill: 'none', viewBox: '0 0 24 24' },
                      React.createElement('circle', { className: 'opacity-25', cx: '12', cy: '12', r: '10', stroke: 'currentColor', strokeWidth: '4' }),
                      React.createElement('path', { className: 'opacity-75', fill: 'currentColor', d: 'M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z' })),
                    'Đang tạo...'
                  )
                : React.createElement(React.Fragment, null,
                    isEditingMode ? React.createElement(MagicWandIcon, { className: 'w-5 h-5 mr-2' }) : React.createElement(SparklesIcon, { className: 'w-5 h-5 mr-2' }),
                    isEditingMode ? 'Áp dụng Tinh chỉnh' : (generationCount > 1 ? `Tạo bộ sưu tập (x${generationCount})` : 'Tạo ảnh Studio')
                  )
            )
          )
        )
      ),
      React.createElement(HistoryGallery, { 
        images: history, 
        onImageClick: handleHistoryPreviewClick, 
        onClear: handleClearHistory,
        onEditClick: handleStartEditing
      })
    ),
    previewState && React.createElement(ImagePreviewModal, { 
      images: previewState.images, 
      startIndex: previewState.startIndex, 
      onClose: closePreview 
    })
  );

  return mainContent;
};


// --- END OF APP ---

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  React.createElement(React.StrictMode, null, React.createElement(App))
);