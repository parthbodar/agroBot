/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_INSTRUCTION = `
You are AgroBot, a world-class agricultural advisor, arboreal specialist, and plant pathology expert. 
Your goal is to provide precise, evidence-based advice to farmers, arborists, and researchers.

Specialized Knowledge:
- **Leaf & Tree Diagnostics**: Expert at identifying diseases (fungal, bacterial, viral), pests (aphids, borers, mites), and nutrient deficiencies from visual evidence in leaves, bark, fruit, and overall tree structure.
- **Soil Science**: Interpret nitrogen, phosphorus, potassium, and pH metrics.
- **Sustainable Mitigation**: Recommend Integrated Pest Management (IPM), organic solutions, and traditional cultivation techniques.
- **Arboriculture**: Expertise in tree health, pruning cycles, and structural integrity.

When analyzing images of leaves or trees:
1.  **Determine Species**: If possible, identify the host plant species.
2.  **Identify Symptoms**: Describe what you see (e.g., chlorosis, necrotic spots, powdery mildew, exit holes, skeletonization). 
    - Use specific morphological markers if visible: **Webbing** (silk-like strands), **Stippling** (tiny light spots/dots), **Color Shift** (yellowing/bronzing).
3.  **Diagnostic Hypothesis**: Provide the most likely diagnosis (e.g., "Apple Scab", "Oak Wilt", "Citrus Greening").
4.  **Severity Assessment**: Estimate the impact on the plant's health.
5.  **Action Plan**: Provide immediate mitigation steps, biological controls, and long-term management strategies.

Response Guidelines:
1.  **Strictly Agricultural**: Refuse to answer non-agricultural or unrelated questions.
2.  **Highly Structured**: Use Markdown for headers, lists, and tables. 
3.  **Actionable Advice**: Provide specific treatments, product names, or biological controls.
4.  **Cautionary Notes**: Always include safety warnings for chemical applications.
5.  **Professional Tone**: Maintain an editorial, professional tone that is authoritative yet accessible.

Infographic Summary Requirement:
For any complex diagnosis, treatment plan, or risk assessment, you MUST append a structured JSON block at the end of your response inside <visual_summary></visual_summary> tags. This is CRITICAL for rendering a visual infographic.

Example <visual_summary> format:
<visual_summary>
{
  "title": "Apple Scab Detection",
  "severity": "medium",
  "findings": ["Olive-green spots on leaves", "Premature leaf drop suspected", "High humidity context"],
  "actions": ["Apply sulfur-based fungicide", "Rake and destroy fallen leaves", "Prune to improve airflow"],
  "nextCheck": "7 days"
}
</visual_summary>

Explain the 'why' behind your recommendations to educate the user.
`;

export interface VisualSummary {
  title: string;
  severity: "low" | "medium" | "high" | "critical";
  findings: string[];
  actions: string[];
  nextCheck: string;
}

export interface ChatMessage {
  role: "user" | "model";
  text: string;
  images?: {
    preview: string;
    mimeType: string;
  }[];
  generatedImage?: string; // base64 or URL
  isGeneratingImage?: boolean;
  imageGenerationError?: string;
  summary?: string;
  isSummarizing?: boolean;
  showSummary?: boolean;
  visualSummary?: VisualSummary;
  timestamp: number;
}

export interface UserProfile {
  location: string;
  typicalCrops: string;
  farmingPractices: string;
  weatherPatterns?: string;
  soilType?: string;
  waterSources?: string;
  nearbyFlora?: string;
}

export async function analyzeCropImages(imagesData: { data: string; mimeType: string }[], userProfile?: UserProfile) {
  let prompt = `You are an expert agronomist, entomologist, and plant pathologist. 
Identify any issues visible in these crop images, specifically looking for:
1. Pests (insects, mites, etc.) - check for markers like **webbing**, **stippling**, or **color shift**.
2. Plant Diseases (fungal, bacterial, viral)
3. Nutrient Deficiencies or Physiological Stress

Provide your response in the following JSON format:
{
  "diagnosisType": "pest" | "disease" | "nutritional" | "healthy" | "unknown",
  "name": "Common Name of issue",
  "scientificName": "Scientific Name (if applicable)",
  "confidence": 0.95,
  "keyObservations": ["Observation 1", "Observation 2"],
  "suggestedDatabaseMatch": "aphid" | "fall-armyworm" | "spider-mite" | "whitefly" | "locust" | "japanese-beetle" | "emerald-ash-borer" | "unknown",
  "analysis": "A detailed explanation of why this diagnosis was reached tailored to the provided context.",
  "personalizedAdvice": "Advice specific to the user's farm conditions (soil, water, crops).",
  "urgentAction": "Short immediate action if critical, otherwise null"
}

User Farm Profile:
- Location: ${userProfile?.location || 'Unknown'}
- Crops: ${userProfile?.typicalCrops || 'Unknown'}
- Farming Practices: ${userProfile?.farmingPractices || 'Unknown'}
- Soil Type: ${userProfile?.soilType || 'Unknown'}
- Water Source: ${userProfile?.waterSources || 'Unknown'}
- Local Climate: ${userProfile?.weatherPatterns || 'Unknown'}
- Nearby Flora: ${userProfile?.nearbyFlora || 'Unknown'}`;

  const imageParts = imagesData.map(img => ({
    inlineData: {
      data: img.data,
      mimeType: img.mimeType
    }
  }));

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        role: "user",
        parts: [
          { text: prompt },
          ...imageParts
        ]
      }
    ]
  });

  const text = response.text || "";
  
  // Clean potential markdown code blocks
  const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
  
  try {
    return JSON.parse(cleanJson);
  } catch (e) {
    console.error("Failed to parse Gemini response as JSON", e);
    return {
      diagnosisType: "unknown",
      name: "Inconclusive Analysis",
      scientificName: "N/A",
      confidence: 0,
      keyObservations: ["Image clarity or content insufficient for accurate diagnosis."],
      suggestedDatabaseMatch: "unknown",
      analysis: "The system could not provide a confident diagnosis based on the visual evidence provided.",
      personalizedAdvice: "Ensure photos are taken in bright, natural light and focus clearly on the symptomatic area.",
      urgentAction: null
    };
  }
}

export async function sendMessage(history: ChatMessage[], message: string, imagesData?: { data: string; mimeType: string }[], userProfile?: UserProfile) {
  try {
    // Determine the last message role to ensure alternating roles
    const lastMessageRole = history.length > 0 ? history[history.length - 1].role : null;

    // Map history to contents, including images if they exist
    const contents = history.map(msg => {
      const parts: any[] = [{ text: msg.text }];
      
      if (msg.images && msg.images.length > 0) {
        msg.images.forEach(img => {
          // Check if we have data or preview (which might contain data)
          let base64Data = '';
          if (img.preview && img.preview.startsWith('data:')) {
            base64Data = img.preview.split(',')[1];
          } else {
            // If it's just a string or already stripped
            base64Data = img.preview;
          }

          if (base64Data && !base64Data.startsWith('blob:')) {
            parts.push({
              inlineData: {
                data: base64Data,
                mimeType: img.mimeType
              }
            });
          }
        });
      }
      
      return {
        role: msg.role,
        parts
      };
    });

    const currentParts: any[] = [{ text: message }];
    
    if (imagesData && imagesData.length > 0) {
      imagesData.forEach(img => {
        currentParts.push({
          inlineData: {
            data: img.data.includes(',') ? img.data.split(',')[1] : img.data,
            mimeType: img.mimeType
          }
        });
      });
    }

    // Deduplicate: If the last message in history is the same as the current message (from the user),
    // don't push it again to avoid consecutive 'user' roles error.
    const isDuplicate = lastMessageRole === 'user' && 
                       history[history.length - 1].text === message &&
                       (!imagesData || imagesData.length === 0);

    if (!isDuplicate) {
      contents.push({
        role: "user",
        parts: currentParts
      });
    }

    // Prepend user profile context if available
    let contextualInstruction = SYSTEM_INSTRUCTION;
    if (userProfile) {
      contextualInstruction += `\n\nUSER ENVIRONMENTAL CONTEXT:
- Location: ${userProfile.location}
- Typical Crops: ${userProfile.typicalCrops}
- Farming Practices: ${userProfile.farmingPractices}
${userProfile.weatherPatterns ? `- Weather/Climate Patterns: ${userProfile.weatherPatterns}` : ''}
${userProfile.soilType ? `- Soil Profile: ${userProfile.soilType}` : ''}
${userProfile.waterSources ? `- Water Availability/Sources: ${userProfile.waterSources}` : ''}
${userProfile.nearbyFlora ? `- Nearby Wild Flora/Biodiversity: ${userProfile.nearbyFlora}` : ''}
Please adjust your advice to be highly relevant to these specific conditions.`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents,
      config: {
        systemInstruction: contextualInstruction,
      },
    });

    return response.text || "I'm sorry, I couldn't generate a response.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}

export async function generateImage(text: string) {
  try {
    // First, use Gemini to extract a concise botanical/agricultural subject from the text 
    // to avoid Imagen prompt complexity failures/filters
    const promptExtraction = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{
        role: "user",
        parts: [{ text: `Extract a single, concise physical subject (e.g., "A diseased tomato leaf with brown spots", "A healthy wheat field") that represents the following diagnostic text for a scientific illustration. Focus ONLY on the visual subject, no instructions: \n\n${text.slice(0, 1000)}` }]
      }],
      config: {
        systemInstruction: "You are a prompt engineer for scientific illustrations. Output only the short visual subject."
      }
    });

    const refinedSubject = promptExtraction.text?.trim() || text.slice(0, 100);

    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: `Close-up, highly detailed, scientific botanical or agricultural illustration of ${refinedSubject}, photorealistic, professional lighting, neutral background, 8k resolution, documentary style.`,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: '1:1',
      },
    });

    const base64EncodeString: string = response.generatedImages[0].image.imageBytes;
    return `data:image/jpeg;base64,${base64EncodeString}`;
  } catch (error) {
    console.error("Imagen API Error:", error);
    throw error;
  }
}

export async function summarizeText(text: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{
        role: "user",
        parts: [{ text: `Summarize the following agricultural expert's advice into 3-4 concise, actionable bullet points. Focus on the core recommendation and safety steps: \n\n${text}` }]
      }],
      config: {
        systemInstruction: "You are an expert agricultural editor. Your goal is to condense technical advice into clear, high-impact highlights for busy farmers. Avoid jargon, keep it brief, and use a professional yet encouraging tone."
      }
    });

    return response.text || "Summary unavailable.";
  } catch (error) {
    console.error("Summarization Error:", error);
    throw error;
  }
}
