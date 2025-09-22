import { GoogleGenAI, Modality } from "@google/genai";

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

interface GenerationResult {
  imageUrl: string | null;
  text: string | null;
}

const getMaterialInstruction = (material: string): string => {
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

export const generatePromptSuggestion = async (): Promise<string> => {
  try {
      const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: "Generate a short, creative, one-sentence scene description for a professional photo of a scented candle product. Be descriptive and evoke a mood.",
          config: {
              temperature: 0.9,
          }
      });
      
      const suggestion = response.text.trim();
      // Remove potential wrapping quotes
      return suggestion.replace(/^"|"$/g, '');

  } catch (error) {
      console.error("Error generating prompt suggestion:", error);
      // Provide a fallback prompt on error
      return "A scented candle on a minimalist marble slab with soft, diffused morning light.";
  }
};

export const generateStudioImage = async (
    primaryImageBase64: string, 
    mimeType: string, 
    prompt: string, 
    material: string, 
    compositionModifier?: string,
    additionalImagesBase64?: string[],
    sceneImagesBase64?: string[],
    sceneImageMimeType?: string,
    isEditing: boolean = false
): Promise<GenerationResult> => {
  try {
    const materialInstruction = getMaterialInstruction(material);
    
    const parts = [];
    let textPrompt = '';

    if (isEditing) {
        // --- ITERATIVE EDITING MODE ---
        // 1. Source Image to be edited
        parts.push({
            inlineData: { data: primaryImageBase64, mimeType: mimeType }
        });

        // 2. Editing instruction
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
        // 1. Scene Images
        sceneImagesBase64.forEach(b64 => {
            parts.push({
                inlineData: { data: b64, mimeType: sceneImageMimeType }
            });
        });

        // 2. Product Image
        parts.push({
            inlineData: { data: primaryImageBase64, mimeType: mimeType }
        });

        // 3. Reference images
        if (additionalImagesBase64) {
            additionalImagesBase64.forEach(b64 => {
                parts.push({
                    inlineData: { data: b64, mimeType: mimeType }
                });
            });
        }
        
        // 4. Prompt for scene composition
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
    
    let imageUrl: string | null = null;
    let text: string | null = null;
    
    if (response.candidates && response.candidates.length > 0) {
      for (const part of response.candidates[0].content.parts) {
        if (part.text) {
          text = part.text;
        } else if (part.inlineData) {
          const base64ImageBytes: string = part.inlineData.data;
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