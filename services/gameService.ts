import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { SceneData } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("API_KEY is not set in environment variables.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

const parseJsonFromText = <T,>(text: string): T | null => {
  let jsonStr = text.trim();
  const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
  const match = jsonStr.match(fenceRegex);
  if (match && match[2]) {
    jsonStr = match[2].trim();
  }
  try {
    return JSON.parse(jsonStr) as T;
  } catch (e) {
    console.error("Failed to parse JSON response:", e);
    console.error("Original text:", text);
    return null;
  }
};

const sceneDataSchema = {
    type: Type.OBJECT,
    properties: {
        description: {
            type: Type.STRING,
            description: "A vivid and atmospheric description of the current scene (100-150 words)."
        },
        choices: {
            type: Type.ARRAY,
            description: "Exactly 3 distinct and interesting choices for the player.",
            items: {
                type: Type.OBJECT,
                properties: {
                    text: {
                        type: Type.STRING,
                        description: "The text for a single choice."
                    }
                },
                required: ["text"]
            }
        }
    },
    required: ["description", "choices"]
};

const generateSceneDescription = async (theme: string, storyHistory: string[], playerChoice?: string): Promise<SceneData | null> => {
  const historyText = storyHistory.join("\n\n---\n\n");
  
  let prompt: string;

  if (storyHistory.length === 0) {
    prompt = `
      You are a master storyteller for a text-based adventure game.
      Generate the starting scene for a game with the theme: "${theme}".
      Describe the scene vividly and atmospherically.
      Then, provide 3 distinct and interesting choices for the player to make.
      The output must be a JSON object that conforms to the provided schema.
    `;
  } else {
    prompt = `
      You are a master storyteller continuing a text-based adventure game.
      This is the story so far:
      ${historyText}

      The player's last action was: "${playerChoice}"

      Continue the story based on this choice.
      Describe the new scene vividly and atmospherically.
      Provide 3 new, distinct, and interesting choices.
      Keep the story engaging and coherent.
      The output must be a JSON object that conforms to the provided schema.
    `;
  }

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: sceneDataSchema,
        temperature: 0.8,
        topP: 0.9,
      }
    });

    const sceneData = parseJsonFromText<SceneData>(response.text);
    if (!sceneData || !sceneData.description || !Array.isArray(sceneData.choices) || sceneData.choices.length === 0) {
        console.error("Invalid SceneData received from Gemini:", sceneData);
        throw new Error("AI returned invalid data structure for the scene.");
    }

    return sceneData;
  } catch (error) {
    console.error("Error generating scene description:", error);
    throw new Error("Failed to get story from AI.");
  }
};

const generateSceneImage = async (description: string, theme: string): Promise<string> => {
    const imagePrompt = `Epic cinematic, hyper-detailed, atmospheric, dark fantasy art. ${description}. Theme: ${theme}.`;

    try {
        const response = await ai.models.generateImages({
            model: 'imagen-3.0-generate-002',
            prompt: imagePrompt,
            config: { numberOfImages: 1, outputMimeType: 'image/jpeg', aspectRatio: '16:9'},
        });
        
        if (!response.generatedImages || response.generatedImages.length === 0) {
            throw new Error("Imagen API did not return any images.");
        }

        const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
        return `data:image/jpeg;base64,${base64ImageBytes}`;
    } catch (error) {
        console.error("Error generating scene image:", error);
        throw new Error("Failed to generate image for the scene.");
    }
};

export const generateSceneAndImage = async (theme: string, storyHistory: string[], playerChoice?: string) => {
    const sceneData = await generateSceneDescription(theme, storyHistory, playerChoice);
    if (!sceneData) {
        throw new Error("Could not generate scene data.");
    }
    
    const imageUrl = await generateSceneImage(sceneData.description, theme);

    return {
        ...sceneData,
        imageUrl,
    };
};
