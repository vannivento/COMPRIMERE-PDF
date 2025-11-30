import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found in environment variables");
  }
  return new GoogleGenAI({ apiKey });
};

export const analyzePDFContent = async (text: string): Promise<string> => {
  try {
    const ai = getClient();
    
    const prompt = `
      You are a helpful document assistant. 
      Here is the text extracted from the beginning of a PDF file. 
      Please provide a concise summary of the document's contents (in Italian) and 
      suggest 3 keywords that describe it.
      
      Text Content:
      ${text}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Impossibile generare un riassunto al momento.";
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
};
