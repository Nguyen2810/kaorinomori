
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

  } catch (error: any) {
      console.error("Error generating prompt suggestion:", error);
      const errorMessage = error.message || 'An unknown error occurred.';
      throw new Error(`Suggestion failed: ${errorMessage}`);
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
        parts.push({
            inlineData: { data: primaryImageBase64, mimeType: mimeType }
        });

        textPrompt = `
          Edit the provided source image based on this instruction: "${prompt}".
          Preserve the original image's style and composition unless instructed otherwise.
          Apply this material property: ${materialInstruction}.
          The final image should be high quality and photorealistic, filling the entire frame without any black bars.
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
          Seamlessly place the product from the product image into the provided scene image.
          Follow these instructions for placement: "${prompt || 'Place the product in a natural and visually appealing location.'}".
          The product should be the clear focal point.
          Match the scene's lighting, shadows, and perspective.
          Apply this material property: ${materialInstruction}.
          The final image must be high quality and photorealistic, filling the entire frame without any black bars or padding.
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

        textPrompt = `
          Take the product from the provided image and place it in a new photorealistic scene described as: "${prompt}".
          Use the additional reference images to understand the product's shape from different angles.
          Apply this material property: ${materialInstruction}.
          The product should be the central focus.
          The final image must be high quality and photorealistic, filling the entire frame without any black bars or padding.
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

    if (!imageUrl) {
        // If there's text, it might explain the failure (e.g., safety policy)
        const failureReason = text ? `Model response: "${text}"` : "The model did not return an image. Please try adjusting your prompt or image.";
        throw new Error(failureReason);
    }

    return { imageUrl, text };

  } catch (error: any) {
    console.error("Full API Error:", error);
    const errorMessage = error.message || 'An unknown error occurred.';
    throw new Error(`Image generation failed: ${errorMessage}`);
  }
};
