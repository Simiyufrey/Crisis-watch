
import { GoogleGenAI, Modality } from "@google/genai";
import { NewsItem } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Helper to decode audio
const decodeAudio = (base64: string) => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export const fetchNewsByCategory = async (category: string): Promise<NewsItem[]> => {
  if (!apiKey) throw new Error("API Key is missing");

  const prompt = `
  You are an advanced global crisis monitor. Search for the top 6 most significant, tragic, or impactful news stories regarding '${category}'.
  Focus on events from the last 72 hours.
  
  CRITICAL: You MUST return strictly a JSON array. Do not include markdown code blocks, explanations, or any text outside the JSON.
  
  Each object in the array must match this structure:
  {
    "id": "generate_a_unique_string_id_based_on_headline",
    "headline": "Compelling Headline",
    "summary": "Detailed 2-3 sentence summary covering what, where, and why.",
    "severity": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
    "location": "City, Country",
    "timestamp": "Full Date (e.g., October 24, 2024)",
    "category": "${category}",
    "impact_score": number (1-100),
    "imageUrl": "A direct, valid URL to a relevant image representing this specific event found in the search results. If no specific image URL is found, leave this field empty string."
  }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        // responseMimeType is OMITTED because it conflicts with tools
      }
    });

    let jsonText = response.text || "[]";
    
    // Robust cleanup to extract JSON array
    jsonText = jsonText.replace(/```json/g, '').replace(/```/g, '').trim();
    const firstBracket = jsonText.indexOf('[');
    const lastBracket = jsonText.lastIndexOf(']');
    
    if (firstBracket !== -1 && lastBracket !== -1) {
        jsonText = jsonText.substring(firstBracket, lastBracket + 1);
    } else {
        // Fallback: sometimes model returns a single object instead of array if only 1 result
        const firstCurly = jsonText.indexOf('{');
        const lastCurly = jsonText.lastIndexOf('}');
        if (firstCurly !== -1 && lastCurly !== -1) {
             jsonText = `[${jsonText.substring(firstCurly, lastCurly + 1)}]`;
        }
    }

    let newsItems: NewsItem[] = [];
    try {
        newsItems = JSON.parse(jsonText);
    } catch (e) {
        console.error("JSON Parse Error on text:", jsonText);
        // Fallback empty array to prevent app crash
        return [];
    }
    
    // Enhance items with grounding metadata (sources)
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    
    if (groundingChunks) {
       const sources = groundingChunks
         .filter((c: any) => c.web?.uri && c.web?.title)
         .map((c: any) => ({ title: c.web.title, url: c.web.uri }));
         
       if (sources.length > 0) {
           newsItems.forEach((item, index) => {
              // Distribute sources to items reasonably
              const start = index % sources.length;
              const source = sources[start];
              // Add at least one source if available, plus maybe another
              item.sources = [source];
              if (sources.length > 1) {
                  item.sources.push(sources[(start + 1) % sources.length]);
              }
              // Deduplicate
              item.sources = item.sources.filter((v,i,a)=>a.findIndex(t=>(t.url===v.url))===i);
           });
       }
    }

    return newsItems;

  } catch (error) {
    console.error("Error fetching news:", error);
    throw error;
  }
};

export const generateSpeech = async (text: string): Promise<AudioBuffer | null> => {
  if (!apiKey) return null;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Fenrir' }, // Changed to Fenrir for a deeper, more serious news voice
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) return null;

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const audioData = decodeAudio(base64Audio);
    return await audioContext.decodeAudioData(audioData.buffer);
  } catch (error) {
    console.error("TTS Error:", error);
    return null;
  }
};

export const generateReport = async (headline: string): Promise<string> => {
    if (!apiKey) return "API Key missing.";
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Investigative Briefing: "${headline}". 
            Structure:
            1. Key Details (Bulleted)
            2. Background/Context
            3. Future Implications
            
            Format as markdown. Be objective and concise.`,
            config: {
                thinkingConfig: { thinkingBudget: 0 }
            }
        });
        return response.text || "No details available.";
    } catch (e) {
        console.error("Report Generation Error:", e);
        return "Intelligence report unavailable at this time.";
    }
}
